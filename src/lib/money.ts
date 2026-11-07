const group = new Intl.NumberFormat('en-PH', { maximumFractionDigits: 0 });

/** Whole centavos to the app's display: ₱1,600 or ₱1,600.50. */
export function peso(centavos: number): string {
  const abs = Math.abs(centavos);
  const whole = Math.floor(abs / 100);
  const cents = abs % 100;
  const sign = centavos < 0 ? '−' : '';
  const tail = cents ? `.${String(cents).padStart(2, '0')}` : '';
  return `${sign}₱${group.format(whole)}${tail}`;
}

/** A result with its sign: +₱600, −₱400, ₱0. */
export function signedPeso(centavos: number): string {
  if (centavos > 0) return `+${peso(centavos)}`;
  return peso(centavos);
}
