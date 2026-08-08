# What the photo left off — a proposal

Written 2026-08-09, from the iOS side, against `main` at `fbad052`. **Proposal only. Nothing
built, no server code touched.** It is held with the rest of the stack; the queue entry lives
in `kristy-ios/docs/SWIFT-HANDOFF.md` §3 — one queue, not two.

---

## The problem, in one sentence

**A shopper cannot correct what they do not know was dropped**, and the photo review step
exists precisely so they can catch it — so a silent omission defeats the guard built for it.

The review step (`ComposePhotoReview`, built) shows every line the reader returned, editable,
before any of it becomes the list. What it cannot show is a line that never came back. Today
`GuestListImportResponse` carries `list`, `summary`, `imported`, `specified` — **nothing about
what was left out** — so the client has no honest way to say anything, and printing a claim
anyway would be the client authoring a fact about what the server did.

## Two kinds of omission, and only one of them is answerable

They need separating before anything is designed, because they fail differently.

| | what it is | how it happens |
| --- | --- | --- |
| **A** deliberate skip | a crossed-out line, a heading, a price, a total | `listVision`'s rules tell it to drop these. The model **saw** the thing and made a decision. |
| **B** a silent miss | a line it never resolved | `unreadable: true` exists for exactly this and is the module's headline rule |

**A is a positive observation. B is an absence.** Asking a model to report B is asking it to
report on its own blind spot, and the evidence that this does not work is already in hand,
twice:

- **`unreadable` fired 0 times in 9 runs** (`LIST-CREATION-AUDIT.md` §D1) while cursive `tp`
  came back as a confident *"butter"*, every run. The self-report mechanism the module already
  has has never once fired, including on the one word it demonstrably could not read.
- The web attempt at the same question **undercounted by exactly the line it dropped**, which
  is the failure stated as cleanly as it can be: the thing doing the reporting is the thing
  that did not see it.

> **So: do not add a self-reported count of B, and do not state one as a fact.** It would be a
> number that reads as measured, is not, and is wrong in the direction that matters — reporting
> zero omissions on the reads that had one.

## The independent signal, and its honest limit

**`PanelReadability` already carries `regionCount`, and it comes from a different system than
the transcriber.** Apple's text detector returns one observation per detected region with its
own confidence and bounding box, so a region it can see but not read shows up as a low-confidence
*region* rather than as an absence. That file's own header makes this argument for the scan
path; it applies unchanged here. Today it runs on the camera preview stream; for a list photo it
would run once, on the captured still, on device, before or alongside the upload.

**Its limit, stated so nobody turns it into a number:** a *region* is not a *line*. One written
line can split into several observations, two columns can merge into one, and a heading is a
region like any other. So `regions` and `items` disagreeing is real evidence that something is
missing, and **the size of the disagreement is not a count of anything.**

> **It supports a boolean, not a number.** That is the whole finding.

## The proposal, in three parts, smallest first

### 1. Ship the standing sentence now. No server change, no reliability risk.

The review step gains one line, always present, stating the **rule** rather than a claim about
this image:

> *"Anything crossed out was left off."*

It is true by construction — it is `listVision`'s rule 4 — it needs no field, it cannot be
wrong, and it tells the shopper the one thing they need in order to check: what to look for on
their own piece of paper. **This is most of the value and it costs nothing.** It should not
wait for either part below.

### 2. Client-only: the region discrepancy, as a boolean.

Run the same detector on the captured still. When `regionCount` exceeds the returned item count
by more than a tolerance, add one further line:

> *"Some lines may not have been read."*

No number, no count, no "N missing". A tolerance is needed because the detector over-splits;
it has to be measured on real photographed lists, and **until it is measured this stays
unbuilt** — a threshold nobody calibrated is the thing `PanelReadability`'s own header warns
about in bold. **No server change at all.**

### 3. Server, and only if a probe clears it: the deliberate skips.

The one omission a model can plausibly report is **A**, because it saw the thing.

**`listVision` would return**, alongside `items`:

```jsonc
"skipped": [ { "reason": "struck" }, { "reason": "heading" } ]
```

`reason` is an enum — `struck` · `heading` · `price` · `total` — and **never free text**, so
nothing new can be minted into a response a shopper reads. **No transcribed text of the skipped
line**: a crossed-out item is a thing the shopper deliberately removed, and echoing it back is
undoing their decision in a smaller font.

**`GuestListImportResponse` would carry `struck: Int`** — that count only. Headings, prices and
totals are noise nobody wants confirmed; `struck` is the one a shopper would want to check. The
review step could then read *"One crossed-out line was left off."*

**The probe that gates this, and it is not optional.** Re-run the §D1 image set, which already
contains a struck row and is already known-good on the current prompt (struck rows dropped 9/9),
and check whether `skipped` agrees with the ground truth in **both** directions — that it
reports the struck row when there is one, and reports nothing when there is not. Three runs per
image, as before, because a single run cannot distinguish a behaviour from a sample.

> **If the probe does not come back clean, ship part 1 and stop.** An unreliable count is worse
> than an honest sentence: *"anything crossed out was left off"* is always true, while *"one
> crossed-out line was left off"* on a read that dropped two is a specific false statement about
> the shopper's own list, made at the exact moment they are deciding whether to trust the read.

## What this does not propose

- **No `unreadable` count.** See the evidence above; that field's mechanism is unexercised in
  both directions and adding arithmetic on top of it would launder it.
- **No change to what `listVision` transcribes.** The rules are right and were verified on
  production; this is about reporting, not reading.
- **No new endpoint.** Part 3 is two fields on an existing response.

## Order, and the one dependency

1 → (2 and 3 independently). Part 1 is client copy and is the only part with no measurement in
front of it. **Part 3 is the only server change**, it is small, and it should not be bundled
with anything else on the held stack: a schema-shaped change riding along with a feature is how
a migration ships without anyone deciding it should.
