# clean-pick-7: B7b, 9 of the 12 remaining picks name their own item's cleanest version; 3 are held

```json
{
  "id": "clean-pick-7",
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
    "server/test/acceptance/cleanPick5.test.js",
    "server/test/acceptance/cleanPick6.test.js"
  ],
  "read_full": [
    "server/test/acceptance/twoLinePin.js",
    "server/test/acceptance/cleanPick1.test.js",
    "server/test/acceptance/cleanPick2.test.js",
    "server/test/acceptance/cleanPick2b.test.js",
    "server/test/acceptance/cleanPick3.test.js",
    "server/test/acceptance/cleanPick4.test.js",
    "server/test/acceptance/cleanPick5.test.js",
    "server/test/acceptance/cleanPick6.test.js",
    "server/lib/testGuards.js",
    "server/lib/listMatch.js"
  ],
  "verify": "cd /Users/m1/kristy && node --test server/test/acceptance/cleanPick7.test.js && cd server && node scripts/twoLineCheck.js && node scripts/commitGuard.js && node scripts/listMatchProbe.js && npm test"
}
```

Repo `/Users/m1/kristy`, branch `main`, base `e3b4a68`, the clean-pick-6 build commit (the wip commit after 25c2017). **The admin substitutes `e3b4a68` and `2917` everywhere in this file, the acceptance block included, before `dv check`.** If the clean-pick-6 SHIP commit touches the KB, `docs/do-lines-review.md`, `server/lib/doLines.json` or any owned test, the base moves to that commit.
- Baseline `npm test`: **`2917` pass / 0 fail** (2915 or more, as recorded at the clean-pick-6 build). The planner ran nothing; the admin confirms the baseline before dispatch.
- Ship count: `2917` + 13 or more (cleanPick7.test.js holds 13 tests). Not migrated: picks never migrate. `listMatch.js` reads picks from the KB file, so a `main` push is what puts the new lines in front of shoppers.

Env: node, npm, git. `server/.env` is not needed. No browser, no network, no writable dirs beyond the repo.

## Alignment

Devon's rulings behind this batch:
- 2026-10-20: "point them to the cleanest and healthiest version of the item they are getting."
- 2026-10-20: "everything should be organic, no additives, no synthetic bs, from nature, as close to the source as possible."
- `docs/CLEAN-PICK-PLAN.md`: B7b ids (L322), the picks table (T1 item standard, T2 no additives, T3 unenriched, T4 closest to source), C5 (only T1 rows whose standard is organic gain "organic"), Extra C12 (L323), and the OK rough edge "a call that cannot be backed stays unchanged and goes to ship notes".
- Devon's "go make all decisions" (2026-10-20) is the approval for every call below.

- **Done means:** Given the KB at `e3b4a68`, when this lands, then:
  - the 9 picks below each have a new `decision` that leads with their own item's cleanest version and keeps the base line's mechanical read (C1, C3);
  - organic lands on exactly pick_frozen_peas, pick_frozen_broccoli, pick_canned_tomatoes and pick_tofu; jerky, fish sticks, juice, english muffins and pita do not gain it (C5);
  - pick_sausage, pick_egg_whites and pick_soup_bones are byte-equal to base (C6, C13);
  - no other field of the 9 changes, and no other entry changes (C1, C6);
  - a list row typed as the pick's first alias gets that pick, and the row's line is the new decision (C11);
  - every pick alias, bare and as "organic <alias>", routes to the same pick as at base (C12);
  - C1–C13 pass, and `npm test` reports `2917` + 13 or more passing with 0 fail.
- **Out of scope:**
  - the 3 held picks (see Ship notes for why);
  - every entry outside the 9; on the 9, every field except `decision`;
  - `docs/do-lines-review.md` and `server/lib/doLines.json` (the pick_juice do line stays byte-identical; C7);
  - `server/lib/counterCardLint.js` and every lint, anything else under `server/lib/`, routes, prompts;
  - migration.
- **OK rough edges:**
  - The new standards (not from concentrate, whole fillet, whole-muscle, unenriched, no preservatives or seed oil, organic) rest on the plan's picks table and the hub cards, not on each pick's own sources.
  - "meat sticks" and "turkey jerky" rows read the whole-muscle beef jerky line; they read "Beef jerky" at base too.
  - The naan half of pick_pita_naan still allows enriched flour; the line has one subject's worth of room.
  - pick_jerky carries T4 (whole-muscle) but not T1 (grass-fed); see Ship notes.
- **Ship bar:** any of these blocks shipping:
  - any of C1–C13 red;
  - `npm test` below `2917` + 13 passing, or any fail;
  - twoLineCheck reports anything other than 0 of 181;
  - listMatchProbe reports a wrong match;
  - any edit to a Hard-limits file;
  - a pick decision that names another batch pick's item, a health effect, or a word lintPick vetoes.

## Change

Conventions (lintPick, `server/lib/counterCardLint.js` L870 onward, as read by the planner): one sentence, exactly one terminal period, no `?`; 16 words or fewer by the lint's `words` (hyphenated words count once); no digits, no em or en dash, no straight apostrophe, no first person; none of the MECHANICAL_VETO words (including sugar, health, protein, lower, support, protect); American spelling.

**Per id, literally:** `decision` → the new value below. Nothing else on any entry changes.

### Old → new

Old values are the live KB values read by the planner at 25c2017. clean-pick-6 touches none of these ids.

