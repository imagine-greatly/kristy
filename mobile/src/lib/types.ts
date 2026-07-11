// Shared domain types — mirror the shapes the Railway API and Supabase return.

export interface Macros {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export type Totals = Macros;
export type Goals = Macros;

// The macro payload stored on an AI message / meal (macros + card extras).
export interface MacroCardData extends Macros {
  foods?: string[];
  insight?: string;
  isEstimate?: boolean;
  estimateNote?: string;
}

export interface UiMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  macros: MacroCardData | null;
  isSummary?: boolean;
  isRecap?: boolean;
  upgrade?: boolean;
  image?: string | null;
}

export interface Meal {
  id: string;
  logged_at: string;
  foods: string[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface WeightEntry {
  logged_at: string;
  weight_value: number;
  weight_unit: string;
}

export interface Profile {
  name?: string | null;
  age?: number | null;
  sex?: string | null;
  height_value?: number | null;
  height_unit?: string | null;
  weight_value?: number | null;
  weight_unit?: string | null;
  goal?: string | null;
  sport?: string | null;
  training_frequency?: string | null;
  eating_pattern?: string | null;
  eating_window_start?: string | null;
  eating_window_end?: string | null;
  dietary_preferences?: string[];
  onboarded?: boolean;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

export interface Subscription {
  premium: boolean;
  status: 'none' | 'trialing' | 'active' | 'past_due' | 'canceled' | 'expired';
  provider: 'stripe' | 'apple' | 'promo' | null;
  trialEndsAt: string | null;
  currentPeriodEnd: string | null;
  trialDaysLeft: number;
  trialExpired: boolean;
}

// The normalized result shape sendChat / logging return to the app.
export interface ChatResult {
  message: string;
  hasFood?: boolean;
  macros?: Macros | null;
  foods?: string[];
  insight?: string;
  isEstimate?: boolean;
  estimateNote?: string;
  weightLogged?: boolean;
  recalculated?: unknown;
  upgrade?: boolean;
  locked?: string;
  error?: boolean;
}

export interface WeightSummary {
  current: number;
  unit: 'lbs' | 'kg';
  weekChange: number;
  goalType: string | null;
}
