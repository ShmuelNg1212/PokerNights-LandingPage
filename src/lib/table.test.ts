import { describe, expect, it, vi } from 'vitest';
import { createTable, USUAL_BUY_IN } from './table';

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

describe('the Friday table', () => {
  it('starts with six players and a pot that equals what was bought in', () => {
    const t = createTable().snapshot();
    expect(t.players.map((p) => p.name)).toEqual(['Miguel', 'Carlo', 'Trina', 'Paolo', 'Jerome', 'Bea']);
    expect(t.boughtIn).toBe(sum(t.players.map((p) => p.boughtIn)));
    expect(t.pot).toBe(t.boughtIn - t.cashedOut);
    expect(t.boughtIn).toBe(10_500_00);
  });

  it('adds the usual buy-in on a rebuy and raises the pot by the same amount', () => {
    const table = createTable();
    const before = table.snapshot();
    const after = table.rebuy('carlo');
    const carlo = after.players.find((p) => p.id === 'carlo')!;
    expect(USUAL_BUY_IN).toBe(1_000_00);
    expect(carlo.buyIns).toHaveLength(3);
    expect(after.boughtIn - before.boughtIn).toBe(USUAL_BUY_IN);
    expect(after.pot - before.pot).toBe(USUAL_BUY_IN);
  });

  it('ends the night with cash-outs that match what was bought in', () => {
    const table = createTable();
    for (const id of ['carlo', 'carlo', 'bea', 'miguel']) table.rebuy(id);
    const t = table.snapshot();
    expect(sum(t.results.map((r) => r.cashOut))).toBe(t.boughtIn);
    expect(sum(t.results.map((r) => r.result))).toBe(0);
    for (const r of t.results) expect(r.cashOut % 50_00).toBe(0);
  });

  it('works out who pays whom from the current buy-ins', () => {
    const table = createTable();
    const before = table.snapshot().transfers;
    const after = table.rebuy('paolo').transfers;
    expect(after).not.toEqual(before);
    expect(after.length).toBeLessThanOrEqual(5);
    const paid = sum(after.map((t) => t.amount));
    const lost = -sum(table.snapshot().results.filter((r) => r.result < 0).map((r) => r.result));
    expect(paid).toBe(lost);
  });

  it('tells subscribers about every rebuy', () => {
    const table = createTable();
    const seen = vi.fn();
    const stop = table.subscribe(seen);
    table.rebuy('trina');
    stop();
    table.rebuy('trina');
    expect(seen).toHaveBeenCalledTimes(1);
    expect(seen.mock.calls[0]![0].lastRebuy).toBe('trina');
  });

  it('ignores a player who is not at the table', () => {
    const table = createTable();
    const before = table.snapshot();
    expect(table.rebuy('nobody')).toEqual(before);
  });
});
