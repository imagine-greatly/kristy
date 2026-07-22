// List generator — gating + focuses + swap-merge. Pure logic, no DB and no API key:
// this is the authoritative server generator the /api/list routes call, so proving
// it here proves the tamper-proofing (a non-premium call never yields gated items).
// Run from server/:  node scripts/list.livetest.js

import { generateList, mergePendingSwaps } from '../lib/list.js';

let failures = 0;
const check = (name, cond) => {
  console.log(`${cond ? '✓' : '✗ FAIL'}  ${name}`);
  if (!cond) failures++;
};
const names = (list) => list.items.map((i) => i.name.toLowerCase());
const has = (list, n) => names(list).includes(n.toLowerCase());

const nextList = [{ product_name: 'Sugary Cereal', tier: 'swap_recommended' }];

/* ── FREE: a real, useful basic list — but none of the premium capabilities ── */
const free = generateList({
  goal: 'high_protein',
  nonNegotiables: [],
  focuses: ['higher_fiber'],
  nextList,
  signals: {},
  premium: false,
});
check('free list is non-empty (basic goal template)', free.items.length > 0);
check('free list carries the goal intro', /high-protein/i.test(free.intro));
check('free list has NO haul swaps (premium capability)', !free.items.some((i) => i.source === 'swap'));
check('free list ignores focuses — no chia/flax fiber item', !has(free, 'Chia or ground flax'));

/* ── PREMIUM: focuses shape the list + haul swaps ride in front ── */
const prem = generateList({
  goal: 'high_protein',
  nonNegotiables: [],
  focuses: ['higher_fiber'],
  nextList,
  signals: {},
  premium: true,
});
check('premium list prepends the haul swap', prem.items[0].source === 'swap' && /Sugary Cereal/.test(prem.items[0].name));
check('premium list adds a focus item (chia/flax for higher_fiber)', has(prem, 'Chia or ground flax'));
check('premium list is longer than the free one (swap + focus items)', prem.items.length > free.items.length);

/* ── Focuses genuinely change generation (premium) ── */
const noFocus = generateList({ goal: 'high_protein', focuses: [], premium: true });
const withFocus = generateList({ goal: 'high_protein', focuses: ['higher_fiber'], premium: true });
check('a focus changes the item set', withFocus.items.length > noFocus.items.length);
check('the change is the focus item', has(withFocus, 'Chia or ground flax') && !has(noFocus, 'Chia or ground flax'));

/* ── Tampering: even if focuses + swaps are passed, premium=false yields neither ── */
const tampered = generateList({
  goal: 'high_protein',
  focuses: ['higher_fiber', 'heart', 'lower_sodium'],
  nextList,
  premium: false,
});
check('tamper: focuses passed but premium=false → no focus item', !has(tampered, 'Chia or ground flax'));
check('tamper: swaps passed but premium=false → no swap row', !tampered.items.some((i) => i.source === 'swap'));

/* ── Hard lines exclude by tag (free + premium alike) ── */
const dairyFree = generateList({ goal: 'high_protein', nonNegotiables: ['dairy-free'], premium: true });
check('hard line excludes dairy items (Greek yogurt gone)', !has(dairyFree, 'Greek yogurt'));
check('hard line excludes dairy focus item too', !generateList({ goal: 'high_protein', nonNegotiables: ['dairy-free'], focuses: ['processed_fats'], premium: true }).items.some((i) => /butter or ghee/i.test(i.name)));

/* ── Learning signal: a removed item never comes back ── */
const pruned = generateList({ goal: 'high_protein', signals: { removed: ['Eggs'] }, premium: true });
check('removed item is suppressed', !has(pruned, 'Eggs'));

/* ── mergePendingSwaps: premium-only, adds to an existing list, deduped ── */
const existing = generateList({ goal: 'high_protein', premium: true }); // no swaps yet
const merged = mergePendingSwaps(existing, nextList, true);
check('merge adds the swap to an already-saved list', merged !== existing && merged.items[0].source === 'swap');
const mergedAgain = mergePendingSwaps(merged, nextList, true);
check('merge is idempotent (dedup by product)', mergedAgain.items.filter((i) => i.source === 'swap').length === 1);
const mergedFree = mergePendingSwaps(existing, nextList, false);
check('merge is a no-op for non-premium', mergedFree === existing);

console.log(failures === 0 ? '\nALL PASS' : `\n${failures} FAILED`);
process.exit(failures === 0 ? 0 : 1);
