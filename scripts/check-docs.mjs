import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import path from 'node:path';
import { marked } from 'marked';

const root = process.cwd();
const files = [
  ...readdirSync(root).filter(name => name.endsWith('.md')).map(name => path.join(root, name)),
  ...readdirSync(path.join(root, 'docs')).filter(name => name.endsWith('.md')).map(name => path.join(root, 'docs', name)),
];
const outsideFences = text => {
  let fence;
  return text.split('\n').map(line => {
    const match = line.match(/^\s*(`{3,}|~{3,})/);
    if (match) {
      if (!fence) fence = match[1];
      else if (match[1][0] === fence[0] && match[1].length >= fence.length) fence = undefined;
      return '';
    }
    return fence ? '' : line;
  }).join('\n');
};
const anchors = file => {
  const used = new Map();
  return new Set([...outsideFences(readFileSync(file, 'utf8')).matchAll(/^#{1,6}\s+(.+)$/gm)].map(([, heading]) => {
    const base = heading.toLowerCase().replace(/[^\p{L}\p{N}_ -]/gu, '').trim().replace(/ /g, '-');
    const count = used.get(base) ?? 0;
    used.set(base, count + 1);
    return count ? `${base}-${count}` : base;
  }));
};
const errors = [];
let references = 0;
for (const file of files) {
  const text = readFileSync(file, 'utf8');
  const content = outsideFences(text);
  const links = [];
  marked.walkTokens(marked.lexer(text, { gfm: true }), token => {
    if (token.type === 'link' || token.type === 'image') links.push(token.href);
    if (token.type === 'html') {
      for (const match of token.text.matchAll(/\b(?:href|src)=["']([^"']+)["']/g)) links.push(match[1]);
    }
  });
  for (const href of links) {
    if (/^[a-z][a-z\d+.-]*:/i.test(href) || href.startsWith('//')) continue;
    references++;
    const [rawPath, fragment] = href.split('#');
    const target = rawPath ? path.resolve(path.dirname(file), decodeURIComponent(rawPath)) : file;
    const label = path.relative(root, file);
    if (!existsSync(target)) errors.push(`${label}: missing target ${href}`);
    else if (fragment && statSync(target).isFile() && target.endsWith('.md') && !anchors(target).has(decodeURIComponent(fragment))) {
      errors.push(`${label}: missing heading ${href}`);
    }
  }
  const fences = text.match(/^\s*(?:`{3,}|~{3,})/gm) ?? [];
  if (fences.length % 2) errors.push(`${path.relative(root, file)}: unclosed code fence`);
}
if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else console.log(`Checked ${files.length} Markdown files and ${references} local links, anchors, and images.`);
