# sugars-rank — coconut sugar and maple sugar rank first on the sugars card, because each comes from one sap

```json
{
  "id": "sugars-rank",
  "tier": "T2",
  "ui": false,
  "owns": [
    "server/kristy_perimeter_kb.json",
    "docs/do-lines-review.md",
    "server/lib/doLines.json",
    "server/test/acceptance/twoLinePin.js",
    "server/test/acceptance/cardOrder.test.js",
    "server/test/acceptance/cardTidy.test.js"
  ],
  "read_full": [
    "server/test/acceptance/twoLinePin.js",
    "server/test/acceptance/cardOrder.test.js",
    "server/test/acceptance/cardTidy.test.js",
    "server/scripts/twoLineCheck.js",
    "server/scripts/buildDoLines.js",
    "server/lib/counterCardLint.js",
    "docs/sources/k21/maple-5.md",
    "VOICE_SPEC.md",
    "server/lib/testGuards.js"
  ],
  "verify": "cd /Users/m1/kristy && node --test server/test/acceptance/sugarsRank.test.js && cd server && node scripts/buildDoLines.js && node scripts/twoLineCheck.js && node scripts/commitGuard.js && node scripts/listMatchProbe.js && npm test"
}
```

Repo `/Users/m1/kristy`, branch `main`, baseline HEAD `b284f0b`. Devon (2026-10-19): coconut sugar and maple sugar rank best on the `sugars` card, because each is made from one sap, closest to the plant. His reason for coconut ("doesn't affect the bloodstream the same way") is a bodily-effect claim and appears nowhere: no blood, glycemic, insulin, diabetes, spike or hormone wording. The ranking rests on the one-sap fact only. Coconut sugar stays honest: mostly sucrose, like other sugar (already in `detail`). Not migrated.

## Change

Only the `sugars` entry in `server/kristy_perimeter_kb.json` changes (2-space JSON, trailing newline), plus the `sugars` do line. Set exactly (typographic quotes as shown; a straight apostrophe is banned by COPY_STRAIGHT_QUOTE):

- `decision`: "Coconut or maple sugar first, each made from one sap."
- `why`: "Coconut sugar is palm flower sap and maple sugar is maple sap. White sugar is crystallized from cane or beet juice." (115 characters; the lint cap is 120)
- `short_answer`: "Coconut sugar and maple sugar each come from one sap. " prepended to the existing value, with the sentence " Light brown has less molasses than dark brown." removed from the end (40-word cap; the molasses comparison stays in `detail`, `buying_tips` and `pick_steps`). Result: "Coconut sugar and maple sugar each come from one sap. Cane sugar and beet sugar are the same sugar. Brown sugar is sugar with molasses added. Turbinado is a raw cane sugar, paler than brown sugar."
- `detail`: existing value + " Under Vermont’s maple rule, maple sugar takes all its sugar from pure maple sap, with nothing added."
- `sources`: append "https://www.law.cornell.edu/regulations/vermont/20-002-Code-Vt-R-20-011-002-X" (header URL of `docs/sources/k21/maple-5.md`).
- `kristy_take`: "Coconut or maple sugar comes from one sap. For plain sugar, cane or beet makes the same sugar, and organic leads."
- `cart_pick`: "Coconut sugar or pure maple sugar"
- `tier_note`: "Coconut or maple first is a preference for sugar closest to the plant."
- `aliases`: append "maple sugar", "pure maple sugar", "which sugar is the best" (the third is needed so the asked_as "which sugar is the best to buy" retrieves the card through the alias gate; see Pins).
- `asked_as`: append "is maple sugar worth buying", "which sugar is the best to buy", "coconut sugar or maple sugar".
- `buying_tips` (order W, H, H, H, S):
  1. "Each stays closer to its plant than sugar crystallized from cane or beet juice."
  2. "Read the list: coconut sugar or maple sugar alone, with nothing added."
  3. "Look for pure maple sugar; a maple-flavored product is not maple sugar."
  4. the existing organic / Non-GMO Project Verified line, verbatim (as at b284f0b).
  5. "Pick light or dark brown sugar; dark carries more molasses."
