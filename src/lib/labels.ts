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

/** The app's chip colour class for a player token: k1–k10. */
export const chipClass = (colour: number) => `k${colour}`;

/** A buy-in stack shows at most this many bars. */
export const MAX_STACK = 6;

/** "1 transfer", "4 transfers". */
export const transferCount = (n: number) => `${n} transfer${n === 1 ? '' : 's'}`;

/** The session log's badge: "1 entry", "14 entries". */
export const entryCount = (n: number) => `${n} ${n === 1 ? 'entry' : 'entries'}`;

/** The kind of a log entry, as the session log says it. */
export const ENTRY_LABEL = { 'buy-in': 'Buy-in', rebuy: 'Rebuy', 'cash-out': 'Cash-out' } as const;

/** The colour class of a signed result. */
export const resultTone = (result: number) => (result > 0 ? 'up' : result < 0 ? 'down' : '');
