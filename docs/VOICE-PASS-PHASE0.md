# Voice pass — Phase 0: the register, on four real cards

**Status: PROPOSAL. Nothing in the KB is edited. Nothing is migrated.**
This document exists to settle the register on a small sample before ~29,500 words are
rewritten in it. If the voice below is wrong, it is four cards thrown away rather than 83.

---

## 1. Who Kristy is — the frame these cards are written against

**She is not a coach and she is not a list.**

- A **coach** tells you what to do. That is the voice the corpus has today, and it is not a
  writing habit — it is enforced (§3).
- A **list** is the utility. It is how value reaches the shopper, not who she is.

**She is the presence behind everything in the app.** You meet her first and foremost through
the guided list; the other surfaces are other parts of the same guide.

> **The voice rule already models the character, and this is the load-bearing observation.**
> She never says "I" and she is never absent. That grammar — *assumed, not announced* — is not
> merely a style constraint on her sentences. It is what she is, everywhere. No mascot, no
> "Kristy says", no persona announcing itself; and yet no surface that is not hers.

**The architecture that follows:**

| | |
| --- | --- |
| **Kristy** | the guide behind everything — tone, judgment, presence |
| **The guided list** | how you interact with her, first and foremost. The main value. The point every other part converges on |
| **Scan** | stands alone, and feeds the list |
| **The Counter** | stands alone, and is **the bank the list pulls its cards from** |
| **Haul** | reads the trip back and carries it forward |

⚠️ **Converging on the list does not make the other parts subordinate.** Scan is a real
destination for someone holding a box. The Counter is a real destination for someone standing
at a case — *and* it is the reservoir every attached card is drawn from. Both things are true
and the second is why the Counter cannot be demoted to a panel.

---

## 2. The register rule, in one line

> **A presence states what is true. A coach tells you what to do.**

Checkable, because it is grammatical mood, not vibe:

1. **Declarative, not imperative.** State the situation; the action follows from it.
2. **No antithesis as a compression device** — "X, not Y", "the one to walk away from",
   "the difference is A, not B". These are argument shapes. A shopper is not arguing with
   anyone; they are picking a cheese.
3. **No zingers.** `kristy_take` stops being a punchline and becomes the practical aside.
4. **Zero first person — unchanged.** It is the model, not an exception to it.
5. **The call is still made, still first, still unhedged.** Decision-first survives; the
   command does not.
6. **Warmth comes from explaining the shopper's situation**, never from softening the verdict.

⚠️ **What this is NOT.** It is not a licence to hedge. Non-negotiable #7 forbids retreating
from a standard because of budget, stock or time, and that stands untouched. What #7 never
required was that the sentence be curt — *"half the words"* is a concision rule that has been
read as a sternness rule.

📎 **The product's own best line is already in this register:** *"pasture-raised means space,
not feed — the word to find is soy-free."* It explains a label instead of scolding one.

---

## 3. Why the tone is machinery, not writing — measured

| | |
| --- | --- |
| Cards in the KB | **83** |
| Do lines opening with an imperative verb | **83 of 83** — `counterCardLint` *requires* it |
| Do lines carrying a second clipped sentence | **58 of 83 (70%)** |
| Headlines using the "X, not Y" antithesis | **27 of 83 (33%)** |
| Core prose strings using it | **75 of 415 (18%)** |

Three interlocking constraints produce it:

1. **`IMPERATIVE_VERBS`** (`counterCardLint.js:589`) — a 70-word whitelist, and every do line
   must open with one. This is *why* they read as orders.
2. **`MAX_DO_WORDS = 14`, `MAX_HEADLINE_WORDS = 12`.** Do lines run 33–74 chars, median 55.
   You cannot be warm and explanatory in 14 words that must begin with a command verb, so the
   writing compresses into antithesis and two-beat imperative pairs — the only shapes that fit.
3. **`VOICE_SPEC.md`'s "half the words"**, enforced in six model prompts, rewards exactly that
   compression.

