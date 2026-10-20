# clean-pick-6: B7a, the 17 produce picks name their own item organic

```json
{
  "id": "clean-pick-6",
  "tier": "T2",
  "ui": false,
  "owns": [
    "server/kristy_perimeter_kb.json",
    "server/test/acceptance/twoLinePin.js",
    "server/test/acceptance/w2.test.js",
    "server/test/acceptance/w4.test.js",
    "server/test/acceptance/ca-4b.test.js",
    "server/test/acceptance/ca-7.test.js",
    "server/test/acceptance/cleanPick1.test.js",
    "server/test/acceptance/cleanPick2.test.js",
    "server/test/acceptance/cleanPick2b.test.js",
    "server/test/acceptance/cleanPick3.test.js",
    "server/test/acceptance/cleanPick4.test.js",
    "server/test/acceptance/cleanPick5.test.js"
  ],
  "read_full": [
    "server/test/acceptance/twoLinePin.js",
    "server/test/acceptance/cleanPick1.test.js",
    "server/test/acceptance/cleanPick2.test.js",
    "server/test/acceptance/cleanPick2b.test.js",
    "server/test/acceptance/cleanPick3.test.js",
    "server/test/acceptance/cleanPick4.test.js",
    "server/test/acceptance/cleanPick5.test.js",
    "server/lib/testGuards.js",
    "server/lib/listMatch.js"
  ],
  "verify": "cd /Users/m1/kristy && node --test server/test/acceptance/cleanPick6.test.js && cd server && node scripts/twoLineCheck.js && node scripts/commitGuard.js && node scripts/listMatchProbe.js && npm test"
}
```

Repo `/Users/m1/kristy`, branch `main`, base `c6d3ff2` (the clean-pick-5 build). HEAD is 4ddeb34, the clean-pick-5 SHIP commit. Its subject says no KB or test change beyond c6d3ff2; the planner has not diffed the two, so the admin confirms that with `git diff --stat c6d3ff2 4ddeb34` before dispatch. If 4ddeb34 touched the KB, `docs/do-lines-review.md` or `server/lib/doLines.json`, the base ref in this spec and its test moves to 4ddeb34.
- Baseline `npm test`: **2903 pass / 0 fail**, as recorded in the c6d3ff2 and 4ddeb34 commit messages. The planner ran nothing, so the admin confirms the baseline before dispatch.
- Ship count: 2915 or more (2903 + 12). Not migrated: picks never migrate. `listMatch.js` reads picks from the KB file, so a `main` push is what puts the new lines in front of shoppers.

Env: node, npm, git. `server/.env` is not needed. No browser, no network, no writable dirs beyond the repo.

## Alignment

Devon's rulings behind this batch:
- 2026-10-20: "point them to the cleanest and healthiest version of the item they are getting."
- 2026-10-20: "everything should be organic, no additives, no synthetic bs, from nature, as close to the source as possible."
- `docs/CLEAN-PICK-PLAN.md` rulings (L359–363): **Q1 A**, organic on every produce item.
- Devon's "go make all decisions" (2026-10-20) and "keep going build and ship all greatly" are the approval for every other call below.

- **Done means:** Given the KB at c6d3ff2, when this lands, then:
  - each of the 17 picks below has a new `decision` that starts "Organic " plus its own item's name, and keeps the base line's mechanical read (the C3 phrase);
  - no other field of the 17 picks changes, and no other entry changes;
  - a shopper's list row typed as the pick's first alias (for example "cucumbers") gets that pick, and the line on the row is the new decision (C11);
  - every pick alias in the corpus, bare and with "organic " in front, routes to the same pick it did at c6d3ff2 (C12);
  - C1–C12 pass, and `npm test` reports 2915 or more passing with 0 fail.
- **Out of scope:**
  - every entry outside the 17;
  - on the 17, every field except `decision`: id, kind, title, category, aliases, sources;
  - the 13 other picks (B7b and the pick_juice do line);
  - `docs/do-lines-review.md` and `server/lib/doLines.json` (no pick of the 17 has a row; C7 asserts both byte-identical);
  - anything under `server/lib/`, routes, prompts;
  - migration.
- **OK rough edges:**
  - Organic on these lines rests on the B2/B2b produce material (`organic_worth_it_by_type`: "Organic across the produce aisle", and `label_organic_scope`), not on each pick's own sources. The pick sources (extension services, the National Mango Board) describe selection only.
  - The hub card says peeled fruit (mango) and sturdy vegetables (asparagus) "can wait" when organic runs short. The pick lines state the default, organic, and do not restate the shortage fallback; a pick has one line.
  - Rows that share a pick still read the pick's own item: "yellow squash" reads the zucchini line, "snow peas" the snap pea line, "turmeric" the ginger and turmeric line. All three are as at base.
  - "Organic <item>" rows may route to a card instead of a pick, as at base. C12 pins pick routing only; Ship notes list them for the probe.
- **Ship bar:** any of these blocks shipping:
  - any of C1–C12 red;
  - `npm test` below 2915 passing, or any fail;
  - twoLineCheck reports anything other than 0 of 181;
  - listMatchProbe reports a wrong match;
  - any edit to `server/test/acceptance/passRule.js`, `k9.test.js`, `k14.test.js`, `server/lib/pickReach.test.js`, or any live guard;
  - a pick decision that names another batch pick's item, a health effect, or a word lintPick vetoes.

## Change

Conventions (lintPick, `server/lib/counterCardLint.js` L870 onward, as read by the planner):
- one sentence, exactly one terminal period, no `?`;
- 16 words or fewer, as counted by the lint's `words` (hyphenated words count once);
- no digits, no em or en dash, no straight apostrophe, no first person;
- none of the MECHANICAL_VETO words (body, nutrition and outcome words, including sugar, weight, lower, heart, support, protect);
- American spelling.

