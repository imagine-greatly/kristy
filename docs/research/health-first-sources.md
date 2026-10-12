# Health-first source pack (Piece 2)

Fetched 2026-10-12 with Firecrawl CLI. Each quote is checked verbatim against its scrape file in /Users/m1/kristy/.firecrawl/. Archive only; no card copy.

## ground_beef_lean_ratio
- URL: https://www.law.cornell.edu/cfr/text/9/319.15
- Scrape: .firecrawl/law.cornell.edu-cfr-text-9-319.15.md
- Quote: shall consist of chopped fresh and/or frozen beef with or without seasoning and without the addition of beef fat as such, shall not contain more than 30 percent fat, and shall not contain added water, phosphates, binders, or extenders.
- Quote: shall consist of chopped fresh and/or frozen beef with or without the addition of beef fat as such and/or seasoning, shall not contain more than 30 percent fat, and shall not contain added water, phosphates, binders, or extenders.
- Verdict: SATISFIABLE
- Note: 9 CFR 319.15 text supports name = no added water/phosphates/binders; hamburger may add fat. NOT FOUND in any fetched page: store-ground vs pre-packed distinction (plan says use only if pack has it, so omit).

## beef_cuts_basics
- URL: https://www.law.cornell.edu/cfr/text/9/317.2
- Scrape: .firecrawl/law.cornell.edu-cfr-text-9-317.2.md
- Quote: the product name for a raw or partially cooked beef product that has been mechanically tenderized, whether by needle or by blade, must contain the term “mechanically tenderized,” “needle tenderized,” or “blade tenderized,” as a descriptive designation and an accurate description of the beef component.
- Verdict: SATISFIABLE
- Note: 9 CFR 317.2(e)(3).

## pork_cuts_and_enhanced
- URL: https://www.law.cornell.edu/cfr/text/9/317.2
- Scrape: .firecrawl/law.cornell.edu-cfr-text-9-317.2.md
- Quote: The product name for a raw meatproduct that contains added solution and does not meet a standard of identity in
- Quote: The percentage of added solution may be declared by the words “containing” or “contains” (such as, “contains 15% added solution of water and salt,” or “containing 15% added solution of water and teriyaki sauce”).
- Quote: The common or usual name of all individual ingredients or multi-ingredient components in the solution listed in descending order of predominance by weight.
- Verdict: SATISFIABLE
- Note: 9 CFR 317.2 added-solution naming; text is not species-limited to pork (applies to raw meat product); poultry is not covered by this section (not fetched).

## chicken_cuts_basics
- URL: https://extension.illinois.edu/blogs/simply-nutritious-quick-and-delicious/2022-02-01-benefits-buying-whole-chicken
- Scrape: .firecrawl/extension.illinois.edu-blogs-simply-nutritious-quick-and-delicious-2022-02-01-benefits-buying-whole-chicken.md
- Verdict: NOT
- Note: Fetched extension.illinois.edu whole-chicken page (see scrape file) states buying benefits only; no fetched page states the whole bird is the least-processed form. No quote.

## flour_basics
- URL: https://www.law.cornell.edu/cfr/text/21/137.105
- Scrape: .firecrawl/law.cornell.edu-cfr-text-21-137.105.md
- Quote: When any optional bleaching ingredient is used, the label shall bear the word “Bleached”.
- URL: https://www.law.cornell.edu/cfr/text/21/137.155
- Scrape: .firecrawl/law.cornell.edu-cfr-text-21-137.155.md
- Quote: potassium bromate is added in a quantity not exceeding 50 parts to each million parts of the finished bromated flour, and is added only to flours whose baking qualities are improved by such addition.
- URL: https://www.law.cornell.edu/cfr/text/21/137.200
- Scrape: .firecrawl/law.cornell.edu-cfr-text-21-137.200.md
- Quote: The proportions of the natural constituents of such wheat, other than moisture, remain unaltered.
- Verdict: SATISFIABLE
- Note: Whole wheat flour, bleached label word, bromated flour. Engine KB first per plan; these are the fallback.

