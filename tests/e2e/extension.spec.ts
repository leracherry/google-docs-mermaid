import { test, expect, chromium } from '@playwright/test';
import path from 'node:path';
import os from 'node:os';
import { mkdtemp, rm } from 'node:fs/promises';
test('built extension renders, preserves valid preview, follows edits and removes blocks', async () => {
  const profile = await mkdtemp(path.join(os.tmpdir(), 'gdm-e2e-'));
  const extension = path.resolve('.output/chrome-mv3');
  const context = await chromium.launchPersistentContext(profile, {
    channel: 'chromium', headless: true,
    args: [`--disable-extensions-except=${extension}`, `--load-extension=${extension}`],
  });
  try {
    await context.route('https://docs.google.com/**', route => route.fulfill({ contentType: 'text/html', body: '<!doctype html><html><body><pre data-code-block style="margin:80px;width:600px;min-height:100px">graph LR\nA --> B</pre></body></html>' }));
    const page = await context.newPage();
    await page.goto('https://docs.google.com/document/d/fixture/edit');
    const preview = page.locator('google-docs-mermaid').locator('.canvas');
    await expect(preview.locator('svg')).toBeVisible({ timeout: 30000 });
    await expect(preview.locator('svg text')).toContainText(['A', 'B']);
    const valid = await preview.innerHTML();
    await page.locator('pre[data-code-block]').evaluate(el => { el.textContent = 'graph LR\nA -->'; });
    await expect(page.getByRole('alert')).toContainText('syntax error');
    expect(await preview.innerHTML()).toBe(valid);
    await page.locator('pre[data-code-block]').evaluate(el => { el.textContent = 'graph LR\nA --> Changed'; });
    await expect(preview).toContainText('Changed');
    await expect(page.getByRole('alert')).toHaveCount(0);
    await page.getByLabel('View', { exact: true }).selectOption('code');
    await expect(preview).toHaveCount(0);
    await page.getByLabel('View', { exact: true }).selectOption('preview');
    await expect(preview.locator('svg')).toBeVisible();
    await page.getByRole('button', { name: 'Expand', exact: true }).click();
    await expect(page.locator('.expanded')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('.expanded')).toHaveCount(0);
    await page.locator('pre[data-code-block]').evaluate(el => el.remove());
    await expect(page.locator('.diagram')).toHaveCount(0);
  } finally { await context.close(); await rm(profile, { recursive: true, force: true }); }
});
