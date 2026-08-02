import { useEffect, useRef, useState, lazy, Suspense } from 'react';
import { IS_DEMO } from './lib/config.js';
import { supabase } from './lib/supabase.js';
import { dayKey, dateLabel } from './lib/format.js';
import {
  saveProfileFields,
  saveCoachProfile,
  loadDayMessages,
  loadLatestSummary,
  loadProfile,
  saveHaulScan,
  loadHaul,
  startNextCart,
} from './lib/data.js';
import {
  goalNoteLabel,
  goalReadLabel,
  goalChipLabel,
  goalsOf,
  focusDisclaimerAcked,
  ackFocusDisclaimer,
  coachOnboardingSkipped,
  skipCoachOnboarding,
  resolveConstraints,
} from './lib/coachGoals.js';
import {
  loadGuestState,
  clearGuestState,
  recordGuestPrefs,
  guestOnboarded,
} from './lib/guestState.js';
import { pushSwaps, saveList } from './lib/list.js';
import { useCart, initialMoment } from './lib/cart.js';
import { trackEvent } from './lib/analytics.js';
import { sendChat, deleteAccount, getSubscription, startTrial } from './lib/api.js';
import { runProductScan, requestGoalNote } from './lib/logging.js';

import TopBar from './components/TopBar.jsx';
// Lazy-loaded: pulls in the heavy @zxing barcode decoder only when the scanner opens.
const CameraModal = lazy(() => import('./components/CameraModal.jsx'));
import Sidebar from './components/Sidebar.jsx';
import MessageBubble from './components/MessageBubble.jsx';
import TypingIndicator from './components/TypingIndicator.jsx';
import InputBar from './components/InputBar.jsx';
import GuestApp from './components/GuestApp.jsx';
import CoachOnboarding from './components/CoachOnboarding.jsx';
import GoalSwitcher from './components/GoalSwitcher.jsx';
import FocusDisclaimer from './components/FocusDisclaimer.jsx';
import Settings from './components/Settings.jsx';
import Upgrade from './components/Upgrade.jsx';
import VerdictCard from './components/VerdictCard.jsx';
import ScanSheet from './components/ScanSheet.jsx';
import BottomNav from './components/BottomNav.jsx';
import ScanHome from './components/ScanHome.jsx';
import AisleMoment from './components/AisleMoment.jsx';
import UpgradeSheet from './components/UpgradeSheet.jsx';
import HaulMoment from './components/HaulMoment.jsx';
import CartMoment from './components/CartMoment.jsx';
import ImportList from './components/ImportList.jsx';
import ChatLauncher from './components/ChatLauncher.jsx';
import HaulShareCard from './components/HaulShareCard.jsx';
import IngredientPage from './components/IngredientPage.jsx';
import { ingredientIdFromPath, ingredientPath } from './lib/ingredients.js';

const rid = () =>
  (crypto.randomUUID && crypto.randomUUID()) || `id-${Date.now()}-${Math.random()}`;

const toUiMsg = (m) => ({
  id: m.id,
  role: m.role,
  content: m.content,
  macros: m.macros || null,
  isSummary: !!m.isSummary,
});

