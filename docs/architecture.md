# Architecture

The document adapter emits stable block IDs, source, language, and viewport bounds. It batches DOM mutation and scroll/resize events with animation frames. All host-page selectors live in the adapter.

The React overlay runs in a Shadow Root. Each block debounces source changes by 300ms, skips rendering outside the nearby viewport, and discards stale asynchronous results. Source remains in the document. Preview does not replace or save an image into Docs.

The renderer lazily imports Mermaid, serializes its global configuration/render calls, enforces strict security and sanitizes SVG with DOMPurify. A bounded source/theme cache stores at most 100 diagrams. Rendering errors retain the block's prior valid SVG.

Global settings and document toggles live in extension local storage. Source text and rendered SVG exist only in memory. No network API, OAuth, backend, remote scripts, or analytics is used.

## Feasibility gate

The initial adapter deliberately does not guess internal canvas selectors or claim to extract native code blocks. The next milestone requires testing with an authenticated live Docs document, identifying available accessibility/semantic source and block geometry, and validating edit/scroll/undo/reload behavior. If complete source cannot be reliably extracted without OAuth or modifying the document, product scope must be revisited before v1 release.

## UI and branding

The popup and isolated overlay share semantic CSS variables from `src/styles/design-tokens.ts`. The popup uses native checkbox-backed switches and selects; inline previews use compact native controls and labeled SVG icons. Expanded view contains focus and restores it on close. Both surfaces support light/dark preferences and reduced motion.

Chrome uses the supplied logo at 16/32/48/128px. The inline header loads only the 32px icon through a narrowly scoped web-accessible resource for Docs URLs. This static packaged asset adds no document-data upload or remote dependency. See [Design system](design-system.md).