## bagels_pretzels
- URL: https://www.snydersofhanover.com/products/sticks/
- Scrape: .firecrawl/snydersofhanover.com-products-sticks.md
- Quote: Enriched Flour (Wheat Flour, Niacin, Reduced Iron, Thiamine Mononitrate, Riboflavin, Folic Acid), Tapioca Malt Syrup (Tapioca Syrup, Malt Extract), Vegetable Oil (Canola, Palm, Soybean And/Or Sunflower), Contains 2% Or Less Of: Salt, Yeast, Soda.
- Verdict: SATISFIABLE
- Note: Snack pretzel list (pretzels half of the row, one brand product). Bagel list is a sibling sentence per plan, not fetched here.

## salt
- URL: https://www.mortonsalt.com/?post_type=faq&p=2325
- Scrape: .firecrawl/mortonsalt.com.md
- Quote: Morton® Iodized Salt contains potassium iodide, dextrose to stabilize the iodide and calcium silicate which is an anti-caking agent.
- URL: https://www.diamondcrystalsalt.com/kosher-salt
- Scrape: .firecrawl/diamondcrystalsalt.com-kosher-salt.md
- Quote: The original no-additive, natural scratch cooking kosher salt
- Quote: Additive-free and lower in sodium by volume than table salt
- URL: https://ign.org/latest/blog/iodized-or-sea-salt/
- Scrape: .firecrawl/ign.org-latest-blog-iodized-or-sea-salt.md
- Quote: Raw sea salt does contain some iodine but not nearly enough to meet every day needs, so to meet iodine requirements, other sources are required.
- Quote: most iodized salt is originally harvested from the sea, but undergoes a processing step in which iodine is added.
- Verdict: SATISFIABLE
- Note: Supports: iodized carries added iodine (Morton, IGN); one kosher brand is additive-free (Diamond Crystal, a single brand, not 'most'). NOT SUPPORTED by any fetched page: 'most sea and kosher carry none' as a general statement; IGN says raw sea salt contains SOME iodine. Card text must stay at what these pages say.

## cocoa
- URL: https://www.law.cornell.edu/cfr/text/21/163.112
- Scrape: .firecrawl/law.cornell.edu-cfr-text-21-163.112.md
- Quote: the name of the food shall be accompanied by the statement “Processed with alkali”, or “Processed with
- URL: https://www.law.cornell.edu/cfr/text/21/163.113
- Scrape: .firecrawl/law.cornell.edu-cfr-text-21-163.113.md
- Quote: Cocoa is the
- URL: https://www.callebaut.com/en-US/difference-between-alkalised-and-natural-cocoa-powder-overview
- Scrape: .firecrawl/callebaut.com-en-US-difference-between-alkalised-and-natural-cocoa-powder-overview.md
- Quote: The alkalisation process may lead to a potential loss of antioxidants present in the cocoa beans.
- Verdict: SATISFIABLE
- Note: 'Processed with alkali' label statement (21 CFR 163.112) supports the Dutch-process line. Flavanol line: only the Callebaut manufacturer sentence on 'antioxidants'; the word flavanol does not appear in the fetched pages (pubmed 18710243 would not fetch, 1 try plus engines failed), so the flavanol line is NOT supported; antioxidants sentence is a manufacturer page.

## broth
- URL: https://www.thechoppingblock.com/blog/whats-the-difference-between-stock-broth-and-bone-broth
- Scrape: .firecrawl/thechoppingblock.com-blog-whats-the-difference-between-stock-broth-and-bone-broth.md
- Quote: Stock is an ingredient and is made from primarily bones and vegetables, while broth is made from meat, possibly bones and vegetables.
- Verdict: SATISFIABLE
- Note: Cooking-school page (culinary source, not regulation).