| id | old decision | new decision | words |
| --- | --- | --- | --- |
| pick_frozen_peas | Peas frozen solid, with no pack drips or off smell. | Organic peas frozen solid, with no pack drips or off smell. | 11 |
| pick_frozen_broccoli | Broccoli frozen solid; pack drips or off smell mean it thawed. | Organic broccoli frozen solid; pack drips or off smell mean it thawed. | 11 |
| pick_canned_tomatoes | Skip dented, rusted or swollen cans and read for BPA-free; the date is a quality mark. | Organic tomatoes: skip dented, rusted or swollen cans and read for BPA-free; the date marks quality. | 16 |
| pick_tofu | Tofu by firmness: soybeans, water, coagulant such as nigari or gypsum. | Organic tofu by firmness: soybeans, water, coagulant such as nigari or gypsum. | 12 |
| pick_jerky | Beef jerky with a short list; celery powder supplies nitrite. | Whole-muscle beef jerky with a short list; celery powder supplies nitrite. | 11 |
| pick_fish_sticks | Read under the name for “made from minced fish”, set in bold. | Wild-caught fish sticks from whole fillet, not ones labeled “made from minced fish” in bold. | 15 |
| pick_juice | Usually pasteurized, with untreated cold-case juice bearing warning labels; read ingredients: no added color over dyes. | Juice not from concentrate: pasteurized, or untreated with warning labels; no added color over dyes. | 15 |
| pick_english_muffins | English muffins with whole wheat flour as the first ingredient. | English muffins with whole wheat flour as the first ingredient, no preservatives or seed oil. | 15 |
| pick_pita_naan | Pita with whole wheat flour first; naan is the richer one, made with yogurt. | Unenriched pita with whole wheat flour first; naan is the richer one, made with yogurt. | 15 |

**Unchanged (held):** pick_sausage, pick_egg_whites, pick_soup_bones.

Subject notes:
- **Organic set (plan C5):** the four T1 rows whose standard is organic (frozen peas, frozen broccoli, canned tomatoes, organic soy for tofu). Juice, english muffins and pita are T2/T3/T4 rows and stay non-organic; fish sticks is seafood (plan: "salmon shows organic" is broken), so wild-caught.
- **pick_canned_tomatoes:** the base line is 16 words already, so "Organic tomatoes:" replaces "Skip" with "skip" and "is a quality mark" becomes "marks quality". 16 words, at the lint bar. The row reads "canned tomatoes", so "tomatoes" names the item.
- **pick_juice:** must keep, live and unedited, every concernAdditives C1/C4 fact: pasteurized, warning label, a dye word, "no added color", 20 words or fewer, same keys. All four stay. "Cold-case" goes; the untreated-carries-a-warning fact stays.
- **pick_jerky:** ca-3b C1 (14 words or fewer) and C2 (no grass-fed/grass-finished in a CA-3b decision) read this decision live; both hold. concernDeli C5 (/celery/) holds.
- **pick_fish_sticks:** curly quotes as at base. "Whole fillet" is the other form the minced-fish label rule names.

**If any old decision quoted here differs by even one character from the `e3b4a68` KB, the KB value wins for the base**; report the line. The new values are pinned by the acceptance file's `BECAME`, which is authoritative.

## Hard limits

- Never edit `server/test/acceptance/passRule.js`, `k9.test.js` or `k14.test.js`.
- Never edit `server/lib/pickReach.test.js`, `server/lib/listMatch.test.js`, `server/lib/counterCardLint.test.js`, or the live guards ic4b–ic8b, ca-1, ca-3a, ca-3b, ca-4a, ca-5, `twoLinePin.test.js`, k5–k24, k3-0, k3-1, counterProbe48, concernAdditives, concernSeedOilsB, concernGlyphosate, concernBioengineered, concernBpa, concernDeli, concernEggs, cardTidy, cardOrder, sugarsRank, ktight.
- Never edit the fixtures `w4.before.json` or `fixtures/kb-pre-readability.json`.
- A red in any live guard is a content defect: stop and report (see Answers).
- On the 9, change `decision` only. No alias, title, category or source moves.
- pick_sausage, pick_egg_whites, pick_soup_bones and every other entry outside the 9 stay byte-equal (C6).
- Do not edit `server/lib/counterCardLint.js`, `counterCards.js`, `listMatch.js`, `perimeter.js`, `sectionRules.json`, `docs/do-lines-review.md`, `server/lib/doLines.json`, any route or any prompt.
- Do not run the migration or `buildDoLines.js`.

## Pins and older tests

Each older test that freezes a batch pick at an earlier ref is routed through one new overlay; no assertion is deleted.

**twoLinePin.js (a) TWO_LINE repin.** `TWO_LINE` carries non-enumerable `PICK_PINS` rows `{ decision, sources }` (defined near L3226–3286, attached by `defineProperties` near L3300), and the pin test asserts each pinned field deepEquals live. Three rows hold a batch decision. In each, replace only the `decision` string value; `sources` and the `pick_sausage` row stay:

| row (near) | old decision | new decision |
| --- | --- | --- |
| `pick_jerky` (L3252) | Beef jerky with a short list; celery powder supplies nitrite. | Whole-muscle beef jerky with a short list; celery powder supplies nitrite. |
| `pick_juice` (L3273) | Usually pasteurized, with untreated cold-case juice bearing warning labels; read ingredients: no added color over dyes. | Juice not from concentrate: pasteurized, or untreated with warning labels; no added color over dyes. |
| `pick_canned_tomatoes` (L3286) | Skip dented, rusted or swollen cans and read for BPA-free; the date is a quality mark. | Organic tomatoes: skip dented, rusted or swollen cans and read for BPA-free; the date marks quality. |

`beforeTwoLine` and `beforeConcern` restore from their own old refs by key, so the repin does not move them.

**twoLinePin.js (b) overlay.** Append this at the end of the file, after the clean-pick-6 block (`CLEAN_PICK_6` / `PRE_CP6` / `preCleanPick6`). The file already imports `execFileSync` and defines `ROOT`.

