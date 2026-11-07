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

The taste-skill gate runs from the project root:

```sh
node <taste-skill>/scripts/lint.mjs src
node <taste-skill>/scripts/inspect.mjs http://127.0.0.1:4329/
```

Screenshots land in `.taste-skill/inspect/` (not in git). The direction sheet is `.taste-skill/direction.json` (in git).

## Release (Netlify)

Not linked yet. When the repo has a remote and a Netlify site:

1. Link the repo to Netlify. `netlify.toml` gives the build: `npm run build`, publish `dist`.
2. In Netlify, Forms: turn on email notifications for `host-request`.
3. Before a push to `main`: run `npm test` and `npm run build` with the host's build variables (`URL`, `COMMIT_REF`). Record the previous `origin/main` commit.
4. After the push: open the live page. The release is finished when `<meta name="build">` shows the new commit.
5. Rollback: in Netlify, Deploys, publish the previous deploy. Then revert the commit on `main`.
