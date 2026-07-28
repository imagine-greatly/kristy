// Supabase Send SMS Hook — inbound verification and payload reading.
//
// Supabase calls us to deliver an OTP it has already minted. The call arrives
// signed with Standard Webhooks (`webhook-id` / `webhook-timestamp` /
// `webhook-signature`), and the signature is the ONLY thing standing between
// this endpoint and an open SMS relay: the URL is public and the body is a phone
// number plus a code. An unsigned call is not a degraded call, it is a stranger.
// It gets a 401 and nothing else.
//
// Split out from the route so the parts that can be wrong — secret parsing,
// signature checking, phone normalization — are testable without a live server.

import { Webhook } from 'standardwebhooks';

/**
 * Supabase writes hook secrets as `v1,whsec_<base64>`.
 *
 * The var is PLURAL because rotation: you can register a new secret while calls
 * signed with the old one are still in flight (Supabase retries a hook up to
 * three times), and any of them verifying is a pass. Separate them with `|` or
 * whitespace — NOT a comma, because the comma in `v1,whsec_` is part of the
 * secret's own syntax and splitting on it would shred every entry.
 *
 * @returns {string[]} base64 secrets, prefix stripped, in the order given.
 */
export function hookSecrets() {
  return (process.env.SEND_SMS_HOOK_SECRETS || '')
    .split(/[|\s]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => s.replace(/^v1,/, '').replace(/^whsec_/, ''));
}

/** Which required env vars are missing, by name. Empty array ⇒ ready. */
export function missingSmsHookConfig() {
  return hookSecrets().length ? [] : ['SEND_SMS_HOOK_SECRETS'];
}

/**
 * Verify a Standard Webhooks signature against every configured secret.
 *
 * @param {Buffer|string} rawBody The EXACT bytes Supabase signed. A re-serialized
 *   `JSON.parse` round trip will not match — key order and spacing are part of
 *   the signed message.
 * @param {Record<string, string>} headers Inbound headers (case-insensitive).
 * @returns {object} The parsed hook payload.
 * @throws If no configured secret verifies the signature.
 */
export function verifySendSmsHook(rawBody, headers) {
  const secrets = hookSecrets();
  if (!secrets.length) throw new Error('SEND_SMS_HOOK_SECRETS is not set');

  const payload = typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8');

  let lastErr;
  for (const secret of secrets) {
    try {
      // Also enforces a 5-minute timestamp tolerance, which is what closes the
      // replay window on a captured-and-resent call.
      return new Webhook(secret).verify(payload, headers);
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr;
}

/**
 * Normalize a phone number to E.164 (`+15551234567`).
 *
 * Supabase stores `auth.users.phone` WITHOUT the leading `+` — the hook payload
 * carries `15551234567`. Bird requires the `+` and rejects the bare digits with a
 * 422, so this is not defensive tidying; without it every send fails.
 *
 * @returns {string|null} null when there is nothing that could be a number.
 */
export function toE164(raw) {
  const digits = String(raw ?? '').replace(/\D/g, '');
  // 8 is the shortest real E.164 subscriber number; 15 is the spec's ceiling.
  if (digits.length < 8 || digits.length > 15) return null;
  return `+${digits}`;
}

/**
 * Pull the two things we actually need out of a verified payload.
 *
 * @param {object} payload The `{ user, sms }` object Supabase sends.
 * @returns {{ phone: string, otp: string }}
 * @throws If either is missing or unusable — a hook that can't name a recipient
 *   or a code has nothing to deliver, and guessing is worse than failing.
 */
export function readOtpPayload(payload) {
  const phone = toE164(payload?.user?.phone);
  if (!phone) throw new Error('hook payload has no usable user.phone');

  const otp = String(payload?.sms?.otp ?? '').trim();
  if (!otp) throw new Error('hook payload has no sms.otp');

  return { phone, otp };
}

/**
 * A phone number safe to write to a log: `+1******4567`.
 *
 * Logs are read by more people than the database is, and a sign-in log is a list
 * of who uses the app. The last four are enough to match a support report.
 */
export function maskPhone(e164) {
  const s = String(e164 || '');
  if (s.length <= 6) return '***';
  return `${s.slice(0, 2)}${'*'.repeat(s.length - 6)}${s.slice(-4)}`;
}
