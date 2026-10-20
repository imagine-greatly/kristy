# clean-pick-4: B5 bread and grains name each item’s own cleanest version

```json
{
  "id": "clean-pick-4",
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
    "server/test/acceptance/cleanPick3.test.js"
  ],
  "read_full": [
    "server/test/acceptance/twoLinePin.js",
    "server/test/acceptance/cleanPick1.test.js",
    "server/test/acceptance/cleanPick2.test.js",
    "server/test/acceptance/cleanPick2b.test.js",
    "server/test/acceptance/cleanPick3.test.js",
    "docs/do-lines-review.md",
    "server/scripts/buildDoLines.js",
    "server/lib/testGuards.js",
    "server/lib/listMatch.js"
  ],
  "verify": "cd /Users/m1/kristy && node --test server/test/acceptance/cleanPick4.test.js && cd server && node scripts/buildDoLines.js && node scripts/twoLineCheck.js && node scripts/commitGuard.js && node scripts/listMatchProbe.js && npm test"
}
```

Repo `/Users/m1/kristy`, branch `main`, base `f488733` (clean-pick-3, critic@opus SHIP; taken from `git log`, not re-read by the planner). Baseline `npm test` at f488733: **2877 pass / 0 fail**, as recorded in the f488733 commit message; the planner ran nothing, so the admin confirms it before dispatch. Ship count: 2888 or more (2877 + 11). Not migrated.
Env: node, npm, git; `server/.env` not needed; no browser; no network; no writable dirs beyond the repo.

## Alignment

Devon 2026-10-20: "point them to the cleanest and healthiest version of the item they are getting" and "everything should be organic, no additives, no synthetic bs, from nature, as close to the source as possible"; 2026-10-19: fewer ingredients ranks higher. Ruling **Q5 A**: the unfortified cereal is the pick, and fortified is named second in watch_out. Devon's "go make all decisions" is the approval for every call below (`docs/CLEAN-PICK-PLAN.md` B5).

- **Done means:** Given the KB at f488733, when this lands, then:
  - each of the 9 ids below names its own cleanest version in its headline (all 9) and its cart pick (8 changed; buns_rolls keeps its own);
  - a new "look for" line naming the label standard sits at `buying_tips[1]`, and every f488733 tip survives one slot lower;
  - breakfast_cereal names unfortified in its decision and cart, and its last watch_out line ranks fortified second;
  - the six reach queries in C11 still land on their cards;
  - C1–C11 pass, and `npm test` reports 2888 or more passing with 0 fail.
- **Out of scope:** rice_arsenic (held, see Ship notes); every card outside the 9; aliases, asked_as, why, short_answer, kristy_take, pick_steps, look_for, sources, labels_decoded, evidence_tier, category, question, tier_note, detail and science; any do cell; everything under `server/lib/` except `doLines.json`, which is regenerated and must come out byte-identical; prompts; migration.
- **OK rough edges:**
  - No B5 front names organic (C5 asserts none do).
  - Whole wheat on sourdough, bagels and pretzels rests on the whole-wheat material of buns_rolls, sandwich_bread and flour_basics, not on each card's own sources.
  - Several cards grow to 5 or more tips.
  - The do lines read as before; pretzels' do line is about the crust, not the flour.
- **Ship bar:** any of these blocks shipping:
  - any of C1–C11 red;
  - `npm test` below 2888 passing, or any fail;
  - twoLineCheck reports anything other than 0 of 181;
  - listMatchProbe reports a wrong match;
  - any edit to `server/test/acceptance/passRule.js` or `k9.test.js` (k14 C12 requires `git diff 719f9fe -- passRule.js k9.test.js` to be empty);
  - a verdict subject changed beyond the table below.

## Change

Conventions:
- Curly apostrophes and quotes, as the KB uses them.
- No em dash or en dash; no first person.
- decision ≤10 words; cart_pick ≤46 chars.
- buying_tips[0] stays the f488733 tip, which is a why.
- Whole wheat, whole grain, all-butter and unfortified are label standards, never health effects.
- No new string contains protein, calorie, exposure, lowers, healthier, organic or any word on the C4 BANNED list.

**Per id, literally:**
- `decision` → BECAME.decision (all 9).
- `cart_pick` → BECAME.cart_pick where listed (7).
- `buying_tips` → `[base[0], tip1, ...base.slice(1)]`. The new tip goes in at **index 1**; every base tip shifts down one; none is deleted or edited.
- `watch_out` → `[...base.watch_out, watch_add]`, on breakfast_cereal only. Append at the end; create the array if the base has none.
- Every other field of every id stays at its f488733 value.

### Old → new

The old headlines are the f488733 headline cells in `docs/do-lines-review.md`. Each equals the live decision, and clean-pick-3 left the B5 rows untouched.

