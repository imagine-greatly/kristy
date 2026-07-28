import { useState } from 'react';
import { colors, fonts, kristyVoice } from '../lib/tokens.js';
import { BarcodeIcon, CloseIcon, AisleIcon } from './Icons.jsx';
import AmbientIsm from './AmbientIsm.jsx';
import PerimeterAnswer from './PerimeterAnswer.jsx';
import { askPerimeter, fetchPerimeterEntry } from '../lib/perimeter.js';

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

/* ───────── One row of the cart — a DECISION, not a checkbox on a name ─────────
   Collapsed the row still says everything that matters: the specific pick, and ONE
   line of why she chose it. The reason is not behind the tap — a reason you have to
   ask for is a checklist with extra steps, and the reason IS the product.

   Tapping expands, in place, to the sourced detail: her "what to look for" checklist
   read straight from the perimeter KB (free, no model call), the named alternative,
   and the swap/remove actions. */
function CartRow({ item, open, detail, onToggle, onOpen, onDetail, onRemove, onRefine, onUpgrade }) {
  const isSwapCallout = item.source === 'swap';
  const flag = item.tier ? TIER_FLAG[item.tier] : null;
  const needsBetterPick = flagged(item);
  const checked = !!item.checked;

  return (
    <div
      style={{
        ...styles.item,
        ...(isSwapCallout ? styles.itemSwap : null),
        ...(checked ? styles.itemChecked : null),
        ...(open ? styles.itemOpen : null),
      }}
    >
      <div style={styles.itemHead}>
        <button
          type="button"
          onClick={() => onToggle(item.id)}
          aria-pressed={checked}
          aria-label={checked ? `Uncheck ${item.name}` : `Check off ${item.name}`}
          style={{
            ...styles.checkbox,
            borderColor: checked ? colors.accentGold : colors.checkboxRest,
            background: checked ? colors.accentGold : 'transparent',
            color: colors.bgDeep,
          }}
        >
          {checked ? '✓' : ''}
        </button>

        {/* The row body is the tap target — name, her reason, and the state tags. */}
        <button
          type="button"
          style={styles.itemBody}
          onClick={() => onOpen(open ? null : item.id)}
          aria-expanded={open}
          aria-label={`More about ${item.name}`}
        >
          <span
            style={{
              ...styles.itemName,
              ...(isSwapCallout ? styles.itemNameSwap : null),
              ...(checked && !isSwapCallout ? styles.itemNameChecked : null),
            }}
          >
            {item.name}
          </span>

          {/* THE COACHING. Always visible on any row she chose. */}
          {item.why && <span style={styles.itemWhy}>{item.why}</span>}

          {((item.source === 'user' && item.category !== 'From your haul') || item.refined || flag) && (
            <span style={styles.itemMeta}>
              {/* A haul carry-forward is stored as `user` so it survives a regeneration,
                  but the shopper didn't type it — its section header already says where
                  it came from, so it carries no "You added" tag. */}
              {item.source === 'user' && item.category !== 'From your haul' && (
                <span style={styles.tagQuiet}>You added</span>
              )}
              {/* No "From your haul" tag here — these rows already sit under a
                  "From your haul" section header, and the gold rule marks them. */}
              {item.refined && <span style={styles.tagGold}>Kristy&rsquo;s pick</span>}
              {flag && <span style={{ ...styles.flag, color: flag.fg, background: flag.bg }}>{flag.label}</span>}
            </span>
          )}
        </button>

        <span style={{ ...styles.chev, transform: open ? 'rotate(90deg)' : 'none' }} aria-hidden="true">›</span>
      </div>

      {open && (
        <div style={styles.drawer}>
          {/* The named alternative — the "or grass-fed if they have it" line. */}
          {item.alt && <p style={{ ...kristyVoice, ...styles.altLine }}>{item.alt}</p>}

          <div style={styles.drawerActions}>
            <button
              type="button"
              style={{ ...styles.drawerBtn, ...(needsBetterPick ? styles.drawerBtnGold : null) }}
              onClick={() => onDetail(item)}
              disabled={detail?.state === 'loading'}
            >
              {detail?.state === 'loading'
                ? 'Reading…'
                : needsBetterPick
                  ? 'Find a better pick'
                  : detail?.state === 'done'
                    ? 'What to look for'
                    : 'What to look for'}
            </button>
            <button type="button" style={styles.drawerBtn} onClick={() => onToggle(item.id)}>
              {checked ? 'Uncheck' : 'Check off'}
            </button>
            <button type="button" style={styles.drawerBtnQuiet} onClick={() => onRemove(item.id)}>
              <CloseIcon size={14} />
              <span>Remove</span>
            </button>
          </div>

          {detail?.state === 'error' && (
            <p style={{ ...kristyVoice, ...styles.drawerErr }}>
              That didn&rsquo;t go through — try again in a moment.
            </p>
          )}

          {/* A perimeter ENTRY (free KB read — she already knows this one). */}
          {detail?.state === 'done' && detail.entry && (
            <div style={styles.entry}>
              <p style={{ ...kristyVoice, ...styles.entryAnswer }}>
                {detail.entry.kristy_take || detail.entry.short_answer}
              </p>
              {!!detail.entry.buying_tips?.length && (
                <>
                  <div style={styles.entryHead}>What to look for</div>
                  <ul style={styles.tipList}>
                    {detail.entry.buying_tips.map((t, i) => (
                      <li key={i} style={styles.tip}>
                        <span style={styles.tipMark} aria-hidden="true">✓</span>
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}

          {/* A personalized ASK (model call) — for rows with no KB entry of their own. */}
          {detail?.state === 'done' && detail.resp && (
            <div style={styles.drawerAnswer}>
              <PerimeterAnswer
                resp={detail.resp}
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
  onImport,
  onHaul,
}) {
  const [openId, setOpenId] = useState(null);
  const [guidance, setGuidance] = useState({}); // itemId → { state, resp }
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');

  const { list, premium, loading, note, gated, progress } = cart;

  // Kristy's fuller read on one item, rendered inline.
  //
  // When the pick already carries a perimeterId, this is a FREE KB read — her sourced
  // buying tips, no model call, works on every tier and returns instantly. Only a row
  // with no entry of its own falls back to the personalized (premium) ask.
  async function loadDetail(item) {
    setGuidance((g) => ({ ...g, [item.id]: { state: 'loading' } }));
    try {
      if (item.perimeterId) {
        const entry = await fetchPerimeterEntry(item.perimeterId);
        if (entry) {
          setGuidance((g) => ({ ...g, [item.id]: { state: 'done', entry } }));
          return;
        }
      }
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

  /* ── No trip underway → Kristy ASKS. ──
     This is the entry state, and it is deliberately not a list. A pre-generated
     "nutrient-dense whole foods" template was a guess: we had no idea what this
     particular trip was for. So the cart begins as a question, and the answer is
     what builds it — conversation in, list out. */
  const hasItems = list && Array.isArray(list.items) && list.items.length > 0;
  if (!hasItems) {
    return (
      <div style={styles.wrap}>
        <Header progress={progress} onHaul={onHaul} />
        {loading ? (
          <p style={{ ...kristyVoice, ...styles.intro }}>Pulling your cart together&hellip;</p>
        ) : (
          <TripQuestion
            cart={cart}
            premium={premium}
            gated={gated}
            onUpgrade={onUpgrade}
            onSetGoal={onSetGoal}
            onScan={onScan}
            onAskAisle={onAskAisle}
            goals={goals}
          />
        )}
      </div>
    );
  }

  const groups = groupBySection(list.items);

  return (
    <div style={styles.wrap}>
      <Header progress={progress} onHaul={onHaul} />

      {/* Her one-line read on the whole cart — the blend, named in her voice. */}
      {list.intro && <p style={{ ...kristyVoice, ...styles.intro }}>{list.intro}</p>}
      {/* On a BUILD the compose summary becomes the cart's intro, so showing the note
          as well printed her sentence twice, one under the other. The note is for an
          EDIT ("rice out, couscous in") — a line the intro doesn't already carry. */}
      {note && note !== list.intro && <p style={{ ...kristyVoice, ...styles.note }}>{note}</p>}

      {!goals.length && onSetGoal && (
        <button type="button" style={styles.linkBtn} onClick={onSetGoal}>
          Set how you eat →
        </button>
      )}

      {/* The two ways to fill it, side by side and identical. */}
      <FillRow onScan={onScan} onAskAisle={onAskAisle} />

      {/* Someone who already wrote a list shouldn't have to retype it into a cart.
          Deliberately quieter than the two fill actions: most trips don't start from
          a piece of paper. */}
      {onImport && (
        <button type="button" style={styles.linkBtn} onClick={onImport}>
          Import a list →
        </button>
      )}

      {gated && (
        <Nudge
          line="Building the cart from a sentence is part of a membership. Adding by hand always works."
          cta="See what membership adds"
          onUpgrade={onUpgrade}
        />
      )}
      {premium === false && !gated && (
        <Nudge
          line="Basic cart. Membership shapes it around your focuses and folds in your haul swaps."
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
                detail={guidance[it.id]}
                onToggle={cart.toggle}
                onOpen={setOpenId}
                onDetail={loadDetail}
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

      {/* The way back to the question. A returning shopper with a live cart is never
          re-asked — this is how they say "that trip's done, start me over." */}
      <div style={styles.footRow}>
        <button
          type="button"
          style={styles.rebuild}
          onClick={() => {
            if (progress.total > 0 && !window.confirm('Start a new trip? This clears the cart you have.')) return;
            cart.startNewTrip();
            setOpenId(null);
          }}
        >
          Start a new trip
        </button>
        <button type="button" style={styles.rebuildGhost} onClick={cart.rebuild}>
          Rebuild for my preferences
        </button>
      </div>

      <AmbientIsm style={{ marginTop: 14 }} />
    </div>
  );
}

/* ═══════════════════ The entry state: a question, not a list ═══════════════════
   A trip starts LEAN. The cart used to generate an 18-item template before a single
   question had been asked, and however good each row was, nobody requested it — so the
   whole thing read as generic and imposed. Suggestions in the void hurt the product.

   So the shopper drives: they name what they're getting, and the cart is the OUTPUT of
   that. Preferences shape which VERSION of each item lands, not what gets added.

   The quick-taps SEED the field rather than firing immediately, which keeps the answer
   editable and teaches the shape of a good one without making it a form.

   A full cart is still available for anyone who wants one handed over. It's a button
   now, not the landing state. */
const TRIP_SEEDS = [
  'Chicken, rice, something for breakfast',
  'Three dinners this week',
  'Snacks the kids will eat',
  'Just a few things',
];

function TripQuestion({ cart, premium, gated, onUpgrade, onSetGoal, onScan, onAskAisle, goals }) {
  const [text, setText] = useState('');
  const [err, setErr] = useState('');
  const busy = !!cart.busy;

  async function submit(e) {
    e?.preventDefault();
    const answer = text.trim();
    if (!answer || busy) return;
    setErr('');
    const res = await cart.compose(answer, 'build');
    if (res?.ok) setText('');
    else if (!res?.gated && !res?.needsAccount) setErr('That did not go through. Try it once more.');
  }

  return (
    <div style={styles.ask}>
      <p style={{ ...kristyVoice, ...styles.askQ }}>What are you getting this week?</p>
      <p style={styles.askSub}>Name it in your own words. Rough is fine.</p>

      <form style={styles.askForm} onSubmit={submit}>
        <input
          style={styles.askInput}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Chicken, rice, snacks for the kids…"
          aria-label="What you are getting this week"
          disabled={busy}
        />
        <button type="submit" style={styles.askGo} disabled={!text.trim() || busy}>
          {busy ? '…' : 'Go'}
        </button>
      </form>

      {/* Starting points — a tap fills the field, it doesn't submit for you. */}
      <div style={styles.seeds}>
        {TRIP_SEEDS.map((s) => (
          <button
            key={s}
            type="button"
            style={styles.seed}
            onClick={() => setText(s)}
            disabled={busy}
          >
            {s}
          </button>
        ))}
      </div>

      {busy && <AmbientIsm style={{ marginTop: 16 }} />}
      {err && <p style={styles.askErr}>{err}</p>}

      {/* THE IDENTITY, on the emptiest screen in the app: the two halves of the store,
          at the same weight. The counter had this slot to itself and Scan had none,
          which said the opposite of what it should. Both are gold-edged now, so the
          counter keeps the prominence it earned and Scan simply matches it. */}
      <FillRow onScan={onScan} onAskAisle={onAskAisle} />

      {/* THE OPT-IN. Some shoppers do want a cart handed to them. That's a choice
          they make, on every tier, not the default state of the screen. */}
      <button type="button" style={styles.ghostBtn} onClick={cart.rebuild} disabled={busy}>
        Or build a full cart
      </button>

      {/* Free tier: building from a sentence is a membership capability. The full-cart
          button above still works, so this never dead-ends. */}
      {gated && (
        <div style={styles.askFree}>
          <p style={{ ...kristyVoice, ...styles.askFreeLine }}>
            Building a cart from a sentence is part of a membership.
          </p>
          {onUpgrade && (
            <button type="button" style={styles.linkBtn} onClick={onUpgrade}>
              What membership adds →
            </button>
          )}
        </div>
      )}

      {!goals.length && onSetGoal && (
        <button type="button" style={styles.linkBtn} onClick={onSetGoal}>
          Set how you like to eat →
        </button>
      )}
    </div>
  );
}

function Header({ progress, onHaul }) {
  return (
    <div style={styles.head}>
      <div style={styles.headTop}>
        <h1 style={styles.title}>Your cart</h1>
      </div>
      <ProgressBar progress={progress} />
      {/* The app opens here now, always. A finished trip used to hijack the opening
          surface and land on the Haul; it is announced on the cart instead, where the
          shopper already is, and reading it stays one tap away. */}
      {progress.total > 0 && progress.complete && onHaul && (
        <button type="button" style={styles.doneRow} onClick={onHaul}>
          <span style={{ ...kristyVoice, ...styles.doneLine }}>Trip done. Everything checked off.</span>
          <span style={styles.doneCta}>Read the haul →</span>
        </button>
      )}
    </div>
  );
}

/* ═══════════ The two ways to fill the cart, at identical weight ═══════════
   This row is the whole positioning in one component. Scanning vets the packaged
   half; the counter answers the unlabeled half (meat, fish, eggs, produce, bulk).
   Neither is the primary. They are the same size, the same border, the same gold,
   and they sit side by side so the equality is impossible to miss.

   The cart header used to carry a solid-gold "Scan" pill and the counter got a plain
   grey ghost button further down the page. That was a throne in miniature. */
function FillRow({ onScan, onAskAisle }) {
  if (!onScan && !onAskAisle) return null;
  return (
    <div style={styles.fillRow}>
      {onScan && (
        <button type="button" style={styles.fill} onClick={onScan}>
          <span style={styles.fillIcon}><BarcodeIcon size={20} /></span>
          <span style={styles.fillLabel}>Scan</span>
          <span style={styles.fillSub}>A barcode or a label</span>
        </button>
      )}
      {onAskAisle && (
        <button type="button" style={styles.fill} onClick={onAskAisle}>
          <span style={styles.fillIcon}><AisleIcon size={20} /></span>
          <span style={styles.fillLabel}>Counter</span>
          <span style={styles.fillSub}>Meat, fish, produce</span>
        </button>
      )}
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

  // The finished trip, announced on the cart instead of hijacking the opening surface.
  doneRow: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
    width: '100%', boxSizing: 'border-box', marginTop: 4,
    padding: '11px 14px', borderRadius: 12,
    border: `1px solid ${colors.borderGold}`, background: colors.goldTint9,
    textAlign: 'left', cursor: 'pointer',
  },
  doneLine: { fontSize: 14.5, lineHeight: 1.4, color: colors.textPrimary },
  doneCta: {
    flex: '0 0 auto', fontFamily: fonts.ui, fontSize: 12.5, fontWeight: 700,
    color: colors.accentGold, whiteSpace: 'nowrap',
  },

  progressWrap: { display: 'flex', flexDirection: 'column', gap: 6 },
  progressTrack: { width: '100%', height: 6, borderRadius: 999, background: colors.surface2, overflow: 'hidden' },
  progressFill: { height: '100%', background: colors.accentGold, borderRadius: 999, transition: 'width 0.25s ease' },
  progressLabel: { fontFamily: fonts.ui, fontSize: 12.5, color: colors.textMuted },

  intro: { margin: 0, fontSize: 16, lineHeight: 1.5, color: colors.textPrimary },
  note: { margin: '2px 0 0', fontSize: 15, lineHeight: 1.5, color: colors.textSecondary },
  linkBtn: { alignSelf: 'flex-start', padding: 0, background: 'transparent', border: 'none', color: colors.textSecondary, fontFamily: fonts.ui, fontSize: 13.5, cursor: 'pointer' },

  /* THE TWO WAYS TO FILL THE CART. Byte-identical styling on purpose: same width,
     same border, same gold, same type. Whatever is true of one is true of the other,
     which is the entire point of the row. */
  fillRow: { display: 'flex', gap: 10 },
  fill: {
    flex: '1 1 0',
    minWidth: 0,
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 3,
    padding: '13px 14px',
    borderRadius: 14,
    border: `1px solid ${colors.borderGold}`,
    background: colors.goldTint9,
    textAlign: 'left',
    cursor: 'pointer',
  },
  fillIcon: { display: 'flex', color: colors.accentGold, marginBottom: 2 },
  fillLabel: { fontFamily: fonts.ui, fontSize: 15, fontWeight: 700, color: colors.textPrimary },
  fillSub: { fontFamily: fonts.ui, fontSize: 12, lineHeight: 1.35, color: colors.textMuted },

  nudge: { display: 'flex', flexDirection: 'column', gap: 10, padding: '14px 16px', borderRadius: 12, border: `1px solid ${colors.borderGold}`, background: colors.goldTint9 },
  nudgeLine: { fontSize: 15, lineHeight: 1.5, color: colors.textPrimary },
  nudgeCta: { alignSelf: 'flex-start', padding: '9px 16px', borderRadius: 999, border: 'none', background: colors.accentGold, color: colors.bgDeep, fontFamily: fonts.ui, fontWeight: 700, fontSize: 13.5, cursor: 'pointer' },

  // Sections breathe — a bigger gap BETWEEN groups than between rows, so the eye reads
  // "produce, then meat" rather than one undifferentiated column.
  groups: { display: 'flex', flexDirection: 'column', gap: 26, marginTop: 6 },
  group: { display: 'flex', flexDirection: 'column', gap: 10 },
  groupLabel: {
    fontFamily: fonts.ui, fontSize: 10, fontWeight: 600, letterSpacing: '0.14em',
    textTransform: 'uppercase', color: colors.textMuted, opacity: 0.75, paddingLeft: 2, marginBottom: 2,
  },

  /* A row is a CARD: it's defined by sitting a step lighter than the ground plus a
     soft shadow — not by an outline. Borders on every row read as noise and flattened
     the hierarchy; the only outline left in the cart is gold, and gold means emphasis. */
  item: {
    borderRadius: 14, border: 'none', background: colors.surface, overflow: 'hidden',
    boxShadow: `inset 0 1px 0 ${colors.edgeHighlight}, ${colors.shadowCard}`,
    transition: 'background 0.16s ease, box-shadow 0.16s ease',
  },
  // Her callout is the ONE row that gets gold, because it's the one she's flagging.
  itemSwap: { borderLeft: `3px solid ${colors.accentGold}`, background: colors.goldTint9 },
  // Checked recedes: it drops back toward the ground instead of holding its lift.
  itemChecked: { background: colors.bg, boxShadow: 'none' },
  itemOpen: { background: colors.surface2, boxShadow: `inset 0 1px 0 ${colors.edgeHighlight}, ${colors.shadowRaised}` },

  itemHead: { display: 'flex', alignItems: 'flex-start', gap: 13, padding: '14px 15px' },
  checkbox: {
    flex: '0 0 auto', width: 24, height: 24, marginTop: 1, borderRadius: 7, border: '1.5px solid',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, cursor: 'pointer',
  },
  itemBody: { flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 3, padding: 0, background: 'transparent', border: 'none', textAlign: 'left', cursor: 'pointer' },
  itemName: { fontFamily: fonts.ui, fontSize: 15, fontWeight: 600, lineHeight: 1.3, color: colors.textPrimary, overflowWrap: 'anywhere' },
  itemNameSwap: { ...kristyVoice, fontSize: 15.5, fontWeight: 400, color: colors.textPrimary },
  itemNameChecked: { color: colors.textMuted, textDecoration: 'line-through' },

  // Her reasoning. Playfair italic so it reads as HER, not as a product subtitle.
  itemWhy: { ...kristyVoice, fontSize: 13.5, lineHeight: 1.45, color: colors.textMuted, overflowWrap: 'anywhere' },

  itemMeta: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 3 },
  tagQuiet: { fontFamily: fonts.ui, fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: colors.textMuted, opacity: 0.8 },
  tagGold: { fontFamily: fonts.ui, fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: colors.accentGoldMuted },
  // Tinted fill, no outline — the colour already carries the meaning.
  flag: { fontFamily: fonts.ui, fontSize: 10.5, fontWeight: 700, padding: '3px 9px', borderRadius: 999, whiteSpace: 'nowrap' },
  chev: { flex: '0 0 auto', marginTop: 2, color: colors.textMuted, opacity: 0.6, fontSize: 18, lineHeight: 1, transition: 'transform 0.18s ease' },

  // The drawer is the elevated layer — no divider rule needed, the lift does that work.
  drawer: { display: 'flex', flexDirection: 'column', gap: 12, padding: '0 15px 15px', marginLeft: 37 },
  altLine: { margin: 0, fontSize: 14, lineHeight: 1.45, color: colors.textMuted },
  drawerActions: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  drawerBtn: {
    flex: '1 1 auto', minHeight: 40, padding: '9px 12px', borderRadius: 10,
    border: 'none', background: colors.bg, color: colors.textPrimary,
    fontFamily: fonts.ui, fontSize: 13, fontWeight: 600, cursor: 'pointer',
  },
  drawerBtnGold: { background: colors.goldTint9, color: colors.accentGold },
  drawerBtnQuiet: {
    flex: '0 0 auto', minHeight: 40, padding: '9px 12px', borderRadius: 10,
    display: 'inline-flex', alignItems: 'center', gap: 6,
    border: 'none', background: 'transparent', color: colors.textMuted,
    fontFamily: fonts.ui, fontSize: 13, fontWeight: 600, cursor: 'pointer',
  },
  drawerErr: { margin: 0, fontSize: 14.5, color: colors.textPrimary },
  drawerAnswer: { paddingTop: 2 },

  /* Her sourced detail, read straight from the perimeter KB — a reference card, not
     chat prose. Sits on the ground colour so it reads as inset within the raised row. */
  entry: { display: 'flex', flexDirection: 'column', gap: 9, padding: '13px 14px', borderRadius: 11, background: colors.bg },
  entryAnswer: { margin: 0, fontSize: 14.5, lineHeight: 1.5, color: colors.textPrimary },
  entryHead: { fontFamily: fonts.ui, fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: colors.textMuted },
  tipList: { listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 7 },
  tip: { display: 'flex', gap: 9, alignItems: 'flex-start', fontFamily: fonts.ui, fontSize: 13.5, lineHeight: 1.45, color: colors.textPrimary },
  tipMark: { flex: '0 0 auto', color: colors.accentGoldMuted, fontSize: 12, lineHeight: 1.5 },

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

  /* ── The entry question ── */
  ask: { display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 8 },
  askQ: { margin: 0, fontSize: 23, lineHeight: 1.35, color: colors.textPrimary },
  askSub: { margin: '-6px 0 0', fontFamily: fonts.ui, fontSize: 13.5, color: colors.textMuted },
  askForm: { display: 'flex', gap: 8, alignItems: 'stretch' },
  askInput: {
    flex: 1, minWidth: 0, padding: '13px 15px', borderRadius: 12,
    border: `1px solid ${colors.borderGold}`, background: colors.surface,
    color: colors.textPrimary, fontFamily: fonts.ui, fontSize: 15, outline: 'none',
  },
  askGo: {
    flex: '0 0 auto', padding: '13px 18px', borderRadius: 12, border: 'none',
    background: colors.accentGold, color: colors.bgDeep,
    fontFamily: fonts.ui, fontWeight: 700, fontSize: 15, cursor: 'pointer',
  },
  seeds: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  seed: {
    padding: '9px 14px', borderRadius: 999, border: `1px solid ${colors.border}`,
    background: colors.surface, color: colors.textSecondary,
    fontFamily: fonts.ui, fontSize: 13.5, fontWeight: 600, cursor: 'pointer',
  },
  askErr: { margin: 0, fontFamily: fonts.ui, fontSize: 13.5, color: colors.error },

  askFree: {
    display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-start',
    marginTop: 6, padding: '14px 16px', borderRadius: 14,
    border: `1px solid ${colors.borderGold}`, background: colors.goldTint9,
  },
  askFreeLine: { margin: 0, fontSize: 15.5, lineHeight: 1.5, color: colors.textPrimary },

  footRow: { display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' },
  rebuildGhost: { padding: '9px 16px', borderRadius: 999, border: 'none', background: 'transparent', color: colors.textMuted, fontFamily: fonts.ui, fontWeight: 600, fontSize: 13, cursor: 'pointer' },
  buildBtn: { padding: '13px 18px', borderRadius: 12, border: 'none', background: colors.accentGold, color: colors.bgDeep, fontFamily: fonts.ui, fontWeight: 700, fontSize: 15, cursor: 'pointer' },
  ghostBtn: { padding: '12px 18px', borderRadius: 12, border: `1px solid ${colors.borderGold}`, background: 'transparent', color: colors.textSecondary, fontFamily: fonts.ui, fontWeight: 600, fontSize: 14.5, cursor: 'pointer' },
};
