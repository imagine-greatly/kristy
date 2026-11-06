// Look-for scope, S2a (handoff lookfor-scope-plan.md). The ONLY writer of kristy_perimeter_kb.json for this pass.
//   node scripts/lookfor/apply.mjs [--dry-run] [--deletions-only]     (from server/)
// Applies scripts/lookfor/out/deletions.patch.json, then scripts/lookfor/patches/*.json in name order
// (the directory may be missing or empty). Row: {id, field, remove:[exact], add:[text | {text, quote}],
// to_watch_out:[exact], evidence?:{field, quote}}. Every add needs a quote (its own, or the row's evidence.quote)
// that appears word for word in that card's text as it read BEFORE this run; one bad add refuses the whole run.
// Shape floors: the authored patches/*.json refuse the run on a breach; the regex-made deletions patch only
// HOLDS the breaching row (left on the card, printed for Pass B), because S0's floors were looser than the suite's.
// Idempotent: a row whose removes are gone and whose adds/moves are present counts as applied.
// Writes JSON.stringify(kb, null, 2) + '\n', which round-trips the KB byte for byte, so the diff is only changed lines.
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { MAX_FAMILY_TIPS } from '../../lib/dialRules.js';

const here = new URL('./', import.meta.url);
const kbUrl = new URL('../../kristy_perimeter_kb.json', import.meta.url);
const dry = process.argv.includes('--dry-run');
const FIELDS = new Set(['buying_tips', 'pick_steps']);
// Gold shape cards and home cards: never touched by this pass (plan: byte-identical).
const FROZEN = new Set(['chicken', 'beef_grassfed_vs_grainfed', 'washing_produce', 'produce_storage', 'baking_soda_soak', 'revive_greens', 'freezing_produce']);
// Exact lines the deletions patch proposes that must stay, one reason each.
const HOLD = new Map([
  ['coffee_beans\tLook for ‘whole bean’ and Bird Friendly on a sealed bag with a roasted-on date.', 'a seal criterion, and Devon-approved line 2 (twoLinePin)'],
  ['mayo\tOnce opened, keep it in the fridge and use it within 1 to 2 months.', 'science repeats "1 to 2 months"; removing it orphans the number (KT_NEW_NUMBER)'],
  ['clams_mussels_oysters\tLook for whole, closed shells, with none cracked or broken.', 'line 2 today; without it the 98-char tag line becomes line 2 (LINE2_LONG)'],
]);
const held = (id, s) => HOLD.has(`${id}\t${s}`);

const kb = JSON.parse(readFileSync(kbUrl, 'utf8'));
const byId = new Map(kb.entries.map((e) => [e.id, e]));
const strings = (v) => (typeof v === 'string' ? [v] : v && typeof v === 'object' ? Object.values(v).flatMap(strings) : []);
const before = new Map(kb.entries.map((e) => [e.id, strings(e)])); // every string field, pre-run

const files = [new URL('out/deletions.patch.json', here)];
const pdir = new URL('patches/', here);
if (!process.argv.includes('--deletions-only') && existsSync(pdir)) {
  for (const f of readdirSync(pdir).filter((f) => f.endsWith('.json')).sort()) files.push(new URL(f, pdir));
}

// Why a field would break its floor (perimeter.test, dialRules, counterCardLint), or null.
function breach(e, field, next, watchNext, grew) {
  const n = next.length;
  if (field === 'pick_steps' && (n < 1 || n > 3)) return `pick_steps would hold ${n} (1-3)`;
  if (field === 'buying_tips') {
    if (e.kind === 'aisle' && (n < 3 || n > 5)) return `aisle buying_tips would hold ${n} (3-5)`;
    if (e.kind === 'family' && (n < 1 || n > MAX_FAMILY_TIPS)) return `family buying_tips would hold ${n} (1-${MAX_FAMILY_TIPS})`;
    if (e.kind == null && n < 3) return `buying_tips would hold ${n} (question cards need 3)`;
  }
  if (grew && e.kind === 'family') return 'families carry no watch_out (OLD_FAMILY_FIELDS)';
  if (grew && watchNext.length > 3) return `watch_out would hold ${watchNext.length} (max 3)`;
  return null;
}