- `watch_out`: ["Coconut sugar is made mostly of sucrose, like other sugar.", "More than half of granulated sugar sold comes from bioengineered sugar beets.", "No modified DNA remains in sugar from bioengineered beets, so the “derived from bioengineering” line is voluntary."]
- `pick_steps`: ["Read the list: coconut sugar or maple sugar alone.", "For plain sugar, look for certified organic.", "Dark brown carries more molasses than light brown."]

Every other `sugars` field and every other card is unchanged.

Do line: in `docs/do-lines-review.md` the `sugars` row becomes headline = the new decision, do = "Read the list for coconut or maple sugar alone, nothing added." Then `node scripts/buildDoLines.js` from `server/` regenerates `server/lib/doLines.json`; only the `sugars` entry may change (182 lines written).

## Hard limits

- Claim lock: no bodily-effect wording on the card (blood, glyc, insulin, diabet, bloodstream, spike, hormone); no first person, em dash, price, brand claim. Maple-sugar content comes only from the Vermont source.
- Concern keepers stay: bioengineered, organic, Non-GMO Project Verified.
- Do not edit other cards, `fixtures/*`, `*.before.json`, or `twoLinePin.test.js`. Do not run the migration.
- Wording differs from Devon's text only where a proven cap or lint failed: `why` (140 to 115 characters, cap 120), `short_answer` (44 words cut to 40 by dropping the light-brown sentence, cap 40), the straight apostrophe in Vermont’s, and the added alias "which sugar is the best".

## Pins and older tests (from the DRY RUN: baseline `npm test` 2821 pass / 0 fail)

Going red after the KB edit, and the minimal fix for each:

- `server/test/acceptance/twoLinePin.js`: re-pin the `sugars` row of `TWO_LINE`: decision (new), `buying_tips` (the 5 lines above), `watch_out` (the 3 lines), `sources` (Vermont URL appended). `twoLinePin.test.js` then passes unedited (35 failures plus its own test before the re-pin).
- `server/test/acceptance/cardTidy.test.js` and `server/test/acceptance/cardOrder.test.js`: both read the live `sugars` card as a history pin (decision, sources, tips, doLines). Fix in each: load the KB at `b284f0b` as `RANKED` (`git show b284f0b:server/kristy_perimeter_kb.json`), make `card(id)` return `find(RANKED, 'sugars')` for `sugars` and the live KB otherwise, with the comment "sugars-rank owns the live sugars card"; their C10 (doLines equals the earlier commit) compares `{ ...JSON.parse(now), sugars: doLines.sugars }`. cardOrder was red on C1, C2, C3, C9, C10; cardTidy on C9 and C10.
- `server/lib/counterDecision.test.js` (why cap 120): fixed by the shorter `why`, no test edit.
- `server/lib/counterReach.test.js`, `k21.test.js` C2, `k22.test.js` C4 (every asked_as retrieves its card with an alias hit): fixed by the alias "which sugar is the best" ("best sugar" and "best sugar to buy" did not work), no test edit.
- `ic8a`, `ic8b`, `k21.test.js` C6 (READ_FIVE_SECONDS, 40 words): fixed by the shorter `short_answer`, no test edit.
- Not red: `concernBioengineered.test.js`, `ktight.test.js`, `ca-4b.test.js`, `passRule.js` (full suite green, so no edit).
- The old decision "Sugar alone on the list" survives only in `twoLinePin.js` (re-pinned), the KB and `docs/do-lines-review.md` (replaced), and historical `.pipeline/runs/*` logs (ignore). None in `server/lib` or prompts.
- Matcher: "maple sugar", "pure maple sugar", "coconut sugar", "coconut sugar or maple sugar" all hit `sugars` via `scoreEntries` and `matchItemToCard`, never `maple_syrup` (C10).
- Baseline (KB at b284f0b, new test file present): RED C1, C3, C6, C8, C10; GREEN guards C2, C4, C5, C7, C9.
- Dry-run with the edits: `sugarsRank.test.js` 10/10; `buildDoLines.js` wrote 182 lines, only `sugars` changed; `twoLineCheck.js` 181 checked, 0 violations; `listMatchProbe.js` no wrong matches; `npm test` 2831 tests, 2831 pass, 0 fail (2821 baseline + 10 new). `commitGuard.js` not run in the dry run. Tree restored afterwards.

