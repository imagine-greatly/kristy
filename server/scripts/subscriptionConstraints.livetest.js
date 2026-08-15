// Acceptance — the LIVE CHECK constraints on public.subscriptions.status / .provider.
//
//   cd server && node --use-system-ca scripts/subscriptionConstraints.livetest.js
//
// ═══ WHY THIS EXISTS ════════════════════════════════════════════════════════════════════
//
// `supabase/subscription_status_check.sql` audits the CODE and `schema.sql` and then says,
// in its own words, that this is NOT a reading of the live constraint:
//
//     "The audit above is of the CODE and of schema.sql. It is not a reading of the live
//      constraint. docs/SCHEMA-AUDIT.md compares COLUMNS and says so explicitly — its
//      method does not read constraints or indexes."
//
// It names the settling query (`select conname, pg_get_constraintdef(oid) from pg_constraint`)
// — but nothing in this repo can run raw SQL: every live path goes through supabase-js, which
// speaks PostgREST, not psql. So the constraint is read the way this repo reads the self-heal
// loop: BY BEHAVIOUR. Offer each candidate value to the real column and record which ones the
// live table takes.
//
// ⚠️ THE CONTROL IS THE WHOLE POINT, AND WITHOUT IT THIS SCRIPT IS A FINDINGS-FAMILY DEFECT.
// "Every value was accepted" has two readings — a WIDE constraint, or NO CONSTRAINT AT ALL —
// and an accept-only probe cannot tell them apart. It would report the widest possible good
// news in precisely the case where the column has lost its guard. So each column is also
// offered a value that MUST be rejected. If the control is accepted, every other result on
// that column is void and this script exits non-zero saying so, rather than printing a set.
//
// ═══ SAFETY (non-destructive by construction, same pattern as verify-migration.js) ══════
//
//   • Every write happens under a single EPHEMERAL auth user created for this run via the
//     Admin API. Its uuid satisfies the auth.users FK on subscriptions, so no real user is
//     ever referenced, read, or written.
//   • The probe row is deleted, then the user is deleted — which CASCADES anything left.
//   • No truncate. No real subscriptions row is read, written or deleted. The service-role
//     key is never printed; only the project host is echoed.

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('✗ SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set (checked env + server/.env). Aborting.');
  process.exit(2);
}

