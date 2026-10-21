# clean-pick-8: B8, oats, beans, pasta and popcorn rank organic first; the four carried picks name their own cleanest version

```json
{
  "id": "clean-pick-8",
  "tier": "T2",
  "ui": false,
  "owns": [
    "server/kristy_perimeter_kb.json",
    "docs/do-lines-review.md",
    "server/lib/counterCardLint.js",
    "server/test/acceptance/twoLinePin.js",
    "server/test/acceptance/w2.test.js",
    "server/test/acceptance/w4.test.js",
    "server/test/acceptance/ca-4b.test.js",
    "server/test/acceptance/ca-7.test.js",
    "server/test/acceptance/ca-3a.test.js",
    "server/test/acceptance/ca-3b.test.js",
    "server/test/acceptance/concernEggs.test.js",
    "server/test/acceptance/ca-4a.test.js",
    "server/test/acceptance/cleanPick1.test.js",
    "server/test/acceptance/cleanPick2.test.js",
    "server/test/acceptance/cleanPick2b.test.js",
    "server/test/acceptance/cleanPick3.test.js",
    "server/test/acceptance/cleanPick4.test.js",
    "server/test/acceptance/cleanPick5.test.js",
    "server/test/acceptance/cleanPick6.test.js",
    "server/test/acceptance/cleanPick7.test.js"
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
    "server/test/acceptance/cleanPick7.test.js",
    "server/lib/testGuards.js",
    "server/lib/listMatch.js",
    "server/lib/counterCardLint.js"
  ],
  "verify": "cd /Users/m1/kristy && node --test server/test/acceptance/cleanPick8.test.js && cd server && node scripts/twoLineCheck.js && node scripts/commitGuard.js && node scripts/listMatchProbe.js && npm test"
}
```

Repo `/Users/m1/kristy`, branch `main`, base `c9f3b07`, the clean-pick-7 build commit. HEAD `6ff7930` is the allow-empty clean-pick-7 ship commit and touches no KB, review, doLines or test file. If that turns out to be wrong, the base moves to `6ff7930`.
- Baseline `npm test`: **2932 pass / 0 fail**, measured at the clean-pick-7 build. The planner ran nothing for this spec.
- Ship count: 2932 + 13 or more (cleanPick8.test.js holds 13 tests).
- Not migrated. The 4 cards publish only through a migration, which Devon decides at the plan's QA step. The 4 picks never migrate; a `main` push publishes them.

Env: node, npm, git. `server/.env` is not needed. No browser, no network, no writable dirs beyond the repo.

## Alignment

Devon's rulings behind this batch:
- 2026-10-20: "point them to the cleanest and healthiest version of the item they are getting."
- 2026-10-20: "everything should be organic, no additives, no synthetic bs, from nature, as close to the source as possible."
- 2026-10-20: "go make all decisions". This approves every call below, including the one-line lint change and the two narrow grass-pin lifts.

From `docs/CLEAN-PICK-PLAN.md`:
- B8 (L325–328), with the entry rule: "A card enters the spec only if scout question 7 quotes its own material ranking organic, or Devon names it."
- Common criteria C1–C10.
- OK rough edge: "a call that scout question 7 cannot back stays unchanged and goes to ship notes".

**Done means:** given the KB at `c9f3b07`, when this lands, then all of the following hold:
- oats_steelcut_rolled_instant, beans_dried_vs_canned, pasta_dry and popcorn name organic in their decision and cart. tips[1] is a new organic standard line, and every other base tip is kept, except the two lines listed as dropped (C1–C5, C8).
- pick_sausage and pick_egg_whites print organic together with the G4 gloss in their own decision. pick_soup_bones and pick_jerky name grass-fed, grass-finished beef. Each keeps its base mechanical read (C11).
- lintSections L4 accepts a pick's own decision as the place its gloss sits. Cards are unchanged by this, and the live corpus lint stays `[]` (C12).
- No other entry changes (C6). doLines.json is unchanged, and the review headline changes only on the 4 cards (C7).
- Each new cart routes to its own card (C9). Pick routing, bare and as "organic <alias>", equals the base (C13).
- `npm test` reports 2945 or more passing, with 0 failing.

**Out of scope:**
- grains_beyond_rice, coffee_beans, tea, cocoa, maple_syrup, raw_cider_vinegar, vinegar, potato_chips and dried_fruit. Their own material ranks no organic, so they stay unchanged under the plan's entry rule.
- Every field on the 8 ids except those named in Change.
- `server/lib/doLines.json`, `sectionRules.json`, routes and prompts.
- Every lint other than the one line at L4.
- Migration.

**OK rough edges:**
- G1 (`100% grass-fed or grass-finished`) needs the digits, and picks cannot carry digits. So the two beef pick lines print "grass-fed, grass-finished" with no gloss, as organ_meats and ground_beef already print "100% grass-fed" unglossed in the meat section.
- "turkey jerky" and "meat sticks" rows read the grass-fed beef jerky line. They read a beef line at base too.
- pick_sausage drops "named meat and spices" to make room for the gloss.
- pick_egg_whites drops "or otherwise treated" and "destroying Salmonella". "pasteurized per federal standard" stays.
- Headlines lead with the standard word. "Plain organic oats" keeps "Plain" first because the base front leads with it.

**Ship bar:** any of these blocks shipping:
- any of C1–C13 red;
- `npm test` below 2945 passing, or any failing test;
- twoLineCheck reports anything other than 0 of 181;
- listMatchProbe reports a wrong match;
- any edit to a Hard-limits file;
- a lint change beyond the one line plus its comment;
- a new line that names a health effect, a price or a brand.

## Change

### Cards (4)

Old values were read by the planner from twoLinePin `TWO_LINE` rows that are pinned to live. **If any old value differs by even one character from the `c9f3b07` KB, the KB wins**; report the line.

| id | old decision → new decision | old cart → new cart |
| --- | --- | --- |
| oats_steelcut_rolled_instant | Plain oats, steel-cut or rolled. → **Plain organic oats, steel-cut or rolled.** (6 words) | Steel-cut oats → **Organic steel-cut oats** |
| beans_dried_vs_canned | Dried beans, whole with unbroken skins. → **Organic dried beans, whole with unbroken skins.** (7) | Dried beans → **Organic dried beans** |
| pasta_dry | Dry pasta of durum semolina and water. → **Organic dry pasta of durum semolina and water.** (8) | Dry durum semolina pasta → **Organic dry durum semolina pasta** |
| popcorn | Plain popcorn kernels, popped at home in coconut oil. → **Organic plain popcorn kernels, popped at home in coconut oil.** (10, at the bar) | Plain popcorn kernels → **Organic plain popcorn kernels** |

