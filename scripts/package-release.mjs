import assert from 'node:assert/strict';
import { copyFileSync, cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import path from 'node:path';

const { version } = JSON.parse(readFileSync('package.json', 'utf8'));
const prefix = `google-docs-mermaid-${version}`;
execFileSync('git', ['diff', '--exit-code', 'HEAD', '--'], { stdio: 'pipe' });
assert.equal(execFileSync('git', ['ls-files', '--others', '--exclude-standard'], { encoding: 'utf8' }).trim(), '', 'Commit all release sources before packaging');
const results = JSON.parse(readFileSync('test-results/results.json', 'utf8'));
assert.ok(results.stats.expected > 0 && results.stats.unexpected === 0 && results.stats.skipped === 0 && results.stats.flaky === 0, 'A fully passing browser run is required');
const uploadZip = `.output/${prefix}-chrome.zip`;
const tested = JSON.parse(readFileSync('test-results/store-assets/tested-build.json', 'utf8'));
const zipped = execFileSync('unzip', ['-Z1', uploadZip], { encoding: 'utf8' }).trim().split('\n').filter(f => !f.endsWith('/'));
assert.deepEqual(zipped.sort(), Object.keys(tested).sort(), 'Upload files must match the browser-tested build');
for (const file of zipped) {
  const hash = createHash('sha256').update(execFileSync('unzip', ['-p', uploadZip, file], { maxBuffer: 20 * 1024 * 1024 })).digest('hex');
  assert.equal(hash, tested[file], `Upload differs from browser-tested build: ${file}`);
}
const stage = '.output/submission-kit';
rmSync(stage, { recursive: true, force: true });
rmSync('release', { recursive: true, force: true });
mkdirSync(stage, { recursive: true });
mkdirSync('release');
cpSync('docs', `${stage}/docs`, { recursive: true });
writeFileSync(`${stage}/README.md`, `# Submission kit ${version}\n\nStart with [the submission guide](docs/store/README.md). Upload the separate chrome ZIP; enter store materials in the dashboard. Public launch is blocked pending native Google Docs integration.\n`);
mkdirSync(`${stage}/screenshots`);
for (const name of ['preview-light.png', 'preview-dark.png']) {
  const png = readFileSync(`test-results/store-assets/${name}`);
  assert.equal(png.readUInt32BE(16), 1280, 'Store screenshot width');
  assert.equal(png.readUInt32BE(20), 800, 'Store screenshot height');
  copyFileSync(`test-results/store-assets/${name}`, `${stage}/screenshots/${name}`);
}
cpSync('public/icons', `${stage}/icons`, { recursive: true });
for (const file of ['LICENSE', 'THIRD_PARTY_NOTICES.txt', 'dependency-licenses.json', 'manifest.json']) {
  copyFileSync(`.output/chrome-mv3/${file}`, `${stage}/${file}`);
}
copyFileSync('docs/privacy.md', `${stage}/privacy-policy.md`);
copyFileSync('test-results/results.json', `${stage}/browser-test-results.json`);
copyFileSync('test-results/store-assets/tested-build.json', `${stage}/tested-build.json`);
const commit = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
// Documentation links into source files should remain usable in the kit,
// which deliberately keeps source code in its own downloadable archive.
function fixLinks(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) fixLinks(file);
    else if (file.endsWith('.md')) {
      const content = readFileSync(file, 'utf8').replace(/(\[[^\]]*\]\()([^\s)]+)(\))/g, (match, open, href, close) => {
        if (/^(?:[a-z]+:|\/\/|#)/i.test(href)) return match;
        const target = path.resolve(path.dirname(file), href.split('#')[0]);
        if (existsSync(target)) return match;
        const repoPath = path.relative(stage, file).split(path.sep).join('/');
        return open + new URL(href, `https://github.com/leracherry/google-docs-mermaid/blob/${commit}/${repoPath}`).href + close;
      });
      writeFileSync(file, content);
    }
  }
}
fixLinks(stage);
writeFileSync(`${stage}/build-info.json`, JSON.stringify({ version, commit, tag: process.env.GITHUB_REF_NAME ?? null, publicStoreLaunchReady: false, blocker: 'Native Google Docs canvas extraction and authenticated integration tests are pending', browserStats: results.stats }, null, 2) + '\n');
copyFileSync(`.output/${prefix}-chrome.zip`, `release/${prefix}-chrome.zip`);
copyFileSync('.output/chrome-mv3/manifest.json', 'release/manifest.json');
execFileSync('zip', ['-qr', path.resolve(`release/${prefix}-submission-kit.zip`), '.'], { cwd: stage });
execFileSync('git', ['archive', '--format=zip', `--output=release/${prefix}-source.zip`, 'HEAD']);
for (const file of readdirSync('release').filter(f => f.endsWith('.zip'))) execFileSync('unzip', ['-tq', `release/${file}`]);
const sums = readdirSync('release').sort().map(file => `${createHash('sha256').update(readFileSync(`release/${file}`)).digest('hex')}  ${file}`).join('\n') + '\n';
writeFileSync('release/SHA256SUMS', sums);
console.log(`Prepared release assets for ${commit}:\n${readdirSync('release').join('\n')}`);
