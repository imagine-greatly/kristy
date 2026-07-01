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
 * Returns the user object or null.
 */
export async function getUserFromToken(token) {
  if (!token) return null;
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) return null;
  return data.user;
}

/**
 * Express middleware — attaches req.user from the Authorization header.
 * Falls back to a userId in the body for local/dev convenience.
 */
export async function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  const user = await getUserFromToken(token);

  if (!user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  req.user = user;
  next();
}
