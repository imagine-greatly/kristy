import { Router } from 'express';
import { timingSafeEqual } from 'node:crypto';
import { gapFeed } from '../lib/counterGaps.js';
import { coverageStats, topScannedProducts, lowConfidenceRows } from '../lib/productStore.js';
import { scanFunnel } from '../lib/scanEvents.js';
import { conflictFeed } from '../lib/ingredientConflicts.js';

// The internal growth view — the cores, compounding, where we can see it.
//
//   GET /api/internal/growth        JSON
//   GET /api/internal/growth.html   the same numbers, readable in a browser
//
// NOT A PRODUCT SURFACE. It is ops: the counter's authoring backlog and the scanner's
// coverage, so the next KB entry is chosen by what shoppers actually asked instead of
// by guesswork.
//
// AGGREGATE ONLY, and that is a property of what it reads, not a filter it applies.
// Both sources — counter_gaps and scanned_products — hold no identity at all, so there
// is no individual data here to leak, redact or accidentally widen into. A test
// asserts this route touches no per-user reader.
//
// DISABLED UNLESS DELIBERATELY TURNED ON. With no INTERNAL_DASHBOARD_TOKEN set, every
// path here 404s. A dashboard that quietly becomes public the moment it ships to a new
// environment is the standard way this kind of thing goes wrong, so the default is off
// rather than open.

const RAW_TOKEN = process.env.INTERNAL_DASHBOARD_TOKEN || '';

// A short token is a guessable token, and this endpoint is reachable from anywhere.
// Too short counts as NOT CONFIGURED — it fails closed and says why, rather than
// running with a gate that only looks like one.
const MIN_TOKEN_LEN = 24;
const TOKEN = RAW_TOKEN.length >= MIN_TOKEN_LEN ? RAW_TOKEN : '';

if (RAW_TOKEN && !TOKEN) {
  console.warn(
    `[kristy] INTERNAL_DASHBOARD_TOKEN is shorter than ${MIN_TOKEN_LEN} chars — ` +
      'the internal growth view stays DISABLED. Set a longer one.'
  );
}

/** Constant-time compare, so the token can't be recovered a byte at a time. */
export function tokenMatches(provided, expected = TOKEN) {
  if (!expected || !provided) return false;
  const a = Buffer.from(String(provided));
  const b = Buffer.from(expected);
  // Length is not secret, and timingSafeEqual throws on a mismatch.
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/**
 * 404, never 401. An internal endpoint should not confirm it exists to someone
 * without the token — a 401 is an invitation to keep trying, and the whole path is
 * meant to be invisible from the outside.
 */
function internalOnly(req, res, next) {
  const header = req.headers.authorization || '';
  const bearer = header.startsWith('Bearer ') ? header.slice(7) : '';
  // The query form exists so the HTML view is openable in a browser, where a header
  // cannot be set. It DOES put the token in server logs and browser history, so treat
  // it as rotatable rather than permanent.
  const provided = bearer || req.query?.token || '';
  if (!tokenMatches(provided)) return res.status(404).json({ error: 'not_found' });
  return next();
}

export const internalRouter = Router();

/** Every number on the view, gathered once. */
async function growthSnapshot() {
  const [coverage, gaps, topProducts, funnel, curation, conflicts] = await Promise.all([
    coverageStats(),
    gapFeed({ limit: 40 }),
    topScannedProducts({ limit: 20 }),
    // The funnel (did photo-first work), the curation queue (which rows are shaky),
    // and the records that disagree with themselves. All three read aggregate tables
    // that hold no identity — the property is structural, not a filter applied here.
    scanFunnel({ days: 30 }),
    lowConfidenceRows({ limit: 40 }),
    conflictFeed({ limit: 40 }),
  ]);

  return {
    generatedAt: new Date().toISOString(),
    scanner: {
      ...coverage,
      // The share of the catalog nobody else has. The moat, as a fraction.
      ownedShare: coverage.total > 0 ? Math.round((coverage.fromVision / coverage.total) * 100) : 0,
    },
    // DID THE FLIP WORK? One row per scan ATTEMPT, so the failures the catalog cannot
    // see — the unreadable photo, the shopper who gave up — are counted here.
    funnel,
    // The rows built from a partial read. The ACTION IS DELETE, NOT EDIT: a hand-typed
    // ingredient list is a vision read with worse provenance and no confidence signal.
    // Most of this drains itself when a fuller read of the same product arrives.
    curation: { available: curation.available, rows: curation.rows },
    // Records where Open Food Facts disagrees with itself. Kristy answers from neither.
    conflicts: { available: conflicts.available, rows: conflicts.conflicts },
    counter: {
      unavailable: gaps.unavailable === true,
      // The authoring backlog: what to write next, in the order shoppers asked.
      gaps: gaps.rows,
      distinctTopics: gaps.total,
      askingsSampled: gaps.window,
      truncated: gaps.truncated,
    },
    topProducts,
  };
}

internalRouter.get('/growth', internalOnly, async (_req, res) => {
  try {
    return res.json(await growthSnapshot());
  } catch (err) {
    console.error('[kristy] /api/internal/growth error:', err?.message || err);
    return res.status(500).json({ error: true, message: 'growth snapshot failed' });
  }
});

/* ───────────────────────── The browser view ─────────────────────────
   Deliberately plain. This is not a Kristy surface, so it does not use her
   typography, her greens or her gold — inventing a brand treatment for an ops page
   is exactly the kind of drift the brand lock exists to prevent. Numbers, in a table,
   in a system font. */

const esc = (s) =>
  String(s ?? '').replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]
  );

