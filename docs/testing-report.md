# Code review and test report

[Documentation](README.md) · [Roadmap](roadmap.md)

Review date: October 6, 2026. Scope: the current developer alpha, its production Chrome build, settings, renderer, DOM adapter, and CI/release packaging.

## Bugs fixed

| Area | Finding and correction |
| --- | --- |
| Repeated diagrams | Cached SVGs reused element IDs, allowing marker and accessibility references to collide. Each returned SVG now has unique IDs and rewritten references. Concurrent identical requests reuse the rendering work. |
| Rendering lifecycle | Cancelling a render could leave the busy indicator visible. Effects reset busy state, abort queued stale work and ignore old results. Expanded viewers can continue updating when the source scrolls away. |
| Input limits | The size limit was left to Mermaid after parsing. Source over 50,000 characters is now rejected before either parsing or rendering. |
| Resource loading | Post-render SVG sanitization was too late to prevent image requests from Mermaid's temporary measurement DOM. Image nodes and CSS resource syntax are rejected before Mermaid runs; shared appearance configuration is protected. |
| Zoom | Mermaid's inline maximum width could cap zoom while the percentage kept increasing. The preview overrides that cap, and modifier-wheel handling now uses a non-passive listener to suppress the browser's default action. |
| Block modes | Selecting Mermaid mode forced Code view. Mermaid/Auto now select Preview; Code/Never render select Code. |
| DOM adapter | Newly added role/data-code-block attributes were not observed; line breaks represented by HTML elements were lost; per-block resizes were not watched. The adapter now tracks these changes and preserves rendered line breaks. |
| Language labels | Labels on a block itself were missed and punctuation was truncated. Block and child-code labels are read correctly, and detector labels are trimmed. |
| Document settings | The popup lacked permission to identify its active document. The manifest now uses temporary `activeTab` access after a toolbar invocation. |
| Settings initialization | Rendering could start before disabled preferences loaded, and failed reads could reject without handling. The overlay waits for settings, handles read failures, and ignores stale refreshes. |
| Release tags | Malformed prerelease suffixes were accepted. The validator now rejects empty identifiers and leading-zero numeric identifiers. |
| Dependencies | Updated KaTeX to 0.18.2 and Vitest to 4.1.11, removing the reported runtime and test dependency advisories. |

## Verification

- 46 unit tests pass across seven files: candidate detection, preferences, adapter lifecycle/cleanup, renderer security/cache/queue, React render lifecycle, popup failures/persistence, and release tags.
- 11 built-extension Chromium tests pass; no skipped, failed or flaky tests in the final local run (32.9 seconds).
- Browser checks cover seven diagram families, actual SVG zoom, modifier-wheel cancellation, clipboard contents, split/expanded views, focus containment/restoration, duplicate SVG references, dynamic blocks, document isolation, saved preferences, theme changes, resource rejection and error recovery.
- TypeScript, documentation link checks, production build and ZIP creation pass. ZIP integrity, manifest version, declared permissions, popup, icon and content-script files were checked.
- Frozen lockfile installation succeeds. `pnpm audit` reports zero known vulnerabilities across the resolved dependency tree at review time.
- Updated 2× screenshots match the corrected preview sizing; the main flowchart screenshot was visually inspected.
- CI and release jobs now audit dependencies, upload browser results even on failures and have a 15-minute packaging timeout.

The [KaTeX advisory](https://github.com/KaTeX/KaTeX/security/advisories/GHSA-238p-pmpm-9mq7) identifies 0.18.2 as the patched version. A clean audit is a point-in-time dependency check, not proof that all vulnerabilities are absent.

## Fixture scaling checks

Each scenario creates the specified number of simple blocks, scrolls to the last block, edits it, moves it, removes it, verifies the overlay disappears, and reinserts it. Rendering remains gated to the nearby viewport.

| Blocks | Local lifecycle scenario time |
| --- | --- |
| 1 | 1.68 seconds |
| 10 | 1.70 seconds |
| 50 | 1.71 seconds |
| 100 | 1.71 seconds |

These numbers exclude browser startup and initial page rendering. They measure synthetic lifecycle behavior on this machine, not simultaneous rendering of 100 complex diagrams or native Google Docs performance. Browser timing details are stored in `test-results/results.json` and uploaded by CI.

## Remaining release blockers and limits

**Native Google Docs canvas source extraction is still unimplemented.** Tests intercept a Docs URL and serve DOM-backed fixtures. They do not prove that the extension can read native Docs code blocks. M0 must be implemented and verified in an authenticated document before a supported public release.

The real toolbar `activeTab` grant flow, native document edits, collaborator changes, pagination, editor zoom, reopen/undo behavior and long-session performance still need live-Docs verification. Unit tests cover the popup's document-setting logic; browser fixtures cover storage behavior, document isolation and persistence.

The content script remains approximately 5.5 MB. Block preferences remain session-only; expanded drag-to-pan is not implemented. Image nodes and URL/import-based styling are intentionally unsupported. These constraints are tracked in the roadmap and are not cleared by passing the fixture suite.
