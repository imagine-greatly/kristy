import { useState } from 'react';
import { colors, fonts, kristyVoice } from '../lib/tokens.js';
import { GoldThread } from './GoldThread.jsx';
import { nextAmbientIsm } from '../lib/education.js';

/* One ambient Kristy-ism for an empty/loading surface. Picks a line on mount
   (random, non-repeating) so it stays stable while the screen is up. Exactly one
   per screen — never stacked. Tokens only. */
export default function AmbientIsm({ style }) {
  const [ism] = useState(nextAmbientIsm);
  if (!ism) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, width: '100%', maxWidth: 320, ...style }}>
      <GoldThread />
      <p style={{ ...kristyVoice, margin: 0, fontSize: 13.5, lineHeight: 1.5, textAlign: 'center', color: colors.textMuted }}>
        {ism}
      </p>
    </div>
  );
}
