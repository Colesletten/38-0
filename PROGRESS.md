# PROGRESS — 38-0

Build log for the single-file Premier League team-builder. The original brief is
in [`SPEC.md`](SPEC.md); how to play and how it works is in
[`README.md`](README.md).

## Status

All six milestones from the original brief are done, plus a second round of
changes from playtest feedback.

**88/88 self-checks green.** Verified in Chromium at 360×640, 390×844 and
1440×900, with `prefers-reduced-motion`, and opened directly from `file://`.
A Playwright network audit confirms the page still makes exactly **one** HTTP
request: the document itself.

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
- **Season fortune** (`MATCH.FORM_SWING = 15`). One draw from the lineup's own
  stream, added to the team rating for all 38 matches. This is what makes two
  equally good squads finish differently — it roughly doubled the spread between
  squads of identical strength — and it is shown to the player on the results
  screen as a "How it fell" scale rather than hidden in the engine.
- **A shallower response curve and a higher floor.** `STEEP` 0.170 → 0.125 and
  the opponent curve raised from 45-64 to 54-74, so rating still matters but a
  good squad is never a formality.

| how you draft | p10 | median | p90 | 38-0 | unbeaten |
|---|---:|---:|---:|---:|---:|
| random players, random slots | 0 | 4 | 11 | 0% | 0% |
| random players, sensible slots | 3 | 10 | 23 | 0% | 0% |
| best available, best slot | 23 | **33** | 37 | **3.2%** | 14.1% |
| pool's theoretical best seven | — | — | — | 6.8% | — |

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
