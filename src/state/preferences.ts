import { browser } from 'wxt/browser';
export interface Preferences { enabled: boolean; autoDetect: boolean; theme: 'auto' | 'light' | 'dark' }
export const defaults: Preferences = { enabled: true, autoDetect: true, theme: 'auto' };
export const documentKey = (url: string) => {
  const parsed = new URL(url);
  return `document:${parsed.pathname.match(/\/d\/([^/]+)/)?.[1] ?? parsed.pathname}`;
};
export async function readPreferences(): Promise<Preferences> {
  const stored = await browser.storage.local.get('preferences');
  const value = stored.preferences;
  if (!value || typeof value !== 'object') return defaults;
  const prefs = value as Partial<Preferences>;
  return {
    enabled: typeof prefs.enabled === 'boolean' ? prefs.enabled : defaults.enabled,
    autoDetect: typeof prefs.autoDetect === 'boolean' ? prefs.autoDetect : defaults.autoDetect,
    theme: prefs.theme === 'light' || prefs.theme === 'dark' ? prefs.theme : 'auto',
  };
}
