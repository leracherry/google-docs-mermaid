# Mermaid for Google Docs

Write Mermaid in a Google Docs code block and see the diagram locally.

**Status: v1 implementation started; 0.1.0 alpha. Not ready for general Google Docs use.**

The current adapter supports DOM-backed `pre`, `[data-code-block]`, and `[role="code"]` surfaces. Google Docs primarily renders its editor on canvas; real native code-block extraction and Markdown-file integration remain the M0 feasibility gate. The automated fixture demonstrates the extension pipeline, not compatibility with the live canvas editor. No document content is uploaded.

## Implemented

- WXT / React / TypeScript Manifest V3 extension scoped to Google Docs document URLs.
- Mermaid candidate detection, explicit fences, local parser and sanitized strict SVG rendering.
- Debounced updates, serial render queue, bounded cache, near-viewport rendering.
- Stable block identity, overlay positioning on scroll/resize, removal cleanup.
- Last valid diagram retained on errors; Preview / Split / Code, zoom, Fit, expanded view, source/SVG copy.
- Shadow DOM style isolation; automatic system theme and manual light/dark.
- Popup settings and persistent per-document enable/disable.
- CI builds and browser tests; version-tag release pipeline publishes installable ZIPs.

Block modes are session-only in this alpha. Split shows a read-only source copy; Code mode exposes the original document source. Auto theme follows the operating system, not a separately configured Docs appearance. Expanded view scrolls; drag-to-pan remains pending.

## Development

Use Node 22+ and pnpm 10.18.0.

```sh
pnpm install
pnpm dev
pnpm check
pnpm build
pnpm exec playwright install chromium
pnpm test:e2e
pnpm zip
```

Load `.output/chrome-mv3` with Chrome's **Load unpacked** option. Browser tests load the actual built extension against a synthetic page served at a Docs URL. They do not require a Google account.

## Release

Update package version and lockfile, push main, and tag `v<version>` (or `v<version>-alpha.N`). The release workflow reruns checks and browser tests, packages the extension, and publishes a GitHub release with the ZIP. Prerelease tags create prereleases. No Chrome Web Store deployment is configured; store access, verified compatibility, and launch assets are still required.

See [architecture](docs/architecture.md), [roadmap](docs/roadmap.md), and [privacy](docs/privacy.md).
