# Chrome Web Store listing draft

Status: **blocked for public submission**. This release prepares packaging; it does not implement native Google Docs canvas extraction. Do not describe fixture behavior as working in a normal native document.

## Product details

- Name: Mermaid for Google Docs
- Language: English
- Suggested category: Tools
- Summary: Experimental local Mermaid previews for DOM-backed blocks on Google Docs pages. Native canvas blocks are not supported.
- Homepage: https://github.com/leracherry/google-docs-mermaid
- Support: https://github.com/leracherry/google-docs-mermaid/issues
- Privacy policy: https://github.com/leracherry/google-docs-mermaid/blob/main/docs/privacy.md
- Content: no mature content; no paid features or purchases.

## Detailed description

Experimental Mermaid diagram previews for DOM-backed code blocks on Google Docs document pages.

This developer preview supports DOM-backed blocks only. Native Google Docs canvas code blocks are not supported. It is intended for controlled fixtures and integration development until native integration has been implemented and verified.

Features on supported blocks:
- Render Mermaid diagrams locally, with live updates and syntax-error recovery.
- Switch between Preview, Split and Code views.
- Zoom, expand, and copy Mermaid source or rendered SVG.
- Choose light, dark or automatic appearance.
- Enable or disable rendering globally or for individual documents.

Rendering dependencies are bundled. No document upload, remote rendering service, analytics, account or OAuth is used by the extension. Google Docs itself requires its normal Google account and permissions. Images and external-resource CSS in Mermaid source are intentionally unsupported.

The project is independent and is not affiliated with or endorsed by Google LLC. Google Docs is a trademark of Google LLC.

## Screenshots and icon

Use the two 1280×800 PNG files under `screenshots/` in the submission kit. They are actual built-extension screenshots on an intercepted DOM fixture, visibly labeled as a demo. They are not evidence of native Docs integration. The store icon is `icons/128.png`. Optional promotional tiles and video are not provided or required.
