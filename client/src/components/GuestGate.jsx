import { SignInForm } from './Auth.jsx';

// The soft sign-in gate. Sits over the chat (which stays readable behind it) and
// invites the guest in as Kristy, not as a paywall. `line` is Kristy's
// contextual message; `terminal` gates (message cap / rate limit) can't be
// dismissed, while a memory gate can be waved off to keep looking around.
export default function GuestGate({ line, terminal, onDismiss }) {
  return (
    <div className="gate">
      <div className="gate__scrim" onClick={terminal ? undefined : onDismiss} />
      <div className="gate__sheet" role="dialog" aria-modal="true">
        <div className="gate__avatar">K</div>
        <p className="gate__line">{line}</p>
        <SignInForm note="No password — one tap and I'll remember everything from here." />
        {!terminal && (
          <button className="gate__dismiss" onClick={onDismiss}>
            Not yet — keep looking around
          </button>
        )}
      </div>
    </div>
  );
}
