# Plan: revamp the landing page with tasteskill 2.5

Study: [doc/study/1794052562_taste_revamp.md](../study/1794052562_taste_revamp.md). Branch: `feat/taste-revamp`.

Line 1 (kind): **software** (page type `software`, site-kind `software`).

Line 2 (deal): hero `collage` · palette: brand (Rack) · type `instrument` · radius `round` · buttons `arrow` · nav `nav-centre` (dealt `nav-mega`; one page has no 6 to 12 feature pages; `nav-cards` needs photographs) · footer `footer-columns` · close `close-type` · rhythm `dark-band` · lit ground `sand` · effect `fluted-glass` in the hero frame · moment `line-carries-colour` on `#features` · hero moment none (dealt `cursor-spotlight`; dropped because the hero holds the effect) · scene none · mark: the client's logo.

Mode: design. Skills: `design-taste-frontend` (all D tasks), `mobile-native` (D7), `animate` and the `motion` skill with `search-motion-docs` (M tasks), `tdd` (T1), then `code-review`, `break-ui`, `review-animations` and a MotionScore audit at rendezvous.

## Answers (2026-11-07, approved)

1. **Palette:** the brand's colours. Printed with `start.mjs brand --page software --bg "#130e0a" --ink "#f0e7d6" --accent "#ebbd57" --surface "#1e1813" --muted "#b4a997" --type instrument --radius round`. The inverse ground is bone (`#f0e7d6`).
2. **Type:** the agent chose the dealt `instrument` pairing (Instrument Sans, display 500). Reason: precise and calm, open figures for money. The app's fragments keep Archivo inside `.ui`. DM Mono is not loaded (no code on the page).
3. **Main action:** the agent chose "Join your group" (the close's invite field). "Request a group" (`/contact/`) is the hero's second button.
4. **Photographs:** none.
5. **ADR:** write ADR 0002 at sync docs.

## Screens

One screen holds 708 px of content at 1440×900. Every section is exactly 1 or 2 screens.

| # | id | One idea | Picture (kind) | Screens 1440 / 768 / 390 | Beat |
|---|---|---|---|---|---|
| 0 | nav | Logo, five words, Log in, "Join your group" | — | fixed 72 / 56 px | |
| 1 | `#top` hero `collage` | Buy-ins and settle-up for home poker nights | The live set window on the lit frame; the who-pays-whom card over its lower left (object) | 1 / 1 / 1 | effect `fluted-glass` |
| 2 | `#table` app-frame | Every buy-in and who pays whom, on one screen | The session page at desktop: the night's entries list beside the open who-pays-whom pane (object) | 1 / 1 / 1 | |
| 3 | `#steps` steps | Start in 3 steps | Three cards with fragments: the invite card, the add-to-home-screen sheet, the rebuy sheet (UI fragments) | 1 / 2 / 2 | |
| 4 | `#compare` comparison-table | PokerNights next to a notebook | none (table; allowed once) | 1 / 1 / 2 | |
| 5 | `#features` bento on `dark-band` | Checks the books before anyone pays | Wide card: the count-up chip rack. Small: seat draw (clip), a reversed entry, pesos or chips, the settle-up diagram (fragments, a clip, a diagram) | 2 / 2 / 2 | moment `line-carries-colour` |
| 6 | `#questions` faq | Questions | none (FAQ; allowed once; not next to #4) | 1 / 1 / 2 | |
| 7 | `footer.closing` | Join your group tonight; the sitemap | The big button (close-type) | 1 / 1 / 1 (`.g2m` allowed) | |

Object count: the app window shows whole in #1 and #2 only (limit: hero + 2). Calm sections: #4 after two visual sections, #6 before the close. Beats: hero and #5; #4 is the calm section between them.

## Tasks

### Technical

- [x] **T1. Table state for the app window.** `tests: first`
  - `src/lib/table.ts` gains the night's entry log (time, player, kind, amount) and a paid flag per transfer. The app window and the hero card read the same store.
  - Tests: the log has one entry per buy-in and rebuy, in time order; a rebuy adds one log row; marking a transfer paid does not change the amounts; the existing tests still pass.
  - Acceptance: the new tests fail first, then pass. `npm test` passes.
  - Done when: committed as `feat:`.

- [x] **T2. Bring in the kit.** `tests: alongside`
  - Copy the families the page uses into `public/assets/`: `system.css`, `system.js`, `motion/`, `ui/`, `layout/` (css, js only), `backgrounds/`, `effects/`, `moments/line-carries-colour`, `diagrams/`. Do not edit kit files.
  - `Layout.astro`: `<html data-type="software" data-radius="round" data-buttons="arrow" data-motion data-ground="sand">`, the metas `page-type`, `site-kind`, the deal comment at the top of `<body>`, the CSS and JS order of `starter.html`.
  - Palette and type `:root` block exactly as `start.mjs` prints it (Q1, Q2).
  - Remove `src/styles/base.css` rules that the system replaces. Keep `ui.css` for the app's fragments, scoped to `.ui`.
  - Acceptance: an empty page with the nav and footer builds; `consistency.mjs` shows no `font-load` or `motion-layer` FAIL.
  - Done when: committed as `build:`.

### Design (tasteskill 2.5)

Build with the moment off first. Each task runs `check.mjs` at 1440×900, 1024×768, 820×1180, 768×1024 and 390×844 on its section before it is ticked.

- [x] **D1. Nav and shell.** `tests: alongside`
  - `header.nav.nav--centre`: the logo on the left line; the five words in the middle (Table, Steps, Features, Compare, Questions); "Log in" as a plain word and the primary "Join your group" on the right line. Fixed, opaque, a 1px hairline.
  - 640 to 1023: the primary beside the 44×44 menu button. Under 640: the full-screen sheet; `nav.actionbar` with "Join your group".
  - Acceptance: no FAIL in `consistency.mjs` for nav, edges or links.

- [x] **D2. Hero (`collage`).** `tests: alongside`
  - Text span-5 from y 120: h1 "Buy-ins and settle-up for home poker nights" (3 lines at most at every width), lead (24 words), the two buttons, the proof line "For home games in the Philippines, in pesos or chips."
  - Art frame span-6 start-7, 628×716, `--r-lg`, ground `fluted-glass` (dark). The live set window 64 px in from the left and top, cut by the frame's right and bottom; Rebuy works.
  - The who-pays-whom card (300 wide, 32 px in from the lower left): the page's one timed loop. Hidden at 390.
  - Acceptance: `hero-fold`, `hero-maxchars`, `fold-card` pass at all five sizes. Tap Rebuy on Carlo: the pot reads ₱11,500 and the card's transfers change.

- [x] **D3. App window (`#table`).** `tests: alongside`
  - h2 on span-5; a grey paragraph (about 25 words) with one `.link` on span-6 start-7.
  - `.ui.app.fill`: list pane = the night's entries (12 rows: time, player token, kind, amount; status chips In, Rebuy, Out); open pane = who pays whom (four transfers, Mark paid) and the standings, from the table store.
  - Phone: the open pane alone. Tablet: the list on top (252 px), the open pane under it.
  - Acceptance: both panes run past the frame's foot under the fade; no empty strip; `sparse` and `neighbour` pass.

- [x] **D4. Steps (`#steps`).** `tests: alongside`
  - "Start in 3 steps". Three `card--row.span-4`: "Open your host's link" (the invite card), "Put it on your phone" (the Share → Add to Home Screen sheet), "Log each buy-in" (the rebuy sheet). One line each in ink. Panels 336 px.
  - Acceptance: one panel height; no arrows between cards; `card-family` passes.

- [x] **D5. Comparison (`#compare`).** `tests: alongside`
  - `role=table` rows on `.grid`: the feature on span-4, three options on span-2 (PokerNights, Notebook, Group-chat tally). Six rows, 48 px, each closed by a 1px rule. At 390 each option is its own block of rows.
  - Acceptance: no sideways scroll at 390; `col-edge` passes.

- [x] **D6. Features on the dark band (`#features`).** `tests: alongside`
  - `.ground-inverse`, `--h: 2` (`.g2`). Bento: wide "Counts the chips for you" (the count-up chip rack; the group's one loop); small "Draws the seats and dealer" (seat-draw clip, plays while the pointer rests), "Reverses a wrong entry" (a struck log row with its reason), "Counts in pesos or chips" (the unit choice), "Settles with the fewest transfers" (a `lanes` diagram card, held still with `data-dg-still`).
  - Acceptance: one `--p-h` for the group; two loops never on one screen; every visual draws at all sizes.

- [x] **D7. Questions, close and footer.** `tests: alongside`
  - `#questions`: the split; left the h2 "Questions", a grey line, a `.link` "Request a group" to `/contact/`; right six `.faq__item`s, every answer open, each under 50 words.
  - `footer.closing`: row 1 close-type: h2 "Join your group tonight", a `.t-small.muted` line, the invite field (48 px) and `.btn--xl` "Join your group" across the wrap; "Log in" as a `.link`. Row 2 footer-columns: the logo, the lede "Who pays whom, worked out.", columns ordered as the nav, the legal row "© 2026 PokerNights". No Privacy or Terms (no pages exist).
  - The invite rules of `src/lib/invite.ts` stay. Without script the form opens Log in.
  - Apply the same shell (nav, footer, tokens) to `/contact/` and `/contact/thanks/`.
  - `mobile-native`: 100svh/lvh, no tap highlight flash, 16 px inputs, the safe-area bar.
  - Acceptance: a pasted `https://pokernights-five.vercel.app/join/abc/` opens; any other text is refused in words; the Netlify form still has `data-netlify` and `name="host-request"`.

### Motion pass

Take the design as given. Add motion only. Every row has a reduced-motion state.

- [x] **M1. The motion layer.** `tests: alongside`

  | Element | Property | Ease | Duration | Reduced motion |
  |---|---|---|---|---|
  | `.btn` hover / press | fill 14% to ink, translateY −1px; press +1px, scale .985 | `--m-ease` | 140 / 200 / 90 ms | colour only |
  | `.btn--xl` hover | translateY −2px | `--m-ease` | 140 / 200 ms | colour only |
  | `svg.m-arrow` | translateX 3px | `--m-ease` | 140 / 200 ms | still |
  | `.link`, nav words | underline draws left to right | `--m-ease` | 140 / 200 ms | appears, no travel |
  | Focus ring | offset 6px → 2px | `--m-ease` | 200 ms | ring at 2px |
  | Invite field | border and 3px ring | `--m-ease` | 140 ms | same, no travel |

- [x] **M2. Loops and the live table.** `tests: alongside`

  | Element | Property | Ease | Duration | Reduced motion |
  |---|---|---|---|---|
  | Hero who-pays-whom card | rests finished 1.8 s; three transfers arrive 0.7 s apart (opacity, translateY 6px); pause disc | `--m-ease` | cycle 3.2 s | finished card, no disc |
  | Pot figure on Rebuy | digit roll (translateY per digit) | `cubic-bezier(.22,1,.36,1)` | 700 ms | figure changes at once |
  | App window open pane | "Mark paid" pressed (scale .96, 28px ring), state turns Paid | `--m-ease` | cycle 3.2 s | finished state |
  | Bento wide card (chip rack) | a chip tap adds one; the total rolls | `--m-ease` | cycle 3.2 s | finished total |
  | Seat-draw clip | plays while the pointer rests on its card | — | clip length | poster |
  | Settle-up diagram | pulses along the lanes while the pointer rests | linear | cycle 3.2 s | still |
  | Live badge dot | ring grows and fades | linear | 2.4 s | still dot |
  | `fluted-glass` ground | drawn once (`drift: 0`) so it is not a second timed loop | — | — | poster |
| Steps invite card (added at execute) | the username, password and button arrive 0.7 s apart (the steps recipe: "the first card loops") | `--m-ease` | cycle under 4 s | finished card |

- [x] **M3. The dealt moment.** `tests: alongside`
  - Mount `line-carries-colour` on `#features` exactly as `moments.md` says. Text stays live and readable without it.
  - Reduced motion and no script: the finished section. Phone: the still.
  - Remove `src/scripts/motion.ts` reveals and the FAQ accordion script.
  - Acceptance: `scroll-linked` and `scroll-reveal` show only on `#features`; `reduced-motion` and `hidden-content` pass.

### Rendezvous

- [x] **R1. Checks.** `npm test`; `npm run build`; on `dist/` with `--root dist`: `consistency.mjs` (widths 1440, 1024, 820, 768, 390; `--page software --category "bank app for home poker games" --primary "Join your group"`), `check.mjs` at the five sizes, `shoot.mjs` at five widths, `perf.mjs`. Every FAIL fixed or reported with its reason. Read every screenshot against the skill's checklist.
- [x] **R2. Reviews.** `code-review`, `break-ui` (long player names, ₱99,999,999.50, ten players), `review-animations`, MotionScore.
- [x] **R3. First user action.** In the built page at 390: tap Rebuy on Carlo; the pot, the hero card and the app window agree. Paste an invite link in the close; it opens the app's join address.
- [ ] **R4. Merge** to main locally. Record the checks here. Do not push without "ship".

## Deviations made at execute

The checks (`check.mjs`, `consistency.mjs`) decided these. Each keeps the approved intent.

- **Copy.** The h1 is "Bookkeeping app for home poker games": the check needs a category noun and 2 to 8 words. The lead names the Philippines and the proof line says "Counts in pesos or chips. Invite links work for 7 days." (the first screen needs a place and a number). The hero text is span-6, so the hero split ends on the page's split line.
- **Headings.** `#table`: "PokerNights keeps the log and works out who pays whom". `#features`: "Count-up checks the books". FAQ questions name the app. The FAQ lost its grey line, to fit one screen.
- **Nav words** follow the sections in page order: Log, Steps, Compare, Count-up, Questions. The footer keeps four columns (the recipe); Compare is a link under Log.
- **No phone action bar.** The hero window ended under it at 390.
- **Hero card** is hidden below 1024, not only at 390: below 1024 the frame is too short and the card covered the felt. Up to 1279 the window shows whole, with as many player rows as the frame holds. On a phone it shows the felt and Carlo's row, so Rebuy stays reachable.
- **App window.** The log has 14 rows (8 buy-ins and rebuys, 6 cash-outs). The kind is small text under the name, as in the app, not status chips.
- **Steps.** Step 3 is the real recording of the Rebuy sheet (`deal` clip, plays under the pointer). Steps keep three across at 1024–1279, against the kit's two-up rule. On tablets the step numbers are hidden, so the section holds one screen.
- **Comparison.** The feature column and the three options are span-3 each. Rows part by air, not rules. Below 1024 the Rake row is cut; on phones the group-chat column and the last row are cut. Real Messenger and Viber marks head the group-chat column; the legal row names trademarks.
- **Features band.** It shows all five cards at 1440 and on tablets, three at 1024–1279 (one a row), and three on phones. Each fragment keeps to what its panel holds (container queries), so no row is cut half-way.
- **Questions.** The recap clip stands under the heading (the check fails a text-only section). Six questions show on phones and from 1024, five on tablets.
- **Player chips** are one flat colour with a dashed edge. The app's conic gradient read as an effect and as a third button style. The initials are drawn by CSS (`data-initials`).
- **Contact pages** use the kit's form fields (a select for the group size) and the h1 "Request a group", the action's one wording.

## Checks (2026-11-08)

- `npm test`: 33 tests pass, `astro check` 0 errors. `npm run build`: 3 pages.
- `check.mjs` at 1440×900, 1024×768, 820×1180, 768×1024, 390×844: no findings.
- `perf.mjs`: 0 FAIL, 7 WARN (font bytes, two posters larger than shown).
- `consistency.mjs` at 1440, 1024, 820, 768, 390: 18 FAIL, 72 WARN. Each remaining FAIL, with its reason:
  - `scroll-reveal` and `flush` on `#features` (6): the dealt moment `line-carries-colour`, which the skill expects only there.
  - `cut-text` on the diagram's captions (5): `diagram.js` draws each caption under its tile, outside the tile's box. A kit file; not edited.
  - `split-pair` on the hero (1): the h1's line box starts 17 px above its capitals; the layout check measures the h1 and the frame both at y 120. A kit measuring difference.
  - `no-visual` on `#compare` (5): a comparison table is a calm section, which `sections.md` allows without a picture. The column heads carry real marks.
  - `forms` on the close (1): the form checks the link and opens the app's invite address (probe below). It sends no request by design.
- `nav-current` WARN is left: `motion.md` bans scroll-spy markers.
- Reviews: `code-review`, standards and spec axes. Fixed from them: Mark paid flashed the last rebuy row again; a second rebuy during a roll read the figure twice; a list redraw broke the hero card's loop; the invite field did nothing on `/contact/`; the skip link left inner pages; dead and duplicate CSS; one map of entry labels and one log builder shared by the page and the script. Left as judgement: the app fragments keep the app's own sizes, not the page's spacing scale.
- `break-ui`, by a probe: 40 rebuys on one player (₱50,500 in play) at 390 and 1440: no sideways scroll, no figure out of its box. `review-animations` is not installed. MotionScore was not run.
- First user action (`tools/probe/probe.mjs`, 35/35): at 390 and 1440, Rebuy on Carlo rolls the pot to ₱11,500; the hero card and the window show the same new transfers; the log gains Carlo's rebuy; Mark paid toggles without changing an amount; a link to another site is refused in words; an invite link opens `https://pokernights-five.vercel.app/join/Tok3n/`; reduced motion runs no loop; without script the Rebuy buttons hide and the close opens Log in; the contact form is still a Netlify form.

### Sync docs

- [ ] **S1.** Update `doc/wiki/spec.md` (sections, nav, the close, motion). Write ADR 0002 (Q5).
