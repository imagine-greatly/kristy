# ca-5 — Section rules rewritten; section lints turned on

```json
{
  "id": "ca-5",
  "tier": "T1",
  "ui": false,
  "owns": [
    "server/lib/sectionRules.json",
    "server/test/sectionRulesContent.test.js",
    "server/lib/sectionRules.js"
  ],
  "read_full": [
    "docs/CARD-ALIGNMENT-PLAN.md",
    "server/lib/sectionRules.json",
    "server/lib/sectionRules.js",
    "server/test/sectionRulesContent.test.js",
    "server/test/sectionRules.test.js",
    "server/test/acceptance/ic3a.test.js",
    "server/test/acceptance/ic6a.test.js",
    "server/lib/counterCardLint.test.js",
    "server/lib/counterCardLint.js",
    "server/kristy_perimeter_kb.json",
    "VOICE_SPEC.md",
    "server/test/acceptance/ca-1.test.js",
    "server/lib/testGuards.js"
  ],
  "verify": "node --test server/test/acceptance/ca-5.test.js && cd server && npm test; node scripts/listMatchProbe.js; node scripts/commitGuard.js; node scripts/migrateCounterCards.js --dry-run",
  "token_ceiling": 100000
}
```

Repo kristy, branch `main`. Plan approved 2026-10-14 on defaults Q1-Q3 (admin relay of Devon's go).

- Route: dv T1 (fallback forge@sonnet [T1]). Critic: critic@sonnet. Every string is given verbatim; the builder pastes.
- P1. Parallel-safe: no (verification runs the corpus section lint, which reads the KB CA-3/CA-4 own).
- Plan: `docs/CARD-ALIGNMENT-PLAN.md` CA-5. Scouts: `.pipeline/specs/ca-scouts.md` S3.
- **Before dispatch:** CA-4b committed. Admin runs the forced-flag check in "Independent check script" at the CA-4b commit; any hit returns to the CA-3/CA-4 owner, not to this piece.

Scope: the six section tips in `server/lib/sectionRules.json` take the approved CA-5 text (the same strings `ca-1.test.js:35-41` fixes as `CA5_TIPS`), and each row gains the two flags that switch on the CA-1 section lints. No card text changes here.

## Alignment block

**Done means:**
- Given `server/lib/sectionRules.json`, when read, then it has exactly six rows in the order meat, eggs_dairy, produce, seafood, bulk_pantry, frozen, and each row's `rule` and `checks` equal the strings in Step 1 byte for byte.
- Given each row, then `tip_aligned` is `true`; `cards_aligned` is `true` for meat and eggs_dairy and absent or `false` for the other four.
- Given each row's `sources`, then meat is `["beef_grassfed_vs_grainfed", "butcher_counter_asking", "organ_meats", "deli_meat_uncured"]`, eggs_dairy is `["egg_labels", "whole_vs_reduced_fat_milk", "cheese_real_vs_processed"]`, and the other four deep-equal HEAD (produce stays `["produce_ripeness_by_item"]`, pinned by `ic3a.test.js:89`); every source id exists in the KB.
- Given `lintSections(rows, kb.entries)`, then it returns `[]`.
- Given the served section-rules payload, then every row's keys are exactly `section`, `rule`, `checks`; no source id and no flag reaches the wire.
- `npm test` green, including `counterCardLint.test.js` "sectionRules corpus: lintSections is clean (CA-5 flags turn the section lints on)".

**Out of scope:** card text in any section (CA-3/CA-4 own meat and eggs_dairy; produce, seafood, pantry and frozen cards align in their own milestones); iOS (`SectionRule`, `CounterModels.swift:259-263`, decodes `section`, `rule`, `checks` already); migration.

**OK rough edges:**
- produce, seafood, bulk_pantry and frozen tips may be reworded again when their cards align; their `cards_aligned` stays off until then.
- **Deviation from the plan, recorded.** `sectionRulesContent.test.js:29` caps each check at 1-8 words; the approved checks run to 15 words. Step 2 raises the cap to 16 `[PLACEHOLDER]`. If the file also caps the rule length below 20 words, raise it to 20 `[PLACEHOLDER]`; the longest approved rule is 18 words.

**Ship bar:** a tip string not byte-equal; a served row carrying `sources` or a flag; a source id missing from the KB; any L1 or L3 hit in any section; any L2, L4 or L5 hit in meat or eggs_dairy; `npm test` red.

**Independent check:** with the server running locally, `curl -s localhost:<port>/api/counter/section-rules` diffed against Step 1 shows zero text differences and no `sources`, `tip_aligned` or `cards_aligned` key.

## Steps (the change, old → new)

### 1. `server/lib/sectionRules.json`
Replace each row's `rule` and `checks` with the strings below; add the flags; set the two named `sources` lists; keep the other four `sources` lists and the row order.

- meat — rule "A local butcher comes first; at the case, choose meat from animals raised on grass and open pasture." checks ["Ask what the animal ate and how it lived; a butcher counter can answer.", "Organs come from the same animal; liver and heart belong in the cart too.", "On packaged meat, look for an ingredient list of meat, salt, and spices."] `tip_aligned: true`, `cards_aligned: true`, sources ["beef_grassfed_vs_grainfed", "butcher_counter_asking", "organ_meats", "deli_meat_uncured"].
- eggs_dairy — rule "Eggs and dairy start with how the animal ate and lived: cows on grass, hens on pasture." checks ["Read how the animal lived and what it ate before anything else on the label.", "Dairy needs few ingredients: milk or cream, cultures, salt, and enzymes for cheese."] `tip_aligned: true`, `cards_aligned: true`, sources ["egg_labels", "whole_vs_reduced_fat_milk", "cheese_real_vs_processed"].
- produce — rule "Choose produce grown organic or unsprayed, and pick it whole and in season." checks ["Local and in season comes first; ask the produce staff what that is this week.", "Frozen fruit and vegetables with nothing added count as whole food too."] `tip_aligned: true`.
- seafood — rule "Wild-caught fish ate its natural diet; choose wild first and ask where it was caught." checks ["Ask the counter where the fish was caught and how."] `tip_aligned: true`.
- bulk_pantry — rule "Choose packages with a short list of real ingredients and only natural fats: tallow, olive oil, coconut oil." checks ["Skip seed oils and avocado oil, whatever the front of the package says.", "The ingredient line tells more than the front; read it first."] `tip_aligned: true`.
- frozen — rule "Frozen food counts as whole when the bag lists the food and nothing else." checks ["Frozen meals follow the pantry rule: real ingredients, natural fats only."] `tip_aligned: true`.

### 2. `server/test/sectionRulesContent.test.js`
- `:29` per-check word cap 1-8 → 1-16 `[PLACEHOLDER]`; add the comment `// 16 after CA-5: the approved checks run to 15 words, 2026-10-15.`
- `:8` `ALLOWED` key set: add `tip_aligned` and `cards_aligned` if absent.
- A rule-length cap below 20 words, if present: → 20 `[PLACEHOLDER]`, same comment form.
- Nothing else; `:17` (≥5 sections), `:21` (order), `:28` (≤3 checks) and `:33-36` (sources exist) stay.

### 3. `server/lib/sectionRules.js` (only if needed)
If the served row is built by dropping `sources` only (`:20`), change it to pick `section`, `rule`, `checks` so the flags never reach the wire. If it already picks those three keys, no edit.

## Criteria
- C1 [test] Given `sectionRules.json`, then there are six rows in the order meat, eggs_dairy, produce, seafood, bulk_pantry, frozen, and each `rule` and `checks` equal Step 1.
- C2 [test] Given each row, then `tip_aligned === true`, and `cards_aligned === true` exactly for meat and eggs_dairy.
- C3 [test] Given each row, then meat and eggs_dairy `sources` equal Step 1, produce equals `["produce_ripeness_by_item"]`, and every source id exists in the KB.
- C4 [test] Given `lintSections(rows, kb.entries)`, then it returns `[]`.
- C5 [test] Given every new string, then none contains `—`, a straight quote, a price word, or the first-person words I, me, my.
Verify (not a criterion): Given the repo after the change, when `cd server && npm test; node scripts/listMatchProbe.js; node scripts/commitGuard.js; node scripts/migrateCounterCards.js --dry-run` run, then 0 fail (including the served-keys check in `server/test/sectionRules.test.js:43-46` and the corpus section-lint test), 0 wrong, guard clean, every card placed.

## Contract

```json
{
  "criteria": [
    {
      "id": "C1",
      "impl": [
        "server/lib/sectionRules.json"
      ],
      "tests": [
        "server/test/acceptance/ca-5.test.js",
        "server/test/sectionRulesContent.test.js"
      ],
      "dependents": [
        "server/lib/sectionRules.js",
        "server/test/sectionRules.test.js",
        "server/test/acceptance/ic3a.test.js",
        "server/test/acceptance/ic6a.test.js"
      ],
      "allowed_reads": [
        "server/lib/sectionRules.json",
        "server/test/acceptance/ca-1.test.js"
      ],
      "expected": "six rows, Step 1 text",
      "test_name": "C1 the six tips carry the approved text in order"
    },
    {
      "id": "C2",
      "impl": [
        "server/lib/sectionRules.json"
      ],
      "tests": [
        "server/test/acceptance/ca-5.test.js",
        "server/lib/counterCardLint.test.js"
      ],
      "dependents": [
        "server/lib/counterCardLint.js"
      ],
      "allowed_reads": [
        "server/lib/counterCardLint.js"
      ],
      "expected": "tip_aligned on all six; cards_aligned on meat and eggs_dairy",
      "test_name": "C2 flags turn the section lints on"
    },
    {
      "id": "C3",
      "impl": [
        "server/lib/sectionRules.json"
      ],
      "tests": [
        "server/test/acceptance/ca-5.test.js",
        "server/test/acceptance/ic3a.test.js",
        "server/test/sectionRulesContent.test.js"
      ],
      "dependents": [
        "server/lib/sectionRules.js"
      ],
      "allowed_reads": [
        "server/kristy_perimeter_kb.json"
      ],
      "expected": "sources as listed; every id in the KB",
      "test_name": "C3 sources point at cards that exist"
    },
    {
      "id": "C4",
      "impl": [
        "server/lib/sectionRules.json"
      ],
      "tests": [
        "server/test/acceptance/ca-5.test.js",
        "server/lib/counterCardLint.test.js"
      ],
      "dependents": [
        "server/lib/counterCardLint.js",
        "server/kristy_perimeter_kb.json"
      ],
      "allowed_reads": [
        "server/lib/counterCardLint.js"
      ],
      "expected": "[]",
      "test_name": "C4 lintSections is clean with the flags on"
    },
    {
      "id": "C5",
      "impl": [
        "server/lib/sectionRules.json",
        "server/lib/sectionRules.js"
      ],
      "tests": [
        "server/test/acceptance/ca-5.test.js",
        "server/test/sectionRules.test.js"
      ],
      "dependents": [
        "server/test/sectionRules.test.js"
      ],
      "allowed_reads": [
        "VOICE_SPEC.md"
      ],
      "expected": "0 grep hits",
      "test_name": "C5 tip copy passes the punctuation, price and voice greps"
    }
  ],
  "dependency_evidence": [
    {
      "owned": "server/lib/sectionRules.json",
      "imports": [],
      "tests": [
        "server/test/sectionRules.test.js",
        "server/test/sectionRulesContent.test.js",
        "server/test/acceptance/ic3a.test.js",
        "server/test/acceptance/ic6a.test.js"
      ],
      "source": "ca-scouts.md S3"
    },
    {
      "owned": "server/lib/sectionRules.js",
      "imports": [
        "server/lib/sectionRules.json"
      ],
      "tests": [
        "server/test/sectionRules.test.js"
      ],
      "source": "ca-scouts.md S3 (SECTIONS :5, push drops sources :20)"
    }
  ],
  "env": {
    "executables": [
      "node",
      "git",
      "grep"
    ],
    "browsers": [],
    "temp": "/Users/m1/kristy/.pipeline/runs/ca-5",
    "network": false
  }
}
```

## Acceptance server/test/acceptance/ca-5.test.js

```js
// CA-5: section rules rewritten; section lints turned on (docs/CARD-ALIGNMENT-PLAN.md CA-5). Written by the planner; do not edit.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import * as lint from '../../lib/counterCardLint.js';

const SERVER = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const kb = JSON.parse(readFileSync(join(SERVER, 'kristy_perimeter_kb.json'), 'utf8'));
const raw = JSON.parse(readFileSync(join(SERVER, 'lib', 'sectionRules.json'), 'utf8'));
const rows = Array.isArray(raw) ? raw : raw.sections ?? raw.rules ?? Object.values(raw).find(Array.isArray);
const row = (s) => rows.find((r) => r.section === s);

const TIPS = [
  { section: 'meat', rule: 'A local butcher comes first; at the case, choose meat from animals raised on grass and open pasture.', checks: ['Ask what the animal ate and how it lived; a butcher counter can answer.', 'Organs come from the same animal; liver and heart belong in the cart too.', 'On packaged meat, look for an ingredient list of meat, salt, and spices.'] },
  { section: 'eggs_dairy', rule: 'Eggs and dairy start with how the animal ate and lived: cows on grass, hens on pasture.', checks: ['Read how the animal lived and what it ate before anything else on the label.', 'Dairy needs few ingredients: milk or cream, cultures, salt, and enzymes for cheese.'] },
  { section: 'produce', rule: 'Choose produce grown organic or unsprayed, and pick it whole and in season.', checks: ['Local and in season comes first; ask the produce staff what that is this week.', 'Frozen fruit and vegetables with nothing added count as whole food too.'] },
  { section: 'seafood', rule: 'Wild-caught fish ate its natural diet; choose wild first and ask where it was caught.', checks: ['Ask the counter where the fish was caught and how.'] },
  { section: 'bulk_pantry', rule: 'Choose packages with a short list of real ingredients and only natural fats: tallow, olive oil, coconut oil.', checks: ['Skip seed oils and avocado oil, whatever the front of the package says.', 'The ingredient line tells more than the front; read it first.'] },
  { section: 'frozen', rule: 'Frozen food counts as whole when the bag lists the food and nothing else.', checks: ['Frozen meals follow the pantry rule: real ingredients, natural fats only.'] },
];
const CARDS_ALIGNED = new Set(['meat', 'eggs_dairy']);
const SOURCES = {
  meat: ['beef_grassfed_vs_grainfed', 'butcher_counter_asking', 'organ_meats', 'deli_meat_uncured'],
  eggs_dairy: ['egg_labels', 'whole_vs_reduced_fat_milk', 'cheese_real_vs_processed'],
  produce: ['produce_ripeness_by_item'],
};

test('C1 the six tips carry the approved text in order', () => {
  assert.deepEqual(rows.map((r) => r.section), TIPS.map((t) => t.section));
  for (const t of TIPS) {
    assert.equal(row(t.section).rule, t.rule, t.section);
    assert.deepEqual(row(t.section).checks, t.checks, t.section);
  }
});

test('C2 flags turn the section lints on', () => {
  for (const t of TIPS) {
    assert.equal(row(t.section).tip_aligned, true, `${t.section} tip_aligned`);
    assert.equal(row(t.section).cards_aligned === true, CARDS_ALIGNED.has(t.section), `${t.section} cards_aligned`);
  }
});

test('C3 sources point at cards that exist', () => {
  for (const [s, ids] of Object.entries(SOURCES)) assert.deepEqual(row(s).sources, ids, s);
  const have = new Set(kb.entries.map((e) => e.id));
  for (const r of rows) for (const id of r.sources ?? []) assert.ok(have.has(id), `${r.section} source ${id} missing from the KB`);
});

test('C4 lintSections is clean with the flags on', () => {
  assert.ok(rows.some((r) => r.cards_aligned === true), 'no section has cards_aligned; the lint would be vacuous');
  assert.deepEqual(lint.lintSections(rows, kb.entries), []);
});

test('C5 tip copy passes the punctuation, price and voice greps', () => {
  for (const s of TIPS.flatMap((t) => [t.rule, ...t.checks])) {
    assert.doesNotMatch(s, /—/, s);
    assert.doesNotMatch(s, /["']/, s);
    assert.doesNotMatch(s, /\bprice\b|\bcheap(er|est)?\b|\$[0-9]/i, s);
    assert.doesNotMatch(s, /\b(I|me|my)\b/, s);
  }
});
```

## ANCHOR server/test/acceptance/ca-1.test.js:35
```
const CA5_TIPS = [
  { section: 'meat', rule: 'A local butcher comes first; at the case, choose meat from animals raised on grass and open pasture.', checks: ['Ask what the animal ate and how it lived; a butcher counter can answer.', 'Organs come from the same animal; liver and heart belong in the cart too.', 'On packaged meat, look for an ingredient list of meat, salt, and spices.'] },
  { section: 'eggs_dairy', rule: 'Eggs and dairy start with how the animal ate and lived: cows on grass, hens on pasture.', checks: ['Read how the animal lived and what it ate before anything else on the label.', 'Dairy needs few ingredients: milk or cream, cultures, salt, and enzymes for cheese.'] },
```

## ANCHOR server/lib/sectionRules.json:1
```json
[
  {"section": "produce", "rule": "Judge the piece itself, not the sticker.", "checks": ["Country on the sticker tells season, not grade.", "Sticker code: five digits starting 9 is organic."], "sources": ["produce_ripeness_by_item"]},
  {"section": "meat", "rule": "Judge by seal and smell, not color alone.", "checks": ["Take a sealed package that is not leaking.", "Pass on any pack with an off smell."], "sources": ["judging_meat_at_the_case"]},
```

## ANCHOR server/test/sectionRulesContent.test.js:8
```js
const ALLOWED = ['produce', 'meat', 'seafood', 'eggs_dairy', 'bulk_pantry', 'frozen'];
const KB_IDS = new Set(kb.entries.map((e) => e.id));
const words = (s) => s.trim().split(/\s+/).filter(Boolean).length;
```

## ANCHOR server/lib/sectionRules.js:18
```js
      if (!Array.isArray(e.checks) || e.checks.length > 3 || !e.checks.every(str)) continue;
      seen.add(e.section);
      rules.push({ section: e.section, rule: e.rule, checks: [...e.checks] });
    }
```

## Independent check script (admin-run; not part of the build)

Before dispatch, at the CA-4b commit, from `server/`: `node -e "import('./lib/counterCardLint.js').then(async (l) => { const kb = (await import('./kristy_perimeter_kb.json', { with: { type: 'json' } })).default; const T = <the TIPS array from the acceptance block, flags added>; console.log(JSON.stringify(l.lintSections(T, kb.entries), null, 1)); })"`. Expected `[]`. After the build: start the server, `curl -s localhost:<port>/api/counter/section-rules`, diff the text against Step 1, and grep the payload for `sources|tip_aligned|cards_aligned` (expected: no match).

## Prerequisites
- CA-4b committed (and with it CA-3a, CA-3b, CA-4a). STOP BLOCKED if `organ_meats`, `deli_meat_uncured`, `butcher_counter_asking`, `beef_grassfed_vs_grainfed`, `egg_labels`, `whole_vs_reduced_fat_milk` or `cheese_real_vs_processed` is absent from the KB.
- Env: node ≥20, git, grep. No network. No Supabase writes (`--dry-run` only). No browser.

## Answers
- `npm test` ~1-3 min. Read only `read_full` and the owned files.
- Do not edit the KB, `counterCardLint.js`, `passRule.js`, k5-k11, `ic3a.test.js`, `ic6a.test.js` or `sectionRules.test.js`.
- STOP BLOCKED (quote the hit) if `lintSections` reports any hit: a hit names a card, and cards belong to CA-3/CA-4 or a later milestone. Never weaken a tip string to clear a hit.
- STOP BLOCKED if `sectionRules.test.js:37` (4 checks rejected) or `:43-46` (route payload) goes red after Step 3.
- Limits: no git writes. 60-minute cap. BLOCKED after 3 identical failures. Never delete an assertion.
- Commit (admin): message ends "Not migrated." (no corpus change; iOS reads the route).
- Report ≤30 lines: READY or NOT READY; acceptance count; `npm test` count; whether Step 3 edited `sectionRules.js`; each STOP.

## Tried and rejected
- Turning `cards_aligned` on for produce, seafood, pantry and frozen: their cards are not aligned yet, so the section lints would fail on cards this piece cannot touch.
- Linking a tip to a card on the wire: the plan rules section tips holistic, never linked to an item card; `sources` stay server-side.
- Trimming checks to 8 words to keep the old cap: the approved text is Devon's; the cap moves instead (OK rough edge).
