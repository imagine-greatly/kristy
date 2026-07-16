// Verify the DB-persistence paths added in the grocery-coach overhaul.
// Run this AFTER applying supabase/schema.sql (SQL Editor / `supabase db push`).
//
//   cd server && node --use-system-ca scripts/verify-migration.js
//
// Credentials: read from the environment (or server/.env via dotenv) as
// SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY. The service-role key is NEVER printed
// or logged — only the project host is echoed.
//
// SAFETY (non-destructive by construction):
//   • Every write happens under a single EPHEMERAL test auth user created just for
//     this run (Admin API). Its uuid satisfies the auth.users FK on user_goals /
//     haul_scans, so no real user is ever referenced.
//   • Test rows carry a sentinel value (__kristy_verify__) and a test email.
//   • Cleanup deletes exactly the inserted haul_scans row, then deletes the test
//     user — which CASCADES its user_goals + haul_scans rows. No truncates, and no
//     real user_goals / haul_scans row is read, written, or deleted.
//
// Paths checked: (1) onboarding → user_goals.{coach_goal, non_negotiables, focuses}
//   (2) haul_scans table  (3) user_goals.free_notes_used  (4) List localStorage
//   (device-local by design — asserted, not a DB check). Prints PASS/FAIL per path.

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('✗ SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set (checked env + server/.env). Aborting.');
  process.exit(2);
}

// Echo only the host — never the key.
try {
  console.log(`Project: ${new URL(SUPABASE_URL).host}\n`);
} catch {
  /* ignore */
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const SENTINEL = '__kristy_verify__';
const results = [];
const record = (name, ok, detail) => {
  results.push({ name, ok });
  console.log(`  ${ok ? '✓ PASS' : '✗ FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
};

// Order-sensitive equality for Postgres text[] round-trips.
const arrEq = (a, b) =>
  Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((v, i) => v === b[i]);

// Turn a "column/relation does not exist" error into an actionable hint.
const hint = (e) => {
  const m = e?.message || String(e);
  return /does not exist|Could not find the table|schema cache/i.test(m)
    ? `${m}  → apply supabase/schema.sql first`
    : m;
};

let testUserId = null;
let testEmail = null;
let scanId = null;

async function main() {
  // ── Ephemeral test user (valid auth.users id for the FKs) ──
  testEmail = `kristy-verify+${Date.now()}@example.com`;
  const { data: created, error: createErr } = await supabase.auth.admin.createUser({
    email: testEmail,
    email_confirm: true,
    user_metadata: { kristy_verify: true },
  });
  if (createErr || !created?.user?.id) {
    console.error('✗ Could not create an ephemeral test user:', createErr?.message || 'unknown error');
    console.error('  The service-role key must permit the Admin API. Nothing was written.');
    process.exit(1);
  }
  testUserId = created.user.id;
  console.log(`Ephemeral test user: ${testUserId}\n`);

  // ── Path 1 — onboarding columns ──
  console.log('Path 1 — onboarding → user_goals.{coach_goal, non_negotiables, focuses}');
  try {
    const patch = { user_id: testUserId, coach_goal: 'cut', non_negotiables: ['no seed oils'], focuses: ['lower_sugar'] };
    const { error: wErr } = await supabase.from('user_goals').upsert(patch, { onConflict: 'user_id' });
    if (wErr) throw wErr;
    const { data, error } = await supabase
      .from('user_goals')
      .select('coach_goal, non_negotiables, focuses')
      .eq('user_id', testUserId)
      .single();
    if (error) throw error;
    const ok = data.coach_goal === 'cut' && arrEq(data.non_negotiables, ['no seed oils']) && arrEq(data.focuses, ['lower_sugar']);
    record('onboarding columns persist', ok, ok ? 'coach_goal + non_negotiables + focuses round-tripped' : `got ${JSON.stringify(data)}`);
  } catch (e) {
    record('onboarding columns persist', false, hint(e));
  }

  // ── Path 3 — free_notes_used counter ──
  console.log('Path 3 — user_goals.free_notes_used (the 3-free-notes gate)');
  try {
    const { error: wErr } = await supabase.from('user_goals').upsert({ user_id: testUserId, free_notes_used: 2 }, { onConflict: 'user_id' });
    if (wErr) throw wErr;
    const { data, error } = await supabase.from('user_goals').select('free_notes_used').eq('user_id', testUserId).single();
    if (error) throw error;
    record('free_notes_used persists', data.free_notes_used === 2, data.free_notes_used === 2 ? 'counter round-tripped (2)' : `got ${JSON.stringify(data)}`);
  } catch (e) {
    record('free_notes_used persists', false, hint(e));
  }

  // ── Path 2 — haul_scans table ──
  console.log('Path 2 — haul_scans insert/read');
  try {
    const { data: ins, error: iErr } = await supabase
      .from('haul_scans')
      .insert({ user_id: testUserId, product_name: SENTINEL, brand: SENTINEL, tier: 'approved', barcode: '0000000000000' })
      .select('id')
      .single();
    if (iErr) throw iErr;
    scanId = ins.id;
    const { data, error } = await supabase.from('haul_scans').select('id, product_name, tier').eq('id', scanId).single();
    if (error) throw error;
    const ok = data.product_name === SENTINEL && data.tier === 'approved';
    record('haul_scans persists', ok, ok ? 'scan row round-tripped' : `got ${JSON.stringify(data)}`);
  } catch (e) {
    record('haul_scans persists', false, hint(e));
  }

  // ── Path 4 — List builder localStorage (device-local by design; no DB) ──
  console.log('Path 4 — List builder persistence');
  record('List is device-local by design', true, 'client/src/lib/list.js uses localStorage (kristy:list) — no DB table expected; not cross-device by design');
}

async function cleanup() {
  // Delete exactly the row we inserted (cascade would also cover it).
  if (scanId) {
    await supabase.from('haul_scans').delete().eq('id', scanId).then(
      () => {},
      () => {}
    );
  }
  // Delete the ephemeral user → cascades its user_goals + any haul_scans rows.
  if (testUserId) {
    const { error } = await supabase.auth.admin.deleteUser(testUserId);
    if (error) {
      console.error(`\n⚠ Cleanup: could not delete test user ${testUserId} (${error.message}).`);
      console.error(`  Remove it manually: Auth → Users → ${testEmail}. Its rows cascade on delete.`);
      return;
    }
    const { data } = await supabase.from('user_goals').select('user_id').eq('user_id', testUserId);
    console.log(`\nCleanup: ephemeral user deleted${Array.isArray(data) && data.length === 0 ? ' (user_goals row cascaded ✓)' : ''}.`);
  }
}

try {
  await main();
} catch (e) {
  console.error('\nUnexpected error:', e?.message || e);
} finally {
  await cleanup();
  const failed = results.filter((r) => !r.ok).length;
  console.log(`\n${failed === 0 ? 'ALL DB PATHS VERIFIED ✓' : failed + ' PATH(S) FAILED ✗'}`);
  process.exit(failed === 0 ? 0 : 1);
}
