# Plan: count-up band layout fixes

Each fix fit one commit, so no plan came first. This record holds the checks and the release.

## Tasks

- [x] The seat-draw clip fills its panel. The two card rows do not overlap on a short laptop screen (49ea0b1). tests: alongside.
- [x] On phones and at 1024-1279, the cards fill each screen. No panel cuts a row half-way (51de112). tests: alongside.

## Checks

- `npm test`: 41 of 41 pass, `astro check` has 0 errors.
- Browser probe (`tools/probe/probe.mjs`): 94 of 94 pass.
- The overlap check fails on the code before 49ea0b1 (110 px overlap at 1440x760).
- The cut-row check fails on the code before 51de112 (375x667, 1024x768, 1180x820, 1279x900).

## Release

- Rollback: the previous `origin/main` is `59f6125d2cff`. In Netlify, publish the deploy of that commit.
