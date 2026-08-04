import { colors, fonts, kristyDisplay, kristyVoice, radii } from '../lib/tokens.js';
import { groupForWalk } from '../lib/listSections.js';
import CartMoment from './CartMoment.jsx';
import TripQuestion from './TripQuestion.jsx';
import CounterAsk from './CounterAsk.jsx';

/* ═══════════════════ THE DASHBOARD — the planning surface ═══════════════════
   Kristy has two states and one loop. BEFORE THE STORE you plan: build the list, seed from
   last week, ask, look things up — unhurried, two hands, at home. IN THE STORE there is one
   thing on screen and it walks with you. This is the first state, and it is where a shopper
   lands between trips.

   IT ANSWERS ONE QUESTION IMMEDIATELY: what happens next. That answer is the FIRST child of
   this component and carries the largest type on the surface, in every state — asserted in
   dash.mjs against the rendered boxes, because a claim about prominence that lives only in
   a comment is the shape this codebase keeps catching.

   THERE IS NO SEPARATE CART TAB. The cart is not a destination beside this; it is what this
   is built around. The hero answers what next, and the thing the answer acts on sits
   directly beneath it.

   ─── FIVE STATES, NOT FOUR ────────────────────────────────────────────────────
   `finished` is the one that nearly shipped as a bug. A trip with every box ticked is not
   "mid-trip", and its answer to what-next is not RESUME — it is FINISH. Folded into midtrip,
   a shopper who had just walked their whole list would be told to resume it.

   ─── What is NOT here, and why ────────────────────────────────────────────────
   No stats, trends, streaks or distribution charts. A haul distribution is what an app shows
   when it has nothing useful to say, and it would push the one button that matters below the
   fold. It is also structurally unsound on this surface: that bar is a distribution of
   VERDICTS, and a bought-but-unscanned item honestly has none — so it would be a chart with
   a known hole standing where the answer goes. The Haul stays its own surface, reached from
   the bottom of this one, which is the moment it answers anything.

   `cart.note` DOES belong, and it is not a nudge: it is the response to an action the
   shopper just took. It carries her compose summary and the over-budget message from
   LIST_COMPOSE_FREE_LIMIT. Suppress it and someone taps Go, hits the daily ceiling, and
   nothing visibly happens.

   ─── Where the cart's old header went ─────────────────────────────────────────
   Nowhere. `CartHeader` was extracted so this file could place it, and rendering the two
   together showed it is not RELOCATED by the hero, it is SUPERSEDED by it: the title is the
   hero's line, the trip standing is the hero's kicker plus the walk shape (which is
   per-section and strictly more useful than one bar), and the completion door is the
   `finished` hero's own action. A component nothing renders is dead code describing an
   abandoned decision, so it was deleted rather than kept vestigial. */

/** Which of the five states this shopper is in. Read entirely off `cart.progress` and
 *  `cart.seedable`, both of which already exist — this stores no new concept. */
export function dashboardState(cart) {
  const p = cart?.progress || { total: 0, checked: 0, complete: false };
  if (p.total === 0) return cart?.seedable?.seedable ? 'completed' : 'empty';
  if (p.complete) return 'finished';
  if (p.checked > 0) return 'midtrip';
  return 'ready';
}

/** The walk, as the shopper will actually walk it. Sections in order, with their counts. */
function walkGroups(items) {
  return groupForWalk(items).map((g) => ({ ...g, items: g.blocks.flatMap((b) => b.items) }));
}

/* THE HERO, AND ITS ACTION IS ALWAYS THE SCREEN'S ONE FILLED ACTION (`colors.action`, warm
   bone). Both halves of that were wrong in the first draft and only the render showed it:

   `finished` was gold-bordered "so a second bone button would not break the one-action
   rule" — but counted in the browser, `finished` had ZERO bone actions, so the state where
   a shopper is standing at a checkout wanting to be done had the QUIETEST answer of the
   five. The reasoning was about a conflict that did not exist.

   `completed` had TWO: the hero's "Start from those 15 items" and TripQuestion's "Go".
   That one is a real conflict, and it is resolved where it belongs — the composer passes
   `submitTone="quiet"` so the field's submit steps down, rather than the hero stepping
   down and letting the alternative outshout the answer.

   dash.mjs counts bone-filled buttons per state, so neither can drift back. */
function Hero({ kicker, line, action, sub, onAction, tone = 'action', actionAttr }) {
  return (
    <div style={styles.hero} data-hero>
      {kicker && <span style={styles.kicker} data-hero-kicker>{kicker}</span>}
      <p style={styles.heroLine} data-hero-line>{line}</p>
      {action && (
        <button
          type="button"
          style={{ ...styles.heroBtn, ...(tone === 'gold' ? styles.heroBtnGold : null) }}
          onClick={onAction}
          data-hero-action
          {...(actionAttr ? { [actionAttr]: '' } : {})}
        >
          {action}
        </button>
      )}
      {sub && <span style={styles.heroSub} data-hero-sub>{sub}</span>}
    </div>
  );
}

