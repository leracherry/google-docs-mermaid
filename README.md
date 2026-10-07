![Mermaid for Google Docs logo](docs/assets/logo-small.png)

# Mermaid for Google Docs

**Diagrams, right where you write.**

A Chrome extension for local Mermaid previews in Google Docs. It keeps the source in your document and adds compact preview, zoom, and copy controls.

[Documentation](docs/README.md) · [Development](docs/development.md) · [Roadmap](docs/roadmap.md) · [Releases](https://github.com/leracherry/google-docs-mermaid/releases) · [CI](https://github.com/leracherry/google-docs-mermaid/actions/workflows/ci.yml)

> **Developer alpha.** The rendering pipeline is tested on DOM-backed code blocks. Native Google Docs canvas extraction and native Markdown-file integration are still pending, so a normal Docs document may show no previews.

## Preview

![The extension displaying a Mermaid diagram with preview, zoom, expand, and copy controls](docs/assets/diagram-light.png)

This screenshot comes from the built extension on a synthetic fixture. See [light/dark settings and diagram examples](docs/design-system.md#visual-examples).

## Features on main

- **Live previews:** debounce edits and retain the last valid diagram when syntax is incomplete.
- **Source-first views:** Preview, Split, and Code; edit the original source in the document.
- **Diagram controls:** zoom, fit, expanded viewing, and Mermaid/SVG copy.
- **Consistent visuals:** shared Workspace-inspired colors, corners, borders, and line weights across the UI and diagrams.
- **Local rendering:** no backend, account, OAuth, telemetry, or remote rendering service.
- **Preferences:** light/dark/auto theme, detection settings, and persistent per-document enable/disable.

The latest published release is **0.1.0-alpha.2**. Branding and the current design system are newer changes on `main`; build from source or download the artifact from a successful [main CI run](https://github.com/leracherry/google-docs-mermaid/actions/workflows/ci.yml?query=branch%3Amain) to try those changes.

## Install

1. Download an extension ZIP from [Releases](https://github.com/leracherry/google-docs-mermaid/releases) or a successful main CI run.
2. Extract it. If you downloaded a CI artifact, extract its contained extension ZIP too.
3. Open `chrome://extensions` and enable **Developer mode**.
4. Choose **Load unpacked** and select the folder containing `manifest.json`.
5. Pin **Mermaid for Google Docs** from Chrome's extension menu.

There is no Chrome Web Store listing yet. Read [Getting started](docs/getting-started.md) for controls and troubleshooting.

## Source example

Write this text inside a code block:

```text
flowchart LR
    Source[Write Mermaid] --> Preview[See your diagram]
    Preview --> Edit[Keep editing]
    Edit --> Source
```

Explicit `mermaid` fences are recognized even while syntax is incomplete. Unlabeled blocks use candidate detection and Mermaid validation. Blocks labeled with another language are left alone.

## Build and verify

Requires Node.js 22+ and pnpm 10.18.0. Repository access is required while this project is private.

```sh
git clone git@github.com:leracherry/google-docs-mermaid.git
cd google-docs-mermaid
pnpm install --frozen-lockfile
pnpm check
pnpm build
pnpm exec playwright install chromium
pnpm test:e2e
```

Load `.output/chrome-mv3` in Chrome. Use `pnpm dev` for development and `pnpm zip` for packaging. The [development guide](docs/development.md) explains the fixture, screenshot generation, CI artifacts, and releases.

## Current limitations

| Area | Alpha status |
| --- | --- |
| Native Google Docs | Canvas source extraction and block geometry are not implemented |
| Supported adapter surfaces | DOM-backed `pre`, `[data-code-block]`, and `[role="code"]` |
| Native Markdown files | Fence detection exists; the live Docs workflow is unverified |
| Block choices | Session-only; document enable/disable persists locally |
| Split view | Read-only source copy; edit the original in Code view |
| Auto theme | Follows device appearance, not a separate Docs theme |
| Expanded viewer | Scroll and zoom; drag-to-pan is pending |
| Performance | Mermaid initializes on demand but ships in the content-script bundle |

## Documentation and contributions

Start at the [documentation index](docs/README.md). It links installation, architecture, design, privacy, and the v1 roadmap.

For bugs and proposals, use the [issue templates](https://github.com/leracherry/google-docs-mermaid/issues/new/choose). Read [Contributing](CONTRIBUTING.md), the [Code of Conduct](CODE_OF_CONDUCT.md), and the [security policy](SECURITY.md) before submitting sensitive findings.

## License and credits

Licensing is undecided; the package is currently `UNLICENSED`. See [third-party notices](THIRD_PARTY_NOTICES.md) for runtime dependency licenses and artwork notes.

The supplied whale-tail artwork is the project identity. The independently implemented UI draws on published Google Material and Workspace guidance, linked in the [design-system reference](docs/design-system.md#references). This project is not affiliated with or endorsed by Google.
