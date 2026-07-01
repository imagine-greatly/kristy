import { useMemo } from 'react';

const EXAMPLES = [
  '100g chicken breast, 150g rice',
  '3 scrambled eggs and half an avocado',
  'Protein shake with 300ml whole milk',
  'Big mac and medium fries',
];

const GREETINGS = {
  morning: ['Good morning.', "Morning. What's on the menu today?", 'New day, clean slate.'],
  afternoon: ['Hey. What have you eaten so far?', "How's the day going?", 'Afternoon. What did you have?'],
  evening: ["Evening. How'd you do today?", 'Good evening. What did you eat?', "Almost done for the day — what'd you have?"],
  night: ['Eating late?', 'Still going?', 'Late night. What are we logging?'],
};

const SUBTITLES = [
  "Tell me what you ate. I'll handle the rest.",
  "Just type it out — '100g rice, 100g beef' — I'll track it.",
  'No forms. Just talk.',
  "Type it like a text. I'll do the math.",
];

function timeBucket(hour) {
  if (hour >= 5 && hour < 11) return 'morning';
  if (hour >= 11 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 22) return 'evening';
  return 'night';
}

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

export default function EmptyState({ onPick, greeting: greetingProp, subtitle: subtitleProp }) {
  // Choose once on mount so it doesn't reshuffle on every render. Callers (e.g.
  // guest mode) can pin a specific greeting/subtitle instead of the random pick.
  const randGreeting = useMemo(() => pick(GREETINGS[timeBucket(new Date().getHours())]), []);
  const randSubtitle = useMemo(() => pick(SUBTITLES), []);
  const greeting = greetingProp ?? randGreeting;
  const subtitle = subtitleProp ?? randSubtitle;

  return (
    <div className="empty">
      <div className="empty__greeting">{greeting}</div>
      <div className="empty__subtitle">{subtitle}</div>
      <div className="chips">
        {EXAMPLES.map((ex) => (
          <button className="chip" key={ex} onClick={() => onPick(ex)}>
            {ex}
          </button>
        ))}
      </div>
    </div>
  );
}
