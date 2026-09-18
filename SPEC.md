# Claude Code prompt — "38-0" Premier League team-builder

Build a browser game called **38-0** — a Premier League spin on the viral NBA "82-0"
team-builder. Single-page, **single self-contained `index.html`**: vanilla HTML/CSS/JS,
no build step, no frameworks, no external dependencies, no runtime network calls. I want
to open it directly in a browser and later publish it as a static page.

## Concept
A slot machine spins a random (club, era) combo each round. The player drafts one legend
per round and assigns them to a position. After the draft, a deterministic simulation
engine runs the roster across a 38-game Premier League season and returns a W-D-L record.
A perfect **38-0** has never happened in real PL history (Arsenal's 2003-04 Invincibles
went unbeaten but drew 12), so going 38-0 is the mythical goal. Let the player share the
result.

## Eras
Exactly three: **2000s, 2010s, 2020s**.

## Core loop
- **6 rounds.** Each round: spin → (club, era) → show that club's player pool for that
  era → user picks one player → assigns a position.
- **Formation (v1, keep it simple):** a 6-slot lineup — GK, DEF, DEF, MID, MID, FWD.
  Document this in a comment; make it easy to extend to a full XI later.
- Positions must all be filled; the player can't stack every pick in one position.
- Allow **1 club-skip and 1 era-skip** per game (re-spin the current round).

## Determinism / daily seed
- Everyone gets the same spins on a given day: seed a small PRNG (mulberry32 or similar)
  from the UTC date string `YYYY-MM-DD`.
- Also include a **Free Play** mode that reseeds randomly each game.

## Data model
- `CLUBS[club][era]` → array of players.
- Player shape: `{ name, position (GK/DEF/MID/FWD), ratings: { attack, creativity,
  defense, physical, gk }, era }`, all ratings on a **0–100** scale.
- **Data honesty (important):** use real, well-known PL players, correctly assigned to the
  club and era they actually played in. Rate them with your best-judgment 0–100 attribute
  scores — do **NOT** fabricate precise real-world stats (exact goals/assists). These are
  game ratings, not claimed facts. If you're unsure a player belongs to a club/era, leave
  them out rather than guess, and add a `// REVIEW:` comment on any pool you're not
  confident about so I can audit it.
- Seed ~8 clubs to start (Arsenal, Man Utd, Chelsea, Liverpool, Man City, Tottenham, plus
  a couple more), each with ~6–10 players per era they were actually relevant in. Sparse
  club/era cells are fine.

## Simulation engine (the fun part — make it tunable)
- `simulateSeason(lineup) → { wins, draws, losses }`, fully deterministic.
- Aggregate the lineup into phase ratings: attack, midfield, defense, goalkeeping, plus a
  **chemistry/balance** factor that penalizes missing positions or a lopsided squad.
- Model 38 matches against a **rising difficulty curve** — opponents get tougher, the last
  ~10 are a gauntlet — so 38-0 is rare but achievable with an elite, balanced squad.
- **Category gates:** if any phase rating is below a threshold, cap the max achievable wins
  (e.g. weak defense → you drop points late).
- Non-linear near the top: small rating gaps between elite squads matter a lot. Tune so a
  median random team lands ~18–24 wins and only a strong balanced team approaches 38-0.
- Keep every tuning constant in a labeled `CONFIG` block at the top of the file.

## UI
- Clean, **mobile-first, portrait**. Slot-machine reveal for the club/era. Card-based
  player picks. Position assignment. Results screen with the W-D-L record, a tiered
  one-line verdict ("Invincible!" at 38-0, graded messages below), and a **Share** button
  that copies a result string to the clipboard.
- No backend. LocalStorage only, for a personal best — wrap in try/catch.

## Engineering constraints
- One self-contained `index.html`. No CDN, no network at runtime.
- **Self-test harness:** a `runTests()` function guarded behind `?test=1`, using
  `console.assert`, covering at minimum: PRNG is deterministic for a fixed seed;
  `simulateSeason` is deterministic and bounded, with `wins + draws + losses === 38`; an
  all-max lineup scores far better than an all-min lineup; empty/invalid lineups don't
  crash. **These are your correctness oracle — make them pass before calling any milestone
  done.**
- Commit after each milestone with a clear message. Keep a **PROGRESS.md** log: what's
  done, what's stubbed, open questions, and every `REVIEW:` flag for me.

## Build order (do in sequence, commit each step)
1. Scaffold + `CONFIG` + seeded PRNG + PRNG tests.
2. Data model + first pass of club/era pools (flag low-confidence ones).
3. `simulateSeason` + its tests. Log a histogram of 1000 random teams to verify the win
   curve, then tune constants until the distribution matches the target above.
4. Draft loop + slot machine + spins/skips wired to the daily seed.
5. UI polish, results screen, share, localStorage best.
6. Final pass: run all tests, update PROGRESS.md, list everything you want me to review.

## Done =
All tests pass; the game is playable start-to-finish on a mobile viewport; the daily seed
produces identical spins on reload; and PROGRESS.md lists open questions plus every
`REVIEW:` flag.
