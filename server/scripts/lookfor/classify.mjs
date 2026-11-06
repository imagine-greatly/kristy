// Look-for scope, S0 (handoff lookfor-scope-plan.md). READ-ONLY on the KB.
//   node scripts/lookfor/classify.mjs          (from server/) table + totals + casualties
//   node scripts/lookfor/classify.mjs --json   same data as JSON on stdout
// Always (re)writes scripts/lookfor/out/deletions.patch.json: deletions of off-topic lines
// plus verbatim safety moves, never an add. A proposal; humans confirm tags in S2.
// Tags: healthiest-criterion / storage / taste / freshness-handling / prep-cook / safety-reject / other.
// ponytail: regex tags only (the plan allows it); S3 moves the vocab into counterCardLint.js.
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { nonEmpty } from '../../lib/testGuards.js';

const root = new URL('../../', import.meta.url);
const kb = JSON.parse(readFileSync(new URL('kristy_perimeter_kb.json', root)));
const HOME = new Set(['washing_produce', 'produce_storage', 'baking_soda_soak', 'revive_greens', 'freezing_produce']);
const OFF = ['safety-reject', 'storage', 'prep-cook', 'taste', 'freshness-handling']; // priority when only off-topic hits

// Strong criterion: labels, certs, ingredients, sourcing, grade, ingredient-list avoids.
const CRITERION = /\b(organic|certif\w*|usda|seal|logo|labels?|labell?ed|grass[- ]?(fed|finished)|grain[- ]finished|pasture[- ]?\w*|regenerative|humane|welfare|aga|non-gmo|gmos?|ingredients?|list|added|additives?|solution|enhanced|nitrat\w*|nitrit\w*|phosphates?|preservatives?|seed oils?|canola|soybean|sunflower|safflower|cottonseed|sugars?|sweeteners?|syrup|sodium|antibiotics?|hormones?|wild|farmed|farm-raised|msc|bpa|carrageenan|gums?|starch|dyes?|grade[ds]?|aa|prime|raw|pasteuri\w*|homogeni\w*|a2|cultured|sprouted|whole[- ]grain|stone[- ]ground|cold[- ]pressed|extra virgin|unrefined|uncoated|coat(ed|ing)|wax(ed)?|feed|fed|soy-free|corn-free|forage|feedlot|caught|line-caught|pole-caught|unsweetened|nothing added|single-ingredient|flash-frozen|frozen at|irradiat\w*|sulfites?|unsulfured|origin|country of|species|heirloom|variet(y|ies)|in season|grower|farmers? markets?|farm stand|olive oil|avocado oil|sticker|pack says|claim|msg|liquid smoke|wood[- ]smoked|hydrolyzed|yeast extract|caramel color|hydrogenated|margarine|shortening|lowfat|low-fat|skim|whole milk|(natural|artificial|smoke) flavou?r\w*|flavou?r(ed|ings?)|flavou?r (packets?|powders?))\b/i;
// Label phrases that look like taste words; masked before the off-topic tests.
const MASK = /\b(natural|artificial|smoke|added) flavou?r\w*|\bflavou?r(ed|ings?)\b|\bflavou?r (packets?|powders?)|\btender greens\b/gi;
// Weak criterion: only counts when nothing off-topic fired.
const WEAK = /\b(whole|plain|small|local|alone|short(er|est)?|fewer|glass|canned|frozen|dried|farm|choose|pick|read|skip|compare|look for|oils?|fats?|butter|milkfat|mercury|radiation|stabilizers?|sourdough|soaked|product of|lead|cadmium|tested|test results|bran|hulled|pearled|seals?|colou?r(ing)?|beverage|spring|mineral|cultures?|treated|cream|milk|name[ds]?|box|jar|bag|carton|percent|lists?)\b/i;
const TAGS = {
  'safety-reject': /\b(mold|mould|moldy|slim[ey]|slimy|off[- ](smell|odou?r)|sour smell|odou?r|bulg\w*|dented|leak\w*|crack(s|ed)?|torn|puffed|swollen|ammonia|spoil\w*|rancid|sticky film|visible sprouting|sprouting|tap any open|legs move|claws and legs move|open shells?|\d+ ?°F|kept cold|keeps? (everything )?cold|apart from raw|shrivel\w*|damp|sour)\b/i,
  storage: /\b(stor(e|ed|es|ing|age)|refrigerat\w*|fridge|freez(e|er|ing)|room temperature|on the counter|pantry|airtight|sealed container|shelf life|keeps? (for )?(a |up to )?(\w+ )?(days?|weeks?|months?)|keep (them|it|cut)\b|thaw\w*|in plastic|in a (closed |paper )?bag)\b/i,
  'prep-cook': /\b(cook\w*|roast\w*|bak(e|ed|ing)|toast\w*|grill\w*|sear(ed|ing)?|saut[eé]\w*|boil\w*|blanch\w*|simmer\w*|fry|fries|frying|rinse\w*|wash(ed|ing)?|soak\w*|peel\w*|trim\w*|chop\w*|marinat\w*|at home|in the kitchen|pan|recipe|float test|revives?|gels when chilled|rendered fat|portion it|cutting|boning|grow \w+ at home)\b/i,
  taste: /\b(tastes?|tasting|tasty|flavou?r\w*|tender(ness)?|juic(y|ier|iest)|texture|mild(er)?|bitter|nutty|creamy|delicious|richer)\b/i,
  'freshness-handling': /\b(firm(ness|er|est)?|squeez\w*|press it|springs? back|ripe(ness|ns?|ning|ned)?|unripe|for (its|their) size|heavy|neck|bruis\w*|blemish\w*|wilt\w*|limp|crisp\w*|glossy|shiny|plump|smell\w*|scent(ed)?|aroma|sniff|fragrant|soft spots?|pack date|sell-by|best-by|fresh(er|est|ness)|steaming|under the lamp|thump|hollow|vibrant|dull|well-cured|fading|cuts?,? (and )?bruises|soft|sheen|give|yellow(ing|ed)|flabby|rust-spotted|sticky|packaged on|newest date|past its best|turns over|stem end|bright(ly)?|deep colou?red|moist)\b/i,
};

