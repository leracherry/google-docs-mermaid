import { describe, expect, it } from 'vitest';
import { validatePackage } from '../../scripts/check-package.mjs';

const fixture = () => {
  const icon = (size: number) => {
    const png = Buffer.alloc(24);
    Buffer.from('89504e470d0a1a0a', 'hex').copy(png);
    png.writeUInt32BE(size, 16); png.writeUInt32BE(size, 20);
    return png;
  };
  const manifest = {
    manifest_version: 3, version: '0.1.1', name: 'Mermaid', description: 'Local previews',
    homepage_url: 'https://github.com/leracherry/google-docs-mermaid',
    permissions: ['storage', 'activeTab'],
    content_security_policy: { extension_pages: "script-src 'self'; object-src 'none'; base-uri 'none'; connect-src 'none'" },
    icons: Object.fromEntries([16, 32, 48, 128].map(n => [n, `icons/${n}.png`])),
    action: { default_popup: 'popup.html', default_icon: { 32: 'icons/32.png' } },
    content_scripts: [{ matches: ['https://docs.google.com/document/*'], js: ['content.js'] }],
    web_accessible_resources: [{ matches: ['https://docs.google.com/*'], resources: ['icons/32.png'] }],
  };
  const files: Record<string, Buffer> = {
    'manifest.json': Buffer.from(JSON.stringify(manifest)),
    'LICENSE': Buffer.from('MIT'), 'THIRD_PARTY_NOTICES.txt': Buffer.from('===== mermaid@12'),
    'dependency-licenses.json': Buffer.from('[{}]'), 'popup.html': Buffer.from('<html></html>'),
    'content.js': Buffer.from('console.log("local")'),
    ...Object.fromEntries([16, 32, 48, 128].map(n => [`icons/${n}.png`, icon(n)])),
  };
  return { files, manifest, check: () => validatePackage(Object.keys(files), (file: string) => files[file]!, '0.1.1'),
    update: () => { files['manifest.json'] = Buffer.from(JSON.stringify(manifest)); } };
};

describe('Chrome upload archive validation', () => {
  it('accepts a complete MV3 package', () => expect(fixture().check().version).toBe('0.1.1'));
  it.each(['manifest.json', 'LICENSE', 'THIRD_PARTY_NOTICES.txt', 'dependency-licenses.json', 'content.js', 'popup.html', 'icons/128.png'])('rejects missing %s', file => {
    const f = fixture(); delete f.files[file]; expect(f.check).toThrow();
  });
  it('rejects a version mismatch', () => { const f = fixture(); f.manifest.version = '0.1.0'; f.update(); expect(f.check).toThrow(); });
  it('rejects broad site access', () => { const f = fixture(); f.manifest.content_scripts[0]!.matches = ['<all_urls>']; f.update(); expect(f.check).toThrow(); });
  it('rejects invalid resource match paths', () => { const f = fixture(); f.manifest.web_accessible_resources[0]!.matches = ['https://docs.google.com/document/*']; f.update(); expect(f.check).toThrow(); });
  it('rejects additional permissions', () => { const f = fixture(); f.manifest.permissions.push('tabs'); f.update(); expect(f.check).toThrow(); });
  it('rejects wrong icon dimensions', () => { const f = fixture(); f.files['icons/128.png']!.writeUInt32BE(64, 16); expect(f.check).toThrow(); });
  it.each(['.env', 'content.js.map', '../secret', 'private.key'])('rejects unsafe/unnecessary files (%s)', file => {
    const f = fixture(); f.files[file] = Buffer.from('private'); expect(f.check).toThrow();
  });
  it('rejects a remotely loaded script', () => { const f = fixture(); f.files['popup.html'] = Buffer.from('<script src="https://example.com/code.js"></script>'); expect(f.check).toThrow(); });
});
