// Grocery-coach chat behavior — deterministic checks (no model calls).
//   node --test lib/groceryChat.test.js
//
// The LIVE end-to-end verification (real messages through the model) lives in
// scripts/groceryChat.livetest.js.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CHAT_SYSTEM_PROMPT, buildPreferencesBlock } from './prompts.js';
import { looksLikePerimeterQuestion } from './chatRouting.js';

const HARD_RULES = ['CLAIM LOCK', 'NO TREATMENT', 'NO PRICE', 'FAT PHILOSOPHY', 'NO MORALIZING'];

test('identity is the grocery coach, not the calorie tracker', () => {
  const p = CHAT_SYSTEM_PROMPT({ macroTracking: false });
  assert.match(p, /grocery and food coach/i);
  assert.match(p, /no barcode/i);
  // The old tracker framing is gone.
  assert.doesNotMatch(p, /OPTIMIZATION LOOP/);
  assert.doesNotMatch(p, /separates Kristy from every calorie tracker/);
});

test('the hard rules are restated in BOTH modes', () => {
  for (const macroTracking of [false, true]) {
    const p = CHAT_SYSTEM_PROMPT({ macroTracking });
    for (const rule of HARD_RULES) assert.ok(p.includes(rule), `${rule} missing (macroTracking=${macroTracking})`);
  }
});

test('macro tracking OFF: coach mode, macros forbidden in the contract', () => {
  const p = CHAT_SYSTEM_PROMPT({ macroTracking: false });
  assert.match(p, /MACRO TRACKING IS OFF/);
  assert.match(p, /hasFood is ALWAYS false/);
  assert.match(p, /Macro tracking in Settings/); // the once-only pointer
  // No meal-logging JSON branch, no weight machinery.
  assert.doesNotMatch(p, /"hasFood": true/);
  assert.doesNotMatch(p, /WEIGHT LOGGING AND OPTIMIZATION/);
});

test('macro tracking ON: logging + weight machinery restored', () => {
  const p = CHAT_SYSTEM_PROMPT({ macroTracking: true, goalsBlock: 'g', todayBlock: 't', historyBlock: 'h' });
  assert.match(p, /MACRO TRACKING IS ON/);
  assert.match(p, /"hasFood": true/);
  assert.match(p, /WEIGHT LOGGING AND OPTIMIZATION/);
  assert.match(p, /USDA/);
});

test('preferences block renders the taxonomy labels Kristy speaks through', () => {
  const block = buildPreferencesBlock({
    goal: 'high_protein',
    focuses: ['lower_sugar', 'lower_sodium'],
    hardLines: ['no_seed_oils'],
    constraints: ['budget'],
  });
  assert.match(block, /High-protein/);
  assert.match(block, /added sugar/i);
  assert.match(block, /sodium/i);
  assert.match(block, /budget/i);
  assert.match(block, /never diagnoses/i); // no-treatment framing
});

test('preferences block: nothing set → an honest, non-pushy line', () => {
  const block = buildPreferencesBlock({});
  assert.match(block, /hasn't set a goal or preferences/i);
  assert.doesNotMatch(block, /Shopping toward/);
});

test('perimeter routing fires on questions, never on meals or list commands', () => {
  // Questions → route to the KB.
  assert.equal(looksLikePerimeterQuestion('is wild or farmed salmon better'), true);
  assert.equal(looksLikePerimeterQuestion('Which cut of beef for stew?'), true);
  assert.equal(looksLikePerimeterQuestion('what should I buy this week'), true);
  assert.equal(looksLikePerimeterQuestion('are brown eggs worth it'), true);
  // Statements and commands → NOT the perimeter path.
  assert.equal(looksLikePerimeterQuestion('I had chicken and rice for lunch'), false);
  assert.equal(looksLikePerimeterQuestion('add chicken to my list'), false);
  assert.equal(looksLikePerimeterQuestion('swap the rice for something faster'), false);
});
