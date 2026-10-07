import { useEffect, useRef, useState } from 'react';
import { browser } from 'wxt/browser';
import { Icon } from './Icon';
import type { CodeBlock } from '../docs/adapter';
import { detectCandidate } from '../mermaid/detector';
import { renderMermaid } from '../mermaid/renderer';
import type { Preferences } from '../state/preferences';
export function DiagramBlock({ block, preferences, dark }: { block: CodeBlock; preferences: Preferences; dark: boolean }) {
  const sectionRef = useRef<HTMLElement>(null);
  const [view, setView] = useState('preview');
  const [mode, setMode] = useState('auto');
  const [svg, setSvg] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [expanded, setExpanded] = useState(false);
  const candidate = detectCandidate(block.source, block.language);
  const source = mode === 'mermaid' ? candidate?.source ?? block.source : candidate?.source;
  const { top, left, width, bottom } = block.bounds;
  const visible = bottom > -200 && top < window.innerHeight + 200;
  const theme = preferences.theme === 'auto' ? dark ? 'dark' : 'light' : preferences.theme;
  const allowed = mode !== 'disabled' && mode !== 'code' && (mode === 'mermaid' || candidate?.explicit || preferences.autoDetect);
  useEffect(() => {
    if (!visible || !source || !allowed) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      setBusy(true);
      const result = await renderMermaid(source, theme);
      if (cancelled) return;
      setBusy(false);
      if (result.svg) { setSvg(result.svg); setError(''); } else setError(result.error ?? 'Unable to render');
    }, 300);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [source, theme, visible, allowed]);
  useEffect(() => {
    if (!expanded) return;
    const previous = document.activeElement?.shadowRoot?.activeElement ?? document.activeElement;
    sectionRef.current?.querySelector<HTMLElement>('button')?.focus();
    const trap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const controls = sectionRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled), select');
      if (!controls?.length) return;
      const first = controls[0]!; const last = controls[controls.length - 1]!;
      const active = sectionRef.current?.getRootNode() as ShadowRoot;
      if (e.shiftKey && active.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && active.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    window.addEventListener('keydown', trap);
    return () => { window.removeEventListener('keydown', trap); if (previous instanceof HTMLElement) previous.focus(); };
  }, [expanded]);
  useEffect(() => { const escape = (e: KeyboardEvent) => { if (e.key === 'Escape') setExpanded(false); };
    window.addEventListener('keydown', escape); return () => window.removeEventListener('keydown', escape); }, []);
  if (!candidate && mode === 'auto' || (!visible && !expanded) || width === 0) return null;
  const copy = async (text: string) => { try { await navigator.clipboard.writeText(text); } catch { setError('Clipboard unavailable'); } };
  return <>{expanded && <div className="viewer-backdrop" aria-hidden="true" onClick={() => setExpanded(false)} />}<section ref={sectionRef} role={expanded ? 'dialog' : undefined} aria-modal={expanded ? true : undefined} className={`diagram ${theme} ${expanded ? 'expanded' : ''}`} aria-label="Mermaid diagram"
    style={expanded ? undefined : { top: view === 'code' || !allowed ? Math.max(0, top - 68) : top, left, width }}>
    <header>
      <img className="block-logo" src={browser.runtime.getURL('/icons/32.png')} alt="" />
      <select aria-label="Block mode" value={mode} onChange={e => { setMode(e.target.value); setView('code'); }}>
        <option value="auto">Mermaid · Auto</option><option value="mermaid">Mermaid</option><option value="code">Code</option><option value="disabled">Never render</option>
      </select>
      <select className="view-select" aria-label="View" value={view} onChange={e => setView(e.target.value)}>
        <option value="preview">Preview</option><option value="split">Split</option><option value="code">Code</option>
      </select>
      {busy && <span className="render-status" role="status">Rendering…</span>}
      {expanded && <button className="icon-button" aria-label="Close expanded viewer" title="Close" onClick={() => setExpanded(false)}><Icon name="close" /></button>}
    </header>
    {allowed && view !== 'code' && <>
      <div className="canvas" onWheel={e => { if (e.ctrlKey || e.metaKey) { e.preventDefault(); setZoom(z => Math.max(.25, Math.min(4, z - e.deltaY / 500))); } }}>
        <div style={{ width: `${zoom * 100}%` }} dangerouslySetInnerHTML={{ __html: svg }} />
      </div>
      <nav aria-label="Diagram controls">
        <button className="icon-button" aria-label="Zoom out" title="Zoom out" onClick={() => setZoom(z => Math.max(.25, z - .25))}><Icon name="minus" /></button><span className="zoom-label">{Math.round(zoom * 100)}%</span>
        <button className="icon-button" aria-label="Zoom in" title="Zoom in" onClick={() => setZoom(z => Math.min(4, z + .25))}><Icon name="plus" /></button><button onClick={() => setZoom(1)}><Icon name="fit" />Fit</button>
        <button onClick={() => setExpanded(true)}><Icon name="expand" />Expand</button><span className="toolbar-spacer" /><button onClick={() => void copy(source ?? block.source)}><Icon name="copy" />Copy Mermaid</button>
        <button disabled={!svg} onClick={() => void copy(svg)}>Copy SVG</button>
      </nav>
    </>}
    {error && <small className="error-badge" role="alert"><Icon name="warning" />{error}</small>}
    {view === 'split' && <pre>{block.source}</pre>}
    {(view === 'code' || !allowed) && <small className="source-hint">Source is editable in the document below.</small>}
  </section></>;
}
