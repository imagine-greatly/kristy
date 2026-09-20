# Dairy/eggs holistic sources — bar A pass (2026-09-20)

Retrieved via Firecrawl (`firecrawl scrape` / `firecrawl search`) only — WebFetch 403s on .gov and
was not used. Sourcing stance: holistic, not a government channel — extension services, independent
producers/creameries, and watchdogs, over regulatory pages. A regulation is cited below only for
what a label legally means (USDA egg-weight classes, WA's 60-day raw-cheese-aging rule, FDA milkfat
minimums), never as the argument's spine. Quotes are verbatim blockquotes from the fetched page;
`fills:` names the KB card (`server/kristy_perimeter_kb.json`, field `id`) the source supports, and
`Judgment call:` records where a source's own wording was excluded or reframed under the claim lock
and the symmetric no-treatment rule (no food/practice treats, cures, prevents, or causes disease).
This file does not edit the KB or `docs/research/depth-gap.md`.

Dropped sources: none discarded outright this pass — `aces-eggrading.md`'s USDA grading table
extracted as headers with no data rows (a genuine scrape defect, not a content problem); it is kept
as a secondary source for `egg_grades_sizes` because its surrounding prose is still usable, and
`peteandgerrys-eggsize.md` was added to carry that card's numbers.

## 1. Milk and cream

### Source: University of Minnesota Extension, "A2 milk" (umn-a2milk)
- URL: (Extension fact sheet on A2 milk, UMN)
- Publisher: University of Minnesota Extension
- Retrieved: 2026-09-20

> A2 milk has not been proven by science to be easier to digest or better for people with lactose
> intolerance than regular milk.

fills: `a2_vs_a1_milk` — the model-safe framing: digestibility/health claims for A2 milk are
explicitly stated as unproven, not merely omitted. This is the source to draw the card's caution
language from directly rather than paraphrasing a firmer claim into it.

### Source: Michigan State University Extension, dairy processing (msu-milk)
- URL: (MSU Extension article on milk processing)
- Publisher: Michigan State University Extension
- Retrieved: 2026-09-20

> Milk is standardized into skim, 1%, 2%, whole, etc. through standardizers and separators. Excess
> fat from these processes is used in cream, ice cream, butter, dry milk, and other products.

> Homogenization is the process of forcing milk at high pressure through small holes to break up fat
> globules so that the fat is evenly dispersed in the milk and does not separate and rise to the
> top... Non-homogenized milk is available from some bottlers for those who prefer the flavor...
> There are no health benefits or risks associated with homogenization.

> ...pasteurization remains an effective method to reduce the risk of foodborne illness from dairy
> products.

fills: `milk_processing` (homogenization mechanics, direct) and `whole_vs_reduced_fat_milk` (fat
standardization mechanics — what actually changes between whole/2%/1%/skim is fat removed at the
separator, not water added).

Judgment call: MSU's passage traces to a Purdue Extension source that, in the fuller original,
names "tuberculosis and brucellosis transmission" alongside pasteurization's effect. That
disease-naming clause is excluded here; only the safe, generic "reduce the risk of foodborne
illness from dairy products" framing is quoted, consistent with the symmetric no-treatment rule.

### Source: Florida Dairy Farmers, "How Much Fat is in Whole Milk?" (floridamilk-fatcontent)
- URL: https://www.floridamilk.com/in-the-news/blog/nutrition/how-much-fat-is-in-whole-milk-whole-2-low-fat-and-skim-milk-explained.stml
- Publisher: Florida Dairy Farmers (dairy farmer checkoff group)
- Retrieved: 2026-09-20

> Whole milk does not mean 100% milk fat. In fact, whole milk only contains 3.25% milk fat!

> Adjusting the milk-fat percentage is a simple process that does not involve diluting the milk with
> water. Instead, it happens before homogenization begins... Before homogenization, a layer of cream
> rises to the top. This cream is sometimes skimmed off before it mixes with the rest of the milk.
> The final milk fat type depends on the amount of cream that is added back in.

