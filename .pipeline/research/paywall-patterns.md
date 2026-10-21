# Paywall patterns for the Kristy wall (research, 2026-10-21)

Evidence grading: M = measured number in a fetched source. V = vendor/case-study claim. C = commentary or description only.
Honest gaps up front:
- Duolingo, Headspace, Spotify, Tinder/Bumble, Notion/Things, Fitbod, Yuka: no usable fetched teardown found. Not claimed below.
- Calm's screensdesign page rendered only a caption; its details are not claimed.
- Apple HIG pages (typography, in-app-purchase) fetched as title only. Large-text guidance in (d) is paraphrase, not verified quotes.
- No source found describing how any named top app behaves at AX Dynamic Type sizes.

## (a) Recurring patterns

1. Headline is the outcome or the plan, not "Choose your plan". Runna opens by naming the personalized plan; Adapty's reviewer of Fender recommends a core-benefit headline over "Choose your plan". Sources: https://screensdesign.com/articles/mobile-app-paywall-design-examples-2026/ , https://adapty.io/blog/paywall-newsletter-18/ (C).
2. Short value stack, action-verb benefits with icons. MyFitnessPal (long, icon-rich), ChatOn AI (short, led by "UNLIMITED CHAT MESSAGES"), ClassDojo. Superwall frames 3 vs 6 benefits as a test to run, no result. Screensdesign: long checklists flatten the important outcomes into minor ones; list should match the selected plan. https://api.superwall.me/blog/5-paywall-patterns-used-by-million-dollar-apps , https://screensdesign.com/articles/mobile-app-paywall-benefit-list-examples/ (C).
3. Two plans, annual preselected and visually larger, monthly equivalent shown big. Anchor-and-decoy: MacroFactor, Calm, SCRL. Quizlet, Runna, Bend, Fender: annual + monthly. Fits A/B: visual hierarchy (normalized yearly price, "Most Popular", larger annual card) drove the win, more than the toggle. https://api.superwall.me/blog/5-paywall-patterns-used-by-million-dollar-apps , https://www.revenuecat.com/blog/growth/rip-toggle-paywall.md (M for Fits ARPU +19% on a toggle paywall; hierarchy was the driver).
4. Trial timeline / "soft commitment". Strava (day 1, day 28, day 30), Cal AI ("No Payment Due Now" + reminder promise), Lose It! (whole paywall explains the trial), Adobe Express (leads with timeline), BoldVoice (charge date + schedule reminder), Owll (3-day timeline), ParrotPal (3-step). Blinkist: plain trial explanation + reminder 2 days before end. https://api.superwall.me/blog/5-paywall-patterns-used-by-million-dollar-apps , screensdesign examples URL above, Blinkist https://b2bpricinginsights.substack.com/p/4-min-read-how-blinkists-new-paywall
5. Single page, plans visible together. Stompers beat a multi-page flow (value, then trial reminder, then price) with one page showing value, features and both prices. https://superwall.com/case-studies/stompers
6. One CTA, stated in trial terms. Fender: "Try free and subscribe" (annual) vs "Select this plan". Quizlet: trial dates + subscribe button. Cal AI: "No Payment Due Now" beside the button. Keeper's unclear CTA was flagged. Sources: Adapty newsletter 18, screensdesign (C).
7. Social proof, specific numbers. Flo (testimonial), YAZIO (testimonials + stars), Speak ("over 5 million users", 4.8 stars from 140,000+ reviews), Hevy, Studley, BitePal. Superwall guidance: specific numbers beat vague. Adapty praised a paywall with 9 proof points. Superwall 5-patterns URL (C).
8. Close button: present, quiet. Hard-paywall apps hide it; others keep a small X. Bend and Pushscroll show a second, discounted "one-time offer" after dismissal (Captions, Finch, YAZIO use urgency too). Screensdesign examples URL (C). Note: no source measured the effect of close-button size.
9. Legal footer at the bottom, small: Restore, Terms, Privacy, renewal sentence. Adobe Express puts legal terms last; Owll and Bend show a restore link. Screensdesign examples URL (C).
10. Plan feature comparison only when there is a free tier: Hevy and Keeper use a Free vs Pro table. Kristy counter is free, so a table adds words. (C)
11. Trial toggle ("Enable free trial") is now an App Review risk. Since mid-Jan 2026 developers report 3.1.2 rejections; Flo replaced its toggle with a named 14-day trial plan. Do not use. https://www.revenuecat.com/blog/growth/rip-toggle-paywall.md (C, reports of rejections).
12. Word count: not measured by any source found. Evidence is indirect: Stompers single page beats multi-step; vendors rank trial clarity above benefit count. Treat 40-60 visible words at default size as an inference, not a sourced figure.

