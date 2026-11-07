# Media

Every clip and still here is the real PokerNights app, recorded on a temporary local database with synthetic players. No production data was used.

## Files

| File | What it shows | Source |
|---|---|---|
| `seat-draw.mp4`, `.webm`, `-poster.jpg` | The seat draw: drawing the dealer seat | `night` take, 0.0–4.0 s |
| `deal.mp4`, `.webm`, `-poster.jpg` | Seats set, the "Set 1" overture, a rebuy for Carlo, the pot rolls to ₱7,000 | `night` take, 8.9–15.4 s |
| `recap.mp4`, `.webm`, `-poster.jpg` | The session recap, then who pays whom | `settle` take, 0.2–4.5 s |

Stills are in `src/assets/app/` (390 × 844 at 2×), from the same takes.

## How to make them again

1. Install the browser tool outside the repo, as `~/PokerNights/web/tests/browser/README.md` says, plus Playwright's ffmpeg: `PLAYWRIGHT_BROWSERS_PATH=/private/tmp/pn-browser-binaries node /private/tmp/pn-browser-tools/node_modules/playwright/cli.js install ffmpeg`.
2. Run `tools/record/take.sh`. It makes a fresh SQLite database, seeds `seed_landing.py`, serves the app on `127.0.0.1:8765`, and runs `record.mjs` with the installed Chrome. Raw takes land in `$R/raw` (default `/private/tmp/pn-landing-rec/raw`).
3. Encode each clip (no audio, 720 px wide, 30 fps):

```sh
ffmpeg -ss <start> -t <length> -i <take>.webm -an -vf "scale=720:-2,fps=30" -c:v libx264 -preset slow -crf 27 -pix_fmt yuv420p -movflags +faststart <name>.mp4
ffmpeg -ss <start> -t <length> -i <take>.webm -an -vf "scale=720:-2,fps=30" -c:v libvpx-vp9 -b:v 0 -crf 38 -row-mt 1 <name>.webm
ffmpeg -i <name>.mp4 -frames:v 1 -q:v 3 <name>-poster.jpg
```

The poster is the first frame of the MP4, so a loop starts without a jump.
