import { describe, expect, it, vi } from 'vitest';
const get = vi.hoisted(() => vi.fn());
vi.mock('wxt/browser', () => ({ browser: { storage: { local: { get } } } }));
import { defaults, documentKey, readPreferences } from '../../src/state/preferences';
describe('preferences', () => {
  it.each([undefined, null, 'bad', 2, []])('handles missing or malformed stored preferences: %s', async value => {
    get.mockResolvedValue({ preferences: value }); expect(await readPreferences()).toEqual(defaults);
  });
  it('accepts valid values and validates each field independently', async () => {
    get.mockResolvedValue({ preferences: { enabled: false, autoDetect: false, theme: 'dark' } });
    expect(await readPreferences()).toEqual({ enabled: false, autoDetect: false, theme: 'dark' });
    get.mockResolvedValue({ preferences: { enabled: 'false', autoDetect: false, theme: 'broken' } });
    expect(await readPreferences()).toEqual({ enabled: true, autoDetect: false, theme: 'auto' });
  });
  it('shares a document setting across edit, preview, account and query variants', () => {
    for (const url of ['https://docs.google.com/document/d/abc/edit?tab=x', 'https://docs.google.com/document/d/abc/preview', 'https://docs.google.com/document/u/1/d/abc/edit']) expect(documentKey(url)).toBe('document:abc');
    expect(documentKey('https://docs.google.com/document/d/xyz/edit')).not.toBe('document:abc');
  });
});
