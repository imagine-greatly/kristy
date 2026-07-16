import { useEffect, useMemo, useRef, useState, lazy, Suspense } from 'react';
import { IS_DEMO } from './lib/config.js';
import { supabase } from './lib/supabase.js';
import { dayKey, dateLabel } from './lib/format.js';
import {
  loadGoals,
  saveGoals,
  saveProfileFields,
  saveCoachProfile,
  loadRecentMeals,
  loadDayMessages,
  loadLatestSummary,
  loadProfile,
  loadWeightHistory,
  saveHaulScan,
  loadHaul,
} from './lib/data.js';
import { goalNoteLabel, goalChipLabel } from './lib/coachGoals.js';
import { sendChat, deleteAccount, getSubscription } from './lib/api.js';
import { sendPhoto, runProductScan } from './lib/logging.js';
import {
  getLastActiveDate,
  setLastActiveDate,
  recapMessage,
  yesterdayKey,
} from './lib/dayBoundary.js';

import TopBar from './components/TopBar.jsx';
// Lazy-loaded: pulls in the heavy @zxing barcode decoder only when the scanner opens.
const CameraModal = lazy(() => import('./components/CameraModal.jsx'));
import Sidebar from './components/Sidebar.jsx';
import MessageBubble from './components/MessageBubble.jsx';
import TypingIndicator from './components/TypingIndicator.jsx';
import InputBar from './components/InputBar.jsx';
import GuestApp from './components/GuestApp.jsx';
import Onboarding from './components/Onboarding.jsx';
import GroceryOnboarding from './components/GroceryOnboarding.jsx';
import Settings from './components/Settings.jsx';
import Upgrade from './components/Upgrade.jsx';
import VerdictCard from './components/VerdictCard.jsx';
import ScanSheet from './components/ScanSheet.jsx';
import BottomNav from './components/BottomNav.jsx';
import ScanHome from './components/ScanHome.jsx';
import HaulMoment from './components/HaulMoment.jsx';
import ListMoment from './components/ListMoment.jsx';
import ChatLauncher from './components/ChatLauncher.jsx';
import HaulShareCard from './components/HaulShareCard.jsx';

const ZERO = { calories: 0, protein: 0, carbs: 0, fat: 0 };
const rid = () =>
  (crypto.randomUUID && crypto.randomUUID()) || `id-${Date.now()}-${Math.random()}`;

const toUiMsg = (m) => ({
  id: m.id,
  role: m.role,
  content: m.content,
  macros: m.macros || null,
  isSummary: !!m.isSummary,
});

// Convert a weight to a target unit ('lbs' | 'kg').
function toUnit(value, fromUnit, unit) {
  const v = Number(value) || 0;
  if ((fromUnit || 'lbs') === unit) return v;
  return unit === 'lbs' ? v * 2.20462 : v * 0.453592;
}

// Latest weigh-in + 7-day change, expressed in the latest entry's unit.
// Returns null when there's nothing logged yet.
function weightSummary(history, goalType) {
  if (!history || history.length === 0) return null;
  const sorted = [...history].sort(
    (a, b) => new Date(a.logged_at) - new Date(b.logged_at)
  );
  const latest = sorted[sorted.length - 1];
  const unit = latest.weight_unit || 'lbs';
  const current = Number(latest.weight_value);

  // Earliest entry within the last 7 days is the baseline for the weekly change.
  const weekAgo = Date.now() - 7 * 86400000;
  const within = sorted.filter((e) => new Date(e.logged_at).getTime() >= weekAgo);
  const base = within.length ? within[0] : sorted[0];
  const weekChange =
    Math.round((current - toUnit(base.weight_value, base.weight_unit, unit)) * 10) / 10;

  return { current, unit, weekChange, goalType };
}

// Roll meal_logs up into per-day totals.
function aggregate(meals) {
  const map = new Map();
  for (const m of meals) {
    const k = dayKey(m.logged_at);
    const cur = map.get(k) || { date: k, ...ZERO };
    cur.calories += m.calories || 0;
    cur.protein += m.protein || 0;
    cur.carbs += m.carbs || 0;
    cur.fat += m.fat || 0;
    map.set(k, cur);
  }
  return map;
}

