// One card, both states, on a 390px canvas. Summary is what a shopper meets; expanded is
// what the tap opens. Showing them together is the only way to judge whether the split
// put the right things on each side of it.

import { createRoot } from 'react-dom/client';
import CounterCard from '../src/components/CounterCard.jsx';
import { colors, fonts } from '../src/lib/tokens.js';

const CARD = window.__CARD__;
const LABEL = window.__LABEL__ || '';

const caption = {
  fontFamily: fonts.ui, fontSize: 10, fontWeight: 700, letterSpacing: '0.12em',
  textTransform: 'uppercase', color: colors.textMuted, padding: '0 16px', margin: '0 0 8px',
};
const rule = {
  fontFamily: fonts.ui, fontSize: 9.5, letterSpacing: '0.14em', textTransform: 'uppercase',
  color: colors.textMuted, opacity: 0.75, padding: '0 16px', margin: '18px 0 8px',
};

function Shot() {
  return (
    <div style={{ paddingTop: 14, paddingBottom: 18 }}>
      <p style={caption}>{LABEL}</p>

      <p style={rule}>Summary — before the tap</p>
      <div style={{ padding: '0 16px' }}>
        <CounterCard card={CARD} onAddToCart={() => {}} />
      </div>

      <p style={rule}>Expanded — after the tap</p>
      <div style={{ padding: '0 16px' }}>
        <CounterCard card={CARD} onAddToCart={() => {}} defaultOpen />
      </div>
    </div>
  );
}

(async () => {
  createRoot(document.getElementById('root')).render(<Shot />);
  await document.fonts.ready;
  window.__SHOT_READY__ = true;
})();
