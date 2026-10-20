# clean-pick-2: B2 produce, each item points to its own organic version (Q1 A)

```json
{
  "id": "clean-pick-2",
  "tier": "T2",
  "ui": false,
  "owns": [
    "server/kristy_perimeter_kb.json",
    "docs/do-lines-review.md",
    "server/lib/doLines.json",
    "server/test/acceptance/twoLinePin.js",
    "server/test/acceptance/w2.test.js",
    "server/test/acceptance/ca-4b.test.js",
    "server/test/acceptance/ca-7.test.js",
    "server/test/acceptance/w4.test.js",
    "server/test/acceptance/ic3b.test.js",
    "server/test/acceptance/passRule.js"
  ],
  "read_full": [
    "server/test/acceptance/twoLinePin.js",
    "server/test/acceptance/passRule.js",
    "server/test/acceptance/ic3b.test.js",
    "server/test/acceptance/cleanPick1.test.js",
    "docs/do-lines-review.md",
    "server/scripts/buildDoLines.js"
  ],
  "verify": "cd /Users/m1/kristy && node --test server/test/acceptance/cleanPick2.test.js && cd server && node scripts/buildDoLines.js && node scripts/twoLineCheck.js && node scripts/commitGuard.js && node scripts/listMatchProbe.js && npm test"
}
```

Repo `/Users/m1/kristy`, branch `main`, base `74237ce` (KB identical to `230dd1e`; 74237ce adds the look_for order fix and `lookForOrder.test.js`). Baseline `npm test` at 74237ce: **2843 pass / 0 fail**. Ship count: 2843 + 11 = **2854**. Not migrated. Env: node, git; server/.env not needed.

## Alignment

Devon 2026-10-20: "we dont want to just tack on a 'get organic' to every single item but rather, point them to the cleanest and healthiest version of the item they are getting". Q1 ruling: **A. Organic on every produce card.** (`docs/CLEAN-PICK-PLAN.md` L360, B2 section L260–268.)

- **Done means:** Given the KB at 74237ce, when this lands, then every one of the 17 B2 ids names organic in its decision or cart_pick, each cart_pick names its own produce ("Organic carrots and potatoes", never "Organic produce"), tips[1] names the USDA Organic standard, no B2 decision contains "conventional", and C1–C11 below pass with `npm test` at 2854/0.
- **Out of scope:** ids outside the 17; aliases; asked_as; sources; depth rewrites (short_answer, kristy_take, science, watch_out, pick_steps stay as they are, Ship notes list the contradictions left); migration.
- **OK rough edges:** headlines lead with "Organic"; detail on the Q1 cards still carries the older EWG Clean Fifteen reasoning (demoted, not deleted); hub/banana short_answer and kristy_take still say conventional is fine (Ship note).
- **Ship bar:** any of C1–C11 red; `npm test` below 2854 pass or any fail; twoLineCheck not 0 of 181; listMatchProbe reports a wrong match; a verdict subject changed beyond the table below.

## Change

Conventions: curly apostrophes as the KB uses (none of the new strings needs one); no em dash; no first person; every new sentence ≤20 words; decision ≤10 words; cart_pick ≤46 chars; buying_tips[0] a why ≤90 chars that is not cautionary (does not start with No/Not/Never/Skip/Avoid, does not contain "is not a"); tips[1] names the USDA Organic standard. Organic is a certified standard, never a health effect. Backing: hub `organic_worth_it_by_type` and `label_organic_scope` material, plus `docs/sources/item-cards/7cfr205.105-prohibited-substances.md` (line 1 `url: https://www.law.cornell.edu/cfr/text/7/205.105`, grepped).

**Demotion rule (literal).** Where a row says "detail +=", the new detail is `base.detail + ' ' + parts.join(' ')`, parts in the listed order, each copied verbatim from the 74237ce value. Nothing else in detail changes.

### Old → new

| id | decision old → new | cart_pick old → new | tips | tier_note | detail += |
|---|---|---|---|---|---|
| organic_worth_it_by_type | "Organic for produce eaten whole; conventional for what you peel." → "Organic produce, first on everything eaten skin-on." | none | [0] kept; insert new [1]; old [1] → [2]; old [2] and [3] demoted | unchanged | old tips[2], old tips[3] |
| frozen_vs_fresh_produce | "Plain frozen produce, picked ripe and frozen within hours." → "Plain organic frozen produce, picked ripe and frozen within hours." | "Frozen vegetables, no sauce" → "Organic frozen vegetables" | insert new [1] | unchanged | none |
| produce_seasonality | "In-season produce, or frozen when it is out of season." → "Organic in-season produce, or frozen when it is out of season." | unchanged ("Whatever fruit is in season", see Ship notes) | insert new [1] | unchanged | none |
| sprouts_raw | "Cold-case sprouts with white roots and crisp stems." → "Organic sprouts from the cold case, white roots, crisp stems." | "Broccoli sprouts" → "Organic broccoli sprouts" | insert new [1] | unchanged | none |
| berries_picking | unchanged | "Fresh berries" → "Organic strawberries or blueberries" | insert new [1] | unchanged | none |
| produce_leafy_greens | unchanged | "Crisp greens with no yellowing or wilt" → "Organic spinach, kale, or lettuce" | insert new [1] | unchanged | none |
| produce_peppers | unchanged | "Firm, unbruised bell peppers" → "Organic bell peppers" | insert new [1] | unchanged | none |
| produce_apples_pears | unchanged | "Firm, unbruised apples or pears" → "Organic apples or pears" | insert new [1] | unchanged | none |
| produce_stone_fruit | unchanged | "Unbruised peaches, plums, or cherries" → "Organic peaches, plums, or cherries" | insert new [1] | unchanged | none |
| produce_green_beans | unchanged | "Crisp, slender green beans" → "Organic green beans" | insert new [1] | unchanged | none |
| produce_root_vegetables | "Firm organic potatoes, conventional carrots, with nothing soft or sprouting." → "Organic potatoes and carrots, firm, with nothing soft or sprouting." | "Firm roots with no sprouts or soft spots" → "Organic carrots and potatoes" | new [0], new [1]; old [0] demoted | replaced | old tips[0], old tier_note |
| produce_brassicas | "Conventional cabbage and cauliflower, tight heads, no soft spots." → "Organic broccoli, cauliflower and cabbage, tight heads, no soft spots." | "Firm broccoli, cauliflower, or cabbage" → "Organic broccoli, cauliflower, or cabbage" | new [0], new [1]; old [0] demoted | replaced | old tips[0], old tier_note |
| produce_onions_garlic | "Conventional onions and garlic, firm with a dry neck." → "Organic onions and garlic, firm, with a dry neck." | "Firm dry onions and garlic with dried necks" → "Organic onions and garlic" | insert new [1] | replaced | old tier_note |
| produce_citrus | "Firm, smooth citrus: conventional to eat, organic for zest." → "Organic oranges, lemons and limes, firm with a smooth rind." | "Firm, smooth oranges, lemons, or limes" → "Organic oranges, lemons, or limes" | insert new [1] | replaced | old tier_note |
| produce_mushrooms | "Dry, firm conventional mushrooms with no dark spots." → "Organic mushrooms, dry and firm, with no dark spots." | "Dry, firm mushrooms with no dark spots" → "Organic mushrooms" | insert new [1] | replaced | old tier_note |
| produce_bananas | "Green bananas to finish ripening on your counter." → "Organic bananas, green, to finish ripening on the counter." | "Green or just-turning bananas" → "Organic green bananas" | insert new [1] | replaced | old tier_note |
| label_organic_scope | unchanged (already organic, no "conventional") | none | unchanged (tips[1] "Organic is about inputs and practices…" already names the standard) | unchanged | none |

