# Privacy

Mermaid for Google Docs renders diagrams locally in your browser. It has no backend, telemetry, account, OAuth, or external rendering service. It does not upload document content.

The extension runs only on Google Docs document URLs. Its storage permission saves global preferences and per-document enable/disable choices locally. Source text and SVG previews are held in memory and disappear when the document tab is closed. Copy actions write to the clipboard only when requested.

The extension bundle includes all rendering dependencies. GitHub Actions builds packages; it does not access users' documents. This alpha requires manual unpacked installation and does not integrate with the Chrome Web Store.
