import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

export function validatePackage(files, read, version) {
  const entries = new Set(files);
  const manifest = JSON.parse(read('manifest.json'));
  assert.equal(manifest.manifest_version, 3, 'Chrome requires Manifest V3');
  assert.equal(manifest.version, version, 'Manifest and package versions must agree');
  assert.match(manifest.version, /^(0|[1-9]\d*)(\.(0|[1-9]\d*)){0,3}$/);
  assert.ok(manifest.version.split('.').every(n => Number(n) <= 65535));
  assert.ok(manifest.name.length > 0 && manifest.name.length <= 75);
  assert.ok(manifest.description.length > 0 && manifest.description.length <= 132);
  assert.deepEqual([...manifest.permissions].sort(), ['activeTab', 'storage']);
  assert.ok(!manifest.host_permissions?.length && !manifest.optional_host_permissions?.length);
  assert.equal(manifest.homepage_url, 'https://github.com/leracherry/google-docs-mermaid');
  assert.equal(manifest.content_security_policy.extension_pages, "script-src 'self'; object-src 'none'; base-uri 'none'; connect-src 'none'");
  const required = ['manifest.json', 'LICENSE', 'THIRD_PARTY_NOTICES.txt', 'dependency-licenses.json', manifest.action.default_popup];
  for (const size of [16, 32, 48, 128]) {
    const file = manifest.icons[size].replace(/^\//, '');
    required.push(file);
    const png = Buffer.from(read(file));
    assert.equal(png.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
    assert.equal(png.readUInt32BE(16), size);
    assert.equal(png.readUInt32BE(20), size);
  }
  for (const file of Object.values(manifest.action.default_icon)) required.push(file.replace(/^\//, ''));
  assert.ok(manifest.content_scripts.length > 0);
  for (const script of manifest.content_scripts) {
    assert.deepEqual(script.matches, ['https://docs.google.com/document/*']);
    required.push(...(script.js ?? []), ...(script.css ?? []));
  }
  for (const resource of manifest.web_accessible_resources ?? []) {
    // Web-accessible match patterns are origin-only: Chrome requires /*.
    assert.deepEqual(resource.matches, ['https://docs.google.com/*']);
    required.push(...resource.resources);
  }
  for (const file of required) assert.ok(entries.has(file), `ZIP is missing ${file}`);
  assert.ok(JSON.parse(read('dependency-licenses.json')).length > 0);
  assert.ok(read('THIRD_PARTY_NOTICES.txt').toString().includes('===== mermaid@'));
  for (const file of entries) {
    assert.ok(!file.startsWith('/') && !file.split('/').includes('..'), `Unsafe path: ${file}`);
    assert.ok(!/(^|\/)(\.env[^/]*|node_modules|\.git|\.DS_Store)(\/|$)|\.(map|pem|key)$/i.test(file), `Unexpected private/development file: ${file}`);
    if (file.endsWith('.js')) {
      const script = new TextDecoder('utf-8', { fatal: true }).decode(read(file));
      for (const char of script) {
        const code = char.codePointAt(0);
        assert.ok(code !== 0 && !(code >= 0xfdd0 && code <= 0xfdef) && (code & 0xffff) < 0xfffe, `Chrome rejects a raw Unicode noncharacter or NUL in ${file}`);
      }
    }
    if (/\.(html|css)$/.test(file)) {
      const content = read(file).toString();
      assert.ok(!/<script[^>]+src=["']https?:|@import\s+["']https?:|url\(["']?https?:/i.test(content), `Remote executable/style resource in ${file}`);
    }
  }
  return manifest;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { version } = JSON.parse(readFileSync('package.json', 'utf8'));
  const zip = `.output/google-docs-mermaid-${version}-chrome.zip`;
  execFileSync('unzip', ['-tq', zip]);
  const files = execFileSync('unzip', ['-Z1', zip], { encoding: 'utf8' }).trim().split('\n').filter(f => !f.endsWith('/'));
  const manifest = validatePackage(files, file => execFileSync('unzip', ['-p', zip, file], { maxBuffer: 20 * 1024 * 1024 }), version);
  // Validate every local HTML script/style and CSS import/url reference in the archive.
  for (const file of files.filter(f => /\.(html|css)$/.test(f))) {
    const content = execFileSync('unzip', ['-p', zip, file], { encoding: 'utf8' });
    const refs = file.endsWith('.html') ? [...content.matchAll(/(?:src|href)=["']([^"']+)["']/g)].map(m => m[1]) : [...content.matchAll(/url\(["']?([^)'"\s]+)|@import\s+["']([^"']+)/g)].map(m => m[1] ?? m[2]);
    for (const ref of refs.filter(r => !/^(?:[a-z]+:|\/\/|#)/i.test(r))) {
      const resolved = new URL(ref, `https://extension.invalid/${file}`).pathname.slice(1);
      assert.ok(files.includes(resolved), `${file} references missing file ${ref}`);
    }
  }
  console.log(`Verified ${zip}: MV${manifest.manifest_version}, version ${manifest.version}, ${files.length} files, icons, references, permissions, CSP and notices.`);
}
