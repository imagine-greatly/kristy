import { data, before, project } from './project.mjs';
import * as lint from '../../../server/lib/counterCardLint.js';
import { projectEntry } from '../../../server/lib/counterCards.js';
import { assertPassRule } from '../../../server/test/acceptance/passRule.js';
import { matchItemToCard, matchItemToPick } from '../../../server/lib/listMatch.js';
const { kb, doLines } = project();
const out = { cards: {}, sections: lint.lintSections([data.TIP], kb.entries), milkRows: {}, cartPicks: {} };
for (const id of data.CHANGED) {
  const e = kb.entries.find(e => e.id === id);
  const hits = [...lint.lintCard(projectEntry(e, { doLine: doLines[id] })), ...lint.readability(e), ...lint.lintPickSteps(e), ...lint.lintCulinaryAim(e), ...lint.lintRepeatedClaim(e)];
  try { assertPassRule(null, before.entries.find(e => e.id === id), e); } catch (err) { hits.push({ passRule: err.message }); }
  out.cards[id] = hits;
}
for (const row of data.MILK_ROWS) out.milkRows[row] = { card: matchItemToCard(row)?.slug ?? null, pick: matchItemToPick(row)?.id ?? null };
for (const id of ['egg_labels', data.MILK_ID, data.YOG_ID, 'grassfed_butter']) {
  const e = kb.entries.find(e => e.id === id);
  out.cartPicks[id] = { text: e.cart_pick, length: e.cart_pick.length, match: matchItemToCard(e.cart_pick)?.slug ?? null };
}
console.log(JSON.stringify(out, null, 2));