```js
// clean-pick-7 (2026-10-20) moved these 9 pick lines to each item's own cleanest version; older batch tests read them as of e3b4a68, and cleanPick7.test.js owns the new text.
export const CLEAN_PICK_7 = new Set(['pick_frozen_peas', 'pick_frozen_broccoli', 'pick_canned_tomatoes', 'pick_tofu', 'pick_jerky', 'pick_fish_sticks', 'pick_juice', 'pick_english_muffins', 'pick_pita_naan']);
const PRE_CP7 = JSON.parse(execFileSync('git', ['show', 'e3b4a68:server/kristy_perimeter_kb.json'], { cwd: ROOT, maxBuffer: 64 << 20 }).toString());
export const preCleanPick7 = (e) => (e && CLEAN_PICK_7.has(e.id) ? PRE_CP7.entries.find((x) => x.id === e.id) : e);
```

**Routed tests.** In each file, add `preCleanPick7` to the existing `./twoLinePin.js` import, then wrap the innermost `e` of the existing chain:

| file | line (near) | old → new |
| --- | --- | --- |
| w2.test.js | L14 | `…preCleanPick5(preCleanPick6(e))))))));` → `…preCleanPick5(preCleanPick6(preCleanPick7(e)))))))));` |
| w4.test.js | L12 | `…preCleanPick5(preCleanPick6(e)))))));` → `…preCleanPick5(preCleanPick6(preCleanPick7(e))))))));` |
| ca-4b.test.js | L20 | same as w2 (`const LIVE = structuredClone(kb);` stays before it) |
| ca-7.test.js | L16 | same as w2 |

If a line reads differently, keep its chain, wrap the innermost `e` in `preCleanPick7(...)`, and report the line.

**Later-batch skips and floors.** Each cleanPick test that pins "everything else equals my base" learns the 9 ids. Floors drop by 9. Rule for every floor: if the measured count is not the expected one, set the floor to the measured count minus 5 and report it.