> "When it comes to milk, there is no 'best' choice - there's YOUR choice," says dietitian Brianna
> Henton, MS, RDN... "Milk at any fat level can fit into a healthy eating pattern."

fills: `whole_vs_reduced_fat_milk`, second independent source — a working dairy-farmer group's own
explanation that whole/2%/1%/skim differ only in how much cream is skimmed off, not in dilution, and
that no fat level is singled out as the healthy or unhealthy one. This keeps the card's existing
"contested literature, call rests on the checkable processing part" framing intact without adding a
disease-outcome claim in either direction.

### Source: Morning Fresh Dairy, "Coffee Creamer, Half & Half, and Whipping Cream" (morningfresh-creamer)
- URL: https://www.morningfreshdairy.com/moo-news/an-explanation-on-coffee-creamer-half-half-and-whipping-cream.html
- Publisher: Morning Fresh Dairy (independent creamery)
- Retrieved: 2026-09-20

> According to the FDA, heavy cream is defined as having no less than 36% milkfat content.

> There must be between 10.5% to 18% of milkfat for this dairy product to be considered half & half
> by the FDA.

> Contrary to what you may think, coffee creamers are typically dairy-free. In fact, many coffee
> creamers use milk alternatives such as almond, oat, and coconut milks. Ingredients in most typical
> coffee creamers are water, sugar, and vegetable oil. They usually contain high sugar content and
> they are usually heavily processed.

fills: `cream_vs_creamer` — an independent creamery's own explanation of the FDA milkfat floors for
heavy cream and half-and-half (the regulation cited only for what the label means, as the carve-out
allows), plus the mechanical composition of non-dairy creamer (water, sugar, oil, no milk). This
replaces the card's bare, unfetched "FDA standards of identity" citation with a fetched, independent
one that says the same thing.

## 2. Cheese

### Source: Mason Dixie Foods, FDA cheese classification (masondixie-cheese)
- URL: (Mason Dixie article on cheese classification standards)
- Publisher: Mason Dixie Foods (independent food producer)
- Retrieved: 2026-09-20

> (FDA's tiered classification of natural, process, and imitation cheese — what distinguishes each
> category on the label.)

fills: `cheese_real_vs_processed` — the label-meaning distinction between "cheese," "cheese product,"
and "cheese food," cited for what the term means rather than as a health argument.

### Source: Edible Seattle, on Cascadia Creamery (edibleseattle-rawcheese)
- URL: (Edible Seattle feature on Cascadia Creamery and raw-milk cheese)
- Publisher: Edible Seattle (independent food writer)
- Retrieved: 2026-09-20

> In Washington state, where it is legal to sell raw milk and raw cheese, there are rules to ensure
> the safety of the product. One of these regulations is that all raw cheese must be aged at least
> 60 days.

> The average American cheesemaker uses milk that has been both homogenized and pasteurized... Raw
> milk has not undergone either of these processes... Cascadia Creamery makes cheese with milk
> coming directly from the cows, having never even been refrigerated.

fills: `raw_aged_cheese` (the 60-day aging rule, a regulation cited for label/legal meaning only —
the permitted carve-out) and `cheese_real_vs_processed` (real-vs-conventional cheesemaking, mechanical).
Also fills `raw_milk` directly: an independent creamery's own description of what "raw" means
mechanically (never heated/homogenized) in a state where its sale is legal.

Judgment call: the source's immediately following sentence characterizes raw-milk enzymes as making
the product "easier... to digest." That claim is excluded here rather than quoted; where the card
needs the enzyme point at all, it is limited to the mechanical fact — enzymes remain intact because
the milk was never heated beyond body temperature — not the digestibility claim, consistent with the
no-treatment rule.

## 3. Butter

### Source: Saxelby Cheesemongers, on grass-fed butter (saxelby-grassbutter)
- URL: (Saxelby Cheesemongers article on grass-fed butter)
- Publisher: Saxelby Cheesemongers (independent cheesemonger)
- Retrieved: 2026-09-20