## grains_beyond_rice
- URL: https://wholegrainscouncil.org/whole-grains-101/whole-grains-101-orphan-pages-found/types-barley
- Scrape: .firecrawl/wholegrainscouncil.org-whole-grains-101-whole-grains-101-orphan-pages-found-types-barley.md
- Quote: Hulled barley is covered barley that has been minimally processed to remove only the tough inedible outer hull.
- Quote: Pearl barley has been polished, or “pearled” to remove some or all of the outer bran layer along with the hull.
- Verdict: SATISFIABLE
- Note: Barley only; other grains not fetched.

## pick_tofu
- URL: https://apa.si.edu/picklesandtea/how-to-make-tofu/
- Scrape: .firecrawl/apa.si.edu-picklesandtea-how-to-make-tofu.md
- Quote: Nigari (a natural coagulant of magnesium chloride made by evaporating seawater)
- Quote: is the coagulant of choice in Japan
- Quote: it contained only three ingredients: water, non-
- Verdict: SATISFIABLE
- Note: Smithsonian Asian Pacific American Center. Coagulants named. The 'organic' part of the aim: only a parenthetical wish for organic soybeans appears; not supported as a quote. Soymilk ingredient quote is of a soymilk, not a block of tofu.

## duck_meat
- URL: https://www.precisionnutrition.com/encyclopedia/food/duck
- Scrape: .firecrawl/precisionnutrition.com-encyclopedia-food-duck.md
- Quote: With dark meat that’s rich and fatty, duck is the beef of the poultry world.
- Quote: Duck meat will often come with a generous layer of fatty skin, which can be scored and crisped up during cooking to add richness and flavor.
- Verdict: SATISFIABLE
- Note: D9 candidate unique line: duck is dark meat with a fatty skin layer. Source is a nutrition-coaching site, not extension. Also fetched hss.gov.nt.ca duck fact sheet (wild duck, fat 23% vs 40% chicken); not used as it concerns wild northern duck.

## lamb_goat
- URL: https://www.aces.edu/blog/topics/animals-urban/goat-healthy-meat-option/
- Scrape: .firecrawl/aces.edu-blog-topics-animals-urban-goat-healthy-meat-option.md
- Quote: Goat meat is lower in cholesterol and contains fewer calories than other meats.
- URL: https://www.udel.edu/academics/colleges/canr/news/2021/november/an-alternative-meat-for-the-holidays/
- Scrape: .firecrawl/udel.edu-academics-colleges-canr-news-2021-november-an-alternative-meat-for-the-holidays.md
- Quote: Goat is a lean meat
- Quote: | Fat (g) | 2.6 | 6.3 | 7.9 | 8.2 | 8.1 |
- Verdict: SATISFIABLE
- Note: D9 candidate unique line is GOAT (leanness; Alabama and Delaware extension). Nothing fetched is lamb-specific. Comparative nutrient claim: card copy must not turn it into a 'healthier' claim.

## goat_sheep_dairy
- URL: https://www.canr.msu.edu/news/goat-milk-versus-cow-milk-a-comparison
- Scrape: .firecrawl/canr.msu.edu-news-goat-milk-versus-cow-milk-a-comparison.md
- Quote: goat milk also has about
- Quote: This is usually not a lactose intolerance, but a difference in some of the other components like less lactose and different forms of proteins.
- Verdict: SATISFIABLE
- Note: MSU Extension, goat milk only. Nothing fetched on sheep milk.

## coconut_milk_beverage
- URL: https://hot-thai-kitchen.com/coconut-milk-101/
- Scrape: .firecrawl/hot-thai-kitchen.com-coconut-milk-101.md
- Quote: What they're actually using is technically a coconut beverage, in the same way that "almond milk" is actually, technically, an "almond beverage."
- Quote: Coconut beverage is called "coconut milk" in everyday speak and causes confusion. This is not for cooking!
- Verdict: SATISFIABLE
- Note: D9 candidate is a naming line (beverage vs canned/UHT coconut milk), a food blog by a cookbook author. May overlap canned_coconut_milk's ownership of bare 'coconut milk' (plan); caller decides.

