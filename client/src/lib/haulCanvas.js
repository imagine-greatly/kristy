/* ═══════════════════════ Haul scorecard — canvas renderer (Step 10) ═══════════════════════
   Draws the week's haul onto a 1080×1350 <canvas> so what you see is what you post:
   forest-green + gold ground, the thread/dot motif, the distribution bar +
   Kristy's one-line read, the Kristy wordmark, and a subtle CTA. Personal data
   (the read + exact counts) is toggleable off before sharing. Reuses the verdict
   card's fonts + blob helpers so the two never drift. */

import { colors, fonts } from './tokens.js';
export { canvasToBlob, ensureCardFonts } from './verdictCanvas.js';

const CARD = { w: 1080, h: 1350 };
const SERIF = fonts.serif;
const MONO = fonts.mono;
const BUCKETS = [
  { key: 'approved', label: 'Approved', color: colors.accentMint },
  { key: 'note', label: 'With a note', color: colors.accentGold },
  { key: 'swap', label: 'Swap', color: colors.danger },
];

function wrap(ctx, text, maxWidth) {
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

function tracked(ctx, text, x, y, spacing) {
  let cx = x;
  for (const ch of text) {
    ctx.fillText(ch, cx, y);
    cx += ctx.measureText(ch).width + spacing;
  }
}

/**
 * Draw the haul scorecard.
 * @param canvas
 * @param {{ distribution:{approved,note,swap,total}, read?:string, hidePersonal?:boolean }} data
 */
export function drawHaulCard(canvas, { distribution, read = '', hidePersonal = false } = {}) {
  const { w: W, h: H } = CARD;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  const d = distribution || { approved: 0, note: 0, swap: 0, total: 0 };
  const total = Math.max(1, d.total);

  // ground
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, colors.bgDeep);
  grad.addColorStop(1, colors.bg);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // soft gold glow
  const glow = ctx.createRadialGradient(W * 0.5, H * 0.28, 0, W * 0.5, H * 0.28, W * 0.8);
  glow.addColorStop(0, 'rgba(201,168,76,0.10)');
  glow.addColorStop(1, 'rgba(201,168,76,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // hairline gold frame
  const fm = Math.round(W * 0.046);
  ctx.strokeStyle = 'rgba(201,168,76,0.22)';
  ctx.lineWidth = 2;
  ctx.strokeRect(fm, fm, W - fm * 2, H - fm * 2);

  const P = Math.round(W * 0.094);
  const contentW = W - P * 2;

  // ── thread/dot motif (top) ──
  const threadY = Math.round(H * 0.115);
  const g = ctx.createLinearGradient(P, 0, W - P, 0);
  g.addColorStop(0, 'rgba(201,168,76,0)');
  g.addColorStop(0.5, 'rgba(201,168,76,0.55)');
  g.addColorStop(1, 'rgba(201,168,76,0)');
  ctx.strokeStyle = g;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(P, threadY);
  ctx.lineTo(W - P, threadY);
  ctx.stroke();
  ctx.fillStyle = colors.accentGold;
  ctx.beginPath();
  ctx.arc(W / 2, threadY, 7, 0, Math.PI * 2);
  ctx.fill();

  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';

  // ── label ──
  ctx.fillStyle = colors.accentGold;
  const labelSize = Math.round(W * 0.026);
  ctx.font = `500 ${labelSize}px ${MONO}`;
  const label = "THIS WEEK'S HAUL";
  const lw = [...label].reduce((s, ch) => s + ctx.measureText(ch).width + labelSize * 0.22, -labelSize * 0.22);
  ctx.textAlign = 'left';
  tracked(ctx, label, W / 2 - lw / 2, Math.round(H * 0.175), labelSize * 0.22);

  // ── distribution bar ──
  const barY = Math.round(H * 0.225);
  const barH = Math.round(H * 0.05);
  const rad = barH / 2;
  // track
  ctx.fillStyle = colors.surface2;
  roundRect(ctx, P, barY, contentW, barH, rad);
  ctx.fill();
  // segments
  let x = P;
  ctx.save();
  roundRect(ctx, P, barY, contentW, barH, rad);
  ctx.clip();
  for (const b of BUCKETS) {
    const segW = (d[b.key] / total) * contentW;
    if (segW <= 0) continue;
    ctx.fillStyle = b.color;
    ctx.fillRect(x, barY, segW, barH);
    x += segW;
  }
  ctx.restore();

  // ── legend ──
  let ly = barY + barH + Math.round(H * 0.055);
  const legendSize = Math.round(W * 0.036);
  for (const b of BUCKETS) {
    ctx.fillStyle = b.color;
    ctx.beginPath();
    ctx.arc(P + 10, ly - legendSize * 0.32, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.textAlign = 'left';
    ctx.fillStyle = colors.textPrimary;
    ctx.font = `400 ${legendSize}px ${SERIF}`;
    ctx.fillText(b.label, P + 40, ly);
    ctx.textAlign = 'right';
    ctx.fillStyle = colors.accentGold;
    ctx.font = `500 ${legendSize}px ${MONO}`;
    // Personal data off → show a share (%), not raw counts.
    const value = hidePersonal ? `${Math.round((d[b.key] / total) * 100)}%` : String(d[b.key]);
    ctx.fillText(value, W - P, ly);
    ly += Math.round(legendSize * 1.85);
  }

  // ── Kristy's one-line read (personal — hidden when toggled off) ──
  let cursor = ly + Math.round(H * 0.03);
  if (!hidePersonal && read) {
    const readSize = Math.round(W * 0.042);
    ctx.font = `italic 400 ${readSize}px ${SERIF}`;
    ctx.textAlign = 'left';
    ctx.fillStyle = colors.textPrimary;
    for (const line of wrap(ctx, read, contentW).slice(0, 5)) {
      ctx.fillText(line, P, cursor);
      cursor += Math.round(readSize * 1.34);
    }
  } else {
    const tagSize = Math.round(W * 0.042);
    ctx.font = `italic 400 ${tagSize}px ${SERIF}`;
    ctx.textAlign = 'center';
    ctx.fillStyle = colors.textMuted;
    ctx.fillText('A week of smarter groceries.', W / 2, cursor);
  }

  // ── footer: K mark + wordmark + CTA ──
  const footY = H - fm - Math.round(H * 0.055);
  const r = Math.round(W * 0.032);
  const cx = P + r;
  ctx.beginPath();
  ctx.arc(cx, footY, r, 0, Math.PI * 2);
  ctx.strokeStyle = colors.accentGold;
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = colors.accentGold;
  ctx.font = `400 ${Math.round(r * 1.18)}px ${SERIF}`;
  ctx.fillText('K', cx, footY + r * 0.06);

  ctx.textAlign = 'left';
  ctx.fillStyle = colors.textPrimary;
  ctx.font = `400 ${Math.round(W * 0.038)}px ${SERIF}`;
  ctx.fillText('Kristy', cx + r + Math.round(W * 0.02), footY - Math.round(W * 0.016));
  ctx.fillStyle = colors.textMuted;
  ctx.font = `400 ${Math.round(W * 0.023)}px ${MONO}`;
  ctx.fillText('Scan your groceries · kristyapproved.vercel.app', cx + r + Math.round(W * 0.02), footY + Math.round(W * 0.024));

  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
