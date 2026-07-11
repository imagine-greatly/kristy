// Phone + SMS one-time-code sign-in. Ported from the web client's Auth.jsx
// SignInForm: step 1 collects a phone number and texts a 6-digit code; step 2
// verifies it. On success the session lands via onAuthStateChange (handled in
// AppProvider). Uses the native OTP autofill (textContentType="oneTimeCode" /
// autoComplete="sms-otp").
import { useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, View, Text, TextInput, Pressable } from 'react-native';
import { colors, fonts } from '../theme';
import { supabase } from '../lib/supabase';

// Pretty-format the phone field as the user types.
function formatPhoneInput(raw: string): string {
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

// Normalize a typed number to E.164, or null if it doesn't look real.
function normalizePhone(raw: string): string | null {
  const trimmed = (raw || '').trim();
  if (trimmed.startsWith('+')) {
    const digits = trimmed.slice(1).replace(/\D/g, '');
    return /^[1-9]\d{7,14}$/.test(digits) ? `+${digits}` : null;
  }
  const digits = trimmed.replace(/\D/g, '');
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  return null;
}

function friendlySendError(err: any): string {
  const m = (err?.message || '').toLowerCase();
  if (err?.status === 429 || m.includes('rate') || m.includes('too many'))
    return 'Too many attempts. Wait a minute and try again.';
  if (m.includes('invalid') && m.includes('phone'))
    return "That number doesn't look right. Include your country code (e.g. +1).";
  return "Couldn't send the code. Check the number and try again.";
}

function friendlyVerifyError(err: any): string {
  const m = (err?.message || '').toLowerCase();
  if (err?.status === 429 || m.includes('rate') || m.includes('too many'))
    return 'Too many attempts. Wait a minute and try again.';
  return "That code didn't work — it may be wrong or expired. Try again, or tap Resend.";
}

const RESEND_LOCK = 30;

export default function SignInForm({
  note = "No password — I'll text you a 6-digit code.",
}: {
  note?: string;
}) {
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [phone, setPhone] = useState('');
  const [sentTo, setSentTo] = useState('');
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'verifying' | 'error'>('idle');
  const [error, setError] = useState('');
  const [resendIn, setResendIn] = useState(0);

  const codeRef = useRef<TextInput>(null);
  const normalized = normalizePhone(phone);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  useEffect(() => {
    if (step === 'code') setTimeout(() => codeRef.current?.focus(), 250);
  }, [step]);

  const sendCode = async (target: string) => {
    setStatus('sending');
    setError('');
    const { error: err } = await supabase.auth.signInWithOtp({ phone: target });
    if (err) {
      setError(friendlySendError(err));
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
      setError(
        "Enter a valid phone number — include your country code (e.g. +1) if you're outside the US."
      );
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
    const { error: err } = await supabase.auth.verifyOtp({
      phone: sentTo,
      token: code,
      type: 'sms',
    });
    if (err) {
      setError(friendlyVerifyError(err));
      setStatus('error');
    }
    // On success, onAuthStateChange swaps the screen out — nothing to do.
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
      <View style={styles.form}>
        <Text style={styles.note}>
          Enter the 6-digit code I texted to <Text style={styles.noteBold}>{sentTo}</Text>.
        </Text>
        <TextInput
          ref={codeRef}
          style={[styles.input, styles.inputCode]}
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          autoComplete={Platform.OS === 'android' ? 'sms-otp' : 'one-time-code'}
          maxLength={6}
          placeholder="••••••"
          placeholderTextColor={colors.textMuted}
          value={code}
          onChangeText={(t) => setCode(t.replace(/\D/g, '').slice(0, 6))}
        />
        <Pressable
          style={[styles.btn, (code.length !== 6 || status === 'verifying') && styles.btnDisabled]}
          onPress={handleVerify}
          disabled={code.length !== 6 || status === 'verifying'}
        >
          <Text style={styles.btnText}>{status === 'verifying' ? 'Verifying…' : 'Verify'}</Text>
        </Pressable>
        {status === 'error' ? <Text style={styles.error}>{error}</Text> : null}
        <Pressable onPress={handleResend} disabled={resendIn > 0 || status === 'sending'}>
          <Text style={[styles.link, (resendIn > 0 || status === 'sending') && styles.linkDisabled]}>
            {status === 'sending'
              ? 'Sending…'
              : resendIn > 0
              ? `Resend code in ${resendIn}s`
              : "Didn't get it? Resend"}
          </Text>
        </Pressable>
        <Pressable onPress={backToPhone}>
          <Text style={styles.link}>Use a different number</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.form}>
      <TextInput
        style={styles.input}
        keyboardType="phone-pad"
        textContentType="telephoneNumber"
        autoComplete="tel"
        placeholder="(555) 123-4567"
        placeholderTextColor={colors.textMuted}
        value={phone}
        onChangeText={(t) => setPhone(formatPhoneInput(t))}
        onSubmitEditing={handleSend}
        returnKeyType="go"
      />
      <Pressable
        style={[styles.btn, (!normalized || status === 'sending') && styles.btnDisabled]}
        onPress={handleSend}
        disabled={!normalized || status === 'sending'}
      >
        <Text style={styles.btnText}>{status === 'sending' ? 'Sending…' : 'Send code'}</Text>
      </Pressable>
      {status === 'error' ? <Text style={styles.error}>{error}</Text> : null}
      <Text style={styles.note}>{note}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: 12, width: '100%', marginTop: 6 },
  input: {
    width: '100%',
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.gold40,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 15,
    color: colors.textPrimary,
    fontFamily: fonts.ui,
  },
  inputCode: {
    textAlign: 'center',
    letterSpacing: 8,
    fontSize: 20,
    fontFamily: fonts.mono,
  },
  btn: {
    width: '100%',
    backgroundColor: colors.accentGold,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
  },
  btnDisabled: { opacity: 0.55 },
  btnText: { color: colors.bg, fontFamily: fonts.uiSemibold, fontSize: 15 },
  note: { fontSize: 13, color: colors.textMuted, lineHeight: 20, textAlign: 'center', fontFamily: fonts.ui },
  noteBold: { color: colors.textPrimary, fontFamily: fonts.uiSemibold },
  error: { fontSize: 13, color: colors.error, lineHeight: 20, textAlign: 'center', fontFamily: fonts.ui },
  link: { color: colors.accentGold, fontSize: 13, textAlign: 'center', paddingVertical: 2, fontFamily: fonts.ui },
  linkDisabled: { color: colors.textMuted },
});
