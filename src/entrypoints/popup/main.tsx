import { createRoot } from 'react-dom/client';
import { useEffect, useState } from 'react';
import { browser } from 'wxt/browser';
import { defaults, readPreferences, documentKey, type Preferences } from '../../state/preferences';
import '../../styles/popup.css';
import { designTokenCss } from '../../styles/design-tokens';

function SettingSwitch({ label, description, checked, disabled, onChange }: {
  label: string; description: string; checked: boolean; disabled?: boolean; onChange: (value: boolean) => void;
}) {
  return <label className="setting-row">
    <span className="setting-copy"><span className="setting-title">{label}</span><span className="setting-description">{description}</span></span>
    <span className="switch"><input type="checkbox" role="switch" aria-label={label} checked={checked} disabled={disabled} onChange={e => onChange(e.target.checked)} /><span className="switch-track" /></span>
  </label>;
}
function Popup() {
  const [prefs, setPrefs] = useState(defaults);
  const [key, setKey] = useState<string>();
  const [enabled, setEnabled] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [systemDark, setSystemDark] = useState(matchMedia('(prefers-color-scheme: dark)').matches);
  const theme = prefs.theme === 'auto' ? systemDark ? 'dark' : 'light' : prefs.theme;
  useEffect(() => {
    const media = matchMedia('(prefers-color-scheme: dark)');
    const change = () => setSystemDark(media.matches);
    media.addEventListener('change', change);
    const load = async () => {
      try {
        setPrefs(await readPreferences());
        const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
        if (tab?.url?.startsWith('https://docs.google.com/document/')) {
          const id = documentKey(tab.url); setKey(id);
          const stored = await browser.storage.local.get(id); setEnabled(stored[id] !== false);
        }
        setLoaded(true);
      } catch { setError('Could not load settings. Reopen the extension to try again.'); }
    };
    void load();
    return () => media.removeEventListener('change', change);
  }, []);
  const update = async (next: Preferences) => {
    const previous = prefs;
    setPrefs(next); setSaving(true);
    try { await browser.storage.local.set({ preferences: next }); setError(''); }
    catch { setPrefs(previous); setError('Could not save settings. Try again.'); }
    finally { setSaving(false); }
  };
  const updateDocument = async (next: boolean) => {
    if (!key) return;
    const previous = enabled;
    setEnabled(next); setSaving(true);
    try { await browser.storage.local.set({ [key]: next }); setError(''); }
    catch { setEnabled(previous); setError('Could not save this document setting. Try again.'); }
    finally { setSaving(false); }
  };
  const disabled = !loaded || saving;
  return <main className={`popup ${theme}`} aria-busy={!loaded}>
    <style>{designTokenCss}</style>
    <header className="brand-header">
      <img className="brand-logo" src="/icons/128.png" width="48" height="48" alt="" />
      <div><h1>Mermaid for Google Docs</h1><p className="brand-subtitle">Diagrams, right where you write.</p></div>
    </header>
    <section className="settings-section" aria-label="Diagram preferences">
      <h2>Preferences</h2>
      <SettingSwitch label="Diagram rendering" description="Show Mermaid previews in your documents" checked={prefs.enabled} disabled={disabled} onChange={value => void update({ ...prefs, enabled: value })} />
      <SettingSwitch label="Auto-detect Mermaid" description="Recognize diagrams in unlabeled code blocks" checked={prefs.autoDetect} disabled={disabled} onChange={value => void update({ ...prefs, autoDetect: value })} />
      <label className="setting-row"><span className="setting-copy"><span className="setting-title">Theme</span><span className="setting-description">Auto follows your device appearance</span></span>
        <select aria-label="Theme" value={prefs.theme} disabled={disabled} onChange={e => void update({ ...prefs, theme: e.target.value as Preferences['theme'] })}><option value="auto">Auto</option><option value="light">Light</option><option value="dark">Dark</option></select>
      </label>
    </section>
    {key && <section className="settings-section" aria-label="Current document"><h2>This document</h2>
      <SettingSwitch label="Enable for this document" description="Remember this choice on this device" checked={enabled} disabled={disabled} onChange={value => void updateDocument(value)} />
    </section>}
    {error && <p className="error-message" role="alert">{error}</p>}
    <footer className="popup-footer">
      <p>Rendered on your device. No uploads or account required.</p>
      <div className="footer-links"><a href="https://github.com/leracherry/google-docs-mermaid#readme" target="_blank" rel="noreferrer">Help &amp; setup</a><a href="https://github.com/leracherry/google-docs-mermaid/blob/main/docs/privacy.md" target="_blank" rel="noreferrer">Privacy</a></div>
    </footer>
  </main>;
}
createRoot(document.getElementById('root')!).render(<Popup />);
