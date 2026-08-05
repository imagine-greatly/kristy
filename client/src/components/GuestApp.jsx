import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import EmptyState from './EmptyState.jsx';
import MessageBubble from './MessageBubble.jsx';
import TypingIndicator from './TypingIndicator.jsx';
import InputBar from './InputBar.jsx';
import GuestGate from './GuestGate.jsx';
import BottomNav from './BottomNav.jsx';
import ScanHome from './ScanHome.jsx';
import AisleMoment from './AisleMoment.jsx';
import ScanSheet from './ScanSheet.jsx';
import MomentStub from './MomentStub.jsx';
import Dashboard from './Dashboard.jsx';
import ShopMode from './ShopMode.jsx';
import { HaulIcon } from './Icons.jsx';
import { sendGuestChat } from '../lib/api.js';
import { runProductScan } from '../lib/logging.js';
import { recordGuestScan, guestPrefs } from '../lib/guestState.js';
import { useGuestCart } from '../lib/cart.js';
import { trackEvent } from '../lib/analytics.js';

// Lazy — only pulls the @zxing decoder when the scanner opens.
const CameraModal = lazy(() => import('./CameraModal.jsx'));
const ImportList = lazy(() => import('./ImportList.jsx'));

const rid = () =>
  (crypto.randomUUID && crypto.randomUUID()) || `id-${Date.now()}-${Math.random()}`;

// After this many real user→Kristy exchanges, the soft gate appears.
const GATE_AFTER = 4;

const INTRO = {
  greeting: 'Kristy.',
  subtitle: 'The box, and the counter it never came in. Ask anything. No account needed.',
};
const CAP_LINE =
  'Sign in and none of it gets thrown away. Your scans, your cart, your preferences.';
const LIMIT_LINE = 'That\'s the free run. Sign in to keep going.';
const INVITE_LINE = 'Sign in whenever. Your scans, haul and preferences stick from there.';
// NOT A SAVE LINE. It used to be — "Save your cart. Sign in, no password, just a text." —
// and it fronted two controls that both promised persistence for something already free.
// What actually needs an account here is a REBUILD, which reads a stored profile the guest
// does not have. That is what this says now, and it is the only thing it claims.
const ACCOUNT_LINE = 'Rebuilding reads your stored preferences. Sign in — no password, just a text.';

