import { useEffect, useRef, useState } from 'react';
import EmptyState from './EmptyState.jsx';
import MessageBubble from './MessageBubble.jsx';
import TypingIndicator from './TypingIndicator.jsx';
import InputBar from './InputBar.jsx';
import GuestGate from './GuestGate.jsx';
import VerdictCard from './VerdictCard.jsx';
import { sendGuestChat } from '../lib/api.js';
import { sendGuestVerdict } from '../lib/logging.js';

const rid = () =>
  (crypto.randomUUID && crypto.randomUUID()) || `id-${Date.now()}-${Math.random()}`;

// After this many real user→Kristy exchanges, the soft gate appears.
const GATE_AFTER = 4;

// Kristy's intro on load, and the two client-side gate lines. (Memory-gate lines
// come from the server per the specific action; these cover the cap, the rate
// limit, and the always-available "Sign in" affordance.)
const INTRO = {
  greeting: "I'm Kristy.",
  subtitle:
    "Tell me what you ate and I'll break it down — no account needed to start.",
};
const CAP_LINE =
  "I've been paying attention. Sign in and I'll remember all of it — your meals, your patterns, your targets.";
const LIMIT_LINE =
  "That's plenty for a taste. Sign in to keep going, and I'll start remembering everything you log.";
const INVITE_LINE =
  "Sign in whenever you're ready and I'll start remembering everything — your meals, your patterns, your targets.";

// This is the real app, minus persistence: same chat components, same styling,
// same Kristy — just stateless and gated. Guest turns hit /api/guest/chat and
// are never written anywhere.
export default function GuestApp() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [exchanges, setExchanges] = useState(0);
  // gate: null | { line, terminal, reason }. Terminal gates (cap / rate limit)
  // can't be dismissed; a memory gate or the manual "Sign in" can.
  const [gate, setGate] = useState(null);
  // Kristy's Verdict overlay — the acquisition funnel, fully open to guests.
  const [verdict, setVerdict] = useState(null); // null | { loading, data, error }

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
    const history = messages
      .slice(-10)
      .map((m) => ({ role: m.role, content: m.content }));

    setMessages((prev) => [...prev, userMsg]);
    setTyping(true);

    try {
      const result = await sendGuestChat({ message: content, history });

      // Upstream failure — server handed back a Kristy-voiced { error, message }.
      // Render it as a normal bubble and don't count it toward the exchange cap.
      if (result.error) {
        setMessages((prev) => [
          ...prev,
          {
            id: rid(),
            role: 'ai',
            content:
              result.message ||
              "I had trouble responding just now — give it another try in a sec.",
            macros: null,
          },
        ]);
        return;
      }

      // Server tripped a soft gate (memory action or IP rate limit) — show it
      // instead of a normal reply. The conversation stays visible behind it.
      if (result.gate) {
        setGate({
          reason: result.reason,
          line:
            result.kristyLine || (result.reason === 'limit' ? LIMIT_LINE : INVITE_LINE),
          terminal: result.reason === 'limit',
        });
        return;
      }

      const aiMsg = {
        id: rid(),
        role: 'ai',
        content: result.message,
        macros: result.hasFood
          ? { ...result.macros, foods: result.foods, insight: result.insight }
          : null,
      };
      setMessages((prev) => [...prev, aiMsg]);

      // Count the exchange; the cap gate lands once they've had their taste.
      const next = exchanges + 1;
      setExchanges(next);
      if (next >= GATE_AFTER) {
        setGate({ reason: 'cap', line: CAP_LINE, terminal: true });
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: rid(),
          role: 'ai',
          content: "I had trouble responding just now — give it another try in a sec.",
          macros: null,
        },
      ]);
    } finally {
      setTyping(false);
    }
  }

  // Verdict is fully functional for guests — this is the funnel, not gated. On
  // the shared IP cap the server returns { gate:true }, which we surface as the
  // terminal limit gate (same as chat) instead of a card.
  async function handleVerdictFile(file) {
    if (!file || !!gate) return;
    setVerdict({ loading: true, data: null, error: null });
    try {
      const result = await sendGuestVerdict({ file });
      if (result?.gate) {
        setVerdict(null);
        setGate({ reason: 'limit', line: LIMIT_LINE, terminal: true });
        return;
      }
      if (result?.error) {
        setVerdict({ loading: false, data: null, error: result.message });
        return;
      }
      setVerdict({ loading: false, data: result, error: null });
    } catch {
      setVerdict({
        loading: false,
        data: null,
        error: "Couldn't read that one clearly — try another shot, better lit if you can.",
      });
    }
  }

  const showEmpty = messages.length === 0 && !typing;

  return (
    <div className="app app--guest">
      <header className="topbar topbar--guest">
        <div className="guest-mark">Kristy</div>
        <button
          className="guest-signin"
          onClick={() => setGate({ reason: 'invite', line: INVITE_LINE, terminal: false })}
        >
          Sign in
        </button>
      </header>

      <div className="chat" ref={chatRef}>
        {showEmpty ? (
          <EmptyState
            onPick={(ex) => handleSend(ex)}
            greeting={INTRO.greeting}
            subtitle={INTRO.subtitle}
          />
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
        // Barcode/photo logging are persistence-backed features — no-ops in guest
        // mode. The buttons stay for visual parity; a tap nudges toward sign-in.
        onBarcode={() => setGate({ reason: 'invite', line: INVITE_LINE, terminal: false })}
        onPhotoFile={() => setGate({ reason: 'invite', line: INVITE_LINE, terminal: false })}
        photoPreview={null}
        onClearPhoto={() => {}}
        onSendPhoto={() => {}}
        // Verdict IS the funnel — fully live for guests, never gated behind sign-in.
        onVerdictFile={handleVerdictFile}
      />

      {verdict && (
        <VerdictCard
          loading={verdict.loading}
          verdict={verdict.data}
          error={verdict.error}
          isGuest
          onClose={() => setVerdict(null)}
          onSignIn={() => setGate({ reason: 'invite', line: INVITE_LINE, terminal: false })}
        />
      )}

      {gate && (
        <GuestGate
          line={gate.line}
          terminal={gate.terminal}
          onDismiss={() => setGate(null)}
        />
      )}
    </div>
  );
}