- **cleanPick1.test.js:** the `LATER` Set ends with `/* clean-pick-6 */ 'pick_cucumbers', …, 'pick_microgreens']);`. Append `/* clean-pick-7 */` and the 9 ids inside the same Set. The C6 `nonEmpty(…, 'other entries', 110)` floor → 101 (expected measured 106).
- **cleanPick2.test.js:** import `{ CLEAN_PICK_3, CLEAN_PICK_4, CLEAN_PICK_5, CLEAN_PICK_6 }` → add `CLEAN_PICK_7`; `const LATER = new Set([...CLEAN_PICK_3, ...CLEAN_PICK_4, ...CLEAN_PICK_5, ...CLEAN_PICK_6]);` → add `...CLEAN_PICK_7`; C6 floor 126 → 117 (expected measured 122).
- **cleanPick2b.test.js:** import → add `CLEAN_PICK_7`; C3 skip `… || CLEAN_PICK_6.has(e.id)) continue;` → `… || CLEAN_PICK_6.has(e.id) || CLEAN_PICK_7.has(e.id)) continue;`.
- **cleanPick3.test.js:** import `{ CLEAN_PICK_4, CLEAN_PICK_5, CLEAN_PICK_6 }` → add `CLEAN_PICK_7`; the C6 `others` filter gains `&& !CLEAN_PICK_7.has(e.id)`; C6 floor 143 → 134 (expected measured 139).
- **cleanPick4.test.js:** import `{ CLEAN_PICK_5, CLEAN_PICK_6 }` → add `CLEAN_PICK_7`; C6 `others` filter gains `&& !CLEAN_PICK_7.has(e.id)`; C6 floor 162 → 153 (expected measured 160).
- **cleanPick5.test.js:** import `{ CLEAN_PICK_6 }` → `{ CLEAN_PICK_6, CLEAN_PICK_7 }`; C6 `others` filter gains `&& !CLEAN_PICK_7.has(e.id)`; C6 floor 173 → 164 (expected measured 169).
- **cleanPick6.test.js** (written by dv at clean-pick-6; no twoLinePin import yet):
  - after the `listMatch.js` import, add `import { CLEAN_PICK_7 } from './twoLinePin.js';`;
  - C5: `const otherPicks = (k) => k.entries.filter((e) => isPick(e) && !IDS.includes(e.id));` → `const otherPicks = (k) => k.entries.filter((e) => isPick(e) && !IDS.includes(e.id) && !CLEAN_PICK_7.has(e.id));` (B7b adds organic to 4 picks, which cp6's "other picks' organic count unchanged" would read as a regression);
  - C6: `const others = kb.entries.filter((e) => !IDS.includes(e.id));` → `… !IDS.includes(e.id) && !CLEAN_PICK_7.has(e.id));`; floor 189 → 180 (expected measured 185);
  - C1–C4 and C7–C12 need no change: they read cp6's own 17 ids, doLines (unchanged) and pick routing (unchanged).

**No change needed** (planner read):
- `concernAdditives.test.js` reads pick_juice live (not overlaid); the new line holds C1 (dye word, "no added color"), C4 (pasteurized, warning label, dye, ≤20 words, same keys) and C6 (no BAN word). C13 re-asserts these.
- `ca-3b.test.js` reads pick_jerky through `beforeConcern` (sources only), so the decision is live: C1 ≤14 words (11), C2 no grass term, C4 pass rule (decision is rewritable; no number in the old text), C5 no brand/claim/price word, C6 meat lintSections clean.
- `concernDeli` C5 (/celery/ on jerky and sausage) holds; sausage is unchanged.
- `ca-3a.test.js`, `concernEggs.test.js` and `ca-4a.test.js` read the held picks; held means untouched.
- `concernBpa` reads pick_canned_tomatoes through `preTidy`; cardTidy and cardOrder read a frozen ref.
- `k15`, `k16`, `k18` run lintPick and prose bans on jerky, fish sticks, english muffins and pita (via `beforeConcern`, sources only); the new lines carry none of their banned words. k3-0, k3-1, k24 and counterProbe48 pin routing only.
- `server/lib/pickReach.test.js` reads every pick live (lintCard, no pick alias on a card, row pick line equals decision) and must stay green unedited.
- `counterCardLint.test.js` L758 asserts `lintSections(sectionRules, perimeterKb.entries)` is `[]`; none of the 9 sits in a `cards_aligned` section except pick_jerky (meat), whose line carries no G-term.

## Criteria

- C1 [test] Given `e3b4a68`, when the KB is read, then each of the 9 picks deepEquals its base entry with only `decision` replaced by its BECAME value, and that decision matches its carry.
- C2 [test] Given the 9 picks, then `lintPick` and `lintCard` each return [] and every decision is 16 words or fewer by the lint's `words`.
- C3 [test] Given the 9 picks, then each base decision and each live decision both match every keep phrase of the id.
- C4 [test] Given the 9 new decisions, then none matches BANNED or TREATMENT, none has first person, "—", "–", a straight apostrophe, a digit or a `?`.
- C5 [test] Given the 9 picks, then no base decision names organic; exactly pick_frozen_peas, pick_frozen_broccoli, pick_canned_tomatoes and pick_tofu now start "Organic "; the other 5 do not name organic; and the count of picks outside the 9 whose decision names organic equals base.
- C6 [test] Given the entries outside the 9 (≥197), then each deepEquals `e3b4a68`, and the entry count and every top-level key other than entries are unchanged.
- C7 [test] Given doLines.json and docs/do-lines-review.md, then the first deepEquals `e3b4a68` and the second is byte-identical to it.
- C8 [test] Given each of the 9 decisions, then it names no other batch pick's first alias and no generic phrase (organic produce, vegetables, fruit, food).
- C9 [test] Given every alias of the 9 picks (≥40), then `matchItemToPick(alias)` returns that pick's id and `matchItemToCard(alias)` returns null.
- C10 [test] Given the 9 new decisions, then all 9 are distinct and none sits on more than 2 entries [PLACEHOLDER threshold 2].
- C11 [test] Given a list row `{ name: aliases[0], source: 'user' }` for each of the 9, when `attachCards` runs with `log: false`, then the row carries `pickId` equal to the id, `pickLine` equal to the new decision, and no `cardSlug`.
- C12 [test] Given every pick alias in the `e3b4a68` corpus, bare and as "organic <alias>" (≥140 queries), then `matchItemToPick(q, kb.entries)?.id` equals `matchItemToPick(q, base.entries)?.id`.
- C13 [test] Given the live KB, then pick_juice holds pasteurized, warning label, a dye word and "no added color" in 20 words or fewer; pick_jerky holds /celery/, no grass term, 14 words or fewer; pick_canned_tomatoes holds "BPA-free"; and pick_sausage, pick_egg_whites and pick_soup_bones deepEqual base.

## Ship notes

- **Nothing was executed while writing this spec.** Routing and lint outcomes were simulated by reading `listMatch.js` and `lintPick`. **The admin runs the probe (Answers) before `dv check`.** A miss means a spec revision.
- **Three picks held, and why** (plan rough edge: a call that cannot be backed stays unchanged and goes to ship notes):
  - **pick_sausage** (T1 "pasture-raised or organic") and **pick_egg_whites** (T1 "pasture-raised"): `lintSections` L4 TERM_UNGLOSSED (counterCardLint.js ~L1839) fires on any `cards_aligned` section entry (meat, eggs_dairy) whose text prints G3 `pasture-raised` or G4 `organic` without its gloss, and the gloss can only sit in `tier_note`, `pick_steps` or `instead`, all of which PICK_FORBIDDEN_FIELDS bars on a pick. `counterCardLint.test.js` L758 asserts the corpus lint is `[]` live, so either word fails `npm test`. egg_whites is also pinned whole by concernEggs C5.
  - **pick_soup_bones** (T1 "100% grass-fed"): ca-3a C7 bars a grass term on this decision, and ca-3a C12 pins its decision to the CA-3a Step-1c text through `preCleanPick3` only. Any change fails a live guard. "100%" is also a digit lintPick vetoes.
  - **pick_jerky** T1 ("100% grass-fed") held for the same reason: ca-3b C2 bars a grass term on it live. T4 (whole-muscle) and T2 (short list) are carried.
  - **For Devon:** one lint ruling unblocks all four: let a pick's own `decision` carry the term's gloss in the same sentence, or exempt picks from L4 and from the CA grass bans. It is a governed `server/lib` change, so it is not taken here.
- **C12 implements the plan's Extra C12 through `matchItemToPick` with an injected base pool**, as clean-pick-6 did: `matchItemToCard` never returns a pick, so the plan's literal wording would be true by construction.
- **PROBE rows** (simulated, not run): "meat stick(s)" and "turkey jerky" → pick_jerky; "marrow bones", "beef bones" → pick_soup_bones vs the butcher card; "orange juice(s)" → pick_juice; "silken tofu", "block of tofu" → pick_tofu; "naan bread" → pick_pita_naan; "organic canned tomatoes", "organic tofu" vs the organic hub card and soy cards; "fish fingers" → pick_fish_sticks.
- **seed oil on pick_english_muffins:** G7 lists seed oils, but bulk_pantry is not `cards_aligned`, so L4 does not run there (planner reading of `sectionRules.json`). If the corpus lint reports it, use the fallback in Answers.
- **pick_canned_tomatoes is 16 words, at the bar**, as its base line was.
- **Grounding:** no new line adds a reason (residue, nutrition) for its standard; each carries the label words only. The critic checks that.
- Pin and test files beyond the KB: 12. Not split: each is one import plus one wrap, skip or floor, the pattern B1–B7a shipped with.
- Commit message ends "Not migrated."

## Contract

```json
{
  "criteria": [
    {
      "id": "C1",
      "impl": ["server/kristy_perimeter_kb.json", "server/test/acceptance/twoLinePin.js"],
      "tests": ["server/test/acceptance/cleanPick7.test.js"],
      "dependents": [
        "server/test/acceptance/w2.test.js",
        "server/test/acceptance/w4.test.js",
        "server/test/acceptance/ca-4b.test.js",
        "server/test/acceptance/ca-7.test.js",
        "server/test/twoLinePin.test.js"
      ],
      "reads": ["git show e3b4a68:server/kristy_perimeter_kb.json"],
      "expect": "9 picks equal base with only decision replaced; each matches its carry"
    },
    {
      "id": "C2",
      "impl": ["server/kristy_perimeter_kb.json"],
      "tests": ["server/test/acceptance/cleanPick7.test.js"],
      "dependents": ["server/lib/pickReach.test.js", "server/test/acceptance/k15.test.js", "server/test/acceptance/k16.test.js", "server/test/acceptance/k18.test.js"],
      "reads": ["server/lib/counterCardLint.js"],
      "expect": "lintPick and lintCard return [] on all 9; decisions at most 16 words"
    },
    {
      "id": "C3",
      "impl": ["server/kristy_perimeter_kb.json"],
      "tests": ["server/test/acceptance/cleanPick7.test.js"],
      "dependents": [],
      "reads": ["git show e3b4a68:server/kristy_perimeter_kb.json"],
      "expect": "every keep phrase in base and live decision for all 9"
    },
    {
      "id": "C4",
      "impl": ["server/kristy_perimeter_kb.json"],
      "tests": ["server/test/acceptance/cleanPick7.test.js"],
      "dependents": [],
      "reads": [],
      "expect": "9 decisions clean of banned, treatment, first person, dash, straight apostrophe, digit, question mark"
    },
    {
      "id": "C5",
      "impl": ["server/kristy_perimeter_kb.json", "server/test/acceptance/cleanPick6.test.js"],
      "tests": ["server/test/acceptance/cleanPick7.test.js"],
      "dependents": ["server/test/acceptance/cleanPick6.test.js"],
      "reads": ["git show e3b4a68:server/kristy_perimeter_kb.json"],
      "expect": "organic new on exactly 4 ids, absent on the other 5; other picks' organic count unchanged"
    },
    {
      "id": "C6",
      "impl": [
        "server/kristy_perimeter_kb.json",
        "server/test/acceptance/cleanPick1.test.js",
        "server/test/acceptance/cleanPick2.test.js",
        "server/test/acceptance/cleanPick2b.test.js",
        "server/test/acceptance/cleanPick3.test.js",
        "server/test/acceptance/cleanPick4.test.js",
        "server/test/acceptance/cleanPick5.test.js",
        "server/test/acceptance/cleanPick6.test.js"
      ],
      "tests": ["server/test/acceptance/cleanPick7.test.js"],
      "dependents": [
        "server/test/acceptance/cleanPick1.test.js",
        "server/test/acceptance/cleanPick2.test.js",
        "server/test/acceptance/cleanPick2b.test.js",
        "server/test/acceptance/cleanPick3.test.js",
        "server/test/acceptance/cleanPick4.test.js",
        "server/test/acceptance/cleanPick5.test.js",
        "server/test/acceptance/cleanPick6.test.js"
      ],
      "reads": ["git show e3b4a68:server/kristy_perimeter_kb.json"],
      "expect": ">=197 outside entries deepEqual base; count and top-level keys unchanged"
    },
    {
      "id": "C7",
      "impl": ["server/kristy_perimeter_kb.json"],
      "tests": ["server/test/acceptance/cleanPick7.test.js"],
      "dependents": ["server/scripts/buildDoLines.js"],
      "reads": ["git show e3b4a68:docs/do-lines-review.md", "git show e3b4a68:server/lib/doLines.json"],
      "expect": "doLines.json deepEqual base; do-lines-review.md byte-identical"
    },
    {
      "id": "C8",
      "impl": ["server/kristy_perimeter_kb.json"],
      "tests": ["server/test/acceptance/cleanPick7.test.js"],
      "dependents": [],
      "reads": [],
      "expect": "no decision names another batch pick's first alias or a generic phrase"
    },
    {
      "id": "C9",
      "impl": ["server/kristy_perimeter_kb.json"],
      "tests": ["server/test/acceptance/cleanPick7.test.js"],
      "dependents": ["server/lib/listMatch.js", "server/lib/pickReach.test.js", "server/scripts/listMatchProbe.js", "server/test/acceptance/k24.test.js"],
      "reads": [],
      "expect": ">=40 aliases route to their own pick and to no card"
    },
    {
      "id": "C10",
      "impl": ["server/kristy_perimeter_kb.json"],
      "tests": ["server/test/acceptance/cleanPick7.test.js"],
      "dependents": [],
      "reads": [],
      "expect": "9 distinct decisions, none on more than 2 entries"
    },
    {
      "id": "C11",
      "impl": ["server/kristy_perimeter_kb.json"],
      "tests": ["server/test/acceptance/cleanPick7.test.js"],
      "dependents": ["server/lib/listMatch.js", "server/lib/pickReach.test.js"],
      "reads": [],
      "expect": "attachCards row for aliases[0] carries pickId, pickLine equal to the new decision, no cardSlug"
    },
    {
      "id": "C12",
      "impl": ["server/kristy_perimeter_kb.json"],
      "tests": ["server/test/acceptance/cleanPick7.test.js"],
      "dependents": ["server/lib/listMatch.js", "server/test/acceptance/k3-0.test.js", "server/test/counterProbe48.test.js"],
      "reads": ["git show e3b4a68:server/kristy_perimeter_kb.json"],
      "expect": ">=140 bare and organic-prefixed pick queries resolve to the base pick id"
    },
    {
      "id": "C13",
      "impl": ["server/kristy_perimeter_kb.json"],
      "tests": ["server/test/acceptance/cleanPick7.test.js"],
      "dependents": [
        "server/test/acceptance/concernAdditives.test.js",
        "server/test/acceptance/ca-3b.test.js",
        "server/test/acceptance/ca-3a.test.js",
        "server/test/acceptance/concernDeli.test.js",
        "server/test/acceptance/concernEggs.test.js",
        "server/test/acceptance/ca-4a.test.js"
      ],
      "reads": ["git show e3b4a68:server/kristy_perimeter_kb.json"],
      "expect": "juice, jerky and canned tomato guard facts hold live; the 3 held picks deepEqual base"
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

- **Suite runtime:** `npm test` is the full server suite (`2917` at base). Run `node --test server/test/acceptance/cleanPick7.test.js` alone first, and the full suite once, at the end.
- **Allowed reads:**
  - the files in owns and read_full;
  - to read a red, never to edit: `server/lib/counterCardLint.js` (lintPick, MECHANICAL_VETO, lintSections), `server/lib/perimeter.js`, `server/lib/sectionRules.json`, `server/lib/pickReach.test.js`, `server/lib/counterCardLint.test.js`, `server/scripts/twoLineCheck.js`, and the Hard-limits tests named in "No change needed";
  - `git show e3b4a68:<path>`.
- **Admin pre-dispatch probe** (from `server/`, at HEAD, before `dv check`; it reads the base KB, so it checks the alias side of C9, C11 and C12; the PROBE rows matter most). All 12 B7b picks' aliases, held ones included:

  ```
  node -e "import('./lib/listMatch.js').then(({ matchItemToPick, matchItemToCard }) => { for (const q of process.argv.slice(1)) for (const r of [q, 'organic ' + q]) console.log(r, '-> pick', matchItemToPick(r)?.id, '| card', matchItemToCard(r)?.slug); })" "frozen peas" "frozen pea" "frozen green peas" "frozen sweet peas" "frozen broccoli" "frozen broccoli florets" "frozen broccoli floret" "canned tomatoes" "canned tomato" "tinned tomatoes" "tinned tomato" "canned diced tomatoes" "canned crushed tomatoes" tofu "firm tofu" "extra firm tofu" "silken tofu" "soft tofu" "tofu block" "tofu blocks" "block of tofu" "blocks of tofu" "soup bone" "soup bones" "marrow bones" "beef bones" "knuckle bones" "egg whites" "egg white" "carton egg whites" "liquid egg whites" sausage sausages "italian sausage" "italian sausages" "pork sausage" "pork sausages" "breakfast sausage" "breakfast sausages" "chicken sausage" "chicken sausages" bratwurst bratwursts jerky "beef jerky" "turkey jerky" "meat stick" "meat sticks" "fish stick" "fish sticks" "fish finger" "fish fingers" juice juices "orange juice" "orange juices" "english muffin" "english muffins" pita pitas "pita bread" "pita breads" "pita pocket" "pita pockets" naan naans "naan bread"
  ```

  Expected: every bare query → its own pick and card `undefined`. If the alias list in the KB differs from this one, the KB wins; probe the KB's list. Any bare alias of the 9 that does not reach its own pick at base fails C9 after the build too: report it, and the planner lowers the C9 floor or drops that alias from C9 (C12 still covers it).
- **If something goes red on a BECAME string** (lintPick, lintCard, the corpus lintSections in counterCardLint.test.js, a live guard, or C9/C11/C12):
  - Stop and report RED with the lint output or the matched id.
  - The acceptance test pins every string, so a rewording is a spec revision, not a builder call. Never loosen a lint.
  - Pre-chosen fallbacks (the planner swaps these into BECAME on a revision):

    | id | trigger | fallback |
    | --- | --- | --- |
    | pick_canned_tomatoes | over the word bar, or a lint reads the colon | Organic tomatoes in BPA-free cans, none dented, rusted or swollen; the date marks quality. |
    | pick_english_muffins | lintSections reports G7 on "seed oil" | English muffins with whole wheat flour as the first ingredient and no preservatives. |
    | pick_juice | a lint reads the colon | Juice not from concentrate, pasteurized or untreated with warning labels; no added color over dyes. |
    | pick_fish_sticks | a lint reads the curly quotes mid-sentence | Wild-caught fish sticks from whole fillet; skip any labeled “made from minced fish” in bold. |
- **If a test outside the routed list goes red on a batch pick at an older ref:** route it through `preCleanPick7` the same way, and list it in the report as an owns addition. A red on a live guard is a content defect, not a routing case.

## Tried and rejected

- **"Pastured", "hens on pasture" or "certified organic" on sausage and egg whites to step around TERM_UNGLOSSED:** it games the lint's word list while printing the same claim unglossed.
- **Putting the gloss in a pick's `tier_note`, `pick_steps` or `instead`:** PICK_FORBIDDEN_FIELDS bars every card field on a pick.
- **Editing lintSections, ca-3a, ca-3b, concernEggs or concernAdditives to admit the T1 terms:** governed lint and live guards; that is Devon's ruling (Ship notes), not a builder's.
- **"100% grass-fed" on jerky or soup bones:** digits are vetoed, and ca-3a C7 and ca-3b C2 bar grass terms on both lines.
- **Organic on juice, english muffins, pita or fish sticks:** plan C5 gives organic only to T1 rows whose standard is organic, and seafood shows wild-caught.
- **"No added sugar" on juice or jerky:** sugar is a vetoed word.
- **Dropping "warning labels" or "pasteurized" from juice to make room:** concernAdditives C4 reads both live.
- **Adding "organic <item>" aliases:** INERT_MODIFIERS already folds organic, and new aliases risk the pickReach no-card-steal guard.
- **Overlaying the live guards:** it would hide content defects.

## Acceptance server/test/acceptance/cleanPick7.test.js

```js
// clean-pick-7 (Devon 2026-10-20, "organic, no additives, no synthetic, as close to the source as possible"): B7b, 9 picks name their item's cleanest version; sausage, egg whites and soup bones are held.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { nonEmpty } from '../../lib/testGuards.js';
import { lintCard, lintPick, words as lintWords } from '../../lib/counterCardLint.js';
import { attachCards, matchItemToCard, matchItemToPick } from '../../lib/listMatch.js';

const BASE = 'e3b4a68';
const ROOT = fileURLToPath(new URL('../../../', import.meta.url));
const git = (ref) => execFileSync('git', ['show', ref], { cwd: ROOT, maxBuffer: 64 << 20 }).toString();
const kb = JSON.parse(readFileSync(new URL('../../kristy_perimeter_kb.json', import.meta.url), 'utf8'));
const base = JSON.parse(git(`${BASE}:server/kristy_perimeter_kb.json`));
const find = (k, id) => k.entries.find((e) => e.id === id);
const live = (id) => find(kb, id);
const was = (id) => find(base, id);

const BECAME = {
  pick_frozen_peas: { decision: 'Organic peas frozen solid, with no pack drips or off smell.', carry: /^Organic peas\b/, keep: [/frozen solid, with no pack drips or off smell/] },
  pick_frozen_broccoli: { decision: 'Organic broccoli frozen solid; pack drips or off smell mean it thawed.', carry: /^Organic broccoli\b/, keep: [/pack drips or off smell mean it thawed/] },
  pick_canned_tomatoes: { decision: 'Organic tomatoes: skip dented, rusted or swollen cans and read for BPA-free; the date marks quality.', carry: /^Organic tomatoes\b/, keep: [/dented, rusted or swollen cans and read for BPA-free/, /\bdate\b/, /\bquality\b/] },
  pick_tofu: { decision: 'Organic tofu by firmness: soybeans, water, coagulant such as nigari or gypsum.', carry: /^Organic tofu\b/, keep: [/soybeans, water, coagulant such as nigari or gypsum/] },
  pick_jerky: { decision: 'Whole-muscle beef jerky with a short list; celery powder supplies nitrite.', carry: /^Whole-muscle beef jerky\b/, keep: [/jerky with a short list; celery powder supplies nitrite/] },
  pick_fish_sticks: { decision: 'Wild-caught fish sticks from whole fillet, not ones labeled “made from minced fish” in bold.', carry: /^Wild-caught fish sticks\b/, keep: [/“made from minced fish”/, /\bbold\b/] },
  pick_juice: { decision: 'Juice not from concentrate: pasteurized, or untreated with warning labels; no added color over dyes.', carry: /^Juice not from concentrate\b/, keep: [/pasteurized/, /untreated/, /warning labels/, /no added color over dyes/] },
  pick_english_muffins: { decision: 'English muffins with whole wheat flour as the first ingredient, no preservatives or seed oil.', carry: /^English muffins with whole wheat flour\b/, keep: [/English muffins with whole wheat flour as the first ingredient/] },
  pick_pita_naan: { decision: 'Unenriched pita with whole wheat flour first; naan is the richer one, made with yogurt.', carry: /^Unenriched pita\b/, keep: [/whole wheat flour first/, /naan is the richer one, made with yogurt/] },
};
const IDS = Object.keys(BECAME);
const ORGANIC_IDS = ['pick_frozen_peas', 'pick_frozen_broccoli', 'pick_canned_tomatoes', 'pick_tofu'];
const HELD = ['pick_sausage', 'pick_egg_whites', 'pick_soup_bones'];
const BANNED = /\b(health|healthy|healthier|safer|risk|cancer|disease|toxic|toxin|detox|pesticide-free|synthetic|price|cost|cheap|expensive)\b/i;
const TREATMENT = /\b(causes?|prevents?|lowers? (the )?risk|carcinogen|cancer|tumou?rs?|toxic|unsafe|harm\w*|risks?|linked to|hyperactiv|behaviou?r|attention|neurobehavioral|exacerbate)/i;
const GENERIC = /\borganic (produce|vegetables?|veg|fruits?|food)\b/i;
const ORGANIC = /\borganic\b/i;
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const isPick = (e) => e && e.kind === 'pick';
const ws = (s) => String(s || '').trim().split(/\s+/).filter(Boolean).length;

nonEmpty(IDS, 'IDS', 9);

test('C1 the 9 picks equal their base entries with only the decision replaced, each leading with its own standard', () => {
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
    for (const re of nonEmpty(BECAME[id].keep, `${id} keep`, 1)) {
      assert.match(was(id).decision, re, `${id} keep ${re} not in base`);
      assert.match(live(id).decision, re, `${id} keep ${re} lost`);
    }
  }
});

