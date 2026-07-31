// What the code WRITES must exist as a column in the migrations.
//
// WHY THIS FILE EXISTS. Three schema misses have now shipped, and all three were found by
// breakage rather than by a check:
//
//   1. counter_gaps / push_tokens — declared but never applied. Caught by a live audit.
//   2. counter_cards — same. Caught by a live audit.
//   3. counter_cards.aliases — NEVER DECLARED AT ALL, and written by the code on every
//      generated card. Caught in production, by noticing the corpus was not growing.
//
// docs/SCHEMA-AUDIT.md compares live against the migration file, so it catches (1) and (2)
// and is structurally blind to (3): a column missing from BOTH sides matches perfectly.
// The only thing that can see it is the code itself, compared against the schema.
//
// So this test asks the other question. Not "does live match the file" but "does the file
// contain everything the code is going to write". It needs no database and runs on every
// commit.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { cardToRow } from './counterCards.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SQL_DIR = join(__dirname, '..', '..', 'supabase');
const LIB_DIR = __dirname;

/* ═══════════════ Parse the migrations ═══════════════ */

// Columns come from BOTH forms: the create-table body and every additive
// `alter table X add column`. aliases arrived as an alter, so missing that form would make
// this test lie in exactly the case it was written for.
function declaredColumns() {
  const tables = new Map();
  const add = (t, c) => {
    if (!tables.has(t)) tables.set(t, new Set());
    tables.get(t).add(c);
  };

  for (const file of readdirSync(SQL_DIR).filter((f) => f.endsWith('.sql'))) {
    const sql = readFileSync(join(SQL_DIR, file), 'utf8').replace(/--[^\n]*/g, ' ');

    const createRe = /create\s+table\s+(?:if\s+not\s+exists\s+)?([a-z_][a-z0-9_]*)\s*\(/gi;
    let m;
    while ((m = createRe.exec(sql))) {
      const name = m[1];
      let depth = 0;
      let end = -1;
      const open = createRe.lastIndex - 1;
      for (let i = open; i < sql.length; i++) {
        if (sql[i] === '(') depth++;
        else if (sql[i] === ')') {
          depth--;
          if (depth === 0) {
            end = i;
            break;
          }
        }
      }
      if (end < 0) continue;
      // Split the body on top-level commas so a check(...) list cannot swallow a column.
      const body = sql.slice(open + 1, end);
      let d = 0;
      let cur = '';
      const parts = [];
      for (const ch of body) {
        if (ch === '(') d++;
        if (ch === ')') d--;
        if (ch === ',' && d === 0) {
          parts.push(cur);
          cur = '';
          continue;
        }
        cur += ch;
      }
      if (cur.trim()) parts.push(cur);
      for (const part of parts) {
        const t = part.trim().replace(/\s+/g, ' ');
        if (!t || /^(primary|unique|foreign|check|constraint|exclude)\b/i.test(t)) continue;
        const cm = t.match(/^([a-z_][a-z0-9_]*)\s+/i);
        if (cm) add(name, cm[1]);
      }
    }

    const alterRe =
      /alter\s+table\s+([a-z_][a-z0-9_]*)\s+add\s+column\s+(?:if\s+not\s+exists\s+)?([a-z_][a-z0-9_]*)\s/gi;
    while ((m = alterRe.exec(sql))) add(m[1], m[2]);
  }
  return tables;
}

const SCHEMA = declaredColumns();

test('the migrations parsed — this suite is not vacuously passing', () => {
  assert.ok(SCHEMA.size >= 10, `expected the tables; got ${[...SCHEMA.keys()].join(', ')}`);
  assert.ok(SCHEMA.get('counter_cards')?.has('slug'), 'counter_cards should have parsed');
  // The alter-table form specifically, since that is how the missing column was fixed.
  assert.ok(SCHEMA.get('counter_cards')?.has('aliases'), 'the alter-table form must be parsed too');
  assert.ok(SCHEMA.get('user_goals')?.has('macro_tracking'), 'later alters must be picked up');
});

/* ═══════════════ The mapper the bug went through ═══════════════ */

test('EVERY key cardToRow emits is a declared column of counter_cards', () => {
  // The check that would have caught `aliases` at commit time. cardToRow is the single
  // place a card becomes a row, so calling it with a fully-populated card enumerates
  // exactly what the upsert will send.
  const fullCard = {
    slug: 'gen_probe',
    section: 'produce',
    topic: 'Probe',
    kind: 'shelf',
    eyebrow: 'Probe',
    headline: 'A headline.',
    do: 'Check the thing.',
    tier: 'established',
    cta_item: null,
    why: 'Because.',
    look_for: ['a'],
    watch_out: ['b'],
    tier_note: 'Why this tier.',
    detail: '',
    kristy_take: '',
    labels_decoded: [],
    sources: [],
    aliases: ['probe'],
    source: 'generated',
    query_seed: 'probe',
    use_count: 0,
  };

  const declared = SCHEMA.get('counter_cards');
  assert.ok(declared, 'counter_cards must be declared somewhere in supabase/');

  const undeclared = Object.keys(cardToRow(fullCard)).filter((k) => !declared.has(k));
  assert.deepEqual(
    undeclared,
    [],
    `cardToRow writes ${undeclared.map((k) => `"${k}"`).join(', ')}, which no migration declares. ` +
      `A write to an undeclared column fails at PostgREST with PGRST204 and — because the ` +
      `persist path must never break a shopper's answer — that failure is caught and logged. ` +
      `So the corpus silently stops growing. Add the column to supabase/, do not drop the field.`
  );
});

/* ═══════════════ Every other literal write in the library ═══════════════ */

// A generic sweep over the inline `.insert({...})` / `.update({...})` object literals. It
// cannot see a mapper call like `upsert(cardToRow(card))` — which is exactly why the test
// above exists separately — but it covers every table whose row is built at the call site.
function literalWrites(source) {
  const out = [];

  // `.from(TABLE)` where TABLE is a module constant — how counterGaps and counterCards
  // both name their table. Missing this made the sweep blind to the two files that write
  // to the shared pool, which are the ones that most need watching.
  const consts = new Map();
  for (const c of source.matchAll(/const\s+([A-Z_][A-Z0-9_]*)\s*=\s*['"`]([a-z_][a-z0-9_]*)['"`]/g)) {
    consts.set(c[1], c[2]);
  }

  const re = /\.from\(\s*(?:['"`]([a-z_][a-z0-9_]*)['"`]|([A-Za-z_$][\w$]*))\s*\)/g;
  let m;
  while ((m = re.exec(source))) {
    const table = m[1] || consts.get(m[2]);
    if (!table) continue;

    // Find the write in THIS chain only. A fixed lookahead window ran past the end of a
    // select statement and attributed the next statement's update to the wrong table —
    // it accused weight_logs of writing user_goals columns. A `;` or a second `.from(`
    // ends the chain.
    const rest = source.slice(re.lastIndex);
    const stop = rest.search(/;|\.from\(/);
    const chain = stop === -1 ? rest : rest.slice(0, stop);
    const w = chain.match(/\.(insert|update|upsert)\(\s*\{/);
    if (!w) continue;

    // Walk the object literal from its opening brace.
    const start = re.lastIndex + chain.indexOf(w[0]) + w[0].length - 1;
    let depth = 0;
    let end = -1;
    for (let i = start; i < source.length; i++) {
      if (source[i] === '{') depth++;
      else if (source[i] === '}') {
        depth--;
        if (depth === 0) {
          end = i;
          break;
        }
      }
    }
    if (end < 0) continue;
    const body = source.slice(start + 1, end);
    // Top-level keys only: `key:` at nesting depth zero.
    const keys = [];
    let d = 0;
    for (const km of body.matchAll(/([{}[\]])|(^|[,{])\s*([a-z_][a-z0-9_]*)\s*:/gim)) {
      if (km[1] === '{' || km[1] === '[') d++;
      else if (km[1] === '}' || km[1] === ']') d--;
      else if (km[3] && d === 0) keys.push(km[3]);
    }
    out.push({ table, keys });
  }
  return out;
}

test('every inline insert/update writes only declared columns', () => {
  const problems = [];
  for (const file of readdirSync(LIB_DIR).filter((f) => f.endsWith('.js') && !f.endsWith('.test.js'))) {
    const src = readFileSync(join(LIB_DIR, file), 'utf8');
    for (const { table, keys } of literalWrites(src)) {
      const declared = SCHEMA.get(table);
      if (!declared) {
        problems.push(`${file}: writes to "${table}", which no migration declares at all`);
        continue;
      }
      for (const k of keys) {
        if (!declared.has(k)) problems.push(`${file}: ${table}.${k} is written but never declared`);
      }
    }
  }
  assert.deepEqual(problems, []);
});

test('the literal sweep is finding real writes, not zero of them', () => {
  // Without this the test above passes brilliantly on a regex that matches nothing.
  const found = readdirSync(LIB_DIR)
    .filter((f) => f.endsWith('.js') && !f.endsWith('.test.js'))
    .flatMap((f) => literalWrites(readFileSync(join(LIB_DIR, f), 'utf8')));

  assert.ok(found.length >= 10, `expected to find the library's inline writes; found ${found.length}`);

  // Named, so a regex that silently stops seeing one of them fails here rather than
  // passing quietly with a smaller haystack.
  for (const table of ['counter_gaps', 'scanned_products', 'shopping_lists', 'user_goals']) {
    assert.ok(found.some((w) => w.table === table), `${table}'s write should be seen`);
  }
  const gap = found.find((w) => w.table === 'counter_gaps');
  assert.ok(gap.keys.includes('question'), 'and its keys should be parsed, not just the table');

  // NOT every write can be read this way, and pretending otherwise would be the bug this
  // file is about. A row built by spread — `upsert({ ...patch })` — has no literal keys to
  // enumerate, and a row built by a mapper (`upsert(cardToRow(card))`) has none either.
  // That is the blind spot `aliases` lived in, and it is why the cardToRow test above
  // exists separately rather than relying on this sweep.
  const opaque = found.filter((w) => w.keys.length === 0);
  assert.ok(opaque.length <= 3, `too many writes the sweep cannot read: ${opaque.map((w) => w.table).join(', ')}`);
});
