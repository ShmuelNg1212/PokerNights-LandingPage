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

// Section headings rise once as they come on screen (ADR 0003). data-motion="live" lets headless Chrome run it.
// The count-up band's blocks fade, never jump, as its moment opens (the largest one-frame opacity change).
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addInitScript(() => document.addEventListener('readystatechange', () => { document.documentElement.dataset.motion = 'live'; }, { once: true }));
  const page = await ctx.newPage();
  await page.goto(`${BASE}/`);
  await page.waitForTimeout(600);
  const o = (id) => page.$eval(id, (e) => +getComputedStyle(e).opacity);
  check('a section heading below the screen waits hidden', (await o('#compare-h')) === 0);
  await page.$eval('#compare-h', (e) => e.scrollIntoView({ block: 'center' }));
  await page.waitForTimeout(1000);
  check('it rises in when scrolled to', (await o('#compare-h')) === 1 && (await page.$eval('#compare-h', (e) => getComputedStyle(e).translate)) !== '0px 12px');
  const jump = await page.evaluate(async () => {
    const root = document.querySelector('#features');
    const top = root.getBoundingClientRect().top + scrollY;
    const els = [...root.querySelectorAll('h2,h3,p,strong,small,dt,dd,img,li,.pn-badge,.dg-label')].filter((e) => !e.closest('[data-ly-steps]'));
    const frame = () => new Promise((r) => requestAnimationFrame(r));
    let worst = 0;
    for (const [from, to] of [[top - innerHeight, top + 300], [top + 300, top - innerHeight]]) {
      const dir = Math.sign(to - from);
      let y = from; scrollTo(0, y); await frame(); await frame();
      let prev = els.map((e) => +getComputedStyle(e).opacity);
      while (dir > 0 ? y < to : y > to) {
        y += dir * 10; scrollTo(0, y); await frame();
        const stage = root.querySelector('.mo-lc__stage');
        const sr = stage && getComputedStyle(stage).display !== 'none' ? stage.getBoundingClientRect() : null;
        const cutY = sr ? sr.top + parseFloat(root.style.getPropertyValue('--mo-cut')) : -1e9;
        const cur = els.map((e) => +getComputedStyle(e).opacity);
        cur.forEach((v, i) => { const r = els[i].getBoundingClientRect(); if (r.top >= cutY && r.height && r.bottom > 0 && r.top < innerHeight) worst = Math.max(worst, Math.abs(v - prev[i])); });
        prev = cur;
      }
    }
    return worst;
  });
  check('the count-up band never jumps as its moment opens', jump < 0.2, `largest one-frame opacity change ${jump.toFixed(3)}`);
  await ctx.close();
}
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addInitScript(() => document.addEventListener('readystatechange', () => { document.documentElement.dataset.motion = 'live'; }, { once: true }));
  const page = await ctx.newPage();
  await page.goto(`${BASE}/#questions`);
  await page.waitForTimeout(1200);
  const shown = await page.$$eval('[data-rise]', (l) => l.filter((e) => e.getBoundingClientRect().top < innerHeight).every((e) => getComputedStyle(e).opacity === '1'));
  check('an anchor jump leaves no heading hidden at or above it', shown);
  await ctx.close();
}

await browser.close();
const failed = results.filter((r) => !r).length;
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);
