# Development

[Documentation](README.md) · [Project overview](../README.md)

## Prerequisites

Use Node.js 22.22.2 from [.node-version](../.node-version) and pnpm 10.18.0. The declared supported ranges are `^22.22.2 || ^24.15.0 || >=26.0.0`, matching the test dependencies. The repository is public.

## Local setup

```sh
git clone git@github.com:leracherry/google-docs-mermaid.git
cd google-docs-mermaid
pnpm install --frozen-lockfile
pnpm dev
```

For a production build, run `pnpm build`. Load `.output/chrome-mv3` through Chrome's **Load unpacked** option at `chrome://extensions`.

## Commands

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Start WXT development mode |
| `pnpm check:docs` | Check local documentation links, anchors, and image references |
| `pnpm check` | Check documentation, TypeScript, and unit tests |
| `pnpm build` | Build the production Chrome extension |
| `pnpm exec playwright install chromium` | Install the test browser |
| `pnpm test:e2e` | Test the built extension in Chromium |
| `pnpm zip` | Build, package and validate the actual upload ZIP in `.output` |
| `pnpm release:artifacts` | Package extension, submission kit, source, manifest and checksums in `release/` after browser tests; requires a clean tracked working tree |

Build before running browser tests. Unit tests do not require a browser.

## Browser fixtures

The browser suite loads the actual built extension in a temporary Chromium profile. It intercepts a Google Docs URL and serves a synthetic page with DOM-backed code blocks. No Google account or real document is accessed.

Coverage includes source edits, error recovery, view changes, focus containment, clipboard actions, actual SVG zoom, unique IDs and marker references, dynamic block attributes, rendered line breaks, block deletion/reinsertion, document isolation, persisted preferences, light/dark settings, hostile inputs, and resource loading prevention. Browser fixtures exercise 1, 10, 50 and 100 blocks with viewport gating and scrolling. Visual checks cover flowchart, sequence, class, state, ER, pie and Gantt diagrams.

Unit tests separately cover render cancellation/debounce, queue/cache behavior, input limits and sanitization, settings validation/save failures, observer cleanup, and release tag validation. `test-results/results.json` records browser results and fixture timings. These timings measure synthetic lifecycle scenarios, not full rendering of 100 complex diagrams.

The automated suite targets DOM-backed document surfaces. Native canvas integration has its own M0 acceptance criteria in the roadmap.

## Screenshots

```sh
pnpm build
UPDATE_SCREENSHOTS=1 pnpm test:e2e
```

Screenshots are saved to `docs/assets` at 2× resolution. Display them at their logical width (650px for diagram examples, 360px for the popup) to keep the UI crisp without enlarging it. Review them before committing; keep the README and [design-system examples](design-system.md#visual-examples) consistent with the implementation. Label fixture screenshots accurately.

Shared visual tokens live in [design-tokens.ts](../src/styles/design-tokens.ts). The logo source is [logo.png](assets/logo.png), with Chrome variants in [public/icons](../public/icons).

## CI artifacts

The [CI workflow](../.github/workflows/ci.yml) runs on main and pull requests. It installs locked dependencies, audits dependencies, checks docs/types/tests, builds the extension, runs browser scenarios, and uploads the full release asset set as `chrome-extension`. Browser results are uploaded even on failure. CI tests the minimum Node 22 runtime, checks and builds on Node 24.15.0 and Node 26, and downloads the uploaded release artifact to verify its checksums. Both CI and release packaging enforce a 15-minute timeout.

To install an artifact from a successful run, download `chrome-extension`, extract it, and then extract the extension ZIP inside it. Load the resulting folder containing `manifest.json`.

## Releases

The current release is `v0.1.0`, including the shared design system, dropdown spacing, rendering fixes and expanded test suite. See the [release notes](releases/v0.1.0.md) and [changelog](../CHANGELOG.md).

To publish a new release:

1. Update `package.json` and the lockfile when changing the package version.
2. Complete checks and merge the change into main.
3. Push a matching `v<version>` tag, with an optional prerelease suffix such as `v0.1.0-alpha.3`.

The [release workflow](../.github/workflows/release.yml) validates the tag, audits dependencies, checks, builds, tests, validates the actual ZIP, and publishes the full asset set using GitHub's built-in token. A suffix creates a prerelease. Artifact uploads must include hidden files because WXT stores ZIPs in `.output`.

See the [Chrome Web Store submission guide](store/README.md). The packaging release is `v0.1.1-rc.1`; native integration remains blocked. Store submission is a separate publisher dashboard action.

## Dependency maintenance

Dependabot Node type updates stay within major 22 so declarations match the oldest supported runtime. The Node 26 typings update is deferred until the Node support policy changes; compiler and test-tool major upgrades are tested together before merging. GitHub Actions use checkout/setup-node/upload-artifact v7, download-artifact v8 and pnpm/action-setup v6.

## Build constraints

Vite 6 and the compatible React plugin remain pinned. TypeScript 7.0.2, Vitest 5.0.5, jsdom 30.1.3 and Playwright 1.64.0 are verified together on the minimum Node 22 runtime. Mermaid initializes only when a candidate needs rendering, but WXT currently bundles its bytes into the approximately 5.5MB content script. Bundle performance remains a v1 milestone.

KaTeX is overridden to 0.18.2 to address [GHSA-238p-pmpm-9mq7](https://github.com/KaTeX/KaTeX/security/advisories/GHSA-238p-pmpm-9mq7). Vitest 5 retains Vite 6 compatibility. Run `pnpm audit` when updating dependencies.
