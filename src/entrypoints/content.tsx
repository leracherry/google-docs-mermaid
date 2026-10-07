import { defineContentScript } from 'wxt/utils/define-content-script';
import { browser } from 'wxt/browser';
import { createRoot } from 'react-dom/client';
import { useEffect, useState } from 'react';
import { GoogleDocsAdapter } from '../docs/google-docs-adapter';
import type { CodeBlock } from '../docs/adapter';
import { DiagramBlock } from '../components/DiagramBlock';
import { defaults, documentKey, readPreferences, type Preferences } from '../state/preferences';
import styles from '../styles/extension.css?inline';
import selectStyles from '../styles/select.css?inline';
import { designTokenCss } from '../styles/design-tokens';

export function Overlay() {
  const [blocks, setBlocks] = useState<CodeBlock[]>([]);
  const [preferences, setPreferences] = useState<Preferences>(defaults);
  const [enabled, setEnabled] = useState(false);
  const [dark, setDark] = useState(matchMedia('(prefers-color-scheme: dark)').matches);
  useEffect(() => {
    const key = documentKey(location.href);
    let stopped = false;
    let revision = 0;
    const refresh = async () => {
      const request = ++revision;
      try {
        const [prefs, doc] = await Promise.all([readPreferences(), browser.storage.local.get(key)]);
        if (!stopped && request === revision) { setPreferences(prefs); setEnabled(doc[key] !== false); }
      } catch {
        if (!stopped && request === revision) setEnabled(false);
      }
    };
    void refresh();
    const changed = () => { void refresh(); };
    browser.storage.onChanged.addListener(changed);
    const media = matchMedia('(prefers-color-scheme: dark)');
    const themeChanged = () => setDark(media.matches);
    media.addEventListener('change', themeChanged);
    const stop = new GoogleDocsAdapter().observeBlocks(setBlocks);
    return () => { stopped = true; stop(); browser.storage.onChanged.removeListener(changed); media.removeEventListener('change', themeChanged); };
  }, []);
  if (!enabled || !preferences.enabled) return null;
  return <>{blocks.map(block => <DiagramBlock key={block.id} block={block} preferences={preferences} dark={dark} />)}</>;
}
export default defineContentScript({
  matches: ['https://docs.google.com/document/*'],
  main(ctx) {
    const host = document.createElement('google-docs-mermaid');
    host.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:2147483000';
    const shadow = host.attachShadow({ mode: 'open' });
    const style = document.createElement('style'); style.textContent = designTokenCss + styles + selectStyles; shadow.append(style);
    const container = document.createElement('div'); shadow.append(container);
    document.body.append(host);
    const root = createRoot(container); root.render(<Overlay />);
    ctx.onInvalidated(() => { root.unmount(); host.remove(); });
  },
});
