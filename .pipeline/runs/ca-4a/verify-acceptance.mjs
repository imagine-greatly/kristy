// Run the exact embedded acceptance against a process-local projection, without installing under server/.
import { acceptance, data, project } from './project.mjs';
import { parseReviewTable } from '../../../server/lib/counterCards.js';
import { readFileSync, writeFileSync } from 'node:fs';
const root = new URL('../../../', import.meta.url);
const { kb, doLines } = project();
const reviewed = parseReviewTable(readFileSync(new URL('docs/do-lines-review.md', root), 'utf8'));
for (const id of data.CHANGED) reviewed.set(id, { ...reviewed.get(id), headline: kb.entries.find(e => e.id === id).decision, do: doLines[id] });
globalThis.CA4A_PROJECTED = { kb, doLines, reviewed };
let src = acceptance
  .replace(/from '\.\.\/\.\.\/lib\/([^']+)'/g, (_, file) => `from '${new URL('server/lib/' + file, root).href}'`)
  .replace("from './passRule.js'", `from '${new URL('server/test/acceptance/passRule.js', root).href}'`)
  .replace("const SERVER = join(dirname(fileURLToPath(import.meta.url)), '..', '..');", `const SERVER = ${JSON.stringify(new URL('server', root).pathname)};`)
  .replace(/^const kb = .*;$/m, 'const kb = globalThis.CA4A_PROJECTED.kb;')
  .replace(/^const reviewed = .*;$/m, 'const reviewed = globalThis.CA4A_PROJECTED.reviewed;')
  .replace(/^const doLines = .*;$/m, 'const doLines = globalThis.CA4A_PROJECTED.doLines;');
const projectedTest = new URL('./projected-acceptance.mjs', import.meta.url);
writeFileSync(projectedTest, src);
await import(projectedTest.href);
