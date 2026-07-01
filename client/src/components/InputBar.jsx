import { useRef, useState, useEffect } from 'react';
import { ArrowUpIcon, BarcodeIcon, CameraIcon } from './Icons.jsx';

export default function InputBar({
  value,
  onChange,
  onSend,
  disabled,
  onBarcode,
  onPhotoFile,
  photoPreview,
  onClearPhoto,
  onSendPhoto,
}) {
  const ref = useRef(null);
  const fileRef = useRef(null);
  const [focused, setFocused] = useState(false);

  // Auto-grow up to 120px.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  }, [value]);

  const hasText = value.trim().length > 0;
  const canSend = (hasText || !!photoPreview) && !disabled;

  const doSend = () => {
    if (!canSend) return;
    if (photoPreview) onSendPhoto(value);
    else onSend();
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      doSend();
    }
  };

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (f) onPhotoFile(f);
    e.target.value = ''; // allow re-selecting the same file
  };

  return (
    <div className="inputbar">
      {photoPreview && (
        <div className="photo-preview">
          <img src={photoPreview} alt="Selected meal" />
          <button
            className="photo-preview__remove"
            onClick={onClearPhoto}
            aria-label="Remove photo"
          >
            ×
          </button>
        </div>
      )}

      <div className={`inputbar__inner${focused ? ' focused' : ''}`}>
        <button className="input-icon-btn" onClick={onBarcode} aria-label="Scan barcode">
          <BarcodeIcon />
        </button>
        <button
          className="input-icon-btn"
          onClick={() => fileRef.current?.click()}
          aria-label="Add a photo"
        >
          <CameraIcon />
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          style={{ display: 'none' }}
          onChange={handleFile}
        />

        <textarea
          ref={ref}
          rows={1}
          value={value}
          placeholder="What did you eat?"
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
