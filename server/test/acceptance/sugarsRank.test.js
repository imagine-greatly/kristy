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
