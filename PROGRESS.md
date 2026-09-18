# PROGRESS — 38-0

Build log for the single-file Premier League team-builder. See `SPEC.md` for the brief.

## Status

| Milestone | State |
|---|---|
| 1. Scaffold + CONFIG + seeded PRNG + PRNG tests | **done** |
| 2. Data model + club/era pools | not started |
| 3. `simulateSeason` + tests + tuning | not started |
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

## Stubbed

- Everything from milestone 2 onward.

## Notes

- `tools/run-tests.mjs` is a **dev-only** convenience that lifts the `<script>` out
  of `index.html` and runs the same `runTests()` in Node, so the simulation can be
  tuned without a browser. The game has no build step and does not need it.

## REVIEW flags

_None yet._

## Open questions

_None yet._