**Per id, literally:** `decision` → the new value below. Nothing else on any entry changes.

### Old → new

The old values are the live KB values read by the planner at HEAD (4ddeb34). clean-pick-5 touched none of these 17 picks.

| id | old decision | new decision |
| --- | --- | --- |
| pick_cucumbers | Firm, dark green cucumbers, without soft spots or a bulging middle. | Organic cucumbers, firm and dark green, without soft spots or a bulging middle. |
| pick_asparagus | Asparagus with dry, closed, compact tips and no limp stalks. | Organic asparagus with dry, closed, compact tips and no limp stalks. |
| pick_corn | Corn with green husks and fresh silk, without dried-out ears. | Organic corn with green husks and fresh silk, without dried-out ears. |
| pick_eggplant | Heavy, shiny, smooth eggplant, with a green stem free of mold. | Organic eggplant, heavy, shiny and smooth, with a green stem free of mold. |
| pick_zucchini | Small-to-medium zucchini, glossy and firm, that feel heavy for their size. | Organic zucchini, small-to-medium, glossy and firm, that feel heavy for their size. |
| pick_cilantro | Bright, upright cilantro bunches, without yellow or brown leaves. | Organic cilantro in bright, upright bunches, without yellow or brown leaves. |
| pick_parsley | Upright, bright green parsley, without brown spots or yellowed leaves. | Organic parsley, upright and bright green, without brown spots or yellowed leaves. |
| pick_basil | Bright, upright basil with no limp leaves or brown spots. | Organic basil, bright and upright, with no limp leaves or brown spots. |
| pick_snap_peas | Firm, bright green snap pea pods, without blemishes. | Organic snap peas in firm, bright green pods, without blemishes. |
| pick_kohlrabi | Firm kohlrabi bulbs, heavy in your hand, without cracks or bruises. | Organic kohlrabi bulbs, firm and heavy in your hand, without cracks or bruises. |
| pick_okra | Firm, bright green okra, without limp, moldy or dried-out pods. | Organic okra, firm and bright green, without limp, moldy or dried-out pods. |
| pick_swiss_chard | Dark green chard with unsplit stalks and no discoloration. | Organic chard, dark green, with unsplit stalks and no discoloration. |
| pick_mangoes | Mangoes yielding slightly under gentle pressure; red color does not indicate ripeness. | Organic mangoes that yield slightly to gentle pressure; red color does not indicate ripeness. |
| pick_celery | Celery with tight, crisp stalks, without any limpness in the bunch. | Organic celery with tight, crisp stalks, without any limpness in the bunch. |
| pick_winter_squash | Firm, heavy-for-size squash with hard skin, without sunken or moldy spots. | Organic winter squash, firm and heavy-for-size, with hard skin and no sunken or moldy spots. |
| pick_ginger_turmeric | Firm roots, ginger smooth and uncracked; keep both sealed and refrigerated. | Organic ginger and turmeric roots, firm, ginger smooth and uncracked; keep both sealed and refrigerated. |
| pick_microgreens | Microgreens, rarely washed before packing, for you to rinse before use. | Organic microgreens, rarely washed before packing, for you to rinse before use. |

Subject notes:
- **pick_swiss_chard:** "Organic chard", not "Organic Swiss chard". The aliases are swiss chard, chard, chards and rainbow chard; chard covers all four rows.
- **pick_winter_squash:** the base line said "squash" alone. The new line says "winter squash" so a butternut or acorn row reads its own item. 15 words.
- **pick_ginger_turmeric:** names both roots, because the pick serves both ("ginger", "turmeric"). 15 words.
- **pick_mangoes:** "yield ... to" replaces "yielding ... under" so the sentence reads after the lead noun. The ripeness clause stays verbatim.
- **pick_snap_peas:** "snap peas", never "sugar snap": sugar is a vetoed word.
- Word counts (lint `words`): 13, 11, 11, 13, 11, 11, 12, 12, 10, 13, 12, 10, 13, 12, 15, 15, 11.

**If any old decision quoted here differs by even one character from the c6d3ff2 KB, the KB value wins for the base**; report the line. The new values are pinned by the acceptance file's `BECAME`, which is authoritative.

## Hard limits

- Never edit `server/test/acceptance/passRule.js`, `k9.test.js` or `k14.test.js`.
- Never edit `server/lib/pickReach.test.js`, `server/lib/listMatch.test.js`, or the live guards ic4b–ic8b, ca-3a, ca-3b, ca-5, `twoLinePin.test.js`, `counterCardLint.test.js`, k5–k24, counterProbe48, concernAdditives, concernSeedOilsB, concernGlyphosate, concernBioengineered, concernBpa, cardTidy, cardOrder, sugarsRank, ktight.
- Never edit the fixtures `w4.before.json` or `fixtures/kb-pre-readability.json`.
- A red in any live guard is a content defect: stop and report (see Answers).
- On the 17, change `decision` only. No alias, title, category or source moves.
- No entry outside the 17 changes (C6).
- Do not edit `server/lib/counterCardLint.js`, `counterCards.js`, `listMatch.js`, `perimeter.js`, `docs/do-lines-review.md`, `server/lib/doLines.json`, any route or any prompt.
- Do not run the migration or `buildDoLines.js`.

## Pins and older tests

Each older test that freezes a batch pick at an earlier ref is routed through one new overlay; no assertion is deleted. The old pick decisions sit in the w2 snapshot, the ca-4b and ca-7 maps and `w4.before.json` (planner grep for "dark green cucumbers", "rarely washed before packing", "unsplit stalks" and others); the overlay serves them the c6d3ff2 entry, which is what they passed against.