## Criteria

- C1 [test] The `sugars` fields listed in Change deep-equal the final values (13 fields).
- C2 [test] No bodily-effect wording anywhere on the card; coconut stays "mostly of sucrose".
- C3 [test] Ranking rests on one sap: decision starts "Coconut or maple sugar first", why names palm flower sap and maple sap, a tip says pure maple sugar vs maple-flavored, detail carries the Vermont rule.
- C4 [test] Every other `sugars` field equals b284f0b.
- C5 [test] Every other card, the entry count and top-level fields equal b284f0b.
- C6 [test] `doLines.json` differs from b284f0b on `sugars` only and the do-lines-review row carries the same two cells.
- C7 [test] Concern keepers (bioengineered, organic, Non-GMO Project Verified, derived from bioengineering, sugar beets, molasses, coconut sugar) still present.
- C8 [test] The Vermont URL is in `sources` and is the header URL of `docs/sources/k21/maple-5.md`, which contains the pure-maple-sap rule.
- C9 [test] Caps: decision at most 90 characters, why at most 120, short_answer at most 40 words, 3 to 5 tips, at most 3 watch_out, no dash or straight apostrophe.
- C10 [test] The six ask phrases hit `sugars` with an alias hit; list rows "maple sugar", "coconut sugar", "pure maple sugar" match `sugars`.

Also (verify, not a criterion): whole suite green, `twoLineCheck` 0 violations, `listMatchProbe` clean.

## Contract
```json
{
  "criteria": [
    {
      "id": "C1",
      "impl": [
        "server/kristy_perimeter_kb.json",
        "server/test/acceptance/twoLinePin.js",
        "server/test/acceptance/cardOrder.test.js",
        "server/test/acceptance/cardTidy.test.js"
      ],
      "tests": [
        "server/test/acceptance/sugarsRank.test.js"
      ],
      "dependents": []
    },
    {
      "id": "C2",
      "impl": [
        "server/kristy_perimeter_kb.json"
      ],
      "tests": [
        "server/test/acceptance/sugarsRank.test.js"
      ],
      "dependents": []
    },
    {
      "id": "C3",
      "impl": [
        "server/kristy_perimeter_kb.json"
      ],
      "tests": [
        "server/test/acceptance/sugarsRank.test.js"
      ],
      "dependents": []
    },
    {
      "id": "C4",
      "impl": [
        "server/kristy_perimeter_kb.json"
      ],
      "tests": [
        "server/test/acceptance/sugarsRank.test.js"
      ],
      "dependents": []
    },
    {
      "id": "C5",
      "impl": [
        "server/kristy_perimeter_kb.json"
      ],
      "tests": [
        "server/test/acceptance/sugarsRank.test.js"
      ],
      "dependents": []
    },
    {
      "id": "C6",
      "impl": [
        "docs/do-lines-review.md",
        "server/lib/doLines.json"
      ],
      "tests": [
        "server/test/acceptance/sugarsRank.test.js"
      ],
      "dependents": []
    },
    {
      "id": "C7",
      "impl": [
        "server/kristy_perimeter_kb.json"
      ],
      "tests": [
        "server/test/acceptance/sugarsRank.test.js"
      ],
      "dependents": []
    },
    {
      "id": "C8",
      "impl": [
        "server/kristy_perimeter_kb.json"
      ],
      "tests": [
        "server/test/acceptance/sugarsRank.test.js"
      ],
      "dependents": []
    },
    {
      "id": "C9",
      "impl": [
        "server/kristy_perimeter_kb.json"
      ],
      "tests": [
        "server/test/acceptance/sugarsRank.test.js"
      ],
      "dependents": []
    },
    {
      "id": "C10",
      "impl": [
        "server/kristy_perimeter_kb.json"
      ],
      "tests": [
        "server/test/acceptance/sugarsRank.test.js"
      ],
      "dependents": []
    }
  ],
  "env": {
    "executables": [
      "node",
      "npm",
      "git"
    ],
    "browsers": [],
    "temp": "none",
    "network": false
  }
}
```

## Acceptance server/test/acceptance/sugarsRank.test.js

