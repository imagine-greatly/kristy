import { readFileSync } from 'node:fs';
import * as lint from '../../../server/lib/counterCardLint.js';
import * as listMatch from '../../../server/lib/listMatch.js';
const kb = JSON.parse(readFileSync('/Users/m1/kristy/server/kristy_perimeter_kb.json', 'utf8'));
const BATCH = ['pork_cuts_and_enhanced', 'pick_sausage', 'pick_jerky', 'chicken_cuts_basics', 'chicken_breast', 'rotisserie_chicken', 'turkey_whole', 'ground_turkey', 'bacon', 'ham', 'hot_dogs', 'turkey_bacon', 'cured_pork', 'deli_meat_uncured'];
const words = (s) => String(s || '').trim().split(/\s+/).filter(Boolean).length;
const out = { cards: {}, sections: {}, cartPickMatch: {} };
for (const id of BATCH) {
  const e = kb.entries.find((x) => x.id === id);
  if (!e) { out.cards[id] = 'ABSENT'; continue; }
  out.cards[id] = { decision: words(e.decision), tier_note: words(e.tier_note), instead: words(e.instead), pick_steps: (e.pick_steps || []).length, cart_pick: e.cart_pick ?? null };
  if (e.cart_pick && typeof listMatch.matchItemToCard === 'function') {
    try { const m = listMatch.matchItemToCard(e.cart_pick); out.cartPickMatch[id] = m?.id ?? m?.slug ?? m?.perimeterId ?? JSON.stringify(m); } catch (err) { out.cartPickMatch[id] = `THREW ${err.message}`; }
  }
}
const tip = { section: 'meat', rule: 'A local butcher comes first; at the case, choose meat from animals raised on grass and open pasture.', checks: ['Ask what the animal ate and how it lived; a butcher counter can answer.', 'Organs come from the same animal; liver and heart belong in the cart too.', 'On packaged meat, look for an ingredient list of meat, salt, and spices.'], tip_aligned: true, cards_aligned: true };
for (const h of lint.lintSections([tip], kb.entries)) {
  const k = `${h.code}:${h.id ?? (h.ids || []).join('+')}`;
  out.sections[k] = (out.sections[k] || 0) + 1;
}
console.log(JSON.stringify(out, null, 2));
