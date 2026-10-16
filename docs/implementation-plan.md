# Implementation plan

## Bootstrap delivered by this repository

A Pi-native status tool and command, package metadata, reproducible development dependencies, strict checks, a packed-package host smoke test, and CI. This is the starting point, not completion of the browser MVP.

## 1. Establish the adapter and owned session lifecycle

Choose a reproducible browser-harness revision/distribution. Inspect its public capabilities and direct tests; do not import a mutable workstation skill path as the release strategy. Define trusted host configuration for the runtime and explicitly approved endpoint. Keep endpoint secrets out of tool arguments and logs.

Implement open, status, and close for one task-owned tab. Pi session context supplies ownership. No existing user tab adoption in this slice.

Acceptance:

- Loading the extension creates no process, connection, or tab.
- Unconfigured, incompatible, and forbidden endpoints fail before browser dispatch.
- Cross-session handles fail; page calls route to the owned target/session.
- Concurrent opens/closes, cancellation during open, late connection completion, reload, and shutdown do not leak owned resources.
- Close is idempotent; user-owned tabs stay untouched. Cleanup failure remains visible.
- A manually authorized browser fixture independently confirms one created tab and zero remaining owned tabs after cleanup.

## 2. Bounded observation and extraction

Implement observe and extract over visible/accessible evidence. Define strict input/output schemas, output bounds, final-URL provenance, and missing/partial-field semantics. No arbitrary JavaScript or hidden LLM call.

Acceptance:

- An allowed local fixture returns its actual visible fields with evidence.
- Missing About text or fewer than three roles stays incomplete, not invented.
- Redirects outside scope, cross-origin frames, oversized pages, hidden content, and stale observations have explicit tested behavior.
- Prompt-like page text is returned as data and never controls host configuration.
- The packaged extension, not just a helper, completes open → observe → extract → close.

## 3. Small approved read-only pilot

Use an owner-approved event/profile sample only after platform/account permissions and existing holds are checked. Keep personal data outside Git. Compare extraction with the displayed source, preserve missing fields and uncertain identity matches, and verify cleanup. Sheet writes remain a separate connector operation.

A successful sample is not evidence that bulk collection, work-email discovery, outreach, or background operation is authorized.

## 4. Guarded interactions, only after the read-only MVP

Design action approval, effect receipts, unresolved-submission state, and crash reconciliation before implementing `browser_harbor_act`. Reuse the harness controller's fresh target handles and revalidation, but do not treat a geometry check as content approval.

Acceptance includes stale target refusal, wrong-destination refusal, explicit denial, timeout after dispatch, loss of connection, crash/restart, and independent result verification. An uncertain effect must never be automatically replayed.

## Release gate

Before an npm release: select a license, settle upstream provenance, verify a clean package install, document tested compatibility and private reporting, and explicitly authorize publishing. No release workflow or package publication is part of bootstrap.
