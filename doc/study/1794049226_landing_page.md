# Study: PokerNights landing page

Date: 2026-11-07. Mode: mixed. Design tool: taste-skill `design-taste-frontend`, then the motion pass.

## Goal

Build one public page. The page tells a visitor what PokerNights is for. It shows how to start in a few steps. It sends the visitor into the web app.

## Sources

All facts come from the app repository `~/PokerNights` at `bf30596` (2026-11-06):

- `PRODUCT.md`: users, purpose, brand commitments.
- `DESIGN.md`: "The Rack" design system (colours, type, radii, components).
- `doc/wiki/features.md`: what the app does today, the game-night flow, install steps, limits.
- `doc/wiki/deployment.md`: production address.
- `doc/showcase/`: `live-set.png`, `thumbnail.png` (synthetic demonstration data).
- `static/branding/`: `logo-mark.svg`, `logo-horizontal.svg`, `logo-mono.svg`.
- `static/fonts/archivo.woff2` (OFL).
- `web/tests/browser/`: Playwright probes and seed fixtures with synthetic players.

## Facts the page must respect

- **Product.** PokerNights records buy-ins and cash-outs for a home poker cash game. It checks that the books balance. It calculates who pays whom, with the fewest transfers. It does not move money.
- **Users.** Hosts who keep the bank. Players who check their totals. Private groups of friends in the Philippines.
- **Units.** Pesos (₱1,600 or ₱1,600.50) or chips. The app does not convert between them.
- **Structure.** A session is one gathering. It holds one or more sets. Settle-up happens once, at the end of the session.
- **Access.** The app is at `https://pokernights-five.vercel.app`. Log in is `/accounts/login/`. An account can be made only from an invite link (`/join/<token>/`). A superuser adds the first host of a group. So the page cannot offer an open sign-up.
- **Install.** It is an installable web app. On iPhone: Safari, Share, Add to Home Screen. On Android: Chrome menu, Install app. A link opened inside a chat app's browser cannot install; the app explains this.
- **Brand commitments.** Dark theme. Plain, short words that are exact about money. Signed wins and losses. No casino imagery. No invented claims.
- **Name.** The brand spells it `PokerNights`, one word. The logo mark is a chip with a crescent moon.

## Inventory of the subject

Things that belong to PokerNights and to no competitor:

1. The name: a night, and the mark is a poker chip with a crescent moon in it.
2. The "Friday table" with blinds ₱10 / ₱20 and a two-hour set timer.
3. The indigo felt panel with its diamond texture. It appears only while a set is running.
4. Player tokens: circular initials with a chip edge, in ten chip colours (`c1`–`c10`).
5. The pot figure that rolls when a rebuy lands ("Still in play ₱9,850").
6. "Who pays whom", with the fewest transfers, after payments made at the table.
7. "It never moves money." This constraint defines the product.
8. Pesos, centavos, the Philippines, a group chat in Messenger or Viber.
9. A dim room, late at night, one hand free, short glances between hands.
10. The seat draw: every phone plays back the dealer and the order around the table.
11. The count-up chip rack: tap a chip to add one, hold to remove one.
12. The shared results card: a 1080 px picture sent to the group chat.

## The argument

| # | Section | Claim | Proof |
|---|---|---|---|
| 1 | hero | It keeps the bank for your home game and works out who pays whom. | The live set, working: tap Rebuy and the pot rolls. |
| 2 | showcase | Each player is one row; a rebuy is one tap. | The same player row in three states; the middle one works. |
| 3 | how-it-works | You can start tonight in four steps. | One session card in four fields: invite, join, play, settle. |
| 4 | features | It does the arithmetic a notebook makes you do. | A comparison in words: PokerNights against a notebook and a group-chat tally. |
| 5 | faq | The real worries have plain answers. | Seven answers taken from the wiki. |
| 6 | cta | Your first step is one field. | The open "Open PokerNights" dialog: paste an invite link or log in. |
| 7 | footer | It is a small tool for friends. | One quiet line. |

## Direction

Dealt with `draw.mjs --sector consumer-app --have product-ui --keep palette,type`. Three options: `page-is-the-object`, `product-performs`, `one-motif`.

