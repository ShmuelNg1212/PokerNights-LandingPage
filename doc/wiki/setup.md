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

Not linked yet. When the repo has a remote and a Netlify site:

1. Link the repo to Netlify. `netlify.toml` gives the build: `npm run build`, publish `dist`.
2. In Netlify, Forms: turn on email notifications for `host-request`.
3. Before a push to `main`: run `npm test` and `npm run build` with the host's build variables (`URL`, `COMMIT_REF`). Record the previous `origin/main` commit.
4. After the push: open the live page. The release is finished when `<meta name="build">` shows the new commit.
5. Rollback: in Netlify, Deploys, publish the previous deploy. Then revert the commit on `main`.
