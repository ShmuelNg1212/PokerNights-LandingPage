import { createTable, nightLog, standings, type TableSnapshot } from '../lib/table';
import { peso, signedPeso } from '../lib/money';
import { buyInLabel, chipClass, ENTRY_LABEL, entryCount, MAX_STACK, resultTone, timerLabel, transferCount } from '../lib/labels';

/** Hooks a pot figure can use to animate its change (set by roll.ts). */
export interface LiveHooks {
  onPot?: (el: HTMLElement, from: string, to: string) => void;
  onMark?: (row: HTMLElement) => void;
}

const table = createTable();
/** The table as the page shows it now (replay.ts reads it). */
export const liveSnapshot = () => table.snapshot();
const hooks: LiveHooks = {};
export function setLiveHooks(next: LiveHooks) {
  Object.assign(hooks, next);
}

const all = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => [...root.querySelectorAll<T>(sel)];

function renderPlayers(s: TableSnapshot) {
  for (const p of s.players) {
    for (const row of all(`[data-player="${p.id}"]`)) {
      const stack = row.querySelector<HTMLElement>('[data-stack]');
      if (stack) {
        const want = Math.min(p.buyIns.length, MAX_STACK);
        while (stack.children.length < want) stack.appendChild(document.createElement('i'));
      }
      const label = row.querySelector('[data-label]');
      if (label) label.textContent = buyInLabel(p.buyIns.length);
      const bought = row.querySelector('[data-bought]');
      if (bought) bought.textContent = peso(p.boughtIn);
    }
  }
}

function renderPot(s: TableSnapshot) {
  for (const el of all('[data-pot]')) {
    // While a roll runs, the figure's text holds its digits twice; its target is in data-value.
    const from = el.dataset.value ?? el.textContent ?? '';
    const to = peso(s.pot);
    if (from === to) continue;
    if (hooks.onPot) hooks.onPot(el, from, to);
    else el.textContent = to;
  }
  for (const el of all('[data-total]')) el.textContent = peso(s.boughtIn);
}

/** Each list's first server-rendered row: the shape a new row is cloned from. */
const shapes = new WeakMap<HTMLElement, Element>();

/**
 * Brings a list to one row per item. Rows already on the page are updated in place (a loop that
 * holds them, such as the hero card's, keeps working); missing rows are cloned from the list's
 * first row; extra rows are removed.
 */
function fill<T>(list: HTMLElement, items: T[], apply: (row: HTMLElement, item: T, i: number) => void) {
  if (!shapes.has(list) && list.firstElementChild) shapes.set(list, list.firstElementChild.cloneNode(true) as Element);
  const shape = shapes.get(list);
  if (!shape) return;
  items.forEach((item, i) => {
    let row = list.children[i] as HTMLElement | undefined;
    if (!row) {
      row = shape.cloneNode(true) as HTMLElement;
      row.classList.remove('is-off');
      list.appendChild(row);
    }
    apply(row, item, i);
  });
  while (list.children.length > items.length) list.lastElementChild!.remove();
}

const chip = (el: Element | null, colour: number, initials: string) => {
  if (!el) return;
  el.className = el.className.replace(/\bk\d+\b/, chipClass(colour));
  (el as HTMLElement).dataset.initials = initials;
};
const text = (row: ParentNode, sel: string, value: string) => {
  const el = row.querySelector(sel);
  if (el) el.textContent = value;
};

/** The hero card's demo loop stops for good once the visitor marks a payment. */
let payTouched = false;

function renderTransfers(s: TableSnapshot) {
  const people = new Map(s.players.map((p) => [p.id, p]));
  for (const list of all('[data-transfers]')) {
    fill(list, s.transfers, (row, t, i) => {
      const from = people.get(t.from)!;
      const to = people.get(t.to)!;
      chip(row.querySelector('[data-from-chip]'), from.colour, from.initials);
      chip(row.querySelector('[data-to-chip]'), to.colour, to.initials);
      text(row, '[data-from]', from.name);
      text(row, '[data-to]', to.name);
      text(row, '[data-amount]', peso(t.amount));
      row.classList.toggle('is-paid', t.paid);
      if (i > 0 || payTouched) row.removeAttribute('data-m-loop');
      const btn = row.querySelector<HTMLButtonElement>('[data-mark-paid]');
      if (btn) {
        btn.dataset.markPaid = String(i);
        btn.setAttribute('aria-pressed', String(t.paid));
        btn.setAttribute('aria-label', `${t.paid ? 'Undo paid' : 'Mark paid'}: ${from.name} pays ${to.name} ${peso(t.amount)}`);
      }
    });
  }
  for (const el of all('[data-transfer-count]')) el.textContent = transferCount(s.transfers.length);
}

