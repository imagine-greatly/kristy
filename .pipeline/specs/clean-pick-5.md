# clean-pick-5: B6 corn, soy, ferments, condiments and snacks name each item’s own cleanest version

```json
{
  "id": "clean-pick-5",
  "tier": "T2",
  "ui": false,
  "owns": [
    "server/kristy_perimeter_kb.json",
    "docs/do-lines-review.md",
    "server/lib/doLines.json",
    "server/test/acceptance/twoLinePin.js",
    "server/test/acceptance/w2.test.js",
    "server/test/acceptance/w4.test.js",
    "server/test/acceptance/ca-4b.test.js",
    "server/test/acceptance/ca-7.test.js",
    "server/test/acceptance/concernAdditives.test.js",
    "server/test/acceptance/cleanPick1.test.js",
    "server/test/acceptance/cleanPick2.test.js",
    "server/test/acceptance/cleanPick2b.test.js",
    "server/test/acceptance/cleanPick3.test.js",
    "server/test/acceptance/cleanPick4.test.js"
  ],
  "read_full": [
    "server/test/acceptance/twoLinePin.js",
    "server/test/acceptance/cleanPick1.test.js",
    "server/test/acceptance/cleanPick2.test.js",
    "server/test/acceptance/cleanPick2b.test.js",
    "server/test/acceptance/cleanPick3.test.js",
    "server/test/acceptance/cleanPick4.test.js",
    "docs/do-lines-review.md",
    "server/scripts/buildDoLines.js",
    "server/lib/testGuards.js",
    "server/lib/listMatch.js"
  ],
  "verify": "cd /Users/m1/kristy && node --test server/test/acceptance/cleanPick5.test.js && cd server && node scripts/buildDoLines.js && node scripts/twoLineCheck.js && node scripts/commitGuard.js && node scripts/listMatchProbe.js && npm test"
}
```

Repo `/Users/m1/kristy`, branch `main`, base `6db979f` (the clean-pick-4 build). HEAD is a1f9997, the clean-pick-4 SHIP commit. Its subject says no KB or test change beyond 6db979f; the planner has not diffed the two, so the admin confirms that with `git diff --stat 6db979f a1f9997` before dispatch.
- Baseline `npm test`: **2890 pass / 0 fail**, as recorded in the 6db979f and a1f9997 commit messages. The planner ran nothing, so the admin confirms the baseline before dispatch.
- Ship count: 2901 or more (2890 + 11). Not migrated.

Env: node, npm, git. `server/.env` is not needed. No browser, no network, no writable dirs beyond the repo.

## Alignment

Devon's rulings behind this batch:
- 2026-10-20: "point them to the cleanest and healthiest version of the item they are getting."
- 2026-10-20: "everything should be organic, no additives, no synthetic bs, from nature, as close to the source as possible."
- 2026-10-19: fewer ingredients ranks higher.
- `docs/CLEAN-PICK-PLAN.md` L362–363 recorded **Q3 A** (salt stays iodized, and the cart is aligned to it) and **Q5 A** (unfortified is the pick, and fortified is named second in watch_out).
- Devon's "go make all decisions" is the approval for every other call below (B6, `docs/CLEAN-PICK-PLAN.md` L307–316).

- **Done means:** Given the KB at 6db979f, when this lands, then:
  - each of the 16 ids below names its own cleanest version:
    - in its headline, on 15 ids (popcorn keeps its own, see the Subject notes);
    - in its cart pick, on 13 ids (popcorn, canned_soup and olives keep their own);
  - a new "look for" line naming the label standard sits at `buying_tips[1]`, and every 6db979f tip survives, each one slot lower;
  - organic sits on the decision and the cart of exactly seven ids: tortilla_chips, miso, tempeh, natto, hot_soy_sauce, snack_bars and hummus;
  - salt reads iodized with no anti-caking agent in its decision and cart (Q3);
  - nutritional_yeast reads unfortified in its decision and cart. Its last watch_out line ranks fortified second, and its tier_note no longer says "never a ranking" (Q5);
  - the 19 reach queries in C11 still land on their cards;
  - C1–C11 pass, and `npm test` reports 2901 or more passing with 0 fail.
- **Out of scope:**
  - every card outside the 16;
  - on the 16, these fields: aliases, asked_as, why, short_answer, kristy_take, pick_steps, look_for, sources, labels_decoded, evidence_tier, category, question, detail and science;
  - tier_note on every id except nutritional_yeast;
  - watch_out on every id except nutritional_yeast;
  - any do cell;
  - everything under `server/lib/` except `doLines.json`, which is regenerated and must come out byte-identical;
  - prompts;
  - migration.
- **OK rough edges:**
  - Organic on miso, tempeh, natto and hot_soy_sauce rests on the organic soybean material of soy_milk and label_nonGMO_vs_organic, not on each card's own sources. tortilla_chips, snack_bars and hummus each already carry their own organic tip.
  - "No added flavors" on canned_soup rests on the natural-flavors card's material, not on canned_soup's own sources.
  - nutritional_yeast's short_answer ("Fortified is the more common type"), kristy_take ("Both kinds are the same inactive yeast") and pick_steps still read as an even choice. Those are depth fields and out of scope; the front, watch_out and tier_note carry the ranking.
  - Several cards grow to 5 or more tips.
  - The do lines read as before. Salt's do cell and the ketchup_mustard do cell do not name the new standard.
- **Ship bar:** any of these blocks shipping:
  - any of C1–C11 red;
  - `npm test` below 2901 passing, or any fail;
  - twoLineCheck reports anything other than 0 of 181;
  - listMatchProbe reports a wrong match;
  - any edit to `server/test/acceptance/passRule.js` or `k9.test.js`;
  - a verdict subject changed beyond the table below.

## Change

Conventions:
- Curly apostrophes and quotes, as the KB uses them. None of the new strings needs one.
- No em dash or en dash, and no first person.
- decision ≤10 words; cart_pick ≤46 chars.
- buying_tips[0] stays the 6db979f tip, which is a why.
- Organic, unsweetened, unfortified and "no anti-caking agent" are label standards, never health effects.
- No new string contains any word on the C4 BANNED list.
- No new string on tortilla_chips, popcorn, snack_bars, trail_mix or hummus names sodium or a seed oil (C4).

**Per id, literally:**
- `decision` → BECAME.decision where listed (15; not popcorn).
- `cart_pick` → BECAME.cart_pick where listed (13; not popcorn, canned_soup or olives).
- `buying_tips` → `[base[0], tip1, ...base.slice(1)]`. The new tip goes in at **index 1**. Every base tip shifts down one, and none is deleted or edited.
- `watch_out` → `[...base.watch_out, watch_add]`, on nutritional_yeast only. Append it at the end.
- `tier_note` → BECAME.tier_note, on nutritional_yeast only.
- Every other field of every id stays at its 6db979f value.

### Old → new

The old values are the live KB values read by the planner at a1f9997. clean-pick-4 touched none of these 16 cards.

