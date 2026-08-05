import { Router } from 'express';
import { generateReply } from '../lib/chatEngine.js';
import { detectMemoryAction } from '../lib/guestGate.js';
import { clientIp, rateLimited, cartBuildLimited } from '../lib/guestRate.js';
import { generateList } from '../lib/list.js';
import { composeListEdit } from '../lib/listCompose.js';
import { sanitizeList, applyCompose, buildCart, composeOutcome, reconcileSummary } from '../lib/cartEdit.js';
import { attachCards } from '../lib/listMatch.js';
import { readListPhoto } from '../lib/listVision.js';
import { parseListText, specifyImportedItems, importSummary } from '../lib/listImport.js';
import { imageUpload } from '../lib/upload.js';
import { looksLikePerimeterQuestion, looksLikeCounterQuestion, cartCommandMode } from '../lib/chatRouting.js';
import { scoreEntries, publicEntry, NO_ANSWER } from '../lib/perimeter.js';
import { logCounterGap, WEAK_MATCH_CEILING } from '../lib/counterGaps.js';
import {
  GOAL_VALUES,
  FOCUS_VALUES,
  HARD_LINE_VALUES,
  CONSTRAINT_VALUES,
  migrateGoalSet,
} from '../lib/taxonomy.js';

// POST /api/guest/chat — the "try-first" experience. No auth, no Supabase, no
// persistence of any kind. A brand-new visitor talks to the real Kristy (same
// grocery-coach voice via the shared chatEngine) for a few messages, then hits a
// soft sign-in gate. Nothing here can touch the database or another user's data.
//
// Kristy is a grocery coach — no calories, no macros, no logging, ever.

const router = Router();

/* A cart arriving as a multipart text field is a STRING; as JSON it is already an object.
   Both doors of the guest import take a cart in the body, so this normalises before
   sanitizeList sees it. Never throws — an unparseable field is simply no cart. */
function parseListField(v) {
  if (!v) return null;
  if (typeof v !== 'string') return v;
  try {
    return JSON.parse(v);
  } catch {
    return null;
  }
}


/* ───────────────────────── Neutral guest context ─────────────────────────
   Kristy still sounds like herself, but references no stored data — because
   there is none, and no preferences are set yet. This replaces the profile/
   preferences blocks the authed route builds from the database. */
const GUEST_CONTEXT = {
  profileBlock: [
    'This is a brand-new guest trying Kristy for the first time — not signed in.',
    'There is NO saved profile, NO history, and NO goal or preferences on file.',
    'Do not reference any past scans, meals, previous days, or preferences — you have none for this person.',
    'Coach them on exactly what they bring up right now: judge a product, suggest a swap, answer a shopping question, or help them think about what to buy. If it comes up, you can invite them to sign in to set a goal so you can shop with them — but do not force it.',
  ].join('\n'),
  preferencesBlock: 'This guest has not set a goal or preferences yet.',
};

/* ───────────────────────── IP rate limiter ─────────────────────────
   The sliding-window limiter now lives in lib/guestRate.js so guest chat and
   guest verdict (routes/verdict.js) draw from the SAME per-IP budget — a guest
   can't get a fresh pool of free verdicts on top of their free chats. */

