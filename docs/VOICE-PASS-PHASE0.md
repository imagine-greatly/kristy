# Voice pass — Phase 0: the register, on four real cards

**Status: PROPOSAL. Nothing in the KB is edited. Nothing is migrated.**
This document settles the register on a small sample before the corpus is rewritten in it.

> ⚠️ **REVISION 3 (2026-08-23) — see §2c, the AI-authority tic. REVISION 2. The first version of this document got the machinery
> backwards and priced the work wrongly. §3 is rewritten and §5 is deleted.** The claim
> *"only one lint constraint has to move — the imperative gate"* was **wrong**: it was measured
> against the wrong field. See §3. **Zero lint constraints have to move.** The register was
> never fighting the lint.

---

## 1. Who Kristy is — the frame these cards are written against

**She is not a coach and she is not a list.**

- A **coach** tells you what to do.
- A **list** is the utility — how value reaches the shopper, not who she is.

**She is the presence behind everything in the app.** You meet her first and foremost through
the guided list; the other surfaces are other parts of the same guide.

> **The voice rule already models the character.** She never says "I" and she is never absent.
> That grammar — *assumed, not announced* — is not merely a style constraint on her sentences.
> It is what she is, everywhere. No mascot, no "Kristy says", no persona announcing itself;
> and yet no surface that is not hers.

| | |
| --- | --- |
| **Kristy** | the guide behind everything — tone, judgment, presence |
| **The guided list** | how you interact with her, first and foremost. The main value, and the point every other part converges on |
| **Scan** | stands alone, and feeds the list |
| **The Counter** | stands alone, and is **the bank the list pulls its cards from** |
| **Haul** | reads the trip back and carries it forward |

⚠️ **Converging on the list does not make the other parts subordinate.**

---

## 2. The register rule

> **A presence states what is true. A coach tells you what to do.**

1. **Declarative, not imperative** — in the **headline**. (The `do` line is a different field
   with a different job; see §3.)
2. **No antithesis as a compression device** — "X, not Y", "the one to walk away from". These
   are argument shapes. A shopper is not arguing with anyone; they are picking a cheese.
3. **No zingers.** `kristy_take` is a practical aside, not a punchline.
4. **Zero first person — unchanged.** It is the model, not an exception to it.
5. **The call is still made, still first, still unhedged.**

### ⚠️ 2a — SHORT IS THE POINT, AND WARM IS NOT WORDY

**Revision 2 exists partly because the first draft traded stern for WORDY.** A shopper standing
at a case does not want an explanation, they want **clarity** — *which eggs, which milk, which
meat.* The headline cap of **12 words is not the enemy; it is the specification.**

### ⚠️ 2b — THE REASON IS ALWAYS THE HEALTH REASON

**The first draft justified block cheese on price and melting.** Both true, both irrelevant, and
together they quietly **changed what the card stands for.** Kristy's standard is processing:
the block wins because it has nothing added to it. Melting is a side benefit.

**This is the more serious of the two errors**, because it is not a tone miss — a card that
argues from the wrong premise has stopped being a health card while still reading fine. It is
one step over from *"a claim that needs a false mechanism is a wrong claim"*: the mechanism here
was **true but beside the point**, which nothing checks for.

📎 **`egg_labels` is the model and it already exists:**
**"Soy-free and corn-free first, then organic, then pasture-raised."** Eight words, declarative,
no command, health-framed, and it hands over a *ladder*. **It needs no rewrite.** Everything
below is written to match it.

### ⚠️ 2c — THE TIC: A SENTENCE THAT CLAIMS ITS OWN IMPORTANCE

**Revision 2's headlines were rejected on sight and they are the clearest specimen in this
document.** *"Soy-free and corn-free are the feed words **that matter**."* *"The block is the
**least** processed **of the three**."*

