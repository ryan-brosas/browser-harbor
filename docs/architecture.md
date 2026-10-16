# Architecture

This is the proposed browser architecture. The bootstrap implements only the status tool and command in `src/index.ts`; the remaining components below do not exist yet.

## Boundaries

```text
Pi tool call + trusted session context
              |
Pi extension: schema validation, output shaping, lifecycle
              |
Session controller: ownership, cancellation, bounded work
              |
Browser-harness adapter: pinned Session + InteractionController
              |
Explicitly approved browser endpoint and task-owned tab
```

**Pi owns the extension lifecycle.** Register tools synchronously without opening sockets or processes. Allocate browser resources only on explicit use. Capture the owning Pi session identity from trusted context, never from a caller-supplied owner field. Abort and close resources on shutdown, reload, and session replacement. A fork or resumed transcript does not resurrect live browser authority.

**The controller owns session state.** One opaque handle identifies one owned tab and its CDP attachment, connection generation, expiry if supplied, operation deadline, and close state. Serialize operations per browser session; independent sessions may run concurrently. Re-check ownership and generation before dispatch. Do not use an active-tab cursor or a global singleton.

**The adapter owns harness compatibility.** Resolve a trusted, explicitly configured runtime, check the required capabilities, and fail closed on mismatch. An importable module is executable host code, not an untrusted plugin supplied in tool arguments. Endpoint credentials stay host-side. The adapter must not bypass an existing host lease or platform governor.

**Skills own interpretation.** They explain task goals, field meaning, missing-data treatment, account permissions, and review criteria. They do not implement connection code or weaken enforced limits. Spreadsheet writes belong to their connector, not Browser Harbor.

## Tool surface

Only `browser_harbor_status` is registered now. Names and inputs below are a proposal, not a callable API.

| Tool | Intended behavior | Stage |
| --- | --- | --- |
| `browser_harbor_status` | Report implementation state now; later report this Pi session's browser handles without secrets | Bootstrap |
| `browser_harbor_open` | Open an approved URL in a new task-owned tab using host-side connection configuration | Read-only MVP |
| `browser_harbor_observe` | Return bounded page evidence with URL, observation ID, generation, timestamp, and truncation metadata | Read-only MVP |
| `browser_harbor_extract` | Return requested observed fields with evidence; unknown stays null/missing, never inferred employment or identity | Read-only MVP |
| `browser_harbor_close` | Idempotently close only the owned tab, detach, and report cleanup completion | Read-only MVP |
| `browser_harbor_act` | Consume fresh observed target handles, validate scope and approval, dispatch once, and report an execution receipt | Deferred |

The public schemas must be defined alongside their first implementation and tests. Do not pre-register tools that always return a not-implemented response. Configuration is not exposed as arbitrary module paths, endpoints, filesystem paths, or credentials in model-facing inputs.

For observations, prefer accessible/visible page evidence over a full DOM dump. Enforce byte and element bounds before returning content. Return image content only when a screenshot is requested and supported. Page content is untrusted data, including instructions embedded in HTML or accessibility labels.

Extraction is a deterministic evidence operation in the first version, not a hidden model call. Record the final page URL and the relevant quote or stable observation reference for each value. DOM selectors, if accepted, must be bounded strings processed as selectors, never code. Do not silently search other tabs or combine two people's profiles.

## Failure and recovery contract

Separate ordinary validation errors from browser effects:

- **Blocked before dispatch:** scope, origin, policy, or account condition refused the operation. No retry around it.
- **Stale:** target, document, or connection generation changed. Invalidate old handles and re-observe; this does not authorize resending an earlier effect.
- **Failed before dispatch:** connection or local validation failed with evidence that no browser command was sent. A new attempt still needs valid ownership.
- **Outcome unknown:** a command may have been dispatched, but its effect is not verified. Cancellation is not rollback. Preserve the receipt and block further effects until reconciled.
- **Cleanup incomplete:** tab closure or lease release could not be confirmed. Keep enough nonsecret ownership metadata to recover; do not claim success or delete the only cleanup record.

`executed` is not task success. For later actions, an independent readback must establish the requested result. Never reconnect and replay an uncertain submission automatically.

Controller states should distinguish opening, ready, closing, closed, and reconciliation-required. If opening is cancelled after creating a tab, close that tab even if the caller has already returned. Close races, late connection completion, and shutdown must converge on idempotent cleanup. A process crash cannot run `finally`; before adding effects, design durable intent/reconciliation records and prove recovery rather than claiming exactly-once delivery.

## Trust and compatibility limits

Pi extensions have the Pi process's OS permissions. Tool annotations, TypeScript types, and allowed-origin checks are not a sandbox against arbitrary host code. Origin constraints govern Browser Harbor's operations; they do not automatically isolate browser subresources, redirects, other extensions, or raw CDP access. Enforce final-origin checks and document the residual limits.

The first adapter targets an explicitly approved standalone Chromium CDP connection. Managed-host leases are a later adapter, not a BB dependency or fallback. When the runtime requires a managed lease, report unsupported configuration rather than impersonating that host or clearing its environment markers.

Compatibility is evidence-bound: this scaffold is developed against Pi 1.3.0. Host peers use `*` because Pi supplies them, not because every Pi version has been tested. Fabric and MCP bridges are deferred until a real consumer needs them.