test('C4 no new line carries a banned or treatment word, first person, a dash, a straight apostrophe, a digit or a question mark', () => {
  const all = IDS.map((id) => BECAME[id].decision);
  nonEmpty(all, 'decisions', 9);
  for (const s of all) {
    assert.doesNotMatch(s, BANNED, s);
    assert.doesNotMatch(s, TREATMENT, s);
    assert.doesNotMatch(s, /\b(I|me|my|mine|we|our|ours|us)\b/, s);
    assert.ok(!s.includes('—') && !s.includes('–'), s);
    assert.ok(!s.includes("'"), s);
    assert.doesNotMatch(s, /[0-9?]/, s);
  }
});

test('C5 organic is new on exactly the four organic-standard picks and unchanged on every other pick', () => {
  for (const id of IDS) {
    assert.doesNotMatch(was(id).decision, ORGANIC, `${id} base already organic`);
    if (ORGANIC_IDS.includes(id)) assert.ok(live(id).decision.startsWith('Organic '), `${id} lacks organic`);
    else assert.doesNotMatch(live(id).decision, ORGANIC, `${id} gained organic`);
  }
  const otherPicks = (k) => k.entries.filter((e) => isPick(e) && !IDS.includes(e.id));
  nonEmpty(otherPicks(base), 'other picks', 20);
  const count = (k) => otherPicks(k).filter((e) => ORGANIC.test(e.decision || '')).length;
  assert.equal(count(kb), count(base));
});

