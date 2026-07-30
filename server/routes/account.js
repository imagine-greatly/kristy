import { Router } from 'express';
import { requireAuth, supabase } from '../lib/supabase.js';

const router = Router();

// Every table that stores per-user rows, keyed by user_id.
//
// This list is COMPLETE and a test enforces that it stays complete: it parses the
// migrations for every table that references auth.users and fails if one is missing
// here. It drifted once already — shopping_lists, haul_scans and push_tokens were all
// added to the schema after this list was written and none of them was added to it.
//
// The cascade would still have collected them, so nothing survived a deletion. But the
// whole reason this list exists is to not depend on the cascade: it runs first so the
// data is gone even if the auth deletion has to be retried, and a table missing from
// here is silently outside that guarantee. shopping_lists is the sharpest case — it
// holds the shopper's pattern memory (staples, what they removed, what swaps they
// declined), which is the most personal thing Kristy stores.
export const USER_TABLES = [
  'meal_logs',
  'weight_logs',
  'chat_messages',
  'weekly_summaries',
  'verdicts',
  'subscriptions',
  'haul_scans',
  'shopping_lists',
  'push_tokens',
  // user_goals last: the signup trigger recreates a row on this table, so clearing it
  // before the others buys nothing. It is also the row the profile hangs off.
  'user_goals',
];

// DELETE /api/account — permanently delete the signed-in user's data and their
// auth record. Destructive and irreversible; the client requires an explicit
// typed confirmation before it ever calls this. After a success the client
// signs out, dropping the user back to the guest experience.
//
// Note: every user table references auth.users ON DELETE CASCADE, so deleting
// the auth user alone would also clear these rows. We still delete them
// explicitly first so the data is gone even if the auth deletion has to be
// retried, and so a partial failure is reported rather than silently skipped.
// A table that hasn't been migrated into this project yet (e.g. subscriptions
// before its migration is applied) must not block deletion — the auth-user
// delete below cascades to it anyway. Postgres reports 42P01; PostgREST reports
// a "schema cache" miss. Any OTHER error is a real failure and still aborts.
function isMissingTableError(error) {
  const code = error?.code || '';
  const msg = (error?.message || '').toLowerCase();
  return (
    code === '42P01' ||
    code === 'PGRST205' ||
    msg.includes('does not exist') ||
    msg.includes('schema cache')
  );
}

router.delete('/account', requireAuth, async (req, res) => {
  const userId = req.user.id;
  try {
    for (const table of USER_TABLES) {
      const { error } = await supabase.from(table).delete().eq('user_id', userId);
      if (error && !isMissingTableError(error)) {
        throw new Error(`${table}: ${error.message}`);
      }
      if (error) {
        console.warn(`[kristy] account delete: skipping un-migrated table ${table}`);
      }
    }

    // Remove the auth user itself (service-role admin API). Every user table
    // references auth.users ON DELETE CASCADE, so this also clears any table we
    // had to skip above.
    const { error: authErr } = await supabase.auth.admin.deleteUser(userId);
    if (authErr) throw new Error(`auth: ${authErr.message}`);

    return res.json({ ok: true });
  } catch (err) {
    console.error(
      `[kristy] /api/account delete error (user ${userId}) @ ${new Date().toISOString()}:`,
      err?.message || err
    );
    return res.status(500).json({
      error: true,
      message: 'Could not delete your account. Please try again in a moment.',
    });
  }
});

export default router;
