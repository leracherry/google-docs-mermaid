export interface CodeBlock {
  id: string;
  element: HTMLElement;
  source: string;
  language?: string;
  bounds: DOMRect;
}
export interface DocumentAdapter {
  observeBlocks(callback: (blocks: CodeBlock[]) => void): () => void;
}
