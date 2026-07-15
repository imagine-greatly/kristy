/* ═══════════════════════ Kristy's Verdict — canvas renderer ═══════════════════════
   The verdict is drawn straight onto a 1080×1920 (or 1080×1080) <canvas> so what
   you see is EXACTLY what exports — no html2canvas, no drift. Kept as a plain
   module (not inside the React component) so it's the single source of truth for
   both the on-screen card and the PNG export, and is testable in isolation. */

import { colors, fonts } from './tokens.js';

export const CARD = {
  portrait: { w: 1080, h: 1920 },
  square: { w: 1080, h: 1080 },
};

// Card palette — the void/deep-green ground + antique gold, drawn straight from
// the design tokens (lib/tokens.js) so the card and the app never drift.
const COL = {
  bgTop: colors.bgDeep,
  bgBot: colors.bg,
  gold: colors.accentGold,
  goldDim: colors.accentGoldMuted,
  ink: colors.textPrimary,
  mut: colors.textMuted,
};
const SERIF = fonts.serif;
const MONO = fonts.mono;
export { MONO };

/* ── grain: a cached noise tile, composited low-alpha over the ground ── */
let _noise = null;
function noiseTile() {
  if (_noise) return _noise;
  const n = document.createElement('canvas');
  n.width = n.height = 150;
  const c = n.getContext('2d');
  const img = c.createImageData(150, 150);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = Math.floor(Math.random() * 255);
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  c.putImageData(img, 0, 0);
  _noise = n;
  return n;
}

