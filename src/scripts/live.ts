import { createTable, type TableSnapshot } from '../lib/table';
import { peso, signedPeso } from '../lib/money';
import { buyInLabel, timerLabel } from '../lib/labels';

/** Hooks a pot figure can use to animate its change (set by motion.ts). */
export interface LiveHooks {
  onPot?: (el: HTMLElement, from: string, to: string) => void;
  onMark?: (row: HTMLElement) => void;
}

const table = createTable();
export const liveTable = table;
const hooks: LiveHooks = {};
export function setLiveHooks(next: LiveHooks) {
  Object.assign(hooks, next);
}

const $$ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => [...root.querySelectorAll<T>(sel)];

function renderPlayers(s: TableSnapshot) {
  for (const p of s.players) {
    for (const row of $$(`[data-player="${p.id}"]`)) {
      const stack = row.querySelector<HTMLElement>('[data-stack]');
      if (stack) {
        const want = Math.min(p.buyIns.length, 6);
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
  for (const el of $$('[data-pot]')) {
    const from = el.textContent ?? '';
    const to = peso(s.pot);
    if (from === to) continue;
    if (hooks.onPot) hooks.onPot(el, from, to);
    else el.textContent = to;
  }
  for (const el of $$('[data-total]')) el.textContent = peso(s.boughtIn);
}

function renderCarlo(s: TableSnapshot) {
  const p = s.players.find((x) => x.id === 'carlo');
  const r = s.results.find((x) => x.id === 'carlo');
  if (!p || !r) return;
  for (const el of $$('[data-result-label]')) el.textContent = `${peso(p.boughtIn)} bought in`;
  for (const el of $$('[data-result-value]')) {
    el.textContent = signedPeso(r.result);
    el.classList.toggle('up', r.result > 0);
    el.classList.toggle('down', r.result < 0);
  }
  for (const el of $$('[data-result-cashout]')) el.textContent = `${peso(r.cashOut)} cashed out`;
}

function renderTransfers(s: TableSnapshot) {
  const list = document.querySelector<HTMLElement>('[data-transfers]');
  const tpl = document.querySelector<HTMLTemplateElement>('template[data-transfer-row]');
  if (!list || !tpl) return;
  const people = new Map(s.players.map((p) => [p.id, p]));
  const rows = s.transfers.map((t) => {
    const li = tpl.content.firstElementChild!.cloneNode(true) as HTMLElement;
    const from = people.get(t.from)!;
    const to = people.get(t.to)!;
    const fromChip = li.querySelector('[data-from-chip]')!;
    fromChip.classList.add(`k${from.colour}`);
    fromChip.textContent = from.initials;
    const toChip = li.querySelector('[data-to-chip]')!;
    toChip.classList.add(`k${to.colour}`);
    toChip.textContent = to.initials;
    li.querySelector('[data-from]')!.textContent = from.name;
    li.querySelector('[data-to]')!.textContent = to.name;
    li.querySelector('[data-amount]')!.textContent = peso(t.amount);
    return li;
  });
  list.replaceChildren(...rows);
  for (const el of $$('[data-transfer-count]')) el.textContent = `${s.transfers.length} transfer${s.transfers.length === 1 ? '' : 's'}`;
}

const marks = new WeakMap<HTMLElement, number>();
function mark(id: string) {
  for (const row of $$(`[data-player="${id}"]`)) {
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
  renderCarlo(s);
  renderTransfers(s);
  if (s.lastRebuy) mark(s.lastRebuy);
}

/** The live badge reads the visitor's own clock; the set timer counts from arrival. */
function startClock() {
  const arrived = Date.now();
  const clock = $$('[data-clock]');
  const timer = $$('[data-timer]');
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
