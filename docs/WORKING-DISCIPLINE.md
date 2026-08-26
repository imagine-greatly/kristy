# Working discipline — the account

The RULES live in `CLAUDE.md`, which is where a session actually reads them. This file is
the account behind them: the incidents that produced each rule, the measurements, and the
versions they superseded. **Read the account before you change a rule; the rule alone is
enough to obey one.**

Copied byte-for-byte out of CLAUDE.md on 2026-08-15, ahead of the second split, at
111,163 characters against a 100,000-character target.

---

## WORKING DISCIPLINE — read before touching anything

**Claude Code runs here over SSH, from Windows into a rented Scaleway Mac mini, and sessions
drop mid-task with no warning.** When one does, the conversation is gone and **every file
already written to disk survives**. Report → approve → commit is backwards for that reality: it
puts the one durable act last. Twice now hours of work sat untracked when a session died, and
once it survived only because it happened to be in a directory nobody had cleaned out.

### The rule: COMMIT BEFORE REPORTING

When a unit of work is done — in this order, and before the summary is written:

```
git add -A  →  commit with a real message  →  push  →  four-step verify  →  THEN report
```

**Approval is not a precondition for committing.** Approval applies to what is already on disk.
A bad approval costs a revert; a dropped session with uncommitted work costs the hours.

- **Stopping mid-unit to ask a question? Commit what exists first**, message prefixed `wip:`,
  then ask.
- ⚠️ **COMMIT FIRST, PLANT SECOND, REVERT THIRD. PROVING A CHECK CAN FAIL IS ROUTINE HERE
  AND IT IS INHERENTLY DESTRUCTIVE.** Nearly every guard in both repos was "verified to fail
  on the defect it names" before being trusted, and the only way to do that is to break the
  source on purpose and put it back. **`git checkout -- <file>` puts it back to the last
  COMMIT, not to what you had.** So planting a defect in a file carrying uncommitted work
  and reverting deletes that work, silently, with a command whose whole job is to be safe.
  **This happened 2026-08-08** and cost the approved-state collapse in `ScanSheet.swift` and
  the detent set in `ScanBranch.swift` — both rewritten from scratch. The order that was
  followed was verify-then-commit; the order is **commit, then plant, then revert.**
  It is the same lesson as the rule above with the threat inverted: there, the danger is a
  dropped session taking uncommitted work; here it is *you* taking it, with a routine
  command, in the middle of doing something careful. `git stash` is not the fix either — it
  takes the test you are trying to run along with the source you are trying to break, and a
  suite that then runs zero tests reports **success**, which is the empty-collection defect
  wearing a green tick.
- **Never end a turn with anything untracked. Ever.** `git add -A`, never `git commit -a` —
  `-a` does not add untracked files, and that is precisely how `3267c95` shipped a commit
  titled for the trips feature while `server/lib/trips.js` and `server/routes/trips.js` stayed
  untracked for a day (see **Verifying**, and run `node server/scripts/commitGuard.js`).
- **The four-step verify is not a formality.** A push has reported success in this project while
  the remote had not moved, and the keychain error that accompanied it appears on successful
  pushes too — so the error text cannot distinguish them and neither can the exit code. Only
  reading content back off the remote can: `git rev-parse HEAD` → `git reflog` →
  `git ls-remote origin main` → **read a file back from the remote and diff it against local.**

### ⚠️ THE PUSH STEP IS THE ONE STEP THIS REPO CANNOT TAKE ON REFLEX

**`main` here is production and pushing publishes, in about a minute** — Vercel for the client,
Railway for the server, no staging gate. And `main` currently carries **deliberately unpushed
commits** (`POST /api/trips/import`, see **Open items**). So in this repo `git push` is a
*publish*, and pushing "to be safe" ships a feature that is being held on purpose, along with
whatever else is ahead.

**Commit always — that is what a dropped session threatens. Push to `main` only when the turn's
work is meant to go live**, and never merely to satisfy the rule above. When work is committed
and deliberately unpushed, **say so in the report** rather than leaving "ahead N" for the next
session to discover and helpfully resolve.