/* THE SHAPE OF THE WALK, under START and under RESUME. It is not a stat and it earns its
   place on that distinction: a distribution says what already happened, this says what is
   about to. It is what makes "Start shopping" a legible act rather than a leap into a mode,
   and mid-trip it is the only thing on the surface that says which aisles are still owed. */
function WalkShape({ groups, resumeAt }) {
  if (!groups.length) return null;
  return (
    <div style={styles.walk} data-walk-shape>
      {groups.map((g) => {
        const id = g.id || 'trailing';
        const done = g.items.filter((i) => i.checked).length;
        const all = done === g.items.length;
        return (
          <span
            key={id}
            data-walk-seg={id}
            style={{ ...styles.seg, ...(all ? styles.segDone : null), ...(id === resumeAt ? styles.segHere : null) }}
          >
            {g.title} {done}/{g.items.length}
          </span>
        );
      })}
    </div>
  );
}

export default function Dashboard({
  cart,
  prefs,
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
  onStartShopping,
  onResume,
  onComplete,
}) {
  const items = cart.list?.items || [];
  const st = dashboardState(cart);
  const groups = walkGroups(items);

  /* WHERE A RESUME LANDS: the first section with anything left, NOT the last one touched.
     A shopper who skipped two things in produce and walked to meat has to be sent back to
     what is unfinished — that is the whole reason skipping is allowed to strand nothing. */
  const resumeAt = groups.find((g) => g.items.some((i) => !i.checked));
  const resumeDone = resumeAt ? resumeAt.items.filter((i) => i.checked).length : 0;

  return (
    <div style={styles.wrap} data-dashboard={st}>
      {st === 'empty' && (
        <Hero
          line="What are you getting this week?"
          sub="Name it in your own words. Rough is fine."
        />
      )}

      {st === 'completed' && (
        <Hero
          kicker="Last trip is filed"
          line="Same as last week?"
          action={`Start from those ${cart.seedable.items} item${cart.seedable.items === 1 ? '' : 's'}`}
          sub="Unchecked and ready to edit."
          actionAttr="data-seed-last"
          onAction={() => cart.seedFromLast()}
        />
      )}

      {st === 'ready' && (
        <>
          <Hero
            kicker={`${cart.progress.total} item${cart.progress.total === 1 ? '' : 's'} · ${groups.length} section${groups.length === 1 ? '' : 's'}`}
            line="The list is ready."
            action="Start shopping"
            onAction={onStartShopping}
          />
          <WalkShape groups={groups} />
        </>
      )}

      {st === 'midtrip' && (
        <>
          {/* LOUDER THAN EVERYTHING, because someone reopening this is standing in an aisle.
              The kicker names the aisle so the tap reads as a return, not a re-entry. */}
          <Hero
            kicker="You are mid-trip"
            line={`${resumeAt?.title} — ${resumeDone} of ${resumeAt?.items.length}`}
            action="Resume shopping"
            sub={`${cart.progress.remaining} left across the store.`}
            onAction={onResume}
          />
          <WalkShape groups={groups} resumeAt={resumeAt?.id || 'trailing'} />
        </>
      )}

      {st === 'finished' && (
        /* THE COMPLETION DOOR, and it is still an explicit tap. Never automatic on the last
           checkbox — an uncheck and recheck would archive the trip out from under someone
           still standing in the store. This is the cart header's old `[data-complete-trip]`,
           promoted rather than duplicated. */
        <Hero
          kicker="Everything checked off"
          line="Trip done."
          action="Finish the trip"
          sub="It gets filed, and next week starts from it."
          actionAttr="data-complete-trip"
          onAction={onComplete}
        />
      )}

      {/* HER ONE LINE BACK. Not a nudge — the response to something the shopper just did:
          a compose summary, or the daily build budget announcing itself when it is actually
          reached. It sits under the hero because the hero is the answer to what-next and
          this is the answer to what-just-happened. */}
      {cart.note && <p style={{ ...kristyVoice, ...styles.note }} data-cart-note>{cart.note}</p>}

      {/* THE QUESTION, with its heading suppressed in the states whose hero already asks it.
          Rendering both printed "What are you getting this week?" and "Name it in your own
          words. Rough is fine." VERBATIM TWICE, 500px apart on one screen. */}
      {(st === 'empty' || st === 'completed') && !cart.loading && (
        <div style={styles.askWrap}>
          <TripQuestion
            cart={cart}
            premium={cart.premium}
            onUpgrade={onUpgrade}
            onSetGoal={onSetGoal}
            onScan={onScan}
            onAskAisle={onAskAisle}
            goals={goals}
            showHead={false}
            // The `completed` hero IS the seeding act. Two `[data-seed-last]` controls on
            // one screen is the same duplication one layer down.
            showSeed={st !== 'completed'}
            // ...and it is also the screen's one filled action, so the field's submit
            // steps down beside it. In `empty` the hero has no button at all — the
            // question IS the answer to what-next — so Go keeps the bone.
            submitTone={st === 'completed' ? 'quiet' : 'action'}
          />
        </div>
      )}

      {/* THE ASK, AT HOME. Questions get asked before the store too — the difference is that
          here you have two hands and time, so it sits above the list rather than behind a
          branch button. It is `CounterAsk`, THE SAME COMPONENT shop mode opens as an overlay
          and the Counter renders as its index: one implementation, and therefore one read
          meter. Two asks that merely looked alike would be two meters, and the day they
          diverged the gate copy would be false on one of them.

          Seeds are suppressed (`seeds={[]}`) and the submit is quiet: the hero already owns
          the screen's one filled action, and three suggestion chips here would compete with
          the walk shape directly above. It renders only where a list exists — in `empty` and
          `completed` the trip question is already the field on screen, and two input boxes
          stacked is a muddle rather than an affordance. */}
      {(st === 'ready' || st === 'midtrip' || st === 'finished') && (
        <div style={styles.askWrap}>
          <CounterAsk
            prefs={prefs}
            via="dashboard"
            seeds={[]}
            submitTone="quiet"
            placeholder="Ask about anything in the store…"
            onUpgrade={onUpgrade}
            onAddToCart={cart.add}
          />
        </div>
      )}

      {/* THE LIST, and everything the cart already is: walk sections, the collapse, the
          attachments, the offers, the add row. Not redesigned — composed. */}
      <CartMoment
        cart={cart}
        goals={goals}
        goal={goal}
        nonNegotiables={nonNegotiables}
        focuses={focuses}
        constraints={constraints}
        onSetGoal={onSetGoal}
        onUpgrade={onUpgrade}
        onScan={onScan}
        onAskAisle={onAskAisle}
        onImport={onImport}
        onHaul={onHaul}
      />

      {/* The Haul is a DESTINATION reached from the bottom of the planning surface, not a
          panel on it. It answers "how did that go", which is a question you have only once
          a trip is behind you. */}
      {onHaul && cart.progress.total === 0 && (
        <button type="button" style={styles.haulLink} onClick={onHaul} data-haul-link>
          Read your haul →
        </button>
      )}
    </div>
  );
}