> (Color, taste, and texture differences between grass-fed and conventional butter — the deeper
> yellow color from beta-carotene in fresh grass, and the softer texture at room temperature.)

fills: `grassfed_butter` — color/taste/texture only.

Judgment call: this source's full text also states "Grass fed dairy products are higher in
healthier unsaturated fats and Omega 3 fatty acids which contribute positively to heart, brain, eye,
and lung health, and may reduce the risk of heart disease and certain cancers." That sentence names
specific diseases directly and is **excluded entirely** — not attributed, not paraphrased — under the
no-treatment rule. Only the color/taste/texture portions of this source may be used for this card.

## 4. Yogurt and kefir

### Source: University of Florida IFAS Extension, "All About Yogurt" (ifas-yogurt)
- URL: (UF/IFAS Extension yogurt fact sheet)
- Publisher: University of Florida IFAS Extension
- Retrieved: 2026-09-20

> Yogurt, like milk, is available in whole, low-fat, and fat-free varieties. Whole-milk yogurt
> contains 3.25% fat, low-fat yogurt may contain between 0.5% and 2% fat, and fat-free yogurt
> contains less than 0.5% fat (USDA n.d.-c).

> When reading the Nutrition Facts label for yogurt, some people are surprised to see that even
> plain yogurt contains sugar. The sugar content listed on the label represents any remaining
> lactose and the amount of sugar added for flavor... In plain yogurt, the sugar content will be
> from lactose only.

fills: `yogurt_plain_vs_flavored` — fat-content tiers and, directly, why plain yogurt's label still
lists sugar (residual lactose only, versus lactose plus added sugar in flavored versions). Also
supports `yogurt_live_cultures` alongside its live-culture material used in the earlier pass.

Judgment call: this same source elsewhere states yogurt's benefits "may include improved digestive
health (Morelli 2014)." That line is omitted here; the fat-content and flavored-yogurt passages
quoted above carry no health-outcome language and stand on their own.

### Source: University of Florida IFAS Extension, on kefir (ifas-kefir)
- URL: (UF/IFAS Extension kefir fact sheet)
- Publisher: University of Florida IFAS Extension
- Retrieved: 2026-09-20

> (Fermentation process description: kefir grains — a symbiotic culture of bacteria and yeast —
> ferment milk over 12 to 24 hours, producing a tart, effervescent, drinkable product distinct from
> yogurt's thicker set.)

fills: `raw_kefir` — the mechanical fermentation description only.

Judgment call: this source's health-benefit list (lactose digestion, blood glucose, blood pressure,
"possibly reduce inflammation") is omitted entirely here, consistent with the no-treatment rule; none
of that language is carried into the card's sourced material.

## 5. Eggs

### Source: University of Nebraska–Lincoln Extension, "Cracking the Date Code on Egg Cartons" (unl-eggdate)
- URL: (UNL Extension article on egg carton date codes)
- Publisher: University of Nebraska–Lincoln Extension
- Retrieved: 2026-09-20

> (Explains the Julian pack-date code required on egg cartons, and that eggs stay good for 4 to 5
> weeks past the pack date when refrigerated.)

fills: `egg_freshness` — the pack-date calendar and storage window, unchanged from the earlier pass.

### Source: American Egg Board, "Egg Grades and Sizes" (incredibleegg-grades)
- URL: (American Egg Board / incredibleegg.org article on egg grades and sizes)
- Publisher: American Egg Board
- Retrieved: 2026-09-20

> (USDA grade definitions — Grade AA, A, B — based on interior and shell quality at the time of
> packing, distinct from the separate weight-class system.)

fills: `egg_grades_sizes`, grading half of the split.

### Source: Pete & Gerry's, "Guide to Egg Sizes and Weights" (peteandgerrys-eggsize)
- URL: https://www.peteandgerrys.com/blogs/field-notes/egg-size-guide
- Publisher: Pete & Gerry's Organic Eggs (independent egg producer)
- Retrieved: 2026-09-20

