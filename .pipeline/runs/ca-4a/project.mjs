// Offline spec projection; changes imported corpus objects only in this process.
import { readFileSync } from 'node:fs';
import { perimeterKb } from '../../../server/lib/perimeter.js';
import doLines from '../../../server/lib/doLines.json' with { type: 'json' };
const spec = readFileSync(new URL('../../specs/ca-4a.md', import.meta.url), 'utf8');
export const acceptance = spec.split('## Acceptance server/test/acceptance/ca-4a.test.js\n\n```js\n')[1].split('\n```')[0] + '\n';
const start = acceptance.indexOf('const MILK_ID');
const end = acceptance.indexOf("test('C1");
export const before = structuredClone(perimeterKb);
export const data = Function('was', acceptance.slice(start, end) + '\nreturn { MILK_ID, YOG_ID, EGG, EGG_DO, EGG_WATCH_ORDER, EGG_OLD_CHEAP, EGG_CHEAP, EGG_SCIENCE_OLD, EGG_SCIENCE_NEW, EGG_DETAIL_OLD, EGG_DETAIL_NEW, EGG_LABEL, MILK, MILK_DO, MILK_UHT, MILK_LABELS, YOG, YOG_DO, YOG_TIPS, YOG_DETAIL_OLD, YOG_DETAIL_NEW, YOG_SKYR, YOG_LABELS, BUTTER_DO, OTHERS, CHANGED, MINE, MILK_ROWS, TIP };')(id => before.entries.find(e => e.id === id));
export function project() {
  const d = data;
  const now = id => perimeterKb.entries.find(e => e.id === id);
  const e = now('egg_labels');
  Object.assign(e, d.EGG);
  e.watch_out = d.EGG_WATCH_ORDER.map(i => e.watch_out[i]);
  e.labels_decoded.push(d.EGG_LABEL);
  e.buying_tips = e.buying_tips.map(s => s === d.EGG_OLD_CHEAP ? d.EGG_CHEAP : s);
  e.science = e.science.replace(d.EGG_OLD_CHEAP, d.EGG_CHEAP).replace(d.EGG_SCIENCE_OLD, d.EGG_SCIENCE_NEW);
  e.detail = e.detail.replace(d.EGG_DETAIL_OLD, d.EGG_DETAIL_NEW);
  const m = now(d.MILK_ID);
  Object.assign(m, d.MILK);
  m.watch_out.splice(2, 0, d.MILK_UHT);
  m.labels_decoded.push(...d.MILK_LABELS);
  m.aliases.push(...now('pick_milk').aliases.filter(a => !m.aliases.includes(a)), d.MILK.cart_pick);
  const y = now(d.YOG_ID);
  Object.assign(y, d.YOG);
  y.buying_tips = y.buying_tips.map(s => d.YOG_TIPS[s] ?? s);
  y.detail = d.YOG_DETAIL_NEW + y.detail.slice(d.YOG_DETAIL_OLD.length);
  y.labels_decoded = [...y.labels_decoded.map(l => l.term === 'Greek / skyr' ? { ...l, meaning: d.YOG_SKYR } : l), ...d.YOG_LABELS];
  for (const [id, fields] of Object.entries(d.OTHERS)) Object.assign(now(id), fields);
  perimeterKb.entries.splice(perimeterKb.entries.findIndex(e => e.id === 'pick_milk'), 1);
  Object.assign(doLines, { egg_labels: d.EGG_DO, [d.MILK_ID]: d.MILK_DO, [d.YOG_ID]: d.YOG_DO, grassfed_butter: d.BUTTER_DO });
  return { kb: perimeterKb, doLines };
}
