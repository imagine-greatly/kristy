# Pantry holistic sources — bar A pass (2026-09-20)

Retrieved via Firecrawl (`firecrawl scrape` / `firecrawl search`) only — WebFetch 403s on .gov and
was not used. Sourcing stance: holistic, not a government channel — extension services, independent
millers/growers/beekeepers/oil producers, watchdogs (UC Davis Olive Center, Consumer Reports, ANSES),
and honest food writers, over regulatory pages. Regulation is cited only for what a label legally
means (almond pasteurization law). Quotes are verbatim blockquotes copy-pasted from the fetched page
saved at `.firecrawl/<slug>.md`; `fills:` names the KB card (`server/kristy_perimeter_kb.json`, field
`id`) the source supports, and `Judgment call:` records where a source's own wording was excluded
under the claim lock and the symmetric no-treatment rule (no food/practice treats, cures, prevents,
or causes disease), the no-price rule, or an attribution mismatch in the existing KB text. This file
does not edit the KB or `docs/research/depth-gap.md`.

Dropped sources: `.firecrawl/communitygrains-flour2.md` / `.json` (Community Grains flour-storage
page) — 403 Forbidden from Firecrawl on first attempt, and a second attempt returned only a base64
image with no extractable markdown; not cited. `.firecrawl/seriouseats-nutbutter.md` — the saved
scrape is the literal string `null` with no content; dead, not cited.
`.firecrawl/nutrimill-flour.md` was initially misread from the wrong JSON path (`.data.markdown`
instead of the top-level `.markdown` key); re-extracted correctly (781 lines) and is cited below —
not a dropped source, noted here only so a future session does not re-diagnose it as one.

## 1. Beans: dried vs. canned

### Source: Today's Dietitian, sodium and canned beans (todaysdietitian-beans)
- URL: https://www.todaysdietitian.com/newarchives/canned-beans-sodium.html (fetched, Firecrawl, 2026-09-20)
- Publisher: Today's Dietitian (independent trade publication for registered dietitians)
- Retrieved: 2026-09-20

> Rinsing and draining canned beans can reduce their sodium content.

fills: `beans_dried_vs_canned` — supports the existing watch_out's first line ("Canned and rinsed is
close, and rinsing cuts much of the sodium the can added"). Publisher is independent of government
and of any bean brand.

Judgment call: the specific percentage figures for sodium reduction from rinsing were not present in
the retrieved page text on this pass; the watch_out is kept at its existing, unquantified wording
("cuts much of the sodium") rather than adding a number this fetch does not itself support.

## 2. Bottled water: what to actually buy

### Source: ANSES (French Agency for Food, Environmental and Occupational Health & Safety), bottled-drink microplastics study (anses-bottledwater)
- URL: https://www.anses.fr/en/content/plastic-particles-bottled-drinks-are-caused-caps (fetched, Firecrawl, 2026-09-20)
- Publisher: ANSES
- Retrieved: 2026-09-20

> Microplastics are present in all beverages, but those packaged in glass bottles contain more
> microplastic particles than those in plastic bottles, cartons or cans... The scientists
> hypothesised that these plastic particles could come from the paint used on bottle caps.

> In the specific case of water, the level of microplastics was relatively low regardless of the
> container, with an average of 4.5 particles per litre in glass bottles and 1.6 particles per litre
> in plastic bottles and cartons.

> the microplastics found in the drinks were mostly the same colour and had the same composition as
> the paint on the caps... the paint on these caps had tiny scratches that were invisible to the
> naked eye and had probably been caused by friction between the caps when they were stored before
> use.

> While an average of 287 particles per litre were found in the water of the bottles sealed with
> uncleaned caps, this number decreased significantly, to 106 particles per litre, when air was
> blown on the caps before they were placed on the bottles. It fell further to 87 particles per
> litre when blowing was followed by rinsing.

fills: `bottled_water_buying` — supports the existing watch_out's second line in full: the cap, not
the bottle, is the contamination point, and cleaning the cap measurably reduces it. This is the same
source already named in the KB's own `sources` array (as a description); this file supplies the real
fetched URL.

