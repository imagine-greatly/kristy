// Apply {id: {field: value}} patches. --check validates without writing.
import { readFileSync, writeFileSync, realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { lintCard, lintFamilyMetadata, lintFamilyReferences } from '../lib/counterCardLint.js';

export const FIELDS = new Set(['title', 'aliases', 'category', 'question', 'decision', 'why', 'short_answer', 'detail',
  'evidence_tier', 'sources', 'kristy_take', 'instead', 'cart_pick', 'buying_tips', 'watch_out', 'pick_steps',
  'science', 'labels_decoded', 'tier_note', 'eyebrow_short', 'asked_as', 'kind', 'family', 'delta',
  'shopper_questions', 'season_storage']);
const KINDS = new Set(['pick', 'family', 'aisle']);

export function applyPatches(kb, batches) {
  const result = structuredClone(kb);
  const byId = new Map(result.entries.map((e) => [e.id, e]));
  let updated = 0, added = 0;
  for (const patches of batches) {
    if (!patches || typeof patches !== 'object' || Array.isArray(patches)) throw new Error('patches must be an object');
    for (const [id, patch] of Object.entries(patches)) {
      if (!patch || typeof patch !== 'object' || Array.isArray(patch)) throw new Error(`${id}: patch must be an object`);
      for (const field of Object.keys(patch)) if (!FIELDS.has(field)) throw new Error(`${id}.${field} not a card field`);
      if (Object.hasOwn(patch, 'kind') && !KINDS.has(patch.kind)) throw new Error(`${id}: invalid kind`);
      const existing = byId.get(id);
      if (existing?.kind === 'pick') throw new Error(`${id} is a pick`);
      if (existing && Object.hasOwn(patch, 'kind') && patch.kind !== existing.kind) throw new Error(`${id}: cannot change kind`);
      if (existing) {
        Object.assign(existing, patch);
        updated++;
      } else {
        const required = patch.kind ? ['title', 'category', 'decision'] : ['title', 'aliases', 'category', 'decision'];
        for (const field of required) if (!patch[field]) throw new Error(`new ${id} needs ${field}`);
        const entry = { id, ...patch };
        result.entries.push(entry);
        byId.set(id, entry);
        added++;
      }
    }
  }
  const errors = result.entries.flatMap((entry) => {
    const issues = entry.kind != null ? lintCard(entry) : lintFamilyMetadata(entry);
    return issues.map((v) => `${entry.id}: ${v.code}: ${v.detail}`);
  });
  errors.push(...lintFamilyReferences(result.entries).map((v) => `${v.id}: ${v.code}: ${v.detail}`));
  if (errors.length) throw new Error(errors.join('\n'));
  return { kb: result, updated, added };
}

function main() {
  const path = new URL('../kristy_perimeter_kb.json', import.meta.url);
  const check = process.argv.includes('--check');
  const files = process.argv.slice(2).filter((a) => a !== '--check');
  const { kb, updated, added } = applyPatches(JSON.parse(readFileSync(path, 'utf8')),
    files.map((f) => JSON.parse(readFileSync(f, 'utf8'))));
  if (!check) writeFileSync(path, JSON.stringify(kb, null, 2) + '\n');
  console.log(`${updated} updated, ${added} added${check ? ' (check only)' : ''}`);
}
if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) main();
