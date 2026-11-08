# 0004: More scroll motion, past tasteskill 2.5.1's limits

Date: 2026-11-08. Status: accepted. Amends [0002](0002-tasteskill-revamp.md) and [0003](0003-section-headings-rise.md).

## Context

The human asked for a lot of motion on the page, built to tasteskill 2.5.1. Tasteskill 2.5.1 gives a six-section page one dealt moment. It bans scroll motion outside that moment, and it bans a heading rise on every section. The page already had one moment (the count-up sweep) and the heading rise from ADR 0003. The study ([1794126902_more_scroll_motion.md](../study/1794126902_more_scroll_motion.md)) lists each idea against the rules. The human approved every default in the plan's OPEN QUESTIONS.

## Decision

- The page follows tasteskill 2.5.1. The kit copy in `public/assets` is 2.5.1. The hero enters once on load (`data-enter`).
- The page has these scroll motions. Each one is scrubbed to the scroll, runs back on the way up, and rests at both ends:
  - **Log replay** (`#table`, `src/scripts/replay.ts`): a custom moment. The section pins for one screen. The night's log, the results and who pays whom build in time order from `replayAt()` in `src/lib/table.ts`.
  - **Steps** (`#steps`): the kit's `pinned-chapters` moment. The section pins for one screen, and the three steps open one at a time.
  - **Compare** (`#compare`): a stroke crosses out each notebook and group-chat answer as the section rises to the top.
  - **Count-up** (`#features`): the line sweep stays. The settle-up diagram's lines also draw as the diagram comes on screen.
  - **Hero**: as the hero leaves, the app window eases back to 0.97 and the who-pays-whom card lifts 24px.
- The section heading rise of ADR 0003 stays, against 2.5.1's ban.
- `pinned-chapters` and the sweep share the page, against the kit's `avoidWith`.
- Not built: the nav scroll line (banned by name, least motion) and the pot roll on view (the Log replay already moves the figures).
- Phones (below 640px, or below 1024px for the two pinned sections), reduced motion and browsers without scroll timelines show each section as written. No content waits hidden in those cases.

## Consequences

- The page runs three scroll moments and two smaller scroll motions. The kit's checks report them (`moment-over`, `scroll-linked`, `scroll-reveal`, `pinned`, `avoidWith`). Those FAILs stay by reason, with this ADR as the waiver.
- The page grows by two screens at 1024px and wider: `#table` and `#steps` are each two screens tall while live.
- A new scroll motion needs a new ADR. Cards, FAQ answers and the footer still never move on scroll.
- The browser probe (`tools/probe/probe.mjs`) checks each motion down and up, its rest states and its reduced-motion state.
