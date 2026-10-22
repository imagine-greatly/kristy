// Shared guard for completeness-pass card patches (docs/research/completeness/patches/<group>.json).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const kb = JSON.parse(readFileSync(join(ROOT, 'server', 'kristy_perimeter_kb.json'), 'utf8'));
const FIELDS = new Set(['title', 'aliases', 'category', 'question', 'decision', 'why', 'short_answer', 'detail',
  'evidence_tier', 'sources', 'kristy_take', 'instead', 'cart_pick', 'buying_tips', 'watch_out', 'pick_steps',
  'science', 'labels_decoded', 'tier_note', 'eyebrow_short', 'asked_as']);
const BAD = [
  [/\b(I|me|my|mine|we|our)\b/, 'first person'],
  [/—/, 'em dash'],
  [/\$\s?\d|\bper (pound|lb|ounce|oz)\b/i, 'price'],
  [/safe levels|buy conventional|considered safe|FDA says|low-residue|just as good|broadly comparable/i, 'reassurance'],
  [/\b(cures?|treats?|prevents?|heals?|detox\w*|reverses?)\b/i, 'treatment claim'],
  [/\b(she|her|hers)\b/, 'Kristy as her'],
];
const GOV = /(\.gov\b|\.edu\b|usda|fda\b|cdc\b|epa\b|extension|ewg\.org|cspi|consumerreports|seafoodwatch|msc\.org|eosta)/i;

const strings = (v) => (typeof v === 'string' ? [v] : Array.isArray(v) ? v.flatMap(strings) : v && typeof v === 'object' ? Object.values(v).flatMap(strings) : []);

// group: patch file name; required: ids the patch must cover (all must be cards in the KB or new ids).
export function patchSuite(group, required) {
  const file = join(ROOT, 'docs', 'research', 'completeness', 'patches', `${group}.json`);
  test(`C1 ${group} patch exists and covers required cards`, () => {
    assert.ok(existsSync(file), `missing ${file}`);
    const p = JSON.parse(readFileSync(file, 'utf8'));
    const missing = required.filter((id) => !p[id]);
    assert.deepEqual(missing, [], 'cards with no patch');
  });
  test(`C2 C3 ${group} patch fields and copy rules`, () => {
    const p = JSON.parse(readFileSync(file, 'utf8'));
    const byId = new Map(kb.entries.map((e) => [e.id, e]));
    const bad = [];
    for (const [id, c] of Object.entries(p)) {
      if (byId.get(id)?.kind === 'pick') bad.push(`${id}: is a pick`);
      for (const k of Object.keys(c)) if (!FIELDS.has(k)) bad.push(`${id}.${k}: not a field`);
      for (const [k, v] of Object.entries(c)) {
        if (k === 'sources') continue;
        for (const s of strings(v)) for (const [re, why] of BAD) if (re.test(s)) bad.push(`${id}.${k}: ${why}: ${s.slice(0, 60)}`);
      }
      if (c.sources) for (const s of strings(c.sources)) if (GOV.test(s)) bad.push(`${id}.sources: non-holistic: ${s.slice(0, 60)}`);
    }
    assert.deepEqual(bad, []);
  });
}
