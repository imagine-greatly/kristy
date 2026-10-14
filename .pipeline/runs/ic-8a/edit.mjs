import { readFileSync, writeFileSync } from 'node:fs';
const p='/Users/m1/kristy/server/kristy_perimeter_kb.json'; let s=readFileSync(p,'utf8');
const R=[
['Coffee beans in a sealed bag that limits air exposure.','Coffee beans in a sealed bag, kept closed between uses.'],
['What the nuts were roasted in is on the ingredient line. Avoiding those oils is the standard.','What the nuts were roasted in is on the ingredient line, and avoiding those oils is the standard.'],
['Honey earned its place in the pantry long before anyone studied it. The age is the argument, never a health outcome.','Honey earned its pantry place long before anyone studied it; the age is the argument, never a health outcome.'],
['Rancidity in a slow bin is real. Which bins to trust is a shopping standard, not a rule.','Rancidity in a slow bin is real, and which bins to trust is a shopping standard, not a rule.'],
['The grades are legal definitions with a taste panel behind them, and the origin wording is regulated. Both are readable off the bottle.','The extra virgin grade is a legal definition backed by a taste panel, and the “product of” wording is regulated.'],
['What holds no-stir texture together is on the list. Wanting only peanuts is the standard.','What holds no-stir texture together is on the list, and wanting only peanuts is the standard.'],
['The label definitions behind this are federal. The standard being held is about the source and the container, never a claim about health.','Federal label definitions name spring water by its source; the standard here is source and container, never a health claim.'],
];
for(const [a,b] of R){const n=s.split(JSON.stringify(a).slice(1,-1)).length-1; if(n!==1)throw new Error(n+' hits: '+a); s=s.replace(JSON.stringify(a).slice(1,-1),JSON.stringify(b).slice(1,-1));}
writeFileSync(p,s); JSON.parse(s); console.log('ok');
