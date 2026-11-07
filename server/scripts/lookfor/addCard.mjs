// add_card rows for apply.mjs (contract: ADD-CARD.md). Pure: apply.mjs and lookforScope.test.js both call it.
//   {op:'add_card', entry:{...item card, no kind}, fetched:[{url, fetched:true, archive?, quote?}], promotes?:'pick_x'}
// The do line is read from lib/doLines.json (author it in docs/do-lines-review.md + buildDoLines.js first).
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { projectEntry } from '../../lib/counterCards.js';
import { lintCard, lintPickSteps, lintLookforScope, lintTierNoteVsLookFor, words, MAX_ALIAS_WORDS } from '../../lib/counterCardLint.js';

const REQUIRED = ['id', 'title', 'aliases', 'category', 'question', 'decision', 'why', 'short_answer', 'detail',
  'evidence_tier', 'sources', 'kristy_take', 'buying_tips', 'pick_steps', 'science', 'labels_decoded', 'tier_note', 'asked_as'];
const OPTIONAL = ['instead', 'cart_pick', 'watch_out', 'family', 'delta', 'eyebrow_short', 'card_why', 'deck'];
const ALLOWED = new Set([...REQUIRED, ...OPTIONAL]);
const norm = (s) => String(s ?? '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim(); // = perimeter.js norm
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// -> { status: 'add' | 'already', errors: [string] }. Never mutates.
export function checkAddCard(row, entries, { doLines, archiveDir, evidenceTiers }) {
  const e = row?.entry;
  const errors = [];
  const err = (s) => errors.push(s);
  if (!e || typeof e !== 'object') return { status: 'add', errors: ['add_card row has no entry'] };
  const existing = entries.find((x) => x.id === e.id);
  const pick = row.promotes ? entries.find((x) => x.id === row.promotes) : null;
  // Idempotent: the card is on the KB exactly as authored and the promoted pick is gone.
  if (existing && same(existing, e) && !pick) return { status: 'already', errors };
  if (existing) return { status: 'add', errors: [`duplicate id ${e.id} (already a ${existing.kind ?? 'card'} entry)`] };

  if (typeof e.id !== 'string' || !/^[a-z0-9_]+$/.test(e.id) || e.id.startsWith('pick_')) err(`id "${e.id}" must be snake_case and not pick_*`);
  if ('kind' in e) err('an item card carries no kind');
  for (const k of Object.keys(e)) if (!ALLOWED.has(k)) err(`unknown field ${k} (schemaContract: only fields existing cards carry)`);
  for (const k of REQUIRED) if (e[k] == null || e[k] === '' || (Array.isArray(e[k]) && !e[k].length && k !== 'labels_decoded')) err(`missing ${k}`);
  if (errors.length) return { status: 'add', errors };

  if (!(e.evidence_tier in evidenceTiers)) err(`evidence_tier ${e.evidence_tier} not one of ${Object.keys(evidenceTiers).join('/')}`);
  if (e.buying_tips.length < 3) err(`buying_tips holds ${e.buying_tips.length} (question cards need 3)`);
  if (e.pick_steps.length > 3) err(`pick_steps holds ${e.pick_steps.length} (1-3)`);
  if ((e.watch_out || []).length > 3) err(`watch_out holds ${e.watch_out.length} (max 3)`);
  if (new Set(e.asked_as.map(norm)).size < 3) err('asked_as needs 3+ distinct shopper questions');
  if (e.family && !entries.some((x) => x.kind === 'family' && x.id === e.family)) err(`family ${e.family} does not exist`);

  // Promotion: the pick must be a real pick; its aliases move to the card with it.
  if (row.promotes && pick?.kind !== 'pick') err(`promotes ${row.promotes}: no such pick`);

  // Sources: every one a fetched URL recorded in the row (archive file holding the URL, or a quote).
  const fetched = Array.isArray(row.fetched) ? row.fetched : [];
  for (const s of e.sources) {
    const url = s?.url;
    if (typeof url !== 'string' || !/^https?:\/\//.test(url) || !s.name) { err(`source ${JSON.stringify(s)} must be {name, url} with an http(s) url`); continue; }
    const f = fetched.find((x) => x?.url === url);
    if (!f || f.fetched !== true) { err(`source ${url} has no fetched:true record in the row (never cite from memory)`); continue; }
    if (f.archive) {
      const p = join(archiveDir, f.archive);
      const text = existsSync(p) ? readFileSync(p, 'utf8') : null;
      if (text == null) err(`source ${url}: archive ${f.archive} not found`);
      else if (!text.includes(url)) err(`source ${url}: URL not verbatim in archive ${f.archive}`);
      else if (f.quote && !text.includes(f.quote)) err(`source ${url}: quote not verbatim in archive ${f.archive}`);
    } else if (typeof f.quote !== 'string' || words(f.quote) < 6) err(`source ${url}: needs an archive path or a quote of 6+ words`);
  }

  // Hub steal: a new alias may not equal an existing card's alias, nor sit inside one (shorter, more generic).
  // Longer and more specific is fine: "canned wild salmon" beside "salmon" scores higher only where it belongs.
  const owners = entries.filter((x) => !x.kind && x.id !== e.id);
  for (const a of e.aliases) {
    const n = norm(a);
    if (!n) { err('empty alias'); continue; }
    if (words(a) > MAX_ALIAS_WORDS) err(`alias "${a}" over ${MAX_ALIAS_WORDS} words never matches inside a question`);
    for (const o of owners) {
      const hit = (o.aliases || []).find((b) => ` ${norm(b)} `.includes(` ${n} `));
      if (hit) err(`alias "${a}" steals ${o.id}'s "${hit}"${norm(hit) === n ? '' : ' (shorter, generic)'}; use one longer, specific alias`);
    }
  }

  // Lint bar: the same functions the corpus tests run, on the projected card with its reviewed do line.
  const doLine = doLines[e.id];
  if (!doLine) err(`no do line for ${e.id} in lib/doLines.json (docs/do-lines-review.md + scripts/buildDoLines.js first)`);
  else {
    const card = projectEntry(e, { doLine });
    for (const v of [...lintCard(card), ...lintPickSteps(e), ...lintLookforScope(e), ...lintTierNoteVsLookFor(card)]) err(`lint ${v.code}: ${v.detail ?? v.text ?? ''}`);
    // Two-line rule (scripts/twoLineCheck.js): line 1 the decision, line 2 the first Look for.
    const tip0 = e.buying_tips[0];
    if (words(e.decision) > 10) err(`two-line: decision ${words(e.decision)}w > 10`);
    if (card.look_for?.[0] !== tip0) err('two-line: buying_tips[0] is not look_for[0]');
    if (tip0.length > 90) err(`two-line: buying_tips[0] ${tip0.length}c > 90`);
    if (/—/.test(e.decision + tip0)) err('two-line: em dash in line 1 or 2');
    if (/\b(I|me|my|mine|we|our|us)\b/.test(`${e.decision} ${tip0}`)) err('two-line: first person in line 1 or 2');
  }
  return { status: 'add', errors };
}

// Mutates entries: the card takes the promoted pick's slot, else goes after the last item card.
export function applyAddCard(entries, row) {
  const at = row.promotes ? entries.findIndex((x) => x.id === row.promotes) : -1;
  if (at >= 0) return void entries.splice(at, 1, row.entry);
  const last = entries.findLastIndex((x) => !x.kind);
  entries.splice(last + 1, 0, row.entry);
}
