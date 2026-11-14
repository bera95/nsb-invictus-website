/**
 * Mounts Living Architecture canvases.
 *  - [data-architecture="intro"]  : assembles once on load (page heroes).
 *  - [data-architecture="scroll"] : fixed backdrop driven by page scroll (homepage).
 *
 * three.js is loaded lazily after the page becomes idle so it never blocks
 * first paint. Without WebGL the static fallback artwork stays visible.
 */
import type { ShapeName } from './shapes';

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isDesktop = () => window.matchMedia('(min-width: 1024px)').matches;
const idle = (cb: () => void) =>
  'requestIdleCallback' in window ? (window as any).requestIdleCallback(cb, { timeout: 1200 }) : setTimeout(cb, 200);

async function boot(el: HTMLElement) {
  const { createEngine, supportsWebGL } = await import('./engine');
  if (!supportsWebGL()) return null;
  const canvas = el.querySelector('canvas')!;
  const sequence = (el.dataset.sequence ?? 'vision,architecture').split(',') as ShapeName[];
  const offset = Number(el.dataset.offset ?? 0);
  try {
    const engine = createEngine({
      canvas,
      sequence,
      reducedMotion: reduced(),
      initial: reduced() ? sequence.length - 1 : 0,
      zoom: Number(el.dataset.zoom ?? 1),
      offsetX: isDesktop() ? offset : 0,
      portraitLift: Number(el.dataset.lift ?? 0),
    });
    requestAnimationFrame(() => el.classList.add('is-ready'));
    return { engine, sequence, offset };
  } catch (err) {
    console.warn('[architecture] WebGL unavailable, using fallback.', err);
    return null;
  }
}

function mountIntro(el: HTMLElement) {
  boot(el).then((res) => {
    if (!res) return;
    const { engine, sequence, offset } = res;
    window.addEventListener('resize', () => engine.setOffset(isDesktop() ? offset : 0), { passive: true });
    if (reduced()) return;
    const end = sequence.length - 1;
    const duration = 3600;
    const start = performance.now() + 250;
    const step = (now: number) => {
      const t = Math.min(1, Math.max(0, (now - start) / duration));
      const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      engine.setTarget(eased * end);
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
}

interface Anchor { y: number; v: number; dim: number; offset: number }

function mountScroll(el: HTMLElement) {
  boot(el).then((res) => {
    if (!res) return;
    const { engine } = res;
    let anchors: Anchor[] = [];

    const compute = () => {
      const vh = window.innerHeight;
      const desk = isDesktop();
      const list: Anchor[] = [];
      document.querySelectorAll<HTMLElement>('[data-scene]').forEach((s) => {
        const top = s.getBoundingClientRect().top + window.scrollY;
        const dim = Number(s.dataset.dim ?? 1);
        const off = desk ? Number(s.dataset.offset ?? 0) : 0;
        const v = Number(s.dataset.scene);
        if (s.dataset.sceneEnd !== undefined) {
          // Scroll-pinned scene (hero): morph from `scene` to `sceneEnd` across its height.
          const lead = Number(s.dataset.sceneLead ?? 0.12);
          const startY = top + (s.offsetHeight - vh) * lead;
          const endY = top + (s.offsetHeight - vh) * 0.82;
          list.push({ y: startY, v, dim, offset: off });
          list.push({ y: endY, v: Number(s.dataset.sceneEnd), dim: Number(s.dataset.dimEnd ?? dim), offset: off });
        } else {
          // Hold the scene steady while its section is on screen; morph in the gaps between sections.
          const holdStart = top - vh * 0.35;
          const holdEnd = Math.max(holdStart + 1, top + s.offsetHeight - vh * 0.85);
          list.push({ y: holdStart, v, dim, offset: off });
          list.push({ y: holdEnd, v, dim, offset: off });
        }
      });
      anchors = list.sort((a, b) => a.y - b.y);
      update();
    };

    const smooth = (t: number) => t * t * (3 - 2 * t);
    const update = () => {
      if (!anchors.length) return;
      const y = window.scrollY;
      let a = anchors[0], b = anchors[0];
      if (y <= anchors[0].y) a = b = anchors[0];
      else if (y >= anchors[anchors.length - 1].y) a = b = anchors[anchors.length - 1];
      else for (let i = 0; i < anchors.length - 1; i++) {
        if (y >= anchors[i].y && y < anchors[i + 1].y) { a = anchors[i]; b = anchors[i + 1]; break; }
      }
      const t = a === b ? 0 : smooth((y - a.y) / (b.y - a.y));
      engine.setTarget(a.v + (b.v - a.v) * t, a.dim + (b.dim - a.dim) * t);
      engine.setOffset(a.offset + (b.offset - a.offset) * t);
    };

    compute();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', compute, { passive: true });
    window.addEventListener('load', compute);
    new ResizeObserver(compute).observe(document.body);
  });
}

export function mountArchitecture() {
  const els = document.querySelectorAll<HTMLElement>('[data-architecture]');
  if (!els.length) return;
  idle(() => {
    els.forEach((el) => (el.dataset.architecture === 'scroll' ? mountScroll(el) : mountIntro(el)));
  });
}
