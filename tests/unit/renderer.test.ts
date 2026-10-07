import { beforeEach, describe, expect, it, vi } from 'vitest';
const mermaid = vi.hoisted(() => ({ initialize: vi.fn(), parse: vi.fn(), render: vi.fn() }));
vi.mock('mermaid', () => ({ default: mermaid }));
let renderMermaid: typeof import('../../src/mermaid/renderer').renderMermaid;
beforeEach(async () => {
  vi.resetModules(); vi.clearAllMocks();
  mermaid.parse.mockResolvedValue(true);
  mermaid.render.mockImplementation(async (id: string) => ({ svg: `<svg xmlns="http://www.w3.org/2000/svg" id="${id}" aria-labelledby="diagram-title"><title id="diagram-title">Diagram</title><defs><marker id="arrow"/></defs><style>#${id} .node{fill:#fff}</style><g id="node"><path marker-end="url(#arrow)"/></g></svg>` }));
  ({ renderMermaid } = await import('../../src/mermaid/renderer'));
});
describe('renderer isolation and limits', () => {
  it('renders repeated requests once and gives every result distinct IDs and valid references', async () => {
    const results = await Promise.all([renderMermaid('graph LR\nA-->B', 'light'), renderMermaid('graph LR\nA-->B', 'light')]);
    expect(mermaid.render).toHaveBeenCalledTimes(1);
    const ids = new Set<string>();
    for (const result of results) {
      expect(result.error).toBeUndefined();
      const doc = new DOMParser().parseFromString(result.svg!, 'image/svg+xml');
      for (const node of doc.querySelectorAll('[id]')) { expect(ids.has(node.id)).toBe(false); ids.add(node.id); }
      const marker = doc.querySelector('marker')!;
      expect(doc.querySelector('path')!.getAttribute('marker-end')).toBe(`url(#${marker.id})`);
      expect(doc.documentElement.getAttribute('aria-labelledby')).toBe(doc.querySelector('title')!.id);
      expect(doc.querySelector('style')!.textContent).toContain(`#${doc.documentElement.id} `);
    }
  });
  it('separates themes and recovers after parse and render failures', async () => {
    mermaid.parse.mockResolvedValueOnce(false);
    expect((await renderMermaid('invalid', 'light')).error).toBeTruthy();
    mermaid.render.mockRejectedValueOnce(new Error('layout failure'));
    expect((await renderMermaid('graph LR', 'light')).error).toBeTruthy();
    expect((await renderMermaid('graph LR', 'light')).svg).toBeTruthy();
    expect((await renderMermaid('graph LR', 'dark')).svg).toBeTruthy();
    expect(mermaid.render).toHaveBeenCalledTimes(3);
  });
  it('rejects oversized source before parsing or rendering', async () => {
    expect((await renderMermaid('x'.repeat(50001), 'light')).error).toContain('50,000');
    expect(mermaid.parse).not.toHaveBeenCalled();
    expect(mermaid.render).not.toHaveBeenCalled();
  });
  it.each([
    'flowchart LR\nA@{ img: "https://example.invalid/a" }',
    'flowchart LR\nA[Unsafe]\nstyle A fill:url(https://example.invalid/a)',
    String.raw`flowchart LR
A[Unsafe]
style A fill:u\72l(https://example.invalid/a)`,
    '%%{init: {"themeCSS": "@import \"https://example.invalid/a\""}}%%\ngraph LR',
  ])('rejects resource-bearing syntax before invoking Mermaid (%s)', async source => {
    expect((await renderMermaid(source, 'light')).error).toContain('External resources');
    expect(mermaid.parse).not.toHaveBeenCalled(); expect(mermaid.render).not.toHaveBeenCalled();
  });
  it('skips cancelled work before entering the renderer', async () => {
    const controller = new AbortController();
    const result = renderMermaid('graph LR', 'light', controller.signal); controller.abort();
    expect((await result).error).toBe('Render cancelled');
    expect(mermaid.render).not.toHaveBeenCalled();
  });
  it('removes active content and resource links from SVG', async () => {
    mermaid.render.mockResolvedValueOnce({ svg: '<svg xmlns="http://www.w3.org/2000/svg" id="gdm-1"><script>alert(1)</script><foreignObject/><image href="https://example.invalid/a"/><a href="javascript:alert(1)"><text onclick="alert(1)">Safe label</text></a></svg>' });
    const { svg } = await renderMermaid('graph LR', 'light');
    expect(svg).not.toMatch(/<script|<foreignObject|<image|<a\s|href=|onclick=/);
    expect(svg).toContain('Safe label');
  });
  it('evicts old cache entries at the configured bound', async () => {
    for (let i = 0; i < 101; i++) await renderMermaid(`graph LR\nA-->B${i}`, 'light');
    await renderMermaid('graph LR\nA-->B0', 'light');
    expect(mermaid.render).toHaveBeenCalledTimes(102);
  });
});