buying_tips:
- **oats:** insert at index 1 "Look for the certified organic seal on a bag of plain oats." All 5 base tips are kept and shift by one; the glyphosate line moves to index 5.
- **beans:** insert at index 1 "Look for USDA Organic on the bag, with beans as the only ingredient." All 5 base tips are kept and shift by one.
- **pasta:** replace index 1. DROPPED: "Look for durum semolina and water in the list." NEW: "Look for organic durum semolina and water in the list." An insert would leave two lines that differ by one word.
- **popcorn:** replace index 1. DROPPED: "Look for a bag of kernels with popcorn as the only ingredient." NEW: "Look for organic kernels with popcorn as the only ingredient." This is the same reason as pasta.
- popcorn tips[4] (the bioengineered line), pick_steps and watch_out stay. The decision keeps "coconut", which concernSeedOilsB C3 reads live.

Nothing else on the 4 cards changes.

**docs/do-lines-review.md:** on the first table row of each of the 4 cards (near L59 oats, L62 beans, L127 pasta, L205 popcorn), replace cell 3 (the headline) with the new decision. Leave cell 4 (the do line) and every other line, including the oats historical row near L241, byte-identical.

### Picks (4): `decision` only

| id | old | new | ws words |
| --- | --- | --- | --- |
| pick_sausage | Sausage with named meat and spices; celery powder supplies nitrite. | **Organic sausage: certified organic feed and outdoor access; celery powder supplies nitrite.** | 12 |
| pick_egg_whites | Carton whites: pasteurized or otherwise treated per federal standard, destroying Salmonella. | **Organic carton whites, certified organic feed and outdoor access, pasteurized per federal standard.** | 13 |
| pick_soup_bones | Ask your meat counter for marrow or knuckle soup bones. | **Ask your meat counter for grass-fed, grass-finished marrow or knuckle soup bones.** | 12 |
| pick_jerky | Whole-muscle beef jerky with a short list; celery powder supplies nitrite. | **Whole-muscle grass-fed, grass-finished beef jerky with a short list; celery powder supplies nitrite.** | 13 |

"certified organic feed and outdoor access" is the G4 canonical gloss, verbatim (`CANONICAL_GLOSSES`, counterCardLint.js near L1666). The acceptance test reads the gloss from the code. **If the code's G4 gloss differs from this phrase, stop and report**: it is a spec revision.

### Lint: `server/lib/counterCardLint.js`, near L1842, inside `if (cardsOn)` L4

Old:
```js
        const glossTexts = ['tier_note', 'pick_steps', 'instead'].flatMap((f) => stringsIn(entry[f])).map(norm);
```
New: the same line with the leading spread added, and one comment line above it.
```js
        // A pick has only its decision (PICK_FORBIDDEN_FIELDS bars tier_note, pick_steps and instead), so its one sentence carries the gloss itself.
        const glossTexts = [...(entry.kind === 'pick' ? ['decision'] : []), 'tier_note', 'pick_steps', 'instead'].flatMap((f) => stringsIn(entry[f])).map(norm);
```
Nothing else in the file changes.

Why this ruling:
- L4 exists so that a claim-shaped standard word (organic, pasture-raised, grass-fed) never prints in an aligned section without the sentence that says what it audits. That rule is the claim lock.
- A pick cannot hold the three gloss fields, so before this change the only way to keep L4 green was to keep the word off picks.
- Letting the pick's own sentence hold the gloss keeps the rule whole for picks.
- Exempting picks would print unglossed claims, so it is rejected.
- Cards are untouched; C12 pins that a card's decision still does not count.

## Hard limits

- Never edit any of these:
  - `server/test/acceptance/passRule.js`, `k9.test.js`, `k14.test.js`, `k15.test.js`, `k16.test.js`, `k18.test.js`, `k21.test.js`, `k23.test.js`;
  - `server/lib/pickReach.test.js`, `server/lib/listMatch.test.js`, `server/lib/counterCardLint.test.js`;
  - `twoLinePin.test.js`, ic4b–ic8b, ca-1, ca-5, k3-0, k3-1, k5–k24, counterProbe48;
  - concernAdditives, concernSeedOilsB, concernGlyphosate, concernBioengineered, concernBpa, concernDeli, cardTidy, cardOrder, sugarsRank, ktight.
- Never edit the fixtures `w4.before.json` or `fixtures/kb-pre-readability.json`.
- concernBioengineered is deliberately not owned. popcorn is in twoLinePin `TIDIED`, and `preTidy` restores it whole from 8264bd0, so this change is invisible to that test.
- Do not edit `server/lib/doLines.json`, `sectionRules.json`, `counterCards.js`, `listMatch.js`, `perimeter.js`, any route or any prompt.
- In counterCardLint.js, change only the L4 line and its comment.
- Do not run the migration or `buildDoLines.js`.
- A red in a live guard that is not owned is a content defect: stop and report.

## Pins and older tests

No assertion is deleted. Each older test that freezes one of the 8 ids at an earlier ref reads it through one new overlay or skip.

### twoLinePin.js (a): repins

| row (near) | field | new value |
| --- | --- | --- |
| `oats_steelcut_rolled_instant` (L447) | `decision`, `buying_tips` | the Change values (6 tips) |
| `beans_dried_vs_canned` (L499) | `decision`, `buying_tips` | the Change values (6 tips) |
| `pasta_dry` (L1472) | `decision`, `buying_tips` | the Change values (5 tips, index 1 replaced) |
| `popcorn` (L2866) | `decision`, `buying_tips` | the Change values (5 tips, index 1 replaced) |
| `PICK_PINS.pick_sausage` (L3227) | `decision` | new sausage line |
| `PICK_PINS.pick_jerky` (L3252) | `decision` | new jerky line |

- `sources` stay.
- These rows carry no `cart_pick` key; do not add one.
- `beforeTwoLine` and `beforeConcern` restore from their own refs by key, so they do not move.

### twoLinePin.js (b): overlay