⚠️ **THE COROLLARY, AND IT DECIDES THE ORDER OF THE WHOLE PASS: rewriting strings alone will
fail the lint, and `counterGenerate.js` will regenerate the old tone into every new card.**
The order is **rule → lint → prompts → corpus**. This is the repo's own rule arriving again —
*a fold's real anchor may be a PROMPT, not a row.*

📋 **The corpus already contains the warm voice.** `short_answer` — the field with no word cap —
reads warm and explanatory on nearly every card. The stern voice lives exclusively in the
capped fields. That is the diagnosis confirming itself: **compression produced the sternness.**

---

## 4. The four cards

Chosen to span the range: two dairy (one a purchase call, one a "worth it?" call), one eggs
(label-claim reading), one seafood (the counter, the moat). ⚠️ **No `kind: home` technique card
is in the sample because none exists in the KB** — that class lives only in generated rows, and
it needs its own sample before the generated corpus is touched.

---

### 4.1 `cheese_real_vs_processed` · dairy · `kristys_standard`

**decision**
- **was** — Buy the block. Slice it or grate it yourself.
- **now** — Block cheese costs less per pound and melts more smoothly than shreds.

**why**
- **was** — Real cheese is milk, cultures, salt, enzymes. Shreds add a coating to keep them apart.
- **now** — Real cheese is milk, cultures, salt and enzymes. Bagged shreds carry a starch or cellulose coating so they do not clump in the bag.

**tier_note**
- **was** — What may be called cheese is a standard of identity, and the shred coatings are printed on the bag. Both are checkable.
- **now** — What can legally be called cheese is set by a standard of identity, and the shred coatings are printed on the bag. Both are things you can check yourself.

**kristy_take**
- **was** — Buy the block. A grater costs nothing and the cheese melts the way it is supposed to.
- **now** — A box grater gets through a week of cheese in a couple of minutes, and a block keeps longer than shreds once it is opened.

**watch_out[0]**
- **was** — 'Cheese product', 'cheese food' and 'pasteurized process' all mean emulsifiers blended in. That is a different product from cheese.
- **now** — 'Cheese product', 'cheese food' and 'pasteurized process' all mean emulsifiers have been blended in. Those are a different product from cheese, and the name on the front is where it is declared.

---

### 4.2 `egg_feed_claims` · poultry_eggs · `established`

**decision**
- **was** — 'Vegetarian-fed' is the one to walk away from.
- **now** — 'Vegetarian-fed' works against a pasture claim, because hens on grass eat insects.

**why**
- **was** — Hens are omnivores. That claim and a real pasture claim work against each other.
- **now** — Hens are omnivores. A bird with real outdoor access is eating insects and worms, so a vegetarian ration suggests she stayed inside.

**tier_note**
- **was** — A feed claim has to be printed to be made, which is exactly why silence on the carton means nothing.
- **now** — A feed claim has to be printed to be made, so a carton that says nothing about feed has not made a claim either way.

**kristy_take**
- **was** — A hen on real pasture is eating bugs. That claim says she was not.
- **now** — The feed words and the space words are separate claims, and the carton that gets both right usually comes from a smaller producer.

📎 **This is the clearest case in the sample.** The old line scolds a label; the new one
explains what the phrase means and lets the implication land. **The verdict is unchanged** —
vegetarian-fed is still a negative signal.

---

### 4.3 `a2_vs_a1_milk` · dairy · `kristys_standard`

**decision**
- **was** — A2 milk, and the difference is the breed, not the brand.
- **now** — A2 is worth choosing once the rest of the carton is equal.

⚠️ **Note what changed here beyond tone.** The old line does not state a call at all — it
states a *correction*. The new line is the card's actual verdict, and it is **more**
decision-first than what it replaces, not less.

**why**
- **was** — One amino acid apart, and only A1 releases the BCM-7 peptide. Sourcing still outranks it.
- **now** — The two milks are one amino acid apart, and only A1 releases the BCM-7 peptide. How the milk was handled still matters more than which protein it carries.