| id | old decision | new decision | old cart_pick → new cart_pick |
| --- | --- | --- | --- |
| sourdough | Sourdough of flour, water, salt and a starter. | Whole wheat sourdough: flour, water, salt and a starter. | Starter-fermented sourdough bread → Whole wheat sourdough bread |
| bagels | Bagels boiled before the oven, with their ingredients named. | Whole wheat bagels, boiled before the oven, ingredients named. | Boiled bagels with the ingredients named → Whole wheat boiled bakery bagels |
| breakfast_cereal | Whole-grain cereal or granola with less added sugar. | Unfortified whole-grain cereal or granola, less added sugar, no dyes. | Whole-grain breakfast cereal → Unfortified whole-grain breakfast cereal |
| gluten_free_bread | Bread labeled gluten-free, with its flours and gum binder named. | Gluten-free bread with its flours named and the fewest gums. | Bread labeled gluten-free → Short-list gluten-free bread |
| buns_rolls | Buns and rolls named whole wheat. | Whole wheat buns and rolls with no added sugar. | unchanged (Whole wheat buns or rolls) |
| pastries_muffins | Pastry made with butter, named on the label. | All-butter bakery pastries, no shortening or hydrogenated oil. | Pastry made with butter → All-butter bakery pastries |
| crackers | Crackers with a whole grain listed first on the ingredients. | Whole grain crackers with olive oil, coconut oil or butter. | Crackers with a whole grain first → Short-list whole grain crackers |
| pretzels | Pretzels listing flour, malt, oil, salt, yeast and soda. | Whole wheat pretzels with a short ingredient list. | Pretzels with a short ingredient list → Whole wheat pretzel twists |
| fresh_pasta | Fresh pasta of flour and egg, with little else listed. | Fresh pasta of flour and egg, with nothing added. | Fresh pasta of flour and egg → Additive-free fresh egg pasta |

Subject notes: every verdict subject stays the same item.
- **pretzels:** the cart says singular "pretzel" on purpose. `typeContradicts` (perimeter.js L130, TYPES group `pretzel / sourdough / whole_wheat`) reads an entry's types from its cart first. The plural misses `\bpretzel\b`, so a cart of "Whole wheat pretzels" would read only {whole_wheat}, and "pretzel sticks" and "pretzel twists" (k23, counter ask) would veto the card.
- **crackers:** the decision and cart say "whole grain", never "whole wheat". "sourdough crackers" (k23) needs crackers' cart and headline to carry no type word, so that its types fall through to the {sourdough} alias.
- **sourdough and bagels:** the carts keep a contiguous alias ("sourdough bread", "boiled bakery bagels"). That holds each card in the matcher's top 3 ahead of label_multigrain_vs_whole_grain, whose "whole wheat" alias scores on both carts but fails the head rule.
- **breakfast_cereal:** not sent to muesli, which is a different card.

### Final values

`alias_add` (bagels only) is appended to the end of that entry's `aliases` array: admin probe 2026-10-20 measured "Whole wheat boiled bakery bagels" and "whole wheat bagels" both routing to nothing without it and to bagels with it; listMatchProbe stays at no wrong matches. The builder writes these verbatim. The acceptance file's `BECAME` is the same table and is authoritative. `std` and `carry` are test regexes, not KB fields.

```js
const BECAME = {
  sourdough: { decision: 'Whole wheat sourdough: flour, water, salt and a starter.', cart_pick: 'Whole wheat sourdough bread', tip1: 'Look for whole wheat flour as the first ingredient, ahead of any white flour.' },
  bagels: { decision: 'Whole wheat bagels, boiled before the oven, ingredients named.', cart_pick: 'Whole wheat boiled bakery bagels', alias_add: 'whole wheat bagels', tip1: 'Look for whole wheat flour on the bag, named before any other flour.' },
  breakfast_cereal: { decision: 'Unfortified whole-grain cereal or granola, less added sugar, no dyes.', cart_pick: 'Unfortified whole-grain breakfast cereal', tip1: 'Look for a grain list with no added vitamins or minerals below it.', watch_add: 'A fortified cereal comes second, behind one with no vitamins or minerals added.' },
  gluten_free_bread: { decision: 'Gluten-free bread with its flours named and the fewest gums.', cart_pick: 'Short-list gluten-free bread', tip1: 'Look for a single gum binder, such as xanthan gum, not two or more.' },
  buns_rolls: { decision: 'Whole wheat buns and rolls with no added sugar.', tip1: 'Look for a list with no sugar or soybean oil after the whole wheat flour.' },
  pastries_muffins: { decision: 'All-butter bakery pastries, no shortening or hydrogenated oil.', cart_pick: 'All-butter bakery pastries', tip1: 'Look for butter as the only fat, with no shortening or hydrogenated oil.' },
  crackers: { decision: 'Whole grain crackers with olive oil, coconut oil or butter.', cart_pick: 'Short-list whole grain crackers', tip1: 'Look for whole grain flour, olive oil and salt, and little else, on the list.' },
  pretzels: { decision: 'Whole wheat pretzels with a short ingredient list.', cart_pick: 'Whole wheat pretzel twists', tip1: 'Look for whole wheat flour, not enriched flour, at the top of the list.' },
  fresh_pasta: { decision: 'Fresh pasta of flour and egg, with nothing added.', cart_pick: 'Additive-free fresh egg pasta', tip1: 'Look for flour and egg alone, with no ascorbic or citric acid added.' },
};
```