export function tag(text) {
  const masked = text.replace(MASK, ' ');
  const off = OFF.filter((t) => TAGS[t].test(masked));
  const strong = CRITERION.test(text);
  if (strong && off.length) return { tag: 'other', why: `criterion + ${off.join('+')}` };
  if (strong) return { tag: 'healthiest-criterion', why: 'criterion' };
  if (off.length) return { tag: off[0], why: off.join('+') };
  if (WEAK.test(text)) return { tag: 'healthiest-criterion', why: 'weak criterion' };
  return { tag: 'other', why: 'no hit' };
}

// Test files that pin an exact string.
const testFiles = [
  ...readdirSync(new URL('test/', root), { recursive: true }).filter((f) => f.endsWith('.js')).map((f) => `test/${f}`),
  ...readdirSync(new URL('lib/', root)).filter((f) => f.endsWith('.test.js')).map((f) => `lib/${f}`),
];
const testText = testFiles.map((f) => [f, readFileSync(new URL(f, root), 'utf8')]);
const pins = (s) => testText.filter(([, t]) => t.includes(s)).map(([f]) => f);

const entries = kb.entries.filter((e) => e.kind !== 'pick' && !HOME.has(e.id) && (e.buying_tips || e.pick_steps));
nonEmpty(entries, 'KB entries with buying_tips/pick_steps', 1);
if (!entries.length) process.exit(1);

const rows = [];
for (const e of entries) {
  for (const field of ['buying_tips', 'pick_steps']) {
    for (const text of e[field] || []) rows.push({ id: e.id, kind: e.kind || 'card', family: e.family || e.category || '', field, ...tag(text), text, pinnedBy: pins(text) });
  }
}
nonEmpty(rows, 'look-for rows', 1);