Append after the clean-pick-7 block (L3414–3417):
```js
// clean-pick-8 (2026-10-20) moved these 8 entries to each item's own cleanest version; older batch tests read them as of c9f3b07, and cleanPick8.test.js owns the new text.
export const CLEAN_PICK_8 = new Set(['oats_steelcut_rolled_instant', 'beans_dried_vs_canned', 'pasta_dry', 'popcorn', 'pick_sausage', 'pick_egg_whites', 'pick_soup_bones', 'pick_jerky']);
const PRE_CP8 = JSON.parse(execFileSync('git', ['show', 'c9f3b07:server/kristy_perimeter_kb.json'], { cwd: ROOT, maxBuffer: 64 << 20 }).toString());
export const preCleanPick8 = (e) => (e && CLEAN_PICK_8.has(e.id) ? PRE_CP8.entries.find((x) => x.id === e.id) : e);
```

### Routed chains

In each file, add `preCleanPick8` to the existing `./twoLinePin.js` import and wrap the innermost `e`:

| file | line (near) | old → new |
| --- | --- | --- |
| w2.test.js | L14 | `…preCleanPick7(e)…` → `…preCleanPick7(preCleanPick8(e))…` |
| w4.test.js | L12 | same |
| ca-4b.test.js | L20 | same |
| ca-7.test.js | L16 | same |
| ca-4a.test.js | L20 | `kb.entries = kb.entries.map((e) => preCleanPick(preCleanPick3(e)));` → `…preCleanPick(preCleanPick3(preCleanPick8(e))));` (import at L3) |

If a line reads differently, keep its chain, wrap the innermost `e`, and report the line.

### Live guards: narrow, reasoned edits

- **ca-3a.test.js**
  - L13: the import gains `preCleanPick8`.
  - L26: `const was = (id) => preCleanPick3(now(id));` → `const was = (id) => preCleanPick3(preCleanPick8(now(id)));`. This keeps C12 SPEC_1C and C5 on the base text.
  - L37–40: `APPROVED_GRASS_FRONTS` gains `'pick_soup_bones', // clean-pick-8, Devon 2026-10-20 "go make all decisions": soup bones are beef bones, a ruminant, where grass-fed is a real standard`.
  - Why the lift is narrow: the ban exists because a grass term means nothing on pork, poultry or cured lines. This pick's bones are beef: ca-3a C5 pins "Beef soup bones from the butcher counter", and the butcher card names "100% grass-fed soup bones".
- **ca-3b.test.js**
  - C2 loop (near L53): first line inside `for (const id of BATCH) {` is `if (id === 'pick_jerky') continue; // clean-pick-8: the line names beef, a ruminant; Devon 2026-10-20 "go make all decisions"`.
  - pick_sausage stays under C2 and carries no grass term.
  - C1 (14 words or fewer) still runs on jerky: 13 words.
- **concernEggs.test.js**
  - After the imports (near L8), add `import { preCleanPick8 } from './twoLinePin.js';`.
  - L63: `assert.deepEqual(card(id), pre.entries.find(...))` → `assert.deepEqual(preCleanPick8(card(id)), pre.entries.find(...))`.

### Later-batch skips and floors

Rule for every floor: expected measured is the old measured count minus the CP8 ids not already excluded. If the measured count differs, set the floor to measured − 5 and report it.

- **cleanPick1:** `LATER` Set (near L225–230): append `/* clean-pick-8 */` with the 8 ids. C6 floor (L307) 101 → 95.
- **cleanPick2:** the import gains `CLEAN_PICK_8`. `LATER` (L10) gains `...CLEAN_PICK_8`. C6 floor (L207) 117 → 111.
- **cleanPick2b:** the import gains `CLEAN_PICK_8`. The C3 skip (L57) gains `|| CLEAN_PICK_8.has(e.id)`.
- **cleanPick3:**
  - the import gains `CLEAN_PICK_8`;
  - the C6 `others` filter (L132) gains `&& !CLEAN_PICK_8.has(e.id)`, floor (L133) 134 → 128;
  - the C7 loop skip (L150) `if (CLEAN_PICK_4.has(id) || CLEAN_PICK_5.has(id)) continue;` gains `|| CLEAN_PICK_8.has(id)`.
- **cleanPick4:**
  - the import gains `CLEAN_PICK_8`;
  - C6 `others` (L105) gains the filter, floor (L106) 153 → 147;
  - the C7 loop skip (L123) `if (CLEAN_PICK_5.has(id)) continue;` gains `|| CLEAN_PICK_8.has(id)`.
- **cleanPick5:**
  - L9 import `{ CLEAN_PICK_6, CLEAN_PICK_7 }` → `{ CLEAN_PICK_6, CLEAN_PICK_7, CLEAN_PICK_8, preCleanPick8 }`;
  - L16 `const live = (id) => find(kb, id);` → `const live = (id) => preCleanPick8(find(kb, id));`. popcorn is a cp5 id, read by C1, C3, C5, C8 and C9;
  - C6 `others` (L129) gains `&& !CLEAN_PICK_8.has(e.id)`, floor (L130) 164 → 158;
  - the C7 loop gains a first line `if (CLEAN_PICK_8.has(id)) continue;`.
- **cleanPick6:**
  - the L10 import gains `CLEAN_PICK_8`;
  - C5 `otherPicks` (L90) gains `&& !CLEAN_PICK_8.has(e.id)`;
  - C6 `others` (L97) gains it, floor (L98) 180 → 173;
  - C7 L110 `assert.equal(review, git('c6d3ff2:docs/do-lines-review.md'));` → the masked compare below, with ref `c6d3ff2`.
- **cleanPick7** (no twoLinePin import yet):
  - add `import { CLEAN_PICK_8, preCleanPick8 } from './twoLinePin.js';`;
  - L17 `live` → `(id) => preCleanPick8(find(kb, id))`. jerky is a cp7 id; C1, C3 and C13 read it;
  - C5 `otherPicks` (L88) gains `&& !CLEAN_PICK_8.has(e.id)`;
  - C6 `others` (L95) gains it, floor (L96) 197 → 190;
  - C7 L108 → the masked compare, with `` `${BASE}` ``;
  - C11 loop (L143) gains a first line `if (CLEAN_PICK_8.has(id)) continue;`. attachCards reads the live jerky line.

