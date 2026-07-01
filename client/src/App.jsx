import { useEffect, useMemo, useRef, useState, lazy, Suspense } from 'react';
import { IS_DEMO } from './lib/config.js';
import { supabase } from './lib/supabase.js';
import { dayKey, dateLabel } from './lib/format.js';
import {
  loadGoals,
  saveGoals,
  loadRecentMeals,
  loadDayMessages,
  loadLatestSummary,
  loadProfile,
  loadWeightHistory,
} from './lib/data.js';
import { sendChat } from './lib/api.js';
import { sendBarcode, sendPhoto } from './lib/logging.js';
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
  async function handleOnboarded() {
    setNeedsOnboarding(false);
    setReady(false);
    await bootstrap(userId);
    setReady(true);
  }

  async function bootstrap(uid) {
    const now = new Date();
    const todayKey = dayKey(now);

    const [g, m, dayMsgs, summary, weights] = await Promise.all([
      loadGoals(uid),
      loadRecentMeals(uid, 7),
      loadDayMessages(uid, todayKey),
      loadLatestSummary(uid),
      loadWeightHistory(uid, 90),
    ]);
    setGoals(g);
    setMeals(m);
    setWeightHistory(weights);
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

  function handleScan(barcode) {
    setCameraOpen(false);
    runLogging(() => sendBarcode({ barcode }), {
      fallback: "Couldn't find that one — try typing it out instead.",
    });
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
        today={todayTotals}
        todayKey={today}
        goals={goals}
        weight={weight}
        weightHistory={weightHistory}
        onSaveGoal={handleSaveGoal}
        historyDays={historyDays}
        activeDay={viewingDate}
        onSelectDay={handleSelectDay}
      />

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
          messages.map((m) => <MessageBubble key={m.id} message={m} />)
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
        />
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
    </div>
  );
}
