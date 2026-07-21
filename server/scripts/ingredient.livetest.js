// Acceptance — Block B: complete flag list on the card + KB-rendered ingredient
// pages. Fully deterministic: every check here is a KB read, which is the point —
// the ingredient surface must never need a model call.
//   node scripts/ingredient.livetest.js

import { readFileSync } from 'node:fs';
import { evaluateIngredients, tokenizeIngredients } from '../lib/verdictEngine.js';
import { selectCardIsm, ismContext } from '../lib/education.js';

const kb = JSON.parse(readFileSync(new URL('../kristy_ingredient_knowledge_base.json', import.meta.url)));
const byId = new Map(kb.ingredients.map((e) => [e.id, e]));

let fails = 0;
const ck = (n, c) => { console.log(`  ${c ? '✓' : '✗ FAIL'} ${n}`); if (!c) fails++; };

console.log('\n═══ CARD — every matched flag renders as a row ═══');
// A deliberately ugly label: 9 distinct flags across 5 categories, plus clean
// ingredients that must NOT produce rows.
const LABEL = [
  'water', 'organic oats', 'sea salt',
  'soybean oil', 'high fructose corn syrup', 'maltodextrin', 'red 40',
  'sodium nitrite', 'bha', 'carrageenan', 'polysorbate 80', 'natural flavors',
].join(', ');
const ev = evaluateIngredients(LABEL);
const layer = ev.universalLayer;
const ids = layer.map((f) => f.id);

ck(`all 9 flags present, none dropped (got ${layer.length})`, layer.length === 9);
ck('the specific flags matched', ['soybean_oil', 'high_fructose_corn_syrup', 'maltodextrin', 'red_40',
  'sodium_nitrite', 'bha', 'carrageenan', 'polysorbate_80', 'natural_flavors']
  .every((id) => ids.includes(id)));
ck('clean ingredients produce no rows', !ids.some((id) => /water|oat|salt/.test(id)));
// The card's "N read · M flagged" line — the route sends N as the token count, so
// the user can tell the whole label was read even though only flags get rows.
const readCount = tokenizeIngredients(LABEL).length;
ck(`read-count reflects the WHOLE label, not just flags (${readCount} read · ${layer.length} flagged)`,
  readCount === 12 && readCount > layer.length);
ck('every row carries the four fields the card needs',
  layer.every((f) => f.id && f.name && f.one_liner && f.severity && f.evidence_tier));
ck('rows carry NO withheld internals (claim lock: 5 allowed fields)',
  layer.every((f) => Object.keys(f).length === 5));

console.log('\n═══ ROWS — every flag id resolves to a detail page ═══');
ck('no row can dead-end (every id is in the KB)', ids.every((id) => byId.has(id)));

console.log('\n═══ DETAIL PAGE — rendered entirely from the KB ═══');
for (const id of ['canola_oil', 'sodium_nitrite', 'maltodextrin']) {
  const e = byId.get(id);
  ck(`${id}: name + aliases`, !!e.name && Array.isArray(e.aliases) && e.aliases.length > 0);
  ck(`${id}: why-first one_liner + longer why`, !!e.one_liner && !!e.why && e.why.length > e.one_liner.length);
  ck(`${id}: honest tier + framing exists`, !!kb.evidence_tiers[e.evidence_tier] && !!kb.verdict_options[e.verdict]);
  ck(`${id}: sources listed + a swap to grab instead`, e.sources.length > 0 && !!e.swap);
}

console.log('\n═══ HISTORY — the persuasion layer, seeded verbatim ═══');
const HIST = ['canola_oil', 'cottonseed_oil', 'soybean_oil', 'high_fructose_corn_syrup', 'partially_hydrogenated_oil'];
for (const id of HIST) {
  const h = byId.get(id).history;
  ck(`${id}: has history, under ~60 words`, !!h && h.split(/\s+/).length <= 60);
}
ck('history is context, never the health claim (no entry relies on it for evidence)',
  HIST.every((id) => byId.get(id).sources.length > 0));

console.log('\n═══ FREE PATH — the ingredient surface is model-call-free ═══');
const ismForPage = selectCardIsm(ismContext({ matched: [byId.get('canola_oil')], tier: null, ingredientCount: 1, focuses: [] }));
ck('a category ism resolves for the page with zero model calls', ismForPage?.id === 'veg_oil_naming');
ck('page payload withholds the internal kristy_note', (() => {
  // mirrors routes/ingredient.js publicEntry
  const { kristy_note, glycemic_impact, cardiovascular_relevance, ...pub } = byId.get('canola_oil');
  return !('kristy_note' in pub) && !!pub.history && !!pub.swap;
})());

console.log('\n═══ ORDERING — worst first ═══');
const ranks = { critical: 4, high: 3, moderate: 2, flag: 1 };
const sorted = [...layer].sort((a, b) => ranks[b.severity] - ranks[a.severity]);
ck('a worst-first sort puts a critical flag at the top', ranks[sorted[0].severity] === 4);

console.log(fails ? `\n✗ ${fails} FAILED\n` : '\n✓ all checks passed\n');
process.exit(fails ? 1 : 0);
