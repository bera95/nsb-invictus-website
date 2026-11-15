/**
 * Free tools — client side. Calls /api/tools.php and renders results.
 * All external values are inserted with textContent (never innerHTML) to prevent XSS.
 */
type Status = 'pass' | 'warn' | 'fail' | 'info';
interface Check { id: string; category: string; label: string; status: Status; detail: string; locked?: boolean }

const el = <K extends keyof HTMLElementTagNameMap>(tag: K, cls = '', text?: string) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text !== undefined) n.textContent = text;
  return n;
};
const statusMeta: Record<Status, { label: string; color: string; icon: string }> = {
  pass: { label: 'Pass', color: '#10b981', icon: '✓' },
  warn: { label: 'Improve', color: '#f5b544', icon: '!' },
  fail: { label: 'Issue', color: '#ff4f7a', icon: '✕' },
  info: { label: 'Info', color: '#7fe6f6', icon: 'i' },
};

function scoreRing(score: number, label = 'Score') {
  const wrap = el('div', 'relative h-40 w-40 shrink-0');
  const r = 62, c = 2 * Math.PI * r;
  const color = score >= 80 ? '#10b981' : score >= 55 ? '#f5b544' : '#ff4f7a';
  wrap.innerHTML = `<svg viewBox="0 0 160 160" class="h-full w-full -rotate-90"><circle cx="80" cy="80" r="${r}" fill="none" stroke="rgba(148,163,210,0.15)" stroke-width="10"/><circle class="ring" cx="80" cy="80" r="${r}" fill="none" stroke="${color}" stroke-width="10" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${c}" style="filter:drop-shadow(0 0 8px ${color});transition:stroke-dashoffset 1.4s cubic-bezier(.16,1,.3,1)"/></svg>`;
  const center = el('div', 'absolute inset-0 flex flex-col items-center justify-center');
  const num = el('span', 'font-display text-4xl text-mist-50', '0');
  center.append(num, el('span', 'font-mono text-[0.65rem] uppercase tracking-[0.2em] text-mist-500', label));
  wrap.append(center);
  requestAnimationFrame(() => {
    (wrap.querySelector('.ring') as SVGCircleElement).style.strokeDashoffset = String(c * (1 - score / 100));
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / 1200);
      num.textContent = String(Math.round(score * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  return wrap;
}

function checkRow(c: Check) {
  const m = statusMeta[c.status];
  const row = el('li', 'flex gap-4 rounded-xl border border-line bg-void/30 p-4' + (c.locked ? ' locked' : ''));
  const icon = el('span', 'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-mono text-xs font-bold', m.icon);
  icon.style.cssText = `color:${m.color};border:1px solid ${m.color};box-shadow:0 0 12px -2px ${m.color}`;
  const body = el('div', 'min-w-0 flex-1');
  const head = el('div', 'flex flex-wrap items-center justify-between gap-2');
  head.append(el('span', 'text-mist-50', c.label));
  const tag = el('span', 'font-mono text-[0.65rem] uppercase tracking-[0.14em]', m.label);
  tag.style.color = m.color;
  head.append(tag);
  body.append(head);
  if (c.locked) {
    const lock = el('p', 'mt-1 flex items-center gap-2 text-sm text-mist-500');
    lock.append(el('span', '', '🔒'), el('span', 'blur-[3px] select-none', 'Details and recommended fix included in the full report.'));
    body.append(lock);
  } else if (c.detail) {
    body.append(el('p', 'mt-1 break-words text-sm text-mist-400', c.detail));
  }
  row.append(icon, body);
  return row;
}

function ctaBox(capHref: string, text: string) {
  const box = el('div', 'panel neon-frame mt-8 flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between');
  box.append(el('p', 'text-mist-200', text));
  const a = el('a', 'btn btn-primary shrink-0', 'Get expert help →');
  a.setAttribute('href', capHref);
  box.append(a);
  return box;
}

function leadGate(root: HTMLElement, data: any) {
  const box = el('div', 'panel neon-frame mt-8 p-6 sm:p-8');
  box.append(el('p', 'eyebrow mb-3', 'Full report'));
  box.append(el('h3', 'text-2xl', `Unlock all ${data.checks.length} findings and the fix plan`));
  box.append(el('p', 'mt-2 text-mist-400', 'Our team reviews your results and sends the complete report with prioritised recommendations — free, no obligation.'));
  const form = el('form', 'mt-6 grid gap-4 sm:grid-cols-2');
  form.noValidate = true;
  form.innerHTML = `
    <div><label class="field-label" for="lg-name">Name *</label><input class="field" id="lg-name" name="name" required maxlength="120" autocomplete="name"></div>
    <div><label class="field-label" for="lg-email">Work email *</label><input class="field" id="lg-email" name="email" type="email" required maxlength="160" autocomplete="email"></div>
    <label class="flex items-start gap-3 text-sm text-mist-400 sm:col-span-2"><input type="checkbox" name="consent" value="yes" required class="mt-1 h-4 w-4 accent-[#7c5cff]"><span>I agree that NSB INVICTUS may contact me about this report, as described in the <a href="/privacy/" class="text-signal-soft underline underline-offset-4">privacy policy</a>.</span></label>
    <div class="absolute -left-[9999px]" aria-hidden="true"><input name="website" tabindex="-1" autocomplete="off"></div>
    <div class="flex flex-wrap items-center gap-4 sm:col-span-2"><button class="btn btn-primary" type="submit">Send me the full report</button><span class="text-sm" role="status" aria-live="polite" data-lg-status></span></div>`;
  const started = String(Date.now() - 10000);
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    const status = form.querySelector<HTMLElement>('[data-lg-status]')!;
    const btn = form.querySelector<HTMLButtonElement>('button')!;
    btn.disabled = true; status.textContent = 'Sending…'; status.className = 'text-sm text-mist-400';
    const fd = new FormData(form);
    fd.set('topic', 'free-audit');
    fd.set('company', '');
    fd.set('started', started);
    fd.set('message', `Free website audit — full report requested for ${data.url}. Score ${data.score}/100, ${data.issues} issues found.`);
    fd.set('report', data.checks.map((c: Check) => `[${c.status.toUpperCase()}] ${c.label}${c.detail ? ' — ' + c.detail : ''}`).join('\n') +
      '\n\nCategories: ' + data.categories.map((c: any) => `${c.label} ${c.score}`).join(', '));
    try {
      const res = await fetch('/api/inquiry.php', { method: 'POST', body: fd, headers: { Accept: 'application/json' } });
      const j = await res.json().catch(() => ({}));
      if (res.ok && j.ok) {
        form.replaceChildren(el('p', 'sm:col-span-2 text-lg text-reality-soft', '✓ Thank you! Our team will prepare your full report and contact you shortly.'));
        (window as any).dataLayer?.push({ event: 'generate_lead', lead_source: 'free_website_audit' });
      } else { status.textContent = j.error ?? 'Could not send. Please try again or use the contact page.'; status.className = 'text-sm text-caution'; btn.disabled = false; }
    } catch { status.textContent = 'Could not send. Please use the contact page.'; status.className = 'text-sm text-caution'; btn.disabled = false; }
  });
  box.append(form);
  root.append(box);
}

const renderers: Record<string, (root: HTMLElement, d: any, capHref: string) => void> = {
  audit(root, d, capHref) {
    const top = el('div', 'panel flex flex-col items-center gap-8 p-6 sm:flex-row sm:p-8');
    top.append(scoreRing(d.score));
    const info = el('div', 'w-full flex-1');
    info.append(el('p', 'font-mono text-xs uppercase tracking-[0.18em] text-mist-500', 'Audited URL'));
    info.append(el('p', 'mt-1 break-all text-mist-50', d.url));
    info.append(el('p', 'mt-2 text-mist-400', `${d.issues} things to improve · fetched in ${d.fetchedMs} ms`));
    const cats = el('ul', 'mt-5 space-y-3');
    for (const c of d.categories) {
      const li = el('li');
      const row = el('div', 'flex justify-between text-sm');
      row.append(el('span', 'text-mist-200', c.label), el('span', 'font-mono text-mist-50', String(c.score)));
      const bar = el('div', 'mt-1 h-1.5 overflow-hidden rounded-full bg-white/5');
      const fill = el('div', 'h-full rounded-full bg-gradient-to-r from-vision via-neon to-signal transition-[width] duration-[1400ms]');
      fill.style.width = '0%';
      requestAnimationFrame(() => (fill.style.width = c.score + '%'));
      bar.append(fill); li.append(row, bar); cats.append(li);
    }
    info.append(cats);
    top.append(info);
    root.append(top);
    const list = el('ul', 'mt-6 grid gap-3');
    (d.checks as Check[]).forEach((c) => list.append(checkRow(c)));
    root.append(list);
    leadGate(root, d);
  },
  'ai-crawlers'(root, d, capHref) {
    const r = d.robots;
    const head = el('div', 'panel p-6 sm:p-8');
    head.append(el('p', 'text-mist-50', r.exists ? `robots.txt found at ${d.url}/robots.txt` : `No robots.txt found at ${d.url} — all crawlers are allowed by default.`));
    if (r.sitemaps?.length) head.append(el('p', 'mt-2 break-all text-sm text-mist-400', 'Sitemaps: ' + r.sitemaps.join(', ')));
    root.append(head);
    const grid = el('ul', 'mt-6 grid gap-3 sm:grid-cols-2');
    const map: Record<string, Status> = { allowed: 'pass', partial: 'pass', blocked: 'fail' };
    for (const b of r.bots) {
      const label = b.access === 'partial' ? 'Allowed (some paths restricted)' : b.access === 'blocked' ? 'Blocked' : 'Allowed';
      grid.append(checkRow({ id: b.bot, category: '', label: `${b.bot}`, status: map[b.access], detail: `${b.owner} · ${label}` }));
    }
    root.append(grid);
    root.append(ctaBox(capHref, 'Want your brand cited in ChatGPT, Perplexity and Gemini? We optimise for AI search (GEO).'));
  },
  headers(root, d, capHref) {
    const top = el('div', 'panel flex flex-col items-center gap-8 p-6 sm:flex-row sm:p-8');
    top.append(scoreRing(d.score, 'Grade ' + d.grade));
    const info = el('div', 'flex-1');
    info.append(el('p', 'font-display text-5xl text-gradient', d.grade));
    info.append(el('p', 'mt-2 break-all text-mist-400', d.url));
    top.append(info);
    root.append(top);
    const list = el('ul', 'mt-6 grid gap-3');
    (d.checks as Check[]).forEach((c) => list.append(checkRow(c)));
    root.append(list);
    root.append(ctaBox(capHref, 'Need a full security review and hardening? Our team covers servers, apps and compliance.'));
  },
  email(root, d, capHref) {
    const top = el('div', 'panel flex flex-col items-center gap-8 p-6 sm:flex-row sm:p-8');
    top.append(scoreRing(d.score));
    const info = el('div', 'flex-1');
    info.append(el('p', 'font-mono text-xs uppercase tracking-[0.18em] text-mist-500', 'Domain'));
    info.append(el('p', 'mt-1 text-2xl text-mist-50', d.domain));
    top.append(info);
    root.append(top);
    const list = el('ul', 'mt-6 grid gap-3');
    (d.checks as Check[]).forEach((c) => list.append(checkRow(c)));
    root.append(list);
    root.append(ctaBox(capHref, 'Emails landing in spam? We configure SPF, DKIM and DMARC correctly for your provider.'));
  },
  tracking(root, d, capHref) {
    const t = d.tracking;
    const list = el('ul', 'grid gap-3');
    if (!t.tags.length) list.append(checkRow({ id: 'none', category: '', label: 'No analytics or marketing tags detected in the page source', status: 'info', detail: 'Tags may load later via Tag Manager or after consent.' }));
    for (const tag of t.tags) list.append(checkRow({ id: tag.name, category: '', label: tag.name, status: tag.name.includes('discontinued') ? 'warn' : 'pass', detail: tag.ids.length ? tag.ids.join(', ') : 'Detected' }));
    list.append(checkRow({ id: 'cmp', category: '', label: 'Cookie consent', status: t.consent.length ? 'pass' : 'warn', detail: t.consent.length ? t.consent.join(', ') : 'No consent platform detected in the page source.' }));
    list.append(checkRow({ id: 'cm', category: '', label: 'Google Consent Mode', status: t.consentMode ? 'pass' : 'warn', detail: t.consentMode ? 'Consent default command found.' : 'No Consent Mode default found in the page source.' }));
    const head = el('p', 'mb-4 break-all text-mist-400', d.url);
    root.append(head, list);
    root.append(ctaBox(capHref, 'Want GA4, GTM and Consent Mode v2 set up properly — and monitored live? Talk to our analytics team.'));
  },
};

export function initTool(root: HTMLElement) {
  const form = root.querySelector<HTMLFormElement>('[data-tool-form]');
  const out = root.querySelector<HTMLElement>('[data-tool-output]')!;
  const api = root.dataset.api!;
  const capHref = root.dataset.cap!;
  if (!form) return;
  const pre = new URLSearchParams(location.search).get('url');
  if (pre) {
    form.querySelector<HTMLInputElement>('input[name="target"]')!.value = pre.slice(0, 2048);
    setTimeout(() => form.requestSubmit(), 300);
  }
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = form.querySelector<HTMLInputElement>('input[name="target"]')!;
    const value = input.value.trim();
    if (!value) { input.focus(); return; }
    const btn = form.querySelector<HTMLButtonElement>('button')!;
    btn.disabled = true;
    out.replaceChildren();
    const loading = el('div', 'panel flex items-center gap-4 p-6');
    loading.append(el('span', 'tool-spinner'), el('span', 'text-mist-200', 'Running live checks…'));
    out.append(loading);
    out.scrollIntoView({ behavior: 'smooth', block: 'start' });
    try {
      const body = api === 'email' ? { tool: api, domain: value } : { tool: api, url: value };
      const res = await fetch('/api/tools.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json().catch(() => ({ ok: false, error: 'The service is not available right now.' }));
      out.replaceChildren();
      if (!data.ok) {
        const err = el('div', 'panel border-caution/50 p-6 text-caution', data.error || 'The check failed.');
        out.append(err);
      } else {
        renderers[api](out, data, capHref);
        (window as any).dataLayer?.push({ event: 'free_tool_run', tool_name: api });
      }
    } catch {
      out.replaceChildren(el('div', 'panel p-6 text-caution', 'The tool service is not reachable. Please try again later.'));
    } finally {
      btn.disabled = false;
    }
  });
}