```js
// sugars-rank: coconut sugar and maple sugar rank first on the sugars card because each comes from one sap (Devon 2026-10-19).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { nonEmpty } from '../../lib/testGuards.js';
import doLines from '../../lib/doLines.json' with { type: 'json' };
import { scoreEntries } from '../../lib/perimeter.js';
import { matchItemToCard } from '../../lib/listMatch.js';

const ROOT = new URL('../../../', import.meta.url).pathname;
const git = (spec) => execFileSync('git', ['show', spec], { cwd: ROOT, maxBuffer: 64 << 20 }).toString();
const kb = JSON.parse(readFileSync(new URL('../../kristy_perimeter_kb.json', import.meta.url), 'utf8'));
const base = JSON.parse(git('b284f0b:server/kristy_perimeter_kb.json'));
const find = (k, id) => { const e = k.entries.find((x) => x.id === id); assert.ok(e, `${id} missing`); return e; };
const live = find(kb, 'sugars');
const was = find(base, 'sugars');
const words = (s) => String(s).trim().split(/\s+/).filter(Boolean).length;
const URL_VT = 'https://www.law.cornell.edu/regulations/vermont/20-002-Code-Vt-R-20-011-002-X';

const BECAME = {
  decision: 'Coconut or maple sugar first, each made from one sap.',
  why: 'Coconut sugar is palm flower sap and maple sugar is maple sap. White sugar is crystallized from cane or beet juice.',
  short_answer: 'Coconut sugar and maple sugar each come from one sap. Cane sugar and beet sugar are the same sugar. Brown sugar is sugar with molasses added. Turbinado is a raw cane sugar, paler than brown sugar.',
  detail: `${was.detail} Under Vermont’s maple rule, maple sugar takes all its sugar from pure maple sap, with nothing added.`,
  sources: [...was.sources, URL_VT],
  kristy_take: 'Coconut or maple sugar comes from one sap. For plain sugar, cane or beet makes the same sugar, and organic leads.',
  cart_pick: 'Coconut sugar or pure maple sugar',
  tier_note: 'Coconut or maple first is a preference for sugar closest to the plant.',
  aliases: [...was.aliases, 'maple sugar', 'pure maple sugar', 'which sugar is the best'],
  asked_as: [...was.asked_as, 'is maple sugar worth buying', 'which sugar is the best to buy', 'coconut sugar or maple sugar'],
  buying_tips: [
    'Each stays closer to its plant than sugar crystallized from cane or beet juice.',
    'Read the list: coconut sugar or maple sugar alone, with nothing added.',
    'Look for pure maple sugar; a maple-flavored product is not maple sugar.',
    'Plain “sugar” names no crop, so choose certified organic first; organic must come from non-GMO plants. Non-GMO Project Verified is a close second.',
    'Pick light or dark brown sugar; dark carries more molasses.',
  ],
  watch_out: [
    'Coconut sugar is made mostly of sucrose, like other sugar.',
    'More than half of granulated sugar sold comes from bioengineered sugar beets.',
    'No modified DNA remains in sugar from bioengineered beets, so the “derived from bioengineering” line is voluntary.',
  ],
  pick_steps: [
    'Read the list: coconut sugar or maple sugar alone.',
    'For plain sugar, look for certified organic.',
    'Dark brown carries more molasses than light brown.',
  ],
};
const DO_LINE = { headline: BECAME.decision, do: 'Read the list for coconut or maple sugar alone, nothing added.' };

test('C1 the sugars fields equal the final values, in order', () => {
  nonEmpty(Object.keys(BECAME), 'changed sugars fields', 13);
  for (const [k, v] of Object.entries(BECAME)) assert.deepEqual(live[k], v, `sugars.${k}`);
});

test('C2 no bodily-effect wording anywhere on the sugars card; coconut is mostly sucrose and stays so', () => {
  assert.doesNotMatch(JSON.stringify(live), /blood|glyc|insulin|diabet|bloodstream|spike|hormone/i);
  assert.match(live.watch_out[0], /Coconut sugar is made mostly of sucrose/);
  assert.match(live.detail, /mostly of sucrose/);
});

test('C3 the ranking rests on one sap: decision, why, tips and take say so; maple sugar is pure maple sap only', () => {
  assert.match(live.decision, /^Coconut or maple sugar first/);
  assert.match(live.why, /palm flower sap/);
  assert.match(live.why, /maple sap/);
  assert.match(live.buying_tips.join(' '), /pure maple sugar; a maple-flavored product is not maple sugar/);
  assert.match(live.detail, /Vermont’s maple rule, maple sugar takes all its sugar from pure maple sap, with nothing added/);
});

test('C4 every other sugars field is byte-identical to b284f0b', () => {
  const keys = new Set([...Object.keys(live), ...Object.keys(was)]);
  nonEmpty([...keys], 'sugars keys', 15);
  for (const k of keys) if (!(k in BECAME)) assert.deepEqual(live[k], was[k], `sugars.${k} changed`);
});

test('C5 every other card, the entry count and the top-level fields are byte-identical to b284f0b', () => {
  const rest = kb.entries.filter((e) => e.id !== 'sugars');
  nonEmpty(rest, 'other cards', 150);
  for (const e of rest) assert.equal(JSON.stringify(e), JSON.stringify(find(base, e.id)), `${e.id} changed`);
  assert.equal(kb.entries.length, base.entries.length);
  assert.deepEqual({ ...kb, entries: 0 }, { ...base, entries: 0 }, 'top-level KB fields');
});

test('C6 doLines.json differs from b284f0b on sugars only, and the review row carries the same two cells', () => {
  const was_ = JSON.parse(git('b284f0b:server/lib/doLines.json'));
  assert.equal(doLines.sugars, DO_LINE.do);
  assert.notEqual(was_.sugars, doLines.sugars);
  assert.deepEqual({ ...doLines, sugars: was_.sugars }, was_);
  const review = readFileSync(new URL('../../../docs/do-lines-review.md', import.meta.url), 'utf8');
  assert.ok(review.includes(`| \`sugars\` | bulk_pantry | ${DO_LINE.headline} | ${DO_LINE.do} |`), 'review table row');
});

