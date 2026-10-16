# Contributing

This repository is an early Pi extension scaffold. Start with the [implementation plan](docs/implementation-plan.md); implement one end-to-end slice rather than registering speculative tools. Licensing is still undecided, so resolve contribution terms with the owner before contributing code.

## Local checks

```sh
npm ci --ignore-scripts
npm run check
```

Use `npm run format` to apply Biome fixes. Keep `package-lock.json` with dependency changes. Pi host packages are peers; development versions are pinned only to make checks reproducible.

The package test creates a temporary npm tarball, loads that artifact through Pi, executes the actual registered status tool, tests cancellation, and invokes the slash command without an LLM request. It does not test browser behavior.

Future adapter changes need fake-transport failure tests plus an explicitly approved live fixture for claims about browser outcomes. Never attach to someone's browser or install the extension globally as a side effect of unit tests.

Do not commit credentials, endpoints carrying tokens, cookies, browsing history, scraped lead records, screenshots of private pages, or real browser receipts. Use synthetic fixtures.

Submit the change, checks actually run, remaining limitations, and any upstream adaptation provenance. No automatic release, deployment, or npm publication follows a push.