router.post('/chat', async (req, res) => {
  const { message, conversationHistory = [] } = req.body || {};

  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'message is required' });
  }

  try {
    // 1. Memory-requiring action? Trip the soft gate instead of answering —
    //    no inference, no cost, doesn't consume the rate limit.
    const memory = detectMemoryAction(message);
    if (memory.gate) {
      return res.json({ gate: true, reason: 'memory', kristyLine: memory.kristyLine });
    }

    // 2. Abuse / cost protection. Over the IP cap → gate with 'limit' so the
    //    client shows the sign-in overlay.
    if (rateLimited(clientIp(req))) {
      return res.json({ gate: true, reason: 'limit' });
    }

    // 3. A COUNTER question is answered from the perimeter KB, not improvised.
    //    /api/chat has done this since Block K; guest chat never did, so a stranger
    //    typing "wild or farmed salmon?" into the composer got the model's own words
    //    where a signed-in user got the sourced entry. The free layer is a
    //    deterministic KB read with no account and no model call, so there is nothing
    //    to gate and nothing to pay for. The entry rides back so the bubble renders
    //    the same reference card as the Counter tab.
    if (looksLikePerimeterQuestion(message)) {
      const scored = scoreEntries(message);
      const matched = scored.map((s) => s.entry);

      // Gated on the STRICT counter test, same as /api/chat: the loose perimeter test
      // exists to make a cheap KB check worthwhile, not to decide what belongs in a
      // shared dataset. A stranger's general chat is never pooled.
      const isCounter = looksLikeCounterQuestion(message);

      if (matched.length) {
        if (isCounter && scored[0].score <= WEAK_MATCH_CEILING) {
          logCounterGap({
            question: message,
            outcome: 'weak',
            topEntryId: scored[0].entry.id,
            topScore: scored[0].score,
          });
        }
        const top = publicEntry(matched[0]);
        // The decision leads here too — same content, same order, whether the
        // question came from an account or a stranger.
        const lead = [top.decision, top.why].filter(Boolean).join(' ');
        return res.json({
          message: lead || top.short_answer || top.detail || NO_ANSWER,
          hasFood: false,
          macros: null,
          foods: [],
          insight: '',
          perimeter: true,
          perimeterEntry: top,
        });
      }

      // Nothing matched, and the question was unmistakably about the counter →
      // the honest miss, not an improvisation. A stranger is exactly who cannot
      // afford a made-up counter answer: it is the first thing they ever see.
      if (isCounter) {
        logCounterGap({ question: message, outcome: 'miss' });
        return res.json({
          message: NO_ANSWER,
          hasFood: false,
          macros: null,
          foods: [],
          insight: '',
          perimeter: true,
          perimeterMiss: true,
          perimeterEntry: null,
        });
      }
    }

    // 4. Real, STATELESS reply — same grocery-coach voice as /api/chat, but with
    //    neutral context and nothing written anywhere.
    const result = await generateReply({
      message,
      conversationHistory,
      contextBlocks: GUEST_CONTEXT,
    });

    return res.json(result);
  } catch (err) {
    // Anthropic / USDA failed. Return a line Kristy could plausibly say so the
    // guest sees a normal chat bubble, not a broken UI. Nothing raw leaks out.
    console.error(
      `[kristy] /api/guest/chat error @ ${new Date().toISOString()}:`,
      err?.message || err
    );
    return res.status(503).json({
      error: true,
      message: 'That did not connect. Try it again in a moment.',
    });
  }
});

/* ═══════════════ POST /api/guest/list — the onboarding payoff cart ═══════════════
   A stranger finishes onboarding and gets a real, tailored, reasoned cart before
   being asked for anything. No auth, no account, nothing written anywhere — the
   cart goes back in the response and the client keeps it in local state.

   This generates at `premium: true` ON PURPOSE — it is the one-time TASTE. Without
   it the focuses/constraints steps of onboarding would shape nothing and the payoff
   would be a bare goal template. What a stranger tastes here is the paid capability:
   focus-aware picks, constraint-tuned specifics (budget buys the whole chicken,
   short-on-time buys the rotisserie). Everything after this first cart runs on the
   normal free line until they start the trial or subscribe.

   ⚠️ Known and accepted: this endpoint hands full-tailoring generation to any
   unauthenticated caller, so a signed-in FREE user could in principle call it
   directly instead of using their own gated /api/list. It is bounded by a per-IP
   ceiling, costs no model call, and writes nothing. Closing it properly would need
   a device/session identity we deliberately don't collect from strangers.

   The request body is the ONLY input here — there is no account to read prefs from
   — so every value is filtered against the taxonomy before it reaches the
   generator. A client cannot invent a goal, a focus, or a constraint. */
const CUSTOM_LINE = /^kb:[a-z0-9_]{1,64}$/;

function sanitizeGuestPrefs(body) {
  const arr = (v) => (Array.isArray(v) ? v.map((x) => String(x || '').trim()).filter(Boolean) : []);
  const uniq = (a) => [...new Set(a)];

  // Goals are a SET (Block S). Retired goals resolve to goal + constraint at read
  // time, exactly as they do for an account.
  const rawGoals = uniq(arr(body?.coach_goals ?? body?.goals));
  const rawConstraints = uniq(arr(body?.constraints));
  const { goals, constraints } = migrateGoalSet({ goals: rawGoals, constraints: rawConstraints });

  return {
    goals: goals.filter((g) => GOAL_VALUES.includes(g)),
    focuses: uniq(arr(body?.focuses)).filter((f) => FOCUS_VALUES.includes(f)),
    // Presets, plus a custom "kb:<ingredient_id>" line from the KB picker.
    nonNegotiables: uniq(arr(body?.non_negotiables ?? body?.nonNegotiables)).filter(
      (h) => HARD_LINE_VALUES.includes(h) || CUSTOM_LINE.test(h)
    ),
    constraints: constraints.filter((c) => CONSTRAINT_VALUES.includes(c)),
  };
}

