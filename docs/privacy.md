# Privacy

[Documentation](README.md) · [Project overview](../README.md)

Mermaid for Google Docs renders diagrams locally in your browser. It has no backend, telemetry, account, OAuth, or external rendering service. It does not upload document content.

The extension runs only on Google Docs document URLs. Per-document setting keys include the document ID; these keys remain on the device and are not transmitted. Its `storage` permission saves global preferences and per-document enable/disable choices locally. The `activeTab` permission lets the popup identify the current document after you click the extension, without requesting access to your browsing history. Source text and SVG previews are held in memory and disappear when the document tab is closed. Copy actions write to the clipboard only when requested.

The extension bundle includes all rendering dependencies. GitHub Actions builds packages; it does not access users' documents. Install release packages using Chrome’s **Load unpacked** option. Chrome Web Store distribution is separate from GitHub releases.

## Retention, deletion and contact

Preferences and document setting keys persist in local extension storage until cleared or the extension is uninstalled. Mermaid source and SVG render results are held in memory, including a bounded render cache, until the tab closes. To remove all extension settings, uninstall the extension. Copied text remains on the system clipboard until replaced or cleared using the operating system.

For privacy questions, [open a project issue](https://github.com/leracherry/google-docs-mermaid/issues). Do not include private document content or IDs. This policy covers the extension; Google Docs and GitHub have their own data practices.

Last updated: October 27, 2026.

## UI resources and links

The logo, icons, and styles are packaged with the extension. Font preferences use fonts already available on the device; no remote font or icon service is loaded. Image nodes and resource-bearing CSS (`url(...)` and `@import`) are rejected before rendering, including in configuration directives. The 32px logo is exposed as a static extension resource only to Google Docs URLs so the inline header can display it.

Help and privacy links open GitHub only when clicked. The extension does not send Mermaid source with those links. Normal GitHub site privacy behavior applies after navigation.
