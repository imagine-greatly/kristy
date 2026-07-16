// The ambient Kristy-isms — the rotating, no-trigger lines for empty states,
// loading, and the haul surface. Contextual (verdict-card) isms are chosen
// server-side and arrive on the /verdict response; these three are the ambient
// pool. Rotation is random but never repeats the same line twice in a row.

export const AMBIENT_ISMS = [
  'Read the back, not the front. The front is marketing; the back is the truth.',
  'Shop the edges of the store. The real food lives on the perimeter.',
  "The best foods don't have an ingredient list. They are the ingredient.",
];

let last = -1;

export function nextAmbientIsm() {
  if (AMBIENT_ISMS.length <= 1) return AMBIENT_ISMS[0] || '';
  let i = last;
  while (i === last) i = Math.floor(Math.random() * AMBIENT_ISMS.length);
  last = i;
  return AMBIENT_ISMS[i];
}
