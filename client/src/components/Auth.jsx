import { useState } from 'react';
import { supabase } from '../lib/supabase.js';

/**
 * The magic-link sign-in form on its own — email input, send button, and the
 * "check your email" confirmation. Reused by the full-screen Auth wall AND the
 * guest sign-in gate so there's one source of truth for the sign-in options.
 */
export function SignInForm({ note = "No password. We'll email you a one-tap sign-in link." }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [error, setError] = useState('');

  const valid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim());

  const sendLink = async () => {
    if (!valid) return;
    setStatus('sending');
    setError('');
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/app` },
    });
    if (error) {
      setError(error.message);
      setStatus('error');
    } else {
      setStatus('sent');
    }
  };

  if (status === 'sent') {
    return (
      <div className="auth__sent">
        Check your email — we sent a magic link to <b>{email}</b>. Tap it to jump
        straight into your chat.
      </div>
    );
  }

  return (
    <div className="auth__form">
      <input
        className="auth__input"
        type="email"
        inputMode="email"
        autoComplete="email"
        placeholder="you@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && sendLink()}
      />
      <button
        className="auth__btn"
        onClick={sendLink}
        disabled={!valid || status === 'sending'}
      >
        {status === 'sending' ? 'Sending…' : 'Send magic link'}
      </button>
      {status === 'error' && (
        <p className="auth__note" style={{ color: '#e88' }}>
          {error}
        </p>
      )}
      <p className="auth__note">{note}</p>
    </div>
  );
}

export default function Auth() {
  return (
    <div className="auth">
      <div className="auth__leaf">K</div>
      <div>
        <div className="auth__title">Kristy</div>
        <p className="auth__tag">
          A nutritionist in your pocket that actually knows you — delivered as a
          conversation, not a dashboard.
        </p>
      </div>

      <SignInForm />
    </div>
  );
}
