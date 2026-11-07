/** "1 buy-in", "1 buy-in + 2 rebuys", as on the app's player rows. */
export function buyInLabel(count: number): string {
  if (count <= 0) return 'No buy-in';
  const rebuys = count - 1;
  if (!rebuys) return '1 buy-in';
  return `1 buy-in + ${rebuys} rebuy${rebuys === 1 ? '' : 's'}`;
}

/** The set timer: "under 1 min", "12 min", "1 h 05 min". */
export function timerLabel(elapsedMs: number): string {
  const minutes = Math.floor(elapsedMs / 60_000);
  if (minutes < 1) return 'under 1 min';
  if (minutes < 60) return `${minutes} min`;
  return `${Math.floor(minutes / 60)} h ${String(minutes % 60).padStart(2, '0')} min`;
}