**twoLinePin.js (a) TWO_LINE repin:** none. TWO_LINE has no row for any of the 17, and `twoLineCheck.js` skips `kind === 'pick'`.

**twoLinePin.js (b) overlay.** Append this at the end of the file, after the clean-pick-5 block (L3405–3407). The file already imports `execFileSync` and defines `ROOT`.

```js
// clean-pick-6 (2026-10-20) moved these 17 produce pick lines to name their item organic; older batch tests read them as of c6d3ff2, and cleanPick6.test.js owns the new text.
export const CLEAN_PICK_6 = new Set(['pick_cucumbers', 'pick_asparagus', 'pick_corn', 'pick_eggplant', 'pick_zucchini', 'pick_cilantro', 'pick_parsley', 'pick_basil', 'pick_snap_peas', 'pick_kohlrabi', 'pick_okra', 'pick_swiss_chard', 'pick_mangoes', 'pick_celery', 'pick_winter_squash', 'pick_ginger_turmeric', 'pick_microgreens']);
const PRE_CP6 = JSON.parse(execFileSync('git', ['show', 'c6d3ff2:server/kristy_perimeter_kb.json'], { cwd: ROOT, maxBuffer: 64 << 20 }).toString());
export const preCleanPick6 = (e) => (e && CLEAN_PICK_6.has(e.id) ? PRE_CP6.entries.find((x) => x.id === e.id) : e);
```

**Routed tests.** In each file, add `preCleanPick6` to the existing `./twoLinePin.js` import, then make the change below:

| file | line | old → new |
| --- | --- | --- |
| w2.test.js | L14 | `kb.entries = kb.entries.map((e) => preTidy(preCleanPick(preCleanPick2(preCleanPick3(preCleanPick4(preCleanPick5(e)))))));` → `kb.entries = kb.entries.map((e) => preTidy(preCleanPick(preCleanPick2(preCleanPick3(preCleanPick4(preCleanPick5(preCleanPick6(e))))))));` |
| w4.test.js | L12 | `kb.entries = kb.entries.map((e) => preCleanPick(preCleanPick2(preCleanPick3(preCleanPick4(preCleanPick5(e))))));` → `kb.entries = kb.entries.map((e) => preCleanPick(preCleanPick2(preCleanPick3(preCleanPick4(preCleanPick5(preCleanPick6(e)))))));` |
| ca-4b.test.js | L20 | same chain as w2 (`const LIVE = structuredClone(kb);` at L19 stays before it) |
| ca-7.test.js | L16 | same chain as w2 |

The imports sit at w2 L9, w4 L11, ca-4b L3 and ca-7 L11. If a listed line reads differently from its "old" text, keep that line's existing chain, wrap the innermost `e` in `preCleanPick6(...)`, and report the line.

**cleanPick1.test.js:**
- The `LATER` Set (L225–228) ends with `/* clean-pick-5 */ 'tortilla_chips', …, 'hummus']);`. Append `/* clean-pick-6 */` and the 17 ids inside the same Set.
- The C6 floor (L305, `nonEmpty(…, 'other entries', 127)`) goes to 110. If the measured outside count is not 115, set the floor to that count minus 5.
- C7 already skips LATER rows; no change there.

**cleanPick2.test.js:**
- L8: `import { CLEAN_PICK_3, CLEAN_PICK_4, CLEAN_PICK_5 } from './twoLinePin.js';` → `import { CLEAN_PICK_3, CLEAN_PICK_4, CLEAN_PICK_5, CLEAN_PICK_6 } from './twoLinePin.js';`.
- L10: `const LATER = new Set([...CLEAN_PICK_3, ...CLEAN_PICK_4, ...CLEAN_PICK_5]);` → `const LATER = new Set([...CLEAN_PICK_3, ...CLEAN_PICK_4, ...CLEAN_PICK_5, ...CLEAN_PICK_6]);`.
- The C6 floor at L207 goes from 143 to 126. If the measured count is not 131, set the floor to that count minus 5.

**cleanPick2b.test.js:**
- L9 → `import { CLEAN_PICK_3, CLEAN_PICK_4, CLEAN_PICK_5, CLEAN_PICK_6 } from './twoLinePin.js';`.
- C3, L57: `if (CLEAN_PICK_3.has(e.id) || CLEAN_PICK_4.has(e.id) || CLEAN_PICK_5.has(e.id)) continue;` → `if (CLEAN_PICK_3.has(e.id) || CLEAN_PICK_4.has(e.id) || CLEAN_PICK_5.has(e.id) || CLEAN_PICK_6.has(e.id)) continue;`.

**cleanPick3.test.js:**
- L9: `import { CLEAN_PICK_4, CLEAN_PICK_5 } from './twoLinePin.js';` → `import { CLEAN_PICK_4, CLEAN_PICK_5, CLEAN_PICK_6 } from './twoLinePin.js';`.
- C6, L132: the `others` filter gains `&& !CLEAN_PICK_6.has(e.id)`.
- C6, L133: the floor goes from 160 to 143. If the measured count is not 148, set it to that count minus 5.
- C7 (L150) needs no change: picks have no do-lines-review row.

**cleanPick4.test.js:**
- L9: `import { CLEAN_PICK_5 } from './twoLinePin.js';` → `import { CLEAN_PICK_5, CLEAN_PICK_6 } from './twoLinePin.js';`.
- C6, L105: the `others` filter gains `&& !CLEAN_PICK_6.has(e.id)`.
- C6, L106: the floor goes from 179 to 162. If the measured count is not 169, set it to that count minus 5.
- C7 needs no change, for the same reason.

