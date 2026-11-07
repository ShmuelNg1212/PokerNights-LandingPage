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

describe('the night log and paid marks', () => {
  it('logs one entry per buy-in and rebuy, in time order', () => {
    const t = createTable().snapshot();
    const count = sum(t.players.map((p) => p.buyIns.length));
    expect(t.entries).toHaveLength(count);
    const times = t.entries.map((e) => e.at);
    expect(times).toEqual([...times].sort((a, b) => a - b));
    expect(t.entries[0]!.kind).toBe('buy-in');
    expect(t.entries.filter((e) => e.kind === 'rebuy').length).toBe(count - t.players.length);
    expect(sum(t.entries.map((e) => e.amount))).toBe(t.boughtIn);
  });

  it('adds one rebuy row, last, on a rebuy', () => {
    const table = createTable();
    const before = table.snapshot().entries;
    const after = table.rebuy('carlo').entries;
    expect(after).toHaveLength(before.length + 1);
    const last = after.at(-1)!;
    expect(last).toMatchObject({ player: 'carlo', kind: 'rebuy', amount: USUAL_BUY_IN });
    expect(last.at).toBeGreaterThan(before.at(-1)!.at);
  });

  it('formats an entry time as a clock on the night', () => {
    const t = createTable().snapshot();
    expect(t.entries[0]!.time).toMatch(/^\d{2}:\d{2}$/);
  });

  it('marks a transfer paid without changing any amount', () => {
    const table = createTable();
    const before = table.snapshot();
    expect(before.transfers.every((x) => !x.paid)).toBe(true);
    const after = table.markPaid(0);
    expect(after.transfers[0]!.paid).toBe(true);
    expect(after.transfers.map((x) => x.amount)).toEqual(before.transfers.map((x) => x.amount));
    expect(after.boughtIn).toBe(before.boughtIn);
    expect(table.markPaid(0).transfers[0]!.paid).toBe(false);
  });

  it('clears paid marks when a rebuy changes who pays whom', () => {
    const table = createTable();
    table.markPaid(0);
    expect(table.rebuy('paolo').transfers.every((x) => !x.paid)).toBe(true);
  });

  it('ignores a transfer that does not exist', () => {
    const table = createTable();
    const before = table.snapshot();
    expect(table.markPaid(99)).toEqual(before);
  });
});

describe('the cash-outs at count-up', () => {
  it('lists one cash-out per player, after the last buy-in, summing to what was bought in', async () => {
    const { cashOuts } = await import('./table');
    const table = createTable();
    table.rebuy('bea');
    const t = table.snapshot();
    const rows = cashOuts(t);
    expect(rows).toHaveLength(t.players.length);
    expect(rows.every((r) => r.kind === 'cash-out')).toBe(true);
    expect(rows[0]!.at).toBeGreaterThan(t.entries.at(-1)!.at);
    expect(sum(rows.map((r) => r.amount))).toBe(t.boughtIn);
  });
});
