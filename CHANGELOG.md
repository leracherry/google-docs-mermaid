# Changelog

Changes are listed by release, with unreleased work first.

## 0.1.2-rc.1 — 2026-10-27

- Integrate the Dependabot updates for GitHub Actions, TypeScript 7.0.2, Vitest 5.0.5, jsdom 30.1.3 and Playwright 1.64.0.
- Declare the actual test-tool Node requirements and pin the minimum development runtime in `.node-version`.
- Test supported Node 22/24/26 runtimes and verify artifact upload/download checksums in CI.
- Keep Node type declarations on major 22 to match the oldest supported runtime; defer the Node 26 types update.

## 0.1.1-rc.1 — 2026-10-27

- Prepare a Chrome Web Store submission kit with listing and privacy answers, permission justifications, reviewer instructions, icons and labeled 1280×800 fixture screenshots.
- Attach the verified upload ZIP, complete submission kit, source ZIP, exact generated manifest and SHA-256 checksums to releases.
- Include original notices for the production dependency closure in the extension package.
- Validate MV3 metadata, version, paths, permissions, CSP, icon sizes, runtime resources, notices and ZIP integrity; add negative packaging tests.
- Update DOMPurify to 3.4.17 and Vitest to 4.1.12 to resolve five current dependency advisories.
- Clarify native canvas support limitations in extension metadata. Native Docs integration and authenticated manual verification still block public store launch.

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
