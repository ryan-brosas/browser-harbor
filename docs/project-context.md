# Project context

## Intent

Browser Harbor began with a practical problem: browser workflows depended on long skill instructions and repeated shell snippets for session setup and CDP calls. The project should make repeatable browser mechanics executable while leaving workflow judgment in skills.

The owner explicitly selected a **public Pi extension**, not a BB plugin. Do not turn this into a BB-specific project or require Fabric to reach ordinary tools.

## Scope

The requested initialization establishes a researched, testable starting point. It does not claim the browser adapter or lead-scraping bots are implemented.

The first intended outcome is a small read-only session workflow with explicit ownership and observable cleanup. Extracted values must retain page evidence; missing fields remain missing. Identity matching and contact decisions remain a separate workflow.

## Constraints worth preserving

- Reuse the browser-harness runtime behind an adapter; do not copy the entire skill store or fork a second CDP engine. Its release and compatibility contract must be settled before runtime integration.
- No automatic browser discovery, consent dismissal, cookie import, or fallback to another browser profile.
- Acquiring a browser connection does not authorize account actions. Navigation can itself have effects; read-only describes the operations exposed, not a universal side-effect guarantee.
- Do not expose arbitrary JavaScript evaluation or raw CDP as part of the initial read-only API.
- Site-specific activity governors, account holds, and approval requirements must not be bypassed by a generic tool.
- Connection secrets, scraped lead data, and live receipts do not belong in the public repository.
- No license, npm release, autonomous campaign, or production browser installation has been authorized by project initialization.
