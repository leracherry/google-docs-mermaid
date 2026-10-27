import { test, expect, chromium } from '@playwright/test';
import { mkdtemp, rm, mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import os from 'node:os';

test('submission screenshots show the real extension with an explicit fixture label', async () => {
  const profile = await mkdtemp(path.join(os.tmpdir(), 'gdm-store-'));
  const extension = path.resolve('.output/chrome-mv3');
  const context = await chromium.launchPersistentContext(profile, {
    channel: 'chromium', headless: true, viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1,
    args: [`--disable-extensions-except=${extension}`, `--load-extension=${extension}`],
  });
  try {
    await context.route('https://docs.google.com/**', route => route.fulfill({ contentType: 'text/html; charset=utf-8', body: `<!doctype html><html lang="en"><head><meta charset="UTF-8"><title>Mermaid extension demo fixture</title></head><body style="margin:0;background:#f8fafd;font:18px system-ui;color:#1f1f1f">
      <header style="padding:24px 40px"><h1 style="margin:0 0 8px;font-size:28px">Mermaid for Google Docs — developer preview</h1><p style="margin:0">DOM demo fixture · Native Google Docs canvas blocks are not supported</p></header>
      <pre data-code-block style="margin:32px 80px;width:1000px;height:480px;background:white;border:1px solid #dadce0;padding:20px;box-sizing:border-box">graph LR\nA[Write Mermaid] --> B{Preview locally}\nB --> C[Copy SVG]\nB --> D[Keep source]</pre>
      <footer style="padding:0 40px">Actual extension UI on a synthetic test page. No document upload or remote rendering.</footer></body></html>` }));
    const page = await context.newPage();
    await page.goto('https://docs.google.com/document/d/store-demo/edit');
    await expect(page.locator('.canvas svg')).toBeVisible({ timeout: 30000 });
    await expect(page.locator('.canvas')).toContainText('Write Mermaid');
    await expect(page.locator('header').first()).toContainText('DOM demo fixture');
    await expect(page.locator('h1')).toHaveText('Mermaid for Google Docs — developer preview');
    await mkdir('test-results/store-assets', { recursive: true });
    await page.screenshot({ path: 'test-results/store-assets/preview-light.png', animations: 'disabled' });
    const previousSvg = await page.locator('.canvas svg').getAttribute('id');
    await page.emulateMedia({ colorScheme: 'dark' });
    await expect(page.locator('.diagram.dark')).toBeVisible();
    await expect(page.locator('.canvas svg')).not.toHaveAttribute('id', previousSvg!);
    await page.screenshot({ path: 'test-results/store-assets/preview-dark.png', animations: 'disabled' });
    const files: Record<string, string> = {};
    async function fingerprint(dir: string) {
      for (const entry of await readdir(dir, { withFileTypes: true })) {
        const file = path.join(dir, entry.name);
        if (entry.isDirectory()) await fingerprint(file);
        else files[path.relative(extension, file).split(path.sep).join('/')] = createHash('sha256').update(await readFile(file)).digest('hex');
      }
    }
    await fingerprint(extension);
    await writeFile('test-results/store-assets/tested-build.json', JSON.stringify(files, null, 2));
  } finally { await context.close(); await rm(profile, { recursive: true, force: true }); }
});
