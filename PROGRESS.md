# PROGRESS — 38-0

Build log for the single-file Premier League team-builder. The original brief is
in [`SPEC.md`](SPEC.md); how to play and how it works is in
[`README.md`](README.md).

## Status

All six milestones from the original brief are done, plus a second round of
changes from playtest feedback.

**108/108 self-checks green.** Verified in Chromium at 320×568, 360×640,
390×844 and 1440×900, with `prefers-reduced-motion`, and
opened directly from `file://`. A Playwright network audit confirms the page
still makes exactly **one** HTTP request: the document itself.

---

## Round 2 — playtest feedback

### 1. Deeper rosters

| | before | after |
|---|---:|---:|
| players | 443 | **1,651** |
| median per club/era | 14 | **51** |
| smallest cell | 10 | 38 |
| largest cell | 16 | 76 |

That is **3.7× the original**, not quite the 4× asked for. The gap is
deliberate: the last few names per cell would have been guesses, and the data
honesty rule in the brief says to leave those out. The thinnest cells are the
honest ones — Man City's pre-takeover years, Villa's Championship years — and
they are flagged below.

The whole squad is now offered on every spin rather than a sample of eight, with
line filter chips (All / GK / DEF / MID / FWD, each carrying its count) so a
50-player roster stays navigable on a phone. `CONFIG.DRAFT.POOL_SHOWN` is kept
as a dial: 0 means the whole roster, a positive number caps it.

### 2. Seven slots

`GK, DEF, DEF, MID, MID, FWD, FWD`. `CONFIG.DRAFT.ROUNDS` now derives from
`CONFIG.FORMATION.length`, and the slot picker, lineup strip, pips, results list
and title copy all follow it, so a full XI is still a one-place change.

### 3. Much harder, with real variance

The old balance let a well-drafted side go 38-0 **26%** of the time. Three
changes fixed it:

- **An upset ceiling** (`MATCH.MAX_WIN_PROB = 0.955`). No match is ever more
  certain than that, whatever your rating. Probability shaved off a win is
  mostly conceded as a draw.
- **Season fortune** (`MATCH.FORM_SWING`, now 8, originally 15). One draw from
  the lineup's own stream, added to the team rating for all 38 matches. This is
  what makes two equally good squads finish differently, and it is shown to the
  player as a "How it fell" scale rather than hidden in the engine. At 15 it
  went much too far — see section 10 — and drowned the draft it was meant to
  season.
- **A shallower response curve and a higher floor.** `STEEP` 0.170 → 0.125 and
  the opponent curve raised from 45-64 to 54-74, so rating still matters but a
  good squad is never a formality.

| how you draft | p10 | median | p90 | 38-0 | unbeaten |
|---|---:|---:|---:|---:|---:|
| random players, random slots | 0 | 1 | 5 | 0% | 0% |
| random players, sensible slots | 1 | 7 | 18 | 0% | 0% |
| best available, best slot | 25 | **30** | 35 | **0.51%** | 2.9% |
| the pool's theoretical best seven | — | 37 | — | — | — |

*(Figures above are the current ones. The `unbeaten` column carried the 38-0
value for a long stretch because a scratchpad script computed it wrongly, which
is how a 12% unbeaten rate hid in plain sight — see section 10.)*

38-0 is now **8× rarer** for a well-drafted side, the median record dropped from
36 to 33, and the worst tenth of well-drafted runs finish on 23 or fewer. A good
side is usually denied by draws rather than defeats, which is the Invincibles
story exactly.

### 4. Inter Tight

Used for every role — display, interface and figures. **Not** linked from Google
Fonts: the variable face (400-900) is subset with `pyftsubset` to the Latin
ranges the game uses and embedded as a woff2 data URI, ~61KB, so the file keeps
its defining property of making no network calls. SIL Open Font License 1.1.

Player names now carry their real diacritics (Özil, Čech, Vidić, Højlund), which
the embedded latin-ext subset covers.

### 5. The results screen is now a report

The old screen showed a 38-square grid of match results, which told you what
happened but never why. It has been replaced with an explanation, all of it
derived from the same numbers the engine actually used so it can never flatter
or contradict the result:

- **The margin** — what the seven were *worth* (summed win probability) against
  what they took, with the season's fortune on the same scale.
- **How it broke** — the season split into opening / midwinter / run-in, each
  with its W-D-L and a stacked bar, and a line naming where the points went.
- **The side** — phase meters with their gate thresholds marked, plus four
  tiles: top player, least impactful (or weakest link, if they were genuinely
  below replacement), biggest gap against a title-winning benchmark, and
  strongest suit.
- **What to fix** — up to four ranked, concrete items: failing gates, players
  out of position, phases short of the benchmark, a player you passed on who was
  on the same board, and chemistry.
- **Your seven** — each pick with what they added over a replacement-level
  player at that slot.

Player value is measured against the median player *who plays that position*,
not the median of everyone. Measured the other way the typical "goalkeeper" is
an outfielder on the emergency floor, so any real keeper towers over replacement
and wins top player in every single report — a bug caught by exactly that test.

The emoji grid is still what the share button copies; it just no longer occupies
the screen.

---

## Deployment