test('C6 entries outside the batch deepEqual the base; count and top-level keys unchanged', () => {
  const others = kb.entries.filter((e) => !IDS.includes(e.id));
  nonEmpty(others, 'others', 197);
  assert.equal(kb.entries.length, base.entries.length);
  for (const e of others) assert.deepEqual(e, was(e.id), e.id);
  assert.deepEqual(Object.keys(kb).sort(), Object.keys(base).sort());
  for (const k of Object.keys(base)) if (k !== 'entries') assert.deepEqual(kb[k], base[k], k);
});

test('C7 doLines.json and do-lines-review.md are unchanged from the base', () => {
  const now = JSON.parse(readFileSync(new URL('../../lib/doLines.json', import.meta.url), 'utf8'));
  assert.deepEqual(now, JSON.parse(git(`${BASE}:server/lib/doLines.json`)));
  const review = readFileSync(new URL('../../../docs/do-lines-review.md', import.meta.url), 'utf8');
  nonEmpty(review.split('\n'), 'review lines', 150);
  assert.equal(review, git(`${BASE}:docs/do-lines-review.md`));
});

test('C8 each line names its own item, never another batch pick or a generic phrase', () => {
  const heads = IDS.map((id) => [id, live(id).aliases[0]]);
  nonEmpty(heads, 'heads', 9);
  for (const id of IDS) {
    const d = live(id).decision;
    assert.doesNotMatch(d, GENERIC, `${id} generic`);
    for (const [other, a] of heads) {
      if (other === id) continue;
      assert.doesNotMatch(d, new RegExp(`\\b${esc(a)}\\b`, 'i'), `${id} names ${a}`);
    }
  }
});

