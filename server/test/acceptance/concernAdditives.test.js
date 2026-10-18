// concern-additives: dye cards name synthetic dyes and the no-added-color rung; fat and grain cards name BHA, BHT and
// TBHQ and say to read the list; earlier seed-oil, glyphosate and rBST lines stay; no illness claims; sources from the archive.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { nonEmpty } from '../../lib/testGuards.js';

const kb = JSON.parse(readFileSync(new URL('../../kristy_perimeter_kb.json', import.meta.url), 'utf8'));
const ROOT = new URL('../../../', import.meta.url).pathname;
const pre = JSON.parse(execFileSync('git', ['show', 'bd8a1cc:server/kristy_perimeter_kb.json'], { cwd: ROOT, maxBuffer: 64 << 20 }).toString());
const card = (id) => { const e = kb.entries.find((x) => x.id === id); assert.ok(e, `${id} missing`); return e; };
const was = (id) => { const e = pre.entries.find((x) => x.id === id); assert.ok(e, `${id} missing before`); return e; };
const SKIP = new Set(['sources', 'aliases', 'asked_as', 'id', 'kind', 'category']);
const strings = (v) => (typeof v === 'string' ? [v] : Array.isArray(v) ? v.flatMap(strings) : v && typeof v === 'object' ? Object.values(v).flatMap(strings) : []);
const fields = (e) => Object.entries(e).filter(([k]) => !SKIP.has(k)).flatMap(([, v]) => strings(v));
const text = (e) => fields(e).join(' \n ');
const urlsOf = (e) => (e.sources || []).map((s) => (typeof s === 'string' ? (s.match(/https?:\S+/) || [])[0] : s.url)).filter(Boolean);
const sentences = (id) => fields(card(id)).flatMap((s) => s.split(/(?<=[.;!?])\s+/));

const DYES = ['breakfast_cereal', 'frozen_waffles', 'snack_bars', 'pick_juice', 'snacks', 'yogurt_plain_vs_flavored'];
const ANTI = ['breakfast_cereal', 'crackers', 'potato_chips', 'frozen_nuggets', 'frozen_fries', 'cooking_oils'];
const FAT = ['snack_bars', 'crackers', 'potato_chips', 'frozen_nuggets', 'frozen_fries', 'cooking_oils'];
const FULL = [...new Set([...DYES, ...ANTI])].filter((id) => id !== 'pick_juice');
const ALL = [...new Set([...DYES, ...ANTI])];

const DYE_URLS = ['https://www.cspi.org/node/7436', 'https://www.cspi.org/page/synthetic-food-dyes-health-risks-history-and-policy', 'https://www.ewg.org/consumer-guides/ewgs-dirty-dozen-guide-food-chemicals-top-12-avoid'];
const PRES_URLS = ['https://www.cspi.org/node/7426', 'https://www.cspi.org/node/7416', 'https://www.ewg.org/consumer-guides/ewgs-dirty-dozen-guide-food-chemicals-top-12-avoid', 'https://www.ewg.org/foodscores/8806-article-dirty-dozen-food-chemicals-bht/'];

const root = join(ROOT, 'docs/sources/concerns');
const archived = new Set();
for (const d of readdirSync(root, { withFileTypes: true }).filter((x) => x.isDirectory())) {
  for (const f of readdirSync(join(root, d.name)).filter((x) => x.endsWith('.md'))) {
    const m = readFileSync(join(root, d.name, f), 'utf8').match(/^url:\s*(\S+)/m);
    if (m) archived.add(m[1]);
  }
}

test('C1 dye cards name dyes and the no-added-color rung', () => {
  for (const id of nonEmpty(DYES, 'dye cards', 6)) {
    const t = text(card(id));
    assert.match(t, /\bdyes?\b|\bRed 40\b|\bYellow [56]\b|\bBlue 1\b/i, `${id} dye`);
    assert.match(t, /no added colou?r|without (any )?(added )?colou?r|no colou?r added/i, `${id} no-added-color rung`);
  }
  const all = DYES.map((id) => text(card(id))).join(' ');
  assert.match(all, /Red 40/);
  assert.match(all, /Yellow 5/);
});