router.post('/list', (req, res) => {
  try {
    if (cartBuildLimited(clientIp(req))) {
      return res.status(429).json({
        error: 'rate_limited',
        message: "That's a lot of carts in one hour — give it a minute and try again.",
      });
    }

    const prefs = sanitizeGuestPrefs(req.body || {});
    if (!prefs.goals.length) return res.status(400).json({ error: 'goals_required' });

    const list = attachCards(generateList({ ...prefs, premium: true }));
    return res.json({ list, taste: true, prefs });
  } catch (err) {
    console.error(`[kristy] /api/guest/list error @ ${new Date().toISOString()}:`, err?.message || err);
    return res.status(503).json({
      error: true,
      message: 'That cart did not come together. Try again in a moment.',
    });
  }
});

/* ═══════════ POST /api/guest/list/compose — a stranger builds a cart by talking ═══════════
   The cart starts empty and a sentence fills it. That is the whole flow now, which means
   it cannot require an account: gating it would put a sign-in wall in front of the first
   real thing the product does, and a stranger who cannot answer the opening question has
   no product at all.

   Same claim lock as the authed editor, because it is literally the same code: the model
   may only propose grocery NAMES + sections + a one-line summary, and the add/remove is
   applied deterministically here. Nothing is written anywhere; the cart rides back in the
   response and the client keeps it in guest state until they sign in.

   This one DOES make a model call, so it draws on the shared per-IP inference budget
   (the same pool as guest chat) rather than the free deterministic cart-build bucket. */
/* POST /api/guest/list/attach   { list }
   Attach counter cards to a guest's list and hand it straight back.

   CARD ATTACHMENT IS NOT GATED — it is the feature that makes someone want the thing, so a
   stranger gets it in full. But a guest cart lives entirely in localStorage and never
   reaches the server, so the attachment that happens inside POST /api/list for a signed-in
   shopper has nowhere to happen for them. This is that hook, and it is the ONLY thing this
   endpoint does.

   Nothing is stored. Deterministic, no model call, so it costs a KB scan of an in-memory
   array and is not metered — the same posture as the counter's free layer, for the same
   reason. Rate-limited on the shared cart bucket only so it cannot be used to walk the
   corpus; every card it names is already free to read at /api/counter/cards/:slug.

   Unmatched items DO land in the gap log, exactly as a signed-in shopper's do. That table
   holds no identity from anybody, so a guest's "kombucha" is precisely as anonymous as an
   account holder's — and it is the more valuable signal, because this is the surface where
   people arrive with what they actually buy. */
router.post('/list/attach', (req, res) => {
  try {
    if (cartBuildLimited(clientIp(req))) {
      return res.status(429).json({ error: 'rate_limited', message: 'Give it a minute and try again.' });
    }
    const clean = sanitizeList(req.body?.list);
    if (!clean) return res.status(400).json({ error: 'list is required' });
    return res.json({ list: attachCards(clean), guest: true });
  } catch (err) {
    console.error(`[kristy] /api/guest/list/attach error @ ${new Date().toISOString()}:`, err?.message || err);
    // A list with no cards on it is still a list. Never fail the shopper's cart over this.
    return res.status(503).json({ error: true });
  }
});

/* ═══════════ POST /api/guest/list/import — a stranger's OWN written list ═══════════
   The authed twin of this is `/api/list/import`. It existed alone, which meant the photo path
   was unreachable for every real visitor twice over: `GuestApp` never passed `onImport`, and
   even wired up, `importList` posts with a bearer token to a `requireAuth` route.

   Reading a label with vision is free for everyone including guests — it is the acquisition
   hook — and reading a shopping LIST is the same act. Gating it would put a wall in front of
   work the shopper has already done by hand.

   Nothing is stored: the cart rides in and back out in the response, exactly as
   /list/compose does, and lives in guest state until there is an account. Prefs ride in the
   body and are filtered against the taxonomy. It draws on the shared per-IP inference budget
   because it makes a vision call. */
