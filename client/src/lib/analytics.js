// Thin, best-effort wrapper over Vercel Web Analytics custom events. Pageviews
// come from <Analytics/> in main.jsx; these are the product events the brief
// names: scan / verdict / haul-share / list-build. Never throws — analytics must
// never break a user action, and it's a no-op in dev / when the script isn't loaded.
import { track } from '@vercel/analytics';

export function trackEvent(name, props) {
  try {
    track(name, props);
  } catch {
    /* best-effort */
  }
}
