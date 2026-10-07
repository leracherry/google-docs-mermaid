import { readFileSync } from 'node:fs';
const { version } = JSON.parse(readFileSync('package.json', 'utf8'));
const tag = process.env.GITHUB_REF_NAME;
const identifier = '(?:0|[1-9][0-9]*|[0-9A-Za-z-]*[A-Za-z-][0-9A-Za-z-]*)';
if (!tag || !new RegExp(`^v${version.replaceAll('.', '\\.')}(?:-${identifier}(?:\\.${identifier})*)?$`).test(tag)) {
  throw new Error(`Release tag must match package version v${version}, optionally with a prerelease suffix`);
}
