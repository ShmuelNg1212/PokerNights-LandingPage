/** App clips play only while on screen and while the tab is visible. Reduced motion keeps the poster. */
export function initMedia() {
  const videos = [...document.querySelectorAll<HTMLVideoElement>('video[data-loop]')];
  if (!videos.length) return;
  const still = window.matchMedia('(prefers-reduced-motion: reduce)');
  const visible = new Set<HTMLVideoElement>();

  const play = (v: HTMLVideoElement) => {
    if (still.matches || document.hidden) return;
    if (v.preload !== 'auto') {
      v.preload = 'auto';
      v.load();
    }
    v.play().catch(() => {});
  };

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        const v = e.target as HTMLVideoElement;
        if (e.isIntersecting) {
          visible.add(v);
          play(v);
        } else {
          visible.delete(v);
          v.pause();
        }
      }
    },
    { rootMargin: '120px 0px' },
  );
  for (const v of videos) {
    v.addEventListener('playing', () => v.classList.add('is-playing'));
    io.observe(v);
  }

  document.addEventListener('visibilitychange', () => {
    for (const v of visible) document.hidden ? v.pause() : play(v);
  });
  still.addEventListener('change', () => {
    for (const v of videos) still.matches ? v.pause() : visible.has(v) && play(v);
  });
}
