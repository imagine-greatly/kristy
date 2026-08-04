import { useMemo } from 'react';

// Half the examples are the counter on purpose: the barcode half is the half people
// already expect, so the openers should show the half they don't.
const EXAMPLES = [
  'Which cut for stew?',
  'Wild or farmed salmon?',
  'Build a cart for taco night',
  'What does pasture-raised leave out?',
];

const GREETINGS = {
  morning: ['Good morning.', 'Morning. What are we shopping for?', 'New day, fresh cart.'],
  afternoon: ['Hey. What are we shopping for?', "How’s the day going?", 'Afternoon. What do you need?'],
  evening: ['Evening. Planning a trip?', 'Good evening. What are we grabbing?', "What’s on the list tonight?"],
  night: ['Late-night list?', 'Still going?', "Planning tomorrow’s trip?"],
};

const SUBTITLES = [
  'The box, and the counter it never came in.',
  'Say what the trip is for.',
  'Photograph the label, or ask about the counter.',
  'Meat, fish, eggs, produce, bulk. No barcode needed.',
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
