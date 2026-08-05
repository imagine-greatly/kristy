import { useEffect, useState } from 'react';
import { colors, fonts, kristyVoice, radii } from '../lib/tokens.js';
import { CloseIcon } from './Icons.jsx';
import AmbientIsm from './AmbientIsm.jsx';
import CounterCard from './CounterCard.jsx';
import FillRow from './FillRow.jsx';
import { fetchCardSummaries } from '../lib/perimeter.js';
import { useCardMeter } from '../lib/cardMeter.js';

/* ═══════════════════════ The cart — THE LIST BODY ═══════════════════════
   The trip, as a structured object you act on by touch: what to get, what's checked,
   what Kristy flagged, what she'd swap. Everything a normal
   trip needs is a TAP — check, swap, ask, remove, add, scan. The docked composer
   below is for the messy stuff taps can't express; nothing here requires it.

   THIS FILE USED TO BE THE WHOLE SURFACE and is now one part of it. Its header
   (`CartHeader.jsx`) and its entry question (`TripQuestion.jsx`) moved out to the
   dashboard, which answers "what happens next" one level up. That was not a tidying pass:
   rendering a hero above this component printed the trip's standing TWICE — "Your cart /
   4 of 15 in the cart" directly under "Produce — 4 of 7" — and in the empty state the trip
   question repeated the hero verbatim, both lines, on one screen.

   What stays here is everything about the LIST: the walk sections, the collapse, the
   attachments, the offers, the add row. The composer decides how the trip announces
   itself; this decides how it reads.

   Kristy's coaching lives IN the object: her blend intro at the top, a verdict chip
   on anything scanned, her haul callouts as gold-ruled rows, and — on tap — the
   perimeter reference card (the "what to look for" checklist) inline under the item.
   A shopper scrolling the cart absorbs her read without opening chat.

   Tokens only; her spoken lines are kristyVoice, everything factual is Inter. */

/* THE SECTIONS ARE THE COUNTER'S, and this file no longer holds a second opinion about
   the store. It used to: ten display sections mapped from PICK categories by a local
   table, plus a regex that sniffed item names for dairy and frozen. That vocabulary
   predated the corpus, merged meat and seafood where the counter splits them, and was
   free to drift from the filing the knowledge itself uses.

   Order, titles and the one location rule now live in lib/listSections.js, mirrored from
   the server and pinned by listSectionsMirror.test.js. Which CARD a row gets is decided
   once, on the server, at attach time — never here. */
import { groupForWalk, LIST_SECTIONS } from '../lib/listSections.js';

/* ───────── Her read on a row, at a glance ─────────
   Only a genuine distinction is labelled. A template row carries no tag — tagging
   every row "Kristy added" read as personalization when it meant the opposite. */
const TIER_FLAG = {
  approved: { label: 'Approved', fg: colors.accentSeafoam, bd: colors.accentMint, bg: colors.mintTint9 },
  approved_with_note: { label: 'With a note', fg: colors.accentGold, bd: colors.gold30, bg: colors.goldTint9 },
  use_with_intention: { label: 'With intention', fg: colors.accentGold, bd: colors.gold30, bg: colors.goldTint9 },
  swap_recommended: { label: "She’d swap this", fg: colors.error, bd: colors.dangerBorder, bg: colors.dangerTint },
  skip: { label: "She’d skip this", fg: colors.error, bd: colors.dangerBorder, bg: colors.dangerTint },
};
const flagged = (it) => it.source === 'swap' || it.tier === 'swap_recommended' || it.tier === 'skip';