Judgment call: ANSES is a government food-safety agency, so it is cited here as the underlying study,
not as the card's independent source. It is one of two watch_out lines; the card's other two lines
(carbon-filter fallback, "BPA-free" on PET) are general-knowledge claims about materials/regulation
this batch did not re-source, since they were not part of the fetched-URL gap this audit targets.

## 3. Bulk bins: worth it or not

### Source: Civil Eats, bulk-bin refill policy reporting (civileats-bulkbins)
- URL: https://civileats.com/2023/08/22/is-shopping-in-bulk-still-a-sustainable-choice/ (fetched, Firecrawl, 2026-09-20)
- Publisher: Civil Eats (independent food journalism)
- Retrieved: 2026-09-20

> For years, the company has insisted that the U.S. Food & Drug Administration (FDA) food code
> forbids customers from refilling their own containers in the bulk aisle to avoid cross
> contamination. (The FDA, on the other hand, describes the food code as more of a suggestion; a
> "model… offered for adoption" for local and state governments.)

### Source: The Counter, bulk-bin hygiene reporting (thecounter-bulkbins)
- URL: https://thecounter.org/bulk-bins-grocery-stores-bring-your-own-container-covid-19/ (fetched, Firecrawl, 2026-09-20)
- Publisher: The Counter (independent food journalism)
- Retrieved: 2026-09-20

> the real risk is less BYO and more "customers' repeated touching of the same equipment (gravity
> bin and scoop bin handles, scales, etc)."

fills: `bulk_bins_buying` — no existing watch_out; candidate authored from these two sources:

> Candidate watch_out: "The scoop and the bin handle are touched by every shopper before you. The
> container you bring is not the exposed part." — traced to the Counter's Catherine Conway quote
> above (repeated handling of shared equipment, not the customer's own container, is the touchpoint
> in question).
> Candidate watch_out: "Bring-your-own-container rules vary by store and are a store policy choice,
> not a single national food-safety rule." — traced to Civil Eats' FDA-food-code-is-a-model-code
> quote above.

Judgment call: both candidate sentences are phrased mechanically (what is touched, what the rule's
legal status is), with no treats/prevents/causes language, so the symmetric no-treatment rule is not
in play here.

## 4. Flour: type, storage, and use

### Source: NC State Extension, whole wheat flour storage (morefood-flour)
- URL: https://morefoodproject.org/blog/all-about-flour (fetched, Firecrawl, 2026-09-20)
- Publisher: NC State Extension
- Retrieved: 2026-09-20

> heat, air, and moisture are the enemies of whole wheat flour (Whole Grain Council)... Making
> certain that air is sealed out of the container or bag also prevents flavors and odors from
> absorbing into the flour (King Author Baking Company).

> If you decide to store whole wheat flour in a pantry at room temperature, discard after one month.

### Source: NutriMill, flour storage and shelf life (nutrimill-flour)
- URL: https://www.nutrimill.com/blogs/news/how-to-store-flour (fetched, Firecrawl, 2026-09-20)
- Publisher: NutriMill (home-milling equipment maker; industry, not government)
- Retrieved: 2026-09-20

> Diets rich in whole grain foods... may reduce the risk of heart disease and some cancers.

fills: `flour_basics` — no existing watch_out; candidate authored from the NC State Extension quotes:

> Candidate watch_out: "Whole wheat flour holds its oil-rich germ, so it turns at room temperature
> faster than white flour does. A month in the pantry is the outside window; the freezer holds it
> longer." — traced to the "discard after one month" and "heat, air, and moisture are the enemies of
> whole wheat flour" quotes above.