| id | old decision | new decision | old cart_pick → new cart_pick |
| --- | --- | --- | --- |
| kombucha | Kombucha from the refrigerated case, kept cold. | Plain kombucha from the refrigerated case, kept cold. | Kombucha from the refrigerated case → Plain refrigerated kombucha |
| miso | Miso of soybeans, salt and koji, with any grain named. | Organic miso of soybeans, salt and koji, any grain named. | Miso listing soybeans, salt and koji → Organic miso paste |
| tempeh | Tempeh in a firm cake, bound white all through. | Organic tempeh in a firm cake, bound white all through. | A firm tempeh cake, bound white → Firm organic tempeh cake |
| natto | Natto in sealed trays from the cold case or freezer. | Organic natto in sealed trays, chilled or frozen. | Natto trays from the cold case → Organic natto beans |
| salt | Iodized salt, with any anti-caking agent named on the list. | Iodized salt with no anti-caking agent on the list. | Pickling or canning salt → Iodized salt: no anti-caking agent |
| nutritional_yeast | Fortified or unfortified nutritional yeast flakes, granules or powder. | Unfortified nutritional yeast flakes, granules or powder. | Nutritional yeast flakes, either type → Unfortified nutritional yeast flakes |
| jam | Jam or preserves by name, made from fruit, not juice. | Jam or preserves of fruit, sugar and pectin, nothing else. | Jam or preserves named for its fruit → Jam or preserves: fruit, sugar, pectin |
| ketchup_mustard | Ketchup led by tomato; mustard of seed, vinegar and spice. | Unsweetened ketchup from tomato; mustard of seed, vinegar, spice. | Ketchup from tomato; mustard from seed → Unsweetened tomato ketchup and mustard |
| hot_soy_sauce | Traditionally brewed soy sauce, not made fast with acid. | Organic soy sauce, traditionally brewed, not made fast with acid. | Soy sauce brewed by fermentation → Organic naturally brewed soy sauce |
| canned_soup | Low-sodium canned soup with a short list, can undented. | Low-sodium canned soup, short list, no added flavors, can undented. | unchanged (Low sodium canned soup, undented can) |
| olives | Brine-cured olives, fermented slowly in water and salt. | Brine-cured olives, fermented in water and salt, nothing else. | unchanged (Olives cured in brine) |
| tortilla_chips | Masa tortilla chips in olive oil, coconut oil or tallow. | Organic masa tortilla chips in olive oil or tallow. | Masa tortilla chips: olive oil → Organic masa tortilla chips: olive oil |
| popcorn | unchanged (Plain popcorn kernels, popped at home in coconut oil.) | unchanged | unchanged (Plain popcorn kernels) |
| snack_bars | Bars with oats or another whole grain listed first. | Organic bars with oats or another whole grain listed first. | Bars with oats or whole grain first → Organic oat snack bars |
| trail_mix | Trail mix of nuts and dried fruit, little else listed. | Trail mix of nuts and dried fruit alone, nothing added. | Nuts and dried fruit, little else → Trail mix: nuts and dried fruit only |
| hummus | Hummus of chickpeas and tahini, the traditional pairing. | Organic hummus of chickpeas and tahini, with no gums. | Hummus led by chickpeas and tahini → Organic hummus: chickpeas and tahini |

nutritional_yeast tier_note: "Added vitamins are a label fact read from the ingredients, never a ranking." → "Added vitamins are read from the ingredients, and unfortified ranks first."

Every verdict subject stays the same item. Subject notes:
- **popcorn:** no organic. Its own tip says "CSPI says popcorn is never bioengineered, so a non-GMO seal on plain kernels adds nothing." Its plain-kernels headline is already the closest-to-source pick. This batch adds only the tip1 standard. This departs from the plan's T1 listing; see Ship notes.
- **tortilla_chips:** "coconut oil" leaves the headline to hold 10 words with organic. Coconut stays in tip 2 and in the detail. concernSeedOilsB C3 still matches on olive and tallow.
- **salt (Q3 A):** iodized stays the pick. The cart moves off pickling salt, which is not iodized, so the front no longer contradicts itself. "No anti-caking agent" applies the no-additives rule. The card's own material (21 CFR 172.490) says an anti-caking agent may be added and is named on the list.
- **nutritional_yeast (Q5 A):** unfortified first, and fortified named second in watch_out. The old tier_note said "never a ranking", which now contradicts the front. The new note keeps "added vitamins" and "ingredients", the words it shares with the do line "Read the ingredients for added vitamins, which mark a fortified yeast.", so TIER_NOTE_ORPHANED (counterCardLint.js L90 `tierNoteOrphaned`) does not fire.
- **ketchup_mustard:** unsweetened rests on the card's own tip 0: "Ketchup’s federal standard starts from tomato; sweeteners and spices are optional."
- **kombucha:** plain rests on the card's own labels_decoded and short_answer: flavored kombucha has "fruit juice or spices added".
- **jam:** pectin rests on the card's own labels_decoded ("The natural fruit substance that gels").
- **olives:** ferrous gluconate in tip1 rests on the card's own watch_out and labels_decoded, which describe air-darkened olives set by ferrous gluconate.
- **snack_bars and hummus:** organic rests on each card's own "Choose certified organic … over conventional" glyphosate tip.
- **snack_bars cart:** it says "oat snack bars", never "granola". That keeps the 'granola' → breakfast_cereal route (C11) undisturbed.
- **hummus:** the headline does not name an oil. The card's own tip allows "olive oil or a hummus with no added oil".

### Final values

The builder writes these verbatim. The acceptance file's `BECAME` is the same table and is authoritative. `std` and `carry` are test regexes, not KB fields.

```js
const BECAME = {
  tortilla_chips: { decision: 'Organic masa tortilla chips in olive oil or tallow.', cart_pick: 'Organic masa tortilla chips: olive oil', tip1: 'Look for the USDA Organic seal, then masa, one named fat and salt.' },
  popcorn: { tip1: 'Look for a bag of kernels with popcorn as the only ingredient.' },
  miso: { decision: 'Organic miso of soybeans, salt and koji, any grain named.', cart_pick: 'Organic miso paste', tip1: 'Look for organic soybeans, koji and salt on the list, with any grain named.' },
  tempeh: { decision: 'Organic tempeh in a firm cake, bound white all through.', cart_pick: 'Firm organic tempeh cake', tip1: 'Look for a tempeh list of organic soybeans alone or with one named grain.' },
  natto: { decision: 'Organic natto in sealed trays, chilled or frozen.', cart_pick: 'Organic natto beans', tip1: 'Look for USDA Organic on the pack, with whole soybeans listed first.' },
  hot_soy_sauce: { decision: 'Organic soy sauce, traditionally brewed, not made fast with acid.', cart_pick: 'Organic naturally brewed soy sauce', tip1: 'Look for the words naturally brewed, with organic soybeans named first.' },
  kombucha: { decision: 'Plain kombucha from the refrigerated case, kept cold.', cart_pick: 'Plain refrigerated kombucha', tip1: 'Look for tea and sugar first on the list, with no fruit juice added.' },
  jam: { decision: 'Jam or preserves of fruit, sugar and pectin, nothing else.', cart_pick: 'Jam or preserves: fruit, sugar, pectin', tip1: 'Look for fruit first, then sugar and pectin, and nothing more on the jar.' },
  ketchup_mustard: { decision: 'Unsweetened ketchup from tomato; mustard of seed, vinegar, spice.', cart_pick: 'Unsweetened tomato ketchup and mustard', tip1: 'Look for a ketchup list of tomato, vinegar and spices, with no sweetener.' },
  canned_soup: { decision: 'Low-sodium canned soup, short list, no added flavors, can undented.', tip1: 'Look for a short list with no added flavors, starches or sugar.' },
  olives: { decision: 'Brine-cured olives, fermented in water and salt, nothing else.', tip1: 'Look for a jar of olives, water and salt, with no ferrous gluconate.' },
  salt: { decision: 'Iodized salt with no anti-caking agent on the list.', cart_pick: 'Iodized salt: no anti-caking agent', tip1: 'Look for iodide named on the list, with no anti-caking agent beside it.' },
  nutritional_yeast: { decision: 'Unfortified nutritional yeast flakes, granules or powder.', cart_pick: 'Unfortified nutritional yeast flakes', tip1: 'Look for inactive dried yeast and nothing more, with no vitamins listed.', watch_add: 'Fortified nutritional yeast comes second, behind one with no vitamins added.', tier_note: 'Added vitamins are read from the ingredients, and unfortified ranks first.' },
  snack_bars: { decision: 'Organic bars with oats or another whole grain listed first.', cart_pick: 'Organic oat snack bars', tip1: 'Look for organic oats first and fruit or honey as the only sweetener.' },
  trail_mix: { decision: 'Trail mix of nuts and dried fruit alone, nothing added.', cart_pick: 'Trail mix: nuts and dried fruit only', tip1: 'Look for a bag of only nuts and dried fruit, with no candy, oil or salt.' },
  hummus: { decision: 'Organic hummus of chickpeas and tahini, with no gums.', cart_pick: 'Organic hummus: chickpeas and tahini', tip1: 'Look for certified organic chickpeas and tahini, with no gum on the list.' },
};
```

