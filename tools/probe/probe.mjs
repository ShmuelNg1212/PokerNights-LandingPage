// Rendezvous probe for the landing page. Serve the built site (npx astro preview --port 4329), then run:
//   PLAYWRIGHT_BROWSERS_PATH=/private/tmp/pn-browser-binaries node tools/probe/probe.mjs
// Uses the Playwright install described in public/media/README.md and the installed Chrome.
const { chromium } = await import(process.env.PN_PLAYWRIGHT || '/private/tmp/pn-browser-tools/node_modules/playwright/index.mjs');
const BASE = process.env.PN_LANDING_URL || 'http://127.0.0.1:4329';
const APP = 'https://pokernights-five.vercel.app';
const results = [];
const check = (name, ok, note = '') => { results.push(ok); console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${note ? `  (${note})` : ''}`); };
const browser = await chromium.launch({ channel: 'chrome' });

const rows = (page, sel) => page.$$eval(`${sel} [data-transfers] > li`, (lis) => lis.map((li) => li.textContent.replace(/\s+/g, ' ').trim()));
const names = (page, sel) => page.$$eval(`${sel} [data-transfers] > li`, (lis) => lis.map((li) => `${li.querySelector('[data-from]').textContent}>${li.querySelector('[data-to]').textContent} ${li.querySelector('[data-amount]').textContent}`));

// The first thing a visitor does: tap Rebuy on a phone, then on a desktop see every part agree.
for (const vp of [{ width: 390, height: 844, mobile: true }, { width: 1440, height: 900, mobile: false }]) {
  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 2, isMobile: vp.mobile, hasTouch: vp.mobile });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(`${BASE}/`);
  await page.waitForTimeout(1500);
  const w = vp.width;
  const pot = () => page.$eval('.hero [data-pot]', (el) => el.dataset.value || el.textContent);
  const logCount = () => page.$$eval('#table [data-log] > li', (l) => l.length);
  const before = { pot: await pot(), hero: await names(page, '.hero'), app: await names(page, '#table'), log: await logCount() };
  check(`${w}: starts at ₱10,500 with four transfers in the hero card and the window`, before.pot === '₱10,500' && before.hero.length === 4 && before.app.length === 4, `${before.pot}, ${before.hero.length}/${before.app.length}`);
  check(`${w}: the hero card and the window list the same transfers`, JSON.stringify(before.hero) === JSON.stringify(before.app));

  const tap = (sel) => (vp.mobile ? page.tap(sel) : page.click(sel));
  await tap('.hero [data-rebuy="carlo"]');
  await page.waitForTimeout(150);
  const rolling = await page.$$eval('.hero [data-pot] .roll-cell', (c) => c.length);
  check(`${w}: a rebuy rolls the pot figure`, rolling > 0, `${rolling} cells`);
  await page.waitForTimeout(1000);
  check(`${w}: the pot reads ₱11,500 after Carlo rebuys`, (await pot()) === '₱11,500', await pot());
  const after = { hero: await names(page, '.hero'), app: await names(page, '#table'), log: await logCount() };
  check(`${w}: who pays whom changed, the same in both places`, JSON.stringify(after.hero) !== JSON.stringify(before.hero) && JSON.stringify(after.hero) === JSON.stringify(after.app), after.app.join(' | '));
  check(`${w}: the session log gained one row`, after.log === before.log + 1, `${before.log} → ${after.log}`);
  const lastRebuy = await page.$$eval('#table [data-log] > li.is-rebuy', (l) => l.at(-1)?.textContent.replace(/\s+/g, ' ').trim());
  check(`${w}: the new log row is Carlo's rebuy`, /Carlo\s*Rebuy\s*₱1,000/.test(lastRebuy || ''), lastRebuy);
  const carloRes = await page.$$eval('#table [data-standing]', (l) => l.map((x) => x.textContent.replace(/\s+/g, ' ').trim()).find((t) => t.includes('Carlo')));
  check(`${w}: Carlo's result counts the rebuy`, /₱3,000 in/.test(carloRes || ''), carloRes);

  if (!vp.mobile) {
    await page.locator('#table').scrollIntoViewIfNeeded();
    await page.click('#table [data-mark-paid="0"]');
    await page.waitForTimeout(100);
    const paid = await page.$eval('#table [data-pay-list] > li:first-child', (li) => ({ cls: li.classList.contains('is-paid'), pressed: li.querySelector('[data-mark-paid]').getAttribute('aria-pressed'), loop: li.hasAttribute('data-m-loop') }));
    check(`${w}: Mark paid marks the first transfer paid and stops the demo loop`, paid.cls && paid.pressed === 'true' && !paid.loop, JSON.stringify(paid));
    const amountsAfterPaid = await names(page, '#table');
    check(`${w}: Mark paid changes no amount`, JSON.stringify(amountsAfterPaid) === JSON.stringify(after.app));
    await page.click('#table [data-mark-paid="0"]');
    await page.waitForTimeout(100);
    check(`${w}: a second tap undoes it`, !(await page.$eval('#table [data-pay-list] > li:first-child', (li) => li.classList.contains('is-paid'))));
  }

  // The close: the invite field.
  await page.locator('#invite-link').scrollIntoViewIfNeeded();
  await page.fill('#invite-link', 'https://example.com/join/abc/');
  await page.click('form[data-open] button[type=submit]');
  const refused = await page.$eval('[data-invite-error]', (el) => el.textContent);
  check(`${w}: a link to another site is refused in words`, /not a PokerNights link/.test(refused), refused);
  check(`${w}: the page did not leave`, page.url().startsWith(BASE));
  let opened = '';
  await page.route(`${APP}/**`, (r) => { opened = r.request().url(); r.fulfill({ status: 200, body: 'ok' }); });
  await page.fill('#invite-link', 'pokernights-five.vercel.app/join/Tok3n');
  await page.click('form[data-open] button[type=submit]');
  await page.waitForTimeout(600);
  check(`${w}: an invite link opens on the app address`, opened === `${APP}/join/Tok3n/`, opened);
  check(`${w}: no script errors`, errors.length === 0, errors.join('; '));
  await page.close();
}

