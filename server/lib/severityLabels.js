/* THE SHORT SEVERITY CHIP, SERVER-SIDE, BECAUSE IT IS A CLAIM AND NOT A STYLE.
   "Skip always" and "Strong case to avoid" are verdicts about how much a concern matters. They
   lived only in `client/src/lib/verdictRamp.js`, which meant a second client — Swift — would
   have restated them in its own words, and a restated claim is a claim that drifts. The
   ingredient route now sends `severity_label` beside `severity`; the client renders what it is
   given and holds no table of its own.

   THIS IS NOT THE KB'S OWN DESCRIPTION, and the two are not interchangeable. The KB carries
   `severity_levels[level]` — a full sentence explaining what the level means — and the route
   already sends it as `framing.severity`. This is the four-word tag a row can wear. Both are
   authored; only this one had no server home.

   WHAT DELIBERATELY DID NOT MOVE WITH IT: `EVIDENCE_LABEL` (established / credible concern /
   Kristy's standard / time-tested). It is equally claim-adjacent, but it renders in
   `ScanVerdictCard` off a matched entry, and a matched entry is shaped by `sanitizeFlagged`,
   which keeps exactly five whitelisted fields with a test pinning that. Widening a claim-lock
   whitelist to carry a label is a change to the claim lock, and it needs deciding on its own
   merits rather than as a side effect of tidying a duplication.

   Keys are the KB's own severity levels. `severityCoverage` in the route test asserts every
   level the KB uses has a label, so a new level cannot ship label-less. */
export const SEVERITY_LABEL = {
  critical: 'Skip always',
  high: 'Strong case to avoid',
  moderate: 'Worth knowing',
  flag: 'On the radar',
};

/** Every severity level this module can label. */
export const SEVERITY_LEVELS = Object.keys(SEVERITY_LABEL);
