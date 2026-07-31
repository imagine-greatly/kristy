// The generation budget — the only part of the counter that costs money.
//
// WHAT COUNTS AND WHAT DOES NOT. The scope gate is regex and retrieval is a KB read, so
// both are free and neither consumes anything: an off-topic question rejected a thousand
// times costs nothing, which is the point. A slot is spent when the MODEL IS CALLED, not
// when a card is successfully persisted — a query that reliably trips lint would otherwise
// be an unbounded spend loop, retrying forever at full price.
//
// THE GLOBAL CEILING IS DERIVED FROM THE TABLE, NOT HELD IN MEMORY. An in-memory daily
// counter resets on every deploy, which makes it theatre. counter_cards already carries
// created_at, so the day's generation count is a query — it survives restarts and needs no
// new state. The per-caller buckets stay in memory, matching every other limiter here.
//
// There is deliberately NO per-IP daily cap. It would have to live in memory (IP addresses
// are never stored — the counter's whole privacy claim is that it keeps no person), so it
// would reset on deploy and give a false sense of a bound. The DB-derived global ceiling
// is the real backstop; the hourly buckets handle the rest.

const HOUR_MS = 60 * 60 * 1000;

/* ───────────────────────── Tunables ───────────────────────── */

// A real trip surfaces one to three genuine gaps. Five covers a heavy one with room; past
// that it is a script, not a shopper.
export const GEN_PER_IP_HOUR = Number(process.env.COUNTER_GEN_PER_IP_HOUR) || 5;

// An authed caller is identifiable and accountable, so a higher ceiling. Still bounded.
export const GEN_PER_USER_HOUR = Number(process.env.COUNTER_GEN_PER_USER_HOUR) || 10;

// Blast radius, not budget. Sized for a product with one shopper: a real backstop today,
// and a one-line change when that stops being true.
export const GEN_GLOBAL_DAY = Number(process.env.COUNTER_GEN_GLOBAL_DAY) || 50;

/* ───────────────────────── Per-caller windows ───────────────────────── */

const ipHits = new Map();
const userHits = new Map();

function limited(store, key, max) {
  const now = Date.now();
  const recent = (store.get(key) || []).filter((t) => now - t < HOUR_MS);
  if (recent.length >= max) {
    store.set(key, recent);
    return true;
  }
  recent.push(now);
  store.set(key, recent);
  return false;
}

/**
 * Claim one generation slot for this caller. Call it immediately BEFORE the model call.
 * @returns {boolean} true when the caller is over their hourly cap.
 */
export function generationLimited({ ip, userId }) {
  if (userId) return limited(userHits, `u:${userId}`, GEN_PER_USER_HOUR);
  return limited(ipHits, `i:${ip || 'unknown'}`, GEN_PER_IP_HOUR);
}

/* ───────────────────────── The global ceiling ───────────────────────── */

export function startOfDayISO(now = new Date()) {
  const d = new Date(now);
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString();
}

/**
 * How many cards have been generated today, straight from the table.
 *
 * A real select with an exact count header — never a head:true count, which PostgREST
 * answers 204 / null / no-error for a table that does not exist. That would read as
 * "zero generated today" for a MISSING table, i.e. "plenty of budget left" when the truth
 * is "nothing can be persisted at all".
 *
 * @returns {Promise<{count:number|null, unavailable:boolean}>}
 */
export async function generationsToday(client, now = new Date()) {
  if (!client) return { count: null, unavailable: true };
  try {
    const { data, error, count } = await client
      .from('counter_cards')
      .select('slug', { count: 'exact' })
      .eq('source', 'generated')
      .gte('created_at', startOfDayISO(now))
      .limit(1);
    if (error) throw new Error(error.message);
    const n = Number.isFinite(count) ? count : (data || []).length;
    return { count: n, unavailable: false };
  } catch (err) {
    console.warn('[kristy] generation ceiling unreadable:', err?.message || err);
    return { count: null, unavailable: true };
  }
}

/**
 * Is the global ceiling reached?
 *
 * FAILS CLOSED. When the count cannot be read, generation is refused and the counter
 * degrades to curated-only — which is exactly what the product was yesterday, so it is a
 * good failure. Failing open would make an unreadable table into unbounded spend.
 */
export async function globalCeilingReached(client, now = new Date()) {
  const { count, unavailable } = await generationsToday(client, now);
  if (unavailable) return { reached: true, count: null, reason: 'unreadable' };
  return { reached: count >= GEN_GLOBAL_DAY, count, reason: null };
}

export const GEN_BUDGETS = {
  perIpHour: GEN_PER_IP_HOUR,
  perUserHour: GEN_PER_USER_HOUR,
  globalDay: GEN_GLOBAL_DAY,
};
