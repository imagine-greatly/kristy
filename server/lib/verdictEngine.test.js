// Unit tests for the KB-driven verdict engine (pure logic — no network, no model,
// no endpoint). Run with `npm test` (node --test) from server/.

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  matchIngredients,
  scoreVerdict,
  buildUniversalLayer,
  evaluateIngredients,
  tokenizeIngredients,
  kb,
  TIERS,
  buildApprovedRead,
  namesAddedSugar,
} from './verdictEngine.js';
import { hardLineIds } from './hardLines.js';

const sorted = (a) => [...a].sort();

// ── Required case 1: hazelnut coffee creamer → swap_recommended ──────────────
test('creamer (canola oil + cane sugar + carrageenan) → swap_recommended, 3 flags', () => {
  const { matched, unmatched } = matchIngredients('canola oil, cane sugar, carrageenan');

  assert.equal(matched.length, 3, 'three ingredients matched');
  assert.deepEqual(
    sorted(matched.map((e) => e.id)),
    sorted(['canola_oil', 'evaporated_cane_juice', 'carrageenan']),
    'matched the expected KB entries',
  );
  assert.deepEqual(unmatched, [], 'no leftover tokens');

  assert.equal(scoreVerdict(matched), 'swap_recommended');

  const layer = buildUniversalLayer(matched);
  assert.equal(layer.length, 3);
  // Every universal-layer item carries the four factual fields, verbatim.
  for (const item of layer) {
    assert.ok(item.name && item.one_liner, 'name + one_liner present');
    assert.ok(['critical', 'high', 'moderate', 'flag'].includes(item.severity));
    assert.ok(
      ['established', 'credible_concern', 'kristys_standard'].includes(item.evidence_tier),
      `valid evidence_tier: ${item.evidence_tier}`,
    );
  }
  // Correct evidence tiers straight from the KB.
  const tiersById = Object.fromEntries(layer.map((i) => [i.id, i.evidence_tier]));
  assert.equal(tiersById.canola_oil, 'kristys_standard');
  assert.equal(tiersById.evaporated_cane_juice, 'kristys_standard');
  /* CARRAGEENAN WAS `credible_concern` HERE AND THE EVIDENCE DID NOT SUPPORT IT.
     The inflammation and tumor-promotion literature it rested on is overwhelmingly
     about POLIGEENAN — a degraded low-molecular-weight form made with harsh acid and
     heat, not permitted in food and not what a label means by carrageenan. The entry
     asserted the finding flatly, on the additive a skeptical reader is most likely to
     know about, which made it the single line most able to discredit the other 73.
     Re-tiered to the standard it actually is: a processing aid with no nutritional
     purpose, thin and contested evidence, and avoidable on most shelves. */
  assert.equal(tiersById.carrageenan, 'kristys_standard');
  // The creamer's tier is unmoved — canola oil carries `high` on its own, so dropping
  // carrageenan from `high` to `moderate` changes what the card SAYS, not what it scores.
  assert.equal(scoreVerdict(matched), 'swap_recommended');
});

// ── Required case 2: two-ingredient whole-milk yogurt → approved ─────────────
test('yogurt (whole milk + live cultures) → approved, empty flag list', () => {
  const { matched, unmatched } = matchIngredients('organic whole milk, live active cultures');

  assert.equal(matched.length, 0, 'nothing flagged');
  assert.equal(scoreVerdict(matched), 'approved');
  assert.deepEqual(buildUniversalLayer(matched), []);
  assert.ok(unmatched.length >= 1, 'whole-food tokens fall through as unmatched');
});

// ── scoreVerdict ladder (severity-max) ───────────────────────────────────────
test('scoreVerdict maps each severity to the right tier', () => {
  assert.equal(scoreVerdict([]), 'approved');
  assert.equal(scoreVerdict([{ severity: 'flag' }]), 'approved_with_note');
  assert.equal(scoreVerdict([{ severity: 'flag' }, { severity: 'flag' }]), 'approved_with_note');
  assert.equal(scoreVerdict([{ severity: 'moderate' }]), 'use_with_intention');
  assert.equal(scoreVerdict([{ severity: 'moderate' }, { severity: 'flag' }]), 'use_with_intention');
  assert.equal(scoreVerdict([{ severity: 'high' }]), 'swap_recommended');
  assert.equal(scoreVerdict([{ severity: 'high' }, { severity: 'moderate' }]), 'swap_recommended');
  assert.equal(scoreVerdict([{ severity: 'critical' }]), 'skip');
  // A single critical outranks everything else present.
  assert.equal(
    scoreVerdict([{ severity: 'flag' }, { severity: 'high' }, { severity: 'critical' }]),
    'skip',
  );
});

