/**
 * Scroll reveals for [data-reveal] elements. Uses IntersectionObserver + CSS
 * transitions (no animation library needed for this), so it costs almost nothing.
 * Content is visible by default when JavaScript is unavailable.
 */
export function initReveals() {
  const els = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
  if (!els.length) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const show = (el: HTMLElement) => {
    el.style.transition = 'opacity 0.9s cubic-bezier(0.16,1,0.3,1), transform 0.9s cubic-bezier(0.16,1,0.3,1)';
    el.style.transitionDelay = `${Number(el.dataset.revealDelay ?? 0)}ms`;
    el.style.opacity = '1';
    el.style.transform = 'none';
  };
  if (reduce || !('IntersectionObserver' in window)) {
    els.forEach(show);
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          show(e.target as HTMLElement);
          io.unobserve(e.target);
        }
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
  );
  els.forEach((el) => io.observe(el));
}
