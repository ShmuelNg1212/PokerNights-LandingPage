# Spec: PokerNights landing page

The page tells a visitor what PokerNights does and how to start. It sends the visitor into the web app. Facts about the app come from `~/PokerNights` (`PRODUCT.md`, `doc/wiki/features.md`).

## Pages

| Address | Content |
|---|---|
| `/` | The landing page. |
| `/contact/` | "Host a group": a Netlify Form named `host-request` for a person who wants to host and has no invite. |
| `/contact/thanks/` | The page after the form is sent. |

## Where the links go

All app addresses are in `src/lib/links.ts`.

- "Open PokerNights" and "Open the app": `https://pokernights-five.vercel.app/`.
- "Log in": `https://pokernights-five.vercel.app/accounts/login/`.
- The open dialog, "I have an invite": opens a pasted link only if it is on the app address and its path is `/join/<token>/` or `/claim/<token>/` (`src/lib/invite.ts`). Any other text is refused in words.
- The open dialog, "I have an account": opens Log in.
- "Get in touch", "Host a group", the FAQ host answer: `/contact/`.
- The page never offers an open sign-up. The app makes accounts only from an invite link.

## Sections of `/`

1. **Hero.** "Who pays whom, worked out." A working copy of the app's set page: six synthetic players, the pot, the set timer, Rebuy on each row. The live badge shows the visitor's own clock. The timer counts from arrival.
2. **One row per player.** Carlo's row in three states: sits down, rebuys (works), cashes out (his end result). A clip of the real app records a rebuy.
3. **Your first night.** Four steps: the host sends a link; put the app on the phone; the host keeps the bank; who pays whom. Step 4's transfers come from the hero's table.
4. **Next to a notebook.** PokerNights against a notebook and a group-chat tally, in words.
5. **Before you play.** Eight questions, one open at a time.
6. **Deal everyone in tonight.** The open dialog.
7. **Footer.** One line.

## The live table

- `src/lib/table.ts` holds one shared table. Six players, ₱10,500 bought in, usual buy-in ₱1,000.
- A rebuy adds ₱1,000 to that player. The pot, the rows, Carlo's result and the transfers update together (`src/scripts/live.ts`).
- At the end of the night each player keeps a fixed share of the table, rounded to ₱50. The last player takes the rest, so the books balance.
- Who pays whom matches the largest loser with the largest winner (`src/lib/settle.ts`). The list has at most `players − 1` transfers. The app's own settle-up gives the same four transfers for the starting table.
- Money is integer centavos. Pesos show as ₱1,600 or ₱1,600.50.

## Without script and with reduced motion

- Without script: the page shows a fixed, correct state. Rebuy buttons are hidden. The open dialog is a plain Log in, with a line to open the invite link from the chat.
- With reduced motion: nothing travels. Clips show their poster. The pot figure changes at once.

## Media

Every picture is the real app on synthetic players. See `public/media/README.md`. No found photographs are used.
