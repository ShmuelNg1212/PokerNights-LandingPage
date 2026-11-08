# Spec: PokerNights landing page

The page tells a visitor what PokerNights does and how to start. It sends the visitor into the web app. Facts about the app come from `~/PokerNights` (`PRODUCT.md`, `doc/wiki/features.md`). The look follows tasteskill 2.5 ([ADR 0002](../adr/0002-tasteskill-revamp.md)).

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

Each section is exactly one or two screens tall.

1. **Hero.** "Bookkeeping app for home poker games." A working copy of the app's set page in a lit frame: six synthetic players, the pot, the set timer, Rebuy on each row. A who-pays-whom card overlaps the window from 1024 px. On a phone the window shows the felt and Carlo's row.
2. **Log (`#table`).** The app's session page at desktop: the night's log (buy-ins, rebuys, cash-outs) beside who pays whom, with Mark paid, and the results.
3. **Steps (`#steps`).** Three steps: open the host's link, put the app on the phone, log every buy-in.
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
- One timed loop: the hero card's transfers arrive one by one. The first step card and the open pane's Mark paid also loop, each on its own screen. Every loop has a pause button and restarts under the pointer.
- The pot's digits roll when a rebuy lands (700 ms).
- The count-up band has the dealt scroll moment `line-carries-colour`. Its blocks fade in over 0.3 s, so none jumps when the line reaches the top.
- The other section headings rise once as they come on screen: opacity and 12px up, 700 ms ease-out ([ADR 0003](../adr/0003-section-headings-rise.md)). The hero heading and all cards stay still.
- The app clips play only while the pointer rests on their card.

## Without script and with reduced motion

- Without script: the live parts show a fixed, correct state. Rebuy and Mark paid are hidden. The close's button opens Log in.
- With reduced motion: every loop shows its finished picture. The pot figure changes at once. The moment shows the finished section. Every heading shows at once.

## Media

Every picture is the real app on synthetic players. See `public/media/README.md`. No photographs are used. The comparison shows the real Messenger and Viber marks.