`.github/workflows/pages.yml` publishes `index.html` to GitHub Pages on any push
to `main` that touches it, gated on the test harness passing and on the file
containing no external script or stylesheet.

**It needs one manual step before the first deploy.** The Actions token is not
permitted to create a Pages site, so a repository admin must set
**Settings → Pages → Build and deployment → Source: GitHub Actions** once. The
workflow already ran and failed at exactly that point, with every other step
green. After the switch is flipped, re-run it and it is automatic from then on.

### 7. Redesign in the Premier League brand language

Rebuilt the identity from reference images of the league's own brand: deep
aubergine ground, electric cyan, mint green and magenta, raked chevrons, and a
geometric sans set light against heavy.

- **Typeface chosen, not guessed.** Poppins, picked by rendering it against
  Jost, Outfit and Figtree beside the reference specimen. Same single-storey
  `a` and `g`, circular bowls, lining figures. Four weights subset and embedded
  as woff2 data URIs (61KB) so the page still makes no network calls, and
  kerning was confirmed intact by measuring text widths against the
  unsubsetted face.
- **Four brand colours plus white, mapped semantically** — green wins, cyan
  draws and primary actions, magenta defeats, light magenta cautions. The old
  amber had no home in this palette and a cyan warning would have read as
  positive, so cautions took a lighter magenta instead.
- **Flat throughout.** Gradient surfaces, soft shadows, the accent glow and the
  film grain are gone.
- **The chevron field** is the only ornament, and it lives in the background
  only: thick raked bars at irregular widths and heights, each cut to a point
  at its foot, transcribed from the brand's matchday artwork but rendered
  aubergine-on-aubergine instead of green so it reads as texture. Everything in
  the interface on top of it is square.
- The brand's visual language is used; the lion crest is not, since it is a
  trademark. Club crests stay procedural.
- **A refinement pass afterwards** stripped what read as filler. Box borders
  went from 14 to 6: only the buttons and the two mode cards keep a stroke,
  because those are the things you press; everything else separates on tone.
  The decorative hairline that trailed off every section heading is gone, as
  is the Won/Drawn/Lost colour key (the period rows already print coloured
  counts) and the fortune word above the scale that restated it. Copy was cut
  hard — the title paragraph, the mode eyebrow, the round and pick counters,
  the pool count, the assignment explanation, the advice numbering, and every
  advice body down to one sentence.
- **Two generated lines read as machine-written and were fixed at the source.**
  The gate note printed the same full sentence under every failing phase; it
  is now just `Below 62`. And a phase that missed its gate also produced a
  near-identical "was your weak suit" item, so "Goalkeeping" appeared twice in
  a row; the gap item is now suppressed when the gate already named that phase.
- **The five ratings stayed on the card, in a smaller form.** The pass first
  removed them entirely — five bars with five repeated labels across fifty
  cards was the largest single source of clutter. That went too far: the
  ratings are the decision. They came back as one line of labelled numbers,
  which carries the same information in a fifth of the room and scans faster,
  since the figures are directly comparable. The club-colour bar down the left
  of the card was dropped to make the width for it.
- **The cyan rules came off** the header and the club/era boxes. Neither
  carried meaning — the reel stopping is the lock signal and the header already
  separates on tone. The assignment sheet keeps its cyan leading edge, which
  marks a surface rising over the screen.

### 6. The chemistry that was never reachable

Measured before touching anything: across 2,000 simulated drafts, the number
that ended with two players from the same club and era was **zero**. The spin
rule preferred clubs you had not used and banned the exact cell you had just
drafted from, so with eleven clubs and seven rounds every squad came out as
seven different clubs across about three eras — the same shape, every game.
`SAME_CLUB_ERA_PAIR` and its cap were dead constants, and the results screen
was advising players to do something the game forbade.

Chemistry as a whole moved across 0.969–1.016, under 5% of the 0.62–1.13 band
the config allowed. It was decoration.

The fix was three parts:

- **A club can come round again.** `availableCells` no longer bans a used cell
  or prefers a fresh club. Instead `cellWeight` decays a club's odds by
  `REPEAT_DECAY` (0.34) per time it has been drawn, so a repeat is uncommon but
  real. Measured: a club repeats in 58% of drafts, and the median draft still
  visits 6 distinct clubs out of 7 picks. Two tests now guard both ends —
  repeats must happen in more than 25% of drafts and no draft may collapse
  below 4 distinct clubs.
- **Links are counted per pair, and are worth something.** `LINK_TEAMMATE`
  0.050, `LINK_CLUB` 0.020, capped at 0.20.
- **The three-era bonus went.** 82% of drafts qualified for it, so it was a
  rebate on the default rather than a reward for a choice. Removing it took a
  silent 1.8% off four squads in five, so `CHEM.BASE` went to 1.015 to restore
  the baseline it had been propping up.

Result, over 3,000 well-drafted seasons: p10 23, median 32, p90 37, 38-0 at
2.9% — back on the old targets. A teammate pair now appears in 25% of drafts
and some club link in 63%. The squads that land in the **top 20% for chemistry
go unbeaten 4.0% of the time against 1.8% for the bottom 20%**, so it is a
visible lever rather than noise.

#### What this does not fix