Masked compare. It replaces the single byte-equal line, and lines that are not table rows of the 8 ids stay byte-checked:
```js
  const mask = (t) => t.split('\n').filter((l) => !(l.startsWith('| `') && CLEAN_PICK_8.has(l.split('`')[1]))).join('\n');
  assert.equal(mask(review), mask(git('c6d3ff2:docs/do-lines-review.md')));
```

### No change needed (planner read)

- `counterCardLint.test.js` L758 (corpus `lintSections` is `[]`): sausage and egg_whites carry G4 with its gloss, which the L4 change accepts. The grass lines resolve no term, because G1 needs "100%". `lintRepeatedClaim` scans no `decision`, so pick_soup_bones in the `beef_raising` family is untouched. L5 reads `cart_pick`, which picks lack.
- concernDeli C5 (/celery/ on jerky and sausage) holds.
- concernGlyphosate is text-wide, with no index checks, so its line at index 5 on oats and beans holds.
- concernSeedOilsB C3 reads the popcorn decision, which keeps coconut.
- k14 C7 and k15 C7 (lintPick on egg_whites, jerky and soup_bones) are re-asserted by C11.
- k15, k23, counterProbe48, k14, k18, k21 and listMatch.test pin routing on unchanged aliases.

## Criteria

- C1 [test] Given `c9f3b07`, when the KB is read, then each of the 4 cards deepEquals its base entry with `decision`, `cart_pick` and `buying_tips` replaced exactly as Change states.
- C2 [test] Given the 4 cards, then each decision is 10 whitespace words or fewer and each cart is 46 characters or fewer; twoLineCheck reports 0 of 181 (verify).
- C3 [test] Given the 4 cards, then tips[0] equals base tips[0], does not start with an imperative verb and differs from the decision; tips[1] equals the new standard line and matches its standard pattern.
- C4 [test] Given every new string (4 decisions, 4 carts, 4 tips, 4 pick decisions), then none matches BANNED or TREATMENT, and none has first person, "—", "–" or a straight apostrophe. The pick decisions also have no digit or `?`.
- C5 [test] Given the 8 ids, then:
  - no base decision or base cart among them names organic;
  - the 4 card decisions and carts, pick_sausage and pick_egg_whites now name organic;
  - pick_soup_bones and pick_jerky do not;
  - the organic count on picks outside the 4 equals base.
- C6 [test] Given the entries outside the 8 (198 or more [PLACEHOLDER: measured − 5]), then each deepEquals `c9f3b07`, and the entry count and the top-level keys are unchanged.
- C7 [test] Given doLines.json and docs/do-lines-review.md, then:
  - doLines deepEquals base;
  - the review file equals base apart from the first row of each of the 4 cards;
  - those 4 rows carry the new decision in cell 3 and the base cell 4;
  - no pick has a review row.
- C8 [test] Given the 4 cards, then every base tip except the two dropped lines (pasta, popcorn) is kept, and the dropped lines are absent.
- C9 [test] Given the 4 new carts, then `matchItemToCard(cart)?.slug` equals the card's id.
- C10 [test] Given every new string, then none sits on more than 2 entries [PLACEHOLDER threshold 2].
- C11 [test] Given the 4 picks, then each of the following holds:
  - each deepEquals base with only `decision` replaced;
  - base and live decisions both match every keep phrase;
  - `lintPick` and `lintCard` return [];
  - the decision is 14 whitespace words or fewer and 16 lint words or fewer;
  - a grass term sits on exactly pick_soup_bones and pick_jerky;
  - pick_sausage and pick_egg_whites contain the G4 gloss verbatim;
  - jerky and sausage keep /celery/;
  - the grass-term count on other picks equals base.
- C12 [test] Given `lintSections` over the live sectionRules, then:
  - the live corpus returns [];
  - pick_sausage with an organic decision that lacks the gloss returns TERM_UNGLOSSED for pick_sausage;
  - the live pick_sausage with `kind` removed (a card with the gloss only in its decision) returns TERM_UNGLOSSED for pick_sausage.
- C13 [test] Given every pick alias in the `c9f3b07` corpus, bare and as "organic <alias>" (140 or more), then `matchItemToPick(q, kb.entries)?.id` equals `matchItemToPick(q, base.entries)?.id`. A list row of each of the 4 picks' first alias, through `attachCards`, carries that `pickId` and the new decision as `pickLine`, and no `cardSlug`.

## Ship notes

- **Nothing was executed while writing this spec.** The planner hit its time budget before reading `lintSections`' entry-to-section assignment (counterCardLint.js L1676–1790). C12 case two proves at run time that L4 sees picks. If that case is green against the unchanged lint because no TERM_UNGLOSSED appears for a pick, then L4 never sees picks: the lint line is unnecessary, and this is a spec revision.
- **9 B8 cards not entered** (grains_beyond_rice, coffee_beans, tea, cocoa, maple_syrup, raw_cider_vinegar, vinegar, potato_chips, dried_fruit): their own material ranks no organic. Devon can name any of them for a later batch.
- **Nothing held among the carried items.** Popcorn now ranks organic. Organic is not the same as non-GMO, and the bioengineered tip stays as the label fact.
- **Organic over pasture-raised** on sausage and egg_whites: the G3 gloss and pasture-raised together do not fit 14 words.
- **Glosses are verbatim code strings.** If counterCardLint's L2 front 4-gram check counts "certified organic feed and outdoor access" across the two picks plus the cards that print it, a trip reads as `FRONT_SHARED` (or similar). The planner read that gloss spans are cut before L2; this was not run.
- Commit message ends "Not migrated."

## Contract