**The mechanism: a significance claim layered on top of the fact.** The sentence does not just
say which words — it asserts that these are the ones that MATTER. It performs insight instead of
delivering information, and it reads as **pretentious, self-important, and unmistakably
machine-written.** It is the register of a voice trying to sound authentic and consequential.

⚠️ **AND THAT IS EXACTLY THE WRONG TARGET, BECAUSE KRISTY IS NOT A PERSON.** §1 settles it — she
is a **presence**. A presence does not perform personality, does not sound "real", and does not
tell you what is important. **Reaching for an authentic, personable, human-like voice is
reaching for a PERSONA, which is a different character from the one this app has.**

**Three shapes, banned:**

1. **Significance claims** — *that matters · what counts · the one to · the whole of it ·
   matters more · the real question · what actually*
2. **Superlatives and rankings** — *the least/most · the best · of the three*
3. **Setup-and-payoff** — a first clause whose only job is to make the second one land.

> **THE RULE: state the fact. Let the shopper draw the conclusion.**
> **Warmth comes from naming the actual things** — milk, cultures, salt, enzymes; starch and
> natamycin; krill. **Specificity is warm. Abstraction is cold, and a significance claim is
> abstraction wearing a tie.**

📎 **Checkable, and it fits machinery that already exists.** `counterCardLint` already carries
`antithesisChime` and `copulaAbstraction` as **reported, never failed** metrics. A third of the
same kind — a phrase list for the shapes above — is the natural home for this. **Proposed, not
written.**

---

## 3. The machinery — what actually gates what

⚠️ **The KB's `decision` field is NOT the `do` line, and confusing the two is what broke
revision 1.** They are two different strings with two different jobs and two different rules.

| | source | what it is | rendered | gated by |
| --- | --- | --- | --- | --- |
| **`headline`** | KB `decision` | **the verdict** — what the card says | free | `MAX_HEADLINE_WORDS = 12` |
| **`do`** | `docs/do-lines-review.md` | **the physical act** — what you do with your hands | free | `IMPERATIVE_VERBS` + `MAX_DO_WORDS = 14` |

Worked through on one card:

- **headline** — *"Buy the block. Slice it or grate it yourself."*
- **do** — *"Read the bag for potato starch, cellulose and natamycin before buying shreds."*

**The imperative gate governs the `do` line, where an imperative is CORRECT** — it describes a
physical act. It has never touched the headline. **The tone problem lives entirely in the
headline and the depth fields, and none of them is imperative-gated.**

**Measured, running the lint exactly as `counterCardLint.test.js` does:**

```
cards: 83 | per-card violations: []   corpus violations: []
```

**The corpus is clean today and stays clean under a declarative headline.** The register change
is **purely editorial. Zero code changes to the lint.**

> ⚠️ **What revision 1 did wrong, recorded because it is this repo's own named defect.** It
> asserted *"83 of 83 do lines open with an imperative verb — the lint requires it"* from the
> **existence of the rule**, never having run it. **"The rule exists" was measured; "it binds
> this field" was assumed, written down as a measurement, and then used to price the work.**
> Running it took one command and returned the opposite answer.

### 3a — The tone statistics, correctly labelled

Still true, now attached to the right field. These are **headlines**, not do lines:

| | |
| --- | --- |
| Headlines carrying a second clipped sentence | **58 of 83 (70%)** |
| Headlines using the "X, not Y" antithesis | **27 of 83 (33%)** |
| Core prose strings using it | **75 of 415 (18%)** |

📋 **And the corpus already contains the warm voice.** `short_answer` — the one field with no
word cap — reads warm and explanatory on nearly every card. Compression is what produced the
sternness, and §2a is why the answer is *not* to lift the cap.

### 3b — Scope the pass to the free five

The paid boundary decides where this matters most. **Free on every surface: `eyebrow`,
`headline`, `do`, `cart_pick`, `tier_note`.** Everything else is paid depth.

