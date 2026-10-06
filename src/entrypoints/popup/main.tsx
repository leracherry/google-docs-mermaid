import { createRoot } from 'react-dom/client';
import { useEffect, useState } from 'react';
import { browser } from 'wxt/browser';
import { defaults, readPreferences, documentKey, type Preferences } from '../../state/preferences';
function Popup() {
  const [prefs, setPrefs] = useState(defaults);
  const [key, setKey] = useState<string>();
  const [enabled, setEnabled] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => { void readPreferences().then(setPrefs); void browser.tabs.query({ active: true, currentWindow: true }).then(async ([tab]) => {
    if (!tab?.url?.startsWith('https://docs.google.com/document/')) return;
    const id = documentKey(tab.url); setKey(id); const stored = await browser.storage.local.get(id); setEnabled(stored[id] !== false);
  }); }, []);
  const update = async (next: Preferences) => { try { await browser.storage.local.set({ preferences: next }); setPrefs(next); } catch { setError('Unable to save settings'); } };
  return <main style={{ width: 260, padding: 14, fontFamily: 'Arial', color: '#202124' }}>
    <h3>Mermaid for Google Docs</h3>
    <p><label><input type="checkbox" checked={prefs.enabled} onChange={e => void update({ ...prefs, enabled: e.target.checked })} /> Diagram rendering</label></p>
    <p><label><input type="checkbox" checked={prefs.autoDetect} onChange={e => void update({ ...prefs, autoDetect: e.target.checked })} /> Auto-detect Mermaid</label></p>
    <p><label>Theme <select value={prefs.theme} onChange={e => void update({ ...prefs, theme: e.target.value as Preferences['theme'] })}><option value="auto">Auto</option><option value="light">Light</option><option value="dark">Dark</option></select></label></p>
    {key && <p><label><input type="checkbox" checked={enabled} onChange={async e => { const next = e.target.checked; await browser.storage.local.set({ [key]: next }); setEnabled(next); }} /> Enable for this document</label></p>}
    <small>Rendered locally. Canvas editor support is experimental.</small>{error && <p role="alert">{error}</p>}
  </main>;
}
createRoot(document.getElementById('root')!).render(<Popup />);
