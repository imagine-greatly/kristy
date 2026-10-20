# clean-pick-1 — batch B1: sixteen staples name their own cleanest version on the front

```json
{
  "id": "clean-pick-1",
  "tier": "T2",
  "ui": false,
  "owns": [
    "server/kristy_perimeter_kb.json",
    "docs/do-lines-review.md",
    "server/lib/doLines.json",
    "server/test/acceptance/twoLinePin.js",
    "server/test/acceptance/cardOrder.test.js",
    "server/test/acceptance/cardTidy.test.js",
    "server/test/acceptance/sugarsRank.test.js",
    "server/test/acceptance/ca-4a.test.js",
    "server/test/acceptance/ca-4b.test.js",
    "server/test/acceptance/ca-7.test.js",
    "server/test/acceptance/w2.test.js",
    "server/test/acceptance/w4.test.js",
    "server/test/acceptance/ic4achicken.test.js"
  ],
  "read_full": [
    "docs/CLEAN-PICK-PLAN.md",
    "server/test/acceptance/twoLinePin.js",
    "server/test/acceptance/sugarsRank.test.js",
    "server/test/acceptance/cardOrder.test.js",
    "server/test/acceptance/cardTidy.test.js",
    "server/test/acceptance/ca-4b.test.js",
    "server/test/acceptance/ic4achicken.test.js",
    "server/scripts/twoLineCheck.js",
    "server/scripts/buildDoLines.js",
    "server/lib/counterCardLint.js",
    "server/lib/listMatch.js",
    "VOICE_SPEC.md",
    "server/lib/testGuards.js"
  ],
  "verify": "cd /Users/m1/kristy && node --test server/test/acceptance/cleanPick1.test.js && cd server && node scripts/buildDoLines.js && node scripts/twoLineCheck.js && node scripts/commitGuard.js && node scripts/listMatchProbe.js && npm test"
}
```

Repo `/Users/m1/kristy`, branch `main`, baseline `ede90e7` (sugars-rank). HEAD `dfbef8a` and `3ca18db` are plan-only commits (docs/CLEAN-PICK-PLAN.md); the KB, doLines.json and do-lines-review.md are identical to `ede90e7`. Batch B1 of the plan (lines 224-258), no ruling needed. Not migrated. Env: node, git; server/.env not needed.

B1 is **16 ids**, not the plan's 18: `flour_basics` ("unenriched") and `broth` ("yeast extract") were reverted to unchanged because scout q7 could not back the new call on the card's own material. They go to ship notes; "not enriched" is an offerable option for flour.

## Alignment

Devon (2026-10-20), verbatim: "everything should be organic, no additives, no synthetic bs, from nature, as close to the source as possible" and "we dont want to just tack on a 'get organic' to every single item but rather, point them to the cleanest and healthiest version of the item they are getting that means wild caught salmon, 100% grass fed beef, things like that".

- Done means: each B1 card's decision or cart_pick names that item's own cleanest version; organic only where it is the item's defining standard (produce, corn/soy/sugar crops, poultry as "pasture-raised or organic"); `cleanPick1.test.js` 10/10; `npm test` at least start + 10.
- Out of scope: ids outside the batch, aliases, depth rewrites (why, short_answer, kristy_take, look_for, pick_steps, sources), do lines, migration.
- OK rough edges: headlines lead with their standard word; a call scout q7 cannot back stays unchanged and goes to ship notes.
- Ship bar: C1–C10 red; `npm test` below start (2831) + new (10) = 2841; a verdict subject changed without a ruling (the critic compares the old→new table below).

## Change

Fields change only as listed. For each card: `decision` and `cart_pick` as below; where a tip is listed, it is **inserted as `buying_tips[1]`** and every old tip shifts down one place (none deleted). For the five poultry cards (`rotisserie_chicken`, `chicken_breast`, `chicken_cuts_basics`, `ground_turkey`, `turkey_whole`) `tier_note` is replaced by the gloss line (lint L4 TERM_UNGLOSSED: a meat front naming pasture-raised needs the G3 gloss "time outdoors on pasture, audited only with a certifier’s seal", organic needs the G4 gloss "certified organic feed and outdoor access"; pick_steps are capped at 3), and the **old tier_note is appended to the end of `detail`** as `${detail} ${old tier_note}`. `tortillas` changes decision and cart_pick only (its existing tips[1] already names certified organic). `grassfed_butter` keeps its decision.

In `docs/do-lines-review.md` the headline cell of each batch row (lines 41, 53, 55, 76, 87, 120, 123, 124, 125, 133, 141, 157, 158, 179, 191, 194) becomes the new decision; the do cell and flag stay. `node server/scripts/buildDoLines.js` then leaves `server/lib/doLines.json` byte-identical (do lines unchanged).

### Old → new (for the critic: every verdict subject holds)

