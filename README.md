# 38-0

**Draft a truly invincible Premier League team.**

A Premier League spin on the viral NBA "82-0" team-builder. A slot machine spins
a random club and era; you take one legend from that squad and give them a shirt.
Do it seven times, then a deterministic engine plays your side across a 38-game
season and hands back a W-D-L record.

However good your seven are, no match is ever a formality.

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

There are **two ways to play**, and the title screen states the difference on the
buttons themselves rather than in a footnote, because it is the one thing people
get wrong:

- **Free draft** — different spins every single time. This is the primary action
  and the one you want if you just want to play.
- **Today's draft** — seeded from the UTC date, so everyone playing on the same
  day gets the same seven spins. Replaying it deliberately repeats it; once
  you've played it, the card says so and shows your record.

A single draft never visits the same club twice, so seven spins are a tour of the
league rather than two Chelsea cells and two Arsenal cells.
- **Copy result** — puts a shareable emoji season grid on your clipboard.

The results screen is a report, not a scoreboard: what the seven were *worth*
against what they took, where in the season the points went, which phase fell
short of a title-winning standard, your best and least valuable picks measured
against a replacement-level player at the same slot, and a ranked list of what
to fix next time.

## Self-tests

```
index.html?test=1
```

Runs the full harness, asserts through `console.assert`, and renders an on-screen
report. It covers PRNG determinism, data integrity, season bounds
(`wins + draws + losses === 38` for every lineup including deliberate junk),
chemistry, the category gates, the upset ceiling, season fortune, the season
report, and the win-distribution curve. 83 checks.

There is also a dev-only Node runner that lifts the same `runTests()` out of the
file so the simulation can be tuned without a browser:

```
node tools/run-tests.mjs
node tools/run-tests.mjs "T.notes.join('\n\n')"     # print the win histograms
```

## The lineup

Seven slots: **GK, DEF, DEF, MID, MID, FWD, FWD**. It is defined as a flat
ordered list in `CONFIG.FORMATION`, and `CONFIG.DRAFT.ROUNDS` follows its
length, so extending to a full XI means adding entries there and nothing else.

## How the season is decided

Your seven players roll up into four phase ratings — **attack, midfield,
defence, goalkeeping** — scaled by how well each one suits the slot you put them
in. A chemistry multiplier rewards players who actually shared a dressing room
and punishes a lopsided squad. That produces one team rating, which meets a
rising opponent curve whose last twelve matches are a genuine title run-in.

Four things stop a good squad coasting:

- **The upset ceiling.** No match is ever more than `MAX_WIN_PROB` certain,
  whatever your rating. This is the most important constant in the game: it is
  why 38-0 needs luck on top of a great draft, and the probability shaved off a
  win is mostly conceded as a draw — which is how the real near-misses have
  always happened.
- **Season fortune.** Drawn once from the lineup's own stream and added to the
  team rating for all 38 matches: the year the ball ran for you, or the year it
  did not. It is what makes two equally good squads finish differently, and it
  is reported on the results screen rather than hidden in the engine.
- **Category gates.** A phase below its threshold bleeds points from matchday 20
  and hard-caps how many wins the season can produce, surrendered from the
  hardest fixtures backwards. You cannot win the league with a hole in you.
- **A shallow response curve.** Rating matters, but not so much that a good
  squad becomes a formality.

Tuned so that:

| how you draft | p10 | median | p90 | 38-0 rate | unbeaten |
|---|---:|---:|---:|---:|---:|
| random players, random slots | 0 | 4 | 11 | 0% | 0% |
| random players, sensible slots | 3 | 10 | 23 | 0% | 0% |
| best available, best slot | 23 | **33** | 37 | **3.2%** | 14.1% |
| the pool's theoretical best seven | — | — | — | 6.8% | — |

A well-drafted side is usually denied by draws rather than defeats, and the
worst tenth of well-drafted runs still finish on 23 wins or fewer. Every tuning
constant lives in one labelled `CONFIG` block at the top of the script. Move a
number, reload, re-run the histogram.

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

11 clubs, 32 club/era cells, **1,651 players** — a median of 51 per club/era,
and the whole squad is offered every spin, filtered by line. Leicester has no
2000s pool because they were not in the division for most of it.

## Design

The interface follows the **Premier League's own brand language**: a deep
aubergine ground, electric cyan, mint green and magenta, raked chevrons, and a
geometric sans set light against heavy.