export default function App() {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState(null);
  const [userId, setUserId] = useState(null);
  const [profile, setProfile] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false); // bring-your-own-list sheet
  // Grocery-coach entry restructure: the goal is a contextual MODE, not a door gate.
  const [switcherOpen, setSwitcherOpen] = useState(false); // the chip’s mode switcher
  const [focusOffer, setFocusOffer] = useState(null); // { category, focus, line } | null
  const [disclaimerOpen, setDisclaimerOpen] = useState(false); // one-time coach-not-doctor
  const [coachOnbSkipped, setCoachOnbSkipped] = useState(false); // first-run coach onboarding dismissed
  const [onbInitialGoal, setOnbInitialGoal] = useState(null); // guest-expressed goal, pre-fills onboarding
  // A stranger's setup, before any account exists. Flips once they finish (or skip)
  // so the entry gate stops re-asking.
  const [guestSetup, setGuestSetup] = useState(() => guestOnboarded());

  const [messages, setMessages] = useState([]);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState('');
  const [cameraOpen, setCameraOpen] = useState(false);
  // Kristy's Verdict overlay (separate pipeline — never touches meals/thread).
  const [verdict, setVerdict] = useState(null); // null | { loading, data, error }
  // Scan → verdict card (Step 4). A scan is now a verdict, not a silent meal log.
  const [scan, setScan] = useState(null); // null | { loading, mode, found, verdict, product, gate, error, message }
  // Monotonic scan ticket. Extraction + /verdict are two network hops, so two scans
  // can be in flight at once (a re-scan, or a barcode miss the shopper immediately
  // follows with a label photo). Without this the LAST response to arrive rendered —
  // which may be the OLDER one, showing a verdict for a product the shopper has
  // already moved on from. Every scan takes a ticket; only the current one may render.
  const scanSeqRef = useRef(0);
  // Three-moment nav: List (before) · Scan (aisle) · Haul (after). The app opens on
  // the CART — the trip taking shape — not the scanner and not a blank chat box.
  // `initialMoment` reads only the local cache (no network, no boot delay) and falls
  // back to the cart on any doubt: a just-finished trip is the one case worth landing
  // somewhere else, because the Haul read is what's useful then. Every surface stays
  // one tap away regardless.
  const [moment, setMoment] = useState(initialMoment); // 'scan' | 'list' | 'haul' | 'chat'
  // The composer is docked on every surface; this bumps to pull focus into it when a
  // tap affordance ("Build me a cart for…") hands off to the deep-input path.
  const [composerFocus, setComposerFocus] = useState(0);
  // The Haul (Step 7): aggregate of the trip + week's scans. Lazily loaded; nulled
  // after each new scan so it refreshes on next open.
  const [haul, setHaul] = useState(null);
  const [haulLoading, setHaulLoading] = useState(false);
  const [shareHaul, setShareHaul] = useState(false); // the shareable haul card overlay (Step 10)
  // Ingredient detail page (/app/ingredient/:id) — a full-screen KB read that takes
  // over the app. Seeded from the URL so deep links + guests work.
  const [ingredientId, setIngredientId] = useState(() => ingredientIdFromPath());
  const [viewingDate, setViewingDate] = useState(dayKey());
  // The local day the live thread belongs to — used to detect a midnight rollover.
  const [liveDay, setLiveDay] = useState(dayKey());

  const chatRef = useRef(null);
  // Per-session tally behind the contextual focus offer. Not persisted — resets on
  // reload. `offered` caps it at one offer per session; `counts` tracks same-category
  // flags across scans (a focus already active is never counted / offered).
  const focusSessionRef = useRef({ counts: {}, offered: false });
  // Guards the one-time guest→account replay so multiple auth events don't double it.
  const guestReplayRef = useRef(false);
  const today = dayKey();

  /* ───────── The cart — one object, several views ─────────
     Lifted out of the cart screen so a scan can land in the trip before that screen
     has ever been opened, the nav can show progress, and the Haul can read back from
     the same list. The server stays the source of truth; this is the shared client. */
  const cart = useCart({
    goal: goalsOf(profile)[0] || null,
    goals: goalsOf(profile),
    nonNegotiables: profile?.non_negotiables || [],
    focuses: profile?.focuses || [],
    constraints: resolveConstraints(profile),
  });

  /* ───────── Auth + initial load ───────── */
  useEffect(() => {
    if (IS_DEMO) {
      const demo = { user: { id: 'demo-user' } };
      setSession(demo);
      setUserId('demo-user');
      loadProfile('demo-user').then((prof) => {
        setProfile(prof);
        setCoachOnbSkipped(coachOnboardingSkipped('demo-user'));
        // First run (no coach_goal, not skipped) → the coach onboarding branch below
        // asks who we're shopping for; otherwise everyone lands straight on Scan.
        bootstrap('demo-user').then(() => setReady(true));
      });
      return;
    }

    supabase.auth.getSession().then(({ data }) => handleSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) =>
      handleSession(s)
    );
    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSession(s) {
    setSession(s);
    if (s?.user) {
      setUserId(s.user.id);
      const prof = await loadProfile(s.user.id).catch(() => null);
      setProfile(prof);
      setCoachOnbSkipped(coachOnboardingSkipped(s.user.id));
      // First run (no coach_goal, not skipped) → the coach onboarding branch below
      // asks who we're shopping for and starts the trial; otherwise straight to Scan.
      await bootstrap(s.user.id);

      // Carry a converted guest's work into the account, once per session (guards
      // against repeat auth events). A guest-expressed goal pre-fills onboarding
      // synchronously — before we flip `ready` — so the onboarding renders with it.
      // The scan replay is fire-and-forget so sign-in never waits on N network writes.
      if (!guestReplayRef.current) {
        guestReplayRef.current = true;
        const guest = loadGuestState();
        const guestGoals = guest.prefs?.coach_goals || [];
        if (guest.scans.length || guest.goal || guestGoals.length || guest.list) {
          if (guest.goal && !prof?.coach_goal) setOnbInitialGoal(guest.goal);
          claimGuestWork(guest, prof);
        }
      }
    }
    setReady(true);
  }

  /* Carry everything a stranger made into the account they just created.
     Signing in has to feel like locking in work, so nothing they did may be lost:
     the onboarding answers become their profile, the cart becomes their cart, and
     the scans become their Haul. Fire-and-forget from handleSession so sign-in never
     waits on N network writes; the guest key is cleared once, at the end, so a reload
     can't double-post. Individual failures are non-fatal — a dropped scan must not
     cost them their preferences. */
  async function claimGuestWork(guest, prof) {
    const prefs = guest.prefs || {};
    const goals = prefs.coach_goals || [];

    try {
      // 1. Preferences first — they're the cheapest to lose and the most valuable to
      //    keep, and every downstream surface reads from them. An account that already
      //    has goals is left alone: a returning user's real profile outranks a
      //    stranger's session.
      if (goals.length && !(prof?.coach_goals?.length || prof?.coach_goal)) {
        try {
          await saveCoachProfile(userId || null, {
            coach_goals: goals,
            non_negotiables: prefs.non_negotiables || [],
            focuses: prefs.focuses || [],
            constraints: prefs.constraints || [],
          });
          setProfile((p) => ({
            ...(p || {}),
            coach_goals: goals,
            coach_goal: goals[0] || null,
            non_negotiables: prefs.non_negotiables || [],
            focuses: prefs.focuses || [],
            constraints: prefs.constraints || [],
          }));
        } catch {
          /* non-fatal — they can re-set from the header chip */
        }
      }

      // 2. The cart they watched Kristy build. saveList stamps the local cache and
      //    persists to /api/list, so it's on the cart surface the moment they land.
      if (guest.list && Array.isArray(guest.list.items) && guest.list.items.length) {
        try {
          await saveList(guest.list);
          cart.applyList(guest.list, guest.list.intro || '');
        } catch {
          /* non-fatal */
        }
      }

      // 3. The scans, into the Haul.
      for (const sc of guest.scans || []) {
        try {
          await saveHaulScan(sc);
        } catch {
          /* non-fatal per scan */
        }
      }
    } finally {
      clearGuestState();
    }

    if (guest.scans?.length) {
      setHaul(null); // invalidate cache → the Haul reloads with the carried-over scans
      trackEvent('guest_scans_claimed', { count: guest.scans.length });
    }
    if (goals.length || guest.list) {
      trackEvent('guest_work_claimed', { goals: goals.length, cart: guest.list?.items?.length || 0 });
    }
  }

  /* ───────── The stranger's setup — onboarding with no account ─────────
     Onboarding captures HOW they eat. It does NOT build a cart.

     It used to: a stranger answered four screens and was handed a generated 18-item
     cart. However good each row was, nobody asked for it, so the whole thing read as
     imposed and generic. The preferences are the lens; the cart is what the shopper
     puts in it. So this lands them on the cart with Kristy's question, and the answer
     to THAT builds the list. "Build a full cart" is still there for anyone who
     actually wants one — it's a choice now, not the default. */
  function handleGuestOnboardingComplete({ coach_goals, non_negotiables, focuses, constraints }) {
    recordGuestPrefs({ coach_goals, non_negotiables, focuses, constraints });
    trackEvent('coach_onboarded', {
      goals: (coach_goals || []).length,
      focuses: (focuses || []).length,
      hardLines: (non_negotiables || []).length,
      constraints: (constraints || []).length,
      guest: true,
    });
    setGuestSetup(true);
  }

  // Skipping is a real choice: no goals, no cart, straight into scanning. The cart
  // surface keeps a way back in, so skipping is never a one-way door.
  function handleGuestOnboardingSkip() {
    setGuestSetup(true);
    trackEvent('onboarding-skip', { guest: true });
  }

  /* ───────── Grocery-coach goal + focuses (contextual, no door gate) ───────── */

  // Toggle a goal in the SET — the chip switcher and the in-card ask both add/remove.
  // Goals are multi-select now; coach_goal stays synced as the primary (for the chip).
  // Setting a goal does NOT grant the trial (that's one explicit choice at the gate),
  // so goal-set users keep their 3 free tastes. Optimistic; returns the new set.
  async function toggleGoal(value) {
    const cur = goalsOf(profile);
    const next = cur.includes(value) ? cur.filter((x) => x !== value) : [...cur, value];
    setProfile((p) => ({ ...(p || {}), coach_goals: next, coach_goal: next[0] || null }));
    try {
      await saveCoachProfile(userId, {
        coach_goals: next,
        non_negotiables: profile?.non_negotiables || [],
        focuses: profile?.focuses || [],
        constraints: profile?.constraints || [],
      });
    } catch {
      /* keep optimistic value */
    }
    return next;
  }

  // First-run coach onboarding: a goal was chosen → persist goal + prefs and land on
  // Scan (the profile update unmounts the onboarding). No trial is granted here — the
  // user gets their free tastes first and starts the trial explicitly at the gate.
  // If focuses were chosen, the in-context note stood in for the one-time coach-not-
  // doctor disclaimer, so mark it acknowledged rather than firing the modal later.
  async function handleCoachOnboardingComplete({ coach_goals, non_negotiables, focuses, constraints }) {
    const goals = Array.isArray(coach_goals) ? coach_goals.filter(Boolean) : [];
    setProfile((p) => ({ ...(p || {}), coach_goals: goals, coach_goal: goals[0] || null, non_negotiables, focuses, constraints, onboarded: true }));
    if (focuses?.length && !focusDisclaimerAcked()) ackFocusDisclaimer();
    trackEvent('coach_onboarded', {
      goals: goals.length,
      focuses: (focuses || []).length,
      hardLines: (non_negotiables || []).length,
      constraints: (constraints || []).length,
    });
    try {
      await saveCoachProfile(userId, { coach_goals: goals, non_negotiables, focuses, constraints });
    } catch {
      /* keep optimistic values */
    }
  }

  function handleCoachOnboardingSkip() {
    skipCoachOnboarding(userId);
    setCoachOnbSkipped(true);
    trackEvent('coach_onboarding_skipped');
  }

  // The in-card goal ask: tap a goal → persist it → recompose the personalized note
  // for the SAME product in place (reusing the extracted ingredients — no re-scan).
  // That first note consumes free-taste 1 of 3, exactly per the existing counter.
  async function handlePickGoal(value) {
    const next = await toggleGoal(value);
    if (!scan?.ingredients) return; // nothing cached to recompose against
    setScan((s) => (s ? { ...s, pickingGoal: true } : s));
    try {
      const verdict = await requestGoalNote({
        ingredients: scan.ingredients,
        nutrition: scan.nutrition,
        goal: goalNoteLabel(next),
        nonNegotiables: profile?.non_negotiables || [],
        focuses: profile?.focuses || [],
        constraints: resolveConstraints(profile),
        partialRead: !!scan.partialRead,
      });
      setScan((s) => (s ? { ...s, verdict, pickingGoal: false } : s));
      if (verdict?.tier) trackEvent('verdict', { tier: verdict.tier, gated: !!verdict.gated, goalSet: true });
    } catch {
      setScan((s) => (s ? { ...s, pickingGoal: false } : s));
    }
  }

  // The chip switcher: goals are multi-select, so tapping one TOGGLES it and keeps the
  // sheet open (set several at once). Forward-looking — the next verdict/list reflect it.
  function handleSwitcherToggleGoal(value) {
    toggleGoal(value);
  }

  // Toggle a dietary focus (from the switcher or a contextual offer). The first focus
  // ever turned on fires the one-time coach-not-doctor disclaimer, verbatim.
  async function handleToggleFocus(value) {
    const cur = profile?.focuses || [];
    const adding = !cur.includes(value);
    const next = adding ? [...cur, value] : cur.filter((x) => x !== value);
    setProfile((p) => ({ ...(p || {}), focuses: next }));
    if (adding && !focusDisclaimerAcked()) setDisclaimerOpen(true);
    try {
      await saveProfileFields(userId, { focuses: next });
    } catch {
      /* keep optimistic value */
    }
  }

  async function handleToggleNonNegotiable(value) {
    const cur = profile?.non_negotiables || [];
    const next = cur.includes(value) ? cur.filter((x) => x !== value) : [...cur, value];
    setProfile((p) => ({ ...(p || {}), non_negotiables: next }));
    try {
      await saveProfileFields(userId, { non_negotiables: next });
    } catch {
      /* keep optimistic value */
    }
  }

  // Toggle a Constraint (circumstance) — from the switcher's "what are you working
  // with?" section. No disclaimer: constraints aren't health, they're your situation.
  async function handleToggleConstraint(value) {
    const cur = profile?.constraints || [];
    const next = cur.includes(value) ? cur.filter((x) => x !== value) : [...cur, value];
    setProfile((p) => ({ ...(p || {}), constraints: next }));
    try {
      await saveProfileFields(userId, { constraints: next });
    } catch {
      /* keep optimistic value */
    }
  }

  function dismissDisclaimer() {
    ackFocusDisclaimer();
    setDisclaimerOpen(false);
  }

  // Remove a preference Kristy captured from chat (the editable chips under her
  // reply). Recomputes the full pref set minus this item, persists it, and drops
  // the chip from that message — a wrong parse is one tap to fix.
  async function handleRemoveChatPref(msgId, kind, value) {
    const next = {
      coach_goals: goalsOf(profile),
      focuses: profile?.focuses || [],
      non_negotiables: profile?.non_negotiables || [],
      constraints: profile?.constraints || [],
    };
    if (kind === 'goal') next.coach_goals = next.coach_goals.filter((x) => x !== value);
    else if (kind === 'focus') next.focuses = next.focuses.filter((x) => x !== value);
    else if (kind === 'hardLine') next.non_negotiables = next.non_negotiables.filter((x) => x !== value);
    else if (kind === 'constraint') next.constraints = next.constraints.filter((x) => x !== value);

    setProfile((p) => ({ ...(p || {}), ...next, coach_goal: next.coach_goals[0] || null }));
    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId && m.preferenceUpdate
          ? {
              ...m,
              preferenceUpdate: {
                ...m.preferenceUpdate,
                labeled: m.preferenceUpdate.labeled.filter((x) => !(x.kind === kind && x.value === value)),
              },
            }
          : m
      )
    );
    try {
      await saveCoachProfile(userId, next);
    } catch {
      /* keep optimistic value */
    }
  }

  /* ───────── Contextual focus offer ─────────
     After 2+ scans flag the SAME category in a session, Kristy offers ONCE to watch
     it — never for a focus already on, at most one offer per session, never a modal.
     Categories come from the deterministic nutrition/KB signals on the verdict. */
  const CATEGORY_FOCUS = { sodium: 'lower_sodium', sugar: 'lower_sugar', blood_sugar: 'blood_sugar', heart: 'heart' };
  const OFFER_LINE = {
    sodium: "That’s two high-sodium picks you’ve put back. Want sodium flagged from here on?",
    sugar: "Twice now on the high-sugar stuff. Want added sugar flagged from here on?",
    blood_sugar: 'Couple of blood-sugar spikers back to back. Want those flagged as we shop?',
    heart: 'Two now with the oils on the whole-food standard. Flag that from here on?',
  };

  function categoriesFromSignals(sig) {
    if (!sig) return [];
    const cats = [];
    if (sig.highSodium) cats.push('sodium');
    if (sig.highAddedSugar) cats.push('sugar');
    if (Array.isArray(sig.glycemicHigh) && sig.glycemicHigh.length) cats.push('blood_sugar');
    if (Array.isArray(sig.cardiovascular) && sig.cardiovascular.length) cats.push('heart');
    return cats;
  }

  // Update the per-session tally from a verdict's signals; if a category crossed the
  // 2-flag line, raise the one allowed offer.
  function maybeOfferFocus(signals) {
    const s = focusSessionRef.current;
    if (s.offered) return;
    const active = profile?.focuses || [];
    for (const cat of categoriesFromSignals(signals)) {
      if (active.includes(CATEGORY_FOCUS[cat])) continue; // already watching → ignore
      s.counts[cat] = (s.counts[cat] || 0) + 1;
      if (s.counts[cat] >= 2) {
        s.offered = true;
        setFocusOffer({ category: cat, focus: CATEGORY_FOCUS[cat], line: OFFER_LINE[cat] });
        return;
      }
    }
  }

  function acceptFocusOffer(off) {
    setFocusOffer(null);
    if (off?.focus) handleToggleFocus(off.focus); // turns it on + fires disclaimer if first
  }
  function dismissFocusOffer() {
    setFocusOffer(null);
  }

  // Shared tail for both scan entry points: reflect the result, fire analytics,
  // record it in the Haul, and evaluate the contextual focus offer.
  //
  // `ticket` is the sequence number the scan was started with. A result that isn't
  // the newest is DROPPED — not rendered, not recorded in the Haul, not counted in
  // analytics. Dropping it silently is correct: the shopper is already watching a
  // newer scan, and the stale one was never about the product in their hand.
  function applyScanResult(result, mode, ticket) {
    if (ticket !== undefined && ticket !== scanSeqRef.current) return;
    setScan({ ...result, mode });
    if (result?.verdict) {
      trackEvent('verdict', { tier: result.verdict.tier, gated: !!result.verdict.gated });
      maybeOfferFocus(result.verdict.signals);
    }
    recordScan(result);
  }

  // Settings → delete account. Real mode signs the user out (onAuthStateChange
  // drops them to the guest view); demo mode has no auth event, so reload.
  async function handleDeleteAccount() {
    await deleteAccount();
    if (IS_DEMO) window.location.reload();
  }

  async function bootstrap(uid) {
    const todayKey = dayKey(new Date());

    const [dayMsgs, summary, sub] = await Promise.all([
      loadDayMessages(uid, todayKey),
      loadLatestSummary(uid),
      getSubscription(),
    ]);
    setSubscription(sub);
    setViewingDate(todayKey);
    setLiveDay(todayKey);

    const msgs = dayMsgs.map(toUiMsg);

    // Weekly summary sits at the top of the thread on app open.
    if (summary?.summary_text) {
      msgs.unshift({
        id: `summary-${summary.id}`,
        role: 'ai',
        content: summary.summary_text,
        macros: null,
        isSummary: true,
      });
    }

    setMessages(msgs);
  }

  // Open the upgrade view (from a locked feature, the sidebar, or settings).
  // THE ASK APPEARS AT TWO MOMENTS AND NOWHERE ELSE: the fourth full-read tap, and a
  // list save. Not on open, not on a scan, not on an ask, never a banner. Interrupting
  // someone mid-aisle is how this gets deleted.
  const [upgradeSheet, setUpgradeSheet] = useState(null); // { reason, itemCount }
  const askToUpgrade = (reason, itemCount = 0) => setUpgradeSheet({ reason, itemCount });

  function openUpgrade() {
    setSidebarOpen(false);
    setUpgradeOpen(true);
  }

  // The ONE path that grants the 7-day trial — taken explicitly at peak intent (the
  // withheld read or the Upgrade screen), never on a goal tap. The server grant is
  // idempotent, so this can't reset an existing trial/sub. On success the premium UI
  // flips on and, if the user was blocked on a gated scan, the read they just unlocked
  // is recomposed in place (reusing the cached ingredients — no re-scan, no free taste
  // spent since they're now a member). Returns the fresh snapshot for callers to check.
  async function handleStartTrial() {
    const sub = await startTrial();
    setSubscription(sub);
    setUpgradeOpen(false);
    if (!sub?.premium) return sub; // grant didn’t land (pre-migration / already used)
    trackEvent('trial_started');
    if (scan?.verdict?.gated && scan?.ingredients) {
      setScan((s) => (s ? { ...s, pickingGoal: true } : s));
      try {
        const verdict = await requestGoalNote({
          ingredients: scan.ingredients,
          nutrition: scan.nutrition,
          goal: goalNoteLabel(goalsOf(profile)),
          nonNegotiables: profile?.non_negotiables || [],
          focuses: profile?.focuses || [],
          constraints: resolveConstraints(profile),
          partialRead: !!scan.partialRead,
        });
        setScan((s) => (s ? { ...s, verdict, pickingGoal: false } : s));
      } catch {
        setScan((s) => (s ? { ...s, pickingGoal: false } : s));
      }
    }
    return sub;
  }

  // Returning from Stripe Checkout: strip the query param, and if it was a
  // success poll the subscription a few times (the webhook lands just after the
  // redirect) so the UI flips to active without a manual refresh.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const checkout = params.get('checkout');
    if (!checkout) return;
    window.history.replaceState({}, '', window.location.pathname);
    if (checkout !== 'success' || IS_DEMO) return;

    let tries = 0;
    let cancelled = false;
    const poll = async () => {
      const sub = await getSubscription();
      if (cancelled) return;
      setSubscription(sub);
      if (sub.status !== 'active' && tries < 4) {
        tries += 1;
        setTimeout(poll, 1500);
      }
    };
    poll();
    return () => {
      cancelled = true;
    };
  }, []);

  /* ───────── Scroll to bottom on new messages ───────── */
  useEffect(() => {
    const el = chatRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, typing]);

  /* ───────── Send ───────── */
  async function handleSend(text) {
    const content = (text ?? input).trim();
    if (!content || typing) return;

    setInput('');
    // The composer is docked everywhere; sending from the cart or the Haul opens the
    // thread so her answer is actually visible. The moment row gets them back in one tap.
    if (moment !== 'chat') setMoment('chat');
    const cur = dayKey(new Date());
    let baseMessages;

    if (cur !== liveDay) {
      // Midnight crossed while the app stayed open → fresh thread for the new day.
      baseMessages = [];
      setMessages(baseMessages);
      setViewingDate(cur);
      setLiveDay(cur);
    } else if (viewingDate !== cur) {
      // Returning from a read-only past-day view to today's live thread.
      const dayMsgs = await loadDayMessages(userId, cur);
      baseMessages = dayMsgs.map(toUiMsg);
      setMessages(baseMessages);
      setViewingDate(cur);
    } else {
      baseMessages = messages;
    }

    const userMsg = { id: rid(), role: 'user', content, macros: null };
    const history = baseMessages
      .filter((m) => !m.isSummary && !m.isRecap)
      .slice(-10)
      .map((m) => ({ role: m.role, content: m.content }));

    setMessages((prev) => [...prev, userMsg]);
    setTyping(true);

    try {
      const result = await sendChat({ message: content, history });

      // A preference Kristy just captured from chat → reflect it in the profile
      // (so the goal chip + every future scan/list use it) and carry the editable
      // chips into the bubble so a wrong parse is one tap to fix.
      const pu = result.preferenceUpdate || null;
      if (pu?.merged) {
        const g = Array.isArray(pu.merged.goals) ? pu.merged.goals : [];
        setProfile((p) => ({
          ...(p || {}),
          coach_goals: g,
          coach_goal: g[0] ?? p?.coach_goal ?? null,
          focuses: pu.merged.focuses || [],
          non_negotiables: pu.merged.hardLines || [],
          constraints: pu.merged.constraints || [],
        }));
      }

      // She edited the cart from chat ("add taco night", "build me three dinners").
      // The cart is one object, so the change lands in it immediately — switching back
      // to the cart just shows it already done.
      if (result.listUpdate?.list) {
        cart.applyList(result.listUpdate.list, result.listUpdate.summary);
        trackEvent('list-compose', { mode: result.listUpdate.mode || 'edit', via: 'chat' });
      }

      const aiMsg = {
        id: rid(),
        role: 'ai',
        content: result.message,
        macros: null,
        preferenceUpdate: pu,
        // A counter question answered from the composer carries its entry, so the
        // bubble can render the reference card and its one-tap add.
        perimeterEntry: result.perimeterEntry || null,
        // A locked-feature reply for a free user → the quiet "Unlock coaching" link.
        upgrade: !!result.upgrade,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: rid(),
          role: 'ai',
          content:
            "That didn’t go through. Try again in a sec.",
          macros: null,
        },
      ]);
    } finally {
      setTyping(false);
    }
  }

  /* ───────── Barcode + label scanning ───────── */

  // Dismissing the sheet invalidates whatever is still in flight. Otherwise a slow
  // lookup lands after the shopper walked away and pops a verdict card back open
  // for a product they're no longer holding.
  function closeScan() {
    scanSeqRef.current += 1;
    setScan(null);
  }

  // A scanned barcode is a VERDICT, not a meal log: extract → /verdict → the card.
  async function handleScan(barcode) {
    const ticket = ++scanSeqRef.current;
    setCameraOpen(false);
    setFocusOffer(null);
    setScan({ loading: true, mode: 'barcode' });
    trackEvent('scan', { mode: 'barcode' });
    try {
      const result = await runProductScan({
        mode: 'barcode',
        barcode,
        goal: goalNoteLabel(goalsOf(profile)),
        nonNegotiables: profile?.non_negotiables || [],
        focuses: profile?.focuses || [],
        constraints: resolveConstraints(profile),
        // No stored goal → universal layer + the in-card goal ask (no note, no taste).
        personalize: goalsOf(profile).length > 0,
      });
      applyScanResult(result, 'barcode', ticket);
    } catch {
      if (ticket !== scanSeqRef.current) return;
      setScan({ mode: 'barcode', error: true, message: "That scan didn’t go through. Try again in a sec." });
    }
  }

  /* ───────── Photo-of-label scan (Step 4) ─────────
     Vision reads the label → ingredients → /verdict → the Step-3 card. Deliberately
     separate from meal logging — it never appends to the thread and never creates a meal. */
  async function handleVerdictFile(file) {
    if (!file) return;
    // Takes a ticket for the same reason: this path is most often reached FROM a
    // barcode miss, so the barcode's own request may still be in flight behind it.
    const ticket = ++scanSeqRef.current;
    // THE SELF-HEALING HANDOFF. If this photo is answering a barcode that missed,
    // carry that code along: the read gets retained under it, so the same barcode
    // resolves from Kristy's own store next time — for every shopper, not just this
    // one. Read before setScan, since that clears the miss we're reading from.
    const missedBarcode = scan?.found === false && scan.mode === 'barcode'
      ? scan.product?.barcode || null
      : null;
    setFocusOffer(null);
    setScan({ loading: true, mode: 'label' });
    trackEvent('scan', { mode: 'label' });
    try {
      const result = await runProductScan({
        mode: 'label',
        file,
        barcode: missedBarcode,
        goal: goalNoteLabel(goalsOf(profile)),
        nonNegotiables: profile?.non_negotiables || [],
        focuses: profile?.focuses || [],
        constraints: resolveConstraints(profile),
        personalize: goalsOf(profile).length > 0,
      });
      applyScanResult(result, 'label', ticket);
    } catch {
      if (ticket !== scanSeqRef.current) return;
      setScan({ mode: 'label', error: true, message: "Couldn’t read that one. Try another shot, better lit." });
    }
  }

  /* ───────── The Haul (Step 7) ───────── */

  // Record a completed scan in the haul (authed app only — guests' Haul is gated).
  // Fire-and-forget: a failed record never disturbs the verdict the user is reading.
  async function recordScan(result) {
    if (!result?.verdict || result.found === false) return;
    try {
      await saveHaulScan({
        product_name: result.product?.name || null,
        brand: result.product?.brand || null,
        tier: result.verdict.tier,
        barcode: result.product?.barcode || null,
      });
      setHaul(null); // invalidate cache → reload on next Haul open
    } catch {
      /* non-fatal */
    }
  }

  // Haul → next cart, in one tap. The finished trip becomes the starting point for
  // the next one: the shopper's accepted carry-forwards are written as the new cart
  // (server-validated against what was actually offered), and we drop them straight
  // into it — the loop closes on the surface where the next trip happens.
  async function handleStartNextCart(accepted) {
    const { list } = await startNextCart(accepted);
    if (!list) return false;
    cart.applyList(list, list.intro || '');
    trackEvent('list-build', { source: 'haul-carryforward', items: list.items?.length || 0 });
    setMoment('list');
    return true;
  }

  async function loadHaulData() {
    setHaulLoading(true);
    try {
      setHaul(await loadHaul());
    } catch {
      setHaul({ trip: [], week: [], distribution: { approved: 0, note: 0, swap: 0, total: 0 }, read: '' });
    } finally {
      setHaulLoading(false);
    }
  }

  function openHaul() {
    setMoment('haul');
    if (!haul && !haulLoading) loadHaulData();
  }

  // "Add to next list" → queue the swap-tier items for the cart. Server-side in real
  // mode (cross-device) AND folded into the live cart immediately, so the finished
  // trip visibly shapes the next one instead of waiting for a round-trip.
  function handleAddToList(subset) {
    const swaps = (subset || haul?.week || [])
      .filter((s) => s.tier === 'swap_recommended' || s.tier === 'skip')
      .map((s) => ({ product_name: s.product_name, tier: s.tier }));
    if (!swaps.length) return;
    pushSwaps(swaps);
    cart.addSwaps(swaps);
    trackEvent('haul-to-cart', { count: swaps.length });
  }

  // A scanned product joins the trip in one tap. The verdict tier rides along, so the
  // cart keeps showing what she made of it — the coaching stays attached to the item.
  function handleAddScanToCart() {
    if (!scan?.verdict) return;
    cart.addScan({
      name: scan.product?.name || 'Scanned item',
      tier: scan.verdict.tier,
      barcode: scan.product?.barcode || null,
    });
  }

  // "Share haul" → the branded shareable card (canvas → web share sheet).
  function handleShareHaul() {
    setShareHaul(true);
  }

  /* ───────── Chat as connective tissue (Step 9) ─────────
     No blank box: every thread opens SEEDED from a concrete artifact. The opener
     is an AI message that grounds the thread (and rides in conversationHistory, so
     her reply stays on-topic). Memory / rate limiting / errors are unchanged — this
     still goes through /api/chat and sendChat. */
  const TIER_ASK = {
    approved: 'a clean approve',
    approved_with_note: 'approved, with a note',
    use_with_intention: 'a use-with-intention',
    swap_recommended: 'a swap',
    skip: 'a skip',
  };

  function openChat({ opener }) {
    setMoment('chat');
    if (opener) setMessages((prev) => [...prev, { id: rid(), role: 'ai', content: opener, macros: null }]);
  }
  function askAboutScan() {
    const name = scan?.product?.name || 'that product';
    const t = TIER_ASK[scan?.verdict?.tier] || 'my read';
    openChat({ opener: `That ${name} came back as ${t}. Want to dig into it, log it, or find a better pick?` });
  }
  function askAboutHaul() {
    const d = haul?.distribution || {};
    openChat({ opener: `Your haul this week: ${d.approved || 0} approved, ${d.note || 0} with a note, ${d.swap || 0} to swap. What do you want to work on?` });
  }
  function askAboutList() {
    const g = goalNoteLabel(goalsOf(profile)) || 'your goal';
    openChat({ opener: `Your cart is built for ${g}. Want to tweak it, add something, or talk through a swap?` });
  }

  // "Build me a cart for…" is a TAP that hands off to the docked composer — the one
  // job that genuinely needs a sentence, seeded so the shopper only finishes it.
  /* ───────── Day navigation ───────── */
  async function backToToday() {
    setViewingDate(today);
    const dayMsgs = await loadDayMessages(userId, today);
    setMessages(dayMsgs.map(toUiMsg));
  }

  /* ───────── Ingredient detail routing (/app/ingredient/:id) ───────── */
  function openIngredient(id) {
    if (!id) return;
    setIngredientId(id);
    try {
      window.history.pushState({ kristyIng: id }, '', ingredientPath(id));
    } catch {
      /* ignore */
    }
  }
  function closeIngredient() {
    // Pop our own pushed entry when we have one (keeps the Back button in sync);
    // otherwise (a cold deep-link) clear it and normalize the URL back to /app.
    if (window.history.state && window.history.state.kristyIng) {
      window.history.back();
    } else {
      try {
        window.history.replaceState({}, '', '/app');
      } catch {
        /* ignore */
      }
      setIngredientId(null);
    }
  }
  useEffect(() => {
    const onPop = () => setIngredientId(ingredientIdFromPath());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  /* ───────── Render ───────── */
  // A full-screen ingredient page takes over the app (deep-linkable + guest-readable),
  // above the splash / guest gate so a shared /app/ingredient/:id link always resolves.
  if (ingredientId) {
    return <IngredientPage id={ingredientId} onClose={closeIngredient} />;
  }

  if (!ready) {
    return (
      <div className="app">
        <div className="empty">
          {/* App-open moment → the large-format marketing mark (dark ground only).
              The favicon runs the same silhouette, simplified for tab sizes. */}
          <img
            src="/kristy-logo.png"
            alt="Kristy"
            style={{ height: 190, width: 'auto', maxWidth: '58%', display: 'block' }}
          />
        </div>
      </div>
    );
  }

  // Not signed in. The front door is onboarding, not a sign-in wall and not a blank
  // app: a stranger sets the lens, then lands on the cart and says what the trip is
  // for. No account is required to reach any of it.
  if (!IS_DEMO && !session) {
    if (!guestSetup) {
      return (
        <CoachOnboarding
          initialGoal={onbInitialGoal}
          ctaLabel="Start shopping"
          onComplete={handleGuestOnboardingComplete}
          onSkip={handleGuestOnboardingSkip}
        />
      );
    }
    // Ingredient pages are a free KB read (no model call), so guests get the same
    // tap-through off their scan card that signed-in users get.
    return (
      <GuestApp
        onOpenIngredient={openIngredient}
        onEditPrefs={() => setGuestSetup(false)}
      />
    );
  }

  // First run: a signed-in, goal-less user who hasn't skipped is asked who Kristy is
  // shopping for. Completing it sets the goal (saveCoachProfile) but does NOT grant a
  // trial — the user gets their free tastes first and starts the trial explicitly at
  // the gate. Skipping leaves them goal-less on universal verdicts until they set a
  // goal (here or via the header chip). This is the grocery front door — reachable
  // without ever touching Settings or the TDEE macro setup.
  if (session?.user && goalsOf(profile).length === 0 && !coachOnbSkipped) {
    return (
      <CoachOnboarding
        initialGoal={onbInitialGoal}
        onComplete={handleCoachOnboardingComplete}
        onSkip={handleCoachOnboardingSkip}
      />
    );
  }

  const viewingPast = viewingDate !== today;
  const showEmpty = messages.length === 0 && !typing && !viewingPast;

  // Trial-eligible ⇔ the user has never had any subscription row. status 'none' means
  // no trial and no paid history, so the trial offer is honest; a lapsed/consumed
  // trial (status 'trialing' but not premium) or any paid record is NOT eligible, and
  // the server grant is idempotent anyway. null during the load window → not eligible
  // (the safe default: never dangle a trial CTA before we know the user's state).
  const trialEligible = subscription?.status === 'none';

  return (
    <div className="app">
      <TopBar
        onMenu={() => setSidebarOpen(true)}
        goalLabel={goalChipLabel(profile)}
        onGoalClick={() => setSwitcherOpen(true)}
        showPremium={subscription?.premium === false}
        onPremium={openUpgrade}
        onAsk={moment === 'chat' ? null : () => setMoment('chat')}
      />

      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpenSettings={() => {
          setSidebarOpen(false);
          setSettingsOpen(true);
        }}
        premium={subscription?.premium ?? false}
        onUpgrade={openUpgrade}
      />

      {/* Chat — the deep-input surface, not the home. Reached from the composer or
          her own affordance, always grounded in a scan / haul / cart. */}
      {moment === 'chat' && (
        <div className="chat" ref={chatRef}>
          {viewingPast && (
            <div className="readonly-bar">
              <span>🔒 Viewing {dateLabel(viewingDate)} — read-only</span>
              <button onClick={backToToday}>Back to today</button>
            </div>
          )}

          {showEmpty ? (
            <ChatLauncher
              entries={[
                ...(scan?.verdict ? [{ id: 'scan', label: `Ask about ${scan.product?.name || 'your last scan'}`, sub: 'your last scan', onClick: askAboutScan }] : []),
                ...(haul?.week?.length ? [{ id: 'haul', label: 'Ask about your haul', sub: `${haul.week.length} scanned this week`, onClick: askAboutHaul }] : []),
                ...(goalsOf(profile).length ? [{ id: 'list', label: 'Ask about your cart', sub: 'your shopping cart', onClick: askAboutList }] : []),
              ]}
              onScan={() => setCameraOpen(true)}
            />
          ) : (
            messages.map((m) => (
              <MessageBubble
                key={m.id}
                message={m}
                onUpgrade={openUpgrade}
                onRemovePref={handleRemoveChatPref}
                onEditPrefs={() => setSwitcherOpen(true)}
                onAddToCart={cart.add}
              />
            ))
          )}

          {typing && <TypingIndicator />}
        </div>
      )}

      {moment !== 'chat' && (
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          {/* The cart is the home surface: the trip taking shape, acted on by touch. */}
          {moment === 'list' && (
            <CartMoment
              cart={cart}
              goals={goalsOf(profile)}
              goal={goalNoteLabel(goalsOf(profile))}
              nonNegotiables={profile?.non_negotiables || []}
              focuses={profile?.focuses || []}
              constraints={resolveConstraints(profile)}
              onSetGoal={() => setSwitcherOpen(true)}
              onUpgrade={openUpgrade}
              onScan={() => setCameraOpen(true)}
              onSaveList={subscription?.premium ? null : (n) => askToUpgrade('list', n)}
              onAskAisle={() => setMoment('aisle')}
              onImport={() => setImportOpen(true)}
              onHaul={() => setMoment('haul')}
            />
          )}
          {moment === 'scan' && (
            <ScanHome
              onScanBarcode={() => setCameraOpen(true)}
              onLabelFile={handleVerdictFile}
              onOpenChat={() => setMoment('chat')}
              onAskAisle={() => setMoment('aisle')}
            />
          )}
          {/* The unlabeled half, as a destination. Free to browse, no account. */}
          {moment === 'aisle' && (
            <AisleMoment
              onUpgradeSheet={() => askToUpgrade('read')}
              onAddToCart={cart.add}
              prefs={{
                goal: goalNoteLabel(goalsOf(profile)),
                focuses: profile?.focuses || [],
                hardLines: profile?.non_negotiables || [],
                constraints: resolveConstraints(profile),
              }}
              onUpgrade={openUpgrade}
              onScan={() => setMoment('scan')}
            />
          )}
          {moment === 'haul' && (
            <HaulMoment
              haul={haul}
              loading={haulLoading}
              cartProgress={cart.progress}
              onScan={() => setCameraOpen(true)}
              onOpenCart={() => setMoment('list')}
              onAddToList={handleAddToList}
              onShareHaul={handleShareHaul}
              onAsk={askAboutHaul}
              onUpgrade={openUpgrade}
              onStartNextCart={handleStartNextCart}
            />
          )}
        </div>
      )}

      {/* The composer is DOCKED on every surface and is a tool, not the centerpiece:
          one slim bar beneath the cart for the messy input taps can’t express — a whole
          week of dinners, a standing preference, a question about one specific fish.
          Every normal cart action above is reachable without it. */}
      {!viewingPast && (
        <InputBar
          value={input}
          onChange={setInput}
          onSend={() => handleSend()}
          disabled={typing}
          onBarcode={() => setCameraOpen(true)}
          onVerdictFile={handleVerdictFile}
          // Kept SHORT on purpose: a placeholder that wraps makes the composer three
          // lines tall, and a composer that tall stops reading as a docked tool and
          // starts competing with the cart for the screen.
          placeholder={moment === 'list' ? 'Ask, or build a whole cart…' : 'Ask anything, or scan it.'}
          focusSignal={composerFocus}
        />
      )}

      <BottomNav
        active={moment}
        cartProgress={cart.progress}
        onList={() => setMoment('list')}
        // Scan lands on the scan surface, NOT the raw camera. The choices there —
        // barcode, label photo, walk up to a counter — are the product; opening the
        // viewfinder first hid two of the three behind an X-out-of-a-modal.
        onScan={() => setMoment('scan')}
        onAisle={() => setMoment('aisle')}
        onHaul={openHaul}
        onChat={() => setMoment('chat')}
      />

      {verdict && (
        <VerdictCard
          loading={verdict.loading}
          verdict={verdict.data}
          error={verdict.error}
          isGuest={false}
          onClose={() => setVerdict(null)}
        />
      )}

      {scan && (
        <ScanSheet
          scan={scan}
          goal={goalReadLabel(goalsOf(profile))}
          onClose={closeScan}
          onLabelFile={handleVerdictFile}
          onPickGoal={handlePickGoal}
          onAddToCart={handleAddScanToCart}
          onOpenCart={() => { closeScan(); setMoment('list'); }}
          onAsk={() => { askAboutScan(); closeScan(); }}
          onUpgrade={() => { closeScan(); openUpgrade(); }}
          onStartTrial={handleStartTrial}
          trialEligible={trialEligible}
          focusOffer={focusOffer}
          onAcceptFocus={acceptFocusOffer}
          onDismissFocus={dismissFocusOffer}
          onOpenIngredient={openIngredient}
        />
      )}

      {shareHaul && <HaulShareCard haul={haul} onClose={() => setShareHaul(false)} />}

      {cameraOpen && (
        <Suspense fallback={null}>
          <CameraModal
            open={cameraOpen}
            onClose={() => setCameraOpen(false)}
            onScan={handleScan}
          />
        </Suspense>
      )}

      {settingsOpen && (
        <Settings
          profile={profile}
          subscription={subscription}
          onUpgrade={openUpgrade}
          onClose={() => setSettingsOpen(false)}
          onEditPreferences={() => { setSettingsOpen(false); setSwitcherOpen(true); }}
          onDelete={handleDeleteAccount}
        />
      )}

      {switcherOpen && (
        <GoalSwitcher
          goals={goalsOf(profile)}
          focuses={profile?.focuses || []}
          nonNegotiables={profile?.non_negotiables || []}
          constraints={profile?.constraints || []}
          onPickGoal={handleSwitcherToggleGoal}
          onToggleFocus={handleToggleFocus}
          onToggleNonNegotiable={handleToggleNonNegotiable}
          onToggleConstraint={handleToggleConstraint}
          onClose={() => setSwitcherOpen(false)}
        />
      )}

      {/* The one-time coach-not-doctor note, fired the first time any focus turns on. */}
      {disclaimerOpen && <FocusDisclaimer onDismiss={dismissDisclaimer} />}

      {importOpen && (
        <ImportList
          onClose={() => setImportOpen(false)}
          onImported={(list, summary) => { cart.applyList(list, summary); setMoment("list"); }}
        />
      )}

      {/* The ask, at its two moments. Rendered above everything so a tap that hits the
          meter never leaves the shopper looking at a dead expander. */}
      {upgradeSheet && (
        <UpgradeSheet
          reason={upgradeSheet.reason}
          itemCount={upgradeSheet.itemCount}
          onClose={() => setUpgradeSheet(null)}
          onPick={() => { setUpgradeSheet(null); openUpgrade(); }}
        />
      )}
      {upgradeOpen && (
        <Upgrade
          subscription={subscription}
          trialEligible={trialEligible}
          onStartTrial={handleStartTrial}
          onClose={() => setUpgradeOpen(false)}
        />
      )}
    </div>
  );
}