| id | field | old | new |
| --- | --- | --- | --- |
| `sugars` | decision | Coconut or maple sugar first, each made from one sap. | Organic coconut or maple sugar first, each from one sap. |
| `sugars` | cart_pick | Coconut sugar or pure maple sugar | Organic coconut sugar or pure maple sugar |
| `sugars` | buying_tips[1] (inserted; old tips shift down) | — | Look for certified organic coconut sugar or pure maple sugar. |
| `rotisserie_chicken` | decision | Rotisserie chicken with salt and spices, without phosphate or starch. | Pasture-raised or organic rotisserie chicken, salt and spices only. |
| `rotisserie_chicken` | cart_pick | Plain rotisserie chicken | Organic or pasture-raised rotisserie chicken |
| `rotisserie_chicken` | tier_note | Two federal label rules settle it; the ingredient list just needs reading. | Organic rotisserie chicken: certified organic feed and outdoor access; pasture: time outdoors on pasture, audited only with a certifier’s seal. |
| `rotisserie_chicken` | buying_tips[1] (inserted; old tips shift down) | — | Look for a pasture-raised or certified organic bird on the sticker. |
| `rotisserie_chicken` | detail | (unchanged text) | + old tier_note appended |
| `chicken_breast` | decision | Plain bone-in, skin-on breast before boneless skinless; no added solution. | Pasture-raised or organic bone-in, skin-on breast; no solution added. |
| `chicken_breast` | cart_pick | Plain chicken breast without added solution | Pasture-raised or organic chicken breast |
| `chicken_breast` | tier_note | Any added flavoring solution has to appear in the product name, with its amount. | Organic chicken breast: certified organic feed and outdoor access; pasture: time outdoors on pasture, audited only with a certifier’s seal. |
| `chicken_breast` | buying_tips[1] (inserted; old tips shift down) | — | Look for pasture-raised or certified organic breast, sold plain. |
| `chicken_breast` | detail | (unchanged text) | + old tier_note appended |
| `chicken_cuts_basics` | decision | Air-chilled whole chicken first, then bone-in, skin-on thighs. | Air-chilled pasture-raised whole chicken, then bone-in, skin-on thighs. |
| `chicken_cuts_basics` | cart_pick | Air-chilled whole chicken or bone-in thighs | Pasture-raised whole chicken or bone-in thighs |
| `chicken_cuts_basics` | tier_note | A whole bird yields both meats and a stock frame; water-chilled packs can hold retained water. | Pasture on a chicken label: time outdoors on pasture, audited only with a certifier’s seal. |
| `chicken_cuts_basics` | buying_tips[1] (inserted; old tips shift down) | — | Look for air-chilled printed on the whole bird or the thigh pack. |
| `chicken_cuts_basics` | detail | (unchanged text) | + old tier_note appended |
| `ground_turkey` | decision | Plain ground turkey with its fat content printed. | Pasture-raised or organic ground turkey, fat content printed. |
| `ground_turkey` | cart_pick | Plain ground turkey | Pasture-raised or organic plain ground turkey |
| `ground_turkey` | tier_note | Ground turkey alone names no fat level, and a percent-lean claim must carry its percent fat. | Organic ground turkey: certified organic feed and outdoor access; pasture: time outdoors on pasture, audited only with a certifier’s seal. |
| `ground_turkey` | buying_tips[1] (inserted; old tips shift down) | — | Look for pasture-raised or certified organic ground turkey, sold plain. |
| `ground_turkey` | detail | (unchanged text) | + old tier_note appended |
| `turkey_whole` | decision | Plain whole turkey, without an injected basting solution. | Pasture-raised whole turkey, without an injected basting solution. |
| `turkey_whole` | cart_pick | Whole turkey without added solution | Pasture-raised whole turkey |
| `turkey_whole` | tier_note | A basted or self-basted bird was injected or marinated with a solution the label must name. | Pasture-raised turkey: time outdoors on pasture, audited only with a certifier’s seal. |
| `turkey_whole` | buying_tips[1] (inserted; old tips shift down) | — | Look for a pasture-raised whole turkey, sold unbasted. |
| `turkey_whole` | detail | (unchanged text) | + old tier_note appended |
| `grassfed_butter` | cart_pick | Deep yellow butter | Grass-fed butter |
| `grassfed_butter` | buying_tips[1] (inserted; old tips shift down) | — | Look for grass-fed on the wrapper; cream and salt are the whole list. |
| `cheese_real_vs_processed` | decision | Block cheese with a short list: milk, cultures, salt, enzymes. | Grass-fed block cheese: milk, cultures, salt, enzymes, nothing else. |
| `cheese_real_vs_processed` | cart_pick | Block cheese | Grass-fed block cheese |
| `cheese_real_vs_processed` | buying_tips[1] (inserted; old tips shift down) | — | Look for grass-fed milk named on the block. |
| `cream_vs_creamer` | decision | Half-and-half or heavy cream, with a short ingredient list. | Grass-fed heavy cream or half-and-half: cream and milk only. |
| `cream_vs_creamer` | cart_pick | Half-and-half | Grass-fed half-and-half |
| `cream_vs_creamer` | buying_tips[1] (inserted; old tips shift down) | — | Look for a carton naming grass-fed cows, with cream and milk only. |
| `sour_cream` | decision | Sour cream soured by bacteria, with nothing else added. | Grass-fed sour cream: cream and cultures, nothing else added. |
| `sour_cream` | cart_pick | Cream and cultures only sour cream | Grass-fed sour cream |
| `sour_cream` | buying_tips[1] (inserted; old tips shift down) | — | Look for a grass-fed tub listing only cream and cultures. |
| `cream_cheese` | decision | Cream cheese by its standard name, at least 33% milkfat. | Grass-fed cream cheese by its standard name, no stabilizers. |
| `cream_cheese` | cart_pick | Stabilizer-free cream cheese | Grass-fed stabilizer-free cream cheese |
| `cream_cheese` | buying_tips[1] (inserted; old tips shift down) | — | Look for grass-fed cream cheese that lists no stabilizers. |
| `sandwich_bread` | decision | Whole wheat sandwich bread, made with whole wheat flour. | Whole wheat sandwich bread: flour, water, yeast, salt, little else. |
| `sandwich_bread` | cart_pick | Whole wheat sandwich bread | Short-list whole wheat sandwich bread |
| `sandwich_bread` | buying_tips[1] (inserted; old tips shift down) | — | Look for a short list: whole wheat flour, water, yeast and salt. |
| `tortillas` | decision | Corn tortillas of masa, water and salt. | Organic corn tortillas of masa, water and salt. |
| `tortillas` | cart_pick | Corn tortillas | Organic corn tortillas |
| `mayo` | decision | Mayonnaise with olive oil, egg yolk and an acid. | Mayonnaise with olive oil alone, egg yolk and an acid. |
| `mayo` | cart_pick | Olive oil mayonnaise | Olive oil only mayonnaise |
| `mayo` | buying_tips[1] (inserted; old tips shift down) | — | Look for olive oil as the only oil in the ingredient list. |
| `pasta_sauce` | decision | Pasta sauce with tomatoes first and a short list. | Pasta sauce of tomatoes and olive oil, no added sweetener. |
| `pasta_sauce` | cart_pick | Pasta sauce listing tomatoes first | Tomato and olive oil pasta sauce |
| `pasta_sauce` | buying_tips[1] (inserted; old tips shift down) | — | Look for tomatoes first, olive oil as the oil, and no added sweetener. |
| `white_fish` | decision | White fish sold by its named species, firm and mild-smelling. | Wild-caught white fish by its named species, firm, mild-smelling. |
| `white_fish` | cart_pick | A named white fish fillet, firm and on ice | Wild-caught white fish fillet |
| `white_fish` | buying_tips[1] (inserted; old tips shift down) | — | Look for how it was caught and the species, on the sign or label. |

Subject notes: `chicken_breast` gains "Pasture-raised or organic" and drops "before boneless skinless" (10-word cap); bone-in, skin-on stays the verdict. `chicken_cuts_basics` cart_pick loses "Air-chilled" to the 46-character cart cap (perimeter.test.js:207); the decision keeps it; "whole" stays because "whole chicken" rows must land here. `pasta_sauce` says "no added sweetener" (21 CFR 155.190 wording, docs/sources/k22/pasta_sauce-1.md:108), not "no added sugar". tips[1] on `chicken_cuts_basics` and `white_fish` cannot name pasture-raised or wild-caught: those facts are owned by `label_pasture_raised_feed` and `salmon_wild_vs_farmed` (lintRepeatedClaim), so they name air-chilled and the catch method.

### Final values (literal; the acceptance test pins them)