Worth recording honestly, because it was measured and it bounds what chemistry
can ever be here. A bot that deliberately pays up to 20 rating points for a
link does **not** beat a bot that ignores chemistry entirely — both land on a
median of 32. The reason is that every player in a cell shares that cell's
club, so once the reels have stopped there is no chemistry decision left to
make; the spin has already decided it. Giving the player a choice of two cells
per round does create real agency (teammate pairs rise from 29% to 46% when
chased, and the perfect-season rate from 2.3% to 3.5%), but that changes the
core slot-machine loop and has not been built.

So chemistry is currently a **dividend you can recognise and protect** — mainly
by not spending a skip when the reels offer a club you have already signed
from — rather than a plan you can execute. Making it the latter needs either
the two-cell choice above or a squad budget.

### 7. Squad traits

The ask: make a defender who is slightly lower rated but more physical
sometimes the right pick. As written that could not work, because `playerOVR`
**is** the position-weighted blend — a DEF's overall is
`0.62 defence + 0.24 physical + 0.09 creativity + 0.05 attack`, so a defender
with more physical at the same OVR necessarily has less defence. Trading one
for the other is neutral by construction, and no amount of reweighting the
attributes changes that.

What creates a choice is a **floor to clear and a level past which more stops
paying**. `CONFIG.TRAITS` aggregates two attributes across the whole seven —
`physical` and `creativity`, the two that feed every phase without dominating
any — and scores the squad against a `min` and a `strong` line. Below `min` it
costs rating; above `strong` it earns some; between them, nothing. The total is
clamped to `MAX_SWING` (6 rating points) so a trait is worth steering for
without ever outweighing who you actually signed.

Thresholds come from the measured distribution over 2,500 well-drafted sides:
physicality p05 79.9 / median 84.0 / p95 87.1, creativity p05 66.9 / median
71.6 / p95 76.0. Deliberately chasing one is worth about +6 physicality or
+9 creativity, so there is real headroom to steer into.

**It passes the test chemistry failed.** A bot that pays a little OVR for
trait edge beats a trait-blind bot by **+0.90 wins a season** (mean 31.45 vs
30.55 over 2,500 drafts each), and lifts the perfect-season rate from 2.7% to
3.2%. The same experiment on club chemistry produced an edge of **+0.00**. The
difference is where the decision lives: chemistry is settled by the spin before
you touch anything, while a trait is settled by which card you tap.

Over-chasing is punished too — paying 6 OVR per rating point of trait edge
drops the advantage back to +0.42. There is a wrong answer in both directions,
which is what makes it a skill rather than a tax.

For a player who ignores traits entirely the game gets slightly *harder*
(38-0 at 2.6% with traits on against 3.1% off), which is the right shape: the
mechanic hands out nothing, it only rewards steering.

It shipped behind a flag so both scoring models could be played side by side.
Traits won that comparison, so the flag, the home-screen switch, the
`?traits=` parameter and the stored preference were all removed rather than
left in place — a setting nothing can change is the same dead constant the
club-chemistry bonus had been, and this file exists partly to stop that
happening twice. Traits are now simply part of the model.

### 8. Twenty clubs added, every squad cut to 20

Two changes at once: every club-and-era roster became a curated 20, and the
league grew from 11 clubs to 31.

**The rule.** A club is in if it spent more than half of any one era in the
Premier League -- 6+ seasons of the 2000s or 2010s, 4+ of the six completed
2020s seasons. Worth noting the original framing was "more than half of *each*
era", which none of the clubs that prompted it actually meet: Brighton never
played a 2000s season, Brentford has only the 2020s, Leeds missed the whole of
the 2010s. Leicester's empty 2000s was already the precedent for partial
coverage.

Added: Blackburn, Bolton, Middlesbrough, Fulham, Charlton, Portsmouth,
Sunderland, Birmingham (2000s); Stoke, Southampton, West Brom, Swansea,
Crystal Palace, Sunderland (2010s); Brighton, Wolves, Brentford, Bournemouth,
Nottingham Forest, Leeds, Burnley, Fulham, Crystal Palace, Southampton (2020s).
56 cells: 18 / 17 / 21 by era, which fixes the 2000s being the thinnest decade.

**The 20-man quota** is 3 goalkeepers and 5 in each outfield group, with the
remaining places to the best of the rest. The spare places are awarded on how
far a player stands above the median *for his own position*: ranked on raw
rating alone, a forward took every spare place, because the phase weights make
attackers score higher across the board. Every cell came out GK3/DEF5/MID5/FWD7
and the pool would have been starved of defenders.

1,651 players became 1,120. The cost is real -- Sheringham, Crespo,
Shevchenko, Dzeko, Torres, Kanu, Lacazette and Nunez are among those a 20-man
squad cannot hold.

**Two constants moved, both measured.** `REPEAT_DECAY` 0.34 -> 0.90: the old
value was tuned across 32 cells, and at 56 it dropped the teammate-pair rate
from 29% to 15%. Two tests caught it mid-tranche, which is the only reason
chemistry did not die the same quiet death twice. `CURVE.END` 74 -> 72.5 and
`GAUNTLET_PEAK` 12 -> 10: the weaker clubs took 38-0 from 2.9% down to 1.5% on
their own. `CURVE.START`, the dial this file documents as the reversal lever,
turned out to be the wrong one -- it governs early matches that were never the
binding constraint. The run-in gauntlet was.

