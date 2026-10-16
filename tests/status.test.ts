import assert from "node:assert/strict";
import test from "node:test";
import { Value } from "typebox/value";
import { getStatus, statusSchema } from "../src/status.ts";

const expected = {
  project: "browser-harbor",
  host: "pi",
  phase: "bootstrap",
  browser: "not-implemented",
  availableTools: ["browser_harbor_status"],
};

test("bootstrap reports only the implemented capability", () => {
  assert.deepEqual(getStatus(), expected);
  assert.equal(Value.Check(statusSchema, getStatus()), true);
  assert.equal(
    Value.Check(statusSchema, { ...expected, browser: "connected" }),
    false,
  );
  assert.equal(
    Value.Check(statusSchema, { ...expected, wsEndpoint: "private" }),
    false,
  );
});

test("a caller cannot mutate subsequent status results", () => {
  getStatus().availableTools.length = 0;
  assert.deepEqual(getStatus(), expected);
});