**cleanPick5.test.js** (dv wrote it at clean-pick-5; it has no twoLinePin import yet):
- After the `listMatch.js` import (L8), add `import { CLEAN_PICK_6 } from './twoLinePin.js';`.
- C6, L128: `const others = kb.entries.filter((e) => !IDS.includes(e.id));` → `const others = kb.entries.filter((e) => !IDS.includes(e.id) && !CLEAN_PICK_6.has(e.id));`.
- C6, L129: `nonEmpty(others, 'others', 190);` → `nonEmpty(others, 'others', 173);`. If the measured count is not 178, set it to that count minus 5.
- C7 and C10 need no change: picks have no review row, and C10 counts cp5's own strings.

**No change needed** (planner read):
- `concernAdditives.test.js` routes through preTidy/preCleanPick3–5, and none of the 17 is in its scope.
- `server/lib/pickReach.test.js` reads every pick live: lintCard on every pick, no pick alias landing on a card row, the pick line on a row equal to the entry's decision (L88), and the MODIFIED/COMPOUND/WRONG_FOOD rows ('fresh basil', 'ripe mangoes', 'large cucumbers', 'basil pesto', 'eggplant parm', 'corn tortillas', 'baby corn'). It must stay green unedited.
- `k14.test.js` pins routing for pick_winter_squash, pick_ginger_turmeric and pick_microgreens, lintPick on its picks, and their source URLs; it never reads decision text.
- `listMatch.test.js` builds its own pick_celery fixture.
- k15–k24 old-ref sweeps are alias routing only; ca-4a compares named ids not in this batch; ca-3a and ca-3b skip picks; the ic tests filter out picks.

## Criteria

- C1 [test] Given c6d3ff2, when the KB is read, then each of the 17 picks deepEquals its base entry with only `decision` replaced by its BECAME value, and that decision matches its carry (`^Organic <item>`).
- C2 [test] Given the 17 picks, then `lintPick` and `lintCard` each return [] and every decision is 16 words or fewer by the lint's `words`.
- C3 [test] Given the 17 picks, then each base decision and each live decision both match the id's keep phrase, so the mechanical read survives.
- C4 [test] Given the 17 new decisions, then none matches BANNED or TREATMENT, none has first person, "—", "–", a straight apostrophe, a digit or a `?`.
- C5 [test] Given the 17 picks, then no c6d3ff2 decision names organic, every live decision starts "Organic ", and the count of other picks whose decision names organic equals c6d3ff2.
- C6 [test] Given the entries outside the 17 (≥189), then each deepEquals c6d3ff2, and the entry count and every top-level key other than entries are unchanged.
- C7 [test] Given doLines.json and docs/do-lines-review.md, then the first deepEquals c6d3ff2 and the second is byte-identical to c6d3ff2.
- C8 [test] Given each of the 17 decisions, then it names no other batch pick's first alias and no generic produce phrase (organic produce, vegetables, fruit, herbs, greens).
- C9 [test] Given every alias of the 17 picks (≥70), then `matchItemToPick(alias)` returns that pick's id and `matchItemToCard(alias)` returns null.
- C10 [test] Given the 17 new decisions, then all 17 are distinct and no one of them sits on more than 2 entries [PLACEHOLDER threshold 2].
- C11 [test] Given a list row `{ name: aliases[0], source: 'user' }` for each of the 17, when `attachCards` runs with `log: false`, then the row carries `pickId` equal to the id, `pickLine` equal to the new decision, and no `cardSlug`.
- C12 [test] Given every pick alias in the c6d3ff2 corpus, bare and as "organic <alias>" (≥140 queries), then `matchItemToPick(q, kb.entries)?.id` equals `matchItemToPick(q, base.entries)?.id`.

## Ship notes

- **Nothing was executed while writing this spec.** Every routing result and lint outcome below was simulated by reading `server/lib/listMatch.js` (`matchItemToPick` L229, `aliasCoversRow` L261, `attachCards` L398) and `lintPick` (counterCardLint.js L870). **The admin runs the probe before `dv check`.** A miss means a spec revision.
- **C12 implements the plan's "every pick resolves through matchItemToCard to the same id it does at the base ref" through `matchItemToPick` with an injected base pool.** `matchItemToCard` never returns a pick (picks are excluded from its pool), and its card pool is frozen by C6, so the plan's wording would be true by construction. `matchItemToPick(q, pool)` is the function that resolves a pick, and its `pool` argument lets the test compute the base routing exactly.
- Simulated routing (not executed):

  | id | aliases | expected pick | card for bare alias | confidence |
  | --- | --- | --- | --- | --- |
  | pick_cucumbers | cucumbers, cucumber, english cucumber, persian cucumbers, mini cucumbers | own | null (pickReach) | confident |
  | pick_asparagus | asparagus, asparagus spears, asparagus spear, asparagus bunch | own | null | confident |
  | pick_corn | corn, sweet corn, ears of corn, ear of corn, corn cobs, corn cob | own | null | **PROBE**: "sweet" is inert, so "sweet corn" reads as corn; "organic corn" against the tortillas, popcorn and tortilla_chips cards |
  | pick_eggplant | eggplant, eggplants, globe eggplant, japanese eggplant | own | null | confident |
  | pick_zucchini | zucchini, zucchinis, summer squash, summer squashes, yellow squash | own | null | **PROBE**: "yellow" is inert; k14 pins the three squash rows |
  | pick_cilantro | cilantro, cilantro bunch, cilantro bunches, coriander leaves | own | null | **PROBE**: "coriander leaves" |
  | pick_parsley | parsley, parsley bunch, parsley bunches, italian parsley, flat leaf parsley | own | null | confident |
  | pick_basil | basil, basil bunch, basil bunches, sweet basil | own | null | **PROBE**: "sweet basil" |
  | pick_snap_peas | snap peas, snap pea, sugar snap peas, sugar snap pea, snow peas, snow pea | own | null | **PROBE**: snow peas against pick_frozen_peas |
  | pick_kohlrabi | kohlrabi, kohlrabis, kohlrabi bulb, kohlrabi bulbs | own | null | confident |
  | pick_okra | okra, okras, okra pods, okra pod | own | null | confident |
  | pick_swiss_chard | swiss chard, chard, chards, rainbow chard | own | null | confident |
  | pick_mangoes | mangoes, mango, mangos | own | null | confident |
  | pick_celery | celery, celery stalk(s), celery heart(s), celery stick(s), bunch of celery, bunches of celery | own | null | **PROBE**: "celery hearts", "bunch of celery" |
  | pick_winter_squash | winter squash, winter squashes, butternut squash, acorn squash, spaghetti squash | own | null | confident (k14) |
  | pick_ginger_turmeric | ginger, ginger root, ginger roots, turmeric, turmeric root, turmeric roots | own | null | confident (k14) |
  | pick_microgreens | microgreens, microgreen, micro greens | own | null | confident (k14) |

  Every "organic <alias>" query: pick expected equal to base (C12, by construction unless scoring reads decision text). Card routing for "organic <alias>" was not simulated; the organic hub card's aliases were not read. If one lands on a card, the row shows that card, as it did at base.
