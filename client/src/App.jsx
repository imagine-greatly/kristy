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
} from './lib/data.js';
import {
  goalNoteLabel,
  goalReadLabel,
  goalChipLabel,
  focusDisclaimerAcked,
  ackFocusDisclaimer,
  coachOnboardingSkipped,
  skipCoachOnboarding,
  resolveConstraints,
} from './lib/coachGoals.js';
import { loadGuestState, clearGuestState } from './lib/guestState.js';
import { pushSwaps } from './lib/list.js';
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
import HaulMoment from './components/HaulMoment.jsx';
import ListMoment from './components/ListMoment.jsx';
import PerimeterAsk from './components/PerimeterAsk.jsx';
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
  const [aisleOpen, setAisleOpen] = useState(false); // the Perimeter "ask about the aisle" sheet
  // Grocery-coach entry restructure: the goal is a contextual MODE, not a door gate.
  const [switcherOpen, setSwitcherOpen] = useState(false); // the chip's mode switcher
  const [focusOffer, setFocusOffer] = useState(null); // { category, focus, line } | null
  const [disclaimerOpen, setDisclaimerOpen] = useState(false); // one-time coach-not-doctor
  const [coachOnbSkipped, setCoachOnbSkipped] = useState(false); // first-run coach onboarding dismissed
  const [onbInitialGoal, setOnbInitialGoal] = useState(null); // guest-expressed goal, pre-fills onboarding

  const [messages, setMessages] = useState([]);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState('');
  const [cameraOpen, setCameraOpen] = useState(false);
  // Kristy's Verdict overlay (separate pipeline — never touches meals/thread).
  const [verdict, setVerdict] = useState(null); // null | { loading, data, error }
  // Scan → verdict card (Step 4). A scan is now a verdict, not a silent meal log.
  const [scan, setScan] = useState(null); // null | { loading, mode, found, verdict, product, gate, error, message }
  // Three-moment nav (Step 5): List (before) · Scan (aisle) · Haul (after). Chat is
  // demoted from a primary tab, reachable from within the Scan moment.
  const [moment, setMoment] = useState('scan'); // 'scan' | 'list' | 'haul' | 'chat'
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
        if (guest.scans.length || guest.goal) {
          if (guest.goal && !prof?.coach_goal) setOnbInitialGoal(guest.goal);
          replayGuestScans(guest);
        }
      }
    }
    setReady(true);
  }

  // Replay a converted guest's saved scans into the new account's Haul. Fire-and-
  // forget from handleSession; per-scan failures are non-fatal, and the guest key is
  // cleared afterward so a reload can't double-post the same scans.
  async function replayGuestScans(guest) {
    try {
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
  }

  /* ───────── Grocery-coach goal + focuses (contextual, no door gate) ───────── */

  // Persist a coach_goal. Setting a goal — in the coach onboarding, the chip switcher,
  // or the in-card ask — is where the coaching relationship begins, but it deliberately
  // does NOT grant the trial: the trial is one explicit choice at the gate (handleStartTrial),
  // so goal-set users keep their 3 free personalized tastes and a weekly-cadence trial isn't
  // spent on a casual tap. Optimistic so the chip + next scan reflect the goal immediately.
  async function persistGoal(value) {
    setProfile((p) => ({ ...(p || {}), coach_goal: value }));
    try {
      await saveCoachProfile(userId, {
        coach_goal: value,
        non_negotiables: profile?.non_negotiables || [],
        focuses: profile?.focuses || [],
        constraints: profile?.constraints || [],
      });
    } catch {
      /* keep optimistic value */
    }
  }

  // First-run coach onboarding: a goal was chosen → persist goal + prefs and land on
  // Scan (the profile update unmounts the onboarding). No trial is granted here — the
  // user gets their free tastes first and starts the trial explicitly at the gate.
  // If focuses were chosen, the in-context note stood in for the one-time coach-not-
  // doctor disclaimer, so mark it acknowledged rather than firing the modal later.
  async function handleCoachOnboardingComplete({ coach_goal, non_negotiables, focuses, constraints }) {
    setProfile((p) => ({ ...(p || {}), coach_goal, non_negotiables, focuses, constraints, onboarded: true }));
    if (focuses?.length && !focusDisclaimerAcked()) ackFocusDisclaimer();
    trackEvent('coach_onboarded', {
      goal: coach_goal,
      focuses: (focuses || []).length,
      hardLines: (non_negotiables || []).length,
      constraints: (constraints || []).length,
    });
    try {
      await saveCoachProfile(userId, { coach_goal, non_negotiables, focuses, constraints });
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
    persistGoal(value);
    if (!scan?.ingredients) return; // nothing cached to recompose against
    setScan((s) => (s ? { ...s, pickingGoal: true } : s));
    try {
      const verdict = await requestGoalNote({
        ingredients: scan.ingredients,
        nutrition: scan.nutrition,
        goal: goalNoteLabel(value),
        nonNegotiables: profile?.non_negotiables || [],
        focuses: profile?.focuses || [],
        constraints: resolveConstraints(profile),
      });
      setScan((s) => (s ? { ...s, verdict, pickingGoal: false } : s));
      if (verdict?.tier) trackEvent('verdict', { tier: verdict.tier, gated: !!verdict.gated, goalSet: true });
    } catch {
      setScan((s) => (s ? { ...s, pickingGoal: false } : s));
    }
  }

  // The chip switcher: pick a goal (mode switch) → persist + close. Forward-looking —
  // the next verdict reflects it; the card in view isn't recomposed.
  function handleSwitcherPickGoal(value) {
    persistGoal(value);
    setSwitcherOpen(false);
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

  /* ───────── Contextual focus offer ─────────
     After 2+ scans flag the SAME category in a session, Kristy offers ONCE to watch
     it — never for a focus already on, at most one offer per session, never a modal.
     Categories come from the deterministic nutrition/KB signals on the verdict. */
  const CATEGORY_FOCUS = { sodium: 'lower_sodium', sugar: 'lower_sugar', blood_sugar: 'blood_sugar', heart: 'heart' };
  const OFFER_LINE = {
    sodium: "You've passed on two high-sodium picks — want me to watch sodium for you?",
    sugar: "That's twice now on the high-sugar stuff — want me to keep an eye on added sugar?",
    blood_sugar: 'Couple of blood-sugar spikers back to back — want me to flag those as we shop?',
    heart: "Two with the oils I hold a line on — want me to watch that for you?",
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
  function applyScanResult(result, mode) {
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
    if (!sub?.premium) return sub; // grant didn't land (pre-migration / already used)
    trackEvent('trial_started');
    if (scan?.verdict?.gated && scan?.ingredients) {
      setScan((s) => (s ? { ...s, pickingGoal: true } : s));
      try {
        const verdict = await requestGoalNote({
          ingredients: scan.ingredients,
          nutrition: scan.nutrition,
          goal: goalNoteLabel(profile?.coach_goal),
          nonNegotiables: profile?.non_negotiables || [],
          focuses: profile?.focuses || [],
          constraints: resolveConstraints(profile),
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

      const aiMsg = {
        id: rid(),
        role: 'ai',
        content: result.message,
        macros: null,
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
            "I had trouble responding just now — give it another try in a sec.",
          macros: null,
        },
      ]);
    } finally {
      setTyping(false);
    }
  }

  /* ───────── Barcode + label scanning ───────── */

  // A scanned barcode is a VERDICT, not a meal log: extract → /verdict → the card.
  async function handleScan(barcode) {
    setCameraOpen(false);
    setFocusOffer(null);
    setScan({ loading: true, mode: 'barcode' });
    trackEvent('scan', { mode: 'barcode' });
    try {
      const result = await runProductScan({
        mode: 'barcode',
        barcode,
        goal: goalNoteLabel(profile?.coach_goal),
        nonNegotiables: profile?.non_negotiables || [],
        focuses: profile?.focuses || [],
        constraints: resolveConstraints(profile),
        // No stored goal → universal layer + the in-card goal ask (no note, no taste).
        personalize: !!profile?.coach_goal,
      });
      applyScanResult(result, 'barcode');
    } catch {
      setScan({ mode: 'barcode', error: true, message: "That scan didn't go through — give it another try in a sec." });
    }
  }

  /* ───────── Photo-of-label scan (Step 4) ─────────
     Vision reads the label → ingredients → /verdict → the Step-3 card. Deliberately
     separate from meal logging — it never appends to the thread and never creates a meal. */
  async function handleVerdictFile(file) {
    if (!file) return;
    setFocusOffer(null);
    setScan({ loading: true, mode: 'label' });
    trackEvent('scan', { mode: 'label' });
    try {
      const result = await runProductScan({
        mode: 'label',
        file,
        goal: goalNoteLabel(profile?.coach_goal),
        nonNegotiables: profile?.non_negotiables || [],
        focuses: profile?.focuses || [],
        constraints: resolveConstraints(profile),
        personalize: !!profile?.coach_goal,
      });
      applyScanResult(result, 'label');
    } catch {
      setScan({ mode: 'label', error: true, message: "Couldn't read that one clearly — try another shot, better lit if you can." });
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

  // "Add to next list" → queue the swap-tier items for the List builder (Step 8).
  // Server-side in real mode (cross-device), and they surface on an already-saved
  // list on its next open — no rebuild needed. Fire-and-forget.
  function handleAddToList() {
    const swaps = (haul?.week || [])
      .filter((s) => s.tier === 'swap_recommended' || s.tier === 'skip')
      .map((s) => ({ product_name: s.product_name, tier: s.tier }));
    pushSwaps(swaps);
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
    swap_recommended: "one I'd swap",
    skip: "one I'd skip",
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
    const g = goalNoteLabel(profile?.coach_goal) || 'your goal';
    openChat({ opener: `Your list is built for ${g}. Want to tweak it, add something, or talk through a swap?` });
  }

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

  // Not signed in → drop straight into the stateless guest chat (no auth wall).
  // Signing in from there swaps this out for the real, persisted app below.
  if (!IS_DEMO && !session) {
    // Ingredient pages are a free KB read (no model call), so guests get the same
    // tap-through off their scan card that signed-in users get.
    return <GuestApp onOpenIngredient={openIngredient} />;
  }

  // First run: a signed-in, goal-less user who hasn't skipped is asked who Kristy is
  // shopping for. Completing it sets the goal (saveCoachProfile) but does NOT grant a
  // trial — the user gets their free tastes first and starts the trial explicitly at
  // the gate. Skipping leaves them goal-less on universal verdicts until they set a
  // goal (here or via the header chip). This is the grocery front door — reachable
  // without ever touching Settings or the TDEE macro setup.
  if (session?.user && !profile?.coach_goal && !coachOnbSkipped) {
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
        goalLabel={goalChipLabel(profile?.coach_goal)}
        onGoalClick={() => setSwitcherOpen(true)}
        showPremium={subscription?.premium === false}
        onPremium={openUpgrade}
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

      {/* Chat — demoted from a primary tab to connective tissue, reached from the
          Scan moment. Coaching only, grounded in a scan / haul / list. */}
      {moment === 'chat' && (
        <>
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
                  ...(profile?.coach_goal ? [{ id: 'list', label: 'Ask about your list', sub: 'your shopping list', onClick: askAboutList }] : []),
                ]}
                onScan={() => { setMoment('scan'); setCameraOpen(true); }}
              />
            ) : (
              messages.map((m) => (
                <MessageBubble key={m.id} message={m} onUpgrade={openUpgrade} />
              ))
            )}

            {typing && <TypingIndicator />}
          </div>

          {!viewingPast && (
            <InputBar
              value={input}
              onChange={setInput}
              onSend={() => handleSend()}
              disabled={typing}
              onBarcode={() => setCameraOpen(true)}
              onVerdictFile={handleVerdictFile}
            />
          )}
        </>
      )}

      {moment !== 'chat' && (
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          {moment === 'scan' && (
            <ScanHome
              onScanBarcode={() => setCameraOpen(true)}
              onLabelFile={handleVerdictFile}
              onOpenChat={() => setMoment('chat')}
              onAskAisle={() => setAisleOpen(true)}
            />
          )}
          {moment === 'list' && (
            <ListMoment
              goal={profile?.coach_goal}
              nonNegotiables={profile?.non_negotiables || []}
              focuses={profile?.focuses || []}
              constraints={resolveConstraints(profile)}
              onSetGoal={() => setSwitcherOpen(true)}
              onAsk={askAboutList}
              premium={subscription?.premium ?? false}
              onUpgrade={openUpgrade}
            />
          )}
          {moment === 'haul' && (
            <HaulMoment
              haul={haul}
              loading={haulLoading}
              onScan={() => { setMoment('scan'); setCameraOpen(true); }}
              onAddToList={handleAddToList}
              onShareHaul={handleShareHaul}
              onAsk={askAboutHaul}
              onUpgrade={openUpgrade}
            />
          )}
        </div>
      )}

      <BottomNav
        active={moment}
        onList={() => setMoment('list')}
        onScan={() => { setMoment('scan'); setCameraOpen(true); }}
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
          goal={goalReadLabel(profile?.coach_goal)}
          onClose={() => setScan(null)}
          onLabelFile={handleVerdictFile}
          onPickGoal={handlePickGoal}
          onAsk={() => { askAboutScan(); setScan(null); }}
          onUpgrade={() => { setScan(null); openUpgrade(); }}
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
          goal={profile?.coach_goal || null}
          focuses={profile?.focuses || []}
          nonNegotiables={profile?.non_negotiables || []}
          constraints={profile?.constraints || []}
          onPickGoal={handleSwitcherPickGoal}
          onToggleFocus={handleToggleFocus}
          onToggleNonNegotiable={handleToggleNonNegotiable}
          onToggleConstraint={handleToggleConstraint}
          onClose={() => setSwitcherOpen(false)}
        />
      )}

      {/* The one-time coach-not-doctor note, fired the first time any focus turns on. */}
      {disclaimerOpen && <FocusDisclaimer onDismiss={dismissDisclaimer} />}

      {aisleOpen && (
        <PerimeterAsk
          prefs={{
            goal: goalNoteLabel(profile?.coach_goal),
            focuses: profile?.focuses || [],
            hardLines: profile?.non_negotiables || [],
            constraints: resolveConstraints(profile),
          }}
          onUpgrade={() => { setAisleOpen(false); openUpgrade(); }}
          onClose={() => setAisleOpen(false)}
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