## (b) What converts (measured)
- Hard paywall median Day-35 trial-to-paid 10.7% vs 2.1% freemium; year-1 retention 27% vs 28%; revenue per install at day 60 $3.09 vs $0.38. https://www.revenuecat.com/blog/growth/subscription-app-trends-benchmarks-2026.md (M). Kristy's counter is free by Ruling F, so this is context only.
- Trials 17-32 days: 42.5% median conversion; under 4 days: 25.5%. Same URL (M). Kristy trial is one week.
- 55.4% of 3-day-trial cancellations happen on Day 0; 84% by Day 1. Same URL (M). Implication: say plainly when billing happens.
- Stompers: single page +16% overall conversion, more annual trials (V; no sample size). https://superwall.com/case-studies/stompers
- Blinkist: timeline + reminder moved notification opt-in 6% to 74%, trial sign-ups +23%, complaints -55% (V, no sample size or period). Blinkist URL above.
- Cal AI: 123 experiments, +31% trial-to-paid over 12 months, 87% of new users see a paywall, 57% of viewers start a transaction (V). https://superwall.com/case-studies/cal-ai
- Fits: toggle paywall +19% ARPU, driven by visual hierarchy (M, via RevenueCat post).
- RevenueCat "animations +12-18%": no sample size, no source; do not rely. https://www.revenuecat.com/blog/growth/paywall-conversion-boosters.md

## (c) Apple-required elements
From https://developer.apple.com/app-store/subscriptions/ (fetched):
- Subscription name, duration, and what the user gets.
- Full renewal price, clear and prominent, localized.
- A way for existing subscribers to sign in or restore purchases.
- Links to Terms of Use and Privacy Policy in the app and in App Store metadata.
- The billed amount must be the most prominent pricing element (annual shows the total billed).
- Free trial: state how long it lasts and the price billed afterward.
From https://developer.apple.com/app-store/review/guidelines/ 3.1.2(c): "clearly describe what the user will get for the price"; 3.1.2(a): at least 7 days, works on all devices; 3.1.1: restore mechanism.
Consequence for Kristy: the annual card shows $44.99 largest; "$3.75 a month" must be smaller than it.

## (d) Large-text behaviour
- No fetched source shows how Duolingo, Calm, etc. behave at AX sizes. Not claimed.
- RevenueCat legacy paywalls: default font is system and scales; custom-font providers are separate; a community thread (Apr 2026) reports the paywall looks broken at largest sizes and staff plan a setting to disable scaling. RevenueCat example wraps content in a ScrollView with a `.paywallFooter()`. https://community.revenuecat.com/general-questions-7/disable-control-the-paywall-dynamictypesize-values-in-ios-7632 , https://www.revenuecat.com/docs/tools/paywalls-legacy/displaying-paywalls (C).
- Apple guidance (paraphrase, HIG page returned title only): use text styles, wrap rather than truncate, stack instead of side-by-side at accessibility sizes (`dynamicTypeSize.isAccessibilitySize` + AnyLayout), allow scrolling.
- Design inference for Kristy: at AX sizes drop the card fan and benefits, stack plans vertically, keep price + CTA + legal in the scroll, never truncate price.

