# Study: more scroll motion, under tasteskill 2.5.1

Date: 2026-11-08. Asked by the human: "a lot of motion", the brainstorm ideas with the most motion, built to tasteskill 2.5.1.

## The ideas from the brainstorm

| # | Idea | Motion |
|---|---|---|
| 1 | Nav scroll line and section marker | low |
| 2 | Settle-up arrows draw on the count-up sweep | low |
| 3 | Pot digits roll once when the Log section comes on screen | low |
| 4 | Hero window flattens as the visitor scrolls out of the hero | medium |
| 5 | Compare: a pen stroke crosses out the notebook and chat columns | medium |
| 6 | Log section pins and replays the night with the scroll | high |
| 7 | Steps section pins and opens its steps one at a time | high |

The human asked for the ideas with more motion. This study reads that as ideas 2 to 7. Idea 1 has the least motion, and 2.5.1 bans it by name.

## What changed in tasteskill 2.5.1

- The installed kit is 2.5.1 (`~/.claude/plugins/cache/taste-skill/taste-skill/2.5.1`). The page copy in `public/assets` is older. It has only the `line-carries-colour` moment.
- **New rule:** every hero enters once on load (`data-enter`). The h1 rises line by line out of word masks, then the lead and buttons fade up 12px. The window settles from 0.98 to 1. All of it takes about 1.1 s. The checker now fails a page with no hero entrance (`hero-enter`). Our hero does not move, so the page fails 2.5.1 today.
- **Moment count:** a page deals one moment, or two on a page of eight sections or more. Our page has six sections. It gets one moment. It has one now: `line-carries-colour` on the count-up band.
- **`pinned-chapters`** is a kit moment for software pages. It pins one feature section of two to four steps for two screens of scroll. The steps open one at a time at the left. One frame at the right crossfades to each step's picture. Phones and reduced motion get static rows. Its `meta.json` lists `line-carries-colour` under `avoidWith`.
- **Banned outside a moment's section:** card, row or tile reveals, parallax or drift, scroll progress lines, scroll-spy markers, and counts on view.
- **Banned by name:** "a section heading that rises on every section". ADR 0003 does this now on five headings.
- Scroll moments must be scrubbed to the scrollbar, run back on the way up, and show a finished state at both ends. They pin only with `position: sticky` inside their own section. Text stays live, at opacity 1 and 4.5:1 contrast at every step.

## How each idea meets 2.5.1

| # | Verdict | Reason |
|---|---|---|
| 2 | Allowed | It is inside the dealt moment's section and on its timeline. |
| 3 | Banned | "Count on view" outside a moment. `counter-rolls` is a moment, but only in a statement section and never in a card. |
| 4 | Banned | Drift on scroll outside a moment. |
| 5 | Banned | Scroll motion outside a moment. It could become a custom moment. |
| 6 | Not in the kit | It is a custom scrubbed moment. It would be a second or third moment. |
| 7 | Allowed as the kit's `pinned-chapters` | But it is a second moment on a six-section page, and it conflicts with `line-carries-colour`. |

Only idea 2 and the hero entrance fit 2.5.1 as written. The rest need an exception in an ADR, as ADR 0003 did.

## The code

- Hero: `src/components/Hero.astro`. The window is `AppFrame`-style live HTML driven by `src/scripts/live.ts`.
- Log section: `src/components/AppFrame.astro`. The log comes from `nightLog()` in `src/lib/table.ts` (buy-ins, rebuys, then cash-outs). The transfers come from `src/lib/settle.ts`.
- Steps: `src/components/Steps.astro`. Three cards, each with its own visual: the invite fragment (a timed loop), the install card, and the deal clip (`Video.astro`).
- Compare: `src/components/Compare.astro`, in words.
- Count-up sweep: `src/scripts/sweep.ts` and a CSS scroll timeline in `src/styles/page.css`.
- Heading rise: `src/scripts/rise.ts`.
- Probe: `tools/probe/probe.mjs`. Tests: `npm test` (33 tests).

## Risks

- Two pinned sections add about two screens of scroll. The page grows from about nine screens to about eleven.
- A replay of the log must agree with `table.ts`. The pot, the log, the transfers and the results at each step must come from the same logic as the live table, or the books show wrong figures mid-scroll.
- The hero's live table and its loops must still work during the entrance.
- The kit update can change `motion.js` and `system.js` behaviour on every section. The probe must run again on the whole page.
