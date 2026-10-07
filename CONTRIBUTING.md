# Contributing

Thanks for helping make Mermaid feel at home in Google Docs. The project is an early alpha; proving native canvas integration is the first v1 milestone. Read the [roadmap](docs/roadmap.md), [architecture](docs/architecture.md), and [design system](docs/design-system.md) before a substantial change.

## Report or propose

Use the bug or feature issue templates. Include clear reproduction steps, expected behavior, extension/Chrome versions, and a minimal Mermaid example. Remove private document content, account details, and URLs. Report sensitive findings through [SECURITY.md](SECURITY.md).

For a larger feature, explain the problem and scope in an issue first. Keep contributions focused on local Mermaid rendering; accounts, servers, telemetry, and unrelated diagram formats are outside v1 scope.

## Local workflow

1. Create a branch for your change.
2. Install dependencies with `pnpm install --frozen-lockfile`.
3. Make the change and update relevant docs.
4. Run `pnpm check`, `pnpm build`, and `pnpm test:e2e`. Install Chromium with `pnpm exec playwright install chromium` if needed.
5. Open a pull request with a behavior summary, validation, and screenshots for UI changes.

See [Development](docs/development.md) for setup and screenshot generation.

## Engineering expectations

Keep host-page selectors behind the document adapter. Treat source as untrusted and preserve strict Mermaid rendering and SVG sanitization. Do not replace canonical document source with images. Add meaningful tests for behavior changes, especially stale results, error recovery, settings, and block cleanup.

Use shared style tokens and accessible native controls. Verify both themes, keyboard focus, and reduced motion. Avoid remote fonts, scripts, telemetry, and unnecessary permissions.

Distinguish fixture coverage from live Google Docs validation. Report precisely which document surfaces and edit flows you verified; do not describe the fixture as proof of native canvas compatibility.

## Review and licensing

Maintainers review changes for scope, privacy, usability, and test evidence. Participation follows the [Code of Conduct](CODE_OF_CONDUCT.md). Licensing remains undecided; no CLA or automatic rights-transfer process is in place.
