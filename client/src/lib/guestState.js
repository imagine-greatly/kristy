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

const EMPTY_PREFS = { coach_goals: [], non_negotiables: [], focuses: [], constraints: [] };

function readPrefs(p) {
  const arr = (v) => (Array.isArray(v) ? v.filter((x) => typeof x === 'string' && x) : []);
  return {
    coach_goals: arr(p?.coach_goals),
    non_negotiables: arr(p?.non_negotiables),
    focuses: arr(p?.focuses),
    constraints: arr(p?.constraints),
  };
}

// Tolerant of the older {scans, goal} shape — a stranger mid-session when this
// shipped keeps their scans instead of having them silently dropped.
function read() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        scans: Array.isArray(parsed?.scans) ? parsed.scans : [],
        goal: parsed?.goal || null,
        prefs: readPrefs(parsed?.prefs),
        list: parsed?.list && Array.isArray(parsed.list.items) ? parsed.list : null,
        onboarded: !!parsed?.onboarded,
      };
    }
  } catch {
    /* ignore */
  }
  return { scans: [], goal: null, prefs: { ...EMPTY_PREFS }, list: null, onboarded: false };
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

/* ── Onboarding without an account ────────────────────────────────────────────
   A stranger completes the whole setup and gets a cart before being asked for
   anything, so their answers and that cart are the work we owe them — losing it at
   sign-in would make signing in a punishment. Both live here until an account
   exists to migrate them into. */

// The stranger's onboarding answers. Same field names the account uses, so
// migration is a straight hand-off to saveCoachProfile.
export function recordGuestPrefs(prefs) {
  const s = read();
  s.prefs = readPrefs(prefs);
  s.onboarded = true;
  // Keep the legacy single `goal` in sync — it still pre-fills onboarding.
  s.goal = s.prefs.coach_goals[0] || s.goal || null;
  write(s);
  return s.prefs;
}

// The cart Kristy built from those answers. Persisted whole (items carry their own
// `why`), so a reload or a bounce out to the landing page doesn't cost them the payoff.
export function recordGuestList(list) {
  const s = read();
  s.list = list && Array.isArray(list.items) ? list : null;
  write(s);
}

export function guestPrefs() {
  return read().prefs;
}

export function guestList() {
  return read().list;
}

// Has this stranger been through onboarding? Drives the entry gate — a returning
// stranger lands on their cart, not back at "what are we shopping for?".
export function guestOnboarded() {
  const s = read();
  return s.onboarded || s.prefs.coach_goals.length > 0;
}

export function hasGuestState() {
  const s = read();
  return s.scans.length > 0 || !!s.goal || s.prefs.coach_goals.length > 0 || !!s.list;
}

export function clearGuestState() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