- **Organic grounding** is the B2/B2b hub, not the pick sources (OK rough edges). The critic checks no pick line adds a reason (residue, pesticide, nutrition) for organic; these lines carry the label word only.
- **lint risks not verified by running:** lintPick and lintCard on all 17 (C2); a veto word hiding inside a word the planner read as clean.
- Pin and test files beyond the KB: 11. Not split: each repoint is one import line plus one map chain, one skip or one floor, the same pattern B1–B6 shipped with.
- Commit message ends "Not migrated." Picks never migrate; a `main` push publishes them through `listMatch.js` on the server.

## Contract

```json
{
  "criteria": [
    {
      "id": "C1",
      "impl": ["server/kristy_perimeter_kb.json", "server/test/acceptance/twoLinePin.js"],
      "tests": ["server/test/acceptance/cleanPick6.test.js"],
      "dependents": [
        "server/test/acceptance/w2.test.js",
        "server/test/acceptance/w4.test.js",
        "server/test/acceptance/ca-4b.test.js",
        "server/test/acceptance/ca-7.test.js"
      ],
      "reads": ["git show c6d3ff2:server/kristy_perimeter_kb.json"],
      "expect": "17 picks equal base with only decision replaced; each starts Organic plus its item"
    },
    {
      "id": "C2",
      "impl": ["server/kristy_perimeter_kb.json"],
      "tests": ["server/test/acceptance/cleanPick6.test.js"],
      "dependents": ["server/lib/pickReach.test.js", "server/test/acceptance/k14.test.js"],
      "reads": ["server/lib/counterCardLint.js"],
      "expect": "lintPick and lintCard return [] on all 17; decisions at most 16 words"
    },
    {
      "id": "C3",
      "impl": ["server/kristy_perimeter_kb.json"],
      "tests": ["server/test/acceptance/cleanPick6.test.js"],
      "dependents": [],
      "reads": ["git show c6d3ff2:server/kristy_perimeter_kb.json"],
      "expect": "keep phrase in base and live decision for all 17"
    },
    {
      "id": "C4",
      "impl": ["server/kristy_perimeter_kb.json"],
      "tests": ["server/test/acceptance/cleanPick6.test.js"],
      "dependents": [],
      "reads": [],
      "expect": "17 decisions clean of banned, treatment, first person, dash, straight apostrophe, digit, question mark"
    },
    {
      "id": "C5",
      "impl": ["server/kristy_perimeter_kb.json"],
      "tests": ["server/test/acceptance/cleanPick6.test.js"],
      "dependents": [],
      "reads": ["git show c6d3ff2:server/kristy_perimeter_kb.json"],
      "expect": "organic absent from 17 base lines, leading all 17 live lines; other picks' organic count unchanged"
    },
    {
      "id": "C6",
      "impl": ["server/kristy_perimeter_kb.json"],
      "tests": ["server/test/acceptance/cleanPick6.test.js"],
      "dependents": [
        "server/test/acceptance/cleanPick1.test.js",
        "server/test/acceptance/cleanPick2.test.js",
        "server/test/acceptance/cleanPick2b.test.js",
        "server/test/acceptance/cleanPick3.test.js",
        "server/test/acceptance/cleanPick4.test.js",
        "server/test/acceptance/cleanPick5.test.js"
      ],
      "reads": ["git show c6d3ff2:server/kristy_perimeter_kb.json"],
      "expect": ">=189 outside entries deepEqual base; count and top-level keys unchanged"
    },
    {
      "id": "C7",
      "impl": ["server/kristy_perimeter_kb.json"],
      "tests": ["server/test/acceptance/cleanPick6.test.js"],
      "dependents": ["server/scripts/buildDoLines.js"],
      "reads": ["git show c6d3ff2:docs/do-lines-review.md", "git show c6d3ff2:server/lib/doLines.json"],
      "expect": "doLines.json deepEqual base; do-lines-review.md byte-identical"
    },
    {
      "id": "C8",
      "impl": ["server/kristy_perimeter_kb.json"],
      "tests": ["server/test/acceptance/cleanPick6.test.js"],
      "dependents": [],
      "reads": [],
      "expect": "no decision names another batch pick's first alias or a generic produce phrase"
    },
    {
      "id": "C9",
      "impl": ["server/kristy_perimeter_kb.json"],
      "tests": ["server/test/acceptance/cleanPick6.test.js"],
      "dependents": ["server/lib/listMatch.js", "server/lib/pickReach.test.js", "server/scripts/listMatchProbe.js"],
      "reads": [],
      "expect": ">=70 aliases route to their own pick and to no card"
    },
    {
      "id": "C10",
      "impl": ["server/kristy_perimeter_kb.json"],
      "tests": ["server/test/acceptance/cleanPick6.test.js"],
      "dependents": [],
      "reads": [],
      "expect": "17 distinct decisions, none on more than 2 entries"
    },
    {
      "id": "C11",
      "impl": ["server/kristy_perimeter_kb.json"],
      "tests": ["server/test/acceptance/cleanPick6.test.js"],
      "dependents": ["server/lib/listMatch.js", "server/lib/pickReach.test.js"],
      "reads": [],
      "expect": "attachCards row for aliases[0] carries pickId, pickLine equal to the new decision, no cardSlug"
    },
    {
      "id": "C12",
      "impl": ["server/kristy_perimeter_kb.json"],
      "tests": ["server/test/acceptance/cleanPick6.test.js"],
      "dependents": ["server/lib/listMatch.js", "server/test/acceptance/k14.test.js"],
      "reads": ["git show c6d3ff2:server/kristy_perimeter_kb.json"],
      "expect": ">=140 bare and organic-prefixed pick queries resolve to the base pick id"
    }
  ],
  "env": {
    "executables": ["node", "npm", "git"],
    "browsers": [],
    "temp": "none",
    "network": false
  }
}
```

