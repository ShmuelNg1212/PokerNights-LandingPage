// Rendezvous probe for the landing page. Serve the built site (npx astro preview --port 4329), then run:
//   PLAYWRIGHT_BROWSERS_PATH=/private/tmp/pn-browser-binaries node tools/probe/probe.mjs
// Uses the Playwright install described in public/media/README.md and the installed Chrome.
const { chromium } = await import(process.env.PN_PLAYWRIGHT || '/private/tmp/pn-browser-tools/node_modules/playwright/index.mjs');
const BASE = process.env.PN_LANDING_URL || 'http://127.0.0.1:4329';
const results = [];
const check = (name, ok, note = '') => { results.push(ok); console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${note ? `  (${note})` : ''}`); };
const peso = (s) => Number(s.replace(/[^\d.−-]/g, '').replace('−', '-'));
const browser = await chromium.launch({ channel: 'chrome' });

// Phone, motion on.
{
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(`${BASE}/`);
  await page.waitForTimeout(1400);
  const pot = () => page.$eval('.hero [data-pot]', (el) => el.getAttribute('aria-label') || el.textContent);
  const transfers = () => page.$$eval('[data-transfers] li', (lis) => lis.map((li) => li.textContent.replace(/\s+/g, ' ').trim()));
  const before = { pot: await pot(), t: await transfers() };
  check('starts at ₱10,500 with four transfers', before.pot === '₱10,500' && before.t.length === 4, `${before.pot}, ${before.t.length}`);

  await page.tap('.hero [data-rebuy="carlo"]');
  await page.waitForTimeout(150);
  const rolling = await page.$$eval('.hero [data-pot] .roll-cell', (c) => c.length);
  check('a rebuy rolls the pot figure', rolling > 0, `${rolling} cells`);
  await page.waitForTimeout(1000);
  check('the pot reads ₱11,500 after Carlo rebuys', (await pot()) === '₱11,500', await pot());
  check('Carlo shows "Rebuy added" on his row', await page.$eval('.hero [data-player="carlo"] [data-mark]', (m) => !m.hidden));
  await page.tap('.hero [data-rebuy="jerome"]');
  await page.waitForTimeout(1100);
  check('the pot reads ₱12,500 after Jerome rebuys', (await pot()) === '₱12,500', await pot());
  const after = await transfers();
  check('who pays whom changed after the rebuys', JSON.stringify(after) !== JSON.stringify(before.t), after.join(' | '));
  const amounts = after.map((t) => peso(t.split('₱').pop()));
  check('the transfers still add up to what the losers lost', amounts.every((a) => a > 0) && after.length <= 5, amounts.join(' + '));
  const showcase = await page.$eval('.showcase [data-player="carlo"] [data-label]', (el) => el.textContent);
  check('the showcase row follows the same table', showcase === '1 buy-in + 2 rebuys', showcase);
  const result = await page.$eval('[data-result-value]', (el) => el.textContent);
  check("Carlo's end result got worse with his rebuy", peso(result) < -1150, `${result}, was −₱1,150`);

  // The open dialog.
  await page.locator('#invite-link').scrollIntoViewIfNeeded();
  await page.fill('#invite-link', 'https://example.com/join/abc/');
  await page.click('[data-open-button]');
  const refused = await page.$eval('[data-invite-error]', (el) => el.textContent);
  check('a link to another site is refused in words', /not a PokerNights link/.test(refused), refused);
  check('the page did not leave', page.url().startsWith(BASE));
  let opened = '';
  await page.route('https://pokernights-five.vercel.app/**', (r) => { opened = r.request().url(); r.fulfill({ status: 200, body: 'ok' }); });
  await page.fill('#invite-link', 'pokernights-five.vercel.app/join/Tok3n');
  await page.click('[data-open-button]');
  await page.waitForTimeout(600);
  check('an invite link opens on the app address', opened === 'https://pokernights-five.vercel.app/join/Tok3n/', opened);
  check('no script errors', errors.length === 0, errors.join('; '));
  await page.close();
}

// Account path and reduced motion.
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/`);
  await page.waitForTimeout(500);
  const hidden = await page.$$eval('[data-reveal], [data-line], [data-hero-fragment]', (els) => els.filter((e) => getComputedStyle(e).opacity !== '1' || getComputedStyle(e).transform !== 'none').length);
  check('reduced motion: every part is shown at rest', hidden === 0, `${hidden} hidden`);
  await page.click('.hero [data-rebuy="bea"]');
  await page.waitForTimeout(100);
  check('reduced motion: the figure changes at once', (await page.$eval('.hero [data-pot]', (el) => el.textContent)) === '₱11,500' && (await page.$$eval('.roll-cell', (c) => c.length)) === 0);
  let opened = '';
  await page.route('https://pokernights-five.vercel.app/**', (r) => { opened = r.request().url(); r.fulfill({ status: 200, body: 'ok' }); });
  await page.locator('.open-dialog').scrollIntoViewIfNeeded();
  await page.click('.ui-segment label:nth-of-type(2) span');
  check('"I have an account" turns the button into Log in', (await page.textContent('[data-open-button]')) === 'Log in');
  await page.click('[data-open-button]');
  await page.waitForTimeout(500);
  check('Log in opens the app log in', opened === 'https://pokernights-five.vercel.app/accounts/login/', opened);
  await ctx.close();
}

// No JavaScript: the page still reads and the actions still go somewhere.
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/`);
  check('without script the Rebuy buttons are hidden', await page.$$eval('[data-rebuy]', (b) => b.every((x) => getComputedStyle(x).display === 'none')));
  check('without script the main button links to the app', (await page.getAttribute('.hero .pill', 'href')) === 'https://pokernights-five.vercel.app/');
  check('without script the headline is visible', await page.$eval('.hero h1 [data-line]', (el) => getComputedStyle(el).transform === 'none'));
  const contact = await ctx.newPage();
  await contact.goto(`${BASE}/contact/`);
  check('the contact form is a Netlify form', (await contact.getAttribute('form[name=host-request]', 'data-netlify')) === 'true' && (await contact.$('input[name=form-name][value=host-request]')) !== null);
  await ctx.close();
}

await browser.close();
const failed = results.filter((r) => !r).length;
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);
