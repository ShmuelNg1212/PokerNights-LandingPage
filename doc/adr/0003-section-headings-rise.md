# 0003: Section headings rise on scroll

Date: 2026-11-08. Status: accepted. Amends [0002](0002-tasteskill-revamp.md) on one point.

## Context

Tasteskill 2.5 forbids reveals of any kind outside a dealt moment. A page with fewer than eight sections gets one moment. This page has six sections, and its one moment is `line-carries-colour` on the count-up band. The human asked for scroll animations on the page. The human chose the smallest exception: section headings only.

## Decision

- Each section heading with `data-rise` rises once as it comes on screen: opacity 0 to 1 and 12px up, 700 ms, `--rk-ease-out`. The code is `src/scripts/rise.ts` and the `.rise` rules in `src/styles/page.css`.
- The headings are the table, steps, comparison, questions and close headings. The hero heading does not move. The count-up heading does not get `data-rise`, because its moment already reveals it.
- Cards, copy, pictures, the FAQ and the footer do not move on scroll. Tasteskill's other scroll rules stay.
- Only a heading that is fully below the screen at load waits hidden. A heading on or above the screen at load never hides, so an anchor jump or a late script cannot hide a heading.
- Reduced motion, no script, `data-motion="off"` and headless Chrome (unless `data-motion="live"`) show every heading as written.

## Consequences

- The kit's checks can report the headings as a reveal. That FAIL stays by reason.
- A new section heading gets `data-rise` only if it is not inside a moment.
- The browser probe (`tools/probe/probe.mjs`) checks the rise, the anchor jump, and the count-up band's fade.
