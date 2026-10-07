import DOMPurify from 'dompurify';
import { mermaidTheme, styleDiagramSvg } from './themes';
export type Theme = 'light' | 'dark';
export type RenderResult = { svg: string; error?: never } | { error: string; svg?: never };
const cache = new Map<string, string>();
let queue: Promise<unknown> = Promise.resolve();
let sequence = 0;
let instance = 0;

// Cached SVGs must never share IDs: markers, labels and clip paths resolve within
// the entire shadow root, not just the SVG containing their reference.
function instantiate(svg: string): string {
  const doc = new DOMParser().parseFromString(svg, 'image/svg+xml');
  const prefix = `gdm-instance-${++instance}-`;
  const ids = new Map<string, string>();
  for (const node of doc.querySelectorAll('[id]')) ids.set(node.id, `${prefix}${ids.size}`);
  const replace = (value: string) => value.replace(/#([\w-]+)/g, (match, id: string) => ids.has(id) ? `#${ids.get(id)}` : match);
  for (const node of doc.querySelectorAll('*')) {
    for (const attr of [...node.attributes]) {
      if (attr.name === 'id') node.setAttribute('id', ids.get(attr.value)!);
      else if (attr.name === 'aria-labelledby' || attr.name === 'aria-describedby') {
        node.setAttribute(attr.name, attr.value.split(/\s+/).map(id => ids.get(id) ?? id).join(' '));
      } else node.setAttribute(attr.name, replace(attr.value));
    }
    if (node.localName === 'style') node.textContent = replace(node.textContent ?? '');
  }
  return new XMLSerializer().serializeToString(doc.documentElement);
}

export function renderMermaid(source: string, theme: Theme, signal?: AbortSignal): Promise<RenderResult> {
  if (source.length > 50000) return Promise.resolve({ error: 'Diagram exceeds the 50,000-character limit' });
  // Mermaid measures diagrams in live DOM before returning SVG. Sanitizing the
  // result alone is too late to stop image/CSS requests during measurement.
  const resourceSyntax = source.replace(/\\([\da-f]{1,6})\s?|\\([^\r\n])/gi,
    (_match, hex: string | undefined, char: string) => hex ? String.fromCodePoint(Math.min(parseInt(hex, 16), 0x10ffff)) : char)
    .replace(/\/\*[\s\S]*?\*\//g, '');
  if (/(?:\burl\s*\(|@import\b|["']?\bimg["']?\s*:|<\s*(?:img|image)\b)/i.test(resourceSyntax)) {
    return Promise.resolve({ error: 'External resources and image nodes are not supported' });
  }
  const key = JSON.stringify([source, theme]);
  const task = queue.then(async (): Promise<RenderResult> => {
    if (signal?.aborted) return { error: 'Render cancelled' };
    try {
      const cached = cache.get(key);
      if (cached) return { svg: instantiate(cached) };
      const mermaid = (await import('mermaid')).default;
      mermaid.initialize({ startOnLoad: false, securityLevel: 'strict', theme: 'base',
        look: 'classic', themeVariables: mermaidTheme(theme),
        suppressErrorRendering: true, maxTextSize: 50000, htmlLabels: false,
        secure: ['securityLevel', 'startOnLoad', 'maxTextSize', 'maxEdges', 'suppressErrorRendering', 'secure', 'htmlLabels', 'theme', 'themeVariables', 'themeCSS', 'fontFamily', 'look'],
        flowchart: { htmlLabels: false } });
      if (!await mermaid.parse(source, { suppressErrors: true })) return { error: 'Mermaid syntax error' };
      const { svg } = await mermaid.render(`gdm-${++sequence}`, source);
      const safe = DOMPurify.sanitize(styleDiagramSvg(svg), { USE_PROFILES: { svg: true, svgFilters: true }, FORBID_TAGS: ['foreignObject', 'a', 'image'], FORBID_ATTR: ['href', 'xlink:href'] });
      cache.set(key, safe);
      if (cache.size > 100) cache.delete(cache.keys().next().value!);
      return { svg: instantiate(safe) };
    } catch { return { error: 'Mermaid syntax error' }; }
  });
  queue = task.catch(() => undefined);
  return task;
}
