import { useState } from 'react';
import { colors, fonts, kristyDisplay, kristyVoice, radii } from '../lib/tokens.js';
import { GoldThread } from './GoldThread.jsx';
import { HaulIcon } from './Icons.jsx';
import AmbientIsm from './AmbientIsm.jsx';

/* ═══════════════════════ Haul — the trip, filling in ═══════════════════════
   Not only a post-mortem: THIS TRIP builds here live. Every scan lands in it as it
   happens, and the cart's check-offs are counted beside them, so the Haul and the cart
   are two views of one trip in progress rather than two separate screens.

   Aggregates into: a distribution bar (approved / with a note / swaps), the trip's
   items then the week's, and Kristy's weekly read (kristyVoice, claim-locked
   server-side). The loop closes here — any item she'd swap goes to the next cart in
   ONE tap, per row or all at once, and lands there tagged "From your haul".
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

// One scanned item. When it's something she'd swap, the row carries its OWN one-tap
// route into the next cart — the insight and the action in the same place.
function ItemRow({ scan, onAddOne }) {
  const b = bucketOf(scan.tier);
  const swappable = scan.tier === 'swap_recommended' || scan.tier === 'skip';
  const [added, setAdded] = useState(false);

  return (
    <div style={styles.row}>
      <span style={styles.rowName}>{scan.product_name || 'Scanned item'}</span>
      <span style={styles.rowRight}>
        {swappable && onAddOne && (
          <button
            type="button"
            style={{ ...styles.rowAdd, ...(added ? styles.rowAdded : null) }}
            onClick={() => {
              if (added) return;
              onAddOne(scan);
              setAdded(true);
            }}
            aria-label={`Add ${scan.product_name || 'this item'} to the next cart`}
          >
            {added ? 'In next cart ✓' : '+ Next cart'}
          </button>
        )}
        <span style={{ ...styles.rowChip, color: BUCKET[b].chipFg, borderColor: BUCKET[b].color }}>{BUCKET[b].label}</span>
      </span>
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

/* ═══════════ The loop: this trip seeds the next one ═══════════
   A haul that only grades you is a report card. The point of reading a finished trip
   is that it makes the NEXT one easier — so what she learned here carries forward in
   one tap, and the shopper can see exactly what's coming with them.

   What they KEPT and what they SKIPPED are pre-selected: both are their own record.
   What she'd SWAP is offered but never pre-selected — carrying a product she flagged
   into next week on the shopper's behalf would be putting words in their mouth. */
function NextTrip({ carryForward, onStartNextCart }) {
  const keep = carryForward?.keep || [];
  const missed = carryForward?.missed || [];
  const replace = carryForward?.replace || [];

  const [chosen, setChosen] = useState(() => new Set([...keep, ...missed].map((x) => x.name)));
  const [state, setState] = useState('idle'); // idle | working | done

  if (!keep.length && !missed.length && !replace.length) return null;

  const toggle = (name) =>
    setChosen((cur) => {
      const next = new Set(cur);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });

  const Group = ({ label, items, hint }) =>
    items.length ? (
      <div style={styles.cfGroup}>
        <div style={styles.cfLabel}>
          {label}
          {hint && <span style={styles.cfHint}> · {hint}</span>}
        </div>
        <div style={styles.cfChips}>
          {items.map((x) => {
            const on = chosen.has(x.name);
            return (
              <button
                key={x.name}
                type="button"
                onClick={() => toggle(x.name)}
                aria-pressed={on}
                style={{ ...styles.cfChip, ...(on ? styles.cfChipOn : null) }}
              >
                {on ? '✓ ' : '+ '}
                {x.name}
              </button>
            );
          })}
        </div>
      </div>
    ) : null;

  return (
    <div style={styles.cf}>
      <GoldThread />
      <p style={{ ...kristyVoice, ...styles.cfTitle }}>Start next week from this one.</p>

      <Group label="Worth repeating" items={keep} />
      <Group label="Never made it in" items={missed} hint="still worth having" />
      <Group label="there’s a better pick" items={replace} hint="tap to bring it anyway" />

      <button
        type="button"
        style={{ ...styles.action, ...styles.actionPrimary }}
        disabled={!chosen.size || state === 'working'}
        onClick={async () => {
          if (!chosen.size || state === 'working') return;
          setState('working');
          const ok = await onStartNextCart?.([...chosen]);
          setState(ok ? 'done' : 'idle');
        }}
      >
        {state === 'working'
          ? 'Starting…'
          : state === 'done'
            ? 'Next cart started ✓'
            : `Start next week’s cart (${chosen.size})`}
      </button>
    </div>
  );
}

