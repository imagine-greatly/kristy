import { useEffect, useState } from 'react';
import { colors, fonts, kristyDisplay, kristyVoice, radii } from '../lib/tokens.js';
import { GoldThread } from './GoldThread.jsx';
import PerimeterAnswer from './PerimeterAnswer.jsx';
import { askPerimeter, fetchCounterSections, fetchCounterCard, fetchCounterEssentials } from '../lib/perimeter.js';
import CounterCard from './CounterCard.jsx';
import { useCardMeter } from '../lib/cardMeter.js';
import CounterAsk from './CounterAsk.jsx';
import { trackEvent } from '../lib/analytics.js';

/* ═══════════════ The counter — the half of the store with no label ═══════════════
   A scanner stops at the barcode. Everything worth eating on the perimeter of a store
   never had one: the fish counter, the butcher, produce, the dairy case, the bulk bins.
   That is the half no scanner can read, so it gets a destination of its own rather than
   a link tucked under the scan buttons.

   Called "the counter" on every surface, not "the aisle". The aisles are exactly where
   the barcodes live; the counter is the half that has none. The internal ids, routes and
   analytics keep the older `aisle` name.

   Two ways in, and ASKING LEADS. A coach for the unlabeled store is one you can talk
   to; browsing is how you explore it. So the ask sits at the top in a raised card of
   its own, above the section list, and the same question typed into the docked
   composer on any other surface reaches the same sourced entries.
     • ASK in plain words — the fast path, one step to an answer
     • BROWSE by store section, the way a shopper actually walks it

   Everything on this surface is a free KB read: no account, no model call, no cost.
   Only the personalized read (filtered through goal / focuses / constraints) is
   premium, and PerimeterAnswer already draws that line.

   Tokens only. Spoken lines are kristyVoice, everything factual is Inter. */

