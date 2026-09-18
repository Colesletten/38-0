# PROGRESS — 38-0

Build log for the single-file Premier League team-builder. The brief is in
[`SPEC.md`](SPEC.md); how to play and how it works is in [`README.md`](README.md).

## Status

| Milestone | State |
|---|---|
| 1. Scaffold + `CONFIG` + seeded PRNG + PRNG tests | **done** |
| 2. Data model + club/era pools | **done** |
| 3. `simulateSeason` + tests + tuning | **done** |
| 4. Draft loop + slot machine + spins/skips | **done** |
| 5. UI polish, results, share, localStorage best | **done** |
| 6. Final pass | **done** |

**62/62 self-checks green.** Verified in Chromium at 360×640, 390×844 and
1440×900, with `prefers-reduced-motion`, and opened directly from `file://`.

## Done

### Engineering constraints
- One self-contained `index.html`. No build step, no framework, no CDN.
- **Zero runtime network calls** — audited with Playwright: loading the page and
  playing a round produces exactly one HTTP request, the document itself. System
  fonts only, crests are generated SVG, sound is synthesised with WebAudio, the
  favicon is an inline data URI.
- Works from `file://` as well as over HTTP.
- `runTests()` behind `?test=1`, asserting via `console.assert` and rendering an
  on-screen report.

### Game
- Six rounds, one pick per slot, into the v1 six-slot lineup
  (GK / DEF / DEF / MID / MID / FWD) defined as a flat ordered list in
  `CONFIG.FORMATION` so a full XI is an additive change.
- Two-reel slot machine with staggered detents. One club-skip and one era-skip
  per game: a club-skip re-spins the club and holds the era, an era-skip the
  reverse.
- Daily seed from the UTC date drives every draw in order, so a date always gives
  the same opening spin and the same offered pool. Free play reseeds from the
  clock. Reel filler is cosmetic and drawn from `Math.random`, deliberately never
  from the seeded stream.
- No club/era cell is drafted from twice and no player twice.
- Results: verdict tiers, W/D/L that counts up, points, a 38-square season grid
  with per-matchday labels, phase meters with the gate threshold marked,
  chemistry readout, the drafted six with effectiveness figures.
- Clipboard share with an emoji season grid and an `execCommand` fallback.
- Personal best in `localStorage`, every access wrapped in `try/catch`.

### Simulation
- `simulateSeason(lineup)` is fully deterministic: the stream is seeded from the
  lineup itself, so a squad has exactly one season in it. Seeding is symmetric
  across same-role slots — the same two centre-backs in the other order is the
  same team.
- Phase roll-up, positional fit, chemistry (shared club-and-era pairs, era
  cohesion, a balance penalty on lopsided squads), a rising opponent curve with
  a ten-match run-in, and category gates that bleed edge late and hard-cap wins.
- Tuned against the histogram oracle logged by `?test=1`:

| play style | median wins | 38-0 rate |
|---|---:|---:|
| random players, random slots | 8 | 0% |
| random players, sensible slots | 22 | 0% |
| best available, best slot | 36 | 11.7% |
| pool's theoretical best XI | 38 | — |

  The median random-but-sensible team lands at 22, inside the 18-24 target band.
  A well-drafted side is unbeaten about a third of the time and goes the full
  38-0 roughly once in nine runs.

### Final pass
- Idle and spinning share a body so the draft screen does not collapse to a void
  while the reels run; the spin button reads as busy rather than broken.
- Dead CSS and leftover harness scaffolding removed.
- One `<script>`, one `<style>`, 145KB, 3225 lines.

### Design
- **TOUCHLINE**: ink surfaces, chalk type, one volt-green accent, tabular
  numerals, mechanical motion. Mobile-first portrait column.
- `prefers-reduced-motion` honoured; focus rings never removed; focus moves into
  a sheet on open and returns on close; live region announces the landed cell;
  season squares carry matchday labels.

## Stubbed / deliberately out of scope

- **Six slots, not eleven.** Per the brief. `CONFIG.FORMATION` is the only thing
  that needs to change.
- **No formation choice** and no substitutes.
- **No per-match narrative** — the season resolves to a W/D/L string, not events.
- **Sound is on by default.** It only ever fires after a tap, and the preference
  is remembered. Say the word and I will flip the default.
- **`tools/run-tests.mjs`** is a dev-only convenience that lifts the `<script>`
  out of `index.html` and runs the same `runTests()` in Node. The game does not
  need it and does not know about it.

## REVIEW flags — please audit

These are the pools and calls I am least certain about. All are in the `CLUBS`
block and carry matching `// REVIEW:` or `// NOTE:` comments in the file.

1. **`Man City` / `2000s`** — pre-takeover City churned squads constantly. The
   pool is deliberately short (10 players) rather than padded with
   half-remembered squad men.
2. **`Everton` / `2020s`** — the pool I am least confident about: relegation
   fights, a points deduction, very heavy churn.
3. **`Gareth Bale` in `Tottenham` / `2000s` is `DEF`** — correct for the era, he
   arrived as a left-back, but it reads oddly next to his `FWD` entry in the
   2010s pool. Intentional. Say if you would rather he were `MID`.
4. **`Leicester` has no `2000s` cell at all** — relegated in 2002 and again in
   2004, and outside the top flight for the rest of the decade. An intentional
   sparse cell, not missing data. The slot machine simply never lands there.
5. **`Aston Villa` / `2010s` is thin (11 players)** — Villa were in the
   Championship from 2016 to 2019, so only genuine top-flight Villa players are
   listed.
6. **Ratings generally.** All 0-100 numbers are game ratings, my best judgment.
   No real-world statistics are asserted anywhere. They are the most subjective
   thing in the repo and the easiest thing for you to tune — one number per
   player, all in one block.

## Open questions for you

1. **Is 11.7% the right 38-0 rate for a good draft?** It currently means a
   player who drafts well is unbeaten about a third of the time and perfect
   roughly once in nine runs. Easy to move: `CONFIG.CURVE.GAUNTLET_PEAK` is the
   main dial (raise it to make the run-in harder).
2. **Should skipping cost something?** Right now a club-skip and an era-skip are
   free and independent. A single shared skip, or a skip that costs you a pick,
   would make the decision sharper.
3. **Should the daily draft be one-and-done?** It currently lets you replay the
   same day as often as you like, which undercuts the shared-seed idea. Locking
   it to one attempt per day would need a date check in `localStorage`.
4. **Sorting of the offered pool.** Currently grouped by position, then by OVR.
   Sorting purely by OVR would make the draft faster but less thoughtful.
5. **Club list.** 11 clubs is more than the brief's ~8. Adding more is purely a
   data edit — but every new pool is another thing to audit.
6. **Does the "38-0" wordmark's volt block read as a hyphen or as a scoreline
   divider?** I intended the latter. Your call.