```js
const BECAME = {
  sugars: {
    decision: "Organic coconut or maple sugar first, each from one sap.",
    cart_pick: "Organic coconut sugar or pure maple sugar",
    buying_tips: [
      "Each stays closer to its plant than sugar crystallized from cane or beet juice.",
      "Look for certified organic coconut sugar or pure maple sugar.",
      "Read the list: coconut sugar or maple sugar alone, with nothing added.",
      "Look for pure maple sugar; a maple-flavored product is not maple sugar.",
      "Plain “sugar” names no crop, so choose certified organic first; organic must come from non-GMO plants. Non-GMO Project Verified is a close second.",
      "Pick light or dark brown sugar; dark carries more molasses.",
    ],
  },
  rotisserie_chicken: {
    decision: "Pasture-raised or organic rotisserie chicken, salt and spices only.",
    cart_pick: "Organic or pasture-raised rotisserie chicken",
    buying_tips: [
      "A solution bird was injected with water and seasoning before it went on the spit.",
      "Look for a pasture-raised or certified organic bird on the sticker.",
      "Read the sticker, not the name. ‘Seasoned’, ‘original’ and ‘traditional’ are marketing; the ingredient list is regulated.",
      "The shortest list wins: chicken, salt, spices. Water as the second ingredient means a solution was added.",
      "Sodium phosphate, a starch or a sweetener after the water means a solution bird. The shorter the seasoning line, the plainer the chicken.",
      "A bird held under the lamp is held hot for a reason. Take one that is steaming, not one that has sat.",
      "Check the sticker for oil in the seasoning; choose olive oil or a bird with no added oil.",
      "Seed oils to skip: sunflower, safflower, canola, soybean, corn, and cottonseed.",
      "Skip a bird seasoned with avocado oil too.",
    ],
    tier_note: "Organic rotisserie chicken: certified organic feed and outdoor access; pasture: time outdoors on pasture, audited only with a certifier’s seal.",
  },
  chicken_breast: {
    decision: "Pasture-raised or organic bone-in, skin-on breast; no solution added.",
    cart_pick: "Pasture-raised or organic chicken breast",
    buying_tips: [
      "Boneless skinless breast dries fast in the pan; bone and skin cook better.",
      "Look for pasture-raised or certified organic breast, sold plain.",
      "Read the full product name for the solution percentage and ingredients.",
      "Fresh or frozen breast can be checked for the same solution disclosure.",
      "Read retained-water wording separately from the added flavoring ingredients.",
    ],
    tier_note: "Organic chicken breast: certified organic feed and outdoor access; pasture: time outdoors on pasture, audited only with a certifier’s seal.",
  },
  chicken_cuts_basics: {
    decision: "Air-chilled pasture-raised whole chicken, then bone-in, skin-on thighs.",
    cart_pick: "Pasture-raised whole chicken or bone-in thighs",
    buying_tips: [
      "Water-chilled birds hold water from the chilling tank; skin that starts dry crisps.",
      "Look for air-chilled printed on the whole bird or the thigh pack.",
      "Whole bird: lowest cost per pound, and the carcass makes stock.",
      "Thighs, bone-in and skin-on: forgiving, low-cost, hard to overcook.",
      "Breast: fast and lean. Pull it the moment it is done.",
      "Boneless skinless costs the most for the same bird.",
      "‘Air-chilled’ is printed on the package when it applies.",
      "Skin that starts dry is the skin that crisps.",
      "‘USDA Process Verified’ or a third-party seal backs a ‘raised without antibiotics’ claim.",
      "All chicken is required to be residue-free at sale, labeled or not.",
      "‘Raised without antibiotics’ is a management and resistance choice, not a cleaner-meat guarantee.",
    ],
    tier_note: "Pasture on a chicken label: time outdoors on pasture, audited only with a certifier’s seal.",
  },
  ground_turkey: {
    decision: "Pasture-raised or organic ground turkey, fat content printed.",
    cart_pick: "Pasture-raised or organic plain ground turkey",
    buying_tips: [
      "The name ground turkey sets no one fat level, so two packs can differ.",
      "Look for pasture-raised or certified organic ground turkey, sold plain.",
      "Choose a formulation listing turkey without added seasonings or a flavoring solution.",
      "Without a percent-lean claim, use the Nutrition Facts fat line to compare packs.",
      "Compare the fat content of the actual packs rather than assume one level for all ground turkey.",
    ],
    tier_note: "Organic ground turkey: certified organic feed and outdoor access; pasture: time outdoors on pasture, audited only with a certifier’s seal.",
  },
  turkey_whole: {
    decision: "Pasture-raised whole turkey, without an injected basting solution.",
    cart_pick: "Pasture-raised whole turkey",
    buying_tips: [
      "A basted or self-basted bird carries added broth, stock, fat or water.",
      "Look for a pasture-raised whole turkey, sold unbasted.",
      "Read the solution ingredients beside the product name.",
      "A frozen whole turkey can be checked for the same added-solution statement.",
      "Read retained-water wording separately from the flavoring-solution statement.",
    ],
    tier_note: "Pasture-raised turkey: time outdoors on pasture, audited only with a certifier’s seal.",
  },
  grassfed_butter: {
    cart_pick: "Grass-fed butter",
    buying_tips: [
      "Deep yellow toward orange is carotene from grass. Pale is a hay-fed winter churn.",
      "Look for grass-fed on the wrapper; cream and salt are the whole list.",
      "European-style butters are higher in fat, a separate axis from what the cows ate.",
      "Salted or unsalted is a cooking choice. Unsalted gives control.",
    ],
  },
  cheese_real_vs_processed: {
    decision: "Grass-fed block cheese: milk, cultures, salt, enzymes, nothing else.",
    cart_pick: "Grass-fed block cheese",
    buying_tips: [
      "Bagged shreds are coated in starch to keep them apart, which is why they melt poorly.",
      "Look for grass-fed milk named on the block.",
      "Look for a short list: milk, salt, cultures, enzymes/rennet.",
      "Blocks are cheaper per pound than pre-sliced or shredded, and they melt smoothly.",
      "‘Parmesan’ is a generic word in the US. ‘Parmigiano-Reggiano’ is a protected one with a stamped rind.",
      "Keep hard-cheese rinds. They belong in a pot of beans or soup.",
      "The milk for cheese may come from cows given the synthetic growth hormone rBST. Certified organic rules exclude its use.",
      "Certified organic block cheese is the first choice. Next, find a wrapper stating the cheese uses milk from cows given no rBST. Cheese with neither claim is last. US labeling does not require a statement about rBST use.",
    ],
  },
  cream_vs_creamer: {
    decision: "Grass-fed heavy cream or half-and-half: cream and milk only.",
    cart_pick: "Grass-fed half-and-half",
    buying_tips: [
      "Cream carries a legal milkfat minimum; creamer is oil and sweetener imitating it.",
      "Look for a carton naming grass-fed cows, with cream and milk only.",
      "Heavy cream is 36% milkfat or more. Half-and-half is 10.5 to 18%. Those numbers are fixed by law.",
      "‘Non-dairy creamer’ is oil, sweetener and emulsifiers. It is not cream.",
      "Even real cream can carry carrageenan or gellan gum. A short list is still worth checking.",
      "Flavored creamers are where the added sugar sits. Read the panel.",
      "Whole milk or half-and-half does the same job with a two-word ingredient list.",
      "rBST is a synthetic hormone given to cows for milk production. The certified organic rules bar this growth hormone.",
      "Start with certified organic cream or half-and-half. Follow with a carton stating the cows were not treated with rBST, then one with neither. US companies need not label rBST use.",
      "Even certified organic cream can list carrageenan, a thickener derived from seaweed. Read the ingredients and take cream with none listed.",
    ],
  },
  sour_cream: {
    decision: "Grass-fed sour cream: cream and cultures, nothing else added.",
    cart_pick: "Grass-fed sour cream",
    buying_tips: [
      "Cultured means bacteria did the souring; acidified tubs use added acids.",
      "Look for a grass-fed tub listing only cream and cultures.",
      "Pick a tub named “sour cream” or “cultured sour cream”.",
      "Read the optional ingredients added for texture or shelf life.",
      "Check the name for a declared flavor.",
      "A synthetic growth hormone called rBST can be given to dairy cows. Certified organic sour cream excludes that treatment.",
      "On sour cream, prefer certified organic. Next, look for a printed statement that rBST was not used on the dairy cows. Without either claim, the tub ranks last. Use of rBST need not appear on US dairy labels.",
      "Carrageenan is made from seaweed and used to thicken foods, including some certified organic ones. Read your sour cream’s list and pick a tub without carrageenan.",
    ],
  },
  cream_cheese: {
    decision: "Grass-fed cream cheese by its standard name, no stabilizers.",
    cart_pick: "Grass-fed stabilizer-free cream cheese",
    buying_tips: [
      "The standard allows up to 0.5 percent stabilizers; the list shows who skipped them.",
      "Look for grass-fed cream cheese that lists no stabilizers.",
      "Look for “cream cheese” as the name on the package.",
      "Find a culture in the ingredient list.",
      "Swap in Neufchâtel in most recipes; the two taste similar.",
      "rBST is the synthetic growth hormone used to increase milk production in cows. Certified organic cream cheese rules prohibit it.",
      "Choose certified organic cream cheese first. Next is a pack stating the milk comes from cows untreated with rBST. Both outrank a pack with neither. US labels can omit whether the cows received rBST.",
      "Some certified organic foods contain carrageenan, a seaweed-derived thickener. Look through the cream cheese ingredients and take the version that lists no carrageenan.",
    ],
  },
  sandwich_bread: {
    decision: "Whole wheat sandwich bread: flour, water, yeast, salt, little else.",
    cart_pick: "Short-list whole wheat sandwich bread",
    buying_tips: [
      "A loaf called just “wheat” may be refined; whole wheat keeps the bran and germ.",
      "Look for a short list: whole wheat flour, water, yeast and salt.",
      "Check for whole wheat flour in the ingredients.",
      "Without a stamp, use the flour names to check the loaf.",
      "Check which stamp is shown: 100%, 50%+, or Basic have different grain requirements.",
      "Choose certified organic whole wheat bread over conventional. Conventional wheat may be sprayed with glyphosate shortly before harvest to dry the crop. Organic farming does not allow glyphosate. Drift can still leave residues on organic wheat.",
    ],
  },
  tortillas: {
    decision: "Organic corn tortillas of masa, water and salt.",
    cart_pick: "Organic corn tortillas",
  },
  mayo: {
    decision: "Mayonnaise with olive oil alone, egg yolk and an acid.",
    cart_pick: "Olive oil only mayonnaise",
    buying_tips: [
      "A jar sold on avocado or olive oil can carry other oils; the list shows which leads.",
      "Look for olive oil as the only oil in the ingredient list.",
      "Check that the name on the jar is Mayonnaise.",
      "Choose olive oil mayonnaise with egg yolk and vinegar or citrus juice. Check every oil in the ingredient list.",
      "Compare jars by what they add beyond oil, egg yolk, acid and salt.",
      "Once opened, keep it in the fridge and use it within 1 to 2 months.",
      "Seed oils to skip: sunflower, safflower, canola, soybean, corn, and cottonseed.",
      "Skip avocado oil mayo too, even if it names no other oil.",
    ],
  },
  pasta_sauce: {
    decision: "Pasta sauce of tomatoes and olive oil, no added sweetener.",
    cart_pick: "Tomato and olive oil pasta sauce",
    buying_tips: [
      "Ingredients run most first, so anything ahead of the tomatoes outweighs them.",
      "Look for tomatoes first, olive oil as the oil, and no added sweetener.",
      "Read the first ingredient; tomatoes should lead.",
      "Count what follows the tomatoes; a short list is the craft standard.",
      "On canned tomatoes, read the “with” words for added spices, seasonings or vegetables.",
    ],
  },
  white_fish: {
    decision: "Wild-caught white fish by its named species, firm, mild-smelling.",
    cart_pick: "Wild-caught white fish fillet",
    buying_tips: [
      "A fillet is hard to identify by eye, so the species name does that work.",
      "Look for how it was caught and the species, on the sign or label.",
      "Ask which species the fillet is.",
      "Press the flesh and check that it springs back.",
      "Skip fillets with dried, dark or discolored edges.",
    ],
  },
};
```

