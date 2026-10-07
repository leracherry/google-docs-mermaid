import DOMPurify from 'dompurify';
import { mermaidTheme, styleDiagramSvg } from './themes';
export type Theme = 'light' | 'dark';
export type RenderResult = { svg: string; error?: never } | { error: string; svg?: never };
const cache = new Map<string, string>();
let queue: Promise<unknown> = Promise.resolve();
let sequence = 0;
export function renderMermaid(source: string, theme: Theme): Promise<RenderResult> {
  const key = JSON.stringify([source, theme]);
  const cached = cache.get(key);
  if (cached) return Promise.resolve({ svg: cached });
  const task = queue.then(async (): Promise<RenderResult> => {
    try {
      const mermaid = (await import('mermaid')).default;
      mermaid.initialize({ startOnLoad: false, securityLevel: 'strict', theme: 'base',
        look: 'classic', themeVariables: mermaidTheme(theme),
        suppressErrorRendering: true, maxTextSize: 50000, htmlLabels: false,
        secure: ['securityLevel', 'startOnLoad', 'maxTextSize', 'maxEdges', 'suppressErrorRendering', 'secure', 'htmlLabels'],
        flowchart: { htmlLabels: false } });
      if (!await mermaid.parse(source, { suppressErrors: true })) return { error: 'Mermaid syntax error' };
      const { svg } = await mermaid.render(`gdm-${++sequence}`, source);
      const safe = DOMPurify.sanitize(styleDiagramSvg(svg), { USE_PROFILES: { svg: true, svgFilters: true }, FORBID_TAGS: ['foreignObject', 'a', 'image'], FORBID_ATTR: ['href', 'xlink:href'] });
      cache.set(key, safe);
      if (cache.size > 100) cache.delete(cache.keys().next().value!);
      return { svg: safe };
    } catch { return { error: 'Mermaid syntax error' }; }
  });
  queue = task.catch(() => undefined);
  return task;
}
