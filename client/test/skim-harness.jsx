// The skim harness — every counter card's SUMMARY state, rendered by the real component
// at a real 390px, so the bar is measured off line boxes rather than judged from a
// screenshot.
//
// It renders the actual CounterCard, in a real browser, from the live corpus. A jsdom
// approximation would report the word counts correctly and the RENDERED LINE COUNT — the
// only number here that cannot be derived from the data — not at all.

import { createRoot } from 'react-dom/client';
import CounterCard from '../src/components/CounterCard.jsx';

// The corpus is fetched in Node and embedded, not fetched from here: the harness runs on
// its own throwaway origin, which the API's CORS allowlist has never heard of. Embedding
// also makes the page hermetic — it measures the same corpus every run.
const CARDS = window.__CARDS__ || [];

function Harness({ cards }) {
  return (
    <div id="skim">
      {cards.map((card) => (
        // Each card sits in a 390-wide column with the app's own gutters, so the text
        // wraps exactly where it wraps on a phone.
        <div key={card.slug} style={{ padding: '0 16px 18px' }}>
          {/* Summary state: defaultOpen is false, so the expanded block never mounts. */}
          <CounterCard card={card} onAddToCart={() => {}} />
        </div>
      ))}
    </div>
  );
}

(async () => {
  createRoot(document.getElementById('root')).render(<Harness cards={CARDS} />);
  // Fonts have to be settled before anything measures a line box, or every card reports
  // fallback-font metrics and the whole run is quietly wrong.
  await document.fonts.ready;
  window.__SKIM_READY__ = CARDS.length;
})();
