/**
 * Section headings ([data-rise]) rise into place once, when they first come on screen: opacity 0 to 1 and
 * 12px up, 700 ms ease-out (page.css). Only the headings move; cards, copy and pictures stay still
 * (ADR 0003: an approved exception to tasteskill's no-reveal rule). The count-up heading is left out: its
 * dealt moment already reveals it.
 *
 * Nothing is hidden before this runs, and a heading already on screen or above it never hides, so a
 * late script or an anchor jump cannot blank a heading. Reduced motion, data-motion="off", no
 * IntersectionObserver and a headless shot (unless data-motion="live", as motion.js does) leave every
 * heading as written.
 */
export function initRise() {
  const html = document.documentElement;
  const heads = [...document.querySelectorAll<HTMLElement>('[data-rise]')];
  const headless = /HeadlessChrome/.test(navigator.userAgent) && html.dataset.motion !== 'live';
  if (
    !heads.length ||
    html.dataset.motion === 'off' ||
    headless ||
    typeof IntersectionObserver !== 'function' ||
    matchMedia('(prefers-reduced-motion: reduce)').matches
  )
    return;

  // Only headings wholly below the screen wait; the rest stay as they are.
  const waiting = heads.filter((h) => h.getBoundingClientRect().top >= innerHeight);
  if (!waiting.length) return;
  for (const h of waiting) h.classList.add('rise');

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        // isIntersecting, or already scrolled past (a fast jump skips the band): show it.
        if (!e.isIntersecting && e.boundingClientRect.top > 0) continue;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      }
    },
    { rootMargin: '0px 0px -10% 0px' },
  );
  for (const h of waiting) io.observe(h);
}
