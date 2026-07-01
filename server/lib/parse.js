// Haiku is asked for raw JSON, but we parse defensively in case it wraps
// the object in prose or a ```json fence.

const round = (x) => Math.round(Number(x) || 0);

export function parseChatJSON(text) {
  let raw = (text || '').trim();

  // Strip a ```json ... ``` fence if present.
  const fence = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) raw = fence[1].trim();

  // Otherwise grab the outermost {...}.
  if (!raw.startsWith('{')) {
    const first = raw.indexOf('{');
    const last = raw.lastIndexOf('}');
    if (first !== -1 && last !== -1) raw = raw.slice(first, last + 1);
  }

  let obj;
  try {
    obj = JSON.parse(raw);
  } catch {
    // Last resort: treat the whole thing as a plain message.
    return {
      message: (text || '').trim() || "I didn't quite catch that — try again?",
      hasFood: false,
      macros: null,
      foods: [],
      insight: '',
    };
  }

  const hasFood = Boolean(obj.hasFood);
  return {
    message: String(obj.message || '').trim(),
    hasFood,
    macros: hasFood
      ? {
          calories: round(obj.macros?.calories),
          protein: round(obj.macros?.protein),
          carbs: round(obj.macros?.carbs),
          fat: round(obj.macros?.fat),
        }
      : null,
    foods: Array.isArray(obj.foods) ? obj.foods.map(String) : [],
    insight: String(obj.insight || '').trim(),
  };
}
