import { createTable, cashOuts, type TableSnapshot } from '../lib/table';
import { peso, signedPeso } from '../lib/money';
import { buyInLabel, chipClass, MAX_STACK, timerLabel, transferCount } from '../lib/labels';

/** Hooks a pot figure can use to animate its change (set by motion.ts). */
export interface LiveHooks {
  onPot?: (el: HTMLElement, from: string, to: string) => void;
  onMark?: (row: HTMLElement) => void;
}

const table = createTable();
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
    const from = el.textContent ?? '';
    const to = peso(s.pot);
    if (from === to) continue;
    if (hooks.onPot) hooks.onPot(el, from, to);
    else el.textContent = to;
  }
  for (const el of all('[data-total]')) el.textContent = peso(s.boughtIn);
}

/** Rows that show a player's end-of-night result: [data-result-of="<id>"]. */
function renderResults(s: TableSnapshot) {
  for (const row of all('[data-result-of]')) {
    const id = row.dataset.resultOf;
    const p = s.players.find((x) => x.id === id);
    const r = s.results.find((x) => x.id === id);
    if (!p || !r) continue;
    const label = row.querySelector('[data-result-label]');
    if (label) label.textContent = `${peso(p.boughtIn)} bought in`;
    const value = row.querySelector('[data-result-value]');
    if (value) {
      value.textContent = signedPeso(r.result);
      value.classList.toggle('up', r.result > 0);
      value.classList.toggle('down', r.result < 0);
    }
    const cash = row.querySelector('[data-result-cashout]');
    if (cash) cash.textContent = `${peso(r.cashOut)} cashed out`;
  }
}

/** Replaces a list's rows with one clone of its first row per item. */
function fill<T>(list: HTMLElement, items: T[], apply: (row: HTMLElement, item: T, i: number) => void) {
  const shape = list.firstElementChild;
  if (!shape) return;
  list.replaceChildren(
    ...items.map((item, i) => {
      const row = shape.cloneNode(true) as HTMLElement;
      apply(row, item, i);
      return row;
    }),
  );
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

const KIND = { 'buy-in': 'Buy-in', rebuy: 'Rebuy', 'cash-out': 'Cash-out' } as const;

function renderLog(s: TableSnapshot) {
  const rows = [...s.entries, ...cashOuts(s)];
  for (const list of all('[data-log]')) {
    fill(list, rows, (row, e) => {
      row.className = `log-row is-${e.kind}`;
      text(row, 'time', e.time);
      chip(row.querySelector('[data-log-chip]'), e.colour, e.initials);
      text(row, '[data-log-name]', e.name);
      text(row, '[data-log-kind]', KIND[e.kind]);
      text(row, '[data-log-amt]', peso(e.amount));
    });
  }
  for (const el of all('[data-log-count]')) el.textContent = `${rows.length} entries`;
}

function renderStandings(s: TableSnapshot) {
  const people = new Map(s.players.map((p) => [p.id, p]));
  const sorted = [...s.results].sort((a, b) => b.result - a.result);
  for (const list of all('[data-standings]')) {
    fill(list, sorted, (row, r) => {
      const p = people.get(r.id)!;
      chip(row.querySelector('[data-st-chip]'), p.colour, p.initials);
      text(row, '[data-st-name]', p.name);
      text(row, '[data-st-in]', `${peso(r.boughtIn)} in`);
      const res = row.querySelector('[data-st-res]');
      if (res) {
        res.textContent = signedPeso(r.result);
        res.classList.toggle('up', r.result > 0);
        res.classList.toggle('down', r.result < 0);
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

function render(s: TableSnapshot) {
  renderPlayers(s);
  renderPot(s);
  renderResults(s);
  renderTransfers(s);
  renderLog(s);
  renderStandings(s);
  if (s.lastRebuy) mark(s.lastRebuy);
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