```json
{
  "criteria": [
    { "id": "C1", "impl": ["server/kristy_perimeter_kb.json", "server/test/acceptance/twoLinePin.js", "server/test/acceptance/w2.test.js", "server/test/acceptance/w4.test.js", "server/test/acceptance/ca-4b.test.js", "server/test/acceptance/ca-7.test.js"], "tests": ["server/test/acceptance/cleanPick8.test.js"], "dependents": ["server/test/twoLinePin.test.js", "server/test/acceptance/w2.test.js", "server/test/acceptance/w4.test.js", "server/test/acceptance/ca-4b.test.js", "server/test/acceptance/ca-7.test.js", "server/test/acceptance/cleanPick5.test.js"], "reads": ["git show c9f3b07:server/kristy_perimeter_kb.json"], "expect": "4 cards equal base with decision, cart and tips replaced as Change states" },
    { "id": "C2", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/cleanPick8.test.js"], "dependents": ["server/scripts/twoLineCheck.js"], "reads": [], "expect": "decisions at most 10 words, carts at most 46 chars" },
    { "id": "C3", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/cleanPick8.test.js"], "dependents": [], "reads": ["git show c9f3b07:server/kristy_perimeter_kb.json"], "expect": "tips[0] base and not imperative; tips[1] the new standard line" },
    { "id": "C4", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/cleanPick8.test.js"], "dependents": [], "reads": [], "expect": "16 new strings clean of banned, treatment, first person, dash, straight apostrophe" },
    { "id": "C5", "impl": ["server/kristy_perimeter_kb.json", "server/test/acceptance/cleanPick6.test.js", "server/test/acceptance/cleanPick7.test.js"], "tests": ["server/test/acceptance/cleanPick8.test.js"], "dependents": ["server/test/acceptance/cleanPick6.test.js", "server/test/acceptance/cleanPick7.test.js"], "reads": ["git show c9f3b07:server/kristy_perimeter_kb.json"], "expect": "organic on the 4 cards and on sausage and egg whites only; other picks unchanged" },
    { "id": "C6", "impl": ["server/kristy_perimeter_kb.json", "server/test/acceptance/cleanPick1.test.js", "server/test/acceptance/cleanPick2.test.js", "server/test/acceptance/cleanPick2b.test.js", "server/test/acceptance/cleanPick3.test.js", "server/test/acceptance/cleanPick4.test.js", "server/test/acceptance/cleanPick5.test.js", "server/test/acceptance/cleanPick6.test.js", "server/test/acceptance/cleanPick7.test.js"], "tests": ["server/test/acceptance/cleanPick8.test.js"], "dependents": ["server/test/acceptance/cleanPick1.test.js", "server/test/acceptance/cleanPick2.test.js", "server/test/acceptance/cleanPick2b.test.js", "server/test/acceptance/cleanPick3.test.js", "server/test/acceptance/cleanPick4.test.js", "server/test/acceptance/cleanPick5.test.js", "server/test/acceptance/cleanPick6.test.js", "server/test/acceptance/cleanPick7.test.js"], "reads": ["git show c9f3b07:server/kristy_perimeter_kb.json"], "expect": ">=198 outside entries deepEqual base; count and keys unchanged" },
    { "id": "C7", "impl": ["docs/do-lines-review.md", "server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/cleanPick8.test.js"], "dependents": ["server/scripts/buildDoLines.js", "server/test/acceptance/cleanPick3.test.js", "server/test/acceptance/cleanPick4.test.js", "server/test/acceptance/cleanPick5.test.js", "server/test/acceptance/cleanPick6.test.js", "server/test/acceptance/cleanPick7.test.js"], "reads": ["git show c9f3b07:docs/do-lines-review.md", "git show c9f3b07:server/lib/doLines.json"], "expect": "doLines unchanged; review moves only cell 3 of 4 card rows" },
    { "id": "C8", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/cleanPick8.test.js"], "dependents": [], "reads": ["git show c9f3b07:server/kristy_perimeter_kb.json"], "expect": "base tips kept except the 2 dropped lines" },
    { "id": "C9", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/cleanPick8.test.js"], "dependents": ["server/lib/listMatch.js", "server/scripts/listMatchProbe.js", "server/test/acceptance/k23.test.js", "server/test/counterProbe48.test.js"], "reads": [], "expect": "4 carts route to their own card" },
    { "id": "C10", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/cleanPick8.test.js"], "dependents": [], "reads": [], "expect": "no new string on more than 2 entries" },
    { "id": "C11", "impl": ["server/kristy_perimeter_kb.json", "server/test/acceptance/twoLinePin.js", "server/test/acceptance/ca-3a.test.js", "server/test/acceptance/ca-3b.test.js", "server/test/acceptance/concernEggs.test.js", "server/test/acceptance/ca-4a.test.js"], "tests": ["server/test/acceptance/cleanPick8.test.js"], "dependents": ["server/test/acceptance/ca-3a.test.js", "server/test/acceptance/ca-3b.test.js", "server/test/acceptance/concernEggs.test.js", "server/test/acceptance/ca-4a.test.js", "server/test/acceptance/concernDeli.test.js", "server/test/acceptance/k14.test.js", "server/test/acceptance/k15.test.js", "server/lib/pickReach.test.js"], "reads": ["git show c9f3b07:server/kristy_perimeter_kb.json", "server/lib/counterCardLint.js"], "expect": "4 picks equal base but decision; keep phrases, lint clean, grass on 2, G4 gloss on 2" },
    { "id": "C12", "impl": ["server/lib/counterCardLint.js"], "tests": ["server/test/acceptance/cleanPick8.test.js"], "dependents": ["server/lib/counterCardLint.test.js", "server/test/acceptance/ca-3a.test.js", "server/test/acceptance/ca-3b.test.js"], "reads": ["server/lib/sectionRules.json"], "expect": "corpus lint []; unglossed pick and decision-only card both TERM_UNGLOSSED" },
    { "id": "C13", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/cleanPick8.test.js"], "dependents": ["server/lib/listMatch.js", "server/lib/pickReach.test.js", "server/test/acceptance/k15.test.js"], "reads": ["git show c9f3b07:server/kristy_perimeter_kb.json"], "expect": ">=140 pick queries route as at base; 4 rows carry the new pickLine" }
  ],
  "env": { "executables": ["node", "npm", "git"], "browsers": [], "temp": "none", "network": false }
}
```

## Answers

- **Suite runtime:** run `node --test server/test/acceptance/cleanPick8.test.js` alone first, then the full `npm test` once at the end. The full suite is the 2932-test server suite.
- **Allowed reads:**
  - the files in owns and read_full, and `git show c9f3b07:<path>`;
  - to read a red, never to edit: `sectionRules.json`, `perimeter.js`, `pickReach.test.js`, `counterCardLint.test.js`, `twoLineCheck.js`, and the Hard-limits tests.
