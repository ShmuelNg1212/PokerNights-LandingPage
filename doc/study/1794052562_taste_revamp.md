# Study: revamp the landing page with tasteskill 2.5

Date: 2026-11-07. Mode: design. Design tool: taste-skill `design-taste-frontend` (tasteskill 2.5.0), then the motion pass.

## Goal

Rebuild the look of `/` (and the shared shell of `/contact/`) to the tasteskill 2.5 rules. Keep the facts, the live table and the links. The current page was built today to an older taste-skill (direction `product-performs`, ADR 0001). The 2.5 rules replace that direction.

## Sources

- The current page: `src/`, build `f6fa0a7`.
- The app: `~/PokerNights` (`PRODUCT.md`, `DESIGN.md`, `doc/wiki/features.md`). `DESIGN.md` confirms a desktop layout from 900 px: a 400 px overview column and a flexible detail column in a 1180 px container. So a two-pane app window is a real screen of the app.
- The skill: `~/.claude/skills/design-taste-frontend` (`SKILL.md`, `references/copy.md`, `system.md`, `layout-v4.md`, `sections.md`, `sections-library.md`, `motion.md`, `effects-usage.md`, `moments.md`).

## Baseline: the current page against 2.5

Measured with `assets/layout/check.mjs` at 1440×900 and 390×844 on `dist/`.

| Rule | Current page | Finding |
|---|---|---|
| One section per screen | Heights 1.03, 0.84, 1.21, 1.01, 0.90, 0.36 screens | `screen-height` on every section; `hero-fold` (925 px hero) |
| Hero h1 at the top (y 120) | The h1 sits at the bottom left | layout rule fails |
| h1 names the category and the buyer | "Who pays whom, worked out." is a brand line | `copy-headline` |
| Fixed opaque nav with the main button | No nav bar; a "Log in" link only | `system.md` Nav |
| Equal edges | The close h2 starts at x 40; the wrap is 1360 at x 40 | `spill` |
| Close and footer are one section | The CTA is its own band; the footer is a strip | `sparse` (23%), `neighbour` |
| No scroll reveal | Masked-headline reveals on scroll (`src/scripts/motion.ts`) | banned outside a dealt moment |
| FAQ open in full | Accordion | banned |
| At 390 | Sections 1.4 to 2.8 screens tall | `screen-height` |

Keep: the facts, the copy that is plain, the live table (`src/lib/table.ts`, `settle.ts`, `money.ts`, `invite.ts`), the recorded clips in `public/media/`, the build marker, the Netlify form.

## Brief, as the skill reads it

- **Kind:** software (a consumer app). Page type `software`, site-kind `software`, kind `software`.
- **What is sold:** a phone web app that keeps the bank for a home poker cash game: buy-ins, rebuys, cash-outs, the count-up and who pays whom. It never moves money.
- **Who:** hosts who keep the bank, and their players. Private groups of friends in the Philippines.
- **Main action:** the visitor joins a group with an invite link. Accounts come only from an invite. See open question 3.
- **Real material:** the logo files, the app's own UI (HTML fragments), three recordings (`seat-draw`, `deal`, `recap`) and two stills. No photographs. No prices. No customers, quotes or figures.

## The deal (tasteskill 2.5)

All parts were dealt with the skill's scripts. The history files are in `.taste-skill/`.

| Part | Dealt | Note |
|---|---|---|
| Hero | `collage` (`deal.mjs --type software --has ui,film`) | Text on span-5. A lit frame on span-6 start-7 holds the app window, cut by the frame's right and bottom. One small card on its lower left loops. |
| Palette | three dealt: `warm-black-gold`, `white-navy-tab`, `soot-pale-lime` | `warm-black-gold` (bg `#0c0a08`, surface `#181512`, accent `#c9a45a`) is almost the brand's own ground and brass. See open question 1. |
| Type | three dealt: `instrument`, `schibsted`, `manrope` | The brand fixes Archivo. See open question 2. |
| Radius | `round` | The skill gives `round` to consumer apps. |
| Lit ground | `sand` | |
| Effect | `fluted-glass` (quiet, dark, slot hero) | The ground of the hero's art frame. |
| Hero moment | `cursor-spotlight` dealt, then dropped | The hero already holds the effect. Two beats never share a section. |
| Section moment | `line-carries-colour` (transition, scroll) | On the one section with a new ground (the dark band). |
| Nav | `nav-mega` dealt, then `nav-centre` | `nav-mega` needs 6 to 12 feature pages; this is one page. `nav-cards` needs photographs. So `nav-centre` stays. |
| Footer | `footer-columns` | |
| Close | `close-type` | The big button submits the invite field (see the plan). |
| Rhythm | `dark-band` | One `.ground-inverse` section in the second half. |
| Buttons | `arrow` | |
| Mark | the client's own logo | `public/brand/logo-horizontal.svg` replaces the dealt mark. |

