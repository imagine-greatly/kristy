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
 *
 * ─── THE THIRD MEMBER: A REFERENCE IS NOT ALWAYS AN IMPORT ────────────────────────────
 * 2026-08-05: this guard reported "nothing this commit carries references an untracked
 * file" while `server/lib/listRefine.test.js` — eighteen tests, the entire proof of a
 * three-bug fix — sat untracked in a guarded directory. It even PRINTED the count and did
 * nothing with it. The blind spot: nothing imports a test file, so an import graph cannot
 * see one. The guard built to catch a missing test could not see a missing test.
 *
 * Three reference kinds are resolvable and now all three count:
 *
 *   1. IMPORTS AND RELATIVE PATH LITERALS. What this always did.
 *   2. BARE FILENAME LITERALS — `join(__dirname, 'tripFixture.json')`. The browser suites
 *      build every fixture this way and `PATH_LITERAL` required a leading `./`, so
 *      `cartFixture.json`, `composedFixture.json`, `tripFixture.json`, `skim-harness.jsx`
 *      and `shot-harness.jsx` were ALL invisible. A fixture the harness reads by name is
 *      referenced exactly as hard as one it imports.
 *   3. TEST-RUNNER DISCOVERY. `npm test` is `node --test`, which finds files by pattern,
 *      not by import. That pattern IS the reference: a file matching it runs on this
 *      machine and cannot run on any other checkout. Resolved the same way as the rest —
 *      the pattern is the runner's own, so this is not name matching either.
 *
 * WHAT STILL CANNOT BE CAUGHT, stated rather than papered over. A doc or report that
 * nothing reads by path — `docs/LIST-CREATION-AUDIT.md` is the live example — has no
 * resolvable reference anywhere in the tree. Whether it belongs in a commit is a judgment
 * about intent, and static analysis cannot make it. Failing on every untracked file would
 * fire on scratch notes and get this guard ignored, which costs more than it saves. So the
 * remainder is NAMED instead of counted: a human can decide in one glance, and a bare
 * count ("1 untracked in guarded dirs") is precisely what let the test file slide.
 *
 * AND IT SAYS NOTHING ABOUT WHETHER A COMMIT LANDED. It runs before one. On the same day
 * this was written, a commit believed to be pushed had not been made at all — HEAD
 * unmoved, both files still untracked. `git log`/`git status` after the fact is the check
 * for that, and it is not this file's job.
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
/* `docs` is here for one reason and it is not tidiness: `scripts/buildDoLines.js` READS
   `docs/do-lines-review.md`, and that file failing to ship is why every curated `do` line
   was missing from production. A doc the runtime or a build script resolves is a dependency
   whatever its extension. A doc nothing resolves is merely named below, never failed on. */
export const GUARDED = ['server/lib', 'server/routes', 'server/scripts', 'client/src', 'client/test', 'mobile/src', 'docs'];

const CODE = /\.(js|jsx|mjs|cjs|ts|tsx|json)$/;
// Docs count as referenceable because the server READS one: `scripts/buildDoLines.js`
// resolves `docs/do-lines-review.md`, and CLAUDE.md records that exact file failing to
// ship as the reason every curated `do` line was missing in production.
const REFERENCEABLE = /\.(js|jsx|mjs|cjs|ts|tsx|json|md)$/;

/* THE SUITE'S OWN FILES, found by pattern rather than by import.
   `npm test` is `node --test`, which walks for `*.test.js` — no import graph involved. The
   `client/test/*.mjs` suites are invoked by name from CLAUDE.md's Verifying section, and
   everything beside them (`browser.mjs`, `buildFixture.mjs`, the harnesses) is what makes
   them run, so the whole directory counts. Untracked here means: runs on this machine,
   cannot run on any other checkout. */
export const isSuiteFile = (f) => /\.test\.(js|mjs|cjs)$/.test(f) || /^client\/test\/[^/]+\.(mjs|jsx)$/.test(f);

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
    .filter((f) => REFERENCEABLE.test(f) && GUARDED.some((d) => f.startsWith(`${d}/`)));
}

