import { existsSync, readFileSync, readdirSync, realpathSync, writeFileSync, copyFileSync } from 'node:fs';
import path from 'node:path';

// Include the full installed production dependency closure (a conservative
// superset of tree-shaken code), with original notices rather than license labels.
const root = process.cwd();
const project = JSON.parse(readFileSync('package.json', 'utf8'));
const packages = new Map();
function locate(name, from) {
  for (let dir = from; ; dir = path.dirname(dir)) {
    const candidate = path.join(dir, 'node_modules', name, 'package.json');
    if (existsSync(candidate)) return path.dirname(realpathSync(candidate));
    if (path.dirname(dir) === dir) throw new Error(`Cannot resolve production dependency ${name} from ${from}`);
  }
}
function visit(name, from, optional = false) {
  let dir;
  try { dir = locate(name, from); } catch (error) { if (optional) return; throw error; }
  if (packages.has(dir)) return;
  const pkg = JSON.parse(readFileSync(path.join(dir, 'package.json'), 'utf8'));
  const notices = [];
  function scan(folder) {
    for (const entry of readdirSync(folder, { withFileTypes: true })) {
      if (entry.name === 'node_modules' || entry.isSymbolicLink()) continue;
      const file = path.join(folder, entry.name);
      if (entry.isDirectory()) scan(file);
      else if (/^(licen[cs]e|copying|notice|copyright)([.-]|$)/i.test(entry.name)) {
        notices.push({ file: path.relative(dir, file), text: readFileSync(file, 'utf8') });
      }
    }
  }
  scan(dir);
  if (!notices.length) throw new Error(`Missing license text for ${pkg.name}@${pkg.version}; review before packaging`);
  packages.set(dir, { name: pkg.name, version: pkg.version, license: pkg.license ?? 'SEE LICENSE TEXT', notices });
  for (const dep of Object.keys(pkg.dependencies ?? {})) visit(dep, dir, dep in (pkg.optionalDependencies ?? {}));
  for (const dep of Object.keys(pkg.optionalDependencies ?? {})) visit(dep, dir, true);
}
for (const name of Object.keys(project.dependencies)) visit(name, root);
const inventory = [...packages.values()].sort((a, b) => `${a.name}@${a.version}`.localeCompare(`${b.name}@${b.version}`, 'en'));
const header = readFileSync('THIRD_PARTY_NOTICES.md', 'utf8');
const text = header + '\n\nInstalled production dependency notices (includes dependencies that may be removed by tree shaking):\n\n' + inventory.map(pkg =>
  `===== ${pkg.name}@${pkg.version} (${pkg.license}) =====\n` + pkg.notices.map(n => `--- ${n.file} ---\n${n.text}`).join('\n\n')).join('\n\n');
copyFileSync('LICENSE', 'public/LICENSE');
writeFileSync('public/THIRD_PARTY_NOTICES.txt', text);
writeFileSync('public/dependency-licenses.json', JSON.stringify(inventory.map(({ notices, ...pkg }) => ({ ...pkg, noticeFiles: notices.map(n => n.file) })), null, 2) + '\n');
console.log(`Included original notices for ${inventory.length} production dependency packages.`);