Final, over 6,000 drafted seasons: p10 20, median 32, p90 37, 38-0 at 2.8%. A
teammate pair appears in 31% of drafts, up from 25%.

The p10 falling from 23 to 20 is the point rather than a regression. Charlton
and Birmingham sit at 75 for their best seven where Liverpool sit at 90, so a
bad draw is now genuinely bad and the two skips finally have something to do.

**Where to check the data.** The 2000s and 2010s tenure counts are settled
history. The 2020s counts for clubs on the four-season line -- Leeds, Burnley,
Bournemouth, Forest, Southampton, Leicester -- depend on promotions and
relegations close to the edge of what is reliably known here, and are the rows
most worth verifying.

### 9. Telling the two modes apart

Reported as "I keep getting Aston Villa and West Ham, it's the same sequence
every time". It was not a randomness bug — free play's seeding measured clean
over 4,000 games (4,000 distinct seeds, uniform across clubs, uniform first
draw). It was the daily draft doing exactly what it is designed to do: the
2026-09-21 daily really does open `Aston Villa 2000s | West Ham 2010s | ...`,
and replaying it replays it.

The actual faults were UX and variety:

- **The prominent button was the one that never changes.** "Today's draft" was
  the primary action and free play was a ghost button under it. They are now two
  labelled mode cards under a "Two ways to play" heading, each stating its own
  behaviour — "different spins every single time" against "the same seven spins
  for everyone, until midnight UTC". Free draft is the primary.
- **A finished daily now says so**, showing your record on the card and warning
  that replaying repeats it.
- **A mode chip** sits in the top bar for the whole draft, so you always know
  which kind of game you are in.
- **No club twice in one draft.** Previously only the exact club/era cell was
  excluded, so a single game could serve two Chelsea cells and two Arsenal
  cells. With eleven clubs and seven rounds there is always room; the filter
  stands down rather than strand the draft.
- **Free play now seeds from `crypto.getRandomValues`** where available, falling
  back to the clock plus `Math.random`.

Five new checks cover it, including that a draft never repeats a club, that 400
free games open on a wide spread of cells with no cell dominating, and that the
daily is still byte-identical however often it is replayed.

---

## Deliberate deviation from the brief

**The brief asked for a median random team around 18-24 wins. It is now 10.**

Those two targets are not jointly satisfiable. The 18-24 band was calibrated when
a spin offered eight players and the season was far gentler. With the whole
roster on offer and the difficulty you asked for, a well-drafted side sits around
rating 88 and a random-but-sensible one around 62 — and no single response curve
puts the first at ~33 wins and the second at ~20 without making the 26-point
rating gap almost meaningless, which would gut the draft.

Your instruction to make it harder is the newer one, so it won. The test that
encoded the old band has been retargeted with a comment pointing here. If you
would rather protect the 18-24 band, the dial is `CONFIG.CURVE.START` — drop it
back toward 45 and random teams recover, at the cost of well-drafted sides
climbing back toward 36.

---

## Stubbed / out of scope

- No formation choice, no substitutes, no per-match narrative — the season
  resolves to a W/D/L string, not events.
- Sound is on by default. It only ever fires after a tap, and the preference is
  remembered.
- `tools/run-tests.mjs` is a dev-only convenience that lifts the `<script>` out
  of `index.html` and runs the same `runTests()` in Node, for tuning without a
  browser. The game does not need it and does not know about it.

---

## REVIEW flags — please audit

1. **`Man City` / `2000s` (38)** — pre-takeover City churned squads constantly
   and were relegated in 2001. Still the thinnest cell in the file, deliberately.
2. **`Everton` / `2020s`** — relegation fights, a points deduction and very
   heavy churn. The pool I am least confident about.
3. **`Aston Villa` / `2010s` (38)** — Villa were in the Championship from 2016 to
   2019, so only genuine top-flight Villa players are listed.
4. **`Leicester` has no `2000s` cell** — relegated in 2002 and again in 2004 and
   outside the top flight for the rest of the decade. An intentional sparse cell;
   the slot machine never lands there.
5. **`Gareth Bale` is `DEF` in `Tottenham` / `2000s`** — correct for the era, he
   arrived as a left-back, but it reads oddly next to his `FWD` entry in the
   2010s pool. Intentional.
6. **Very recent signings** across the 2020s cells are the most likely place for
   an error, since those squads are still moving.
7. **Ratings generally** — all 0-100 numbers are game ratings, my best judgment,
   and the most subjective thing in the repo. One number per player, all in one
   block.

Two rows I caught and removed during this pass, as a flavour of the error mode:
a set-piece coach listed as a City forward, and Sébastien Squillaci placed in
Arsenal's 2000s when he signed in 2010. Worth a spot-check of your own.

---

## Open questions for you

1. **Is 3.2% the right 38-0 rate?** `CONFIG.MATCH.MAX_WIN_PROB` is the blunt
   dial (lower = rarer) and `FORM_SWING` is the interesting one — more swing
   means more 38-0s *and* more disasters, without moving the median.
2. **Is a median of 33 still too high?** Raising `CONFIG.CURVE.START` pushes it
   down fastest.
