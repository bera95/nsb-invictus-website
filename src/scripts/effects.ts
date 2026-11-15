/**
 * Interaction effects: cursor glow, card spotlight, 3D tilt, magnetic buttons,
 * and a scroll progress bar. All skipped for reduced motion.
 */
export function initEffects() {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  // Scroll progress (kept even with reduced motion — it is informational)
  const bar = document.querySelector<HTMLElement>('[data-progress]');
  if (bar) {
    const upd = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
    };
    upd();
    window.addEventListener('scroll', upd, { passive: true });
  }
  if (reduce) return;

  // Cursor glow + card spotlight
  const glow = document.querySelector<HTMLElement>('[data-cursor-glow]');
  if (fine) {
    let gx = 0, gy = 0, tx = 0, ty = 0, raf = 0;
    const loop = () => {
      gx += (tx - gx) * 0.18; gy += (ty - gy) * 0.18;
      if (glow) glow.style.transform = `translate(${gx - 300}px, ${gy - 300}px)`;
      raf = Math.abs(tx - gx) + Math.abs(ty - gy) > 0.5 ? requestAnimationFrame(loop) : 0;
    };
    window.addEventListener('pointermove', (e) => {
      tx = e.clientX; ty = e.clientY;
      if (glow) glow.style.opacity = '1';
      if (!raf) raf = requestAnimationFrame(loop);
      const card = (e.target as HTMLElement).closest<HTMLElement>('.panel, .fx-card, .glass-card');
      if (card) {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${e.clientX - r.left}px`);
        card.style.setProperty('--my', `${e.clientY - r.top}px`);
      }
    }, { passive: true });

    // 3D tilt
    document.querySelectorAll<HTMLElement>('[data-tilt]').forEach((el) => {
      const max = Number(el.dataset.tilt || 6);
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(900px) rotateX(${-py * max}deg) rotateY(${px * max}deg) translateZ(0)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });

    // Magnetic buttons
    document.querySelectorAll<HTMLElement>('.btn-primary, [data-magnetic]').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        el.style.translate = `${(e.clientX - r.left - r.width / 2) * 0.18}px ${(e.clientY - r.top - r.height / 2) * 0.25}px`;
      });
      el.addEventListener('pointerleave', () => { el.style.translate = ''; });
    });
  }

}
