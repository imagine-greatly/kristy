#!/usr/bin/env node
// node scripts/mergeFamilyBuild.js [--check] [build-directory]
// Defaults to docs/research/deepen/build/*.json. No write occurs until all lint passes.
import { readFileSync, readdirSync, writeFileSync, renameSync, rmSync, realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { applyPatches } from './applyCardPatches.js';
import { lintCard, lintCorpus, lintFamilyReferences } from '../lib/counterCardLint.js';
import { isQuestionEntry, questionEntries } from '../lib/perimeter.js';
import { projectEntry } from '../lib/counterCards.js';
import { dialFindings } from '../lib/dialRules.js';
import doLines from '../lib/doLines.json' with { type: 'json' };

export function mergeFamilyBuild(kb, builds, { reviewed = doLines } = {}) {
  let result = structuredClone(kb);
  const byId = new Map(result.entries.map((entry) => [entry.id, entry]));
  const patches = [];
  for (const build of builds) {
    if (!build || !Array.isArray(build.families) || !Array.isArray(build.aisles) ||
      !build.patches || typeof build.patches !== 'object' || Array.isArray(build.patches)) {
      throw new Error('build needs families[], aisles[], and patches{}');
    }
    for (const [key, kind] of [['families', 'family'], ['aisles', 'aisle']]) {
      for (const entry of build[key]) {
        if (!entry || entry.kind !== kind || !entry.id) throw new Error(`${key}: invalid entry kind or id`);
        const old = byId.get(entry.id);
        if (old && old.kind !== kind) throw new Error(`${entry.id}: cannot change kind`);
        byId.set(entry.id, structuredClone({ ...old, ...entry })); // dial batches carry only the fields they change
      }
    }
    patches.push(build.patches);
  }
  result.entries = [...byId.values()];
  for (const batch of patches) {
    for (const id of Object.keys(batch)) {
      if (!isQuestionEntry(byId.get(id))) throw new Error(`${id}: patches must target existing question cards`);
    }
  }
  result = applyPatches(result, patches).kb;
  const cards = questionEntries(result.entries).map((entry) => projectEntry(entry, { doLine: reviewed[entry.id] || '' }));
  const errors = [
    ...result.entries.filter((entry) => !isQuestionEntry(entry)).flatMap((entry) =>
      lintCard(entry).map((v) => ({ ...v, id: entry.id }))),
    ...cards.flatMap((card) => lintCard(card).map((v) => ({ ...v, id: card.slug }))),
    ...lintCorpus(cards).violations,
    ...lintFamilyReferences(result.entries),
  ];
  if (errors.length) throw new Error(errors.map((v) => `${v.id || 'corpus'}: ${v.code}: ${v.detail}`).join('\n'));
  return result;
}

// A delta differentiates a family member; a standalone card (labels, frozen) keeps its own copy.
function dropFamilylessDeltas(build) {
  const patches = Object.fromEntries(Object.entries(build.patches).map(([id, p]) => {
    if (p.delta && !p.family) { const { delta, ...rest } = p; return [id, rest]; }
    return [id, p];
  }));
  return { ...build, patches };
}

function main() {
  const args = process.argv.slice(2);
  const check = args.includes('--check');
  const dir = args.find((arg) => arg !== '--check') || fileURLToPath(new URL('../../docs/research/deepen/dial/', import.meta.url));
  const files = readdirSync(dir).filter((f) => f.endsWith('.json')).sort((a, b) => (a === 'reconcile.json') - (b === 'reconcile.json') || a.localeCompare(b));
  if (!files.length) throw new Error(`no build JSON files in ${dir}`);
  const path = fileURLToPath(new URL('../kristy_perimeter_kb.json', import.meta.url));
  const kb = mergeFamilyBuild(JSON.parse(readFileSync(path, 'utf8')),
    files.map((file) => JSON.parse(readFileSync(join(dir, file), 'utf8'))).map(dropFamilylessDeltas));
  const dial = dialFindings(kb.entries.filter((e) => e.kind === 'family' || e.kind === 'aisle' || e.delta));
  if (dial.length) throw new Error(dial.map((f) => `${f.id}: ${f.code}: ${f.msg}`).join('\n'));
  if (!check) {
    const temporary = `${path}.${process.pid}.tmp`;
    try {
      writeFileSync(temporary, JSON.stringify(kb, null, 2) + '\n');
      renameSync(temporary, path);
    } finally {
      rmSync(temporary, { force: true });
    }
  }
  console.log(`${files.length} builds merged and linted; ${kb.entries.length} entries${check ? ' (check only)' : ''}`);
}
if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) main();