## Hard limits

- Edit only the 16 ids, and only the fields above. No alias, asked_as, why, short_answer, kristy_take, pick_steps, look_for, watch_out or sources change. Picks untouched.
- Claim lock: no first person, no em or en dash, curly apostrophe (’) only; no health, safety, risk, synthetic, pesticide or price word in any new string; no brand.
- Never delete a base buying_tips line; the old poultry tier_note survives in detail.
- Do not edit `twoLinePin.test.js`, `fixtures/*`, `*.before.json`, server/lib or prompts. Do not run the migration. Do not commit (the admin does).
- `cart_pick` at most 46 characters; `decision` at most 10 words; tier_note one sentence, 5-20 words.

## Pins and older tests (from the DRY RUN: baseline `npm test` 2831 pass / 0 fail at ede90e7-equivalent dfbef8a)

Going red after the KB edit, and the minimal fix for each (all done and green in the dry run):

- `server/test/acceptance/twoLinePin.js`: re-pin the `TWO_LINE` rows of the 16 ids to the new values for every pinned field. Then append:

```js
// clean-pick-1 (2026-10-20) moved these cards' fronts (and five poultry tier notes) on; older
// batch tests read them as of ede90e7, and cleanPick1.test.js owns the new text.
export const CLEAN_PICK_1 = new Set(['sugars', 'rotisserie_chicken', 'chicken_breast', 'chicken_cuts_basics', 'ground_turkey', 'turkey_whole', 'grassfed_butter', 'cheese_real_vs_processed', 'cream_vs_creamer', 'sour_cream', 'cream_cheese', 'sandwich_bread', 'tortillas', 'mayo', 'pasta_sauce', 'white_fish']);
const PRE_CP1 = JSON.parse(execFileSync('git', ['show', 'ede90e7:server/kristy_perimeter_kb.json'], { cwd: ROOT, maxBuffer: 64 << 20 }).toString());
export const preCleanPick = (e) => (e && CLEAN_PICK_1.has(e.id) ? PRE_CP1.entries.find((x) => x.id === e.id) : e);
```

  `twoLinePin.test.js` then passes unedited.
- `ca-4a`, `ca-4b`, `ca-7`, `w2`, `w4` (history pins on these cards' fronts): read the batch cards through `preCleanPick`. `ca-4b` keeps a `LIVE` clone for its C6, which compares the review headline to the live decision. `ic4achicken` reads `chicken_cuts_basics` at ede90e7. `cardTidy`, `cardOrder` and `sugarsRank` load the KB at ede90e7 (sugarsRank's C6 also reads doLines and the review from ede90e7). Exact diff:

```diff
diff --git a/server/test/acceptance/ca-4a.test.js b/server/test/acceptance/ca-4a.test.js
index 539a2d7..6511158 100644
--- a/server/test/acceptance/ca-4a.test.js
+++ b/server/test/acceptance/ca-4a.test.js
@@ -2,3 +2,3 @@
 import { beforeCa7 } from './ca7Superseded.js';
-import { beforeTwoLine } from './twoLinePin.js';
+import { beforeTwoLine, preCleanPick } from './twoLinePin.js';
 import { test } from 'node:test';
@@ -19,2 +19,3 @@ const BASE_REF = 'd707172';
 const kb = JSON.parse(readFileSync(join(SERVER, 'kristy_perimeter_kb.json'), 'utf8'));
+kb.entries = kb.entries.map(preCleanPick);
 const base = JSON.parse(execFileSync('git', ['show', `${BASE_REF}:server/kristy_perimeter_kb.json`], { cwd: ROOT, maxBuffer: 64 << 20 }).toString());
diff --git a/server/test/acceptance/ca-4b.test.js b/server/test/acceptance/ca-4b.test.js
index 5c384b6..b8f19c5 100644
--- a/server/test/acceptance/ca-4b.test.js
+++ b/server/test/acceptance/ca-4b.test.js
@@ -2,3 +2,3 @@
 import { beforeCa7 } from './ca7Superseded.js';
-import { beforeTwoLine, beforeConcern, preTidy } from './twoLinePin.js';
+import { beforeTwoLine, beforeConcern, preTidy, preCleanPick } from './twoLinePin.js';
 import { test } from 'node:test';
@@ -18,3 +18,4 @@ const ROOT = join(SERVER, '..');
 const kb = JSON.parse(readFileSync(join(SERVER, 'kristy_perimeter_kb.json'), 'utf8'));
-kb.entries = kb.entries.map(preTidy);
+const LIVE = structuredClone(kb); // the review table follows the live front
+kb.entries = kb.entries.map((e) => preTidy(preCleanPick(e)));
 const base = JSON.parse(execFileSync('git', ['show', 'a392e36:server/kristy_perimeter_kb.json'], { cwd: ROOT, maxBuffer: 64 << 20 }).toString());
@@ -219,3 +220,3 @@ test('C6 review table and doLines.json follow the new fronts', () => {
     // The table follows the live front, which the two-line rewrite may have moved past this batch's text.
-    if (now(id).decision !== was(id).decision) assert.equal(reviewHeadline(id), kb.entries.find((e) => e.id === id).decision, id);
+    if (now(id).decision !== was(id).decision) assert.equal(reviewHeadline(id), LIVE.entries.find((e) => e.id === id).decision, id);
     if (DO[id]) assert.equal(reviewed.get(id)?.do, DO[id], `${id}: exact do line`);
diff --git a/server/test/acceptance/ca-7.test.js b/server/test/acceptance/ca-7.test.js
index e7bed49..5b540c3 100644
--- a/server/test/acceptance/ca-7.test.js
+++ b/server/test/acceptance/ca-7.test.js
@@ -10,3 +10,3 @@ import { projectEntry } from '../../lib/counterCards.js';
 import { nonEmpty } from '../../lib/testGuards.js';
-import { beforeTwoLine, beforeConcern, preTidy } from './twoLinePin.js';
+import { beforeTwoLine, beforeConcern, preTidy, preCleanPick } from './twoLinePin.js';
 
@@ -15,3 +15,3 @@ const ROOT = join(SERVER, '..');
 const kb = JSON.parse(readFileSync(join(SERVER, 'kristy_perimeter_kb.json'), 'utf8'));
-kb.entries = kb.entries.map(preTidy);
+kb.entries = kb.entries.map((e) => preTidy(preCleanPick(e)));
 const base = JSON.parse(execFileSync('git', ['show', '9854ae1:server/kristy_perimeter_kb.json'], { cwd: ROOT, maxBuffer: 64 << 20 }).toString());
diff --git a/server/test/acceptance/cardOrder.test.js b/server/test/acceptance/cardOrder.test.js
index 9be605c..7824bde 100644
--- a/server/test/acceptance/cardOrder.test.js
+++ b/server/test/acceptance/cardOrder.test.js
@@ -10,3 +10,4 @@ const ROOT = new URL('../../../', import.meta.url).pathname;
 const git = (ref) => JSON.parse(execFileSync('git', ['show', `${ref}:server/kristy_perimeter_kb.json`], { cwd: ROOT, maxBuffer: 64 << 20 }).toString());
-const kb = JSON.parse(readFileSync(new URL('../../kristy_perimeter_kb.json', import.meta.url), 'utf8'));
+// clean-pick-1 (2026-10-20) moved batch cards on; this test now pins the ede90e7 result.
+const kb = git('ede90e7');
 const base = git('81b63d5'); // the tidied cards as shipped
diff --git a/server/test/acceptance/cardTidy.test.js b/server/test/acceptance/cardTidy.test.js
index b4fda05..9a110e7 100644
--- a/server/test/acceptance/cardTidy.test.js
+++ b/server/test/acceptance/cardTidy.test.js
@@ -8,4 +8,5 @@ import doLines from '../../lib/doLines.json' with { type: 'json' };
 
-const kb = JSON.parse(readFileSync(new URL('../../kristy_perimeter_kb.json', import.meta.url), 'utf8'));
 const ROOT = new URL('../../../', import.meta.url).pathname;
+// clean-pick-1 (2026-10-20) moved batch cards on; this test now pins the ede90e7 result.
+const kb = JSON.parse(execFileSync('git', ['show', 'ede90e7:server/kristy_perimeter_kb.json'], { cwd: ROOT, maxBuffer: 64 << 20 }).toString());
 const pre = JSON.parse(execFileSync('git', ['show', '8264bd0:server/kristy_perimeter_kb.json'], { cwd: ROOT, maxBuffer: 64 << 20 }).toString());
diff --git a/server/test/acceptance/ic4achicken.test.js b/server/test/acceptance/ic4achicken.test.js
index df241e4..634321c 100644
--- a/server/test/acceptance/ic4achicken.test.js
+++ b/server/test/acceptance/ic4achicken.test.js
@@ -24,2 +24,5 @@ const listRow = (name) => attachCards({ items: [{ name, source: 'user' }] }, { l
 const TO = 'chicken_cuts_basics';
+// clean-pick-1 (2026-10-20) moved this card on; the fold's checks read it as of ede90e7.
+const CP1 = JSON.parse(execFileSync('git', ['show', 'ede90e7:server/kristy_perimeter_kb.json'], { cwd: ROOT, maxBuffer: 64 << 20 }).toString());
+kb.entries = kb.entries.map((e) => (e.id === TO ? CP1.entries.find((x) => x.id === TO) : e));
 const FOLDED = ['air_chilled_chicken', 'no_antibiotics_poultry'];
diff --git a/server/test/acceptance/sugarsRank.test.js b/server/test/acceptance/sugarsRank.test.js
index e94c7c7..2935cf5 100644
--- a/server/test/acceptance/sugarsRank.test.js
+++ b/server/test/acceptance/sugarsRank.test.js
@@ -6,3 +6,2 @@ import { execFileSync } from 'node:child_process';
 import { nonEmpty } from '../../lib/testGuards.js';
-import doLines from '../../lib/doLines.json' with { type: 'json' };
 import { scoreEntries } from '../../lib/perimeter.js';
@@ -12,3 +11,4 @@ const ROOT = new URL('../../../', import.meta.url).pathname;
 const git = (spec) => execFileSync('git', ['show', spec], { cwd: ROOT, maxBuffer: 64 << 20 }).toString();
-const kb = JSON.parse(readFileSync(new URL('../../kristy_perimeter_kb.json', import.meta.url), 'utf8'));
+// clean-pick-1 (2026-10-20) moved the sugars card on; this test now pins the ede90e7 result.
+const kb = JSON.parse(git('ede90e7:server/kristy_perimeter_kb.json'));
 const base = JSON.parse(git('b284f0b:server/kristy_perimeter_kb.json'));
@@ -85,2 +85,3 @@ test('C5 every other card, the entry count and the top-level fields are byte-ide
 test('C6 doLines.json differs from b284f0b on sugars only, and the review row carries the same two cells', () => {
+  const doLines = JSON.parse(git('ede90e7:server/lib/doLines.json'));
   const was_ = JSON.parse(git('b284f0b:server/lib/doLines.json'));
@@ -89,3 +90,3 @@ test('C6 doLines.json differs from b284f0b on sugars only, and the review row ca
   assert.deepEqual({ ...doLines, sugars: was_.sugars }, was_);
-  const review = readFileSync(new URL('../../../docs/do-lines-review.md', import.meta.url), 'utf8');
+  const review = git('ede90e7:docs/do-lines-review.md');
   assert.ok(review.includes(`| \`sugars\` | bulk_pantry | ${DO_LINE.headline} | ${DO_LINE.do} |`), 'review table row');