// ── Normalization: E-numbers, parentheses, case, whitespace ──────────────────
test('tokenize strips E-numbers and splits on commas/parentheses', () => {
  const tokens = tokenizeIngredients('Sugar, Soy Lecithin (E322), Carrageenan (e407)');
  assert.ok(tokens.includes('carrageenan'), 'carrageenan survives its E-number');
  assert.ok(!tokens.some((t) => /e\s?-?\d{3}/.test(t)), 'no bare E-number tokens remain');
});

test('matching is case-insensitive and survives E-number annotation', () => {
  const { matched } = matchIngredients('CANOLA OIL, Carrageenan (E407)');
  assert.deepEqual(sorted(matched.map((e) => e.id)), sorted(['canola_oil', 'carrageenan']));
});

test('whole-word matching does not false-positive on substrings', () => {
  // "sugarcane" must NOT match the bare "sugar" alias, and a clearly whole-food
  // token list stays empty.
  const { matched } = matchIngredients('water, sugarcane fiber');
  assert.ok(!matched.some((e) => e.id === 'evaporated_cane_juice' || /sugar/.test(e.id)));
});

test('exact match beats a longer, more-severe alias (no false escalation)', () => {
  // "vegetable oil" must resolve to the Vegetable Oil entry — NOT reverse-match
  // the longer "partially hydrogenated vegetable oil" alias and escalate to a
  // critical skip. Priority: exact > forward > reverse.
  const { matched } = matchIngredients('vegetable oil');
  assert.equal(matched.length, 1);
  assert.notEqual(matched[0].id, 'partially_hydrogenated_oil');
  assert.notEqual(matched[0].severity, 'critical');
});

test('array input is accepted, not just a comma string', () => {
  const { matched } = matchIngredients(['canola oil', 'carrageenan']);
  assert.equal(matched.length, 2);
});

test('duplicate ingredients are matched once', () => {
  const { matched } = matchIngredients('canola oil, canola oil');
  assert.equal(matched.length, 1);
});

// ── evaluateIngredients convenience ──────────────────────────────────────────
test('evaluateIngredients composes tier + stamp + layer + swaps', () => {
  const creamer = evaluateIngredients('canola oil, cane sugar, carrageenan');
  assert.equal(creamer.tier, 'swap_recommended');
  assert.equal(creamer.stamp, false, 'stamp only at approved');
  assert.equal(creamer.universalLayer.length, 3);
  assert.ok(creamer.matched.every((e) => 'swap' in e), 'per-entry swap surfaced for Step 2');

  const yogurt = evaluateIngredients('organic whole milk, live active cultures');
  assert.equal(yogurt.tier, 'approved');
  assert.equal(yogurt.stamp, true, 'approved earns the stamp');
  assert.deepEqual(yogurt.universalLayer, []);
});

// ── KB integrity ─────────────────────────────────────────────────────────────
test('every scoring tier exists in the KB rubric', () => {
  for (const tier of TIERS) assert.ok(tier in kb.kristy_scoring_rubric, `rubric has ${tier}`);
});

test('every ingredient uses a known severity and evidence tier', () => {
  const sev = new Set(Object.keys(kb.severity_levels));
  const ev = new Set(Object.keys(kb.evidence_tiers));
  for (const e of kb.ingredients) {
    assert.ok(ev.has(e.evidence_tier), `${e.id}: evidence_tier ${e.evidence_tier} is defined`);
    if (e.polarity === 'affirming') {
      // An affirmation has no severity and no verdict BY DESIGN. Every severity
      // level in the KB is a concern level, so giving one to a whole food would
      // score it as a concern and cost a clean product its stamp.
      assert.equal(e.severity, undefined, `${e.id}: affirming entry must not carry a severity`);
      assert.equal(e.verdict, undefined, `${e.id}: affirming entry must not carry a verdict`);
      assert.equal(e.swap, undefined, `${e.id}: nothing to swap away from a whole food`);
      continue;
    }
    assert.ok(sev.has(e.severity), `${e.id}: severity ${e.severity} is defined`);
  }
});