- **Admin pre-dispatch checks** (from `server/`, at HEAD, before `dv check`):
  1. `grep -n "lintSections(" lib/counterCardLint.test.js`. If L758 passes something other than the parsed `sectionRules.json` (for example `.sections`), make the same change to `RULES` in the acceptance block.
  2. `grep -n "id: 'G4'" -A 3 lib/counterCardLint.js` must show gloss `certified organic feed and outdoor access`.
  3. Run this probe:

     ```
     node -e "import('./lib/listMatch.js').then(({ matchItemToPick, matchItemToCard }) => { for (const q of process.argv.slice(1)) for (const r of [q, 'organic ' + q]) console.log(r, '-> pick', matchItemToPick(r)?.id, '| card', matchItemToCard(r)?.slug); })" sausage sausages "italian sausage" "pork sausage" "breakfast sausage" "chicken sausage" bratwurst "egg whites" "egg white" "carton egg whites" "liquid egg whites" jerky "beef jerky" "turkey jerky" "meat stick" "meat sticks" "soup bone" "soup bones" "marrow bones" "beef bones" "knuckle bones" oats oatmeal "steel-cut oats" "rolled oats" "dried beans" "dry beans" beans "black beans" pasta "dry pasta" popcorn "popcorn kernels" "Organic steel-cut oats" "Organic dried beans" "Organic dry durum semolina pasta" "Organic plain popcorn kernels"
     ```

     Expected:
     - pick aliases (bare and organic) → their own pick;
     - the card terms → oats_steelcut_rolled_instant, beans_dried_vs_canned, pasta_dry and popcorn;
     - the last 4 (the new carts) → their own card. "Organic dry durum semolina pasta" must not land on fresh_pasta.
- **Fallbacks for lines at a limit.** On a red, stop and report: the planner swaps one of these into the acceptance block on a revision, and the builder never rewords.

  | id | trigger | fallback |
  | --- | --- | --- |
  | popcorn decision | over 10 words or LINE2 | Organic popcorn kernels, popped at home in coconut oil. |
  | pasta_dry cart | routes to fresh_pasta | Dry organic durum semolina pasta |
  | beans tip1 | any lint | Look for the certified organic seal on a bag of dried beans. |
  | pick_jerky | ca-3b C1 or a lint | Whole-muscle grass-fed beef jerky with a short list; celery powder supplies nitrite. |
  | pick_soup_bones | a lint | Ask your meat counter for grass-fed marrow or knuckle soup bones. |
  | pick_sausage | a lint reads the colon | Organic sausage means certified organic feed and outdoor access; celery powder supplies nitrite. |
  | pick_egg_whites | a lint or MECHANICAL_VETO word | Organic carton whites, certified organic feed and outdoor access, pasteurized against Salmonella. (keep becomes /pasteurized/ only) |
- **If a test outside the routed list goes red on one of the 8 ids at an older ref:** route it through `preCleanPick8` the same way, and report it as an owns addition. A red on an unowned live guard is a content defect.

## Tried and rejected

- **Exempting picks from L4:** it would print organic or pasture-raised in meat and eggs with nothing saying what the seal audits, which is the claim the lock exists to stop.
- **"Pastured", "hens on pasture" or bare "certified organic" without the gloss:** these game the term list while printing the same claim unglossed.
- **"100% grass-fed" on the beef picks:** lintPick vetoes digits.
- **Lifting the grass bans for pork or poultry picks (sausage):** a grass term is meaningless on a monogastric, so that reason still holds.
- **Pasture-raised on sausage or egg whites:** the G3 gloss and the base mechanical read do not fit 14 words.
- **Organic on the 9 unentered B8 cards:** their own material ranks no organic. The plan's entry rule keeps them unchanged.
- **Inserting rather than replacing tips[1] on pasta and popcorn:** it leaves two lines a word apart.
- **Owning concernBioengineered:** `preTidy` freezes popcorn there, so there is nothing to route.
- **Editing cardTidy, cardOrder, doLines.json or sectionRules.json:** none reads the new text live, and each is a hard limit.
- **Overlaying ca-3a, ca-3b or concernEggs wholesale:** that would hide content defects. Only the two reasoned grass lifts and the base-text reads move.

## Acceptance server/test/acceptance/cleanPick8.test.js

