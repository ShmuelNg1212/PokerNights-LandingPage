import { describe, expect, it } from 'vitest';
import { settle, type Result } from './settle';

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

function check(results: Result[]) {
  const transfers = settle(results);
  const net = new Map(results.map((r) => [r.id, r.result]));
  for (const t of transfers) {
    net.set(t.from, (net.get(t.from) ?? 0) + t.amount);
    net.set(t.to, (net.get(t.to) ?? 0) - t.amount);
  }
  return { transfers, net };
}

describe('settle', () => {
  it('pays a single winner from every loser', () => {
    const { transfers, net } = check([
      { id: 'a', result: 300_00 },
      { id: 'b', result: -100_00 },
      { id: 'c', result: -200_00 },
    ]);
    expect(transfers).toEqual([
      { from: 'c', to: 'a', amount: 200_00 },
      { from: 'b', to: 'a', amount: 100_00 },
    ]);
    expect([...net.values()].every((v) => v === 0)).toBe(true);
  });

  it('settles every balance to zero on a mixed table', () => {
    const results: Result[] = [
      { id: 'miguel', result: 1_400_00 },
      { id: 'carlo', result: -1_000_00 },
      { id: 'trina', result: 650_00 },
      { id: 'paolo', result: -400_00 },
      { id: 'jerome', result: -1_150_00 },
      { id: 'bea', result: 500_00 },
    ];
    const { transfers, net } = check(results);
    expect([...net.values()].every((v) => v === 0)).toBe(true);
    expect(transfers.length).toBeLessThanOrEqual(results.length - 1);
    expect(sum(transfers.map((t) => t.amount))).toBe(2_550_00);
  });

  it('leaves out a player who broke even', () => {
    const transfers = settle([
      { id: 'a', result: 500_00 },
      { id: 'z', result: 0 },
      { id: 'b', result: -500_00 },
    ]);
    expect(transfers).toEqual([{ from: 'b', to: 'a', amount: 500_00 }]);
  });

  it('breaks ties in table order so the list is stable', () => {
    const transfers = settle([
      { id: 'a', result: 100_00 },
      { id: 'b', result: 100_00 },
      { id: 'c', result: -100_00 },
      { id: 'd', result: -100_00 },
    ]);
    expect(transfers).toEqual([
      { from: 'c', to: 'a', amount: 100_00 },
      { from: 'd', to: 'b', amount: 100_00 },
    ]);
  });

  it('returns no transfers when nobody won or lost', () => {
    expect(settle([{ id: 'a', result: 0 }, { id: 'b', result: 0 }])).toEqual([]);
  });

  it('refuses a table that does not net to zero', () => {
    expect(() => settle([{ id: 'a', result: 100 }, { id: 'b', result: -99 }])).toThrow(/net to zero/);
  });

  it('refuses amounts that are not whole centavos', () => {
    expect(() => settle([{ id: 'a', result: 0.5 }, { id: 'b', result: -0.5 }])).toThrow(/whole/);
  });
});