Hub `labels_decoded[0].meaning` (the one narrowing, plan L47–48):
"Grown to the National Organic Program rules and certified, with no SYNTHETIC pesticides. Not pesticide-free: copper, spinosad and pyrethrins are approved organic ones." →
"Grown to the National Organic Program rules and certified, with synthetic pesticides outside an approved list. Not pesticide-free: copper, spinosad and pyrethrins are approved organic ones."
`labels_decoded[0].term` and `labels_decoded[1]` unchanged. No other entry's labels_decoded changes (`label_organic_scope` labels_decoded is frozen by k11).

Subject notes: every verdict subject stays the same item; only the standard named moves to organic per Q1 A. Seasonality's cart stays unchanged because every candidate either puts "organic fruit" contiguous (the hub's alias, C9 would route it to the hub) or names a single fruit the card does not own.

### Final values

The builder writes these verbatim. Fields not listed stay at their 74237ce value. `detailAppend` and `labelMeaning0` are applied as stated above.

```js
const BECAME = {
  organic_worth_it_by_type: {
    decision: 'Organic produce, first on everything eaten skin-on.',
    buying_tips: [
      'Residue sits on the skin, so a peel you throw away takes it with it.',
      'The USDA Organic seal on the sign or sticker is the standard to read.',
      'Ask one question at the shelf: does the skin get eaten? Berries, greens, apples, grapes and potatoes, yes. That is where the money goes.',
    ],
    detailAppend: [
      'Anything peeled goes in plain, however soft it looks. Avocado, kiwi, mango, banana, citrus and onion all test low.',
      'Soak the conventional eaten-whole ones. A baking soda soak takes more surface residue off than a rinse.',
    ],
    labelMeaning0: 'Grown to the National Organic Program rules and certified, with synthetic pesticides outside an approved list. Not pesticide-free: copper, spinosad and pyrethrins are approved organic ones.',
  },
  frozen_vs_fresh_produce: {
    decision: 'Plain organic frozen produce, picked ripe and frozen within hours.',
    cart_pick: 'Organic frozen vegetables',
    buying_tips: [
      'Freezing holds produce at peak ripeness, while fresh can lose nutrients in transit.',
      'Frozen organic bags carry the same USDA Organic seal and rules as fresh.',
      'Check the bag lists just the vegetable/fruit. No sauces or added sugar.',
      'Frozen berries and spinach are staples that never spoil.',
      'Great for smoothies, soups, and sheet-pan roasts.',
    ],
  },
  produce_seasonality: {
    decision: 'Organic in-season produce, or frozen when it is out of season.',
    buying_tips: [
      'In season, it travels less and reaches you closer to ripe, so it tastes better.',
      'In-season organic produce carries the USDA Organic seal, fresh or frozen.',
      'The cheapest, most abundant produce this week is usually what’s in season.',
      'Off-season, reach for frozen instead of sad ‘fresh’.',
      'Farmers’ markets are a fast read on what’s actually in season locally.',
      'Spring: asparagus, peas, radishes, artichokes, strawberries, tender greens.',
      'Summer: tomatoes, corn, zucchini, peppers, cucumbers, stone fruit, melon, berries.',
      'Autumn: winter squash, sweet potatoes, apples, pears, brussels sprouts, grapes.',
      'Winter: citrus, cabbage, kale, leeks, beets, parsnips, storage onions and potatoes.',
      'Storage crops (apples, onions, potatoes, squash, carrots) stay good long past their season.',
    ],
  },
  sprouts_raw: {
    decision: 'Organic sprouts from the cold case, white roots, crisp stems.',
    cart_pick: 'Organic broccoli sprouts',
    buying_tips: [
      'Warm, damp growing conditions also multiply any bacteria already on the seed.',
      'Sprouts are eaten raw and whole, so the USDA Organic seal is the standard here.',
      'The refrigerated case only. Room-temperature sprouts have been left in growing conditions.',
      'Roots still white and threadlike, stems crisp rather than limp.',
      'No condensation fogging the clamshell and no sour smell through the vents.',
      'A pack date you can read. Days old, not a week.',
      'Or a jar, a mesh lid and a scoop of seed. Three days on the counter.',
    ],
  },
  berries_picking: {
    cart_pick: 'Organic strawberries or blueberries',
    buying_tips: [
      'The bottom berries carry the weight and mold first, while the top still looks fresh.',
      'Berries are eaten whole, so the USDA Organic seal on the clamshell is the standard.',
      'A dry, unstained bottom on the carton. That is the whole check.',
      'No fuzzy white or gray spot on any berry. One takes the punnet.',
      'Green caps still fresh on strawberries, not browned and dry.',
      'Deep, even color for the variety, and uniform size in the container.',
      'Buy them cold, from the refrigerated display rather than a room-temperature stack.',
      'No USDA Organic seal on the clamshell means conventional, whatever the box says.',
      'Read the seal, not the photograph; the two cartons look almost identical.',
      'Frozen organic strawberries: same seal and same rules.',
    ],
  },
  produce_leafy_greens: {
    cart_pick: 'Organic spinach, kale, or lettuce',
    buying_tips: [
      'By weight, spinach carries more pesticide residue than any other produce.',
      'Leaves are eaten whole, so the USDA Organic seal is the standard for greens.',
      'Lettuce: crisp leaves, bright to dark green outside and pale at the heart, free of decay or damage.',
      'Romaine: a head that is neither very loose nor very hard. Loose is immature; hard is overmature.',
      'Spinach: uniformly green, fully crisp, fairly clean.',
      'Kale: firm, deep colored leaves on moist, hardy stems. Smaller leaves are more tender and milder.',
      'Store lettuce and spinach as close to 32°F as the refrigerator gets.',
      'Kale: plastic bag, air pressed out, unwashed, about five days in the refrigerator.',
    ],
  },
  produce_peppers: {
    cart_pick: 'Organic bell peppers',
    buying_tips: [
      'A firm pepper still holds its water; wrinkled skin means it dried out in storage.',
      'The skin gets eaten, so the USDA Organic seal is the standard for peppers.',
      'Firm, with uniform shape, size, and color for the variety.',
      'Colored peppers: at least half of the surface colored.',
      'Free of cracks, decay, sunburn, disease, or insect damage.',
      'Skip a bruised or damaged pepper.',
      'Store around 45°F where possible; at 41°F, plan on about two weeks.',
      'Red, yellow, and orange peppers tolerate the cold better than green.',
    ],
  },
  produce_apples_pears: {
    cart_pick: 'Organic apples or pears',
    buying_tips: [
      'Bruised fruit makes the sound fruit beside it ripen and rot faster.',
      'Apples and pears are eaten skin-on, so the USDA Organic seal is the standard.',
      'Apples: firm and crisp, free of bruising, decay, cracks, and insect injury.',
      'Pears: free of bruising, insect damage, and decay; a firm green Bartlett ripens off the tree.',
      'Store in the dark at 30 to 32°F, up to 40°F, in a ventilated box or a perforated bag.',
      'Do not wash before storing; the moisture hastens decay.',
      'McIntosh and Honeycrisp: store at 38°F, since they are prone to chilling injury.',
      'Refrigerated apples keep up to a month.',
    ],
  },
  produce_stone_fruit: {
    cart_pick: 'Organic peaches, plums, or cherries',
    buying_tips: [
      'A bruise stays for good, and peaches and cherries both make the Dirty Dozen.',
      'Stone fruit is eaten skin-on, so the USDA Organic seal is the standard here.',
      'Peaches and nectarines: ground color gone from green to yellow, no bruises or damage.',
      'Plums: skin color turned for the variety, no bruises or damage.',
      'Cherries: full color across the surface, green fleshy stems, no cracks, pecks, or shriveling.',
      'Store just above freezing, 30.5 to 32°F; cherries at or below 41°F.',
      'Plums that still need to ripen: keep them out of the 36 to 46°F range.',
      'Skin staining on a peach or nectarine is cosmetic; a bruise is not.',
    ],
  },
  produce_green_beans: {
    cart_pick: 'Organic green beans',
    buying_tips: [
      'Bulging seeds mean an older bean, turning tough, stringy and starchy.',
      'The whole pod gets eaten, so the USDA Organic seal is the standard for beans.',
      'Pick smooth, slender pods with no seeds bulging through.',
      'Leave beans with brown or rust spots behind.',
      'Store them cold and cook them within five days.',
    ],
  },
  produce_root_vegetables: {
    decision: 'Organic potatoes and carrots, firm, with nothing soft or sprouting.',
    cart_pick: 'Organic carrots and potatoes',
    tier_note: 'USDA testing ranks potatoes high for residue, and organic is the certified standard for both roots.',
    buying_tips: [
      'Potatoes rank high for residue in USDA testing, and the skin often gets eaten.',
      'The USDA Organic seal on the bag is the standard for potatoes and carrots.',
      'Potatoes: firm, with no bruises, nicks, or soft spots.',
      'Carrots: firm and well colored. With the tops on, choose bright green, fresh-looking tops.',
      'Sweet potatoes: smooth and firm, even in shape and size, peel color even for the variety, free of damage.',
      'Beets: firm and round with a slender tap root. The leaves on top say nothing certain about the root. Wilted leaves say little as long as the root is firm.',
      'Potatoes: a cool, dark, ventilated place, 45 to 50°F, for up to a month.',
      'Carrots: a closed bag or container in the refrigerator, tops removed, up to two weeks. A wilted carrot revives in cold water.',
      'Beets: stem trimmed to an inch, root end left on, refrigerated in a food-safe container up to two weeks.',
    ],
    detailAppend: [
      'Carrots rank among the lowest for pesticide residue, so conventional is fine there.',
      'Potatoes rank high for residue in USDA testing and carrots rank low, so the bag decides.',
    ],
  },
  produce_brassicas: {
    decision: 'Organic broccoli, cauliflower and cabbage, tight heads, no soft spots.',
    cart_pick: 'Organic broccoli, cauliflower, or cabbage',
    tier_note: 'Broccoli and cabbage are eaten without a peel, and organic heads are certified to the USDA standard.',
    buying_tips: [
      'Florets and leaves are eaten whole, with no peel to take surface residue away.',
      'The USDA Organic seal is the standard for broccoli, cauliflower and cabbage.',
      'Broccoli: dark green florets, closed tight, on stems that are not thick and tough.',
      'Cauliflower: a head with no bruises or damage.',
      'Cabbage: outer leaves fresh, not wilted or insect-damaged. Remove any that are.',
      'Broccoli keeps in the refrigerator in a plastic bag with holes. Use it within three days.',
      'Cabbage keeps several weeks in a plastic bag or wrap in the refrigerator, at 41°F or below.',
      'Cut out the cabbage core and rinse the leaves under cool running water before using.',
    ],
    detailAppend: [
      'Cabbage and cauliflower rank among the lowest produce for pesticide residue.',
      'Cabbage and cauliflower both sit on the low-residue list from USDA testing.',
    ],
  },
  produce_onions_garlic: {
    decision: 'Organic onions and garlic, firm, with a dry neck.',
    cart_pick: 'Organic onions and garlic',
    tier_note: 'Onions and garlic grown to the USDA Organic standard carry the seal, papery skin and all.',
    buying_tips: [
      'A dry neck and papery skins mark a well-cured bulb; soft or scented ones are fading.',
      'Organic onions and garlic are grown and certified to the USDA Organic standard.',
      'Onions firm for their size, with little to no scent.',
      'An onion neck that is completely dry to the touch, not slippery.',
      'Garlic well cured: dried neck, dry outer skins, cloves firm to the touch.',
      'Some loose skins on an onion are normal.',
      'Whole onions: cool, dry, dark, with air moving. Never in plastic.',
      'Cut onions go in a sealed container for up to seven days.',
    ],
    detailAppend: [
      'Onions sit on the low-residue list from USDA testing, and the papery skin comes off.',
    ],
  },
  produce_citrus: {
    decision: 'Organic oranges, lemons and limes, firm with a smooth rind.',
    cart_pick: 'Organic oranges, lemons, or limes',
    tier_note: 'Zest goes in whole, and organic citrus is certified to the USDA Organic standard.',
    buying_tips: [
      'A partly green orange can be fully mature, so firmness and a smooth rind tell more.',
      'Organic citrus carries the USDA Organic seal, which covers the peel used for zest.',
      'Oranges: even color, firm, smooth, no decay, bruising, or blemishes.',
      'Lemons: even yellow, firm, smooth, no drying, rind stains, or shriveling.',
      'Limes: firm and smooth, no bruises, oil spotting, or dryness; yellow ones have more juice.',
      'Oranges: room temperature up to a week, refrigerator up to three weeks.',
      'Lemons and limes hold best in the 50s °F, warmer than the refrigerator.',
      'Use the yellowed lemons and limes first; the green-picked ones keep longest.',
    ],
    detailAppend: [
      'USDA tests oranges with the peel off, so organic only earns its place when the zest goes in.',
    ],
  },
  produce_mushrooms: {
    decision: 'Organic mushrooms, dry and firm, with no dark spots.',
    cart_pick: 'Organic mushrooms',
    tier_note: 'Mushrooms get eaten whole, cap and stem, and organic ones carry the USDA Organic seal.',
    buying_tips: [
      'Moisture is what spoils mushrooms, so a dry, firm cap is the fresh one.',
      'Organic mushrooms carry the USDA Organic seal, loose or packed.',
      'Feel for a dry, firm cap and pass on any with dark spots.',
      'Pick closed caps for a mild flavor and open caps for a stronger one.',
      'Buy them loose to take only the amount needed.',
    ],
    detailAppend: [
      'Mushrooms sit on the low-residue list from USDA testing, so plain ones earn the cart.',
    ],
  },
  produce_bananas: {
    decision: 'Organic bananas, green, to finish ripening on the counter.',
    cart_pick: 'Organic green bananas',
    tier_note: 'Organic bananas are certified to the USDA Organic standard and finish ripening on the counter the same way.',
    buying_tips: [
      'Bananas get sweeter as the green fades, and ripening on the plant often splits them.',
      'Organic bananas are grown and certified to the USDA Organic standard.',
      'Take the greenest bunch for the week; it keeps ripening at home.',
      'Keep green bananas out of the fridge. Cold below 56°F can stop them ripening.',
      'Pass on fruit with skin splits or dark streaks.',
    ],
    detailAppend: [
      'Conventional is fine on green bananas: they rank low for residue, tested with the peel off.',
    ],
  },
  label_organic_scope: {},
};
```

