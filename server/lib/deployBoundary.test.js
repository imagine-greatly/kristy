// THE DEPLOY BOUNDARY IS `server/`, AND THIS TEST IS THE FENCE.
//
// Railway's Root Directory is `server/`, so nothing outside it exists in production.
// That is not a deployment detail — it is a correctness constraint on every path the
// server resolves, and it is invisible in local development because a checkout has the
// whole repo. Code that reads `../../docs/…` works on a laptop and reads nothing on the
// box, forever, with no error.
//
// It shipped exactly that way: both counterCards.js and counterAskPipeline.js loaded the
// reviewed `do` lines from docs/, each wrapped in a try/catch that returned an empty Map,
// so every curated card served by /api/counter/ask carried an empty do line in production
// for as long as those lines have existed. Two reviews and a full lint suite went past it,
// because everything is fine when you run it locally.
//
// So this is a TEST rather than a habit. It resolves the path literals in the runtime
// source and fails on any that escape the boundary.
//
// SCRIPTS ARE EXEMPT AND THAT IS DELIBERATE. scripts/*.js are development tools run from
// a full checkout by a person: the migration reads docs/, the livetests read client/src.
// They are not on the deploy path and constraining them would only push their inputs into
// server/ for no gain. The exemption is narrow, listed, and checked below — a runtime file
// can never be quietly added to it.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve, relative, sep } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SERVER = resolve(__dirname, '..');

/** Every .js file the server actually runs: lib/, routes/, and index.js. */
function runtimeFiles() {
  const out = [];
  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      const full = join(dir, name);
      if (statSync(full).isDirectory()) {
        if (name === 'node_modules' || name === 'scratch') continue;
        walk(full);
        continue;
      }
      if (!name.endsWith('.js')) continue;
      // A test is not shipped and legitimately reads the repo it is testing.
      if (name.endsWith('.test.js')) continue;
      out.push(full);
    }
  };
  walk(join(SERVER, 'lib'));
  walk(join(SERVER, 'routes'));
  out.push(join(SERVER, 'index.js'));
  return out;
}

/**
 * The relative paths a file resolves against its own location. Covers the three shapes
 * this codebase uses: an ESM import specifier, `new URL(rel, import.meta.url)`, and
 * `join(__dirname, 'a', 'b')`.
 */
function resolvedPaths(src, file) {
  const here = dirname(file);
  const out = [];

  for (const m of src.matchAll(/(?:^|\s)(?:import|from)\s+['"](\.[^'"]+)['"]/gm)) {
    out.push({ literal: m[1], abs: resolve(here, m[1]) });
  }
  for (const m of src.matchAll(/new URL\(\s*['"](\.[^'"]+)['"]/g)) {
    out.push({ literal: m[1], abs: resolve(here, m[1]) });
  }
  for (const m of src.matchAll(/join\(\s*__dirname\s*,\s*([^)]+)\)/g)) {
    const parts = [...m[1].matchAll(/['"]([^'"]+)['"]/g)].map((x) => x[1]);
    if (parts.length) out.push({ literal: `join(__dirname, ${parts.join(', ')})`, abs: resolve(here, ...parts) });
  }
  return out;
}

const inside = (abs) => {
  const rel = relative(SERVER, abs);
  return rel && !rel.startsWith('..') && !rel.startsWith(`..${sep}`);
};

test('nothing the server runs reads a path outside server/', () => {
  const escapes = [];
  for (const file of runtimeFiles()) {
    const src = readFileSync(file, 'utf8');
    for (const { literal, abs } of resolvedPaths(src, file)) {
      // Bare package specifiers never start with "." and are not collected at all.
      if (inside(abs)) continue;
      escapes.push(`${relative(SERVER, file)} → ${literal}`);
    }
  }
  assert.deepEqual(
    escapes,
    [],
    `these resolve outside the deploy boundary and will be missing in production:\n  ${escapes.join('\n  ')}`
  );
});

test('the script exemption is a listed set, not a shape', () => {
  // Scripts may reach outside; that is the exemption. What must stay true is that the
  // exemption covers SCRIPTS ONLY — the test above walks lib/, routes/ and index.js by
  // name, so a new runtime directory would silently escape the fence. Assert the layout
  // this depends on.
  const dirs = readdirSync(SERVER).filter((n) => {
    if (n.startsWith('.') || n === 'node_modules' || n === 'scratch') return false;
    return statSync(join(SERVER, n)).isDirectory();
  });
  assert.deepEqual(
    dirs.sort(),
    ['lib', 'routes', 'scripts'],
    'a new top-level directory in server/ is not covered by the boundary test above — add it to runtimeFiles()'
  );
});