export default function AisleMoment({
  prefs, onUpgrade, onUpgradeSheet, onScan, onAddToCart, purchasable = true,
}) {
  const [sections, setSections] = useState(null);
  const [loadErr, setLoadErr] = useState(false);
  const [essentials, setEssentials] = useState(null);
  const [essErr, setEssErr] = useState(false);
  const [openSection, setOpenSection] = useState(null);
  const [entry, setEntry] = useState(null); // { state, data }
  const [answered, setAnswered] = useState(false); // an answer is on screen (owned by CounterAsk)
  const [personal, setPersonal] = useState(null); // { state, resp } — this topic, read against the profile
  /* THE READ METER IS `useCardMeter`, SHARED. This file and CartMoment each carried a copy
     of it — same call, same counter — and adding the ask as a third caller is what made
     that indefensible. A guest gets the teaser and no offer they cannot complete, which is
     why the gated callback is withheld rather than the meter being different. */
  const upgradeFromCard = () => { if (purchasable) (onUpgradeSheet || onUpgrade)?.(); };
  const { requestFull, view } = useCardMeter(purchasable ? upgradeFromCard : undefined);

  // Is there anything to personalize against? No profile → no offer, rather than a
  // button that promises a tailored read and returns the universal one.
  const hasProfile = !!(
    prefs?.goal ||
    prefs?.focuses?.length ||
    prefs?.hardLines?.length ||
    prefs?.constraints?.length
  );

  useEffect(() => {
    let alive = true;
    fetchCounterSections()
      .then((s) => alive && setSections(s))
      .catch(() => alive && setLoadErr(true));
    // The shelf loads alongside the sections rather than after them: it sits higher on
    // the page, so waiting on the browse index would leave the most-read part blank
    // longest.
    fetchCounterEssentials()
      .then((c) => alive && setEssentials(c))
      .catch(() => alive && setEssErr(true));
    return () => {
      alive = false;
    };
  }, []);

  async function openEntry(id, via = 'topic') {
    setEntry({ state: 'loading' });
    setPersonal(null);
    trackEvent('perimeter-entry', { id, via });
    try {
      const data = await fetchCounterCard(id);
      setEntry(data ? { state: 'done', data } : { state: 'error' });
    } catch {
      setEntry({ state: 'error' });
    }
  }

  /* The universal read is the topic itself and it is free, instant, and the same for
     everyone. Reading it against THIS shopper's goal and constraints is the member
     layer, so it stays an explicit tap rather than a model call fired on every topic
     open. Offered only when there is actually a profile to read against; the server
     decides whether the personalized answer comes back or the gate does. */
  async function readAgainstProfile(data) {
    if (personal?.state === 'loading') return;
    setPersonal({ state: 'loading' });
    trackEvent('perimeter-ask', { via: 'topic-personalize' });
    try {
      const resp = await askPerimeter({
        question: data.question || data.title,
        goal: prefs?.goal || '',
        focuses: prefs?.focuses || [],
        hardLines: prefs?.hardLines || [],
        constraints: prefs?.constraints || [],
      });
      // The entry is already on screen above this, so only her read renders here.
      setPersonal({ state: 'done', resp: { ...resp, entries: [] } });
    } catch {
      setPersonal({ state: 'error' });
    }
  }

  /* ── A single topic, read in full ── */
  if (entry) {
    return (
      <div style={styles.wrap}>
        <button type="button" style={styles.back} onClick={() => setEntry(null)}>
          ‹ Back
        </button>
        {entry.state === 'loading' && <p style={styles.muted}>Loading…</p>}
        {entry.state === 'error' && <p style={styles.muted}>That one did not load. Try again.</p>}
        {entry.state === 'done' && (
          <>
            {/* A browsed topic is a CARD, read straight out of counter_cards. Summary
                first — eyebrow, tier, headline, the do line, the cart tap — with the
                why, the checklist, the traps and the tier note one tap down. A card
                Pass 3 generates renders through this identical component. */}
            <CounterCard card={view(entry.data)} onAddToCart={onAddToCart} onUpgrade={upgradeFromCard} onRequestFull={requestFull} purchasable={purchasable} />

            {hasProfile && !personal && (
              <button
                type="button"
                style={styles.personalize}
                onClick={() => readAgainstProfile({ question: entry.data.topic, title: entry.data.topic })}
              >
                Read this against your cart
              </button>
            )}
            {personal?.state === 'loading' && <p style={styles.muted}>Reading…</p>}
            {personal?.state === 'error' && <p style={styles.muted}>That read did not come together. Try again.</p>}
            {personal?.state === 'done' && (
              <PerimeterAnswer resp={personal.resp} onUpgrade={onUpgrade} />
            )}
          </>
        )}
      </div>
    );
  }

  /* ── One section's topics ── */
  if (openSection) {
    return (
      <div style={styles.wrap}>
        <button type="button" style={styles.back} onClick={() => setOpenSection(null)}>
          ‹ All sections
        </button>
        <h1 style={styles.h1}>{openSection.title}</h1>
        <p style={styles.blurb}>{openSection.blurb}</p>

        {/* Pinned above the list, not buried in it: what people actually ask here. */}
        {!!openSection.shortcuts?.length && (
          <div style={styles.shortcuts}>
            {openSection.shortcuts.map((sc) => (
              <button key={sc.id} type="button" style={styles.shortcut} onClick={() => openEntry(sc.id, 'shortcut')}>
                {sc.q}
              </button>
            ))}
          </div>
        )}

        <div style={styles.topics}>
          {(openSection.cards || []).map((t) => (
            <TopicRow key={t.slug} topic={t} onOpen={openEntry} />
          ))}
        </div>

        {!!openSection.labelCards?.length && (
          <>
            <div style={styles.groupLabel}>Label terms read here</div>
            <div style={styles.topics}>
              {openSection.labelCards.map((t) => (
                <TopicRow key={t.slug} topic={t} onOpen={openEntry} />
              ))}
            </div>
          </>
        )}

        {/* Honest about the edges. A named gap is what makes the covered part
            trustworthy; padding the section with filler would not. */}
        {openSection.thinNote && (
          <p style={{ ...kristyVoice, ...styles.thin }}>{openSection.thinNote}</p>
        )}
      </div>
    );
  }

  /* ── The index ──
     ASK, then the ESSENTIALS, then BROWSE. The old order opened with a title, a thesis and
     six section cards, which put every answer three taps away — tab, section, card —
     through undifferentiated lists at each level. Nobody does that holding a cart.
     Browsing is a couch interaction and it was occupying the position the store
     interaction should hold. */
  return (
    <div style={styles.wrap}>
      {/* ASK — the hero, and the first thing on the surface. The page title moved into it:
          a separate "The counter" heading above the input pushed the input down to repeat
          the name of the tab the shopper just pressed. */}
      {/* THE ASK IS `CounterAsk`, THE SAME COMPONENT THE DASHBOARD AND SHOP MODE RENDER.
          It used to be written out here — input, seeds, answer, and its own copy of the read
          meter — and shop mode needing an ask overlay would have made that three. Two asks
          that look alike are two meters, and the day they diverge is the day the gate copy
          becomes false on one of them, silently, because the drifted surface still looks
          right. The deck stays here because it introduces the SURFACE; the ask does not. */}
      <div style={styles.askCard}>
        <h1 style={styles.askHead}>Where the guidance comes from</h1>
        <span style={styles.askSub}>Every note on your list came from here. Ask for whatever it did not cover.</span>
        <CounterAsk
          prefs={prefs}
          via="counter"
          purchasable={purchasable}
          onUpgrade={upgradeFromCard}
          onAddToCart={onAddToCart}
          onAnswer={setAnswered}
        />
      </div>

      {/* ESSENTIALS — eight CARDS, not eight links. They render in summary state and
          expand in place, so the most-asked answers in the store cost no navigation at
          all: the verdict and the do line are already on screen, and the full read is one
          tap that never leaves this page.

          Hidden once an answer is on screen. The shopper asked something specific, and
          eight other answers under it is noise at the moment they are reading. */}
      {!answered && (
        <>
          <div style={styles.groupLabel}>Start here</div>
          {essErr && <p style={styles.muted}>The essentials did not load.</p>}
          {!essentials && !essErr && <p style={styles.muted}>Loading…</p>}
          <div style={styles.essentials}>
            {(essentials || []).map((c) => (
              <CounterCard key={c.slug} card={view(c)} onAddToCart={onAddToCart} onUpgrade={upgradeFromCard} onRequestFull={requestFull} purchasable={purchasable} />
            ))}
          </div>
        </>
      )}

      {/* BROWSE — the store, by section, in walking order, below the fold. Each section
          carries the handful of questions people actually ask standing at it. */}
      <div style={styles.groupLabel}>Browse the counter</div>
      {loadErr && <p style={styles.muted}>The sections did not load. Try again.</p>}
      {!sections && !loadErr && <p style={styles.muted}>Loading…</p>}
      <div style={styles.sections}>
        {(sections || []).map((s) => (
          <div key={s.id} style={styles.section}>
            <button type="button" style={styles.sectionHead} onClick={() => setOpenSection(s)}>
              <span style={styles.sectionTitle}>{s.title}</span>
              <span style={styles.sectionBlurb}>{s.blurb}</span>
              <span style={styles.sectionCount}>{s.count} topics</span>
            </button>
            {!!s.shortcuts?.length && (
              <div style={styles.shortcuts}>
                {s.shortcuts.map((sc) => (
                  <button key={sc.id} type="button" style={styles.shortcut} onClick={() => openEntry(sc.id, 'shortcut')}>
                    {sc.q}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {onScan && (
        <button type="button" style={styles.otherHalf} onClick={onScan}>
          Got a barcode? Scan it →
        </button>
      )}
    </div>
  );
}

// A browse row shows the DECISION, not the background. It used to print the short
// answer, which meant three lines of essay per row and a tap on every one to find the
// call. Often the row is now the whole answer and the tap is for the depth.
// A browse row is EYEBROW + HEADLINE and nothing else. That density was already right
// before the card split and it stays right: the row's job is to let a shopper choose
// which card to open, and the do line belongs on the card they chose, not on forty rows
// they skimmed past. The server sends only these fields for the same reason.
function TopicRow({ topic, onOpen }) {
  return (
    <button type="button" style={styles.topic} onClick={() => onOpen(topic.slug)} data-browse-row={topic.slug}>
      <span style={styles.topicTitle}>
        {topic.kind === 'home' ? `At home · ${topic.eyebrow}` : topic.eyebrow}
      </span>
      {topic.headline && <span style={styles.topicDecision}>{topic.headline}</span>}
    </button>
  );
}

const styles = {
  wrap: {
    maxWidth: 520, margin: '0 auto', width: '100%', boxSizing: 'border-box',
    padding: '18px 18px 24px', display: 'flex', flexDirection: 'column', gap: 12,
  },
  h1: { ...kristyDisplay, margin: 0, fontSize: 26, color: colors.ink },
  blurb: { margin: 0, fontFamily: fonts.ui, fontSize: 14, lineHeight: 1.5, color: colors.textMuted },
  muted: { margin: 0, fontFamily: fonts.ui, fontSize: 13.5, color: colors.textMuted },
  back: {
    alignSelf: 'flex-start', padding: '6px 2px', background: 'transparent', border: 'none',
    color: colors.textMuted, fontFamily: fonts.ui, fontSize: 13.5, fontWeight: 600, cursor: 'pointer',
  },

  // The ask is a CARD, not a bare input. A section row is a raised surface, so an
  // input floating above them read as secondary to the thing it is meant to lead.
  // THE HERO. It was a gold-tinted panel sized to compete with the section cards below
  // it; as the first and largest thing on the surface that tint became the biggest gold
  // area on the screen, which is the one thing gold is not for. Plain surface and the
  // same inset edge every card carries — the hierarchy now comes from size and position,
  // which is what should have been carrying it.
  askCard: {
    display: 'flex', flexDirection: 'column', gap: 7, marginTop: 2,
    padding: '18px 17px 19px', borderRadius: 16,
    border: 'none', background: colors.surface,
    boxShadow: `inset 0 1px 0 ${colors.edgeHighlight}, ${colors.shadowCard}`,
  },
  essentials: { display: 'flex', flexDirection: 'column', gap: 10 },
  askHead: { margin: 0, fontFamily: fonts.ui, fontSize: 19, fontWeight: 700, letterSpacing: '-0.01em', color: colors.textPrimary },
  askSub: { fontFamily: fonts.ui, fontSize: 13.5, lineHeight: 1.5, color: colors.textMuted },
  // The counter's ONE filled action. Everything else on this surface — the card's
  // add-to-cart, the gate, the section shortcuts — is transparent + hairline.
  personalize: {
    alignSelf: 'flex-start', padding: '10px 14px', borderRadius: 12,
    border: `1px solid ${colors.border}`, background: 'transparent', color: colors.textSecondary,
    fontFamily: fonts.ui, fontSize: 13.5, fontWeight: 700, cursor: 'pointer',
  },

  groupLabel: {
    marginTop: 10, fontFamily: fonts.ui, fontSize: 10, fontWeight: 600, letterSpacing: '0.14em',
    textTransform: 'uppercase', color: colors.textMuted, opacity: 0.75,
  },
  sections: { display: 'flex', flexDirection: 'column', gap: 10 },
  section: {
    display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 9,
    padding: '14px 15px', borderRadius: 14, background: colors.surface,
    boxShadow: `inset 0 1px 0 ${colors.edgeHighlight}, ${colors.shadowCard}`,
  },
  sectionHead: {
    display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 3,
    padding: 0, border: 'none', background: 'transparent',
    textAlign: 'left', cursor: 'pointer',
  },
  // The fast path made visible: the questions asked at this counter, each one tap
  // from its answer. Quieter than the section name — a shortcut into the section,
  // not a competitor to it.
  shortcuts: { display: 'flex', flexWrap: 'wrap', gap: 6 },
  shortcut: {
    padding: '7px 11px', borderRadius: 999, border: `1px solid ${colors.gold30}`,
    background: colors.goldTint9, color: colors.textSecondary,
    fontFamily: fonts.ui, fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
    textAlign: 'left',
  },
  sectionTitle: { fontFamily: fonts.ui, fontSize: 15.5, fontWeight: 700, color: colors.textPrimary },
  sectionBlurb: { fontFamily: fonts.ui, fontSize: 13, lineHeight: 1.45, color: colors.textMuted },
  sectionCount: {
    marginTop: 3, fontFamily: fonts.mono, fontSize: 10.5, color: colors.inkMuted,
    letterSpacing: '0.04em',
  },

  topics: { display: 'flex', flexDirection: 'column', gap: 8 },
  topic: {
    display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 3,
    padding: '13px 14px', borderRadius: 12, border: 'none', background: colors.surface,
    boxShadow: `inset 0 1px 0 ${colors.edgeHighlight}, ${colors.shadowCard}`,
    textAlign: 'left', cursor: 'pointer',
  },
  // The title is the label; the decision under it is the answer, so it gets her voice
  // and the stronger colour.
  topicTitle: {
    fontFamily: fonts.ui, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
    textTransform: 'uppercase', color: colors.textMuted,
  },
  topicDecision: { ...kristyVoice, fontSize: 15, lineHeight: 1.4, color: colors.textPrimary },
  topicShort: { fontFamily: fonts.ui, fontSize: 12.5, lineHeight: 1.45, color: colors.textMuted },

  thin: {
    margin: '6px 0 0', fontSize: 14.5, lineHeight: 1.5, color: colors.textMuted,
    paddingLeft: 12, borderLeft: `2px solid ${colors.gold30}`,
  },
  otherHalf: {
    marginTop: 12, padding: '11px 14px', borderRadius: radii.button,
    border: `0.5px solid ${colors.hairline}`, background: 'transparent', color: colors.inkMuted,
    fontFamily: fonts.ui, fontSize: 13.5, fontWeight: 600, cursor: 'pointer',
  },
};
