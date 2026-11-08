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
// The count-up band's sweep: on the scroll timeline, the same from either direction, and no jumps.
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
  // The count-up band's line sweep (src/scripts/sweep.ts) runs on the section's scroll timeline, so a block's
  // opacity is a function of the scroll position alone: the same whether the visitor arrives from above, from
  // below, or in one jump. The old script-driven moment with its 0.3 s fade read 0.41 from below and 0.57 from above.
  const sweep = await page.evaluate(async () => {
    const root = document.querySelector('#features');
    const top = root.getBoundingClientRect().top + scrollY;
    const els = [...root.querySelectorAll('.sweep__block')].filter((e) => e.getBoundingClientRect().height);
    const frame = () => new Promise((r) => requestAnimationFrame(r));
    const settle = async (y) => { scrollTo(0, y); await frame(); await frame(); };
    const op = () => els.map((e) => +getComputedStyle(e).opacity);
    const anims = document.getAnimations().filter((a) => root.contains(a.effect.target));
    const onTimeline = anims.length >= els.length + 2 && anims.every((a) => a.timeline && a.timeline.constructor.name === 'ViewTimeline');
    let drift = 0, jump = 0, hidden = 0;
    for (let y = top - innerHeight * 0.7; y <= top + innerHeight * 0.1; y += 40) {
      await settle(top + 600); await settle(y); const up = op();
      await settle(top - innerHeight); await settle(y); const down = op();
      up.forEach((v, i) => { drift = Math.max(drift, Math.abs(v - down[i])); });
    }
    // step through the climb and back in 10 px frames: no block above the line changes by more than 0.2 in a frame
    for (const [from, to] of [[top - innerHeight, top + 300], [top + 300, top - innerHeight]]) {
      const dir = Math.sign(to - from);
      let y = from; await settle(y);
      let prev = op();
      while (dir > 0 ? y < to : y > to) {
        y += dir * 10; scrollTo(0, y); await frame();
        const cut = root.querySelector('.sweep__line').getBoundingClientRect().top;
        const cur = op();
        cur.forEach((v, i) => { const r = els[i].getBoundingClientRect(); if (r.top >= cut && r.bottom > 0 && r.top < innerHeight) jump = Math.max(jump, Math.abs(v - prev[i])); });
        prev = cur;
      }
    }
    await settle(top);
    hidden = op().filter((v) => v < 1).length;
    return { onTimeline, n: anims.length, drift, jump, hidden };
  });
  check('the count-up sweep runs on the scroll timeline', sweep.onTimeline, `${sweep.n} animations`);
  check('the count-up sweep reads the same from above, from below and after a jump', sweep.drift < 0.02, `largest difference ${sweep.drift.toFixed(3)}`);
  check('the count-up band never jumps as its sweep opens', sweep.jump < 0.2, `largest one-frame opacity change ${sweep.jump.toFixed(3)}`);
  check('every count-up block is whole once the section is at the top', sweep.hidden === 0, `${sweep.hidden} still faded`);
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

// The hero enters once on load (tasteskill 2.5.1): the h1 in word masks, then it stands; Rebuy works meanwhile.
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addInitScript(() => document.addEventListener('readystatechange', () => { document.documentElement.dataset.motion = 'live'; }, { once: true }));
  const page = await ctx.newPage();
  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
  // motion.js waits for the fonts (250 ms at most) before it masks the words
  await page.waitForSelector('.hero.is-entering', { timeout: 800 }).catch(() => {});
  const early = await page.$eval('.hero', (h) => ({ entering: h.classList.contains('is-entering'), masks: h.querySelectorAll('h1 .m-w').length }));
  check('the hero enters: the h1 rises out of word masks', early.entering && early.masks > 0, JSON.stringify(early));
  await page.waitForTimeout(180);
  await page.click('.hero [data-rebuy="carlo"]');
  await page.waitForTimeout(1300);
  const rest = await page.$eval('.hero', (h) => ({ done: h.classList.contains('is-entered'), masks: h.querySelectorAll('h1 .m-w').length, h1: getComputedStyle(h.querySelector('h1')).opacity, lead: getComputedStyle(h.querySelector('.hero__lead')).opacity, scale: getComputedStyle(h.querySelector('.hero__art')).scale }));
  check('the hero stands by 1.6 s, its h1 given back whole', rest.done && rest.masks === 0 && rest.h1 === '1' && rest.lead === '1' && (rest.scale === 'none' || rest.scale === '1'), JSON.stringify(rest));
  check('a Rebuy during the entrance still lands', (await page.$eval('.hero [data-pot]', (el) => el.dataset.value || el.textContent)) === '₱11,500');
  await ctx.close();
  const rctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const r = await rctx.newPage();
  await r.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
  await r.waitForTimeout(60);
  check('reduced motion: the hero stands as written at once', await r.$eval('.hero', (h) => !h.classList.contains('is-entering') && getComputedStyle(h.querySelector('h1')).opacity === '1'));
  await rctx.close();
}

