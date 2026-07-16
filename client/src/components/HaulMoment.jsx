import { useState } from 'react';
import { colors, fonts, kristyVoice } from '../lib/tokens.js';
import { GoldThread } from './GoldThread.jsx';
import { HaulIcon } from './Icons.jsx';
import AmbientIsm from './AmbientIsm.jsx';

/* ═══════════════════════ Haul — after the trip ═══════════════════════
   Aggregates the trip + week of scans into: a distribution bar (approved / with
   a note / swaps), a scrollable list of scanned items with their tiers, and
   Kristy's weekly read (kristyVoice, claim-locked server-side). Two actions:
   Add to next list (→ List builder) and Share haul (→ shareable card).
   Tokens only. */

const BUCKET = {
  approved: { label: 'Approved', color: colors.accentMint, chipFg: colors.accentSeafoam },
  note: { label: 'With a note', color: colors.accentGold, chipFg: colors.accentGold },
  swap: { label: 'Swap', color: colors.danger, chipFg: colors.error },
};
const bucketOf = (tier) =>
  tier === 'approved' ? 'approved' : tier === 'approved_with_note' || tier === 'use_with_intention' ? 'note' : 'swap';

function DistributionBar({ d }) {
  const total = Math.max(1, d.total);
  const seg = (k) => ({ width: `${(d[k] / total) * 100}%`, background: BUCKET[k].color });
  return (
    <div>
      <div style={styles.bar}>
        {d.approved > 0 && <div style={{ ...styles.seg, ...seg('approved') }} />}
        {d.note > 0 && <div style={{ ...styles.seg, ...seg('note') }} />}
        {d.swap > 0 && <div style={{ ...styles.seg, ...seg('swap') }} />}
      </div>
      <div style={styles.legend}>
        {['approved', 'note', 'swap'].map((k) => (
          <div key={k} style={styles.legendItem}>
            <span style={{ ...styles.dot, background: BUCKET[k].color }} />
            <span style={styles.legendLabel}>{BUCKET[k].label}</span>
            <span style={styles.legendCount}>{d[k]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ItemRow({ scan }) {
  const b = bucketOf(scan.tier);
  return (
    <div style={styles.row}>
      <span style={styles.rowName}>{scan.product_name || 'Scanned item'}</span>
      <span style={{ ...styles.rowChip, color: BUCKET[b].chipFg, borderColor: BUCKET[b].color }}>{BUCKET[b].label}</span>
    </div>
  );
}

function ActionButton({ label, doneLabel, primary, onClick }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      style={{ ...styles.action, ...(primary ? styles.actionPrimary : styles.actionGhost) }}
      onClick={() => {
        onClick?.();
        if (doneLabel) {
          setDone(true);
          setTimeout(() => setDone(false), 1800);
        }
      }}
    >
      {done ? doneLabel : label}
    </button>
  );
}

export default function HaulMoment({ haul, loading, onScan, onAddToList, onShareHaul }) {
  if (loading && !haul) {
    return (
      <div style={styles.center}>
        <div style={styles.icon}><HaulIcon size={26} /></div>
        <GoldThread />
        <div style={styles.title}>Reading your haul…</div>
        <AmbientIsm style={{ marginTop: 6 }} />
      </div>
    );
  }

  const week = haul?.week || [];
  const trip = haul?.trip || [];
  const d = haul?.distribution || { approved: 0, note: 0, swap: 0, total: 0 };

  // Empty — before the first trip. An invitation, not a dead end.
  if (week.length === 0) {
    return (
      <div style={styles.center}>
        <div style={styles.icon}><HaulIcon size={26} /></div>
        <GoldThread />
        <h1 style={styles.title}>Your haul</h1>
        <p style={styles.emptyLine}>Everything you scan lands here — your trip and your week at a glance. Scan your first product to start it.</p>
        <button type="button" style={{ ...styles.action, ...styles.actionPrimary, maxWidth: 260 }} onClick={onScan}>
          Scan a product
        </button>
        <AmbientIsm style={{ marginTop: 12 }} />
      </div>
    );
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.head}>
        <h1 style={styles.title}>Your haul</h1>
        <p style={styles.sub}>
          {trip.length} this trip · {week.length} this week
        </p>
      </div>

      <DistributionBar d={d} />

      {haul?.read && (
        <div style={styles.read}>
          <GoldThread />
          <p style={{ ...kristyVoice, ...styles.readText }}>{haul.read}</p>
        </div>
      )}

      <div style={styles.list}>
        {week.map((s) => (
          <ItemRow key={s.id} scan={s} />
        ))}
      </div>

      <div style={styles.actions}>
        <ActionButton label="Add to next list" doneLabel="Added ✓" primary onClick={onAddToList} />
        <ActionButton label="Share haul" onClick={onShareHaul} />
      </div>
    </div>
  );
}

const styles = {
  wrap: { maxWidth: 480, margin: '0 auto', width: '100%', boxSizing: 'border-box', padding: '20px 18px 28px', display: 'flex', flexDirection: 'column', gap: 18 },
  head: { display: 'flex', flexDirection: 'column', gap: 4 },
  title: { ...kristyVoice, margin: 0, fontSize: 24, color: colors.textPrimary },
  sub: { margin: 0, fontFamily: fonts.ui, fontSize: 13.5, color: colors.textMuted },

  bar: { display: 'flex', width: '100%', height: 14, borderRadius: 999, overflow: 'hidden', background: colors.surface2, border: `1px solid ${colors.border}` },
  seg: { height: '100%' },
  legend: { display: 'flex', gap: 16, marginTop: 10, flexWrap: 'wrap' },
  legendItem: { display: 'flex', alignItems: 'center', gap: 6 },
  dot: { width: 9, height: 9, borderRadius: '50%', flex: '0 0 auto' },
  legendLabel: { fontFamily: fonts.ui, fontSize: 12.5, color: colors.textMuted },
  legendCount: { fontFamily: fonts.mono, fontSize: 12.5, color: colors.textPrimary, fontWeight: 600 },

  read: { display: 'flex', flexDirection: 'column', gap: 10 },
  readText: { margin: 0, fontSize: 17, lineHeight: 1.5, color: colors.textPrimary },

  list: { display: 'flex', flexDirection: 'column', gap: 8 },
  row: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '11px 13px', borderRadius: 11, border: `1px solid ${colors.border}`, background: colors.surface },
  rowName: { fontFamily: fonts.ui, fontSize: 14.5, color: colors.textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  rowChip: { flex: '0 0 auto', fontFamily: fonts.ui, fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 999, border: '1px solid', whiteSpace: 'nowrap' },

  actions: { display: 'flex', gap: 10, marginTop: 4 },
  action: { flex: 1, padding: '13px 16px', borderRadius: 12, fontFamily: fonts.ui, fontWeight: 700, fontSize: 15, cursor: 'pointer' },
  actionPrimary: { border: 'none', background: colors.accentGold, color: colors.bgDeep },
  actionGhost: { border: `1px solid ${colors.borderGold}`, background: 'transparent', color: colors.textSecondary, fontWeight: 600 },

  center: { display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 14, maxWidth: 380, margin: '0 auto', padding: '52px 24px 24px' },
  icon: { color: colors.accentGold, display: 'flex' },
  emptyLine: { margin: 0, fontFamily: fonts.ui, fontSize: 15, lineHeight: 1.55, color: colors.textMuted, maxWidth: 320 },
};
