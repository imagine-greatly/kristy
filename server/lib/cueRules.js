// Shelf-cue legibility lint for TSV tables (id, verdict, cue columns by header name).
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { VAGUE, UNLEGIBLE } from './dialRules.js';

const norm = (t) => String(t).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

export const MAX_CUE_WORDS = 15;
export const GENERIC_PHRASES = ['firm, smooth', 'no soft spots', 'free of blemishes', 'fresh looking', 'good color', 'look for quality'];
export const VERDICTS = ['Organic', 'Conventional OK', 'Skip', 'Either'];
export const BANNED_EXTRA = /\bprice|\$\d|\bI\b|\bmy\b/i;

export function cueFindings(rows) {
  const out = [];
  const add = (id, code, msg) => out.push({ id, code, msg });
  const byKey = new Map(); // first-5-words or full normalised cue -> first id
  for (const { id, verdict, cue = '' } of rows) {
    const words = norm(cue).split(' ').filter(Boolean);
    if (words.length > MAX_CUE_WORDS) add(id, 'CUE_LONG', `${words.length} words > ${MAX_CUE_WORDS}`);
    const low = cue.toLowerCase();
    for (const g of GENERIC_PHRASES) if (low.includes(g)) add(id, 'CUE_GENERIC', `generic "${g}"`);
    const keys = new Set([words.slice(0, 5).join(' '), words.join(' ')]);
    for (const k of keys) {
      if (!k) continue;
      const first = byKey.get(k);
      if (first === undefined) byKey.set(k, id);
      else if (first !== id) { add(id, 'CUE_DUPLICATE', `same opening as ${first}`); break; }
    }
    const semis = (cue.match(/;/g) || []).length;
    if (semis > 1) add(id, 'CUE_CHAIN', `${semis + 1} checks chained`);
    for (const re of [VAGUE, UNLEGIBLE, BANNED_EXTRA]) {
      const m = cue.match(re);
      if (m) add(id, 'CUE_BANNED', `"${m[0]}" not allowed in a cue`);
    }
    if (!VERDICTS.includes(verdict)) add(id, 'CUE_VERDICT', `verdict "${verdict}" not in ${VERDICTS.join('|')}`);
  }
  return out;
}

export function readCueTsv(file) {
  const lines = readFileSync(file, 'utf8').split(/\r?\n/).filter((l) => l.trim() && !l.startsWith('#'));
  const head = lines.shift().split('\t');
  const col = (n) => head.indexOf(n);
  const [i, v, c] = ['id', 'verdict', 'cue'].map(col);
  return lines.map((l) => { const p = l.split('\t'); return { id: p[i], verdict: p[v], cue: p[c] }; });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const file = process.argv[2];
  if (!file) { console.error('usage: node server/lib/cueRules.js <file.tsv>'); process.exit(2); }
  const found = cueFindings(readCueTsv(file));
  for (const f of found) console.log(`${f.code}\t${f.id}\t${f.msg}`);
  console.log(`${found.length} findings`);
  process.exit(found.length ? 1 : 0);
}