⚠️ **BUT `git push` IS NOT THE ONLY PUBLISH CHANNEL, AND THE HOLD ONLY COVERS ONE OF THEM.**
`node server/scripts/migrateCounterCards.js` writes the corpus straight to the live
`counter_cards` table. It needs no push, no deploy and no approval from Railway — just the
credentials in `server/.env`. **So for anything whose only artifact is card content, "unpushed"
does not imply "not live".**

Observed 2026-08-10: `0a84782` (the `mercury_by_fish` sardines fix) sits on `origin/held` and
**not** on `origin/main` — undeployed by every measure git can report — while its text is
serving to anonymous callers in production, because the migration ran. That is the two-step act
working exactly as designed (**the KB is the source of record, the table is what ships**), and
it is *why* a KB edit is safe to commit onto a held stack. It is recorded here because the
inference it breaks is the natural one: reading `origin/main..HEAD` tells you what code is
held, and tells you **nothing** about what a shopper is reading.

**The practical rule:** a commit that touches only `kristy_perimeter_kb.json` publishes when
the migration runs, so **say in the report whether it has**, the same way an unpushed commit is
reported. The two states are independent and both need stating: *committed / pushed* is the
code, *migrated / not* is the corpus. The card commits already say `Not migrated.` in their
messages — that line is the other half of this and should not be dropped.

### ⚠️ THE HELD STACK LIVES ON `origin/held`. `main` BEING BEHIND IS NOT LOST WORK.

**If you find `main` behind what the docs describe, fetch `held` — do not reconstruct anything.**

```
git fetch origin held && git log --oneline --reverse origin/main..origin/held
```

`held` is a **backup branch, not a deploy target.** Railway builds from `main` and Vercel's
production deployment tracks `main`, so pushing here publishes nothing; a Vercel *preview* build
for the branch is expected and harmless — its origin is not in `CLIENT_ORIGIN`, so every API
call from it is CORS-blocked, which is the correct outcome for a URL nobody should be using.

**Why it exists:** committing protects work from a dropped session, which is the threat the rule
above is written for. It does nothing about **losing the machine** — and this runs on a rented
Mac mini reached over SSH. Nine commits, including a feature that cannot be pushed to `main`,
sat on one disk. That is the same risk one layer up, and the answer is a branch that backs them
up without deploying them.

**Keep it current: after any commit that stays off `main`, push it here too.**

```
git push origin main:held
```

⚠️ **`osxkeychain` CANNOT AUTHENTICATE OVER SSH ON THIS BOX AND FAILS IN A WAY THAT READS AS
SUCCESS.** It errors `-25308` (`errSecInteractionNotAllowed` — no UI session to unlock the
keychain) and the push dies with `could not read Username for 'https://github.com'`. Piping that
through `tail` shows exit 0, because the exit status belongs to `tail`. Use `gh`, which is
authenticated:

```
git -c credential.helper='!gh auth git-credential' push origin main:held
```

Note `-25308` *also* appears on pushes that fully succeed, so **the error text distinguishes
nothing** — only `ls-remote` plus reading a file back off the branch does. This is the four-step
above, and it is why the four-step is not a formality.

### Scope: one surface per prompt

Each prompt is scoped to one surface or one contained unit, with the expected output files
stated up front. **Your half: before starting, list the files you expect to create or modify.**
That list is the checklist a resumed session judges itself against. If the work turns out to
need files outside the list, **say so rather than silently widening.**

### RESUMING AFTER A DROPPED SESSION

```
Treat every existing file as COMPLETE unless visibly truncated.
Never recreate a type or a file that already exists. Never run an
audit pass over finished work. Do only what is missing, judged
against the expected-files list in the prompt that was
interrupted.
A rewrite of finished work still compiles. That is what makes it
dangerous: a fresh session cannot distinguish "I did not write
this" from "this is wrong."
```

**This block is in the file rather than in a prompt on purpose.** After a drop, nobody
remembers to paste it — a session that reads it automatically is the entire point.

### EVERY SESSION STARTS COLD

**SSH drops end the conversation and keep the disk. Assume you are resuming.** Before any
work, without being asked:

```
- git status --porcelain on BOTH repos; commit and push anything
  outstanding
- confirm kristy-ios HEAD against its remote by READING A FILE BACK,
  not by comparing hashes
- report kristy main vs origin/main and origin/held
- report the server suite count and the iOS UI suite count
- report anything left in flight: a background run, a half-finished
  fix, an unmigrated corpus change
```

