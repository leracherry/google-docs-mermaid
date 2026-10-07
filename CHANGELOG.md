# Changelog

Changes are listed by release, with unreleased work first.

## 0.1.0 — 2026-10-06

- Publish the first regular GitHub release for DOM-backed code blocks.
- Give all dropdown chevrons consistent spacing and refresh the README and 2× screenshots.

- Fix duplicate SVG IDs across cached previews, stalled rendering status, zoom limits, and modifier-wheel cancellation.
- Track dynamic code-block attributes, rendered line breaks, and individual block resizes; stop previews until settings load successfully.
- Grant temporary active-tab access for document settings and handle storage read failures without unhandled rejections.
- Reject oversized diagrams and external resource syntax before Mermaid renders; protect shared theme configuration.
- Update KaTeX and Vitest to remove known dependency advisories; enforce dependency audits in CI and release jobs.
- Expand unit and built-extension regression coverage, including 100-block lifecycle fixtures, clipboard, security, and settings failures; validate prerelease tags strictly.

- Simplify the developer README, add high-resolution screenshots, and adopt the MIT license.

- Restore the centered README identity, locally hosted project badges, and topic tags.

- Repair README portability, reorganize documentation, clarify release/main differences, and check local documentation references in CI.

- Unify UI and diagram colors/geometry under one token source; flatten Mermaid nodes, soften rectangular corners, and normalize connectors and outlines.
- Align diagram actors, notes, clusters, labels, and exported SVG with the same light/dark treatment.

- Add the supplied whale-tail logo to extension icons, popup, inline header, and README.
- Restyle the popup and diagram controls with shared Workspace-inspired Material tokens.
- Add light/dark styling, switch controls, focus rings, reduced motion, and expanded-view focus management.
- Refresh the README and add setup, design-system, security, and community documentation.
- Add bug and feature templates and UI verification screenshots.

## 0.1.0-alpha.2 — 2026-10-06

- Publish the first installable alpha ZIP after fixing artifact uploads from the hidden build directory.
- Add local Mermaid rendering, candidate detection, source-preserving preview controls, document settings, and fixture lifecycle tests.
- Set up private repository, CI, and version-tag release packaging.

Native Google Docs canvas extraction remains pending. The first alpha tag (`0.1.0-alpha.1`) did not publish a release because artifact uploading failed.
