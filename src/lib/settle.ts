/** One player's result for the session, in whole centavos: cash-out minus bought in. */
export interface Result {
  id: string;
  result: number;
}

export interface Transfer {
  from: string;
  to: string;
  amount: number;
}

/**
 * Who pays whom. Repeatedly matches the largest loser with the largest winner,
 * so the list has at most `players - 1` transfers. Ties go to the earlier seat.
 */
export function settle(results: Result[]): Transfer[] {
  let total = 0;
  for (const r of results) {
    if (!Number.isInteger(r.result)) throw new Error(`Result for ${r.id} is not whole centavos`);
    total += r.result;
  }
  if (total !== 0) throw new Error(`Results do not net to zero (off by ${total})`);

  const owed = results.map((r, seat) => ({ id: r.id, seat, left: r.result }));
  const transfers: Transfer[] = [];

  const pick = (sign: 1 | -1) => {
    let best: (typeof owed)[number] | undefined;
    for (const p of owed) {
      if (p.left * sign <= 0) continue;
      if (!best || Math.abs(p.left) > Math.abs(best.left)) best = p;
    }
    return best;
  };

  for (;;) {
    const loser = pick(-1);
    const winner = pick(1);
    if (!loser || !winner) break;
    const amount = Math.min(-loser.left, winner.left);
    transfers.push({ from: loser.id, to: winner.id, amount });
    loser.left += amount;
    winner.left -= amount;
  }
  return transfers;
}