**Then state what you understand the current task to be, and STOP if it is not obvious from
the repo.**

⚠️ **The last line is the load-bearing one.** The check is cheap and a session will run it
willingly; the failure mode is running it, finding a `wip:` commit and four unpushed ones, and
*inferring* a task from them. **A dropped session leaves work in a state, not an instruction** —
what was half-built says nothing about whether it should be finished, and this repo's history
is full of the resumed session confidently rewriting something that was already done.

⚠️ **"Push anything outstanding" MEANS `kristy-ios` AND `main:held` — NOT `kristy` `main`.**
Pushing this repo's `main` publishes to production in about a minute and the stack carries
deliberately held commits. The reflex this block installs is the exact reflex the next section
forbids. Commit everything, always; push `kristy-ios`, push `main:held`, and leave `main` alone
unless the turn's work is meant to go live.

📎 **A twin of this block lives in `kristy-ios/CLAUDE.md`** — a session starting in either repo
has to find it. **Two copies is the shape that produced the category-capture error** (one entry
stated in two documents, both wrong, for two days), so if you change one, change both, and
prefer deleting a copy over letting them disagree.

---

## THIS REPO HAS TWO HALVES AND THEY HAVE DIFFERENT RULES

Ruled 2026-08-08, when the native client became the thing being built and this repo stopped
being the thing being built. **The product is now one iOS client (`kristy-ios`) talking to the
server in this repo.** What lives here splits cleanly in two, and conflating them is how a
frozen file gets edited and a live route gets changed by accident.

### `client/src` — DEAD. FROZEN. INSPIRATION ONLY.

The React SPA is **finished and is never edited again, for any reason.** Not a typo, not a
token, not a dead import, not a "while I was in there". It is deployed and it still serves
`kristyapproved.com`, but no further work goes into it.

What it *is*, and why it is kept rather than deleted: the **behavioural specification** for the
iOS client, and the record of decisions that were arrived at by **measurement** rather than
design — the contrast floor, the hero rule, the active-section rule, the type inversion, the
one-filled-action count. Those are rules the Swift client must satisfy, and this is the evidence
they were ever true. Read it, cite it, copy the reasoning out of it. Do not write to it.

⚠️ **`client/src/lib/tokens.js` IS NO LONGER THE BRAND. IT IS A FROZEN HISTORICAL COPY.**
The brand moved to **`Brand/tokens.json` in `kristy-ios`** on 2026-08-08, and that file is now
the source of truth for every colour in the product. Nothing writes to `tokens.js` again.

**It moved because freezing it had built a guaranteed failure into a check.** `kristy-ios`
validates its whole asset catalog against the brand (`Tools/checks/palette_mirror.sh`), so with
the brand in a frozen file, the next colour authored on iOS could not be recorded — and the
check would then fail on a colour that legitimately *is* part of the brand. A check whose only
escape hatch is editing a frozen file is a check that gets disabled. The brand belongs where
the app is.

- `tokens.js` still ships to `kristyapproved.com` and the values are unchanged, so **nothing
  breaks**.
- **The three iOS-authored colours in it are a SNAPSHOT, not a live mirror.** `brassFill`,
  `brassFillInk` and `surfaceLifted` were written back by `7b421e3` on 2026-08-07 so one
  palette in two repos would not drift. **That was the last mirroring; the route is closed.**
  The web client consumes none of the three.
- If you are reading `tokens.js` to learn the brand, it is currently accurate and it will not
  stay that way. **Read `kristy-ios/Brand/tokens.json`.**

### `server/` — LIVE INFRASTRUCTURE, AND GOVERNED RATHER THAN FROZEN

Every surface of the iOS app is a thin renderer over these routes. The server may change. **It
may not change as a side effect of iOS work.**

- **A server change is separately proposed and separately approved work**, with its own prompt
  and its own scope. Routes, KB entries, model prompts, the lint, the tests — all of it.
- **An iOS prompt may not produce a server change.** iOS work that turns out to need one
  **stops and asks**: name the route, the shape, and what the client cannot do without it. It
  does not implement it, and it does not route around it in Swift — a Swift workaround is a
  second source of truth arriving by the back door, which the no-vendoring rule already forbids.
