// The app's single source of truth — a faithful port of the web client's
// App.jsx. Owns session, profile, subscription, goals, meals, chat messages,
// weight history, and every handler (send, logging, weight, goals, day-boundary,
// history navigation). Screens consume it via useApp(). Native additions live
// here too: push-token registration + RevenueCat identity on sign-in, and
// haptics on send / macro-card land.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { router } from 'expo-router';
import type { Session } from '@supabase/supabase-js';

import { supabase } from '../lib/supabase';
import { dayKey } from '../lib/format';
import {
  loadProfile,
  loadGoals,
  saveGoals,
  saveProfileFields,
  loadRecentMeals,
  loadDayMessages,
  loadLatestSummary,
  loadWeightHistory,
} from '../lib/data';
import { sendChat, deleteAccount, getSubscription } from '../lib/api';
import { sendBarcode, sendPhoto } from '../lib/logging';
import {
  getLastActiveDate,
  setLastActiveDate,
  recapMessage,
  yesterdayKey,
} from '../lib/dayBoundary';
import { registerPushToken } from '../lib/notifications';
import { configurePurchases, logoutPurchases } from '../lib/purchases';
import { tapSend, macroLanded } from '../lib/haptics';
import type {
  Goals,
  Meal,
  Profile,
  Subscription,
  Totals,
  UiMessage,
  WeightEntry,
  WeightSummary,
  ChatResult,
} from '../lib/types';

const ZERO: Totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
const DEFAULT_GOALS: Goals = { calories: 2500, protein: 180, carbs: 200, fat: 80 };

const rid = () =>
  (global as any).crypto?.randomUUID?.() ?? `id-${Date.now()}-${Math.random()}`;

const toUiMsg = (m: any): UiMessage => ({
  id: m.id,
  role: m.role,
  content: m.content,
  macros: m.macros || null,
  isSummary: !!m.isSummary,
});

// Convert a weight to a target unit ('lbs' | 'kg').
function toUnit(value: unknown, fromUnit: string | undefined, unit: string): number {
  const v = Number(value) || 0;
  if ((fromUnit || 'lbs') === unit) return v;
  return unit === 'lbs' ? v * 2.20462 : v * 0.453592;
}

// Latest weigh-in + 7-day change, expressed in the latest entry's unit.
function weightSummary(history: WeightEntry[], goalType: string | null): WeightSummary | null {
  if (!history || history.length === 0) return null;
  const sorted = [...history].sort(
    (a, b) => new Date(a.logged_at).getTime() - new Date(b.logged_at).getTime()
  );
  const latest = sorted[sorted.length - 1];
  const unit = (latest.weight_unit || 'lbs') as 'lbs' | 'kg';
  const current = Number(latest.weight_value);

  const weekAgo = Date.now() - 7 * 86400000;
  const within = sorted.filter((e) => new Date(e.logged_at).getTime() >= weekAgo);
  const base = within.length ? within[0] : sorted[0];
  const weekChange =
    Math.round((current - toUnit(base.weight_value, base.weight_unit, unit)) * 10) / 10;

  return { current, unit, weekChange, goalType };
}

