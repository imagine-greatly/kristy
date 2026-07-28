import { Router } from 'express';
import {
  verifySendSmsHook,
  readOtpPayload,
  missingSmsHookConfig,
  maskPhone,
} from '../lib/sendSmsHook.js';
import { sendOtpSms, missingBirdConfig, TEMPLATE_NAME } from '../lib/birdSms.js';

// POST /api/auth/hooks/send-sms — Supabase Auth → Bird.
//
// Supabase mints and verifies the OTP; it hands us the digits and we deliver
// them. Registered under Authentication → Hooks → Send SMS as an HTTPS hook.
//
// Mounted in index.js with express.raw() BEFORE the JSON body parser, for the
// same reason the Stripe webhook is: the signature covers the exact bytes on the
// wire, and re-serializing a parsed object does not reproduce them.
//
// Contract with Supabase: 200 `{}` means delivered. Anything else is a failure,
// and `{ error: { http_code, message } }` is the shape whose `message` reaches
// the client — so the wording below is chosen to land on the right branch of
// friendlySendError() in client/src/components/Auth.jsx, which already tells a
// shopper "nothing wrong with your number" when the send failed on our end.

const router = Router();

/** Never log the OTP. It is a live credential for the length of its window. */
const fail = (res, http_code, message) => res.status(http_code).json({ error: { http_code, message } });

router.post('/send-sms', async (req, res) => {
  // 1. Configuration. A hook that can't verify a signature must not fall back to
  //    trusting the caller — an unverifiable call is refused, loudly and by name.
  const missing = [...missingSmsHookConfig(), ...missingBirdConfig()];
  if (missing.length) {
    console.error(`[kristy] send-sms hook not configured — missing: ${missing.join(', ')}`);
    return fail(res, 503, 'SMS provider is not configured.');
  }

  // 2. Signature. req.body is the raw Buffer (express.raw mounted for this path).
  let payload;
  try {
    payload = verifySendSmsHook(req.body, req.headers);
  } catch (err) {
    console.error('[kristy] send-sms hook signature verification failed:', err.message);
    return fail(res, 401, 'Invalid webhook signature.');
  }

  // 3. Recipient + code.
  let phone, otp;
  try {
    ({ phone, otp } = readOtpPayload(payload));
  } catch (err) {
    console.error('[kristy] send-sms hook payload unusable:', err.message);
    return fail(res, 400, 'SMS provider received an incomplete request.');
  }

  // 4. Deliver.
  try {
    const msg = await sendOtpSms({ phone, otp });
    console.log(`[kristy] send-sms hook → ${maskPhone(phone)} (${msg?.id ?? 'no id'}, ${msg?.status ?? 'no status'})`);
    return res.json({});
  } catch (err) {
    // Bird's typed errors carry a requestId — the one thing that makes a support
    // thread with Bird short. statusCode 422 here almost always means the
    // template name or its variables are wrong, so name the template we tried.
    console.error(
      `[kristy] send-sms hook: Bird rejected the send to ${maskPhone(phone)}`,
      {
        template: TEMPLATE_NAME,
        status: err?.statusCode,
        code: err?.code,
        requestId: err?.requestId,
        message: err?.message,
        details: err?.details,
      }
    );
    // 429 through so Supabase surfaces a rate limit as a rate limit; everything
    // else is ours to own. Both are retried by Supabase up to three times.
    const code = err?.statusCode === 429 ? 429 : 500;
    return fail(res, code, "SMS provider couldn't deliver the code.");
  }
});

export default router;
