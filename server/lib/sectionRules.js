import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const DEFAULT_PATH = fileURLToPath(new URL('./sectionRules.json', import.meta.url));
const SECTIONS = new Set(['produce', 'meat', 'seafood', 'eggs_dairy', 'bulk_pantry', 'frozen']);
const cache = new Map();
const str = (s) => typeof s === 'string' && s.trim() !== '';

// Reads once per path; missing file or bad JSON -> []. Output is exactly {section, rule, checks}.
export function loadSectionRules(path = DEFAULT_PATH) {
  if (cache.has(path)) return cache.get(path);
  let rules = [];
  try {
    const raw = JSON.parse(readFileSync(path, 'utf8'));
    const seen = new Set();
    for (const e of Array.isArray(raw) ? raw : []) {
      if (!e || !SECTIONS.has(e.section) || seen.has(e.section) || !str(e.rule)) continue;
      if (!Array.isArray(e.checks) || e.checks.length > 3 || !e.checks.every(str)) continue;
      seen.add(e.section);
      rules.push({ section: e.section, rule: e.rule, checks: [...e.checks] });
    }
  } catch {
    rules = [];
  }
  cache.set(path, rules);
  return rules;
}
