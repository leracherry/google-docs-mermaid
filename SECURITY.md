# Security policy

The current 0.1.x release line is actively maintained. Security fixes are developed on main and shipped in the next patch release.

## Report a vulnerability

Do not disclose exploitable details or private document content in a public issue. Contact the repository owner through an existing private channel. If GitHub's private vulnerability reporting is available for this repository, use **Security → Report a vulnerability**. A dedicated reporting address and response-time commitment have not been established.

Include the affected version, a minimal non-sensitive reproduction, impact, and suggested mitigation. Never submit access tokens, account credentials, or real private documents.

## Security boundaries

Document text is untrusted input. Mermaid uses strict mode, secure configuration keys, size limits, and SVG sanitization. Rendering is local; the extension has no backend or analytics. Local storage holds preferences, not document source.

Any change to renderer security, URL handling, permissions, clipboard use, or external resources requires focused review. See [Architecture](docs/architecture.md) and [Privacy](docs/privacy.md).
