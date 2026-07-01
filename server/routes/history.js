import { Router } from 'express';
import { requireAuth, supabase } from '../lib/supabase.js';

const router = Router();

// GET /api/history/:date  (date = YYYY-MM-DD) → that day's chat messages
router.get('/history/:date', requireAuth, async (req, res) => {
  const userId = req.user.id;
  const { date } = req.params;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ error: 'date must be YYYY-MM-DD' });
  }

  const start = new Date(`${date}T00:00:00`);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('id, role, content, macros, created_at')
      .eq('user_id', userId)
      .gte('created_at', start.toISOString())
      .lt('created_at', end.toISOString())
      .order('created_at', { ascending: true });

    if (error) throw error;
    return res.json({ date, messages: data || [] });
  } catch (err) {
    console.error('[kristy] /api/history error:', err.message);
    return res.status(500).json({ error: 'Could not load history.' });
  }
});

export default router;