**83 cards × 5 short fields = ~415 strings that every shopper reads**, versus ~29,500 words of
total prose. **The free five are the pass.** The depth fields follow, and they are the easy
half — long-form fields are where warmth is cheap.

---

## 4. The four cards

Chosen to span the range: two dairy, one eggs, one seafood. ⚠️ **No `kind: home` technique card
is in the sample because none exists in the KB** — that class lives only in generated rows and
needs its own sample.

⚠️ **Only the `headline` moves in every case. The `do` lines below are UNCHANGED and correct.**

---

### 4.1 `cheese_real_vs_processed` · dairy · `kristys_standard`

| | |
| --- | --- |
| **headline was** | Buy the block. Slice it or grate it yourself. |
| **headline now** | **Block cheese has nothing added. Shreds carry starch and natamycin.** *(10w)* |
| **do — unchanged** | Read the bag for potato starch, cellulose and natamycin before buying shreds. |

⚠️ **Two rejected drafts on this one card, and they are different errors.** Revision 1's
*"costs less per pound and melts more smoothly"* is §2b — true, and not why the block wins.
Revision 2's *"the least processed of the three"* is §2c — the health frame is now right, and
the sentence still ranks and pronounces instead of stating. **The version above only names what
is in each one.**

**why** — *was:* Real cheese is milk, cultures, salt, enzymes. Shreds add a coating to keep them apart.
**now:** Real cheese is milk, cultures, salt and enzymes. Shreds carry potato starch or cellulose plus natamycin, and process cheese adds emulsifiers on top.

**tier_note** — *was:* What may be called cheese is a standard of identity, and the shred coatings are printed on the bag. Both are checkable.
**now:** What can legally be called cheese is set by a standard of identity, and the coatings are printed on the bag. Both are things you can check yourself.

**kristy_take** — *was:* Buy the block. A grater costs nothing and the cheese melts the way it is supposed to.
**now:** A block keeps longer than shreds once it is opened, and a box grater gets through a week of cheese in a couple of minutes.

---

### 4.2 `egg_feed_claims` · poultry_eggs · `established`

⚠️ **You were right that this is the niche card.** The ladder a shopper needs lives on
`egg_labels`, which already states it correctly. **This card's job is narrower: decode the feed
words.** So its headline should lead with the feed words that matter, not with the one to avoid.

| | |
| --- | --- |
| **headline was** | 'Vegetarian-fed' is the one to walk away from. |
| **headline now** | **Soy-free and corn-free mean exactly that, and both must be printed.** *(11w)* |

📎 **Vegetarian-fed moves down into `watch_out`, where a niche negative belongs.** The verdict
on it is unchanged — it is still a signal the hen stayed inside.

⚠️ **The useful fact is that these words are LITERAL and must be printed**, which is what makes
carton silence meaningless. Revision 2 buried that under a claim about which words matter.

**why** — *was:* Hens are omnivores. That claim and a real pasture claim work against each other.
**now:** Hens are omnivores. A bird with real outdoor access is eating insects and worms, so a vegetarian ration suggests she stayed inside.

**tier_note** — *was:* A feed claim has to be printed to be made, which is exactly why silence on the carton means nothing.
**now:** A feed claim has to be printed to be made, so a carton that says nothing about feed has not made a claim either way.

**kristy_take** — *was:* A hen on real pasture is eating bugs. That claim says she was not.
**now:** The feed words and the space words are separate claims, and the carton that gets both right usually comes from a smaller producer.

---

### 4.3 `egg_labels` · poultry_eggs · `kristys_standard` — **NO CHANGE**

| | |
| --- | --- |
| **headline** | Soy-free and corn-free first, then organic, then pasture-raised. |

**Left exactly as it is.** It is the register the other 82 are being written toward.

---

### 4.4 `a2_vs_a1_milk` · dairy · `kristys_standard`

| | |
| --- | --- |
| **headline was** | A2 milk, and the difference is the breed, not the brand. |
| **headline now** | **A2 milk comes from Jersey, Guernsey and older herds.** *(9w)* |

