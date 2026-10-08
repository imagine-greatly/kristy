# K22 per-card staging brief (admin, 2026-10-07)
Worktree /Users/m1/kristy-corpus, branch corpus, HEAD 0e7cb28. Spec: .pipeline/specs/K22.md (it wins over this brief, except the "Admin rulings on pre-check 0" at :761 which win over everything).

Your job: author ONE counter card entry for the id named in your dispatch, and write it as a single JSON object to .pipeline/runs/k22/<id>.json. Touch NO other file. No git. Do not edit the KB, tests, doLines, or anything under server/.

Budget plan (6 turns):
1. One Bash: `sed -n '1,54p;102,256p;310,374p;761,9999p' .pipeline/specs/K22.md` plus `grep -n '<id>' .pipeline/specs/K22.md`, plus print one existing K21 card as a shape example: `node -e "const kb=require('./server/kristy_perimeter_kb.json');const a=Array.isArray(kb)?kb:kb.entries||Object.values(kb);console.log(JSON.stringify(a.find(e=>e.id==='maple_syrup'),null,1))"`.
2. One Bash: print the exact source lines your card cites (sed -n on docs/sources/k22/<file> ranges; include line 1 of each for the URL).
3. Write .pipeline/runs/k22/<id>.json.
4. One Bash: lint it — `node -e "const {lintCard}=require('./server/lib/counterCardLint.js');console.log(JSON.stringify(lintCard(require('./.pipeline/runs/k22/<id>.json'))))"` (if the export name differs, read the module's exports line and adapt once).
5. Fix and re-lint if needed. 6. Report.

Binding: every claim traces to a docs/sources/k22 file:line you printed in step 2 (claim lock; never cite from memory, never invent a URL; sources' `url` copied verbatim from line 1). No health/treatment/disease/prevention claims; no price; no negative claims about named brands; zero first person; holistic framing (tradition and craft, attributed) per the spec's R3 fold. olives-1 and FAO are banned. decision, aliases, asked_as, BARE rows, KEEPS, tier_note and the do line are exactly as the spec gives them; include the do line as a top-level "_do_line" field (the wiring pass moves it to doLines). Include any fix (a) alias the spec or Admin rulings assign to this card.

Report ≤15 lines: file written, lint result observed, sources cited (file:line), any spec angle you could not source (narrowed or dropped, never asserted), READY or NOT READY.
