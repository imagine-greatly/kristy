## Refresh verification (2026-10-16)

- `node .pipeline/runs/ca-4b/counts.mjs > .pipeline/runs/ca-4b/before.json`: exit 0; valid JSON, 181 curated cards, 30 picks, 23 eggs_dairy, 1 forced section hit. The server/review tree equals a392e36.
- `node .pipeline/runs/ca-4b/verify-acceptance.mjs`: exit 0; 52 tests, 52 pass, 0 fail, 0 skipped. It checks the materialized file equals the embedded acceptance before adapting paths and substituting projected input objects. No assertions are removed or changed.
- `node .pipeline/runs/ca-4b/verify-dependencies.mjs`: exit 0; 798 tests, 798 pass, 0 fail, 0 skipped across 18 unchanged existing test files. The same process runs listMatchProbe: `no wrong matches` (all seven wrong counters zero). Only process-local KB/review/do-line data is substituted; no server file is written.
- Forced section lints: BEFORE 1 → projected AFTER 0. Card/repeated-claim/hedge/readability lints and corpus repetition budget: 0 violations. All four changed cart picks match their own ids; 90/120-character and both percent/price rules pass.
- `node server/scripts/commitGuard.js`: exit 0. Output:

```text
commitGuard: tree mode · 0 staged · 0 untracked in guarded dirs

nothing this commit carries references an untracked file, and no suite file is missing
```

- `git diff --check`: exit 0, no output. The only tracked change is this spec; new files are under .pipeline/runs/ca-4b/. No server/client/docs/KB writes, network, migration or git writes.
- Full `npm test` and build installation are deferred to the builder; this is a docs refresh, not a shipped KB change. Missing API/database environment variables emit startup notices but do not block these offline checks. No ENVIRONMENT blocker.
- `dv check .pipeline/specs/ca-4b.md`: exit 0; no DRIFT or STALE. Output verbatim:

```text
PASS
```

READY for build dispatch.