diff --git a/server/test/acceptance/w2.test.js b/server/test/acceptance/w2.test.js
index 0c8b79d..5d3d802 100644
--- a/server/test/acceptance/w2.test.js
+++ b/server/test/acceptance/w2.test.js
@@ -8,3 +8,3 @@ import tips from '../../lib/sectionRules.json' with { type: 'json' };
 import { nonEmpty } from '../../lib/testGuards.js';
-import { beforeTwoLine, beforeConcern, preTidy } from './twoLinePin.js';
+import { beforeTwoLine, beforeConcern, preTidy, preCleanPick } from './twoLinePin.js';
 import { attachCards, collapseByCard, matchItemToCard } from '../../lib/listMatch.js';
@@ -13,3 +13,3 @@ import { kindFor } from '../../lib/counterCards.js';
 import { lintSections } from '../../lib/counterCardLint.js';
-kb.entries = kb.entries.map(preTidy);
+kb.entries = kb.entries.map((e) => preTidy(preCleanPick(e)));
 
diff --git a/server/test/acceptance/w4.test.js b/server/test/acceptance/w4.test.js
index 6447e2c..9861a8c 100644
--- a/server/test/acceptance/w4.test.js
+++ b/server/test/acceptance/w4.test.js
@@ -10,3 +10,4 @@ import { projectEntry } from '../../lib/counterCards.js';
 import { nonEmpty } from '../../lib/testGuards.js';
-import { beforeTwoLine, beforeConcern } from './twoLinePin.js';
+import { beforeTwoLine, beforeConcern, preCleanPick } from './twoLinePin.js';
+kb.entries = kb.entries.map(preCleanPick);
 