const errors = [];
const holds = [];
const stats = { rows: 0, applied: 0, already: 0, held: 0, removed: 0, added: 0, moved: 0 };
const touched = new Set();
for (const url of files) {
  const name = url.pathname.split('/').slice(-2).join('/');
  const strict = !name.startsWith('out/');
  const rows = JSON.parse(readFileSync(url, 'utf8')).patches;
  if (!Array.isArray(rows)) { errors.push(`${name}: no "patches" array`); continue; }
  rows.forEach((r, i) => {
    stats.rows++;
    const at = `${name}#${i} ${r.id}.${r.field}`;
    const e = byId.get(r.id);
    if (!e) return errors.push(`${at}: unknown id`);
    if (FROZEN.has(r.id)) return errors.push(`${at}: frozen card (gold or home), never patched`);
    if (!FIELDS.has(r.field) || !Array.isArray(e[r.field])) return errors.push(`${at}: field must be an existing buying_tips/pick_steps list`);
    const adds = (r.add || []).map((a) => (typeof a === 'string' ? { text: a, quote: r.evidence?.quote } : a));
    for (const a of adds) {
      if (typeof a.text !== 'string' || !a.text.trim()) errors.push(`${at}: add without text`);
      else if (typeof a.quote !== 'string' || !a.quote.trim()) errors.push(`${at}: add "${a.text}" has no quote`);
      else if (!before.get(r.id).some((s) => s.includes(a.quote))) errors.push(`${at}: quote "${a.quote}" not verbatim in ${r.id}`);
    }
    for (const m of r.to_watch_out || []) if (!(r.remove || []).includes(m)) errors.push(`${at}: to_watch_out "${m}" is not also a remove`);
    for (const s of (r.remove || []).filter((s) => held(r.id, s))) holds.push(`${r.id}.${r.field}: "${s}" (${HOLD.get(`${r.id}\t${s}`)})`);
    const remove = (r.remove || []).filter((s) => !held(r.id, s));
    const moves = (r.to_watch_out || []).filter((s) => !held(r.id, s));
    if ((r.remove || []).length && !remove.length && !adds.length) return stats.held++;
    const list = e[r.field], watch = Array.isArray(e.watch_out) ? e.watch_out : [];
    const present = remove.filter((s) => list.includes(s));
    if (present.length === 0 && adds.every((a) => list.includes(a.text)) && moves.every((m) => watch.includes(m))) return stats.already++;
    if (present.length !== remove.length) return errors.push(`${at}: partly applied or remove not matching: ${remove.filter((s) => !list.includes(s)).map((s) => `"${s}"`).join(', ')}`);
    const next = list.filter((s) => !remove.includes(s)).concat(adds.map((a) => a.text).filter((t) => !list.includes(t)));
    const newMoves = moves.filter((m) => !watch.includes(m));
    const why = breach(e, r.field, next, watch.concat(newMoves), newMoves.length > 0);
    if (why && strict) return errors.push(`${at}: ${why}`);
    if (why) { stats.held++; return holds.push(`${r.id}.${r.field}: whole row (${why})`); }
    e[r.field] = next;
    if (newMoves.length) e.watch_out = watch.concat(newMoves);
    stats.applied++; stats.removed += remove.length; stats.added += adds.length; stats.moved += newMoves.length;
    touched.add(r.id);
    if (!dry) console.log(`  ${r.id}.${r.field}: -${remove.length} +${adds.length}${newMoves.length ? ` watch_out+${newMoves.length}` : ''}`);
    else {
      for (const s of remove) console.log(`- ${r.id}.${r.field}: ${s}${newMoves.includes(s) ? '   [-> watch_out]' : ''}`);
      for (const a of adds) console.log(`+ ${r.id}.${r.field}: ${a.text}   [quote: ${a.quote}]`);
    }
  });
}
if (errors.length) {
  console.error(`REFUSED, KB unchanged (${errors.length} problem${errors.length > 1 ? 's' : ''}):\n  ${errors.join('\n  ')}`);
  process.exit(1);
}
console.log(`HELD for Pass B (${holds.length}):\n  ${holds.join('\n  ')}`);
console.log(`${dry ? 'DRY RUN, nothing written. ' : ''}${files.length} file(s), ${stats.rows} rows: ${stats.applied} applied, ${stats.already} already applied, ${stats.held} held; ` +
  `${stats.removed} lines removed, ${stats.added} added, ${stats.moved} moved to watch_out, ${touched.size} cards touched`);
if (!dry && touched.size) writeFileSync(kbUrl, JSON.stringify(kb, null, 2) + '\n');
