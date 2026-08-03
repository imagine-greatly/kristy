/* THE CHECK PASSED BECAUSE IT COULD NOT SEE THE THING — the untracked-file variant.
 *
 *   node scripts/commitGuard.js          (before any commit that claims a feature)
 *
 * TWICE NOW, LOCAL WAS GREEN AND `main` WAS INCOMPLETE, for the same reason: a module was
 * written, imported, tested and committed-around while git had never been told it exists.
 * `git commit -a` does not add untracked files. Neither does `git commit <path>` for a
 * path that was never staged. So the working tree — where every test runs — has the file,
 * and the commit does not.
 *
 * The second and clearest case: `3267c95 The list becomes the trip, and the whole list is
 * free` landed the list matcher and NOT the trips feature. `server/lib/trips.js`,
 * `server/routes/trips.js`, `trips.test.js` and the loop harness stayed untracked for a
 * day under a commit title asserting they had shipped. Nothing caught it, because every
 * check ran against a tree that contained them.
 *
 * This is the same family as the vacuous-assertion rule in CLAUDE.md — `[].every(fn)` is
 * `true`, and a suite that runs against files the commit omits is green for the same kind
 * of reason. In both, the check reports success because the thing it was meant to examine
 * was not in front of it. `nonEmpty` binds at the collection; this binds at the commit.
 *
 * WHAT IT ASSERTS: nothing a commit carries may reference a file git does not track.
 * Import specifiers and path literals are resolved for real — no name matching — so
 * `trips.js` the module is caught and the word "trips" in a comment is not.
 */

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve, relative } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const REPO = resolve(__dirname, '..', '..');

/* The directories where an untracked file means an INCOMPLETE COMMIT rather than a stray
   scratch file. Everything here is either shipped or is the thing that verifies what
   ships; a scratchpad note or a local .env is deliberately out of scope. */
export const GUARDED = ['server/lib', 'server/routes', 'server/scripts', 'client/src', 'client/test', 'mobile/src'];

const CODE = /\.(js|jsx|mjs|cjs|ts|tsx|json)$/;
const posix = (p) => p.split('\\').join('/');

const git = (args) => {
  try {
    return execFileSync('git', args, { cwd: REPO, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  } catch {
    return '';
  }
};

const lines = (s) => s.split('\n').map((l) => l.trim()).filter(Boolean);

/** Files git has never been told about, inside the guarded directories. */
export function untrackedFiles() {
  return lines(git(['ls-files', '--others', '--exclude-standard']))
    .map(posix)
    .filter((f) => CODE.test(f) && GUARDED.some((d) => f.startsWith(`${d}/`)));
}

/** Files this commit would carry. */
export function stagedFiles() {
  return lines(git(['diff', '--cached', '--name-only', '--diff-filter=ACMR'])).map(posix);
}

/* Tracked source files, for the working-tree mode the test uses.

   DELIBERATELY NOT FILTERED BY `GUARDED`. That list says where an untracked file is a
   problem; it must not also decide what gets READ, and conflating the two put the single
   most important file out of scope. `server/index.js` sits in `server/`, matches none of
   the guarded prefixes, and is exactly the file that mounts a route — it imports
   `./routes/trips.js`, and the first draft of this guard did not look at it. deployBoundary
   makes the same distinction for the same reason: it scans `lib/`, `routes/` AND
   `index.js`. Scanning everything tracked is a few hundred files and cannot have this bug. */
export function trackedSources() {
  return lines(git(['ls-files'])).map(posix).filter((f) => CODE.test(f));
}

/* Relative specifiers only. A bare specifier is a package and resolves through node_modules;
   an absolute one cannot name a repo file portably. Path literals are included because the
   server reads JSON and KB files by path — the same shapes deployBoundary.test.js resolves. */
const SPECIFIER = /(?:from|import|require)\s*\(?\s*['"](\.[^'"]+)['"]/g;
const PATH_LITERAL = /['"](\.\.?\/[^'"]*\.(?:js|jsx|mjs|cjs|ts|tsx|json))['"]/g;

/** Resolve a specifier the way node would, returning a repo-relative path or null. */
function resolveSpec(fromFile, spec) {
  const base = resolve(REPO, dirname(fromFile));
  const candidates = [
    resolve(base, spec),
    ...(CODE.test(spec) ? [] : ['.js', '.jsx', '.mjs', '.ts', '.tsx', '/index.js'].map((e) => resolve(base, spec + e))),
  ];
  for (const c of candidates) {
    const rel = posix(relative(REPO, c));
    if (rel.startsWith('..')) continue;
    if (existsSync(c) || CODE.test(rel)) return rel;
  }
  return null;
}

/**
 * Every reference, in `sources`, to a file git does not track.
 *
 * @param {object} [opts]
 * @param {'staged'|'tree'} [opts.mode='staged']
 * @returns {Array<{from:string, specifier:string, resolved:string}>}
 */
export function danglingReferences({ mode = 'staged' } = {}) {
  const untracked = new Set(untrackedFiles());
  if (!untracked.size) return [];

  const sources = (mode === 'staged' ? stagedFiles() : trackedSources()).filter((f) => CODE.test(f));
  const out = [];

  for (const f of sources) {
    // Read what the COMMIT carries, not what the working tree happens to hold — they differ
    // exactly when someone stages a partial change, which is when this matters most.
    let src = '';
    if (mode === 'staged') src = git(['show', `:${f}`]);
    if (!src) {
      const onDisk = join(REPO, f);
      if (!existsSync(onDisk)) continue;
      src = readFileSync(onDisk, 'utf8');
    }

    const seen = new Set();
    for (const re of [SPECIFIER, PATH_LITERAL]) {
      re.lastIndex = 0;
      let m;
      while ((m = re.exec(src))) {
        const spec = m[1];
        if (seen.has(spec)) continue;
        seen.add(spec);
        const resolved = resolveSpec(f, spec);
        if (resolved && untracked.has(resolved)) out.push({ from: f, specifier: spec, resolved });
      }
    }
  }
  return out;
}

/* ── CLI ── */
if (process.argv[1] && posix(process.argv[1]).endsWith('scripts/commitGuard.js')) {
  const staged = stagedFiles();
  const mode = staged.length ? 'staged' : 'tree';
  const bad = danglingReferences({ mode });

  console.log(`commitGuard: ${mode} mode · ${staged.length} staged · ${untrackedFiles().length} untracked in guarded dirs`);

  if (!bad.length) {
    console.log('nothing this commit carries references an untracked file');
    process.exit(0);
  }

  console.error(
    `\n${bad.length} REFERENCE${bad.length > 1 ? 'S' : ''} TO UNTRACKED FILE${bad.length > 1 ? 'S' : ''} — ` +
    `this commit would be green locally and incomplete on main:\n`
  );
  for (const b of bad) console.error(`  ${b.from}\n      imports ${b.specifier}  ->  ${b.resolved}  (UNTRACKED)`);
  console.error(`\n  git add ${[...new Set(bad.map((b) => b.resolved))].join(' ')}\n`);
  process.exit(1);
}
