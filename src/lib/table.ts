import { settle, type Transfer } from './settle';

/** The usual buy-in at the Friday table, in centavos. */
export const USUAL_BUY_IN = 1_000_00;

/** Cash-outs are rounded to the smallest chip in play. */
const SMALLEST_CHIP = 50_00;

interface Seat {
  id: string;
  name: string;
  initials: string;
  /** The app's chip colour class, k1–k10. */
  colour: number;
  buyIns: number[];
  /** Share of the money on the table each player ends the night with (synthetic). */
  share: number;
  /** Minutes after the start when each buy-in after the first was logged. */
  laterAt?: number[];
}

/** The night starts at 19:30; entry times are minutes after that. */
const START_MINUTE = 19 * 60 + 30;
/** A rebuy tapped on the page lands this many minutes after the last entry. */
const REBUY_GAP = 6;

export type EntryKind = 'buy-in' | 'rebuy';

export interface EntryView {
  /** Minutes after the start of the night. */
  at: number;
  /** The clock on the night, "21:12". */
  time: string;
  player: string;
  name: string;
  initials: string;
  colour: number;
  kind: EntryKind;
  amount: number;
}

export interface TransferView extends Transfer {
  paid: boolean;
}

export interface PlayerView {
  id: string;
  name: string;
  initials: string;
  colour: number;
  buyIns: number[];
  boughtIn: number;
}

export interface ResultView {
  id: string;
  name: string;
  boughtIn: number;
  cashOut: number;
  result: number;
}

export interface TableSnapshot {
  players: PlayerView[];
  boughtIn: number;
  cashedOut: number;
  pot: number;
  results: ResultView[];
  transfers: TransferView[];
  entries: EntryView[];
  lastRebuy: string | null;
}

export const clock = (at: number) => {
  const m = (START_MINUTE + at) % (24 * 60);
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
};

/** Synthetic demonstration players, as in the app's own showcase. */
function seats(): Seat[] {
  return [
    { id: 'miguel', name: 'Miguel', initials: 'M', colour: 1, buyIns: [1_000_00], share: 0.21 },
    { id: 'carlo', name: 'Carlo', initials: 'C', colour: 2, buyIns: [1_000_00, 1_000_00], share: 0.08, laterAt: [82] },
    { id: 'trina', name: 'Trina', initials: 'T', colour: 3, buyIns: [2_000_00], share: 0.22 },
    { id: 'paolo', name: 'Paolo', initials: 'P', colour: 4, buyIns: [1_000_00], share: 0.06 },
    { id: 'jerome', name: 'Jerome', initials: 'J', colour: 5, buyIns: [1_500_00, 1_500_00], share: 0.18, laterAt: [108] },
    { id: 'bea', name: 'Bea', initials: 'BE', colour: 6, buyIns: [1_500_00], share: 0.25 },
  ];
}

const total = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

interface Logged {
  at: number;
  seat: Seat;
  kind: EntryKind;
  amount: number;
}

/** The opening log: first buy-ins two minutes apart, then the seats' later buy-ins. */
function openingLog(table: Seat[]): Logged[] {
  const log: Logged[] = [];
  table.forEach((seat, i) => {
    seat.buyIns.forEach((amount, n) => {
      const at = n === 0 ? i * 2 : seat.laterAt?.[n - 1] ?? 60 + i * 5 + n;
      log.push({ at, seat, kind: n === 0 ? 'buy-in' : 'rebuy', amount });
    });
  });
  return log.sort((a, b) => a.at - b.at);
}

function view(table: Seat[], log: Logged[], paid: Set<number>, lastRebuy: string | null): TableSnapshot {
  const players = table.map((s) => ({
    id: s.id,
    name: s.name,
    initials: s.initials,
    colour: s.colour,
    buyIns: [...s.buyIns],
    boughtIn: total(s.buyIns),
  }));
  const boughtIn = total(players.map((p) => p.boughtIn));
  const cashedOut = 0;

  // The end of the night: every stack is counted and the books balance.
  let left = boughtIn;
  const results = table.map((s, i) => {
    const last = i === table.length - 1;
    const cashOut = last ? left : Math.round((boughtIn * s.share) / SMALLEST_CHIP) * SMALLEST_CHIP;
    left -= cashOut;
    const mine = players[i]!.boughtIn;
    return { id: s.id, name: s.name, boughtIn: mine, cashOut, result: cashOut - mine };
  });

  const transfers = settle(results).map((t, i) => ({ ...t, paid: paid.has(i) }));
  const entries = log.map((e) => ({
    at: e.at,
    time: clock(e.at),
    player: e.seat.id,
    name: e.seat.name,
    initials: e.seat.initials,
    colour: e.seat.colour,
    kind: e.kind,
    amount: e.amount,
  }));

  return { players, boughtIn, cashedOut, pot: boughtIn - cashedOut, results, transfers, entries, lastRebuy };
}

export function createTable() {
  const table = seats();
  const log = openingLog(table);
  const paid = new Set<number>();
  const listeners = new Set<(s: TableSnapshot) => void>();
  let current = view(table, log, paid, null);
  const publish = () => {
    for (const fn of listeners) fn(current);
    return current;
  };

  return {
    snapshot: () => current,
    rebuy(id: string): TableSnapshot {
      const seat = table.find((s) => s.id === id);
      if (!seat) return current;
      seat.buyIns.push(USUAL_BUY_IN);
      log.push({ at: log.at(-1)!.at + REBUY_GAP, seat, kind: 'rebuy', amount: USUAL_BUY_IN });
      // New buy-ins change who pays whom, so earlier paid marks no longer apply.
      paid.clear();
      current = view(table, log, paid, id);
      return publish();
    },
    /** Toggles the paid mark on one transfer, as the host's Mark paid does. */
    markPaid(index: number): TableSnapshot {
      if (!current.transfers[index]) return current;
      if (paid.has(index)) paid.delete(index);
      else paid.add(index);
      current = view(table, log, paid, current.lastRebuy);
      return publish();
    },
    subscribe(fn: (s: TableSnapshot) => void) {
      listeners.add(fn);
      return () => void listeners.delete(fn);
    },
  };
}
