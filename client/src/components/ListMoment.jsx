import { useEffect, useRef, useState } from 'react';
import { colors, fonts, kristyVoice } from '../lib/tokens.js';
import { ListIcon, CloseIcon } from './Icons.jsx';
import AmbientIsm from './AmbientIsm.jsx';
import { loadCachedList, fetchList, saveList, rebuildList, recordRemoved, recordAcceptedSwap, composeList } from '../lib/list.js';
import { trackEvent } from '../lib/analytics.js';
import PerimeterAsk from './PerimeterAsk.jsx';

/* ═══════════════════════ List — before the trip ═══════════════════════
   Kristy's goal-built shopping list. The SERVER is the source of truth now: it
   persists the list (survives a device change) and decides the premium capabilities
   (focus-aware items + haul swaps). Free users get a real, useful basic list plus a
   nudge naming what a membership adds — not a wall. The localStorage cache renders
   instantly while the authoritative list loads. Tokens only. */

const rid = () =>
  (typeof crypto !== 'undefined' && crypto.randomUUID && crypto.randomUUID()) ||
  `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;

// Walking order through the store: haul callouts, then the perimeter (produce →
// meat → dairy → bakery), then the center aisles (pantry, snacks), frozen last.
const SECTION_ORDER = ['From your haul', 'Produce', 'Meat & Seafood', 'Dairy & Eggs', 'Bakery', 'Pantry', 'Snacks', 'Frozen', 'Added'];
const CATEGORY_SECTION = {
  Produce: 'Produce', Fiber: 'Produce',
  Protein: 'Meat & Seafood', 'Meat & Seafood': 'Meat & Seafood',
  Fermented: 'Dairy & Eggs', 'Dairy & Eggs': 'Dairy & Eggs',
  Bakery: 'Bakery',
  Staples: 'Pantry', Pantry: 'Pantry',
  Snacks: 'Snacks',
  Frozen: 'Frozen',
  'From your haul': 'From your haul',
  Added: 'Added',
};
function sectionOf(it) {
  if (it.source === 'swap' || it.category === 'From your haul') return 'From your haul';
  const n = (it.name || '').toLowerCase();
  if (/\b(egg|eggs|yogurt|milk|cheese|kefir|butter|ghee|cottage)\b/.test(n)) return 'Dairy & Eggs';
  if (/\bfrozen\b/.test(n)) return 'Frozen';
  return CATEGORY_SECTION[it.category] || it.category || 'Added';
}
function groupBySection(items) {
  const map = new Map();
  for (const it of items) {
    const sec = sectionOf(it);
    if (!map.has(sec)) map.set(sec, []);
    map.get(sec).push(it);
  }
  const rank = (s) => {
    const i = SECTION_ORDER.indexOf(s);
    return i < 0 ? SECTION_ORDER.length : i;
  };
  return [...map.entries()]
    .map(([category, list]) => ({ category, items: list }))
    .sort((a, b) => rank(a.category) - rank(b.category));
}

export default function ListMoment({ goal, nonNegotiables = [], focuses = [], constraints = [], onSetGoal, onAsk, premium: premiumProp = false, onUpgrade }) {
  const [list, setList] = useState(() => loadCachedList());
  const [premium, setPremium] = useState(premiumProp);
  const [loading, setLoading] = useState(() => loadCachedList() == null);
  const [input, setInput] = useState('');
  const [buildText, setBuildText] = useState('');
  const [busy, setBusy] = useState(''); // 'edit' | 'build' while composing
  const [note, setNote] = useState(''); // Kristy's one-line summary after a compose
  const [composeGated, setComposeGated] = useState(false); // free hit the NL editor
  const [asking, setAsking] = useState(null); // a list item being asked about (the Perimeter loop)
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

  // The conversational editor: natural language → a list edit ("add taco night",
  // "swap the rice for something faster", "build me three dinners for four"). PREMIUM;
  // a free user gets an in-card nudge (never a modal). composeList persists the cache;
  // we set it locally and show Kristy's one-line summary.
  async function runCompose(instruction, mode) {
    const text = String(instruction || '').trim();
    if (!text || busy) return;
    if (!premium) {
      setComposeGated(true);
      return;
    }
    setBusy(mode);
    setNote('');
    setComposeGated(false);
    const res = await composeList({ instruction: text, mode, prefs: { goal, nonNegotiables, focuses, constraints } });
    setBusy('');
    if (res?.gated) {
      setComposeGated(true);
      return;
    }
    if (res?.list) {
      setList(res.list);
      if (res.summary) setNote(res.summary);
      trackEvent('list-compose', { mode });
      if (mode === 'edit') setInput('');
      else setBuildText('');
    }
  }

  // The bottom input: premium composes from natural language; free does a plain add.
  const submitBottom = () => {
    if (premium) runCompose(input, 'edit');
    else add();
  };

  // The Perimeter loop: a refinement from "Ask Kristy" rewrites the item in place
  // (e.g. "Olive oil" → "Fresh, dark-bottle extra-virgin olive oil"), then persists.
  const refineItem = (id, newName) => {
    if (!newName) return;
    persist({ ...list, items: list.items.map((i) => (i.id === id ? { ...i, name: newName, refined: true } : i)) });
    trackEvent('perimeter-refine', { item: newName });
    setAsking(null);
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
        <p style={{ ...kristyVoice, ...styles.intro }}>{loading ? 'Pulling your list together…' : "Tell me what you're shopping for and I'll build around it."}</p>
        {onSetGoal && (
          <button type="button" style={styles.setGoal} onClick={onSetGoal}>
            Tell me what you&rsquo;re shopping for →
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

  // Group by STORE SECTION in walking order — perimeter first, frozen last — so the
  // list reads like an authored route through the store. Categories (Protein/Staples/…)
  // and compose sections both map onto the same section set; dairy/eggs/frozen are
  // pulled out by item name so they sit where you'd actually walk to them.
  const groups = groupBySection(list.items);

  return (
    <div style={styles.wrap}>
      <div style={styles.head}>
        <span style={styles.icon}><ListIcon size={24} /></span>
        <h1 style={styles.title}>Your list</h1>
      </div>
      <p style={{ ...kristyVoice, ...styles.intro }}>{list.intro}</p>
      {!goal && onSetGoal && (
        <button type="button" style={styles.setGoal} onClick={onSetGoal}>
          Tell me what you&rsquo;re shopping for and I&rsquo;ll build around it →
        </button>
      )}

      {/* Kristy's one-line summary of the change she just made (conversational edit). */}
      {note && <p style={{ ...kristyVoice, ...styles.note }}>{note}</p>}

      {/* Build me a cart — one sentence → a complete tailored list (premium). */}
      <form
        onSubmit={(e) => { e.preventDefault(); premium ? runCompose(buildText, 'build') : setComposeGated(true); }}
        style={styles.buildRow}
      >
        <input
          style={styles.buildInput}
          value={buildText}
          onChange={(e) => setBuildText(e.target.value)}
          placeholder="Build me a cart for… three high-protein dinners for four"
          aria-label="Build me a cart"
        />
        <button type="submit" style={styles.buildBtn} disabled={busy === 'build'}>
          {busy === 'build' ? '…' : 'Build'}
        </button>
      </form>

      {/* The conversational editor is premium — free hits a Kristy-voiced, in-card nudge. */}
      {composeGated && (
        <div style={styles.nudge}>
          <span style={{ ...kristyVoice, ...styles.nudgeLine }}>
            Building your cart from a sentence &mdash; &ldquo;add taco night,&rdquo; &ldquo;three dinners for four&rdquo; &mdash; is part of a membership. You can still add items by hand.
          </span>
          {onUpgrade && (
            <button type="button" style={styles.nudgeCta} onClick={onUpgrade}>
              See what membership adds
            </button>
          )}
        </div>
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
                  {/* Template rows carry no tag — "Kristy added" on every row read as
                      personalization when it meant the opposite. Only a genuine
                      distinction is labeled: what YOU added, and what came from a haul. */}
                  {it.source === 'user' ? (
                    <span style={styles.tagUser}>You added</span>
                  ) : it.source === 'swap' ? (
                    <span style={styles.tag}>From your haul</span>
                  ) : null}
                </span>
                {/* Every shopping row gets "Ask Kristy" — the Perimeter loop. Swaps are
                    callouts, not rows, so they don't. */}
                {it.source !== 'swap' && (
                  <button type="button" style={styles.askItem} onClick={() => setAsking(it)} aria-label={`Ask Kristy about ${it.name}`}>
                    Ask
                  </button>
                )}
                <button type="button" style={styles.remove} onClick={() => remove(it.id)} aria-label={`Remove ${it.name}`}>
                  <CloseIcon size={16} />
                </button>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* The persistent conversational input — premium speaks to Kristy in natural
          language ("add taco night", "swap the rice for something faster"); free does
          a plain add. Chat that lives inside the artifact, not a separate room. */}
      <div style={styles.addRow}>
        <input
          style={styles.addInput}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submitBottom()}
          placeholder={premium ? "Tell me what else you need — 'add taco night', 'swap the rice'…" : 'Add an item'}
          aria-label={premium ? 'Tell Kristy what else you need' : 'Add an item'}
        />
        <button type="button" style={styles.addBtn} onClick={submitBottom} disabled={busy === 'edit'}>
          {busy === 'edit' ? '…' : premium ? 'Send' : 'Add'}
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

      {asking && (
        <PerimeterAsk
          initialQuestion={asking.name}
          autoAsk
          allowRefine
          prefs={{ goal, focuses, hardLines: nonNegotiables, constraints }}
          onRefine={(newName) => refineItem(asking.id, newName)}
          onUpgrade={onUpgrade}
          onClose={() => setAsking(null)}
        />
      )}
    </div>
  );
}

const styles = {
  wrap: { maxWidth: 480, margin: '0 auto', width: '100%', boxSizing: 'border-box', padding: '20px 18px 28px', display: 'flex', flexDirection: 'column', gap: 14 },
  head: { display: 'flex', alignItems: 'center', gap: 10 },
  icon: { color: colors.accentGold, display: 'flex' },
  title: { ...kristyVoice, margin: 0, fontSize: 24, color: colors.textPrimary },
  intro: { margin: 0, fontSize: 16, lineHeight: 1.5, color: colors.textPrimary },
  note: { margin: '2px 0 0', fontSize: 15, lineHeight: 1.5, color: colors.textSecondary },
  setGoal: { alignSelf: 'flex-start', padding: 0, background: 'transparent', border: 'none', color: colors.textSecondary, fontFamily: fonts.ui, fontSize: 13.5, cursor: 'pointer' },

  // Build-me-a-cart — a prominent gold-outlined prompt, one sentence → a full list.
  buildRow: { display: 'flex', gap: 8, marginTop: 2 },
  buildInput: { flex: 1, minWidth: 0, padding: '12px 14px', borderRadius: 12, border: `1px solid ${colors.borderGold}`, background: colors.goldTint9, color: colors.textPrimary, fontFamily: fonts.ui, fontSize: 14.5, outline: 'none' },
  buildBtn: { flex: '0 0 auto', padding: '12px 18px', borderRadius: 12, border: 'none', background: colors.accentGold, color: colors.bgDeep, fontFamily: fonts.ui, fontWeight: 700, fontSize: 14, cursor: 'pointer' },
  tagUser: { fontFamily: fonts.ui, fontSize: 10.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: colors.textMuted },

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
  askItem: { flex: '0 0 auto', padding: '5px 10px', borderRadius: 999, border: `1px solid ${colors.border}`, background: 'transparent', color: colors.textSecondary, fontFamily: fonts.ui, fontSize: 12, fontWeight: 600, cursor: 'pointer' },
  remove: { flex: '0 0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 8, border: 'none', background: 'transparent', color: colors.textMuted, cursor: 'pointer' },

  addRow: { display: 'flex', gap: 8, marginTop: 4 },
  addInput: { flex: 1, padding: '11px 14px', borderRadius: 11, border: `1px solid ${colors.border}`, background: colors.surface, color: colors.textPrimary, fontFamily: fonts.ui, fontSize: 15, outline: 'none' },
  addBtn: { flex: '0 0 auto', padding: '11px 18px', borderRadius: 11, border: `1px solid ${colors.borderGold}`, background: 'transparent', color: colors.textSecondary, fontFamily: fonts.ui, fontWeight: 600, fontSize: 15, cursor: 'pointer' },
  footRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 4, flexWrap: 'wrap' },
  rebuild: { alignSelf: 'flex-start', padding: '10px 18px', borderRadius: 999, border: 'none', background: colors.accentGold, color: colors.bgDeep, fontFamily: fonts.ui, fontWeight: 700, fontSize: 14, cursor: 'pointer' },
  ask: { padding: '8px 12px', background: 'transparent', border: 'none', color: colors.textSecondary, fontFamily: fonts.ui, fontSize: 13.5, cursor: 'pointer' },
};