Every kept tip and watch_out line is computed from `git show 6db979f`, not from literals. **If any base string quoted in this spec differs by even one character from the 6db979f KB, the KB value wins**; report the line.

### do-lines-review.md

1. Change only the headline cell (column 3), and only on these 15 rows. The line numbers were read by the planner at a1f9997:

   | id | line |
   | --- | --- |
   | kombucha | L168 |
   | miso | L173 |
   | tempeh | L174 |
   | natto | L175 |
   | salt | L178 |
   | nutritional_yeast | L186 |
   | jam | L192 |
   | ketchup_mustard | L193 |
   | hot_soy_sauce | L195 |
   | canned_soup | L196 |
   | olives | L197 |
   | tortilla_chips | L203 |
   | snack_bars | L207 |
   | trail_mix | L208 |
   | hummus | L211 |

   Each cell becomes the new decision verbatim. Re-find each row by its id if a line has shifted.
2. The do cell and the flags cell of every row stay byte-identical. The popcorn row (L205) does not change.
3. Run `node scripts/buildDoLines.js` from `server/`. `server/lib/doLines.json` must deepEqual its 6db979f value (C7). If buildDoLines changes doLines.json, stop and report.

## Hard limits

- Never edit `server/test/acceptance/passRule.js` or `k9.test.js`.
- Never edit these live-guard tests: ic4b–ic8b, ca-3b, ca-5, `twoLinePin.test.js`, `counterCardLint.test.js`, k5–k24, counterProbe48, concernSeedOilsB, concernGlyphosate, concernBioengineered, concernBpa, cardTidy, cardOrder, sugarsRank, ktight.
- Never edit the fixtures `w4.before.json` or `kb-pre-readability.json`.
- A red in any live guard is a content defect: stop and report (see Answers).
- On no entry change these fields: alias, asked_as, sources, evidence_tier, category, pick_steps, look_for, short_answer, kristy_take, why, question, labels_decoded, detail or science.
- watch_out and tier_note change only on nutritional_yeast.
- No entry outside the 16 changes (C6).
- Do not edit `server/lib/counterCardLint.js`, `counterCards.js`, `listMatch.js`, `server/routes/perimeter.js`, or any route or prompt.
- Do not run the migration.

## Pins and older tests

Each older test that freezes or reads a batch id at an earlier ref is routed through one new overlay; no assertion is deleted.

**twoLinePin.js (a) TWO_LINE repin.** `withTwoLine` is `{...entry, ...TWO_LINE[id]}`.
- Re-find each of the 16 rows by id. Planner-read start lines at a1f9997:

  | id | line |
  | --- | --- |
  | kombucha | L2310 |
  | miso | L2359 |
  | tempeh | L2369 |
  | natto | L2379 |
  | salt | L2408 |
  | nutritional_yeast | L2534 |
  | jam | L2604 |
  | ketchup_mustard | L2615 |
  | hot_soy_sauce | L2650 |
  | canned_soup | L2659 |
  | olives | L2681 |
  | tortilla_chips | L2774 |
  | popcorn | L2854 |
  | snack_bars | L2902 |
  | trail_mix | L2951 |
  | hummus | L2979 |

- What the rows pin, as read:
  - every row pins `decision` and `buying_tips`;
  - canned_soup also pins `watch_out` and `sources`;
  - tortilla_chips, popcorn and snack_bars also pin `detail` and `sources`;
  - snack_bars also pins `watch_out`;
  - hummus also pins `sources`.
- In each row, set `decision` and `buying_tips` to the new live value verbatim. On popcorn, only `buying_tips` changes.
- If a row pins `cart_pick`, `watch_out` or `tier_note` on nutritional_yeast, or `cart_pick` on any id, set that to the new live value too.
- Pinned fields this spec does not change stay as they are.

**twoLinePin.js (b) overlay.** Append this at the end of the file, after the clean-pick-4 block (L3383–3386). The file already imports `execFileSync` and defines `ROOT`.

```js
// clean-pick-5 (2026-10-20) moved these corn, soy, ferment, condiment and snack fronts on; older batch tests read them as of 6db979f, and cleanPick5.test.js owns the new text.
export const CLEAN_PICK_5 = new Set(['tortilla_chips', 'popcorn', 'miso', 'tempeh', 'natto', 'hot_soy_sauce', 'kombucha', 'jam', 'ketchup_mustard', 'canned_soup', 'olives', 'salt', 'nutritional_yeast', 'snack_bars', 'trail_mix', 'hummus']);
const PRE_CP5 = JSON.parse(execFileSync('git', ['show', '6db979f:server/kristy_perimeter_kb.json'], { cwd: ROOT, maxBuffer: 64 << 20 }).toString());
export const preCleanPick5 = (e) => (e && CLEAN_PICK_5.has(e.id) ? PRE_CP5.entries.find((x) => x.id === e.id) : e);
```

**Routed tests.** In each file, add `preCleanPick5` to the existing `./twoLinePin.js` import, then make the change below:

| file | line | old → new |
| --- | --- | --- |
| w2.test.js | L14 | `kb.entries = kb.entries.map((e) => preTidy(preCleanPick(preCleanPick2(preCleanPick3(preCleanPick4(e))))));` → `kb.entries = kb.entries.map((e) => preTidy(preCleanPick(preCleanPick2(preCleanPick3(preCleanPick4(preCleanPick5(e)))))));` |
| w4.test.js | L12 | `kb.entries = kb.entries.map((e) => preCleanPick(preCleanPick2(preCleanPick3(preCleanPick4(e)))));` → `kb.entries = kb.entries.map((e) => preCleanPick(preCleanPick2(preCleanPick3(preCleanPick4(preCleanPick5(e))))));` |
| ca-4b.test.js | L20 | same chain as w2 (`const LIVE = structuredClone(kb);` at L19 stays before it) |
| ca-7.test.js | L16 | same chain as w2 |
| concernAdditives.test.js | L12 | `kb.entries = kb.entries.map((e) => preTidy(preCleanPick3(preCleanPick4(e))));` → `kb.entries = kb.entries.map((e) => preTidy(preCleanPick3(preCleanPick4(preCleanPick5(e)))));` |

