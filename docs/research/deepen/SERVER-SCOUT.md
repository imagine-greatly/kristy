# Server scout: family / aisle KB extension

Read-only inspection, 2026-10-23. Only this report written; no tests, migration, database calls, or npm commands run.
Paths below are relative to `/Users/m1/kristy`; iOS paths are relative to `/Users/m1/kristy-ios`.
“Proposed” means a change to implement, not behavior already present.

**Observed KB and wire shapes**
- `server/kristy_perimeter_kb.json:1`: object with `schema_version`, `brand`, `purpose`, `evidence_tiers`, `no_answer`, `entries`.
- Current inventory: 243 entries; 205 omit `kind`, 38 have `kind: 'pick'`; none have `family` or `delta`.
- Sample card `salmon_wild_vs_farmed`, `server/kristy_perimeter_kb.json:14`: `id,title,aliases[],category,question,decision,why,short_answer,detail,evidence_tier,sources[],kristy_take,instead,cart_pick,buying_tips[],watch_out[],pick_steps[],science,labels_decoded[],tier_note,eyebrow_short,asked_as[]`.
- Sample pick `pick_canned_tomatoes`, `server/kristy_perimeter_kb.json:6071`: `id,kind,title,category,aliases[],decision,sources[],avoid`. Sources can be strings or `{name,url}` objects; label rows use `{term,meaning}`.
- KB entry kinds and card wire kinds differ: `kindFor(slug)`, `server/lib/counterCards.js:75`, derives `home`/`shelf` by ID; `projectEntry()`, `server/lib/counterCards.js:391`, renames `id→slug`, `decision→headline`, `evidence_tier→tier`, `cart_pick→cta_item`.

**Recommended contract and storage boundary**
- Keep new `family`/`aisle` entries in the authored KB, outside ordinary question-card projection and `counter_cards`. Serve them through dedicated typed responses; existing item cards retain `shelf`/`home`.
- Proposed existing-card fields: `family?: string` referencing a `fam_*` entry; `delta?: string` containing the item exception. Missing/null means absent; a delta requires a family. The local `FAMILIES.md:7` proposes at most 12 words.
- Proposed family entry reuses `id,kind:'family',title,category,decision` for identity and the free one-line rule; existing depth field names carry its paid explanation. Derive members from card `family` references instead of maintaining two membership lists.
- Proposed aisle entry uses `id,kind:'aisle',title,category,decision,buying_tips[]` for its free briefing; no matchable aliases required. IDs and multi-aisle navigation mapping need an explicit convention.
- Alternative, if these entries must become table rows: widen the kind CHECK at `supabase/counter_cards.sql:32`, add kind-aware projection instead of `kindFor()`, split migration/renderable pools from question pools, and define headline/topic/do/tier behavior. Adding `kind` to a whitelist alone cannot accomplish that.

**Patch whitelist and validation changes**
- Top-level `FIELDS` (no named function), `server/scripts/applyCardPatches.js:10`: add `kind`, `family`, `delta`; validate allowed kind values and prevent arbitrary conversion of existing entries.
- Top-level new-entry loop, `server/scripts/applyCardPatches.js:22`: replace unconditional `title,aliases,category,decision` requirements with kind-specific requirements; family/aisle navigation must not acquire aliases just to pass this check.
- Existing picks are rejected before update at `server/scripts/applyCardPatches.js:19`; decide deliberately whether that restriction stays. Map keys already supply new IDs at line 23; do not add patchable `id`.
- `lintCard()`, `server/lib/counterCardLint.js:1011`: currently dispatches only `pick` to `lintPick()` at line 1015; family/aisle would fail ordinary headline/do/tier-note checks at lines 1023, 1038, 1115.
- Proposed: add `lintFamily()` and `lintAisle()` dispatch before ordinary card rules; validate `fam_*` IDs, required free rule/briefing, supported section/category, depth types and sources. Reject unknown explicit KB kinds.
- Add optional `family`/`delta` type checks to `lintCard()`; add corpus reference validation for dangling/wrong-kind family IDs and delta-without-family. Check references on raw entries, not only projected cards.
- `lintCorpus()`, `server/lib/counterCardLint.js:1328`, measures ordinary card do-line repetition; feed only question cards. Existing corpus setup is `server/lib/counterCardLint.test.js:57`; separately lint every family/aisle raw entry.
- `PICK_FORBIDDEN_FIELDS`, `server/lib/counterCardLint.js:830`, and `lintPick()`, line 906: explicitly forbid `family`/`delta` on picks if they remain card-only metadata. Optional fields otherwise have no general unknown-field rejection here.