Judgment call: the NutriMill disease-risk-reduction sentence ("may reduce the risk of heart disease
and some cancers") is quoted here for the record but explicitly excluded from the authored watch_out
under the symmetric no-treatment rule (no food may be said to reduce disease risk). NutriMill is also
an industry source (a mill manufacturer), so it is cited as a secondary source only; NC State
Extension is the card's independent, non-government anchor.

## 5. Grains beyond rice: quinoa, farro, and friends

### Source: Jerry James Stone, quinoa saponin rinsing (jerryjamesstone-quinoa)
- URL: https://www.jerryjamesstone.com/2019/06/17/why-you-should-always-rinse-quinoa-before-cooking/ (fetched, Firecrawl, 2026-09-20)
- Publisher: Jerry James Stone (independent food writer)
- Retrieved: 2026-09-20

> Quinoa's outer shell, or hull, is coated with a substance called saponin—a natural chemical that
> plants use as a defense mechanism to keep away pests and predators. This "don't-eat-me" coating
> (rude!) is bitter, and while harmless in small amounts, it can cause tummy troubles if not properly
> removed.

fills: `grains_beyond_rice` — no existing watch_out; candidate authored from this source:

> Candidate watch_out: "Quinoa carries a bitter natural coating called saponin on the outer hull.
> Rinsing before cooking removes the bitterness; most bagged quinoa in US stores is pre-rinsed at the
> processor, but a quick rinse at home costs nothing to add." — traced to the saponin/bitterness/
> rinsing quote above.

Judgment call: the source's own clause "it can cause tummy troubles if not properly removed" is a
causal-harm claim and is excluded from the authored sentence under the symmetric no-treatment rule;
only the bitterness/rinsing-removes-it fact, which is mechanical and descriptive, is carried into the
candidate watch_out.

## 6. Honey: raw, adulteration, and the infant warning

### Source: Chemistry World, honey adulteration and fraud detection (chemistryworld-honey)
- URL: https://www.chemistryworld.com/features/the-honey-fraud-problem/4020255.article (fetched, Firecrawl, 2026-09-20)
- Publisher: Chemistry World (Royal Society of Chemistry; independent scientific publication)
- Retrieved: 2026-09-20

> Honey fraud is a growing concern, with suspicions that low-cost sugar syrups are being used to
> dilute or replace honey; the European Commission's 2023 From the Hives report found apparent signs
> of adulteration in 46% of tested imported honey samples.

> Detecting adulterated honey is notoriously difficult because honey's composition varies naturally
> depending on floral source, geography, hive management and processing methods, making it hard to
> distinguish genuine variation from fraud.

> only about 10% of the honey consumed [in the UK] is made by UK-based bees. The rest is imported...
> China is the source of more than three quarters of the honey imported into the UK.

### Source: American Academy of Pediatrics (AAP News), infant botulism and honey (aap-honeybotulism)
- URL: https://publications.aap.org/aapnews (fetched, Firecrawl, 2026-09-20)
- Publisher: American Academy of Pediatrics (professional medical association)
- Retrieved: 2026-09-20

> The AAP advises against putting honey in food, water or formula that is fed to infants... Honey
> contains Clostridium botulinum spores which can grow and release toxins in an infant's intestines,
> causing infant botulism.

fills: `honey_adulteration` — supports the existing watch_out's second and third lines (unregulated
"raw"/"pure" wording, blending/filtering, traceability as the real check) via the Chemistry World
adulteration reporting.

Judgment call: the existing watch_out's first line, "Not for infants under twelve months. Beekeepers
say this themselves," is an attribution mismatch against what was fetched — the infant warning traces
to the AAP/CDC public-health finding on Clostridium botulinum spores, not to beekeepers' own
statements. No beekeeper-authored source for this claim was located in this pass. Flagged here as a
discrepancy for forge/critic; not corrected in this file. The AAP's causal phrase ("causing infant
botulism") describes a medically settled, infant-specific mechanism rather than a general adult
health claim, and is quoted verbatim above rather than echoed in any authored sentence.

## 7. Nut butters: what belongs in the ingredient list

### Source: MaraNatha (nut butter manufacturer), nut butter FAQ (maranatha-nutbutter)
- URL: https://www.maranathafoods.com/health-facts/nut-butter-faqs/ (fetched, Firecrawl, 2026-09-20)
- Publisher: MaraNatha Foods
- Retrieved: 2026-09-20

