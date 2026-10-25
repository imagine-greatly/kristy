// Shop-dial rules (SHOP-DIAL-PLAN §3 P1): one check for research batches, the merge and,
// later (P4), the corpus test. Plain text rules; the verb list is prefix matching.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Same normaliser as counterCardLint.js lintFamilyReferences (inline there, not exported).
const norm = (t) => String(t).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

export const MAX_FAMILY_TIPS = 4;
export const MAX_TIP_CHARS = 90; // [PLACEHOLDER]
export const MAX_DELTA_CHARS = 120; // [PLACEHOLDER]
export const MAX_DELTA_CLAUSES = 2;
export const TIP_VERBS = ['Look for', 'Read', 'Check', 'Pick', 'Skip', 'Ask'];
export const UNLEGIBLE = /grown without sprays|no sprays|no[- ]pesticides?\b|unsprayed|pesticide[- ]free|not sprayed/i;
export const HEDGE = /does not establish|not a health ranking|editorial preference/i;

const LEGIBLE_FIELDS = ['decision', 'delta', 'buying_tips', 'pick_steps', 'short_answer'];
const HEDGE_FIELDS = ['decision', 'buying_tips', 'delta'];

const texts = (v) => (Array.isArray(v) ? v : v == null ? [] : [v]).filter((s) => typeof s === 'string');
const sentences = (s) => s.split(/(?<=[.!?;])\s+/).map(norm).filter(Boolean);
const clauses = (s) => s.split(/[;:,.!?—]+/).filter((c) => norm(c)).length;

export function dialFindings(entries) {
  const out = [];
  const add = (id, code, field, msg) => out.push({ id, code, field, msg });
  const byId = new Map(entries.map((e) => [e.id, e]));
  const seen = new Map(); // normalised delta sentence -> first entry id

  for (const e of entries) {
    for (const field of LEGIBLE_FIELDS) {
      for (const t of texts(e[field])) {
        const m = t.match(UNLEGIBLE);
        if (m) add(e.id, 'DIAL_UNLEGIBLE', field, `"${m[0]}" is not on the shelf; name a seal or label`);
      }
    }
    for (const field of HEDGE_FIELDS) {
      for (const t of texts(e[field])) {
        const m = t.match(HEDGE);
        if (m) add(e.id, 'DIAL_HEDGE', field, `hedge "${m[0]}" belongs in detail/science/watch_out`);
      }
    }
    if (e.kind === 'family') {
      const tips = texts(e.buying_tips);
      if (tips.length > MAX_FAMILY_TIPS) add(e.id, 'DIAL_FAMILY_SHAPE', 'buying_tips', `${tips.length} tips > ${MAX_FAMILY_TIPS}`);
      tips.forEach((t, i) => {
        if (t.length > MAX_TIP_CHARS) add(e.id, 'DIAL_FAMILY_SHAPE', 'buying_tips', `tip ${i} is ${t.length} chars > ${MAX_TIP_CHARS}`);
        if (!TIP_VERBS.some((v) => t.startsWith(v + ' '))) add(e.id, 'DIAL_FAMILY_SHAPE', 'buying_tips', `tip ${i} does not start with ${TIP_VERBS.join('/')}`);
      });
    }
    if (typeof e.delta === 'string') {
      const d = e.delta;
      if (d.length > MAX_DELTA_CHARS) add(e.id, 'DIAL_DELTA', 'delta', `${d.length} chars > ${MAX_DELTA_CHARS}`);
      const n = clauses(d);
      if (n > MAX_DELTA_CLAUSES) add(e.id, 'DIAL_DELTA', 'delta', `${n} clauses > ${MAX_DELTA_CLAUSES}`);
      const fam = byId.get(e.family);
      const nd = norm(d);
      for (const tip of fam ? texts(fam.buying_tips) : []) {
        const nt = norm(tip);
        if (nt && nd.includes(nt)) add(e.id, 'DIAL_DELTA', 'delta', `delta repeats a ${e.family} tip`);
      }
      for (const s of new Set(sentences(d))) {
        const first = seen.get(s);
        if (first === undefined) seen.set(s, e.id);
        else if (first !== e.id) add(e.id, 'DIAL_REPEAT', 'delta', `sentence also in ${first}: "${s.slice(0, 60)}"`);
      }
    }
  }
  return out;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const file = process.argv[2];
  if (!file) { console.error('usage: node server/lib/dialRules.js <file.json>'); process.exit(2); }
  const json = JSON.parse(readFileSync(file, 'utf8'));
  const entries = Array.isArray(json) ? json : json.entries;
  if (!Array.isArray(entries)) { console.error('expected an array or {entries:[]}'); process.exit(2); }
  const found = dialFindings(entries);
  for (const f of found) console.log(`${f.code}\t${f.id}\t${f.field}\t${f.msg}`);
  const counts = found.reduce((m, f) => ((m[f.code] = (m[f.code] || 0) + 1), m), {});
  console.log(`${found.length} findings`, JSON.stringify(counts));
  process.exit(found.length ? 1 : 0);
}