**Migration mapping and SQL**
- `projectCorpus()`, `server/scripts/migrateCounterCards.js:62`, projects `questionEntries()` at line 67 and counts picks at line 63. Exclude/count family and aisle separately before projection; they must not become missing-do migration failures.
- `projectEntry()`, `server/lib/counterCards.js:391`: emit both `family: entry.family ?? null` and `delta: entry.delta ?? null` on every item card, clearing stale values on later upserts.
- `cardToRow()`, `server/lib/counterCards.js:603`, and `rowToCard()`, line 608, spread all other keys and only translate `do↔do_line`; new fields already pass through once projected.
- `CARD_COLUMNS`, `server/lib/counterCards.js:657`: explicitly add `family, delta`; otherwise successful table reads omit both while KB fallback/curated asks may include them.
- `contentUnits()`, `server/lib/counterCards.js:497`, and `coverage()`, line 523: include delta prose in losslessness accounting; validate the family reference separately rather than treating its ID as prose.
- `write()`, `server/scripts/migrateCounterCards.js:99`, maps through `cardToRow()` at line 109 and upserts on slug at line 122. No custom column mapping belongs in the script.
- SQL files live directly in `supabase/`; there is no `supabase/migrations/` directory. Base columns are declared by `supabase/counter_cards.sql:17`.
- Existing extensions: aliases/essential/rank at `supabase/counter_cards_aliases.sql:19`, `:38`, `:39`; instead at `supabase/counter_card_instead.sql:44`; pick_steps/science at `supabase/counter_cards_ktight.sql:9`.
- Proposed new file `supabase/counter_cards_family_delta.sql` needs these nullable text columns (one ALTER per statement also fits the schema-contract parser):
```sql
alter table counter_cards add column if not exists family text;
alter table counter_cards add column if not exists delta text;
```
- No kind CHECK change or family-depth columns are needed for the recommended KB-only family/aisle storage. A foreign key cannot target JSON-file IDs; lint must enforce references.
- Apply SQL before code selects/writes the columns. `selectCards()`, `server/lib/counterCards.js:669`, falls back on select errors; `getGeneratedCards()`, line 753, reports unavailability, so schema mismatch can hide behind curated fallback.
- `declaredColumns()`, `server/lib/schemaContract.test.js:36`, reads top-level `supabase/*.sql` at line 43; its ALTER regex at line 88 recognizes separate `ALTER TABLE … ADD COLUMN` statements. The `fullCard` fixture at line 111 must explicitly include both new keys to test them.

