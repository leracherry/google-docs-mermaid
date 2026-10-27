# Third-party notices

The project is licensed under [MIT](LICENSE). Dependency licenses remain applicable independently.

| Runtime dependency | License | Upstream |
| --- | --- | --- |
| Mermaid | MIT | https://github.com/mermaid-js/mermaid |
| React / React DOM | MIT | https://github.com/facebook/react |
| DOMPurify | Apache-2.0 OR MPL-2.0 | https://github.com/cure53/DOMPurify |

Transitive dependencies also carry their own licenses. Every production build generates `THIRD_PARTY_NOTICES.txt` with the original license/notice files for the installed production dependency closure, and `dependency-licenses.json` with its versioned inventory. Both are included alongside `LICENSE` in the extension ZIP and submission kit. This includes a conservative superset of code retained after tree shaking. The table above is an overview.

The blue document / white whale-tail logo was supplied by the project owner. Its source is retained in `docs/assets/logo.png`; scaled derivatives appear in `public/icons`. The bundled project artwork is distributed with the project under MIT.

The UI is independently implemented using published Material and Google Workspace guidance. It does not bundle Google Sans, Google's legacy add-on CSS, or Google product icons. Local font names are fallback preferences, not redistributed font files. Google Docs and other Google product names are trademarks of Google LLC. The project is not affiliated with Google.