// Reduced motion: every loop rests on its finished picture and the pot changes at once.
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/`);
  await page.waitForTimeout(2600);
  const off = await page.$$eval('[data-ly-steps] [data-step].is-off', (l) => l.length);
  check('reduced motion: the hero card and the step cards show every line', off === 0, `${off} lines hidden`);
  const running = await page.evaluate(() => document.getAnimations().filter((a) => a.playState === 'running' && !(a.effect?.getComputedTiming?.().iterations === 1)).length);
  check('reduced motion: no looping animation runs', running === 0, `${running} running`);
  await page.click('.hero [data-rebuy="bea"]');
  await page.waitForTimeout(100);
  check('reduced motion: the pot changes at once', (await page.$eval('.hero [data-pot]', (el) => el.textContent)) === '₱11,500' && (await page.$$eval('.roll-cell', (c) => c.length)) === 0);
  await ctx.close();
}

// No JavaScript: the page reads and every action still goes somewhere.
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/`);
  check('without script the Rebuy and Mark paid buttons are hidden', await page.$$eval('[data-rebuy], [data-mark-paid]', (b) => b.every((x) => getComputedStyle(x).display === 'none')));
  check('without script the hero h1 is visible', await page.isVisible('.hero h1'));
  check('without script the close opens Log in', !(await page.isVisible('#invite-link')) && (await page.getAttribute('form[data-open]', 'action')) === `${APP}/accounts/login/`);
  check('without script the moment section shows its words', await page.$eval('#features h2', (el) => getComputedStyle(el).opacity === '1'));
  const contact = await ctx.newPage();
  await contact.goto(`${BASE}/contact/`);
  check('the contact form is a Netlify form', (await contact.getAttribute('form[name=host-request]', 'data-netlify')) === 'true' && (await contact.$('input[name=form-name][value=host-request]')) !== null);
  await ctx.close();
}

await browser.close();
const failed = results.filter((r) => !r).length;
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);
