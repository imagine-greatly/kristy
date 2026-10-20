// concern-deli: deli and cured-meat cards name the hidden concerns (nitrite, celery powder, phosphates,
// binders, smoke flavoring) and lead with organic / pasture-raised; new sources come from the concern archive.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { nonEmpty } from '../../lib/testGuards.js';
import { preCleanPick8 } from './twoLinePin.js';

const kb = JSON.parse(readFileSync(new URL('../../kristy_perimeter_kb.json', import.meta.url), 'utf8'));
const card = (id) => { const e = kb.entries.find((x) => x.id === id); assert.ok(e, `${id} missing`); return e; };
const SKIP = new Set(['sources', 'aliases', 'asked_as', 'id', 'kind', 'category']);
const text = (e) => JSON.stringify(Object.fromEntries(Object.entries(e).filter(([k]) => !SKIP.has(k))));

const CURED = ['deli_meat_uncured', 'bacon', 'hot_dogs', 'ham', 'turkey_bacon', 'cured_pork'];
const CARDS = [...CURED, 'pork_cuts_and_enhanced'];
const PICKS = ['pick_sausage', 'pick_jerky'];
const ALL = [...CARDS, ...PICKS];

const root = new URL('../../../docs/sources/concerns/', import.meta.url).pathname;
const archived = new Set();
for (const d of readdirSync(root, { withFileTypes: true }).filter((x) => x.isDirectory())) {
  for (const f of readdirSync(join(root, d.name)).filter((x) => x.endsWith('.md'))) {
    const m = readFileSync(join(root, d.name, f), 'utf8').match(/^url:\s*(\S+)/m);
    if (m) archived.add(m[1]);
  }
}
// The URLs these nine cards carried before concern-deli (2026-10-18); they may stay.
const BEFORE = new Set(["https://extension.oregonstate.edu/catalog/pnw-784-making-cured-bacon-home","https://health.clevelandclinic.org/turkey-bacon-how-healthy-is-it-really","https://www.canr.msu.edu/news/ham_for_the_holidays_and_all_year_long","https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/meat-catfish/bacon-and-food-safety","https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/meat-catfish/hams-and-food-safety","https://www.law.cornell.edu/cfr/text/9/317.17","https://www.law.cornell.edu/cfr/text/9/317.2","https://www.law.cornell.edu/cfr/text/9/319.140","https://www.law.cornell.edu/cfr/text/9/319.141","https://www.law.cornell.edu/cfr/text/9/319.180","https://www.law.cornell.edu/cfr/text/9/381.173","https://www.ndsu.edu/agriculture/extension/publications/jerky-native-american-inspired-snack-we-all-can-enjoy-today","https://www.nichemeatprocessing.org/uncured-bacon/","https://www.npr.org/sections/thesalt/2019/08/29/755115208/duped-in-the-deli-aisle-no-nitrates-added-labels-are-often-misleading"]);

test('C1 cured cards name celery and nitrite', () => {
  for (const id of nonEmpty(CURED, 'cured', 6)) {
    const t = text(card(id));
    assert.match(t, /celery/i, `${id} celery`);
    assert.match(t, /nitrite/i, `${id} nitrite`);
  }
});

test('C2 decisions lead with organic / pasture / grass-fed', () => {
  for (const id of nonEmpty(CARDS, 'cards', 7)) assert.match(card(id).decision, /organic|pasture|grass-fed/i, `${id} decision`);
});

test('C3 phosphates and binders named', () => {
  for (const id of ['deli_meat_uncured', 'ham', 'hot_dogs']) {
    const t = text(card(id));
    assert.match(t, /phosphate/i, `${id} phosphate`);
    assert.match(t, /binder|carrageenan/i, `${id} binder`);
  }
  assert.match(text(card('pork_cuts_and_enhanced')), /phosphate/i);
});

test('C4 smoke flavoring named', () => {
  for (const id of ['bacon', 'ham', 'hot_dogs']) assert.match(text(card(id)), /smoke flavou?ring|liquid smoke/i, id);
});

test('C5 pick decisions name celery', () => {
  for (const id of nonEmpty(PICKS, 'picks', 2)) assert.match(card(id).decision, /celery/i, id);
});

// k9 (frozen at 719f9fe) runs passRule on deli_meat_uncured, and card-align cards freeze
// `sources`, so that card keeps its 5a53252 sources and cannot cite the concern archive.
const SOURCES_FROZEN = new Set(['deli_meat_uncured']);

test('C6 sources come from the concern archive', () => {
  nonEmpty([...archived], 'archived urls', 100);
  for (const id of ALL.filter((i) => !SOURCES_FROZEN.has(i))) {
    const urls = nonEmpty((preCleanPick8(card(id)).sources || []).map((s) => (typeof s === 'string' ? (s.match(/https?:\S+/) || [])[0] : s.url)).filter(Boolean), `${id} sources`, 1);
    assert.ok(urls.some((u) => archived.has(u)), `${id} cites no concern-archive url`);
    for (const u of urls) assert.ok(BEFORE.has(u) || archived.has(u), `${id} url not archived: ${u}`);
  }
});

test('C7 no treatment claims, no first person', () => {
  for (const id of ALL) {
    const t = text(card(id));
    assert.doesNotMatch(t, /\b(causes?|prevents?|lowers? (the )?risk|carcinogen\w*|cancer)\b/i, `${id} treatment`);
    assert.doesNotMatch(t, /\b(I|me|my)\b/, `${id} first person`);
  }
});
