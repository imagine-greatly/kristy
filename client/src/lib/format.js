export const n = (x) => Math.round(Number(x) || 0);

// 1240 → "1,240"
export const fmt = (x) => n(x).toLocaleString('en-US');

// Local YYYY-MM-DD
export function dayKey(date = new Date()) {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// "Today", "Yesterday", or "Mon, Jun 16"
export function dateLabel(key) {
  const today = dayKey();
  const yest = dayKey(new Date(Date.now() - 86400000));
  if (key === today) return 'Today';
  if (key === yest) return 'Yesterday';
  const d = new Date(`${key}T12:00:00`);
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export const clampPct = (v, goal) =>
  goal > 0 ? Math.min(100, Math.round((v / goal) * 100)) : 0;
