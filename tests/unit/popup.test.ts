import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
const api = vi.hoisted(() => ({ get: vi.fn(), set: vi.fn(), query: vi.fn() }));
vi.mock('wxt/browser', () => ({ browser: { storage: { local: { get: api.get, set: api.set } }, tabs: { query: api.query } } }));
import { Popup } from '../../src/entrypoints/popup/Popup';
let container: HTMLDivElement, root: Root;
beforeEach(() => {
  vi.clearAllMocks(); vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  vi.stubGlobal('matchMedia', () => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
  api.get.mockResolvedValue({}); api.set.mockResolvedValue(undefined); api.query.mockResolvedValue([{ url: 'https://docs.google.com/document/d/test/edit' }]);
  container = document.createElement('div'); document.body.append(container); root = createRoot(container);
});
afterEach(async () => { await act(async () => root.unmount()); container.remove(); vi.unstubAllGlobals(); });
const mount = async () => { await act(async () => root.render(createElement(Popup))); };
const checkbox = (label: string) => container.querySelector<HTMLInputElement>(`input[aria-label="${label}"]`)!;
describe('popup persistence and failure handling', () => {
  it('loads and saves per-document preferences with the correct document key', async () => {
    api.get.mockImplementation(async (key: string) => key === 'document:test' ? { [key]: false } : {});
    await mount(); const toggle = checkbox('Enable for this document'); expect(toggle.checked).toBe(false);
    await act(async () => toggle.click()); expect(api.set).toHaveBeenCalledWith({ 'document:test': true }); expect(toggle.checked).toBe(true);
  });
  it('rolls back a failed save and enables retry', async () => {
    await mount(); api.set.mockRejectedValueOnce(new Error('storage unavailable'));
    const toggle = checkbox('Diagram rendering'); await act(async () => toggle.click());
    expect(toggle.checked).toBe(true); expect(toggle.disabled).toBe(false); expect(container.querySelector('[role="alert"]')?.textContent).toContain('Could not save settings');
    await act(async () => toggle.click()); expect(toggle.checked).toBe(false); expect(container.querySelector('[role="alert"]')).toBeNull();
  });
  it('rolls back a failed document setting save', async () => {
    await mount(); api.set.mockRejectedValueOnce(new Error('storage unavailable'));
    const toggle = checkbox('Enable for this document'); await act(async () => toggle.click());
    expect(toggle.checked).toBe(true); expect(container.querySelector('[role="alert"]')?.textContent).toContain('Could not save this document');
  });
  it('shows a load error without enabling controls', async () => {
    api.get.mockRejectedValueOnce(new Error('storage unavailable')); await mount();
    expect(checkbox('Diagram rendering').disabled).toBe(true); expect(container.querySelector('[role="alert"]')?.textContent).toContain('Could not load settings');
  });
  it.each([{ tabs: [] }, { tabs: [{ url: 'https://example.com' }] }, { tabs: [{}] }])('omits document controls without a Docs URL (%j)', async ({ tabs }) => {
    api.query.mockResolvedValue(tabs); await mount(); expect(checkbox('Enable for this document')).toBeNull(); expect(checkbox('Diagram rendering').disabled).toBe(false);
  });
});
