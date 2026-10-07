export interface Candidate { source: string; explicit: boolean }
const starter = /^(?:graph|flowchart)\s+(?:TB|TD|BT|RL|LR)\b|^(?:sequenceDiagram|classDiagram|stateDiagram(?:-v2)?|erDiagram|gantt|pie|gitGraph|journey|mindmap|timeline|sankey-beta|quadrantChart|architecture-beta|xychart-beta|block-beta|packet-beta|kanban|requirementDiagram)\b/;
export function detectCandidate(text: string, language?: string): Candidate | undefined {
  const normalized = text.replace(/\r\n/g, '\n').trim();
  const fence = normalized.match(/^(`{3,}|~{3,})([^\n]*)\n([\s\S]*?)\n\1\s*$/);
  const label = (fence?.[2]?.trim() || language || '').trim().toLowerCase();
  if (label && label !== 'mermaid') return;
  const source = fence?.[3]?.trim() ?? normalized;
  if (label === 'mermaid') return { source, explicit: true };
  const first = source.split('\n').find(line => line.trim() && !line.trim().startsWith('%%'))?.trim() ?? '';
  if (starter.test(first)) return { source, explicit: false };
}
