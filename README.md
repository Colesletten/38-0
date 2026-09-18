# 38-0

**Draft a truly invincible Premier League team.**

A Premier League spin on the viral NBA "82-0" team-builder. A slot machine spins
a random club and era; you take one legend from that pool and give them a shirt.
Do it six times, then a deterministic engine plays your side across a 38-game
season and hands back a W-D-L record.

Arsenal's 2003-04 Invincibles went unbeaten — and still drew twelve. Nobody has
ever won all thirty-eight. That is the target.

## Play

Open `index.html` in a browser. That is the whole thing.

```
open index.html          # or drag it into a browser window
```

No build step, no install, no server, no network. The entire game — data, engine,
interface, artwork and sound — is one self-contained HTML file that makes exactly
**one** HTTP request: the one that loads it.

- **Today's draft** — the spins are seeded from the UTC date, so everyone playing
  on the same day gets the same machine, and reloading gives you the same draw.
- **Free play** — reseeds every game.
- **Copy result** — puts a shareable emoji season grid on your clipboard.

## Self-tests

```
index.html?test=1
```

Runs the full harness, asserts through `console.assert`, and renders an on-screen
report. It covers PRNG determinism, data integrity, season bounds
(`wins + draws + losses === 38` for every lineup including deliberate junk),
chemistry, the category gates, and the win-distribution curve. 62 checks.

There is also a dev-only Node runner that lifts the same `runTests()` out of the
file so the simulation can be tuned without a browser:

```
node tools/run-tests.mjs
node tools/run-tests.mjs "T.notes.join('\n\n')"     # print the win histograms
```

## How the season is decided

Your six players roll up into four phase ratings — **attack, midfield, defence,
goalkeeping** — scaled by how well each one suits the slot you put them in. A
chemistry multiplier rewards players who actually shared a dressing room and
punishes a lopsided squad. That produces one team rating, which meets a rising
opponent curve whose last ten matches are a genuine title run-in.

Two things stop a good squad coasting:

- **Category gates.** A phase below its threshold bleeds points from matchday 20
  and hard-caps how many wins the season can produce, surrendered from the
  hardest fixtures backwards. You cannot win the league with a hole in you.
- **An elite curve.** Above a rating threshold the logistic steepens, so at the
  top of the draft two rating points decide matches.

Tuned so that:

| how you draft | median wins | 38-0 rate |
|---|---:|---:|
| random players, random slots | 8 | 0% |
| random players, sensible slots | 22 | 0% |
| best available, best slot | 36 | 11.7% |

Every tuning constant lives in one labelled `CONFIG` block at the top of the
script. Move a number, reload, re-run the histogram.

## Data honesty

Every player is a real Premier League player, placed at a club and in a decade
they actually played there. Players who genuinely spanned two decades at one club
appear in both — that is correct, not a duplicate.

The five 0-100 numbers are **game ratings**: my best judgment of that player, in
that shirt, in that era. They are **not** claimed real-world statistics, and no
goal or assist totals are asserted anywhere in the file. Anything I was not
confident about was left out rather than guessed, and pools wanting a human audit
carry `// REVIEW:` comments — all of them are listed in
[`PROGRESS.md`](PROGRESS.md).

11 clubs, 32 club/era cells, 443 players. Leicester has no 2000s pool because
they were not in the division for most of it.

## Design

The interface is called **TOUCHLINE**: Premier League broadcast graphics crossed
with Swiss editorial sports print and the mechanical honesty of an arcade
cabinet. Ink surfaces, chalk type, a single volt-green accent, tabular numerals
on everything that is a number, and motion that detents rather than bounces.

Mobile-first portrait. It is a phone-shaped column at any width, sitting on a
chalked pitch on desktop. Because the file may make no network calls, every
glyph is a system font, every crest is generated SVG, and every sound is
synthesised with WebAudio on the spot. `prefers-reduced-motion` is honoured
throughout.

## Layout of the file

```
1. CONFIG    every tuning constant, in one labelled block
2. PRNG      mulberry32, FNV-1a string hash, the UTC daily seed
3. DATA      CLUBS[club][era] -> players
4. SIM       analyseLineup() and simulateSeason()
5. DRAFT     the round / spin / skip state machine
6. VIEW      screens, the slot machine, sound
7. TESTS     runTests(), behind ?test=1
```

The six-slot lineup (GK, DEF, DEF, MID, MID, FWD) is v1 and is defined as a flat
ordered list in `CONFIG.FORMATION`. Extending to a full XI means adding entries
there and nothing else.
