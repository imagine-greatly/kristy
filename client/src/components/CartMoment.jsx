import { useState } from 'react';
import { colors, fonts, kristyVoice } from '../lib/tokens.js';
import { BarcodeIcon, CloseIcon } from './Icons.jsx';
import AmbientIsm from './AmbientIsm.jsx';
import PerimeterAnswer from './PerimeterAnswer.jsx';
import { askPerimeter } from '../lib/perimeter.js';

/* ═══════════════════════ The cart — the home surface ═══════════════════════
   The trip, as a structured object you act on by touch. This is the dashboard: what
   to get, what's checked, what Kristy flagged, what she'd swap. Everything a normal
   trip needs is a TAP — check, swap, ask, remove, add, scan. The docked composer
   below is for the messy stuff taps can't express; nothing here requires it.

   Kristy's coaching lives IN the object: her blend intro at the top, a verdict chip
   on anything scanned, her haul callouts as gold-ruled rows, and — on tap — the
   perimeter reference card (the "what to look for" checklist) inline under the item.
   A shopper scrolling the cart absorbs her read without opening chat.

   Tokens only; her spoken lines are kristyVoice, everything factual is Inter. */

// Walking order through the store: the trip's live rows first (her haul callouts, then
// what you've scanned), then the perimeter (produce → meat → dairy → bakery), the
// center aisles (pantry, snacks), and frozen last.
const SECTION_ORDER = [
  'From your haul', 'Scanned this trip', 'Produce', 'Meat & Seafood',
  'Dairy & Eggs', 'Bakery', 'Pantry', 'Snacks', 'Frozen', 'Added',
];
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
  if (it.source === 'scan') return 'Scanned this trip';
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

/* ───────── Her read on a row, at a glance ─────────
   Only a genuine distinction is labelled. A template row carries no tag — tagging
   every row "Kristy added" read as personalization when it meant the opposite. */
const TIER_FLAG = {
  approved: { label: 'Approved', fg: colors.accentSeafoam, bd: colors.accentMint, bg: colors.mintTint9 },
  approved_with_note: { label: 'With a note', fg: colors.accentGold, bd: colors.gold30, bg: colors.goldTint9 },
  use_with_intention: { label: 'With intention', fg: colors.accentGold, bd: colors.gold30, bg: colors.goldTint9 },
  swap_recommended: { label: "She'd swap this", fg: colors.error, bd: colors.dangerBorder, bg: colors.dangerTint },
  skip: { label: "She'd skip this", fg: colors.error, bd: colors.dangerBorder, bg: colors.dangerTint },
};
const flagged = (it) => it.source === 'swap' || it.tier === 'swap_recommended' || it.tier === 'skip';

function ProgressBar({ progress }) {
  return (
    <div style={styles.progressWrap}>
      <div style={styles.progressTrack}>
        <div style={{ ...styles.progressFill, width: `${progress.pct}%` }} />
      </div>
      <span style={styles.progressLabel}>
        {progress.total === 0
          ? 'Nothing in the cart yet'
          : progress.complete
            ? `All ${progress.total} in the cart`
            : `${progress.checked} of ${progress.total} in the cart`}
      </span>
    </div>
  );
}

/* ───────── One row of the cart ─────────
   Collapsed: checkbox · name · state. Tapping the body opens the action drawer —
   guidance, swap, remove — plus her inline reference card once loaded. */