Every kept tip and watch_out line is computed from `git show f488733`, not from literals. **If any base string quoted in this spec differs by even one character from the f488733 KB, the KB value wins**; report the line.

### do-lines-review.md

1. Change only the headline cell (column 3), and only on these 9 rows: sourdough L121, bagels L122, breakfast_cereal L126, gluten_free_bread L151, buns_rolls L152, pastries_muffins L153, crackers L202, pretzels L206, fresh_pasta L214. The line numbers are as of 9131433; clean-pick-3 edits only headline cells, so they should hold at f488733. Each cell becomes the new decision verbatim.
2. The do cell and the flags cell of every row stay byte-identical; rice_arsenic L58 does not change.
3. Run `node scripts/buildDoLines.js` from `server/`. `server/lib/doLines.json` must deepEqual its f488733 value (C7). If buildDoLines changes doLines.json, stop and report.

## Hard limits

- Never edit `server/test/acceptance/passRule.js` or `k9.test.js`.
- Never edit these live-guard tests: ic4b–ic8b, ca-3b, ca-5, `twoLinePin.test.js`, `counterCardLint.test.js`, k5–k24, counterProbe48, concernSeedOilsB, concernGlyphosate, sugarsRank, ktight. Never edit the fixtures `w4.before.json` or `kb-pre-readability.json`. A red in any of them is a content defect: stop and report (see Answers).
- On no entry change alias, asked_as, sources, evidence_tier, category, pick_steps, look_for, short_answer, kristy_take, why, question, labels_decoded, tier_note, detail or science. watch_out changes only on breakfast_cereal.
- No entry outside the 9 changes (C6); rice_arsenic stays byte-identical.
- Do not edit `server/lib/counterCardLint.js`, `counterCards.js`, `listMatch.js`, `server/routes/perimeter.js`, or any route or prompt.
- Do not run the migration.

## Pins and older tests

Each older test that freezes or reads a batch id at an earlier ref is routed through one new overlay; no assertion is deleted.

**twoLinePin.js (a) TWO_LINE repin.** `withTwoLine` is `{...entry, ...TWO_LINE[id]}`.
- Re-find each of the 9 rows by id. Line numbers as of 9131433, which clean-pick-3's row edits have since shifted: sourdough L1362, bagels L1371, breakfast_cereal L1427, gluten_free_bread L1941, buns_rolls L1950, pastries_muffins L1959, crackers L2708, pretzels L2867, fresh_pasta L3020.
- In each row, set every pinned field that this spec changes (decision, cart_pick, buying_tips, watch_out) to the new live value verbatim.
- Pinned fields this spec does not change stay as they are. The rice_arsenic row does not change.

**twoLinePin.js (b) overlay.** Append this at the end of the file, after the clean-pick-3 block (the file already imports `execFileSync` and defines `ROOT`):

```js
// clean-pick-4 (2026-10-20) moved these bread and grain fronts on; older batch tests read them as of f488733, and cleanPick4.test.js owns the new text.
export const CLEAN_PICK_4 = new Set(['sourdough', 'bagels', 'breakfast_cereal', 'gluten_free_bread', 'buns_rolls', 'pastries_muffins', 'crackers', 'pretzels', 'fresh_pasta']);
const PRE_CP4 = JSON.parse(execFileSync('git', ['show', 'f488733:server/kristy_perimeter_kb.json'], { cwd: ROOT, maxBuffer: 64 << 20 }).toString());
export const preCleanPick4 = (e) => (e && CLEAN_PICK_4.has(e.id) ? PRE_CP4.entries.find((x) => x.id === e.id) : e);
```

**Routed tests.** In each file, add `preCleanPick4` to the existing `./twoLinePin.js` import, then:

| file | line | old → new |
| --- | --- | --- |
| w2.test.js | L14 | `kb.entries = kb.entries.map((e) => preTidy(preCleanPick(preCleanPick2(preCleanPick3(e)))));` → `kb.entries = kb.entries.map((e) => preTidy(preCleanPick(preCleanPick2(preCleanPick3(preCleanPick4(e))))));` |
| w4.test.js | L12 | `kb.entries = kb.entries.map((e) => preCleanPick(preCleanPick2(preCleanPick3(e))));` → `kb.entries = kb.entries.map((e) => preCleanPick(preCleanPick2(preCleanPick3(preCleanPick4(e)))));` |
| ca-4b.test.js | L20 | same chain as w2 (`const LIVE = structuredClone(kb);` at L19 stays before it) |
| ca-7.test.js | L16 | same chain as w2 |
| concernAdditives.test.js | L12 | `kb.entries = kb.entries.map((e) => preTidy(preCleanPick3(e)));` → `kb.entries = kb.entries.map((e) => preTidy(preCleanPick3(preCleanPick4(e))));` |