const DELETE = new Set(['storage', 'taste', 'freshness-handling', 'prep-cook']);
const count = (xs, k) => xs.reduce((m, x) => ((m[x[k]] = (m[x[k]] || 0) + 1), m), {});
const perCard = {};
const casualties = [];
const patches = [];
const safetyOverflow = [];
for (const e of entries) {
  const mine = rows.filter((r) => r.id === e.id);
  perCard[e.id] = count(mine, 'tag');
  const watch = Array.isArray(e.watch_out) ? [...e.watch_out] : [];
  for (const field of ['buying_tips', 'pick_steps']) {
    if (!e[field]) continue;
    const fr = mine.filter((r) => r.field === field);
    const offTopic = fr.filter((r) => r.tag !== 'healthiest-criterion');
    const left = fr.length - offTopic.length; // if every non-criterion line came out
    const [lo, hi] = field === 'pick_steps' ? [1, 3] : e.kind === 'aisle' ? [3, 5] : [1, Infinity];
    if (offTopic.length && left < lo) casualties.push({ id: e.id, kind: e.kind || 'card', field, has: fr.length, left, floor: `${lo}-${hi === Infinity ? 'n' : hi}` });
    // Mechanical patch: tagged deletions + verbatim safety moves; never a field that would breach its floor.
    const safety = fr.filter((r) => r.tag === 'safety-reject');
    const remove = fr.filter((r) => DELETE.has(r.tag) || r.tag === 'safety-reject').map((r) => r.text);
    if (!remove.length || fr.length - remove.length < lo) continue;
    const to_watch_out = [];
    for (const r of safety) {
      if (watch.includes(r.text)) continue; // already on the card verbatim
      if (watch.length < 3) { watch.push(r.text); to_watch_out.push(r.text); }
      else { safetyOverflow.push({ id: e.id, field, text: r.text, watch_out: watch.length }); remove.splice(remove.indexOf(r.text), 1); }
    }
    if (remove.length) patches.push({ id: e.id, field, remove, add: [], to_watch_out, evidence: null, first_line_changes: remove.includes(e[field][0]) });
  }
}

const data = {
  entries: entries.length,
  byKind: count(entries.map((e) => ({ k: e.kind || 'card' })), 'k'),
  totals: count(rows, 'tag'),
  totalsByFamily: Object.fromEntries(Object.entries(Object.groupBy(rows, (r) => r.family)).map(([f, rs]) => [f, count(rs, 'tag')])),
  perCard,
  casualties,
  watchOutFull: entries.filter((e) => (e.watch_out || []).length >= 3).map((e) => e.id),
  safetyOverflow,
  rows,
};
mkdirSync(new URL('scripts/lookfor/out/', root), { recursive: true });
writeFileSync(new URL('scripts/lookfor/out/deletions.patch.json', root), JSON.stringify({
  source: 'scripts/lookfor/classify.mjs (S0, regex proposal, unreviewed)',
  format: '{id, field, remove:[exact], add:[], to_watch_out:[exact], evidence:null}; adds none, so no evidence',
  patches,
}, null, 2) + '\n');

if (process.argv.includes('--json')) {
  console.log(JSON.stringify(data, null, 2));
} else {
  for (const r of rows) console.log([r.id, r.family, r.field, r.tag, r.text, r.pinnedBy.join(',')].join('\t'));
  console.log('\nTOTALS', JSON.stringify(data.totals), 'rows', rows.length, 'entries', entries.length, JSON.stringify(data.byKind));
  console.log('BY FAMILY'); for (const [f, c] of Object.entries(data.totalsByFamily)) console.log(`  ${f || '(none)'}\t${JSON.stringify(c)}`);
  console.log(`CASUALTIES (${casualties.length})`); for (const c of casualties) console.log(`  ${c.id}\t${c.field}\t${c.has}->${c.left} (floor ${c.floor})`);
  console.log(`WATCH_OUT FULL (>=3): ${data.watchOutFull.length}`);
  console.log(`SAFETY OVERFLOW (${safetyOverflow.length})`); for (const s of safetyOverflow) console.log(`  ${s.id}\t${s.text}`);
  console.log(`PATCH ROWS ${patches.length}, cards ${new Set(patches.map((p) => p.id)).size}, lines ${patches.reduce((n, p) => n + p.remove.length, 0)}`);
}
