// Records the real PokerNights app on the synthetic landing fixture (seed_landing.py).
// Output: raw .webm recordings and PNG stills in OUT. Encoding happens afterwards with ffmpeg.
import { readFileSync, mkdirSync, renameSync } from 'node:fs';
const { chromium } = await import('/private/tmp/pn-browser-tools/node_modules/playwright/index.mjs');

const OUT = process.argv[2];
mkdirSync(OUT, { recursive: true });
const BASE = 'http://127.0.0.1:8765';
const M = JSON.parse(readFileSync('/private/tmp/pn-landing-manifest.json', 'utf8'));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const phone = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, colorScheme: 'dark' };

const browser = await chromium.launch({ channel: 'chrome' });

// Log in once, outside any recording.
const auth = await browser.newContext(phone);
const lp = await auth.newPage();
await lp.goto(`${BASE}/accounts/login/`);
await lp.fill('[name=username]', 'hana');
await lp.fill('[name=password]', 'tablestakes-91');
await lp.click('form.form-section [type=submit]');
await lp.waitForLoadState('networkidle');
const state = await auth.storageState();
await auth.close();

async function record(name, run) {
  const ctx = await browser.newContext({ ...phone, storageState: state, recordVideo: { dir: OUT, size: { width: 780, height: 1688 } } });
  const page = await ctx.newPage();
  const marks = {};
  const t0 = Date.now();
  const mark = (k) => (marks[k] = (Date.now() - t0) / 1000);
  try {
    await run(page, mark);
  } finally {
    const video = page.video();
    await ctx.close();
    if (video) renameSync(await video.path(), `${OUT}/${name}.webm`);
    console.log(name, JSON.stringify(marks));
  }
}

async function done(page) {
  const b = page.locator('.seat-stage[open] [data-stage-done]:not([hidden])');
  if (await b.count() && await b.isVisible()) await b.click();
  else await page.evaluate(() => document.querySelector('dialog.seat-stage[open]')?.close());
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
  await page.click('.host-controls button[value=start]');
  await page.waitForFunction(() => document.getElementById('live')?.dataset.state === 'running', null, { timeout: 10000 });
  await sleep(2600);
  await done(page);
  await sleep(900);
  mark('running');
  await still(page, 'running-set');
  for (const who of ['Carlo', 'Jerome']) {
    const pk = M.people[who];
    mark(`rebuy-${who}`);
    await page.click(`[data-sheet-open=buy-${pk}]`);
    await sleep(900);
    if (who === 'Carlo') await still(page, 'rebuy-sheet');
    await page.click('dialog.sheet[open] .buy-form [type=submit]');
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
  const share = page.locator('text=Share results').first();
  if (await share.count()) {
    await share.scrollIntoViewIfNeeded();
    await sleep(500);
    mark('share');
    await share.click();
    await sleep(2500);
    await still(page, 'share');
  }
  mark('end');
});

await browser.close();