If a listed line reads differently from its "old" text, keep that line's existing chain and wrap the innermost `e` in `preCleanPick4(...)`; report the line.

**cleanPick1.test.js:**
- The `LATER` Set (L225 at 9131433) gains `/* clean-pick-4 */` and the 9 ids.
- The C6 floor (L302) goes from 152 to 143. If the measured outside count is not 148, set the floor to that count minus 5.
- C7 already skips LATER rows; no change there.

**cleanPick2.test.js:**
- Replace the import `import { CLEAN_PICK_3 as LATER } from './twoLinePin.js';` with `import { CLEAN_PICK_3, CLEAN_PICK_4 } from './twoLinePin.js';`, followed by `const LATER = new Set([...CLEAN_PICK_3, ...CLEAN_PICK_4]);`.
- The C6 floor goes from 168 to 159. If the measured count is not 164, set the floor to that count minus 5.
- Its C5, C6 and C7 LATER skips then cover B5 unchanged.

**cleanPick2b.test.js:**
- Extend the import to `import { CLEAN_PICK_3, CLEAN_PICK_4 } from './twoLinePin.js';`.
- In C3, `if (CLEAN_PICK_3.has(e.id)) continue;` → `if (CLEAN_PICK_3.has(e.id) || CLEAN_PICK_4.has(e.id)) continue;`.

