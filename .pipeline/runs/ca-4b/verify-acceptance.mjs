// Run the exact embedded acceptance with only file-location and projected-input adapters.
import { readFileSync, writeFileSync } from 'node:fs';
import { ROOT, project } from './project.mjs';
import { parseReviewTable } from '../../../server/lib/counterCards.js';
const { kb, doLines, reviewText } = project();
globalThis.CA4B_PROJECTED = { kb, doLines, reviewText, reviewed: parseReviewTable(reviewText) };
const spec = readFileSync(new URL('.pipeline/specs/ca-4b.md', ROOT), 'utf8');
const acceptance = spec.split('## Acceptance server/test/acceptance/ca-4b.test.js\n\n```js\n')[1].split('\n```')[0] + '\n';
if (acceptance !== readFileSync(new URL('./acceptance.test.js', import.meta.url), 'utf8')) throw new Error('Materialized acceptance differs from embedded test');
const src = acceptance
  .replace(/from '\.\.\/\.\.\/lib\/([^']+)'/g, (_, file) => `from '${new URL('server/lib/' + file, ROOT).href}'`)
  .replace("from './passRule.js'", `from '${new URL('server/test/acceptance/passRule.js', ROOT).href}'`)
  .replace("const SERVER = join(dirname(fileURLToPath(import.meta.url)), '..', '..');", `const SERVER = ${JSON.stringify(new URL('server', ROOT).pathname)};`)
  .replace(/^const kb = .*;$/m, 'const kb = globalThis.CA4B_PROJECTED.kb;')
  .replace(/^const reviewText = .*;$/m, 'const reviewText = globalThis.CA4B_PROJECTED.reviewText;')
  .replace(/^const doLines = .*;$/m, 'const doLines = globalThis.CA4B_PROJECTED.doLines;');
const target = new URL('./projected-acceptance.mjs', import.meta.url);
writeFileSync(target, src);
await import(target.href);
