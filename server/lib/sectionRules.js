import { aisleEntries } from './perimeter.js';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const DEFAULT_PATH = fileURLToPath(new URL('./sectionRules.json', import.meta.url));
const SECTIONS = new Set(['produce', 'meat', 'seafood', 'eggs_dairy', 'bulk_pantry', 'frozen']);
const cache = new Map();
const str = (s) => typeof s === 'string' && s.trim() !== '';

// Reads once per path; missing file or bad JSON -> []. Output is exactly {section, rule, checks},
// plus `beyond` (the off-shelf source that beats the store: market, butcher, farm) when authored.
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
      const beyond = str(e.beyond) && e.beyond.trim().split(/\s+/).length <= 14 ? { beyond: e.beyond } : {};
      rules.push({ section: e.section, rule: e.rule, checks: [...e.checks], ...beyond });
    }
  } catch {
    rules = [];
  }
  cache.set(path, rules);
  return rules;
}

// Existing browse section IDs differ from the new aisle IDs. Where an authored aisle
// exists, it owns that section's briefing; the old file supplies only uncovered sections.
const AISLE_SECTION = Object.freeze({
  aisle_produce: 'produce', aisle_meat_eggs: 'meat', aisle_seafood: 'seafood',
  aisle_dairy_alt: 'eggs_dairy', aisle_pantry_bulk: 'bulk_pantry', aisle_frozen: 'frozen',
});

export function loadCounterSectionRules(entries = aisleEntries(), legacy = loadSectionRules()) {
  const rules = new Map(legacy.map((rule) => [rule.section, rule]));
  for (const entry of entries) {
    if (entry.kind !== 'aisle') continue;
    const section = AISLE_SECTION[entry.id] || entry.category;
    rules.set(section, { section, rule: entry.decision, checks: entry.buying_tips || [] });
  }
  return [...rules.values()];
}
