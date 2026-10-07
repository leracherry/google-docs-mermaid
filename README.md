<p align="center">
  <img src="docs/assets/logo-small.png" width="96" height="96" alt="Mermaid for Google Docs" />
</p>

<h1 align="center">Mermaid for Google Docs</h1>

<p align="center">Local Mermaid previews. Your source stays in the document.</p>

<p align="center">
  <a href="https://github.com/leracherry/google-docs-mermaid/releases/tag/v0.1.0"><img src="docs/assets/badges/status.svg" alt="Release 0.1.0" /></a>
  <a href="docs/getting-started.md"><img src="docs/assets/badges/chrome.svg" alt="Chrome MV3" /></a>
  <a href="https://github.com/leracherry/google-docs-mermaid/actions/workflows/ci.yml"><img src="docs/assets/badges/ci.svg" alt="GitHub Actions" /></a>
  <a href="LICENSE"><img src="docs/assets/badges/license.svg" alt="MIT license" /></a>
</p>

<p align="center">
  <a href="docs/README.md">Docs</a> ·
  <a href="docs/roadmap.md">Roadmap</a> ·
  <a href="https://github.com/leracherry/google-docs-mermaid/releases">Releases</a> ·
  <a href="CONTRIBUTING.md">Contribute</a>
</p>

**Supported surface:** DOM-backed code blocks on Docs document pages. Native canvas code blocks are outside this release’s scope. Screenshots show the extension’s demo fixtures.

<p align="center">
  <img src="docs/assets/diagram-shapes.png" width="650" alt="Mermaid flowchart with inline preview, zoom, expand, and copy controls" />
</p>

<details>
  <summary>Settings — light and dark</summary>
  <p align="center">
    <img src="docs/assets/popup-light.png" width="300" alt="Extension settings in light mode" />
    <img src="docs/assets/popup-dark.png" width="300" alt="Extension settings in dark mode" />
  </p>
</details>

## What it does

- Live previews with syntax-error recovery.
- Preview, Split, and Code views; zoom, expand, and copy source/SVG.
- Shared light/dark styling, global preferences, and per-document toggles.
- Local rendering with no backend, account, or telemetry.

Built with **TypeScript · WXT · React · Mermaid**.

## Develop

Requires Node.js 22+ and pnpm 10.18.0.

```sh
git clone git@github.com:leracherry/google-docs-mermaid.git
cd google-docs-mermaid
pnpm install --frozen-lockfile
pnpm dev
```

For a production build, run `pnpm build` and load `.output/chrome-mv3` at `chrome://extensions` with **Developer mode → Load unpacked**.

```sh
pnpm check
pnpm build
pnpm exec playwright install chromium
pnpm test:e2e
```

See [Development](docs/development.md) for fixture testing, screenshots, and packaging. Download [v0.1.0](https://github.com/leracherry/google-docs-mermaid/releases/tag/v0.1.0) for the current release. Repository access is required while the project is private.

## Contribute

Read [Contributing](CONTRIBUTING.md), browse the [roadmap](docs/roadmap.md), or [report a bug](https://github.com/leracherry/google-docs-mermaid/issues/new/choose). See [Security](SECURITY.md) for sensitive reports and [Privacy](docs/privacy.md) for data handling.

## License

[MIT](LICENSE). Third-party dependencies retain their own licenses; see [notices](THIRD_PARTY_NOTICES.md). This project is not affiliated with Google.
