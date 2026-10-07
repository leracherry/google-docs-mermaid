# Getting started

This is a developer alpha. The renderer works on DOM-backed code blocks; native Google Docs canvas extraction and Markdown-file integration are still pending. Installing it may show no previews in a standard Docs document.

## Install

Download a ZIP from [GitHub Releases](https://github.com/leracherry/google-docs-mermaid/releases), extract it, then visit `chrome://extensions`. Enable Developer mode, select Load unpacked, and choose the folder containing `manifest.json`. Pin Mermaid for Google Docs from Chrome's toolbar extension menu.

For a local build, follow [Development](development.md) and load `.output/chrome-mv3`. The latest release may lag behind changes on main.

## Controls

- **Mermaid · Auto:** recognize candidate syntax. Select Mermaid to force rendering, Code for ordinary code, or Never render to suppress this block for the session.
- **Preview:** display the diagram. **Split:** display the diagram and a read-only source copy. **Code:** expose the original document for editing.
- **Zoom:** use +/− or Ctrl/Cmd + wheel. Ordinary wheel gestures continue scrolling the document.
- **Fit:** reset the diagram to container width. **Expand:** open a larger viewer; Escape closes it.
- **Copy Mermaid / Copy SVG:** copy source or the current valid diagram to your clipboard. Clipboard access may be blocked by browser policy.

The popup controls rendering, automatic detection, and theme. On a supported active Docs tab it also offers a persistent enable/disable choice for that document. Auto theme follows the device appearance.

## Troubleshooting

| Symptom | Next step |
| --- | --- |
| No preview in native Docs | Expected alpha limitation: canvas source extraction is not implemented |
| No preview on a DOM-backed block | Check rendering is enabled, use a Mermaid fence, and verify the block is visible |
| Syntax error | Correct the original source; the previous valid preview remains visible |
| An old diagram is shown | It may be the retained valid preview while the new source is invalid |
| Copy fails | Check browser clipboard permissions and retry from the button |
| Logo or styles look old | Reload the unpacked extension and refresh the document tab |

When filing a bug, include extension and Chrome versions, steps, and a small non-sensitive Mermaid example. Avoid sharing private document URLs or content. See [Contributing](../CONTRIBUTING.md).
