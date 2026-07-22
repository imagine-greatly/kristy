// Guest continuity across sign-in. A guest's scans are their most persuasive
// artifact — the reason they're converting — so we must NOT discard them the
// moment they sign in (which is exactly what happened before: GuestApp unmounts
// on OTP verify and its in-memory scans vanished). This keeps the last N scans
// (and any goal the guest expressed) in localStorage under one key; on successful
// sign-in the app replays them into the new account — scans become haul_scans, a
// goal pre-fills the coach onboarding. Guest CHAT stays stateless by design; this
// is only about the scans + goal.

const KEY = 'kristy:guest';
const MAX_SCANS = 10;

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        scans: Array.isArray(parsed?.scans) ? parsed.scans : [],
        goal: parsed?.goal || null,
      };
    }
  } catch {
    /* ignore */
  }
  return { scans: [], goal: null };
}

function write(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

// Record one completed guest scan (most-recent last), capped at the last MAX_SCANS.
// Mirrors the fields saveHaulScan sends, so replay is a straight hand-off. A scan
// with no tier (an OFF miss / unreadable label) isn't a real product — skip it.
export function recordGuestScan({ product_name = null, brand = null, tier = null, barcode = null } = {}) {
  if (!tier) return;
  const s = read();
  s.scans = [...s.scans, { product_name, brand, tier, barcode }].slice(-MAX_SCANS);
  write(s);
}

// Remember a goal the guest expressed this session — pre-fills onboarding on sign-in.
export function recordGuestGoal(value) {
  const s = read();
  s.goal = value || null;
  write(s);
}

export function loadGuestState() {
  return read();
}

export function hasGuestState() {
  const s = read();
  return s.scans.length > 0 || !!s.goal;
}

export function clearGuestState() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