function renderHtml(snap) {
  const { scanner, counter, topProducts } = snap;

  const gapRows = counter.gaps.length
    ? counter.gaps
        .map(
          (g) => `<tr>
        <td class="n">${g.times_asked}</td>
        <td><span class="tag ${g.outcome}">${esc(g.outcome)}</span></td>
        <td>${esc(g.question)}</td>
        <td class="dim">${esc(g.top_entry_id || '')}</td>
      </tr>`
        )
        .join('')
    : `<tr><td colspan="4" class="dim">Nothing logged yet — expected until real questions arrive.</td></tr>`;

  const productRows = topProducts.length
    ? topProducts
        .map(
          (p) => `<tr>
        <td class="n">${esc(p.scan_count)}</td>
        <td>${esc(p.name || '(unnamed)')}</td>
        <td class="dim">${esc(p.brand || '')}</td>
        <td class="dim">${esc(p.source)}${p.confidence === 'low' ? ' · partial' : ''}</td>
      </tr>`
        )
        .join('')
    : `<tr><td colspan="4" class="dim">No products learned yet.</td></tr>`;

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>Kristy — growth (internal)</title>
<style>
  :root { color-scheme: light dark; }
  body { font: 14px/1.5 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
         margin: 0; padding: 24px; max-width: 1000px; }
  h1 { font-size: 15px; margin: 0 0 4px; }
  h2 { font-size: 13px; margin: 28px 0 8px; text-transform: uppercase; letter-spacing: .08em; }
  .dim { opacity: .6; }
  .warn { padding: 8px 10px; border: 1px solid currentColor; margin: 12px 0; opacity: .8; }
  .stats { display: flex; flex-wrap: wrap; gap: 20px; margin: 12px 0; }
  .stat b { display: block; font-size: 22px; font-weight: 600; }
  .stat span { font-size: 11px; text-transform: uppercase; letter-spacing: .06em; opacity: .6; }
  table { border-collapse: collapse; width: 100%; }
  td, th { text-align: left; padding: 5px 10px 5px 0; border-bottom: 1px solid rgba(128,128,128,.25);
           vertical-align: top; }
  th { font-size: 11px; text-transform: uppercase; letter-spacing: .06em; opacity: .6; }
  td.n { text-align: right; width: 56px; font-variant-numeric: tabular-nums; }
  .tag { font-size: 11px; padding: 1px 6px; border: 1px solid currentColor; border-radius: 2px; }
  .tag.miss { opacity: 1; }
  .tag.weak { opacity: .55; }
  .wrap { overflow-x: auto; }
</style></head><body>

<h1>Kristy — growth</h1>
<div class="dim">Internal. Aggregate only: products and questions, never people. ${esc(snap.generatedAt)}</div>

<h2>Scanner coverage</h2>
${scanner.available ? '' : '<div class="warn">scanned_products is unreachable — migration not applied, or the service key is wrong.</div>'}
<div class="stats">
  <div class="stat"><b>${scanner.total}</b><span>products learned</span></div>
  <div class="stat"><b>${scanner.fromVision}</b><span>from vision (owned)</span></div>
  <div class="stat"><b>${scanner.fromOff}</b><span>from OFF (borrowed)</span></div>
  <div class="stat"><b>${scanner.ownedShare}%</b><span>owned share</span></div>
  <div class="stat"><b>${scanner.learnedRecently}</b><span>new in ${scanner.recentDays}d</span></div>
  <div class="stat"><b>${scanner.lowConfidence}</b><span>partial reads</span></div>
</div>
<div class="dim">Owned coverage is the moat: products no barcode database could answer for.
Watch that number climb.</div>

<h2>Counter gaps — the authoring backlog</h2>
${counter.unavailable ? '<div class="warn">counter_gaps is unreachable — migration not applied.</div>' : ''}
<div class="dim">${counter.distinctTopics} distinct topics from ${counter.askingsSampled} askings.
${counter.truncated ? 'Sample was truncated — older askings are not counted.' : ''}
<b>miss</b> = nothing matched, write an entry. <b>weak</b> = an entry exists and answers it poorly.</div>
<div class="wrap"><table>
  <tr><th>asked</th><th>outcome</th><th>topic</th><th>reached</th></tr>
  ${gapRows}
</table></div>

<h2>Most-scanned products</h2>
<div class="dim">Curation only. Popularity is not a health signal and never reaches a shopper.</div>
<div class="wrap"><table>
  <tr><th>scans</th><th>product</th><th>brand</th><th>source</th></tr>
  ${productRows}
</table></div>

</body></html>`;
}

internalRouter.get('/growth.html', internalOnly, async (_req, res) => {
  try {
    const snap = await growthSnapshot();
    res.set('Content-Type', 'text/html; charset=utf-8');
    res.set('X-Robots-Tag', 'noindex, nofollow');
    // An ops page with a token in the URL must not sit in a shared cache.
    res.set('Cache-Control', 'no-store, private');
    return res.send(renderHtml(snap));
  } catch (err) {
    console.error('[kristy] /api/internal/growth.html error:', err?.message || err);
    return res.status(500).send('growth snapshot failed');
  }
});

export default internalRouter;
