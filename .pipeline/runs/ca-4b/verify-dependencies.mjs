// Process-local fixture projection; import existing tests unchanged, preserving their assertions.
import fs from 'node:fs';
import { syncBuiltinESMExports } from 'node:module';
import { fileURLToPath } from 'node:url';
import importedKb from '../../../server/kristy_perimeter_kb.json' with { type: 'json' };
import { ROOT, project } from './project.mjs';
const { kb, doLines, reviewText } = project();
Object.assign(importedKb, kb);
const realRead = fs.readFileSync;
const fixtures = new Map([
  [fileURLToPath(new URL('server/kristy_perimeter_kb.json', ROOT)), JSON.stringify(kb)],
  [fileURLToPath(new URL('server/lib/doLines.json', ROOT)), JSON.stringify(doLines)],
  [fileURLToPath(new URL('docs/do-lines-review.md', ROOT)), reviewText],
]);
fs.readFileSync = (path, options) => {
  const key = path instanceof URL ? fileURLToPath(path) : String(path);
  if (!fixtures.has(key)) return realRead(path, options);
  const value = fixtures.get(key);
  return typeof options === 'string' || options?.encoding ? value : Buffer.from(value);
};
syncBuiltinESMExports();
for (const file of [
  'server/lib/counterDecision.test.js', 'server/lib/counterPath.test.js', 'server/lib/perimeter.test.js',
  'server/lib/kindFilter.test.js', 'server/lib/counterCardLint.test.js', 'server/lib/counterReach.test.js',
  'server/test/healthFirst.test.js', 'server/test/ktight.test.js', 'server/test/counterProbe48.test.js',
  'server/test/acceptance/ca-1.test.js', 'server/test/acceptance/ca-4a.test.js',
  'server/test/acceptance/ic7b.test.js', 'server/test/acceptance/ic8a.test.js', 'server/test/acceptance/ic8b.test.js',
  'server/test/acceptance/k8.test.js', 'server/test/acceptance/k19.test.js', 'server/test/acceptance/k21.test.js', 'server/test/acceptance/k22.test.js',
]) await import(new URL(file, ROOT).href);
await import(new URL('server/scripts/listMatchProbe.js', ROOT).href);
