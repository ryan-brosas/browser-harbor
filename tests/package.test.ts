import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import {
  createAgentSession,
  DefaultResourceLoader,
  ModelRuntime,
  SessionManager,
  SettingsManager,
} from "@earendil-works/pi-coding-agent";
import { Value } from "typebox/value";
import { getStatus, statusSchema } from "../src/status.ts";

const exec = promisify(execFile);
const root = fileURLToPath(new URL("../", import.meta.url));

test("the packed Pi extension loads and executes without a browser, credentials, or model", {
  timeout: 60000,
}, async (t) => {
  const temp = await mkdtemp(path.join(tmpdir(), "browser-harbor-package-"));
  t.after(() => rm(temp, { recursive: true, force: true }));
  const { stdout } = await exec(
    "npm",
    ["pack", "--ignore-scripts", "--json", "--pack-destination", temp],
    { cwd: root, timeout: 30000 },
  );
  const packed: unknown = JSON.parse(stdout);
  assert.ok(Array.isArray(packed) && packed.length === 1);
  const artifact = packed[0] as { filename: string; files: { path: string }[] };
  const files = artifact.files.map((file) => file.path);
  for (const required of [
    "package.json",
    "src/index.ts",
    "src/status.ts",
    "README.md",
    "docs/architecture.md",
    "SECURITY.md",
  ]) {
    assert.ok(files.includes(required), `missing packed file: ${required}`);
  }
  assert.equal(
    files.some(
      (file) =>
        file.startsWith("node_modules/") ||
        file.startsWith(".pi/") ||
        file.startsWith("tests/"),
    ),
    false,
  );
  await exec("tar", ["-xzf", path.join(temp, artifact.filename), "-C", temp], {
    timeout: 10000,
  });
  const packageRoot = path.join(temp, "package");
  const manifest = JSON.parse(
    await readFile(path.join(packageRoot, "package.json"), "utf8"),
  );
  assert.deepEqual(manifest.pi.extensions, ["./src/index.ts"]);
  assert.equal(
    manifest.private,
    true,
    "npm publication remains disabled during bootstrap",
  );
  assert.equal(
    manifest.dependencies,
    undefined,
    "Pi supplies the runtime peers",
  );
  assert.equal(
    manifest.peerDependencies["@earendil-works/pi-coding-agent"],
    "*",
  );
  assert.equal(manifest.peerDependencies.typebox, "*");

  // Exercise Pi's real package discovery and extension runtime, not a mock API.
  t.mock.method(globalThis, "fetch", () => {
    throw new Error("Network is forbidden in the bootstrap smoke test");
  });
  const agentDir = path.join(temp, "agent");
  await mkdir(agentDir);
  const settingsManager = SettingsManager.inMemory({});
  const resourceLoader = new DefaultResourceLoader({
    cwd: temp,
    agentDir,
    settingsManager,
    noExtensions: true,
    noSkills: true,
    noPromptTemplates: true,
    noThemes: true,
    noContextFiles: true,
    additionalExtensionPaths: [packageRoot],
  });
  await resourceLoader.reload();
  const loaded = resourceLoader.getExtensions();
  assert.deepEqual(loaded.errors, []);
  assert.equal(loaded.extensions.length, 1);
  const extension = loaded.extensions[0];
  assert.ok(extension);
  assert.deepEqual([...extension.tools.keys()], ["browser_harbor_status"]);
  assert.deepEqual([...extension.commands.keys()], ["browser-harbor"]);
  assert.equal(
    extension.handlers.size,
    0,
    "bootstrap allocates no lifecycle resources",
  );

  const modelRuntime = await ModelRuntime.create({
    authPath: path.join(agentDir, "auth.json"),
    modelsPath: null,
    modelsStorePath: path.join(agentDir, "models-cache.json"),
    allowModelNetwork: false,
    refreshOnCreate: false,
  });
  const { session } = await createAgentSession({
    cwd: temp,
    agentDir,
    modelRuntime,
    resourceLoader,
    settingsManager,
    sessionManager: SessionManager.inMemory(temp),
    tools: ["browser_harbor_status"],
  });
  try {
    await session.bindExtensions({});
    assert.deepEqual(session.getActiveToolNames(), ["browser_harbor_status"]);
    const tool = session.agent.state.tools.find(
      (candidate) => candidate.name === "browser_harbor_status",
    );
    assert.ok(tool);
    const result = await tool.execute("bootstrap-smoke", {});
    assert.deepEqual(result.details, getStatus());
    assert.deepEqual(result.structuredContent, getStatus());
    assert.deepEqual(result.content, [
      { type: "text", text: JSON.stringify(getStatus()) },
    ]);
    assert.equal(Value.Check(statusSchema, result.structuredContent), true);
    const controller = new AbortController();
    controller.abort();
    await assert.rejects(
      tool.execute("cancelled-smoke", {}, controller.signal),
      { name: "AbortError" },
    );
    await session.prompt("/browser-harbor");
    const message = session.messages.at(-1);
    assert.ok(message && message.role === "custom");
    assert.equal(message.customType, "browser-harbor-status");
    assert.deepEqual(message.details, getStatus());
    assert.equal(
      session.messages.some((entry) => entry.role === "assistant"),
      false,
    );
  } finally {
    session.dispose();
  }
});
