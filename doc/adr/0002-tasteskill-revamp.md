# 0002: The landing page follows tasteskill 2.5

Date: 2026-11-08. Status: accepted. Supersedes the direction in [0001](0001-landing-direction.md); keeps its media rules.

## Context

The first page used an older taste-skill direction (`product-performs`). Tasteskill 2.5 replaced its rules: one section per screen, a fixed nav with the main action, an h1 that names the category, the product's own window as a section, no scroll reveals outside a dealt moment. The first page failed those rules. The human asked to revamp the page with the skill.

## Decision

- Build to tasteskill 2.5 as dealt: hero `collage`, nav `nav-centre`, close `close-type`, footer `footer-columns`, rhythm `dark-band`, buttons `arrow`, radius `round`, lit ground `sand`, effect `fluted-glass` (held still), moment `line-carries-colour`. The study and plan in `doc/study/1794052562_taste_revamp.md` and `doc/plan/1794052597_taste_revamp.md` hold the deal.
- Keep the brand's colours (the human chose this). Print them with `start.mjs brand`. The bone band is the inverse ground.
- Use the dealt type `instrument` (Instrument Sans) on the page. The app's fragments keep Archivo.
- The main action is "Join your group": the invite field in the close.
- Keep ADR 0001's media rules: no photographs; only the app's own recordings and HTML fragments on synthetic players.
- Load the kit from `public/assets/` and never edit it. The page's fragments use the `pn-` classes and the `data-app` attribute, so the kit's UI script does not take them over; the `.ui ui-pn` classes mark them as drawn UI for the checks.

## Consequences

- The kit's checks (`check.mjs`, `consistency.mjs`, `perf.mjs`) are the design gate. Some FAILs stay by reason (the dealt moment, the kit's diagram captions, the comparison table without a picture); the plan records them.
- When the app's look changes, the fragments in `src/components/` and `src/styles/ui.css` must change too, as in 0001.
- Narrow screens cut cards and rows to keep each section on its screens. New content must fit the screen budget in the plan.
