// Apply two-line proposals ({id: {decision, buying_tips}}) to the perimeter KB in place.
//   node scripts/applyTwoLine.js a.json b.json ...   (from server/)
import { readFileSync, writeFileSync } from 'node:fs';
const path = new URL('../kristy_perimeter_kb.json', import.meta.url);
const kb = JSON.parse(readFileSync(path, 'utf8'));
const byId = new Map(kb.entries.map((e) => [e.id, e]));
let n = 0;
for (const f of process.argv.slice(2)) {
  for (const [id, p] of Object.entries(JSON.parse(readFileSync(f, 'utf8')))) {
    const e = byId.get(id);
    if (!e || e.kind === 'pick') throw new Error(`${f}: ${id} is not a card`);
    e.decision = p.decision;
    e.buying_tips = p.buying_tips;
    n++;
  }
}
writeFileSync(path, JSON.stringify(kb, null, 2) + '\n');
console.log(`${n} cards applied`);
