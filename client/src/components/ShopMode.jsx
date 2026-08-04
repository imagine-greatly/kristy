import { useEffect, useRef, useState } from 'react';
import { colors, fonts, kristyDisplay, kristyVoice, radii } from '../lib/tokens.js';
import { groupForWalk } from '../lib/listSections.js';
import { useWakeLock } from '../lib/wakeLock.js';
import { fetchCardSummaries } from '../lib/perimeter.js';
import { BarcodeIcon, AisleIcon, CloseIcon } from './Icons.jsx';
import CounterAsk, { seedsForSection } from './CounterAsk.jsx';

/* ═══════════════════════════ SHOP MODE — the list in your hand ═══════════════════════════
   Kristy has two states. BEFORE THE STORE you plan, on the dashboard, unhurried and with two
   hands. IN THE STORE this is the whole screen and it walks with you.

   IT IS A MODE, NOT A TAB: full viewport, entered deliberately from the dashboard hero,
   exited deliberately. No tab bar, no top bar, no docked composer — App suppresses all three
   while it is up. A tab bar under this would offer four ways to fall out of the thing the
   shopper just chose to be in.

   ─── THE TYPE INVERTS, AND THAT IS THE WHOLE IDEA ────────────────────────────────
   On the dashboard the item NAME leads: you are deciding what to buy. Here the DO LINE
   leads, because the shopper already knows they need eggs — what they do not know is to read
   the carton. Measured at 390px: the do line is 17.5px and the name demotes to an 11.5px
   uppercase eyebrow, where the cart has those at 15px and 13.5px the other way round.

   An UNMATCHED row keeps its name in the lead slot at the same 17.5px. The inversion is a
   claim that the do line is the more useful line, not a house style — where there is no do
   line the claim does not apply.

   ONE PROSE LINE PER ROW, inherited from the cart and not relaxed: a matched row shows the
   card's do line, an unmatched row shows its `why`, never both.

   ─── THE TWO TAP TARGETS SIT AT OPPOSITE EDGES ───────────────────────────────────
   CHECK is 56px, hard left — bigger than the 44px floor because that floor is a seated
   minimum and this is pressed one-handed while pushing a trolley. OPEN THE CARD is 44px,
   hard right, and is the ONLY thing that opens a card: the big text between them is INERT.
   In the cart the whole attachment is tappable, which is right for a surface you read with
   two hands and wrong for one you press while walking. Measured 256px apart at their closest.

   ─── ADVANCING IS FREE SCROLL ────────────────────────────────────────────────────
   Auto-advance moves the screen under a thumb that is still mid-tap. Paging one section at a
   time turns doubling back into navigation. A swipe is invisible and fights the iOS
   back-gesture at the left edge. Scrolling cannot strand a shopper who skipped something and
   cannot trap one who doubles back — the two constraints, satisfied by construction rather
   than by handling a case. A finished section collapses to one line so the sections still
   ahead keep the screen.                                                                  */

/* ── The header: WHERE YOU ARE IN THE STORE ──
   "4 of 7" is the SECTION's count. A trip-wide "8 of 15" answers a question nobody standing
   in produce is asking, and the dashboard already carries it. The pips are the walk: filled
   behind you, gold where you are, hollow ahead. */
function ShopHeader({ sections, activeIdx, onExit }) {
  const active = sections[activeIdx];
  const next = sections[activeIdx + 1];
  const done = active ? active.items.filter((i) => i.checked).length : 0;

  return (
    <div style={styles.head} data-shop-head>
      <div style={styles.headRow}>
        <button type="button" style={styles.exit} onClick={onExit} aria-label="Leave shop mode" data-exit>
          <CloseIcon size={16} />
        </button>
        <div style={styles.pips} aria-hidden="true">
          {sections.map((s, i) => {
            const complete = s.items.every((it) => it.checked);
            return (
              <span
                key={s.id || 'trailing'}
                data-pip={s.id || 'trailing'}
                style={{ ...styles.pip, ...(i === activeIdx ? styles.pipActive : complete ? styles.pipDone : null) }}
              />
            );
          })}
        </div>
        <span style={styles.count} data-section-count>
          {done} of {active?.items.length || 0}
        </span>
      </div>

      <h1 style={styles.section} data-section-title>{active?.title}</h1>
      {/* What comes next is always named: a shopper deciding whether to double back needs to
          know what they are walking away from and what they are walking toward. */}
      <span style={styles.next} data-next-label>
        {next ? `Next: ${next.title}` : 'Last section'}
      </span>
    </div>
  );
}

