#!/usr/bin/env node
// Generate docs/api-shapes.generated.md — the response shape of every route, read out of the
// handlers rather than written down beside them.
//
//   node scripts/buildApiShapes.js            write the file
//   node scripts/buildApiShapes.js --check    exit 1 if the committed file is stale
//
// WHY GENERATED. `SWIFT-SPEC.md` §A listed endpoint paths and methods and no shapes, which is
// the biggest gap for anyone starting the Swift client cold. Hand-writing ~40 Codable structs
// against a server that changes weekly produces a document that is wrong within a fortnight —
// the same defect as a comment asserting an invariant, at document scale. So it is derived, and
// `apiShapes.test.js` fails when the committed file and the source disagree. Same arrangement
// as docs/do-lines-review.md → lib/doLines.json, for the same reason.
//
// WHAT IT CAN AND CANNOT SEE, because an honest gap beats a confident fabrication.
// It reads `res.json(...)` call sites in each route file and reports the top-level keys of
// OBJECT LITERALS. It can type a literal (`premium: true` → Bool). It cannot follow an
// identifier or a call — `res.json(subscriptionSummary(row))` is a shape defined somewhere
// else, and `{ ...publicEntry(entry), education }` is a spread it cannot expand. Those are
// listed under NEEDS HAND-CHECK with the expression that defeated it, so a reader knows
// exactly which shapes to confirm by hand instead of trusting all of them equally.
//
// It also does not attempt REQUEST bodies. Those are read out of `req.body?.x` accesses
// scattered through a handler and are far less reliably derivable; §A calls that out.

import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROUTES = join(__dirname, '..', 'routes');
const REPO = join(__dirname, '..', '..');
const OUT = join(REPO, 'docs', 'api-shapes.generated.md');

/* ── Mount prefixes, read from index.js so a remount cannot silently move a path ── */
function mountPrefixes() {
  const src = readFileSync(join(__dirname, '..', 'index.js'), 'utf8');
  const map = new Map(); // routerIdentifier -> mount path
  for (const m of src.matchAll(/app\.use\(\s*'([^']+)'\s*,\s*(?:[a-zA-Z0-9_.]+\([^)]*\)\s*,\s*)?([A-Za-z0-9_]+)\s*\)/g)) {
    const [, mountPath, ident] = m;
    if (!map.has(ident)) map.set(ident, mountPath);
  }
  // identifier -> the file it was imported from
  const files = new Map();
  for (const m of src.matchAll(/import\s+(?:\{([^}]+)\}|([A-Za-z0-9_]+))\s+from\s+'\.\/routes\/([A-Za-z0-9_]+)\.js'/g)) {
    const named = m[1];
    const def = m[2];
    const file = `${m[3]}.js`;
    if (def) files.set(def.trim(), file);
    if (named) {
      for (const part of named.split(',')) {
        const id = part.split(/\s+as\s+/).pop().trim();
        if (id) files.set(id, file);
      }
    }
  }
  const byFile = new Map();
  for (const [ident, mount] of map) {
    const file = files.get(ident);
    if (!file) continue;
    if (!byFile.has(file)) byFile.set(file, new Set());
    byFile.get(file).add(mount);
  }
  return byFile;
}

/* ── One handler: its method, path, auth middleware, and every res.json argument ── */
const ROUTE_RE = /([A-Za-z0-9_]*[Rr]outer)\.(get|post|put|patch|delete)\(\s*'([^']+)'\s*(,[^)]*?)?,?\s*(?:async\s*)?\(/g;

/** Balanced-paren slice starting at the '(' of a call. Null if unbalanced. */
function callArgs(src, openIdx) {
  let depth = 0;
  for (let i = openIdx; i < src.length; i++) {
    const c = src[i];
    if (c === '(') depth++;
    else if (c === ')') {
      depth--;
      if (depth === 0) return src.slice(openIdx + 1, i);
    }
  }
  return null;
}

/* Split an object-literal body into its TOP-LEVEL entries, then read each one.
   The first draft advanced only past the KEY, so a value was re-scanned as the next entry and
   `{ ok: true }` came out as `ok: Bool, true: ???`. Splitting on depth-0 commas first makes
   that impossible — an entry is consumed whole or not at all. */
function splitEntries(body) {
  const out = [];
  let depth = 0;
  let start = 0;
  let quote = null;
  for (let i = 0; i < body.length; i++) {
    const c = body[i];
    if (quote) {
      if (c === quote && body[i - 1] !== '\\') quote = null;
      continue;
    }
    if (c === "'" || c === '"' || c === '`') { quote = c; continue; }
    if (c === '{' || c === '[' || c === '(') depth++;
    else if (c === '}' || c === ']' || c === ')') depth--;
    else if (c === ',' && depth === 0) {
      out.push(body.slice(start, i));
      start = i + 1;
    }
  }
  out.push(body.slice(start));
  return out.map((s) => s.trim()).filter(Boolean);
}

