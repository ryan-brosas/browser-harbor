# Agent rules

The user's global `AGENTS.md` supplies standing rules. This file adds project-specific facts, not exceptions. See [project context](docs/project-context.md) and the [implementation plan](docs/implementation-plan.md).

## Check

```sh
npm ci --ignore-scripts
npm run check
```

`check` runs Biome, strict TypeScript, and Node tests. The package smoke test packs the actual source, loads that tarball through Pi, executes the registered tool, checks cancellation, and invokes the command with an isolated in-memory session. It makes no model request and does not prove browser behavior.

## Project boundaries

- This is a Pi extension, not a BB plugin. Do not introduce a BB or Fabric runtime dependency.
- `package.json` points Pi at `src/index.ts`. Pi loads TypeScript directly; there is no generated build. Keep host-supplied Pi and TypeBox imports in wildcard peers, with pinned development versions.
- Only `browser_harbor_status` and `/browser-harbor` exist. Future browser tool names in the architecture document are proposals. Register new tools only with a working implementation and end-to-end tests.
- Extension initialization must not acquire a browser or start a process. Future owned resources need cancellation and idempotent shutdown/reload cleanup.
- Keep endpoint credentials, browser profiles, screenshots of private pages, and extracted personal data out of this public repository. Fixtures are synthetic.
- The browser-harness runtime is prior art and a planned dependency boundary, not vendored code. Resolve its distribution and compatibility before integrating it; never hardcode a workstation skill path.
- `private: true` blocks npm publishing; it does not describe GitHub visibility. Licensing and npm publication remain separate owner decisions.
