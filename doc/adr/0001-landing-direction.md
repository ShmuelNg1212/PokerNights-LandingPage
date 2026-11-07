# 0001: The landing page shows the app working

Date: 2026-11-07. Status: accepted. Its direction is superseded by [0002](0002-tasteskill-revamp.md); its media rules stay.

## Context

The page must say what PokerNights is for and how to start. The app has a fixed brand, "The Rack" (`~/PokerNights/DESIGN.md`). The brand rules out casino imagery and invented claims. No photographs of the product exist.

## Decision

- Use the taste-skill direction `product-performs` (seed 714946187). The app's own screens are the pictures. The hero is a working copy of the set page. Rebuy works, and the who-pays-whom card follows it.
- Keep the brand's colours and type (`--keep palette,type`). The indigo felt stays, although the house rules ban indigo.
- Use only real recordings and stills of the app on synthetic players. Use no found photographs.
- Drop the felt texture and the primary button's underside on the page, to meet the gradient and button rules. Inside `[data-ui]` fragments, keep the app's hairlines and radii.
- Send people who want to host to `/contact/`, a Netlify Form. Publish no email address.

## Consequences

- When the app's look changes, the fragments in `src/components/ui/` and `src/styles/ui.css` must change too.
- The clips must be recorded again when the app's screens change (`tools/record/`).
