import { motif } from '../lib/tokens.js';

/* ═══════════════════════════ Gold thread / dot motif ═══════════════════════════
   The locked brand's recurring hairline: a thin gold thread that fades in from
   both edges to a single gold dot. Defined once here (and mirrored as the
   `.gold-thread` / `.gold-dot` CSS utilities in index.css) so every surface —
   verdict card, section divider, seal — draws the same motif.

   Purely decorative → aria-hidden so screen readers skip it. */

export function GoldDot({ size = motif.dotSize, color = motif.dotColor, style }) {
  return (
    <span
      aria-hidden="true"
      style={{
        display: 'inline-block',
        flex: '0 0 auto',
        width: size,
        height: size,
        borderRadius: '50%',
        background: color,
        ...style,
      }}
    />
  );
}

// A centered gold dot suspended on a hairline thread. `dot={false}` gives a bare
// fading rule; `strong` uses the emphasised gold (the verdict-card weight).
export function GoldThread({ dot = true, strong = false, style }) {
  const line = strong ? motif.threadColorStrong : motif.threadColor;
  const half = (dir) => ({
    flex: 1,
    height: 1,
    background: `linear-gradient(${dir}, transparent, ${line})`,
  });
  return (
    <div
      aria-hidden="true"
      style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', ...style }}
    >
      <span style={half('90deg')} />
      {dot && <GoldDot />}
      <span style={half('270deg')} />
    </div>
  );
}

export default GoldThread;
