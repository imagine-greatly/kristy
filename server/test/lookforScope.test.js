// Look-for scope (S3): LOOKFOR_OFF_TOPIC over the curated KB. Look for names the healthiest
// version; storing, ripening, rinsing, cooking and tasting belong to the five home cards.
// Lines still on a card sit in LOOKFOR_GRANDFATHER, which can only shrink.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import kb from '../kristy_perimeter_kb.json' with { type: 'json' };
import { nonEmpty } from '../lib/testGuards.js';
import {
  LOOKFOR_OFF_TOPIC, LOOKFOR_ALLOW, LOOKFOR_HOME, LOOKFOR_GRANDFATHER, lookforOffTopic, lintLookforScope,
} from '../lib/counterCardLint.js';

const byId = new Map(kb.entries.map((e) => [e.id, e]));
const cards = nonEmpty(kb.entries.filter((e) => e.buying_tips || e.pick_steps || e.look_for), 'look-for corpus', 250);

test('every curated entry is clean outside the grandfather list and the home cards', () => {
  const bad = cards.flatMap((e) => lintLookforScope(e).map((v) => `${e.id}.${v.field}: ${v.text}`));
  assert.deepEqual(bad, [], `off-topic Look for lines:\n  ${bad.join('\n  ')}`);
});

test('the grandfather list only shrinks: every listed line is still on its card and still hits', () => {
  nonEmpty([...LOOKFOR_GRANDFATHER], 'LOOKFOR_GRANDFATHER', 1);
  assert.ok(LOOKFOR_GRANDFATHER.size <= 8, `LOOKFOR_GRANDFATHER grew: ${LOOKFOR_GRANDFATHER.size} > 8 (S3 left 8)`);
  for (const [key, why] of LOOKFOR_GRANDFATHER) {
    const [id, line] = key.split('\t');
    const e = byId.get(id);
    assert.ok(e, `grandfathered card ${id} is gone; drop it from LOOKFOR_GRANDFATHER`);
    const on = ['buying_tips', 'pick_steps', 'look_for'].some((f) => (e[f] || []).includes(line));
    assert.ok(on, `grandfathered line gone from ${id}; drop it from LOOKFOR_GRANDFATHER: ${line}`);
    assert.ok(lookforOffTopic(line), `grandfathered line no longer hits; drop it: ${id}: ${line}`);
    assert.ok(why.length > 10, `${id}: every grandfathered line names its reason`);
  }
});

test('a new offending line goes red, in each field and for each vocabulary family', () => {
  const samples = {
    storage: 'Keep the jar in the fridge after opening.',
    ripening: 'Let them ripen on the counter.',
    rinse: 'Rinse them before eating.',
    cook: 'Toast them in a dry pan.',
    taste: 'Grass-fed butter tastes of the pasture.',
  };
  assert.deepEqual(Object.keys(samples).sort(), Object.keys(LOOKFOR_OFF_TOPIC).sort(), 'one sample per vocabulary family');
  for (const [family, line] of nonEmpty(Object.entries(samples), 'samples', 5)) {
    assert.equal(lookforOffTopic(line), family, line);
    for (const field of ['look_for', 'pick_steps', 'buying_tips']) {
      const v = lintLookforScope({ id: 'x_new_card', [field]: ['Look for USDA Organic.', line] });
      assert.equal(v.length, 1, `${field}: ${line}`);
      assert.equal(v[0].code, 'LOOKFOR_OFF_TOPIC');
    }
  }
  // A real card plus one offending line: the corpus test would go red.
  const frozen = byId.get('frozen');
  assert.equal(lintLookforScope({ ...frozen, buying_tips: [...frozen.buying_tips, 'Thaw it overnight in the fridge.'] }).length, 1);
  // The grandfather key is the exact line, not the card: a reworded copy of a held line fails.
  assert.equal(lintLookforScope({ ...frozen, buying_tips: ['Keep the home freezer at 0°F.'] }).length, 1);
});

test('home cards are exempt, and real criteria do not hit', () => {
  assert.equal(LOOKFOR_HOME.size, 5);
  for (const id of LOOKFOR_HOME) assert.ok(byId.has(id), `home card ${id} exists`);
  assert.deepEqual(lintLookforScope({ id: 'washing_produce', buying_tips: ['Rinse under running water.'] }), []);
  for (const ok of [
    'Look for USDA Organic and 100% grass-fed on the label.',
    'Pick it from the refrigerated case.',
    'Read the list: tomatoes and salt, nothing added.',
    'Look for ‘tree-ripened’ on the box.',
    'Pick cold-pressed oil in dark glass.',
  ]) assert.equal(lookforOffTopic(ok), null, ok);
});

test('every allowlist phrase would hit without its mask', () => {
  for (const [re, why] of nonEmpty(LOOKFOR_ALLOW, 'LOOKFOR_ALLOW', 1)) {
    const phrase = 'tree-ripened vine ripened'.match(new RegExp(re.source, 'i'))?.[0];
    assert.ok(phrase, `allow ${re} has no sample`);
    assert.ok(Object.values(LOOKFOR_OFF_TOPIC).some((v) => v.test(phrase)), `allow ${re} masks nothing (${why})`);
  }
});
