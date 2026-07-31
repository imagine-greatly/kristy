// The claim lock, extended to text the model MINTED rather than rephrased.
//
// THE PROBLEM THIS SOLVES, stated honestly. Everywhere else in Kristy the claim lock is
// structural: entries are stripped to a whitelist before the model call, so it can only
// rephrase what it was handed, and a fact it never received cannot be echoed. A GENERATED
// card has no matched entry behind it by definition — generation is what happens when the
// KB has nothing. So the input-side lock does not apply, and the output side has to carry
// the whole weight.
//
// It is therefore a CHECK, not a prompt instruction. The prompt asks; this refuses. A card
// that trips it is DISCARDED, never softened — softening a claim keeps its shape and only
// removes the words that made it auditable.
//
// Scope is deliberately wider than the KB's own guard. A curated entry was written by a
// person who knew the no-treatment rule; a generated one is a model that read the rule in
// a prompt. The bar is what survives without trust.

const str = (s) => String(s ?? '');

/* ═══════════════════════════ The forbidden claims ═══════════════════════════ */

const RULES = [
  {
    id: 'treatment',
    // The no-treatment rule, and it is SYMMETRIC — no food treats anything, and none
    // causes a disease either. The guardrail once forbade curing but not causing, which
    // let "seed oils cause heart disease" through.
    re: /\b(cure[sd]?|curing|heals?|healing|treats?|treating|prevents?|preventing|revers(e|es|ed|ing)|manages?|managing|remed(y|ies)|lowers? (the |your )?risk|reduces? (the |your )?risk|protects? (you )?(from|against)|guards? against|wards? off|fights? off|causes? (cancer|disease|diabet\w*|heart|inflammation))\b/i,
    why: 'a food treating, preventing or causing a condition',
  },
  {
    id: 'detox',
    re: /\b(detox\w*|cleanse[sd]?|cleansing|flush(es|ing)? out|purif\w+|toxins?|toxic load|rid your body)\b/i,
    why: 'detox / toxin framing',
  },
  {
    id: 'dosing',
    re: /\b(\d+\s*(mg|mcg|iu)\b|dosage|daily dose|take \d+|servings? per day|\d+ servings? a day|how much to take)\b/i,
    why: 'a dose',
  },
  {
    id: 'restriction',
    re: /\b(cut out|eliminate|avoid entirely|never eat|stop eating|calorie deficit|intermittent fasting|fasting window|restrict\w* your|meal plan)\b/i,
    why: 'restriction or fasting advice',
  },
  {
    id: 'safety_reassurance',
    // The one that matters most on a raw card. Kristy organizes raw answers around
    // SOURCING and never litigates whether a documented risk is real — telling a
    // pregnant shopper raw milk is "perfectly safe" is the single worst thing this
    // endpoint could emit.
    re: /\b(perfectly safe|completely safe|totally safe|no risk|zero risk|nothing to worry about|safe for everyone|won'?t (make you|get you) sick|myth that it)\b/i,
    why: 'safety reassurance about a real foodborne risk',
  },
  {
    id: 'medical_directive',
    re: /\b(you should (take|stop|start)|consult your|see your doctor about|if you have (diabet|cancer|celiac|crohn)|good for your (heart|liver|gut health|immune)|boosts? (your )?immun\w*)\b/i,
    why: 'a medical directive or a health-benefit claim',
  },
  {
    id: 'price',
    // No price, ever. Relative terms are fine; a number is not.
    re: /(\$\s?\d|\b\d+\s*(dollars|cents|bucks)\b|\bper pound costs?\b|\bcosts? about \d)/i,
    why: 'a price',
  },
  {
    id: 'first_person',
    // VOICE_SPEC, enforced rather than requested. Kristy is a standard, not an assistant
    // narrating helpfulness.
    re: /\b(I'?d|I'?ll|I'?ve|I am|I'?m|let me|my (pick|take|advice|recommendation))\b/,
    why: 'first person',
  },
];

/**
 * Every field of a generated card that a reader will see, as one string.
 * `aliases` and `query_seed` are excluded: they are matching machinery, not prose, and a
 * shopper never reads them.
 */
export function readableText(card) {
  if (!card) return '';
  return [
    card.headline,
    card.do ?? card.do_line,
    card.why,
    card.tier_note,
    card.detail,
    card.kristy_take,
    card.eyebrow,
    card.topic,
    card.cta_item,
    ...(card.look_for || []),
    ...(card.watch_out || []),
    ...(card.labels_decoded || []).map((l) => `${l?.term} ${l?.meaning}`),
  ]
    .filter(Boolean)
    .map(str)
    .join('  ');
}

/**
 * Check a generated card against every forbidden claim.
 *
 * @returns {Array<{code:string, detail:string}>} empty when the card is clean.
 */
export function claimLockViolations(card) {
  const text = readableText(card);
  const out = [];
  for (const rule of RULES) {
    const hit = text.match(rule.re);
    if (hit) {
      out.push({
        code: `CLAIM_${rule.id.toUpperCase()}`,
        detail: `${rule.why} — "${hit[0]}"`,
      });
    }
  }
  return out;
}

export const CLAIM_RULE_IDS = RULES.map((r) => r.id);
