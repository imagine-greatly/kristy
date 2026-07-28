// The Send SMS Hook's gate: signature verification, secret rotation, and the
// phone normalization without which every Bird send 422s.
//   node --test lib/sendSmsHook.test.js

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Webhook } from 'standardwebhooks';

// Two throwaway base64 secrets. The module reads env at call time, not import
// time, so each test can set SEND_SMS_HOOK_SECRETS to whatever it needs.
const SECRET_A = Buffer.from('kristy-test-secret-alpha').toString('base64');
const SECRET_B = Buffer.from('kristy-test-secret-bravo').toString('base64');

const {
  hookSecrets,
  missingSmsHookConfig,
  verifySendSmsHook,
  readOtpPayload,
  toE164,
  maskPhone,
} = await import('./sendSmsHook.js');

/** Sign a body the way Supabase does, returning the body + its headers. */
function signed(body, secret, { id = 'msg_test_1', at = new Date() } = {}) {
  const raw = JSON.stringify(body);
  return {
    raw: Buffer.from(raw, 'utf8'),
    headers: {
      'webhook-id': id,
      'webhook-timestamp': Math.floor(at.getTime() / 1000).toString(),
      'webhook-signature': new Webhook(secret).sign(id, at, raw),
    },
  };
}

const payload = () => ({
  user: { id: 'u-1', phone: '15551234567' },
  sms: { otp: '123456' },
});

/* ─────────────────────────── Secret parsing ─────────────────────────── */

test('strips the v1,whsec_ prefix Supabase writes', () => {
  process.env.SEND_SMS_HOOK_SECRETS = `v1,whsec_${SECRET_A}`;
  assert.deepEqual(hookSecrets(), [SECRET_A]);
  assert.deepEqual(missingSmsHookConfig(), []);
});

test('does NOT split on the comma inside v1,whsec_ — that would shred every secret', () => {
  process.env.SEND_SMS_HOOK_SECRETS = `v1,whsec_${SECRET_A}|v1,whsec_${SECRET_B}`;
  assert.deepEqual(hookSecrets(), [SECRET_A, SECRET_B]);
});

test('an unset secret is named, not silently treated as open', () => {
  process.env.SEND_SMS_HOOK_SECRETS = '';
  assert.deepEqual(missingSmsHookConfig(), ['SEND_SMS_HOOK_SECRETS']);
  assert.throws(() => verifySendSmsHook(Buffer.from('{}'), {}), /SEND_SMS_HOOK_SECRETS/);
});

/* ─────────────────────────── Signature ─────────────────────────── */

test('a correctly signed call verifies and yields the payload', () => {
  process.env.SEND_SMS_HOOK_SECRETS = `v1,whsec_${SECRET_A}`;
  const { raw, headers } = signed(payload(), SECRET_A);
  assert.deepEqual(verifySendSmsHook(raw, headers), payload());
});

test('an unsigned call is refused', () => {
  process.env.SEND_SMS_HOOK_SECRETS = `v1,whsec_${SECRET_A}`;
  assert.throws(() => verifySendSmsHook(Buffer.from(JSON.stringify(payload())), {}));
});

test('a tampered body is refused — the phone number is inside the signature', () => {
  process.env.SEND_SMS_HOOK_SECRETS = `v1,whsec_${SECRET_A}`;
  const { headers } = signed(payload(), SECRET_A);
  const swapped = { ...payload(), user: { id: 'u-1', phone: '15559999999' } };
  assert.throws(() => verifySendSmsHook(Buffer.from(JSON.stringify(swapped)), headers));
});

test('a call signed with the wrong secret is refused', () => {
  process.env.SEND_SMS_HOOK_SECRETS = `v1,whsec_${SECRET_A}`;
  const { raw, headers } = signed(payload(), SECRET_B);
  assert.throws(() => verifySendSmsHook(raw, headers));
});

test('rotation: either configured secret verifies', () => {
  process.env.SEND_SMS_HOOK_SECRETS = `v1,whsec_${SECRET_A}|v1,whsec_${SECRET_B}`;
  for (const secret of [SECRET_A, SECRET_B]) {
    const { raw, headers } = signed(payload(), secret);
    assert.deepEqual(verifySendSmsHook(raw, headers), payload());
  }
});

test('a replayed call outside the timestamp window is refused', () => {
  process.env.SEND_SMS_HOOK_SECRETS = `v1,whsec_${SECRET_A}`;
  const stale = new Date(Date.now() - 10 * 60 * 1000); // tolerance is 5 minutes
  const { raw, headers } = signed(payload(), SECRET_A, { at: stale });
  assert.throws(() => verifySendSmsHook(raw, headers));
});

/* ─────────────────────────── Payload reading ─────────────────────────── */

test('restores the + Supabase strips — bare digits would 422 at Bird', () => {
  assert.equal(toE164('15551234567'), '+15551234567');
  assert.equal(toE164('+15551234567'), '+15551234567');
  // Supabase stores E.164, so the country code is always already there. This
  // strips punctuation only — it does not infer a country code it wasn't given.
  assert.equal(toE164('+1 (555) 123-4567'), '+15551234567');
});

test('nothing that could be a number is null, not a malformed send', () => {
  assert.equal(toE164(''), null);
  assert.equal(toE164(null), null);
  assert.equal(toE164('n/a'), null);
  assert.equal(toE164('1234'), null); // too short to be E.164
  assert.equal(toE164('1'.repeat(16)), null); // past the E.164 ceiling
});

test('reads phone and otp off a verified payload', () => {
  assert.deepEqual(readOtpPayload(payload()), { phone: '+15551234567', otp: '123456' });
});

test('a payload missing either half throws rather than sending a guess', () => {
  assert.throws(() => readOtpPayload({ user: {}, sms: { otp: '123456' } }), /user\.phone/);
  assert.throws(() => readOtpPayload({ user: { phone: '15551234567' }, sms: {} }), /sms\.otp/);
  assert.throws(() => readOtpPayload({}), /user\.phone/);
});

test('an otp that arrives as a number still reaches the template as a string', () => {
  const { otp } = readOtpPayload({ user: { phone: '15551234567' }, sms: { otp: 123456 } });
  assert.equal(otp, '123456');
  assert.equal(typeof otp, 'string');
});

/* ─────────────────────────── Logging ─────────────────────────── */

test('a logged number keeps only what support needs to match a report', () => {
  assert.equal(maskPhone('+15551234567'), '+1******4567');
  assert.doesNotMatch(maskPhone('+15551234567'), /5551/);
  assert.equal(maskPhone(''), '***');
});
