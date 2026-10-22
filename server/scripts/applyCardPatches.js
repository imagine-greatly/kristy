// Apply card patches ({id: {field: value}}) to the perimeter KB. New ids append as cards.
//   node scripts/applyCardPatches.js [--check] a.json b.json ...   (from server/)
// --check validates and prints the count without writing.
import { readFileSync, writeFileSync } from 'node:fs';
const path = new URL('../kristy_perimeter_kb.json', import.meta.url);
const kb = JSON.parse(readFileSync(path, 'utf8'));
const check = process.argv.includes('--check');
const files = process.argv.slice(2).filter((a) => a !== '--check');
const byId = new Map(kb.entries.map((e) => [e.id, e]));
const FIELDS = new Set(['title', 'aliases', 'category', 'question', 'decision', 'why', 'short_answer', 'detail',
  'evidence_tier', 'sources', 'kristy_take', 'instead', 'cart_pick', 'buying_tips', 'watch_out', 'pick_steps',
  'science', 'labels_decoded', 'tier_note', 'eyebrow_short', 'asked_as']);
let upd = 0, added = 0;
for (const f of files) {
  for (const [id, p] of Object.entries(JSON.parse(readFileSync(f, 'utf8')))) {
    for (const k of Object.keys(p)) if (!FIELDS.has(k)) throw new Error(`${f}: ${id}.${k} not a card field`);
    const e = byId.get(id);
    if (e) {
      if (e.kind === 'pick') throw new Error(`${f}: ${id} is a pick`);
      Object.assign(e, p); upd++;
    } else {
      for (const k of ['title', 'aliases', 'category', 'decision']) if (!p[k]) throw new Error(`${f}: new ${id} needs ${k}`);
      const n = { id, ...p }; kb.entries.push(n); byId.set(id, n); added++;
    }
  }
}
if (!check) writeFileSync(path, JSON.stringify(kb, null, 2) + '\n');
console.log(`${upd} updated, ${added} added${check ? ' (check only)' : ''}`);
