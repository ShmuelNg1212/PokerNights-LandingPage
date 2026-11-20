import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const SOURCE = '/media/hero/chip-stack.mp4';
const FPS = 24;
const SCROLL_RANGE = 0.45;

/** Let the native decoder finish its current seek before asking for the latest frame. */
export function mountHeroVideo(background: HTMLElement, hero: HTMLElement, onStop: () => void) {
  const media = background.querySelector<HTMLElement>('.hero-video__media');
  if (!media) return;
  const video = document.createElement('video');
  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;
  video.preload = 'auto';
  video.disablePictureInPicture = true;

  const controller = new AbortController();
  const { signal } = controller;
  let trigger: ScrollTrigger | undefined;
  let progress = 0;

  function stop() {
    if (signal.aborted) return;
    controller.abort();
    trigger?.kill();
    background.classList.remove('is-ready');
    media?.style.removeProperty('transform');
    video.remove();
    video.removeAttribute('src');
    video.load();
    onStop();
  }

  const frameStack = () => {
    // As the hero leaves, keep the taller, separated stack clear of the fixed nav.
    media.style.transform = `translate3d(-50%, ${-50 + progress * 33}%, 0) scale(${1 - progress * 0.49})`;
  };

  function showTarget() {
    if (signal.aborted || video.readyState < 1 || video.seeking || !Number.isFinite(video.duration)) return;
    const lastFrame = Math.max(0, Math.round(video.duration * FPS) - 1);
    const frame = Math.round(progress * lastFrame);
    // Seek inside each frame's interval so rounding at the exact timestamp cannot choose its neighbor.
    const target = frame === 0 ? 0 : (frame + 0.5) / FPS;
    if (Math.abs(video.currentTime - target) > 0.001) {
      video.currentTime = target;
    } else if (video.readyState >= 2 && !background.classList.contains('is-ready')) {
      frameStack();
      background.classList.add('is-ready');
    }
  }

  function sync(self: ScrollTrigger) {
    progress = self.progress;
    if (background.classList.contains('is-ready')) frameStack();
    showTarget();
  }

  for (const event of ['loadedmetadata', 'loadeddata', 'seeked', 'canplay']) {
    video.addEventListener(event, showTarget, { signal });
  }
  video.addEventListener('error', stop, { once: true, signal });
  gsap.registerPlugin(ScrollTrigger);
  trigger = ScrollTrigger.create({
    trigger: hero,
    start: 'top top',
    end: () => '+=' + hero.offsetHeight * SCROLL_RANGE,
    onUpdate: sync,
    onRefresh: sync,
  });
  sync(trigger);
  media.append(video);
  video.src = SOURCE;
  return stop;
}