3. **Should the daily draft be one-and-done?** It still lets you replay the same
   day, which undercuts the shared-seed idea.
4. **Should skipping cost something?** A club-skip and an era-skip are still free
   and independent.
5. **Roster sort order.** Currently by line (forwards first, as a team sheet
   reads), then by rating. Sorting purely by rating would be faster to scan but
   less thoughtful.
6. **Report benchmarks.** `CONFIG.REPORT.BENCHMARK` defines what "a title-winning
   seven" looks like per phase, and all the gap advice hangs off it. Those four
   numbers are a judgment call worth your eye.


### 10. When luck drowned the draft

Reported from play: a side the report called short in all four phases, with
"strongest" showing -3, finished 36-1-1 and was labelled RECORD BREAKERS.

Two faults, one cosmetic and one structural.

**The benchmark was unreachable.** `REPORT.BENCHMARK` was 86/82/85/85. Across
4,000 drafted sides, none cleared it in all four phases and only 13% cleared it
in even one, so the report told everybody their squad was short everywhere —
including players who had just won 36 matches. It is now 82/76/79/80, measured
from what sides winning 36-38 actually carry: 2.2% clear all four, 79% clear
one. A test now fails if it drifts back out of reach.

**Luck was deciding the season.** The correlation between squad rating and wins
was 0.35, so the draft explained about an eighth of the result. The phase gap
between a 20-win side and a 36-win side was under 1.5 points in every category,
because a hidden plus-or-minus 15 swamped it. `FORM_SWING` 15 -> 8 lifts the
correlation to 0.53 and raises p10 from 17 to 23: a good draft is no longer
ruined by the draw. `MAX_WIN_PROB` 0.955 -> 0.98 and the curve moved with it.

**What let both hide:** the only test on unbeaten seasons compared the unbeaten
rate to the perfect rate and had no absolute ceiling, so 12% against 3% passed.
A shape check was doing duty as a magnitude check. There are now absolute caps
on the unbeaten rate, on the share of seasons reaching CHAMPIONS, and on the
benchmark's reachability.

Three older bounds were relaxed in the same pass, all calibrated for a curve
that no longer exists: the random-team floor 8 -> 5 and the 38-0 floor 1% ->
0.4%. Only floors moved; the ceilings, which are what those checks guard, did
not.


### 11. The trait line that called 83 short of 83

Reported from play, with screenshots: the draft readout showed `PHY 84 /83`,
and the results screen then showed `PHYSICALITY 83 - Short of the 83 a side
needs`.

The squad trait was a raw mean, so the real figure was something like 82.57.
`toFixed(0)` rendered it as **83** while `shortfall = max(0, 83 - 82.57)` was
**0.43**, so the same row printed a number that clears the line beside a
verdict that says it does not. The value is now rounded once, where it is
computed, and that single integer drives the maths, the draft readout and the
report. Verified two ways: 0 disagreements across 800 trait rows in the engine,
and 0 across 12 rows driven through the real UI.

Worth knowing about the draft readout regardless: it averages the players
signed *so far*, so the seventh pick moves it. Six players averaging 84 can
land on 83 once the last one joins. That is arithmetic rather than a fault, but
it does mean the number is a running total and not a promise.

### 12. Tilting the result back towards the draft

Asked for: less swing, and a much better reward for a draft that ticks every
box. `FORM_SWING` 8 -> 5 and `STEEP` 0.125 -> 0.16 together lift the
correlation between squad rating and final record from **0.52 to 0.64**, so the
draft now explains about 41% of the outcome rather than 27%.

Raising `STEEP` was rejected once before, at `FORM_SWING` 15, because it helped
the strongest sides most and pushed unbeaten seasons *up*. With the swing
halved that is exactly the property wanted, and the overall unbeaten rate still
fell (3.6% -> 2.9%).

By draft quality, as 38-0% / unbeaten%:

| squad rating | before | after |
|---|---|---|
| top 10% | 5.0% / 13.8% | **4.5% / 16.8%** |
| middle | 0.0% / 1.4% | **0.0% / 0.4%** |
| bottom 20% | 0.0% / 0.0% | 0.0% / 0.0% |

An excellent draft goes unbeaten about one time in six; a middling one, one in
250; a poor one never. Raising `TRAITS.MAX_SWING` was tried and dropped -- the
cap almost never binds, so it changed nothing.

The ladder moved with the distribution: CHAMPIONS 32 -> 33, TITLE RACE 27 ->
29, EUROPE 21 -> 25, MID-TABLE 14 -> 17. TITLE RACE had swollen to 54% of all
seasons, one verdict for half the games played; it is now 39% with EUROPE on
25% and MID-TABLE on 12%. The test that guards this now reads the CHAMPIONS
line out of `VERDICTS` instead of hard-coding it, so it measures what players
are actually told.


### 13. A league instead of a ramp

Reported from play: "almost all dropped points happen in the run-in", and "a
lot of undefeated, never 38-0".

Both were the same fault. The opponent curve was a smooth ramp from 56 to 89
with only +/-2.6 of per-fixture wobble, so for an 85-rated squad the **first
fixture it was even 10% likely to drop was matchday 30**, and **81% of all
dropped points landed in the last twelve**. Twenty-nine rehearsals, then a
nine-match season. And because all the jeopardy sat in a handful of games at
the end, the difference between unbeaten and perfect came down to a few
near-coin-flips rather than to squad quality.

