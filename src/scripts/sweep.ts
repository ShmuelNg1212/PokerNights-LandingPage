/**
 * The count-up band's line sweep ([data-sweep], #features): the look of the kit's line-carries-colour
 * moment, driven by a CSS scroll timeline instead of a script. The browser runs it on the compositor,
 * tied to the scroll position, so a fast scroll cannot leave it a frame behind, and a scroll back up
 * plays it backwards along the same path. The kit's version sets opacity from requestAnimationFrame,
 * which lagged on a fast scroll and jittered on the way back up.
 *
 * A stage inset in the section holds the ground of the section before it. A hairline in the accent
 * climbs from its foot to its top and takes that ground with it (page.css: the cover and the line). Each
 * block (heading, paragraph, panel) stays hidden until the line is above its top, then fades in over a
 * tenth of a screen of scroll. Every block is whole when the line reaches the top, so nothing jumps there.
 *
 * The script only adds the stage and works out where on the scroll each block fades (--sw-a, --sw-b).
 * The CSS does the motion. No scroll-timeline support, a phone, reduced motion or data-motion="off": no
 * stage, every block as written. A checker's browser gets the same page as a visitor.
 */

// The climb, in the section's view timeline ("cover": 0 when the section's top is at the screen's
// foot). It starts at START and ends at END, as shares of the screen height. Keep these equal to the
// animation-range of .sweep__cover and .sweep__line in page.css.
const START = 0.371;
const END = 0.8;
/** How long each block fades, as a share of the screen height of scroll. */
const FADE = 0.1;
const BLOCK = 'h1,h2,h3,h4,h5,h6,p,li,dt,dd,blockquote,figcaption,a,button,img,picture,video,svg,table,figure,.panel';

/** The inverse of smoothstep (3t² - 2t³), the climb's easing in page.css. */
const unsmooth = (k: number) => 0.5 - Math.sin(Math.asin(1 - 2 * Math.min(1, Math.max(0, k))) / 3);

/** Outermost blocks first: a panel is one block, so the motion inside it keeps its own opacity. */
function blocks(root: Element, skip: Element): HTMLElement[] {
  const out: HTMLElement[] = [];
  const walk = (el: Element) => {
    for (const c of el.children) {
      if (c === skip || /^(SCRIPT|STYLE|TEMPLATE)$/.test(c.tagName)) continue;
      const own = [...c.childNodes].some((n) => n.nodeType === 3 && n.textContent!.trim());
      if (c.matches(BLOCK) || own) out.push(c as HTMLElement);
      else walk(c);
    }
  };
  walk(root);
  return out;
}

export function initSweep() {
  const html = document.documentElement;
  const root = document.querySelector<HTMLElement>('[data-sweep]');
  if (
    !root ||
    html.dataset.motion === 'off' ||
    !CSS.supports('animation-timeline', 'view()') ||
    !CSS.supports('animation-range', 'cover 10px cover 20px') ||
    matchMedia('(prefers-reduced-motion: reduce), (max-width: 639px)').matches
  )
    return;

  const stage = document.createElement('div');
  stage.className = 'sweep__stage';
  stage.setAttribute('aria-hidden', 'true');
  stage.innerHTML = '<div class="sweep__cover"></div><div class="sweep__line"></div>';
  root.append(stage);
  const list = blocks(root, stage);

  // Where each block fades, in px along the timeline: from the moment the line is at its top, over FADE
  // of the screen's height of scroll. Mid-climb the line moves several px per px of scroll, so a fade
  // measured along the line would pop. A block near the top starts early enough to be whole when the line
  // gets there; the part still under the cover stays hidden by it.
  const measure = () => {
    const vh = innerHeight;
    const s = stage.getBoundingClientRect();
    const h = s.height;
    if (!h) return;
    const at = (cut: number) => (START + (END - START) * unsmooth(1 - cut / h)) * vh;
    for (const el of list) {
      const r = el.getBoundingClientRect();
      if (!r.height) continue;
      const a = Math.min(at(Math.min(h, Math.max(0, r.top - s.top))), (END - FADE) * vh);
      el.style.setProperty('--sw-a', `${a.toFixed(1)}px`);
      el.style.setProperty('--sw-b', `${(a + FADE * vh).toFixed(1)}px`);
    }
  };
  measure();
  for (const el of list) el.classList.add('sweep__block');
  root.classList.add('is-sweep');

  let raf = 0;
  const again = () => {
    if (!raf) raf = requestAnimationFrame(() => { raf = 0; measure(); });
  };
  if (typeof ResizeObserver === 'function') new ResizeObserver(again).observe(root);
  addEventListener('resize', again);
  document.fonts?.ready.then(again);
}
