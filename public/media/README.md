# Media

The app clips and stills are recordings from a temporary local database with synthetic players. The hero uses a chip-stack video made in Gemini.

## Hero background video

The source file is `revised-hero-asset-pokernights.mp4`. The export has no audio and puts a seek point every six frames. The poster comes from the first frame of that export.

Run these commands from the repo root. Set the input path to the supplied file. Use FFmpeg and `cwebp`.

```sh
ffmpeg -i /path/to/revised-hero-asset-pokernights.mp4 -map 0:v:0 -an -c:v libx264 -preset medium -crf 24 -pix_fmt yuv420p -g 6 -keyint_min 6 -sc_threshold 0 -movflags +faststart public/media/hero/chip-stack.mp4
ffmpeg -i public/media/hero/chip-stack.mp4 -frames:v 1 /tmp/pn-chip-stack-poster.png
cwebp -q 87 /tmp/pn-chip-stack-poster.png -o public/media/hero/chip-stack.webp
```

Keep the output at 24 frames per second. The scroll script uses that frame rate to select a picture.

## Files

| File | What it shows | Source |
|---|---|---|
| `seat-draw.*` | The seat draw: drawing the dealer seat (390 × 844, 1×) | first take (Playwright `recordVideo`, top-left 390 × 844 crop), 0.0–4.0 s |
| `deal.*` | The Rebuy sheet for Carlo, then the pot rises from ₱6,000 to ₱7,000 (2×) | zoomed screencast `night` take, 9.75–12.8 s |
| `recap.*` | Everyone's results, then who pays whom (2×) | zoomed screencast `settle` take, 0.0–4.2 s |

Stills are in `src/assets/app/` (390 × 844 at 2×), from the same takes.

## How to make them again

1. Install the browser tool outside the repo, as `~/PokerNights/web/tests/browser/README.md` says, plus Playwright's ffmpeg: `PLAYWRIGHT_BROWSERS_PATH=/private/tmp/pn-browser-binaries node /private/tmp/pn-browser-tools/node_modules/playwright/cli.js install ffmpeg`.
2. Run `tools/record/take.sh`. It records a 390 × 844 phone at 2×: a 780 × 1688 viewport with the page zoomed 2×, captured by Chrome's screencast as timed JPEG frames. The seat draw and the set overture read the window size, so they do not lay out right under the zoom; their clip comes from a 1× take. It makes a fresh SQLite database, seeds `seed_landing.py`, serves the app on `127.0.0.1:8765`, and runs `record.mjs` with the installed Chrome. Raw takes land in `$R/raw` (default `/private/tmp/pn-landing-rec/raw`).
3. Join the frames: `ffmpeg -f concat -safe 0 -i <take>/list.txt -vf "scale=780:1688,fps=30,format=yuv420p" -c:v libx264 -crf 12 <take>.mp4`. Then encode each clip (no audio, 720 px wide, 30 fps):

```sh
ffmpeg -ss <start> -t <length> -i <take>.mp4 -an -vf "scale=720:-2,fps=30" -c:v libx264 -preset slow -crf 27 -pix_fmt yuv420p -movflags +faststart <name>.mp4
ffmpeg -ss <start> -t <length> -i <take>.mp4 -an -vf "scale=720:-2,fps=30" -c:v libvpx-vp9 -b:v 0 -crf 38 -row-mt 1 <name>.webm
ffmpeg -i <name>.mp4 -frames:v 1 -q:v 3 <name>-poster.jpg
```

The poster is the first frame of the MP4, so a loop starts without a jump.
