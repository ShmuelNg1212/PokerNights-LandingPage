import { animate } from 'motion';
import { setLiveHooks } from './live';

/** The kit's digit-roll curve and time (tasteskill motion.md: --m-roll 700ms, cubic-bezier(.22,1,.36,1)). */
const ROLL: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** The pot's digits roll into place when a rebuy lands, as the app's pot does. Only changed digits move. */
function rollFigure(el: HTMLElement, from: string, to: string) {
  const pad = Math.max(from.length, to.length);
  const a = from.padStart(pad, ' ');
  const b = to.padStart(pad, ' ');
  const up = to.length > from.length || b > a;
  el.dataset.value = to;
  const spoken = document.createElement('span');
  spoken.className = 'visually-hidden';
  spoken.textContent = to;
  el.replaceChildren(
    spoken,
    ...[...b].map((ch, i) => {
      if (ch === ' ') return document.createTextNode('');
      const cell = document.createElement('span');
      cell.className = 'roll-cell';
      cell.setAttribute('aria-hidden', 'true');
      const inner = document.createElement('span');
      inner.textContent = ch;
      cell.appendChild(inner);
      if (ch !== a[i]) animate(inner, { y: [up ? '70%' : '-70%', '0%'], opacity: [0, 1] }, { duration: 0.7, ease: ROLL });
      return cell;
    }),
  );
  window.setTimeout(() => {
    if (el.dataset.value === to) {
      el.textContent = to;
      delete el.dataset.value;
    }
  }, 800);
}

/** Motion for the live table. Under reduced motion nothing is hooked: the figures change at once. */
export function initRoll() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  setLiveHooks({
    onPot: rollFigure,
    onMark: (row) => {
      const tag = row.querySelector('[data-mark]');
      if (tag) animate(tag, { opacity: [0, 1] }, { duration: 0.14, ease: [0.2, 0.8, 0.2, 1] });
    },
  });
}
