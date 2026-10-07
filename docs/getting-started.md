# Getting started

[Documentation](README.md) · [Project overview](../README.md)

> This is a developer alpha. Native Google Docs canvas extraction and native Markdown-file integration are pending. Installing it may show no previews in a standard Docs document.

## Install

1. Download an extension ZIP from [Releases](https://github.com/leracherry/google-docs-mermaid/releases) or a successful main [CI run](https://github.com/leracherry/google-docs-mermaid/actions/workflows/ci.yml?query=branch%3Amain).
2. Extract the extension ZIP. A downloaded CI artifact is a wrapper ZIP containing the extension ZIP; extract both.
3. Open `chrome://extensions` and enable **Developer mode**.
4. Select **Load unpacked** and choose the folder containing `manifest.json`.
5. Pin **Mermaid for Google Docs** in Chrome's extension menu.

The latest published release, `0.1.0-alpha.2`, predates the current branding and design system. Use a main CI artifact or a [local build](development.md#local-setup) to try the current UI. There is no Chrome Web Store listing.

## Views and block modes

| Control | Behavior |
| --- | --- |
| Mermaid · Auto | Detect candidate Mermaid syntax |
| Mermaid | Force the block to be treated as Mermaid |
| Code block mode | Treat it as ordinary code |
| Never render | Disable this block for the session |
| Preview view | Show the diagram |
| Split view | Show the diagram and a read-only source copy |
| Code view | Expose the original document source for editing |

Block modes are session-only. The extension never replaces canonical document text with an image.

## Diagram actions

- **Zoom in/out:** use +/− or Ctrl/Cmd + wheel. Ordinary wheel gestures continue document scrolling.
- **Fit:** reset the diagram to container width.
- **Expand:** open a larger viewer; Escape closes it and restores focus.
- **Copy Mermaid:** copy the source text.
- **Copy SVG:** copy the last valid diagram, including its styling.

A syntax error leaves the last valid diagram visible until the source is corrected.

## Settings

The popup controls rendering, automatic detection, and theme. **Auto** theme follows the device appearance.

On a supported active Docs tab, the popup also offers **Enable for this document**. That choice persists locally on the current device. The extension does not synchronize settings to other devices.

## Troubleshooting

| Symptom | What to check |
| --- | --- |
| No preview in native Docs | Canvas source extraction is not implemented yet |
| No preview on a supported DOM-backed block | Enable rendering, use valid Mermaid or an explicit fence, and keep the block visible |
| Syntax error or an old diagram | Fix the source; the previous valid render is retained while syntax is invalid |
| Copy fails | Retry from the copy button and check browser clipboard policy |
| Logo or styles look old | Reload the unpacked extension, then refresh the document tab; check whether you installed the older release |
| Load unpacked cannot find the extension | Select the extracted folder that directly contains `manifest.json` |

For a bug report, include Chrome/extension versions, reproduction steps, and a small non-sensitive Mermaid example. Remove private document URLs and content. See [Contributing](../CONTRIBUTING.md).
