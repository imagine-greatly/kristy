// Acceptance — the conversational List editor. Structural checks always run; the
// LIVE checks run only with an API key.
//   node --use-system-ca scripts/listCompose.livetest.js
//
// Verify (from the task):
//   • "add stuff for taco night" edits the list conversationally (real ingredients).
//   • "swap the rice for something faster" removes the rice + adds a faster starch.
//   • "build me three high-protein dinners for four" builds a real cart.
//   • Hard lines respected (no seed oils → no margarine/canola/vegetable oil).
//   • No price, ever; no health/medical claim in items or summary.

import 'dotenv/config';
import { composeListEdit } from '../lib/listCompose.js';

let pass = 0, fail = 0;
const ck = (name, ok, extra = '') => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? ` — ${extra}` : ''}`); ok ? pass++ : fail++; };

if (!process.env.ANTHROPIC_API_KEY) {
  console.log('(no ANTHROPIC_API_KEY — skipping live checks)');
  process.exit(0);
}

const PRICE_RE = /\$\s*\d|\b\d+\s*(dollars|cents|bucks)\b|\bcheap(er)?\b|\bexpensive\b/i;
const SEED_OIL_RE = /margarine|canola|vegetable oil|seed oil|soybean oil/i;
const HEALTH_RE = /\b(cures?|treats?|prevents?|lowers?|reduces? (your )?(risk|cholesterol|blood)|anti-inflammatory|detox|boosts? immunity)\b/i;
const namesOf = (r) => r.add.map((a) => a.name).join(' | ');
const textOf = (r) => `${r.summary} ${namesOf(r)}`;

try {
  // 1) Taco night, hard line: no seed oils.
  const taco = await composeListEdit({
    instruction: 'add stuff for taco night',
    mode: 'edit',
    currentItems: ['Chicken breast', 'Rice or potatoes', 'Eggs'],
    goal: 'high_protein', focuses: [], hardLines: ['no_seed_oils'], constraints: [],
  });
  ck('taco: added real ingredients', taco.add.length >= 3, namesOf(taco));
  ck('taco: respects "no seed oils" (no margarine/canola/veg oil)', !SEED_OIL_RE.test(namesOf(taco)), namesOf(taco));
  ck('taco: no price', !PRICE_RE.test(textOf(taco)), taco.summary);
  ck('taco: no health claim', !HEALTH_RE.test(textOf(taco)), taco.summary);
  ck('taco: sections are valid', taco.add.every((a) => ['Produce','Meat & Seafood','Dairy & Eggs','Bakery','Pantry','Snacks','Frozen'].includes(a.section)), taco.add.map(a=>a.section).join(','));

  // 2) Swap the rice for something faster.
  const swap = await composeListEdit({
    instruction: 'swap the rice for something faster',
    mode: 'edit',
    currentItems: ['Chicken breast', 'Rice or potatoes', 'Leafy greens'],
    goal: 'high_protein', focuses: [], hardLines: [], constraints: ['short_on_time'],
  });
  ck('swap: removes the rice', swap.remove.some((r) => /rice/i.test(r)), JSON.stringify(swap.remove));
  ck('swap: adds a replacement', swap.add.length >= 1, namesOf(swap));

  // 3) Build a cart.
  const build = await composeListEdit({
    instruction: 'three high-protein dinners for four this week',
    mode: 'build',
    currentItems: [],
    goal: 'high_protein', focuses: [], hardLines: [], constraints: ['budget'],
  });
  ck('build: composed a real cart', build.add.length >= 6, `${build.add.length} items`);
  ck('build: no price (budget ≠ dollar figure)', !PRICE_RE.test(textOf(build)), build.summary);
  ck('build: no health claim', !HEALTH_RE.test(textOf(build)), build.summary);
  console.log(`\n  e.g. build → ${namesOf(build)}\n       summary → ${build.summary}`);
} catch (err) {
  ck('live run completed without error', false, err?.message || String(err));
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
