import { createClient } from '@supabase/supabase-js';

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.warn(
    '[kristy] SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not set — database calls will fail.'
  );
}

// Trusted server-side client. Uses the service role key, so it bypasses RLS.
// We always scope queries by user_id ourselves to keep data isolated.
export const supabase = createClient(
  SUPABASE_URL || 'http://localhost',
  SUPABASE_SERVICE_ROLE_KEY || 'missing',
  { auth: { autoRefreshToken: false, persistSession: false } }
);

/**
 * Resolve the authenticated user from a Bearer token.
 * Returns the user object, or null on missing/invalid token OR on an auth
 * service failure — the caller decides how to respond. Never throws, so a
 * Supabase outage can't turn into an unhandled rejection / hung request.
 * @returns {Promise<{user:object|null, failed?:boolean}>}
 */
export async function getUserFromToken(token) {
  if (!token) return { user: null };
  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) return { user: null };
    return { user: data.user };
  } catch (err) {
    // Network/timeout talking to Supabase Auth — surface as a service failure,
    // not a silent 401, so we can return a clean 503 instead of hanging.
    console.error('[kristy] supabase.auth.getUser failed:', err?.message || err);
    return { user: null, failed: true };
  }
}

/**
 * Express middleware — attaches req.user from the Authorization header.
 * Wrapped so any unexpected error becomes a clean JSON response, never a
 * throw that Express 4 would leak as an unhandled rejection.
 */
export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    const { user, failed } = await getUserFromToken(token);

    if (failed) {
      return res.status(503).json({
        error: true,
        message: "I'm having trouble connecting right now — try that again in a moment.",
      });
    }
    if (!user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    req.user = user;
    next();
  } catch (err) {
    console.error('[kristy] requireAuth error:', err?.message || err);
    return res.status(503).json({
      error: true,
      message: "I'm having trouble connecting right now — try that again in a moment.",
    });
  }
}