```

- Not red after these: `twoLinePin.test.js`, `perimeter.test.js`, `counterReach.test.js`, `counterProbe48`, section lint (meat and eggs_dairy clean; the `salmon_wild_vs_farmed` CART_PICK_DISAGREES hit and produce/bulk_pantry hits are pre-existing at base, not enforced).
- An earlier cart "Air-chilled pasture-raised chicken or thighs" broke "whole chicken" in ic4achicken C3 and counterProbe48; the final cart keeps "whole".
- Baseline (KB at dfbef8a, new test file present): RED C1, C3, C4, C5, C9; GREEN guards C2, C6, C7, C8, C10.
- Dry run with the edits: `cleanPick1.test.js` 10/10; `buildDoLines.js` no diff to doLines.json; `twoLineCheck.js` 181 checked, 0 with violations; `listMatchProbe.js` no wrong matches; `npm test` 2841 tests, 2841 pass, 0 fail (2831 + 10). `commitGuard.js` not run in the dry run (the scratch clone had untracked node_modules symlinks).

## Criteria

- C1 [test] Each B1 card's changed fields deep-equal the final values; poultry detail is base detail + old tier_note; every other field equals ede90e7; the carrying phrase is in decision or cart_pick.
- C2 [test] Each decision is 10 words or fewer; `twoLineCheck` reports 0 with violations.
- C3 [test] tips[0] is a why (not `^(choose|pick|buy|read|check|look|skip|compare)`, not the decision); tips[1] names the card's standard.
- C4 [test] No new or changed string matches `\b(health|healthy|healthier|safer|risk|cancer|disease|toxic|toxin|detox|pesticide-free|synthetic|price|cost|cheap|expensive)\b`; no dash, straight apostrophe or first person.
- C5 [test] The organic set over B1 is exactly chicken_breast, ground_turkey, rotisserie_chicken, sugars, tortillas.
- C6 [test] Every non-batch entry (picks included), the entry count and top-level fields equal ede90e7.
- C7 [test] doLines.json equals ede90e7; each batch review row carries the new decision as headline with its unchanged do; every other review line equals ede90e7.
- C8 [test] Every base buying_tips line is still in buying_tips, watch_out or detail (DROPPED is empty).
- C9 [test] `matchItemToCard(cart_pick).slug === id` for each; "whole chicken" and "chicken thighs" still land on chicken_cuts_basics as rows and asks.
- C10 [test] No new or changed decision, cart_pick or tip appears on more than 2 entries.

Also (verify, not a criterion): whole suite green, listMatchProbe clean, commitGuard clean.

## Ship notes (for Devon; not blockers)

- Pasture-raised poultry and grass-fed dairy fronts are backed by archives only (rebelpastures, hfac, aspca, aga-standards), not by each card's own sources.
- `mayo` "olive oil alone": the card backs olive oil; "only" is the stricter reading.
- `sandwich_bread` "flour, water, yeast, salt": docs/sources/k18/sprouted_grain_bread-3.md:94, a source not in the card's sources.
- Dairy cards' tips still rank certified organic first while the headline now leads with grass-fed; "100% grass-fed" is an option for a later batch.
- `chicken_cuts_basics` cart pick drops "Air-chilled" (46-character cap).
- `flour_basics` and `broth` held back (unbacked); "not enriched" is the offerable flour wording.

## Contract
```json
{
  "criteria": [
    {
      "id": "C1",
      "impl": [
        "server/kristy_perimeter_kb.json",
        "server/test/acceptance/twoLinePin.js",
        "server/test/acceptance/ca-4a.test.js",
        "server/test/acceptance/ca-4b.test.js",
        "server/test/acceptance/ca-7.test.js",
        "server/test/acceptance/w2.test.js",
        "server/test/acceptance/w4.test.js",
        "server/test/acceptance/ic4achicken.test.js",
        "server/test/acceptance/cardOrder.test.js",
        "server/test/acceptance/cardTidy.test.js",
        "server/test/acceptance/sugarsRank.test.js"
      ],
      "tests": [
        "server/test/acceptance/cleanPick1.test.js"
      ],
      "dependents": []
    },
    {
      "id": "C2",
      "impl": [
        "server/kristy_perimeter_kb.json",
        "server/test/acceptance/twoLinePin.js"
      ],
      "tests": [
        "server/test/acceptance/cleanPick1.test.js"
      ],
      "dependents": []
    },
    {
      "id": "C3",
      "impl": [
        "server/kristy_perimeter_kb.json"
      ],
      "tests": [
        "server/test/acceptance/cleanPick1.test.js"
      ],
      "dependents": []
    },
    {
      "id": "C4",
      "impl": [
        "server/kristy_perimeter_kb.json"
      ],
      "tests": [
        "server/test/acceptance/cleanPick1.test.js"
      ],
      "dependents": []
    },
    {
      "id": "C5",
      "impl": [
        "server/kristy_perimeter_kb.json"
      ],
      "tests": [
        "server/test/acceptance/cleanPick1.test.js"
      ],
      "dependents": []
    },
    {
      "id": "C6",
      "impl": [
        "server/kristy_perimeter_kb.json"
      ],
      "tests": [
        "server/test/acceptance/cleanPick1.test.js"
      ],
      "dependents": []
    },
    {
      "id": "C7",
      "impl": [
        "docs/do-lines-review.md",
        "server/lib/doLines.json",
        "server/test/acceptance/ca-4b.test.js"
      ],
      "tests": [
        "server/test/acceptance/cleanPick1.test.js"
      ],
      "dependents": []
    },
    {
      "id": "C8",
      "impl": [
        "server/kristy_perimeter_kb.json"
      ],
      "tests": [
        "server/test/acceptance/cleanPick1.test.js"
      ],
      "dependents": []
    },
    {
      "id": "C9",
      "impl": [
        "server/kristy_perimeter_kb.json",
        "server/test/acceptance/ic4achicken.test.js"
      ],
      "tests": [
        "server/test/acceptance/cleanPick1.test.js"
      ],
      "dependents": []
    },
    {
      "id": "C10",
      "impl": [
        "server/kristy_perimeter_kb.json"
      ],
      "tests": [
        "server/test/acceptance/cleanPick1.test.js"
      ],
      "dependents": []
    }
  ]
}
```

## Acceptance server/test/acceptance/cleanPick1.test.js

```js
// clean-pick-1: batch B1 of docs/CLEAN-PICK-PLAN.md (Devon 2026-10-20). Each staple's front names its own
// cleanest version (pasture-raised or organic poultry, grass-fed dairy, organic sugar and corn, wild-caught fish,
// short-list bread, olive oil mayo and sauce), not a blanket "get organic". Base ede90e7 (3ca18db, dfbef8a plan-only).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { nonEmpty } from '../../lib/testGuards.js';
import doLines from '../../lib/doLines.json' with { type: 'json' };
import { scoreEntries } from '../../lib/perimeter.js';
import { matchItemToCard } from '../../lib/listMatch.js';

const ROOT = new URL('../../../', import.meta.url).pathname;
const git = (spec) => execFileSync('git', ['show', spec], { cwd: ROOT, maxBuffer: 64 << 20 }).toString();
const kb = JSON.parse(readFileSync(new URL('../../kristy_perimeter_kb.json', import.meta.url), 'utf8'));
const base = JSON.parse(git('ede90e7:server/kristy_perimeter_kb.json'));
const find = (k, id) => { const e = k.entries.find((x) => x.id === id); assert.ok(e, `${id} missing`); return e; };
const words = (s) => String(s).trim().split(/\s+/).filter(Boolean).length;

