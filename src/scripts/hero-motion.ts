import { setLiveHooks } from './live';

export function initHeroMotion() {
  const hero = document.querySelector<HTMLElement>('.hero--video');
  const frame = hero?.querySelector<HTMLElement>('[data-hero-video]');
  const pot = hero?.querySelector<HTMLElement>('[data-pot]');
  if (!hero || !frame || !pot) return;

  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = matchMedia('(min-width: 1024px) and (min-height: 640px)');
  const motion = () => !reduced.matches && root.dataset.motion !== 'off';
  let stopVideo: (() => void) | undefined;
  let requested = false;
  let pageShown = false;
  let flight: (() => void) | undefined;
  let rebuy = 0;

  const sync = () => {
    if (!motion()) {
      flight?.();
      rebuy++;
    }
    if (!motion() || !desktop.matches) {
      stopVideo?.();
      stopVideo = undefined;
      return;
    }
    if (!pageShown || stopVideo || requested) return;
    requested = true;
    void import('./hero-video').then(({ mountHeroVideo }) => {
      if (motion() && desktop.matches) stopVideo = mountHeroVideo(frame, hero, () => { stopVideo = undefined; });
    }).catch(() => {
      // The initial HTML already contains the complete still layout.
    }).finally(() => { requested = false; });
  };

  setLiveHooks({
    onRebuy(button) {
      if (!hero.contains(button) || !motion()) return;
      flight?.();
      const activation = ++rebuy;
      const sample = button.closest('[data-player]')?.querySelector<HTMLElement>('.chip');
      if (!sample) return;
      // GSAP for the chip is independent of the optional background video.
      void import('gsap').then(({ default: gsap }) => {
        if (activation !== rebuy || !motion()) return;
        const source = button.getBoundingClientRect();
        const target = pot.getBoundingClientRect();
        const x = source.left + source.width / 2;
        const y = source.top + source.height / 2;
        const chip = document.createElement('span');
        chip.className = sample.className + ' is-small rebuy-chip';
        chip.setAttribute('aria-hidden', 'true');
        document.body.append(chip);
        gsap.set(chip, { x, y, xPercent: -50, yPercent: -50 });
        const tween = gsap.timeline({
          onComplete: () => { chip.remove(); flight = undefined; },
        });
        tween.to(chip, {
          x: target.left + target.width / 2, y: target.top + target.height / 2,
          scale: 0.72, rotation: 125, duration: 0.32, ease: 'power3.out',
        }).to(chip, { opacity: 0, duration: 0.14, ease: 'power1.in' }, 0.18);
        flight = () => {
          tween.kill();
          chip.remove();
          flight = undefined;
        };
      }).catch(() => {});
    },
  });
  reduced.addEventListener('change', sync);
  desktop.addEventListener('change', sync);
  new MutationObserver(sync).observe(root, { attributeFilter: ['data-motion'] });
  const startVideo = () => requestAnimationFrame(() => {
    // ScrollTrigger refreshes the page at registration. Let native history restore first.
    pageShown = true;
    sync();
  });
  if (document.readyState === 'complete') startVideo();
  else window.addEventListener('pageshow', startVideo, { once: true });
}