⚠️ **The old line does not state a call at all — it states a *correction*.** The version above
names the breeds instead, which is the thing a shopper can actually find on a carton.

**why** — *was:* One amino acid apart, and only A1 releases the BCM-7 peptide. Sourcing still outranks it.
**now:** The two milks are one amino acid apart, and only A1 releases the BCM-7 peptide on digestion. How the milk was handled still outranks which protein it carries.

**tier_note** — *was:* The breed genetics and the peptide are established. That A2 is the better carton is Kristy's preference for the older herds, not a finding.
**now:** Barely touched — **this tier note is already the model.** It names the ownership rather than deleting it, which is what the rephrased-not-deleted rule asks for.

**kristy_take** — *was:* The older breeds, and one amino acid is the whole of it. Worth choosing. Not worth choosing first.
**now:** The older breeds are the whole of the difference. Worth having once the herd and the processing are settled.

---

### 4.5 `salmon_wild_vs_farmed` · seafood · `kristys_standard`

| | |
| --- | --- |
| **headline was** | Wild. Farmed is a different fish, fed and penned. |
| **headline now** | **Wild salmon eats krill; farmed eats a plant-oil ration.** *(9w)* |

**why** — *was:* Feed decides the fat, and a penned fish eats what it is given. Wild is the whole-food standard.
**now:** Farmed salmon eats a ration built largely on plant protein and vegetable oil, which leaves it far higher in omega-6. Wild salmon eats krill and small fish.

**tier_note** — *was:* The feed, the added pigment and the pens are documented facts. Holding out for wild on top of them is the standard.
**now:** The feed, the added pigment and the pens are documented. Holding out for wild on top of them is Kristy's standard rather than a finding.

**kristy_take** — *was:* Wild, and frozen wild before fresh farmed. Where wild is not in the case, the tin is.
**now:** Frozen wild is usually cheaper than fresh farmed and it was frozen at its best. When the case has no wild in it, the tinned aisle does.

---

## 5. Risks this sample does not clear

- ⚠️ **`paidBoundary.test.js` fails if any two cards share a tier sentence.** 83 tier notes must
  remain 83 *distinct* sentences, and a bulk rewrite converging on one warm phrasing is exactly
  how that breaks. Run it per batch, not at the end.
- ⚠️ **`counterReach.test.js`** fails if a card stops being findable, lands on another card, or
  is found on title words alone. Headlines are what a tone pass moves.
- ⚠️ **`listMatchProbe.js` exits non-zero on a WRONG match.** Run after every batch.
- ⚠️ **The §2b error has no automated detector.** A card argued from a true-but-irrelevant
  mechanism passes every check and reads fine. **Only reading it against the tier does.**
- ⚠️ **Publishing is a separate act with no push.** `migrateCounterCards.js` writes straight to
  the live `counter_cards` table. **Committed / pushed and migrated / not are independent and
  both need stating.** Nothing here is migrated.

---

## 6. Open, and deliberately not decided here

- ⚠️ **WHERE THE VERDICT LIVES, AND THIS ONE NEEDS A RULING.** Non-negotiable #7 says *"one
  verdict per headline, and the headline states the standard undiluted."* A **fact-first**
  headline delivers the verdict by stating what constitutes it rather than by announcing it —
  *"Block cheese has nothing added"* leaves no doubt what to buy — but the pronouncement moves
  into `cart_pick` and the `do` line. **Either that satisfies #7 or it amends it. It should be
  settled deliberately rather than drift.**

- **The navigation fork.** Does "guided" mean store layout and aisle order, or section order
  only? Real per-store guidance is a different product with a data problem attached.
  **Nothing is proposed.**
- **The generated corpus.** Three generated rows are live; no `kind: home` card exists in the
  KB. That class needs its own sample before `counterGenerate.js` is retuned.
