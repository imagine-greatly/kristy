from pathlib import Path
import re
p=Path('.pipeline/specs/ca-4a.md')
s=p.read_text().replace('8b49633','d707172')
s=s.replace('`8c7112e`','`719f9fe`')
s=s.replace('- **Before dispatch:** CA-3a and CA-3b committed (see Prerequisites). Admin runs the BEFORE capture in "Independent check script".', '- **Baseline:** CA-3a and CA-3b shipped at HEAD `d707172`. BEFORE is captured on that unchanged tree in `.pipeline/runs/ca-4a/before.json`.')
s=s.replace('- **Deviation from the plan, recorded.** `perimeter.test.js:213-214` cap cart_pick at 44 characters and forbid `%`; the approved Eggs and Milk picks run 46 characters and Milk and Yogurt carry "100%". Step 6 raises the cap to 46 `[PLACEHOLDER]` and exempts the literal "100%" `[PLACEHOLDER]`; Devon confirms (Open question 1). CA-3a beef carries "100%" too; whichever piece lands first makes the edit, the second finds it done.', '- `perimeter.test.js:213` already caps cart_pick at 46 characters after CA-3a; Eggs and Milk each measure 46. Keep that cap. At :214 CA-3a exempts only a leading `100% `; Step 6 permits one literal `100%` anywhere so the approved Milk and Yogurt picks pass. Other percent and currency signs remain forbidden.')
s=s.replace(' Open question 2.', ' See Assumptions.')
s=s.replace('- `server/lib/kindFilter.test.js:114`: the expected pick count N → N − 1, with a comment line above it `// <N-1> after CA-4a: pick_milk retired; the Milk card answers it, 2026-10-15.` (N is 31 at `d707172`; CA-3 may have moved it; use the value on the line).', "- `server/lib/kindFilter.test.js:114`: `31` → `30`, including assertion message → `'CA-4a: 30 picks in the raw corpus'`; add comment `// 30 after CA-4a: pick_milk retired; the Milk card answers it, 2026-10-15.` Counts are measured from HEAD, not inherited from the old spec.")
s=s.replace('- `server/lib/perimeter.test.js:213` `p.length <= 44` → `p.length <= 46` `[PLACEHOLDER]`; `:214` `assert.doesNotMatch(p, /[$£€%]/, …)` → `assert.doesNotMatch(p.replace(\'100%\', \'\'), /[$£€%]/, …)` `[PLACEHOLDER]`. If CA-3 already made an equivalent edit, leave both lines.', "- `server/lib/perimeter.test.js:213`: keep `p.length <= 46`. At :214 change only `p.replace(/^100% /, '')` → `p.replace(/\\b100%/, '')`; this removes one literal whole-number 100% at any position, preserving the currency/other-percent veto.")
s=s.replace('    assert.ok(p.trim().length > 2 && p.length <= 44,', '    assert.ok(p.trim().length > 2 && p.length <= 46,')
s=s.replace('    assert.doesNotMatch(p, /[$£€%]/,', "    assert.doesNotMatch(p.replace(/^100% /, ''), /[$£€%]/,")
s=s.replace("Anchors are read at `d707172`. CA-3 lands first and may shift KB line numbers and the `perimeter.test.js`, `kindFilter.test.js` and `OWNED_BY` lines; locate by the quoted text, not the number.", 'All anchors below were located by exact content at HEAD `d707172`; their line numbers are current. Locate by the quoted content if later context moves.')
s=s.replace('- CA-3a and CA-3b committed. STOP BLOCKED if `git diff d707172 -- server/kristy_perimeter_kb.json` shows a change inside any CA-4a id, or `pick_milk`.', '- CA-3a and CA-3b are committed at baseline `d707172`. Before building, STOP BLOCKED if `git diff d707172 -- server/kristy_perimeter_kb.json` shows a change inside any CA-4a id or `pick_milk`. The refresh confirmed those entries are unchanged by CA-3.')
s=s.replace('Env: node ≥20', 'Env: Node 22 (server/package.json; JSON import attributes)')
s=s.replace('STOP BLOCKED and quote the hit.', 'STOP BLOCKED and quote the hit. The refresh amendments below are already incorporated; do not improvise further copy.')
s=s.replace('Read only `read_full` plus the owned files.', 'Read `read_full`, owned files, and the supplied `.pipeline/runs/ca-4a/` build artifacts.')
s=s.replace('No item', 'No item')
# D1 explicitly permits a do rewrite when OBSERVABLE_IN_BOTH fires.
old='Pick the deepest yellow block through the wrapper window. Grass-fed runs near orange.'
new='Look through the wrapper window before choosing a block.'
s=s.replace('Row `grassfed_butter` (:54): headline → the new Butter decision; do column unchanged.', f'Row `grassfed_butter` (:53): headline → the new Butter decision; do column "{old}" → "{new}" (D1: OBSERVABLE_IN_BOTH).')
s=s.replace("const BUTTER_DO = '"+old+"';", "const BUTTER_DO = '"+new+"';")
# Add exact authored cart names to routing metadata; preserve worked examples and matcher.
s=s.replace("  cart_pick: 'Pasture-raised organic corn- and soy-free eggs',", "  cart_pick: 'Pasture-raised organic corn- and soy-free eggs',\n  aliases: [...was('egg_labels').aliases, 'Pasture-raised organic corn- and soy-free eggs'],")
s=s.replace("  cart_pick: 'Plain Greek yogurt, 100% grass-fed',", "  cart_pick: 'Plain Greek yogurt, 100% grass-fed',\n  aliases: [...was(YOG_ID).aliases, 'Plain Greek yogurt, 100% grass-fed'],")
s=s.replace('- `cart_pick`: "Soy-free pasture-raised eggs" → "Pasture-raised organic corn- and soy-free eggs"', '- `cart_pick`: "Soy-free pasture-raised eggs" → "Pasture-raised organic corn- and soy-free eggs"\n- `aliases`: append that exact new cart_pick once. This is the narrow routing exception recorded in Assumptions.')
s=s.replace('- `cart_pick`: "Plain whole-milk Greek yogurt" → "Plain Greek yogurt, 100% grass-fed"', '- `cart_pick`: "Plain whole-milk Greek yogurt" → "Plain Greek yogurt, 100% grass-fed"\n- `aliases`: append that exact new cart_pick once (Assumptions).')
s=s.replace('that the Milk card does not already carry, in that order. Nothing else added.', 'that the Milk card does not already carry, in that order; then append the exact new cart_pick once (Assumptions). No other aliases added.')
s=s.replace("...moved.filter((a) => !b.aliases.includes(a))]);", "...moved.filter((a) => !b.aliases.includes(a)), MILK.cart_pick]);")
s=s.replace('aliases are HEAD plus the absent `pick_milk` aliases', 'aliases are HEAD plus the absent `pick_milk` aliases and the new cart_pick')
s=s.replace('    assert.doesNotMatch(s, /["\']/, s);', '    assert.doesNotMatch(s, /["\']/, s);\n    assert.doesNotMatch(s, /\\b(I|me|my|mine|we|us|our|ours)\\b/i, s);')
s=s.replace('no copy field of a CA-4a id matches the brand grep;', 'no new copy contains first person; no copy field of a CA-4a id matches the brand grep;')
s=s.replace('const BASE_REF', 'const BASE_REF')
# Anchor refresh, exact content and unique occurrence required.
pattern=r'(## ANCHOR ([^:\n]+):)\d+(\n```\n)(.*?)(\n```)'
def anchor(m):
    target=Path(m[2]).read_text()
    assert target.count(m[4])==1,(m[2],target.count(m[4]))
    line=target[:target.index(m[4])].count('\n')+1
    return m[1]+str(line)+m[3]+m[4]+m[5]
s=re.sub(pattern,anchor,s,flags=re.S)
p.write_text(s)
