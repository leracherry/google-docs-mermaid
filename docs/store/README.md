# Chrome Web Store submission kit

[Documentation](../README.md) · [Listing draft](listing.md) · [Privacy answers](privacy-practices.md) · [Reviewer instructions](reviewer-instructions.md)

The release includes three separate ZIPs, the generated manifest and SHA-256 checksums:

- `google-docs-mermaid-<version>-chrome.zip`: upload this extension ZIP to the Chrome Web Store. `manifest.json` is at its root, alongside all runtime files, icons, project license, production dependency inventory and original third-party license texts.
- `google-docs-mermaid-<version>-submission-kit.zip`: listing text, privacy/permission answers, reviewer instructions, privacy policy, icons, two 1280×800 screenshots, exact generated manifest, original dependency notices and browser test results. These store materials are entered separately in the dashboard; they are not bundled as executable extension files.
- `google-docs-mermaid-<version>-source.zip`: tracked source, lockfile, build/test scripts, documentation and workflows for the tagged commit. Requires installing the locked dependencies.
- `manifest.json`: identical to the manifest inside the upload ZIP.
- `SHA256SUMS`: checksums for every other attached release file. Run `shasum -a 256 -c SHA256SUMS` after downloading all assets.

Run `pnpm build`, `pnpm test:e2e`, then `pnpm release:artifacts` to create `release/`. Packaging validates the actual upload ZIP, requires passing browser results and correctly sized screenshots, and compares every upload file against SHA-256 fingerprints of the browser-tested build. Generated notices include the full production dependency closure, a conservative superset of tree-shaken code. The GitHub release workflow runs the full audit and checks before publishing these assets.

## Launch status

**Packaging prepared; public store launch blocked.** Native Google Docs canvas extraction and authenticated manual verification remain unimplemented/unverified. See [reviewer instructions](reviewer-instructions.md). A complete artifact set does not guarantee Chrome Web Store approval.

The publisher must also register and verify a Chrome Web Store developer account, enable required account security, complete contact/account declarations, choose distribution regions/visibility, personally certify the privacy answers and submit for review. These account and dashboard actions cannot be stored in a manifest or fulfilled by a GitHub release. This repository does not upload or submit to the store automatically.

## Official requirements checked

- [Prepare an extension](https://developer.chrome.com/docs/webstore/prepare): manifest metadata, version and ZIP root layout.
- [Listing information](https://developer.chrome.com/docs/webstore/cws-dashboard-listing): 128×128 icon and at least one 1280×800 screenshot, description and category; promotional images are optional.
- [Privacy fields](https://developer.chrome.com/docs/webstore/cws-dashboard-privacy): single purpose, minimal permissions, remote-code declaration, data-use certification and privacy URL.
- [Publish](https://developer.chrome.com/docs/webstore/publish): developer dashboard upload, distribution, reviewer instructions and review submission.
