/* THE FIVE VERDICT TIERS COLLAPSE INTO THREE HAUL BUCKETS, in ONE place on this client.
   It was in two — `HaulMoment.jsx` as `bucketOf` and `data.js` as `haulBucket`, byte-identical
   logic kept in step by whoever remembered. The 2026-08-05 duplication survey found it is
   really THREE copies, because `server/lib/haul.js` has the same function and is the authority:
   the server buckets the distribution it sends down.

   THE MIRROR IS UNAVOIDABLE AND THAT IS WHY IT IS TESTED. Demo has no backend by design, and
   the Haul renders bar segment colours locally, so the client needs the mapping in process.
   `tierBucketMirror.test.js` reads BOTH files and fails on any drift — the
   `listSectionsMirror.test.js` treatment, which is the only pattern in this repo that has held.

   THE DEFAULT IS LOAD-BEARING. Anything unrecognised buckets to 'swap', which is what makes an
   unknown tier render RED rather than silently counting as approved. That is also why a bought
   row with no tier at all must never reach this function: `bought` rides as its own field with
   its own count, and the bar stays a distribution of VERDICTS. An unscanned item honestly has
   none. Do not "fix" the default to be lenient. */
export function tierBucket(tier) {
  if (tier === 'approved') return 'approved';
  if (tier === 'approved_with_note' || tier === 'use_with_intention') return 'note';
  return 'swap'; // swap_recommended | skip | anything unrecognised
}