const BECAME = {
  sugars: {
    decision: "Organic coconut or maple sugar first, each from one sap.",
    cart_pick: "Organic coconut sugar or pure maple sugar",
    buying_tips: [
      "Each stays closer to its plant than sugar crystallized from cane or beet juice.",
      "Look for certified organic coconut sugar or pure maple sugar.",
      "Read the list: coconut sugar or maple sugar alone, with nothing added.",
      "Look for pure maple sugar; a maple-flavored product is not maple sugar.",
      "Plain “sugar” names no crop, so choose certified organic first; organic must come from non-GMO plants. Non-GMO Project Verified is a close second.",
      "Pick light or dark brown sugar; dark carries more molasses.",
    ],
  },
  rotisserie_chicken: {
    decision: "Pasture-raised or organic rotisserie chicken, salt and spices only.",
    cart_pick: "Organic or pasture-raised rotisserie chicken",
    buying_tips: [
      "A solution bird was injected with water and seasoning before it went on the spit.",
      "Look for a pasture-raised or certified organic bird on the sticker.",
      "Read the sticker, not the name. ‘Seasoned’, ‘original’ and ‘traditional’ are marketing; the ingredient list is regulated.",
      "The shortest list wins: chicken, salt, spices. Water as the second ingredient means a solution was added.",
      "Sodium phosphate, a starch or a sweetener after the water means a solution bird. The shorter the seasoning line, the plainer the chicken.",
      "A bird held under the lamp is held hot for a reason. Take one that is steaming, not one that has sat.",
      "Check the sticker for oil in the seasoning; choose olive oil or a bird with no added oil.",
      "Seed oils to skip: sunflower, safflower, canola, soybean, corn, and cottonseed.",
      "Skip a bird seasoned with avocado oil too.",
    ],
    tier_note: "Organic rotisserie chicken: certified organic feed and outdoor access; pasture: time outdoors on pasture, audited only with a certifier’s seal.",
  },
  chicken_breast: {
    decision: "Pasture-raised or organic bone-in, skin-on breast; no solution added.",
    cart_pick: "Pasture-raised or organic chicken breast",
    buying_tips: [
      "Boneless skinless breast dries fast in the pan; bone and skin cook better.",
      "Look for pasture-raised or certified organic breast, sold plain.",
      "Read the full product name for the solution percentage and ingredients.",
      "Fresh or frozen breast can be checked for the same solution disclosure.",
      "Read retained-water wording separately from the added flavoring ingredients.",
    ],
    tier_note: "Organic chicken breast: certified organic feed and outdoor access; pasture: time outdoors on pasture, audited only with a certifier’s seal.",
  },
  chicken_cuts_basics: {
    decision: "Air-chilled pasture-raised whole chicken, then bone-in, skin-on thighs.",
    cart_pick: "Pasture-raised whole chicken or bone-in thighs",
    buying_tips: [
      "Water-chilled birds hold water from the chilling tank; skin that starts dry crisps.",
      "Look for air-chilled printed on the whole bird or the thigh pack.",
      "Whole bird: lowest cost per pound, and the carcass makes stock.",
      "Thighs, bone-in and skin-on: forgiving, low-cost, hard to overcook.",
      "Breast: fast and lean. Pull it the moment it is done.",
      "Boneless skinless costs the most for the same bird.",
      "‘Air-chilled’ is printed on the package when it applies.",
      "Skin that starts dry is the skin that crisps.",
      "‘USDA Process Verified’ or a third-party seal backs a ‘raised without antibiotics’ claim.",
      "All chicken is required to be residue-free at sale, labeled or not.",
      "‘Raised without antibiotics’ is a management and resistance choice, not a cleaner-meat guarantee.",
    ],
    tier_note: "Pasture on a chicken label: time outdoors on pasture, audited only with a certifier’s seal.",
  },
  ground_turkey: {
    decision: "Pasture-raised or organic ground turkey, fat content printed.",
    cart_pick: "Pasture-raised or organic plain ground turkey",
    buying_tips: [
      "The name ground turkey sets no one fat level, so two packs can differ.",
      "Look for pasture-raised or certified organic ground turkey, sold plain.",
      "Choose a formulation listing turkey without added seasonings or a flavoring solution.",
      "Without a percent-lean claim, use the Nutrition Facts fat line to compare packs.",
      "Compare the fat content of the actual packs rather than assume one level for all ground turkey.",
    ],
    tier_note: "Organic ground turkey: certified organic feed and outdoor access; pasture: time outdoors on pasture, audited only with a certifier’s seal.",
  },
  turkey_whole: {
    decision: "Pasture-raised whole turkey, without an injected basting solution.",
    cart_pick: "Pasture-raised whole turkey",
    buying_tips: [
      "A basted or self-basted bird carries added broth, stock, fat or water.",
      "Look for a pasture-raised whole turkey, sold unbasted.",
      "Read the solution ingredients beside the product name.",
      "A frozen whole turkey can be checked for the same added-solution statement.",
      "Read retained-water wording separately from the flavoring-solution statement.",
    ],
    tier_note: "Pasture-raised turkey: time outdoors on pasture, audited only with a certifier’s seal.",
  },
  grassfed_butter: {
    cart_pick: "Grass-fed butter",
    buying_tips: [
      "Deep yellow toward orange is carotene from grass. Pale is a hay-fed winter churn.",
      "Look for grass-fed on the wrapper; cream and salt are the whole list.",
      "European-style butters are higher in fat, a separate axis from what the cows ate.",
      "Salted or unsalted is a cooking choice. Unsalted gives control.",
    ],
  },
  cheese_real_vs_processed: {
    decision: "Grass-fed block cheese: milk, cultures, salt, enzymes, nothing else.",
    cart_pick: "Grass-fed block cheese",
    buying_tips: [
      "Bagged shreds are coated in starch to keep them apart, which is why they melt poorly.",
      "Look for grass-fed milk named on the block.",
      "Look for a short list: milk, salt, cultures, enzymes/rennet.",
      "Blocks are cheaper per pound than pre-sliced or shredded, and they melt smoothly.",
      "‘Parmesan’ is a generic word in the US. ‘Parmigiano-Reggiano’ is a protected one with a stamped rind.",
      "Keep hard-cheese rinds. They belong in a pot of beans or soup.",
      "The milk for cheese may come from cows given the synthetic growth hormone rBST. Certified organic rules exclude its use.",
      "Certified organic block cheese is the first choice. Next, find a wrapper stating the cheese uses milk from cows given no rBST. Cheese with neither claim is last. US labeling does not require a statement about rBST use.",
    ],
  },
  cream_vs_creamer: {
    decision: "Grass-fed heavy cream or half-and-half: cream and milk only.",
    cart_pick: "Grass-fed half-and-half",
    buying_tips: [
      "Cream carries a legal milkfat minimum; creamer is oil and sweetener imitating it.",
      "Look for a carton naming grass-fed cows, with cream and milk only.",
      "Heavy cream is 36% milkfat or more. Half-and-half is 10.5 to 18%. Those numbers are fixed by law.",
      "‘Non-dairy creamer’ is oil, sweetener and emulsifiers. It is not cream.",
      "Even real cream can carry carrageenan or gellan gum. A short list is still worth checking.",
      "Flavored creamers are where the added sugar sits. Read the panel.",
      "Whole milk or half-and-half does the same job with a two-word ingredient list.",
      "rBST is a synthetic hormone given to cows for milk production. The certified organic rules bar this growth hormone.",
      "Start with certified organic cream or half-and-half. Follow with a carton stating the cows were not treated with rBST, then one with neither. US companies need not label rBST use.",
      "Even certified organic cream can list carrageenan, a thickener derived from seaweed. Read the ingredients and take cream with none listed.",
    ],
  },
  sour_cream: {
    decision: "Grass-fed sour cream: cream and cultures, nothing else added.",
    cart_pick: "Grass-fed sour cream",
    buying_tips: [
      "Cultured means bacteria did the souring; acidified tubs use added acids.",
      "Look for a grass-fed tub listing only cream and cultures.",
      "Pick a tub named “sour cream” or “cultured sour cream”.",
      "Read the optional ingredients added for texture or shelf life.",
      "Check the name for a declared flavor.",
      "A synthetic growth hormone called rBST can be given to dairy cows. Certified organic sour cream excludes that treatment.",
      "On sour cream, prefer certified organic. Next, look for a printed statement that rBST was not used on the dairy cows. Without either claim, the tub ranks last. Use of rBST need not appear on US dairy labels.",
      "Carrageenan is made from seaweed and used to thicken foods, including some certified organic ones. Read your sour cream’s list and pick a tub without carrageenan.",
    ],
  },
  cream_cheese: {
    decision: "Grass-fed cream cheese by its standard name, no stabilizers.",
    cart_pick: "Grass-fed stabilizer-free cream cheese",
    buying_tips: [
      "The standard allows up to 0.5 percent stabilizers; the list shows who skipped them.",
      "Look for grass-fed cream cheese that lists no stabilizers.",
      "Look for “cream cheese” as the name on the package.",
      "Find a culture in the ingredient list.",
      "Swap in Neufchâtel in most recipes; the two taste similar.",
      "rBST is the synthetic growth hormone used to increase milk production in cows. Certified organic cream cheese rules prohibit it.",
      "Choose certified organic cream cheese first. Next is a pack stating the milk comes from cows untreated with rBST. Both outrank a pack with neither. US labels can omit whether the cows received rBST.",
      "Some certified organic foods contain carrageenan, a seaweed-derived thickener. Look through the cream cheese ingredients and take the version that lists no carrageenan.",
    ],
  },
  sandwich_bread: {
    decision: "Whole wheat sandwich bread: flour, water, yeast, salt, little else.",
    cart_pick: "Short-list whole wheat sandwich bread",
    buying_tips: [
      "A loaf called just “wheat” may be refined; whole wheat keeps the bran and germ.",
      "Look for a short list: whole wheat flour, water, yeast and salt.",
      "Check for whole wheat flour in the ingredients.",
      "Without a stamp, use the flour names to check the loaf.",
      "Check which stamp is shown: 100%, 50%+, or Basic have different grain requirements.",
      "Choose certified organic whole wheat bread over conventional. Conventional wheat may be sprayed with glyphosate shortly before harvest to dry the crop. Organic farming does not allow glyphosate. Drift can still leave residues on organic wheat.",
    ],
  },
  tortillas: {
    decision: "Organic corn tortillas of masa, water and salt.",
    cart_pick: "Organic corn tortillas",
  },
  mayo: {
    decision: "Mayonnaise with olive oil alone, egg yolk and an acid.",
    cart_pick: "Olive oil only mayonnaise",
    buying_tips: [
      "A jar sold on avocado or olive oil can carry other oils; the list shows which leads.",
      "Look for olive oil as the only oil in the ingredient list.",
      "Check that the name on the jar is Mayonnaise.",
      "Choose olive oil mayonnaise with egg yolk and vinegar or citrus juice. Check every oil in the ingredient list.",
      "Compare jars by what they add beyond oil, egg yolk, acid and salt.",
      "Once opened, keep it in the fridge and use it within 1 to 2 months.",
      "Seed oils to skip: sunflower, safflower, canola, soybean, corn, and cottonseed.",
      "Skip avocado oil mayo too, even if it names no other oil.",
    ],
  },
  pasta_sauce: {
    decision: "Pasta sauce of tomatoes and olive oil, no added sweetener.",
    cart_pick: "Tomato and olive oil pasta sauce",
    buying_tips: [
      "Ingredients run most first, so anything ahead of the tomatoes outweighs them.",
      "Look for tomatoes first, olive oil as the oil, and no added sweetener.",
      "Read the first ingredient; tomatoes should lead.",
      "Count what follows the tomatoes; a short list is the craft standard.",
      "On canned tomatoes, read the “with” words for added spices, seasonings or vegetables.",
    ],
  },
  white_fish: {
    decision: "Wild-caught white fish by its named species, firm, mild-smelling.",
    cart_pick: "Wild-caught white fish fillet",
    buying_tips: [
      "A fillet is hard to identify by eye, so the species name does that work.",
      "Look for how it was caught and the species, on the sign or label.",
      "Ask which species the fillet is.",
      "Press the flesh and check that it springs back.",
      "Skip fillets with dried, dark or discolored edges.",
    ],
  },
};
const IDS = Object.keys(BECAME);
// Lint-forced (lintSections L4 TERM_UNGLOSSED): a meat front naming pasture-raised or organic carries the
// G3/G4 gloss in tier_note; the old tier_note moves to the end of detail, never deleted.
const GLOSSED = IDS.filter((id) => BECAME[id].tier_note);
const CARRY = {
  sugars: 'Organic coconut', rotisserie_chicken: 'Pasture-raised or organic', chicken_breast: 'Pasture-raised or organic',
  chicken_cuts_basics: 'Air-chilled pasture-raised', ground_turkey: 'Pasture-raised or organic', turkey_whole: 'Pasture-raised',
  grassfed_butter: 'Grass-fed', cheese_real_vs_processed: 'Grass-fed', cream_vs_creamer: 'Grass-fed', sour_cream: 'Grass-fed',
  cream_cheese: 'Grass-fed', sandwich_bread: 'flour, water, yeast, salt', tortillas: 'Organic corn', mayo: 'olive oil alone',
  pasta_sauce: 'tomatoes and olive oil', white_fish: 'Wild-caught',
};
// tips[1] is the look-for naming the standard. chicken_cuts_basics and white_fish belong to owned-fact families
// (bird_pig_raising, wild_farmed: lintRepeatedClaim), so their look-for names air-chilled and the catch method instead.
const STANDARD = {
  sugars: /certified organic/, rotisserie_chicken: /pasture-raised or certified organic/, chicken_breast: /pasture-raised or certified organic/,
  chicken_cuts_basics: /air-chilled/, ground_turkey: /pasture-raised or certified organic/, turkey_whole: /pasture-raised/,
  grassfed_butter: /grass-fed/, cheese_real_vs_processed: /grass-fed/, cream_vs_creamer: /grass-fed/, sour_cream: /grass-fed/,
  cream_cheese: /grass-fed/, sandwich_bread: /whole wheat flour, water, yeast and salt/, tortillas: /certified organic/,
  mayo: /olive oil as the only oil/, pasta_sauce: /olive oil/, white_fish: /how it was caught/,
};
const ORGANIC = ['chicken_breast', 'ground_turkey', 'rotisserie_chicken', 'sugars', 'tortillas'];
const DROPPED = []; // no base buying_tips line leaves its card
const BANNED = /\b(health|healthy|healthier|safer|risk|cancer|disease|toxic|toxin|detox|pesticide-free|synthetic|price|cost|cheap|expensive)\b/i;
const live = (id) => find(kb, id);
const was = (id) => find(base, id);
// Strings this batch wrote: changed front fields, new tips, the gloss, and what detail gained.
const written = (id) => {
  const e = live(id), b = was(id), out = [];
  for (const k of ['decision', 'cart_pick', 'tier_note']) if (e[k] !== b[k]) out.push(e[k]);
  for (const t of e.buying_tips) if (!b.buying_tips.includes(t)) out.push(t);
  if (e.detail !== b.detail) out.push(e.detail.slice(b.detail.length));
  return out;
};

