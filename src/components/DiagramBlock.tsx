import { useEffect, useState } from 'react';
import type { CodeBlock } from '../docs/adapter';
import { detectCandidate } from '../mermaid/detector';
import { renderMermaid } from '../mermaid/renderer';
import type { Preferences } from '../state/preferences';
export function DiagramBlock({ block, preferences, dark }: { block: CodeBlock; preferences: Preferences; dark: boolean }) {
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
  useEffect(() => { const escape = (e: KeyboardEvent) => { if (e.key === 'Escape') setExpanded(false); };
    window.addEventListener('keydown', escape); return () => window.removeEventListener('keydown', escape); }, []);
  if (!candidate && mode === 'auto' || !visible || width === 0) return null;
  const copy = async (text: string) => { try { await navigator.clipboard.writeText(text); } catch { setError('Clipboard unavailable'); } };
  return <section className={`diagram ${theme} ${expanded ? 'expanded' : ''}`} aria-label="Mermaid diagram"
    style={expanded ? undefined : { top: view === 'code' || !allowed ? Math.max(0, top - 68) : top, left, width }}>
    <header>
      <select aria-label="Block mode" value={mode} onChange={e => { setMode(e.target.value); setView('code'); }}>
        <option value="auto">Mermaid · Auto</option><option value="mermaid">Mermaid</option><option value="code">Code</option><option value="disabled">Never render</option>
      </select>
      <select aria-label="View" value={view} onChange={e => setView(e.target.value)}>
        <option value="preview">Preview</option><option value="split">Split</option><option value="code">Code</option>
      </select>
      {busy && <span role="status">Rendering…</span>}
      {expanded && <button onClick={() => setExpanded(false)}>Close</button>}
    </header>
    {allowed && view !== 'code' && <>
      <div className="canvas" onWheel={e => { if (e.ctrlKey || e.metaKey) { e.preventDefault(); setZoom(z => Math.max(.25, Math.min(4, z - e.deltaY / 500))); } }}>
        <div style={{ width: `${zoom * 100}%` }} dangerouslySetInnerHTML={{ __html: svg }} />
      </div>
      <nav aria-label="Diagram controls">
        <button onClick={() => setZoom(z => Math.max(.25, z - .25))}>−</button><span>{Math.round(zoom * 100)}%</span>
        <button onClick={() => setZoom(z => Math.min(4, z + .25))}>+</button><button onClick={() => setZoom(1)}>Fit</button>
        <button onClick={() => setExpanded(true)}>Expand</button><button onClick={() => void copy(source ?? block.source)}>Copy Mermaid</button>
        <button disabled={!svg} onClick={() => void copy(svg)}>Copy SVG</button>
      </nav>
    </>}
    {error && <small role="alert">⚠ {error}</small>}
    {view === 'split' && <pre>{block.source}</pre>}
    {(view === 'code' || !allowed) && <small>Source is editable in the document below.</small>}
  </section>;
}