router.post('/list/import', imageUpload.single('image'), async (req, res) => {
  if (rateLimited(clientIp(req))) {
    return res.status(429).json({
      error: true,
      message: 'That is a lot at once. Give it a minute, or sign in to keep going.',
      gate: true,
      reason: 'limit',
    });
  }
  try {
    const rawItems = req.file
      ? (await readListPhoto({ base64: req.file.buffer.toString('base64'), mediaType: req.file.mimetype || 'image/jpeg' })).items
      : parseListText(req.body?.text);

    if (!rawItems.length) {
      return res.json({
        list: null,
        summary: "I couldn't make out a list in that — type it in and I'll take it from there.",
        imported: 0,
        guest: true,
      });
    }

    const prefs = sanitizeGuestPrefs(req.body?.prefs || req.body || {});
    // A guest is not premium, so the constraint-tuned specifics stay off exactly as they do on
    // the authed route. The AUTONOMY guarantees do not depend on premium and apply in full.
    const { items, specified, offers } = specifyImportedItems(rawItems, {
      nonNegotiables: prefs.nonNegotiables,
      constraints: prefs.constraints,
      premium: false,
    });

    /* A MULTIPART FIELD IS A STRING. Found by driving real images at production: the client
       sends the current cart as `form.append('list', JSON.stringify(current))`, multer hands it
       back as text, `sanitizeList` saw a string instead of `{items:[…]}` and returned null — so
       `current` fell back to empty and the import REPLACED the shopper's cart. The route's own
       append guarantee, defeated by the transport. JSON path is unaffected (it arrives parsed),
       which is exactly why only a real multipart request could show this. */
    const current = sanitizeList(parseListField(req.body?.list)) || { goal: null, intro: '', items: [] };
    // `verbatim` only when the shopper TYPED it: a pasted list cannot silently lose a line,
    // so it may claim completeness. A photo may not — see importSummary.
    const summary = importSummary({ items, specified, offers, verbatim: !req.file });
    // APPENDED, never a replacement — an import must not wipe a cart already in progress.
    const merged = { ...current, intro: summary, items: [...current.items, ...items] };

    return res.json({
      list: attachCards(sanitizeList(merged) || merged),
      summary,
      imported: items.length,
      specified,
      guest: true,
    });
  } catch (err) {
    console.error(`[kristy] /api/guest/list/import error @ ${new Date().toISOString()}:`, err?.message || err);
    return res.status(503).json({
      error: true,
      message: "I couldn't read that list just now — try again, or type it in.",
    });
  }
});

router.post('/list/compose', async (req, res) => {
  const instruction = String(req.body?.instruction || '').trim();
  const mode = req.body?.mode === 'edit' ? 'edit' : 'build';
  if (!instruction) return res.status(400).json({ error: 'instruction is required' });

  if (rateLimited(clientIp(req))) {
    return res.status(429).json({
      error: true,
      message: 'That is a lot at once. Give it a minute, or sign in to keep going.',
      gate: true,
      reason: 'limit',
    });
  }

  try {
    // No account to read from, so the prefs ride in the body — and are filtered against
    // the taxonomy before they reach the composer, exactly as /api/guest/list does.
    const prefs = sanitizeGuestPrefs(req.body?.prefs || req.body || {});
    const current = sanitizeList(req.body?.list) || { goal: null, intro: '', items: [] };

    const { add, remove, summary } = await composeListEdit({
      instruction,
      mode,
      currentItems: current.items.map((i) => i.name),
      goal: prefs.goals[0] || null,
      goals: prefs.goals,
      focuses: prefs.focuses,
      hardLines: prefs.nonNegotiables,
      constraints: prefs.constraints,
    });

    // A GUEST'S LIST IS A LIST, so the mode is decided the same way it is for an account:
    // 'build' replaces, and it does not get to replace a cart the stranger already has
    // unless they asked for that. The body still carries a mode — the client's cart hook
    // sends one — but a refinement typed against nine rows must not be routed into a
    // rebuild by the default, which is what emptied a nine-row list in the audit.
    const resolved = mode === 'build' && current.items.length
      ? cartCommandMode(instruction, { hasItems: true })
      : mode;

    const next =
      resolved === 'build'
        ? buildCart(current, add, { goal: prefs.goals[0] || null, summary })
        : applyCompose(current, { add, remove }, { instruction });

    // Same reconciliation as the authed door. Both doors move together or the honesty
    // just relocates to whichever one the shopper did not use.
    const said = reconcileSummary(summary, composeOutcome(current, next, { add, remove }), resolved);

    return res.json({ list: attachCards(sanitizeList(next) || next), summary: said, premium: false, guest: true });
  } catch (err) {
    console.error(`[kristy] /api/guest/list/compose error @ ${new Date().toISOString()}:`, err?.message || err);
    return res.status(503).json({
      error: true,
      message: 'That cart did not come together. Try again in a moment.',
    });
  }
});

export default router;