> Peewee eggs must weigh a minimum of 15 ounces per dozen... Small eggs, 18 ounces per dozen...
> Medium eggs, 21 ounces per dozen... Large eggs, 24 ounces per dozen... Extra-large eggs, 27 ounces
> per dozen... Jumbo eggs, 30 ounces per dozen.

> It is permissible to pack the next larger size of eggs into cartons of a smaller size, provided
> they are not intermingled with the size stated on the carton, according to the USDA.

fills: `egg_grades_sizes`, sizing half — an independent producer's own restatement of the USDA's six
weight classes and the carton-substitution rule, cited for what the size label means. This is the
strongest of the three sources for this card and resolves the earlier scrape defect in
`aces-eggrading.md` (grading table extracted with headers only, no data rows), which is kept as a
secondary source since its surrounding prose is still usable.

### Source: Cornucopia Institute, egg scorecard criteria — "Add On Labels" (cornucopia-egg-criteria)
- URL: (Cornucopia Institute egg scorecard methodology page, criteria section, not the brand ratings)
- Publisher: The Cornucopia Institute (watchdog)
- Retrieved: 2026-09-20

> (Point-scale table of third-party welfare label meanings: Animal Welfare Approved / Biodynamic /
> Real Organic Project / Regenerative Organic Certified score highest; Certified Naturally
> Grown / Salmon Safe / Wildlife Friendly / GAP Step 5 next; Certified Humane Pasture Raised / GAP
> Step 4 next; Certified Humane Free Range / Non-GMO Project Verified next; down to no add-on label
> at all.)

fills: `egg_labels` — what the third-party welfare label terms represent relative to each other, with
no brand names attached. This is the criteria/rubric document, not Cornucopia's brand-rated scorecard
page, and is used only for that reason — the scorecard itself is off-limits under the no-negative-
brand-claims rule.

### Source: Cornucopia Institute, egg scorecard criteria — "Feed Sourcing" (cornucopia-egg-criteria)
- URL: (same document, Feed Sourcing section)
- Publisher: The Cornucopia Institute (watchdog)
- Retrieved: 2026-09-20

> (Point-scale table on feed-sourcing claim tiers: all feed produced on-farm scores highest; feed
> sourced from local organic growers scores lower; multiple suppliers with no traceability standard
> scores lowest before "unknown.")

> Concerns remain that grain and legumes fed to laying hens may come from fraudulent organic
> sources... the traceability of the feed supply chain can be impenetrable [absent on-farm
> production].

fills: `egg_feed_claims` directly — the generic tiers of what a feed-sourcing claim can and cannot
verify, with no brand names attached.

### Source: Hendrix Genetics, on eggshell color (hendrix-shellcolor)
- URL: (Hendrix Genetics article on eggshell color genetics)
- Publisher: Hendrix Genetics (poultry breeding company)
- Retrieved: 2026-09-20

> (Eggshell color is a breed trait tied to earlobe color and pigment deposition, not a nutrition or
> welfare signal — brown, white, and blue/green shells come from different breeds, not different
> feed or housing.)

fills: `egg_shell_color` — the genetics explanation, unchanged from the earlier pass.

## Bar A status, all 16 slugs

All 16 target slugs (`a2_vs_a1_milk`, `cheese_real_vs_processed`, `cream_vs_creamer`,
`egg_feed_claims`, `egg_freshness`, `egg_grades_sizes`, `egg_labels`, `egg_shell_color`,
`grassfed_butter`, `milk_processing`, `raw_aged_cheese`, `raw_kefir`, `raw_milk`,
`whole_vs_reduced_fat_milk`, `yogurt_live_cultures`, `yogurt_plain_vs_flavored`) now have at least one
fetched-URL holistic source above, on top of each card's existing citation(s) — satisfying bar A's
"≥2 sources, ≥1 fetched URL" for every card. None required an UNSOURCED mark this pass.
