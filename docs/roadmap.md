# v1 roadmap

[Documentation](README.md) · [Project overview](../README.md)

The 0.1.0 alpha is a foundation release. It does not complete the original v1 MVP. **M0 remains the next priority.**

## Milestones

| Milestone | Current status | Remaining work |
| --- | --- | --- |
| M0 · Feasibility | Pending in live Docs | Identify native blocks, extract complete source, track geometry/edits, and remove overlays reliably |
| M1 · Mermaid prototype | Fixture pipeline implemented | Verify automatic rendering against a native block after M0 |
| M2 · Block lifecycle | Fixture edits/deletion covered | Validate paste, move, duplicate, undo/redo, reopen, and collaborator updates in live Docs |
| M3 · Inline UX | Core controls and shared visuals implemented | Persist block choices, improve editing-aware layout, and add expanded drag-to-pan |
| M4 · Markdown | Fence detection implemented | Validate files opened in Docs, fence-language changes, and editing/paste workflows |
| M5 · Performance | Queue, cache, debounce, viewport gating and 1/10/50/100-block lifecycle fixtures implemented | Benchmark complex native diagrams and reduce bundled renderer cost |
| M6 · Reliability | Stale-result, security, settings and multi-diagram fixture regressions covered | Extend authenticated live-Docs and long-session coverage |
| M7 · Settings | Popup and per-document toggle implemented | Validate settings in real Docs and refine editing preferences if needed |
| M8 · Release preparation | Logo, docs, screenshots, CI, and GitHub prerelease available | Prepare store assets |
| M9 · Web Store launch | Pending | Prove compatibility, complete launch review, and configure store publishing |

## M0 acceptance criteria

A native Google Docs code block can be identified, read completely, tracked while scrolling and zooming, updated after edits, and undecorated when removed. Evidence must come from an authenticated live document; synthetic fixtures do not satisfy this gate.

## Completed foundation

- [x] Private repository with main branch, description, and topics.
- [x] WXT, React, TypeScript, and local Mermaid rendering.
- [x] DOM-backed adapter and lifecycle fixtures.
- [x] Shared UI/diagram design tokens and supplied logo/icons.
- [x] Popup settings and per-document rendering choice.
- [x] CI, release packaging, and first GitHub prerelease.
- [x] Installation, architecture, design, privacy, security, and contribution guides.

## Before a public launch

- [ ] Complete M0 and live-Docs lifecycle checks.
- [x] Adopt the MIT source-code license.
- [x] Include the supplied project artwork under the project license.
- [ ] Verify accessibility and visual integration in live Docs.
- [ ] Prepare store assets and publishing credentials.