## (e) The current Kristy wall
- Path: /Users/m1/kristy-ios/Kristy/Surfaces/Membership/UpgradeScreen.swift (319 lines). Related: TrialDoor.swift (168), Auth/CardFan.swift (81), Auth/SignInControl.swift (233), Core/Pricing.swift.
- Structure top to bottom: "Not now" text button, CardFan (scaled 0.72, fixed 190pt height), eyebrow, headline, sub, two side-by-side plan tiles (HStack), action (guest: SignInControl Apple/Google/email; signed-in: "Subscribe for $X"), fine print (2 lines + Restore/Terms/Privacy), then TrialDoor (explanation + "Start the free week").
- Visible word count, signed-in free user, settings entry (my count from source strings, price values counted as one word): about 70. Not now 2; eyebrow 1; headline 6; sub 15; yearly tile ~9 (Yearly, price, "$3.75 a month, billed yearly", "Save 35%"); monthly tile 4; Subscribe 3; fine print "Then the App Store confirms $X." 6 + "Renews until canceled in Settings." 5 + Restore/Terms/Privacy 3; TrialDoor 12 + 4. Guest adds sign-in button labels. Entry variants (tripTwo, shopMode, scan, counter) swap eyebrow/headline/sub.
- Large-text risks in code: plan tiles are a fixed HStack with the badge and note inside each tile (no accessibility-size branch; grep found no dynamicTypeSize or ViewThatFits in this file); the fan has a fixed 190pt height and is hidden from accessibility but still takes space; the trial is a separate block below the legal text, far from the CTA.
- What to cut: the sub (15 words, repeats the headline); the "Then the App Store confirms" line (redundant with button price; Apple needs the price on the button, not this sentence); the monthly tile note "Cancel anytime" if the footer says it once; the fan at AX sizes; the separate TrialDoor block (fold into the timeline); the eyebrow if Devon keeps it only for entry context.
- Trial conflict to flag: the trial is granted by a separate "Start the free week" server call (POST /api/subscription/trial), not by an App Store intro offer. The Subscribe button's price copy and a free week are two separate paths; a timeline claiming "billed day 7" is only true if the StoreKit product carries an introductory offer. Unverified in this research; check before writing timeline copy.

## (f) Layouts

### Baseline: today (signed-in free, default type)
```
                 Not now
   [   fan of 3 counter cards, 190pt   ]
            SHOP MODE
   Shop every trip in store order.
   Membership runs shop mode: the list in
   store order, each card on its row.
  +------------------+ +------------------+
  | Yearly           | | Monthly          |
  | $44.99           | | $6.99            |
  | $3.75 a month,   | | Cancel anytime   |
  | billed yearly    | |                  |
  | Save 35%         | |                  |
  +------------------+ +------------------+
      [ Subscribe for $44.99 ]
   Then the App Store confirms $44.99.
   Renews until canceled in Settings.
   Restore . Terms . Privacy
   The free week comes once per account...
      [ Start the free week ]
```
~70 words; at AX sizes the tiles squeeze side by side and CTA falls far below the fold.

### A: Headline + plan stack + sticky CTA (Recommended)
Matches patterns 1, 3, 5, 6, 9. Cuts to ~35 words.
```
                                  X
      [ one real counter card, top ]
   Shop every trip in store order.        <- headline only
   (o) Yearly   $44.99 / year   BEST VALUE   <- selected, largest
       $3.75 a month
   ( ) Monthly  $6.99 / month
   ------------- sticky bottom ---------------
   [ Start free week ]   (or Continue with Apple / Google for guests)
   Then $44.99 a year. Cancel anytime.
   Restore . Terms . Privacy
```
Why recommended: one screen, annual hierarchy, price billed is the most prominent pricing element (Apple), trial terms on the button's caption, plans are vertical rows so they survive AX sizes without branching; only the card and benefits drop. Needs the trial-vs-StoreKit check above.

### B: Trial timeline wall (Strava / Cal AI / Blinkist style)
```
                                  X
   Try shop mode free for a week.
   Today      Shop mode opens
   Day 5      Reminder before billing
   Day 7      $44.99 a year, cancel before
   (o) Yearly $44.99   ( ) Monthly $6.99
   [ Start free week ]   No payment due now
   Restore . Terms . Privacy
```
~45 words. Strongest on trial clarity (Day 0 cancel data), but the timeline is false unless the product has a real intro offer and a real day-5 reminder is scheduled.

### C: Card-led with three benefits
```
                                  X
   [ fan of cards ]        (hidden at AX sizes)
   Shop every trip in store order.
   . List in store order   . Each card on its row
   . Read against your goal
   [ Yearly $44.99 ] [ Monthly $6.99 ]
   [ Subscribe for $44.99 ]
   Renews until canceled. Restore . Terms . Privacy
```
~55 words. Closest to today and to Direction D's "real cards are the picture", but keeps side-by-side tiles and benefit text, the two things that break at large sizes.

## Constraints to carry into the build
- Every figure is the store's (Pricing.swift rule); no hardcoded prices; no toggle for the trial; voice has no "I" or "she"; paper and Fraunces; one primary action (`onePrimaryActionAtMost`).
- Test at AX3 and AX5 plus 393x852 with the CTA reachable without scrolling past the legal text.
