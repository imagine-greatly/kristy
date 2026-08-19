# The account behind `client/public/landing.html`

**`landing.html` is a SERVED PAGE.** It is the front door at `kristyapproved.com`, and anyone —
a visitor, a competitor, App Review following a link — can read its source. The rule that each
file carries its own ruling is good and unchanged **for files nobody outside the project reads**.
It does not apply to this one, for the same reason it stopped applying to `/privacy` and
`/terms` (`docs/LEGAL-PAGE-RULINGS.md`): **nothing in those comments was false; the audience was
wrong, and false is not the test for a served page.**

⛔ **DO NOT WRITE INTERNAL SOURCE PATHS BACK INTO THAT FILE.** Not a repo path, not a component
filename, not a token module, not a design-token identifier. **If a session editing the page
needs to know where a value came from, the pointer in the page is what it needs to find.**

⚠️ **WHAT THE PATHS GAVE AWAY IS NOT THE PATH.** A repo path is not a secret on its own; the
comments printed the **application's internal component map** on a marketing page —
`ScanVerdictCard`, `PerimeterAnswer`, `ListMoment`, `HaulMoment`, the brand-token module and its
export names — which is a structural description of an unreleased iOS product, published for the
convenience of a reader who is not on the project. **The page needs none of it to render.**

📎 **The provenance itself still matters and is why this file exists rather than a deletion.**
The landing page is a hand-built DOM port, so the question *"is this still the brand?"* is real
and has to be answerable. It is answerable **here**.

---

## What the page must keep being true to

- ⚠️ **`Brand/tokens.json` IN `kristy-ios` IS THE BRAND.** The head comment moved below named
  `client/src/lib/tokens.js`, which was accurate when written and is now **a frozen historical
  copy** — see `CLAUDE.md`, *`client/src` — DEAD. FROZEN.* The values in `landing.html` are
  unchanged and still correct; **the source of truth they must be checked against has moved.**
  That drift is a second reason the path did not belong in the page: **a served page cannot be
  corrected without a deploy.**
- **The two type voices are the product's and are not re-picked here.** Inter for everything
  factual / UI / ingredient; **Playfair Display *italic* for Kristy's spoken and coaching
  lines** — the `.voice` class on this page is that voice, and the headline's split is the same
  rule applied to one sentence.
- **The beat visuals are faithful DOM ports of the real components.** They are ports, not
  mockups, and a port that stops matching its original is the drift a mock never had to worry
  about. ⚠️ **Nothing checks this** — there is no guard comparing the page to the components,
  and per `kristy-ios/docs/FINDINGS-FAMILY.md` §1.8n a copy nothing checks is where drift lives.
  **Say so rather than implying the port is pinned.**

---

## Appendix — the comments as they stood, verbatim, before 2026-08-19

Removed from `client/public/landing.html`. Recoverable from git history at the commit that
removed them; kept here so a reader never has to.

**1 — the head of the `<style>` block**

```
       Kristy — grocery-coach landing page.
       Every color + face below is lifted verbatim from the app's locked brand
       tokens (client/src/lib/tokens.js), NOT re-picked. The two type voices are
       the app's: Inter for everything factual/UI/ingredient, Playfair Display
       *italic* (.voice) for Kristy's spoken/coaching lines.
```

**2 — above `.voice`**

```
    /* Kristy's voice — Playfair Display italic. Mirrors `kristyVoice` in tokens.js. */
```

**3 — above the headline rule**

```
    /* The headline IS the two-voice split: the category half factual (Inter), Kristy's
       half in Playfair italic (kristyVoice). */
```

**4 — the VERDICT CARD block**

```
    /* ═════════════════════════════ VERDICT CARD ═════════════════════════════
       A faithful DOM port of client/src/components/ScanVerdictCard.jsx. Same
       tokens, same structure: header · seal|bar · what's-inside · note · swap · ism. */
```

**5 — the COUNTER CARD block**

```
    /* ═════════════════════════════ COUNTER CARD ═════════════════════════════
       A faithful DOM port of client/src/components/PerimeterAnswer.jsx — the answer
       for the half of the store with no barcode. It gets the HERO slot, because the
       unlabeled half is the differentiator and the scan verdict is table stakes. */
```

**6 — the two beat blocks**

```
    /* ── List (Beat 1) — DOM port of ListMoment.jsx ── */
    /* ── Haul (Beat 3) — DOM port of HaulMoment.jsx scorecard ── */
```

---

## What was deliberately NOT removed — RULED, not merely deferred

⚠️ **THE PAGE STILL CARRIES ITS POSITIONING REASONING IN COMMENTS, AND THAT WAS NOT THIS
CHANGE'S SCOPE.** *"the reason to be here"*, *"table stakes and every scanner has one"*, *"the
category is named exactly ONCE on this page"*, *"louder than the scan beat on purpose"*. **This
is marketing strategy, legible to a competitor reading source.** It is a different question from
the source map — it is arguably *fine* on a marketing page, where the argument is the product —
and **it is a judgment for the owner, not a tidy-up.**

✅ **THE OWNER RULED IT 2026-08-19: THE POSITIONING COMMENTS STAY.** The reasoning, which is what
stops it being re-opened: **the positioning is legible off the RENDERED page in about ten seconds
to anyone who cares**, so stripping the comments **buys nothing** while costing the reasoning that
makes the page editable. ⛔ **This section is now a CLOSED ruling. Do not remove them as a side
effect of a later edit, and do not propose it again** — the paragraph above is the argument that
was already heard and answered, not a live question.
