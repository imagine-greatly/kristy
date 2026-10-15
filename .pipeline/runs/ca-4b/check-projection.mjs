import { SPEC, IDS, project, before, TIP } from './project.mjs';
import * as lint from '../../../server/lib/counterCardLint.js';
import { projectEntry } from '../../../server/lib/counterCards.js';
import { assertPassRule } from '../../../server/test/acceptance/passRule.js';
import { matchItemToCard } from '../../../server/lib/listMatch.js';
const { kb, doLines } = project();
const findings = [];
const add = (id, check, hits) => { if (hits.length) findings.push({ id, check, hits }); };
for (const id of IDS) {
  const e = kb.entries.find(e => e.id === id);
  try { assertPassRule(null, before.entries.find(e => e.id === id), e); } catch (e) { add(id, 'passRule', [e.message]); }
  for (const f of [lint.readability, lint.lintPickSteps, lint.lintCulinaryAim, lint.lintRepeatedClaim]) add(id, f.name, f(e));
  add(id, 'lintCard', lint.lintCard(projectEntry(e, { doLine: doLines[id] })));
  if (e.why.length > 120) add(id, 'counterDecision', [e.why.length, e.why]);
  if (e.decision.length > 90) add(id, 'counterDecision', [e.decision.length, e.decision]);
  if (/[$£€%]/.test(e.cart_pick.replace(/^100% /, ''))) add(id, 'counterPath', [e.cart_pick]);
  if (e.cart_pick.length > 46) add(id, 'cart_pick length', [e.cart_pick.length]);
  if (SPEC[id].cart_pick) add(id, 'cart_pick match (diagnostic)', [{text: e.cart_pick, slug: matchItemToCard(e.cart_pick)?.slug ?? null}]);
  const front = [e.decision, e.tier_note, e.instead, e.cart_pick, ...e.pick_steps, doLines[id]];
  add(id, 'protein on free front', front.filter(s => /protein/i.test(s)));
}
add('eggs_dairy', 'lintSections', lint.lintSections([TIP], kb.entries));
add('corpus', 'lintCorpus', lint.lintCorpus(kb.entries.filter(e => e.kind !== 'pick').map(e => projectEntry(e, {doLine: doLines[e.id]}))).violations);
console.log(JSON.stringify(findings, null, 2));
