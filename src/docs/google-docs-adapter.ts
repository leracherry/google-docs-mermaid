import type { CodeBlock, DocumentAdapter } from './adapter';

// DOM-backed surfaces only. Canvas text extraction is an explicit feasibility gate.
const SELECTOR = 'pre, [data-code-block], [role="code"]';
export class GoogleDocsAdapter implements DocumentAdapter {
  private ids = new WeakMap<HTMLElement, string>();
  constructor(private scope: HTMLElement = document.body) {}
  observeBlocks(callback: (blocks: CodeBlock[]) => void) {
    let frame = 0;
    let stopped = false;
    const scan = () => {
      frame = 0;
      if (stopped) return;
      const blocks: CodeBlock[] = [];
      for (const element of this.scope.querySelectorAll<HTMLElement>(SELECTOR)) {
        if (element.parentElement?.closest(SELECTOR)) continue;
        let id = this.ids.get(element);
        if (!id) { id = crypto.randomUUID(); this.ids.set(element, id); }
        blocks.push({ id, element, source: element.textContent ?? '', bounds: element.getBoundingClientRect(),
          language: element.dataset.language ?? element.querySelector('code')?.className.match(/language-(\w+)/)?.[1] });
      }
      callback(blocks);
    };
    const schedule = () => { if (!frame && !stopped) frame = requestAnimationFrame(scan); };
    const observer = new MutationObserver(schedule);
    observer.observe(this.scope, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['data-language', 'class', 'style'] });
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