test('C7 the three concern keepers still stand: bioengineered, organic, Non-GMO Project Verified', () => {
  const t = JSON.stringify([live.decision, live.buying_tips, live.watch_out]);
  for (const re of [/bioengineered/i, /organic/i, /Non-GMO Project Verified/, /derived from bioengineering/, /sugar beets/, /molasses/, /coconut sugar/i]) assert.match(t, re);
});

test('C8 the Vermont source is in sources and archived under docs/sources/k21/maple-5.md', () => {
  assert.ok(live.sources.includes(URL_VT), 'sources carries the Vermont URL');
  const archive = readFileSync(new URL('../../../docs/sources/k21/maple-5.md', import.meta.url), 'utf8');
  assert.ok(archive.split('\n').slice(0, 3).some((l) => l.trim() === `URL: ${URL_VT}`), 'archive header URL');
  assert.match(archive, /entirely derived from pure maple sap/);
});

test('C9 caps: decision at most 90 characters, why at most 120, short_answer at most 40 words, 3 to 5 tips, at most 3 watch_out', () => {
  assert.ok(live.decision.length <= 90, `${live.decision.length}`);
  assert.ok(live.why.length <= 120, `${live.why.length}`);
  assert.ok(words(live.short_answer) <= 40, `${words(live.short_answer)} words`);
  assert.ok(live.buying_tips.length >= 3 && live.buying_tips.length <= 5);
  assert.ok(live.watch_out.length <= 3);
  assert.doesNotMatch(JSON.stringify(live), /—|–|'/, 'dash or straight apostrophe');
});

test('C10 "maple sugar" and "coconut sugar" asks and list rows land on sugars, not maple_syrup', () => {
  for (const q of ['maple sugar', 'pure maple sugar', 'coconut sugar', 'coconut sugar or maple sugar', 'is maple sugar worth buying', 'which sugar is the best to buy']) {
    const top = scoreEntries(q, 3)[0];
    assert.equal(top?.entry?.id ?? top?.id, 'sugars', q);
    assert.ok(top.aliasScore > 0, `${q}: alias hit`);
  }
  for (const row of ['maple sugar', 'coconut sugar', 'pure maple sugar']) assert.equal(matchItemToCard(row)?.slug, 'sugars', row);
});
```
