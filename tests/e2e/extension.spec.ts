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
    await context.route('https://docs.google.com/**', route => route.fulfill({ contentType: 'text/html', body: '<!doctype html><html><body><pre data-code-block style="margin:80px;width:600px;min-height:100px">graph LR\nA[Write Mermaid] --> B[See your diagram]</pre></body></html>' }));
    const page = await context.newPage();
    await page.goto('https://docs.google.com/document/d/fixture/edit');
    const preview = page.locator('google-docs-mermaid').locator('.canvas');
    await expect(preview.locator('svg')).toBeVisible({ timeout: 30000 });
    await expect(preview.locator('svg text')).toContainText([/Write\s*Mermaid/, /See your\s*diagram/]);
    const logo = page.locator('google-docs-mermaid').locator('.block-logo');
    await expect(logo).toBeVisible();
    expect(await logo.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBe(32);
    if (process.env.UPDATE_SCREENSHOTS) await page.locator('.diagram').screenshot({ path: 'docs/assets/diagram-light.png' });
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
    await expect(page.getByRole('dialog', { name: 'Mermaid diagram' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Close expanded viewer' })).toBeFocused();
    await page.getByLabel('Block mode', { exact: true }).focus();
    await page.keyboard.press('Shift+Tab');
    await expect(page.getByRole('button', { name: 'Copy SVG', exact: true })).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.getByLabel('Block mode', { exact: true })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(page.locator('.expanded')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Expand', exact: true })).toBeFocused();
    const origin = (await logo.getAttribute('src'))!.replace(/\/icons\/32\.png$/, '');
    const popup = await context.newPage();
    await popup.goto(`${origin}/popup.html`);
    await expect(popup.getByRole('switch', { name: 'Diagram rendering' })).toBeEnabled();
    const popupLogo = popup.locator('.brand-logo');
    expect(await popupLogo.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBe(128);
    await popup.getByLabel('Theme', { exact: true }).selectOption('light');
    await expect(popup.locator('.popup.light')).toBeVisible();
    if (process.env.UPDATE_SCREENSHOTS) await popup.locator('.popup').screenshot({ path: 'docs/assets/popup-light.png' });
    const lightSvgId = await preview.locator('svg').getAttribute('id');
    await popup.getByLabel('Theme', { exact: true }).selectOption('dark');
    await expect(popup.locator('.popup.dark')).toBeVisible();
    await expect(page.locator('.diagram.dark')).toBeVisible();
    await expect(preview.locator('svg')).not.toHaveAttribute('id', lightSvgId!);
    if (process.env.UPDATE_SCREENSHOTS) {
      await popup.locator('.popup').screenshot({ path: 'docs/assets/popup-dark.png' });
      await page.locator('.diagram').screenshot({ path: 'docs/assets/diagram-dark.png' });
    }
    await popup.getByRole('switch', { name: 'Diagram rendering' }).uncheck();
    await expect(page.locator('.diagram')).toHaveCount(0);
    await popup.getByRole('switch', { name: 'Diagram rendering' }).check();
    await expect(preview.locator('svg')).toBeVisible();
    await popup.reload();
    await expect(popup.getByLabel('Theme', { exact: true })).toHaveValue('dark');
    await popup.close();
    await page.locator('pre[data-code-block]').evaluate(el => el.remove());
    await expect(page.locator('.diagram')).toHaveCount(0);
  } finally { await context.close(); await rm(profile, { recursive: true, force: true }); }
});

test('Workspace diagram styling preserves notation across diagram families', async () => {
  const profile = await mkdtemp(path.join(os.tmpdir(), 'gdm-style-'));
  const extension = path.resolve('.output/chrome-mv3');
  const context = await chromium.launchPersistentContext(profile, {
    channel: 'chromium', headless: true,
    args: [`--disable-extensions-except=${extension}`, `--load-extension=${extension}`],
  });
  try {
    await context.route('https://docs.google.com/**', route => route.fulfill({ contentType: 'text/html', body: '<!doctype html><html><body><pre data-code-block style="margin:40px;width:650px;min-height:100px">graph LR\nsubgraph Group\nA[Source]\nend\nA -.-> B{Valid?}\nB --> C([Preview])</pre></body></html>' }));
    const page = await context.newPage();
    await page.goto('https://docs.google.com/document/d/style-fixture/edit');
    const preview = page.locator('google-docs-mermaid').locator('.canvas');
    await expect(preview.locator('svg')).toBeVisible({ timeout: 15000 });
    const card = preview.locator('.node rect').first();
    await expect(card).toHaveAttribute('rx', '8');
    const appearance = await card.evaluate(el => {
      const style = getComputedStyle(el);
      return { fill: style.fill, stroke: style.stroke, width: style.strokeWidth, filter: style.filter };
    });
    expect(appearance).toEqual({ fill: 'rgb(211, 227, 253)', stroke: 'rgb(116, 119, 117)', width: '1px', filter: 'none' });
    const line = preview.locator('.flowchart-link').first();
    expect(await line.evaluate(el => getComputedStyle(el).strokeWidth)).toBe('1.5px');
    expect(await line.evaluate(el => getComputedStyle(el).strokeDasharray)).not.toBe('none');
    await expect(preview.locator('.node polygon')).toHaveCount(1);
    if (process.env.UPDATE_SCREENSHOTS) await page.locator('.diagram').screenshot({ path: 'docs/assets/diagram-shapes.png' });
    const cases = [
      { source: 'sequenceDiagram\nparticipant Browser\nparticipant Docs\nBrowser->>Docs: Render diagram\nNote over Docs: Local preview', selector: 'rect.actor', label: 'Local preview', screenshot: 'sequence-light' },
      { source: 'classDiagram\nclass Diagram {\n+render()\n}\nclass Source\nSource --> Diagram', selector: '.node', label: 'Diagram', screenshot: 'class-light' },
      { source: 'stateDiagram-v2\nDraft --> Preview: Render\nPreview --> Draft: Edit', selector: '.node', label: 'Draft', screenshot: 'state-light' },
      { source: 'erDiagram\nDOCUMENT ||--o{ DIAGRAM : contains', selector: '.node', label: 'DOCUMENT', screenshot: 'relations-light' },
      { source: 'pie\n"Docs" : 3\n"Diagrams" : 2', selector: 'svg', label: 'Docs', screenshot: 'pie-light' },
      { source: 'gantt\n title Preview pipeline\n dateFormat YYYY-MM-DD\n section Rendering\n Parse :2026-10-06,1d\n Render :2026-10-07,1d', selector: 'svg', label: 'Preview pipeline', screenshot: 'gantt-light' },
    ];
    for (const example of cases) {
      const previousId = await preview.locator('svg').getAttribute('id');
      await page.locator('pre[data-code-block]').evaluate((el, source) => { el.textContent = source; }, example.source);
      await expect(preview.locator('svg')).not.toHaveAttribute('id', previousId!);
      await expect(preview).toContainText(example.label);
      await expect(preview.locator(example.selector).first()).toBeVisible();
      if (example.selector === 'rect.actor') await expect(preview.locator('rect.actor').first()).toHaveAttribute('rx', '8');
      const hasShadow = await preview.locator(example.selector).evaluateAll(elements => elements.some(el => getComputedStyle(el).filter !== 'none'));
      expect(hasShadow).toBe(false);
      if (process.env.UPDATE_SCREENSHOTS) await page.locator('.diagram').screenshot({ path: `docs/assets/${example.screenshot}.png` });
    }
  } finally { await context.close(); await rm(profile, { recursive: true, force: true }); }
});