Chosen: **`product-performs`** (seed 714946187). Reason: the app's own screens are its best picture, they already exist in the brand, and the product's defining act (tap Rebuy, the pot rolls, the settle-up appears) can run on the page. `one-motif` (the chip) was the second choice; it would describe the app instead of showing it.

The sheet is saved at `.taste-skill/direction.json`. Slots:

- Hero: "Control that reads the page". Two tone halves (`ground` left, `rail` right). Headline bottom-left. The working fragment on the right.
- showcase: "One row, three states".
- how-it-works: "One card, four fields". This becomes the quick start.
- features: "Comparison set as text".
- faq: "Accordion of filled tiles".
- cta: "First step, already open".
- footer: "A single quiet line".
- Motion signature: "Masked headline".

## The idea

> On this page, **the Friday table's own bank (the rolling pot, the chip-edged player rows and the who-pays-whom list)** becomes **working interface fragments that play one game night as the visitor scrolls**.

Competitor test: a generic expense splitter has no set, no rebuy, no pot, no felt and no chip tokens. The sentence fails for it. The idea belongs to PokerNights.

**Hero adaptation.** The blueprint's fragment "reads the page". Here the fragment reads the visitor's moment: the live badge shows the visitor's own local time, and the set timer counts from the moment they arrived. Each visit is different.

**The one live thing.** The hero's live set. The visitor taps Rebuy on any player. The row gains a rebuy, the "bought in" figure rises, and the pot rolls up. In field 4 of the quick start, the "who pays whom" card recalculates from those buy-ins against fixed cash-outs, with the fewest transfers. Without JavaScript, the fragments show a fixed, correct state.

## Brand against house rules

| Conflict | Decision |
|---|---|
| House rule bans indigo; the brand's felt is indigo. | Keep the brand. Use felt only where the app uses it (a running set) and on the cta field. Run the inspector with `--allow` for that rule only. |
| House rule bans hairlines; the app's rows have hairlines. | Hairlines only inside `data-ui` fragments. None on the page itself. |
| Sheet says the accent goes on the action. | The brand's action colour is bone (`button-primary`). Brass stays for focus and attention, as in the app. |
| Buttons must be square or pill. | Outside fragments, use pill (`rounded.pill`). Inside fragments, the app's 15 px radius. |
| Type. | Archivo only, self-hosted from the app's `archivo.woff2`. Five size steps at most. |

## Imagery

Order of preference, from the skill:

1. **The project's own.** Real captures of the app running locally on the synthetic seed fixtures:
   - Short screen recordings (muted loops, each with a poster frame): the seat-draw overture, a rebuy with the rolling pot, the count-up chip rack, the settle-up list. Recorded with Playwright `recordVideo` at 390 × 844, then encoded with ffmpeg to H.264 MP4 and WebM.
   - Cropped stills from the same runs, plus `live-set.png` and the share-results card.
   These give the four-picture floor and the one moving picture.
2. **HTML fragments** (`data-ui`) for the live parts: the hero set, the showcase row, the four session cards, the cta dialog. They copy the app's tokens and markup patterns.
3. **Found pictures** of the subject's world (a home table at night) are optional. They risk the brand's "no casino imagery" rule. See the open questions.

No device frames. No browser frames. No fake dashboards.

## Copy deck

Two-line budget checked for Archivo at the hero size on a 390 px phone (about 32 characters).

