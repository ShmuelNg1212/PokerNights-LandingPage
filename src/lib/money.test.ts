import { describe, expect, it } from 'vitest';
import { peso, signedPeso } from './money';

describe('peso', () => {
  it('shows whole pesos without centavos', () => {
    expect(peso(1_600_00)).toBe('₱1,600');
    expect(peso(9_850_00)).toBe('₱9,850');
    expect(peso(0)).toBe('₱0');
  });

  it('shows centavos only when there are some', () => {
    expect(peso(1_600_50)).toBe('₱1,600.50');
    expect(peso(5)).toBe('₱0.05');
  });

  it('groups large amounts', () => {
    expect(peso(1_000_000_00)).toBe('₱1,000,000');
  });
});

describe('signedPeso', () => {
  it('signs wins and losses with a true minus sign', () => {
    expect(signedPeso(600_00)).toBe('+₱600');
    expect(signedPeso(-400_00)).toBe('−₱400');
    expect(signedPeso(0)).toBe('₱0');
  });
});
