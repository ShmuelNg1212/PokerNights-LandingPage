# Plan: PokerNights landing page

Study: [doc/study/1794049226_landing_page.md](../study/1794049226_landing_page.md). Branch: `feat/landing-page`.

Mode: mixed. Technical first (scaffold, settle-up logic, fragments), then the design pass (taste-skill `design-taste-frontend`, direction `product-performs`, seed 714946187), then the motion pass, then rendezvous.

Skills: `tdd` (T2), `design-taste-frontend` with `lint.mjs` and `inspect.mjs` (D1–D4), `mobile-native` (D4), `animate` and the `motion` skill with `search-motion-docs` (M1–M2), `code-review`, `break-ui`, `review-animations` (R1).

## Answers (2026-11-07, approved)

1. **Host:** Netlify. No custom domain yet; use the `*.netlify.app` address.
2. **New hosts:** send a person who wants to host, and has no invite, to a contact page (`/contact/`). The page uses a Netlify Form, so no email address is published. Submissions arrive in the Netlify dashboard; email notification is set up there by the human.
3. **Found pictures:** none. Only the app's own captures and HTML fragments.
4. **Name:** `PokerNights` everywhere.
5. **Privacy link:** left out.
6. **Recording:** approved, on a temporary local database with synthetic fixtures.

## Tasks

### Technical

