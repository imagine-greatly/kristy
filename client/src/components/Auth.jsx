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

// Turn Supabase's raw auth errors into short, human messages.
function friendlySendError(err) {
  const m = (err?.message || '').toLowerCase();
  if (err?.status === 429 || m.includes('rate') || m.includes('too many'))
    return 'Too many attempts. Wait a minute and try again.';
  if (m.includes('invalid') && m.includes('phone'))
    return "That number doesn't look right. Include your country code (e.g. +1).";
  return "Couldn't send the code. Check the number and try again.";
}

function friendlyVerifyError(err) {
  const m = (err?.message || '').toLowerCase();
  if (err?.status === 429 || m.includes('rate') || m.includes('too many'))
    return 'Too many attempts. Wait a minute and try again.';
  // Supabase returns "Token has expired or is invalid" for both cases.
  return "That code didn't work — it may be wrong or expired. Try again, or tap Resend.";
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
export function SignInForm({ note = "No password — I'll text you a 6-digit code." }) {
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
      setError("Enter a valid phone number — include your country code (e.g. +1) if you're outside the US.");
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
          Enter the 6-digit code I texted to <b>{sentTo}</b>.
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