Everything is flat. There are no gradient surfaces, no soft shadows, no glows
and no grain — that identity is built from solid blocks and hard edges, and
softening them is exactly what stops it looking like itself. The top bar reads
as a broadcast score bug.

The one piece of ornament is the **chevron field**, taken from the brand's own
matchday artwork: a handful of thick raked bars at irregular widths and
heights, each cut to a shallow point at its foot. The reference runs them in
bright green over aubergine; here they are aubergine on aubergine, one tone
darker than the ground, so they read as texture behind the content rather than
competing with it. The rake belongs to the background alone — the interface on
top of it stays square.

Restraint is the rule on top of it. A stroke has to earn its place: only the
buttons and the two mode cards are boxed, because those are the things you
press. Everything else — player cards, tiles, chips, the reel — separates on
tone alone. Section headings carry no decorative rule, the results screen
states each fact once, and the player card gives the five ratings as one line
of numbers rather than five labelled bars. The figures are comparable, so a
column of them scans faster than a column of bars and costs a quarter of the
room.

## Chemistry

Seven legends from seven different clubs is a collection, not a team. Chemistry
is what makes it a side, and it is counted per **pair**: two men from the same
club *and* era actually shared a dressing room and are worth the most; two from
the same club a generation apart are worth a little. Because it is per pair, a
block grows with its square — two is one link, three is three, four is six — so
stacking a club pays off steeply enough to be worth passing on a bigger name for.

For that to be possible at all, the machine has to be willing to hand you the
same badge twice, and it now is: a club that has already come up is weighted
down rather than banned. When the reels land on a club you have signed from,
the draft says so, because that is the only moment the choice exists.

There is no bonus for fielding one player from each era. Seven picks across
three eras land there by default, and paying out for the default is a rebate,
not a reward.

## Squad traits

Four phase ratings say how good each line is. They do not say what kind of side
this is, so a squad can be highly rated and still be a lightweight. Two
attributes that feed every phase without dominating any — **physicality** and
**creativity** — are aggregated across the whole seven and measured against a
floor and a second, higher line. Below the floor it costs rating; above the
higher line it earns some; in between, nothing, because the point is to have
enough rather than to max it out.

That shape is what makes the choice real. A defender's overall rating is
already `0.62 defence + 0.24 physical + ..`, so trading one attribute for
another at equal overall is neutral by construction. A floor your squad can be
short of is not: the big, slightly worse defender is right when you need him
and wrong when you do not, and which it is changes with your first few picks.

The palette is only the four brand colours plus white, mapped semantically:

| | |
|---|---|
| **Green** `#00FF85` | wins, value above replacement |
| **Cyan** `#04F5FF` | draws, primary actions, the mode chip |
| **Magenta** `#E90052` | defeats, danger, failing gates |
| **Light magenta** `#FF74A8` | cautions, so a warning never reads as positive |

The typeface is **Poppins** — the closest free relative of the Premier League's
own face, with the same single-storey `a` and `g`, circular bowls and lining
figures. It is not linked from Google Fonts: four weights are subset to the
Latin ranges the game uses and embedded as woff2 data URIs, about 61KB, so the
page keeps its defining property of making no network calls at all. Kerning
survives the subsetting — verified by measuring identical text widths against
the unsubsetted face. Poppins is licensed under the SIL Open Font License 1.1.

The brand's *visual language* is used; its crest is not. The lion is a
trademark, so the club crests here stay procedural.

Mobile-first portrait. It is a phone-shaped column at any width.
`prefers-reduced-motion` is honoured throughout.

## Layout of the file

```
1. CONFIG    every tuning constant, in one labelled block
2. PRNG      mulberry32, FNV-1a string hash, the UTC daily seed
3. DATA      CLUBS[club][era] -> players
4. SIM       analyseLineup(), simulateSeason() and seasonReport()
5. DRAFT     the round / spin / skip state machine
6. VIEW      screens, the slot machine, sound
7. TESTS     runTests(), behind ?test=1
```

## Deploying

`.github/workflows/pages.yml` publishes `index.html` to GitHub Pages on every
push to `main` that touches it. It gates the deploy on the test harness passing *and* on
the file containing no external script or stylesheet, so the property that makes
this thing work offline cannot be lost by accident.

The first run needs Pages switched on once by a repository admin —
**Settings → Pages → Build and deployment → Source: GitHub Actions** — because
the Actions token is not permitted to create a Pages site itself. After that it
is automatic.

`CONFIG.FORMATION` is the single source of truth for the lineup; the number of
draft rounds, the slot picker, the lineup strip and the results list all follow
it.