try {
  console.log(`Project: ${new URL(SUPABASE_URL).host}\n`);
} catch {
  /* ignore */
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// What schema.sql DECLARES (lines 168–171). The probe compares the live answer to this.
const DECLARED_STATUS = ['trialing', 'active', 'past_due', 'canceled', 'expired'];
const DECLARED_PROVIDER = ['stripe', 'apple', 'promo'];

// Every value any writer in this repo can produce, plus the ones under discussion.
const STATUS_CANDIDATES = ['trialing', 'active', 'past_due', 'canceled', 'expired'];
const PROVIDER_CANDIDATES = ['stripe', 'apple', 'promo', 'revenuecat'];

// ⚠️ Must be REJECTED. Accepted → the column has no CHECK and every other result is void.
const CONTROL = '__kristy_control_must_reject__';

// A CHECK violation is 23514. PostgREST surfaces the SQLSTATE in `code`.
const isCheckViolation = (e) => e?.code === '23514' || /violates check constraint/i.test(e?.message || '');

let userId = null;
const cleanup = async () => {
  if (!userId) return;
  await supabase.from('subscriptions').delete().eq('user_id', userId);
  await supabase.auth.admin.deleteUser(userId);
};

/** Offer one value to one column. Returns 'accepted' | 'rejected' | { error } for anything else. */
async function offer(column, value) {
  const row = {
    user_id: userId,
    status: column === 'status' ? value : 'trialing',
    provider: column === 'provider' ? value : 'promo',
  };
  const { error } = await supabase.from('subscriptions').upsert(row, { onConflict: 'user_id' });
  if (!error) return 'accepted';
  if (isCheckViolation(error)) return 'rejected';
  return { unexpected: `${error.code || '?'} ${error.message}` };
}

async function probeColumn(column, candidates, declared) {
  console.log(`\n═══ ${column} ═══`);

  // The control first — if this column has no guard, nothing below it means anything.
  const control = await offer(column, CONTROL);
  if (control !== 'rejected') {
    console.log(`  ✗ CONTROL ACCEPTED (or errored: ${JSON.stringify(control)})`);
    console.log(`  ⚠️  public.subscriptions.${column} HAS NO ENFORCED CHECK CONSTRAINT.`);
    console.log('     Every accept below would be meaningless, so none was run.');
    return { column, void: true, accepted: null, rejected: null };
  }
  console.log(`  ✓ control rejected — a CHECK on ${column} is live and enforcing`);

  const accepted = [];
  const rejected = [];
  for (const value of candidates) {
    const r = await offer(column, value);
    if (r === 'accepted') { accepted.push(value); console.log(`    ✓ accepted  ${value}`); }
    else if (r === 'rejected') { rejected.push(value); console.log(`    ✗ rejected  ${value}`); }
    else { console.log(`    ? UNEXPECTED ${value} — ${r.unexpected}`); return { column, void: true }; }
  }

  const missing = declared.filter((v) => !accepted.includes(v));
  const extra = accepted.filter((v) => !declared.includes(v));
  console.log(`  live accepted set (of those offered): ${accepted.join(', ') || '(none)'}`);
  console.log(`  schema.sql declares:                  ${declared.join(', ')}`);
  if (missing.length) console.log(`  ⚠️  DECLARED BUT LIVE-REJECTED: ${missing.join(', ')}`);
  if (extra.length) console.log(`  ⚠️  LIVE-ACCEPTED BUT UNDECLARED: ${extra.join(', ')}`);
  if (!missing.length && !extra.length) console.log('  → live table matches schema.sql on the values offered');

  return { column, void: false, accepted, rejected, missing, extra };
}

async function main() {
  const email = `kristy-constraint-probe-${Date.now()}@example.invalid`;
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: { purpose: '__kristy_verify__' },
  });
  if (error) {
    console.error(`✗ could not create the ephemeral probe user: ${error.message}`);
    process.exit(2);
  }
  userId = data.user.id;
  console.log(`Ephemeral probe user created (deleted at the end of this run).`);

  const status = await probeColumn('status', STATUS_CANDIDATES, DECLARED_STATUS);
  const provider = await probeColumn('provider', PROVIDER_CANDIDATES, DECLARED_PROVIDER);

  console.log('\n═══ WHAT THIS SETTLES ═══');

  if (status.void || provider.void) {
    console.log('  A control was accepted or a probe errored — the reading is VOID. Nothing');
    console.log('  should be built on it. Re-run, or read pg_constraint directly in the SQL editor.');
    await cleanup();
    process.exit(1);
  }

  // The two claims that actually matter downstream.
  const expiredOK = status.accepted.includes('expired');
  const revenuecatOK = provider.accepted.includes('revenuecat');
  const appleOK = provider.accepted.includes('apple');

  console.log(`  status 'expired' accepted:    ${expiredOK ? 'YES' : 'NO'}`);
  console.log(`    → RevenueCat's EXPIRATION event maps to 'expired' (routes/revenuecat.js).`);
  console.log(`      ${expiredOK
    ? "It writes. A lapsed subscriber's row lands and access ends."
    : "IT WOULD FAIL TO WRITE — a lapsed subscriber keeps access indefinitely."}`);
  console.log(`  provider 'apple' accepted:    ${appleOK ? 'YES' : 'NO'}`);
  console.log(`    → routes/revenuecat.js:98 writes provider:'apple' on EVERY webhook.`);
  console.log(`      ${appleOK
    ? 'It writes.'
    : 'EVERY REVENUECAT WEBHOOK WRITE WOULD FAIL. This is the severe one.'}`);
  console.log(`  provider 'revenuecat' accepted: ${revenuecatOK ? 'YES' : 'NO'}`);
  console.log(`    → Nothing writes it. If accepted, it is a permitted value with no writer —`);
  console.log(`      the empty slot subscription_status_check.sql warns gets filled wrongly.`);

  await cleanup();
  console.log('\nEphemeral probe user and row deleted.\n');
  process.exit(0);
}

main().catch(async (err) => {
  console.error(`\n✗ probe threw: ${err?.message || err}`);
  await cleanup();
  process.exit(2);
});