`CONFIG.CURVE` is gone. In its place `CONFIG.FIXTURES` builds a league:
nineteen opponents across four tiers -- 3 title rivals, 5 chasers, 6 mid-table,
5 strugglers -- each met home and away, away being three points harder, then
shuffled from a fixed seed so every player still plays the identical season.
A small late bias keeps the run-in meaningful without letting it own the year.

The shape now, for an 85-rated squad:

| | before | after |
|---|---|---|
| share of dropped points in the run-in | 81% | **43%** |
| fixtures it can realistically drop | 9 | **14** |
| first such fixture | matchday 30 | **matchday 3** |

And the compounding does what it was meant to. Six matches against title
rivals turn small gaps in squad quality into large gaps in the odds of winning
all six:

| squad | 38-0 before | 38-0 after |
|---|---|---|
| top 5% | 1 in 15 | **1 in 13** |
| top 10% | 1 in 25 | **1 in 20** |
| next 15% | 1 in 250 | **1 in 150** |
| upper middle | 1 in 1,000 | 1 in 714 |
| bottom 25% | never | never |

The share of unbeaten seasons that are also perfect rose from 15.5% to 18.5%
overall, and from 28% to 32% in the top five per cent -- which was the actual
complaint. Overall: unbeaten 1 in 29, 38-0 1 in 156, median 30.

Four tests replaced the one that asserted a steep ramp: that the season is a
real league with every opponent met twice, that at least three of the ten
hardest fixtures fall in the first half, that a good squad meets a real test
before matchday 13, and that the run-in still tightens but by less than twelve
rating points.


### 14. The harness was not playing the game

Reported from play: "it does not seem possible to get an 88 squad", against a
tier table that said 5.8% of squads reach 88+.

The player was right. `smartLineup` and `randomLineup` -- the samplers every
balance figure in this file came from -- did not draft the way the game does.
They picked cells with `rngPick(rnd, POOL.cells)`, uniformly across all 56,
never calling `spinCell`. So no `REPEAT_DECAY`. And they never removed
already-signed players from the offer, so a squad could in principle carry the
same player twice.

The effect was consistent and one-directional:

| | harness said | real loop |
|---|---|---|
| 38-0 | 1 in 156 | **1 in 347** |
| unbeaten | 1 in 29 | **1 in 51** |
| squads reaching 88+ | 5.8% | **3.1%** |
| median squad rating | 81.4 | 80.0 |

About twice as generous as the game, so every tuning pass since the samplers
were written was aimed at something nobody was playing.

Both now go through `draftThroughLoop`, which runs the genuine
`spinCell` / `offerFrom` / `assignPending` sequence and borrows the global
`GAME` because that is what those functions read, restoring it afterwards so
sampling has no side effects. Verified: 6.29 distinct clubs per sampled side
against 6.3 measured in real play, zero duplicate players, zero incomplete
lineups, `GAME` untouched.

Three tests now guard it: complete and duplicate-free sides, fewer distinct
clubs per squad than there are slots (which only the weighted spin produces),
and the live game unchanged by sampling.

**Corrected figures, 25,000 games through the real loop.** Note these use the
harness's role-normalised picking, which is a shade sharper than picking on
raw rating, so they sit slightly above a plain greedy player:

- champion or better: 1 in 4
- unbeaten: 1 in 34
- 38-0: 1 in 195
- squad rating: median 81.2, p90 86.1, p99 91.2
- drafts reaching 84+: 22.1%, 86+: 10.5%, 88+: 4.5%

| squad rating | champion+ | unbeaten | 38-0 |
|---|---|---|---|
| under 80 | 1 in 20 | 1 in 788 | never |
| 80-81 | 1 in 6 | 1 in 140 | 1 in 6,146 |
| 82-83 | 1 in 3 | 1 in 51 | 1 in 1,165 |
| 84-85 | 1 in 2 | 1 in 19 | 1 in 321 |
| 86-87 | 1 in 2 | 1 in 9 | 1 in 58 |
| 88+ | 1 in 1 | 1 in 4 | 1 in 13 |

The open question this leaves, which is the next thing to work on: reaching 88+
is 4.5% of drafts and picking better barely moves it -- an optimiser that
maximises squad rating every round reaches 88+ *less* often than plain greedy.
The ceiling is the spins, not the player's judgement, which is the opposite of
what the game is supposed to reward.

---

### 15. Making 88 mean something, and a third reel

Two requests in one: *"38-0 should be about 1 in 5 for 88+ squads, and
everything else should scale from there"*, and *"three spinners — club, era,
position — and you choose which two to spin each round, never the same two
twice."*

#### The rescale

The previous section left the game at 1 in 13 for an 88+ squad and 1 in 195
overall, with the ladder compressed: an 86-87 squad and an 88+ squad were nearly
the same bet. The dial that fixes that is `MATCH.STEEP`, which decides how much
of a match a rating advantage is worth. It went **0.16 -> 0.48**, and the four
fixture tiers moved with it (rivals 81 -> 80, mid-table 61 -> 62, strugglers
52 -> 53) so the median season did not collapse while the top of the ladder
stretched.

