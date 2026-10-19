# soy-milk-rank — soy milk ranks below short-list plant milks, and fortified is no longer the pick

```json
{
  "id": "soy-milk-rank",
  "tier": "T2",
  "ui": false,
  "owns": [
    "server/kristy_perimeter_kb.json",
    "server/test/acceptance/twoLinePin.js",
    "docs/do-lines-review.md",
    "server/lib/doLines.json",
    "server/test/acceptance/concernBioengineered.test.js"
  ],
  "read_full": [
    "server/test/acceptance/twoLinePin.js",
    "server/scripts/twoLineCheck.js",
    "server/lib/counterCardLint.js",
    "server/test/acceptance/concernBioengineered.test.js",
    "server/test/acceptance/ca-4b.test.js",
    "VOICE_SPEC.md",
    "server/lib/testGuards.js"
  ],
  "verify": "cd /Users/m1/kristy && node --test server/test/acceptance/soyMilkRank.test.js && cd server && node scripts/buildDoLines.js && node scripts/twoLineCheck.js && npm test"
}
```

Repo `/Users/m1/kristy`, branch `main`, baseline HEAD `f3ab9b4`. Devon's ruling (2026-10-19): rank soy milk below short-list
plant milks. "Most of the time, the less ingredients the better, of course those ingredients need to be of high quality, like a
cold pressed almond milk is great." Frame: closest to nature. Processing and ranking only; no health claim either way.

State before this batch: card `soy_milk` in `server/kristy_perimeter_kb.json` has decision "Fortified, unsweetened soy milk.", cart_pick
"Fortified unsweetened soy milk", 7 `buying_tips` (tip 0 "Fortified soy holds key nutrients similar to milk, so the dairy group counts it."),
2 `watch_out`, 6 sources (the carrageenan, bioengineered and organic lines from earlier batches live in tips 4-6 and watch_out 1).
Siblings already rank on a short list: `almond_milk` "Unsweetened almond milk, a short list, never seed oil.", `oat_milk`, `coconut_milk_beverage`.

## Change
Edit ONLY the `soy_milk` entry in the KB, plus the single `instead` field of `almond_milk` and `oat_milk` (below). Append nothing to `sources`; no archive source is needed (these are ranking and ingredient-list statements, and the FDA fact already cited stays).

Write exactly this copy (a DRY RUN with it passed every check below; reword only if a lint complains, and keep each fact):
- `decision`: `Unsweetened soy milk, a short list beyond soybeans and water.` (10 words; two-line rule needs at most 10.)
- `cart_pick`: `Short-list unsweetened soy milk` (a cart row of at most 46 characters; a comma in it breaks `matchItemToCard`, so use no comma. Verified it matches `soy_milk`.)
- `kristy_take`: `A short list of soybeans and water stays closest to the bean.`
- `pick_steps[0]`: `Pick the shortest list, soybeans and water with little else.` (`pick_steps[1]` "Pick unsweetened over flavored." unchanged.)
- `buying_tips`: PREPEND these four, then keep the seven existing strings verbatim and in order after them (the old tip 0 "Fortified soy holds key nutrients similar to milk, so the dairy group counts it." becomes tip 4, unchanged):
  1. `Read the list for soybeans and water, then as few additions as possible.` (new tip 0; two-line rule line 2, at most 90 characters, no "fortif".)
  2. `A short-list unsweetened almond milk ranks above soy milk.`
  3. `Dairy shoppers can read the Milk card.` (the card `whole_vs_reduced_fat_milk` has title "Milk".)
  4. `Fortifying adds vitamins and minerals, and each is another ingredient.`
