# Bilingual labels — the scan path refuses ordinary US packaging

**Status: MEASURED, NOT FIXED. Separately proposed server work.**
Measured 2026-08-26 against `server/lib/scanExtract.js` at `34844d3`.

---

## The finding

`looksNonEnglish()` refuses **8 of 8** real US-market bilingual ingredient panels. Not a
sample that skews — every one, including the plainest possible cases.

| panel | text | verdict |
| --- | --- | --- |
| carbonated water | `CARBONATED WATER (AGUA CARBONATADA), NATURAL FLAVOR (SABOR NATURAL)` | ❌ refused |
| corn tortillas | `CORN (MAIZ), WATER (AGUA), LIME (CAL)` | ❌ refused |
| tomato sauce | `TOMATOES (TOMATES), SALT (SAL), WATER (AGUA), SUGAR (AZUCAR)` | ❌ refused |
| crema | `CULTURED MILK (LECHE CULTIVADA), SALT (SAL)` | ❌ refused |
| vegetable oil | `SOYBEAN OIL (ACEITE DE SOYA)` | ❌ refused |
| rice flour | `RICE FLOUR (HARINA DE ARROZ), WATER (AGUA)` | ❌ refused |
| juice blend | `WATER (AGUA), SUGAR (AZUCAR), CITRIC ACID (ACIDO CITRICO)` | ❌ refused |
| queso fresco | `PASTEURIZED MILK (LECHE PASTEURIZADA), SALT (SAL), ENZYMES (ENZIMAS)` | ❌ refused |

Controls, both correct and both re-run with every measurement above:

- Genuinely foreign panels (French, Spanish, German) — **3 of 3 still refused.** The guard
  has not stopped working.
- Plain English US panels — **2 of 2 read.** Nothing regressed for monolingual labels.

**Refusal means no ingredients, so no card, so no verdict and no stamp.** The shopper gets
nothing. Not a wrong answer — no answer, on packaging that is on every shelf in the country.

## Why it happens

`NON_EN_HINTS` matches a **single** unambiguous foreign food word anywhere in the string.
US dual-language panels are FDA-standard and put the Spanish inside parentheses beside the
English, so `agua`, `leche`, `harina`, `aceite` and `azúcar` all appear **in a label whose
English is right there next to them.** The guard asks "is any foreign word present" when the
question it needs to answer is "**is English absent**".

⚠️ **This is the guard working exactly as written and wrong as designed.** It was authored
against French-market products, where a foreign word present does mean English absent. That
inference holds in the EU and breaks in the US.

## Why this is a launch-scale defect, not a long tail

The App Store listing targets the US. Dual-language packaging is the norm across mainstream
US grocery — the entire Hispanic-market aisle, most tortillas, most Latin dairy, and a large
share of national brands that print bilingual panels nationwide. **This is not an edge case
in the US, it is a section of the store.** And it fails silently, in the direction that
looks like the product simply cannot read: no error names the language, so a shopper
concludes the scanner does not work.

## The fix is NOT written, and the trap is named

⛔ **Do not implement this from this document.** It is server work under
`CLAUDE.md` → *"A server change is separately proposed and separately approved work, with
its own prompt and its own scope"*, and `main` here auto-deploys. What follows is the shape,
recorded so it is not re-derived, not an approval.

**The question to answer is "is English absent", which is not the complement of the question
being asked today.** Two candidate shapes, and the second is not obviously better:

1. **Strip parenthesised translations before testing.** `CORN (MAIZ)` → `CORN`. Handles the
   dominant US format directly and refuses nothing it refuses today: a French panel has no
   parentheses to strip, so it stays refused.
2. **Test for English PRESENCE with its own hint set**, admitting when English food words
   appear in comparable quantity to foreign ones.

⚠️ **THE TRAP, AND IT IS WHY THIS IS NOT A ONE-LINER: STRIPPING PARENTHESES CHANGES WHICH
LANGUAGE SURVIVES, AND A SPANISH-FIRST PANEL INVERTS IT.** `MAIZ (CORN)` strips to `MAIZ` —
still refused, and now refused for a panel whose English was present and has just been
deleted by the fix. So a strip that only *tests* is safe; a strip that decides **what the
engine reads** must extract the English side rather than the outer one. **Getting that
backwards produces a string the KB cannot match, which scores zero concerns, which is a
false `approved` — the exact liability `looksNonEnglish` exists to prevent.**

📎 **`languageConflict` must stay separate either way.** `sameVerdict` is blind across
languages — a foreign list and junk English both match nothing and both score `approved`, so
every cross-language pair agrees. That is a live rule and this work does not touch it.

## Reproducing

The measurement is eight lines against the real export; it needs no database and no model:

```js
import { looksNonEnglish } from './lib/scanExtract.js';
looksNonEnglish('CORN (MAIZ), WATER (AGUA), LIME (CAL)');   // true — the defect
looksNonEnglish('Sucre, huile de palme, farine de ble');    // true — correct
looksNonEnglish('WATER, SUGAR, CITRIC ACID');               // false — correct
```

⚠️ **Whatever lands must re-run all three groups above, not just the failing one.** The
controls are the half of this measurement that says the fix did not simply disable the guard.