**Retrieval exclusion: filter before scoring, including explicit-ID attachment**
- `questionEntries()`, `server/lib/perimeter.js:46`, currently means “anything except pick.” Proposed shared question predicate rejects `pick`, `family`, `aisle` (and unsupported explicit kinds), while retaining legacy entries with no kind.
- That change protects `scoreEntries()`, `server/lib/perimeter.js:226`, `questionEntryById()`, line 415, `publicIndex()`, line 421, `sectionIndex()`, line 431, migration `projectCorpus()`, and fallback `projectAll()`, `server/lib/counterCards.js:651`.
- `scorePool()`, `server/lib/perimeter.js:169`: whole normalized alias containment scores `min(3, alias words)+1`; unique matching title words add 1, with stopword filtering. Type/state veto runs first; floor is `max(2, top−2)`, then limit (line 223).
- Its bare-noun rescue (lines 202–215) accepts a unique exact `which <noun> should i buy` owner from aliases/asked_as. Exclude navigation entries from BOTH scoring loops by filtering the pool before calling `scorePool()`.
- Preserve raw `scorePool()` for the pick floor: `matchItemToPick()`, `server/lib/listMatch.js:229`, deliberately scores only `pickEntries()`. An unconditional “questions only” filter inside the raw scorer would break picks.
- `answerCounterQuestion()`, `server/lib/counterAskPipeline.js:110`, admits curated top score ≥2 AND aliasScore>0 at line 129; generated lookup then uses `scoreGenerated()`, `server/lib/counterCards.js:784`, alias-only score ≥2 at pipeline line 157.
- `counterFloor.test.js`, `server/lib/counterFloor.test.js:44`, pins one single-word alias hit to 2; lines 73, 84, 96 pin admission, title-only rejection, and parity. Keep those floors unchanged; a non-matchable kind needs exclusion, not a lower score.
- `matchItemToCard()`, `server/lib/listMatch.js:202`, inherits the question filter, then vetoes home/label entries and checks the row head noun.
- Also change `cardForItem()`, `server/lib/listMatch.js:354`: its explicit `perimeterId` path currently rejects only `isPick()` at line 361, bypassing scoring. Use the same question predicate so `fam_*` cannot attach as a card by ID.

**Actual free/paid behavior and proposed filtering**
- `DEPTH_FIELDS`, `server/lib/counterCards.js:581`, is metadata, NOT an active paywall. `summarize()`, line 586, removes only `teaser,locked`; `forViewer(card)`, line 593, ignores viewer options and returns that full shape.
- All counter GETs serve this full shape: section at `server/routes/counter.js:91`, essentials `:109`, corpus `:135`, summaries `:166`, `/cards/:slug/full` `:181` (wrapped `{card}`), `/cards/:slug` `:196` (bare card); ask does so at `:236`.
- `/counter/sections` uses `browseRow()` at `server/routes/counter.js:38`, emitting only slug/eyebrow/headline/kind/tier. `/counter/section-rules` at line 118 returns `loadSectionRules()` from a separate JSON file, not aisle KB entries.
- Only ask personalization is premium: `server/routes/counter.js:246` calls `premiumForReq()`; free gets `gated/upsell`. Ordinary GETs do not currently compute entitlement.
- Legacy `publicEntry()`, `server/lib/perimeter.js:247`, explicitly lists fields, including full old depth; it currently drops any new family/delta. `routes/perimeter.js:84` serves it publicly, and `:133` maps it before ask's premium check at `:137`.
- Proposed `summarize()`/`forViewer(card,{premium})`: retain free family reference; omit delta for free viewers; preserve existing ordinary-card free depth. Add `familyForViewer()` with a free allowlist `{id,kind,title,section,rule}` (`decision→rule`); add authored depth only for paid, including `science`/`pick_steps` if used. Add `publicAisle()` for the free briefing.
- Pass entitlement explicitly at every affected route, using closures rather than `.map(forViewer)` (map supplies index as argument two). Reuse `premiumForReq()`; evaluate once per request and never from a client premium flag.
- Do not globally restore the old seven-field paywall: family-depth gating is kind-specific. Extend `publicEntry()` only through an entitlement-aware projection if new fields are exposed there; never spread raw family depth or delta into a public response.
- This gates the new wire fields; equivalent prose retained in existing free item-card depth remains readable. Content placement must match the intended family-depth product boundary.