/**
 * Untracked files the SUITE would run, which nothing imports and no path literal names.
 * This is the case the guard missed: eighteen tests, discovered by pattern, invisible to
 * an import graph. A reference by discovery is still a reference.
 */
export function undiscoveredSuiteFiles() {
  return untrackedFiles().filter(isSuiteFile);
}

/**
 * Everything else untracked in a guarded directory. NOT a failure — whether an unreferenced
 * doc or scratch module belongs in a commit is a judgment about intent that static analysis
 * cannot make. Returned so the CLI can NAME them, because the bare count is what let a test
 * file slide past a human reading this output.
 */
export function unreferencedUntracked() {
  const dangling = new Set(danglingReferences({ mode: stagedFiles().length ? 'staged' : 'tree' }).map((b) => b.resolved));
  const suite = new Set(undiscoveredSuiteFiles());
  return untrackedFiles().filter((f) => !dangling.has(f) && !suite.has(f));
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
const PATH_LITERAL = /['"](\.\.?\/[^'"]*\.(?:js|jsx|mjs|cjs|ts|tsx|json|md))['"]/g;

/* A BARE FILENAME IS A PATH TOO, and requiring a leading `./` hid every browser fixture.
   `join(__dirname, 'tripFixture.json')` is how all five harnesses reach their fixtures and
   `buildDoLines.js` reaches its markdown; none of them writes `./`. Resolved relative to
   the referencing file's own directory and only reported when it lands on a file git does
   not track, so a bare `'index.js'` in a comment cannot fire unless an untracked
   `index.js` really sits next to it. */
const BARE_LITERAL = /['"]([A-Za-z0-9_][A-Za-z0-9._-]*\.(?:js|jsx|mjs|cjs|ts|tsx|json|md))['"]/g;

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
    if (existsSync(c) || REFERENCEABLE.test(rel)) return rel;
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
    for (const re of [SPECIFIER, PATH_LITERAL, BARE_LITERAL]) {
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
  const suite = undiscoveredSuiteFiles();
  const rest = unreferencedUntracked();

  console.log(`commitGuard: ${mode} mode · ${staged.length} staged · ${untrackedFiles().length} untracked in guarded dirs`);

  if (bad.length) {
    console.error(
      `\n${bad.length} REFERENCE${bad.length > 1 ? 'S' : ''} TO UNTRACKED FILE${bad.length > 1 ? 'S' : ''} — ` +
      `this commit would be green locally and incomplete on main:\n`
    );
    for (const b of bad) console.error(`  ${b.from}\n      references ${b.specifier}  ->  ${b.resolved}  (UNTRACKED)`);
  }

  if (suite.length) {
    console.error(
      `\n${suite.length} SUITE FILE${suite.length > 1 ? 'S' : ''} GIT DOES NOT TRACK — ` +
      `${suite.length > 1 ? 'these run' : 'this runs'} here and nowhere else:\n`
    );
    // Named as a discovery reference, because that is what it is. Nothing imports a test.
    for (const f of suite) console.error(`  ${f}  (found by the runner's own pattern, not by an import)`);
  }

  // NAMED, NEVER COUNTED. A bare count is what this output used to give, and it is what a
  // human reads straight past — which is exactly how eighteen tests stayed untracked.
  if (rest.length) {
    console.log(`\n${rest.length} untracked and unreferenced in a guarded dir. Not a failure; nothing resolves to`);
    console.log('them, so whether they belong in this commit is yours to say:\n');
    for (const f of rest) console.log(`  ${f}`);
  }

  const missing = [...new Set([...bad.map((b) => b.resolved), ...suite])];
  if (!missing.length) {
    console.log('\nnothing this commit carries references an untracked file, and no suite file is missing');
    process.exit(0);
  }
  console.error(`\n  git add ${missing.join(' ')}\n`);
  process.exit(1);
}
