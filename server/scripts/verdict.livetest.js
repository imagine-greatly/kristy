// Live acceptance check for Step 2 — exercises the REAL Haiku note call, no server,
// no auth, no DB (just the engine + composeNote, exactly what the route runs).
//
// Run from server/ with the system CA trusted (corporate TLS) and .env loaded:
//   node --use-system-ca scripts/verdict.livetest.js
// Requires ANTHROPIC_API_KEY in server/.env. Skips cleanly if it's missing.
//
// Checks Step 2's acceptance:
//   • creamer + goal "cutting" → swap_recommended, stamp:false, 3 universal items,
//     a goal-aware note, and a swap drawn from the KB.
//   • yogurt → approved, stamp:true, swap:null.
//   • an injected off-KB "concern" never appears anywhere in the model output.

import 'dotenv/config';
import { evaluateIngredients } from '../lib/verdictEngine.js';
import { composeNote } from '../lib/verdictNote.js';

if (!process.env.ANTHROPIC_API_KEY) {
  console.error('ANTHROPIC_API_KEY not set — skipping live test.');
  process.exit(0);
}

const line = (s) => console.log(`\n${'─'.repeat(64)}\n${s}\n${'─'.repeat(64)}`);
const show = (label, v) => console.log(`  ${label}:`, v);

let failures = 0;
const check = (name, cond) => {
  console.log(`  ${cond ? '✓' : '✗ FAIL'} ${name}`);
  if (!cond) failures += 1;
};

async function run(label, ingredients, goal, { poison = false } = {}) {
  line(`${label}  (goal: "${goal}")`);
  const evald = evaluateIngredients(ingredients);
  show('tier', evald.tier);
  show('stamp', evald.stamp);
  show('universalLayer', evald.universalLayer.map((i) => `${i.name} [${i.evidence_tier}]`));

  // Optionally plant an off-KB concern on a matched entry to prove the claim lock:
  // sanitizeFlagged strips it before the model is ever called.
  const matched = poison
    ? evald.matched.map((e, i) =>
        i === 0 ? { ...e, INJECTED: 'ASBESTOS_LINKED_DO_NOT_SURFACE' } : e
      )
    : evald.matched;

  const { note, swap } = await composeNote({
    tier: evald.tier,
    goal,
    nonNegotiables: ['no seed oils'],
    matched,
  });
  show('note', note);
  show('swap', swap);

  if (poison) {
    const leaked = /ASBESTOS_LINKED_DO_NOT_SURFACE/i.test(`${note} ${swap || ''}`);
    check('injected off-KB concern absent from model output', !leaked);
  }
  return { evald, note, swap };
}

try {
  const creamer = await run('CREAMER', 'canola oil, cane sugar, carrageenan', 'cutting', { poison: true });
  check('creamer tier === swap_recommended', creamer.evald.tier === 'swap_recommended');
  check('creamer stamp === false', creamer.evald.stamp === false);
  check('creamer has 3 universal-layer items', creamer.evald.universalLayer.length === 3);
  check('creamer note is non-empty', Boolean(creamer.note?.trim()));
  check('creamer note references the goal', /cut/i.test(creamer.note));
  check('creamer has a swap', Boolean(creamer.swap?.trim()));

  const yogurt = await run('YOGURT', 'organic whole milk, live active cultures', 'cutting');
  check('yogurt tier === approved', yogurt.evald.tier === 'approved');
  check('yogurt stamp === true', yogurt.evald.stamp === true);
  check('yogurt swap === null', yogurt.swap === null);

  line(failures === 0 ? 'ALL CHECKS PASSED ✓' : `${failures} CHECK(S) FAILED ✗`);
  process.exit(failures === 0 ? 0 : 1);
} catch (err) {
  console.error('\nLive test error:', err?.message || err);
  process.exit(1);
}
