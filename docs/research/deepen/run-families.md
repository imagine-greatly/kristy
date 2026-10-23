TIER: T2. Read-only analysis plus ONE output file. Write only `FAMILIES.md` in the current directory (docs/research/deepen). Do not edit the KB, code, or run git. Do not run npm test; RAM is low.

Goal: Kristy (grocery coach) moves shop mode from one-card-per-item to a CASCADE:
- L0 store stance; L1 aisle briefing (3-5 lines per aisle);
- L2 FAMILY card (about 40-50), grouped by HOW YOU SHOP: produce "buy firm, ripen at home" vs "buy ripe, will not improve" vs "living leaf" vs "dark cool storage crops"; ruminants vs chicken/pork/eggs vs seafood; dairy by processing; pantry one family per thing-to-read, with one shared ingredient-list avoid list;
- L3 ITEM DELTA (one line, only where the item differs from its family; e.g. ground beef: ask for the organ blend);
- L4 standalone decision cards (label terms, olive oil grades, rice arsenic).
A family rule may only state what is true for every member.

Task: read ../../../server/kristy_perimeter_kb.json (shape {entries:[...]}, 243 entries = 205 cards + 38 picks; use a node one-liner to print id, title, category, decision, short_answer per entry rather than reading it whole) and groups.json. Classify EVERY one of the 205 cards (picks excluded; groups.json lists the 205 ids by category) as FAMILY-MEMBER (name the family), STANDALONE-DECISION (L4) or LABEL-TERM.

Output FAMILIES.md, compact tables, ids verbatim:
1. Family list (aim 40-50): working id, aisle, one-line shopping logic that defines membership, member card ids, per member: needs ITEM DELTA yes/no plus the delta idea in <=12 words.
2. Aisle list for L1 briefings.
3. Flags: cards fitting no family, cards straddling two, families where members disagree on the ladder (split them so the family rule stays true).
4. Verify with a script that all 205 ids appear exactly once; print the real count at the end of the file.
