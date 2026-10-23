# Family cascade: server proposal (for Devon's approval, 2026-10-23)

Nothing in `server/` changes until this is approved. Source of structure: `docs/research/deepen/FAMILIES.md` (50 families, 12 aisle briefings, 205/205 cards assigned).

## 1. What is added
| Layer | Shape | Where it lives |
| --- | --- | --- |
| L1 aisle briefing | 3-5 lines per aisle (12) | new entries, `kind: 'aisle'` |
| L2 family card | one per family (about 50) | new entries, `kind: 'family'`, `id: fam_<slug>` |
| L3 item delta | free text on the existing card, any length that is needed, compact | new optional field `delta` on each member card |
| Pointer | member card names its family | new optional field `family` (a `fam_` id) |

L0 stance and L4 standalone cards are unchanged.

## 2. Code touched (small)
- `applyCardPatches.js`: whitelist `family`, `delta`, plus the family/aisle card fields.
- `counterCardLint.js`: `family` must resolve to an existing `fam_` entry; `delta` must not restate the family rule (reuse the tier-note self-reference check); family RULE passes the same claim-lock and no-price checks.
- `schemaContract.test.js`: the new fields exist in `counter_cards` migrations (one additive SQL file, unapplied until approved).
- Matching: family and aisle entries are NEVER matched by alias (hub-steal guard, `counterFloor.test.js`); they are reached only through the `family` pointer or the aisle id. Retrieval and the free `optionalAuth` counter path are unchanged.
- `verdictEngine.js` untouched (non-negotiable 5). Additive only.

## 3. Rulings that need amending
1. 2026-10-14 "section rules are holistic, never linked to an item card": amended so a member card MAY carry a `family` pointer. Family rules still state only what is true of every member; anything item-specific stays in the card or its `delta`.
2. Counter coaching: "ask the counter" lines only on cards bought at a staffed meat or fish counter; every other card uses a pack/shelf look-for/skip line (Devon 2026-10-23).
3. Brand avoidance is by trait, never by name (non-negotiable 9 stands): small, seasonal, local is the best rung; large-scale year-round shipped branded supply is the skip rung.

## 4. Free vs paid (needs a ruling; recommended in bold)
- A: everything free. Simple, but gives away the depth the trial sells.
- **B (Recommended): aisle briefing and family one-line rule free; family depth (`why`, season, storage, shopper questions) and every `delta` follow the existing paid depth fields. Matches "free summary, paid depth" in Money.**
- C: family cards free, deltas paid. Cleaner story, but the delta is where the item value is.
Today's baseline: free = eyebrow/headline/do line/cart pick/tier sentence; paid = `why`/`look_for`/`watch_out`/`detail`.

## 5. Order of work after approval
1. Findings (running now, `fam-*.md`), URL check, and Devon's call on the flour card (decision says sprouted first, short answer says freshly ground or soaked first).
2. Builder drafts patch JSON + family/aisle cards from the findings; `applyCardPatches --check`.
3. Server: field whitelist, lint, additive SQL; `cd server && npm test`, `commitGuard.js`.
4. Commit; migrate only on Devon's word. Every report states: code committed/pushed, corpus migrated/not.
