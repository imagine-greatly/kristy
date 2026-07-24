import { useRef, useState, useEffect } from 'react';
import { ArrowUpIcon, BarcodeIcon, VerdictIcon } from './Icons.jsx';

// The chat composer. Three affordances only: type a message, scan a barcode, or
// photograph a label for a verdict. No meal-photo / macro-logging control —
// Kristy is a grocery coach, not a food log.
export default function InputBar({
  value,
  onChange,
  onSend,
  disabled,
  onBarcode,
  onVerdictFile,
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
          placeholder="Ask me anything, or scan it."
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