// ── Fat philosophy: the real source beats the industrial imitation ───────────
// Two halves of one rule. Margarine is flagged for what it actually is today
// (refined seed oils, colored and flavored to imitate butter) — NOT aliased onto
// partially_hydrogenated_oil, because US margarine was reformulated PHO-free and
// a trans-fat claim would be false. Whole-food cooking fats are the swap targets
// and must never be matched as flags.
test('margarine → skip on Kristys standard, with the butter swap', () => {
  const { matched } = matchIngredients('margarine');

  assert.equal(matched.length, 1, 'margarine matches exactly one entry');
  const m = matched[0];
  assert.equal(m.id, 'margarine');
  assert.notEqual(m.id, 'partially_hydrogenated_oil', 'never resolves to the trans-fat entry');
  assert.equal(m.verdict, 'skip');
  assert.equal(m.severity, 'high');
  assert.equal(m.evidence_tier, 'kristys_standard', 'her standard, not settled science');
  assert.match(m.swap, /butter/i, 'swaps toward the real thing');

  // Severity high (not critical) → swap_recommended, and the seal is withheld.
  assert.equal(scoreVerdict(matched), 'swap_recommended');
  assert.equal(evaluateIngredients('margarine').stamp, false);

  // No trans-fat claim anywhere in the copy the user can see.
  assert.doesNotMatch(m.one_liner, /trans[- ]fat/i, 'one_liner makes no trans-fat claim');

  // category seed_oil → caught by the "no seed oils" hard line and the
  // processed-fats / heart focuses, exactly like its siblings.
  assert.equal(m.category, 'seed_oil');
});

test('every margarine alias resolves to margarine, never to a trans-fat entry', () => {
  for (const alias of ['margarine', 'vegetable oil spread', 'buttery spread', 'plant butter', 'margarine spread']) {
    const { matched } = matchIngredients(alias);
    assert.equal(matched.length, 1, `${alias}: one match`);
    assert.equal(matched[0].id, 'margarine', `${alias} → margarine`);
  }
});

// The whole-food fats ARE the swap targets. They are clean because the KB holds
// no entry for them — this test is the tripwire that keeps it that way. If a
// future entry (positive OR negative) ever matches one of these, a product
// cooked in real butter starts losing its seal. That is the bug this prevents.
test('whole-food cooking fats are never flagged', () => {
  const wholeFoodFats = [
    'butter', 'grass-fed butter', 'unsalted butter', 'ghee', 'clarified butter',
    'beef tallow', 'tallow', 'lard', 'pasture-raised lard', 'duck fat',
    'extra virgin olive oil', 'cold-pressed olive oil', 'olive oil',
    'coconut oil', 'unrefined coconut oil', 'avocado oil', 'cacao butter',
    'cocoa butter',
  ];

  for (const fat of wholeFoodFats) {
    const { matched } = matchIngredients(fat);
    assert.deepEqual(
      matched.map((e) => e.id),
      [],
      `${fat} must not match any KB entry (it is a swap target, not a flag)`,
    );
  }

  // And in situ: a product whose only fat is butter reads clean and keeps the seal.
  const shortbread = evaluateIngredients('wheat flour, butter, cane sugar');
  assert.ok(
    !shortbread.matched.some((e) => e.id === 'butter' || e.category === 'seed_oil'),
    'butter never appears as a flag',
  );
  const allButter = evaluateIngredients('cultured cream, salt');
  assert.equal(allButter.tier, 'approved');
  assert.equal(allButter.stamp, true, 'real butter keeps the stamp');
});

// ── Polarity: the Time-tested tier ───────────────────────────────────────────
// Affirmations are held strictly out of scoring. The whole point of the
// partition is that `matched` still means "concerns" and nothing downstream of
// it had to change.
test('an affirmed whole food never enters scoring and never costs the stamp', () => {
  const honey = evaluateIngredients('raw honey');

  assert.deepEqual(honey.matched, [], 'affirmations never enter `matched`');
  assert.equal(honey.tier, 'approved');
  assert.equal(honey.stamp, true, 'a whole food keeps the seal');
  assert.deepEqual(honey.universalLayer, [], 'never rendered as a concern');

  assert.equal(honey.affirmed.length, 1);
  assert.equal(honey.affirmed[0].id, 'raw_honey');
  assert.equal(honey.affirmationLayer[0].evidence_tier, 'time_tested');
  // No severity/verdict escapes into the layer — it has neither.
  assert.equal(honey.affirmationLayer[0].severity, undefined);
});