## Answers

- **Suite runtime:** `npm test` is the full server suite (2903 at c6d3ff2). Run `node --test server/test/acceptance/cleanPick6.test.js` on its own first, and the full suite once, at the end.
- **Allowed reads:**
  - the files in owns and read_full;
  - `server/lib/counterCardLint.js` (lintPick, MECHANICAL_VETO), `server/lib/perimeter.js` (`pickEntries`), `server/lib/pickReach.test.js`, `server/test/acceptance/k14.test.js` and `server/scripts/twoLineCheck.js`, to read a red, never to edit;
  - `git show c6d3ff2:<path>`.
- **Admin pre-dispatch probe** (from `server/`, at HEAD, before `dv check`; it reads the base KB, so it checks the alias side of C9, C11 and C12, and the PROBE rows above matter most):

  ```
  node -e "import('./lib/listMatch.js').then(({ matchItemToPick, matchItemToCard }) => { for (const q of process.argv.slice(1)) for (const r of [q, 'organic ' + q]) console.log(r, '-> pick', matchItemToPick(r)?.id, '| card', matchItemToCard(r)?.slug); })" cucumbers asparagus corn "sweet corn" "ears of corn" eggplant zucchini "summer squash" "yellow squash" cilantro "coriander leaves" parsley "flat leaf parsley" basil "sweet basil" "snap peas" "sugar snap peas" "snow peas" kohlrabi okra "swiss chard" chard "rainbow chard" mangoes mango celery "celery hearts" "bunch of celery" "winter squash" "butternut squash" ginger turmeric "turmeric root" microgreens "micro greens"
  ```

  Expected: every bare query → its own pick and card `undefined`. Any bare alias that does not reach its own pick at base fails C9 after the build too; report it and the planner drops that alias from C9 (C12 still covers it).
- **If something goes red on a BECAME string**, whether lintPick, lintCard, a live guard (pickReach, k14, the k-series) or C9/C11/C12:
  - Stop and report RED with the lint output or the matched id.
  - The acceptance test pins every string, so a rewording is a spec revision, not a builder call. Never loosen a lint.
  - Pre-chosen fallbacks (the base line with "Organic" prefixed and its own lead adjective folded in):

    | id | fallback |
    | --- | --- |
    | pick_winter_squash, if over the word bar | Organic winter squash, firm and heavy-for-size, without sunken or moldy spots. |
    | pick_ginger_turmeric, if over the word bar | Organic ginger and turmeric, firm, ginger uncracked; keep both sealed and refrigerated. |
    | pick_mangoes, if a lint reads the semicolon | Organic mangoes that yield slightly to gentle pressure, whatever their red color. |
    | pick_eggplant, if a lint fires on the double comma | Organic eggplant that is heavy, shiny and smooth, with a green stem free of mold. |
- **If a test outside the routed list goes red on a batch pick at an older ref:** route it through `preCleanPick6` the same way, and list it in the report as an owns addition. A red on a live guard is a content defect, not a routing case.

## Tried and rejected

- **One shared line ("Organic produce, firm and fresh.")**: boilerplate. The plan bars it, and C8 and C10 catch it.
- **A cart_pick, buying_tips or watch_out on a pick to carry the organic standard:** PICK_FORBIDDEN_FIELDS in lintPick forbids every card field on a pick; the decision is the pick's only line.
- **A reason for organic in the line (residue, pesticides, eaten skin-on):** a reason is a claim, and a pick carries no tier or depth to hold one. The hub card owns the reasoning.
- **"Sugar snap peas" in the snap pea line:** sugar is a vetoed word.
- **"Organic Swiss chard":** reads wrong on a rainbow chard row.
- **Adding "organic <item>" aliases:** INERT_MODIFIERS already folds organic, and new aliases risk the pickReach no-card-steal guard.
- **Editing the live guards, pickReach or k14, or overlaying them:** the first is barred, and the second would hide content defects.
- **Moving the 13 other picks:** B7b owns them.