test('C2 antioxidant cards name the preservative and say to read the list', () => {
  const need = { breakfast_cereal: [/\bBHT\b/, /\bTBHQ\b/], crackers: [/\bTBHQ\b/], potato_chips: [/\bTBHQ\b/], frozen_nuggets: [/\bTBHQ\b/], frozen_fries: [/\bTBHQ\b/], cooking_oils: [/\bTBHQ\b/] };
  for (const id of nonEmpty(ANTI, 'antioxidant cards', 6)) {
    const t = text(card(id));
    for (const re of need[id]) assert.match(t, re, `${id} ${re}`);
    assert.match(t, /(BHA|BHT|TBHQ)[^.]*\b(list|label)\b|\b(list|label)\b[^.]*(BHA|BHT|TBHQ)/i, `${id} says read the list`);
  }
  for (const id of ['frozen_nuggets', 'frozen_fries']) for (const sent of sentences(id)) {
    if (/TBHQ|BHA|BHT/.test(sent)) assert.doesNotMatch(sent, /\b(contains?|carries|has|have|includes?)\b/i, `${id} claims it is in the product: ${sent}`);
  }
});

test('C3 earlier seed-oil, glyphosate and rBST lines stay', () => {
  for (const id of nonEmpty(FULL, 'full cards', 10)) {
    const a = card(id), b = was(id);
    for (const f of ['buying_tips', 'watch_out']) {
      const now = a[f] || [];
      for (const s of b[f] || []) assert.ok(now.includes(s), `${id}.${f} lost: ${s}`);
    }
    for (const f of ['decision', 'cart_pick', 'tier_note']) assert.equal(a[f], b[f], `${id}.${f} changed`);
    assert.equal((a.buying_tips || [])[0], (b.buying_tips || [])[0], `${id} tip0 changed`);
  }
  for (const id of FAT) {
    assert.match(text(card(id)), /Seed oils to skip: sunflower, safflower, canola, soybean, corn, and cottonseed\./, `${id} seed oils`);
    assert.match(text(card(id)), /Skip avocado oil too: the label cannot prove the oil is pure\./, `${id} avocado`);
  }
  for (const id of ['breakfast_cereal', 'snack_bars']) assert.match(text(card(id)), /glyphosate[\s\S]*organic|organic[\s\S]*glyphosate/i, `${id} glyphosate`);
  assert.match(text(card('yogurt_plain_vs_flavored')), /rBST/);
  assert.equal(card('snacks').tier_note, 'Vegetable powder colors potato flour, so the chip is mostly potato.');
  assert.doesNotMatch(ALL.map((id) => text(card(id))).join(' '), /(avocado oil)[^.]*\b(best|choose|take|good)\b/i, 'avocado oil endorsed');
});

test('C4 pick_juice keeps its facts and names a dye', () => {
  const d = card('pick_juice').decision;
  assert.match(d, /pasteurized/i);
  assert.match(d, /warning label/i);
  assert.match(d, /\bdyes?\b|\bRed 40\b|\bYellow [56]\b|\bBlue 1\b/i);
  assert.ok(d.split(/\s+/).length <= 20, `pick_juice decision too long: ${d}`);
  assert.deepEqual(Object.keys(card('pick_juice')).sort(), Object.keys(was('pick_juice')).sort(), 'pick shape changed');
});

test('C5 sources come from the concern archive', () => {
  nonEmpty([...archived], 'archived urls', 100);
  for (const u of [...DYE_URLS, ...PRES_URLS]) assert.ok(archived.has(u), `not an archive url: ${u}`);
  for (const id of ALL) {
    const before = new Set(urlsOf(was(id)));
    const urls = nonEmpty(urlsOf(card(id)), `${id} sources`, 1);
    assert.ok(urls.some((u) => archived.has(u) && !before.has(u)), `${id} adds no concern-archive url`);
    for (const u of urls) assert.ok(before.has(u) || archived.has(u), `${id} url not archived: ${u}`);
    if (DYES.includes(id)) assert.ok(urls.some((u) => DYE_URLS.includes(u)), `${id} cites no dye source`);
    if (ANTI.includes(id)) assert.ok(urls.some((u) => PRES_URLS.includes(u)), `${id} cites no preservative source`);
  }
});

test('C6 no illness claims, first person, em dash or unarchived alternatives', () => {
  const BAN = /\b(causes?|prevents?|lowers? (the )?risk|carcinogen\w*|cancer|tumou?rs?|toxic\w*|unsafe|harm\w*|risks?|linked to|hyperactiv\w*|behaviou?r\w*|attention|neurobehavioral|exacerbate)\b/i;
  for (const id of ALL) {
    const t = text(card(id));
    assert.doesNotMatch(t, BAN, `${id} treatment wording`);
    assert.doesNotMatch(t, /\b(I|me|my)\b/, `${id} first person`);
    assert.doesNotMatch(t, /—/, `${id} em dash`);
    assert.doesNotMatch(t, /vitamin e|tocopherol|rosemary/i, `${id} unarchived alternative`);
    assert.doesNotMatch(t, /\$\s?\d|\bprice\b|\bcheap\w*|\bjunk\b/i, `${id} price or junk wording`);
  }
});
