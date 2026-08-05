// NO PROMPT EXAMPLE MAY BE LIVE CORPUS CONTENT.
//
// A prompt's worked example becomes its output. Twice now the exact text a prompt carried as
// an illustration came back as the product's own words: `gen_a1_vs_a2_yogurt` contradicted the
// curated A2 card because `counterGenerate.js` held that headline as its FAIL/PASS example,
// and every budget-constrained list said "Cheap protein and carbs" because
// `LIST_COMPOSE_SYSTEM` contained the literal phrase "Cheap protein asked for".
//
// Swept 2026-08-05, `COUNTER_GEN_SYSTEM` was showing the generator **four verbatim fields of
// three shipping cards** as the thing to imitate — `salmon_wild_vs_farmed.decision` and
// `.watch_out`, `label_natural.decision`, `organic_worth_it_by_type.decision`. That is the
// mechanism behind the four generated duplicates already paid for
// (`gen_picking_a_ripe_cantaloupe`, `gen_picking_good_produce`,
// `gen_strawberry_freshness_check`, `gen_limp_lettuce_revival`).
//
// THIS IS THE VERSION OF THE RULE THAT CANNOT DRIFT. The prose form — "illustrations must be
// invented" — is a comment asserting an invariant, and this repo has been wrong about those
// three times running. Whether an example string appears in the corpus is mechanically
// checkable, so it gets checked.
//
// WHAT IT CANNOT CHECK, stated rather than implied: whether an example's SUBJECT is in the
// corpus. "A card about salmon" is not a string match, and a paraphrase of a curated decision
// is not either. So the prompts also carry the rule in prose, and the subjects of the current
// examples were chosen from foods absent from BOTH knowledge bases — tahini, okra, small
// batch, turnips. If you add an example, pick a subject nothing else covers.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { COUNTER_GEN_SYSTEM } from './counterGenerate.js';
import { LIST_VISION_SYSTEM } from './listVision.js';
import { LIST_COMPOSE_SYSTEM } from './listCompose.js';
import { LABEL_VISION_SYSTEM } from './labelVision.js';
import { nonEmpty } from './testGuards.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SERVER = join(__dirname, '..');

const kb = JSON.parse(readFileSync(join(SERVER, 'kristy_perimeter_kb.json'), 'utf8'));
const ENTRIES = nonEmpty(Array.isArray(kb) ? kb : Object.values(kb).flat(), 'perimeter KB entries', 50);
// The do line is NOT a KB field — it is generated into lib/doLines.json from the authored
// markdown table. A test that only read the KB would miss every do line in the corpus.
const DO_LINES = Object.values(JSON.parse(readFileSync(join(SERVER, 'lib', 'doLines.json'), 'utf8')));

/* Every string a prompt presents as an example of output. Double-quoted, because that is how
   all four prompts mark example text, and long enough that a bare word cannot trip it — a
   25-char floor keeps "full" and "partial" (JSON shape hints) out while catching any real
   sentence. */
/* NEWLINES ARE ALLOWED INSIDE A QUOTE, and the first draft of this regex forbade them —
   which made it blind to exactly the example I already knew about, because
   `salmon_wild_vs_farmed.watch_out` is wrapped across two indented lines in the prompt. A
   check that cannot see a wrapped string is a check with a formatting-shaped hole in it.
   Non-greedy between quote characters, then whitespace collapsed, so a wrapped example is
   compared as the one sentence it is. */
const QUOTED = /"([^"]{25,}?)"/g;
function examplesIn(prompt) {
  return [...String(prompt).matchAll(QUOTED)]
    .map((m) => m[1].replace(/\s+/g, ' ').trim())
    .filter(Boolean);
}

const PROMPTS = {
  COUNTER_GEN_SYSTEM,
  LIST_VISION_SYSTEM,
  LIST_COMPOSE_SYSTEM,
  LABEL_VISION_SYSTEM,
};

// The three fields the corpus speaks to a shopper with, plus the do lines.
const norm = (s) => String(s ?? '').toLowerCase().replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/\s+/g, ' ').trim();

function corpusStrings() {
  const out = [];
  for (const e of ENTRIES) {
    for (const f of ['decision', 'watch_out']) {
      const v = e[f];
      if (typeof v === 'string' && v.trim()) out.push({ id: e.id, field: f, text: v });
      else if (Array.isArray(v)) v.forEach((x, i) => typeof x === 'string' && out.push({ id: e.id, field: `${f}[${i}]`, text: x }));
    }
  }
  DO_LINES.forEach((t, i) => typeof t === 'string' && out.push({ id: `doLines[${i}]`, field: 'do', text: t }));
  return out;
}
const CORPUS = nonEmpty(corpusStrings(), 'corpus decision/watch_out/do strings', 50);

test('the extractor finds examples at all — this suite is not vacuously passing', () => {
  const found = examplesIn(COUNTER_GEN_SYSTEM);
  assert.ok(found.length >= 5, `only ${found.length} quoted examples found in COUNTER_GEN_SYSTEM; the regex has drifted`);
});

test('no prompt example is a live decision, watch_out or do line', () => {
  const collisions = [];
  for (const [name, prompt] of Object.entries(PROMPTS)) {
    for (const ex of examplesIn(prompt)) {
      const e = norm(ex);
      for (const c of CORPUS) {
        const t = norm(c.text);
        if (!t) continue;
        // Bidirectional: the example may be the whole field, or the field may quote it.
        if (t === e || t.includes(e) || e.includes(t)) {
          collisions.push(`${name} example ${JSON.stringify(ex.slice(0, 60))} <-> ${c.id}.${c.field}`);
        }
      }
    }
  }
  assert.deepEqual(
    collisions,
    [],
    'a prompt is showing the model live corpus content as the thing to imitate — this is how ' +
      'generated duplicates get paid for. Invent the example, about a subject nothing covers.'
  );
});

test('no vision prompt names a real brand', () => {
  // A brand in a transcription prompt is a token the model can put onto a photo that never
  // showed it. `LIST_VISION_SYSTEM` carried "Fairlife 2%" as a descriptor example.
  const BRANDS = /\b(fairlife|chobani|oikos|siggi|kerrygold|horizon|organic valley|la croix|wonder|coca[- ]cola|pepsi|frosted flakes|cheerios|nature valley|quest|clif|rx ?bar)\b/i;
  for (const name of ['LIST_VISION_SYSTEM', 'LABEL_VISION_SYSTEM']) {
    const hit = PROMPTS[name].match(BRANDS);
    assert.equal(hit, null, `${name} names the brand "${hit?.[0]}" — the model can hallucinate it onto a photo`);
  }
});

test('the compose prompt still carries no forbidden price label outside its prohibition', () => {
  // Kept here beside the family it belongs to; the substantive assertions live in
  // listCompose.test.js.
  const withoutBan = LIST_COMPOSE_SYSTEM.replace(/never the words "cheap" or "expensive"[^\n]*/gi, '');
  assert.deepEqual(withoutBan.match(/\bcheap(er|est)?\b/gi) || [], []);
});
