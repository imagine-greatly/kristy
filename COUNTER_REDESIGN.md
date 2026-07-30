# Counter Redesign — Askable, Decision-First, Fast

The audit confirmed: the Counter's problem is HIERARCHY and INTERACTION, not content. The knowledge is deep and good; it's just (1) not askable — you can only browse to it, (2) education-first — topics open with the essay, not the decision, and (3) a hunt — too many taps to the answer. Three coordinated moves fix it, all inversion-and-connection of EXISTING content, no new research. This is the moat made usable. Standing rules: claim lock, no-treatment, VOICE_SPEC (egoless, no first person, no em-dash asides, brief), one commit per block.

The through-line: a shopper at the counter has 10 seconds and one hand. Give the DECISION first, the WHY in one line, the DEPTH on tap — and let them ASK instead of hunt.

---

## BLOCK 1 — Make the Counter askable (the missing core interaction)

```
The audit found the Counter can only be BROWSED, not ASKED — there's no conversational path to a counter answer. This guts the moat: "a coach for the unlabeled store" means you can ask it like a person, and right now you can't. Fix it.

1) THE COMPOSER ANSWERS COUNTER QUESTIONS FROM ANYWHERE. A user typing (or speaking) a counter question — "which cut for stew", "wild or farmed salmon", "is organic worth it for berries", "how do I pick a ripe avocado" — gets the matching Counter answer directly, no browsing. Route these through the existing perimeter KB matcher under the claim lock. This works from the Counter surface AND the cart AND anywhere the composer lives.

2) THE ANSWER IS THE DECISION-FIRST CARD (per Block 2), not a wall of prose and not improvised model text. It returns the same structured answer a browsed topic shows: decision + one-line why + tap-for-depth. Same content whether asked or browsed.

3) HONEST MISS: if no entry matches well, Kristy says so plainly ("No solid read on that one yet") rather than improvising an unsourced answer. Never fabricate a counter answer to fill a gap — the claim lock holds on the ask path exactly as on browse.

4) MAKE ASKING THE PROMINENT PATH. On the Counter surface, the ask affordance ("Ask about any counter — which cut, wild or farmed, what to look for") is at least as prominent as the section browse. Asking is the natural in-store interaction; browsing is the fallback for exploring.

5) GUEST-REACHABLE: counter answers are free (the acquisition/SEO layer), so asking works with no account — verify a logged-out user can ask and get the sourced answer, not a sign-in wall or an improvised reply.

Verify: a typed counter question returns the sourced decision-first answer from anywhere; no-match gives an honest miss, never fabrication; asking is as prominent as browsing on the Counter surface; guests can ask and get real answers.
```

---

## BLOCK 2 — Invert the hierarchy: decision-first, why-second, depth-on-tap

```
The audit found topic pages open with education/background — paragraphs before the actionable call. In-store, nobody reads that. Invert every topic so the DECISION leads and the education is one tap down. Same content, re-ranked. Do NOT delete the depth — demote it.

1) EVERY TOPIC OPENS WITH THE DECISION, in ~1 line, glanceable in 3 seconds:
   - "Wild vs farmed salmon" → "Wild if you can. Farmed's fine in a pinch — skip the darkest fillets."
   - "Which cut for stew" → "Chuck. Marbled, cheap, falls apart slow-cooked."
   - "Organic worth it for berries" → "Yes — thin skin, high residue. Worth it here."
   The decision is the FIRST and LARGEST thing on the topic. Authored per topic (derive from existing short_answer/kristy_take/cart_pick — this is re-ranking, not new content).

2) ONE-LINE WHY, directly under the decision — the teaching, in a phrase, not a paragraph:
   - "Grass-finished means better fat, not just marketing."
   - "Chuck has the connective tissue that melts into the broth."
   This is how the Counter teaches: the reason attached to the fast answer, absorbed over trips, not lectured.

3) DEPTH ON TAP: the full existing content — detail, evidence tier, sources, buying-tips checklist, label-truth — moves BEHIND a "more / how to pick / the full read" tap. It's all still there for the curious or the couch; it's just not the default surface. Progressive disclosure.

4) THE BUYING-TIPS CHECKLIST stays close (it's actionable, not prose) — but as a short scannable "what to look for" list, not buried in paragraphs. Decision → why → checklist → (tap) → full depth.

5) WORD BUDGET: the default topic view (before any tap) should be readable in ~5 seconds — roughly the decision + one-line why + a short checklist. If the default view is more than that, it's still too much.

6) VOICE per VOICE_SPEC: egoless, no first person, no em-dash asides, brief. The decision is a confident call stated as fact.

Verify: every topic opens with a glanceable decision + one-line why, not a paragraph; the deep sourced content is intact but behind a tap; the default view reads in ~5 seconds; the buying-tips checklist is scannable; no content was deleted, only re-ranked; claim lock and tiers intact behind the tap.
```

---

## BLOCK 3 — Shorten the path + connect to the cart

```
The audit found reachability is a hunt — too many taps from "at the counter" to the answer. Shorten it, and make counter answers flow into the cart so the Counter isn't a dead-end reference.

1) FAST PATH TO ANSWER: from opening the Counter, the fewest possible taps to a specific answer. The ask path (Block 1) is the fastest — asking jumps straight to the answer. For browsing, flatten the tree: section → topic → answer should be quick, and common questions should be surfaced/pinned rather than buried.

2) SURFACE COMMON QUESTIONS per section — the handful of things people actually ask at each counter (meat: which cut for X, grass-fed vs finished; fish: wild vs farmed, low-mercury; produce: organic-worth-it, ripeness) as tappable shortcuts, so the frequent answers are one tap, not a hunt.

3) COUNTER ANSWER → CART in one tap: where a topic has a cart_pick, "add to cart" is right there on the decision-first card (already partially built — ensure it's on the new hierarchy). A counter answer should be able to become a cart item immediately.

4) CONTEXT WHERE POSSIBLE: if the user has an active goal/constraints, the counter answer reflects them (budget → the cheaper call; the premium personalized layer). Free users get the universal answer; personalization is the premium layer, consistent with everything else.

Verify: the fewest taps to a counter answer is minimal; common per-section questions are surfaced as shortcuts; a counter answer adds to the cart in one tap; personalization applies where the user has a profile, free universal answer otherwise.
```

---

## Note for Devon

The audit's key finding: the Counter's problem is HIERARCHY and INTERACTION, not content. So this is not a rewrite — it's three re-rankings/connections of what exists:
- Block 1: make it ASKABLE (the missing core interaction — "a coach you can ask," not a book you browse).
- Block 2: DECISION-FIRST hierarchy (the call on top, why in one line, depth on tap — same content, inverted).
- Block 3: SHORT PATH + cart connection (fewest taps, common questions surfaced, answer → cart).

Together they turn the Counter from "a really good reference book buried in the app" into "the tool that makes Kristy a scanner for the whole store." That's the moat, finally usable in the 10-seconds-and-one-hand reality of an actual aisle.

The teaching you want ("we teach you how to shop") happens through Block 2's one-line why — the reason attached to every fast answer, absorbed over trips. Not a lecture; a coach explaining the call as they make it. Depth stays available on tap for the curious.

Buildable now — zero auth, zero billing. This is the highest-leverage build left, and it's exactly what to test in a store the moment it lands.
