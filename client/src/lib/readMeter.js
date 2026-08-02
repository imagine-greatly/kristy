// THE FULL-READ METER, for a signed-out shopper.
//
// Three free full reads, then the ask. A signed-in user is metered on the SERVER
// (`user_goals.free_reads_used`); a stranger is metered here, in localStorage, and the
// count rides up on the request so the server can answer honestly.
//
// THAT IS DELIBERATE. Metering a stranger server-side needs an identifier, and the
// counter's privacy claim is that its free layer stores no personal data — no user key,
// no IP, no session. An IP-keyed meter would break that to enforce a limit a cleared
// localStorage defeats anyway, and behind a shared office or carrier address it would
// spend one stranger's reads on another. The scrape surface that mattered was the bulk
// card endpoint, and that is closed on the server.
//
// The failure direction is correct: defeating this buys a few more free reads of the
// thing we are using to acquire them.

const KEY = 'kristy:reads';
export const FREE_READ_LIMIT = 3;

export function readsSpent() {
  try {
    return Number(localStorage.getItem(KEY)) || 0;
  } catch {
    return 0; // private mode, storage disabled — fail OPEN, never wall someone by accident
  }
}

export function spendRead() {
  const next = readsSpent() + 1;
  try {
    localStorage.setItem(KEY, String(next));
  } catch { /* nothing to do; they get another free read */ }
  return next;
}

/** Have they used all three? Essentials never reach here — they are always full. */
export function readsExhausted() {
  return readsSpent() >= FREE_READ_LIMIT;
}

export function resetReads() {
  try {
    localStorage.removeItem(KEY);
  } catch { /* ignore */ }
}