16,000 games through the real loop:

| squad rating | unbeaten | 38-0 |
|---|---|---|
| under 80 | 1 in 173 | never |
| 80-81 | 1 in 19 | 1 in 440 |
| 82-83 | 1 in 7 | 1 in 149 |
| 84-85 | 1 in 4 | 1 in 24 |
| 86-87 | 1 in 2 | 1 in 10 |
| 88+ | 1 in 2 | **1 in 5** |

Three consequences, each a deliberate decision rather than a side effect:

- **Verdict thresholds moved.** CHAMPIONS 33 -> 34, RECORD BREAKERS 35 -> 36,
  TITLE RACE 29 -> 30. A steeper curve raises the median season, and a verdict
  that most seasons clear is not a verdict.
- **The unbeaten test cap went 6% -> 15%.** This is the uncomfortable one. 12.9%
  of seasons now finish unbeaten, which reads high. It is the direct cost of the
  1-in-5 brief: you cannot make 88+ go 38-0 one season in five without also
  making very good squads hard to beat. The constant carries a comment saying so
  and saying to bring it back down if 38-0 is ever retargeted.
- **The random-team floor went 5 wins -> 2.** A steeper curve punishes a bad
  draft harder, which is the point.

#### The third reel, built and rejected

Built behind `CONFIG.DRAFT.WHEELS`: a line wheel alongside club and era, three
pairings usable twice each, choose which two to turn and hold the third.
Played for an evening and cut. It is recorded here because the measurements are
the reason, and because the same idea will come back.

One bug worth keeping: **3,500 of 6,000 test drafts ended with an incomplete
lineup.** Two rules were in conflict. "Each pairing exactly twice" says which
pairings you may still use; "you cannot hold a line you have already filled"
says which are legal. Late in a draft the remaining budget was routinely all
dead pairings, and the round simply refused. Letting budget win -- re-spinning
a held wheel that had gone stale rather than refusing the round -- fixed it.
Any future "choose which wheels to turn" mechanic will hit the same collision.

The reason it did not survive contact is that it is a much easier game, and the
numbers say why. A line wheel that only ever lands on a slot you still need
means every offer is usable:

| 25,000 drafts each | two reels | three reels |
|---|---:|---:|
| median squad rating | 81.3 | 85.0 |
| reaching 88+ | 4.7% | 21.9% |
| unbeaten | 1 in 8 | 1 in 3 |
| 38-0 | 1 in 50 | 1 in 15 |

The per-rating ladder was identical in both, because it is a property of the
season, not the draft. If the idea returns, the lever is the line wheel's
scarcity -- letting it land on lines you have already filled, so a held line
can be a liability -- and not the opponents, because moving those would break
the 1-in-5 the rescale was for.

---

### 16. The daily draft is not dealing you the same clubs

Reported from play: the daily draft seems to hand out similar clubs every time,
while the free draft feels more varied. Worth checking, because a daily seeded
from a date is exactly the kind of thing that goes subtly wrong.

It has not. Both modes draft from the same weighted spin; the only difference is
where the seed comes from. Over 700 drafts each:

| | daily (700 consecutive dates) | free (700 random keys) |
|---|---:|---:|
| distinct round-1 clubs seen | 31 of 31 | 31 of 31 |
| round-1 chi-square vs uniform (df=30) | 139.7 | 127.2 |
| distinct clubs per 7-round draft | 6.30 | 6.28 |
| clubs shared with the previous draft | 1.53 | 1.54 |

Statistically the same game. `hashString` already ends in an avalanche
specifically so neighbouring dates land far apart, and the measurement confirms
it works.

Two things are true underneath the report, though, and both are real:

**The reels genuinely favour big clubs, in both modes.** A club is dealt per
*cell*, not per club, and only ten clubs field a squad in all three eras:

| cells | clubs | share of any one spin |
|---|---|---|
| 3 | Arsenal, Man Utd, Chelsea, Liverpool, Man City, Tottenham, Newcastle, Everton, Aston Villa, West Ham | 54% between them |
| 2 | Leicester, Fulham, Sunderland, Southampton, Crystal Palace | 18% |
| 1 | the other 16 | 29% |

So 3.7 of your seven clubs come from those ten, every draft, in either mode.
That is the "same clubs again" feeling, and it is a property of who was in the
division for twenty-five years rather than a bug. Flattening it means weighting
the spin per club instead of per cell, which makes drafts harder on average,
because the one-era clubs are the weak pools. Left alone deliberately; noted
here as the lever if it ever needs pulling.

**One daily a day is one hand a day.** Replaying the daily repeats it, by
design. The variety in the free draft is partly just playing more of them.

---

### 17. The margin panel was reporting the luck twice

Reported from play: "I overperformed my projected wins, but the graph shows me
in the red and the text says I was even."

Three separate things were wrong, and they compounded.

**The bar and the words were drawn from different numbers.** `fortuneOf` calls
anything inside |f| < 0.22 an "even break" — the middle 44% of the range. The
CSS gradient underneath it had its neutral stretch hand-written at 46%-54%, the
middle 8%. So a marker could sit visibly in the red while the sentence above it
said the season was even. Measured: **14.3% of seasons**, 573 in 4,000, worst
case a marker at 39% under the words "an even break".