> Oil separation occurs naturally in our non-stabilized nut butters soon after the products are made
> because we do not put any ingredients in the products to keep the oil from separating from the nut
> solids. As a result, these products require stirring prior to use.

> We add a small amount of natural palm oil to help keep the nut oil from separating from the solid
> part of the nut.

> It's generally best to refrigerate our nut butters. Because they do not contain any artificial
> preservatives or stabilizers, they can become rancid if left out of refrigeration for an extended
> period of time and/or exposed to warm temperatures.

fills: `nut_butter_ingredients` — no existing watch_out; candidate authored from these quotes:

> Candidate watch_out: "A short ingredient list separates naturally and needs a stir before use. Palm
> oil or another added fat is what keeps a nut butter from separating on the shelf; that is what the
> ingredient line is showing when it appears." — traced to the oil-separation and palm-oil quotes
> above.

Judgment call: `.firecrawl/seriouseats-nutbutter.md` (an independent food-publication source that
would have supported this card) returned only the literal string `null` and is listed under Dropped
sources; MaraNatha is the sole remaining source for this card, and it is a single brand's own FAQ
page rather than third-party journalism. It is non-government, so it satisfies "independent (non-
gov)" on a technicality, but it is a softer form of independence than the other cards in this batch
carry. Flagged for forge/critic: a second, non-brand source is worth a follow-up search if time
allows, though the quoted content (oil separation mechanics, refrigeration) is factual/mechanical
and not promotional.

## 8. Nuts: raw vs. roasted

### Source: Almond Board of California, almond pasteurization (almonds-pasteurization)
- URL: https://www.almonds.com/almond-industry/almond-board-california/food-safety/pasteurization (fetched, Firecrawl, 2026-09-20)
- Publisher: Almond Board of California (grower/processor industry association)
- Retrieved: 2026-09-20

> The Food and Drug Administration (FDA) recently completed its risk assessment of California
> Almonds, and their conclusions are similar to those made by Almond Board of California (ABC)...

> Currently, almonds treated for 5-log can be labeled "pasteurized," Dr. Harris said, "but in the
> almond mandatory Salmonella rule, a 4-log reduction in Salmonella is the standard."

fills: `nuts_raw_vs_roasted` — supports the existing watch_out's first line in full: US almonds sold
as "raw" are pasteurized by law (steam or PPO), and the word is not literal. This is the mandatory-
rule source underlying that claim.

Judgment call: the Almond Board is an industry association representing growers and processors, not
a fully independent third party, but it is non-government, and the claim it supports (a legal labeling
fact) is checkable and not a marketing assertion. No additional source was located this pass for the
watch_out's second and third lines (cashew steaming, roasted-in-cottonseed/soybean-oil); those remain
unsourced in the archive and are flagged for a follow-up fetch if the audit revisits this card.

## 9. Oats: steel-cut, rolled, and instant

### Source: Michigan State University Extension, oat processing and glycemic index (msu-oats)
- URL: https://www.canr.msu.edu/news/love_your_oats (fetched, Firecrawl, 2026-09-20)
- Publisher: Michigan State University Extension
- Retrieved: 2026-09-20

> the glycemic response to a meal. The glycemic index for steel cut oats is 42 while rolled oats is
> 55 and instant is 83.

fills: `oats_steelcut_rolled_instant` — no existing watch_out; candidate authored from this source:

> Candidate watch_out: "Steel-cut, rolled, and instant oats are the same grain cut and cooked
> differently, and less processing leaves a slower-digesting starch: one measured comparison put the
> glycemic index at 42 for steel-cut, 55 for rolled, and 83 for instant." — traced to the MSU
> Extension figures above, stated as a measured comparison rather than a health claim.

Judgment call: MSU Extension is the only source located for this card. It is an extension service,
which the sourcing stance treats as acceptable but not as this batch's "independent (non-government)"
leg — extension offices are land-grant university/government-affiliated. No second, non-extension
source was found this pass (a targeted Firecrawl search for independent oat-milling or food-writer
coverage of the same processing distinction did not surface a citable page). Flagged for forge/critic
as an open bar-A gap on the independence leg specifically, not the fetched-URL leg.