/* ───────── One row: a name, a box, and nothing else ─────────
   THE ROW IS FOR CHECKING OFF. It carries the shopper's own item and a 44px target to
   tick it with — the visual square stays 24px, and the padding around it is what makes
   this usable one-handed in an aisle. Everything Kristy has to say about it lives in the
   attachment below, which is shared when two rows resolve to the same card.

   ONE PROSE LINE PER ROW, AND WHEN THERE IS A CARD IT IS THE CARD'S. This once read "a
   row can carry both; the authored line is hers about this pick, the do line is the card's
   about the subject" — true, and still the wrong call in a store. The `why` sells the item
   to someone who has already written it down; the do line tells them how to buy it at the
   shelf. Only the second does any work while standing there, so a matched row is name +
   eyebrow + do, and the `why` is suppressed.

   An UNMATCHED row keeps its `why`, because it is the only prose that row has.

   The signal is `hasCard` from the block rather than `item.cardSlug` on the row: the
   attachment renders only once its summary has arrived, and suppressing on the slug alone
   would blank the prose for the length of that fetch and leave the row with nothing at all
   if it failed. Suppress exactly when the replacement is on screen. */
function CartRow({ item, hasCard, mixed, onToggle, onRemove, onKeep, onTakeOffer, onFix }) {
  const [fixTo, setFixTo] = useState(item.name === 'Unreadable item' ? '' : item.name);
  const isSwapCallout = item.source === 'swap';
  const flag = item.tier ? TIER_FLAG[item.tier] : null;
  const checked = !!item.checked;

  /* "YOU ADDED" ONLY WHERE IT DISTINGUISHES SOMETHING. The tag exists to separate the
     shopper's own rows from Kristy's, and on a hand-typed list EVERY row is theirs — so it
     rendered twelve times on a twelve-item cart, cost a line each, and told nobody
     anything. That is the same failure the tag was introduced to fix, running the other
     way: the original note here says "tagging every row 'Kristy added' read as
     personalization when it meant the opposite."

     So it renders only when the cart is actually MIXED. `mixed` is computed once over the
     whole list rather than guessed per row, because "is this row distinguishable" is a
     question about the list, not about the row. */
  const showAdded = mixed && item.source === 'user' && item.category !== 'From your haul';

  return (
    <div style={styles.row} data-cart-row={item.id}>
      <div style={styles.rowHead}>
        <button
          type="button"
          onClick={() => onToggle(item.id)}
          aria-pressed={checked}
          aria-label={checked ? `Uncheck ${item.name}` : `Check off ${item.name}`}
          style={styles.tapTarget}
          data-check
        >
          <span
            style={{
              ...styles.checkbox,
              borderColor: checked ? colors.accentGold : colors.checkboxRest,
              background: checked ? colors.accentGold : 'transparent',
              color: colors.bgDeep,
            }}
          >
            {checked ? '✓' : ''}
          </span>
        </button>

        <div style={styles.rowBody}>
          <span
            data-name
            style={{
              ...styles.itemName,
              ...(isSwapCallout ? styles.itemNameSwap : null),
              ...(checked && !isSwapCallout ? styles.itemNameChecked : null),
            }}
          >
            {item.name}
          </span>

          {item.why && !hasCard && <span data-why style={styles.itemWhy}>{item.why}</span>}

          {/* A ROW WE COULD NOT READ SAYS SO, AND CAN BE FIXED HERE.
              `needsFix` and `note` have been written by listImport since imports shipped and
              NOTHING rendered them — the server wrote "Couldn't read this one — tap to fix it."
              for a tap that did not exist. So a confident misread ("tp" transcribed as
              "butter") landed as an ordinary row and shopped like a real one. Measured after
              the vision prompt was tightened: crossed-out lines now drop 9/9, but a misread
              still recurred 1 in 9 — the prompt reduces it and cannot close it, which is why
              the EDITABLE path is the actual fix rather than a nicety. Same shape as a false
              gold seal: a wrong read presented as fact. */}
          {item.needsFix && onFix && (
            <form
              data-needs-fix
              style={styles.fixRow}
              onSubmit={(e) => {
                e.preventDefault();
                const v = fixTo.trim();
                if (v) onFix(item.id, v);
              }}
            >
              <span style={styles.needsFix}>{item.note || 'Couldn’t read this one.'}</span>
              <span style={styles.fixInputRow}>
                <input
                  style={styles.fixInput}
                  value={fixTo}
                  onChange={(e) => setFixTo(e.target.value)}
                  placeholder="What does it say?"
                  aria-label={`Correct the item we could not read${item.name ? `: ${item.name}` : ''}`}
                />
                <button type="submit" style={styles.fixBtn} disabled={!fixTo.trim()}>
                  Fix it
                </button>
              </span>
            </form>
          )}

          {(showAdded || item.refined || flag) && (
            <span style={styles.itemMeta}>
              {showAdded && <span style={styles.tagQuiet}>You added</span>}
              {item.refined && <span style={styles.tagGold}>Kristy&rsquo;s pick</span>}
              {flag && <span style={{ ...styles.flag, color: flag.fg, background: flag.bg }}>{flag.label}</span>}
            </span>
          )}
        </div>

        {/* AN UNMATCHED ROW KEEPS ITS CART CATEGORY AS A LABEL, not as a section. It
            renders only where the row actually has one, so most trailing rows show
            nothing — inconsistent presence is honest, and inventing a category so every
            row had one would be the drifting second index all over again. */}
        {!item.cardSlug && TRAILING_LABEL(item) && (
          <span data-cat-label style={styles.catLabel}>{TRAILING_LABEL(item)}</span>
        )}

        <button
          type="button"
          style={styles.rowRemove}
          onClick={() => onRemove(item.id)}
          aria-label={`Remove ${item.name}`}
        >
          <CloseIcon size={13} />
        </button>
      </div>

      {/* KRISTY’S ONE COMMENT. It sits BESIDE the item, never on it — the name above
          is untouched, nothing is struck through, and the row is not going anywhere.
          One line, two answers, and both of them end it: take the swap, or keep what
          you picked. Whichever you choose, this never appears on that item again. */}
      {item.swapOffer && !checked && (
        <div style={styles.offer}>
          <p style={{ ...kristyVoice, ...styles.offerLine }}>{item.swapOffer}</p>
          <div style={styles.offerActions}>
            {item.swapTo && onTakeOffer && (
              <button type="button" style={styles.offerTake} onClick={() => onTakeOffer(item.id)}>
                Swap it
              </button>
            )}
            {onKeep && (
              <button type="button" style={styles.offerKeep} onClick={() => onKeep(item.id)}>
                Keep mine
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

// A cart category worth showing beside an unmatched row. 'Added' is the default
// `cart.add` stamps on anything typed, so it is a null rather than a category — and
// the live-group categories name their own section header already.
const HIDDEN_CATEGORIES = new Set(['Added', 'Pantry', 'From your haul', 'Scanned']);

// AND IT MAY NEVER BE THE NAME OF A SECTION. A category that names a walk section now sorts
// the row INTO that section (sectionForCartCategory), so reaching this line with one would
// mean the row is displaying a section it was not sorted into — the exact incoherence that
// put three Produce-labelled rows under "Everything else". Sorting is the fix; this is the
// structural guarantee that it stays fixed, because a label can no longer say `Produce` at
// all. Every remaining label — Bakery, Snacks, Protein — names no section, so it cannot lie.
const SECTION_TITLES = new Set(LIST_SECTIONS.map((s) => s.title));
const TRAILING_LABEL = (item) => {
  const c = item.category;
  if (!c || HIDDEN_CATEGORIES.has(c) || SECTION_TITLES.has(c)) return null;
  return c;
};

/* ───────── A BLOCK: one card, and every row that claimed it ─────────
   This is the collapse. Blueberries and strawberries both resolve to `berries_picking`,
   and rendering that card twice reads as a bug — so the rows sit together and share one
   attachment, tied to them by the brass rule down its left edge.

   THE ATTACHMENT IS TWO LINES AND A TAP. Eyebrow, then the do line: the one thing a
   shopper can act on without reading anything else. Everything below it — the headline,
   the checks, the traps, the sources — is behind the tap, because a 30-item list has to
   still read as a list.

   NO TIER CHIP HERE. A list is things to buy; a tier is a claim about evidence, and on a
   row it is furniture raising a question nobody is asking mid-task. The chip travels with
   the tap and is the first thing on the opened card. */
function CartBlock({ block, card, mixed, open, onOpen, onToggle, onRemove, onKeep, onTakeOffer, onFix, onRequestFull, onUpgrade }) {
  const hasCard = Boolean(block.slug && card);
  const allChecked = block.items.every((i) => i.checked);
  const isSwap = block.items[0]?.source === 'swap';

  return (
    <div
      style={{
        ...(hasCard ? styles.block : styles.blockPlain),
        ...(isSwap ? styles.blockSwap : null),
        ...(hasCard && allChecked ? styles.blockChecked : null),
      }}
      data-cart-block={block.slug || 'none'}
    >
      {block.items.map((it) => (
        <CartRow
          key={it.id}
          item={it}
          hasCard={hasCard}
          mixed={mixed}
          onToggle={onToggle}
          onRemove={onRemove}
          onKeep={onKeep}
          onTakeOffer={onTakeOffer}
          onFix={onFix}
        />
      ))}

      {hasCard && !open && (
        <button
          type="button"
          style={styles.attach}
          onClick={() => onOpen(block.slug)}
          aria-expanded={false}
          data-attach={block.slug}
        >
          <span data-attach-eyebrow style={styles.attachEyebrow}>{card.kind === 'home' ? `At home · ${card.eyebrow}` : card.eyebrow}</span>
          <span data-attach-do style={styles.attachDo}>
            <span data-do-text>{card.do}</span>
            <span style={styles.attachChev} aria-hidden="true">›</span>
          </span>
        </button>
      )}

      {hasCard && open && (
        <div style={styles.cardOpen}>
          {/* THE CARD ITSELF, through the same renderer the Counter uses. `onAddToCart` is
              deliberately NOT passed: this card is open BECAUSE the item is already on the
              list, so its cart pick would add a second row for the thing the shopper is
              standing there holding. On the Counter that button is the point; here it is a
              duplicate generator. */}
          <CounterCard
            card={card}
            compact
            defaultOpen={false}
            onRequestFull={onRequestFull}
            onUpgrade={onUpgrade}
          />
          <button type="button" style={styles.attachClose} onClick={() => onOpen(null)}>
            Close
          </button>
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
  onComplete,
}) {
  const [openSlug, setOpenSlug] = useState(null);
  const [cards, setCards] = useState({}); // slug → the card summary
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');

  const { list, premium, loading, note, progress } = cart;

  /* THE CARDS FOR THIS CART, in one request. The server stamped `cardSlug` on each row at
     attach time; this fetches the free summary for the distinct slugs on the list. Keyed
     on the sorted slug string so checking items off — which changes the list on every tap
     and nothing about which cards are on it — issues no traffic at all. */
  const slugKey = [...new Set((list?.items || []).map((i) => i.cardSlug).filter(Boolean))]
    .sort()
    .join(',');

  useEffect(() => {
    if (!slugKey) return;
    let alive = true;
    fetchCardSummaries(slugKey.split(',')).then((got) => {
      if (alive) setCards((cur) => ({ ...cur, ...got }));
    });
    return () => {
      alive = false;
    };
  }, [slugKey]);

  /* THE READ METER IS `useCardMeter`, AND IT IS THE ONLY ONE. This file used to carry its
     own copy of it beside AisleMoment's — same call, same counter, same words, written out
     twice and kept in agreement by hand. Its own comment explained why that was dangerous.
     A card opened from a list row and the same card opened by browsing cost a shopper
     exactly the same thing because they are now literally the same function. */
  const { requestFull, view } = useCardMeter(onUpgrade);

  /* THE LIST IS FREE, ALL OF IT — building it, saving it, keeping it next week. There is
     no save control here and there must not be one again.

     There used to be. It rendered for non-premium shoppers only and opened the upgrade
     ask, which was dishonest in the most literal way available: every cart mutation
     already POSTs to /api/list, so the save it was asking them to pay for had happened
     before the button was drawn. A prompt over a completed action is worse than a wall —
     a wall at least tells the truth about where the boundary is.

     The paid product is the full read. The list is the retention engine, and metering the
     thing that brings someone back next week works against what it is for. */

  function submitAdd(e) {
    e?.preventDefault();
    const name = draft.trim();
    if (!name) return;
    cart.add(name);
    setDraft('');
  }

  /* ── No trip underway → THE COMPOSER ASKS, not this file. ──
     The entry state is `TripQuestion`, and it now belongs to the surface above: the
     dashboard's hero asks what the trip is for, and the question renders beneath it with
     its heading suppressed. Rendering both printed the same two lines twice.

     Loading stays here, because it is a fact about the CART rather than about the trip —
     the composer cannot know the list is still in flight. */
  const hasItems = list && Array.isArray(list.items) && list.items.length > 0;
  if (!hasItems) {
    return loading ? (
      <div style={styles.wrap}>
        <p style={{ ...kristyVoice, ...styles.intro }}>Pulling your cart together&hellip;</p>
      </div>
    ) : null;
  }

  const groups = groupForWalk(list.items);

  // Is there anything for "You added" to distinguish this row FROM? A cart of purely
  // typed rows has no contrast to draw, so the tag says nothing on every one of them.
  const shoppable = list.items.filter((i) => i.source !== 'swap');
  const mixedSources = shoppable.some((i) => i.source !== 'user');

  return (
    <div style={styles.wrap}>
      {/* Her one-line read on the whole cart — the blend, named in her voice. */}
      {list.intro && <p style={{ ...kristyVoice, ...styles.intro }}>{list.intro}</p>}
      {/* On a BUILD the compose summary becomes the cart’s intro, so showing the note
          as well printed her sentence twice, one under the other. The note is for an
          EDIT ("rice out, couscous in") — a line the intro doesn’t already carry. */}
      {note && note !== list.intro && <p style={{ ...kristyVoice, ...styles.note }}>{note}</p>}

      {!goals.length && onSetGoal && (
        <button type="button" style={styles.linkBtn} onClick={onSetGoal}>
          Set how you eat →
        </button>
      )}

      {/* The two ways to fill it, side by side and identical. */}
      <FillRow onScan={onScan} onAskAisle={onAskAisle} />

      {/* Someone who already wrote a list shouldn’t have to retype it into a cart.
          Deliberately quieter than the two fill actions: most trips don’t start from
          a piece of paper. */}
      {onImport && (
        <button type="button" style={styles.linkBtn} onClick={onImport}>
          Import a list →
        </button>
      )}

      {/* THE UPGRADE NUDGE IS GONE, AND IT IS THE SECOND ASK REMOVED FROM THIS SURFACE.
          The first was "Save this list", which asked for money for a save that had already
          happened. This one was quieter and broke the same rule: it rendered whenever
          `premium === false` and the cart had rows, carried "Unlock the full cart" into the
          Upgrade screen, and did it ON OPEN, as a BANNER. THE ASK APPEARS AT ONE MOMENT —
          the fourth full-read tap — and the rule names this shape outright: "not on open,
          not on a scan, not on an ask, not on a save, never a banner."

          Its line was also the weakest argument available for membership. "Basic cart" is a
          judgement on something the shopper built themselves, printed above their own rows,
          every single load — which is the nagging that gets an app deleted, in the one place
          it can do the most damage.

          What membership actually shapes about a cart (focus-aware picks, haul swaps folding
          in) is a real difference and it is visible in the rows themselves. It does not need
          a banner to announce it, and `cartFree.test.js` now greps what a SHOPPER READS
          across all of client/src so this cannot come back a third time wearing new markup. */}

      <div style={styles.groups}>
        {groups.map((g) => (
          <div key={g.id || 'trailing'} style={styles.group} data-walk-section={g.id || 'trailing'}>
            <div data-group-label style={styles.groupLabel}>{g.title}</div>
            {g.blocks.map((b) => (
              <CartBlock
                key={b.key}
                block={b}
                card={b.slug ? view(cards[b.slug]) : null}
                mixed={mixedSources}
                open={openSlug === b.slug}
                onOpen={setOpenSlug}
                onToggle={cart.toggle}
                onRemove={cart.remove}
                onKeep={cart.keepItem}
                onTakeOffer={cart.takeOffer}
                /* THE FIX IS A RENAME, reusing the primitive the perimeter refinement already
                   uses: cart.refine sets the name, marks the row refined, and clears
                   needsFix/note so a corrected row stops flagging itself. Passed from HERE
                   because `cart` is in scope here and not inside CartBlock — a handler defined
                   in the wrong component compiles cleanly and throws at render, which is the
                   dead-reference defect this file has already shipped once. */
                onFix={cart.refine}
                onRequestFull={requestFull}
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
          re-asked — this is how they say "that trip’s done, start me over." */}
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


const styles = {
  wrap: { maxWidth: 520, margin: '0 auto', width: '100%', boxSizing: 'border-box', padding: '18px 18px 24px', display: 'flex', flexDirection: 'column', gap: 14 },


  // The finished trip, announced on the cart instead of hijacking the opening surface.


  intro: { margin: 0, fontSize: 16, lineHeight: 1.5, color: colors.textPrimary },
  note: { margin: '2px 0 0', fontSize: 15, lineHeight: 1.5, color: colors.textSecondary },
  linkBtn: { alignSelf: 'flex-start', padding: 0, background: 'transparent', border: 'none', color: colors.textSecondary, fontFamily: fonts.ui, fontSize: 13.5, cursor: 'pointer' },

  /* THE TWO WAYS TO FILL THE CART. Byte-identical styling on purpose: same width,
     same border, same gold, same type. Whatever is true of one is true of the other,
     which is the entire point of the row. */


  // Sections breathe — a bigger gap BETWEEN groups than between rows, so the eye reads
  // "produce, then meat" rather than one undifferentiated column.
  groups: { display: 'flex', flexDirection: 'column', gap: 26, marginTop: 6 },
  group: { display: 'flex', flexDirection: 'column', gap: 10 },
  groupLabel: {
    fontFamily: fonts.ui, fontSize: 10, fontWeight: 600, letterSpacing: '0.14em',
    textTransform: 'uppercase', color: colors.textMuted, opacity: 0.75, paddingLeft: 2, marginBottom: 2,
  },

  /* A BLOCK is one card and every row that claimed it. It is defined by sitting a step
     lighter than the ground plus a soft shadow — not by an outline. Borders on every row
     read as noise and flattened the hierarchy; the only outline left is gold.

     AN UNMATCHED ROW DOES NOT LIFT. `blockPlain` has no surface and no shadow, so the
     contrast is what says Kristy showed up for this one — and it is what keeps a 30-item
     list with few matches from reading as thirty stacked cards. */
  block: {
    borderRadius: 14, border: 'none', background: colors.surface, overflow: 'hidden',
    boxShadow: `inset 0 1px 0 ${colors.edgeHighlight}, ${colors.shadowCard}`,
    transition: 'background 0.16s ease, box-shadow 0.16s ease',
  },
  blockPlain: { borderRadius: 14, background: 'transparent', boxShadow: 'none' },
  // Her callout is the ONE block that gets gold, because it's the one she's flagging.
  blockSwap: { borderLeft: `3px solid ${colors.accentGold}`, background: colors.goldTint9 },
  // Checked recedes: it drops back toward the ground instead of holding its lift.
  blockChecked: { background: colors.bg, boxShadow: 'none' },

  row: { display: 'flex', flexDirection: 'column' },
  rowHead: { display: 'flex', alignItems: 'flex-start', gap: 4, padding: '3px 11px 3px 4px' },

  /* THE TAP TARGET IS 44px AND THE SQUARE STAYS 24px. The box was 24×24 with nothing
     around it, which is under every one-handed guideline there is and this is an app used
     while pushing a trolley. The padding is the whole fix; nothing about the row's look
     changes. */
  tapTarget: {
    flex: '0 0 auto', width: 44, height: 44,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 0, border: 'none', background: 'transparent', cursor: 'pointer',
  },
  checkbox: {
    width: 24, height: 24, borderRadius: 7, border: '1.5px solid',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700,
  },
  rowBody: { flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 3, paddingTop: 11 },
  catLabel: {
    flex: '0 0 auto', alignSelf: 'center',
    fontFamily: fonts.ui, fontSize: 9.5, fontWeight: 700, letterSpacing: '0.08em',
    textTransform: 'uppercase', color: colors.textMuted, opacity: 0.7, whiteSpace: 'nowrap',
  },
  rowRemove: {
    flex: '0 0 auto', width: 40, height: 44, marginRight: -8,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: 'none', background: 'transparent', color: colors.textMuted, opacity: 0.5, cursor: 'pointer',
  },

  /* THE ATTACHMENT. Two lines and a tap: the eyebrow, then the do line. The brass rule
     down its left edge is what ties it to the rows above — that is how a card shared by
     two rows reads as belonging to both without repeating either name. */
  attach: {
    display: 'block', width: 'calc(100% - 54px)', boxSizing: 'border-box', textAlign: 'left',
    margin: '2px 15px 13px 39px', padding: '0 0 0 11px',
    borderLeft: `2px solid ${colors.accentGoldMuted}`,
    background: 'transparent', cursor: 'pointer',
    borderTop: 'none', borderRight: 'none', borderBottom: 'none',
  },
  attachEyebrow: {
    display: 'block', marginBottom: 3,
    fontFamily: fonts.ui, fontSize: 10, fontWeight: 700, letterSpacing: '0.09em',
    textTransform: 'uppercase', color: colors.textMuted,
  },
  attachDo: {
    display: 'flex', gap: 8, alignItems: 'flex-start',
    fontFamily: fonts.ui, fontSize: 13.5, lineHeight: 1.45, color: colors.textBody,
  },
  attachChev: { flex: '0 0 auto', color: colors.textMuted, opacity: 0.6, fontSize: 16, lineHeight: 1.2 },
  cardOpen: {
    margin: '2px 15px 14px 39px', width: 'calc(100% - 54px)', boxSizing: 'border-box',
    display: 'flex', flexDirection: 'column', gap: 8,
  },
  attachClose: {
    alignSelf: 'flex-start', padding: '8px 0', minHeight: 40,
    border: 'none', background: 'transparent', color: colors.textMuted,
    fontFamily: fonts.ui, fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
  },
  itemName: { fontFamily: fonts.ui, fontSize: 15, fontWeight: 600, lineHeight: 1.3, color: colors.textPrimary, overflowWrap: 'anywhere' },
  itemNameSwap: { ...kristyVoice, fontSize: 15.5, fontWeight: 400, color: colors.textPrimary },
  itemNameChecked: { color: colors.textMuted, textDecoration: 'line-through' },

  // Her reasoning. Playfair italic so it reads as HER, not as a product subtitle.
  itemWhy: { ...kristyVoice, fontSize: 13.5, lineHeight: 1.45, color: colors.textMuted, overflowWrap: 'anywhere' },

  /* DEMOTED BY SIZE, NEVER BY OPACITY — the shop-mode contrast lesson applies here too. 13px
     at full textSecondary, no transparency, so the one row that most needs reading is not the
     one rendered faintest. */
  needsFix: {
    fontFamily: fonts.ui, fontSize: 13, lineHeight: 1.45, color: colors.textSecondary,
    overflowWrap: 'anywhere',
  },
  fixRow: { display: 'flex', flexDirection: 'column', gap: 5, marginTop: 2, width: '100%' },
  fixInputRow: { display: 'flex', gap: 6, alignItems: 'stretch', width: '100%' },
  fixInput: {
    flex: 1, minWidth: 0, minHeight: 40, padding: '8px 11px', borderRadius: 10,
    border: `1px solid ${colors.borderGold}`, background: colors.bg, color: colors.textPrimary,
    fontFamily: fonts.ui, fontSize: 14, outline: 'none',
  },
  fixBtn: {
    padding: 0, border: 'none', background: 'transparent', color: colors.accentGold,
    fontFamily: fonts.ui, fontSize: 13, fontWeight: 700, cursor: 'pointer', textDecoration: 'underline',
  },

  itemMeta: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 3 },
  tagQuiet: { fontFamily: fonts.ui, fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: colors.textMuted, opacity: 0.8 },
  tagGold: { fontFamily: fonts.ui, fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: colors.accentGoldMuted },
  // Tinted fill, no outline — the colour already carries the meaning.
  flag: { fontFamily: fonts.ui, fontSize: 10.5, fontWeight: 700, padding: '3px 9px', borderRadius: 999, whiteSpace: 'nowrap' },

  /* Her one comment. Deliberately quiet: no red, no warning colour, no icon. A flag
     that looks like an alarm is a scolding however it is worded, and this is a door
     held open, not a correction. */
  offer: {
    display: 'flex', flexDirection: 'column', gap: 8,
    margin: '2px 0 0 34px', padding: '10px 12px 11px', borderRadius: 11,
    background: colors.bg, borderLeft: `2px solid ${colors.gold30}`,
  },
  offerLine: { margin: 0, fontSize: 14, lineHeight: 1.45, color: colors.textSecondary },
  offerActions: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  offerTake: {
    padding: '7px 13px', borderRadius: 999, border: `1px solid ${colors.borderGold}`,
    background: colors.goldTint9, color: colors.textPrimary,
    fontFamily: fonts.ui, fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
  },
  offerKeep: {
    padding: '7px 13px', borderRadius: 999, border: `1px solid ${colors.border}`,
    background: 'transparent', color: colors.textMuted,
    fontFamily: fonts.ui, fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
  },

  // The drawer is the elevated layer — no divider rule needed, the lift does that work.

  /* Her sourced detail, read straight from the perimeter KB — a reference card, not
     chat prose. Sits on the ground colour so it reads as inset within the raised row. */

  addOpen: {
    alignSelf: 'stretch', minHeight: 46, padding: '12px 14px', borderRadius: 12,
    border: `1px dashed ${colors.border}`, background: 'transparent', color: colors.textSecondary,
    fontFamily: fonts.ui, fontSize: 14.5, fontWeight: 600, cursor: 'pointer',
  },
  addRow: { display: 'flex', gap: 8 },
  addInput: { flex: 1, minWidth: 0, padding: '11px 14px', borderRadius: 11, border: `1px solid ${colors.border}`, background: colors.surface, color: colors.textPrimary, fontFamily: fonts.ui, fontSize: 15, outline: 'none' },
  addBtn: { flex: '0 0 auto', padding: '11px 18px', borderRadius: 11, border: `1px solid ${colors.borderGold}`, background: 'transparent', color: colors.textSecondary, fontFamily: fonts.ui, fontWeight: 600, fontSize: 15, cursor: 'pointer' },

  rebuild: { alignSelf: 'flex-start', padding: '9px 16px', borderRadius: 999, border: `1px solid ${colors.border}`, background: 'transparent', color: colors.textMuted, fontFamily: fonts.ui, fontWeight: 600, fontSize: 13, cursor: 'pointer' },


  /* ── The entry question ── */
  // The cart's ONE filled action.


  footRow: { display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' },
  rebuildGhost: { padding: '9px 16px', borderRadius: 999, border: 'none', background: 'transparent', color: colors.textMuted, fontFamily: fonts.ui, fontWeight: 600, fontSize: 13, cursor: 'pointer' },
};
