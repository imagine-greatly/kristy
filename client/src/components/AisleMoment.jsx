import { useEffect, useState } from 'react';
import { colors, fonts, kristyDisplay, kristyVoice, radii } from '../lib/tokens.js';
import { GoldThread } from './GoldThread.jsx';
import PerimeterAnswer from './PerimeterAnswer.jsx';
import { askPerimeter, askCounter, fetchCounterSections, fetchCounterCard } from '../lib/perimeter.js';
import CounterCard from './CounterCard.jsx';
import CounterAnswer, { CounterAnswerSkeleton } from './CounterAnswer.jsx';
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

// Seeds span the counters on purpose: one glance should say meat, fish, eggs, produce.
const ASK_SEEDS = [
  'Wild or farmed salmon',
  'Which cut for stew',
  'What pasture-raised leaves out',
  'Is organic worth it for berries',
];

export default function AisleMoment({ prefs, onUpgrade, onScan, onAddToCart }) {
  const [sections, setSections] = useState(null);
  const [loadErr, setLoadErr] = useState(false);
  const [openSection, setOpenSection] = useState(null);
  const [entry, setEntry] = useState(null); // { state, data }
  const [question, setQuestion] = useState('');
  const [ask, setAsk] = useState(null); // { state, resp }
  const [personal, setPersonal] = useState(null); // { state, resp } — this topic, read against the profile

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

  // ONE route for every ask — the bar and the seed chips both land here. The server
  // decides whether the answer is a curated card, one generated for a question the KB
  // never covered, or an out-of-scope line; all three come back in the same shape.
  async function runAsk(raw, via) {
    const q = String(raw || '').trim();
    if (!q || ask?.state === 'loading') return;
    setAsk({ state: 'loading' });
    trackEvent('counter-ask', { via });
    try {
      const resp = await askCounter({
        query: q,
        goal: prefs?.goal || '',
        focuses: prefs?.focuses || [],
        hardLines: prefs?.hardLines || [],
        constraints: prefs?.constraints || [],
      });
      setAsk({ state: 'done', resp });
    } catch {
      setAsk({ state: 'error' });
    }
  }

  function submitAsk(e) {
    e?.preventDefault();
    runAsk(question, 'aisle');
  }

  // A seed ASKS. It used to only fill the box, which made the shortcut two taps —
  // the tap, then the same Ask button they could have reached by typing.
  function askSeed(seed) {
    setQuestion(seed);
    runAsk(seed, 'seed');
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
            <CounterCard card={entry.data} onAddToCart={onAddToCart} />

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

  /* ── The index ── */
  return (
    <div style={styles.wrap}>
      <h1 style={styles.h1}>The counter</h1>
      <GoldThread />
      <p style={{ ...kristyVoice, ...styles.thesis }}>
        The half of the store with no label. The half that matters most.
      </p>
      <p style={styles.thesisSub}>
        Meat, seafood, produce, eggs, dairy, bulk. No barcode to read, and still a right
        answer at every one.
      </p>

      {/* ASK — the lead affordance, raised into a card of its own so it carries at
          least the weight of the six section cards below it. Plain words in, the
          same sourced entries out. No account anywhere in it. */}
      <div style={styles.askCard}>
        <span style={styles.askHead}>Ask about any counter</span>
        <span style={styles.askSub}>Which cut, wild or farmed, what to look for.</span>

        <form style={styles.askForm} onSubmit={submitAsk}>
          <input
            style={styles.askInput}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Wild or farmed salmon?"
            aria-label="Ask about the counter"
            disabled={ask?.state === 'loading'}
          />
          <button type="submit" style={styles.askGo} disabled={!question.trim() || ask?.state === 'loading'}>
            {ask?.state === 'loading' ? '…' : 'Ask'}
          </button>
        </form>

        <div style={styles.seeds}>
          {ASK_SEEDS.map((s) => (
            <button key={s} type="button" style={styles.seed} onClick={() => askSeed(s)}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* A card can take seconds to generate. The skeleton is the card's own shape, so the
          layout does not jump and the wait reads as an answer arriving. */}
      {ask?.state === 'loading' && (
        <div style={styles.answer}>
          <CounterAnswerSkeleton />
        </div>
      )}
      {ask?.state === 'error' && <p style={styles.muted}>That did not go through. Try again.</p>}
      {ask?.state === 'done' && (
        <div style={styles.answer}>
          <CounterAnswer resp={ask.resp} onUpgrade={onUpgrade} onAddToCart={onAddToCart} />
        </div>
      )}

      {/* BROWSE — the store, by section, in walking order. Each section carries the
          handful of questions people actually ask standing at it, so the frequent
          answers are ONE tap from here rather than section, scroll, topic. The
          section card itself still opens the full list. */}
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
          Got a barcode? That half is a scan →
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
  thesis: { margin: 0, fontSize: 16.5, lineHeight: 1.5, color: colors.textPrimary },
  thesisSub: { margin: 0, fontFamily: fonts.ui, fontSize: 13.5, lineHeight: 1.5, color: colors.textMuted },
  blurb: { margin: 0, fontFamily: fonts.ui, fontSize: 14, lineHeight: 1.5, color: colors.textMuted },
  muted: { margin: 0, fontFamily: fonts.ui, fontSize: 13.5, color: colors.textMuted },
  back: {
    alignSelf: 'flex-start', padding: '6px 2px', background: 'transparent', border: 'none',
    color: colors.textMuted, fontFamily: fonts.ui, fontSize: 13.5, fontWeight: 600, cursor: 'pointer',
  },

  // The ask is a CARD, not a bare input. A section row is a raised surface, so an
  // input floating above them read as secondary to the thing it is meant to lead.
  askCard: {
    display: 'flex', flexDirection: 'column', gap: 6, marginTop: 6,
    padding: '14px 15px 15px', borderRadius: 14,
    border: `1px solid ${colors.borderGold}`, background: colors.goldTint9,
  },
  askHead: { fontFamily: fonts.ui, fontSize: 15.5, fontWeight: 700, color: colors.textPrimary },
  askSub: { fontFamily: fonts.ui, fontSize: 13, lineHeight: 1.45, color: colors.textMuted },
  askForm: { display: 'flex', gap: 8, marginTop: 4 },
  askInput: {
    flex: 1, minWidth: 0, padding: '13px 15px', borderRadius: 12,
    border: `1px solid ${colors.borderGold}`, background: colors.surface,
    color: colors.textPrimary, fontFamily: fonts.ui, fontSize: 15, outline: 'none',
  },
  // The counter's ONE filled action. Everything else on this surface — the card's
  // add-to-cart, the gate, the section shortcuts — is transparent + hairline.
  askGo: {
    flex: '0 0 auto', padding: '13px 20px', borderRadius: radii.button, border: 'none', background: colors.action, color: colors.actionInk,
    fontFamily: fonts.ui, fontWeight: 700, fontSize: 15, cursor: 'pointer',
  },
  seeds: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  seed: {
    padding: '8px 13px', borderRadius: 999, border: `1px solid ${colors.border}`,
    background: colors.surface, color: colors.textSecondary,
    fontFamily: fonts.ui, fontSize: 13, fontWeight: 600, cursor: 'pointer',
  },
  answer: { marginTop: 4 },
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
