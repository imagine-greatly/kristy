[T1 prose] Build piece R1 of /Users/m1/kristy/.pipeline/specs/LIST-FIRST-PLAN.md (APPROVED by Devon 2026-10-02). Read the plan's R1 entry, Ruling F (free list, paid shop) and Ruling S (seal is the logo and icon, no ring text) first; they are your spec. Edit ONLY the rule homes the plan names for R1 (kristy: CLAUDE.md, docs/DECISIONS.md, docs/PRICING-MODEL.md; kristy-ios: CLAUDE.md, Brand/tokens.json `_stance`, docs/ios-specs/paper.md, the seal spec it names). Write no code.

Devon's words to carry (quote, don't paraphrase):
- "free users can edit and create their lists but they can only put them to use in shopmode which is paid, the creation of their list encourages buying shop mode"
- "the olive seal is the logo, there were never any words on it"
- "make the seal the logo and the main icon for the app and have the solarkraft behind it as the backround ... overwrite the old rules of having just the logo and forest green"
- "there is no dark mode color scheme it should only ever be solarkraft" (already pinned in kristy-ios c489638)

Constraints:
- /Users/m1/kristy/CLAUDE.md must stay at or under 21,000 characters (`wc -m`). Detail goes in the companion doc; CLAUDE.md gets a one-line rule.
- NN1 is "all three or none": tokens.json `_stance`, kristy-ios/CLAUDE.md and kristy/CLAUDE.md change together. Do not loosen palette_mirror.sh.
- Server code and iOS code are NOT changed here (pieces G1/G2 do that). Where code still enforces the old behaviour, mark the rule "ruled 2026-10-02, build pending G1/G2".
- Never write in first person in rule text that is Kristy voice; rules prose is fine.
- After editing, run from /Users/m1/kristy: `node server/scripts/claudeMdSplitCheck.js HEAD` and `wc -m CLAUDE.md`; from /Users/m1/kristy-ios: `bash Tools/checks/run_all.sh`. Report exit codes and the last lines verbatim.
- Do NOT commit or push.

Final report, 30 lines max: each file changed with one line on what changed, CLAUDE.md char count, check results, anything the plan asked for that you could not do. End with READY or NOT READY.
