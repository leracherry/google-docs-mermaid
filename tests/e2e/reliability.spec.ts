import { test as base, expect, chromium, type BrowserContext, type Page } from '@playwright/test';
import path from 'node:path';
import os from 'node:os';
import { mkdtemp, rm } from 'node:fs/promises';
const test = base.extend<{ extensionContext: BrowserContext; fixturePage: Page }>({
  extensionContext: async ({}, use) => {
    const profile = await mkdtemp(path.join(os.tmpdir(), 'gdm-reliability-'));
    const extension = path.resolve('.output/chrome-mv3');
    const context = await chromium.launchPersistentContext(profile, { channel: 'chromium', headless: true,
      args: [`--disable-extensions-except=${extension}`, `--load-extension=${extension}`] });
    try { await use(context); } finally { await context.close(); await rm(profile, { recursive: true, force: true }); }
  },
  fixturePage: async ({ extensionContext }, use) => {
    await extensionContext.route('https://docs.google.com/**', route => route.fulfill({ contentType: 'text/html', body: '<!doctype html><html><body style="margin:0"><pre id="source" data-code-block style="margin:80px;width:600px;min-height:100px">graph LR\nA[Source] --> B[Preview]</pre></body></html>' }));
    const page = await extensionContext.newPage();
    await page.goto('https://docs.google.com/document/d/reliability/edit');
    await expect(page.locator('.canvas svg')).toBeVisible({ timeout: 20000 });
    await use(page);
  },
});