The imports sit at w2 L9, w4 L11, ca-4b L3, ca-7 L11 and concernAdditives L9. If a listed line reads differently from its "old" text, keep that line's existing chain, wrap the innermost `e` in `preCleanPick5(...)`, and report the line.

Note: `preTidy` sits outermost, so for tortilla_chips, popcorn and canned_soup (TIDIED) these chains still return the 8264bd0 entry. The wrap is harmless.

**cleanPick1.test.js:**
- The `LATER` Set (L225–227) ends with `/* clean-pick-4 */ 'sourdough', …, 'fresh_pasta']);`. Append `/* clean-pick-5 */` and the 16 ids inside the same Set.
- The C6 floor (L304, `nonEmpty(…, 'other entries', 143)`) goes to 127. If the measured outside count is not 132, set the floor to that count minus 5.
- C7 already skips LATER rows; no change there.

**cleanPick2.test.js:**
- The import at L8, `import { CLEAN_PICK_3, CLEAN_PICK_4 } from './twoLinePin.js';`, → `import { CLEAN_PICK_3, CLEAN_PICK_4, CLEAN_PICK_5 } from './twoLinePin.js';`.
- L10: `const LATER = new Set([...CLEAN_PICK_3, ...CLEAN_PICK_4]);` → `const LATER = new Set([...CLEAN_PICK_3, ...CLEAN_PICK_4, ...CLEAN_PICK_5]);`.
- The C6 floor at L207 goes from 159 to 143. If the measured count is not 148, set the floor to that count minus 5.

**cleanPick2b.test.js:**
- The L9 import → `import { CLEAN_PICK_3, CLEAN_PICK_4, CLEAN_PICK_5 } from './twoLinePin.js';`.
- In C3 at L57: `if (CLEAN_PICK_3.has(e.id) || CLEAN_PICK_4.has(e.id)) continue;` → `if (CLEAN_PICK_3.has(e.id) || CLEAN_PICK_4.has(e.id) || CLEAN_PICK_5.has(e.id)) continue;`.

**cleanPick3.test.js:**
- The L9 import `import { CLEAN_PICK_4 } from './twoLinePin.js';` → `import { CLEAN_PICK_4, CLEAN_PICK_5 } from './twoLinePin.js';`.
- C6, L132: the `others` filter gains `&& !CLEAN_PICK_5.has(e.id)`.
- C6, L133: the floor goes from 176 to 160. If the measured count is not 165, set it to that count minus 5.
- C7, L150: `if (CLEAN_PICK_4.has(id)) continue;` → `if (CLEAN_PICK_4.has(id) || CLEAN_PICK_5.has(id)) continue;`.