```js
// clean-pick-8 (Devon 2026-10-20, "organic, no additives, no synthetic, as close to the source as possible"): B8, oats, beans, pasta and popcorn rank organic first; sausage and egg whites print organic with its gloss; soup bones and jerky name grass-fed beef.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { nonEmpty } from '../../lib/testGuards.js';
import { CANONICAL_GLOSSES, lintCard, lintPick, lintSections, words as lintWords } from '../../lib/counterCardLint.js';
import { attachCards, matchItemToCard, matchItemToPick } from '../../lib/listMatch.js';

const BASE = 'c9f3b07';
const ROOT = fileURLToPath(new URL('../../../', import.meta.url));
const git = (ref) => execFileSync('git', ['show', ref], { cwd: ROOT, maxBuffer: 64 << 20 }).toString();
const kb = JSON.parse(readFileSync(new URL('../../kristy_perimeter_kb.json', import.meta.url), 'utf8'));
const base = JSON.parse(git(`${BASE}:server/kristy_perimeter_kb.json`));
const RULES = JSON.parse(readFileSync(new URL('../../lib/sectionRules.json', import.meta.url), 'utf8'));
const find = (k, id) => k.entries.find((e) => e.id === id);
const live = (id) => find(kb, id);
const was = (id) => find(base, id);
const ws = (s) => String(s || '').trim().split(/\s+/).filter(Boolean).length;
const G4 = CANONICAL_GLOSSES.find((g) => g.id === 'G4').gloss;

const CARDS = {
  oats_steelcut_rolled_instant: { decision: 'Plain organic oats, steel-cut or rolled.', cart_pick: 'Organic steel-cut oats', tip1: 'Look for the certified organic seal on a bag of plain oats.', std: /certified organic seal/ },
  beans_dried_vs_canned: { decision: 'Organic dried beans, whole with unbroken skins.', cart_pick: 'Organic dried beans', tip1: 'Look for USDA Organic on the bag, with beans as the only ingredient.', std: /USDA Organic on the bag/ },
  pasta_dry: { decision: 'Organic dry pasta of durum semolina and water.', cart_pick: 'Organic dry durum semolina pasta', tip1: 'Look for organic durum semolina and water in the list.', std: /organic durum semolina and water/, dropped: 'Look for durum semolina and water in the list.' },
  popcorn: { decision: 'Organic plain popcorn kernels, popped at home in coconut oil.', cart_pick: 'Organic plain popcorn kernels', tip1: 'Look for organic kernels with popcorn as the only ingredient.', std: /organic kernels with popcorn/, dropped: 'Look for a bag of kernels with popcorn as the only ingredient.' },
};
const PICKS = {
  pick_sausage: { decision: 'Organic sausage: certified organic feed and outdoor access; celery powder supplies nitrite.', keep: [/celery powder supplies nitrite/], organic: true },
  pick_egg_whites: { decision: 'Organic carton whites, certified organic feed and outdoor access, pasteurized per federal standard.', keep: [/pasteurized/, /per federal standard/], organic: true },
  pick_soup_bones: { decision: 'Ask your meat counter for grass-fed, grass-finished marrow or knuckle soup bones.', keep: [/^Ask your meat counter for/, /marrow or knuckle soup bones/], grass: true },
  pick_jerky: { decision: 'Whole-muscle grass-fed, grass-finished beef jerky with a short list; celery powder supplies nitrite.', keep: [/^Whole-muscle/, /beef jerky with a short list; celery powder supplies nitrite/], grass: true },
};
const CARD_IDS = Object.keys(CARDS);
const PICK_IDS = Object.keys(PICKS);
const IDS = [...CARD_IDS, ...PICK_IDS];
const BANNED = /\b(health|healthy|healthier|safer|risk|cancer|disease|toxic|toxin|detox|pesticide-free|synthetic|price|cost|cheap|expensive)\b/i;
const TREATMENT = /\b(causes?|prevents?|lowers? (the )?risk|carcinogen|cancer|tumou?rs?|toxic|unsafe|harm\w*|risks?|linked to|hyperactiv|behaviou?r|attention|neurobehavioral|exacerbate)/i;
const ORGANIC = /\borganic\b/i;
const GRASS = /grass[- ]?(fed|finished)/i;
const isPick = (e) => e && e.kind === 'pick';

function expectedCard(id) {
  const w = structuredClone(was(id));
  const b = CARDS[id];
  return { ...w, decision: b.decision, cart_pick: b.cart_pick, buying_tips: [w.buying_tips[0], b.tip1, ...w.buying_tips.slice(b.dropped ? 2 : 1)] };
}
const fresh = () => [...CARD_IDS.flatMap((id) => [CARDS[id].decision, CARDS[id].cart_pick, CARDS[id].tip1]), ...PICK_IDS.map((id) => PICKS[id].decision)];

nonEmpty(IDS, 'IDS', 8);

test('C1 the 4 cards equal their expected entries with organic in the decision', () => {
  for (const id of CARD_IDS) {
    assert.ok(live(id) && was(id), `${id} missing`);
    assert.deepEqual(live(id), expectedCard(id), id);
    assert.match(live(id).decision, ORGANIC, `${id} carry`);
  }
});

test('C2 card decisions are at most 10 words and carts at most 46 characters', () => {
  for (const id of CARD_IDS) {
    assert.ok(ws(live(id).decision) <= 10, `${id} decision ${ws(live(id).decision)} words`);
    assert.ok(live(id).cart_pick.length <= 46, `${id} cart ${live(id).cart_pick.length} chars`);
  }
});

test('C3 tips[0] stays the base why; tips[1] is the new organic standard line', () => {
  for (const id of CARD_IDS) {
    const t = live(id).buying_tips;
    assert.equal(t[0], was(id).buying_tips[0], `${id} tip 0`);
    assert.doesNotMatch(t[0], /^(choose|pick|buy|read|check|look|skip|compare)\b/i, `${id} tip 0 imperative`);
    assert.notEqual(t[0], live(id).decision, id);
    assert.equal(t[1], CARDS[id].tip1, `${id} tip 1`);
    assert.match(t[1], CARDS[id].std, `${id} tip 1 standard`);
  }
});

test('C4 no new string carries a banned or treatment word, first person, a dash or a straight apostrophe', () => {
  const all = fresh();
  nonEmpty(all, 'written', 16);
  for (const s of all) {
    assert.doesNotMatch(s, BANNED, s);
    assert.doesNotMatch(s, TREATMENT, s);
    assert.doesNotMatch(s, /\b(I|me|my|mine|we|our|ours|us)\b/, s);
    assert.ok(!s.includes('—') && !s.includes('–'), s);
    assert.ok(!s.includes("'"), s);
  }
  for (const id of PICK_IDS) assert.doesNotMatch(PICKS[id].decision, /[0-9?]/, id);
});

test('C5 organic lands on the 4 cards, sausage and egg whites, and nowhere else new', () => {
  for (const id of CARD_IDS) {
    assert.doesNotMatch(`${was(id).decision} ${was(id).cart_pick}`, ORGANIC, `${id} base front`);
    assert.match(live(id).decision, ORGANIC, `${id} decision`);
    assert.match(live(id).cart_pick, ORGANIC, `${id} cart`);
  }
  for (const id of PICK_IDS) {
    assert.doesNotMatch(was(id).decision, ORGANIC, `${id} base already organic`);
    assert.equal(ORGANIC.test(live(id).decision), Boolean(PICKS[id].organic), id);
  }
  const otherPicks = (k) => k.entries.filter((e) => isPick(e) && !PICK_IDS.includes(e.id));
  nonEmpty(otherPicks(base), 'other picks', 20);
  const count = (k) => otherPicks(k).filter((e) => ORGANIC.test(e.decision || '')).length;
  assert.equal(count(kb), count(base));
});

test('C6 entries outside the batch deepEqual the base; count and top-level keys unchanged', () => {
  const others = kb.entries.filter((e) => !IDS.includes(e.id));
  nonEmpty(others, 'others', 198);
  assert.equal(kb.entries.length, base.entries.length);
  for (const e of others) assert.deepEqual(e, was(e.id), e.id);
  assert.deepEqual(Object.keys(kb).sort(), Object.keys(base).sort());
  for (const k of Object.keys(base)) if (k !== 'entries') assert.deepEqual(kb[k], base[k], k);
});

test('C7 doLines.json unchanged; the review moves only the headline cell of the 4 card rows', () => {
  const now = JSON.parse(readFileSync(new URL('../../lib/doLines.json', import.meta.url), 'utf8'));
  assert.deepEqual(now, JSON.parse(git(`${BASE}:server/lib/doLines.json`)));
  const liveTxt = readFileSync(new URL('../../../docs/do-lines-review.md', import.meta.url), 'utf8');
  const baseTxt = git(`${BASE}:docs/do-lines-review.md`);
  nonEmpty(liveTxt.split('\n'), 'review lines', 150);
  const isRow = (l) => l.startsWith('| `');
  const rowId = (l) => l.split('`')[1];
  const firstRows = (t) => { const m = new Map(); for (const l of t.split('\n')) if (isRow(l) && !m.has(rowId(l))) m.set(rowId(l), l); return m; };
  const mask = (t) => { const done = new Set(); return t.split('\n').map((l) => { if (!isRow(l) || !CARD_IDS.includes(rowId(l)) || done.has(rowId(l))) return l; done.add(rowId(l)); return `ROW ${rowId(l)}`; }).join('\n'); };
  assert.equal(mask(liveTxt), mask(baseTxt));
  const lr = firstRows(liveTxt);
  const br = firstRows(baseTxt);
  let seen = 0;
  for (const id of CARD_IDS) {
    assert.ok(lr.get(id) && br.get(id), `${id} row`);
    const lc = lr.get(id).split('|').map((c) => c.trim());
    const bc = br.get(id).split('|').map((c) => c.trim());
    assert.equal(lc[3], CARDS[id].decision, id);
    assert.equal(lc[4], bc[4], `${id} do cell`);
    seen += 1;
  }
  assert.equal(seen, 4);
  for (const id of PICK_IDS) assert.equal(lr.has(id), false, `${id} has a review row`);
});

