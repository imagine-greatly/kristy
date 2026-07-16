import { useState } from 'react';
import { colors, fonts, kristyVoice } from '../lib/tokens.js';
import { ListIcon, CloseIcon } from './Icons.jsx';
import AmbientIsm from './AmbientIsm.jsx';
import { loadList, saveList, rebuildList, recordRemoved, recordAcceptedSwap } from '../lib/list.js';

/* ═══════════════════════ List — before the trip ═══════════════════════
   Kristy's goal-built shopping list: a grouped, editable checklist she generates
   from your goal (minus your non-negotiables) plus the items you pushed from a
   haul. Editing feeds the learning signals — remove an item and it stops coming
   back; check a swap and that's a positive signal for later scoring. Tokens only. */

const rid = () =>
  (typeof crypto !== 'undefined' && crypto.randomUUID && crypto.randomUUID()) ||
  `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;

export default function ListMoment({ goal, nonNegotiables = [], onSetGoal, onAsk, premium = true, onUpgrade }) {
  const [list, setList] = useState(() => loadList({ goal, nonNegotiables }));
  const [input, setInput] = useState('');

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

  const rebuild = () => persist(rebuildList({ goal, nonNegotiables }));

  // The goal-built List is a member benefit (Step 11). Free users get the pitch,
  // named in Kristy's voice, not a wall.
  if (premium === false) {
    return (
      <div style={styles.gated}>
        <span style={styles.icon}><ListIcon size={26} /></span>
        <h1 style={styles.title}>Your list</h1>
        <p style={{ ...kristyVoice, ...styles.gatedLine }}>
          Give me your goal and I&rsquo;ll build the week&rsquo;s list around it — the right proteins, your swaps, minus your hard lines. That part&rsquo;s a membership perk.
        </p>
        {onUpgrade && (
          <button type="button" style={styles.gatedCta} onClick={onUpgrade}>
            Unlock my list
          </button>
        )}
        <AmbientIsm style={{ marginTop: 12 }} />
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

      <div style={styles.groups}>
        {groups.map((g) => (
          <div key={g.category} style={styles.group}>
            <div style={styles.groupLabel}>{g.category}</div>
            {g.items.map((it) => (
              <div key={it.id} style={styles.item}>
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
                <span style={{ ...styles.itemName, ...(it.checked ? styles.itemChecked : null) }}>{it.name}</span>
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

  groups: { display: 'flex', flexDirection: 'column', gap: 16, marginTop: 4 },
  group: { display: 'flex', flexDirection: 'column', gap: 8 },
  groupLabel: { fontFamily: fonts.ui, fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: colors.textMuted },
  item: { display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 11, border: `1px solid ${colors.border}`, background: colors.surface },
  checkbox: { flex: '0 0 auto', width: 24, height: 24, borderRadius: 7, border: '1.5px solid', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, cursor: 'pointer' },
  itemName: { flex: 1, fontFamily: fonts.ui, fontSize: 15, color: colors.textPrimary },
  itemChecked: { color: colors.textMuted, textDecoration: 'line-through' },
  remove: { flex: '0 0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 8, border: 'none', background: 'transparent', color: colors.textMuted, cursor: 'pointer' },

  addRow: { display: 'flex', gap: 8, marginTop: 4 },
  addInput: { flex: 1, padding: '11px 14px', borderRadius: 11, border: `1px solid ${colors.border}`, background: colors.surface, color: colors.textPrimary, fontFamily: fonts.ui, fontSize: 15, outline: 'none' },
  addBtn: { flex: '0 0 auto', padding: '11px 18px', borderRadius: 11, border: `1px solid ${colors.borderGold}`, background: 'transparent', color: colors.textSecondary, fontFamily: fonts.ui, fontWeight: 600, fontSize: 15, cursor: 'pointer' },
  footRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 4, flexWrap: 'wrap' },
  rebuild: { padding: '10px 18px', borderRadius: 999, border: 'none', background: colors.accentGold, color: colors.bgDeep, fontFamily: fonts.ui, fontWeight: 700, fontSize: 14, cursor: 'pointer' },
  ask: { padding: '8px 12px', background: 'transparent', border: 'none', color: colors.textSecondary, fontFamily: fonts.ui, fontSize: 13.5, cursor: 'pointer' },

  gated: { display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 14, maxWidth: 380, margin: '0 auto', padding: '52px 24px 24px' },
  gatedLine: { margin: 0, fontSize: 18, lineHeight: 1.5, color: colors.textPrimary, maxWidth: 330 },
  gatedCta: { marginTop: 4, padding: '12px 24px', borderRadius: 999, border: 'none', background: colors.accentGold, color: colors.bgDeep, fontFamily: fonts.ui, fontWeight: 700, fontSize: 15, cursor: 'pointer' },
};