test('C9 every alias of the 9 reaches its own pick and no card', () => {
  const rows = IDS.flatMap((id) => live(id).aliases.map((a) => [a, id]));
  nonEmpty(rows, 'aliases', 40);
  for (const [a, id] of rows) {
    assert.equal(matchItemToPick(a)?.id, id, `${a} -> pick ${matchItemToPick(a)?.id}`);
    assert.equal(matchItemToCard(a), null, `${a} -> card ${matchItemToCard(a)?.slug}`);
  }
});

test('C10 the 9 lines are distinct and none sits on more than 2 entries', () => {
  const all = IDS.map((id) => BECAME[id].decision);
  assert.equal(new Set(all).size, 9);
  for (const s of all) {
    const n = kb.entries.filter((e) => [e.decision, e.cart_pick, e.tier_note, ...(e.buying_tips || []), ...(e.watch_out || [])].includes(s)).length;
    assert.ok(n <= 2, `${s} on ${n} entries`);
  }
});

test('C11 a list row of each pick’s first alias carries the new line', () => {
  for (const id of IDS) {
    const name = live(id).aliases[0];
    const row = attachCards({ items: [{ name, source: 'user' }] }, { log: false }).items[0];
    assert.equal(row.pickId, id, `${name} pickId ${row.pickId}`);
    assert.equal(row.pickLine, BECAME[id].decision, `${name} pickLine`);
    assert.equal(row.cardSlug, undefined, `${name} cardSlug ${row.cardSlug}`);
  }
});

