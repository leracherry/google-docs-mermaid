# Architecture

[Documentation](README.md) · [Project overview](../README.md)

## Pipeline

```text
Document adapter
  → stable blocks, source, language and viewport bounds
  → Mermaid candidate detection
  → debounced validation and serial rendering
  → shared theme and SVG styling
  → SVG sanitization and bounded cache
  → isolated React preview
```

## Document adapter

[GoogleDocsAdapter](../src/docs/google-docs-adapter.ts) observes DOM-backed `pre`, `[data-code-block]`, and `[role="code"]` surfaces. It assigns stable IDs, reads source, tracks bounds, and batches mutation/scroll/resize work with animation frames. All host-page selectors stay behind the [adapter interface](../src/docs/adapter.ts).

Native Google Docs canvas source extraction is not implemented. M0 requires a real document to verify accessible source, code-block identity, screen geometry, edits, scrolling, and removal. Fixture coverage must not be described as evidence that M0 is complete.

## Rendering

The [detector](../src/mermaid/detector.ts) recognizes explicit Mermaid fences and candidate starters before loading the renderer. Each block waits 300ms after edits and skips new rendering outside the nearby viewport.

The [renderer](../src/mermaid/renderer.ts) serializes Mermaid configuration/render calls, uses strict security and size limits, and sanitizes SVG with DOMPurify. A source/theme cache holds up to 100 diagrams. Block effects discard stale results and retain the previous valid SVG on errors.

Mermaid initializes on demand, but its bytes are currently included in the content-script bundle.

## Visual treatment

[Shared tokens](../src/styles/design-tokens.ts) generate the popup/overlay CSS variables and [Mermaid theme values](../src/mermaid/themes.ts). Rectangular cards receive soft corners and thin neutral outlines; connectors retain meaningful dashes and arrowheads. Exported SVG includes the same styling as the inline preview.

The React overlay lives in a Shadow Root. Expanded view contains keyboard focus and restores it on close. Both surfaces support light/dark themes and reduced motion. See the [design system](design-system.md).

## State and privacy

[Preferences](../src/state/preferences.ts) and document enable/disable choices live in extension local storage. Block mode/view choices are session-only. Source and SVG exist in memory and are not uploaded or persisted.

The manifest requests `storage`. The static 32px logo is exposed only to Docs URLs so the inline header can display it. Other icons are packaged for Chrome's toolbar and extension list. There is no backend, OAuth, telemetry, or remote renderer. See [Privacy](privacy.md) and [Security](../SECURITY.md).
