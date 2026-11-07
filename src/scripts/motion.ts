import { animate, inView, scroll } from 'motion';
import { setLiveHooks } from './live';

const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];

/** Digits roll into place, as the app's pot does. Only changed characters move. */
function rollFigure(el: HTMLElement, from: string, to: string) {
  const pad = Math.max(from.length, to.length);
  const a = from.padStart(pad, ' ');
  const b = to.padStart(pad, ' ');
  const up = to.length > from.length || b > a;
  el.setAttribute('aria-label', to);
  el.replaceChildren(
    ...[...b].map((ch, i) => {
      if (ch === ' ') return document.createTextNode('');
      const cell = document.createElement('span');
      cell.className = 'roll-cell';
      cell.setAttribute('aria-hidden', 'true');
      const inner = document.createElement('span');
      inner.textContent = ch;
      cell.appendChild(inner);
      if (ch !== a[i]) {
        animate(inner, { y: [up ? '70%' : '-70%', '0%'], opacity: [0, 1] }, { type: 'spring', visualDuration: 0.45, bounce: 0, delay: (pad - i) * 0.025 });
      }
      return cell;
    }),
  );
  window.setTimeout(() => {
    if (el.getAttribute('aria-label') === to) {
      el.textContent = to;
      el.removeAttribute('aria-label');
    }
  }, 900);
}

function revealSections() {
  const parts = [...document.querySelectorAll<HTMLElement>('[data-reveal]')];
  document.documentElement.classList.add('motion-ready');
  // Parts that enter together rise one after another, 70 ms apart.
  let batch: HTMLElement[] = [];
  let flush = 0;
  const run = () => {
    batch.forEach((el, i) => {
      animate(el, { opacity: [0, 1], y: [24, 0] }, { duration: 0.6, ease: EASE_OUT, delay: i * 0.07 }).then(() => {
        el.style.transform = '';
      });
    });
    batch = [];
    flush = 0;
  };
  for (const el of parts) {
    inView(
      el,
      () => {
        el.classList.add('is-in');
        batch.push(el);
        if (!flush) flush = requestAnimationFrame(run);
      },
      { margin: '0px 0px -8% 0px' },
    );
  }
  // Headlines with authored lines outside the hero rise when they enter.
  for (const h of document.querySelectorAll<HTMLElement>('main .lines')) {
    inView(h, () => void h.classList.add('is-in'), { margin: '0px 0px -12% 0px' });
  }
}

function heroDrift() {
  const hero = document.querySelector<HTMLElement>('.hero');
  const frag = document.querySelector<HTMLElement>('[data-hero-fragment]');
  if (!hero || !frag) return;
  scroll(animate(frag, { y: [0, -64] }, { ease: 'linear' }), { target: hero, offset: ['start start', 'end start'] });
}

export function initMotion() {
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (still) return;
  setLiveHooks({
    onPot: rollFigure,
    onMark: (row) => {
      const tag = row.querySelector('[data-mark]');
      if (tag) animate(tag, { opacity: [0, 1], scale: [0.85, 1] }, { type: 'spring', visualDuration: 0.3, bounce: 0.3 });
    },
  });
  revealSections();
  heroDrift();
}
