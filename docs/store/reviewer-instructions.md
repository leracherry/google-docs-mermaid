# Reviewer and manual test instructions

## Submission gate

**Do not submit this build as a working native Google Docs integration.** Native Docs canvas code extraction is not implemented. The automated browser suite intercepts a Docs URL and serves DOM-backed fixture HTML. Screenshots are labeled accordingly. The following checks remain required before a supported public store launch:

1. Implement native extraction and preview placement; verify with a real authenticated Google Docs document containing native Mermaid code blocks.
2. Verify edits, collaborator changes, pagination, editor/browser zoom, scroll, undo/redo, document reopening and long sessions.
3. Verify the real toolbar click grants `activeTab`, shows the correct document toggle, and persists only that document's choice.
4. Capture real supported-surface screenshots and update the listing, summary and these instructions.

Do not invent reviewer credentials or claim synthetic fixtures establish native support. No extension-specific account, subscription or OAuth setup is required. Real Docs testing requires the reviewer's normal Google account.

## Reproduce the supported fixture tests

Use the source archive attached to the same release. Install the Node.js version specified by `.node-version` in that source archive and pnpm 10.18.0. From the extracted source root:

```sh
pnpm install --frozen-lockfile
pnpm check
pnpm build
pnpm exec playwright install chromium
pnpm test:e2e
pnpm release:artifacts
```

The browser tests load the real production extension in an isolated Chromium profile, serve intercepted DOM-backed fixtures, and check rendering, settings, clipboard, focus, scrolling and hostile source. No real Google document or credentials are used. Store images appear under `test-results/store-assets/`.

## Install the package manually

Extract the `*-chrome.zip` archive, enable Developer mode at `chrome://extensions`, and select **Load unpacked** with the extracted directory containing `manifest.json`. This confirms package loading; it does not clear the native integration gate above.