**API surface for iOS (proposed, routes do not exist yet)**
- Add handlers to `counterRouter`, `server/routes/counter.js:31`: `GET /api/counter/aisles` → `{aisles:[{id,kind,title,section,rule,checks}]}`; `GET /api/counter/families/:id` → `{family:{id,kind,title,section,rule,...paidDepth}}`.
- Add KB kind-selector helpers near `questionEntries()`, `server/lib/perimeter.js:46`; return ONLY requested kinds through dedicated serializers. Derive family members from card references; never return their paid deltas through a free members list.
- Add optional `family` and viewer-filtered `delta` to existing card responses; this covers ask, cards, essentials, section cards and summaries. If browse rows need membership, extend `browseRow()` explicitly at `server/routes/counter.js:38`.
- Existing route mounting already supplies `/api` at `server/index.js:61`. No new top-level router mount is needed. Reconcile aisle briefings with `loadSectionRules()`, `server/lib/sectionRules.js:11`, rather than leaving competing authored rules.

**iOS decoding and compatibility**
- The actual model is `CounterCard: Decodable, Identifiable, Hashable`, NOT Codable: `Kristy/Networking/CounterModels.swift:79`; `CodingKeys` are at line 150. Synthesized keyed decoding ignores unknown JSON keys; family/delta would be ignored until optional properties/keys are added.
- Required nonoptional fields are `slug,kind,headline,tier` (lines 82–88); absent/null or wrong types throw. Adding family/aisle raw KB entries to a `[CounterCard]` response would fail because IDs/decision/evidence_tier are not the card wire names.
- `CardKind: String, Codable`, `Kristy/Networking/CounterModels.swift:30`, decodes unknown strings as `.unknown` at line 36; unknown kind strings alone do NOT throw. Missing/non-string kinds still throw. `CardTier` has the same string fallback at line 47.
- `.unknown` gets ordinary shelf-style behavior: `Kristy/Surfaces/Counter/CounterSectionScreen.swift:23` groups everything except home as shelf; `CounterCardView.swift:70` tests only `.home`, and line 283 permits a CTA for any non-home kind with a CTA item.
- Current requests: `counterSections()`/`counterSection()` at `Kristy/Networking/KristyAPI.swift:45`/`:49`, `counterCard()` `:80`, `counterCardFull()` `:85`, `counterSummaries()` `:90`. Add typed aisle/family response models and methods here; keep them out of existing CounterCard arrays.
- `CachedCardSummary` wire keys at `Kristy/Core/CounterSummaryCache.swift:89` and allowed keys at `:101` omit new fields; rehydration at `:140` decodes through CounterCard. Add only the free family reference to this cache; keep delta/family depth out and verify entitlement changes clear any in-memory paid state.

**Tests to add/update later (none executed here)**
- `server/lib/kindFilter.test.js:47`: inject family/aisle fixtures plus kind-removed positive twins; assert no question retrieval, legacy browse/lookup, migration rows, fallback cards, or pick matches. Update raw-array source guard at line 158 if adding kind selectors.
- `server/lib/counterFloor.test.js:46`: colliding family/aisle aliases cannot displace a real card; retain alias-score-2 parity and title-only rejection. Cover the unique buying-question rescue too.
- `server/lib/listMatch.test.js:487`: family/aisle explicit perimeterId cannot attach; existing card and pick fixtures still attach through their respective paths.
- `server/lib/counterCardLint.test.js:57`: exercise family/aisle dispatch, unknown kind, missing rule, dangling/wrong-kind family references, delta type/length/dependency, and malformed depth; retain ordinary-card corpus checks.
- `server/lib/schemaContract.test.js:107`: add family/delta to fullCard; test projectEntry→cardToRow→rowToCard and table-select/fallback parity, stale-value clearing, and delta coverage.
- `server/lib/paidBoundary.test.js:31`: retain existing item-depth-free assertions; add guest/free/paid cases for new fields and routes, including summaries, full wrapper, essentials, ask, and any legacy exposure. Assert absent paid keys, not only null UI values.
- iOS decode fixtures: unknown fields ignored, unknown kind fallback, missing required card keys fail, new optional fields absent/null/present, dedicated family/aisle DTOs, free cache excludes delta/depth, and unknown navigation kinds cannot masquerade as shelf cards.