**cleanPick4.test.js** (dv wrote it at clean-pick-4, verbatim from that spec's Acceptance block; it has no twoLinePin import yet):
- After the `listMatch.js` import (L8), add `import { CLEAN_PICK_5 } from './twoLinePin.js';`.
- C6, L104: `const others = kb.entries.filter((e) => !IDS.includes(e.id));` → `const others = kb.entries.filter((e) => !IDS.includes(e.id) && !CLEAN_PICK_5.has(e.id));`.
- C6, L105: `nonEmpty(others, 'others', 195);` → `nonEmpty(others, 'others', 179);`. If the measured count is not 186, set it to that count minus 5.
- C7: the loop at L121, `for (const [id, row] of baseRows) {`, gains `if (CLEAN_PICK_5.has(id)) continue;` as its first line. Its `seen` count still equals cp4's DECISION_CHANGED, because no B5 id is in CLEAN_PICK_5.

**No change needed:**
- cardTidy reads ede90e7 and cardOrder reads git refs. cardTidy C10 reads `docs/do-lines-review.md` live, but only to assert `|| true`, and it compares doLines.json with HEAD; this batch leaves doLines.json byte-identical.
- concernBioengineered (L11) and concernBpa read through `preTidy`. tortilla_chips, popcorn and canned_soup are TIDIED, so their field freezes read 8264bd0.
- concernSeedOilsB reads live:
  - C3 needs the tortilla_chips and popcorn decisions to match `/olive|coconut|tallow|lard|butter/i`, and both do;
  - C1 still finds a seed oil and a natural fat in each card, because no base tip is removed.
- Live alias-routing and live-content guards, read as live: k15, k16, k18, k19, k20, k21, k22, k23, k24, ktight, counterProbe48, concernGlyphosate. C11 adds the reach checks that a cart change could disturb.

## Criteria

- C1 [test] Given 6db979f, when the KB is read, then each of the 16 ids deepEquals its expected entry (the base plus the BECAME fields, with tip1 at index 1 and, on nutritional_yeast, watch_add last and the new tier_note), and its decision, cart_pick or buying_tips[1] contains its carry phrase.
- C2 [test] Given the 16 ids, then every decision is ≤10 words and every cart_pick ≤46 chars; `node scripts/twoLineCheck.js` (in verify) reports 0 of 181.
- C3 [test] Given the 16 ids, then buying_tips[0] equals the 6db979f tip 0, does not match `/^(choose|pick|buy|read|check|look|skip|compare)\b/i`, and is not the decision; and buying_tips[1] equals tip1 and matches the id's std.
- C4 [test] Given every new string (≥40), then none matches BANNED or the concernAdditives no-treatment pattern, none contains "—", "–", a straight apostrophe or first person, and no new string on tortilla_chips, popcorn, snack_bars, trail_mix or hummus (≥12) names sodium or a seed oil.
- C5 [test] Given the 16 ids, then no 6db979f decision or cart_pick names organic, and a live decision plus cart_pick names organic exactly when the id is one of tortilla_chips, miso, tempeh, natto, hot_soy_sauce, snack_bars, hummus, in which case both the decision and the cart_pick do.
- C6 [test] Given the entries outside the 16 (≥190), then each deepEquals 6db979f, and the entry count and every top-level key other than entries are unchanged.
- C7 [test] Given doLines.json, then it deepEquals 6db979f; in do-lines-review.md, taking the first row per id, exactly the 15 decision-changed ids have a headline cell equal to the live decision and a do cell equal to 6db979f, and every other row is byte-identical.
- C8 [test] Given each of the 16 ids, then every 6db979f buying_tip is still in buying_tips and every 6db979f watch_out line is still in watch_out.
- C9 [test] Given each of the 16 ids, then `matchItemToCard(cart_pick)` returns that id; `node scripts/listMatchProbe.js` (in verify) reports no wrong match.
- C10 [test] Given every new decision, cart_pick, tip1, watch_add and tier_note (≥40), then no exact string sits on more than 2 entries [PLACEHOLDER threshold 2].
- C11 [test] Given salt and nutritional_yeast, then salt's decision and cart match /iodized/i and /no anti-caking/i; nutritional_yeast's decision and cart match /unfortified/i, its last watch_out matches /fortified/i and /second/i, and its tier_note matches /unfortified ranks first/ and not /never a ranking/; and the 19 reach queries in the table below route to their cards.

  | query | card |
  | --- | --- |
  | 'tortilla chips' | tortilla_chips |
  | 'popcorn kernels' | popcorn |
  | 'snack bars' | snack_bars |
  | 'granola bar' | snack_bars |
  | 'granola' | breakfast_cereal |
  | 'trail mix' | trail_mix |
  | 'nuts' | nuts_raw_vs_roasted |
  | 'dried fruit' | dried_fruit |
  | 'hummus' | hummus |
  | 'miso paste' | miso |
  | 'tempeh' | tempeh |
  | 'natto' | natto |
  | 'soy sauce' | hot_soy_sauce |
  | 'tamari' | hot_soy_sauce |
  | 'nutritional yeast' | nutritional_yeast |
  | 'sea salt' | salt |
  | 'kombucha' | kombucha |
  | 'ketchup' | ketchup_mustard |
  | 'jam' | jam |

## Ship notes

- **Nothing was executed while writing this spec.** Every C9 and C11 routing result and every lint outcome was simulated by reading `server/lib/listMatch.js` (`matchItemToCard`, the head rule) against the working-tree KB. **The admin runs the probes before `dv check`.** C9 and C11 pin them, and a miss means a spec revision.
- Simulated cart → slug (none of these routes has been executed):

  | id | cart | slug | confidence |
  | --- | --- | --- | --- |
  | tortilla_chips | "Organic masa tortilla chips: olive oil" | tortilla_chips | confident (alias "tortilla chips") |
  | popcorn | "Plain popcorn kernels" (kept) | popcorn | confident |
  | miso | "Organic miso paste" | miso | confident (alias "miso paste") |
  | tempeh | "Firm organic tempeh cake" | tempeh | confident ("tempeh cake") |
  | natto | "Organic natto beans" | natto | confident ("natto beans") |
  | hot_soy_sauce | "Organic naturally brewed soy sauce" | hot_soy_sauce | confident (alias "naturally brewed soy sauce") |
  | kombucha | "Plain refrigerated kombucha" | kombucha | confident |
  | salt | "Iodized salt: no anti-caking agent" | salt | confident (head "salt", alias "iodized salt") |
  | nutritional_yeast | "Unfortified nutritional yeast flakes" | nutritional_yeast | confident (alias "yeast flakes") |
  | canned_soup | "Low sodium canned soup, undented can" (kept) | canned_soup | confident |
  | olives | "Olives cured in brine" (kept) | olives | confident |
  | hummus | "Organic hummus: chickpeas and tahini" | hummus | confident (head before the colon) |
  | jam | "Jam or preserves: fruit, sugar, pectin" | jam | **PROBE**: head "preserves" |
  | ketchup_mustard | "Unsweetened tomato ketchup and mustard" | ketchup_mustard | **PROBE**: head "mustard" |
  | snack_bars | "Organic oat snack bars" | snack_bars | **PROBE**: head "bars", alias "snack bars" |
  | trail_mix | "Trail mix: nuts and dried fruit only" | trail_mix | **PROBE**: dried_fruit and nuts_raw_vs_roasted both score, though both fail the head rule |

  A `typeContradicts` veto on any new cart was not checked.
- Nine 6db979f carts simulate as head-rule misses, and this batch replaces all nine:
  - kombucha "…refrigerated case";
  - miso "…koji";
  - tempeh "…bound white";
  - natto "…cold case";
  - hot_soy_sauce "…by fermentation";
  - nutritional_yeast "…either type";
  - snack_bars "…first";
  - trail_mix "…little else";
  - hummus "…tahini".
- **popcorn without organic** departs from `docs/CLEAN-PICK-PLAN.md` L311, which lists popcorn under "T1 organic (bioengineered crop)". The card's own CSPI line says popcorn is never bioengineered, so an organic front would rest on a crop reason the card denies. Plain kernels with nothing else already sit closest to source.
- **Q3 recorded as A** (plan L362): salt stays iodized and the cart is aligned. "No anti-caking agent" is this spec's call under the no-additives rule.
- **Q5 recorded as A** (plan L363): unfortified first, and fortified second in watch_out. The tier_note moves because its "never a ranking" contradicted the front.
- **Lint risks not verified by running:**
  - lintRepeatedClaim on miso, where the decision and tip1 both say "any grain named";
  - lintSections L2 4-gram repetition across bulk_pantry cards for the "Look for … on the list" tip1 wordings;
  - readability and lintCard on the k20–k23 cards (k21 C6, for example, runs `readability` and `lintCard` live on salt and nutritional_yeast);
  - k21 C2, k22 and k23 asked_as "tops the ask door" if `scoreEntries` reads decision text.
- Pin and test files beyond the KB and do-lines owns: 11. Not split, because each repoint is one import line plus one map chain, one skip or one floor, the same pattern B1–B5 shipped with.

## Contract

```json
{
  "criteria": [
    {
      "id": "C1",
      "impl": ["server/kristy_perimeter_kb.json", "server/test/acceptance/twoLinePin.js"],
      "tests": ["server/test/acceptance/cleanPick5.test.js"],
      "dependents": [
        "server/test/acceptance/twoLinePin.test.js",
        "server/test/acceptance/w2.test.js",
        "server/test/acceptance/w4.test.js",
        "server/test/acceptance/ca-4b.test.js",
        "server/test/acceptance/ca-7.test.js",
        "server/test/acceptance/concernAdditives.test.js"
      ],
      "reads": ["git show 6db979f:server/kristy_perimeter_kb.json"],
      "expect": "16 ids equal base plus BECAME; carry phrase present"
    },
    {
      "id": "C2",
      "impl": ["server/kristy_perimeter_kb.json"],
      "tests": ["server/test/acceptance/cleanPick5.test.js"],
      "dependents": ["server/scripts/twoLineCheck.js"],
      "reads": [],
      "expect": "decision <=10 words, cart <=46 chars, twoLineCheck 0 of 181"
    },
    {
      "id": "C3",
      "impl": ["server/kristy_perimeter_kb.json"],
      "tests": ["server/test/acceptance/cleanPick5.test.js"],
      "dependents": ["server/lib/counterCards.js"],
      "reads": ["git show 6db979f:server/kristy_perimeter_kb.json"],
      "expect": "tips[0] is the base why, tips[1] the new standard line"
    },
    {
      "id": "C4",
      "impl": ["server/kristy_perimeter_kb.json"],
      "tests": ["server/test/acceptance/cleanPick5.test.js"],
      "dependents": ["server/test/acceptance/concernAdditives.test.js", "server/test/acceptance/k23.test.js"],
      "reads": [],
      "expect": ">=40 new strings clean of banned, treatment, dash, straight apostrophe, first person; >=12 snack strings with no sodium or seed-oil word"
    },
    {
      "id": "C5",
      "impl": ["server/kristy_perimeter_kb.json"],
      "tests": ["server/test/acceptance/cleanPick5.test.js"],
      "dependents": ["server/lib/counterCardLint.js"],
      "reads": ["git show 6db979f:server/kristy_perimeter_kb.json"],
      "expect": "organic on decision and cart of exactly the seven crop ids"
    },
    {
      "id": "C6",
      "impl": ["server/kristy_perimeter_kb.json"],
      "tests": ["server/test/acceptance/cleanPick5.test.js"],
      "dependents": [
        "server/test/acceptance/cleanPick1.test.js",
        "server/test/acceptance/cleanPick2.test.js",
        "server/test/acceptance/cleanPick2b.test.js",
        "server/test/acceptance/cleanPick3.test.js",
        "server/test/acceptance/cleanPick4.test.js"
      ],
      "reads": ["git show 6db979f:server/kristy_perimeter_kb.json"],
      "expect": ">=190 outside entries deepEqual base; top-level keys unchanged"
    },
    {
      "id": "C7",
      "impl": ["docs/do-lines-review.md", "server/lib/doLines.json"],
      "tests": ["server/test/acceptance/cleanPick5.test.js"],
      "dependents": [
        "server/scripts/buildDoLines.js",
        "server/test/acceptance/ca-4b.test.js",
        "server/test/acceptance/cleanPick3.test.js",
        "server/test/acceptance/cleanPick4.test.js"
      ],
      "reads": ["git show 6db979f:docs/do-lines-review.md", "git show 6db979f:server/lib/doLines.json"],
      "expect": "15 headline cells moved; do cells and doLines.json unchanged"
    },
    {
      "id": "C8",
      "impl": ["server/kristy_perimeter_kb.json"],
      "tests": ["server/test/acceptance/cleanPick5.test.js"],
      "dependents": [],
      "reads": ["git show 6db979f:server/kristy_perimeter_kb.json"],
      "expect": "every base tip and watch_out line kept"
    },
    {
      "id": "C9",
      "impl": ["server/kristy_perimeter_kb.json"],
      "tests": ["server/test/acceptance/cleanPick5.test.js"],
      "dependents": ["server/lib/listMatch.js", "server/scripts/listMatchProbe.js"],
      "reads": [],
      "expect": "each of 16 cart_picks matches its own id"
    },
    {
      "id": "C10",
      "impl": ["server/kristy_perimeter_kb.json"],
      "tests": ["server/test/acceptance/cleanPick5.test.js"],
      "dependents": [],
      "reads": [],
      "expect": ">=40 new strings, none on more than 2 entries"
    },
    {
      "id": "C11",
      "impl": ["server/kristy_perimeter_kb.json"],
      "tests": ["server/test/acceptance/cleanPick5.test.js"],
      "dependents": [
        "server/test/acceptance/k20.test.js",
        "server/test/acceptance/k21.test.js",
        "server/test/acceptance/k22.test.js",
        "server/test/acceptance/k23.test.js",
        "server/test/counterProbe48.test.js"
      ],
      "reads": [],
      "expect": "salt iodized with no anti-caking; nutritional yeast unfortified first, fortified second, tier_note ranks; 19 reach queries land"
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

- **Suite runtime:** `npm test` is the full server suite (2890 at 6db979f). Run `node --test server/test/acceptance/cleanPick5.test.js` on its own first, and the full suite once, at the end.
- **Allowed reads:**
  - the files in owns and read_full;
  - `server/lib/counterCardLint.js`, `server/lib/counterCards.js`, `server/routes/perimeter.js` and `server/scripts/twoLineCheck.js`;
  - the live guards k20–k23 and concernSeedOilsB, to read a red, never to edit;
  - `git show 6db979f:<path>`.
- **Admin pre-dispatch probe:** run it once from `server/`, either with the KB temporarily carrying the BECAME carts, or after the build and before the critic. Pass each new cart and each C11 query as an argument. The expected slugs are the C9 cart table and the C11 table above; the four **PROBE** rows matter most.

  ```
  node -e "import('./lib/listMatch.js').then(async ({ matchItemToCard }) => { for (const q of process.argv.slice(1)) console.log(q, '->', (await matchItemToCard(q))?.slug); })" "Jam or preserves: fruit, sugar, pectin" "Unsweetened tomato ketchup and mustard" "Organic oat snack bars" "Trail mix: nuts and dried fruit only" "Organic masa tortilla chips: olive oil" "Organic miso paste" "Firm organic tempeh cake" "Organic natto beans" "Organic naturally brewed soy sauce" "Plain refrigerated kombucha" "Iodized salt: no anti-caking agent" "Unfortified nutritional yeast flakes" "Organic hummus: chickpeas and tahini" "granola bar" "tamari" "nuts" "dried fruit" "granola"
  ```
- **If something goes red on a BECAME string**, whether a lint (lintCard, lintSections, lintRepeatedClaim, readability, TIER_NOTE_*), a live guard (ic4b–ic8b, ca-3b, ca-5, the k-series, counterProbe48, concernSeedOilsB) or C9/C11:
  - Stop and report RED with the lint output or the matched slug.
  - Name the nearest passing wording for that one string, keeping its role (headline, cart, standard line or tier note).
  - The acceptance test pins every string, so a rewording is a spec revision, not a builder call. Never loosen a lint.
  - Pre-chosen fallbacks:

    | string | fallback |
    | --- | --- |
    | jam cart | "Jam or preserves named for its fruit" (the 6db979f cart; the standard stays in the headline and tip1) |
    | ketchup_mustard cart | "Ketchup from tomato; mustard from seed" (the 6db979f cart) |
    | snack_bars cart | "Organic whole grain snack bars" |
    | trail_mix cart | "Short-list trail mix" |
    | miso tip1, if lintRepeatedClaim fires | "Look for organic soybeans, koji and salt at the top of the list." |
    | nutritional_yeast tier_note, if a TIER_NOTE lint fires | "Added vitamins are a label fact read from the ingredients; unfortified ranks first." |
- **If a test outside the routed list goes red on a batch id at an older ref:** route it through `preCleanPick5` the same way, and list it in the report as an owns addition. A red on a live guard is a content defect, not a routing case.

## Tried and rejected

- **Organic on popcorn:** its own CSPI line says popcorn is never bioengineered; plain kernels are already the closest-to-source pick.
- **"Granola" in the snack_bars cart:** it risks the 'granola' → breakfast_cereal route.
- **"Organic natto trays", and carts ending in case, koji, type, first, else, tahini or white:** these are head-rule misses (the nine 6db979f carts listed in Ship notes).
- **"BPA-free" on a canned_soup front:** k22 bars the word on new front text, and the base tip already carries it.
- **"Sodium" or seed-oil words on any snack-card string:** k23 C16 and this spec's C4.
- **Keeping coconut in the tortilla_chips headline with organic:** 11 words.
- **"With olive oil" in the hummus headline:** it would exclude the no-added-oil tub that the card's own tip names first.
- **"Salt and iodide alone" as salt tip1:** the card's material does not cover the stabilizer that iodized salt can carry, so the line would promise a list the card cannot vouch for.
- **Salt with nothing added (Q3 B):** iodine would move to watch_out. Rejected per the plan's recommended A.
- **Leaving the nutritional_yeast tier_note:** "never a ranking" contradicts the new front.
- **Adding aliases:** forbidden by the k20/k22/k23 FORBIDDEN lists and steal sweeps; no route here needs one.
- **Editing the live guards or passRule.js, or overlaying them:** the first is barred, and the second would hide content defects.

## Acceptance server/test/acceptance/cleanPick5.test.js

```js
// clean-pick-5 (Devon 2026-10-20): B6 corn, soy, ferments, condiments and snacks name each item’s own cleanest version.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { nonEmpty } from '../../lib/testGuards.js';
import { matchItemToCard } from '../../lib/listMatch.js';

const ROOT = fileURLToPath(new URL('../../../', import.meta.url));
const git = (ref) => execFileSync('git', ['show', ref], { cwd: ROOT, maxBuffer: 64 << 20 }).toString();
const kb = JSON.parse(readFileSync(new URL('../../kristy_perimeter_kb.json', import.meta.url), 'utf8'));
const base = JSON.parse(git('6db979f:server/kristy_perimeter_kb.json'));
const find = (k, id) => k.entries.find((e) => e.id === id);
const live = (id) => find(kb, id);
const was = (id) => find(base, id);
const words = (s) => s.trim().split(/\s+/).length;

const BECAME = {
  tortilla_chips: { decision: 'Organic masa tortilla chips in olive oil or tallow.', cart_pick: 'Organic masa tortilla chips: olive oil', tip1: 'Look for the USDA Organic seal, then masa, one named fat and salt.', std: /USDA Organic seal/, carry: /organic/i },
  popcorn: { tip1: 'Look for a bag of kernels with popcorn as the only ingredient.', std: /popcorn as the only ingredient/, carry: /popcorn as the only ingredient/ },
  miso: { decision: 'Organic miso of soybeans, salt and koji, any grain named.', cart_pick: 'Organic miso paste', tip1: 'Look for organic soybeans, koji and salt on the list, with any grain named.', std: /organic soybeans, koji and salt/, carry: /organic/i },
  tempeh: { decision: 'Organic tempeh in a firm cake, bound white all through.', cart_pick: 'Firm organic tempeh cake', tip1: 'Look for a tempeh list of organic soybeans alone or with one named grain.', std: /organic soybeans alone/, carry: /organic/i },
  natto: { decision: 'Organic natto in sealed trays, chilled or frozen.', cart_pick: 'Organic natto beans', tip1: 'Look for USDA Organic on the pack, with whole soybeans listed first.', std: /USDA Organic on the pack/, carry: /organic/i },
  hot_soy_sauce: { decision: 'Organic soy sauce, traditionally brewed, not made fast with acid.', cart_pick: 'Organic naturally brewed soy sauce', tip1: 'Look for the words naturally brewed, with organic soybeans named first.', std: /naturally brewed, with organic soybeans/, carry: /organic/i },
  kombucha: { decision: 'Plain kombucha from the refrigerated case, kept cold.', cart_pick: 'Plain refrigerated kombucha', tip1: 'Look for tea and sugar first on the list, with no fruit juice added.', std: /no fruit juice added/, carry: /plain|no fruit juice/i },
  jam: { decision: 'Jam or preserves of fruit, sugar and pectin, nothing else.', cart_pick: 'Jam or preserves: fruit, sugar, pectin', tip1: 'Look for fruit first, then sugar and pectin, and nothing more on the jar.', std: /fruit first, then sugar and pectin/, carry: /pectin/i },
  ketchup_mustard: { decision: 'Unsweetened ketchup from tomato; mustard of seed, vinegar, spice.', cart_pick: 'Unsweetened tomato ketchup and mustard', tip1: 'Look for a ketchup list of tomato, vinegar and spices, with no sweetener.', std: /no sweetener/, carry: /unsweetened|no sweetener/i },
  canned_soup: { decision: 'Low-sodium canned soup, short list, no added flavors, can undented.', tip1: 'Look for a short list with no added flavors, starches or sugar.', std: /no added flavors/, carry: /no added flavors/i },
  olives: { decision: 'Brine-cured olives, fermented in water and salt, nothing else.', tip1: 'Look for a jar of olives, water and salt, with no ferrous gluconate.', std: /no ferrous gluconate/, carry: /nothing else|no ferrous gluconate/i },
  salt: { decision: 'Iodized salt with no anti-caking agent on the list.', cart_pick: 'Iodized salt: no anti-caking agent', tip1: 'Look for iodide named on the list, with no anti-caking agent beside it.', std: /iodide named on the list/, carry: /no anti-caking/i },
  nutritional_yeast: { decision: 'Unfortified nutritional yeast flakes, granules or powder.', cart_pick: 'Unfortified nutritional yeast flakes', tip1: 'Look for inactive dried yeast and nothing more, with no vitamins listed.', watch_add: 'Fortified nutritional yeast comes second, behind one with no vitamins added.', tier_note: 'Added vitamins are read from the ingredients, and unfortified ranks first.', std: /no vitamins listed/, carry: /unfortified/i },
  snack_bars: { decision: 'Organic bars with oats or another whole grain listed first.', cart_pick: 'Organic oat snack bars', tip1: 'Look for organic oats first and fruit or honey as the only sweetener.', std: /organic oats first/, carry: /organic/i },
  trail_mix: { decision: 'Trail mix of nuts and dried fruit alone, nothing added.', cart_pick: 'Trail mix: nuts and dried fruit only', tip1: 'Look for a bag of only nuts and dried fruit, with no candy, oil or salt.', std: /only nuts and dried fruit/, carry: /nuts and dried fruit/i },
  hummus: { decision: 'Organic hummus of chickpeas and tahini, with no gums.', cart_pick: 'Organic hummus: chickpeas and tahini', tip1: 'Look for certified organic chickpeas and tahini, with no gum on the list.', std: /certified organic chickpeas/, carry: /organic/i },
};
const IDS = Object.keys(BECAME);
const DECISION_CHANGED = IDS.filter((id) => BECAME[id].decision);
const ORGANIC = new Set(['tortilla_chips', 'miso', 'tempeh', 'natto', 'hot_soy_sauce', 'snack_bars', 'hummus']);
const SNACKS = ['tortilla_chips', 'popcorn', 'snack_bars', 'trail_mix', 'hummus'];
const OILY = /\b(sodium|canola|soybean|sunflower|safflower|cottonseed|grapeseed|rice bran|corn oil|vegetable oils?|seed oils?)\b/i;
const BANNED = /\b(health|healthy|healthier|safer|risk|cancer|disease|toxic|toxin|detox|pesticide-free|synthetic|price|cost|cheap|expensive)\b/i;
const TREATMENT = /\b(causes?|prevents?|lowers? (the )?risk|carcinogen|cancer|tumou?rs?|toxic|unsafe|harm\w*|risks?|linked to|hyperactiv|behaviou?r|attention|neurobehavioral|exacerbate)/i;
const REACH = [
  ['tortilla chips', 'tortilla_chips'], ['popcorn kernels', 'popcorn'], ['snack bars', 'snack_bars'], ['granola bar', 'snack_bars'], ['granola', 'breakfast_cereal'],
  ['trail mix', 'trail_mix'], ['nuts', 'nuts_raw_vs_roasted'], ['dried fruit', 'dried_fruit'], ['hummus', 'hummus'], ['miso paste', 'miso'],
  ['tempeh', 'tempeh'], ['natto', 'natto'], ['soy sauce', 'hot_soy_sauce'], ['tamari', 'hot_soy_sauce'], ['nutritional yeast', 'nutritional_yeast'],
  ['sea salt', 'salt'], ['kombucha', 'kombucha'], ['ketchup', 'ketchup_mustard'], ['jam', 'jam'],
];
const idOf = (r) => r?.slug;

// Expected entry: the 6db979f entry plus the BECAME fields, computed the way the Change section states.
function expected(id) {
  const w = structuredClone(was(id));
  const b = BECAME[id];
  const e = { ...w, buying_tips: [w.buying_tips[0], b.tip1, ...w.buying_tips.slice(1)] };
  for (const f of ['decision', 'cart_pick', 'tier_note']) if (b[f]) e[f] = b[f];
  if (b.watch_add) e.watch_out = [...(w.watch_out ?? []), b.watch_add];
  return e;
}

// Every new string the batch writes into a field shoppers see.
const fresh = (ids = IDS) => ids.flatMap((id) => {
  const b = BECAME[id];
  return [b.decision, b.cart_pick, b.tip1, b.watch_add, b.tier_note].filter(Boolean);
});

nonEmpty(IDS, 'IDS', 16);

test('C1 the 16 ids equal their expected entries and carry their phrase', () => {
  for (const id of IDS) {
    assert.ok(live(id) && was(id), `${id} missing`);
    assert.deepEqual(live(id), expected(id), id);
    const l = live(id);
    assert.match(`${l.decision} ${l.cart_pick || ''} ${l.buying_tips[1]}`, BECAME[id].carry, `${id} carry phrase`);
  }
});

test('C2 decisions are at most 10 words and carts at most 46 characters', () => {
  for (const id of IDS) {
    const l = live(id);
    assert.ok(words(l.decision) <= 10, `${id} decision ${words(l.decision)} words`);
    if (l.cart_pick) assert.ok(l.cart_pick.length <= 46, `${id} cart ${l.cart_pick.length} chars`);
  }
});

test('C3 tips[0] stays the base why; tips[1] is the new standard line', () => {
  for (const id of IDS) {
    const t = live(id).buying_tips;
    assert.equal(t[0], was(id).buying_tips[0], `${id} tip 0`);
    assert.doesNotMatch(t[0], /^(choose|pick|buy|read|check|look|skip|compare)\b/i, `${id} tip 0 imperative`);
    assert.notEqual(t[0], live(id).decision, id);
    assert.equal(t[1], BECAME[id].tip1, `${id} tip 1`);
    assert.match(t[1], BECAME[id].std, `${id} tip 1 standard`);
  }
});

test('C4 no new text carries a banned or treatment word, a dash, a straight apostrophe or first person; snack text names no sodium or seed oil', () => {
  const all = fresh();
  nonEmpty(all, 'written', 40);
  for (const s of all) {
    assert.doesNotMatch(s, BANNED, s);
    assert.doesNotMatch(s, TREATMENT, s);
    assert.doesNotMatch(s, /\b(I|me|my|mine|we|our|us)\b/, s);
    assert.ok(!s.includes('—') && !s.includes('–'), s);
    assert.ok(!s.includes("'"), s);
  }
  const snack = fresh(SNACKS);
  nonEmpty(snack, 'snack strings', 12);
  for (const s of snack) assert.doesNotMatch(s, OILY, s);
});

test('C5 organic sits on the decision and cart of exactly the seven crop ids', () => {
  nonEmpty([...ORGANIC], 'organic ids', 7);
  for (const id of IDS) {
    const l = live(id);
    const w = was(id);
    assert.doesNotMatch(`${w.decision} ${w.cart_pick || ''}`, /\borganic\b/i, `${id} base front`);
    assert.equal(/\borganic\b/i.test(`${l.decision} ${l.cart_pick || ''}`), ORGANIC.has(id), id);
    if (ORGANIC.has(id)) {
      assert.match(l.decision, /\borganic\b/i, `${id} decision`);
      assert.match(l.cart_pick, /\borganic\b/i, `${id} cart`);
    }
  }
});

test('C6 entries outside the batch deepEqual 6db979f; count and top-level keys unchanged', () => {
  const others = kb.entries.filter((e) => !IDS.includes(e.id));
  nonEmpty(others, 'others', 190);
  assert.equal(kb.entries.length, base.entries.length);
  for (const e of others) assert.deepEqual(e, was(e.id), e.id);
  assert.deepEqual(Object.keys(kb).sort(), Object.keys(base).sort());
  for (const k of Object.keys(base)) if (k !== 'entries') assert.deepEqual(kb[k], base[k], k);
});

test('C7 doLines.json unchanged; review headlines move only on the batch ids', () => {
  const now = JSON.parse(readFileSync(new URL('../../lib/doLines.json', import.meta.url), 'utf8'));
  assert.deepEqual(now, JSON.parse(git('6db979f:server/lib/doLines.json')));
  const rows = (txt) => new Map(txt.split('\n').filter((l) => l.startsWith('| `')).map((l) => [l.split('`')[1], l]).reverse()); // first row per id wins: the main table, not the historical notes
  const liveRows = rows(readFileSync(new URL('../../../docs/do-lines-review.md', import.meta.url), 'utf8'));
  const baseRows = rows(git('6db979f:docs/do-lines-review.md'));
  nonEmpty([...baseRows.keys()], 'review rows', 150);
  assert.equal(liveRows.size, baseRows.size);
  let seen = 0;
  for (const [id, row] of baseRows) {
    const lr = liveRows.get(id);
    assert.ok(lr, id);
    if (DECISION_CHANGED.includes(id)) {
      const lc = lr.split('|').map((c) => c.trim());
      const bc = row.split('|').map((c) => c.trim());
      assert.equal(lc[3], live(id).decision, id);
      assert.equal(lc[4], bc[4], `${id} do cell`);
      seen += 1;
    } else {
      assert.equal(lr, row, id);
    }
  }
  assert.equal(seen, DECISION_CHANGED.length);
});

test('C8 every base tip and watch_out line is kept', () => {
  for (const id of IDS) {
    const l = live(id);
    nonEmpty(was(id).buying_tips, `${id} base tips`, 1);
    was(id).buying_tips.forEach((t, i) => assert.ok(l.buying_tips.includes(t), `${id} lost tip ${i}`));
    (was(id).watch_out ?? []).forEach((t, i) => assert.ok((l.watch_out ?? []).includes(t), `${id} lost watch_out ${i}`));
  }
});

test('C9 each cart pick matches its own card', async () => {
  const carts = IDS.filter((id) => live(id).cart_pick);
  nonEmpty(carts, 'carts', 16);
  for (const id of carts) {
    const got = idOf(await matchItemToCard(live(id).cart_pick));
    assert.equal(got, id, `${live(id).cart_pick} -> ${got}`);
  }
});

test('C10 no new string sits on more than 2 entries', () => {
  const all = fresh();
  nonEmpty(all, 'fresh', 40);
  for (const s of all) {
    const n = kb.entries.filter((e) => [e.decision, e.cart_pick, e.tier_note, ...(e.buying_tips || []), ...(e.watch_out || [])].includes(s)).length;
    assert.ok(n <= 2, `${s} on ${n} entries`);
  }
});

test('C11 salt is iodized with no anti-caking agent; nutritional yeast ranks unfortified first; reach queries still land', async () => {
  const s = live('salt');
  for (const f of ['decision', 'cart_pick']) {
    assert.match(s[f], /iodized/i, `salt ${f} iodized`);
    assert.match(s[f], /no anti-caking/i, `salt ${f} anti-caking`);
  }
  const n = live('nutritional_yeast');
  assert.match(n.decision, /unfortified/i, 'yeast decision');
  assert.match(n.cart_pick, /unfortified/i, 'yeast cart');
  const last = n.watch_out.at(-1);
  assert.match(last, /fortified/i, 'yeast watch_out');
  assert.match(last, /second/i, 'yeast watch_out rank');
  assert.match(n.tier_note, /unfortified ranks first/, 'yeast tier_note');
  assert.doesNotMatch(n.tier_note, /never a ranking/, 'yeast tier_note old');
  nonEmpty(REACH, 'reach', 19);
  for (const [q, id] of REACH) {
    const got = idOf(await matchItemToCard(q));
    assert.equal(got, id, `${q} -> ${got}`);
  }
});
```
