// Pass rule for the readability rewrites (VOICE_SPEC "Readable in the aisle"): rephrasing, never deletion.
import assert from 'node:assert/strict';

export const FROZEN = ['id', 'sources', 'aliases', 'asked_as', 'category', 'evidence_tier', 'cart_pick', 'instead', 'labels_decoded'];
export const REWRITABLE = ['decision', 'short_answer', 'why', 'buying_tips', 'watch_out', 'detail', 'kristy_take', 'tier_note', 'eyebrow_short', 'question'];
const NUMBER = /\d+(?:[.,]\d+)?%?/g;
const isEmpty = (v) => v == null || (typeof v === 'string' ? v.trim() === '' : Array.isArray(v) && v.length === 0);

export function assertPassRule(t, oldEntry, newEntry) {
  const id = oldEntry.id;
  for (const f of FROZEN) assert.deepEqual(newEntry[f], oldEntry[f], `${id}: frozen field ${f} changed`);
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
