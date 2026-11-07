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
  transfers: Transfer[];
  lastRebuy: string | null;
}

/** Synthetic demonstration players, as in the app's own showcase. */
function seats(): Seat[] {
  return [
    { id: 'miguel', name: 'Miguel', initials: 'M', colour: 1, buyIns: [1_000_00], share: 0.21 },
    { id: 'carlo', name: 'Carlo', initials: 'C', colour: 2, buyIns: [1_000_00, 1_000_00], share: 0.08 },
    { id: 'trina', name: 'Trina', initials: 'T', colour: 3, buyIns: [2_000_00], share: 0.22 },
    { id: 'paolo', name: 'Paolo', initials: 'P', colour: 4, buyIns: [1_000_00], share: 0.06 },
    { id: 'jerome', name: 'Jerome', initials: 'J', colour: 5, buyIns: [1_500_00, 1_500_00], share: 0.18 },
    { id: 'bea', name: 'Bea', initials: 'BE', colour: 6, buyIns: [1_500_00], share: 0.25 },
  ];
}

const total = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

function view(table: Seat[], lastRebuy: string | null): TableSnapshot {
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

  const transfers = settle(results);

  return { players, boughtIn, cashedOut, pot: boughtIn - cashedOut, results, transfers, lastRebuy };
}

export function createTable() {
  const table = seats();
  const listeners = new Set<(s: TableSnapshot) => void>();
  let current = view(table, null);

  return {
    snapshot: () => current,
    rebuy(id: string): TableSnapshot {
      const seat = table.find((s) => s.id === id);
      if (!seat) return current;
      seat.buyIns.push(USUAL_BUY_IN);
      current = view(table, id);
      for (const fn of listeners) fn(current);
      return current;
    },
    subscribe(fn: (s: TableSnapshot) => void) {
      listeners.add(fn);
      return () => void listeners.delete(fn);
    },
  };
}