## Acceptance server/test/acceptance/cleanPick6.test.js

```js
// clean-pick-6 (Devon 2026-10-20, Q1 A organic on every produce): B7a, the 17 produce picks name their own item organic.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { nonEmpty } from '../../lib/testGuards.js';
import { lintCard, lintPick, words as lintWords } from '../../lib/counterCardLint.js';
import { attachCards, matchItemToCard, matchItemToPick } from '../../lib/listMatch.js';

const ROOT = fileURLToPath(new URL('../../../', import.meta.url));
const git = (ref) => execFileSync('git', ['show', ref], { cwd: ROOT, maxBuffer: 64 << 20 }).toString();
const kb = JSON.parse(readFileSync(new URL('../../kristy_perimeter_kb.json', import.meta.url), 'utf8'));
const base = JSON.parse(git('c6d3ff2:server/kristy_perimeter_kb.json'));
const find = (k, id) => k.entries.find((e) => e.id === id);
const live = (id) => find(kb, id);
const was = (id) => find(base, id);

const BECAME = {
  pick_cucumbers: { decision: 'Organic cucumbers, firm and dark green, without soft spots or a bulging middle.', carry: /^Organic cucumbers\b/, keep: /bulging middle/ },
  pick_asparagus: { decision: 'Organic asparagus with dry, closed, compact tips and no limp stalks.', carry: /^Organic asparagus\b/, keep: /closed, compact tips/ },
  pick_corn: { decision: 'Organic corn with green husks and fresh silk, without dried-out ears.', carry: /^Organic corn\b/, keep: /green husks and fresh silk/ },
  pick_eggplant: { decision: 'Organic eggplant, heavy, shiny and smooth, with a green stem free of mold.', carry: /^Organic eggplant\b/, keep: /green stem free of mold/ },
  pick_zucchini: { decision: 'Organic zucchini, small-to-medium, glossy and firm, that feel heavy for their size.', carry: /^Organic zucchini\b/, keep: /heavy for their size/ },
  pick_cilantro: { decision: 'Organic cilantro in bright, upright bunches, without yellow or brown leaves.', carry: /^Organic cilantro\b/, keep: /yellow or brown leaves/ },
  pick_parsley: { decision: 'Organic parsley, upright and bright green, without brown spots or yellowed leaves.', carry: /^Organic parsley\b/, keep: /brown spots or yellowed leaves/ },
  pick_basil: { decision: 'Organic basil, bright and upright, with no limp leaves or brown spots.', carry: /^Organic basil\b/, keep: /no limp leaves or brown spots/ },
  pick_snap_peas: { decision: 'Organic snap peas in firm, bright green pods, without blemishes.', carry: /^Organic snap peas\b/, keep: /without blemishes/ },
  pick_kohlrabi: { decision: 'Organic kohlrabi bulbs, firm and heavy in your hand, without cracks or bruises.', carry: /^Organic kohlrabi\b/, keep: /cracks or bruises/ },
  pick_okra: { decision: 'Organic okra, firm and bright green, without limp, moldy or dried-out pods.', carry: /^Organic okra\b/, keep: /limp, moldy or dried-out pods/ },
  pick_swiss_chard: { decision: 'Organic chard, dark green, with unsplit stalks and no discoloration.', carry: /^Organic chard\b/, keep: /unsplit stalks and no discoloration/ },
  pick_mangoes: { decision: 'Organic mangoes that yield slightly to gentle pressure; red color does not indicate ripeness.', carry: /^Organic mangoes\b/, keep: /red color does not indicate ripeness/ },
  pick_celery: { decision: 'Organic celery with tight, crisp stalks, without any limpness in the bunch.', carry: /^Organic celery\b/, keep: /tight, crisp stalks/ },
  pick_winter_squash: { decision: 'Organic winter squash, firm and heavy-for-size, with hard skin and no sunken or moldy spots.', carry: /^Organic winter squash\b/, keep: /heavy-for-size/ },
  pick_ginger_turmeric: { decision: 'Organic ginger and turmeric roots, firm, ginger smooth and uncracked; keep both sealed and refrigerated.', carry: /^Organic ginger and turmeric\b/, keep: /sealed and refrigerated/ },
  pick_microgreens: { decision: 'Organic microgreens, rarely washed before packing, for you to rinse before use.', carry: /^Organic microgreens\b/, keep: /rinse before use/ },
};
const IDS = Object.keys(BECAME);
const BANNED = /\b(health|healthy|healthier|safer|risk|cancer|disease|toxic|toxin|detox|pesticide-free|synthetic|price|cost|cheap|expensive)\b/i;
const TREATMENT = /\b(causes?|prevents?|lowers? (the )?risk|carcinogen|cancer|tumou?rs?|toxic|unsafe|harm\w*|risks?|linked to|hyperactiv|behaviou?r|attention|neurobehavioral|exacerbate)/i;
const GENERIC = /\borganic (produce|vegetables?|veg|fruits?|herbs?|greens)\b/i;
const ORGANIC = /\borganic\b/i;
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const isPick = (e) => e && e.kind === 'pick';

nonEmpty(IDS, 'IDS', 17);

test('C1 the 17 picks equal their base entries with only the decision replaced, each naming its own item organic', () => {
  for (const id of IDS) {
    assert.ok(live(id) && was(id), `${id} missing`);
    assert.deepEqual(live(id), { ...structuredClone(was(id)), decision: BECAME[id].decision }, id);
    assert.match(live(id).decision, BECAME[id].carry, `${id} carry`);
  }
});

test('C2 every new pick line passes lintPick and lintCard and holds 16 words or fewer', () => {
  for (const id of IDS) {
    assert.deepEqual(lintPick(live(id)), [], `${id} lintPick`);
    assert.deepEqual(lintCard(live(id)), [], `${id} lintCard`);
    assert.ok(lintWords(live(id).decision) <= 16, `${id} ${lintWords(live(id).decision)} words`);
  }
});

test('C3 the base mechanical read survives in every new line', () => {
  for (const id of IDS) {
    assert.match(was(id).decision, BECAME[id].keep, `${id} keep phrase not in base`);
    assert.match(live(id).decision, BECAME[id].keep, `${id} keep phrase lost`);
  }
});

test('C4 no new line carries a banned or treatment word, first person, a dash, a straight apostrophe, a digit or a question mark', () => {
  const all = IDS.map((id) => BECAME[id].decision);
  nonEmpty(all, 'decisions', 17);
  for (const s of all) {
    assert.doesNotMatch(s, BANNED, s);
    assert.doesNotMatch(s, TREATMENT, s);
    assert.doesNotMatch(s, /\b(I|me|my|mine|we|our|ours|us)\b/, s);
    assert.ok(!s.includes('—') && !s.includes('–'), s);
    assert.ok(!s.includes("'"), s);
    assert.doesNotMatch(s, /[0-9?]/, s);
  }
});

test('C5 organic is new on all 17 lines and unchanged on every other pick', () => {
  for (const id of IDS) {
    assert.doesNotMatch(was(id).decision, ORGANIC, `${id} base already organic`);
    assert.ok(live(id).decision.startsWith('Organic '), id);
  }
  const otherPicks = (k) => k.entries.filter((e) => isPick(e) && !IDS.includes(e.id));
  nonEmpty(otherPicks(base), 'other picks', 8);
  const count = (k) => otherPicks(k).filter((e) => ORGANIC.test(e.decision || '')).length;
  assert.equal(count(kb), count(base));
});

test('C6 entries outside the batch deepEqual c6d3ff2; count and top-level keys unchanged', () => {
  const others = kb.entries.filter((e) => !IDS.includes(e.id));
  nonEmpty(others, 'others', 189);
  assert.equal(kb.entries.length, base.entries.length);
  for (const e of others) assert.deepEqual(e, was(e.id), e.id);
  assert.deepEqual(Object.keys(kb).sort(), Object.keys(base).sort());
  for (const k of Object.keys(base)) if (k !== 'entries') assert.deepEqual(kb[k], base[k], k);
});

test('C7 doLines.json and do-lines-review.md are unchanged from c6d3ff2', () => {
  const now = JSON.parse(readFileSync(new URL('../../lib/doLines.json', import.meta.url), 'utf8'));
  assert.deepEqual(now, JSON.parse(git('c6d3ff2:server/lib/doLines.json')));
  const review = readFileSync(new URL('../../../docs/do-lines-review.md', import.meta.url), 'utf8');
  nonEmpty(review.split('\n'), 'review lines', 150);
  assert.equal(review, git('c6d3ff2:docs/do-lines-review.md'));
});

test('C8 each line names its own item, never another batch pick or generic produce', () => {
  const heads = IDS.map((id) => [id, live(id).aliases[0]]);
  nonEmpty(heads, 'heads', 17);
  for (const id of IDS) {
    const d = live(id).decision;
    assert.doesNotMatch(d, GENERIC, `${id} generic`);
    for (const [other, a] of heads) {
      if (other === id) continue;
      assert.doesNotMatch(d, new RegExp(`\\b${esc(a)}\\b`, 'i'), `${id} names ${a}`);
    }
  }
});

test('C9 every alias of the 17 reaches its own pick and no card', () => {
  const rows = IDS.flatMap((id) => live(id).aliases.map((a) => [a, id]));
  nonEmpty(rows, 'aliases', 70);
  for (const [a, id] of rows) {
    assert.equal(matchItemToPick(a)?.id, id, `${a} -> pick ${matchItemToPick(a)?.id}`);
    assert.equal(matchItemToCard(a), null, `${a} -> card ${matchItemToCard(a)?.slug}`);
  }
});

test('C10 the 17 lines are distinct and none sits on more than 2 entries', () => {
  const all = IDS.map((id) => BECAME[id].decision);
  assert.equal(new Set(all).size, 17);
  for (const s of all) {
    const n = kb.entries.filter((e) => [e.decision, e.cart_pick, e.tier_note, ...(e.buying_tips || []), ...(e.watch_out || [])].includes(s)).length;
    assert.ok(n <= 2, `${s} on ${n} entries`);
  }
});

test('C11 a list row of each pick’s first alias carries the new organic line', () => {
  for (const id of IDS) {
    const name = live(id).aliases[0];
    const row = attachCards({ items: [{ name, source: 'user' }] }, { log: false }).items[0];
    assert.equal(row.pickId, id, `${name} pickId ${row.pickId}`);
    assert.equal(row.pickLine, BECAME[id].decision, `${name} pickLine`);
    assert.equal(row.cardSlug, undefined, `${name} cardSlug ${row.cardSlug}`);
  }
});

test('C12 every pick alias, bare and organic, resolves to the same pick as at c6d3ff2', () => {
  const queries = base.entries.filter(isPick).flatMap((e) => (e.aliases || []).flatMap((a) => [a, `organic ${a}`]));
  nonEmpty(queries, 'queries', 140);
  for (const q of queries) {
    const now = matchItemToPick(q, kb.entries)?.id;
    const then = matchItemToPick(q, base.entries)?.id;
    assert.equal(now, then, `${q}: ${then} -> ${now}`);
  }
});
```