**cleanPick3.test.js** (dv wrote it at clean-pick-3, verbatim from that spec's Acceptance block):
- Add `import { CLEAN_PICK_4 } from './twoLinePin.js';`.
- In C6, `const others = kb.entries.filter((e) => !IDS.includes(e.id));` → `const others = kb.entries.filter((e) => !IDS.includes(e.id) && !CLEAN_PICK_4.has(e.id));`, and `nonEmpty(others, 'others', 185);` → `nonEmpty(others, 'others', 176);`.
- The C7 loop `for (const [id, row] of baseRows) {` gains `if (CLEAN_PICK_4.has(id)) continue;` as its first line.

**No change needed:**
- Live alias-routing and live-content guards: k15, k16, k18, k19, k20, k23, k24, ktight, counterProbe48, concernSeedOilsB, concernGlyphosate. C11 adds the reach checks that the type veto could break.
- k10 (rice_arsenic is held).
- sugarsRank, ca-1, ca-4a, ca-5, ic3b, k5.

## Criteria

- C1 [test] Given f488733, when the KB is read, then each of the 9 ids deepEquals its expected entry: the base plus the BECAME fields, with tip1 at index 1 and, on breakfast_cereal, watch_add last. Its decision, cart_pick or buying_tips[1] contains its carry phrase.
- C2 [test] Given the 9 ids, then every decision is ≤10 words and every cart_pick ≤46 chars; `node scripts/twoLineCheck.js` (in verify) reports 0 of 181.
- C3 [test] Given the 9 ids, then buying_tips[0] equals the f488733 tip 0, does not match `/^(choose|pick|buy|read|check|look|skip|compare)\b/i`, and is not the decision; and buying_tips[1] equals tip1 and matches the id's std.
- C4 [test] Given every new string (≥25), then none matches BANNED or the concernAdditives no-treatment pattern, and none contains "—", "–", a straight apostrophe or first person.
- C5 [test] Given the 9 ids, then no decision or cart_pick matches /\borganic\b/i.
- C6 [test] Given the entries outside the 9 (≥195), then each deepEquals f488733, and the entry count and every top-level key other than entries are unchanged.
- C7 [test] Given doLines.json, then it deepEquals f488733. In do-lines-review.md, taking the first row per id, exactly the 9 ids have a headline cell equal to the live decision and a do cell equal to f488733, and every other row is byte-identical.
- C8 [test] Given each of the 9 ids, then every f488733 buying_tip is still in buying_tips.
- C9 [test] Given each of the 9 ids, then `matchItemToCard(cart_pick)` returns that id; `node scripts/listMatchProbe.js` (in verify) reports no wrong match.
- C10 [test] Given every new decision, cart_pick, tip1 and watch_add (≥25), then no exact string sits on more than 2 entries [PLACEHOLDER threshold 2].
- C11 [test] Given breakfast_cereal, then its decision and cart_pick match /unfortified/i, and its last watch_out line matches /fortified/i and /second/i. And `matchItemToCard` routes:

  | query | card |
  | --- | --- |
  | 'pretzel sticks' | pretzels |
  | 'pretzel twists' | pretzels |
  | 'sourdough crackers' | crackers |
  | 'sourdough bread' | sourdough |
  | 'whole wheat bagels' | bagels |
  | 'granola' | breakfast_cereal |

## Ship notes

- **Nothing was executed while writing this spec.** Every C9 and C11 routing result below and every lint call was simulated by reading `server/lib/listMatch.js` (`matchItemToCard`, `aliasNamesHead`, `singular`, INERT_MODIFIERS) and `server/routes/perimeter.js` (`scorePool`, `typeContradicts` L130) against the working-tree KB. **The admin runs the probes before `dv check`**; C9 and C11 pin them, and a miss means a spec revision.
- Simulated cart → slug:

  | id | cart | slug | note |
  | --- | --- | --- | --- |
  | sourdough | "Whole wheat sourdough bread" | sourdough | aliases "sourdough bread" + "sourdough"; label card scores lower and fails the head rule |
  | bagels | "Whole wheat boiled bakery bagels" | bagels | alias "boiled bakery bagels" |
  | breakfast_cereal | "Unfortified whole-grain breakfast cereal" | breakfast_cereal | |
  | gluten_free_bread | "Short-list gluten-free bread" | gluten_free_bread | old cart "Bread labeled gluten-free" routes to nothing (dv build simulation); new cart admin-probed 2026-10-20 → gluten_free_bread |
  | buns_rolls | unchanged | — | |
  | pastries_muffins | "All-butter bakery pastries" | pastries_muffins | grassfed_butter scores 3 on "butter"; pastries scores about 7 |
  | crackers | "Short-list whole grain crackers" | crackers | label card scores higher but fails the head rule; crackers is the thinnest margin in the batch |
  | pretzels | "Whole wheat pretzel twists" | pretzels | alias "pretzel twists"; the label card above it fails the head rule |
  | fresh_pasta | "Additive-free fresh egg pasta" | fresh_pasta | alias "fresh egg pasta" |
- Two f488733 carts simulate as broken, and this batch fixes both:
  - pastries_muffins "Pastry made with butter" routes wrong, to grassfed_butter: it has no pastries alias, and its head is "butter".
  - crackers "Crackers with a whole grain first" is a miss: its head is "first".
- rice_arsenic is held unchanged. Nothing on the card backs an unenriched or organic front, and its origin-first headline already names the cleanest version the sources support. C6 still covers it.
- Unfortified on breakfast_cereal rests on the archived NIH ODS page `docs/sources/k15/organ-meats-nih-ods-vitamin-a.md` L195 ("Some ready-to-eat cereals are also fortified with vitamin A."). The card does not cite that page, and no new source is cited.
- No B5 front names organic: a grain organic gloss would need a `server/lib` change (the same call as soy_milk in clean-pick-3).
- Not verified by reading, and these are the lint risks:
  - whether a G6/G7 gloss fires on "hydrogenated oil" (pastries) or "olive oil" (crackers) in a bulk_pantry front;
  - the full CULINARY_LEXICON word list against "boiled" (bagels decision and cart).
- Pin and test files beyond the KB and do-lines owns: 10. Not split, because each repoint is one import line plus one map chain, one skip or one floor, the same pattern B1–B4 shipped with.

## Contract

```json
{
  "criteria": [
    {
      "id": "C1",
      "impl": ["server/kristy_perimeter_kb.json", "server/test/acceptance/twoLinePin.js"],
      "tests": ["server/test/acceptance/cleanPick4.test.js"],
      "dependents": [
        "server/test/acceptance/twoLinePin.test.js",
        "server/test/acceptance/w2.test.js",
        "server/test/acceptance/w4.test.js",
        "server/test/acceptance/ca-4b.test.js",
        "server/test/acceptance/ca-7.test.js",
        "server/test/acceptance/concernAdditives.test.js"
      ],
      "reads": ["git show f488733:server/kristy_perimeter_kb.json"],
      "expect": "9 ids equal base plus BECAME; carry phrase present"
    },
    {
      "id": "C2",
      "impl": ["server/kristy_perimeter_kb.json"],
      "tests": ["server/test/acceptance/cleanPick4.test.js"],
      "dependents": ["server/scripts/twoLineCheck.js", "server/test/perimeter.test.js"],
      "reads": [],
      "expect": "decision <=10 words, cart <=46 chars, twoLineCheck 0 of 181"
    },
    {
      "id": "C3",
      "impl": ["server/kristy_perimeter_kb.json"],
      "tests": ["server/test/acceptance/cleanPick4.test.js"],
      "dependents": ["server/lib/counterCards.js"],
      "reads": ["git show f488733:server/kristy_perimeter_kb.json"],
      "expect": "tips[0] is the base why, tips[1] the new standard line"
    },
    {
      "id": "C4",
      "impl": ["server/kristy_perimeter_kb.json"],
      "tests": ["server/test/acceptance/cleanPick4.test.js"],
      "dependents": ["server/test/acceptance/concernAdditives.test.js"],
      "reads": [],
      "expect": ">=25 new strings, none with a banned or treatment word, dash, straight apostrophe or first person"
    },
    {
      "id": "C5",
      "impl": ["server/kristy_perimeter_kb.json"],
      "tests": ["server/test/acceptance/cleanPick4.test.js"],
      "dependents": ["server/lib/counterCardLint.js"],
      "reads": [],
      "expect": "organic on no B5 decision or cart"
    },
    {
      "id": "C6",
      "impl": ["server/kristy_perimeter_kb.json"],
      "tests": ["server/test/acceptance/cleanPick4.test.js"],
      "dependents": [
        "server/test/acceptance/cleanPick1.test.js",
        "server/test/acceptance/cleanPick2.test.js",
        "server/test/acceptance/cleanPick2b.test.js",
        "server/test/acceptance/cleanPick3.test.js"
      ],
      "reads": ["git show f488733:server/kristy_perimeter_kb.json"],
      "expect": ">=195 outside entries deepEqual base; top-level keys unchanged"
    },
    {
      "id": "C7",
      "impl": ["docs/do-lines-review.md", "server/lib/doLines.json"],
      "tests": ["server/test/acceptance/cleanPick4.test.js"],
      "dependents": [
        "server/scripts/buildDoLines.js",
        "server/test/acceptance/ca-4b.test.js",
        "server/test/acceptance/cleanPick3.test.js"
      ],
      "reads": ["git show f488733:docs/do-lines-review.md", "git show f488733:server/lib/doLines.json"],
      "expect": "9 headline cells moved; do cells and doLines.json unchanged"
    },
    {
      "id": "C8",
      "impl": ["server/kristy_perimeter_kb.json"],
      "tests": ["server/test/acceptance/cleanPick4.test.js"],
      "dependents": [],
      "reads": ["git show f488733:server/kristy_perimeter_kb.json"],
      "expect": "every base tip kept"
    },
    {
      "id": "C9",
      "impl": ["server/kristy_perimeter_kb.json"],
      "tests": ["server/test/acceptance/cleanPick4.test.js"],
      "dependents": ["server/lib/listMatch.js", "server/scripts/listMatchProbe.js"],
      "reads": [],
      "expect": "each cart_pick matches its own id"
    },
    {
      "id": "C10",
      "impl": ["server/kristy_perimeter_kb.json"],
      "tests": ["server/test/acceptance/cleanPick4.test.js"],
      "dependents": [],
      "reads": [],
      "expect": ">=25 new strings, none on more than 2 entries"
    },
    {
      "id": "C11",
      "impl": ["server/kristy_perimeter_kb.json"],
      "tests": ["server/test/acceptance/cleanPick4.test.js"],
      "dependents": [
        "server/routes/perimeter.js",
        "server/test/k18.test.js",
        "server/test/k23.test.js",
        "server/test/counterProbe48.test.js"
      ],
      "reads": [],
      "expect": "cereal unfortified with fortified second last in watch_out; six reach queries land on their cards"
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

- **Suite runtime:** `npm test` is the full server suite (2877 at f488733); run it once, at the end. Run `node --test server/test/acceptance/cleanPick4.test.js` on its own first.
- **Allowed reads:** the files in owns and read_full, plus `server/lib/counterCardLint.js`, `server/lib/counterCards.js`, `server/routes/perimeter.js`, `server/scripts/twoLineCheck.js`, and `git show f488733:<path>`.
- **Admin pre-dispatch probe:** run once from `server/`, either with the KB temporarily carrying the BECAME carts or after the build and before the critic. Pass each new cart and each C11 query as an argument:

  ```
  node -e "import('./lib/listMatch.js').then(async ({ matchItemToCard }) => { for (const q of process.argv.slice(1)) console.log(q, '->', (await matchItemToCard(q))?.slug); })" "<q1>" "<q2>" ...
  ```

  The expected slugs are the C9 and C11 tables above.
- **If something goes red on a BECAME string** (a lint: lintCard, lintSections, lintRepeatedClaim, readability; a live guard: ic4b–ic8b, ca-3b, ca-5, the k-series, counterProbe48; or C9/C11):
  - Stop and report RED with the lint output or the matched slug.
  - Name the nearest passing wording for that one string, keeping its role (headline, cart or standard line).
  - The acceptance test pins every string, so a rewording is a spec revision, not a builder call. Never loosen a lint.
  - Pre-chosen fallbacks:

    | string | fallback |
    | --- | --- |
    | crackers cart | "Stone-ground wheat crackers" (carries no "whole grain", so the label card does not score) |
    | sourdough cart | "Starter-fermented sourdough bread" (the f488733 cart; whole wheat stays in the headline and tip) |
    | bagels cart | "Whole wheat boiled bagels" |
    | pastries decision, if a G6/G7 gloss fires on "hydrogenated oil" | "All-butter bakery pastries, no shortening." |
- **If a test outside the routed list goes red on a batch id at an older ref:** route it through `preCleanPick4` the same way and list it in the report as an owns addition. A red on a live guard is a content defect, not a routing case.

## Tried and rejected

- **"Whole wheat pretzels" as the pretzels cart:** the plural misses `\bpretzel\b`, so the cart reads only {whole_wheat}, and "pretzel sticks" and "pretzel twists" veto the card.
- **"Whole wheat" on the crackers decision or cart:** it gives crackers a {whole_wheat} type, and "sourdough crackers" (k23) then vetoes the card.
- **"Whole grain olive oil crackers":** the label card (about 5) and the olive oil grades card (about 4, exact alias "olive oil") both outscore crackers (about 3), which leaves crackers one competitor away from falling out of the top 3.
- **"Starter-fermented whole wheat sourdough":** no contiguous "sourdough bread" alias, so the card scores about 3, against about 4 for the label card; too thin a margin.
- **Gluten-free or buns carts ending in "gums" or "sugar":** the last word fails `aliasNamesHead`, so both keep their f488733 carts.
- **"Pastry made with butter"** (the f488733 cart): routes to grassfed_butter.
- **"Unenriched" on any card:** unbacked (the same call as flour_basics and frozen_pizza).
- **"Not enriched flour" in the pretzels headline:** kept to tip1, where the list read sits; the headline carries one verdict.
- **Organic on any B5 front:** there is no grain organic gloss without a `server/lib` change.
- **"Soybean oil" in the buns headline:** G6/G7 gloss risk on a front; it sits in tip1 instead.
- **Muesli as the cereal pick:** it sends the shopper to a different card.
- **A rice_arsenic front change:** no material in the repo backs a cleaner rice front than its current origin-first one.
- **Editing passRule.js, or overlaying the live guards:** k14 C12 forbids the first; the second would hide content defects.

## Acceptance server/test/acceptance/cleanPick4.test.js

```js
// clean-pick-4 (Devon 2026-10-20): B5 bread and grains name each item’s own cleanest version.
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
const base = JSON.parse(git('f488733:server/kristy_perimeter_kb.json'));
const find = (k, id) => k.entries.find((e) => e.id === id);
const live = (id) => find(kb, id);
const was = (id) => find(base, id);
const words = (s) => s.trim().split(/\s+/).length;

const BECAME = {
  sourdough: { decision: 'Whole wheat sourdough: flour, water, salt and a starter.', cart_pick: 'Whole wheat sourdough bread', tip1: 'Look for whole wheat flour as the first ingredient, ahead of any white flour.', std: /whole wheat flour as the first ingredient/, carry: /whole wheat/i },
  bagels: { decision: 'Whole wheat bagels, boiled before the oven, ingredients named.', cart_pick: 'Whole wheat boiled bakery bagels', alias_add: 'whole wheat bagels', tip1: 'Look for whole wheat flour on the bag, named before any other flour.', std: /whole wheat flour on the bag/, carry: /whole wheat/i },
  breakfast_cereal: { decision: 'Unfortified whole-grain cereal or granola, less added sugar, no dyes.', cart_pick: 'Unfortified whole-grain breakfast cereal', tip1: 'Look for a grain list with no added vitamins or minerals below it.', watch_add: 'A fortified cereal comes second, behind one with no vitamins or minerals added.', std: /no added vitamins or minerals/, carry: /unfortified/i },
  gluten_free_bread: { decision: 'Gluten-free bread with its flours named and the fewest gums.', cart_pick: 'Short-list gluten-free bread', tip1: 'Look for a single gum binder, such as xanthan gum, not two or more.', std: /single gum/, carry: /fewest gums|single gum/i },
  buns_rolls: { decision: 'Whole wheat buns and rolls with no added sugar.', tip1: 'Look for a list with no sugar or soybean oil after the whole wheat flour.', std: /no sugar or soybean oil/, carry: /no added sugar/i },
  pastries_muffins: { decision: 'All-butter bakery pastries, no shortening or hydrogenated oil.', cart_pick: 'All-butter bakery pastries', tip1: 'Look for butter as the only fat, with no shortening or hydrogenated oil.', std: /only fat/, carry: /all-butter/i },
  crackers: { decision: 'Whole grain crackers with olive oil, coconut oil or butter.', cart_pick: 'Short-list whole grain crackers', tip1: 'Look for whole grain flour, olive oil and salt, and little else, on the list.', std: /whole grain flour, olive oil and salt/, carry: /whole grain/i },
  pretzels: { decision: 'Whole wheat pretzels with a short ingredient list.', cart_pick: 'Whole wheat pretzel twists', tip1: 'Look for whole wheat flour, not enriched flour, at the top of the list.', std: /not enriched flour/, carry: /whole wheat/i },
  fresh_pasta: { decision: 'Fresh pasta of flour and egg, with nothing added.', cart_pick: 'Additive-free fresh egg pasta', tip1: 'Look for flour and egg alone, with no ascorbic or citric acid added.', std: /flour and egg alone/, carry: /nothing added|additive-free/i },
};
const IDS = Object.keys(BECAME);
const DECISION_CHANGED = IDS.filter((id) => BECAME[id].decision);
const BANNED = /\b(health|healthy|healthier|safer|risk|cancer|disease|toxic|toxin|detox|pesticide-free|synthetic|price|cost|cheap|expensive)\b/i;
const TREATMENT = /\b(causes?|prevents?|lowers? (the )?risk|carcinogen|cancer|tumou?rs?|toxic|unsafe|harm\w*|risks?|linked to|hyperactiv|behaviou?r|attention|neurobehavioral|exacerbate)/i;
const REACH = [['pretzel sticks', 'pretzels'], ['pretzel twists', 'pretzels'], ['sourdough crackers', 'crackers'], ['sourdough bread', 'sourdough'], ['whole wheat bagels', 'bagels'], ['granola', 'breakfast_cereal']];
const idOf = (r) => r?.slug;

// Expected entry: the f488733 entry plus the BECAME fields, computed the way the Change section states.
function expected(id) {
  const w = structuredClone(was(id));
  const b = BECAME[id];
  const e = { ...w, buying_tips: [w.buying_tips[0], b.tip1, ...w.buying_tips.slice(1)] };
  for (const f of ['decision', 'cart_pick']) if (b[f]) e[f] = b[f];
  if (b.watch_add) e.watch_out = [...(w.watch_out ?? []), b.watch_add];
  if (b.alias_add) e.aliases = [...w.aliases, b.alias_add];
  return e;
}

// Every new string the batch writes into a field shoppers see.
const fresh = () => IDS.flatMap((id) => {
  const b = BECAME[id];
  return [b.decision, b.cart_pick, b.tip1, b.watch_add].filter(Boolean);
});

nonEmpty(IDS, 'IDS', 9);

test('C1 the 9 ids equal their expected entries and carry their phrase', () => {
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

test('C4 no new text carries a banned or treatment word, a dash, a straight apostrophe or first person', () => {
  const all = fresh();
  nonEmpty(all, 'written', 25);
  for (const s of all) {
    assert.doesNotMatch(s, BANNED, s);
    assert.doesNotMatch(s, TREATMENT, s);
    assert.doesNotMatch(s, /\b(I|me|my|mine|we|our|us)\b/, s);
    assert.ok(!s.includes('—') && !s.includes('–'), s);
    assert.ok(!s.includes("'"), s);
  }
});

test('C5 no bread or grain front names organic', () => {
  for (const id of IDS) {
    const l = live(id);
    assert.doesNotMatch(`${l.decision} ${l.cart_pick || ''}`, /\borganic\b/i, id);
  }
});

test('C6 entries outside the batch deepEqual f488733; count and top-level keys unchanged', () => {
  const others = kb.entries.filter((e) => !IDS.includes(e.id));
  nonEmpty(others, 'others', 195);
  assert.equal(kb.entries.length, base.entries.length);
  for (const e of others) assert.deepEqual(e, was(e.id), e.id);
  assert.deepEqual(Object.keys(kb).sort(), Object.keys(base).sort());
  for (const k of Object.keys(base)) if (k !== 'entries') assert.deepEqual(kb[k], base[k], k);
});

test('C7 doLines.json unchanged; review headlines move only on the batch ids', () => {
  const now = JSON.parse(readFileSync(new URL('../../lib/doLines.json', import.meta.url), 'utf8'));
  assert.deepEqual(now, JSON.parse(git('f488733:server/lib/doLines.json')));
  const rows = (txt) => new Map(txt.split('\n').filter((l) => l.startsWith('| `')).map((l) => [l.split('`')[1], l]).reverse()); // first row per id wins: the main table, not the historical notes
  const liveRows = rows(readFileSync(new URL('../../../docs/do-lines-review.md', import.meta.url), 'utf8'));
  const baseRows = rows(git('f488733:docs/do-lines-review.md'));
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

test('C8 every base tip is kept', () => {
  for (const id of IDS) {
    const l = live(id);
    nonEmpty(was(id).buying_tips, `${id} base tips`, 1);
    was(id).buying_tips.forEach((t, i) => assert.ok(l.buying_tips.includes(t), `${id} lost tip ${i}`));
  }
});

test('C9 each cart pick matches its own card', async () => {
  const carts = IDS.filter((id) => live(id).cart_pick);
  nonEmpty(carts, 'carts', 9);
  for (const id of carts) {
    const got = idOf(await matchItemToCard(live(id).cart_pick));
    assert.equal(got, id, `${live(id).cart_pick} -> ${got}`);
  }
});

test('C10 no new string sits on more than 2 entries', () => {
  const all = fresh();
  nonEmpty(all, 'fresh', 25);
  for (const s of all) {
    const n = kb.entries.filter((e) => [e.decision, e.cart_pick, e.tier_note, ...(e.buying_tips || []), ...(e.watch_out || [])].includes(s)).length;
    assert.ok(n <= 2, `${s} on ${n} entries`);
  }
});

test('C11 cereal: unfortified is the pick and fortified ranks second; reach queries still land', async () => {
  const l = live('breakfast_cereal');
  assert.match(l.decision, /unfortified/i, 'decision');
  assert.match(l.cart_pick, /unfortified/i, 'cart');
  const last = l.watch_out.at(-1);
  assert.match(last, /fortified/i, 'watch_out');
  assert.match(last, /second/i, 'watch_out rank');
  nonEmpty(REACH, 'reach', 6);
  for (const [q, id] of REACH) {
    const got = idOf(await matchItemToCard(q));
    assert.equal(got, id, `${q} -> ${got}`);
  }
});
```