test('all seven time_tested foods affirm, and carry history not a health claim', () => {
  const seeded = ['raw_honey', 'bone_broth', 'fermented_foods', 'organ_meats', 'garlic', 'ginger', 'extra_virgin_olive_oil'];
  const byId = Object.fromEntries(kb.ingredients.map((e) => [e.id, e]));

  for (const id of seeded) {
    const e = byId[id];
    assert.ok(e, `${id} exists`);
    assert.equal(e.evidence_tier, 'time_tested');
    assert.equal(e.polarity, 'affirming');
    assert.ok(e.history && e.history.trim(), `${id}: history is the evidence, so it must be present`);
    assert.ok(e.history.split(/\s+/).length <= 60, `${id}: history under ~60 words`);

    // Tradition justifies FOOD-WORTH, never a medical result. No condition
    // names, no cure/treat/prevent verbs, in any user-visible field.
    const copy = [e.one_liner, e.why, e.history, e.kristy_note].filter(Boolean).join(' ');
    assert.doesNotMatch(
      copy,
      /\b(cures?|treats?|heals?|prevents?|reverses?|boosts? immunity|lowers? (your )?risk|inflammation|diabetes|cancer|allergies)\b/i,
      `${id}: tradition may not justify a health-outcome claim`,
    );
    // Never conspiracy framing.
    assert.doesNotMatch(copy, /\b(big pharma|they don't want|the lie|cover.?up|hoax)\b/i, `${id}: no anti-science framing`);
  }
});

test('affirmation is scoped to when the whole food IS the product', () => {
  // Dominant ingredient → affirmed.
  assert.equal(evaluateIngredients('raw honey, cinnamon').affirmed.length, 1);

  // Buried in a processed product → recognized, but no badge. Honey on a candy
  // bar does not get to look like a whole food.
  const bar = evaluateIngredients('oats, cane sugar, raw honey, canola oil, natural flavor, soy lecithin');
  assert.deepEqual(bar.affirmed, [], 'not dominant → no affirmation');
  assert.ok(bar.matched.length >= 3, 'and the concerns still score normally');
  assert.equal(bar.stamp, false);

  // A flavoring that merely names the food is not the food.
  assert.deepEqual(evaluateIngredients('natural ginger flavor').affirmed, []);
  assert.deepEqual(evaluateIngredients('garlic extract').affirmed, []);
});

test('only unambiguous whole-food fat forms are affirmed', () => {
  // Explicit → affirmed.
  for (const t of ['extra virgin olive oil', 'cold-pressed olive oil', 'organic extra virgin olive oil']) {
    const r = evaluateIngredients(t);
    assert.equal(r.affirmed.length, 1, `${t} → affirmed`);
    assert.equal(r.affirmed[0].id, 'extra_virgin_olive_oil');
  }

  // Bare, unverifiable → NEITHER flagged NOR affirmed. This is the reverse-match
  // guard: without it, "olive oil" resolves up to the longer EVOO alias and gets
  // a badge the label never earned.
  for (const t of ['olive oil', 'coconut oil', 'avocado oil']) {
    const r = evaluateIngredients(t);
    assert.deepEqual(r.matched, [], `${t} is not a flag`);
    assert.deepEqual(r.affirmed, [], `${t} is not affirmed either — the label didn't say`);
    assert.equal(r.tier, 'approved');
  }
});

test('affirmations cannot satisfy or violate a hard line, or lift a tier', () => {
  // A product with a real concern AND an affirmation still scores on the concern.
  const r = evaluateIngredients('raw honey, canola oil', { hardLines: ['no seed oils'] });
  assert.equal(r.affirmed.length, 1, 'honey is affirmed');
  assert.equal(r.tier, 'swap_recommended', 'the seed oil still scores');
  assert.equal(r.stamp, false, 'an affirmation never restores a withheld seal');
  assert.equal(r.hardLines.violated.length, 1, 'the hard line still fires');
  // The affirmation is not among the names surfaced for the violation.
  assert.ok(!r.hardLines.violated[0].names.includes('Raw Honey'));
});

/* ── The holistic hard lines (Block 6) ──────────────────────────────────────────
   Every one of these must resolve to REAL KB entries. A chip that escalated nothing
   would be a promise the engine doesn't keep — the same failure mode as the
   advisory-only gluten-free line, except silent. */
test('each holistic hard line resolves to real KB ids', () => {
  const expected = {
    'no msg': ['msg', 'autolyzed_yeast_extract', 'hydrolyzed_vegetable_protein'],
    'no natural flavors': ['natural_flavors'],
    'no gums': ['xanthan_gum', 'guar_gum', 'carboxymethylcellulose'],
  };
  for (const [line, ids] of Object.entries(expected)) {
    const got = hardLineIds([line]);
    for (const id of ids) assert.ok(got.has(id), `"${line}" must cover ${id}`);
  }
  // Sugar under its other names — the whole category, so it grows with the KB.
  const sugar = hardLineIds(['no refined sugar']);
  for (const id of ['high_fructose_corn_syrup', 'corn_syrup', 'evaporated_cane_juice', 'brown_rice_syrup'])
    assert.ok(sugar.has(id), `"no refined sugar" must cover ${id}`);
});

test('a declared holistic line escalates the tier and names the ingredient', () => {
  const cases = [
    ['no gums', 'Water, cream, guar gum, sea salt', 'Guar Gum'],
    ['no msg', 'Chicken broth, salt, autolyzed yeast extract', 'Autolyzed Yeast Extract'],
    ['no natural flavors', 'Sparkling water, natural flavors', 'Natural Flavors'],
    ['no refined sugar', 'Oats, brown rice syrup, almonds', 'Brown Rice Syrup'],
  ];
  for (const [line, ingredients, named] of cases) {
    const base = evaluateIngredients(ingredients, { hardLines: [] });
    const held = evaluateIngredients(ingredients, { hardLines: [line] });
    assert.notEqual(held.tier, 'approved', `${line}: the seal must be withheld`);
    assert.ok(
      TIERS.indexOf(held.tier) > TIERS.indexOf(base.tier),
      `${line}: declaring it must escalate (${base.tier} → ${held.tier})`
    );
    const hit = (held.hardLines?.violated || []).find((v) => v.value === line);
    assert.ok(hit, `${line}: must be reported as violated`);
    assert.ok(hit.names.includes(named), `${line}: must name "${named}", got ${hit.names.join(', ')}`);
  }
});

test('no MSG covers the hidden forms because the KB itself says they are MSG', () => {
  // Not an inference we added: the KB entry for autolyzed yeast extract states it
  // releases free glutamic acid, "the same component as MSG". Matching it under this
  // line names what the KB already holds rather than authoring a new claim.
  const ids = hardLineIds(['no msg']);
  assert.ok(ids.has('autolyzed_yeast_extract') && ids.has('hydrolyzed_vegetable_protein'));
  const kbText = JSON.stringify(kb.ingredients.find((e) => e.id === 'autolyzed_yeast_extract'));
  assert.match(kbText, /glutamic acid/i, 'the KB must be the source of the MSG equivalence');
});

test('a hard line a GUEST declared is honored — a refusal is not a paid feature', () => {
  // Strangers set hard lines during onboarding now, before any account exists. The
  // guest verdict path used to evaluate with no options at all, so a product the
  // shopper had explicitly refused could come back approved. Hard lines resolve from
  // the KB with no model call, so honoring them costs nothing and gates nothing.
  const ingredients = 'Water, cream, guar gum, sea salt';
  const ignored = evaluateIngredients(ingredients);
  const honored = evaluateIngredients(ingredients, { hardLines: ['no gums'] });
  assert.ok(
    TIERS.indexOf(honored.tier) > TIERS.indexOf(ignored.tier),
    `declaring the line must escalate (${ignored.tier} → ${honored.tier})`
  );
  assert.notEqual(honored.tier, 'approved', 'the seal is withheld');
  const hit = (honored.hardLines?.violated || []).find((x) => x.value === 'no gums');
  assert.ok(hit && hit.names.includes('Guar Gum'), 'the violated line names the ingredient');
});

/* ═══════════ REVERSE MATCHING IS GONE, AND BOTH DIRECTIONS ARE PINNED ═══════════

   Measured over 18 real products: stage attribution was EXACT 30, FORWARD 9, REVERSE 2
   — and both reverse hits were false claims about a real label.

   The pair below is the whole argument, and it came out of ONE scan session:

     Cheerios prints "Corn Starch". The token resolved UP to the alias "modified corn
     starch" and the card told the shopper the label "won't tell you the source grain".
     The label names the grain. A false concern, invented by the matcher — downstream
     of every guard the claim lock owns, because the claim lock only stops the MODEL.

     Great Value's oat cereal prints "modified cornstarch", one word, and matched
     NOTHING — earning the gold seal for the product that actually contains it.

   So the same entry flagged the product without it and missed the product with it.
   Removing reverse fixes the first; despaced-exact fixes the second.

   REVERSE WAS ALSO PAPERING OVER MISSING ALIASES, which is the deeper reason it had to
   go: "cane sugar" and "enriched wheat flour" are ordinary US label terms that were
   only ever reachable by escalating a token to a longer alias. They are authored now,
   so they match EXACTLY — on the evidence the label actually gives.                 */

test('a label term is never escalated to a more specific one it did not say', () => {
  // Plain corn starch is not modified food starch, and must not be flagged as it.
  assert.deepEqual(matchIngredients('corn starch').matched, []);
  assert.deepEqual(
    matchIngredients('Whole Grain Oats, Corn Starch, Sugar, Salt').matched.map((e) => e.id),
    [],
    'the real Cheerios list flags nothing',
  );
});

test('a compound spelling still matches — the miss does not become the new failure', () => {
  const one = matchIngredients('modified cornstarch').matched.map((e) => e.id);
  assert.deepEqual(one, ['modified_food_starch'], '"cornstarch" is "corn starch"');
  const two = matchIngredients('modified corn starch').matched.map((e) => e.id);
  assert.deepEqual(two, ['modified_food_starch'], 'and the spaced spelling is unchanged');
  // Bare cornstarch is NOT modified food starch and must stay unmatched — despacing is
  // equality, never containment, so it cannot manufacture the escalation just removed.
  assert.deepEqual(matchIngredients('cornstarch').matched, []);
});

test('the terms reverse used to reach are authored aliases now', () => {
  assert.deepEqual(
    matchIngredients('cane sugar').matched.map((e) => e.id),
    ['evaporated_cane_juice'],
  );
  assert.deepEqual(
    matchIngredients('enriched wheat flour').matched.map((e) => e.id),
    ['enriched_bleached_flour'],
  );
});

/* ═══════════ A DISPLAY NAME IS A CLAIM ═══════════

   `enriched_bleached_flour` rendered "Enriched Bleached Flour" — with a one-liner
   asserting the flour was bleached — on Oreo ("unbleached enriched flour") and Kraft
   Mac ("Enriched Wheat Flour"). The `why` was defensible: refining strips the germ and
   bran, and that is true of unbleached flour too. The NAME was not.

   The corpus already had the right home for the bleaching claim in a separate
   `bleached_flour` entry, so the aliases that genuinely mean bleached moved there. */

test('an unbleached label is never told its flour was bleached', () => {
  for (const label of [
    'unbleached enriched flour',
    'enriched wheat flour',
    'unbleached enriched wheat flour',
  ]) {
    const hit = matchIngredients(label).matched;
    assert.equal(hit.length, 1, `${label} matches one entry`);
    assert.equal(hit[0].id, 'enriched_bleached_flour');
    assert.doesNotMatch(hit[0].name, /bleach/i, `"${hit[0].name}" must not claim bleaching`);
    assert.doesNotMatch(hit[0].one_liner, /\bbleached,/i, 'nor may the one-liner assert it');
  }
  // A label that DOES say bleached still gets the entry that means it.
  assert.deepEqual(
    matchIngredients('bleached flour').matched.map((e) => e.id),
    ['bleached_flour'],
  );
});

/* ═══════════ THE APPROVED STATE REPORTS, IT DOES NOT CLAIM ═══════════

   `approved` means ZERO of 74 KB entries matched. The seal says "Kristy Approved" and
   the prose under it said "This one is clean. No industrial additives, no processing
   tricks — just real food." Eight of ten approved products got that near-verbatim,
   varying only the closer, and one of them was a strawberry jam.

   The second line is read off the label, so it cannot become a template. */

test('the approved read says what was checked and what is in it', () => {
  const cheerios = buildApprovedRead('Whole Grain Oats, Corn Starch, Sugar, Salt, Wheat Starch.');
  assert.equal(cheerios.checked, 'Read all 5. None of them are on the list.');
  assert.equal(cheerios.names, 'whole grain oats, corn starch, sugar, salt, wheat starch.');

  // n=1 — the counting line reads absurd, so it does not appear.
  const oats = buildApprovedRead('whole grain rolled oats,');
  assert.equal(oats.checked, 'One ingredient: whole grain rolled oats.');
  assert.equal(oats.names, '');

  // Long lists stop at five. Ingredient lists are weight-ordered, so the first five
  // ARE the product — naming all 29 would be the six-essays problem in a new place.
  const long = buildApprovedRead('a, b, c, d, e, f, g, h, i, j');
  assert.equal(long.checked, 'Read all 10. None of them are on the list.');
  assert.equal(long.names, 'a, b, c, d, e…');

  // It only exists where it applies.
  assert.ok(evaluateIngredients('Oats, salt').approvedRead, 'present on approved');
  assert.equal(evaluateIngredients('canola oil').approvedRead, null, 'absent otherwise');
});

/* ═══════════ A NUMBER MAY WITHHOLD A SEAL THE INGREDIENTS GRANTED ═══════════

   The widest hole under the seal was a product whose ingredients are real, complete,
   and simply outside the KB. Kirkland Strawberry Spread took the gold seal on
   "Strawberries, sugar, fruit pectin citric acid".

   POSITION WAS THE OBVIOUS FIX AND IT IS THE WRONG ONE. "Sugar in the first three"
   withholds 2 of 10 seals across the sample and one of them is Cheerios, where sugar
   is third by weight at 3.6 g/100g — trading one false claim for another. Quantity
   separates them cleanly at a threshold this file already had.                     */

test('added sugar withholds the seal by QUANTITY, never by position', () => {
  const jam = { addedSugar: 44.4 };
  const cereal = { addedSugar: 3.57 };

  // The real Kirkland list: sugar is second AND the product is 44 g/100g.
  const spread = evaluateIngredients('Strawberries, sugar, fruit pectin citric acid', { nutrition: jam });
  assert.equal(spread.tier, 'approved', 'the ingredient engine still finds nothing');
  assert.equal(spread.stamp, false, 'but the seal is withheld');
  assert.equal(spread.sugarHeavy, true);

  // The real Cheerios list: sugar is THIRD, and the product is 3.6 g/100g.
  const cheerios = evaluateIngredients('Whole Grain Oats, Corn Starch, Sugar, Salt', { nutrition: cereal });
  assert.equal(cheerios.stamp, true, 'position alone must never cost a seal');
  assert.equal(cheerios.sugarHeavy, false);
});

test('BOTH conditions are required, which is what spares whole fruit', () => {
  // Sugar-heavy by the numbers, no added sugar NAMED — a bag of fruit. The gate is the
  // only thing standing between "we read the label" and "we flagged a strawberry".
  const fruit = evaluateIngredients('Strawberries', { nutrition: { addedSugar: 44.4 } });
  assert.equal(fruit.stamp, true, 'no added sugar on the label ⇒ the number is not ours to read');
  assert.equal(fruit.sugarHeavy, false);

  // Added sugar named, quantity absent (OFF populates added-sugars on almost nothing,
  // and a missing number is not evidence of a small one).
  const unknown = evaluateIngredients('Oats, sugar', { nutrition: null });
  assert.equal(unknown.sugarHeavy, false, 'no number ⇒ no withholding');

  // A KB sugar_alias term counts as "named" too, not just the plain word.
  assert.ok(namesAddedSugar(['strawberries', 'evaporated cane juice']));
  assert.ok(namesAddedSugar(['water', 'organic cane sugar']), 'a qualifier does not hide it');
  assert.equal(namesAddedSugar(['strawberries', 'pectin']), false);
});
