# Premium pack label archive: index

Fetch date for all entries: 2026-11-02. Each file's header gives its source URL, fetch date, type, tool, and any trimming.

## Brand and retailer pages

| File | URL | Label-wording note |
| --- | --- | --- |
| force-of-nature-home.md | https://forceofnature.com/ | "regenerative" and "grass fed, grass finished" on the homepage. |
| wholefoods-force-of-nature-beef-liver-heart-blend.md | https://www.wholefoodsmarket.com/product/force-of-nature-meats-regenerative-grassfed-ground-beef-liver-heart-b085yv7bgb | "100% grass-fed and grass-finished beef, liver, and heart from regenerative ranches"; "No antibiotics, no added growth hormones, no fillers." |
| wholefoods-force-of-nature-bison.md | https://www.wholefoodsmarket.com/grocery/product/force-of-nature-ground-bison-b085yw2dlh | Retailer copy for Force of Nature ground bison; see file. |
| pasturebird-home.md | https://www.pasturebird.com/ | "humanely raised" and "no antibiotics ever"; no named third-party certifier. |
| white-oak-core-values.md | https://whiteoakpastures.com/pages/our-core-values | Core-values page; certifier wording not re-checked in this pass, see file. |
| white-oak-grassfed-beef-collection.md | https://whiteoakpastures.com/collections/grassfed-beef | Names AGA for cattle and small ruminants, Certified Non-GMO for other species, Certified Organic for vegetables (per archived copy). |
| thousand-hills-crowdcow.md | https://www.crowdcow.com/ranch/thousand-hills-lifetime-grazed | No certifier text on the Crowd Cow page. |
| alexandre-family-farm-cornucopia.md | https://www.cornucopia.org/alexandre-family-farm-brand-information/ | Cornucopia states Alexandre dropped Certified Humane and ROC as of March 2026. |
| vital-farms-raising-standards.md | https://www.vitalfarms.com/our-standards/ (redirected to https://vitalfarms.com/learn/raising-standards) | Vital Farms' published raising-standards page. |
| wild-pastures-product-page.md | https://wellnessforce.com/products/wild-pastures-beef-seafood-pork-turkey-chicken (served from https://wellnessandwisdom.com/products/wild-pastures-beef-seafood-pork-turkey-chicken/) | "100% grass-fed", "regenerative", "pasture-raised"; no named third-party certifier. |

## Certifier standards

| File | URL | Label-wording note |
| --- | --- | --- |
| aga-standards-official-page.md | https://www.americangrassfed.org/about-us/our-standards/ | Summary page only: "100% Grass Diet", "Raised on Pasture", "No Antibiotics or Hormones", "Family Farm Origin"; inspected every 15 months. Full AGA standard PDF not located. |
| roc-livestock-standard.md | https://regenorganic.org/wp-content/uploads/2023/03/Regenerative-Organic-Certified-Framework.pdf | ROC livestock section, extracted from the framework PDF. |
| roc-framework-full-text.md | https://regenorganic.org/wp-content/uploads/2023/03/Regenerative-Organic-Certified-Framework.pdf | Full ROC framework text, same PDF. |
| agw-certified-regenerative-2025-livestock.md | https://agreenerworld.org/wp-content/uploads/2025/12/ST146v1-Certified-Regenerative-by-AGW-2025-Standard.pdf | AGW Certified Regenerative 2025, livestock section. |
| agw-certified-regenerative-2025-full-text.md | https://agreenerworld.org/wp-content/uploads/2025/12/ST146v1-Certified-Regenerative-by-AGW-2025-Standard.pdf | Full AGW Certified Regenerative 2025 text. |
| awa-beef-cattle-and-calves-standards.md | https://agreenerworld.org/certifications/animal-welfare-approved/standards/beef-cattle-and-calves-standards/ | AWA beef cattle and calves standard. |
| awa-pig-standards.md | https://agreenerworld.org/certifications/animal-welfare-approved/standards/pig-standards/ | AWA pig standard. |
| awa-sheep-standards.md | https://agreenerworld.org/certifications/animal-welfare-approved/standards/sheep-standards/ | AWA sheep standard (covers lamb). |
| awa-meat-chicken-standards.md | https://agreenerworld.org/certifications/animal-welfare-approved/standards/meat-chicken-standards/ | AWA meat chicken standard. |
| awa-turkey-standards.md | https://agreenerworld.org/certifications/animal-welfare-approved/standards/turkey-standards/ | AWA turkey standard. |
| foodprint-awa-beef.md | https://foodprint.org/eating-sustainably/food-label-guide/food-label-guide-beef/animal-welfare-approved/ | FoodPrint secondary description of AWA beef. |
| foodprint-pco-grassfed-beef.md | https://foodprint.org/eating-sustainably/food-label-guide/food-label-guide-beef/pco-certified-organic-grassfed/ | FoodPrint secondary description of PCO 100% Grassfed beef. |
| savory-eov-land-to-market.md | https://savory.global/ecological-outcome-verification-the-science-inside-savory-institutes-land-to-market/ | Savory article on EOV and Land to Market. Not the primary standard. |

## Failed or not located

- PCO 100% Grassfed primary standard: not located. The PowerDMS PDFs found (OSP Ruminant and Swine form; Product Review Request Form V4) are forms, not the standard. Not archived.
- GAP steps 4-5+: https://globalanimalpartnership.org/standards/beef-cattle/ returned 404. https://globalanimalpartnership.org/standards/chicken/ returned 200 but holds only the intro and link list; the standard PDF was not reached. Not archived as standard text.
- Force of Nature standards page (/pages/our-standards): 404.
- AGA /aga-standards/: 404. The official page above was used instead.
- ROC /standards/: 404.
- H-E-B Force of Nature ground beef: bot-blocked.
- Perdue pasture-bird page: 404 behind WAF; stealthy_fetch returned empty.
- Sevensons.net: 403.
- AWA preview PDF: 404.
- Bay State: a flour miller, not a meat brand. No substitute was archived as a separate file. The Wild Pastures and Whole Foods Force of Nature pages stand in as comparables.
- Scrapling PDF extraction corrupted the bytes for ROC and AGW PDFs. Those were re-fetched with curl and read with pypdf.
- Certified Humane Pasture-Raised: skipped, already archived.