## Brand against the 2.5 rules

| Conflict | Proposal |
|---|---|
| 2.5 bans violet (OKLCH hue 270 to 330). | The felt is hue 265: allowed. The chip colours `c5` (`#82409b`) and `c10` (`#524b9a`) are violet. They are the app's own player tokens, inside the app's UI, not the page's design. Keep them; report the check as judged false. |
| 2.5 deals the type. | Keep Archivo (open question 2). |
| 2.5 fills the primary button with the accent. | The app fills its primary button with bone and keeps brass for focus. Proposal: the page's accent is brass (`--brass`), so the page's primary button is brass. The app's fragments keep bone buttons inside the window. |
| 2.5 wants photographs (house rule 6). | ADR 0001 bans found photographs. Software uses photographs only for people and customers. There are none to show. Keep no photographs (open question 4). |
| 2.5: three steps only. | The current quick start has four. Step 4 (who pays whom) moves to the app window section. Three steps stay. |

## Copy, first draft

Rules: h1 names the category and the buyer; one hard fact on the first screen; a noun in every heading; buttons a verb and an object; 60 to 80 words a screen.

- **h1:** "Buy-ins and settle-up for home poker nights" (43 characters; the hero allows 48).
- **Lead:** "PokerNights keeps the bank for your home game. Log each buy-in, rebuy and cash-out, then see who pays whom. It never moves money." (24 words.)
- **Hard fact (proof line):** "For home games in the Philippines, in pesos or chips."
- **Buttons:** primary "Join your group" (`#join`, the close). Secondary "Request a group" (`/contact/`).
- **Nav:** logo; words "Table", "Steps", "Features", "Compare", "Questions"; "Log in" as a plain word; the primary "Join your group".
- **Section heads:** "Every buy-in and who pays whom, on one screen"; "Start in 3 steps"; "PokerNights next to a notebook"; "Checks the books before anyone pays"; "Questions"; close "Join your group tonight".
- **Footer lede (the one brand line):** "Who pays whom, worked out."

## Motion against the 2.5 rules

- Remove: the masked-headline reveals, every scroll reveal, the FAQ accordion.
- Keep: the pot roll on Rebuy (a click swap, the digit-roll ease `cubic-bezier(.22,1,.36,1)`, 700 ms).
- Add: the motion layer (`assets/motion`: hover, press, focus, underline); the hero card loop (the page's one timed loop); the app window's open-pane loop; the dealt moment; diagram pulses.
- Reduced motion: every loop shows its finished frame; the pot changes at once.

## Technical notes

- Astro stays. Copy the kit's families the page uses into `public/assets/` (system, motion, ui, layout, backgrounds, effects, moments, diagrams). Do not edit kit files.
- The page is static. The live table scripts stay in TypeScript.
- Checks run on `dist/` with `--root dist`.
- Netlify deploys on a push to main. No push without "ship".

## Open questions

These go into the plan.

1. **Palette.** Use the brand's own Rack values through `start.mjs brand` (recommended), or the dealt `warm-black-gold` as printed?
2. **Type.** Keep Archivo (recommended: it is the brand face and the app's UI uses it), or take a dealt pairing (`instrument`, `schibsted` or `manrope`)?
3. **Main action.** "Join your group" (paste an invite link in the close; recommended), with "Request a group" (`/contact/`) as the hero's second button? Or make "Request a group" the main action?
4. **Photographs.** Keep no photographs (recommended), or add credited photographs of a home card table at night?
5. **ADR.** The new direction supersedes ADR 0001. Write ADR 0002 at sync docs?