test('C12 every pick alias, bare and organic, resolves to the same pick as at the base', () => {
  const queries = base.entries.filter(isPick).flatMap((e) => (e.aliases || []).flatMap((a) => [a, `organic ${a}`]));
  nonEmpty(queries, 'queries', 140);
  for (const q of queries) {
    const now = matchItemToPick(q, kb.entries)?.id;
    const then = matchItemToPick(q, base.entries)?.id;
    assert.equal(now, then, `${q}: ${then} -> ${now}`);
  }
});

test('C13 the live-guard facts hold and the three held picks are untouched', () => {
  const j = live('pick_juice').decision;
  for (const re of [/pasteurized/i, /warning label/i, /\bdyes?\b/i, /no added colou?r/i]) assert.match(j, re, `pick_juice ${re}`);
  assert.ok(ws(j) <= 20, `pick_juice ${ws(j)} words`);
  const k = live('pick_jerky').decision;
  assert.match(k, /celery/i, 'pick_jerky celery');
  assert.doesNotMatch(k, /grass-(fed|finished)/i, 'pick_jerky grass term');
  assert.ok(ws(k) <= 14, `pick_jerky ${ws(k)} words`);
  assert.match(live('pick_canned_tomatoes').decision, /BPA-free/, 'pick_canned_tomatoes BPA-free');
  for (const id of nonEmpty(HELD, 'held', 3)) {
    assert.ok(live(id) && was(id), `${id} missing`);
    assert.deepEqual(live(id), was(id), `${id} moved`);
  }
});
```
