import { readFileSync } from 'node:fs';
import { projectEntry } from '/Users/m1/kristy/server/lib/counterCards.js';
import { lintCard, readability } from '/Users/m1/kristy/server/lib/counterCardLint.js';
const kb = JSON.parse(readFileSync('/Users/m1/kristy/server/kristy_perimeter_kb.json','utf8'));
const d = JSON.parse(readFileSync('/Users/m1/kristy/server/lib/doLines.json','utf8'));
const notes=kb.entries.map(e=>String(e.tier_note||'').trim());
for (const id of ['nuts_raw_vs_roasted','honey_adulteration','bulk_bins_buying','olive_oil_grades','nut_butter_ingredients','bottled_water_buying','tea','coffee_beans']){const e=kb.entries.find(x=>x.id===id);
console.log(id, e.tier_note.split(/\s+/).length+'w', JSON.stringify(lintCard(projectEntry(e,{doLine:d[id]}))), JSON.stringify(readability(e)), notes.filter(n=>n===e.tier_note.trim()).length, /healthier|healthiest|better for you|chemically ripened|lowers|exposure/i.test(e.decision+' '+e.tier_note));}
