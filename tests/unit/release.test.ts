import { describe, expect, it } from 'vitest';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
const { version } = JSON.parse(readFileSync('package.json', 'utf8'));
const check = (tag: string) => spawnSync(process.execPath, ['scripts/check-release.mjs'], { env: { ...process.env, GITHUB_REF_NAME: tag } }).status;
describe('release tag validation', () => {
  it.each(['', '-alpha.3', '-rc.0', '-0', '-alpha-1'])('accepts matching semver tags (%s)', suffix => expect(check(`v${version}${suffix}`)).toBe(0));
  it.each(['', 'v9.9.9', `v${version}-alpha..1`, `v${version}-01`, `v${version}-.`, `v${version}-alpha.01`, `v${version}junk`])('rejects invalid/mismatched tags (%s)', tag => expect(check(tag)).not.toBe(0));
});
