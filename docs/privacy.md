# Privacy

Mermaid for Google Docs renders diagrams locally in your browser. It has no backend, telemetry, account, OAuth, or external rendering service. It does not upload document content.

The extension runs only on Google Docs document URLs. Its storage permission saves global preferences and per-document enable/disable choices locally. Source text and SVG previews are held in memory and disappear when the document tab is closed. Copy actions write to the clipboard only when requested.

The extension bundle includes all rendering dependencies. GitHub Actions builds packages; it does not access users' documents. This alpha requires manual unpacked installation and does not integrate with the Chrome Web Store.

## UI resources and links

The logo, icons, and styles are packaged with the extension. Font preferences use fonts already available on the device; no remote font or icon service is loaded. The 32px logo is exposed as a static extension resource only to Google Docs URLs so the inline header can display it.

Help and privacy links open GitHub only when clicked. The extension does not send Mermaid source with those links. Normal GitHub site privacy behavior applies after navigation.
