// v3-flat Look-for sweep (handoff kristy-card-v3-flat.md, Devon 2026-11-07). Writes
// patches/v3-sweep.json for apply.mjs; never touches the KB itself.
//   node scripts/lookfor/v3sweep.mjs     (from server/)
// 1. "Look for X." becomes "X." in place: the noun phrase is the line's own words (quote = X).
//    Skipped when X opens on a pronoun or wh-word, carries a second clause (";" or a second
//    imperative), or would read as cautionary (the projection would move it to watch_out).
// 2. A pick step that iOS would fold as a near duplicate of a look_for line (the ShopDeckPageView
//    nearDuplicate measure) is removed, when at least one step remains.
// Every other imperative-led line (Read / Pick / Check / Skip / Ask ...) is listed, not rewritten:
// stripping those verbs leaves no noun phrase the card already says.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { projectEntry, isCautionary } from '../../lib/counterCards.js';

const kb = JSON.parse(readFileSync(new URL('../../kristy_perimeter_kb.json', import.meta.url), 'utf8'));
// whole_vs_reduced_fat_milk, plain_kefir: the folded step carries the G2 term gloss (TERM_UNGLOSSED).
const SKIP = new Set(['whole_vs_reduced_fat_milk', 'plain_kefir', 'chicken', 'beef_grassfed_vs_grainfed', 'washing_produce', 'produce_storage', 'baking_soda_soak', 'revive_greens', 'freezing_produce']);
const STOP = new Set(['a', 'an', 'the', 'and', 'or', 'of', 'on', 'in', 'to', 'for', 'as', 'at', 'by', 'with', 'from', 'is', 'it', 'its', 'that', 'this']);
const cw = (s) => new Set(String(s).toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').split(' ').filter((w) => w && !STOP.has(w)));
const named = (line, labels) => labels.filter((l) => l.term && line.toLowerCase().includes(l.term.toLowerCase())).map((l) => l.term).join('|');
function nearDup(line, kept, labels) {
  const wl = cw(line), wk = cw(kept);
  if (!wl.size || !wk.size) return false;
  const shared = [...wl].filter((w) => wk.has(w)).length / wl.size;
  if (shared >= 0.8) return true;
  const tl = named(line, labels);
  return tl !== '' && tl === named(kept, labels) && shared > 0.6;
}
const BAD_HEAD = /^(it|its|them|they|one|ones|this|that|these|those|what|which|whichever|whether|how|where|when|who|any|either)\b/i;
const SECOND = /;|\b(and|or|then|but) (skip|avoid|pick|choose|check|read|ask|buy|find|keep|pass|look|use|go)\b/i;
const IMPERATIVE = /^(look|read|pick|choose|check|buy|find|skip|ask|keep|compare|pass|use|count|open|press|take|match|ignore|expect|go|reach|get|try|grab|avoid|turn|smell|feel|squeeze|tap|lift|shake|rinse|wash|store)\b/i;

const pdir = new URL('patches/', import.meta.url);
const added = new Set(readdirSync(pdir).filter((f) => f.endsWith('.json') && f !== 'v3-sweep.json')
  .flatMap((f) => JSON.parse(readFileSync(new URL(f, pdir), 'utf8')).patches)
  .flatMap((r) => (r.add || []).map((a) => `${r.id}\t${typeof a === 'string' ? a : a.text}`)));
const patches = [];
const left = [];
for (const e of kb.entries) {
  if (['pick', 'family', 'aisle'].includes(e.kind) || SKIP.has(e.id)) continue;
  const next = { ...e };
  for (const field of ['buying_tips', 'pick_steps']) {
    const list = e[field] || [];
    const replace = [];
    for (const from of list) {
      const m = /^Look for (.+)$/.exec(from);
      const rest = m?.[1];
      const text = rest && rest[0].toUpperCase() + rest.slice(1);
      if (!rest || added.has(`${e.id}\t${from}`) || BAD_HEAD.test(rest) || SECOND.test(rest) || cw(rest).size < 2 || isCautionary(text) || list.includes(text)) continue;
      replace.push({ from, text, quote: rest });
    }
    if (replace.length) {
      patches.push({ id: e.id, field, replace });
      next[field] = list.map((s) => replace.find((x) => x.from === s)?.text ?? s);
    }
  }
  const card = projectEntry(next);
  const labels = card.labels_decoded || [];
  const picks = (card.look_for || []).filter((l) => !/^can['’]t find/i.test(l));
  // A step an earlier patch added stays, or that patch would stop reading as applied.
  const dups = (next.pick_steps || []).filter((s) => !added.has(`${e.id}\t${s}`) && picks.some((k) => nearDup(s, k, labels)));
  const keep = (next.pick_steps || []).length - dups.length;
  if (dups.length && keep >= 1) {
    // A step both rewritten and folded is removed as authored, so a re-run stays idempotent.
    const rw = patches.find((p) => p.id === e.id && p.field === 'pick_steps' && p.replace);
    const orig = dups.map((d) => rw?.replace.find((x) => x.text === d)?.from ?? d);
    if (rw) { rw.replace = rw.replace.filter((x) => !dups.includes(x.text)); if (!rw.replace.length) patches.splice(patches.indexOf(rw), 1); }
    patches.push({ id: e.id, field: 'pick_steps', remove: orig });
  }
  else if (dups.length) left.push(`${e.id}: every pick step duplicates look_for (floor 1)`);
  for (const f of ['buying_tips', 'pick_steps']) {
    const still = (f === 'pick_steps' && keep >= 1 ? next[f].filter((s) => !dups.includes(s)) : next[f] || []).filter((s) => IMPERATIVE.test(s));
    if (still.length) left.push(`${e.id}.${f}: ${still.length} imperative-led`);
  }
}
writeFileSync(new URL('patches/v3-sweep.json', import.meta.url), JSON.stringify({
  source: 'v3-flat Look-for sweep (scripts/lookfor/v3sweep.mjs): "Look for X." -> "X." in place, quote = X; pick steps iOS folds as near duplicates of look_for removed.',
  patches,
}, null, 2) + '\n');
const cards = new Set(patches.map((p) => p.id));
console.log(`${patches.length} rows on ${cards.size} cards; ${patches.reduce((n, p) => n + (p.replace?.length || 0), 0)} rewrites, ${patches.reduce((n, p) => n + (p.remove?.length || 0), 0)} duplicate steps removed`);
console.log(`left (${left.length}):\n  ${left.join('\n  ')}`);