test('cached copies have independent markers, real zoom, split view and working clipboard', async ({ fixturePage: page, extensionContext }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await extensionContext.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.locator('#source').evaluate(el => { const copy = el.cloneNode(true) as HTMLElement; copy.id = 'copy'; copy.style.marginTop = '300px'; el.after(copy); });
  await expect(page.locator('.canvas svg')).toHaveCount(2);
  const ids = await page.locator('.canvas [id]').evaluateAll(nodes => nodes.map(n => n.id));
  expect(new Set(ids).size).toBe(ids.length);
  const diagram = page.locator('.diagram').first();
  const prevented = await diagram.locator('.canvas').evaluate(el => {
    const event = new WheelEvent('wheel', { ctrlKey: true, deltaY: 0, cancelable: true, bubbles: true });
    el.dispatchEvent(event); return event.defaultPrevented;
  });
  expect(prevented).toBe(true);
  const svg = diagram.locator('.canvas svg'); const before = (await svg.boundingBox())!.width;
  await diagram.getByRole('button', { name: 'Zoom in', exact: true }).click();
  expect((await svg.boundingBox())!.width).toBeGreaterThan(before * 1.2);
  await diagram.getByRole('button', { name: 'Fit', exact: true }).click();
  expect((await svg.boundingBox())!.width).toBeCloseTo(before, 0);
  await diagram.getByLabel('View', { exact: true }).selectOption('split');
  await expect(diagram.locator('pre')).toHaveText('graph LR\nA[Source] --> B[Preview]');
  await diagram.getByRole('button', { name: 'Copy Mermaid', exact: true }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('graph LR\nA[Source] --> B[Preview]');
  await diagram.getByRole('button', { name: 'Copy SVG', exact: true }).click();
  const copied = await page.evaluate(() => navigator.clipboard.readText()); expect(copied).toContain('<svg'); expect(copied).toContain('gdm-instance-');
  await page.locator('#source').evaluate(el => el.remove());
  await expect(page.locator('.canvas svg')).toHaveCount(1);
  const brokenReferences = await page.locator('.canvas svg').evaluate(svg => [...svg.querySelectorAll('[marker-end]')].filter(el => {
    const id = el.getAttribute('marker-end')?.match(/#([^)'"\s]+)/)?.[1]; return id && !svg.querySelector(`[id="${id}"]`);
  }).length);
  expect(brokenReferences).toBe(0); expect(errors).toEqual([]);
});

test('detects dynamically marked blocks, preserves rendered line breaks, hides and restores blocks', async ({ fixturePage: page }) => {
  await page.locator('#source').evaluate(el => el.remove());
  await page.evaluate(() => { const el = document.createElement('div'); el.id = 'dynamic'; el.style.cssText = 'margin:80px;width:600px'; el.innerHTML = 'sequenceDiagram<br>Alice->>Bob: Hello'; document.body.append(el); });
  await expect(page.locator('.diagram')).toHaveCount(0);
  await page.locator('#dynamic').evaluate(el => el.setAttribute('role', 'code'));
  await expect(page.locator('.canvas')).toContainText('Hello');
  await page.locator('#dynamic').evaluate(el => { (el as HTMLElement).hidden = true; });
  await expect(page.locator('.diagram')).toHaveCount(0);
  await page.locator('#dynamic').evaluate(el => { (el as HTMLElement).hidden = false; });
  await expect(page.locator('.canvas')).toContainText('Hello');
  await page.locator('#dynamic').evaluate(el => el.setAttribute('class', 'language-python'));
  await expect(page.locator('.diagram')).toHaveCount(0);
  await page.locator('#dynamic').evaluate(el => el.setAttribute('data-language', 'mermaid'));
  await expect(page.locator('.canvas')).toContainText('Hello');
});

test('settings disable only the chosen document and persist across reloads', async ({ fixturePage: page, extensionContext }) => {
  const origin = (await page.locator('.block-logo').getAttribute('src'))!.replace(/\/icons\/32\.png$/, '');
  const popup = await extensionContext.newPage(); await popup.goto(`${origin}/popup.html`);
  await expect(popup.getByRole('switch', { name: 'Diagram rendering' })).toBeEnabled();
  // Storage calls execute in the extension origin; no extra test permission is added.
  await popup.evaluate(async () => { await (globalThis as any).chrome.storage.local.set({ 'document:reliability': false }); });
  await expect(page.locator('.diagram')).toHaveCount(0);
  await page.reload(); await expect(page.locator('google-docs-mermaid')).toHaveCount(1); await expect(page.locator('.diagram')).toHaveCount(0);
  const other = await extensionContext.newPage(); await other.goto('https://docs.google.com/document/d/other/edit');
  await expect(other.locator('.canvas svg')).toBeVisible();
  await popup.evaluate(async () => { await (globalThis as any).chrome.storage.local.set({ 'document:reliability': true }); });
  await expect(page.locator('.canvas svg')).toBeVisible();
  await popup.getByRole('switch', { name: 'Auto-detect Mermaid' }).uncheck();
  await expect(page.locator('.canvas')).toHaveCount(0);
  await page.getByLabel('Block mode', { exact: true }).selectOption('mermaid');
  await expect(page.locator('.canvas svg')).toBeVisible();
  await page.getByLabel('Block mode', { exact: true }).selectOption('disabled');
  await expect(page.locator('.canvas')).toHaveCount(0);
  await page.getByLabel('Block mode', { exact: true }).selectOption('auto');
  await expect(page.locator('.canvas')).toHaveCount(0);
  await page.locator('#source').evaluate(el => el.setAttribute('data-language', 'mermaid'));
  await expect(page.locator('.canvas svg')).toBeVisible();
  await popup.getByLabel('Theme', { exact: true }).selectOption('auto'); await page.emulateMedia({ colorScheme: 'dark' });
  await expect(page.locator('.diagram.dark')).toBeVisible();
  await popup.reload(); await expect(popup.getByRole('switch', { name: 'Auto-detect Mermaid' })).not.toBeChecked();
});

test('rejects oversized input and renders hostile labels without active content or network requests', async ({ fixturePage: page, extensionContext }) => {
  const requests: string[] = [];
  await extensionContext.route('https://example.invalid/**', route => { requests.push(route.request().url()); return route.abort(); });
  await page.locator('#source').evaluate(el => { el.setAttribute('data-language', 'mermaid'); el.textContent = 'graph LR\nA[Oversized]\n%%' + 'x'.repeat(50000); });
  await expect(page.getByRole('alert')).toContainText('50,000');
  await expect(page.locator('.canvas')).toContainText('Source');
  const cases = [
    'graph LR\nA["<b onclick=alert(1)>Safe</b>"]-->B[Safe]',
    'graph LR\nA[Safe]-->B[Link]\nclick A "javascript:alert(1)"',
    '%%{init: {"securityLevel":"loose","themeCSS":"rect { fill: red; }","themeVariables":{"fontFamily":"remote"}}}%%\ngraph LR\nA[Safe]-->B[Preview]',
  ];
  for (const source of cases) {
    const previous = await page.locator('.canvas svg').getAttribute('id');
    await page.locator('#source').evaluate((el, text) => { el.textContent = text; }, source);
    await expect(page.locator('.canvas svg')).not.toHaveAttribute('id', previous!);
    await expect(page.getByRole('alert')).toHaveCount(0);
    expect(await page.locator('.canvas svg').locator('script, foreignObject, image, a, [onload], [onclick], [href]').count()).toBe(0);
  }
  expect(requests).toEqual([]);
});

for (const count of [1, 10, 50, 100]) {
  test(`${count} blocks render near the viewport and recover after scrolling, moves, deletion and undo`, async ({ fixturePage: page }, testInfo) => {
    const start = Date.now();
    await page.locator('#source').evaluate((el, total) => {
      for (let i = 1; i < total; i++) { const copy = el.cloneNode(true) as HTMLElement; copy.id = `source-${i}`; el.parentElement!.append(copy); }
    }, count);
    await expect(page.locator('body > pre')).toHaveCount(count);
    expect(await page.locator('.diagram').count()).toBeLessThanOrEqual(6);
    await page.locator('body > pre').last().scrollIntoViewIfNeeded();
    await expect(page.locator('.canvas svg').last()).toBeVisible();
    await page.locator('body > pre').last().evaluate(el => { el.textContent = 'graph LR\nA-->Scrolled'; });
    await expect(page.locator('.canvas').last()).toContainText('Scrolled');
    await page.locator('body > pre').last().evaluate(el => { document.body.prepend(el); });
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(page.locator('.canvas').first()).toContainText('Scrolled');
    const removed = await page.locator('body > pre').first().evaluateHandle(el => { el.remove(); return el; });
    await expect(page.locator('.canvas').filter({ hasText: 'Scrolled' })).toHaveCount(0);
    await removed.evaluate(el => document.body.prepend(el));
    await expect(page.locator('.canvas').first()).toContainText('Scrolled');
    await removed.dispose();
    await testInfo.attach('fixture-timing', { body: JSON.stringify({ blocks: count, elapsedMs: Date.now() - start }), contentType: 'application/json' });
  });
}

test('blocks image and CSS resource loading before Mermaid creates temporary DOM', async ({ fixturePage: page, extensionContext }) => {
  const requests: string[] = [];
  await extensionContext.route('https://example.invalid/**', route => { requests.push(route.request().url()); return route.fulfill({ contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"/>' }); });
  for (const source of [
    'flowchart LR\nA@{ img: "https://example.invalid/image", label: "Image", h: 80 }',
    'flowchart LR\nA[Unsafe]\nstyle A fill:url(https://example.invalid/paint)',
  ]) {
    await page.locator('#source').evaluate((el, text) => { el.setAttribute('data-language', 'mermaid'); el.textContent = text; }, source);
    await expect(page.getByRole('alert')).toContainText('External resources');
    const previous = await page.locator('.canvas svg').getAttribute('id');
    await page.locator('#source').evaluate(el => { el.textContent = 'graph LR\nA-->Safe'; });
    await expect(page.getByRole('alert')).toHaveCount(0);
    await expect(page.locator('.canvas svg')).not.toHaveAttribute('id', previous!);
  }
  expect(requests).toEqual([]);
});