// The settle-up diagram's lines draw with the scroll (T3): hidden below, whole above, the same both ways.
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addInitScript(() => document.addEventListener('readystatechange', () => { document.documentElement.dataset.motion = 'live'; }, { once: true }));
  const page = await ctx.newPage();
  await page.goto(`${BASE}/`);
  await page.waitForTimeout(1500);
  const draw = await page.evaluate(async () => {
    const dg = document.querySelector('#features .dg');
    const top = dg.getBoundingClientRect().top + scrollY;
    const frame = () => new Promise((r) => requestAnimationFrame(r));
    const at = async (f) => { scrollTo(0, top - f * innerHeight); await frame(); await frame(); return parseFloat(getComputedStyle(dg.querySelector('.dg-edges')).clipPath.split(' ')[2]); };
    const down = [], up = [];
    for (const f of [1, 0.6, 0.4, 0.1]) down.push(await at(f));
    for (const f of [0.1, 0.4, 0.6, 1]) up.unshift(await at(f));
    return { down, up };
  });
  check('the settle-up lines are hidden below and whole once in view', draw.down[0] === 100 && draw.down[3] === 0, draw.down.join(' → '));
  check('the settle-up lines draw part way mid-scroll', draw.down.slice(1, 3).every((v) => v > 0 && v < 100), draw.down.join(' → '));
  check('the settle-up lines read the same scrolling down and up', draw.down.every((v, i) => Math.abs(v - draw.up[i]) < 0.5), `${draw.down} / ${draw.up}`);
  await ctx.close();
  const rctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const r = await rctx.newPage();
  await r.goto(`${BASE}/`);
  await r.$eval('#features .dg', (e) => e.scrollIntoView({ block: 'end' }));
  await r.waitForTimeout(300);
  check('reduced motion: the settle-up lines stand whole', await r.$eval('#features .dg-edges', (e) => ['none', 'inset(0px)'].includes(getComputedStyle(e).clipPath)));
  await rctx.close();
}

