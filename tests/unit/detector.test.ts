import { describe, expect, it } from 'vitest';
import { detectCandidate } from '../../src/mermaid/detector';
describe('Mermaid candidate detection', () => {
  it('recognizes explicit fences even with incomplete syntax', () => { expect(detectCandidate('```mermaid\ngraph\n```')).toEqual({ source: 'graph', explicit: true }); });
  it('recognizes unlabeled fences and comments', () => { expect(detectCandidate('```\n%% comment\nflowchart TD\nA --> B\n```')?.explicit).toBe(false); });
  it('honors other language labels', () => { expect(detectCandidate('```js\nflowchart TD\n```')).toBeUndefined(); expect(detectCandidate('graph TD', 'python')).toBeUndefined(); });
  it('rejects prose and partial lookalikes', () => { expect(detectCandidate('A graph of my data')).toBeUndefined(); expect(detectCandidate('sequenceDiagrammatic')).toBeUndefined(); });
  it('normalizes CRLF', () => { expect(detectCandidate('```mermaid\r\ngraph LR\r\nA --> B\r\n```')?.source).toBe('graph LR\nA --> B'); });
});
