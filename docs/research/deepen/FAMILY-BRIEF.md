# Family research brief (Devon 2026-10-23, shop cascade approved)

Shop mode becomes a cascade: L0 stance, L1 aisle briefing, L2 FAMILY card, L3 ITEM DELTA, L4 standalone decisions. Your job: FINDINGS ONLY for the families named in your run spec. A separate builder writes card copy. Do not edit the KB or any file except your one output file.

## Inputs (read first)
- FAMILIES.md (this dir): your families, members, delta ideas, flags, aisle briefing.
- Round 1 `<group>.md` and round 2 `<group>-r2.md` findings for the member cards (find members' groups in groups.json). They already hold sourced ladders; reuse their URLs, do not re-derive. Fetch only to fill gaps or to confirm a URL.
- ../completeness/DECISIONS-2026-10-22.md and ../../../server/kristy_perimeter_kb.json (entry per member id) for the current card text.

## Stance (locked)
Nature first, closest to source; organic a floor; small, seasonal, local, trusted growers over big year-round commercial supply, ALWAYS UNNAMED. Holistic and traditional sources judge; government = raw label meaning only. Saturate: the family card should hold every fact a health-first shopper needs that is true of ALL members.

## Hard rules
- No brand names, no negative claim about any named brand or company. Steer by TRAITS: "small seasonal local grower" is the best rung; the large-scale commercial pattern (year-round supply, shipped far, heavily branded packs) is the skip rung, written as a look-for/skip line the shopper can read off the pack or shelf. Never "poison", never toxicity or health-outcome claims; any concern must be a sourced holistic claim phrased as a concern, not a diagnosis.
- No treat/cure/prevent/lower-risk claims. No price. Zero first person.
- No "ask the counter / ask the farmer" coaching by default. Shoppers pick packs and produce off the shelf. Counter advice ONLY for items genuinely bought at a staffed counter (butcher cuts, fish counter). Everything else is a shelf or pack look-for/skip line.
- A FAMILY rule may only state what is true for every member; where a member differs, that goes in its ITEM DELTA. If members disagree on the ladder, say so and propose the split.
- Every claim carries a URL you actually found via search this session; mark `[unverified]` if you could not open it. Never cite from memory.

## Output format (one file, your run's name)
For each family:
```
### F## <name>
RULE (true for all members, 3-6 lines): ladder best / close / floor / skip, with the exact shelf or label words per rung.
BEYOND THE STORE (1-2 lines, only if real: farm stand, CSA, co-op).
SEASON/STORAGE (if it applies to every member).
SHARED SKIP LIST (family-specific; point to the global ingredient avoid list instead of repeating it).
SHOPPER QUESTIONS the family answers (3+).
SOURCES: url - what it supports.
ITEM DELTAS: per member card id: as many lines as the difference needs, no more (usually 1-3; key point first). Say NONE where the item matches its family.
```
Then an `AISLE BRIEFING` block: 3-5 short lines for the aisle, plus any family-vs-family disagreement or gap you found.
