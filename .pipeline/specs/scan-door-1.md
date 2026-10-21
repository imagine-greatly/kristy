PIECE kristy/scan-door-1 (server, T2, Codex-built; critic@opus afterwards, not yours)
REPO /Users/m1/kristy  BASE = HEAD 0083653 (t6-4). Baseline npm test 3162/0 (measured 2026-10-21).

## Alignment
Devon approved 2026-10-21 (docs/PHOTO-SCAN-PLAN.md, pieces S1+S2, with his three answers): one photo of ANY food gets either today's ingredient verdict or the counter card shop mode would attach. Loose food with no label is named by sight ("Read as <item>"). Non-food gets a positive "That isn't something Kristy reads." No counter_gaps logging. Guest budget unchanged. Added by Devon's question 2026-10-21: the counter result also says which of the card's OWN decoded label terms are printed on this package, so an egg-carton photo can show "On this carton: Cage-free" next to the egg card. Terms only, never meanings, never any printed claim outside the card's labels_decoded vocabulary.

## Read first
docs/PHOTO-SCAN-PLAN.md (whole, 53 lines: S1, S2, Claim-lock section, What broken looks like). server/lib/labelVision.js L30-130 (LABEL_VISION_SYSTEM, parseIngredientsJSON; keep its comment style). server/routes/scan.js L1-130 and L160-192 (buildLabelResult, both label routes). server/lib/listMatch.js `matchItemToCard` (~L202) and `matchItemToPick` (~L229). Existing tests for style: server/lib/scanExtract.test.js. CLAUDE.md non-negotiables 2,3,4,5,8,9.

## Build
1. labelVision.js prompt: add three fields to the returned JSON, keeping everything else byte-identical:
   - "kind": "panel" when an ingredient list or packaged-food panel is the subject; "counter" for unpackaged/fresh food or its case/carton/sticker label (meat, fish, eggs, produce, bulk, deli, dairy carton without a list); "not_food" for anything that is not food or drink (soap, cleaner, cosmetics, cookware, supplements stay "panel").
   - "item": the generic food noun, from the printed name first, from sight only when nothing is printed. Never a brand, never a price, never a claim. Null when not food.
   - "claims": printed label terms on the package (e.g. "pasture raised", "organic", "grass fed"), transcribed as printed, at most 12, empty array if none. Transcribe only; never invent.
2. parseIngredientsJSON adds `kind`, `item`, `claims`:
   - kind: "not_food" wins even with ingredients; "counter" only when ingredients is empty (a list present → "panel"); unknown/missing → "panel" (today's behavior).
   - item through exported `cleanItem(item, brand)`: lowercase; drop the transcribed brand's words; drop price tokens ($, /lb, per lb, digits with ¢/$) and any number except a lean ratio like 85/15 or 90/10; drop marketing/treatment/medical words from a small exported stoplist (healthy, heart, natural, premium, fresh-tasting, lowers, cholesterol, diabetic, diabetics, immune, superfood, all-natural, no antibiotics ever, low fat, lean-claim words are fine to keep only as the ratio). Trim, ≤60 chars, null if no letters survive.
   - claims: strings, trimmed, deduped case-insensitively, ≤12, each ≤40 chars.
3. scan.js buildLabelResult (export it; give it an optional third arg `deps = { retain: retainProduct, card: matchItemToCard, pick: matchItemToPick, kb }` so tests inject; production calls unchanged in shape). Before today's panel branch:
   - kind not_food → `{found:false, source:'vision', product:null, ingredients:'', notFood:true, message:"That isn't something Kristy reads."}`. No retain, no engine.
   - kind counter → card(item); hit → `{found:false, source:'vision', product:null, ingredients:'', counter:{slug, section, item, onLabel}}`; else pick(item) hit → `{..., pick:{id, line, avoid?, item}}`; else honest miss `{found:false, source:'vision', product:null, ingredients:'', counterMiss:true, item, message: <reuse the existing honest-miss copy for the counter if one exists in lib/perimeter.js or routes/perimeter.js; else NO_INGREDIENTS>}`. No retain on any of these.
   - onLabel: the matched KB entry's labels_decoded `term`s (split a term on " / " into variants; compare normalized: lowercase, hyphens and repeated spaces → single space, curly quotes stripped) whose variant equals a normalized claim or is contained in one as whole words. Return the card's term string as written, in card order, deduped. Empty array when none. Never a claim string itself.
   - kind panel → today's code path, byte-identical behavior (non-negotiable 5: engine output untouched).
4. No prompt words about health, rank or judgment beyond what is there today. No first person in any new copy.

## Tests
New server/lib/labelVision.test.js and server/routes/scanLabel.test.js (node:test, nonEmpty from lib/testGuards.js where a collection is asserted):
- parse: kind counter + item "Ground Beef 85/15" → counter, "ground beef 85/15"; garbage kind → panel; list present + counter → panel; not_food with ingredients → not_food; missing kind/item/claims (today's model reply) → panel, item null, claims [] and every old field equal to today's parse.
- cleanItem: "heart healthy ground beef" → "ground beef"; "$5.99/lb chicken thighs" → "chicken thighs"; ("Vital Farms pasture raised eggs", "Vital Farms") → no "vital"/"farms"; "" → null.
- buildLabelResult with injected stubs: counter "ground beef" → counter.slug === matchItemToCard('ground beef').slug (real matcher); counter "lettuce" → slug is not revive_greens (and not any kind=home card); counter "eggs" with claims ["Cage Free","Grade A"] → onLabel includes "Cage-free", never "Grade A" unless it is a labels_decoded term of that card; claims ["heart healthy"] → onLabel []; not_food with and without ingredients → notFood, no verdict fields; retain stub call count 0 for counter, pick, miss and not_food; panel input → output deep-equal to calling the BASE behavior (same object as before the change for a fixture list).
- Legacy shape: every new body has `found:false`, `source:'vision'`, `ingredients:''` (kristy-ios ScanModels.swift:39 requires source+ingredients).

OWNS: server/lib/labelVision.js, server/routes/scan.js, server/lib/labelVision.test.js [new], server/routes/scanLabel.test.js [new]. Nothing else (no KB, no listMatch.js, no iOS, no docs). If a test elsewhere goes red, report it, do not edit it.

VERIFY (run, report numbers): from server/: `node --test lib/labelVision.test.js routes/scanLabel.test.js`, `npm test` (≥3162, 0 fail; new test files must be picked up by the npm glob: if not, say so), `node scripts/listMatchProbe.js | grep "WRONG ("` (all 0), `node scripts/commitGuard.js`. No git writes, no network.

REPORT ≤30 lines: final prompt diff summary, the onLabel rule as implemented, test counts, READY or NOT READY.
