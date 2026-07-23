import { useEffect, useRef, useState } from 'react';
import { colors, fonts, kristyVoice } from '../lib/tokens.js';
import { ListIcon, CloseIcon } from './Icons.jsx';
import AmbientIsm from './AmbientIsm.jsx';
import { loadCachedList, fetchList, saveList, rebuildList, recordRemoved, recordAcceptedSwap } from '../lib/list.js';
import { trackEvent } from '../lib/analytics.js';

/* ═══════════════════════ List — before the trip ═══════════════════════
   Kristy's goal-built shopping list. The SERVER is the source of truth now: it
   persists the list (survives a device change) and decides the premium capabilities
   (focus-aware items + haul swaps). Free users get a real, useful basic list plus a
   nudge naming what a membership adds — not a wall. The localStorage cache renders
   instantly while the authoritative list loads. Tokens only. */

const rid = () =>
  (typeof crypto !== 'undefined' && crypto.randomUUID && crypto.randomUUID()) ||
  `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;

export default function ListMoment({ goal, nonNegotiables = [], focuses = [], constraints = [], onSetGoal, onAsk, premium: premiumProp = false, onUpgrade }) {
  const [list, setList] = useState(() => loadCachedList());
  const [premium, setPremium] = useState(premiumProp);
  const [loading, setLoading] = useState(() => loadCachedList() == null);
  const [input, setInput] = useState('');
  const firstBuild = useRef(loadCachedList() == null);

  // Load the authoritative list from the server; the cache renders instantly meanwhile.
  useEffect(() => {
    let alive = true;
    (async () => {
      const { list: fresh, premium: prem } = await fetchList({ goal, nonNegotiables, focuses, constraints });
      if (!alive) return;
      if (fresh) setList(fresh);
      setPremium(prem);
      setLoading(false);
      if (firstBuild.current && fresh) trackEvent('list-build', { goal, source: 'auto' });
    })();
    return () => {
      alive = false;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const persist = (next) => {
    setList(next);
    saveList(next);
  };

  const toggle = (id) => {
    const item = list.items.find((i) => i.id === id);
    if (item && !item.checked && item.source === 'swap') recordAcceptedSwap(item.productName);
    persist({ ...list, items: list.items.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i)) });
  };

  const remove = (id) => {
    const item = list.items.find((i) => i.id === id);
    if (item && item.source === 'template') recordRemoved(item.name); // learn: stop suggesting
    persist({ ...list, items: list.items.filter((i) => i.id !== id) });
  };

  const add = () => {
    const name = input.trim();
    if (!name) return;
    persist({ ...list, items: [...list.items, { id: rid(), name, category: 'Added', checked: false, source: 'user' }] });
    setInput('');
  };

  const rebuild = async () => {
    trackEvent('list-build', { goal, source: 'rebuild' });
    const { list: fresh, premium: prem } = await rebuildList({ goal, nonNegotiables, focuses, constraints });
    if (fresh) setList(fresh);
    setPremium(prem);
  };

  // No list yet (fresh device, still loading, or nothing generated) → a light
  // placeholder with a way to build one. Never a paywall — free gets a basic list.
  if (!list || !Array.isArray(list.items)) {
    return (
      <div style={styles.wrap}>
        <div style={styles.head}>
          <span style={styles.icon}><ListIcon size={24} /></span>
          <h1 style={styles.title}>Your list</h1>
        </div>
        <p style={{ ...kristyVoice, ...styles.intro }}>{loading ? 'Pulling your list together…' : "Let's build your list."}</p>
        {!goal && onSetGoal && (
          <button type="button" style={styles.setGoal} onClick={onSetGoal}>
            Set a goal and I&rsquo;ll tailor this →
          </button>
        )}
        {!loading && (
          <button type="button" style={styles.rebuild} onClick={rebuild}>
            Build my list
          </button>
        )}
      </div>
    );
  }

  // Group by category, preserving first-seen order (swaps + haul items lead).
  const groups = [];
  const idx = new Map();
  for (const it of list.items) {
    if (!idx.has(it.category)) {
      idx.set(it.category, groups.length);
      groups.push({ category: it.category, items: [] });
    }
    groups[idx.get(it.category)].items.push(it);
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.head}>
        <span style={styles.icon}><ListIcon size={24} /></span>
        <h1 style={styles.title}>Your list</h1>
      </div>
      <p style={{ ...kristyVoice, ...styles.intro }}>{list.intro}</p>
      {!goal && onSetGoal && (
        <button type="button" style={styles.setGoal} onClick={onSetGoal}>
          Set a goal and I&rsquo;ll tailor this →
        </button>
      )}

      {/* Free tier still gets a real list — the nudge names what a membership ADDS
          (focus-aware items + haul swaps), it doesn't wall the list off. */}
      {premium === false && (
        <div style={styles.nudge}>
          <span style={{ ...kristyVoice, ...styles.nudgeLine }}>
            This is your basic list. With a membership I shape it around your focuses and fold in the swaps from your haul.
          </span>
          {onUpgrade && (
            <button type="button" style={styles.nudgeCta} onClick={onUpgrade}>
              Unlock the full list
            </button>
          )}
        </div>
      )}

      <div style={styles.groups}>
        {groups.map((g) => (
          <div key={g.category} style={styles.group}>
            <div style={styles.groupLabel}>{g.category}</div>
            {g.items.map((it) => (
              // A swap carried over from the haul isn't a shopping row — it's
              // Kristy telling you what to replace. Styled as her callout (gold
              // rule, her voice) so it reads as a note, not another checkbox item.
              <div key={it.id} style={{ ...styles.item, ...(it.source === 'swap' ? styles.itemSwap : null) }}>
                <button
                  type="button"
                  onClick={() => toggle(it.id)}
                  aria-pressed={it.checked}
                  aria-label={it.checked ? `Uncheck ${it.name}` : `Check ${it.name}`}
                  style={{
                    ...styles.checkbox,
                    borderColor: it.checked ? colors.accentGold : colors.border,
                    background: it.checked ? colors.accentGold : 'transparent',
                    color: colors.bgDeep,
                  }}
                >
                  {it.checked ? '✓' : ''}
                </button>
                <span style={styles.itemBody}>
                  <span
                    style={{
                      ...styles.itemName,
                      ...(it.source === 'swap' ? styles.itemNameSwap : null),
                      ...(it.checked ? styles.itemChecked : null),
                    }}
                  >
                    {it.name}
                  </span>
                  {it.source !== 'user' && (
                    <span style={styles.tag}>{it.source === 'swap' ? 'From your haul' : 'Kristy added'}</span>
                  )}
                </span>
                <button type="button" style={styles.remove} onClick={() => remove(it.id)} aria-label={`Remove ${it.name}`}>
                  <CloseIcon size={16} />
                </button>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div style={styles.addRow}>
        <input
          style={styles.addInput}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
          placeholder="Add an item"
          aria-label="Add an item"
        />
        <button type="button" style={styles.addBtn} onClick={add}>
          Add
        </button>
      </div>

      <div style={styles.footRow}>
        <button type="button" style={styles.rebuild} onClick={rebuild}>
          Rebuild for my goal
        </button>
        {onAsk && (
          <button type="button" style={styles.ask} onClick={onAsk}>
            Ask Kristy about this list
          </button>
        )}
      </div>

      <AmbientIsm style={{ marginTop: 14 }} />
    </div>
  );
}

const styles = {
  wrap: { maxWidth: 480, margin: '0 auto', width: '100%', boxSizing: 'border-box', padding: '20px 18px 28px', display: 'flex', flexDirection: 'column', gap: 14 },
  head: { display: 'flex', alignItems: 'center', gap: 10 },
  icon: { color: colors.accentGold, display: 'flex' },
  title: { ...kristyVoice, margin: 0, fontSize: 24, color: colors.textPrimary },
  intro: { margin: 0, fontSize: 16, lineHeight: 1.5, color: colors.textPrimary },
  setGoal: { alignSelf: 'flex-start', padding: 0, background: 'transparent', border: 'none', color: colors.textSecondary, fontFamily: fonts.ui, fontSize: 13.5, cursor: 'pointer' },

  // Free-tier capability nudge (not a wall) — her voice + one gold CTA.
  nudge: { display: 'flex', flexDirection: 'column', gap: 10, padding: '14px 16px', borderRadius: 12, border: `1px solid ${colors.borderGold}`, background: colors.goldTint9 },
  nudgeLine: { fontSize: 15, lineHeight: 1.5, color: colors.textPrimary },
  nudgeCta: { alignSelf: 'flex-start', padding: '9px 16px', borderRadius: 999, border: 'none', background: colors.accentGold, color: colors.bgDeep, fontFamily: fonts.ui, fontWeight: 700, fontSize: 13.5, cursor: 'pointer' },

  groups: { display: 'flex', flexDirection: 'column', gap: 16, marginTop: 4 },
  group: { display: 'flex', flexDirection: 'column', gap: 8 },
  groupLabel: { fontFamily: fonts.ui, fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: colors.textMuted },
  item: { display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 11, border: `1px solid ${colors.border}`, background: colors.surface },
  // Her callout: gold rule down the side, gold-tinted ground.
  itemSwap: { borderColor: colors.borderGold, borderLeft: `3px solid ${colors.accentGold}`, background: colors.goldTint9 },
  itemBody: { flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 },
  itemNameSwap: { ...kristyVoice, fontSize: 15.5, color: colors.textPrimary },
  tag: { fontFamily: fonts.ui, fontSize: 10.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: colors.accentGoldMuted },
  checkbox: { flex: '0 0 auto', width: 24, height: 24, borderRadius: 7, border: '1.5px solid', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, cursor: 'pointer' },
  itemName: { fontFamily: fonts.ui, fontSize: 15, color: colors.textPrimary, overflowWrap: 'anywhere' },
  itemChecked: { color: colors.textMuted, textDecoration: 'line-through' },
  remove: { flex: '0 0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 8, border: 'none', background: 'transparent', color: colors.textMuted, cursor: 'pointer' },

  addRow: { display: 'flex', gap: 8, marginTop: 4 },
  addInput: { flex: 1, padding: '11px 14px', borderRadius: 11, border: `1px solid ${colors.border}`, background: colors.surface, color: colors.textPrimary, fontFamily: fonts.ui, fontSize: 15, outline: 'none' },
  addBtn: { flex: '0 0 auto', padding: '11px 18px', borderRadius: 11, border: `1px solid ${colors.borderGold}`, background: 'transparent', color: colors.textSecondary, fontFamily: fonts.ui, fontWeight: 600, fontSize: 15, cursor: 'pointer' },
  footRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 4, flexWrap: 'wrap' },
  rebuild: { alignSelf: 'flex-start', padding: '10px 18px', borderRadius: 999, border: 'none', background: colors.accentGold, color: colors.bgDeep, fontFamily: fonts.ui, fontWeight: 700, fontSize: 14, cursor: 'pointer' },
  ask: { padding: '8px 12px', background: 'transparent', border: 'none', color: colors.textSecondary, fontFamily: fonts.ui, fontSize: 13.5, cursor: 'pointer' },
};
