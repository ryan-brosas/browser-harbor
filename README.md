# Browser Harbor

A Pi extension for turning browser-harness workflows into explicit, structured tools.

**Status: project bootstrap, not a working browser controller.** The only implemented tool is `browser_harbor_status`; `/browser-harbor` reports the same status. Neither connects to a browser.

## Direction

Browser mechanics belong in executable tools: session ownership, bounded reads, cancellation, error handling, and cleanup. Skills retain workflow knowledge such as what to extract and how to handle ambiguous matches.

The intended first useful workflow is read-only: connect to an explicitly approved browser, create a task-owned tab, read bounded page evidence, extract observed fields, and close that tab. Luma and LinkedIn lead research motivated the project, but the core is not a scraper, CRM, or platform-specific campaign bot.

Browser Harbor is **Pi-native**. BB, Fabric, MCP, a background daemon, and an LLM subscription are not required to load or test this bootstrap. Future browser operations will wrap a versioned browser-harness adapter rather than duplicate a CDP runtime.

## Develop

Use Node.js 24 or newer and npm. The development host is pinned to Pi 1.3.0.

```sh
npm ci --ignore-scripts
npm run check
```

`check` runs Biome, strict TypeScript checking, unit tests, and a packed-package smoke test through Pi's actual loader and session runtime. The test makes no model requests and opens no browser. It uses `npm` and `tar`; CI targets Linux on Node 24 and 26.

Pi loads the TypeScript entry directly. There is no generated JavaScript build to keep in sync.

Try the extension for one invocation without changing Pi settings:

```sh
pi --no-extensions --no-mcp -e .
```

Then run `/browser-harbor`, or ask Pi to call `browser_harbor_status`. Normal Pi model use needs your own configured provider; the status command itself does not.

To save the Git source in your Pi package settings deliberately:

```sh
pi install git:github.com/ryan-brosas/browser-harbor
```

That is an installation instruction, not something the bootstrap performs on your behalf. No npm release exists; `private: true` prevents accidental npm publication and does not make the GitHub repository private.

## Project documents

- [Project intent and boundaries](docs/project-context.md)
- [Architecture and proposed tool contract](docs/architecture.md)
- [Research and reuse decisions](docs/research.md)
- [Implementation sequence and acceptance checks](docs/implementation-plan.md)
- [Contributing](CONTRIBUTING.md)
- [Security](SECURITY.md)

## License

A license has not been selected. Public source visibility is not an open-source license grant. The package stays unpublished until licensing and release scope are decided.
