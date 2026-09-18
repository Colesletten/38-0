# PROGRESS — 38-0

Build log for the single-file Premier League team-builder. See `SPEC.md` for the brief.

## Status

| Milestone | State |
|---|---|
| 1. Scaffold + CONFIG + seeded PRNG + PRNG tests | **done** |
| 2. Data model + club/era pools | **done** |
| 3. `simulateSeason` + tests + tuning | **done** |
| 4. Draft loop + slot machine + spins/skips | not started |
| 5. UI polish, results, share, localStorage best | not started |
| 6. Final pass | not started |

## Done

- `index.html` scaffold: self-contained, no network calls at runtime (system fonts
  only, all art inline SVG/CSS).
- Design language **TOUCHLINE** — ink surfaces, chalk type, one volt-green accent,
  tabular numerals, mechanical motion. Mobile-first portrait column.
- `CONFIG` block holding every tuning constant: formation, draft shape, eras,
  positional-fit table, phase aggregation weights, chemistry, difficulty curve,
  match resolution, category gates, verdict tiers.
- `mulberry32` PRNG, FNV-1a `hashString`, `utcDateKey` for the daily seed.
- `runTests()` behind `?test=1`, rendering an on-screen report and asserting via
  `console.assert`. 10 checks green.

- `CLUBS[club][era]` data model: 11 clubs, 32 spinnable club/era cells, 443
  players. Each player carries `{name, position, ratings:{attack, creativity,
  defense, physical, gk}, era, club}`.
- `CLUB_META` for crest colours and three-letter codes.
- `buildPools()` stamps provenance and drops any cell thinner than
  `CONFIG.DRAFT.MIN_POOL` so the slot machine can never land on an empty shelf.
- 14 data self-checks including spot checks that specific players are at the
  right club in the right decade.

- `simulateSeason(lineup)` — deterministic (seeded from the lineup itself, so a
  squad has exactly one season in it), returns `{wins, draws, losses}` plus a
  `results[]` string and the underlying analysis.
- `analyseLineup()` — positional fit, phase roll-up (attack / midfield / defense
  / gk), chemistry from shared club-and-era pairs, era cohesion and a balance
  penalty on lopsided squads.
- Emergency keepers: an outfielder in goal is worth a floor, not a zero — bad
  enough that the draft still wants a real keeper, not so bad that a keeper-less
  spin ends the run.
- Rising opponent curve with the last ten matches as a genuine run-in.
- Category gates: a phase below its threshold bleeds edge from matchday 20 and
  hard-caps the number of wins, surrendered from the hardest fixtures backwards.
- 21 simulation self-checks including determinism, `W+D+L === 38` across 300
  random plus junk lineups, monotonicity, and gate behaviour.

### Tuned distribution (n=1000 each, logged by `?test=1`)

| play style | median wins | 38-0 rate |
|---|---|---|
| random players, random slots | 8 | 0% |
| random players, sensible slots | 22 | 0% |
| drafted well (best available, best slot) | 36 | 11.7% |
| pool's theoretical best XI | 38 | — |

The median random-but-sensible team lands at 22 wins, inside the 18-24 target
band. A well-drafted side is usually agonisingly close — median 36, unbeaten 32%
of the time — and goes the full 38-0 about once in nine runs.

## Stubbed

- Everything from milestone 4 onward.

## Notes

- `tools/run-tests.mjs` is a **dev-only** convenience that lifts the `<script>` out
  of `index.html` and runs the same `runTests()` in Node, so the simulation can be
  tuned without a browser. The game has no build step and does not need it.

## REVIEW flags

Please audit these before publishing:

1. **`Man City` / `2000s`** — pre-takeover City churned squads constantly. The
   pool is deliberately short (10) rather than padded with half-remembered squad
   players.
2. **`Everton` / `2020s`** — the pool I am least confident about. Relegation
   fights, a points deduction and very heavy churn.
3. **`Gareth Bale` in `Tottenham` / `2000s` is listed as `DEF`** — correct for
   the era (he arrived as a left-back) but it reads oddly next to his `FWD`
   entry in the 2010s pool. Intentional; flagging in case you would rather he
   were `MID`.
4. **`Leicester` has no `2000s` cell at all** — they were relegated in 2002 and
   again in 2004 and spent the rest of the decade outside the top flight. This
   is an intentional sparse cell, not missing data.
5. **`Aston Villa` / `2010s` is thin (11)** — Villa were in the Championship
   from 2016 to 2019, so only genuine top-flight Villa players are listed.

All 0-100 numbers are game ratings, my best judgment. No real-world statistics
are asserted anywhere in the file.

## Open questions

_None yet._
