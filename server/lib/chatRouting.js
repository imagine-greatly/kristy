// Pure routing heuristics for the chat pipeline. Kept dependency-free so it's
// unit-testable without booting the express router or the DB client.

// A message that starts with one of these is a command acting ON the list/log,
// not a question to route to the perimeter KB ("add chicken to my list" must not
// get answered as "wild vs farmed").
const LIST_COMMAND = /^\s*(add|put|remove|delete|drop|swap|build|make|take|cross|log)\b/i;

/**
 * Is this message a no-barcode QUESTION worth answering from the perimeter KB?
 * Deliberately conservative — a food STATEMENT ("I had chicken and rice") and a
 * list COMMAND ("add chicken") both return false, so neither is hijacked. The
 * caller still requires an actual KB match before routing, so a false positive
 * here just falls through to the normal coach reply.
 */
export function looksLikePerimeterQuestion(msg) {
  const m = String(msg || '').trim();
  if (!m || LIST_COMMAND.test(m)) return false;
  if (m.includes('?')) return true;
  const lower = m.toLowerCase();
  if (/^(what|which|is|are|do|does|should|how|why|when|where|can|could|would|who)\b/.test(lower)) {
    return true;
  }
  return /\b(worth it|better|vs\.?|versus|difference between|what to look for|which one)\b/.test(lower);
}