function renderLog(s: TableSnapshot) {
  const rows = nightLog(s);
  for (const list of all('[data-log]')) {
    fill(list, rows, (row, e) => {
      row.className = `log-row is-${e.kind}`;
      text(row, 'time', e.time);
      chip(row.querySelector('[data-log-chip]'), e.colour, e.initials);
      text(row, '[data-log-name]', e.name);
      text(row, '[data-log-kind]', ENTRY_LABEL[e.kind]);
      text(row, '[data-log-amt]', peso(e.amount));
    });
  }
  for (const el of all('[data-log-count]')) el.textContent = entryCount(rows.length);
}

function renderStandings(s: TableSnapshot) {
  const people = new Map(s.players.map((p) => [p.id, p]));
  const sorted = standings(s);
  for (const list of all('[data-standings]')) {
    fill(list, sorted, (row, r) => {
      const p = people.get(r.id)!;
      row.dataset.stId = r.id;
      chip(row.querySelector('[data-st-chip]'), p.colour, p.initials);
      text(row, '[data-st-name]', p.name);
      text(row, '[data-st-in]', `${peso(r.boughtIn)} in`);
      const res = row.querySelector('[data-st-res]');
      if (res) {
        res.textContent = signedPeso(r.result);
        res.className = `standing__res ${resultTone(r.result)}`.trim();
      }
    });
  }
}

const marks = new WeakMap<HTMLElement, number>();
function mark(id: string) {
  for (const row of all(`[data-player="${id}"]`)) {
    const tag = row.querySelector<HTMLElement>('[data-mark]');
    if (!tag) continue;
    row.classList.add('is-marked');
    tag.hidden = false;
    hooks.onMark?.(row);
    window.clearTimeout(marks.get(row));
    // A later rebuy on the same row starts its own three seconds, as in the app.
    marks.set(row, window.setTimeout(() => {
      row.classList.remove('is-marked');
      tag.hidden = true;
    }, 3000));
  }
}

const rendered = new Set<() => void>();
/** Called after every render of the live table (replay.ts re-applies its step). */
export function onLiveRender(fn: () => void) {
  rendered.add(fn);
}

function render(s: TableSnapshot) {
  renderPlayers(s);
  renderPot(s);
  renderTransfers(s);
  renderLog(s);
  renderStandings(s);
  if (s.lastRebuy) mark(s.lastRebuy);
  for (const fn of rendered) fn();
}

/** The live badge reads the visitor's own clock; the set timer counts from arrival. */
function startClock() {
  const arrived = Date.now();
  const clock = all('[data-clock]');
  const timer = all('[data-timer]');
  const fmt = new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit', hour12: false });
  const tick = () => {
    const now = new Date();
    for (const el of clock) {
      el.textContent = fmt.format(now);
      el.setAttribute('datetime', now.toISOString());
    }
    for (const el of timer) el.textContent = timerLabel(Date.now() - arrived);
  };
  tick();
  window.setInterval(tick, 15_000);
}

export function initLive() {
  table.subscribe(render);
  document.addEventListener('click', (e) => {
    const target = e.target as Element | null;
    const rebuy = target?.closest<HTMLButtonElement>('[data-rebuy]');
    if (rebuy) {
      table.rebuy(rebuy.dataset.rebuy!);
      return;
    }
    const pay = target?.closest<HTMLButtonElement>('[data-mark-paid]');
    if (pay) {
      payTouched = true;
      table.markPaid(Number(pay.dataset.markPaid));
    }
  });
  startClock();
}