/** Top-level keys of an object literal body, ignoring nesting. */
function topLevelKeys(body) {
  const keys = [];
  let pendingSpread = null;
  for (const entry of splitEntries(body)) {
    if (entry.startsWith('...')) {
      const m = entry.match(/^\.\.\.\s*([A-Za-z0-9_.]+(?:\([^)]*\))?)/);
      pendingSpread = m ? m[1] : '…';
      continue;
    }
    const kv = entry.match(/^(?:\[[^\]]*\]|([A-Za-z_$][A-Za-z0-9_$]*)|'([^']+)'|"([^"]+)")\s*:([\s\S]*)$/);
    if (kv) {
      const name = kv[1] || kv[2] || kv[3];
      if (!name) continue; // a computed key — not statically nameable
      keys.push({ name, type: inferType(kv[4]) });
      continue;
    }
    // shorthand `{ list, summary }` — a bare identifier, no colon at top level
    const short = entry.match(/^([A-Za-z_$][A-Za-z0-9_$]*)$/);
    if (short) keys.push({ name: short[1], type: '?' });
  }
  return { keys, spread: pendingSpread };
}

function inferType(after) {
  const v = after.trimStart();
  if (/^(true|false)\b/.test(v)) return 'Bool';
  if (/^!{1,2}/.test(v)) return 'Bool';
  if (/^-?\d/.test(v)) return 'Number';
  if (/^['"`]/.test(v)) return 'String';
  if (/^\[/.test(v)) return 'Array';
  if (/^\{/.test(v)) return 'Object';
  if (/^null\b/.test(v)) return 'null';
  return '?';
}

function scanFile(file) {
  const src = readFileSync(join(ROUTES, file), 'utf8');
  const out = [];
  const matches = [...src.matchAll(ROUTE_RE)];
  for (let i = 0; i < matches.length; i++) {
    const m = matches[i];
    const [, , method, path, middleware = ''] = m;
    // ⚠️ EVERYTHING FROM THIS HANDLER TO THE NEXT ROUTE DEFINITION — TAKEN FROM THE MATCH
    // LIST, NOT BY SEARCHING FOR A SUBSTRING OF THE ROUTER'S OWN NAME.
    //
    // This read `src.indexOf('outer.', start + 10)`: find the tail of "Router.", skipping
    // the current declaration by a hardcoded ten characters. **Ten is the length of no
    // identifier in this codebase**, and where "outer." begins at index >= 10 in the router's
    // OWN name, the search finds the declaration it was supposed to skip. `next` then lands
    // ~10 bytes past `start` and the handler body is sliced to nothing — so the route is
    // reported as having no responses, and that absence was published as a SERVER FACT in
    // docs/api-shapes.generated.md.
    //
    // Measured 2026-08-09: it silently emptied FOUR routers — `guestScanRouter` (10),
    // `guestVerdictRouter` (13), `ingredientRouter` (11) and `perimeterRouter` (10) — nine
    // handlers, and every one of them public or guest, i.e. the whole surface a real visitor
    // reaches. `counterRouter` (8), `scanRouter` (5), `verdictRouter` (8) and
    // `internalRouter` (9) happened to sit under the threshold, which is why the file looked
    // plausible. Finding B, kristy-ios/docs/API-FINDINGS.md §2.
    //
    // The match list already knows where the next route starts. Asking it cannot drift with
    // an identifier's length, and there is no number to get wrong.
    const start = m.index;
    const next = i + 1 < matches.length ? matches[i + 1].index : src.length;
    const body = src.slice(start, next);

    const responses = [];
    for (const r of body.matchAll(/res\s*\.\s*(?:status\(\s*(\d{3})\s*\)\s*\.\s*)?json\s*\(/g)) {
      const args = callArgs(body, r.index + r[0].length - 1);
      if (args == null) continue;
      const trimmed = args.trim();
      const status = r[1] ? Number(r[1]) : 200;
      if (trimmed.startsWith('{')) {
        const inner = trimmed.slice(1, trimmed.lastIndexOf('}'));
        const { keys, spread } = topLevelKeys(inner);
        responses.push({ status, kind: 'literal', keys, spread });
      } else {
        responses.push({ status, kind: 'opaque', expr: trimmed.slice(0, 80) });
      }
    }
    out.push({
      file,
      method: method.toUpperCase(),
      path,
      auth: /requireAuth/.test(middleware) ? 'requireAuth' : /optionalAuth/.test(middleware) ? 'optionalAuth' : 'public',
      responses,
    });
  }
  return out;
}

const byFile = mountPrefixes();
const files = readdirSync(ROUTES).filter((f) => f.endsWith('.js')).sort();
const routes = files.flatMap(scanFile);

/* ── Emit ── */
const swiftType = (t) =>
  ({ Bool: 'Bool', Number: 'Double', String: 'String', Array: '[…]', Object: '…', null: 'String?', '?': '???' }[t] || '???');

const lines = [];
lines.push('# API response shapes — GENERATED, DO NOT EDIT');
lines.push('');
lines.push('`node server/scripts/buildApiShapes.js` writes this file; `apiShapes.test.js` fails if it is');
lines.push('stale. Edit the handler, re-run, commit both. Consumed by `SWIFT-SPEC.md` §A.');
lines.push('');
lines.push('**Read the caveat before trusting a shape.** This is derived from `res.json(...)` object');
lines.push('literals. A response built by a helper (`res.json(summary(row))`) or carrying a spread');
lines.push('(`{ ...publicEntry(e) }`) cannot be expanded statically and is listed under **NEEDS');
lines.push('HAND-CHECK** with the expression that defeated it. `???` means the key exists and its type');
lines.push('came from an identifier, not a literal. Request bodies are NOT derived at all.');
lines.push('');

const needsHand = [];
let literalCount = 0;

for (const file of files) {
  const rs = routes.filter((r) => r.file === file);
  if (!rs.length) continue;
  const mounts = [...(byFile.get(file) || ['(unmounted)'])].sort();
  lines.push(`## ${file}`);
  lines.push('');
  lines.push(`Mounted at: ${mounts.map((m) => `\`${m}\``).join(', ')}`);
  lines.push('');
  for (const r of rs) {
    lines.push(`### ${r.method} ${r.path}  ·  ${r.auth}`);
    lines.push('');
    if (!r.responses.length) {
      lines.push('- no `res.json` found (streams, redirects, or `res.send`) — **NEEDS HAND-CHECK**');
      needsHand.push({ ...r, why: 'no res.json' });
      lines.push('');
      continue;
    }
    for (const resp of r.responses) {
      if (resp.kind === 'opaque') {
        lines.push(`- \`${resp.status}\` → \`${resp.expr}\` — **NEEDS HAND-CHECK** (built elsewhere)`);
        needsHand.push({ ...r, why: `opaque: ${resp.expr}` });
        continue;
      }
      literalCount++;
      const fields = resp.keys.map((k) => `${k.name}: ${swiftType(k.type)}`).join(', ');
      lines.push(`- \`${resp.status}\` → { ${fields || '—'} }`);
      if (resp.spread) {
        lines.push(`  - plus a spread of \`${resp.spread}\` — **NEEDS HAND-CHECK**`);
        needsHand.push({ ...r, why: `spread: ${resp.spread}` });
      }
    }
    lines.push('');
  }
}

lines.push('---');
lines.push('');
lines.push('## NEEDS HAND-CHECK');
lines.push('');
lines.push(`${needsHand.length} of ${routes.length} handlers have at least one response this script cannot`);
lines.push('expand. Confirm these by hand before writing a Codable for them.');
lines.push('');
for (const h of needsHand) lines.push(`- \`${h.method} ${h.path}\` (${h.file}) — ${h.why}`);
lines.push('');
lines.push(`_${routes.length} handlers, ${literalCount} literal responses derived._`);

const text = lines.join('\n') + '\n';

if (process.argv.includes('--check')) {
  let current = '';
  try {
    current = readFileSync(OUT, 'utf8');
  } catch {
    console.error(`[api-shapes] ${relative(REPO, OUT)} is missing. Run: node server/scripts/buildApiShapes.js`);
    process.exit(1);
  }
  if (current !== text) {
    console.error(`[api-shapes] ${relative(REPO, OUT)} is STALE. Run: node server/scripts/buildApiShapes.js`);
    process.exit(1);
  }
  console.log(`[api-shapes] up to date — ${routes.length} handlers, ${needsHand.length} need hand-checking`);
  process.exit(0);
}

if (!routes.length) {
  console.error('[api-shapes] no routes parsed — refusing to write an empty file.');
  process.exit(1);
}
writeFileSync(OUT, text, 'utf8');
console.log(`[api-shapes] wrote ${relative(REPO, OUT)} — ${routes.length} handlers, ${needsHand.length} need hand-checking`);