- **A finding is not a fix.** "The server does X wrong" belongs in `kristy-ios/docs/API-FINDINGS.md`
  with its evidence, and waits.

**Why a rule and not a preference:** `main` here **auto-deploys to production** with no staging
gate, and it carries **deliberately unpushed commits** (see **Open items**) — so a server change
made during iOS work publishes unreviewed, on push, because it looked small.

⚠️ **THE THIRD REASON USED TO BE "NODE IS NOT INSTALLED ON THIS MACHINE" AND IT IS NO LONGER
TRUE** (`brew install node`, 2026-08-09; measured here 2026-08-10 as **v26.7.0**, running the
full server suite at **644 pass / 0 fail**). **The rule is unchanged and the reason was never
only that tests could not run** — it is that a route change riding in on an iOS prompt gets no
scope and no review before it deploys. Server changes are *testable* now; they are still
separately proposed and separately approved.
📎 **`kristy-ios/CLAUDE.md` had already corrected this and this copy had not** — the two-copies
divergence that produced the category-capture error, caught here by running the thing the
sentence said was impossible. If you change one, change both.

**What is NOT covered by this and stays ordinary work:** `docs/`, this file, `supabase/*.sql`
migrations that have not been applied, and anything explicitly scoped as server work in its own
prompt.

---

## The two publish channels of a KB edit (2026-08-26)

**The rule is in `CLAUDE.md` → Corpus and schema. This is the account.**

### What the file said, and why it was believable

`CLAUDE.md` carried, for months:

> A KB edit changes the tests, the probes and every local fixture and changes **nothing a
> shopper sees** until `node server/scripts/migrateCounterCards.js` runs.

Every clause of that is true **of the counter route**. `routes/counter.js` genuinely serves
from the `counter_cards` table, the migration genuinely is the thing that puts a card in
front of an iOS shopper, and the committed/migrated pair genuinely is the two-state report
the file asks for. It was not sloppy. It was **a correct statement about one route,
generalised to the corpus.**

### What is actually true

`lib/perimeter.js` reads `kristy_perimeter_kb.json` **from disk at import**:

```js
const KB_PATH = join(__dirname, '..', 'kristy_perimeter_kb.json');
export const perimeterKb = JSON.parse(readFileSync(KB_PATH, 'utf8'));
```

and `index.js` mounts `routes/perimeter.js` at `/api` — public, `optionalAuth`. That route
serves those entries to anyone: `publicEntry(entry)` on the by-id door, and `entries` on the
ask door. **So pushing `main` publishes the KB to the web as soon as Railway restarts.**

**Two channels, independent, either one sufficient:**

| act | reaches | surface |
| --- | --- | --- |
| `migrateCounterCards.js` | `counter_cards` table | the iOS client |
| `git push origin main` | the JSON file on the box | the web, `/api/perimeter/*` |

So *"committed, not migrated"* does not mean no shopper has read it, and *"not pushed"* does
not mean the table is stale. **Neither state implies the other and both need saying.**

### Why it survived — and this is the part worth keeping

⚠️ **THE CHANNEL A PUSH PUBLISHES IS THE ONE NOBODY WORKING ON THE CLIENT CAN REACH.**
`kristy-ios/Tools/checks/perimeter_door.sh` exists specifically to keep the iOS client off
`/api/perimeter/*`. That check is right and should stay. But its consequence is that every
session doing iOS work is *structurally blind* to the web channel: it cannot call it, it has
no reason to read its route, and the one document that would have told it says the channel
is inert.

**This is the findings family aimed at a document rather than a test.** The rule reported
"nothing publishes" because it could not see the thing that publishes — and unlike a green
test, a rule that is wrong produces no artifact at all. Nothing was ever going to go red.

📎 **The generalisation: a rule scoped to one route, written without naming the route, becomes
a rule about the system.** The original sentence would have been correct and durable with
four extra words — *"nothing an iOS shopper sees"*. Name the surface a claim is about,
especially when the repo has more than one client and one of them is frozen.

### How it was verified, 2026-08-26

Not from the docs. `grep` for runtime readers of the KB outside tests → `lib/perimeter.js`;
`grep` for its importers → four routes; `grep perimeter index.js` → the `/api` mount; then
the route's own `res.json` calls read directly. Four commands, and every one of them reads
executing code rather than prose about it.
