// Read-only dependency rehearsal: project KB/do-lines and Step 6 pins in memory.
import fs from 'node:fs';
import { syncBuiltinESMExports } from 'node:module';
import { fileURLToPath } from 'node:url';
import importedKb from '../../../server/kristy_perimeter_kb.json' with { type: 'json' };
import { data, project } from './project.mjs';
const root = new URL('../../../', import.meta.url);
const { kb, doLines } = project();
Object.assign(importedKb, kb);
const realRead = fs.readFileSync;
let review = realRead(new URL('docs/do-lines-review.md', root), 'utf8');
for (const id of data.CHANGED) {
  const e = kb.entries.find(e => e.id === id);
  review = review.split('\n').map(line => {
    if (!line.startsWith('| `' + id + '` |')) return line;
    const cols = line.split('|');
    cols[3] = ' ' + e.decision + ' ';
    cols[4] = ' ' + doLines[id] + ' ';
    return cols.join('|');
  }).join('\n');
}
const fixtures = new Map([
  [fileURLToPath(new URL('server/kristy_perimeter_kb.json', root)), JSON.stringify(kb)],
  [fileURLToPath(new URL('server/lib/doLines.json', root)), JSON.stringify(doLines)],
  [fileURLToPath(new URL('docs/do-lines-review.md', root)), review],
]);
fs.readFileSync = (path, options) => {
  const key = path instanceof URL ? fileURLToPath(path) : String(path);
  if (!fixtures.has(key)) return realRead(path, options);
  const value = fixtures.get(key);
  return typeof options === 'string' || options?.encoding ? value : Buffer.from(value);
};
syncBuiltinESMExports();
const files = ['server/test/acceptance/ic7b.test.js', 'server/test/acceptance/ic4b.test.js', 'server/test/acceptance/ic7a.test.js', 'server/test/counterProbe48.test.js', 'server/lib/kindFilter.test.js', 'server/lib/perimeter.test.js', 'server/lib/counterCardLint.test.js', 'server/test/acceptance/ic8a.test.js', 'server/test/acceptance/ic8b.test.js', 'server/test/ktight.test.js', 'server/lib/counterReach.test.js', 'server/test/healthFirst.test.js', 'server/test/acceptance/ca-1.test.js'];
for (const file of files) {
  const original = new URL(file, root);
  let src = realRead(original, 'utf8');
  if (file.endsWith('/ic7b.test.js')) src = src.replace('Raw from a trusted local farmer first, then low-temp organic, 100% grass-fed.', data.MILK.decision).replace('/raw|farmer/i', '/145°F/');
  if (file.endsWith('/ic4b.test.js')) src = src.replace('Corn- and soy-free first, then organic, then pasture-raised.', data.EGG.decision);
  if (file.endsWith('/ic7a.test.js')) src = src.replace('new Set(DROPPED.map(norm))', `new Set([...DROPPED, ${Object.keys(data.YOG_TIPS).map(x=>JSON.stringify(x)).join(', ')}].map(norm))`);
  if (file.endsWith('/counterProbe48.test.js')) src = src.replace(/(assert.equal\(matchItemToPick\('(?:milk carton|carton of milk)'\)\?\.id, )'pick_milk'/g, '$1undefined');
  if (file.endsWith('/kindFilter.test.js')) src = src.replace("31, 'K18: 31 picks in the raw corpus'", "30, 'CA-4a: 30 picks in the raw corpus'");
  if (file.endsWith('/perimeter.test.js')) src = src.replace("p.replace(/^100% /, '')", "p.replace(/\\b100%/, '')");
  src = src.replace(/from (['"])(\.[^'"]+)\1/g, (_, q, rel) => `from '${new URL(rel, original).href}'`)
    .replaceAll('import.meta.url', JSON.stringify(original.href));
  const output = new URL('./rehearsal-' + file.replaceAll('/', '_') + '.mjs', import.meta.url);
  fs.writeFileSync(output, src);
  await import(output.href);
}
await import(new URL('server/scripts/listMatchProbe.js', root).href);
