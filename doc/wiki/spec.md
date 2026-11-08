# Spec: PokerNights landing page

The page tells a visitor what PokerNights does and how to start. It sends the visitor into the web app. Facts about the app come from `~/PokerNights` (`PRODUCT.md`, `doc/wiki/features.md`). The look follows tasteskill 2.5.1 ([ADR 0002](../adr/0002-tasteskill-revamp.md), [ADR 0004](../adr/0004-more-scroll-motion.md)).

## Pages

| Address | Content |
|---|---|
| `/` | The landing page. |
| `/contact/` | "Request a group": a Netlify Form named `host-request` for a person who wants to host and has no invite. |
| `/contact/thanks/` | The page after the form is sent. |

Every page has the same nav and the same closing footer.

## Where the links go

All app addresses are in `src/lib/links.ts`.

- "Join your group" (the main action, in the nav, the hero and the close): goes to `#join`, the invite field in the close.
- The invite field opens a pasted link only if it is on the app address and its path is `/join/<token>/` or `/claim/<token>/` (`src/lib/invite.ts`). Any other text is refused in words. The field works on every page.
- "Log in" (nav, close, footer): `https://pokernights-five.vercel.app/accounts/login/`.
- "Request a group" (hero, questions, footer): `/contact/`.
- "Open the app" (footer): `https://pokernights-five.vercel.app/`.
- The page never offers an open sign-up. The app makes accounts only from an invite link.

## Nav

The logo; the words Log, Steps, Compare, Count-up, Questions (each opens its section); "Log in"; the button "Join your group". Below 1024 px the words go into the menu sheet.

## Sections of `/`

Each section is exactly one or two screens tall. From 1024 px, Log and Steps are two screens and hold for the second one.

1. **Hero.** "Bookkeeping app for home poker games." A working copy of the app's set page in a lit frame: six synthetic players, the pot, the set timer, Rebuy on each row. A who-pays-whom card overlaps the window from 1024 px. On a phone the window shows the felt and Carlo's row.
2. **Log (`#table`).** The app's session page at desktop: the night's log (buy-ins, rebuys, cash-outs) beside who pays whom, with Mark paid, and the results. From 1024 px it replays the night with the scroll (see Motion).
3. **Steps (`#steps`).** Three steps: open the invite link, install the app on your phone, log each buy-in in the app. Each step has its screen: the invite card, the install card, the deal clip. From 1024 px the steps open one at a time with the scroll; below that each step is a row with its screen.
4. **Compare (`#compare`).** PokerNights against a notebook and a group-chat tally, in words.
5. **Count-up (`#features`).** On the bone band: the chip count, the seat draw, a reversed entry, pesos or chips, and the settle-up diagram. Narrow screens show three of the five cards.
6. **Questions (`#questions`).** Six questions, every answer open (five on tablets).
7. **Close and footer.** "Join your group tonight", the invite field, then the footer columns and the legal line.

## The live table

- `src/lib/table.ts` holds one shared table. Six players, ₱10,500 bought in, usual buy-in ₱1,000. It keeps the night's log (each buy-in and rebuy with its time) and a paid mark per transfer.
- A rebuy adds ₱1,000 to that player and one row to the log. The pot, the player rows, the hero card, the log, the transfers and the results update together (`src/scripts/live.ts`). A rebuy clears the paid marks, because who pays whom changes.
- Mark paid toggles a transfer's paid mark. It changes no amount.
- At the end of the night each player keeps a fixed share of the table, rounded to ₱50. The last player takes the rest, so the books balance. The cash-outs are listed after the last buy-in.
- Who pays whom matches the largest loser with the largest winner (`src/lib/settle.ts`). The list has at most `players − 1` transfers.
- Money is integer centavos. Pesos show as ₱1,600 or ₱1,600.50.

## Motion

- The kit's hover layer: buttons step and press, links draw their underline, the focus ring settles.
- The hero enters once on load (kit `motion.js`, `data-enter`): the h1 rises line by line out of word masks, the lead and buttons fade up, the window settles from 0.98. About 1.1 s.
- One timed loop: the hero card's transfers arrive one by one. The first step card and the open pane's Mark paid also loop, each on its own screen. Every loop has a pause button and restarts under the pointer.
- The pot's digits roll when a rebuy lands (700 ms).
- Every scroll motion below follows the scroll position and runs back on the way up. Each one rests at both ends ([ADR 0004](../adr/0004-more-scroll-motion.md)).
- Hero: as it leaves the screen, the window eases back to 0.97 and the who-pays-whom card lifts 24 px (CSS view timeline, from 1024 px).
- Log replay (`src/scripts/replay.ts`, from 1024 px on a screen at least 640 px tall): the window holds while the night builds in time order. The top shows the first buy-in. Each row arrives as the scroll reaches it, and the log slides up to keep the newest row in view. Each player's result row comes in at their first buy-in, its total grows with each rebuy, and it reads "Playing" until their cash-out. Who pays whom appears at the last cash-out. The last tenth of the scroll holds the whole night. The figures come from `replayAt()` in `src/lib/table.ts` over the live table, so a Rebuy replays too. Rows still to come are hidden from screen readers, and Mark paid takes no focus until it shows.
- Steps: the kit's `pinned-chapters` moment. The section holds for one screen of scroll. Steps 1, 2 and 3 open in turn, and the frame crossfades to each step's screen.
- Compare: as the section rises from half a screen down to the top, a 2 px accent stroke crosses out each notebook and group-chat answer, row by row (from 640 px). The PokerNights column is never crossed.
- The count-up band has a line sweep, the look of the dealt moment `line-carries-colour` (`src/scripts/sweep.ts`). A hairline climbs the band and uncovers it. Each block fades in over a tenth of a screen of scroll after the line passes its top. A CSS scroll timeline drives it, so it follows the scroll position exactly, in both directions. Browsers without scroll timelines, phones and reduced motion get the band with no sweep.
- In the count-up band, the settle-up diagram's lines draw from the top as the diagram comes on screen (its own view timeline, inside the sweep).
- The other section headings rise once as they come on screen: opacity and 12px up, 700 ms ease-out ([ADR 0003](../adr/0003-section-headings-rise.md)). The hero heading and all cards stay still.
- The app clips play only while the pointer rests on their card.

## Without script and with reduced motion

- Without script: the live parts show a fixed, correct state. Rebuy and Mark paid are hidden. The close's button opens Log in.
- With reduced motion: every loop shows its finished picture. The pot figure changes at once. The hero stands as written. Log and Steps do not hold: Log shows the whole night. Steps shows its three steps side by side from 1024 px, and a row per step below that. Compare has no strokes. The count-up band shows the finished section with its diagram whole. Every heading shows at once.

## Media

Every picture is the real app on synthetic players. See `public/media/README.md`. No photographs are used. The comparison shows the real Messenger and Viber marks.
