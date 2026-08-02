// GUARDS AGAINST THE VACUOUS PASS.
//
// `[].every(fn)` is `true`. `for (const x of []) assert(...)` runs zero assertions and the
// test reports success. So a check over a collection that is EMPTY BY ACCIDENT does not
// fail — it congratulates you, which is worse than no check at all, because the suite now
// carries a green tick where the coverage used to be.
//
// This is not hypothetical. During the 2026-08-02 monetization work, a check read:
//
//     const ess = cards.filter((c) => c.essential);
//     console.log('essentials full?', ess.every((c) => c.why) ? 'yes' : 'NO');   // "yes"
//
// `essential` was missing from CARD_COLUMNS, so `ess` was empty, `[].every()` was true,
// and the boundary reported "essentials are served in full" while all eight of them were
// being gated. The bug shipped past its own verification.
//
// THE RULE: every assertion that ranges over a collection must also assert the collection
// is not empty. Wrap the collection at the point it is bound and the guard cannot be
// forgotten at the point it is used — an empty corpus then throws at import, and every
// test in that file is honest by construction rather than by discipline.

/**
 * Assert a collection has members, and return it.
 *
 * @param {Array|Map|Set} coll
 * @param {string} name  what it is, for the failure message
 * @param {number} [min=1]  the floor; raise it where a known size is part of the contract
 */
export function nonEmpty(coll, name, min = 1) {
  const size = coll == null ? 0 : (typeof coll.length === 'number' ? coll.length : coll.size);
  if (!(size >= min)) {
    throw new Error(
      `${name} has ${size} members (need ${min}+). Every assertion ranging over it would `
      + 'pass vacuously, so this fails loudly instead. Fix what produced the empty '
      + 'collection — the checks that read it are reporting nothing.'
    );
  }
  return coll;
}