**tier_note**
- **was** — The breed genetics and the peptide are established. That A2 is the better carton is Kristy's preference for the older herds, not a finding.
- **now** — The breed genetics and the peptide are established. That A2 makes the better carton is Kristy's preference for the older herds rather than a finding.

📎 Barely touched, deliberately — **this tier note is already the model.** It names the
ownership rather than deleting it, which is what the rephrased-not-deleted rule asks for.

**kristy_take**
- **was** — The older breeds, and one amino acid is the whole of it. Worth choosing. Not worth choosing first.
- **now** — The older breeds are the whole of the difference. Worth choosing once the herd and the processing are settled.

---

### 4.4 `salmon_wild_vs_farmed` · seafood · `kristys_standard`

**decision**
- **was** — Wild. Farmed is a different fish, fed and penned.
- **now** — Wild salmon is the one worth buying, and frozen wild counts.

**why**
- **was** — Feed decides the fat, and a penned fish eats what it is given. Wild is the whole-food standard.
- **now** — Farmed salmon eats a formulated ration built largely on plant protein and vegetable oil, which changes the fat it carries. Wild salmon eats krill and small fish.

**tier_note**
- **was** — The feed, the added pigment and the pens are documented facts. Holding out for wild on top of them is the standard.
- **now** — The feed, the added pigment and the pens are documented. Holding out for wild on top of them is Kristy's standard rather than a finding.

**kristy_take**
- **was** — Wild, and frozen wild before fresh farmed. Where wild is not in the case, the tin is.
- **now** — Frozen wild is usually cheaper than fresh farmed and it was frozen at its best. When the case has no wild in it, the tinned aisle does.

---

## 5. What these four cards cost the machinery

Measured against the current lint, so the ruling is priced rather than guessed:

| constraint | today | what the sample needs |
| --- | --- | --- |
| `IMPERATIVE_VERBS` | do line must open with a command verb | **must become optional** — all four new do lines are declarative |
| `MAX_DO_WORDS` | 14 | **11–14 holds.** All four fit. No change needed |
| `MAX_HEADLINE_WORDS` | 12 | unchanged |
| `why` / `kristy_take` | no cap, but written to the clipped house style | the style rule moves; no code change |

⚠️ **Only ONE lint constraint actually has to change**, and that is the imperative gate. The
word caps survive — which is worth knowing, because it means the pass is a rewrite under the
existing budget rather than a widening of it. The clipped voice was never the cap's fault
alone; it was the cap **plus** the mandatory command verb.

---

## 6. Risks this sample does not yet clear

- ⚠️ **`paidBoundary.test.js` fails if any two cards share a tier sentence.** 83 tier notes
  must remain 83 *distinct* sentences, and a bulk rewrite converging on one warm phrasing is
  precisely how that breaks. Run it per batch, not at the end.
- ⚠️ **`counterReach.test.js`** fails if a card stops being findable, lands on another card, or
  is found on title words alone. Titles and headlines are exactly what a tone pass moves.
- ⚠️ **`listMatchProbe.js` exits non-zero on a WRONG match.** Run after every batch.
- ⚠️ **The claim lock and the symmetric no-treatment rule.** Softening is generally the safe
  direction, but neutral phrasing can smuggle in a causal reading that stern phrasing blocked.
- ⚠️ **Publishing is a separate act with no push.** `migrateCounterCards.js` writes the corpus
  straight to the live `counter_cards` table. **Committed / pushed and migrated / not are
  independent states and both need stating.** Nothing here is migrated.

---

## 7. Open, and deliberately not decided here

- **The navigation fork.** Does "guided" mean the app knows store layout and aisle order, or
  section order only? Today it is a fixed perimeter-ish sequence. Real per-store guidance is a
  different product with a data problem attached. **Nothing is proposed.**
- **The generated corpus.** Three generated rows are live and no `kind: home` card exists in
  the KB. That class needs its own sample before `counterGenerate.js` is retuned.
