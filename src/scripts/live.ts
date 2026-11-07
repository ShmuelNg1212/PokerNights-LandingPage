import { createTable, type TableSnapshot } from '../lib/table';
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

function renderTransfers(s: TableSnapshot) {
  const list = document.querySelector<HTMLElement>('[data-transfers]');
  // The server-rendered first row is the shape every new row is cloned from.
  const shape = list?.querySelector('li');
  if (!list || !shape) return;
  const people = new Map(s.players.map((p) => [p.id, p]));
  const chip = (el: Element, colour: number, initials: string) => {
    el.className = `chip is-small ${chipClass(colour)}`;
    el.textContent = initials;
  };
  const rows = s.transfers.map((t) => {
    const li = shape.cloneNode(true) as HTMLElement;
    const from = people.get(t.from)!;
    const to = people.get(t.to)!;
    chip(li.querySelector('[data-from-chip]')!, from.colour, from.initials);
    chip(li.querySelector('[data-to-chip]')!, to.colour, to.initials);
    li.querySelector('[data-from]')!.textContent = from.name;
    li.querySelector('[data-to]')!.textContent = to.name;
    li.querySelector('[data-amount]')!.textContent = peso(t.amount);
    return li;
  });
  list.replaceChildren(...rows);
  for (const el of all('[data-transfer-count]')) el.textContent = transferCount(s.transfers.length);
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
    const btn = (e.target as Element | null)?.closest<HTMLButtonElement>('[data-rebuy]');
    if (!btn) return;
    table.rebuy(btn.dataset.rebuy!);
  });
  startClock();
}
