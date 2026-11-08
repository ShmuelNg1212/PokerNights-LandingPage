/**
 * App clips rest on their poster. A clip plays while the pointer rests on its card, or while the card
 * holds keyboard focus, and returns to its poster when it leaves (tasteskill motion.md: the fragments
 * that do not loop play under the pointer). In the pinned Steps frame it also stops when its step closes,
 * since the scroll moves the frame under a still pointer. Reduced motion and touch keep the poster.
 */
export function initMedia() {
  const videos = [...document.querySelectorAll<HTMLVideoElement>('video[data-loop]')];
  if (!videos.length) return;
  const still = window.matchMedia('(prefers-reduced-motion: reduce)');
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)');

  for (const v of videos) {
    const host = v.closest<HTMLElement>('.card') ?? v.parentElement!;
    v.addEventListener('playing', () => v.classList.add('is-playing'));
    const play = () => {
      if (still.matches || document.hidden) return;
      if (v.preload !== 'auto') {
        v.preload = 'auto';
        v.load();
      }
      v.currentTime = 0;
      v.play().catch(() => {});
    };
    const rest = () => {
      v.pause();
      v.classList.remove('is-playing');
    };
    host.addEventListener('pointerenter', () => fine.matches && play());
    host.addEventListener('pointerleave', rest);
    host.addEventListener('focusin', play);
    host.addEventListener('focusout', rest);
    // a step's figure in the pinned Steps frame: it loses .is-on when the scroll opens another step
    const figure = v.closest('.mo-pc__visual');
    if (figure)
      new MutationObserver(() => {
        if (figure.closest('.is-live') && !figure.classList.contains('is-on')) rest();
      }).observe(figure, { attributes: true, attributeFilter: ['class'] });
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) for (const v of videos) v.pause();
  });
}
