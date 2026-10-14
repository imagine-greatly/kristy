import json,re
p='/Users/m1/kristy/server/kristy_perimeter_kb.json'
raw=open(p,encoding='utf8').read()
kb=json.loads(raw)
T={
'freezing_produce':"That enzymes survive freezing and a brief scald denatures them is settled food preservation science, and almost every home freeze skips that step.",
'label_nonGMO_vs_organic':"The organic standard already contains the non-GMO rule, an overlap that is defined, not argued.",
'label_multigrain_vs_whole_grain':"Whole grain carries a definition and multigrain does not, and that gap is the entire difference.",
'label_lightly_sweetened':"The phrase has no legal definition, while the added-sugars number does and cannot be spun.",
'revive_greens':"Water pressure holding a leaf rigid is basic plant physiology, though it never makes an old leaf new.",
'label_cold_pressed_expeller':"Pressing and solvent extraction are distinct processes, and ‘refined’ is the disclosed one, but which oil it is settles the purchase first.",
'label_sugar_free_substitutes':"Sugar-free is a defined claim about what came out, while the ingredient list names what went in.",
'label_made_with_real':"Ingredient lists run in weight order by law, so how far down it sits shows the amount.",
'label_organic_scope':"What the organic seal covers and excludes is written into the standard, approved pesticides included.",
'label_ingredient_order':"Weight order is required by law, which is what makes ingredients readable by position.",
'label_third_party_seals':"Who writes a standard and who audits it is public for every program worth the seal.",
'label_artificial_color':"Which colors may be declared as “artificial color” is written into federal labeling regulation, not inferred from practice.",
}
for e in kb['entries']:
    if e['id'] in T:
        old=e['tier_note']; new=T.pop(e['id'])
        # replace JSON-encoded string in place to keep formatting
        oj=json.dumps(old,ensure_ascii=False); nj=json.dumps(new,ensure_ascii=False)
        assert raw.count('"tier_note": '+oj)==1, e['id']
        raw=raw.replace('"tier_note": '+oj,'"tier_note": '+nj)
assert not T, T
open(p,'w',encoding='utf8').write(raw)
json.loads(raw)
print('ok')
