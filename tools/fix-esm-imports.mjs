// tools/fix-esm-imports.mjs（IIFE版：古いNodeでもOK）
import { promises as fs } from 'fs';
import path from 'path';

const roots = [
  'vendor/zxing/browser/0.1.5/esm',
  'vendor/zxing/library/0.20.0/esm',
];

function patchSpec(s) {
  if (!(s.startsWith('./') || s.startsWith('../'))) return s;
  if (s.endsWith('.js') || s.endsWith('.mjs')) return s;
  return s + '.js';
}

async function patchFile(fp) {
  let src = await fs.readFile(fp, 'utf8');
  const before = src;
  src = src.replace(/(from\s*['"])(\.\.?\/[^'"]+)(['"])/g, (_, a, p, b) => a + patchSpec(p) + b);
  src = src.replace(/(import\s*\(\s*['"])(\.\.?\/[^'"]+)(['"]\s*\))/g, (_, a, p, b) => a + patchSpec(p) + b);
  if (src !== before) await fs.writeFile(fp, src);
}

async function walk(dir) {
  const ents = await fs.readdir(dir, { withFileTypes: true });
  for (const e of ents) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) await walk(p);
    else if (e.isFile() && p.endsWith('.js')) await patchFile(p);
  }
}

(async () => {
  for (const r of roots) { await walk(r); console.log('Patched:', r); }
  console.log('Done.');
})();