export default function HaulMoment({
  haul,
  loading,
  cartProgress,
  onScan,
  onOpenCart,
  onAddToList,
  onShareHaul,
  onAsk,
  onUpgrade,
  onStartNextCart,
}) {
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
  const checkedOff = cartProgress?.checked || 0;

  // Empty — before the first trip. An invitation, not a dead end, and it names both
  // halves of the trip: what you scan AND what you check off in the cart.
  if (week.length === 0) {
    return (
      <div style={styles.center}>
        <div style={styles.icon}><HaulIcon size={26} /></div>
        <GoldThread />
        <h1 style={styles.title}>Your haul</h1>
        <p style={styles.emptyLine}>
          {checkedOff > 0
            ? `${checkedOff} checked off. Scan something and the read on this trip fills in.`
            : 'Everything scanned lands here. Scan a product to start it.'}
        </p>
        <button type="button" style={{ ...styles.action, ...styles.actionPrimary, maxWidth: 260 }} onClick={onScan}>
          Scan a product
        </button>
        {onOpenCart && (
          <button type="button" style={styles.ask} onClick={onOpenCart}>
            Back to my cart
          </button>
        )}
        <AmbientIsm style={{ marginTop: 12 }} />
      </div>
    );
  }

  // The week minus this trip, so a scan appears once — under "This trip" while it's
  // live, and only afterwards as part of the week.
  const tripIds = new Set(trip.map((s) => s.id));
  const earlier = week.filter((s) => !tripIds.has(s.id));

  return (
    <div style={styles.wrap}>
      <div style={styles.head}>
        <h1 style={styles.title}>Your haul</h1>
        {/* The trip, counted honestly: scans are verdicts, check-offs are cart rows.
            Neither is dressed up as the other. */}
        <p style={styles.sub}>
          {trip.length} scanned this trip
          {checkedOff > 0 ? ` · ${checkedOff} checked off` : ''} · {week.length} this week
        </p>
      </div>

      <DistributionBar d={d} />

      {haul?.read ? (
        <div style={styles.read}>
          <GoldThread />
          <p style={{ ...kristyVoice, ...styles.readText }}>{haul.read}</p>
        </div>
      ) : haul?.insightsGated ? (
        // Distribution + list are free; the weekly READ is a member insight (Step 11).
        <div style={styles.read}>
          <GoldThread />
          <p style={{ ...kristyVoice, ...styles.readText }}>The read on your week is a member insight.</p>
          {onUpgrade && (
            <button type="button" style={styles.unlock} onClick={onUpgrade}>
              Unlock my weekly read
            </button>
          )}
        </div>
      ) : null}

      {/* The read ends in a nudge; this is where the nudge becomes the next cart. */}
      <NextTrip carryForward={haul?.carryForward} onStartNextCart={onStartNextCart} />

      {trip.length > 0 && (
        <div style={styles.section}>
          <div style={styles.sectionLabel}>This trip</div>
          <div style={styles.list}>
            {trip.map((s) => (
              <ItemRow key={s.id} scan={s} onAddOne={(one) => onAddToList?.([one])} />
            ))}
          </div>
        </div>
      )}

      {earlier.length > 0 && (
        <div style={styles.section}>
          <div style={styles.sectionLabel}>{trip.length > 0 ? 'Earlier this week' : 'This week'}</div>
          <div style={styles.list}>
            {earlier.map((s) => (
              <ItemRow key={s.id} scan={s} onAddOne={(one) => onAddToList?.([one])} />
            ))}
          </div>
        </div>
      )}

      <div style={styles.actions}>
        <ActionButton label="Add all swaps to the cart" doneLabel="Added ✓" primary onClick={() => onAddToList?.()} />
        <ActionButton label="Share haul" onClick={onShareHaul} />
      </div>

      <div style={styles.footRow}>
        {onOpenCart && (
          <button type="button" style={styles.ask} onClick={onOpenCart}>
            Back to my cart
          </button>
        )}
        {onAsk && (
          <button type="button" style={styles.ask} onClick={onAsk}>
            Ask Kristy about this haul
          </button>
        )}
      </div>
    </div>
  );
}