- `watch_out`: APPEND `FDA counts only fortified soy in the dairy group, yet fortifying lengthens the list.` Keep both existing strings verbatim and in order (the FDA dairy-group fact stays true; it is no longer the pick).
- Unchanged (leave byte for byte): `tier_note` ("Calcium and vitamin D on the panel show the fortification." — a true statement about the panel, and it keeps the do line and tier note overlapping, so `TIER_NOTE_ORPHANED` stays quiet), `why`, `short_answer`, `detail`, `science`, `labels_decoded`, `instead` ("Unsweetened almond milk."), `aliases`, `asked_as`, `question`, `title`, `sources`, `evidence_tier`, `category`.
- Reconcile "Fortified": the FDA dairy-group facts (why, short_answer, detail, science, tip 4, both watch_outs) stay exactly as they were. What changes is the pick: fortification adds ingredients, so the pick is the shortest list, and fortified soy is named as a fact about FDA's dairy group, not as the call.
- Do line (`docs/do-lines-review.md` → `scripts/buildDoLines.js` → `server/lib/doLines.json`): the do line is not generated from the decision, so it must be mirrored. Edit the `soy_milk` row in `docs/do-lines-review.md`: headline column becomes `Unsweetened soy milk, a short list beyond soybeans and water.` and the do-line column becomes `Read the ingredients for soybeans and water, then calcium and vitamin D if added.` Then run `node scripts/buildDoLines.js` from `server/`; `doLines.json` changes only on the `soy_milk` key. (It keeps the word "calcium" so the unchanged tier note stays on-topic.)
- Sibling `instead` lines (so no card still names fortified soy as the next plant drink). Change exactly one field on each of two cards, nothing else on them:
  - `almond_milk.instead`: `A short-list oat milk is the next plant drink.`
  - `oat_milk.instead`: `A short-list unsweetened almond milk is the next plant drink.`
  (Both at most 24 words, not equal to the card's cart_pick, no "fortif"; the cards `coconut_milk_beverage` and every other field of almond and oat stay byte for byte.)
- Not migrated (`counter_cards` is not touched by this spec).

## Hard limits
Non-negotiables 2, 3, 6, 7: never state or imply any hormone, testosterone, estrogen or bodily effect of soy, and no health claim either way; food never treats, prevents or causes anything; zero first person; no em dash; no price; no brand; accuracy outranks firmness. Every sentence at most 20 words and at most one semicolon. Do not add the words the C6 gate bans to any added or changed string.

## Pins and older tests (from the DRY RUN: baseline npm test green, then edits applied, then `npm test` run; tree restored)
With exactly the copy above, the pin changes below and the C3 fix, the combined DRY RUN (npm test 2782 tests, 2782 pass, 0 fail; twoLineCheck 181 checked, 0 violations) is green. Before the pin edits it had these failures. Failures seen on the way and their fixes:
1. `lib/perimeter.test.js:207` (cart_pick a grocery name, at most 46 chars) and `ca-4b` C3 (cart_pick at most 46 chars): fixed by the short `cart_pick` above (a 48-character first draft failed).
2. `test/acceptance/twoLinePin.js:3281` (pin equals live KB), `twoLinePin.test.js:12` and `:26`, `ca-7.test.js:370` A4, `w2.test.js:425` W2, `ca-4b.test.js:160` C1: all fixed by one edit to the `soy_milk` entry of `TWO_LINE` in `server/test/acceptance/twoLinePin.js` (line ~2195). Also pin `instead` on the `almond_milk` and `oat_milk` entries of `TWO_LINE` (add it as the first field of each pin, with the two new strings above); that is what keeps ca-4b C1 (which still pins the OLD instead text in its SPEC and compares to `beforeTwoLine`) and ca-7 A4 / w2 W2 green. Do NOT edit ca-4b.test.js; changing its SPEC to the new text makes ca-4b C1 fail. Set `decision` to the new decision; set `buying_tips` to the eleven strings (four new, seven old); set `watch_out` to the three strings; keep `sources` as is; and ADD the fields `cart_pick`, `kristy_take` and `pick_steps` (both strings) pinned to the new live values. Do NOT pin `tier_note` (pinning it makes ca-4b C3 `tier_note not unique` fail, because that test reads the unrestored KB). `beforeTwoLine` then restores the historical value of every pinned field for the frozen-history tests (ca-7 A4, w2 W2, ca-4b C1) and `twoLinePin.test.js` still proves the pin equals live. No `CONCERN` set change (`soy_milk` is already a member).
3. `server/test/acceptance/concernBioengineered.test.js:67` (C3, "soy_milk buying_tips lost or reordered a line"; baseline `c24aea0` prefix check): the one that stays red without a fix. Required exact fix, scoped to `soy_milk` only, inside the C3 loop: for `id === 'soy_milk'` replace the `slice(0, old.length)` prefix check on `buying_tips` with "every pre-batch tip is still present" (`for (const t of old) assert.ok((a[f] || []).includes(t), ...)`, keeping the existing `> old.length` check), and drop `decision`, `cart_pick`, `kristy_take` and `pick_steps` from the frozen-field list for that id (this batch owns them; `tier_note` and the rest stay frozen, `watch_out` keeps the prefix check, the `tip0` equality check is skipped for soy_milk). Every other id keeps the exact existing assertions. Do not touch any other line of that file.
4. Verified green with these edits and nothing else: ktight, k19, k20, ic7b, ca-1, ca-4b (C1, C2, C3), concernDairy, passRule, twoLineCheck (181 checked, 0 violations), counterCardLint, k16.
If a different older test fails on the builder's wording, report it (file:line, assertion); do not edit it beyond the `beforeConcern(e, { copy: true })` read pattern scoped to `soy_milk`, and never edit `fixtures/*` or `*.before.json`.

## Criteria
- C1 [test] `soy_milk` decision points to a short list: names "short list" and "soybeans and water", says unsweetened, has at most 10 words, and no longer says "fortified". `cart_pick` is an unsweetened soy milk row of at most 46 characters, no "fortified", and still resolves to `soy_milk` through `matchItemToCard`.
- C2 [test] The ranking line is on the card: a short-list almond milk ranks above soy milk, and dairy shoppers are pointed to the Milk card.
- C3 [test] Fortified is no longer the pick but the facts stay: tip 0 is the short-list tip (at most 90 characters, no "fortif"); a new line says fortifying adds ingredients; the pre-batch FDA dairy-group lines are all still on the card.
- C4 [test] Earlier batches stay: every pre-batch `buying_tips` and `watch_out` string is still present (carrageenan, bioengineered, organic lines), watch_out keeps its order, `sources` and all frozen fields are unchanged, and `coconut_milk_beverage` is byte-identical; `almond_milk` and `oat_milk` differ from the baseline only in `instead`.
- C7 [test] `almond_milk.instead` and `oat_milk.instead` point to another short-list plant milk (oat on almond, almond on oat), no longer name soy or fortified, stay at most 24 words, and differ from their cart_pick; no card in the KB says "Fortified unsweetened soy milk is the next plant drink".
- C5 [test] Added lines are readable: at most 20 words a sentence, at most one semicolon.
- C6 [test] No text this batch adds or changes contains testosterone, estrogen, hormone, phyto, male, men's, a causes/prevents/risk/health/toxic/safe word, first person, an em dash, a price or calorie word, or a brand name. The do line mirrors the new headline.

Also (verify, not a criterion): whole suite green; `twoLineCheck` 181 checked, 0 violations; `buildDoLines.js` writes a diff on the `soy_milk` key only.

## Contract
```json
{
  "criteria": [
    {"id": "C1", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/soyMilkRank.test.js"], "dependents": []},
    {"id": "C2", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/soyMilkRank.test.js"], "dependents": []},
    {"id": "C3", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/soyMilkRank.test.js"], "dependents": []},
    {"id": "C4", "impl": ["server/kristy_perimeter_kb.json", "server/test/acceptance/twoLinePin.js", "server/test/acceptance/concernBioengineered.test.js"], "tests": ["server/test/acceptance/soyMilkRank.test.js"], "dependents": []},
    {"id": "C7", "impl": ["server/kristy_perimeter_kb.json", "server/test/acceptance/twoLinePin.js"], "tests": ["server/test/acceptance/soyMilkRank.test.js"], "dependents": []},
    {"id": "C5", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/soyMilkRank.test.js"], "dependents": []},
    {"id": "C6", "impl": ["server/kristy_perimeter_kb.json", "docs/do-lines-review.md", "server/lib/doLines.json"], "tests": ["server/test/acceptance/soyMilkRank.test.js"], "dependents": []}
  ],
  "env": {"executables": ["node", "npm", "git"], "browsers": [], "temp": "none", "network": false}
}
```

## Acceptance server/test/acceptance/soyMilkRank.test.js
```js
// soy-milk-rank: soy milk ranks below short-list plant milks; fortified is no longer the pick; FDA facts and earlier lines stay; no health claims.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { nonEmpty } from '../../lib/testGuards.js';
import { matchItemToCard } from '../../lib/listMatch.js';
import doLines from '../../lib/doLines.json' with { type: 'json' };

const kb = JSON.parse(readFileSync(new URL('../../kristy_perimeter_kb.json', import.meta.url), 'utf8'));
const ROOT = new URL('../../../', import.meta.url).pathname;
const pre = JSON.parse(execFileSync('git', ['show', 'f3ab9b4:server/kristy_perimeter_kb.json'], { cwd: ROOT, maxBuffer: 64 << 20 }).toString());
const card = (id) => { const e = kb.entries.find((x) => x.id === id); assert.ok(e, `${id} missing`); return e; };
const was = (id) => { const e = pre.entries.find((x) => x.id === id); assert.ok(e, `${id} missing before`); return e; };
const SKIP = new Set(['sources', 'aliases', 'asked_as', 'id', 'kind', 'category']);
const strings = (v) => (typeof v === 'string' ? [v] : Array.isArray(v) ? v.flatMap(strings) : v && typeof v === 'object' ? Object.values(v).flatMap(strings) : []);
const fields = (e) => Object.entries(e).filter(([k]) => !SKIP.has(k)).flatMap(([, v]) => strings(v));
// Text this batch adds or changes; lines already on the card before the batch are not this batch's claims.
const addedList = (id) => { const old = new Set(fields(was(id))); return fields(card(id)).filter((s) => !old.has(s)); };
const added = (id) => addedList(id).join(' \n ');
const words = (s) => String(s).trim().split(/\s+/).filter(Boolean).length;

const ID = 'soy_milk';
const soy = () => card(ID);
const tips = () => (soy().buying_tips || []);

test('C1 the decision and cart pick point to a short list, not fortified', () => {
  const { decision, cart_pick } = soy();
  assert.match(decision, /short list/i, 'names a short list');
  assert.match(decision, /soybeans and water/i, 'beyond soybeans and water');
  assert.match(decision, /unsweetened/i);
  assert.doesNotMatch(decision, /fortif/i, 'fortified is no longer the pick');
  assert.ok(words(decision) <= 10, `decision runs ${words(decision)} words`);
  assert.match(cart_pick, /unsweetened soy milk/i);
  assert.doesNotMatch(cart_pick, /fortif/i);
  assert.ok(cart_pick.length <= 46, `cart_pick is ${cart_pick.length} characters`);
  const m = matchItemToCard(cart_pick);
  assert.equal(m ? m.slug ?? m.id ?? m.entry?.id : null, ID, 'cart_pick resolves to the soy_milk card');
});

test('C2 a short-list almond milk ranks above soy milk, and dairy shoppers see the Milk card', () => {
  const t = tips().join(' \n ');
  assert.match(t, /almond[\s\S]*(ranks )?above[\s\S]*soy milk/i, 'almond milk ranks above soy milk');
  assert.match(t, /short[- ]list/i);
  assert.match(t, /dairy[\s\S]*\bMilk\b|\bMilk card\b/, 'dairy shoppers are pointed to the Milk card');
  assert.equal(kb.entries.find((e) => e.id === 'whole_vs_reduced_fat_milk').title, 'Milk', 'the pointed-to card is titled Milk');
});

test('C3 fortified is not the pick, fortification adds ingredients, and the FDA facts stay', () => {
  const t0 = tips()[0];
  assert.match(t0, /soybeans and water/i, 'tip 0 is the short-list tip');
  assert.doesNotMatch(t0, /fortif/i, 'tip 0 no longer leads with fortified');
  assert.ok(t0.length <= 90, `tip 0 is ${t0.length} characters`);
  assert.match(added(ID), /fortif[\s\S]*(ingredient|list)/i, 'a new line says fortifying adds ingredients');
  for (const f of ['why', 'short_answer', 'detail', 'science']) assert.equal(soy()[f], was(ID)[f], `${f} (the FDA dairy-group facts) changed`);
  assert.match(soy().why + soy().detail, /dairy group/i);
  for (const s of was(ID).buying_tips) assert.ok(tips().includes(s), `old tip lost: ${s}`);
});

test('C4 earlier batches stay; frozen fields and the sibling plant milks are untouched', () => {
  const a = soy(), b = was(ID);
  assert.deepEqual((a.watch_out || []).slice(0, b.watch_out.length), b.watch_out, 'watch_out lost or reordered a line');
  assert.ok(a.watch_out.length > b.watch_out.length, 'watch_out gained nothing');
  for (const re of [/carrageenan/i, /bioengineered/i, /Non-GMO Project Verified/]) assert.match([...a.buying_tips, ...a.watch_out].join(' '), re);
  assert.deepEqual(a.sources, b.sources, 'sources changed');
  for (const f of ['tier_note', 'why', 'short_answer', 'detail', 'science', 'labels_decoded', 'instead', 'aliases', 'asked_as', 'question', 'title', 'evidence_tier', 'category']) assert.deepEqual(a[f], b[f], `${f} changed`);
  assert.equal(a.pick_steps[1], b.pick_steps[1], 'pick_steps[1] changed');
  assert.deepEqual(card('coconut_milk_beverage'), was('coconut_milk_beverage'), 'coconut_milk_beverage changed');
  for (const id of nonEmpty(['almond_milk', 'oat_milk'], 'sibling plant milks', 2)) assert.deepEqual({ ...card(id), instead: 0 }, { ...was(id), instead: 0 }, `${id} changed beyond instead`);
});

test('C7 sibling instead lines point to another short-list plant milk', () => {
  const want = { almond_milk: /oat milk/i, oat_milk: /almond milk/i };
  for (const [id, re] of Object.entries(want)) {
    const { instead, cart_pick } = card(id);
    assert.match(instead, /short[- ]list/i, `${id} instead names a short list`);
    assert.match(instead, re, `${id} instead names the other plant milk`);
    assert.doesNotMatch(instead, /soy|fortif/i, `${id} instead no longer names fortified soy`);
    assert.ok(words(instead) <= 24 && instead !== cart_pick, `${id} instead length or equals cart_pick`);
    assert.doesNotMatch(added(id), /testosterone|estrogen|hormon|—|\b(I|me|my)\b/i);
  }
  for (const e of nonEmpty(kb.entries, 'kb entries', 100)) assert.doesNotMatch(String(e.instead ?? ''), /fortified unsweetened soy milk is the next/i, `${e.id} still names fortified soy as the next plant drink`);
});

test('C5 new lines are readable: at most 20 words a sentence, at most one semicolon', () => {
  const lines = nonEmpty(addedList(ID), 'soy_milk added lines', 4);
  for (const l of lines) {
    for (const s of l.split(/(?<=[.!?])\s+/)) {
      assert.ok(s.split(/\s+/).length <= 20, `sentence over 20 words: ${s}`);
      assert.ok((s.match(/;/g) || []).length <= 1, `stacked semicolons: ${s}`);
    }
  }
});

test('C6 no hormone, health, first person, em dash, price, calorie or brand wording; the do line mirrors the headline', () => {
  const t = nonEmpty([added(ID), String(doLines[ID] ?? '')], 'added text', 2).join(' \n ');
  assert.doesNotMatch(t, /testosterone|estrogen|hormon|phyto|male|men's/i, 'hormone or bodily-effect wording');
  assert.doesNotMatch(t, /\b(causes?|prevents?|treats?|cures?|lowers? (the )?risk|cancer|toxic\w*|unsafe|safe|safer|harm\w*|risks?|linked to|health\w*|neurolog\w*|immun\w*|exposure|doses?|allerg\w*|estro\w*)\b/i, 'health or treatment wording');
  assert.doesNotMatch(t, /\b(I|me|my)\b/, 'first person');
  assert.doesNotMatch(t, /—/, 'em dash');
  assert.doesNotMatch(t, /\$\s?\d|\bprice\w*|\bcheap\w*|\bcalor\w*|\blogged\b/i, 'price or calorie wording');
  assert.doesNotMatch(t, /\b(Silk|Oatly|Califia|Pacific|Westsoy|Edensoy|Whole Foods|Costco|Kroger|Trader Joe)\b/i, 'brand name');
  assert.match(doLines[ID], /soybeans and water/i, 'the do line mirrors the new headline');
  assert.doesNotMatch(String(doLines[ID]), /fortif/i);
  assert.match(readFileSync(new URL('../../../docs/do-lines-review.md', import.meta.url), 'utf8'), /\| `soy_milk` \| eggs_dairy \| Unsweetened soy milk, a short list beyond soybeans and water\. \|/, 'review table row carries the new headline');
});
```
