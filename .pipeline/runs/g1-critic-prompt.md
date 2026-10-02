Adversarial review of one Claude-built T2 change in this repo (uncommitted working tree). Run `git diff -- server/` and read the new file server/lib/g1Ungate.test.js. Spec: .pipeline/specs/G1-ungate-list.md. Ignore CLAUDE.md (separate docs change).

Intent (Ruling F, Devon 2026-10-02): free users create and edit lists; only shop mode (starting a trip, POST /trips/new) is paid. requireTripAllowance must be removed from GET/POST /list, /list/rebuild, /list/compose, /list/swaps, /list/import and POST /trips/next; it stays on POST /trips/new. requireAuth, userRateLimit and the compose daily limit must remain untouched.

Check: (1) every route above is ungated and /trips/new still gated with auth before the gate; (2) no other middleware (auth, rate limit) was dropped by accident; (3) tests actually prove it (no empty loops, nonEmpty mins correct, acceptance file unchanged from spec); (4) any other caller path still enforcing a 402 on list routes, or a client-visible contract change (allowanceRemaining on /trips/seedable) that breaks; (5) dead imports.

Output: PASS or BLOCK on line 1, then at most 10 findings as path:line - severity (major/minor) - one sentence.
