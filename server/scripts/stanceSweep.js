// Stance sweep (.pipeline/plans/clean-pick-final-sweep.md P1). REPORT ONLY: reads the KB, never writes it.
// Usage (from server/): node scripts/stanceSweep.js [--ref <sha>] [--json] [--md]
//   --ref  read server/kristy_perimeter_kb.json, lib/doLines.json and the register/coverage docs via `git show <ref>:...`
//          (the docs/sources/ url archive is always read from the working tree).
//   --json machine output; --md the flag table. Default: one line per code.
// Frozen = ids whose only flags are M8 (or none). Regexes are the parent plan's (docs/CLEAN-PICK-PLAN.md), verbatim.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { projectEntry } from '../lib/counterCards.js';
import { lintCard, lintCorpus, CANONICAL_GLOSSES } from '../lib/counterCardLint.js';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));

// M1: C19 regex + R8 extras.
const C19 = /(within (legal |safe )?limits|\btolerance|safe levels?|conventional is fine|buy conventional|eat more|heart[- ]healthy|debated|contested|credible concern at most)/i;
const R8 = /(well below|generally within|fine there|organic or not|Dietary Guidelines|saturated fat)/i;
// M2: C20.
const C20_OIL = /\b(avocado|canola|soybean|sunflower|safflower|corn|cottonseed|grapeseed|rice bran|vegetable|seed) oils?\b/i;
const C20_NEG = /\b(skip|avoid|instead of|never|not|no)\b/i;
// M3: C17.
const ASK = /\bask\b/i;
// Exemptions (P1b, .pipeline/plans/clean-pick-final-sweep.md): X1-X3 on M3, X10 on M2, X5 on M13.
const ASK_OK = [
  /\bask a doctor\b/i, // X1: no-treatment rule 3 requires it
  /\bask (the )?(baker|monger|cheesemonger)\b|\bask whether the processor\b|\bask who made it\b/i, // X2: a named person (raw_aged_cheese card_why is borderline)
  /\bask to see\b|\bask for planning\b/i, // X3: a document or plan, not staff advice
];
const HUB_ASK = /\bask (about|three questions)\b/i; // X3: hub short_answer pointer
const OIL_WARNING = /\b(are|is) (cooked|fried|made|packed|roasted) in\b/i; // X10: a warning, not a recommendation
const G7 = CANONICAL_GLOSSES.find((g) => g.id === 'G7').gloss; // X5: the seed-oil gloss string only
const ASK_PLACE = /(counter|butcher|fishmonger|deli|bakery|market|farm stand|grower)/i;
// M4: C4 + C4b.
const BANNED = /\b(health|healthy|healthier|safer|risk|cancer|disease|toxic|toxin|detox|pesticide-free|synthetic|price|cost|cheap|expensive|poison|chemicals?|spray-free)\b/i;
// M5: copy of counterCardLint.js FIRST_RUNG_SPLIT (not exported there; lint is out of scope).
const FIRST_RUNG_SPLIT = /\s+first\b|,\s*then\b|;\s*then\b|\bnever\b/i;
const ORGANIC = /\borganic\b/i;
// M10: C14 allowlist [PLACEHOLDER list in the parent plan].
const BRAND_ALLOW = new Set('USDA Organic Certified Naturally Grown PFAS Real Project Regenerative Glyphosate Residue Free American Grassfed Association'.split(' '));
// M11, M12.
const HANDLING_ADJ = new Set(['firm', 'fresh', 'ripe', 'crisp', 'heavy', 'bright', 'plump', 'cold']);
const FEED_LEAD = /^(soy|corn)\b[\w\s,-]*free/i;

// The shopper's own words, not Kristy's copy.
const SHOPPER_FIELDS = new Set(['aliases', 'asked_as', 'question']);
const sentencesOf = (s) => String(s).split(/(?<=[.!?;])\s+/).filter(Boolean);
const norm = (s) => String(s).replace(/[‘’]/g, "'").replace(/[“”]/g, '"');

// Every string in an entry with its field path; `skip` names top-level fields to leave out.
function strings(entry, skip = new Set()) {
  const out = [];
  const walk = (v, path) => {
    if (typeof v === 'string') out.push([path, v]);
    else if (Array.isArray(v)) v.forEach((x, i) => walk(x, `${path}[${i}]`));
    else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) walk(x, path ? `${path}.${k}` : k);
  };
  for (const [k, v] of Object.entries(entry)) if (k !== 'id' && !skip.has(k)) walk(v, k);
  return out;
}

const topLines = (e) => {
  const out = [['decision', e.decision], ['avoid', e.avoid]];
  if (e.kind !== 'pick') {
    out.push(['cart_pick', e.cart_pick], ['why', e.why]);
    (e.buying_tips || []).slice(0, 2).forEach((t, i) => out.push([`buying_tips[${i}]`, t]));
  }
  return out.filter(([, v]) => typeof v === 'string' && v.trim());
};