const styles = {
  wrap: { maxWidth: 480, margin: '0 auto', width: '100%', boxSizing: 'border-box', padding: '20px 18px 28px', display: 'flex', flexDirection: 'column', gap: 18 },
  head: { display: 'flex', flexDirection: 'column', gap: 4 },
  title: { ...kristyDisplay, margin: 0, fontSize: 26, color: colors.ink },
  sub: { margin: 0, fontFamily: fonts.ui, fontSize: 13.5, color: colors.textMuted },

  bar: { display: 'flex', width: '100%', height: 14, borderRadius: 999, overflow: 'hidden', background: colors.surface2, border: 'none' },
  seg: { height: '100%' },
  legend: { display: 'flex', gap: 16, marginTop: 10, flexWrap: 'wrap' },
  legendItem: { display: 'flex', alignItems: 'center', gap: 6 },
  dot: { width: 9, height: 9, borderRadius: '50%', flex: '0 0 auto' },
  legendLabel: { fontFamily: fonts.ui, fontSize: 12.5, color: colors.textMuted },
  legendCount: { fontFamily: fonts.mono, fontSize: 12.5, color: colors.textPrimary, fontWeight: 600 },

  read: { display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-start' },
  readText: { margin: 0, fontSize: 17, lineHeight: 1.5, color: colors.textPrimary },
  unlock: { marginTop: 2, padding: '10px 18px', borderRadius: radii.button, border: `0.5px solid ${colors.hairline}`, background: 'transparent', color: colors.inkBody, fontFamily: fonts.ui, fontWeight: 700, fontSize: 14, cursor: 'pointer' },

  /* ── Carry-forward into next week's cart ── */
  cf: {
    display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'stretch',
    padding: '16px 16px 18px', borderRadius: 16,
    border: `1px solid ${colors.borderGold}`, background: colors.goldTint9,
  },
  cfTitle: { ...kristyVoice, margin: 0, fontSize: 19, lineHeight: 1.35, color: colors.ink },
  cfGroup: { display: 'flex', flexDirection: 'column', gap: 7 },
  cfLabel: { fontFamily: fonts.ui, fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: colors.textMuted },
  cfHint: { fontWeight: 500, letterSpacing: 0, textTransform: 'none', color: colors.textMuted },
  cfChips: { display: 'flex', flexWrap: 'wrap', gap: 7 },
  cfChip: {
    padding: '8px 12px', borderRadius: 999, cursor: 'pointer',
    border: `1px solid ${colors.border}`, background: 'transparent',
    color: colors.textMuted, fontFamily: fonts.ui, fontSize: 13, fontWeight: 600,
  },
  cfChipOn: { borderColor: colors.accentGold, background: colors.surface, color: colors.textPrimary },

  section: { display: 'flex', flexDirection: 'column', gap: 8 },
  sectionLabel: { fontFamily: fonts.ui, fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: colors.textMuted },
  list: { display: 'flex', flexDirection: 'column', gap: 8 },
  row: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '13px 15px', borderRadius: 12, border: 'none', background: colors.surface, boxShadow: `inset 0 1px 0 ${colors.edgeHighlight}, ${colors.shadowCard}` },
  rowName: { flex: 1, minWidth: 0, fontFamily: fonts.ui, fontSize: 14.5, color: colors.textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  rowRight: { flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: 8 },
  rowAdd: {
    flex: '0 0 auto', minHeight: 32, padding: '6px 11px', borderRadius: 999,
    border: `1px solid ${colors.borderGold}`, background: colors.goldTint9, color: colors.accentGold,
    fontFamily: fonts.ui, fontSize: 11.5, fontWeight: 700, whiteSpace: 'nowrap', cursor: 'pointer',
  },
  rowAdded: { borderColor: colors.accentMint, background: colors.mintTint9, color: colors.accentSeafoam, cursor: 'default' },
  footRow: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, flexWrap: 'wrap' },

  actions: { display: 'flex', gap: 10, marginTop: 4 },
  action: { flex: 1, padding: '13px 16px', borderRadius: 12, fontFamily: fonts.ui, fontWeight: 700, fontSize: 15, cursor: 'pointer' },
  // The haul's ONE filled action.
  actionPrimary: { border: 'none', background: colors.action, color: colors.actionInk },
  actionGhost: { border: 'none', background: colors.surface2, color: colors.textSecondary, fontWeight: 600 },

  ask: { alignSelf: 'center', marginTop: 4, padding: '8px 12px', background: 'transparent', border: 'none', color: colors.textSecondary, fontFamily: fonts.ui, fontSize: 13.5, cursor: 'pointer' },
  center: { display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 14, maxWidth: 380, margin: '0 auto', padding: '52px 24px 24px' },
  icon: { color: colors.accentGold, display: 'flex' },
  emptyLine: { margin: 0, fontFamily: fonts.ui, fontSize: 15, lineHeight: 1.55, color: colors.textMuted, maxWidth: 320 },
};
