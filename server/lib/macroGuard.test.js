// The structural no-macro backstop — pure functions, no model calls.
//   node --test lib/macroGuard.test.js

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  userAskedAboutMacros,
  volunteeredMacroAccounting,
  stripMacroSentences,
} from './macroGuard.js';

test('detects volunteered macro accounting in prose', () => {
  assert.equal(volunteeredMacroAccounting('That keeps your carbs reasonable too.'), true);
  assert.equal(volunteeredMacroAccounting("That's a lot of protein for the calories."), true);
  assert.equal(volunteeredMacroAccounting("You're within your carbs for the day."), true);
  assert.equal(volunteeredMacroAccounting('About 200 calories in that.'), true);
  assert.equal(volunteeredMacroAccounting('That gets you 30g of protein.'), true);
});

test('leaves ordinary food talk and KB concern framing alone', () => {
  assert.equal(volunteeredMacroAccounting('Chicken thighs are a great protein — grab those.'), false);
  assert.equal(volunteeredMacroAccounting('This has added sugar, so it runs sweet for you.'), false);
  assert.equal(volunteeredMacroAccounting('Grass-fed butter over margarine every time.'), false);
});

test('an explicit macro question stands the guard down', () => {
  assert.equal(userAskedAboutMacros('how much protein is in eggs?'), true);
  assert.equal(userAskedAboutMacros('how many calories in a banana'), true);
  assert.equal(userAskedAboutMacros('I had chicken and rice for lunch'), false);
  assert.equal(userAskedAboutMacros('I want to eat holistically — raw milk, grass-fed beef'), false);
});

test('strip removes the offending sentence, keeps the coaching', () => {
  const out = stripMacroSentences('Grab the grass-fed butter. That keeps your carbs reasonable too.');
  assert.match(out, /grass-fed butter/i);
  assert.equal(volunteeredMacroAccounting(out), false);
});