/* ── A block: the rows that share a card, then the card's do line, LEADING ──
   The collapse survives from the cart and earns more here. Carrots and the in-season fruit
   both resolve to `produce_seasonality`; printing "Walk the farmers'-market table" twice
   would read as a bug, and printing it once under two names reads as one instruction
   covering both — which is what it is. */
function ShopBlock({ block, card, onToggle, onOpen }) {
  const hasCard = Boolean(block.slug && card);
  const allChecked = block.items.every((i) => i.checked);

  return (
    <div
      style={{ ...styles.block, ...(allChecked ? styles.blockDone : null) }}
      data-shop-block={block.slug || 'none'}
    >
      {block.items.map((item) => (
        <div key={item.id} style={styles.row} data-shop-row={item.id}>
          <button
            type="button"
            onClick={() => onToggle(item.id)}
            aria-pressed={!!item.checked}
            aria-label={item.checked ? `Uncheck ${item.name}` : `Check off ${item.name}`}
            style={styles.checkTap}
            data-check
          >
            <span
              style={{
                ...styles.checkbox,
                borderColor: item.checked ? colors.accentGold : colors.checkboxRest,
                background: item.checked ? colors.accentGold : 'transparent',
                color: colors.bgDeep,
              }}
            >
              {item.checked ? '✓' : ''}
            </span>
          </button>

          <div style={styles.rowBody}>
            {hasCard ? (
              // MATCHED: the name demotes to an eyebrow. This is the inversion.
              <span data-name style={styles.nameEyebrow}>{item.name}</span>
            ) : (
              <span
                data-name
                data-lead
                style={{ ...styles.lead, ...(item.checked ? styles.leadDone : null) }}
              >
                {item.name}
              </span>
            )}

            {/* An unmatched row's `why` is the only prose it has. Same rule as the cart. */}
            {!hasCard && item.why && <span data-why style={styles.why}>{item.why}</span>}
          </div>
        </div>
      ))}

      {/* A SPENT INSTRUCTION STOPS LEADING — BUT IT MUST STAY READABLE.
          Rendering it showed the first half: with two rows checked, two do lines the shopper
          had already acted on were the largest text on the screen, above rows still to buy.

          The first fix was 11.5px at 50% opacity, and MEASURED against the ground that is
          2.90:1 — WCAG needs 4.5:1 for text this size. A shopper who checks something by
          mistake and looks back could not read what they had just dismissed. Transparency is
          the wrong instrument for de-emphasis; it takes contrast away from the people who
          need it most and it fails silently because it still LOOKS fine to whoever shipped it.

          So the demotion is carried by SIZE (17.5px → 13px), by the block losing its raised
          surface, and by the checkbox and strikethrough already saying "done" — never by
          opacity. 13px at full `textMuted` measures 7.84:1. shop.mjs computes the ratio from
          the RENDERED colours so this cannot drift back. */}
      {hasCard && (
        <div style={{ ...styles.doRow, ...(allChecked ? styles.doRowSpent : null) }}>
          <span
            data-do
            {...(allChecked ? { 'data-spent': '1' } : { 'data-lead': '' })}
            style={allChecked ? styles.doSpent : styles.lead}
          >
            {card.do}
          </span>
          <button
            type="button"
            style={styles.openTap}
            onClick={() => onOpen(block.slug)}
            aria-label={`Open the full read: ${card.eyebrow}`}
            data-open={block.slug}
          >
            <span style={styles.chev} aria-hidden="true">›</span>
          </button>
        </div>
      )}
    </div>
  );
}

/* A finished section collapses to one line. This is what lets "produce fills the screen"
   survive free scrolling — without it, a fifteen-item trip means scrolling past your own
   completed work all morning. Still in place, one tap from reopening. */
function DoneSection({ section, onReopen }) {
  return (
    <button
      type="button"
      style={styles.doneSection}
      onClick={() => onReopen(section.id || 'trailing')}
      data-done-section={section.id || 'trailing'}
    >
      <span style={styles.doneTitle}>{section.title}</span>
      <span style={styles.doneCount}>all {section.items.length} · reopen</span>
    </button>
  );
}