// The Steps section pins (T4, the kit's pinned-chapters): the steps open with the scroll, both ways; phones get rows.
for (const [w, h] of [[1440, 900], [1024, 768]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  await ctx.addInitScript(() => document.addEventListener('readystatechange', () => { document.documentElement.dataset.motion = 'live'; }, { once: true }));
  const page = await ctx.newPage();
  await page.goto(`${BASE}/`);
  await page.waitForFunction(() => document.querySelector('#steps')?.classList.contains('is-live'), null, { timeout: 4000 }).catch(() => {});
  const res = await page.evaluate(async () => {
    const root = document.querySelector('#steps');
    const top = root.getBoundingClientRect().top + scrollY;
    const span = root.offsetHeight - innerHeight;
    const frame = () => new Promise((r) => requestAnimationFrame(r));
    const open = async (f) => { scrollTo(0, top + f * span); for (let i = 0; i < 4; i++) await frame(); return [...root.querySelectorAll('.mo-pc__step')].findIndex((s) => s.classList.contains('is-on')); };
    const down = [await open(0.05), await open(0.5), await open(0.95)];
    const up = [await open(0.5), await open(0.05)];
    const stuck = root.querySelector('.mo-pc__grid').getBoundingClientRect().top;
    return { live: root.classList.contains('is-live'), screens: root.offsetHeight / innerHeight, down, up, stuck };
  });
  check(`${w}: Steps pins for two screens`, res.live && Math.abs(res.screens - 2) < 0.01, JSON.stringify(res));
  check(`${w}: steps 1, 2, 3 open with the scroll`, res.down.join() === '0,1,2', res.down.join());
  check(`${w}: scrolling back opens them in reverse`, res.up.join() === '1,0', res.up.join());
  await ctx.close();
}
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/`);
  await page.waitForTimeout(1500);
  const r = await page.$eval('#steps', (s) => ({ live: s.classList.contains('is-live'), visuals: [...s.querySelectorAll('.mo-pc__step > .mo-pc__visual')].filter((v) => v.getBoundingClientRect().height > 100).length, p: [...s.querySelectorAll('.mo-pc__step > p')].every((p) => getComputedStyle(p).opacity === '1') }));
  check('390: Steps does not pin; each step stands with its screen', !r.live && r.visuals === 3 && r.p, JSON.stringify(r));
  await ctx.close();
}

// The Log section replays the night with the scroll (T6): the same step both ways, the rows, badge and results
// agree, the whole night at the foot, and a Rebuy still lands.
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addInitScript(() => document.addEventListener('readystatechange', () => { document.documentElement.dataset.motion = 'live'; }, { once: true }));
  const page = await ctx.newPage();
  await page.goto(`${BASE}/`);
  await page.waitForTimeout(1500);
  const read = (f) => page.evaluate(async (f) => {
    const root = document.querySelector('#table');
    const top = root.getBoundingClientRect().top + scrollY;
    scrollTo(0, top + f * (root.offsetHeight - innerHeight));
    await new Promise((r) => setTimeout(r, 450));
    const rows = [...root.querySelectorAll('[data-log] > li')];
    const shown = rows.filter((r) => getComputedStyle(r).opacity === '1').length;
    const results = [...root.querySelectorAll('[data-standing]')].filter((r) => getComputedStyle(r).opacity === '1').length;
    const pays = [...root.querySelectorAll('[data-pay-list] > li')].filter((r) => getComputedStyle(r).opacity === '1').length;
    return { step: +root.dataset.replayStep, total: rows.length, shown, badge: root.querySelector('[data-log-count]').textContent, results, pays, live: root.classList.contains('is-replay'), screens: root.offsetHeight / innerHeight };
  }, f);
  const fs = [0, 0.25, 0.5, 0.75, 1];
  const down = []; for (const f of fs) down.push(await read(f));
  const up = []; for (const f of [...fs].reverse()) up.unshift(await read(f));
  check('Log replay: live and two screens tall', down[0].live && Math.abs(down[0].screens - 2) < 0.01, `${down[0].screens}`);
  check('Log replay: the first buy-in at the top, the whole night at the foot', down[0].step === 1 && down[4].step === down[4].total, `${down[0].step} … ${down[4].step}/${down[4].total}`);
  check('Log replay: the steps grow with the scroll', down.every((d, i) => i === 0 || d.step > down[i - 1].step), down.map((d) => d.step).join(','));
  check('Log replay: the same step scrolling down and up', down.every((d, i) => d.step === up[i].step), `${down.map((d) => d.step)} / ${up.map((d) => d.step)}`);
  check('Log replay: rows shown and the badge match the step', down.every((d) => d.shown === d.step && d.badge === `${d.step} entries`), down.map((d) => `${d.shown}/${d.badge}`).join(', '));
  check('Log replay: who pays whom only at the foot', down.slice(0, 4).every((d) => d.pays === 0) && down[4].pays === 4, down.map((d) => d.pays).join(','));
  check('Log replay: every result shows at the foot', down[4].results === 6, `${down[4].results}`);
  await read(1);
  const ends = await page.$$eval('#table [data-st-res]', (l) => l.map((e) => e.textContent));
  check('Log replay: the results at the foot are the counted ones', ends.every((t) => /^[+−-]?₱/.test(t)), ends.join(' '));
  await page.evaluate(() => scrollTo(0, 0));
  await page.click('.hero [data-rebuy="bea"]');
  const end = await read(1);
  check('Log replay: a Rebuy replays too, and the foot holds the new night', end.total === down[4].total + 1 && end.step === end.total && end.badge === `${end.total} entries`, JSON.stringify(end));
  await page.click('#table [data-mark-paid="0"]');
  await page.waitForTimeout(100);
  check('Log replay: Mark paid works at the foot', await page.$eval('#table [data-pay-list] > li:first-child', (li) => li.classList.contains('is-paid')));
  await ctx.close();
}
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/`);
  await page.waitForTimeout(800);
  const r = await page.$eval('#table', (s) => ({ live: s.classList.contains('is-replay'), later: s.querySelectorAll('.is-later').length, badge: s.querySelector('[data-log-count]').textContent }));
  check('reduced motion: the Log section shows the whole night, not pinned', !r.live && r.later === 0 && r.badge === '14 entries', JSON.stringify(r));
  await ctx.close();
}

await browser.close();
const failed = results.filter((r) => !r).length;
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);