The base strings above (every tip other than the new [0]/[1] ones, every detailAppend part) are copied from the 74237ce KB as read by the planner. **If any base string differs by even one character from the 74237ce KB, the KB value wins**: fix it in the KB-derived data, never in the acceptance test, and report the line. The acceptance test computes kept tips and detail parts from `git show 74237ce`, not from these literals, except the new strings.

### do-lines-review.md

Only the headline cell changes, and only on the 10 rows whose decision changed (hub L46, frozen L47, seasonality L49, sprouts L106, root L107, brassicas L108, onions L109, citrus L113, mushrooms L115, bananas L117). The do cell of every row stays byte-identical. Then `node scripts/buildDoLines.js` from `server/`; `server/lib/doLines.json` must deepEqual its 74237ce value (C7). If buildDoLines changes doLines.json, stop and report: that means the headline feeds the json and C7 is wrong.

## Hard limits

- No alias, asked_as, sources, evidence_tier, category, pick_steps, watch_out, short_answer, kristy_take, science, why or question change on any entry.
- No entry outside the 17 changes (C6).
- No new string contains a BANNED word (C4), first person, an em dash or a straight apostrophe.
- "synthetic" appears only in the hub labels_decoded[0] narrowing.
- Do not edit `ITEM_CARD_REWRITE` in passRule.js (ic1 pins it).
- Do not edit counterCardLint.js, counterCards.js, listMatch.js or any route.
- Do not run the migration.

