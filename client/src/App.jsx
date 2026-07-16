import { useEffect, useMemo, useRef, useState, lazy, Suspense } from 'react';
import { IS_DEMO } from './lib/config.js';
import { supabase } from './lib/supabase.js';
import { dayKey, dateLabel } from './lib/format.js';
import {
  loadGoals,
  saveGoals,
  saveProfileFields,
  loadRecentMeals,
  loadDayMessages,
  loadLatestSummary,
  loadProfile,
  loadWeightHistory,
} from './lib/data.js';
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
import EmptyState from './components/EmptyState.jsx';
import MessageBubble from './components/MessageBubble.jsx';
import TypingIndicator from './components/TypingIndicator.jsx';
import InputBar from './components/InputBar.jsx';
import GuestApp from './components/GuestApp.jsx';
import Onboarding from './components/Onboarding.jsx';
import Settings from './components/Settings.jsx';
import Upgrade from './components/Upgrade.jsx';
import VerdictCard from './components/VerdictCard.jsx';
import ScanSheet from './components/ScanSheet.jsx';
import BottomNav from './components/BottomNav.jsx';
import ScanHome from './components/ScanHome.jsx';
import MomentStub from './components/MomentStub.jsx';
import { ListIcon, HaulIcon } from './components/Icons.jsx';

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
        goal: profile?.goal || '',
        nonNegotiables: profile?.nonNegotiables || [],
      });
      setScan({ ...result, mode: 'barcode' });
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
        goal: profile?.goal || '',
        nonNegotiables: profile?.nonNegotiables || [],
      });
      setScan({ ...result, mode: 'label' });
    } catch {
      setScan({ mode: 'label', error: true, message: "Couldn't read that one clearly — try another shot, better lit if you can." });
    }
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
    return <Onboarding userId={userId} onComplete={handleOnboarded} />;
  }

  const viewingPast = viewingDate !== today;
  const showEmpty = messages.length === 0 && !typing && !viewingPast;

  return (
    <div className="app">
      <TopBar
        onMenu={() => setSidebarOpen(true)}
        todayCalories={todayTotals.calories}
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
              <EmptyState onPick={(ex) => handleSend(ex)} />
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
            <MomentStub
              icon={<ListIcon size={26} />}
              title="Your list"
              line="Before your next trip I'll build a shopping list around your goal. It's coming together — scan a few things and I'll learn what you actually buy."
              ctaLabel="Scan something"
              onCta={() => { setMoment('scan'); setCameraOpen(true); }}
            />
          )}
          {moment === 'haul' && (
            <MomentStub
              icon={<HaulIcon size={26} />}
              title="Your haul"
              line="Everything you scan lands here — your trip and your week at a glance. Scan your first product to start it."
              ctaLabel="Scan a product"
              onCta={() => { setMoment('scan'); setCameraOpen(true); }}
            />
          )}
        </div>
      )}

      <BottomNav
        active={moment}
        onList={() => setMoment('list')}
        onScan={() => { setMoment('scan'); setCameraOpen(true); }}
        onHaul={() => setMoment('haul')}
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
        <ScanSheet scan={scan} goal={profile?.goal || ''} onClose={() => setScan(null)} />
      )}

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