function wrapLines(ctx, text, maxWidth) {
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let cur = '';
  for (const w of words) {
    const t = cur ? `${cur} ${w}` : w;
    if (ctx.measureText(t).width <= maxWidth || !cur) cur = t;
    else {
      lines.push(cur);
      cur = w;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

// Shrink the headline until it fits the width in <= maxLines. The verdict line
// is the screenshot magnet, so it gets the most room and the largest type.
function fitHeadline(ctx, text, { maxWidth, maxLines, start, min, weight }) {
  let size = start;
  while (size > min) {
    ctx.font = `${weight} ${size}px ${SERIF}`;
    if (wrapLines(ctx, text, maxWidth).length <= maxLines) break;
    size -= 3;
  }
  size = Math.max(size, min);
  ctx.font = `${weight} ${size}px ${SERIF}`;
  return { lines: wrapLines(ctx, text, maxWidth), size, lineHeight: Math.round(size * 1.15) };
}

// Letter-spaced text, drawn char-by-char so tracking is identical on every
// browser (canvas letterSpacing support is uneven). Assumes textAlign 'left'.
function drawTracked(ctx, text, x, y, spacing) {
  let cx = x;
  for (const ch of text) {
    ctx.fillText(ch, cx, y);
    cx += ctx.measureText(ch).width + spacing;
  }
}

function pickSwap(breakdown = []) {
  if (!breakdown.length) return '';
  return breakdown.find((b) => /\bswap|instead|trade|replace\b/i.test(b)) || breakdown[breakdown.length - 1];
}

/* ── the draw routine (used verbatim for display AND export) ── */
export function drawVerdictCard(canvas, verdict, format = 'portrait') {
  const { w: W, h: H } = CARD[format] || CARD.portrait;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  const isPortrait = (format || 'portrait') !== 'square';

  // ground
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, COL.bgTop);
  grad.addColorStop(1, COL.bgBot);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // soft gold glow behind the headline
  const glow = ctx.createRadialGradient(W * 0.5, H * 0.32, 0, W * 0.5, H * 0.32, W * 0.78);
  glow.addColorStop(0, 'rgba(201,168,76,0.11)');
  glow.addColorStop(1, 'rgba(201,168,76,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // grain
  try {
    const pat = ctx.createPattern(noiseTile(), 'repeat');
    ctx.save();
    ctx.globalAlpha = 0.05;
    ctx.globalCompositeOperation = 'overlay';
    ctx.fillStyle = pat;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  } catch {
    /* pattern unsupported — ground alone is fine */
  }

  const P = Math.round(W * 0.094);
  const contentW = W - P * 2;

  // hairline gold frame
  const fm = Math.round(W * 0.046);
  ctx.strokeStyle = 'rgba(201,168,76,0.22)';
  ctx.lineWidth = 2;
  ctx.strokeRect(fm, fm, W - fm * 2, H - fm * 2);

  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  // ── label ──
  const kindWord = verdict.kind === 'haul' ? 'HAUL' : 'MEAL';
  const labelY = Math.round(isPortrait ? H * 0.108 : H * 0.12);
  const labelSize = Math.round(W * 0.0245);
  ctx.fillStyle = COL.gold;
  ctx.font = `500 ${labelSize}px ${MONO}`;
  drawTracked(ctx, `KRISTY'S VERDICT · ${kindWord}`, P, labelY, labelSize * 0.22);

  let cursor = labelY + Math.round(isPortrait ? H * 0.062 : H * 0.058);

  // ── headline (the magnet) ──
  const head = fitHeadline(ctx, verdict.verdict_line, {
    maxWidth: contentW,
    maxLines: isPortrait ? 6 : 4,
    start: Math.round(W * (isPortrait ? 0.092 : 0.078)),
    min: Math.round(W * 0.05),
    weight: 400,
  });
  ctx.fillStyle = COL.ink;
  ctx.font = `400 ${head.size}px ${SERIF}`;
  for (const line of head.lines) {
    ctx.fillText(line, P, cursor);
    cursor += head.lineHeight;
  }

  // ── thin gold rule ──
  cursor += Math.round(H * (isPortrait ? 0.028 : 0.03));
  ctx.strokeStyle = 'rgba(201,168,76,0.55)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(P, cursor);
  ctx.lineTo(P + contentW * 0.42, cursor);
  ctx.stroke();

  // ── stats (2-3 gold callouts) ──
  cursor += Math.round(H * (isPortrait ? 0.035 : 0.04));
  const stats = (verdict.fit?.stats || []).slice(0, 3);
  let statSize = Math.round(W * 0.037);
  const bullet = Math.round(W * 0.012);
  const statGap = Math.round(bullet * 1.8);
  ctx.font = `500 ${statSize}px ${MONO}`;
  const avail = contentW - bullet - statGap;
  for (const s of stats) {
    while (statSize > W * 0.024 && ctx.measureText(s).width > avail) {
      statSize -= 2;
      ctx.font = `500 ${statSize}px ${MONO}`;
    }
  }
  const statRow = Math.round(statSize * 1.75);
  for (const s of stats) {
    ctx.fillStyle = COL.gold;
    ctx.fillRect(P, cursor + statSize * 0.28, bullet, bullet);
    ctx.font = `500 ${statSize}px ${MONO}`;
    ctx.fillStyle = COL.gold;
    ctx.fillText(s, P + bullet + statGap, cursor);
    cursor += statRow;
  }

  // ── swap line (small) ──
  const swap = pickSwap(verdict.breakdown);
  if (swap) {
    cursor += Math.round(H * (isPortrait ? 0.022 : 0.026));
    const swapSize = Math.round(W * 0.031);
    ctx.font = `italic 400 ${swapSize}px ${SERIF}`;
    const arrow = '→  ';
    const arrowW = ctx.measureText(arrow).width;
    const swapLines = wrapLines(ctx, swap, contentW - arrowW).slice(0, 3);
    swapLines.forEach((line, i) => {
      ctx.fillStyle = i === 0 ? COL.gold : COL.mut;
      ctx.fillText(i === 0 ? arrow : '', P, cursor);
      ctx.fillStyle = COL.mut;
      ctx.fillText(line, P + (i === 0 ? arrowW : 0), cursor);
      cursor += Math.round(swapSize * 1.34);
    });
  }

  // ── footer: K mark + domain (pinned to the bottom) ──
  const footY = H - fm - Math.round(isPortrait ? H * 0.05 : H * 0.075);
  const r = Math.round(W * 0.03);
  const cx = P + r;
  ctx.beginPath();
  ctx.arc(cx, footY, r, 0, Math.PI * 2);
  ctx.strokeStyle = COL.gold;
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = COL.gold;
  ctx.font = `400 ${Math.round(r * 1.18)}px ${SERIF}`;
  ctx.fillText('K', cx, footY + r * 0.06);

  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = COL.mut;
  ctx.font = `400 ${Math.round(W * 0.0255)}px ${MONO}`;
  ctx.fillText('kristyapproved.vercel.app', cx + r + Math.round(W * 0.022), footY);

  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
}

export function canvasToBlob(canvas) {
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), 'image/png', 0.98));
}

// Await the card fonts before any rasterize — a text-less export is a failed
// feature. Georgia is a system serif; DM Mono must load. Resolves either way.
export function ensureCardFonts() {
  const fonts = typeof document !== 'undefined' && document.fonts;
  if (!fonts) return Promise.resolve();
  return Promise.all([
    fonts.load(`500 40px ${MONO}`).catch(() => {}),
    fonts.load(`400 40px ${MONO}`).catch(() => {}),
  ])
    .then(() => fonts.ready)
    .catch(() => {});
}