## Pins and older tests

Seven test/pin files (the plan's split rule says more than 3 pin files beyond the common owns means split; B1 shipped with 10; this is recorded in Ship notes, not split).

```diff
--- server/test/acceptance/twoLinePin.js (append after the preCleanPick line, end of file)
+// clean-pick-2 (2026-10-20) moved these produce fronts on; older batch tests read them as of 74237ce, and cleanPick2.test.js owns the new text.
+export const CLEAN_PICK_2 = new Set(['organic_worth_it_by_type', 'frozen_vs_fresh_produce', 'produce_seasonality', 'sprouts_raw', 'berries_picking', 'produce_leafy_greens', 'produce_peppers', 'produce_apples_pears', 'produce_stone_fruit', 'produce_green_beans', 'produce_root_vegetables', 'produce_brassicas', 'produce_onions_garlic', 'produce_citrus', 'produce_mushrooms', 'produce_bananas']);
+const PRE_CP2 = JSON.parse(execFileSync('git', ['show', '74237ce:server/kristy_perimeter_kb.json'], { cwd: ROOT, maxBuffer: 64 << 20 }).toString());
+export const preCleanPick2 = (e) => (e && CLEAN_PICK_2.has(e.id) ? PRE_CP2.entries.find((x) => x.id === e.id) : e);
```

twoLinePin.js `TWO_LINE` rows: for each of the 16 changed ids, set the row's `decision` to the live (BECAME or unchanged) decision and its `buying_tips` to the BECAME buying_tips, verbatim. `label_organic_scope`'s row does not change.

```diff
--- server/test/acceptance/w2.test.js
-import { beforeTwoLine, beforeConcern, preTidy, preCleanPick } from './twoLinePin.js';
+import { beforeTwoLine, beforeConcern, preTidy, preCleanPick, preCleanPick2 } from './twoLinePin.js';
-kb.entries = kb.entries.map((e) => preTidy(preCleanPick(e)));
+kb.entries = kb.entries.map((e) => preTidy(preCleanPick(preCleanPick2(e))));

--- server/test/acceptance/ca-4b.test.js   (L3 import, L20; L19 `const LIVE = structuredClone(kb);` stays before it)
 import { ..., preCleanPick } from './twoLinePin.js';      → add preCleanPick2 to the same import
-kb.entries = kb.entries.map((e) => preTidy(preCleanPick(e)));
+kb.entries = kb.entries.map((e) => preTidy(preCleanPick(preCleanPick2(e))));

--- server/test/acceptance/ca-7.test.js    (L11 import, L16)
 same two edits as ca-4b

--- server/test/acceptance/w4.test.js      (L11 import, L12)
 import { ..., preCleanPick } from './twoLinePin.js';      → add preCleanPick2
-kb.entries = kb.entries.map(preCleanPick);
+kb.entries = kb.entries.map((e) => preCleanPick(preCleanPick2(e)));

--- server/test/acceptance/ic3b.test.js
+import { preCleanPick2 } from './twoLinePin.js';
 (after `now` at L20)
+// historical, clean-pick-2 Q1 A: the conventional-for-peeled headlines were retired on 2026-10-20.
+const was = (id) => preCleanPick2(now(id));
 C1 decision assert (L44, organic_worth_it_by_type): now(...) → was(...)
 C2 decision assert (L55, produce_bananas):          now(...) → was(...)
 C4 KIND checks (L75–84, "conventional"/"both"):      now(...) → was(...)
 C5 and C6 stay on now(): they lint the live cards (≤14 words, no headlineHedge, tier_note one sentence ≥5 words, unique, lintCard empty, readability empty, review headline equals decision, RULE4 and the banana spoken-field regex).

--- server/test/acceptance/passRule.js
+export const CLEAN_PICK_CART = new Set(['frozen_vs_fresh_produce', 'sprouts_raw']);
 in the FROZEN field loop, before the deepEqual:
+    if (f === 'cart_pick' && CLEAN_PICK_CART.has(id)) continue;
```

(produce_seasonality's cart_pick does not change, so it is not in CLEAN_PICK_CART. produce_bananas is not in the kb-pre-readability fixture, so passRule never sees it. The other cart changes are on ids already relaxed by ITEM_CARD_REWRITE.)

No change needed: ca-4a, ktight, ic1, ic3a, ic4b–ic8b, k5 (lints the new text live; the values above were written to its rules), k11, k14, k16, k19, k23, k24, k3-1, counterProbe48, cardOrder, cardTidy, sugarsRank, lookForOrder, perimeter.test.js (cart ≤46 chars holds).

## Criteria

- C1 [test] Given 74237ce, when the KB is read, then each of the 17 ids equals BECAME field by field (detail = base detail + ' ' + detailAppend parts; hub labels_decoded[0].meaning = the narrowing), every other field deepEquals 74237ce, and the decision or cart_pick contains its CARRY phrase verbatim.
- C2 [test] Given the 17 ids, then every decision is ≤10 words and every cart_pick ≤46 chars; `node scripts/twoLineCheck.js` reports 0 of 181.
- C3 [test] Given the 17 ids, then buying_tips[0] does not match `/^(choose|pick|buy|read|check|look|skip|compare)\b/i` and is not the decision, and buying_tips[1] contains "organic" (case-insensitive).
- C4 [test] Given every string new at 74237ce (changed decision, cart_pick, tier_note, new tips, appended detail slice, hub labels_decoded[0].meaning), then none matches BANNED; the only exemption is the word "synthetic" in the hub narrowing; none contains first person, "—", or a straight apostrophe.
- C5 [test] Given the 17 ids, then every one names organic in decision or cart_pick (Q1 A: organic is the produce standard); outside the batch, organic presence in decision/cart_pick equals 74237ce.
- C6 [test] Given entries outside the 17 (≥190), then each deepEquals 74237ce.
- C7 [test] Given doLines.json, then it deepEquals 74237ce; in do-lines-review.md the do cell of every row equals 74237ce, the headline cell equals the live decision for exactly the 10 decision-changed ids, and every other row is byte-identical.
- C8 [test] Given each of the 17 ids, then every 74237ce buying_tip is still in buying_tips or, if listed in detailAppend, sits in the live detail.
- C9 [test] Given each of the 17 ids with a cart_pick, then matchItemToCard(cart_pick) returns that id; `node scripts/listMatchProbe.js` reports no wrong match.
- C10 [test] Given every new string (≥30), then no exact string appears on more than 2 entries [PLACEHOLDER threshold 2].
- C11 [test] Given the 17 ids, then no decision matches `/conventional/i`.

## Ship notes

- Pin files: 7 beyond the KB/do-lines owns, against the plan's "more than 3 → split" rule. Not split: every repoint is a one-line import plus one map chain, same as B1's 10.
- `produce_seasonality` cart_pick stays "Whatever fruit is in season": every organic candidate either routes to the hub's "organic fruit" alias or names one fruit. `server/routes/list.js` L238 seeds that exact string and the `listCompose.js` L59 prompt mentions it; both are unaffected.
- Depth contradictions left for a later depth batch (plan non-goal: depth rewrites out): hub short_answer, kristy_take, science, pick_steps[1] and watch_out[4] still send peeled produce to conventional; produce_bananas short_answer and kristy_take say "Conventional is fine". Bananas is the most visible: the headline now says organic and the card body under it still says conventional is fine.
- The Q1 cards' own detail and sources (EWG Clean Fifteen on carrots, cabbage, cauliflower, onions, mushrooms, bananas; USDA PDP peel-off on citrus) argue the old call; organic on them rests on Devon's Q1 A ruling, the hub and label_organic_scope material, and 7 CFR 205.105. No new source is cited.
- sprouts_raw organic is backed only by the hub/label material; no sprout-specific organic source was grepped.
- label_organic_scope is in the batch and unchanged: its decision already names organic with no "conventional", and its tips[1] already names the standard.
- matchItemToCard was not executed by the planner (no Bash). The C9 risks are "Organic strawberries or blueberries" (needs blueberry/blueberries on berries_picking), "Organic frozen vegetables" (must reach frozen, not the hub's "organic vegetables"), and "Organic carrots and potatoes" (needs potato on root vegetables). If C9 is red on one of them, report it; do not add aliases.
- The acceptance test's import paths (`../../lib/testGuards.js`, `../../lib/listMatch.js`) and the `matchItemToCard` return shape were written from the scout notes, not re-read. Check them against cleanPick1.test.js lines 1–12 before `dv check`.
- No tests were run while writing this spec.

## Contract

```json
{
  "criteria": [
    {
      "id": "C1",
      "impl": [
        "server/kristy_perimeter_kb.json"
      ],
      "tests": [
        "server/test/acceptance/cleanPick2.test.js"
      ],
      "dependents": [
        "server/test/acceptance/twoLinePin.js",
        "server/test/acceptance/k5.test.js",
        "server/test/acceptance/ic3b.test.js",
        "server/test/acceptance/w2.test.js",
        "server/test/acceptance/ca-4b.test.js",
        "server/test/acceptance/ca-7.test.js",
        "server/test/acceptance/w4.test.js",
        "server/test/acceptance/passRule.js"
      ],
      "reads": [
        "git show 74237ce:server/kristy_perimeter_kb.json"
      ],
      "expect": "17 ids equal BECAME; all else equals 74237ce"
    },
    {
      "id": "C2",
      "impl": [
        "server/kristy_perimeter_kb.json"
      ],
      "tests": [
        "server/test/acceptance/cleanPick2.test.js"
      ],
      "dependents": [
        "server/test/perimeter.test.js",
        "server/scripts/twoLineCheck.js"
      ],
      "reads": [],
      "expect": "decision <=10 words, cart <=46 chars, twoLineCheck 0 of 181"
    },
    {
      "id": "C3",
      "impl": [
        "server/kristy_perimeter_kb.json"
      ],
      "tests": [
        "server/test/acceptance/cleanPick2.test.js"
      ],
      "dependents": [
        "server/lib/counterCards.js"
      ],
      "reads": [],
      "expect": "tips[0] a why, tips[1] names organic"
    },
    {
      "id": "C4",
      "impl": [
        "server/kristy_perimeter_kb.json"
      ],
      "tests": [
        "server/test/acceptance/cleanPick2.test.js"
      ],
      "dependents": [],
      "reads": [
        "git show 74237ce:server/kristy_perimeter_kb.json"
      ],
      "expect": "no BANNED word in new text except synthetic in the hub narrowing"
    },
    {
      "id": "C5",
      "impl": [
        "server/kristy_perimeter_kb.json"
      ],
      "tests": [
        "server/test/acceptance/cleanPick2.test.js"
      ],
      "dependents": [],
      "reads": [
        "git show 74237ce:server/kristy_perimeter_kb.json"
      ],
      "expect": "all 17 name organic; outside unchanged"
    },
    {
      "id": "C6",
      "impl": [
        "server/kristy_perimeter_kb.json"
      ],
      "tests": [
        "server/test/acceptance/cleanPick2.test.js"
      ],
      "dependents": [],
      "reads": [
        "git show 74237ce:server/kristy_perimeter_kb.json"
      ],
      "expect": ">=190 outside entries deepEqual base"
    },
    {
      "id": "C7",
      "impl": [
        "docs/do-lines-review.md",
        "server/lib/doLines.json"
      ],
      "tests": [
        "server/test/acceptance/cleanPick2.test.js"
      ],
      "dependents": [
        "server/scripts/buildDoLines.js",
        "server/test/acceptance/ic3b.test.js"
      ],
      "reads": [
        "git show 74237ce:docs/do-lines-review.md",
        "git show 74237ce:server/lib/doLines.json"
      ],
      "expect": "10 headline cells moved, do cells and json unchanged"
    },
    {
      "id": "C8",
      "impl": [
        "server/kristy_perimeter_kb.json"
      ],
      "tests": [
        "server/test/acceptance/cleanPick2.test.js"
      ],
      "dependents": [],
      "reads": [
        "git show 74237ce:server/kristy_perimeter_kb.json"
      ],
      "expect": "every base tip kept or demoted into detail"
    },
    {
      "id": "C9",
      "impl": [
        "server/kristy_perimeter_kb.json"
      ],
      "tests": [
        "server/test/acceptance/cleanPick2.test.js"
      ],
      "dependents": [
        "server/lib/listMatch.js",
        "server/scripts/listMatchProbe.js"
      ],
      "reads": [],
      "expect": "each cart_pick matches its own id"
    },
    {
      "id": "C10",
      "impl": [
        "server/kristy_perimeter_kb.json"
      ],
      "tests": [
        "server/test/acceptance/cleanPick2.test.js"
      ],
      "dependents": [],
      "reads": [],
      "expect": ">=30 new strings, none on more than 2 entries"
    },
    {
      "id": "C11",
      "impl": [
        "server/kristy_perimeter_kb.json"
      ],
      "tests": [
        "server/test/acceptance/cleanPick2.test.js"
      ],
      "dependents": [
        "server/test/acceptance/ic3b.test.js"
      ],
      "reads": [],
      "expect": "no batch decision contains conventional"
    }
  ],
  "env": {
    "executables": [
      "node",
      "npm",
      "git"
    ],
    "browsers": [],
    "temp": "none",
    "network": false
  }
}
```

## Answers

- Suite runtime: `npm test` is the full server suite (2843 at base); run it once at the end.
- Allowed reads: the files in owns and read_full, `server/lib/counterCardLint.js`, `server/lib/counterCards.js`, `server/lib/listMatch.js`, and `git show 74237ce:<path>`.
- If a lint in k5/k14/ic3b goes red on a BECAME string, change only that string to the nearest wording that passes, keep its role (why / standard / headline), and list the change in the report. Never loosen a lint.

## Tried and rejected

- "Organic produce" / "Organic fruit" carts: the hub owns those aliases, so C9 would route them to the hub, and the plan requires item-named carts.
- Rewriting short_answer/kristy_take on hub and bananas now: that is a depth rewrite, out of scope per the plan non-goal; recorded in Ship notes.
- Changing label_organic_scope: it already meets C1/C3/C5/C11; changing it would only add churn.

## Acceptance server/test/acceptance/cleanPick2.test.js

```js
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
const base = JSON.parse(git('74237ce:server/kristy_perimeter_kb.json'));
const find = (k, id) => k.entries.find((e) => e.id === id);
const live = (id) => find(kb, id);
const was = (id) => find(base, id);
const words = (s) => s.trim().split(/\s+/).length;

const NEW_TIPS = {
  organic_worth_it_by_type: [[1, 'The USDA Organic seal on the sign or sticker is the standard to read.']],
  frozen_vs_fresh_produce: [[1, 'Frozen organic bags carry the same USDA Organic seal and rules as fresh.']],
  produce_seasonality: [[1, 'In-season organic produce carries the USDA Organic seal, fresh or frozen.']],
  sprouts_raw: [[1, 'Sprouts are eaten raw and whole, so the USDA Organic seal is the standard here.']],
  berries_picking: [[1, 'Berries are eaten whole, so the USDA Organic seal on the clamshell is the standard.']],
  produce_leafy_greens: [[1, 'Leaves are eaten whole, so the USDA Organic seal is the standard for greens.']],
  produce_peppers: [[1, 'The skin gets eaten, so the USDA Organic seal is the standard for peppers.']],
  produce_apples_pears: [[1, 'Apples and pears are eaten skin-on, so the USDA Organic seal is the standard.']],
  produce_stone_fruit: [[1, 'Stone fruit is eaten skin-on, so the USDA Organic seal is the standard here.']],
  produce_green_beans: [[1, 'The whole pod gets eaten, so the USDA Organic seal is the standard for beans.']],
  produce_root_vegetables: [[0, 'Potatoes rank high for residue in USDA testing, and the skin often gets eaten.'], [1, 'The USDA Organic seal on the bag is the standard for potatoes and carrots.']],
  produce_brassicas: [[0, 'Florets and leaves are eaten whole, with no peel to take surface residue away.'], [1, 'The USDA Organic seal is the standard for broccoli, cauliflower and cabbage.']],
  produce_onions_garlic: [[1, 'Organic onions and garlic are grown and certified to the USDA Organic standard.']],
  produce_citrus: [[1, 'Organic citrus carries the USDA Organic seal, which covers the peel used for zest.']],
  produce_mushrooms: [[1, 'Organic mushrooms carry the USDA Organic seal, loose or packed.']],
  produce_bananas: [[1, 'Organic bananas are grown and certified to the USDA Organic standard.']],
  label_organic_scope: [],
};

// Base tips that leave buying_tips and move, verbatim and in this order, to the end of detail.
const DROPPED = {
  organic_worth_it_by_type: [2, 3],
  produce_root_vegetables: [0],
  produce_brassicas: [0],
};
// Old tier notes that move to the end of detail, after any dropped tips.
const NOTE_DEMOTED = ['produce_root_vegetables', 'produce_brassicas', 'produce_onions_garlic', 'produce_citrus', 'produce_mushrooms', 'produce_bananas'];

const BECAME = {
  organic_worth_it_by_type: { decision: 'Organic produce, first on everything eaten skin-on.' },
  frozen_vs_fresh_produce: { decision: 'Plain organic frozen produce, picked ripe and frozen within hours.', cart_pick: 'Organic frozen vegetables' },
  produce_seasonality: { decision: 'Organic in-season produce, or frozen when it is out of season.' },
  sprouts_raw: { decision: 'Organic sprouts from the cold case, white roots, crisp stems.', cart_pick: 'Organic broccoli sprouts' },
  berries_picking: { cart_pick: 'Organic strawberries or blueberries' },
  produce_leafy_greens: { cart_pick: 'Organic spinach, kale, or lettuce' },
  produce_peppers: { cart_pick: 'Organic bell peppers' },
  produce_apples_pears: { cart_pick: 'Organic apples or pears' },
  produce_stone_fruit: { cart_pick: 'Organic peaches, plums, or cherries' },
  produce_green_beans: { cart_pick: 'Organic green beans' },
  produce_root_vegetables: {
    decision: 'Organic potatoes and carrots, firm, with nothing soft or sprouting.',
    cart_pick: 'Organic carrots and potatoes',
    tier_note: 'USDA testing ranks potatoes high for residue, and organic is the certified standard for both roots.',
  },
  produce_brassicas: {
    decision: 'Organic broccoli, cauliflower and cabbage, tight heads, no soft spots.',
    cart_pick: 'Organic broccoli, cauliflower, or cabbage',
    tier_note: 'Broccoli and cabbage are eaten without a peel, and organic heads are certified to the USDA standard.',
  },
  produce_onions_garlic: {
    decision: 'Organic onions and garlic, firm, with a dry neck.',
    cart_pick: 'Organic onions and garlic',
    tier_note: 'Onions and garlic grown to the USDA Organic standard carry the seal, papery skin and all.',
  },
  produce_citrus: {
    decision: 'Organic oranges, lemons and limes, firm with a smooth rind.',
    cart_pick: 'Organic oranges, lemons, or limes',
    tier_note: 'Zest goes in whole, and organic citrus is certified to the USDA Organic standard.',
  },
  produce_mushrooms: {
    decision: 'Organic mushrooms, dry and firm, with no dark spots.',
    cart_pick: 'Organic mushrooms',
    tier_note: 'Mushrooms get eaten whole, cap and stem, and organic ones carry the USDA Organic seal.',
  },
  produce_bananas: {
    decision: 'Organic bananas, green, to finish ripening on the counter.',
    cart_pick: 'Organic green bananas',
    tier_note: 'Organic bananas are certified to the USDA Organic standard and finish ripening on the counter the same way.',
  },
  label_organic_scope: {},
};

const NARROWED = 'Grown to the National Organic Program rules and certified, with synthetic pesticides outside an approved list. Not pesticide-free: copper, spinosad and pyrethrins are approved organic ones.';

const IDS = Object.keys(BECAME);
const CARRY = {
  organic_worth_it_by_type: 'organic produce',
  frozen_vs_fresh_produce: 'organic frozen',
  produce_seasonality: 'organic in-season',
  sprouts_raw: 'organic sprouts',
  berries_picking: 'organic strawberries',
  produce_leafy_greens: 'organic spinach',
  produce_peppers: 'organic bell peppers',
  produce_apples_pears: 'organic apples',
  produce_stone_fruit: 'organic peaches',
  produce_green_beans: 'organic green beans',
  produce_root_vegetables: 'organic potatoes',
  produce_brassicas: 'organic broccoli',
  produce_onions_garlic: 'organic onions',
  produce_citrus: 'organic oranges',
  produce_mushrooms: 'organic mushrooms',
  produce_bananas: 'organic bananas',
  label_organic_scope: 'organic thin-skinned',
};
const DECISION_CHANGED = IDS.filter((id) => BECAME[id].decision);
const BANNED = /\b(health|healthy|healthier|safer|risk|cancer|disease|toxic|toxin|detox|pesticide-free|synthetic|price|cost|cheap|expensive)\b/i;

// Expected values computed from 74237ce plus the literals above.
function expected(id) {
  const b = structuredClone(was(id));
  const kept = b.buying_tips.filter((_, i) => !(DROPPED[id] || []).includes(i));
  for (const [at, s] of NEW_TIPS[id]) kept.splice(at, 0, s);
  const parts = (DROPPED[id] || []).map((i) => b.buying_tips[i]);
  if (NOTE_DEMOTED.includes(id)) parts.push(b.tier_note);
  const e = { ...b, ...BECAME[id], buying_tips: kept };
  if (parts.length) e.detail = `${b.detail} ${parts.join(' ')}`;
  if (id === 'organic_worth_it_by_type') {
    e.labels_decoded = structuredClone(b.labels_decoded);
    e.labels_decoded[0].meaning = NARROWED;
  }
  return e;
}

// Every string that is new at 74237ce, with the detail slice that was appended.
function written(id) {
  const b = was(id);
  const l = live(id);
  const out = [];
  for (const f of ['decision', 'cart_pick', 'tier_note']) if (l[f] && l[f] !== b[f]) out.push(l[f]);
  for (const t of l.buying_tips) if (!b.buying_tips.includes(t)) out.push(t);
  if (l.detail !== b.detail && l.detail.startsWith(b.detail)) out.push(l.detail.slice(b.detail.length));
  return out;
}

const idOf = (r) => (typeof r === 'string' ? r : r?.id ?? r?.perimeterId ?? r?.card?.id ?? r?.entry?.id);

nonEmpty(IDS, 'IDS', 17);

test('C1 the 17 B2 ids equal their final values; every other field is unchanged; the carrying phrase is present', () => {
  for (const id of IDS) {
    assert.ok(live(id), `${id} missing`);
    assert.deepEqual(live(id), expected(id), id);
    const l = live(id);
    const text = `${l.decision} ${l.cart_pick || ''}`.toLowerCase();
    assert.ok(text.includes(CARRY[id]), `${id} lacks "${CARRY[id]}"`);
  }
});

test('C2 decisions are at most 10 words and carts at most 46 characters', () => {
  for (const id of IDS) {
    const l = live(id);
    assert.ok(words(l.decision) <= 10, `${id} decision ${words(l.decision)} words`);
    if (l.cart_pick) assert.ok(l.cart_pick.length <= 46, `${id} cart ${l.cart_pick.length} chars`);
  }
});

test('C3 tips[0] is a why, not an imperative or the decision; tips[1] names organic', () => {
  for (const id of IDS) {
    const t = live(id).buying_tips;
    assert.doesNotMatch(t[0], /^(choose|pick|buy|read|check|look|skip|compare)\b/i, id);
    assert.notEqual(t[0], live(id).decision, id);
    assert.match(t[1], /organic/i, id);
  }
});

test('C4 no new text carries a banned word, first person, an em dash or a straight apostrophe', () => {
  const all = IDS.flatMap(written);
  nonEmpty(all, 'written', 30);
  for (const s of all) {
    assert.doesNotMatch(s, BANNED, s);
    assert.doesNotMatch(s, /\b(I|me|my|mine)\b/, s);
    assert.ok(!s.includes('—'), s);
    assert.ok(!s.includes("'"), s);
  }
  const m = live('organic_worth_it_by_type').labels_decoded[0].meaning;
  assert.equal(m, NARROWED);
  assert.doesNotMatch(m.replace(/\bsynthetic\b/, ''), BANNED);
});

test('C5 every B2 id names organic; outside the batch organic presence is unchanged', () => {
  const has = (e) => /organic/i.test(`${e.decision} ${e.cart_pick || ''}`);
  for (const id of IDS) assert.ok(has(live(id)), id);
  for (const e of kb.entries) if (!IDS.includes(e.id)) assert.equal(has(e), has(was(e.id)), e.id);
});

test('C6 entries outside the batch deepEqual 74237ce', () => {
  const others = kb.entries.filter((e) => !IDS.includes(e.id));
  nonEmpty(others, 'others', 190);
  assert.equal(kb.entries.length, base.entries.length);
  for (const e of others) assert.deepEqual(e, was(e.id), e.id);
});

test('C7 doLines.json unchanged; review headlines move only on decision-changed ids', () => {
  const now = JSON.parse(readFileSync(new URL('../../lib/doLines.json', import.meta.url), 'utf8'));
  assert.deepEqual(now, JSON.parse(git('74237ce:server/lib/doLines.json')));
  const rows = (txt) => new Map(txt.split('\n').filter((l) => l.startsWith('| `')).map((l) => [l.split('`')[1], l]));
  const liveRows = rows(readFileSync(new URL('../../../docs/do-lines-review.md', import.meta.url), 'utf8'));
  const baseRows = rows(git('74237ce:docs/do-lines-review.md'));
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

test('C8 every base tip is kept or demoted into detail', () => {
  for (const id of IDS) {
    const l = live(id);
    was(id).buying_tips.forEach((t, i) => {
      if ((DROPPED[id] || []).includes(i)) assert.ok(l.detail.includes(t), `${id} dropped tip ${i} not in detail`);
      else assert.ok(l.buying_tips.includes(t), `${id} lost tip ${i}`);
    });
  }
});

test('C9 each cart pick matches its own card', async () => {
  const carts = IDS.filter((id) => live(id).cart_pick);
  nonEmpty(carts, 'carts', 15);
  for (const id of carts) {
    const got = idOf(await matchItemToCard(live(id).cart_pick));
    assert.equal(got, id, `${live(id).cart_pick} -> ${got}`);
  }
});

test('C10 no new string sits on more than 2 entries', () => {
  const fresh = IDS.flatMap((id) => {
    const b = was(id);
    const l = live(id);
    const out = [];
    for (const f of ['decision', 'cart_pick', 'tier_note']) if (l[f] && l[f] !== b[f]) out.push(l[f]);
    for (const t of l.buying_tips) if (!b.buying_tips.includes(t)) out.push(t);
    return out;
  });
  nonEmpty(fresh, 'fresh', 30);
  for (const s of fresh) {
    const n = kb.entries.filter((e) => [e.decision, e.cart_pick, e.tier_note, ...(e.buying_tips || [])].includes(s)).length;
    assert.ok(n <= 2, `${s} on ${n} entries`);
  }
});

test('C11 no B2 decision says conventional', () => {
  for (const id of IDS) assert.doesNotMatch(live(id).decision, /conventional/i, id);
});
```
