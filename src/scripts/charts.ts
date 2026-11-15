/** Count-up numbers ([data-count]) and chart reveal ([data-chart] → .in-view) when scrolled into view. */
export function initCharts() {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const countUp = (el: HTMLElement) => {
    const target = Number(el.dataset.count);
    const suffix = el.dataset.suffix ?? '';
    if (reduce) { el.textContent = target + suffix; return; }
    const t0 = performance.now(), dur = 1600;
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / dur);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 4))) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    const el = e.target as HTMLElement;
    if (el.dataset.count !== undefined) countUp(el); else el.classList.add('in-view');
    io.unobserve(el);
  }), { threshold: 0.3 });
  document.querySelectorAll<HTMLElement>('[data-count], [data-chart]').forEach((el) => io.observe(el));
}