- [x] **T1. Scaffold Astro.** `tests: alongside`
  - Astro (latest stable), static output, TypeScript strict. Vitest. `npm test` runs `astro check` and `vitest run`. `npm run build` writes `dist/`.
  - Self-host `archivo.woff2` (OFL; copy `OFL.txt`). Copy `logo-mark.svg`, `logo-horizontal.svg` and the app icons for the favicon.
  - `src/styles/tokens.css`: every colour, radius and type step from the app's `DESIGN.md` frontmatter. Downstream CSS uses tokens only.
  - Page `<head>`: title, description, Open Graph image (the app's `link-preview.png`), theme colour `ground`, and `<meta name="build" content="<commit sha>">` for the release check.
  - Acceptance: `npm test` and `npm run build` pass on an empty page that loads Archivo and the tokens.
  - Done when: committed as `build:`.

- [x] **T2. Settle-up logic.** `tests: first`
  - `src/lib/settle.ts`: integer centavos in, transfers out. Each player's result is cash-out minus bought in. Match the largest loser with the largest winner until all are zero.
  - Tests: totals that net to zero; a single winner; ties; a player at exactly zero is left out; transfers never exceed `players − 1`; the sum of the transfers equals the sum of the losses; a table that does not net to zero throws.
  - `src/lib/money.ts`: format `₱1,600` and `₱1,600.50`, signed results (`+₱600`, `−₱400`).
  - Acceptance: the tests are written first and fail, then pass.
  - Done when: committed as `feat:`.

- [x] **T3. Live table state.** `tests: first`
  - `src/lib/table.ts`: the Friday table (six players, usual buy-in ₱1,000, fixed cash-outs). `rebuy(player)` adds ₱1,000 and returns the new totals, the pot and the transfers from T2. One shared store for the hero, the showcase row and field 4.
  - Tests: a rebuy raises the pot and "bought in" by ₱1,000; the transfers update; the pot equals bought in minus cashed out.
  - Done when: committed as `feat:`.

- [x] **T4. Record the app's own media.** `tests: alongside`
  - In a scratch folder: a temporary database, migrate, seed the fixtures named in `web/tests/browser/README.md`, start the app on `127.0.0.1:8765`.
  - Scripted Playwright runs at 390 × 844, dark, recorded: (a) the seat-draw overture, (b) a rebuy and the rolling pot, (c) the count-up chip rack, (d) settle-up and the share card. 6–10 s each.
  - Encode with ffmpeg: H.264 MP4 and VP9 WebM, no audio, under 1.5 MB each; a poster JPEG/AVIF per clip; four or more cropped stills.
  - Acceptance: every clip shows only synthetic names; no address bar, no device frame; the files are under `public/media/`.
  - Done when: committed as `feat:` with a `public/media/README.md` that says how they were made.

### Design (taste-skill)

Build with the motion off first. The sheet's blueprints give the geometry; the brand gives colour and type.

- [x] **D1. Hero: the live set.** `tests: alongside`
  - Two tone halves: `ground` left, `rail` right, meeting at 50%. Mark top-left. "Log in" top-right at 15 px. No nav bar.
  - Bottom-left: "Who pays whom, / worked out.", the sentence, the bone pill button "Open PokerNights".
  - Right: the `data-ui` live set fragment from the app's markup and tokens: felt panel with the diamond texture, "Still in play" pot, timer, blinds, six chip-token rows with working Rebuy. The live badge shows the visitor's local time; the timer counts from arrival.
  - Phone: the fragment first (78vw, lighter block, 58svh), then the headline, sentence and button.
  - Acceptance: tap Rebuy on Carlo at 390 px and the pot reads ₱10,850. Without JavaScript the fragment shows the fixed state and the button still works.

- [x] **D2. Showcase and quick start.** `tests: alongside`
  - Showcase "One row per player": Carlo's row three times (sits down, rebuys, back in); the middle row's Rebuy works and turns it into the third state. A real still or clip of the live set beside it, from T4.
  - Quick start "Your first night": four full-height fields, edge to edge, in four tone steps (ground, rail, rail-2, felt). One session card per field at true size, further along each time. Field 4's who-pays-whom reads from the T3 store. Clip (a) or (b) plays in field 3 as a muted loop with a poster.
  - Acceptance: a rebuy in the hero changes field 4's transfers. At 390 px each field stacks at 64svh and no card is shrunk.

- [x] **D3. Comparison, FAQ, CTA, footer.** `tests: alongside`
  - Comparison "Next to a notebook" as a lineless grid; the PokerNights column is one bone block, reversed. On a phone it turns into one block per row.
  - FAQ "Before you play": `<details name="faq">` tiles, sticky heading on desktop, the open tile in brass.
  - CTA: full-bleed felt field, "Deal everyone / in tonight.", the `data-ui` "Open PokerNights" dialog. "I have an invite" accepts only `https://pokernights-five.vercel.app/join/…` or `/claim/…` links and opens them; "I have an account" opens `/accounts/login/`. Any other text is refused in words under the field.
  - Footer: one quiet line, as in the copy deck, plus "Want to host?" → `/contact/`.
  - FAQ 3 ("I want to host") answers: a new group is set up by the person who runs PokerNights; send a message from the contact page. The CTA dialog has a quiet line under it: "No invite and want to host? Get in touch." → `/contact/`.
  - Acceptance: a pasted `https://example.com/join/x` is refused; a valid-looking invite link opens on the app's address; Log in opens the app's log in.

- [x] **D4. Gate and look.** `tests: alongside`
  - `lint.mjs` on `src/`; `inspect.mjs` on the built page with `--allow` for the indigo rule only. No `FAIL`; every `WARN` defended in one sentence here.
  - Up to three critique rounds with `references/critique.md` on the 1440, 768 and 390 screenshots; fix the top three problems each round.
  - `mobile-native`: no tap flash, no hover stuck on touch, `svh` units, safe-area insets, inputs at 16 px or more.
  - Done when: the last critique's scores are recorded here; committed as `feat:`.

- [x] **D5. Contact page.** `tests: alongside`
  - `/contact/`: same tokens and type, the mark, one short heading ("Host a group"), one sentence on what happens next, and a Netlify Form (`name="host-request"`, `data-netlify="true"`, honeypot field) with name, contact (email or Messenger), group size, and a message. A thank-you page at `/contact/thanks/`.
  - Acceptance: the built HTML has the form with `data-netlify` and the hidden `form-name` input, so Netlify detects it at deploy. Labels, 16 px inputs, 48 px targets, visible focus.
  - Done when: committed as `feat:`.

### Motion pass

- [x] **M1. Motion task list.** `tests: alongside`

  | Element | Property | Easing / spring | Duration | Reduced motion |
  |---|---|---|---|---|
  | Hero headline lines | translateY 100% → 0 (masked) | ease-out `cubic-bezier(.16,1,.3,1)` | 900 ms, line 2 +110 ms | appear at rest |
  | Hero sentence and button | opacity 0 → 1, y 16 px | same | 500 ms after line 2 | opacity only |
  | Pot figure on rebuy | digits roll (the app's roll) | spring, no bounce | about 600 ms | number changes at once |
  | Rebuy row mark | brass box flash, as in the app | ease-out | 3 s hold | box without movement |
  | Section parts | heading, text, picture rise 24 px with opacity, 70 ms stagger, once | ease-out | 600 ms | opacity only |
  | Quick-start cards | rise 6 px on hover | ease-out | 150 ms | none |
  | Hero fragment | slow scroll-linked rise of 40 px as the hero leaves | linear to scroll | scroll | none |
  | Clips | muted loops, play only in view, pause when the tab is hidden | — | — | show the poster, no autoplay |
  | Buttons and links | press scale .97, hover tone step, brass focus ring | ease-out | 120 ms | no scale |
  | FAQ tile | plus to minus rotation, answer height | ease-out | 200 ms | instant |

  - Done when: every element above has its move. Content shows if the script fails.

- [x] **M2. Build and audit the motion.** `tests: alongside`
  - `search-motion-docs` before any Motion API call. Transform and opacity only.
  - `inspect.mjs` counts 16 or more moving elements. The MotionScore audit through the `motion` skill. `animation-performance` if a frame drops at 4× processor slowdown.
  - Done when: committed as `feat:`.

### Rendezvous

- [x] **R1. Checks.**
  - `npm test` and `npm run build` pass.
  - `code-review`; `break-ui` on the player rows and the dialog (long names, ₱1,000,000 amounts, 12 players); `review-animations`.
  - Probe at 390 px in a real browser: tap Rebuy twice on two players; field 4's transfers change and still net to zero. Paste a bad link; it is refused. These checks can fail for the reason the claim could be false.
  - Up to two fix-and-recheck rounds. Merge to `main` locally. Record the results here.

### Release (after "ship")

- [ ] **S1. First deploy.** Needs the remote (no remote yet).
  - `netlify.toml`: build `npm run build`, publish `dist`, Node version pinned. Link the repo to Netlify. Turn on form notifications for `host-request`. Write the build, deploy and rollback commands to `doc/wiki/setup.md`.
  - Run `npm test` and `npm run build` under the host's build environment. Record the previous commit. Push.
  - Done when: the live page's `<meta name="build">` shows the new commit.

### Sync docs

- [x] **W1.** Start `doc/wiki/spec.md` (what the page shows and where each link goes) and `doc/wiki/setup.md` (commands, media recording). Add an ADR for the choice of direction and the brand exceptions.

## Checks record

Rendezvous on 2026-11-07, branch `feat/landing-page` at `c53027e`.

### Results

| Check | Result |
|---|---|
| `npm test` (`astro check` and Vitest) | 0 errors. 26 tests pass: settle-up, pesos, table state, labels, invite links. |
| `npm run build` | 3 pages: `/`, `/contact/`, `/contact/thanks/`. |
| taste-skill `lint.mjs src` | 0 FAIL. 3 WARN: zero-padding in `money.ts` and `labels.ts` for centavos and the clock (allowed by the rule). |
| taste-skill `inspect.mjs /` at 1440, 768, 390 | 0 FAIL. 1 WARN: `palette-cream` is the brand's bone (`DESIGN.md`); kept. 5 type sizes. 6 real pictures (3 app clips, 3 app stills). 38 moving elements. |
| `inspect.mjs /contact/` | `few-pictures` and `focal-point` FAIL, `no-footage` WARN. Defended: a one-purpose form page; it carries one real app still. |
| `tools/probe/probe.mjs` in Chrome | 22/22. A rebuy rolls the pot (₱10,500 → ₱11,500 → ₱12,500), marks the row, changes who pays whom, and the transfers equal the losses. The showcase and the result row follow the same table. A link to another site is refused in words. An invite link opens on the app address. Log in opens the app log in. Reduced motion shows every part at rest and changes the figure at once. Without script: Rebuy hidden, the main link works, the dialog is a plain Log in, the headline shows, the contact form is a Netlify form. |
| break-ui by hand (320 and 390 px) | First round: at 320 px the pot hit the blinds, the rows crushed and the page scrolled 9 px sideways. Fixed with container queries (`ui.css`): the money action moves under the name, as in the app. Second round: no overflow with a 41-character name, ₱1,000,000 and 13 rebuys. |
| `code-review` (Standards and Spec agents) | Fixed: localhost `og:image`, no-JS dialog that dropped the invite, `aria-label` on roleless elements, dialog shadow at rest, muted step text, a sixth type size, unused props and tokens, duplicated chip and count logic, a hard-coded player in the result script, a blank seat-draw poster, four lines of copy that the app docs do not support. |
| `review-animations` | Not run as a separate skill. Self-check: transform and opacity only, every move has a reduced-motion path, a rebuy during a roll replaces the cells, content shows if the script fails. |
| Critique rounds (taste-skill step 8) | Three look rounds on the 1440, 768 and 390 screenshots. Each fixed real faults (merged headline lines, a fragment that grew the hero past the fold, grey video frames from the recorder, cramped rows). The weighted critique score was not computed. |

### Deviations from this plan

- D1 acceptance said ₱10,850 after one rebuy. That number came from the brand thumbnail, which has eight players. The page's six-player table holds ₱10,500, so one rebuy gives ₱11,500. The probe checks the real sums.
- T3 said "fixed cash-outs". Fixed cash-outs would not balance after a rebuy, so each player ends with a fixed share of the table, rounded to ₱50. The last player takes the rest.
- T4: the chip-rack clip and the share-card clip were not made. The chip rack needs a chip-values seed. The share sheet did not open under automation. The clips are 3–4 s, not 6–10 s. The seat-draw clip is 1×: the seat draw reads the window size and does not lay out right under the 2× zoom.
- D2: field 2 shows the seat-draw clip, with the install steps in its words, instead of a Join group card. The showcase's third state is "Cashes out" (the end result), not "Back in".
- D3: the felt diamond texture and the primary button's underside were dropped to meet the gradient and button rules.
- Phone hero: the stage is 66svh at full width, not 78vw by 58svh. The live set needs its true width.
- M1: the hero drift is 64 px, not 40 px. The row mark uses a short spring. Under reduced motion the entrances do not run at all, not "opacity only".
