#!/usr/bin/env node
// Verify a CLAUDE.md split removed NOTHING -- by extracting the emphasised
// directives, not by asserting coverage.
//
//   node server/scripts/claudeMdSplitCheck.js <ref-before-the-split>
//   e.g. node server/scripts/claudeMdSplitCheck.js 91dc27e
//
// Every **bold** span in CLAUDE.md at <ref> must still appear verbatim in the
// WORKING TREE's CLAUDE.md union docs/*.md union VOICE_SPEC.md. Exits non-zero
// and names each span that does not.
//
// ⚠️ WHAT THIS PROVES AND WHAT IT DOES NOT. It proves nothing left the CORPUS.
// It CANNOT tell you a rule left the always-loaded FILE -- a rule moved from
// CLAUDE.md into docs/ still reads as covered. It is a safety net under an
// editorial judgement, never a substitute for one.
//
// Proven able to fail before it was trusted: with the Verifying section dropped
// from CLAUDE.md it reports 27 missing.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const ref = process.argv[2];
if (!ref) {
  console.error('usage: node server/scripts/claudeMdSplitCheck.js <ref-before-the-split>');
  process.exit(2);
}

const repo = path.resolve(__dirname, '..', '..');
const norm = s => s.replace(/\s+/g, ' ').trim();

// A directive is a bold span. 12 chars filters out labels like **Why:** / **Home**.
const spans = text => {
  const out = [];
  const re = /\*\*([\s\S]+?)\*\*/g;
  let m;
  while ((m = re.exec(text))) {
    const t = norm(m[1]);
    if (t.length >= 12) out.push(t);
  }
  return [...new Set(out)];
};

const before = execFileSync('git', ['show', `${ref}:CLAUDE.md`], { cwd: repo, encoding: 'utf8' });
const baseline = spans(before);
if (!baseline.length) {
  console.error(`claudeMdSplitCheck: extracted ZERO directives from ${ref}:CLAUDE.md -- an empty`);
  console.error('collection is exactly the defect this repo names. Refusing to report success.');
  process.exit(2);
}

const files = [
  path.join(repo, 'CLAUDE.md'),
  path.join(repo, 'VOICE_SPEC.md'),
  ...fs.readdirSync(path.join(repo, 'docs'))
    .filter(f => f.endsWith('.md'))
    .map(f => path.join(repo, 'docs', f)),
].filter(fs.existsSync);

const corpus = files.map(f => norm(fs.readFileSync(f, 'utf8'))).join('\n@@@\n');
const missing = baseline.filter(d => !corpus.includes(d));

for (const d of missing) console.log('MISSING: ' + d);

const kept = baseline.length - missing.length;
console.log(`\nclaudeMdSplitCheck: ${kept}/${baseline.length} directives from ${ref} still present ` +
            `across ${files.length} files, ${missing.length} MISSING`);
/* ⚠️ `statSync().size` IS BYTES AND THIS LINE CALLED THEM CHARACTERS. The budget in
   CLAUDE.md is stated in CHARACTERS — the 2026-08-10 incident that set it was 156,456
   against 150,000 — and this file is dense in emoji and arrows, every one multibyte. The
   two diverged by ~1,100 on 2026-08-26, which is enough to report a file OVER budget that
   is comfortably under it. That error runs in the expensive direction: the documented
   response to being over budget is moving rules out of always-loaded context, so an
   overstated count buys a real deletion to fix an imaginary overflow. Both are printed
   now, because which one is the limit is exactly the thing that was ambiguous. */
const md = fs.readFileSync(path.join(repo, 'CLAUDE.md'), 'utf8');
console.log(`CLAUDE.md is now ${md.length} characters (${Buffer.byteLength(md, 'utf8')} bytes). ` +
            `The 100,000 budget is CHARACTERS — check with \`wc -m\`, not \`wc -c\`.`);

process.exit(missing.length ? 1 : 0);
