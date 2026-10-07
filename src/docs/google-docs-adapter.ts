import type { CodeBlock, DocumentAdapter } from './adapter';

// DOM-backed surfaces only. Canvas text extraction is an explicit feasibility gate.
const SELECTOR = 'pre, [data-code-block], [role="code"]';
export class GoogleDocsAdapter implements DocumentAdapter {
  private ids = new WeakMap<HTMLElement, string>();
  constructor(private scope: HTMLElement = document.body) {}
  observeBlocks(callback: (blocks: CodeBlock[]) => void) {
    let frame = 0;
    let stopped = false;
    const observed = new Set<HTMLElement>();
    const scan = () => {
      frame = 0;
      if (stopped) return;
      const blocks: CodeBlock[] = [];
      const elements = this.scope.querySelectorAll<HTMLElement>(SELECTOR);
      const current = new Set(elements);
      for (const element of observed) {
        if (!current.has(element)) { resize.unobserve(element); observed.delete(element); }
      }
      for (const element of elements) {
        if (element.parentElement?.closest(SELECTOR)) continue;
        if (!observed.has(element)) { resize.observe(element); observed.add(element); }
        let id = this.ids.get(element);
        if (!id) { id = crypto.randomUUID(); this.ids.set(element, id); }
        blocks.push({ id, element, source: element.innerText ?? element.textContent ?? '', bounds: element.getBoundingClientRect(),
          language: element.dataset.language ?? element.className.match(/(?:^|\s)language-([^\s]+)/)?.[1]
            ?? element.querySelector('code')?.className.match(/(?:^|\s)language-([^\s]+)/)?.[1] });
      }
      callback(blocks);
    };
    const schedule = () => { if (!frame && !stopped) frame = requestAnimationFrame(scan); };
    const observer = new MutationObserver(schedule);
    observer.observe(this.scope, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['data-language', 'data-code-block', 'role', 'class', 'style', 'hidden'] });
    const resize = new ResizeObserver(schedule);
    resize.observe(this.scope);
    window.addEventListener('scroll', schedule, true);
    window.addEventListener('resize', schedule);
    scan();
    return () => {
      stopped = true; cancelAnimationFrame(frame); observer.disconnect(); resize.disconnect();
      window.removeEventListener('scroll', schedule, true); window.removeEventListener('resize', schedule);
    };
  }
}