test('C1 each card carries the final values, and its standard in decision or cart_pick', () => {
  nonEmpty(IDS, 'B1 ids', 16);
  for (const id of IDS) {
    for (const [k, v] of Object.entries(BECAME[id])) assert.deepEqual(live(id)[k], v, `${id}.${k}`);
    if (GLOSSED.includes(id)) assert.equal(live(id).detail, `${was(id).detail} ${was(id).tier_note}`, `${id}.detail keeps the old tier_note`);
    const changed = new Set([...Object.keys(BECAME[id]), ...(GLOSSED.includes(id) ? ['detail'] : [])]);
    for (const k of new Set([...Object.keys(live(id)), ...Object.keys(was(id))])) {
      if (!changed.has(k)) assert.deepEqual(live(id)[k], was(id)[k], `${id}.${k} outside the change`);
    }
    assert.ok(live(id).decision.includes(CARRY[id]) || live(id).cart_pick.includes(CARRY[id]), `${id}: carrying phrase`);
  }
});

test('C2 decisions at most 10 words; twoLineCheck reports 0 violations', () => {
  for (const id of IDS) assert.ok(words(live(id).decision) <= 10, `${id}: ${words(live(id).decision)} words`);
  const out = execFileSync('node', ['scripts/twoLineCheck.js'], { cwd: new URL('../../', import.meta.url).pathname }).toString();
  assert.match(out, /\b0 with violations/);
});

test('C3 tips[0] is a why, not an instruction or the decision; tips[1] names the standard', () => {
  for (const id of IDS) {
    const [t0, t1] = nonEmpty(live(id).buying_tips, `${id} tips`, 2);
    assert.doesNotMatch(t0, /^(choose|pick|buy|read|check|look|skip|compare)\b/i, `${id}: tips[0] is an instruction`);
    assert.notEqual(t0, live(id).decision, `${id}: tips[0] repeats the decision`);
    assert.match(t1, STANDARD[id], `${id}: tips[1] standard`);
  }
});

test('C4 no new or changed string carries a health, risk, synthetic or price word; claim-lock voice', () => {
  const all = nonEmpty(IDS.flatMap(written), 'written strings', 40);
  for (const s of all) {
    assert.doesNotMatch(s, BANNED, s);
    assert.doesNotMatch(s, /—|–|'/, `dash or straight apostrophe: ${s}`);
    assert.doesNotMatch(s, /\b(I|I’m|me|my|we|our|us)\b/, `first person: ${s}`);
  }
});

test('C5 the organic set is exact: organic leads decision or cart_pick on these five B1 cards only', () => {
  const got = IDS.filter((id) => /\borganic\b/i.test(`${live(id).decision} ${live(id).cart_pick}`));
  assert.deepEqual(got.toSorted(), ORGANIC);
});

test('C6 every entry outside the batch, picks included, the entry count and top level equal ede90e7', () => {
  const rest = nonEmpty(kb.entries.filter((e) => !IDS.includes(e.id)), 'other entries', 190);
  for (const e of rest) assert.deepEqual(e, was(e.id), `${e.id} changed`);
  assert.equal(kb.entries.length, base.entries.length);
  assert.deepEqual({ ...kb, entries: 0 }, { ...base, entries: 0 }, 'top-level KB fields');
});

test('C7 do lines stay; the review rows for batch ids carry the new headline; nothing else in the table moves', () => {
  assert.deepEqual(doLines, JSON.parse(git('ede90e7:server/lib/doLines.json')), 'doLines.json equals ede90e7');
  const review = readFileSync(new URL('../../../docs/do-lines-review.md', import.meta.url), 'utf8').split('\n');
  const old = git('ede90e7:docs/do-lines-review.md').split('\n');
  assert.equal(review.length, old.length);
  let seen = 0;
  for (let i = 0; i < old.length; i++) {
    const id = IDS.find((x) => old[i].startsWith(`| \`${x}\` |`) && old[i].includes(` | ${was(x).decision} | `));
    if (!id) { assert.equal(review[i], old[i], `review line ${i + 1}`); continue; }
    seen++;
    assert.equal(review[i], old[i].replace(` | ${was(id).decision} | `, ` | ${live(id).decision} | `), `${id} review row`);
    assert.ok(review[i].includes(` | ${live(id).decision} | ${doLines[id]} |`), `${id} headline and do`);
  }
  assert.equal(seen, IDS.length, 'one review row per batch id');
});

test('C8 every base buying_tips line is still on its card (tips, watch_out or detail)', () => {
  for (const id of IDS) {
    const e = live(id), keep = [...e.buying_tips, ...(e.watch_out ?? [])];
    for (const t of nonEmpty(was(id).buying_tips, `${id} base tips`, 2)) {
      if (DROPPED.includes(t)) continue;
      assert.ok(keep.includes(t) || String(e.detail).includes(t), `${id}: lost "${t}"`);
    }
  }
});

test('C9 each new cart_pick lands on its own card; chicken asks and rows still land on chicken_cuts_basics', () => {
  for (const id of IDS) assert.equal(matchItemToCard(live(id).cart_pick)?.slug, id, `${id} cart_pick`);
  for (const row of ['whole chicken', 'chicken thighs']) assert.equal(matchItemToCard(row)?.slug, 'chicken_cuts_basics', row);
  for (const q of ['whole chicken', 'chicken thighs']) assert.equal(scoreEntries(q, 3)[0]?.entry.id, 'chicken_cuts_basics', q);
});

test('C10 no new or changed decision, cart_pick or tip appears on more than 2 entries', () => {
  const count = (s) => kb.entries.filter((e) => [e.decision, e.cart_pick, ...(e.buying_tips ?? [])].includes(s)).length;
  const fresh = nonEmpty(IDS.flatMap((id) => [live(id).decision, live(id).cart_pick, ...live(id).buying_tips.filter((t) => !was(id).buying_tips.includes(t))]), 'fresh lines', 30);
  for (const s of fresh) assert.ok(count(s) <= 2, `"${s}" on ${count(s)} entries`);
});
```
