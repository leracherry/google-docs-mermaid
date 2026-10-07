import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GoogleDocsAdapter } from '../../src/docs/google-docs-adapter';
const observe = vi.fn(), unobserve = vi.fn(), disconnect = vi.fn();
let resized: () => void;
let stop: (() => void) | undefined;
beforeEach(() => {
  vi.useFakeTimers(); vi.clearAllMocks();
  vi.stubGlobal('requestAnimationFrame', (fn: FrameRequestCallback) => setTimeout(() => fn(0), 1));
  vi.stubGlobal('cancelAnimationFrame', clearTimeout);
  vi.stubGlobal('ResizeObserver', class { constructor(callback: () => void) { resized = callback; } observe = observe; unobserve = unobserve; disconnect = disconnect; });
});
afterEach(() => { stop?.(); document.body.innerHTML = ''; vi.useRealTimers(); vi.unstubAllGlobals(); });
const flush = async () => { await Promise.resolve(); await vi.advanceTimersByTimeAsync(2); };
describe('DOM block lifecycle', () => {
  it('deduplicates nested candidates, preserves identity and cleans up removed blocks', async () => {
    document.body.innerHTML = '<pre><code role="code" class="language-mermaid">graph LR</code></pre>';
    const callback = vi.fn(); stop = new GoogleDocsAdapter().observeBlocks(callback);
    const [first] = callback.mock.lastCall![0]; expect(callback.mock.lastCall![0]).toHaveLength(1); expect(first.language).toBe('mermaid');
    document.querySelector('code')!.textContent = 'graph LR\nA-->B'; await flush();
    expect(callback.mock.lastCall![0][0]).toMatchObject({ id: first.id, source: 'graph LR\nA-->B' });
    document.querySelector('pre')!.remove(); await flush();
    expect(callback.mock.lastCall![0]).toEqual([]); expect(unobserve).toHaveBeenCalledWith(first.element);
    stop(); const count = callback.mock.calls.length;
    document.body.innerHTML = '<pre>graph LR</pre>'; window.dispatchEvent(new Event('scroll')); resized(); await flush();
    expect(callback).toHaveBeenCalledTimes(count); expect(disconnect).toHaveBeenCalled();
  });
  it('tracks selector and language attribute changes and per-block resizing', async () => {
    document.body.innerHTML = '<div id="block">graph LR</div>';
    const callback = vi.fn(); stop = new GoogleDocsAdapter().observeBlocks(callback);
    const block = document.getElementById('block')!;
    expect(callback.mock.lastCall![0]).toEqual([]);
    block.setAttribute('role', 'code'); block.className = 'language-c++'; await flush();
    expect(callback.mock.lastCall![0][0].language).toBe('c++'); expect(observe).toHaveBeenCalledWith(block);
    block.dataset.language = 'mermaid'; await flush(); expect(callback.mock.lastCall![0][0].language).toBe('mermaid');
    const count = callback.mock.calls.length; resized(); resized(); await flush(); expect(callback).toHaveBeenCalledTimes(count + 1);
    block.removeAttribute('role'); await flush(); expect(callback.mock.lastCall![0]).toEqual([]);
    block.dataset.codeBlock = ''; await flush(); expect(callback.mock.lastCall![0]).toHaveLength(1);
  });
});
