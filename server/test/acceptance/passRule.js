// Pass rule for the readability rewrites (VOICE_SPEC "Readable in the aisle"): rephrasing, never deletion.
import assert from 'node:assert/strict';
import { CULINARY_LEXICON } from '../../lib/counterCardLint.js';

export const FROZEN = ['id', 'sources', 'aliases', 'asked_as', 'category', 'evidence_tier', 'cart_pick', 'instead', 'labels_decoded'];
export const REWRITABLE = ['decision', 'short_answer', 'why', 'buying_tips', 'watch_out', 'detail', 'kristy_take', 'tier_note', 'eyebrow_short', 'question'];
// Health-first REWRITE ids (docs/plans/card-health-first-plan.md, Piece 4): the approved plan
// re-aims cart_pick, adds asked_as/sources, drops cook-verb aliases and re-words label meanings.
// 4b and 4c add their ids here.
export const HEALTH_FIRST_REWRITE = new Set([
  'ground_beef_lean_ratio', 'beef_cuts_basics', 'beef_grades_usda', 'meat_case', 'butcher_counter_asking',
  'pick_soup_bones', 'egg_grades_sizes', 'pork_cuts_and_enhanced', 'lamb_goat',
]);
const RELAXED = ['cart_pick', 'asked_as', 'aliases', 'sources', 'labels_decoded'];
const keepsAll = (newList, oldList) => (oldList || []).every((x) => (newList || []).includes(x));

const NUMBER = /\d+(?:[.,]\d+)?%?/g;
const isEmpty = (v) => v == null || (typeof v === 'string' ? v.trim() === '' : Array.isArray(v) && v.length === 0);

export function assertPassRule(t, oldEntry, newEntry) {
  const id = oldEntry.id;
  const rewrite = HEALTH_FIRST_REWRITE.has(id);
  for (const f of FROZEN) {
    if (rewrite && RELAXED.includes(f)) continue;
    assert.deepEqual(newEntry[f], oldEntry[f], `${id}: frozen field ${f} changed`);
  }
  if (rewrite) {
    assert.ok(keepsAll(newEntry.asked_as, oldEntry.asked_as), `${id}: asked_as lost a phrasing`);
    assert.ok(keepsAll(newEntry.sources, oldEntry.sources), `${id}: sources lost an entry`);
    for (const a of oldEntry.aliases || []) {
      if (!(newEntry.aliases || []).includes(a)) assert.ok(CULINARY_LEXICON.test(a), `${id}: alias "${a}" dropped but is not a cook-verb alias`);
    }
    const terms = (newEntry.labels_decoded || []).map((l) => l.term);
    for (const l of oldEntry.labels_decoded || []) assert.ok(terms.includes(l.term), `${id}: label term "${l.term}" dropped`);
  }
  for (const [f, v] of Object.entries(oldEntry)) {
    if (!isEmpty(v)) assert.ok(!isEmpty(newEntry[f]), `${id}: ${f} was non-empty and is now empty`);
  }
  assert.ok((newEntry.watch_out || []).length >= (oldEntry.watch_out || []).length, `${id}: watch_out lost an item`);
  const oldText = REWRITABLE.map((f) => JSON.stringify(oldEntry[f] ?? '')).join(' ');
  // Rewritable fields only: a number surviving in a source URL is not a surviving fact.
  const newText = REWRITABLE.map((f) => JSON.stringify(newEntry[f] ?? '')).join(' ');
  for (const n of new Set(oldText.match(NUMBER) || [])) {
    assert.ok(newText.includes(n), `${id}: number ${n} from the old text is gone`);
  }
}