// Roll meals up into per-day totals.
function aggregate(meals: Meal[]): Map<string, Totals & { date: string }> {
  const map = new Map<string, Totals & { date: string }>();
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

interface AppValue {
  ready: boolean;
  session: Session | null;
  userId: string | null;
  needsOnboarding: boolean;
  profile: Profile | null;
  subscription: Subscription | null;
  goals: Goals;
  meals: Meal[];
  messages: UiMessage[];
  weightHistory: WeightEntry[];
  goalType: string | null;
  typing: boolean;
  viewingDate: string;
  today: string;
  // photo compose state
  photoUri: string | null;
  // derived
  todayTotals: Totals;
  weight: WeightSummary | null;
  historyDays: { date: string; calories: number; protein: number }[];
  // handlers
  handleSend: (text: string) => Promise<void>;
  handleScan: (barcode: string) => void;
  setPhoto: (uri: string | null) => void;
  handleSendPhoto: (text: string) => Promise<void>;
  handleSaveGoal: (key: keyof Goals, value: number) => Promise<void>;
  handleSaveProfile: (patch: Partial<Profile>) => Promise<Profile>;
  handleDeleteAccount: () => Promise<void>;
  handleOnboarded: (result: { goals?: Goals; profile?: Profile }) => Promise<void>;
  handleSelectDay: (date: string) => Promise<void>;
  backToToday: () => Promise<void>;
  refreshSubscription: () => Promise<Subscription>;
  openUpgrade: () => void;
}

const AppContext = createContext<AppValue | null>(null);

export function useApp(): AppValue {
  const v = useContext(AppContext);
  if (!v) throw new Error('useApp must be used within AppProvider');
  return v;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);

  const [goals, setGoals] = useState<Goals>({ ...DEFAULT_GOALS });
  const [meals, setMeals] = useState<Meal[]>([]);
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [weightHistory, setWeightHistory] = useState<WeightEntry[]>([]);
  const [goalType, setGoalType] = useState<string | null>(null);

  const [typing, setTyping] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [viewingDate, setViewingDate] = useState(dayKey());
  const [liveDay, setLiveDay] = useState(dayKey());

  const today = dayKey();

  /* ───────── Auth + initial load ───────── */
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => handleSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => handleSession(s));
    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSession(s: Session | null) {
    setSession(s);
    if (s?.user) {
      setUserId(s.user.id);
      const prof = await loadProfile(s.user.id).catch(() => null);
      setProfile(prof);
      setGoalType(prof?.goal || null);
      // Identify with RevenueCat + register push as soon as we know the user.
      configurePurchases(s.user.id).catch(() => {});
      registerPushToken().catch(() => {});
      if (!prof || !prof.onboarded) {
        setNeedsOnboarding(true);
        setReady(true);
        return;
      }
      setNeedsOnboarding(false);
      await bootstrap(s.user.id);
    } else {
      // Signed out — reset to a clean guest-less state.
      setUserId(null);
      setProfile(null);
      setNeedsOnboarding(false);
      logoutPurchases().catch(() => {});
    }
    setReady(true);
  }

  async function bootstrap(uid: string) {
    const now = new Date();
    const todayKey = dayKey(now);

    const [g, m, dayMsgs, summary, weights, sub, stored] = await Promise.all([
      loadGoals(uid),
      loadRecentMeals(uid, 7),
      loadDayMessages(uid, todayKey),
      loadLatestSummary(uid),
      loadWeightHistory(uid, 90),
      getSubscription(),
      getLastActiveDate(),
    ]);
    setGoals(g);
    setMeals(m);
    setWeightHistory(weights);
    setSubscription(sub);
    setViewingDate(todayKey);
    setLiveDay(todayKey);

    // Day-boundary detection.
    const isNewDay = stored && stored !== todayKey;
    const dayTotals = aggregate(m);
    const hasHistory = [...dayTotals.keys()].some((k) => k < todayKey);

    const msgs = dayMsgs.map(toUiMsg);

    if (isNewDay && hasHistory) {
      const prev = dayTotals.get(yesterdayKey(now)) || { calories: 0, protein: 0 };
      msgs.unshift(recapMessage(prev, now));
    }

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
    await setLastActiveDate(todayKey);
  }

  // Onboarding finished → pull fresh (now computed) goals + data.
  const handleOnboarded = useCallback(
    async (result: { goals?: Goals; profile?: Profile }) => {
      setNeedsOnboarding(false);
      if (result?.profile) {
        setProfile(result.profile);
        setGoalType(result.profile.goal || null);
      }
      setReady(false);
      if (userId) await bootstrap(userId);
      setReady(true);
    },
    [userId]
  );

  const handleSaveProfile = useCallback(
    async (patch: Partial<Profile>) => {
      if (!userId) throw new Error('not signed in');
      const updated = await saveProfileFields(userId, patch);
      setProfile((p) => ({ ...(p || {}), ...patch }));
      if ('goal' in patch) setGoalType((patch.goal as string) || null);
      return updated;
    },
    [userId]
  );

  const handleDeleteAccount = useCallback(async () => {
    await deleteAccount(); // signs out → onAuthStateChange returns to /auth
  }, []);

  /* ───────── Derived ───────── */
  const dayMap = useMemo(() => aggregate(meals), [meals]);
  const todayTotals = dayMap.get(today) || { ...ZERO };

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

  /* ───────── Send ───────── */
  const handleSend = useCallback(
    async (text: string) => {
      const content = (text ?? '').trim();
      if (!content || typing) return;

      const now = new Date();
      const cur = dayKey(now);
      let baseMessages: UiMessage[];

      if (cur !== liveDay) {
        // Midnight crossed while the app stayed open → inline day-boundary flow.
        const dayTotals = aggregate(meals);
        const hasHistory = [...dayTotals.keys()].some((k) => k < cur);
        const prev = dayTotals.get(yesterdayKey(now)) || { calories: 0, protein: 0 };
        baseMessages = hasHistory ? [recapMessage(prev, now)] : [];
        setMessages(baseMessages);
        setViewingDate(cur);
        setLiveDay(cur);
        await setLastActiveDate(cur);
      } else if (viewingDate !== cur) {
        // Returning from a read-only past-day view to today's live thread.
        const dayMsgs = userId ? await loadDayMessages(userId, cur) : [];
        baseMessages = dayMsgs.map(toUiMsg);
        setMessages(baseMessages);
        setViewingDate(cur);
      } else {
        baseMessages = messages;
      }

      const userMsg: UiMessage = { id: rid(), role: 'user', content, macros: null };
      const history = baseMessages
        .filter((m) => !m.isSummary && !m.isRecap)
        .slice(-10)
        .map((m) => ({ role: m.role, content: m.content }));

      setMessages((prev) => [...prev, userMsg]);
      setTyping(true);
      tapSend();

      try {
        const result = await sendChat({ message: content, history });

        const aiMsg: UiMessage = {
          id: rid(),
          role: 'ai',
          content: result.message,
          macros: result.hasFood
            ? { ...(result.macros as Totals), foods: result.foods, insight: result.insight }
            : null,
          upgrade: !!result.upgrade,
        };
        setMessages((prev) => [...prev, aiMsg]);

        if (result.hasFood) {
          macroLanded();
          if (userId) {
            const fresh = await loadRecentMeals(userId, 7);
            setMeals(fresh);
          }
        }

        if (result.weightLogged && userId) {
          const [w, g] = await Promise.all([
            loadWeightHistory(userId, 90),
            loadGoals(userId),
          ]);
          setWeightHistory(w);
          if (g) setGoals(g);
        }
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: rid(),
            role: 'ai',
            content: "I had trouble responding just now — give it another try in a sec.",
            macros: null,
          },
        ]);
      } finally {
        setTyping(false);
      }
    },
    [typing, liveDay, viewingDate, messages, meals, userId]
  );

  /* ───────── Barcode + photo logging ───────── */
  const pushAiResult = useCallback(
    (result: ChatResult, opts: { image?: string | null } = {}) => {
      const aiMsg: UiMessage = {
        id: rid(),
        role: 'ai',
        content: result.message,
        macros: result.hasFood
          ? {
              ...(result.macros as Totals),
              foods: result.foods,
              insight: result.insight || '',
              isEstimate: !!result.isEstimate,
              estimateNote: result.estimateNote || '',
            }
          : null,
        image: opts.image || null,
      };
      setMessages((prev) => [...prev, aiMsg]);

      if (result.hasFood && result.macros) {
        macroLanded();
        const m = result.macros;
        const meal: Meal = {
          id: rid(),
          logged_at: new Date().toISOString(),
          foods: result.foods || [],
          calories: m.calories,
          protein: m.protein,
          carbs: m.carbs,
          fat: m.fat,
        };
        setMeals((prev) => [...prev, meal]); // optimistic → rings update
        if (userId) loadRecentMeals(userId, 7).then(setMeals).catch(() => {});
      }
    },
    [userId]
  );

  const runLogging = useCallback(
    async (
      fn: () => Promise<ChatResult>,
      opts: { userText?: string; image?: string | null; fallback?: string } = {}
    ) => {
      if (opts.userText) {
        setMessages((prev) => [
          ...prev,
          { id: rid(), role: 'user', content: opts.userText!, macros: null },
        ]);
      }
      setTyping(true);
      try {
        const result = await fn();
        pushAiResult(result, { image: opts.image });
      } catch (err: any) {
        setMessages((prev) => [
          ...prev,
          { id: rid(), role: 'ai', content: opts.fallback || err.message, macros: null },
        ]);
      } finally {
        setTyping(false);
      }
    },
    [pushAiResult]
  );

  const handleScan = useCallback(
    (barcode: string) => {
      runLogging(() => sendBarcode({ barcode }), {
        fallback: "Couldn't find that one — try typing it out instead.",
      });
    },
    [runLogging]
  );

  const handleSendPhoto = useCallback(
    async (text: string) => {
      if (!photoUri) return;
      const uri = photoUri;
      const userText = (text || '').trim();
      setPhotoUri(null);
      await runLogging(() => sendPhoto({ uri, message: userText }), {
        userText: userText || undefined,
        image: uri,
        fallback: "Couldn't read that photo clearly — try again or type it out",
      });
    },
    [photoUri, runLogging]
  );

  /* ───────── Goals ───────── */
  const handleSaveGoal = useCallback(
    async (key: keyof Goals, value: number) => {
      if (!userId) return;
      const next = { ...goals, [key]: value };
      setGoals(next);
      try {
        await saveGoals(userId, next);
      } catch {
        /* keep optimistic value */
      }
    },
    [goals, userId]
  );

  /* ───────── History navigation ───────── */
  const handleSelectDay = useCallback(
    async (date: string) => {
      if (!userId) return;
      setViewingDate(date);
      const dayMsgs = await loadDayMessages(userId, date);
      setMessages(dayMsgs.map(toUiMsg));
    },
    [userId]
  );

  const backToToday = useCallback(async () => {
    if (!userId) return;
    setViewingDate(today);
    const dayMsgs = await loadDayMessages(userId, today);
    setMessages(dayMsgs.map(toUiMsg));
  }, [userId, today]);

  const refreshSubscription = useCallback(async () => {
    const sub = await getSubscription();
    setSubscription(sub);
    return sub;
  }, []);

  const openUpgrade = useCallback(() => {
    router.push('/upgrade');
  }, []);

  /* ───────── Routing ───────── */
  const lastRoute = useRef<string>('');
  useEffect(() => {
    if (!ready) return;
    let target = '/chat';
    if (!session) target = '/auth';
    else if (needsOnboarding) target = '/onboarding';
    if (lastRoute.current === target) return;
    lastRoute.current = target;
    router.replace(target as any);
  }, [ready, session, needsOnboarding]);

  const value: AppValue = {
    ready,
    session,
    userId,
    needsOnboarding,
    profile,
    subscription,
    goals,
    meals,
    messages,
    weightHistory,
    goalType,
    typing,
    viewingDate,
    today,
    photoUri,
    todayTotals,
    weight,
    historyDays,
    handleSend,
    handleScan,
    setPhoto: setPhotoUri,
    handleSendPhoto,
    handleSaveGoal,
    handleSaveProfile,
    handleDeleteAccount,
    handleOnboarded,
    handleSelectDay,
    backToToday,
    refreshSubscription,
    openUpgrade,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
