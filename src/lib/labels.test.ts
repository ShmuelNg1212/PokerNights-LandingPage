import { describe, expect, it } from 'vitest';
import { buyInLabel, timerLabel } from './labels';

describe('buyInLabel', () => {
  it('words buy-ins and rebuys as the app does', () => {
    expect(buyInLabel(1)).toBe('1 buy-in');
    expect(buyInLabel(2)).toBe('1 buy-in + 1 rebuy');
    expect(buyInLabel(4)).toBe('1 buy-in + 3 rebuys');
    expect(buyInLabel(0)).toBe('No buy-in');
  });
});

describe('timerLabel', () => {
  it('counts the set time as the app does', () => {
    expect(timerLabel(0)).toBe('under 1 min');
    expect(timerLabel(59_999)).toBe('under 1 min');
    expect(timerLabel(60_000)).toBe('1 min');
    expect(timerLabel(59 * 60_000)).toBe('59 min');
    expect(timerLabel(65 * 60_000)).toBe('1 h 05 min');
    expect(timerLabel(120 * 60_000)).toBe('2 h 00 min');
  });
});
