import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import EmptyState from './EmptyState.jsx';
import MessageBubble from './MessageBubble.jsx';
import TypingIndicator from './TypingIndicator.jsx';
import InputBar from './InputBar.jsx';
import GuestGate from './GuestGate.jsx';
import BottomNav from './BottomNav.jsx';
import ScanHome from './ScanHome.jsx';
import ScanSheet from './ScanSheet.jsx';
import MomentStub from './MomentStub.jsx';
import CartMoment from './CartMoment.jsx';
import { ListIcon, HaulIcon } from './Icons.jsx';
import { sendGuestChat } from '../lib/api.js';
import { runProductScan } from '../lib/logging.js';
import { recordGuestScan, guestPrefs } from '../lib/guestState.js';
import { useGuestCart } from '../lib/cart.js';
import { trackEvent } from '../lib/analytics.js';

// Lazy — only pulls the @zxing decoder when the scanner opens.
const CameraModal = lazy(() => import('./CameraModal.jsx'));

const rid = () =>
  (crypto.randomUUID && crypto.randomUUID()) || `id-${Date.now()}-${Math.random()}`;

// After this many real user→Kristy exchanges, the soft gate appears.
const GATE_AFTER = 4;

const INTRO = {
  greeting: "I'm Kristy.",
  subtitle: "Ask anything, or scan a label — no account needed to start.",
};
const CAP_LINE =
  "I've been paying attention. Sign in and none of it gets thrown away — your scans, your cart, and what you're shopping for.";
const LIMIT_LINE =
  "That's plenty for a taste. Sign in to keep going — your scans and your cart stick from there.";
const INVITE_LINE =
  "Sign in whenever you're ready — your scans, your haul, and what you're shopping for all stick from there.";
// The offer that matters: it arrives AFTER the cart exists, and it's about keeping
// what they already made — never "sign up to continue."
const SAVE_LINE =
  "Want this kept? Sign in and this cart — with everything you told me — is waiting next trip.";

// The stateless, gated app. Guests can SCAN and see the universal layer (what's in
// the food) for free — the acquisition hook. The goal-personalized note and the
// Haul/List surfaces stay behind the soft sign-in gate.
export default function GuestApp({ onOpenIngredient, onEditPrefs }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [exchanges, setExchanges] = useState(0);
  const [gate, setGate] = useState(null); // null | { line, terminal, reason }

  const invite = () => setGate({ reason: 'invite', line: INVITE_LINE, terminal: false });
  // Sign-in offered as PERSISTENCE, at the point where persistence is the thing
  // being asked for. Always dismissible — declining leaves the session fully usable.
  const save = () => setGate({ reason: 'save', line: SAVE_LINE, terminal: false });

  // The cart onboarding built, read back from guest state. Anything that genuinely
  // needs an account (composing, rebuilding) raises the save offer instead of dying.
  const cart = useGuestCart({ onNeedsAccount: save });
  const prefs = guestPrefs();

  // Home is the CART, not the scanner — a stranger arrives here straight off
  // onboarding and the cart is what they came for. Same rule as the signed-in app.
  const [moment, setMoment] = useState(cart.hasCart ? 'list' : 'scan');
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
          { id: rid(), role: 'ai', content: result.message || "I had trouble responding just now — give it another try in a sec.", macros: null },
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
      };
      setMessages((prev) => [...prev, aiMsg]);

      const next = exchanges + 1;
      setExchanges(next);
      if (next >= GATE_AFTER) setGate({ reason: 'cap', line: CAP_LINE, terminal: true });
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: rid(), role: 'ai', content: "I had trouble responding just now — give it another try in a sec.", macros: null },
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
      const result = await runProductScan(args); // guest detected (no session)
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
            ? "Couldn't read that one clearly — try another shot, better lit if you can."
            : "That scan didn't go through — give it another try in a sec.",
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
        <button className="guest-signin" onClick={cart.hasCart ? save : invite}>
          {cart.hasCart ? 'Save my cart' : 'Sign in'}
        </button>
      </header>

      {moment === 'chat' && (
        <>
          <div className="chat" ref={chatRef}>
            {showEmpty ? (
              <EmptyState onPick={(ex) => handleSend(ex)} greeting={INTRO.greeting} subtitle={INTRO.subtitle} />
            ) : (
              messages.map((m) => <MessageBubble key={m.id} message={m} />)
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
            />
          )}
          {moment === 'list' &&
            (cart.hasCart ? (
              <>
                {/* The taste, named honestly. This cart was generated at full
                    tailoring; the ones after it aren't, and saying so plainly is the
                    difference between a demo and a bait-and-switch. */}
                <div className="taste-banner">
                  <p className="taste-banner__line">
                    Built on everything you told me &mdash; what you&rsquo;re watching, what
                    you&rsquo;re working around, what to keep out. That&rsquo;s the full read.
                  </p>
                  <p className="taste-banner__sub">
                    Carts after this one run leaner until you start your free week.
                  </p>
                  {/* The offer, in place and non-blocking. It arrives once the cart
                      already exists, so it reads as keeping something rather than a
                      toll on the way in. */}
                  <div className="taste-banner__save">
                    <span className="taste-banner__saveline">{SAVE_LINE}</span>
                    <button type="button" className="taste-banner__savebtn" onClick={save}>
                      Keep it
                    </button>
                  </div>
                </div>
                <CartMoment
                  cart={cart}
                  goals={prefs?.coach_goals || []}
                  nonNegotiables={prefs?.non_negotiables || []}
                  focuses={prefs?.focuses || []}
                  constraints={prefs?.constraints || []}
                  onSetGoal={onEditPrefs}
                  onUpgrade={save}
                  onScan={() => { setMoment('scan'); setCameraOpen(true); }}
                  onAskAisle={save}
                />
              </>
            ) : (
              <MomentStub
                locked
                icon={<ListIcon size={26} />}
                title="Your cart"
                lockLine="Tell Kristy what you're shopping for and the cart comes built around it."
                ctaLabel="Set it up"
                onCta={onEditPrefs}
              />
            ))}
          {moment === 'haul' && (
            <MomentStub
              locked
              icon={<HaulIcon size={26} />}
              title="Your haul"
              lockLine="Scan all you like — your haul starts saving once you sign in."
              ctaLabel="Sign in"
              onCta={invite}
            />
          )}
        </div>
      )}

      <BottomNav
        active={moment}
        onList={() => setMoment('list')}
        onScan={() => { setMoment('scan'); setCameraOpen(true); }}
        onHaul={() => setMoment('haul')}
        onChat={() => setMoment('chat')}
      />

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
            setMoment('list');
          }}
          onOpenCart={() => { setScan(null); setMoment('list'); }}
        />
      )}

      {cameraOpen && (
        <Suspense fallback={null}>
          <CameraModal open={cameraOpen} onClose={() => setCameraOpen(false)} onScan={handleGuestScan} />
        </Suspense>
      )}

      {gate && <GuestGate line={gate.line} terminal={gate.terminal} onDismiss={() => setGate(null)} />}
    </div>
  );
}