function CartRow({ item, open, guidance, onToggle, onOpen, onGuidance, onRemove, onRefine, onUpgrade }) {
  const isSwapCallout = item.source === 'swap';
  const flag = item.tier ? TIER_FLAG[item.tier] : null;
  const needsBetterPick = flagged(item);

  return (
    <div style={{ ...styles.item, ...(isSwapCallout ? styles.itemSwap : null), ...(open ? styles.itemOpen : null) }}>
      <div style={styles.itemHead}>
        <button
          type="button"
          onClick={() => onToggle(item.id)}
          aria-pressed={!!item.checked}
          aria-label={item.checked ? `Uncheck ${item.name}` : `Check off ${item.name}`}
          style={{
            ...styles.checkbox,
            borderColor: item.checked ? colors.accentGold : colors.border,
            background: item.checked ? colors.accentGold : 'transparent',
            color: colors.bgDeep,
          }}
        >
          {item.checked ? '✓' : ''}
        </button>

        {/* The row body is the tap target for the actions — no sentence, no sheet. */}
        <button
          type="button"
          style={styles.itemBody}
          onClick={() => onOpen(open ? null : item.id)}
          aria-expanded={open}
          aria-label={`Actions for ${item.name}`}
        >
          <span
            style={{
              ...styles.itemName,
              ...(isSwapCallout ? styles.itemNameSwap : null),
              ...(item.checked && !isSwapCallout ? styles.itemChecked : null),
            }}
          >
            {item.name}
          </span>
          <span style={styles.itemMeta}>
            {item.source === 'user' && <span style={styles.tagUser}>You added</span>}
            {isSwapCallout && <span style={styles.tagGold}>From your haul</span>}
            {item.refined && <span style={styles.tagGold}>Kristy&rsquo;s pick</span>}
            {flag && (
              <span style={{ ...styles.flag, color: flag.fg, borderColor: flag.bd, background: flag.bg }}>
                {flag.label}
              </span>
            )}
          </span>
        </button>

        <span style={{ ...styles.chev, transform: open ? 'rotate(90deg)' : 'none' }} aria-hidden="true">›</span>
      </div>

      {open && (
        <div style={styles.drawer}>
          <div style={styles.drawerActions}>
            <button
              type="button"
              style={{ ...styles.drawerBtn, ...(needsBetterPick ? styles.drawerBtnGold : null) }}
              onClick={() => onGuidance(item)}
              disabled={guidance?.state === 'loading'}
            >
              {guidance?.state === 'loading'
                ? 'Reading…'
                : needsBetterPick
                  ? 'Find a better pick'
                  : 'What to look for'}
            </button>
            <button type="button" style={styles.drawerBtn} onClick={() => onToggle(item.id)}>
              {item.checked ? 'Uncheck' : 'Check off'}
            </button>
            <button type="button" style={styles.drawerBtnQuiet} onClick={() => onRemove(item.id)}>
              <CloseIcon size={14} />
              <span>Remove</span>
            </button>
          </div>

          {/* Her answer renders INSIDE the item — the coaching stays in the object. */}
          {guidance?.state === 'error' && (
            <p style={{ ...kristyVoice, ...styles.drawerErr }}>
              That didn&rsquo;t go through — try again in a moment.
            </p>
          )}
          {guidance?.state === 'done' && (
            <div style={styles.drawerAnswer}>
              <PerimeterAnswer
                resp={guidance.resp}
                compact
                allowRefine
                onRefine={(name) => onRefine(item.id, name)}
                onUpgrade={onUpgrade}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function CartMoment({
  cart,
  goals = [],
  goal,
  nonNegotiables = [],
  focuses = [],
  constraints = [],
  onSetGoal,
  onUpgrade,
  onScan,
  onAskAisle,
  onBuildCart,
}) {
  const [openId, setOpenId] = useState(null);
  const [guidance, setGuidance] = useState({}); // itemId → { state, resp }
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');

  const { list, premium, loading, note, gated, progress } = cart;

  // Kristy's read on one item, fetched from the perimeter KB and rendered inline.
  // Same claim-locked path as "Ask about the aisle" — just presented in the cart.
  async function loadGuidance(item) {
    setGuidance((g) => ({ ...g, [item.id]: { state: 'loading' } }));
    try {
      const resp = await askPerimeter({
        question: item.productName || item.name,
        goal,
        focuses,
        hardLines: nonNegotiables,
        constraints,
      });
      setGuidance((g) => ({ ...g, [item.id]: { state: 'done', resp } }));
    } catch {
      setGuidance((g) => ({ ...g, [item.id]: { state: 'error' } }));
    }
  }

  function submitAdd(e) {
    e?.preventDefault();
    const name = draft.trim();
    if (!name) return;
    cart.add(name);
    setDraft('');
  }

  /* ── Nothing to render yet (fresh device / still loading) ── */
  if (!list || !Array.isArray(list.items)) {
    return (
      <div style={styles.wrap}>
        <Header progress={progress} onScan={onScan} />
        <p style={{ ...kristyVoice, ...styles.intro }}>
          {loading ? 'Pulling your cart together…' : "Tell me what you're shopping for and I'll build it."}
        </p>
        {!loading && (
          <div style={styles.emptyActions}>
            {onBuildCart && (
              <button type="button" style={styles.buildBtn} onClick={onBuildCart}>
                Build me a cart for&hellip;
              </button>
            )}
            <button type="button" style={styles.ghostBtn} onClick={cart.rebuild}>
              Build from my preferences
            </button>
            {onSetGoal && (
              <button type="button" style={styles.linkBtn} onClick={onSetGoal}>
                Tell me what you&rsquo;re shopping for →
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  const groups = groupBySection(list.items);

  return (
    <div style={styles.wrap}>
      <Header progress={progress} onScan={onScan} />

      {/* Her one-line read on the whole cart — the blend, named in her voice. */}
      {list.intro && <p style={{ ...kristyVoice, ...styles.intro }}>{list.intro}</p>}
      {note && <p style={{ ...kristyVoice, ...styles.note }}>{note}</p>}

      {!goals.length && onSetGoal && (
        <button type="button" style={styles.linkBtn} onClick={onSetGoal}>
          Tell me what you&rsquo;re shopping for and I&rsquo;ll build around it →
        </button>
      )}

      {/* Two peer entry points for the parts of the store with no barcode and for a
          whole cart from one sentence. Both are taps; neither is a buried link. */}
      <div style={styles.peerRow}>
        {onBuildCart && (
          <button type="button" style={styles.peerGold} onClick={onBuildCart}>
            Build me a cart for&hellip;
          </button>
        )}
        {onAskAisle && (
          <button type="button" style={styles.peer} onClick={onAskAisle}>
            Ask about the aisle
          </button>
        )}
      </div>

      {gated && (
        <Nudge
          line="Building your cart from a sentence — “add taco night,” “three dinners for four” — is part of a membership. You can still add items by hand."
          cta="See what membership adds"
          onUpgrade={onUpgrade}
        />
      )}
      {premium === false && !gated && (
        <Nudge
          line="This is your basic cart. With a membership I shape it around your focuses and fold in the swaps from your haul."
          cta="Unlock the full cart"
          onUpgrade={onUpgrade}
        />
      )}

      <div style={styles.groups}>
        {groups.map((g) => (
          <div key={g.category} style={styles.group}>
            <div style={styles.groupLabel}>{g.category}</div>
            {g.items.map((it) => (
              <CartRow
                key={it.id}
                item={it}
                open={openId === it.id}
                guidance={guidance[it.id]}
                onToggle={cart.toggle}
                onOpen={setOpenId}
                onGuidance={loadGuidance}
                onRemove={(id) => {
                  cart.remove(id);
                  if (openId === id) setOpenId(null);
                }}
                onRefine={cart.refine}
                onUpgrade={onUpgrade}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Adding an item is a tap, then a name — never a sentence. */}
      {adding ? (
        <form style={styles.addRow} onSubmit={submitAdd}>
          <input
            autoFocus
            style={styles.addInput}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={() => !draft.trim() && setAdding(false)}
            placeholder="Item name"
            aria-label="Item name"
          />
          <button type="submit" style={styles.addBtn}>Add</button>
        </form>
      ) : (
        <button type="button" style={styles.addOpen} onClick={() => setAdding(true)}>
          + Add an item
        </button>
      )}

      <button type="button" style={styles.rebuild} onClick={cart.rebuild}>
        Rebuild for my preferences
      </button>

      <AmbientIsm style={{ marginTop: 14 }} />
    </div>
  );
}

function Header({ progress, onScan }) {
  return (
    <div style={styles.head}>
      <div style={styles.headTop}>
        <h1 style={styles.title}>Your cart</h1>
        {/* Scanning is reachable from the cart itself, not only the nav — in the
            aisle with a box in hand it's the fast reflex. */}
        {onScan && (
          <button type="button" style={styles.scanBtn} onClick={onScan} aria-label="Scan a product">
            <BarcodeIcon size={18} />
            <span>Scan</span>
          </button>
        )}
      </div>
      <ProgressBar progress={progress} />
    </div>
  );
}

function Nudge({ line, cta, onUpgrade }) {
  return (
    <div style={styles.nudge}>
      <span style={{ ...kristyVoice, ...styles.nudgeLine }}>{line}</span>
      {onUpgrade && (
        <button type="button" style={styles.nudgeCta} onClick={onUpgrade}>
          {cta}
        </button>
      )}
    </div>
  );
}

const styles = {
  wrap: { maxWidth: 520, margin: '0 auto', width: '100%', boxSizing: 'border-box', padding: '18px 18px 24px', display: 'flex', flexDirection: 'column', gap: 14 },

  head: { display: 'flex', flexDirection: 'column', gap: 10 },
  headTop: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  title: { ...kristyVoice, margin: 0, fontSize: 26, color: colors.textPrimary },
  scanBtn: {
    flex: '0 0 auto', display: 'inline-flex', alignItems: 'center', gap: 7, minHeight: 40,
    padding: '9px 15px', borderRadius: 999, border: 'none',
    background: colors.accentGold, color: colors.bgDeep,
    fontFamily: fonts.ui, fontSize: 13.5, fontWeight: 700, cursor: 'pointer',
  },

  progressWrap: { display: 'flex', flexDirection: 'column', gap: 6 },
  progressTrack: { width: '100%', height: 6, borderRadius: 999, background: colors.surface2, overflow: 'hidden' },
  progressFill: { height: '100%', background: colors.accentGold, borderRadius: 999, transition: 'width 0.25s ease' },
  progressLabel: { fontFamily: fonts.ui, fontSize: 12.5, color: colors.textMuted },

  intro: { margin: 0, fontSize: 16, lineHeight: 1.5, color: colors.textPrimary },
  note: { margin: '2px 0 0', fontSize: 15, lineHeight: 1.5, color: colors.textSecondary },
  linkBtn: { alignSelf: 'flex-start', padding: 0, background: 'transparent', border: 'none', color: colors.textSecondary, fontFamily: fonts.ui, fontSize: 13.5, cursor: 'pointer' },

  // The two peer entry points — a whole cart from a sentence, and the unlabeled aisle.
  peerRow: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  peerGold: {
    flex: '1 1 auto', minHeight: 44, padding: '11px 14px', borderRadius: 12,
    border: `1px solid ${colors.borderGold}`, background: colors.goldTint9,
    color: colors.accentGold, fontFamily: fonts.ui, fontSize: 13.5, fontWeight: 700, cursor: 'pointer',
  },
  peer: {
    flex: '1 1 auto', minHeight: 44, padding: '11px 14px', borderRadius: 12,
    border: `1px solid ${colors.border}`, background: colors.surface,
    color: colors.textSecondary, fontFamily: fonts.ui, fontSize: 13.5, fontWeight: 600, cursor: 'pointer',
  },

  nudge: { display: 'flex', flexDirection: 'column', gap: 10, padding: '14px 16px', borderRadius: 12, border: `1px solid ${colors.borderGold}`, background: colors.goldTint9 },
  nudgeLine: { fontSize: 15, lineHeight: 1.5, color: colors.textPrimary },
  nudgeCta: { alignSelf: 'flex-start', padding: '9px 16px', borderRadius: 999, border: 'none', background: colors.accentGold, color: colors.bgDeep, fontFamily: fonts.ui, fontWeight: 700, fontSize: 13.5, cursor: 'pointer' },

  groups: { display: 'flex', flexDirection: 'column', gap: 16, marginTop: 2 },
  group: { display: 'flex', flexDirection: 'column', gap: 8 },
  groupLabel: { fontFamily: fonts.ui, fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: colors.textMuted },

  item: { borderRadius: 12, border: `1px solid ${colors.border}`, background: colors.surface, overflow: 'hidden' },
  // Her callout: gold rule down the side, gold-tinted ground.
  itemSwap: { borderColor: colors.borderGold, borderLeft: `3px solid ${colors.accentGold}`, background: colors.goldTint9 },
  itemOpen: { borderColor: colors.gold30 },
  itemHead: { display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px' },
  checkbox: { flex: '0 0 auto', width: 26, height: 26, borderRadius: 7, border: '1.5px solid', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, cursor: 'pointer' },
  itemBody: { flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4, padding: '4px 0', background: 'transparent', border: 'none', textAlign: 'left', cursor: 'pointer' },
  itemName: { fontFamily: fonts.ui, fontSize: 15, color: colors.textPrimary, overflowWrap: 'anywhere' },
  itemNameSwap: { ...kristyVoice, fontSize: 15.5, color: colors.textPrimary },
  itemChecked: { color: colors.textMuted, textDecoration: 'line-through' },
  itemMeta: { display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  tagUser: { fontFamily: fonts.ui, fontSize: 10.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: colors.textMuted },
  tagGold: { fontFamily: fonts.ui, fontSize: 10.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: colors.accentGoldMuted },
  flag: { fontFamily: fonts.ui, fontSize: 10.5, fontWeight: 700, padding: '2px 8px', borderRadius: 999, border: '1px solid', whiteSpace: 'nowrap' },
  chev: { flex: '0 0 auto', color: colors.textMuted, fontSize: 18, lineHeight: 1, transition: 'transform 0.18s ease' },

  drawer: { display: 'flex', flexDirection: 'column', gap: 10, padding: '2px 12px 12px', borderTop: `1px solid ${colors.border}` },
  drawerActions: { display: 'flex', gap: 8, flexWrap: 'wrap', paddingTop: 10 },
  drawerBtn: {
    flex: '1 1 auto', minHeight: 40, padding: '9px 12px', borderRadius: 10,
    border: `1px solid ${colors.border}`, background: colors.surface2, color: colors.textPrimary,
    fontFamily: fonts.ui, fontSize: 13, fontWeight: 600, cursor: 'pointer',
  },
  drawerBtnGold: { borderColor: colors.borderGold, background: colors.goldTint9, color: colors.accentGold },
  drawerBtnQuiet: {
    flex: '0 0 auto', minHeight: 40, padding: '9px 12px', borderRadius: 10,
    display: 'inline-flex', alignItems: 'center', gap: 6,
    border: `1px solid ${colors.border}`, background: 'transparent', color: colors.textMuted,
    fontFamily: fonts.ui, fontSize: 13, fontWeight: 600, cursor: 'pointer',
  },
  drawerErr: { margin: 0, fontSize: 14.5, color: colors.textPrimary },
  drawerAnswer: { paddingTop: 2 },

  addOpen: {
    alignSelf: 'stretch', minHeight: 46, padding: '12px 14px', borderRadius: 12,
    border: `1px dashed ${colors.border}`, background: 'transparent', color: colors.textSecondary,
    fontFamily: fonts.ui, fontSize: 14.5, fontWeight: 600, cursor: 'pointer',
  },
  addRow: { display: 'flex', gap: 8 },
  addInput: { flex: 1, minWidth: 0, padding: '11px 14px', borderRadius: 11, border: `1px solid ${colors.border}`, background: colors.surface, color: colors.textPrimary, fontFamily: fonts.ui, fontSize: 15, outline: 'none' },
  addBtn: { flex: '0 0 auto', padding: '11px 18px', borderRadius: 11, border: `1px solid ${colors.borderGold}`, background: 'transparent', color: colors.textSecondary, fontFamily: fonts.ui, fontWeight: 600, fontSize: 15, cursor: 'pointer' },

  rebuild: { alignSelf: 'flex-start', padding: '9px 16px', borderRadius: 999, border: `1px solid ${colors.border}`, background: 'transparent', color: colors.textMuted, fontFamily: fonts.ui, fontWeight: 600, fontSize: 13, cursor: 'pointer' },

  emptyActions: { display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'stretch' },
  buildBtn: { padding: '13px 18px', borderRadius: 12, border: 'none', background: colors.accentGold, color: colors.bgDeep, fontFamily: fonts.ui, fontWeight: 700, fontSize: 15, cursor: 'pointer' },
  ghostBtn: { padding: '12px 18px', borderRadius: 12, border: `1px solid ${colors.borderGold}`, background: 'transparent', color: colors.textSecondary, fontFamily: fonts.ui, fontWeight: 600, fontSize: 14.5, cursor: 'pointer' },
};
