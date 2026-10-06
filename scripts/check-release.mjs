import { readFileSync } from 'node:fs';
const { version } = JSON.parse(readFileSync('package.json', 'utf8'));
const tag = process.env.GITHUB_REF_NAME;
if (!tag || !new RegExp(`^v${version.replaceAll('.', '\\.')}(?:-[a-zA-Z0-9.-]+)?$`).test(tag)) {
  throw new Error(`Release tag must match package version v${version}, optionally with a prerelease suffix`);
}
