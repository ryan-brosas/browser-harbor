# Research and reuse decisions

Research date: 2026-10-16. This records the decisions needed to start Browser Harbor, not a copy of upstream documentation. No upstream implementation code has been vendored.

## Pi's native contract

Inspected the installed Pi 1.3.0 extension/package/SDK documentation, exported declarations, `hello.ts`, and the SDK extension and full-control examples. Upstream tag `v1.3.0` resolved to `71023aec1546d6d677a65669c5665c0927ce0dd0`.

Primary sources:

- [Extensions](https://github.com/earendil-works/pi/blob/71023aec1546d6d677a65669c5665c0927ce0dd0/packages/coding-agent/docs/extensions.md)
- [Packages](https://github.com/earendil-works/pi/blob/71023aec1546d6d677a65669c5665c0927ce0dd0/packages/coding-agent/docs/packages.md)
- [SDK](https://github.com/earendil-works/pi/blob/71023aec1546d6d677a65669c5665c0927ce0dd0/packages/coding-agent/docs/sdk.md)
- [Tool example](https://github.com/earendil-works/pi/blob/71023aec1546d6d677a65669c5665c0927ce0dd0/packages/coding-agent/examples/extensions/hello.ts)

Findings that shape the project:

1. A normal extension registers native tools through `ExtensionAPI`. No MCP server or plugin daemon is needed.
2. Pi loads TypeScript directly. An explicit package manifest and tarball contents determine what actually loads.
3. Host-provided Pi packages and TypeBox belong in wildcard peer dependencies, not bundled runtime dependencies. Pin development dependencies separately for reproducible tests.
4. Data tools should supply an output schema and `structuredContent` as well as model-facing text and details.
5. Tool calls can run concurrently. Browser state needs deliberate per-session serialization.
6. The factory may load without a session. Do not connect there; release session-owned resources during shutdown.

**Adopt:** native Pi registration, explicit package manifest, structured output, lazy resource acquisition, and real package-loader tests.

## Existing browser-harness Pi connector

Inspected `monotykamary/browser-harness-js` at `a893fc9b8d61329c9f6d93d96283975bfbf77a18`:

- [Pi extension](https://github.com/monotykamary/browser-harness-js/blob/a893fc9b8d61329c9f6d93d96283975bfbf77a18/pi/extension.ts)
- [Browser provider](https://github.com/monotykamary/browser-harness-js/blob/a893fc9b8d61329c9f6d93d96283975bfbf77a18/pi/browser.ts)
- [Interaction contract](https://github.com/monotykamary/browser-harness-js/blob/a893fc9b8d61329c9f6d93d96283975bfbf77a18/pi/contract.ts)
- [Registration and activation tests](https://github.com/monotykamary/browser-harness-js/blob/a893fc9b8d61329c9f6d93d96283975bfbf77a18/pi/tests/extension.test.ts)
- [Package manifest](https://github.com/monotykamary/browser-harness-js/blob/a893fc9b8d61329c9f6d93d96283975bfbf77a18/pi/package.json)

The existing connector is not a skill-only integration: it registers a Fabric component on Pi's event bus. Its provider lazily loads the harness, requires an explicit endpoint, separates raw CDP grants from guarded origins, validates results, bounds calls, and treats an unavailable action response as `outcome_unknown`. Its tests cover registration order, rediscovery, cold loading, lazy activation, and cleanup using fixtures. Those tests were read, not executed as Browser Harbor verification.

**Adapt:** lazy initialization, generation fencing, bounded observations, explicit routing, and uncertain-outcome semantics.

**Do not duplicate:** its CDP transport or interaction controller. Browser Harbor should provide Pi-native product behavior around the runtime.

**Omit initially:** Fabric component registration, raw method allowlists, arbitrary evaluation, and a shared REPL. The existing connector remains useful for Fabric users but is not a mandatory dependency here.

GitHub reports the upstream harness as MIT-licensed. Before materially copying source, inspect the license at the exact selected revision and preserve required notices. That upstream license does not select Browser Harbor's own license.

## Local runtime is not the upstream release

The locally installed harness reports version 0.17.40. Direct source inspection of `Session.connectBB`, connection validation, and `bb-routing.test.ts` shows additional managed-host protections: native connection records, expiry checks, explicit external approval, and refusal of consent automation.

This local installation is evidence about compatibility risk, not a portable dependency. Its mutable skill directory and local patches must not be silently packaged or treated as the upstream revision above. In particular, a connector that only calls `connect({ wsUrl })` is not compatible with a runtime that requires native host credentials in that context.

**Decision:** settle a versioned runtime distribution and required capability contract in the first implementation slice. No absolute workstation paths or copied skill tree enter the package.

## Alternatives

| Option | Decision | Reason |
| --- | --- | --- |
| Keep only a skill | Reject as the product boundary | Repeated connection and cleanup instructions are not enforced behavior |
| Ordinary Pi extension | Select | Direct tools, lifecycle access, existing TypeScript runtime, no extra server |
| Existing Fabric-only connector | Prior art, not product dependency | It solves Fabric integration rather than a standalone native tool surface |
| MCP server | Defer | Cross-host transport adds lifecycle and authentication work before there is a second consumer |
| BB plugin | Out of scope | Owner explicitly selected Pi |
| Rewrite the browser engine | Reject | Existing Session and InteractionController already own that work |

## Remaining evidence gaps

- No Browser Harbor live-browser session has run; there is no adapter yet.
- No compatibility claim for every harness revision, browser, OS, or Pi release.
- The packaging and status tests cannot establish navigation, extraction, account authorization, lease behavior, or cleanup of real browser resources.
- Site permissions and account-specific governors need current verification before any live Luma or LinkedIn pilot.
- Licensing remains an owner decision.
