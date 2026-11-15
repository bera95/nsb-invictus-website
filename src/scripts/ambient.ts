/**
 * Ambient motion layer (all pages): drifting "data packets" that link up into
 * constellations, plus neon comets that streak across the screen.
 * Lightweight 2D canvas, capped DPR, paused when hidden, off for reduced motion.
 */
export function initAmbient(canvas: HTMLCanvasElement) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const small = window.matchMedia('(max-width: 768px)').matches;
  const COUNT = small ? 34 : 70;
  const LINK = small ? 90 : 130;
  const colors = ['124,92,255', '34,211,238', '255,79,216', '16,185,129'];
  let w = 0, h = 0, dpr = 1, raf = 0, running = false, last = performance.now();

  type P = { x: number; y: number; vx: number; vy: number; r: number; c: string; ph: number };
  type Comet = { x: number; y: number; vx: number; vy: number; life: number; c: string };
  const pts: P[] = [];
  const comets: Comet[] = [];
  let nextComet = 1.5;

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    w = window.innerWidth; h = window.innerHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  for (let i = 0; i < COUNT; i++) {
    pts.push({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 12, vy: -6 - Math.random() * 16,
      r: 0.6 + Math.random() * 1.6, c: colors[i % colors.length], ph: Math.random() * Math.PI * 2,
    });
  }

  const spawnComet = () => {
    const fromLeft = Math.random() < 0.5;
    const speed = 520 + Math.random() * 380;
    const ang = (fromLeft ? 0.18 : Math.PI - 0.18) + (Math.random() - 0.5) * 0.35;
    comets.push({
      x: fromLeft ? -40 : w + 40, y: Math.random() * h * 0.7,
      vx: Math.cos(ang) * speed, vy: Math.sin(ang) * speed, life: 1, c: colors[Math.floor(Math.random() * 3)],
    });
  };

  const frame = (now: number) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    ctx.clearRect(0, 0, w, h);
    const t = now / 1000;

    // packets
    for (const p of pts) {
      p.x += (p.vx + Math.sin(t * 0.6 + p.ph) * 8) * dt;
      p.y += p.vy * dt;
      if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
      if (p.x < -10) p.x = w + 10; else if (p.x > w + 10) p.x = -10;
    }
    ctx.lineWidth = 0.6;
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const a = pts[i], b = pts[j];
        const dx = a.x - b.x, dy = a.y - b.y, d = Math.hypot(dx, dy);
        if (d < LINK) {
          ctx.strokeStyle = `rgba(${a.c},${(1 - d / LINK) * 0.22})`;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
    }
    for (const p of pts) {
      const tw = 0.55 + 0.45 * Math.sin(t * 2 + p.ph);
      ctx.fillStyle = `rgba(${p.c},${0.35 + tw * 0.5})`;
      ctx.shadowColor = `rgba(${p.c},0.9)`; ctx.shadowBlur = 8;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r * (0.8 + tw * 0.4), 0, Math.PI * 2); ctx.fill();
    }
    ctx.shadowBlur = 0;

    // comets
    nextComet -= dt;
    if (nextComet <= 0) { spawnComet(); nextComet = 2.5 + Math.random() * 4; }
    for (let i = comets.length - 1; i >= 0; i--) {
      const c = comets[i];
      c.x += c.vx * dt; c.y += c.vy * dt; c.life -= dt * 0.35;
      const tail = 140;
      const sp = Math.hypot(c.vx, c.vy);
      const tx = c.x - (c.vx / sp) * tail, ty = c.y - (c.vy / sp) * tail;
      const g = ctx.createLinearGradient(c.x, c.y, tx, ty);
      g.addColorStop(0, `rgba(${c.c},${0.9 * c.life})`);
      g.addColorStop(1, `rgba(${c.c},0)`);
      ctx.strokeStyle = g; ctx.lineWidth = 1.6;
      ctx.shadowColor = `rgba(${c.c},1)`; ctx.shadowBlur = 12;
      ctx.beginPath(); ctx.moveTo(c.x, c.y); ctx.lineTo(tx, ty); ctx.stroke();
      ctx.shadowBlur = 0;
      if (c.life <= 0 || c.x < -300 || c.x > w + 300 || c.y > h + 300) comets.splice(i, 1);
    }
    if (running) raf = requestAnimationFrame(frame);
  };

  const start = () => { if (!running && !document.hidden) { running = true; last = performance.now(); raf = requestAnimationFrame(frame); } };
  const stop = () => { running = false; cancelAnimationFrame(raf); };
  window.addEventListener('resize', resize, { passive: true });
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  start();
}
