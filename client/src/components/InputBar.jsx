import { useRef, useState, useEffect } from 'react';
import { ArrowUpIcon, BarcodeIcon, VerdictIcon } from './Icons.jsx';

// The composer — DOCKED on every surface, and deliberately a tool rather than the
// centerpiece: one slim bar beneath the cart for the deep, messy input taps can't
// express (a week of dinners, a standing preference, a question about one product).
// Three affordances only: type, scan a barcode, or photograph a label for a verdict.
// No meal-photo / macro-logging control — Kristy is a grocery coach, not a food log.
export default function InputBar({
  value,
  onChange,
  onSend,
  disabled,
  onBarcode,
  onVerdictFile,
  placeholder = 'Ask me anything, or scan it.',
  // Bumped by a tap affordance that hands off to the composer ("Build me a cart for…").
  focusSignal = 0,
}) {
  const ref = useRef(null);
  const verdictRef = useRef(null);
  const [focused, setFocused] = useState(false);

  // Auto-grow up to 120px.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  }, [value]);

  // Pull focus (and put the caret at the end) when a tap hands off to the composer.
  useEffect(() => {
    if (!focusSignal) return;
    const el = ref.current;
    if (!el) return;
    el.focus();
    el.setSelectionRange(el.value.length, el.value.length);
  }, [focusSignal]);

  const canSend = value.trim().length > 0 && !disabled;

  const doSend = () => {
    if (canSend) onSend();
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      doSend();
    }
  };

  const handleVerdictFile = (e) => {
    const f = e.target.files?.[0];
    if (f) onVerdictFile?.(f);
    e.target.value = '';
  };

  return (
    <div className="inputbar">
      <div className={`inputbar__inner${focused ? ' focused' : ''}`}>
        <button className="input-icon-btn" onClick={onBarcode} aria-label="Scan barcode">
          <BarcodeIcon />
        </button>
        {onVerdictFile && (
          <>
            <button
              className="input-icon-btn input-icon-btn--verdict"
              onClick={() => verdictRef.current?.click()}
              aria-label="Kristy's Verdict — scan a label"
              title="Kristy's Verdict"
            >
              <VerdictIcon />
            </button>
            <input
              ref={verdictRef}
              type="file"
              accept="image/*"
              capture="environment"
              style={{ display: 'none' }}
              onChange={handleVerdictFile}
            />
          </>
        )}

        <textarea
          ref={ref}
          rows={1}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKey}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />

        <button
          className={`send-btn${canSend ? ' active' : ''}`}
          onClick={doSend}
          disabled={!canSend}
          aria-label="Send"
        >
          <ArrowUpIcon />
        </button>
      </div>
    </div>
  );
}
