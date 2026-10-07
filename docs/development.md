# Development and releases

Use Node 22 and pnpm 10.18.0. Install with `pnpm install --frozen-lockfile`. `pnpm dev` runs WXT, and `pnpm build` produces `.output/chrome-mv3`. Load that directory as an unpacked extension in Chrome.

`pnpm check` checks TypeScript and candidate detection. `pnpm exec playwright install chromium` installs the test browser; `pnpm test:e2e` loads the production extension into an isolated Chromium profile and intercepts a Docs URL with a DOM fixture. This checks the renderer, syntax error recovery, view controls, and block cleanup without accessing a real document.

CI performs the same checks on main and pull requests and uploads the extension ZIP. Release tags must match the package version. The release job validates the version, rebuilds and tests, then publishes the ZIP as a GitHub release. Tags with a suffix, such as `v0.1.0-alpha.1`, are prereleases. The workflow needs only the built-in GitHub token, with write permission restricted to the publishing job.

Vite 6 and the compatible React plugin are pinned through package configuration for Node 22 compatibility. WXT bundles Mermaid into the content script; the alpha bundle is approximately 5.5MB and needs performance work before v1. Mermaid initialization is deferred until a candidate is encountered, but its bytes are currently loaded with the content script.

## Design and screenshots

Read [Design system](design-system.md) before UI changes. The shared token file drives both the popup and the overlay. Logo sources live in `docs/assets/logo.png`; Chrome variants live in `public/icons` and are declared in the manifest.

After building, run `UPDATE_SCREENSHOTS=1 pnpm test:e2e` to refresh the README screenshots from the real extension. Review every image in light/dark mode before committing. The browser fixture is synthetic and must stay clearly labeled in documentation.

## Releases

Update the package version and lockfile, merge the checked change into main, and push a matching `v<version>` or prerelease tag. The workflow validates versions, tests, rebuilds, packages, uploads the ZIP, and publishes it with the built-in GitHub token. Prerelease suffixes produce GitHub prereleases.

Artifact uploads must include hidden files because WXT writes ZIPs under `.output`. Keep publishing permissions restricted to the release publish job. Chrome Web Store deployment is not configured.
