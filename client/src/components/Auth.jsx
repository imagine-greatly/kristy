import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase.js';

/* ─────────────────────────── Phone helpers ───────────────────────────
   We accept whatever the user types and normalize to E.164 (+15551234567)
   before sending. US 10-digit numbers work as-is; anything international is
   expected to lead with a `+` and its country code. */

// Pretty-format the phone field as the user types. A leading `+` switches to
// international mode (digits only, no formatting). Otherwise we assume a US
// number and format it as (555) 123-4567.
function formatPhoneInput(raw) {
  const trimmed = (raw || '').trimStart();
  if (trimmed.startsWith('+')) {
    return '+' + trimmed.slice(1).replace(/\D/g, '').slice(0, 15);
  }
  const d = trimmed.replace(/\D/g, '').slice(0, 10);
  if (d.length === 0) return '';
  if (d.length < 4) return `(${d}`;
  if (d.length < 7) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

// Normalize a typed number to E.164, or null if it doesn't look like a real one.
function normalizePhone(raw) {
  const trimmed = (raw || '').trim();
  if (trimmed.startsWith('+')) {
    const digits = trimmed.slice(1).replace(/\D/g, '');
    return /^[1-9]\d{7,14}$/.test(digits) ? `+${digits}` : null;
  }
  const digits = trimmed.replace(/\D/g, '');
  if (digits.length === 10) return `+1${digits}`; // bare US number
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`; // US w/ country code
  return null; // ambiguous — needs a country code
}

/* Turn Supabase's raw auth errors into short, human messages.
 *
 * A CONFIGURATION failure must never wear the same coat as a typo. Every send error
 * used to collapse into "Check the number and try again", so a project with its phone
 * provider switched off, or Twilio credentials that never landed, looked exactly like
 * a mistyped digit — the user retypes a number that was always correct, and nobody
 * ever learns the send call is failing upstream. These cases are now named, and the
 * raw error is logged so the cause is one console line away rather than a guess. */
function friendlySendError(err) {
  const m = (err?.message || '').toLowerCase();
  const code = (err?.code || err?.error_code || '').toLowerCase();

  // Phone auth is switched off for the project. Nothing the shopper types can fix it.
  if (code.includes('phone_provider_disabled') || m.includes('unsupported phone provider'))
    return 'Text sign-in is switched off for this app right now. Nothing wrong with your number.';

  // The SMS provider (Twilio) rejected the send: bad credentials, no verified sender,
  // or a trial account that can only text verified numbers.
  if (m.includes('error sending') || m.includes('sms provider') || m.includes('twilio'))
    return "The text couldn't be sent from our end. Nothing wrong with your number.";

  if (code.includes('signup_disabled') || m.includes('signups not allowed'))
    return 'New sign-ups by text are switched off right now.';

  if (err?.status === 429 || m.includes('rate') || m.includes('too many'))
    return 'Too many attempts. Wait a minute and try again.';
  if (m.includes('invalid') && m.includes('phone'))
    return "That number doesn't look right. Include your country code (e.g. +1).";
  return "The code didn't send. Check the number and try again.";
}

function friendlyVerifyError(err) {
  const m = (err?.message || '').toLowerCase();
  if (err?.status === 429 || m.includes('rate') || m.includes('too many'))
    return 'Too many attempts. Wait a minute and try again.';
  // Supabase returns "Token has expired or is invalid" for both cases.
  return "That code didn't work. It may be wrong or expired. Tap Resend.";
}

// Seconds to lock the "Resend" link after a code is sent (the code itself
// expires at 60s; we let them ask for a fresh one after 30s).
const RESEND_LOCK = 30;

/**
 * The shared phone + SMS one-time-code sign-in form. Step 1 collects a phone
 * number and texts a 6-digit code; step 2 verifies it. On success the session
 * lands via supabase.auth.onAuthStateChange (handled in App), so this component
 * just needs to get the user through verification. Reused by the full-screen
 * Auth wall AND the guest sign-in gate — one source of truth for sign-in.
 */
export function SignInForm({ note = 'No password. A 6-digit code by text.' }) {
  const [step, setStep] = useState('phone'); // 'phone' | 'code'
  const [phone, setPhone] = useState('');
  const [sentTo, setSentTo] = useState(''); // E.164 the code was sent to
  const [code, setCode] = useState('');
  const [status, setStatus] = useState('idle'); // idle | sending | verifying | error
  const [error, setError] = useState('');
  const [resendIn, setResendIn] = useState(0);

  const phoneRef = useRef(null);
  const codeRef = useRef(null);

  const normalized = normalizePhone(phone);

  // Resend countdown.
  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  // Move focus to the field that matters for the current step.
  useEffect(() => {
    (step === 'phone' ? phoneRef : codeRef).current?.focus();
  }, [step]);

  // Send (or resend) the SMS code to `target` (E.164).
  const sendCode = async (target) => {
    setStatus('sending');
    setError('');
    const { error } = await supabase.auth.signInWithOtp({ phone: target });
    if (error) {
      // The exact upstream reason, kept out of the UI but never thrown away. A silent
      // "couldn't send" with no trace is what makes this class of bug take a week.
      console.error('[kristy] signInWithOtp failed', {
        status: error.status,
        code: error.code || error.error_code,
        message: error.message,
      });
      setError(friendlySendError(error));
      setStatus('error');
      return false;
    }
    setSentTo(target);
    setResendIn(RESEND_LOCK);
    setStatus('idle');
    return true;
  };

  const handleSend = async () => {
    if (!normalized) {
      setError('Enter a valid phone number. Outside the US, include your country code (e.g. +1).');
      setStatus('error');
      return;
    }
    const ok = await sendCode(normalized);
    if (ok) {
      setCode('');
      setStep('code');
    }
  };

  const handleResend = async () => {
    if (resendIn > 0 || status === 'sending') return;
    setCode('');
    await sendCode(sentTo);
  };

  const handleVerify = async () => {
    if (code.length !== 6) return;
    setStatus('verifying');
    setError('');
    const { error } = await supabase.auth.verifyOtp({
      phone: sentTo,
      token: code,
      type: 'sms',
    });
    if (error) {
      setError(friendlyVerifyError(error));
      setStatus('error');
      // Stay on the code step so they can retry or resend.
    }
    // On success, onAuthStateChange swaps this component out — nothing to do.
  };

  const backToPhone = () => {
    setStep('phone');
    setCode('');
    setError('');
    setStatus('idle');
    setResendIn(0);
  };

  if (step === 'code') {
    return (
      <div className="auth__form">
        <p className="auth__note">
          Enter the 6-digit code sent to <b>{sentTo}</b>.
        </p>
        <input
          ref={codeRef}
          className="auth__input auth__input--code"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="••••••"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
        />
        <button
          className="auth__btn"
          onClick={handleVerify}
          disabled={code.length !== 6 || status === 'verifying'}
        >
          {status === 'verifying' ? 'Verifying…' : 'Verify'}
        </button>
        {status === 'error' && <p className="auth__error">{error}</p>}
        <button
          className="auth__link"
          onClick={handleResend}
          disabled={resendIn > 0 || status === 'sending'}
        >
          {status === 'sending'
            ? 'Sending…'
            : resendIn > 0
            ? `Resend code in ${resendIn}s`
            : "Didn't get it? Resend"}
        </button>
        <button className="auth__link" onClick={backToPhone}>
          Use a different number
        </button>
      </div>
    );
  }

  return (
    <div className="auth__form">
      <input
        ref={phoneRef}
        className="auth__input"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        placeholder="(555) 123-4567"
        value={phone}
        onChange={(e) => setPhone(formatPhoneInput(e.target.value))}
        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
      />
      <button
        className="auth__btn"
        onClick={handleSend}
        disabled={!normalized || status === 'sending'}
      >
        {status === 'sending' ? 'Sending…' : 'Send code'}
      </button>
      {status === 'error' && <p className="auth__error">{error}</p>}
      <p className="auth__note">{note}</p>
      {/* The SMS consent disclosure, at the point the number is entered.
          It lives HERE rather than on the surrounding screen because both sign-in
          surfaces (the full-page Auth and the GuestGate sheet) render this form, and
          only one of them used to carry any legal text at all. Carriers reviewing an
          A2P 10DLC campaign look for the opt-in language beside the phone field, and
          the wording below is the same commitment the Privacy Policy makes: what
          tapping the button consents to, how often a message arrives, that rates may
          apply, and how to stop. */}
      <p className="auth__legal">
        By continuing you agree to our{' '}
        <a href="/terms" target="_blank" rel="noreferrer">Terms</a> and{' '}
        <a href="/privacy" target="_blank" rel="noreferrer">Privacy Policy</a>. Requesting
        a code consents to a one-time sign-in code by SMS — one per request, no marketing.
        Message and data rates may apply. Reply STOP to opt out, HELP for help.
      </p>
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
          A nutrition coach in your pocket that actually knows you — delivered as
          a conversation, not a dashboard.
        </p>
      </div>

      <SignInForm />
    </div>
  );
}
