# Security

Browser Harbor currently reports its bootstrap status only. It does not connect to a browser or collect page data.

A Pi extension is trusted host code with the Pi process's operating-system permissions. This project is not a security sandbox. Tool schemas and annotations describe operations; they do not constrain arbitrary code running alongside the extension.

The planned browser adapter must preserve explicit endpoint authorization, task-owned tabs, session/generation checks, cancellation, and idempotent cleanup. Raw evaluation, cookie transfer, automatic consent, account switching, and retries of uncertain effects are outside the initial API. See the [architecture](docs/architecture.md).

Keep connection credentials and personal data out of issues, logs, fixtures, and Git. Use synthetic reproductions. Do not post an exploit or sensitive browser data in a public issue. If GitHub's private vulnerability reporting is enabled, use the repository's **Security → Report a vulnerability** control. If it is unavailable, ask the maintainer for a private reporting route without including sensitive details.

No production-support or security-audit claim is made for this pre-release scaffold.
