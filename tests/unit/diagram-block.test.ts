import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { RenderResult } from '../../src/mermaid/renderer';
import { defaults } from '../../src/state/preferences';
const renderMermaid = vi.hoisted(() => vi.fn());
vi.mock('../../src/mermaid/renderer', () => ({ renderMermaid }));
vi.mock('wxt/browser', () => ({ browser: { runtime: { getURL: (p: string) => p } } }));
import { DiagramBlock } from '../../src/components/DiagramBlock';
let root: Root, container: HTMLDivElement;
let resolve: (result: RenderResult) => void;
let source: string;
let preferences = defaults;
const render = async () => { await act(async () => root.render(createElement(DiagramBlock, { block: { id: 'a', source, element: container, bounds: { top: 100, left: 0, width: 600, bottom: 200 } as DOMRect }, preferences, dark: false }))); };
const tick = async () => { await act(async () => { await vi.advanceTimersByTimeAsync(301); }); };
beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true); vi.useFakeTimers(); vi.clearAllMocks();
  container = document.createElement('div'); document.body.append(container); root = createRoot(container);
  source = 'graph LR\nA-->B'; preferences = defaults;
  renderMermaid.mockImplementation(() => new Promise<RenderResult>(done => { resolve = done; }));
});
afterEach(async () => { await act(async () => root.unmount()); container.remove(); vi.useRealTimers(); vi.unstubAllGlobals(); });
describe('diagram render lifecycle', () => {
  it('debounces rapid changes and discards a stale completion', async () => {
    await render(); source = 'graph LR\nA-->Latest'; await render(); await tick();
    expect(renderMermaid).toHaveBeenCalledTimes(1); expect(renderMermaid.mock.calls[0]![0]).toContain('Latest');
    const old = resolve; source = 'graph LR\nA-->Newest'; await render();
    expect(renderMermaid.mock.calls[0]![2].aborted).toBe(true);
    await act(async () => old({ svg: '<svg><text>Stale</text></svg>' }));
    expect(container.textContent).not.toContain('Stale');
    await tick(); await act(async () => resolve({ svg: '<svg><text>Newest</text></svg>' }));
    expect(container.querySelector('svg text')?.textContent).toBe('Newest');
    expect(container.querySelector('[role="status"]')).toBeNull();
  });
  it('clears busy status when auto-detection is disabled during rendering', async () => {
    await render(); await tick(); expect(container.querySelector('[role="status"]')).not.toBeNull();
    preferences = { ...defaults, autoDetect: false }; await render();
    expect(container.querySelector('[role="status"]')).toBeNull();
    expect(container.querySelector('.canvas')).toBeNull();
    expect(renderMermaid.mock.calls[0]![2].aborted).toBe(true);
  });
  it('keeps the last valid preview on an error and recovers on another edit', async () => {
    await render(); await tick(); await act(async () => resolve({ svg: '<svg><text>Valid</text></svg>' }));
    source = 'graph LR\nA-->'; await render(); await tick(); await act(async () => resolve({ error: 'Mermaid syntax error' }));
    expect(container.querySelector('.canvas')?.textContent).toBe('Valid'); expect(container.querySelector('[role="alert"]')?.textContent).toContain('syntax error');
    source = 'graph LR\nA-->Fixed'; await render(); await tick(); await act(async () => resolve({ svg: '<svg><text>Fixed</text></svg>' }));
    expect(container.querySelector('.canvas')?.textContent).toBe('Fixed'); expect(container.querySelector('[role="alert"]')).toBeNull();
  });
});