/** SERP preview — fully client-side with pixel measurement. */
export function initSerp(root: HTMLElement) {
  const t = root.querySelector<HTMLInputElement>('[name="serp-title"]')!;
  const d = root.querySelector<HTMLTextAreaElement>('[name="serp-desc"]')!;
  const u = root.querySelector<HTMLInputElement>('[name="serp-url"]')!;
  const ctx = document.createElement('canvas').getContext('2d')!;
  const width = (text: string, font: string) => { ctx.font = font; return ctx.measureText(text).width; };
  const truncate = (text: string, font: string, max: number) => {
    if (width(text, font) <= max) return text;
    let s = text;
    while (s.length && width(s + ' …', font) > max) s = s.slice(0, -1);
    return s.trimEnd() + ' …';
  };
  const update = () => {
    const titleFont = '20px Arial', descFont = '14px Arial';
    const tw = Math.round(width(t.value, titleFont)), dw = Math.round(width(d.value, descFont));
    root.querySelector('[data-serp-title]')!.textContent = truncate(t.value || 'Your page title', titleFont, 580);
    root.querySelector('[data-serp-desc]')!.textContent = truncate(d.value || 'Your meta description will appear here.', descFont, 920);
    let url = u.value.trim() || 'https://example.com/page';
    try { const x = new URL(/^https?:/.test(url) ? url : 'https://' + url); url = x.hostname + (x.pathname !== '/' ? x.pathname.replace(/\//g, ' › ').replace(/ › $/, '') : ''); } catch {}
    root.querySelector('[data-serp-url]')!.textContent = url;
    const tm = root.querySelector<HTMLElement>('[data-serp-tmeter]')!, dm = root.querySelector<HTMLElement>('[data-serp-dmeter]')!;
    tm.textContent = `${t.value.length} chars · ${tw} / 580 px`;
    dm.textContent = `${d.value.length} chars · ${dw} / 920 px`;
    tm.style.color = tw > 580 ? '#ff4f7a' : tw < 250 ? '#f5b544' : '#10b981';
    dm.style.color = dw > 920 ? '#ff4f7a' : dw < 400 ? '#f5b544' : '#10b981';
  };
  [t, d, u].forEach((x) => x.addEventListener('input', update));
  update();
}
