# Setup

## Requirements

- Node 24 (Netlify pins `NODE_VERSION = "24"` in `netlify.toml`).
- For the probe and the recordings only: Playwright outside the repo and Google Chrome. See `public/media/README.md`.

## Commands

| Command | What it does |
|---|---|
| `npm install` | Installs Astro, Motion, Vitest. |
| `npm run dev` | Local server with reload. |
| `npm test` | `astro check`, then `vitest run`. |
| `npm run build` | Static site to `dist/`. |
| `npx astro preview --port 4329 --host 127.0.0.1` | Serves `dist/`. |

## Browser probe

Build, serve on port 4329, then run:

```sh
PLAYWRIGHT_BROWSERS_PATH=/private/tmp/pn-browser-binaries node tools/probe/probe.mjs
```

`PN_PLAYWRIGHT` selects another Playwright install. `PN_LANDING_URL` selects another address, for example a Netlify deploy preview.

## Design gate

The tasteskill 2.5 checks run on the build. Each serves `dist/` itself; use a profile folder outside the repo.

```sh
S=~/.claude/skills/design-taste-frontend
node $S/assets/layout/check.mjs --url dist/index.html --root dist --profile <dir> --sizes 1440x900,1024x768,820x1180,768x1024,390x844
node $S/scripts/consistency.mjs dist/index.html --root dist --widths 1440,1024,820,768,390 --rhythm-widths 1440,820,768,390 --profile <dir> --page software --category "bookkeeping app for home poker games" --primary "Join your group"
node $S/scripts/perf.mjs dist/index.html --root dist --profile <dir>
```

`consistency.mjs` writes its crops to `dist/.taste-skill/consistency/`. The known remaining FAILs and their reasons are in the revamp plan's Checks section. The deal history is in `.taste-skill/` (only `direction.json` is in git).

## Kit files

`public/assets/` holds the tasteskill kit files the page loads (system, motion, ui, layout, backgrounds, effects, moments, diagrams, icons). Do not edit them. To refresh them, copy the same folders from `<skill>/assets/` again. Fetch a new icon with `node $S/scripts/icons.mjs scan dist/index.html --out public/assets/icons --colour`.

## Release (Netlify)

- Repo: `https://github.com/ShmuelNg1212/PokerNights-LandingPage`, branch `main`.
- Site: `https://pokernightspage.netlify.app`. Netlify builds from the repo with `netlify.toml`: `npm run build`, publish `dist`, Node 24.
- A push to `main` deploys the site. Push only when the human says "ship" or "push".
- `astro.config.mjs` takes `site` from Netlify's `URL` variable, so the link preview image is absolute on the main address.

Steps:

1. Before a push to `main`: run `npm test`, then `COMMIT_REF=$(git rev-parse HEAD) npm run build`. Record the current `origin/main` commit (`git rev-parse origin/main`) for rollback.
2. List the commits that will go out: `git log --oneline origin/main..main`.
3. Push: `git push origin main`.
4. Check the live page: `curl -s https://pokernightspage.netlify.app/ | grep -o '<meta name="build"[^>]*>'`. The release is finished when it shows the first 12 characters of the new commit.
5. Run the probe on the live site: `PN_LANDING_URL=https://pokernightspage.netlify.app PLAYWRIGHT_BROWSERS_PATH=/private/tmp/pn-browser-binaries node tools/probe/probe.mjs`.
6. Rollback: in Netlify, open Deploys and publish the previous deploy. Then `git revert` the bad commit on `main` and push. Do not force-push.

Forms: the contact page's `host-request` form uses Netlify Forms. In Netlify, open Forms, make sure form detection is on and `host-request` is listed, and turn on email notifications.

First release: `769abc6` on 2026-11-08. The remote was empty before it.