const URL_RE = /https?:\/\/[^\s"'<>)\]]+/g;
export const normUrl = (u) => String(u).trim().replace(/[.,;:]+$/, '').replace(/\/+$/, '').replace(/^http:/, 'https:');
const sourceUrls = (e) => strings({ sources: e.sources || [] }).flatMap(([, s]) => s.match(URL_RE) || []).map(normUrl);

/** Parse CONCERN-REGISTER.md (label terms) + CONCERN-COVERAGE.md (home cards) into [{concern, terms, home}]. */
export function parseRegister(registerMd, coverageMd) {
  const terms = new Map();
  for (const line of registerMd.split('\n')) {
    const m = line.match(/^\|\s*`([a-z0-9_]+)`\s*\|([^|]*)\|([^|]*)\|/);
    if (!m) continue;
    // ponytail: lexical; "a/b" keeps the part before the slash, "(s)" is dropped, terms under 3 chars skipped.
    const t = m[3].split(',').map((x) => norm(x).replace(/"/g, '').split('/')[0].replace(/\(s\)/g, '').trim().toLowerCase())
      .filter((x) => x.length >= 3);
    terms.set(m[1], t);
  }
  const rows = [];
  for (const line of coverageMd.split('\n')) {
    const cols = line.split('|').map((c) => c.trim());
    const m = cols[1]?.match(/^`([a-z0-9_]+)`$/);
    if (!m || !/^(COVERED|PARTIAL|MISSING)/.test(cols[2] || '')) continue;
    const ids = (c) => (c || '').split(',').map((x) => x.trim()).filter((x) => /^[a-z0-9_]+$/.test(x));
    rows.push({ concern: m[1], terms: terms.get(m[1]) || [], home: [...ids(cols[3]), ...ids(cols[4])] });
  }
  return rows;
}

/** Every `url:` line under a docs/sources tree, normalized. */
export function archiveUrls(dir) {
  const out = new Set();
  const walk = (d) => {
    for (const f of readdirSync(d)) {
      const p = join(d, f);
      if (statSync(p).isDirectory()) walk(p);
      else for (const line of readFileSync(p, 'utf8').split('\n')) {
        const m = line.match(/url:\**\s*<?(https?:\/\/[^\s>]+)/i);
        if (m) out.add(normUrl(m[1]));
      }
    }
  };
  walk(dir);
  return out;
}

const defaultLint = (entries, doLines) => {
  const out = new Map();
  const add = (id, v) => { if (!out.has(id)) out.set(id, []); out.get(id).push(v.code); };
  const projected = [];
  for (const e of entries) {
    if (e.kind === 'pick') { for (const v of lintCard(e) || []) add(e.id, v); continue; }
    const card = projectEntry(e, { doLine: doLines[e.id] });
    projected.push(card);
    for (const v of lintCard(card) || []) add(e.id, v);
  }
  const ids = new Set(entries.map((e) => e.id));
  for (const v of lintCorpus(projected).violations) {
    const hit = v.ids || [...ids].filter((id) => new RegExp(`\\b${id}\\b`).test(v.detail || ''));
    for (const id of hit.length ? hit : ['_corpus']) add(id, v);
  }
  return out;
};

/**
 * Run M1–M13 over entries. Returns { flags: {id: [{code, detail}]}, byCode: {code: [ids]}, frozen, flagged }.
 * opts: { doLines, register: [{concern, terms, home}], archive: Set<url>, lint?: (entries, doLines) => Map<id, codes[]> }
 */
export function sweep(entries, { doLines = {}, register = [], archive = new Set(), lint = defaultLint } = {}) {
  const flags = Object.fromEntries(entries.map((e) => [e.id, []]));
  const flag = (id, code, detail) => (flags[id] ||= []).push({ code, detail });
  const report = {}; // X4: M10 is listed, never a flag
  const counts = new Map(); // M13
  for (const e of entries) {
    const copy = strings(e, SHOPPER_FIELDS);
    for (const [f, s] of copy) {
      if (C19.test(s) || R8.test(s)) flag(e.id, 'M1', `${f}: ${(s.match(C19) || s.match(R8))[0]}`);
      if (f.startsWith('sources')) continue;
      for (const sen of sentencesOf(s)) {
        if (C20_OIL.test(sen) && !C20_NEG.test(sen) && !OIL_WARNING.test(sen)) flag(e.id, 'M2', `${f}: ${sen.match(C20_OIL)[0]}`);
        if (ASK.test(sen) && !ASK_PLACE.test(sen) && !ASK_OK.some((x) => x.test(sen)) && !(f === 'short_answer' && HUB_ASK.test(sen))) flag(e.id, 'M3', `${f}: ${sen.slice(0, 80)}`);
      }
    }
    for (const [f, s] of topLines(e)) {
      const b = s.match(BANNED);
      if (b) flag(e.id, 'M4', `${f}: ${b[0]}`);
      for (const sen of sentencesOf(norm(s))) {
        const toks = sen.match(/[A-Za-z][\w-]*/g) || [];
        const brand = toks.slice(1).filter((t) => /^[A-Z]/.test(t) && !BRAND_ALLOW.has(t));
        if (brand.length) (report[e.id] ||= []).push({ code: 'M10', detail: `${f}: ${brand.join(' ')}` }); // X4: report-only
      }
    }
    const decision = String(e.decision ?? '');
    // X6: organic as the fallback ("..., else organic") or on a label_* card is not a first rung.
    const rung0 = decision.replace(/,?\s*else organic\b/gi, '');
    if (!e.id.startsWith('label_') && (/^organic/i.test(rung0) || ORGANIC.test(rung0.split(FIRST_RUNG_SPLIT)[0]))) flag(e.id, 'M5', decision);
    if (ORGANIC.test(String(e.cart_pick ?? ''))) flag(e.id, 'M6', e.cart_pick);
    const first = (decision.toLowerCase().match(/[a-z][\w-]*/g) || []).find((w) => !['a', 'an', 'the'].includes(w));
    if (HANDLING_ADJ.has(first) && !new RegExp(`\\b${first}\\b`, 'i').test(String(e.title ?? ''))) flag(e.id, 'M11', first);
    if (e.id === 'egg_labels' && !FEED_LEAD.test(decision)) flag(e.id, 'M12', decision);
    for (const u of new Set(sourceUrls(e))) if (!archive.has(u)) flag(e.id, 'M8', u);
    const mine = new Set([decision, e.cart_pick, ...(e.buying_tips || [])].filter((s) => typeof s === 'string' && s.trim()));
    for (const s of mine) counts.set(s, [...(counts.get(s) || []), e.id]);
  }
  for (const [s, ids] of counts) if (ids.length > 2 && !s.includes(G7)) for (const id of ids) flag(id, 'M13', `${ids.length}x: ${s.slice(0, 60)}`);
  const text = new Map(entries.map((e) => [e.id, norm(strings(e, new Set(['sources'])).map(([, s]) => s).join('\n')).toLowerCase()]));
  for (const row of register) for (const id of row.home) {
    if (row.concern !== 'clean_fifteen' && text.has(id) && row.terms.length && !row.terms.some((t) => text.get(id).includes(t))) flag(id, 'M7', row.concern);
  }
  for (const [id, codes] of lint(entries, doLines)) for (const c of codes) flag(id, 'M9', c);

  const byCode = {};
  for (const [id, fs] of Object.entries(flags)) for (const c of new Set(fs.map((x) => x.code))) (byCode[c] ||= []).push(id);
  const frozen = Object.keys(flags).filter((id) => flags[id].every((x) => x.code === 'M8'));
  const flagged = Object.keys(flags).filter((id) => !frozen.includes(id));
  return { flags, report, byCode, frozen, flagged };
}

export function load(ref) {
  const read = (p) => (ref
    ? execFileSync('git', ['show', `${ref}:${p}`], { cwd: ROOT, maxBuffer: 64 << 20 }).toString()
    : readFileSync(join(ROOT, p), 'utf8'));
  const kb = JSON.parse(read('server/kristy_perimeter_kb.json'));
  return {
    kb,
    doLines: JSON.parse(read('server/lib/doLines.json')),
    register: parseRegister(read('docs/CONCERN-REGISTER.md'), read('docs/CONCERN-COVERAGE.md')),
    archive: archiveUrls(join(ROOT, 'docs/sources')),
  };
}

export function run(ref) {
  const { kb, doLines, register, archive } = load(ref);
  const entries = kb.entries;
  const picks = entries.filter((e) => e.kind === 'pick').length;
  const r = sweep(entries, { doLines, register, archive });
  const codes = Object.keys(r.byCode).sort((a, b) => Number(a.slice(1)) - Number(b.slice(1)));
  return { ref: ref || 'working', entries: entries.length, cards: entries.length - picks, picks,
    counts: Object.fromEntries(codes.map((c) => [c, r.byCode[c].length])), ...r };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const args = process.argv.slice(2);
  const i = args.indexOf('--ref');
  const out = run(i >= 0 ? args[i + 1] : null);
  if (args.includes('--json')) console.log(JSON.stringify(out, null, 2));
  else if (args.includes('--md')) {
    console.log(`# Stance sweep flags @ ${out.ref}\n\n${out.entries} entries = ${out.cards} cards + ${out.picks} picks. ` +
      `Frozen ${out.frozen.length}, flagged (non-M8) ${out.flagged.length}.\n\n| code | count | ids |\n|---|---|---|`);
    for (const [c, n] of Object.entries(out.counts)) console.log(`| ${c} | ${n} | ${out.byCode[c].join(', ')} |`);
  } else {
    for (const [c, n] of Object.entries(out.counts)) console.log(`${c} ${n}`);
    console.log(`${out.entries} entries, frozen ${out.frozen.length}, flagged ${out.flagged.length}`);
  }
}
