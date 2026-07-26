# Food Data Stack — OFF Base, Vision Fallback, Own Dataset

The three-layer food-data strategy: keep Open Food Facts as the base, make Kristy's label-photo read the first-class fallback (interpreted through her holistic lens), and retain every resolved scan so it accrues into Kristy's own database over time — the same moat Yuka built, but with a vision layer that covers the long tail no barcode DB reaches.

Standing rules unchanged: the verdict claim-lock and no-treatment rule are untouched — vision extracts INGREDIENTS, the existing engine + KBs produce the health judgment. One commit per block, report regressions.

---

## BLOCK 1 — Fix the wrong-product bug + fail honestly (trust-critical)

```
The scanner returned coffee creamer for a bag of chips. Before anything else, fix the wrong-result bug and make misses honest.

1) FIND THE CAUSE. Trace barcode → Open Food Facts lookup → product → verdict. The chips→creamer mismatch is almost certainly NOT a coverage gap — it's a lookup returning a wrong/stale result: a cached previous product, a default/fallback object, a race where the last result renders, or a fuzzy/loose match. Identify which and fix it so a lookup only ever returns the product whose barcode was actually scanned.
2) FAIL HONESTLY on a real miss. If OFF has no confident match for the barcode, Kristy says so plainly and hands off to the label-photo path — never shows a different product as if it were the scanned one. Copy in her voice, egoless per VOICE_SPEC: "Not in the data yet — snap the ingredient label and it gets read directly." No fabricated product.
3) NO SILENT WRONG ANSWERS. A confident wrong verdict is worse than an honest miss for a trust product. When confidence is low, treat it as a miss and route to photo.

Verify: scanning a product returns that product or an honest miss, never a different product; low-confidence lookups route to the photo path; the chips→creamer cause is identified in the report.
```

---

## BLOCK 2 — The label-photo read as the first-class fallback (Kristy's real coverage edge)

```
The label-photo path is not a consolation prize — it's the coverage advantage Yuka doesn't have. A photographed ingredient list works on ANY product, including the long tail no database has. Make it first-class and make Kristy interpret it through her holistic lens.

1) PROMOTE THE PATH. When a barcode misses (or the user chooses it), photographing the ingredient label is a smooth, primary flow — not buried. From the honest-miss state, one tap to camera, capture the label, get a verdict. This should feel like the natural next move, not an error recovery.

2) VISION EXTRACTS INGREDIENTS, THE ENGINE JUDGES. Claude vision reads the label and returns: product name/brand if visible, and the INGREDIENT LIST (the thing Kristy's engine runs on). Vision's job is extraction, not health claims. The extracted ingredients then flow through the EXISTING verdict engine + ingredient KB + claim lock — so the health judgment is claim-locked exactly like a barcode scan. Do not let vision invent health claims; it transcribes ingredients, the engine decides.

3) INTERPRET THROUGH KRISTY'S LENS. The extraction + verdict must reflect everything Kristy stands for, applied to what's on the label:
   - Seed oils (canola, soybean, cottonseed, "vegetable oil", sunflower/safflower) → flagged on her standard.
   - Artificial dyes, artificial flavors, artificial sweeteners → flagged.
   - Petroleum-derived / synthetic additives (e.g. TBHQ, BHA/BHT, certain synthetics) → flagged with the honest tier.
   - Whole-food ingredients → recognized and affirmed (time-tested / whole-food framing), not just "no flags."
   - The holistic lens: real, minimally-processed, recognizable ingredients are the standard; industrial/synthetic is what gets called out. All of this comes from the KBs and tiers already built — vision just feeds the ingredient list in; the existing philosophy does the judging.
   - Honesty tiers hold: established vs credible-concern vs Kristy's-standard, named as such. No overclaiming, no medical/treatment claims.

4) HANDLE PARTIAL/BLURRY reads gracefully: if the ingredient list is unreadable or cut off, Kristy asks for a clearer shot of the ingredients panel rather than guessing.

Verify: a barcode miss flows smoothly to a label photo; vision returns product name + ingredient list; the ingredients run through the existing engine so the verdict is claim-locked; seed oils / artificial additives / petroleum-derived synthetics are flagged and whole foods affirmed, all via the existing KBs and tiers; a blurry label prompts a re-shot, not a fabricated verdict.
```

---

## BLOCK 3 — Retain resolved scans as Kristy's own dataset (the future moat)

```
Every resolved scan — barcode-matched OR vision-read — is data that should accrue into Kristy's own product database over time. This is exactly how Yuka built its moat: crowdsourced accumulation. Start capturing it now so it compounds, even before it's actively used.

1) CAPTURE ON EVERY RESOLVED SCAN. When a scan resolves (barcode hit or vision label read), store: barcode (if any), product name, brand, the ingredient list, the source (off | vision), a timestamp, and the verdict tier produced. A dedicated table (e.g. scanned_products) keyed by barcode where present, else by a product hash.
2) VISION READS ARE THE MOST VALUABLE — they're the products OFF didn't have. A vision-read product with a barcode becomes a candidate entry for Kristy's own database: next time anyone scans that barcode, it can resolve from Kristy's own store instead of missing again. Wire the lookup order as: Kristy's own store → Open Food Facts → vision fallback. So the database self-heals: every miss that gets photographed fills its own gap for the next user.
3) PRIVACY + INTEGRITY. Store product data, not user-identifying detail tied to it beyond what's needed. De-dupe by barcode/hash. Treat vision-extracted ingredient lists as candidate data (they can be wrong from a bad photo) — flag confidence so low-confidence entries don't overwrite good ones. Don't let one bad read poison a known-good product.
4) DON'T BUILD A MODERATION UI YET — just capture cleanly and structure it so it's usable later. The point now is to start accruing the asset; curation comes when volume justifies it.

Verify: every resolved scan writes to the store with source tagged; lookup order is own-store → OFF → vision; a barcode previously resolved via vision now resolves from Kristy's own store on the next scan; low-confidence vision reads are flagged and don't overwrite high-confidence entries.
```

---

## Note for Devon — the strategy in one line

Keep Open Food Facts (same base Yuka used), make the label-photo read excellent because it covers the long tail no database reaches, and retain every resolved scan so Kristy's own database grows from real usage. Don't buy an enterprise barcode API — it's priced for calorie trackers, won't fully solve US coverage anyway, and your camera already solves the gap. Revisit a cheap aggregator (Spike / Calorie API, OFF+USDA stacked, ~$29-99/mo) only if scan volume later reveals a painful hole the vision path isn't filling.

The claim-lock discipline is preserved throughout: vision only ever extracts ingredients; the existing engine, KBs, and tiers produce every health judgment — through Kristy's holistic lens (seed oils, artificial anything, petroleum-derived synthetics flagged; whole foods affirmed), exactly as they do for a barcode scan.