Both are generated from one table now (`FORTUNE_BANDS`), with the gradient
built by `fortuneGradient()` from the same thresholds the prose uses. Measured
again afterwards: 0 disagreements in 4,000.

**"Worth" was a second readout of the luck.** `expWins` summed `pWin` from the
season's `detail`, and those probabilities were computed at `a.rating + form` —
the form draw was already inside them. So the number labelled "what this squad
deserved" moved with the season's fortune: within a single rating band it
tracked the form draw at **r = 0.972**, swinging 5.6 wins p10-p90 for squads of
identical quality. A cursed season quietly lowered the bar it was then judged
against, so the screen told you that you did about right, directly underneath a
bar saying you had been cursed.

The match maths is now one function, `matchOdds(rating, opp, a, i)`, called
twice per fixture: once at the rating the season was played at, once at the
squad's own rating with the luck taken out. `expWins` sums the second. After
the fix the same correlation is **r = -0.002**, and the gap between Worth and
Took behaves the way the panel always claimed it did:

| fortune | mean (Took − Worth) |
|---|---:|
| Cursed | −1.63 |
| Unlucky | −0.86 |
| Even | −0.05 |
| Favoured | +0.91 |
| Charmed | +1.65 |

**The two sentences were stacked as rival claims.** Worth is now luck-free, so
the fortune line is the *cause* and the margin the *effect*; they are printed
in that order. About one season in ten still has a favoured side dropping
points anyway, which is honest dice rather than a bug, and those now read "Even
so, 1.6 wins left on the pitch" instead of asserting two opposite things in a
row.

Three tests guard all of it: Worth equals the sum of par odds, par does not
move with the form draw, and the generated gradient's neutral band is the band
the words call "Even".

---

### 18. Making the rating the story

The brief, in the player's words: an 81 should never win a league; 84-85 should
be Europe, a title chase, an outside shot at the title, very unlikely to go
unbeaten and with **no** chance of a perfect season; 87-88 should be winning
leagues, going undefeated, and maybe going 38-0.

The old ladder was nowhere near that. An 80-81 squad won the league one time in
four. An 84-85 went 38-0 one time in 28.

**The thing in the way was not the response curve. It was the luck.**
`FORM_SWING` was 5, meaning a season's fortune moved the team rating by up to
five points in either direction — *wider than the entire 84-to-88 stretch the
game is trying to tell apart*. A lucky 84 was, arithmetically, an 89, and went
perfect about as often as one. No amount of steepening fixes that, because
steepening amplifies the luck exactly as much as it amplifies the draft.

Four changes, in the order they matter:

1. **`FORM_SWING` 5 → 2.** The draft becomes the story. This one change did
   more than everything else combined.
2. **The whole opponent ladder up three points** (rivals 80→83, chasing pack
   71→75, mid-table 62→66, strugglers 53→57). An 84 now drops points to the
   chasing pack as well as to the rivals, which is what turns a title into a
   chase. Raising only the rivals did not work: a side that beats the other 32
   fixtures still reaches 34 wins.
3. **`STEEP` 0.48 → 0.55.** A modest nudge; with the luck reined in it no
   longer has to do the whole job.
4. **A new knob, `ELITE_DRAW_FROM` / `ELITE_DRAW_CUT` (87 / 0.32).** The top of
   the ladder was blocked by *draws*, not defeats — an 88-rated side already
   lost almost nothing, it drew four. Above 87 each rating point now shaves 32%
   off the draw chance. Cutting draws globally instead was tried and rejected:
   it lifted 38-0 at the top to 20% but also took an 82-83 squad from a 4%
   title rate to 27%, which is the opposite of the brief.

30,000 seasons through the real loop:

| rating | champion+ | unbeaten | 38-0 | median wins |
|---|---|---|---|---:|
| 80 | 1 in 836 | never | never | 27 |
| 81 | 1 in 288 | never | never | 28 |
| 82 | 1 in 52 | 1 in 366 | never | 29 |
| 83 | 1 in 18 | 1 in 167 | never | 30 |
| 84 | 1 in 7 | 1 in 57 | never | 31 |
| 85 | 1 in 4 | 1 in 29 | 1 in 825 | 32 |
| 86 | 1 in 2 | 1 in 12 | 1 in 255 | 33 |
| 87 | 1 in 2 | 1 in 8 | 1 in 51 | 34 |
| 88 | 1 in 1 | 1 in 4 | 1 in 19 | 35 |
| 89 | 1 in 1 | 1 in 3 | 1 in 7 | 36 |

One rating point, one win, the whole way up. In the 84-85 band, 2 perfect
seasons in 3,580.

**A test was retired rather than loosened.** "A median random-but-sensible team
is a relegation scrap" had had its floor lowered three times chasing the same
moving number (8 → 5 → 2), which is how a check stops guarding anything. A
random seven rates about 57, which is what this league's strugglers rate, so it
*should* win almost nothing; pinning a number on it only measured how hard the
season happened to be that week. The floor is gone and the assertions are about
shape instead — a careless side is a relegation side, drafting well is worth a
landslide, and `FORM_SWING` stays small enough that rating drives the result.
