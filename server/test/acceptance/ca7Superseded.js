// CA-7 (2026-10-16) rewrote `decision`/`instead` on fifteen eggs_dairy cards. Older acceptance tests pin the
// copy they shipped; they read these two fields as of 9854ae1 and ca-7.test.js owns the new text (its A4 holds
// every other field still).
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const pre = JSON.parse(execFileSync('git', ['show', '9854ae1:server/kristy_perimeter_kb.json'], { cwd: ROOT, maxBuffer: 64 << 20 }).toString());
const IDS = new Set(['whole_vs_reduced_fat_milk', 'raw_milk', 'egg_labels', 'grassfed_butter', 'cheese_real_vs_processed',
  'yogurt_plain_vs_flavored', 'raw_kefir', 'plain_kefir', 'raw_aged_cheese', 'sour_cream', 'cream_cheese',
  'cottage_cheese', 'ice_cream', 'ghee', 'goat_sheep_dairy']);

export const beforeCa7 = (e) => {
  if (!e || !IDS.has(e.id)) return e;
  const p = pre.entries.find((x) => x.id === e.id);
  const { decision, instead, ...rest } = e;
  return { ...rest, decision: p.decision, ...(p.instead === undefined ? {} : { instead: p.instead }) };
};