// The stateless, gated app. Guests can SCAN and see the universal layer (what's in
// the food) for free — the acquisition hook. The goal-personalized note and the
// Haul/List surfaces stay behind the soft sign-in gate.
export default function GuestApp({ onOpenIngredient, onEditPrefs }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [exchanges, setExchanges] = useState(0);
  const [gate, setGate] = useState(null); // null | { line, terminal, reason }
  const [importOpen, setImportOpen] = useState(false); // bring-your-own-list sheet

  // NO PLAN BUTTONS FOR A GUEST, and that is a decision rather than an omission. Buying
  // needs an account, an account needs a phone code, and phone codes are blocked on 10DLC
  // carrier registration — so a guest who tapped a plan would type a number, press Send
  // code, and wait for a message that cannot arrive. They keep the whole free surface and
  // the teaser, which still shows how much sits behind the gate. They are simply not
  // offered a purchase that cannot complete. See `purchasable` on AisleMoment.

  const invite = () => setGate({ reason: 'invite', line: INVITE_LINE, terminal: false });
  // Sign-in offered as PERSISTENCE, at the point where persistence is the thing
  // being asked for. Always dismissible — declining leaves the session fully usable.
  const save = () => setGate({ reason: 'save', line: ACCOUNT_LINE, terminal: false });

  const prefs = guestPrefs();
  // The stranger's cart. Building it by talking works with NO account (the public
  // composer); only a rebuild, which needs a stored profile, raises the save offer.
  const cart = useGuestCart({
    onNeedsAccount: save,
    prefs: {
      coach_goals: prefs?.coach_goals || [],
      non_negotiables: prefs?.non_negotiables || [],
      focuses: prefs?.focuses || [],
      constraints: prefs?.constraints || [],
    },
  });

  // Home is the CART either way. Empty, it asks what the trip is for — which is the
  // first thing a stranger should be answering, not a template they never requested.
  const [moment, setMoment] = useState('home');
  const [cameraOpen, setCameraOpen] = useState(false);
  const [scan, setScan] = useState(null); // null | { loading, mode, found, verdict, product, gate, error }

  const chatRef = useRef(null);

  useEffect(() => {
    const el = chatRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, typing]);

  const inputDisabled = typing || !!gate;

  async function handleSend(text) {
    const content = (text ?? input).trim();
    if (!content || inputDisabled) return;

    setInput('');
    const userMsg = { id: rid(), role: 'user', content, macros: null };
    const history = messages.slice(-10).map((m) => ({ role: m.role, content: m.content }));

    setMessages((prev) => [...prev, userMsg]);
    setTyping(true);

    try {
      const result = await sendGuestChat({ message: content, history });

      if (result.error) {
        setMessages((prev) => [
          ...prev,
          { id: rid(), role: 'ai', content: result.message || 'That didn\'t go through. Try again in a sec.', macros: null },
        ]);
        return;
      }

      if (result.gate) {
        setGate({
          reason: result.reason,
          line: result.kristyLine || (result.reason === 'limit' ? LIMIT_LINE : INVITE_LINE),
          terminal: result.reason === 'limit',
        });
        return;
      }

      const aiMsg = {
        id: rid(),
        role: 'ai',
        content: result.message,
        macros: null,
        // A counter question answered from the KB carries its entry, so a stranger
        // gets the same reference card and the same one-tap add.
        perimeterEntry: result.perimeterEntry || null,
      };
      setMessages((prev) => [...prev, aiMsg]);

      // A COUNTER answer does not spend the free run. It is a deterministic KB read
      // with no model call and nothing stored, and the counter is the free layer by
      // design — so charging it against a four-message budget puts a sign-in wall in
      // front of the exact thing a stranger came to try. The budget exists for the
      // model, and the model was never called.
      if (result.perimeter) return;

      const next = exchanges + 1;
      setExchanges(next);
      if (next >= GATE_AFTER) setGate({ reason: 'cap', line: CAP_LINE, terminal: true });
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: rid(), role: 'ai', content: "That didn’t go through. Try again in a sec.", macros: null },
      ]);
    } finally {
      setTyping(false);
    }
  }

  /* ── Guest scan — the funnel, fully live. Universal layer only (note stays null
        server-side). On the shared IP cap the server returns { gate }, surfaced as
        the terminal limit gate (same as chat), not a card. ── */
  async function runGuestScan(args) {
    if (gate) return;
    setCameraOpen(false);
    setScan({ loading: true, mode: args.mode });
    trackEvent('scan', { mode: args.mode, guest: true });
    try {
      // The stranger already told us what to keep out — honor it on the scan, or a
      // product they refuse comes back wearing the seal.
      const result = await runProductScan({ ...args, nonNegotiables: prefs.non_negotiables || [] });
      if (result?.gate) {
        setScan(null);
        setGate({ reason: 'limit', line: LIMIT_LINE, terminal: true });
        return;
      }
      setScan({ ...result, mode: args.mode });
      // Keep real scans (a resolved product with a verdict) so they survive sign-in —
      // replayed into the account's Haul instead of vanishing when GuestApp unmounts.
      if (result?.verdict && result.found !== false) {
        recordGuestScan({
          product_name: result.product?.name || null,
          brand: result.product?.brand || null,
          tier: result.verdict.tier,
          barcode: result.product?.barcode || null,
        });
      }
      if (result?.verdict) trackEvent('verdict', { tier: result.verdict.tier, guest: true });
    } catch {
      setScan({
        mode: args.mode,
        error: true,
        message:
          args.mode === 'label'
            ? "Couldn’t read that one. Try another shot, better lit."
            : "That scan didn’t go through. Try again in a sec.",
      });
    }
  }
  const handleGuestScan = (barcode) => runGuestScan({ mode: 'barcode', barcode });
  const handleGuestLabel = (file) => file && runGuestScan({ mode: 'label', file });

  const showEmpty = messages.length === 0 && !typing;

  return (
    <div className="app app--guest">
      <header className="topbar topbar--guest">
        <div className="guest-mark">Kristy</div>
        {/* ONE LABEL, AND IT IS NEVER "SAVE". A save control on a cart surface was removed
            once already — it asked for an action that had either happened or cannot happen,
            and the list is free either way. This header rebuilt it under a different name
            in a different component, which is why the gate test could not see it: that test
            greps `[data-save-list]` on the authenticated cart, and this is an unattributed
            button on the guest one. A control is not gone because one selector stopped
            finding it.

            The sign-in path itself is right and stays — a guest genuinely has no account.
            What goes is the word "Save", which promises persistence at a moment when phone
            sign-in is blocked on 10DLC, so the code it would send cannot arrive. Same
            reasoning as `purchasable={false}` on the plans. */}
        <button className="guest-signin" onClick={invite}>
          Sign in
        </button>
      </header>

      {moment === 'chat' && (
        <>
          <div className="chat" ref={chatRef}>
            {showEmpty ? (
              <EmptyState onPick={(ex) => handleSend(ex)} greeting={INTRO.greeting} subtitle={INTRO.subtitle} />
            ) : (
              messages.map((m) => (
                <MessageBubble key={m.id} message={m} onAddToCart={cart.add} />
              ))
            )}
            {typing && <TypingIndicator />}
          </div>

          <InputBar
            value={input}
            onChange={setInput}
            onSend={() => handleSend()}
            disabled={inputDisabled}
            // Guests CAN scan now — barcode/label run the real (universal) scan.
            onBarcode={() => setCameraOpen(true)}
            onVerdictFile={handleGuestLabel}
          />
        </>
      )}

      {moment !== 'chat' && (
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          {moment === 'scan' && (
            <ScanHome
              guest
              onScanBarcode={() => setCameraOpen(true)}
              onLabelFile={handleGuestLabel}
              onOpenChat={() => setMoment('chat')}
              onAskAisle={() => setMoment('aisle')}
            />
          )}
          {/* Free to browse, free to ask. No account anywhere in it. */}
          {moment === 'aisle' && (
            <AisleMoment
              onAddToCart={cart.add}
              prefs={{
                focuses: prefs?.focuses || [],
                hardLines: prefs?.non_negotiables || [],
                constraints: prefs?.constraints || [],
              }}
              onUpgrade={save}
              purchasable={false}
              onScan={() => setMoment('scan')}
            />
          )}
          {moment === 'home' && (
            <>
              {/* NO BANNER. This was the SECOND save control on this surface — "Keep it",
                  under "Save your cart", standing permanently above the list whenever a
                  cart existed. The header one is gone for reading as a toll on something
                  free; this one is worse, because it is the shape the rule names outright:
                  "The ask appears at ONE moment and nowhere else — not on open, not on a
                  scan, not on an ask, not on a save, never a banner."

                  Both survived the original removal by not being the component that was
                  stripped and not carrying the attribute the test greps. A repeated ask is
                  the thing that gets an app deleted, however kindly it is worded. */}
              {/* THE SAME HOME SURFACE THE ACCOUNT PATH GETS. A guest's cart has to behave
                  like a cart or the payoff is a screenshot rather than the product, and that
                  includes the hero that says what happens next. Two different home surfaces
                  is how the two would drift.

                  `seedable` is always false for a guest — trips are rows keyed to an account
                  and there is no account — so the `completed` state cannot fire here. That is
                  honest rather than a gap: they have no last week for the server to read. */}
              <Dashboard
                cart={cart}
                prefs={{
                  goal: '',
                  focuses: prefs?.focuses || [],
                  hardLines: prefs?.non_negotiables || [],
                  constraints: prefs?.constraints || [],
                }}
                goals={prefs?.coach_goals || []}
                nonNegotiables={prefs?.non_negotiables || []}
                focuses={prefs?.focuses || []}
                constraints={prefs?.constraints || []}
                onSetGoal={onEditPrefs}
                onUpgrade={save}
                onScan={() => setMoment('scan')}
                onAskAisle={() => setMoment('aisle')}
                onHaul={() => setMoment('haul')}
                /* THE WALK IS FREE, and omitting these is what made "Start shopping" dead on
                   production for every real visitor. Phone sign-in is blocked on 10DLC, so
                   `session` is null for everybody and this component — not App's dashboard
                   branch — is the only home surface anyone actually reaches. The hero was
                   rendering its button off a string literal and binding `onClick` to
                   undefined. See the note on Hero in Dashboard.jsx.

                   `onComplete` is deliberately NOT passed. Completing writes a `trips` row
                   keyed to an account, and a guest has none; the hero now renders that state
                   doorless rather than offering a button that cannot do what it says. Same
                   shape as `seedable` never firing `completed` here. */
                /* THE PHOTO PATH REACHES A SHOPPER NOW. This prop was absent, and CartMoment
                   renders its import control only `{onImport && …}`, so "Import a list" was
                   invisible on the only home surface anyone actually sees — the same omission
                   shape as the hero handlers. Its endpoint was broken too (req.userId) and had
                   no guest twin; all three had to land together or it still would not work. */
                onImport={() => setImportOpen(true)}
                onStartShopping={() => setMoment('shop')}
                onResume={() => setMoment('shop')}
              />
            </>
          )}
          {moment === 'haul' && (
            <MomentStub
              locked
              icon={<HaulIcon size={26} />}
              title="Your haul"
              lockLine="Scan all you like. Your haul starts saving once you sign in."
              ctaLabel="Sign in"
              onCta={invite}
            />
          )}
        </div>
      )}

      {/* SHOP MODE OWNS THE VIEWPORT, here exactly as it does on the account path. The bar is
          ABSENT rather than disabled — same rule App applies. */}
      {moment !== 'shop' && (
      <BottomNav
        active={moment}
        cartProgress={cart.progress}
        onList={() => setMoment('home')}
        onScan={() => setMoment('scan')}
        onAisle={() => setMoment('aisle')}
        onHaul={() => setMoment('haul')}
        onChat={() => setMoment('chat')}
      />
      )}

      {/* THE OTHER STATE. `position: fixed; inset: 0`, so it sits out here with the overlays
          rather than in the surface stack above. Exiting returns to the dashboard, where the
          hero reads RESUME — leaving shop mode never completes a trip.

          No `onComplete` and no `onSection`: the first needs an account (ShopMode already
          guards its finish button on the handler existing), and the second only exists to
          tell the scan sheet which aisle a shopper is standing in, which the guest scan
          sheet does not read. Both are optional by construction, not by accident. */}
      {moment === 'shop' && (
        <ShopMode
          cart={cart}
          prefs={{
            focuses: prefs?.focuses || [],
            hardLines: prefs?.non_negotiables || [],
            constraints: prefs?.constraints || [],
          }}
          onExit={() => setMoment('home')}
          onScan={() => setCameraOpen(true)}
          onUpgrade={save}
        />
      )}

      {scan && (
        <ScanSheet
          scan={scan}
          goal=""
          onClose={() => setScan(null)}
          onSignIn={invite}
          onLabelFile={handleGuestLabel}
          onOpenIngredient={onOpenIngredient}
          /* A scan a stranger keeps lands in the same cart onboarding built, so the
             trip is one object here too — not a card that evaporates on close. */
          onAddToCart={({ name, tier, barcode }) => {
            cart.addScan({ name, tier, barcode });
            setScan(null);
            setMoment('home');
          }}
          onOpenCart={() => { setScan(null); setMoment('home'); }}
        />
      )}

      {cameraOpen && (
        <Suspense fallback={null}>
          <CameraModal open={cameraOpen} onClose={() => setCameraOpen(false)} onScan={handleGuestScan} />
          {importOpen && (
            <ImportList
              onClose={() => setImportOpen(false)}
              onImported={(list, summary) => {
                cart.applyList(list, summary);
                setMoment('home');
              }}
            />
          )}
        </Suspense>
      )}

      {gate && <GuestGate line={gate.line} terminal={gate.terminal} onDismiss={() => setGate(null)} />}

    </div>
  );
}