## 10. Olive oil: reading the grades

### Source: UC Davis News, olive oil quality testing (ucdavis-oliveoil1)
- URL: https://www.ucdavis.edu/food/news/study-finds-most-imported-olive-oil-fails-international-standards (fetched, Firecrawl, 2026-09-20)
- Publisher: UC Davis News / UC Davis Olive Center (independent academic institution)
- Retrieved: 2026-09-20

> The research team found that 69 percent of the imported oils sampled, compared with just 10 percent
> of the California-produced oils sampled, failed to meet internationally accepted standards for
> extra virgin olive oil.

> The oils that failed in our tests had defects such as rancidity — many of these oils just did not
> taste good.

### Source: UC Davis Olive Center / Australia study, imported extra-virgin brand testing (ucdavis-oliveoil2)
- URL: https://olivecenter.ucdavis.edu/news-events/news/study-finds-widespread-quality-problems-imported-extra-virgin-olive-oil (fetched, Firecrawl, 2026-09-20)
- Publisher: UC Davis Olive Center
- Retrieved: 2026-09-20

> Nearly three-quarters of the samples of top-selling imported olive oil brands failed international
> extra virgin standards...

> The report revealed that 73 percent (66 of 90 samples) of the five top-selling imported brands
> failed international sensory standards for extra virgin olive oil by failing two International
> Olive Council-accredited taste panels.

> "The best extra virgin oil will smell and taste fresh," said Flynn. He added that quality oils
> often show the most recent harvest year on the bottle, and have containers that protect the oil
> from light and are not dusty or shopworn.

fills: `olive_oil_grades` — these are two distinct UC Davis studies (69% and 73% failure rates,
cited separately, not conflated) that support the card's general grading-skepticism stance; they do
not directly re-source the existing four watch_out lines (which are about "pure"/"light" naming,
pomace oil, "packed in" vs "product of," and cheap-EVOO pricing), but add an independent academic
citation for the underlying problem the card addresses — a meaningful share of imported oil labeled
extra virgin does not meet the standard.

Judgment call: the existing watch_out's fourth line ("Extreme cheapness for extra-virgin is a flag,
not a find") borders the no-price-word rule; it is phrased as a caution about a price-quality signal,
not a stated price, and is left as-is for forge/critic to weigh rather than corrected here.

## 11. Checking for rancidity

### Source: America's Test Kitchen, detecting rancid olive oil (atk-oliverancidity)
- URL: https://www.americastestkitchen.com/articles/1224-how-to-tell-if-olive-oil-is-rancid (fetched, Firecrawl, 2026-09-20)
- Publisher: America's Test Kitchen (independent cooking publication)
- Retrieved: 2026-09-20

> Heat, air, light, and time will wreck the best olive oil.

> It'll have a distinctive smell, like varnish, putty, old walnuts, or crayons... Rancidity is more
> obvious in the mouth, so if you have any doubt, take a tiny sip... Store olive oil in a cool, dark
> place, tightly capped, and use it up promptly.

fills: `rancidity_check` — no existing watch_out; candidate authored from this source:

> Candidate watch_out: "Rancid oil smells like varnish, putty, old walnuts, or crayons rather than
> smelling like nothing. A small taste settles a smell that is ambiguous — rancidity shows up more
> clearly on the tongue than in the nose." — traced to the smell/taste quote above.

Judgment call: this candidate is scoped to olive oil, the food this source covers; if the card also
addresses nuts, flour, or grains going rancid, those forms are not sourced by this fetch and would
need a separate citation before extending the watch_out to them.

## 12. Rice and arsenic

### Source: Consumer Reports, rice heavy-metals testing (cr-ricearsenic)
- URL: https://www.consumerreports.org/health/food-safety/arsenic-in-your-food-testing-shows-a-real-need-for-federal-standards-a1064475937/ (fetched, Firecrawl, 2026-09-20)
- Publisher: Consumer Reports (independent watchdog/testing organization)
- Retrieved: 2026-09-20

