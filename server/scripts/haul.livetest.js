// Acceptance — the Haul (Step 7). Distribution + bucketing are deterministic; the
// weekly read makes one real Haiku call.
//   node --use-system-ca scripts/haul.livetest.js   (needs ANTHROPIC_API_KEY)

import 'dotenv/config';
import { distribution, tierBucket, generateHaulRead } from '../lib/haul.js';

let fails = 0;
const ck = (n, c) => { console.log(`  ${c ? '✓' : '✗ FAIL'} ${n}`); if (!c) fails++; };

const scans = [
  { id: 1, product_name: 'Greek Yogurt', tier: 'approved' },
  { id: 2, product_name: 'Olive Oil', tier: 'approved' },
  { id: 3, product_name: 'Cheerios', tier: 'approved_with_note' },
  { id: 4, product_name: 'Canned Soup', tier: 'use_with_intention' },
  { id: 5, product_name: 'Doritos', tier: 'swap_recommended' },
  { id: 6, product_name: 'Oreos', tier: 'skip' },
];

console.log('\n═══ DISTRIBUTION (deterministic) ═══');
ck('bucket: approved', tierBucket('approved') === 'approved');
ck('bucket: note (approved_with_note + use_with_intention)', tierBucket('approved_with_note') === 'note' && tierBucket('use_with_intention') === 'note');
ck('bucket: swap (swap_recommended + skip)', tierBucket('swap_recommended') === 'swap' && tierBucket('skip') === 'swap');
const d = distribution(scans);
console.log('  distribution:', JSON.stringify(d));
ck('accurate counts: 2 approved / 2 note / 2 swap / 6 total', d.approved === 2 && d.note === 2 && d.swap === 2 && d.total === 6);
ck('empty haul → all zeros', JSON.stringify(distribution([])) === JSON.stringify({ approved: 0, note: 0, swap: 0, total: 0 }));

console.log('\n═══ WEEKLY READ (live, session-generated) ═══');
const FORBIDDEN = /\b(treats?|manages?|cures?|reverses?|diagnos)\b|you have (diabetes|a condition)|your (diabetes|condition|disease)/i;
try {
  const read = await generateHaulRead({ scans, distribution: d, goal: 'cut', focuses: ['lower_sugar'] });
  console.log('\n  read:', read, '\n');
  ck('read is a non-empty session-generated hook', !!read && read.length > 20);
  ck('read carries no treatment/diagnosis claim', !FORBIDDEN.test(read));
  ck('empty haul → no read', (await generateHaulRead({ scans: [], distribution: distribution([]) })) === '');
  console.log(`\n${fails === 0 ? 'ALL HAUL CHECKS PASSED ✓' : fails + ' CHECK(S) FAILED ✗'}\n`);
  process.exit(fails === 0 ? 0 : 1);
} catch (err) {
  console.error('\nLive test error:', err?.message || err);
  process.exit(1);
}
