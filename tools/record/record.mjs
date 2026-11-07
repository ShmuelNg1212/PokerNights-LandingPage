// Records the real PokerNights app on the synthetic landing fixture (seed_landing.py).
// Output: raw .webm recordings and PNG stills in OUT. Encoding happens afterwards with ffmpeg.
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
const { chromium } = await import('/private/tmp/pn-browser-tools/node_modules/playwright/index.mjs');

const OUT = process.argv[2];
mkdirSync(OUT, { recursive: true });
const BASE = 'http://127.0.0.1:8765';
const M = JSON.parse(readFileSync('/private/tmp/pn-landing-manifest.json', 'utf8'));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
// A 390 × 844 phone drawn at 2×: a 780 × 1688 viewport with the page zoomed 2×, so the screencast has every device pixel.
const phone = { viewport: { width: 780, height: 1688 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true, colorScheme: 'dark' };
const zoom = () => document.addEventListener('DOMContentLoaded', () => { document.documentElement.style.zoom = '2'; });

const browser = await chromium.launch({ channel: 'chrome' });

// Log in once, outside any recording.
const auth = await browser.newContext(phone);
await auth.addInitScript(zoom);
const lp = await auth.newPage();
await lp.goto(`${BASE}/accounts/login/`);
await lp.fill('[name=username]', 'hana');
await lp.fill('[name=password]', 'tablestakes-91');
await lp.click('form.form-section [type=submit]');
await lp.waitForLoadState('networkidle');
const state = await auth.storageState();
await auth.close();

// Chrome's screencast at device pixels (780 × 1688), saved as timed JPEG frames. ffmpeg assembles them later.
async function record(name, run) {
  const ctx = await browser.newContext({ ...phone, storageState: state });
  await ctx.addInitScript(zoom);
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  const dir = `${OUT}/${name}`;
  mkdirSync(dir, { recursive: true });
  const frames = [];
  cdp.on('Page.screencastFrame', async ({ data, metadata, sessionId }) => {
    const file = `${dir}/f${String(frames.length).padStart(5, '0')}.jpg`;
    writeFileSync(file, Buffer.from(data, 'base64'));
    frames.push({ file, t: metadata.timestamp });
    await cdp.send('Page.screencastFrameAck', { sessionId }).catch(() => {});
  });
  const marks = {};
  const t0 = Date.now() / 1000;
  const mark = (k) => (marks[k] = +(Date.now() / 1000 - t0).toFixed(2));
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 92, maxWidth: 780, maxHeight: 1688, everyNthFrame: 1 });
  try {
    await run(page, mark);
  } finally {
    await cdp.send('Page.stopScreencast').catch(() => {});
    await ctx.close();
    // A concat list with each frame's own duration; the last frame holds for a tenth of a second.
    const first = frames[0]?.t ?? t0;
    const lines = frames.map((f, i) => `file '${f.file}'\nduration ${(((frames[i + 1]?.t ?? f.t + 0.1) - f.t)).toFixed(4)}`);
    writeFileSync(`${dir}/list.txt`, lines.join('\n') + `\nfile '${frames.at(-1)?.file}'\n`);
    writeFileSync(`${dir}/start.txt`, String(first - t0));
    console.log(name, frames.length, 'frames', JSON.stringify(marks), 'first frame at', (first - t0).toFixed(2));
  }
}

async function done(page) {
  await page.evaluate(() => {
    const b = document.querySelector('.seat-stage[open] [data-stage-done]:not([hidden])');
    if (b) b.click();
    else document.querySelector('dialog.seat-stage[open]')?.close();
  });
}
const still = (page, name) => page.screenshot({ path: `${OUT}/${name}.png` });

// A: the seat draw plays on start, then two rebuys roll the pot.
await record('night', async (page, mark) => {
  await page.goto(`${BASE}/s/${M.open}/`);
  await page.waitForLoadState('networkidle');
  // A seat draw this browser has not watched opens on arrival: let it play, then tap Done.
  mark('draw');
  await sleep(4200);
  await still(page, 'seat-draw');
  await done(page);
  await sleep(700);
  await still(page, 'open-set');
  mark('start');
  await page.$eval('.host-controls button[value=start]', (el) => el.click());
  await page.waitForFunction(() => document.getElementById('live')?.dataset.state === 'running', null, { timeout: 10000 });
  await sleep(2600);
  await done(page);
  await sleep(900);
  mark('running');
  await still(page, 'running-set');
  for (const who of ['Carlo', 'Jerome']) {
    const pk = M.people[who];
    mark(`rebuy-${who}`);
    await page.$eval(`[data-sheet-open=buy-${pk}]`, (el) => el.click());
    await sleep(900);
    if (who === 'Carlo') await still(page, 'rebuy-sheet');
    await page.$eval('dialog.sheet[open] .buy-form [type=submit]', (el) => el.click());
    await sleep(2600);
  }
  mark('end');
  await still(page, 'after-rebuys');
});

// B: the closed session's settle-up, then Share results.
await record('settle', async (page, mark) => {
  await page.goto(`${BASE}/n/${M.night}/`);
  await page.waitForLoadState('networkidle');
  await sleep(1500);
  await page.evaluate(() => document.querySelector('dialog[open]')?.close());
  await sleep(500);
  mark('top');
  await still(page, 'session-top');
  const list = page.locator('text=Who pays whom').first();
  if (await list.count()) {
    await list.scrollIntoViewIfNeeded();
    await page.mouse.wheel(0, -120);
  } else {
    await page.mouse.wheel(0, 600);
  }
  await sleep(1400);
  mark('transfers');
  await still(page, 'transfers');
  mark('end');
});

await browser.close();
