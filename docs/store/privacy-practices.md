# Privacy practices and permission justifications

Copy these answers only after the publisher verifies they still match the exact package being submitted.

## Single purpose

Render local Mermaid diagram previews from supported DOM-backed code blocks on Google Docs document pages. Native canvas blocks are not supported in this developer preview.

## Permissions

- `storage`: store rendering preferences, appearance and per-document enable/disable choices in `chrome.storage.local` on the user's device. A per-document key includes the Google Docs document ID; no document ID or preference is transmitted by the extension.
- `activeTab`: after a toolbar click, identify the active Google Docs document so the popup can display and save its per-document setting. No browsing-history permission is requested.
- Content-script site access, `https://docs.google.com/document/*`: detect supported DOM blocks, read their Mermaid source and position local previews on that page. This is required for the extension's single purpose. No other site is matched.
- Web-accessible resource `icons/32.png`: allow the inline preview header to display its packaged icon on the Google Docs origin. Chrome requires origin-wide resource match patterns; the content script still runs only on document URLs. No source or settings are exposed as web-accessible resources.

## Remote code

Select **No, I am not using remote code**. Mermaid, DOMPurify, React, styles and artwork are bundled in the ZIP. No remote scripts, remote modules, external rendering API, fonts, analytics or backend are used. Source resource syntax is rejected and SVG is sanitized. Help/privacy links navigate to GitHub only after a user click.

## Data use

The extension accesses Mermaid source locally to render it; it retains source and SVG previews in memory. It stores preferences and document IDs locally. It does not collect or transmit user data to the developer or any third party. No analytics, sale, advertising, credit decisions or unrelated uses occur. Copy actions write source/SVG to the clipboard only on request.

For the dashboard data categories, disclose Website content because Mermaid source is read and rendered locally, and Web history because the active Google Docs URL/document ID is used for per-document settings. This access is limited to Docs document pages; the extension does not read general browsing history or transmit this data to the developer. Google requires disclosure even for local-only processing. Leave unrelated categories unchecked. The publisher must personally review and certify the dashboard's limited-use declarations. If behavior changes to send any data, update both these answers and the privacy policy before submission.

Privacy policy URL: https://github.com/leracherry/google-docs-mermaid/blob/main/docs/privacy.md


Reference: [Google User Data FAQ, questions 3 and 4](https://developer.chrome.com/docs/webstore/program-policies/user-data-faq).
