/**
 * The Log section replays the night with the scroll (ADR 0004, a custom scroll moment). The section is two
 * screens tall and its window sticks for the second one. As the visitor scrolls, the log's rows arrive in time
 * order: buy-ins, rebuys, then each cash-out, which brings that player's result. When the last stack is
 * counted, who pays whom appears. Scrolling up runs it back. Both ends are finished states: the first buy-in at
 * the top, the whole night at the foot (it holds over the last tenth of the scroll).
 *
 * The figures come from replayAt() over the live table, so a Rebuy in the hero replays here too, and the end is
 * always exactly the table the rest of the page shows. The script toggles classes; the CSS does the motion.
 *
 * Live only from 1024px on a screen at least 640px tall, with motion allowed; a headless shot (unless
 * data-motion="live"), reduced motion, no script or a smaller screen show the whole night, as written.
 */
import { replayAt, type ReplayView } from '../lib/table';
import { peso, signedPeso } from '../lib/money';
import { resultTone } from '../lib/labels';
import { liveSnapshot } from './live';

/** The scroll share that holds the whole night at the foot of the section. */
const HOLD_END = 0.1;

export function initReplay() {
  const html = document.documentElement;
  const root = document.querySelector<HTMLElement>('[data-replay]');
  if (!root) return;
  const log = root.querySelector<HTMLElement>('[data-log]');
  const pane = log?.closest<HTMLElement>('.app__pane');
  if (!log || !pane) return;
  const headless = /HeadlessChrome/.test(navigator.userAgent) && html.dataset.motion !== 'live';
  if (html.dataset.motion === 'off' || headless) return;
  const still = matchMedia('(prefers-reduced-motion: reduce)');
  const fits = () => !still.matches && innerWidth >= 1024 && innerHeight >= 640;

  let live = false;
  let raf = 0;
  let shown = -1;

  const badge = (text: string) => {
    for (const el of root.querySelectorAll('[data-log-count]')) if (el.textContent !== text) el.textContent = text;
  };

  /** Each player's result row: shown from their first buy-in, its total growing with each rebuy, the result
   *  from their cash-out. At the last step these are the live table's own figures. */
  const results = (r: ReplayView) => {
    for (const row of root.querySelectorAll<HTMLElement>('[data-standing]')) {
      const id = row.dataset.stId ?? '';
      const mine = r.log.filter((e) => e.player === id);
      const bought = mine.reduce((a, e) => (e.kind === 'cash-out' ? a : a + e.amount), 0);
      const out = mine.find((e) => e.kind === 'cash-out');
      row.classList.toggle('is-later', !mine.length);
      const inEl = row.querySelector('[data-st-in]');
      const want = `${peso(bought)} in`;
      if (inEl && inEl.textContent !== want) inEl.textContent = want;
      const res = row.querySelector<HTMLElement>('[data-st-res]');
      if (!res) continue;
      const result = out ? out.amount - bought : null;
      const text = result === null ? 'Playing' : signedPeso(result);
      if (res.textContent !== text) res.textContent = text;
      res.className = `standing__res ${result === null ? 'is-playing' : resultTone(result)}`.trim();
    }
  };

  const progress = () => {
    const r = root.getBoundingClientRect();
    const span = r.height - innerHeight;
    return span > 0 ? Math.min(1, Math.max(0, -r.top / span)) : 1;
  };

  const apply = () => {
    raf = 0;
    if (!live) return;
    const s = liveSnapshot();
    const total = replayAt(s, Infinity).total;
    // the first entry at the top; the last at (1 - HOLD_END), held to the foot
    const step = 1 + Math.floor(Math.min(1, progress() / (1 - HOLD_END)) * (total - 1) + 1e-9);
    const r = replayAt(s, step);
    root.dataset.replayStep = String(r.step);
    if (r.step === shown && log.children.length === total) return;
    shown = r.step;
    [...log.children].forEach((row, i) => row.classList.toggle('is-later', i >= r.step));
    badge(`${r.step} entries`);
    results(r);
    root.classList.toggle('is-settled', r.settled);
    // the newest row stays in view: the list slides up as it grows past its pane (offsetTop and the pane's
    // height are both measured from the pane, which is the rows' offset parent)
    const last = log.children[r.step - 1] as HTMLElement | undefined;
    const over = last ? last.offsetTop + last.offsetHeight - (pane.clientHeight - 72) : 0;
    log.style.setProperty('--replay-shift', `${-Math.max(0, over)}px`);
  };
  const tick = () => {
    if (!raf) raf = requestAnimationFrame(apply);
  };

  const go = () => {
    if (live) return;
    live = true;
    shown = -1;
    root.classList.add('is-replay');
    apply();
  };
  const rest = () => {
    if (!live) return;
    live = false;
    root.classList.remove('is-replay', 'is-settled');
    delete root.dataset.replayStep;
    results(replayAt(liveSnapshot(), Infinity));
    for (const el of root.querySelectorAll('.is-later')) el.classList.remove('is-later');
    log.style.removeProperty('--replay-shift');
    badge(`${log.children.length} entries`);
  };
  const sync = () => (fits() ? go() : rest());

  sync();
  addEventListener('scroll', tick, { passive: true });
  addEventListener('resize', () => {
    sync();
    shown = -1;
    tick();
  });
  still.addEventListener('change', sync);
  // a Rebuy adds a log row and re-sorts the results: replay them again at the same scroll
  const again = new MutationObserver(() => {
    shown = -1;
    tick();
  });
  for (const list of root.querySelectorAll('[data-log], [data-standings]')) again.observe(list, { childList: true });
}