test('C8 every base tip is kept except the two dropped lines', () => {
  for (const id of CARD_IDS) {
    const l = live(id);
    const drop = CARDS[id].dropped;
    nonEmpty(was(id).buying_tips, `${id} base tips`, 5);
    if (drop) {
      assert.equal(was(id).buying_tips[1], drop, `${id} dropped line is base tip 1`);
      assert.ok(!l.buying_tips.includes(drop), `${id} dropped line still present`);
    }
    was(id).buying_tips.forEach((t, i) => { if (t !== drop) assert.ok(l.buying_tips.includes(t), `${id} lost tip ${i}`); });
    (was(id).watch_out ?? []).forEach((t, i) => assert.ok((l.watch_out ?? []).includes(t), `${id} lost watch_out ${i}`));
  }
});

test('C9 each new cart matches its own card', () => {
  for (const id of nonEmpty(CARD_IDS, 'carts', 4)) {
    const got = matchItemToCard(live(id).cart_pick)?.slug;
    assert.equal(got, id, `${live(id).cart_pick} -> ${got}`);
  }
});

test('C10 no new string sits on more than 2 entries', () => {
  const all = fresh();
  assert.equal(new Set(all).size, all.length);
  for (const s of all) {
    const n = kb.entries.filter((e) => [e.decision, e.cart_pick, e.tier_note, ...(e.buying_tips || []), ...(e.watch_out || [])].includes(s)).length;
    assert.ok(n <= 2, `${s} on ${n} entries`);
  }
});

test('C11 the 4 picks change only their decision, keep their read, pass the pick lints, and carry their own standard', () => {
  for (const id of PICK_IDS) {
    const l = live(id);
    assert.ok(l && was(id), `${id} missing`);
    assert.deepEqual(l, { ...structuredClone(was(id)), decision: PICKS[id].decision }, id);
    for (const re of nonEmpty(PICKS[id].keep, `${id} keep`, 1)) {
      assert.match(was(id).decision, re, `${id} keep ${re} not in base`);
      assert.match(l.decision, re, `${id} keep ${re} lost`);
    }
    assert.deepEqual(lintPick(l), [], `${id} lintPick`);
    assert.deepEqual(lintCard(l), [], `${id} lintCard`);
    assert.ok(ws(l.decision) <= 14, `${id} ${ws(l.decision)} words`);
    assert.ok(lintWords(l.decision) <= 16, `${id} ${lintWords(l.decision)} lint words`);
    assert.equal(GRASS.test(l.decision), Boolean(PICKS[id].grass), `${id} grass term`);
    if (PICKS[id].organic) assert.ok(l.decision.includes(G4), `${id} lacks the G4 gloss`);
  }
  for (const id of ['pick_sausage', 'pick_jerky']) assert.match(live(id).decision, /celery/i, `${id} celery`);
  const otherPicks = (k) => k.entries.filter((e) => isPick(e) && !PICK_IDS.includes(e.id));
  const grass = (k) => otherPicks(k).filter((e) => GRASS.test(e.decision || '')).length;
  assert.equal(grass(kb), grass(base));
});

test('C12 L4 reads a pick decision for its gloss and still reads no card decision', () => {
  assert.deepEqual(lintSections(RULES, kb.entries), []);
  const swap = (entry) => kb.entries.map((e) => (e.id === entry.id ? entry : e));
  const unglossed = (entries, id) => lintSections(RULES, entries).filter((o) => o.code === 'TERM_UNGLOSSED' && o.id === id);
  const bare = { ...structuredClone(live('pick_sausage')), decision: 'Organic sausage with a short list; celery powder supplies nitrite.' };
  assert.ok(unglossed(swap(bare), 'pick_sausage').length >= 1, 'a pick printing organic without its gloss passed L4');
  const { kind, ...asCard } = structuredClone(live('pick_sausage'));
  assert.equal(kind, 'pick');
  assert.ok(unglossed(swap(asCard), 'pick_sausage').length >= 1, 'a card with its gloss only in the decision passed L4');
});

test('C13 every pick alias, bare and organic, routes as at the base; the 4 rows carry the new line', () => {
  const queries = base.entries.filter(isPick).flatMap((e) => (e.aliases || []).flatMap((a) => [a, `organic ${a}`]));
  nonEmpty(queries, 'queries', 140);
  for (const q of queries) {
    const now = matchItemToPick(q, kb.entries)?.id;
    const then = matchItemToPick(q, base.entries)?.id;
    assert.equal(now, then, `${q}: ${then} -> ${now}`);
  }
  for (const id of PICK_IDS) {
    const name = live(id).aliases[0];
    const row = attachCards({ items: [{ name, source: 'user' }] }, { log: false }).items[0];
    assert.equal(row.pickId, id, `${name} pickId ${row.pickId}`);
    assert.equal(row.pickLine, PICKS[id].decision, `${name} pickLine`);
    assert.equal(row.cardSlug, undefined, `${name} cardSlug ${row.cardSlug}`);
  }
});
```