const styles = {
  wrap: { maxWidth: 520, margin: '0 auto', width: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' },

  hero: {
    display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 10,
    padding: '20px 18px 18px',
    borderBottom: `1px solid ${colors.border}`,
  },
  /* THE KICKER IS textMuted, NOT GOLD, and the first draft got that wrong. Rendering it in
     the real app frame put four gold things in the top third of the screen — the Ask mark,
     the goal chip's border and dot, the Premium mark, and this. Gold is IDENTITY: it marks
     what a thing IS (a tier, the active tab, the wordmark, the thread), never a line a
     shopper reads to orient themselves. Every other eyebrow in the app is textMuted —
     CounterCard's, the cart attachment's, the walk-section label's — so a gold one here was
     inventing a treatment, which is the first non-negotiable. */
  kicker: {
    fontFamily: fonts.ui, fontSize: 11, fontWeight: 700, letterSpacing: '0.12em',
    textTransform: 'uppercase', color: colors.textMuted,
  },
  // Playfair italic 28px — a page title, one per screen, over the 26px display floor.
  heroLine: { ...kristyDisplay, margin: 0, fontSize: 28, lineHeight: 1.2, color: colors.ink },
  heroBtn: {
    alignSelf: 'stretch', minHeight: 56, padding: '16px 20px', borderRadius: radii.button,
    border: 'none', background: colors.action, color: colors.actionInk,
    fontFamily: fonts.ui, fontSize: 17, fontWeight: 700, cursor: 'pointer',
  },
  heroBtnGold: { background: colors.goldTint9, color: colors.textPrimary, border: `1px solid ${colors.borderGold}` },
  heroSub: { ...kristyVoice, fontSize: 14, lineHeight: 1.45, color: colors.textMuted },

  note: { margin: 0, padding: '12px 18px 0', fontSize: 15, lineHeight: 1.5, color: colors.textSecondary },

  walk: { display: 'flex', flexWrap: 'wrap', gap: 6, padding: '12px 18px 0' },
  seg: {
    fontFamily: fonts.ui, fontSize: 11.5, fontWeight: 600, padding: '5px 10px', borderRadius: 999,
    border: `1px solid ${colors.border}`, color: colors.textMuted,
  },
  segDone: { opacity: 0.45 },
  segHere: { border: `1px solid ${colors.borderGold}`, background: colors.goldTint9, color: colors.textPrimary },

  askWrap: { padding: '4px 18px 0' },

  haulLink: {
    alignSelf: 'flex-start', margin: '0 18px 24px', padding: '10px 0', minHeight: 44,
    border: 'none', background: 'transparent', color: colors.textMuted,
    fontFamily: fonts.ui, fontSize: 13.5, fontWeight: 600, cursor: 'pointer',
  },
};
