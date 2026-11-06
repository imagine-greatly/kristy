// Look-for scope, S0 (handoff lookfor-scope-plan.md). READ-ONLY on the KB.
//   node scripts/lookfor/classify.mjs          (from server/) table + totals + casualties
//   node scripts/lookfor/classify.mjs --json   same data as JSON on stdout
// --write-patch (re)writes scripts/lookfor/out/deletions.patch.json (run it on the pre-pass KB, 4facbd4^): deletions of off-topic lines
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

// S2c audit (Devon's rule: Look for = labels, certs, ingredients, sourcing, grade, form). Exact lines the regex
// mis-tags, fixed by hand: healthiest-criterion = a real criterion the regex called off-topic (stays on the card);
// any other tag = a line the regex called safety-reject that is not a safety fact (deleted, never moved to watch_out).
const OVERRIDE = new Map([
  ["organic_worth_it_by_type\tResidue sits on the skin, so a peel you throw away takes it with it.", "healthiest-criterion"],
  ["produce_seasonality\tWinter: citrus, cabbage, kale, leeks, beets, parsnips, storage onions and potatoes.", "healthiest-criterion"],
  ["butcher_counter_asking\tAsk for bones and trim, and which farm the bones came from.", "healthiest-criterion"],
  ["deli_meat_uncured\tPick whole roasted meat first, then counter-sliced meat before the prepacked tub.", "healthiest-criterion"],
  ["cream_vs_creamer\tCheck the fat: heavy cream is 36% milkfat or more, half-and-half 10.5 to 18%. Both are fixed by law.", "healthiest-criterion"],
  ["cream_vs_creamer\tRead the milkfat: heavy cream is 36% or more, half-and-half 10.5 to 18%.", "healthiest-criterion"],
  ["bulk_bins_buying\tBuy nuts, seeds and flour in sealed packages; their oil goes rancid in an open bin.", "healthiest-criterion"],
  ["olive_oil_grades\tPick dark glass or tin, and store it away from the stove.", "healthiest-criterion"],
  ["label_wild_vs_farm_raised\tCooked and breaded seafood falls outside the labeling rule.", "healthiest-criterion"],
  ["raw_kefir\tTake it from the refrigerated case; shelf-stable kefir’s cultures are no longer live.", "healthiest-criterion"],
  ["produce_brassicas\tFlorets and leaves are eaten whole, with no peel to take surface residue away.", "healthiest-criterion"],
  ["breakfast_cereal\tLook for plain rolled oats to soak overnight and cook in the morning.", "healthiest-criterion"],
  ["breakfast_cereal\tFlakes, puffs and O’s are extruded, pushed through a machine; soaked, cooked oats are the traditional bowl.", "healthiest-criterion"],
  ["breakfast_cereal\tPick oats to soak and cook over a boxed cereal.", "healthiest-criterion"],
  ["venison_game\tAsk whether the processor handles each animal one at a time and keeps everything cold.", "healthiest-criterion"],
  ["crab\tCan’t find live: whole cooked crab with bright orange to red shells. Picked meat in a tub comes after that.", "healthiest-criterion"],
  ["muesli\tCheck whether the bag says ‘toasted’.", "healthiest-criterion"],
  ["muesli\tCheck whether the bag says toasted; toasted or sweetened sits closer to granola.", "healthiest-criterion"],
  ["sour_cream\tCan’t find cream-and-cultures sour cream: plain whole-milk yogurt.", "healthiest-criterion"],
  ["kombucha\tPick plain kombucha in glass from the refrigerated case.", "healthiest-criterion"],
  ["fermented_pickles\tPick unheated, salt-brined pickles from the refrigerated case.", "healthiest-criterion"],
  ["fermented_pickles\tPick from the refrigerated case, but refrigerated alone does not mean fermented.", "healthiest-criterion"],
  ["broth\tPick frozen, refrigerated or jarred over a shelf-stable boxed broth.", "healthiest-criterion"],
  ["salt\tLook for how it was harvested and washed or filtered, on the package or the maker’s site.", "healthiest-criterion"],
  ["salt\tLook for gray, pink or beige crystals, not bright white.", "healthiest-criterion"],
  ["seeds\tPick flax whole and grind it at home.", "healthiest-criterion"],
  ["seeds\tPick flax whole to grind at home, or ground and sealed.", "healthiest-criterion"],
  ["tortilla_chips\tMasa is corn cooked in lime and ground into dough; plain cornmeal cannot form one.", "healthiest-criterion"],
  ["potato_chips\tSkip stacked crisps in identical shapes; they are pressed from dried potato flakes and cornstarch.", "healthiest-criterion"],
  ["potato_chips\tRead “potato crisps” or “made from dried potatoes” as a possible pressed product.", "healthiest-criterion"],
  ["popcorn\tBuy plain kernels to pop at home in coconut oil, butter or tallow.", "healthiest-criterion"],
  ["snacks\tPick nuts, fruit, cheese or soaked trail mix before a packaged snack.", "healthiest-criterion"],
  ["deli\tAsk the counter to slice from a whole roast, not meat pressed into a loaf.", "healthiest-criterion"],
  ["frozen_fries\tHash browns at home take potatoes, oil, salt and pepper; a bag lists anything more.", "healthiest-criterion"],
  ["frozen_nuggets\tSkip “Chopped and Formed” by the name: the meat was chopped and pressed into shape.", "healthiest-criterion"],
  ["frozen_nuggets\t“Nugget-Shaped” in the name marks chopped meat that may hold binders, extenders or water.", "healthiest-criterion"],
  ["cornmeal_polenta_grits\tSkip quick-cooking and instant grits and polenta.", "healthiest-criterion"],
  ["wild_rice\tSkip quick-cooking rice mixes, and pick sealed bags over bins.", "healthiest-criterion"],
  ["salad_dressing\tLook in the refrigerated section; some of the shortest lists live there.", "healthiest-criterion"],
  ["fam_actual_ice_cream\tPick a pint that feels heavy for its size; a light one is mostly whipped-in air.", "healthiest-criterion"],
  ["fam_unheated_refrigerated_ferments\tCheck for ‘keep refrigerated’; a cold shelf alone does not mean it is live.", "healthiest-criterion"],
  ["aisle_ferments\tCheck for ‘keep refrigerated’ and follow the jar’s storage directions.", "healthiest-criterion"],
  ["fam_whole_grain_sourdough\tAsk the store bakery whether the loaf rises on starter alone.", "healthiest-criterion"],
  ["fam_masa_foods\tRead for ‘nixtamalized’ or ‘corn treated with lime’: corn soaked in limewater.", "healthiest-criterion"],
  ["fam_dry_packed_scallops\tAsk the fish counter whether the scallops are dry or wet-packed (soaked).", "healthiest-criterion"],
  ["produce_mushrooms\tMoisture is what spoils mushrooms, so a dry, firm cap is the fresh one.", "freshness-handling"],
  ["produce_bananas\tKeep green bananas out of the fridge. Cold below 56°F can stop them ripening.", "storage"],
  ["produce_green_beans\tPick smooth, slender pods with no seeds bulging through.", "freshness-handling"],
  ["bison\tExpect deeper red than beef, and bag the package separately for leaks.", "freshness-handling"],
  ["crab\tAsk for whole crab, or cracked and cleaned, and keep the yellow butter inside.", "prep-cook"],
  ["frozen_fries\tFrom an oven recipe, lower the air fryer heat 25 to 30°F and the time by 20%.", "prep-cook"],
  ["frozen\tCheck the case: food at 0°F or below keeps color, flavor and texture. Soft ice cream means it runs warm.", "storage"],
  ["cornmeal_polenta_grits\tAt home, soak it in water with a splash of something sour before cooking.", "prep-cook"],
  ["split_peas\tSoak about seven hours in warm water with a splash of something sour, then cook long.", "prep-cook"],
  ["produce_grapes\tCheck for plump grapes with no bruised, cut or torn skin.", "freshness-handling"],
  ["aisle_seafood\tPick fish on a thick bed of ice that smells mild, not fishy or sour.", "freshness-handling"],
  ["bulk_bins_buying\tSmell it before it goes in the cart. Rancid reads as paint, crayon or bitter.", "freshness-handling"],
  ["produce_green_beans\tBulging seeds mean an older bean, turning tough, stringy and starchy.", "freshness-handling"],
  ["bulk_bins_buying\tSmell before bagging; crayons, putty or wet cardboard means rancid.", "freshness-handling"],
]);

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
    for (const text of e[field] || []) rows.push({ id: e.id, kind: e.kind || 'card', family: e.family || e.category || '', field, ...(OVERRIDE.has(`${e.id}\t${text}`) ? { tag: OVERRIDE.get(`${e.id}\t${text}`), why: 'S2c override' } : tag(text)), text, pinnedBy: pins(text) });
  }
}
nonEmpty(rows, 'look-for rows', 1);
// A stale override (line edited or gone) must not pass silently; on the applied KB, kept lines still match and deleted ones do not.
const unused = [...OVERRIDE.keys()].filter((k) => !rows.some((r) => `${r.id}\t${r.text}` === k));
if (process.argv.includes('--write-patch') && unused.length) { console.error(`OVERRIDE lines not on the KB (${unused.length}):\n  ${unused.join('\n  ')}`); process.exit(1); }

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
// The patch is a pass-base artifact: write it only on request, so a report run on the applied KB cannot clobber it.
if (process.argv.includes('--write-patch')) mkdirSync(new URL('scripts/lookfor/out/', root), { recursive: true }), writeFileSync(new URL('scripts/lookfor/out/deletions.patch.json', root), JSON.stringify({
  source: 'scripts/lookfor/classify.mjs (S0 regex proposal, S2c OVERRIDE applied)',
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
