// Bird (formerly MessageBird) SMS — the transport under phone sign-in.
//
// WHY THIS EXISTS AT ALL: Supabase ships a built-in "MessageBird" phone provider,
// and it is dead. It calls Bird's legacy originator+body API, which Bird has
// retired — the send returns 422 and the shopper sees "the code didn't send" for
// a number that was always correct. So we take delivery off Supabase entirely and
// do it here, via the Send SMS Hook. Supabase still mints and verifies the OTP;
// it just hands us the digits to deliver.
//
// The current Bird API is a TEMPLATE model, not a text model. You do not compose
// the message — you name a template Bird has on file and fill its variables. That
// is also what carriers vet, which is why `from` is not ours to choose here: on a
// template send Bird picks the eligible sender itself, and passing one is rejected.

import { BirdClient } from '@messagebird/sdk';

const apiKey = process.env.BIRD_API_KEY || '';

/** The template Bird sends. Its one variable is `code`. */
export const TEMPLATE_NAME = process.env.BIRD_TEMPLATE_NAME || 'bird_otp_verification';

/** Optional BCP-47 tag (`fr`, `pt-BR`) selecting a localized body. Blank ⇒ English. */
const templateLanguage = process.env.BIRD_TEMPLATE_LANGUAGE || '';

/** Optional. The region normally comes free from the key prefix (`bk_us1_…`). */
const region = process.env.BIRD_REGION || '';

// Timeout and retries are deliberately tighter than the SDK's defaults (60s, 2
// retries). A Supabase auth hook has a FIVE SECOND budget for the whole round
// trip, so the SDK's defaults would blow it and Supabase would give up on us
// mid-flight — while we sat waiting on a Bird call whose answer nobody would
// read. Supabase owns the retry (3 attempts, 2s backoff); one clean, fast
// attempt per hook call is the right unit of work.
export const bird = apiKey
  ? new BirdClient({
      apiKey,
      timeout: 3500,
      maxRetries: 0,
      ...(region ? { region } : {}),
    })
  : null;

/**
 * Which required Bird env vars are missing, by name — so a misconfigured deploy
 * says what is wrong instead of failing anonymously.
 */
export function missingBirdConfig() {
  return apiKey ? [] : ['BIRD_API_KEY'];
}

/**
 * Deliver a one-time passcode by SMS.
 *
 * @param {{ phone: string, otp: string }} args `phone` in E.164 (`+15551234567`).
 * @returns {Promise<{ id: string, status: string }>} Bird's accepted message.
 */
export async function sendOtpSms({ phone, otp }) {
  if (!bird) throw new Error('BIRD_API_KEY is not set');

  const template = { name: TEMPLATE_NAME, parameters: { code: otp } };
  if (templateLanguage) template.language = templateLanguage;

  // No `from` and no `category`: both are derived from the template, and Bird
  // rejects a send that supplies them alongside one.
  return bird.sms.send({ to: phone, template });
}
