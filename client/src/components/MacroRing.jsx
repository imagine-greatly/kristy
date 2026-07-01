// Animated SVG progress ring. The fill animates via a CSS transition on
// stroke-dashoffset (0.6s cubic-bezier per the design spec).

export default function MacroRing({
  size = 56,
  stroke = 6,
  value = 0,
  goal = 1,
  color = '#C9A84C',
  track = '#1A3320',
  children,
}) {
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const pct = goal > 0 ? Math.min(1, value / goal) : 0;
  const offset = circumference * (1 - pct);

  return (
    <span className="ring-wrap" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={track}
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: 'stroke-dashoffset 0.6s cubic-bezier(.4,0,.2,1)',
          }}
        />
      </svg>
      {children}
    </span>
  );
}