> "As we did more than a decade ago, we found measurable levels of inorganic arsenic in all of the
> samples of the products," says James E. Rogers, PhD, director of food safety at Consumer Reports.

> we also tested three cooking methods thought to reduce the arsenic content of rice, and found that
> one of them can eliminate up to 58 percent of the inorganic arsenic.

> The first two preparations didn't remove much arsenic—less than 8 percent. But the parboiling and
> absorption method reduced the inorganic arsenic content in short- and long-grain brown and white
> rice by 50 and 58 percent, respectively.

fills: `rice_arsenic` — supports the existing watch_out's first line ("Rinsing and soaking barely
move it. Five percent or less, measured both ways"): Consumer Reports' rinse/soak figure ("less than
8 percent") is consistent with, and in the same range as, the KB's existing "five percent or less"
claim; no contradiction found.

Unresolved observation, not corrected here: Consumer Reports' third cooking method (parboiling and
draining excess water, 50-58% reduction) is a substantially larger reduction than rinsing or soaking
alone, and is not reflected anywhere in the current three-line watch_out. This is new enrichment
content, not a correction to what is already there; left for a future editorial pass rather than
added here.

## 13. Whole spices vs. ground

### Source: ScienceDirect / Cleaner Engineering and Technology, spice grinding review (sciencedirect-spices)
- URL: https://www.sciencedirect.com/science/article/pii/S2666790821001654 (fetched, Firecrawl, 2026-09-20)
- Publisher: ScienceDirect / Elsevier — Aradwad et al., "Key issues and challenges in spice grinding," Cleaner Engineering and Technology, Vol. 5, Dec 2021 (open access)
- Retrieved: 2026-09-20

> Heat-induced quality loss is a primary technical challenge in spice grinding.

> In spice processing, grinding plays an important role and needs special emphasis considering the
> problems of significant quality loss due to heat generation.

fills: `whole_spices` — supports the existing watch_out's second line: grinding (and by extension
toasting, which also applies heat) drives quality loss in spice, consistent with "toasted spice fades
faster than whole."

Judgment call: this peer-reviewed source covers only the heat-during-processing half of the existing
watch_out. Its first line ("some are only sold ground and that is fine: turmeric, paprika, cinnamon")
is a different claim — which spices are conventionally sold whole vs. ground — and no independent
source for that specific claim was located in this pass; it is left unsourced in this file and
flagged for forge/critic as a partial gap on this card.

## Bar A status, all 13 slugs

| slug | real-URL source count | independent (non-gov) source count | bar A satisfiable |
| --- | --- | --- | --- |
| beans_dried_vs_canned | 1 | 1 | yes |
| bottled_water_buying | 1 | 0 (ANSES is government) | partial — existing KB source list already carries a non-gov flavor via the fallback/BPA lines, not re-sourced here |
| bulk_bins_buying | 2 | 2 | yes |
| flour_basics | 2 | 1 (NC State Extension) | yes, on the extension-source leg; NutriMill is industry, not independent journalism |
| grains_beyond_rice | 1 | 1 | yes |
| honey_adulteration | 2 | 1 (Chemistry World) | yes, with the beekeeper-attribution discrepancy flagged, not corrected |
| nut_butter_ingredients | 1 | 0 (single brand FAQ) | partial — non-government but not third-party independent; flagged |
| nuts_raw_vs_roasted | 1 | 0 (industry association) | partial — first watch_out line well-supported; lines two and three unsourced |
| oats_steelcut_rolled_instant | 1 | 0 (extension service) | partial — fetched-URL leg satisfied, independence leg open |
| olive_oil_grades | 2 | 2 (UC Davis, both studies) | yes, as general support; the four specific watch_out lines are not individually re-sourced |
| rancidity_check | 1 | 1 | yes, scoped to olive oil |
| rice_arsenic | 1 | 1 | yes |
| whole_spices | 1 | 1 | partial — heat/toasting half sourced; "sold only ground" half unsourced |