export default function ShopMode({
  cart, cards: injected, prefs, onExit, onScan, onComplete, onSection, onUpgrade,
}) {
  const [fetched, setFetched] = useState({});
  const cards = injected || fetched;
  const [openSlug, setOpenSlug] = useState(null);
  // THE ASK IS AN OVERLAY OVER THIS COMPONENT, never a navigation. It was wired to
  // `setMoment('aisle')`, which UNMOUNTS shop mode — so asking a question threw away the
  // shopper's section and scroll position and dropped them on the Counter tab. That is the
  // single failure most likely to mean this mode never gets used a second time.
  const [asking, setAsking] = useState(false);
  const [reopened, setReopened] = useState({});
  const [activeIdx, setActiveIdx] = useState(0);
  const scrollRef = useRef(null);
  const sectionRefs = useRef({});

  // The screen stays awake for as long as this component is mounted, and not one moment
  // longer. See lib/wakeLock.js — the re-acquire on visibilitychange is the whole feature.
  useWakeLock(true);

  const items = cart.list?.items || [];

  /* THE SAME ONE-REQUEST FETCH THE CART USES, keyed on the sorted slug string so checking
     items off — which changes the list on every tap and nothing about which cards are on it
     — issues no traffic at all. CartMoment is unmounted while this is up, so there is no
     double fetch; `injected` exists for the harness, which serves the same projection. */
  const slugKey = [...new Set(items.map((i) => i.cardSlug).filter(Boolean))].sort().join(',');
  useEffect(() => {
    if (injected || !slugKey) return undefined;
    let alive = true;
    fetchCardSummaries(slugKey.split(',')).then((got) => {
      if (alive) setFetched((cur) => ({ ...cur, ...got }));
    });
    return () => { alive = false; };
  }, [slugKey, injected]);

  /* THE WALK IS THE CART'S WALK. `groupForWalk` is the shipping function and the sections it
     returns are the counter's own vocabulary — shop mode does not get a second opinion about
     the store any more than CartMoment does. */
  const groups = groupForWalk(items).map((g) => ({
    ...g,
    items: g.blocks.flatMap((b) => b.items),
  }));

  /* THE ACTIVE SECTION IS READ OFF THE SCROLL rather than driven by a control, which is what
     makes free scrolling and a section-at-a-time header the same thing.

     IT IS THE SECTION FILLING THE MOST SCREEN, NOT THE LAST ONE WHOSE TOP WENT PAST. The
     first version used "last section whose top has crossed the viewport top", and a COLLAPSED
     section breaks it: once produce is done it is 66px tall, so a shopper scrolled well into
     meat still had the next section's top below the line and the header still said Produce —
     naming a section that was entirely off screen. The collapse and the header rule were each
     right alone and wrong together, which is only visible with a completed section behind you.

     Largest-visible-area has no such edge: whatever the shopper is actually looking at is
     what the header names, at any section height, including none. */
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return undefined;
    const onScroll = () => {
      const view = el.getBoundingClientRect();
      let best = 0;
      let bestSeen = -1;
      groups.forEach((g, i) => {
        const node = sectionRefs.current[g.id || 'trailing'];
        if (!node) return;
        const r = node.getBoundingClientRect();
        const seen = Math.max(0, Math.min(r.bottom, view.bottom) - Math.max(r.top, view.top));
        if (seen > bestSeen) {
          bestSeen = seen;
          best = i;
        }
      });
      setActiveIdx(best);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => el.removeEventListener('scroll', onScroll);
  });

  const jumpTo = (id) => {
    const node = sectionRefs.current[id || 'trailing'];
    const el = scrollRef.current;
    if (node && el) el.scrollTo({ top: node.offsetTop - el.offsetTop, behavior: 'smooth' });
  };

  const shoppable = items.filter((i) => i.source !== 'swap');
  const allDone = shoppable.length > 0 && shoppable.every((i) => i.checked);
  const active = groups[activeIdx];

  /* The section the shopper is standing in, reported UP so a scan landing from App can say
     "Add to Produce" rather than guessing a category. It is derived state, so it is pushed
     in an effect rather than during render. */
  useEffect(() => {
    onSection?.(active ? { id: active.id, title: active.title } : null);
  }, [active?.id, active?.title, onSection]);

  return (
    <div style={styles.wrap} data-shop-mode>
      <ShopHeader sections={groups} activeIdx={activeIdx} onExit={onExit} />

      <div style={styles.scroll} ref={scrollRef} data-shop-scroll>
        {groups.map((g, i) => {
          const key = g.id || 'trailing';
          const complete = g.items.every((it) => it.checked);
          const next = groups[i + 1];
          return (
            <div
              key={key}
              ref={(n) => { sectionRefs.current[key] = n; }}
              style={styles.sectionWrap}
              data-shop-section={key}
              data-complete={complete ? '1' : '0'}
            >
              {complete && !reopened[key] ? (
                <DoneSection section={g} onReopen={(id) => setReopened((r) => ({ ...r, [id]: true }))} />
              ) : (
                <>
                  {/* NO INLINE SECTION TITLE. The first draft printed one so a shopper
                      scrolled between sections still knew where they were — and rendering it
                      showed the header already says that, so "Produce" appeared twice, 12px
                      apart, at the top of the aisle screen. The header is the title; the
                      "Next: …" button at the foot of each section is the divider. */}
                  {g.blocks.map((b) => (
                    <ShopBlock
                      key={b.key}
                      block={b}
                      card={b.slug ? cards[b.slug] : null}
                      onToggle={cart.toggle}
                      onOpen={setOpenSlug}
                    />
                  ))}
                  {next && (
                    <button type="button" style={styles.nextBtn} onClick={() => jumpTo(next.id)} data-next-btn>
                      Next: {next.title} →
                    </button>
                  )}
                </>
              )}
            </div>
          );
        })}

        {/* Completing is a tap at the end of the walk, never the last checkbox — an uncheck
            and recheck would archive the trip out from under someone still in the store. */}
        {allDone && onComplete && (
          <button type="button" style={styles.finish} onClick={onComplete} data-finish>
            Finish the trip →
          </button>
        )}
        <div style={{ height: 28 }} />
      </div>

      {/* THE BRANCH BAR. Neither is a tab switch — both open OVER shop mode, which stays
          mounted underneath. "Return to the same section and scroll position" therefore needs
          no restoration code at all: it is never unmounted, so there is nothing to restore.
          That is the entire argument for an overlay, and it lands in step 4. */}
      <div style={styles.branch} data-branch>
        <button type="button" style={styles.branchBtn} onClick={onScan} data-scan>
          <BarcodeIcon size={19} />
          <span style={styles.branchLabel}>Scan</span>
        </button>
        <button type="button" style={styles.branchBtn} onClick={() => setAsking(true)} data-ask>
          <AisleIcon size={19} />
          <span style={styles.branchLabel}>Ask</span>
        </button>
      </div>

      {openSlug && cards[openSlug] && (
        <CardSheet card={cards[openSlug]} onClose={() => setOpenSlug(null)} />
      )}

      {/* THE ASK, OVER THE TOP. `CounterAsk` is the same component the Counter index and the
          dashboard render — one implementation, one read meter. Only the seeds change, to
          the section the shopper is standing in, because what is in front of you changes
          what you think to ask.

          Shop mode is NOT unmounted while this is up, which is why closing it returns to the
          same pixel with no scroll-restoration code anywhere. There is nothing to restore. */}
      {asking && (
        <div style={styles.askScrim} data-ask-overlay onClick={() => setAsking(false)}>
          <div style={styles.askSheet} onClick={(e) => e.stopPropagation()}>
            <div style={styles.askHead}>
              <span style={styles.askWhere}>{active?.title || 'The counter'}</span>
              <button type="button" style={styles.askClose} onClick={() => setAsking(false)} data-ask-close>
                <CloseIcon size={16} />
              </button>
            </div>
            <CounterAsk
              prefs={prefs}
              via="shop"
              autoFocus
              placeholder={`Ask about ${(active?.title || 'the counter').toLowerCase()}…`}
              seeds={seedsForSection(active?.id)}
              onUpgrade={onUpgrade}
              onAddToCart={cart.add}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* The full read, as a sheet over shop mode. The tier chip is the FIRST thing on it — the
   decision is a claim, and settled science must never render identically to a standard. */
const TIER_LABEL = {
  established: 'Settled',
  credible_concern: 'Credible concern',
  kristys_standard: 'Whole-food standard',
};

function CardSheet({ card, onClose }) {
  return (
    <div style={styles.sheetScrim} onClick={onClose} data-card-sheet={card.slug}>
      <div style={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <span style={styles.sheetTier} data-tier-badge>{TIER_LABEL[card.tier] || card.tier}</span>
        <p style={styles.sheetHead}>{card.headline}</p>
        <p style={styles.sheetDo}>{card.do}</p>
        <button type="button" style={styles.sheetClose} onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

const styles = {
  /* SHOP MODE IS A BASE SURFACE, NOT AN OVERLAY, so it sits BELOW every sheet rather than
     tied with them. It was 60 — the same tier as ScanSheet, UpgradeSheet, GoalSwitcher and
     CoachOnboarding — which meant a scan sheet only covered it by being later in App's JSX.
     A stacking order decided by source order is a stacking order that breaks when someone
     reorders JSX for an unrelated reason, and the thing it would break is the one that
     decides whether this mode gets used twice.

     45: above the tab bar (40), below every sheet (60/70) and the camera (100). */
  wrap: {
    position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column',
    background: colors.bg, zIndex: 45,
  },

  head: {
    flex: '0 0 auto', padding: '10px 16px 12px',
    borderBottom: `1px solid ${colors.border}`, background: colors.bg,
    display: 'flex', flexDirection: 'column', gap: 2,
  },
  headRow: { display: 'flex', alignItems: 'center', gap: 10, minHeight: 44 },
  exit: {
    flex: '0 0 auto', width: 44, height: 44, marginLeft: -10,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: 'none', background: 'transparent', color: colors.textMuted, cursor: 'pointer',
  },
  pips: { flex: 1, display: 'flex', gap: 5, alignItems: 'center' },
  pip: { width: 7, height: 7, borderRadius: 999, background: 'transparent', border: `1px solid ${colors.border}` },
  pipDone: { background: colors.border, border: `1px solid ${colors.border}` },
  pipActive: { background: colors.accentGold, border: `1px solid ${colors.accentGold}`, width: 18, borderRadius: 999 },
  count: { flex: '0 0 auto', fontFamily: fonts.mono, fontSize: 13, color: colors.accentGold },

  // Playfair italic 28px — a page title, over the 26px display floor, one per screen.
  section: { ...kristyDisplay, margin: 0, fontSize: 28, lineHeight: 1.15, color: colors.ink },
  next: {
    fontFamily: fonts.ui, fontSize: 12, fontWeight: 600, letterSpacing: '0.06em',
    textTransform: 'uppercase', color: colors.textMuted,
  },

  scroll: { flex: 1, minHeight: 0, overflowY: 'auto', padding: '4px 16px 0' },
  sectionWrap: { paddingTop: 14 },

  block: {
    marginBottom: 14, borderRadius: 14, background: colors.surface, overflow: 'hidden',
    boxShadow: `inset 0 1px 0 ${colors.edgeHighlight}, ${colors.shadowCard}`,
  },
  // Checked recedes by losing its LIFT, not by losing contrast.
  blockDone: { background: 'transparent', boxShadow: 'none' },

  row: { display: 'flex', alignItems: 'flex-start', gap: 2, padding: '2px 12px 2px 2px' },

  /* 56px, not 44. The floor is a seated minimum; this is pressed one-handed while walking,
     which is the case the floor was never measuring. */
  checkTap: {
    flex: '0 0 auto', width: 56, height: 56,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 0, border: 'none', background: 'transparent', cursor: 'pointer',
  },
  checkbox: {
    width: 26, height: 26, borderRadius: 8, border: '1.5px solid',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700,
  },
  rowBody: { flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3, paddingTop: 15, paddingBottom: 6 },

  /* THE INVERSION, in two values: the name on a matched row is 11.5px, the do line 17.5px.
     In the cart those are 15px and 13.5px — the name led by 1.5px, here the instruction
     leads by 6px. Full `textMuted`, never faded: an eyebrow is still something a shopper
     has to read to know which item the instruction is about. */
  nameEyebrow: {
    fontFamily: fonts.ui, fontSize: 11.5, fontWeight: 700, letterSpacing: '0.1em',
    textTransform: 'uppercase', color: colors.textMuted, lineHeight: 1.35, overflowWrap: 'anywhere',
  },
  lead: {
    fontFamily: fonts.ui, fontSize: 17.5, fontWeight: 600, lineHeight: 1.38,
    color: colors.textPrimary, overflowWrap: 'anywhere',
  },
  leadDone: { color: colors.textMuted, textDecoration: 'line-through' },
  why: { ...kristyVoice, fontSize: 13.5, lineHeight: 1.45, color: colors.textMuted, overflowWrap: 'anywhere' },

  doRow: {
    display: 'flex', alignItems: 'flex-start', gap: 8,
    margin: '0 12px 0 58px', padding: '2px 0 14px',
  },
  doRowSpent: { padding: '0 0 12px', alignItems: 'center' },
  // 13px at full textMuted — 7.84:1 against the ground. Demoted by size, still readable.
  doSpent: {
    fontFamily: fonts.ui, fontSize: 13, fontWeight: 500, lineHeight: 1.4,
    color: colors.textMuted, overflowWrap: 'anywhere',
  },
  openTap: {
    flex: '0 0 auto', width: 44, height: 44, marginTop: -8, marginRight: -12,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: 'none', background: 'transparent', color: colors.textMuted, cursor: 'pointer',
  },
  chev: { fontSize: 20, lineHeight: 1 },

  doneSection: {
    width: '100%', boxSizing: 'border-box', display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', gap: 10, minHeight: 52, padding: '15px 14px',
    borderRadius: 12, border: `1px solid ${colors.border}`, background: 'transparent',
    textAlign: 'left', cursor: 'pointer',
  },
  doneTitle: { fontFamily: fonts.ui, fontSize: 14.5, fontWeight: 700, color: colors.textBody },
  doneCount: { fontFamily: fonts.ui, fontSize: 12.5, color: colors.textMuted },

  nextBtn: {
    width: '100%', boxSizing: 'border-box', minHeight: 48, marginTop: 2, padding: '13px 16px',
    borderRadius: 12, border: `1px dashed ${colors.border}`, background: 'transparent',
    color: colors.textSecondary, fontFamily: fonts.ui, fontSize: 14.5, fontWeight: 600, cursor: 'pointer',
  },
  finish: {
    width: '100%', boxSizing: 'border-box', minHeight: 56, marginTop: 20, padding: '16px 18px',
    borderRadius: radii.button, border: 'none', background: colors.action, color: colors.actionInk,
    fontFamily: fonts.ui, fontSize: 17, fontWeight: 700, cursor: 'pointer',
  },

  branch: {
    flex: '0 0 auto', display: 'flex', gap: 10, padding: '10px 16px',
    paddingBottom: 'calc(10px + env(safe-area-inset-bottom))',
    borderTop: `1px solid ${colors.border}`, background: colors.surface,
  },
  branchBtn: {
    flex: '1 1 0', minHeight: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderRadius: 12, border: `1px solid ${colors.borderGold}`, background: colors.goldTint9,
    color: colors.textPrimary, cursor: 'pointer',
  },
  branchLabel: { fontFamily: fonts.ui, fontSize: 14.5, fontWeight: 700 },

  /* THE ASK OVERLAY. Above shop mode (45) and above its card sheet, at the sheet tier. */
  askScrim: {
    position: 'fixed', inset: 0, background: colors.scrim, display: 'flex',
    alignItems: 'flex-end', zIndex: 70,
  },
  askSheet: {
    width: '100%', maxHeight: '86%', overflowY: 'auto', boxSizing: 'border-box',
    padding: '14px 16px calc(20px + env(safe-area-inset-bottom))',
    borderRadius: '18px 18px 0 0', background: colors.bg,
    display: 'flex', flexDirection: 'column', gap: 12,
  },
  askHead: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  askWhere: {
    fontFamily: fonts.ui, fontSize: 11, fontWeight: 700, letterSpacing: '0.12em',
    textTransform: 'uppercase', color: colors.textMuted,
  },
  askClose: {
    flex: '0 0 auto', width: 44, height: 44, marginRight: -10,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: 'none', background: 'transparent', color: colors.textMuted, cursor: 'pointer',
  },

  sheetScrim: { position: 'fixed', inset: 0, background: colors.scrim, display: 'flex', alignItems: 'flex-end', zIndex: 70 },
  sheet: {
    width: '100%', boxSizing: 'border-box', padding: '18px 18px 26px',
    borderRadius: '18px 18px 0 0', background: colors.surface,
    display: 'flex', flexDirection: 'column', gap: 8,
  },
  sheetTier: {
    alignSelf: 'flex-start', fontFamily: fonts.ui, fontSize: 10, fontWeight: 700,
    letterSpacing: '0.09em', textTransform: 'uppercase', color: colors.accentGold,
    padding: '4px 10px', borderRadius: 999, border: `1px solid ${colors.gold30}`,
  },
  sheetHead: { ...kristyVoice, margin: 0, fontSize: 21, lineHeight: 1.3, color: colors.ink },
  sheetDo: { margin: 0, fontFamily: fonts.ui, fontSize: 15, lineHeight: 1.45, color: colors.textBody },
  sheetClose: {
    alignSelf: 'flex-start', marginTop: 6, minHeight: 44, padding: '10px 0',
    border: 'none', background: 'transparent', color: colors.textMuted,
    fontFamily: fonts.ui, fontSize: 13, fontWeight: 600, cursor: 'pointer',
  },
};