export default function App() {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState(null);
  const [userId, setUserId] = useState(null);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [profile, setProfile] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const [goals, setGoals] = useState({ ...ZERO, calories: 2500, protein: 180, carbs: 200, fat: 80 });
  const [meals, setMeals] = useState([]);
  const [messages, setMessages] = useState([]);
  const [weightHistory, setWeightHistory] = useState([]);
  const [goalType, setGoalType] = useState(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState('');
  // Barcode + photo logging UI state.
  const [cameraOpen, setCameraOpen] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
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
  const [viewingDate, setViewingDate] = useState(dayKey());
  // The local day the live thread belongs to — used to detect a midnight rollover.
  const [liveDay, setLiveDay] = useState(dayKey());

  const chatRef = useRef(null);
  const today = dayKey();

  /* ───────── Auth + initial load ───────── */
  useEffect(() => {
    if (IS_DEMO) {
      const demo = { user: { id: 'demo-user' } };
      setSession(demo);
      setUserId('demo-user');
      loadProfile('demo-user').then((prof) => {
        setProfile(prof);
        setGoalType(prof?.goal || null);
        if (!prof || !prof.onboarded) {
          setNeedsOnboarding(true);
          setReady(true);
        } else {
          bootstrap('demo-user').then(() => setReady(true));
        }
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
      setGoalType(prof?.goal || null);
      if (!prof || !prof.onboarded) {
        setNeedsOnboarding(true);
        setReady(true);
        return;
      }
      await bootstrap(s.user.id);
    }
    setReady(true);
  }

  // Called when onboarding finishes — pull fresh (now computed) goals + data.
  // Onboarding hands back { goals, profile }; keep the profile so Settings and
  // the weight-trend coloring reflect the just-entered answers immediately.
  async function handleOnboarded(result) {
    setNeedsOnboarding(false);
    if (result?.profile) {
      setProfile(result.profile);
      setGoalType(result.profile.goal || null);
    }
    setReady(false);
    await bootstrap(userId);
    setReady(true);
  }

  // Grocery-coach onboarding complete (Step 6): persist goal + non-negotiables,
  // reflect the chip immediately, then land on Scan — optionally opening the
  // camera for the first-scan payoff.
  async function handleCoachOnboarded(patch, { startScan } = {}) {
    setNeedsOnboarding(false);
    try {
      const updated = await saveCoachProfile(userId, patch);
      setProfile((p) => ({ ...(p || {}), ...(updated || patch), onboarded: true }));
    } catch {
      // Persistence failed — keep the optimistic goal so the session still works.
      setProfile((p) => ({ ...(p || {}), ...patch, onboarded: true }));
    }
    setReady(false);
    await bootstrap(userId);
    setReady(true);
    setMoment('scan');
    if (startScan) setCameraOpen(true);
  }

  // Skip → no goal yet (universal, goal-agnostic verdicts) but still onboarded so
  // we don't re-prompt. Drops the user straight into scanning.
  function handleCoachSkip() {
    handleCoachOnboarded({ coach_goal: null, non_negotiables: [] }, { startScan: false });
  }

  // Settings → persist one or more profile fields. Throws on failure so the
  // Settings screen can revert its optimistic selection.
  async function handleSaveProfile(patch) {
    const updated = await saveProfileFields(userId, patch);
    setProfile((p) => ({ ...(p || {}), ...patch }));
    if ('goal' in patch) setGoalType(patch.goal || null);
    return updated;
  }

  // Settings → delete account. Real mode signs the user out (onAuthStateChange
  // drops them to the guest view); demo mode has no auth event, so reload.
  async function handleDeleteAccount() {
    await deleteAccount();
    if (IS_DEMO) window.location.reload();
  }

  async function bootstrap(uid) {
    const now = new Date();
    const todayKey = dayKey(now);

    const [g, m, dayMsgs, summary, weights, sub] = await Promise.all([
      loadGoals(uid),
      loadRecentMeals(uid, 7),
      loadDayMessages(uid, todayKey),
      loadLatestSummary(uid),
      loadWeightHistory(uid, 90),
      getSubscription(),
    ]);
    setGoals(g);
    setMeals(m);
    setWeightHistory(weights);
    setSubscription(sub);
    setViewingDate(todayKey);
    setLiveDay(todayKey);

    // Day-boundary detection.
    const stored = getLastActiveDate();
    const isNewDay = stored && stored !== todayKey;
    const dayTotals = aggregate(m);
    const hasHistory = [...dayTotals.keys()].some((k) => k < todayKey);

    const msgs = dayMsgs.map(toUiMsg);

    // New day with prior history → inject the "clean slate" recap at the top.
    if (isNewDay && hasHistory) {
      const prev = dayTotals.get(yesterdayKey(now)) || { calories: 0, protein: 0 };
      msgs.unshift(recapMessage(prev, now));
    }

    // Weekly summary sits above the recap on app open.
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
    setLastActiveDate(todayKey); // always advance on load
  }

  // Open the upgrade view (from a locked feature, the sidebar, or settings).
  function openUpgrade() {
    setSidebarOpen(false);
    setUpgradeOpen(true);
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

  /* ───────── Derived ───────── */
  const dayMap = useMemo(() => aggregate(meals), [meals]);
  const todayTotals = dayMap.get(today) || { ...ZERO };

  // Latest weight + 7-day change for the sidebar, in the latest entry's unit.
  const weight = useMemo(
    () => weightSummary(weightHistory, goalType),
    [weightHistory, goalType]
  );
  const historyDays = useMemo(
    () =>
      [...dayMap.values()]
        .filter((d) => d.date !== today)
        .sort((a, b) => b.date.localeCompare(a.date)),
    [dayMap, today]
  );

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
    const now = new Date();
    const cur = dayKey(now);
    let baseMessages;

    if (cur !== liveDay) {
      // Midnight crossed while the app stayed open → inline day-boundary flow:
      // reset the thread, inject the recap, continue in the new day.
      const dayTotals = aggregate(meals);
      const hasHistory = [...dayTotals.keys()].some((k) => k < cur);
      const prev = dayTotals.get(yesterdayKey(now)) || { calories: 0, protein: 0 };
      baseMessages = hasHistory ? [recapMessage(prev, now)] : [];
      setMessages(baseMessages);
      setViewingDate(cur);
      setLiveDay(cur);
      setLastActiveDate(cur);
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
      const result = await sendChat({
        message: content,
        history,
        ctx: { today: todayTotals, goals },
      });

      const aiMsg = {
        id: rid(),
        role: 'ai',
        content: result.message,
        macros: result.hasFood
          ? { ...result.macros, foods: result.foods, insight: result.insight }
          : null,
        // A locked-feature reply (free-user weigh-in / history recall) → show
        // the quiet "Unlock coaching" affordance under the bubble.
        upgrade: !!result.upgrade,
      };
      setMessages((prev) => [...prev, aiMsg]);

      if (result.hasFood) {
        const fresh = await loadRecentMeals(userId, 7);
        setMeals(fresh);
      }

      // A weigh-in updates the sidebar trend and may have retuned the target.
      if (result.weightLogged) {
        const [w, g] = await Promise.all([
          loadWeightHistory(userId, 90),
          loadGoals(userId),
        ]);
        setWeightHistory(w);
        if (g) setGoals(g);
      }
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

  /* ───────── Barcode + photo logging ───────── */

  // Append an AI result (barcode/photo) the same way a chat reply lands,
  // and optimistically update today's rings. Mirrors handleSend's tail without touching it.
  function pushAiResult(result, { image } = {}) {
    const aiMsg = {
      id: rid(),
      role: 'ai',
      content: result.message,
      macros: result.hasFood
        ? {
            ...result.macros,
            foods: result.foods,
            insight: result.insight || '',
            isEstimate: !!result.isEstimate,
            estimateNote: result.estimateNote || '',
          }
        : null,
      image: image || null,
    };
    setMessages((prev) => [...prev, aiMsg]);

    if (result.hasFood && result.macros) {
      const m = result.macros;
      const meal = {
        id: rid(),
        logged_at: new Date().toISOString(),
        foods: result.foods || [],
        calories: m.calories,
        protein: m.protein,
        carbs: m.carbs,
        fat: m.fat,
      };
      setMeals((prev) => [...prev, meal]); // optimistic → rings update immediately
      if (!IS_DEMO) loadRecentMeals(userId, 7).then(setMeals).catch(() => {});
    }
  }

  async function runLogging(fn, { userText, image, fallback } = {}) {
    if (userText) {
      setMessages((prev) => [
        ...prev,
        { id: rid(), role: 'user', content: userText, macros: null },
      ]);
    }
    setTyping(true);
    try {
      const result = await fn();
      pushAiResult(result, { image });
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { id: rid(), role: 'ai', content: fallback || err.message, macros: null },
      ]);
    } finally {
      setTyping(false);
    }
  }

  // A scanned barcode is now a VERDICT, not a silent meal log: extract → /verdict →
  // Step-3 card. Macro logging stays reachable via the meal-photo path (handleSendPhoto).
  async function handleScan(barcode) {
    setCameraOpen(false);
    setScan({ loading: true, mode: 'barcode' });
    try {
      const result = await runProductScan({
        mode: 'barcode',
        barcode,
        goal: goalNoteLabel(profile?.coach_goal),
        nonNegotiables: profile?.non_negotiables || [],
        focuses: profile?.focuses || [],
      });
      setScan({ ...result, mode: 'barcode' });
      recordScan(result);
    } catch {
      setScan({ mode: 'barcode', error: true, message: "That scan didn't go through — give it another try in a sec." });
    }
  }

  function handlePhotoFile(file) {
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result);
    reader.readAsDataURL(file);
  }

  function clearPhoto() {
    setPhotoFile(null);
    setPhotoPreview(null);
  }

  async function handleSendPhoto(text) {
    if (!photoFile) return;
    const file = photoFile;
    const image = photoPreview;
    const userText = (text || '').trim();
    setInput('');
    clearPhoto();
    await runLogging(() => sendPhoto({ file, message: userText }), {
      userText: userText || undefined,
      image,
      fallback: "Couldn't read that photo clearly — try again or type it out",
    });
  }

  /* ───────── Photo-of-label scan (Step 4) ─────────
     Vision reads the label → ingredients → /verdict → the Step-3 card. Deliberately
     separate from meal logging — it never appends to the thread and never creates a meal. */
  async function handleVerdictFile(file) {
    if (!file) return;
    setScan({ loading: true, mode: 'label' });
    try {
      const result = await runProductScan({
        mode: 'label',
        file,
        goal: goalNoteLabel(profile?.coach_goal),
        nonNegotiables: profile?.non_negotiables || [],
        focuses: profile?.focuses || [],
      });
      setScan({ ...result, mode: 'label' });
      recordScan(result);
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

  // "Add to next list" → feed the swap-tier items into the List builder (Step 8).
  function handleAddToList() {
    const swaps = (haul?.week || []).filter((s) => s.tier === 'swap_recommended' || s.tier === 'skip');
    try {
      const key = 'kristy:nextList';
      const cur = JSON.parse(localStorage.getItem(key) || '[]');
      const merged = [...cur, ...swaps.map((s) => ({ product_name: s.product_name, tier: s.tier }))];
      localStorage.setItem(key, JSON.stringify(merged));
    } catch {
      /* ignore */
    }
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

  /* ───────── Goals ───────── */
  async function handleSaveGoal(key, value) {
    const next = { ...goals, [key]: value };
    setGoals(next);
    try {
      await saveGoals(userId, next);
    } catch {
      /* keep optimistic value */
    }
  }

  /* ───────── History navigation ───────── */
  async function handleSelectDay(date) {
    setSidebarOpen(false);
    setViewingDate(date);
    const dayMsgs = await loadDayMessages(userId, date);
    setMessages(dayMsgs.map(toUiMsg));
  }

  async function backToToday() {
    setViewingDate(today);
    const dayMsgs = await loadDayMessages(userId, today);
    setMessages(dayMsgs.map(toUiMsg));
  }

  /* ───────── Render ───────── */
  if (!ready) {
    return (
      <div className="app">
        <div className="empty">
          <div className="empty__leaf">🌿</div>
        </div>
      </div>
    );
  }

  // Not signed in → drop straight into the stateless guest chat (no auth wall).
  // Signing in from there swaps this out for the real, persisted app below.
  if (!IS_DEMO && !session) {
    return <GuestApp />;
  }

  if (needsOnboarding) {
    // The repositioned front door: a 60-second goal + non-negotiables setup.
    // (The full TDEE intake in Onboarding.jsx is preserved for macro setup.)
    return <GroceryOnboarding onComplete={handleCoachOnboarded} onSkip={handleCoachSkip} />;
  }

  const viewingPast = viewingDate !== today;
  const showEmpty = messages.length === 0 && !typing && !viewingPast;

  return (
    <div className="app">
      <TopBar
        onMenu={() => setSidebarOpen(true)}
        todayCalories={todayTotals.calories}
        goalLabel={goalChipLabel(profile?.coach_goal)}
        onGoalClick={() => setSettingsOpen(true)}
      />

      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpenSettings={() => {
          setSidebarOpen(false);
          setSettingsOpen(true);
        }}
        today={todayTotals}
        todayKey={today}
        goals={goals}
        weight={weight}
        weightHistory={weightHistory}
        onSaveGoal={handleSaveGoal}
        historyDays={historyDays}
        activeDay={viewingDate}
        onSelectDay={handleSelectDay}
        premium={subscription?.premium ?? true}
        onUpgrade={openUpgrade}
      />

      {/* Chat — demoted from a primary tab to connective tissue, reached from the
          Scan moment. Keeps meal logging + coaching exactly as before. */}
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
              onPhotoFile={handlePhotoFile}
              photoPreview={photoPreview}
              onClearPhoto={clearPhoto}
              onSendPhoto={handleSendPhoto}
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
            />
          )}
          {moment === 'list' && (
            <ListMoment
              goal={profile?.coach_goal}
              nonNegotiables={profile?.non_negotiables || []}
              onSetGoal={() => setSettingsOpen(true)}
              onAsk={askAboutList}
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
            />
          )}
        </div>
      )}

      <BottomNav
        active={moment}
        onList={() => setMoment('list')}
        onScan={() => { setMoment('scan'); setCameraOpen(true); }}
        onHaul={openHaul}
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
          goal={goalNoteLabel(profile?.coach_goal)}
          onClose={() => setScan(null)}
          onLabelFile={handleVerdictFile}
          onAsk={() => { askAboutScan(); setScan(null); }}
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
          onSave={handleSaveProfile}
          onDelete={handleDeleteAccount}
        />
      )}

      {upgradeOpen && (
        <Upgrade
          subscription={subscription}
          onClose={() => setUpgradeOpen(false)}
        />
      )}
    </div>
  );
}
