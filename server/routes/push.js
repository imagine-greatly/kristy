// Push-token registration for the mobile client. The app registers its Expo push
// token on sign-in; the server stores it per-user in push_tokens (upsert by
// user_id + token). Added for mobile; does not affect any existing route.

import { Router } from 'express';
import { requireAuth, supabase } from '../lib/supabase.js';

const router = Router();

// POST /api/push/register  { token, platform? }
router.post('/register', requireAuth, async (req, res) => {
  const userId = req.user.id;
  const { token, platform } = req.body || {};
  if (!token || !String(token).trim()) {
    return res.status(400).json({ error: 'token is required' });
  }
  try {
    const { error } = await supabase.from('push_tokens').upsert(
      {
        user_id: userId,
        token: String(token),
        platform: platform || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,token' }
    );
    if (error) throw new Error(error.message);
    return res.json({ ok: true });
  } catch (err) {
    console.error('[kristy] /api/push/register error:', err.message);
    return res.status(500).json({ error: 'Could not register push token.' });
  }
});

// POST /api/push/unregister  { token }  — called on sign-out (optional).
router.post('/unregister', requireAuth, async (req, res) => {
  const userId = req.user.id;
  const { token } = req.body || {};
  if (!token) return res.status(400).json({ error: 'token is required' });
  try {
    await supabase.from('push_tokens').delete().eq('user_id', userId).eq('token', String(token));
    return res.json({ ok: true });
  } catch (err) {
    console.error('[kristy] /api/push/unregister error:', err.message);
    return res.status(500).json({ error: 'Could not unregister push token.' });
  }
});

export default router;