**Hero**
- Headline (line breaks fixed): "Who pays whom," / "worked out." (26 characters; the brand's own line from `thumbnail.png`.)
- Sentence: "PokerNights keeps the bank for your home poker game: buy-ins, rebuys, cash-outs and the settle-up. It never moves money."
- Button: "Open PokerNights" → `https://pokernights-five.vercel.app/`.
- Top-right link: "Log in" → `/accounts/login/`.
- Fragment: "Friday table · Set 1 · In play", "Still in play ₱9,850", "Set timer 2 h 00 min", "Blinds ₱10 / ₱20", six players (Miguel, Carlo, Trina, Paolo, Jerome, Bea), each with Rebuy.

**Showcase** (heading "One row per player")
- State words: "Sits down", "Rebuys", "Back in".
- Row: Carlo. "1 buy-in · ₱1,000 bought in" → actions revealed → "1 buy-in + 1 rebuy · ₱2,000 bought in". The middle row's Rebuy works.

**How it works** (heading "Your first night")
1. "First, your host sends a link." Card: "You're invited to Friday table · Hana invited you · 8 players".
2. "Then put it on your phone." Card: Join group, then "Share → Add to Home Screen" (iPhone) or "Install app" (Android).
3. "The host keeps the bank." Card: the set in play, buy-ins and rebuys, timer running.
4. "Last, who pays whom." Card: the closed session, signed results, transfers. Live from the hero.

**Features** (heading "Next to a notebook")
Columns: PokerNights · Notebook · Group-chat tally. Rows, answered in words:
- Buy-ins and rebuys: "One tap, with the time" · "Written by hand" · "Typed by whoever remembers".
- The books balance: "Checked at count-up, the gap named" · "Add it up yourself" · "Scroll up and add".
- A wrong entry: "Reversed with a reason, kept in the log" · "Crossed out" · "Edited, history lost".
- Who pays whom: "Worked out, fewest transfers" · "Do the sums at 2 a.m." · "Argued in the thread".
- Pesos or chips: "Either, never mixed" · "Whatever you wrote" · "Whatever you wrote".
- Chip count: "Tap the chips, it adds them" · "Count twice" · "Count twice".
- Seats: "A drawn dealer and order on every phone" · "Cut the deck" · "Cut the deck".
- Rake: "Per buy-in, tracked apart" · "Hard to track" · "Hard to track".
- History and stats: "Every closed session, per player" · "Lost with the notebook" · "Buried".

**FAQ** (heading "Before you play")
1. Does PokerNights move money? No. It records who owes whom. You pay each other as you always do. The host marks each transfer paid.
2. How do I get in? Ask your host for an invite link. A link works for 7 days. You make your account from it.
3. I want to host. How do I start a group? (Answer depends on an open question.)
4. Does it work in chips as well as pesos? Yes. Each game counts in pesos or in chips. The app never converts between them.
5. Can a friend without the app play? Yes. A host adds them by name, with no login, and records for them.
6. What if someone enters a wrong amount? The host reverses it with a reason. The reversed entry stays in the log. If a gap remains at count-up, the host notes who absorbs it.
7. Is it an app from the store? No. It is a web app. Put it on your home screen from Safari or Chrome. A link opened inside Messenger or Viber must open in the real browser first; the app shows how.

**CTA** (felt field)
- Closing line: "Deal everyone" / "in tonight."
- Sentence: "Paste the invite link your host sent, or log in if you already play."
- Dialog "Open PokerNights": a choice "I have an invite" / "I have an account". The field holds an example link. The button reads "Join the group" or "Log in". It opens only links on the PokerNights address; any other text is refused in words.

**Footer**
- Left: "The bank for home poker nights".
- Centre: "Open the app", "Log in", "Put it on your phone" (anchor to step 2).
- Right: "© 2026" and the credits for any found picture.

## Technical notes

- Stack: Astro, static output. No server code. The live parts are small vanilla TypeScript modules (`astro` `<script>`), as the app uses vanilla JavaScript.
- Settle-up logic: a pure function (greedy match of the largest debtor with the largest creditor) with unit tests (Vitest). Integer centavos only, as in the app.
- Motion: `motion` package `animate()` for the pot roll and the reveals, or CSS where it is enough. Every move has a reduced-motion fallback.
- Gate: `lint.mjs` and `inspect.mjs` from the taste-skill at 1440, 768 and 390 px.
- Host: Vercel is the app's host, so the same account is the simplest choice. See the open questions.

## Open questions

These go into the plan.

1. **Host and domain.** Vercel (same as the app) or Netlify? A domain of its own, or `*.vercel.app` for now?
2. **New hosts.** A superuser must add the first host of a group. What does the page tell a person who wants to host: a contact email, or nothing?
3. **Found pictures.** Allow one or two real photographs of a home table at night (from open collections, credited), or only the app's own captures? The brand says "no casino imagery".
4. **Name.** Use the brand spelling `PokerNights` everywhere?
5. **Privacy link.** There is no privacy page. Leave it out of the footer?
6. **Recording.** May I run the app locally on its synthetic seed fixtures to record the videos and stills? It runs in a temporary database and does not touch production.
