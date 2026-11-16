import { ROBOT_CHECK_HTML, initRobotCheck, robotVerified } from './robotcheck';

/**
 * Free tools — client side. Calls /api/tools.php and renders results.
 * All external values are inserted with textContent (never innerHTML) to prevent XSS.
 */
type Status = 'pass' | 'warn' | 'fail' | 'info' | 'locked';
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
  locked: { label: 'Locked', color: '#a996ff', icon: '🔒' },
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
    head.firstChild!.textContent = ['Structured data & entity signals', 'Crawl and index configuration', 'Content and answer readiness', 'Security header policy', 'Tracking and consent setup', 'Performance and delivery'][Math.abs(c.id.length * 7 + c.category.length) % 6];
    (head.firstChild as HTMLElement).className = 'text-mist-50 blur-[5px] select-none';
    body.append(el('p', 'mt-1 text-sm text-mist-500 blur-[4px] select-none', 'Detailed finding and recommended fix are part of the full report.'));
    row.setAttribute('aria-label', 'Locked finding — available in the full report');
  } else if (c.detail) {
    body.append(el('p', 'mt-1 break-words text-sm text-mist-400', c.detail));
  }
  row.append(icon, body);
  return row;
}

function lockedNote(count: number, text: string) {
  const n = el('div', 'locked-note relative -mt-24 flex flex-col items-center gap-3 rounded-2xl px-6 pb-4 pt-28 text-center');
  n.append(el('p', 'font-display text-xl text-mist-50', `🔒 +${count} more findings locked`));
  n.append(el('p', 'max-w-md text-sm text-mist-400', text));
  return n;
}

/** Copies the visible (unlocked) results as plain text. */
function copyResultsButton(out: HTMLElement) {
  const bar = el('div', 'mb-4 flex justify-end');
  const btn = el('button', 'btn btn-ghost !min-h-10 !py-2 text-sm', 'Copy results');
  btn.setAttribute('type', 'button');
  btn.addEventListener('click', async () => {
    const lines: string[] = [];
    out.querySelectorAll('li:not(.locked), .panel p').forEach((n) => {
      if (n.closest('form, .locked-note')) return;
      const t = (n.textContent || '').replace(/\s+/g, ' ').trim();
      if (t && !lines.includes(t)) lines.push(t);
    });
    try { await navigator.clipboard.writeText(lines.join('\n') + '\n\nChecked with nsbinvictus.tech/tools/'); btn.textContent = 'Copied ✓'; setTimeout(() => (btn.textContent = 'Copy results'), 1500); } catch { /* blocked */ }
  });
  bar.append(btn);
  return bar;
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
    <div class="sm:col-span-2">${ROBOT_CHECK_HTML}</div>
    <div class="flex flex-wrap items-center gap-4 sm:col-span-2"><button class="btn btn-primary" type="submit">Send me the full report</button><span class="text-sm" role="status" aria-live="polite" data-lg-status></span></div>`;
  const started = String(Date.now() - 10000);
  initRobotCheck(form);
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    if (!robotVerified(form)) return;
    const status = form.querySelector<HTMLElement>('[data-lg-status]')!;
    const btn = form.querySelector<HTMLButtonElement>('button')!;
    btn.disabled = true; status.textContent = 'Sending…'; status.className = 'text-sm text-mist-400';
    const fd = new FormData(form);
    fd.set('topic', 'free-audit');
    fd.set('company', '');
    fd.set('started', started);
    fd.set('message', `Free website audit — full report requested for ${data.url}. Score ${data.score}/100, ${data.issues} issues found.`);
    fd.set('report', `URL: ${data.url}\nScore: ${data.score}/100 · ${data.issues} of ${data.total} checks need attention\n` +
      'Categories: ' + data.categories.map((c: any) => `${c.label} ${c.score}`).join(', ') + '\nTop findings shown to the visitor:\n' +
      data.checks.filter((c: Check) => !c.locked).map((c: Check) => `[${c.status.toUpperCase()}] ${c.label} — ${c.detail}`).join('\n') +
      '\n\nRun the full analysis in SEODREAM before replying.');
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
    const locked = (d.checks as Check[]).filter((c) => c.locked).length;
    if (locked) root.append(lockedNote(locked, 'The free check shows your 3 most important findings. Get every finding, the exact fixes and a priority plan in the full report.'));
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
    const more = (d.totalBots ?? 0) - r.bots.length;
    if (more > 0) root.append(lockedNote(more, `${d.blockedTotal} of ${d.totalBots} crawlers are blocked in total. The full GEO report covers every AI crawler, your AI-answer visibility and what to change.`));
    root.append(ctaBox(capHref + '&ref=ai-crawlers', 'Want your brand cited in ChatGPT, Perplexity and Gemini? Get the full GEO report from our team.'));
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
    const lockedH = (d.checks as Check[]).filter((c) => c.locked).length;
    if (lockedH) root.append(lockedNote(lockedH, 'See every header result with exact configuration fixes in the full security report.'));
    root.append(ctaBox(capHref + '&ref=security', 'Need a full security review and hardening? Our team covers servers, apps and compliance.'));
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
    out.style.overflowAnchor = 'none';
    const loading = el('div', 'panel flex items-center gap-4 p-6');
    loading.append(el('span', 'tool-spinner'), el('span', 'text-mist-200', 'Running live checks…'));
    out.append(loading);
    {
      const top = out.getBoundingClientRect().top + window.scrollY - 96;
      window.scrollTo({ top, behavior: 'smooth' });
    }
    try {
      const body = api === 'email' ? { tool: api, domain: value } : { tool: api, url: value };
      const res = await fetch('/api/tools.php', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-NSB-Client': 'web' }, body: JSON.stringify(body) });
      const data = await res.json().catch(() => ({ ok: false, error: 'The service is not available right now.' }));
      out.replaceChildren();
      if (!data.ok) {
        const err = el('div', 'panel border-caution/50 p-6 text-caution', data.error || 'The check failed.');
        out.append(err);
      } else {
        renderers[api](out, data, capHref);
        out.prepend(copyResultsButton(out));
        // Keep the visitor at the top of the results (score and summary first).
        requestAnimationFrame(() => {
          const top = out.getBoundingClientRect().top + window.scrollY - (document.querySelector('[data-header]')?.getBoundingClientRect().height ?? 72) - 24;
          window.scrollTo({ top, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
        });
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

/* ------------------------------------------------------------------ */
/* Browser-only tools                                                   */
/* ------------------------------------------------------------------ */
const fmtBytes = (b: number) => (b > 1048576 ? (b / 1048576).toFixed(2) + ' MB' : Math.round(b / 1024) + ' KB');

function bindCopy(root: HTMLElement) {
  root.querySelectorAll<HTMLButtonElement>('[data-copy]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const src = root.querySelector<HTMLElement>(btn.dataset.copy!)!;
      try { await navigator.clipboard.writeText(src.textContent ?? ''); btn.textContent = 'Copied ✓'; setTimeout(() => (btn.textContent = 'Copy'), 1500); } catch { /* clipboard blocked */ }
    });
  });
}

function initUtm(root: HTMLElement) {
  const q = (n: string) => root.querySelector<HTMLInputElement>(`[name="${n}"]`)!;
  const out = root.querySelector<HTMLElement>('[data-utm-out]')!;
  const clean = (v: string) => v.trim().toLowerCase().replace(/\s+/g, '_');
  const update = () => {
    const raw = q('url').value.trim();
    if (!raw || !q('utm_source').value.trim() || !q('utm_medium').value.trim() || !q('utm_campaign').value.trim()) { out.textContent = 'Fill in the required fields…'; return; }
    try {
      const u = new URL(/^https?:\/\//i.test(raw) ? raw : 'https://' + raw);
      ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach((k) => { const v = clean(q(k).value); v ? u.searchParams.set(k, v) : u.searchParams.delete(k); });
      out.textContent = u.toString();
    } catch { out.textContent = 'Please enter a valid URL.'; }
  };
  root.querySelectorAll('input').forEach((i) => i.addEventListener('input', update));
  bindCopy(root);
}

const STOP = new Set('a an and are as at be but by for from has have i in is it its of on or that the this to was were will with you your we our they their not can do if so than then there these those what when which who how all any more most other some such only own same too very just also into about over after before'.split(' '));
function syllables(w: string) {
  w = w.toLowerCase().replace(/[^a-z]/g, '');
  if (w.length <= 3) return 1;
  w = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '').replace(/^y/, '');
  return Math.max(1, (w.match(/[aeiouy]{1,2}/g) || []).length);
}
function initWords(root: HTMLElement) {
  const ta = root.querySelector<HTMLTextAreaElement>('[data-wc-text]')!;
  const set = (k: string, v: string) => (root.querySelector(`[data-wc="${k}"]`)!.textContent = v);
  const kw = root.querySelector<HTMLElement>('[data-wc-keywords]')!;
  const mins = (n: number) => (n < 1 ? Math.max(0, Math.round(n * 60)) + ' s' : Math.round(n) + ' min');
  const update = () => {
    const t = ta.value;
    const words = t.match(/[\p{L}\p{N}'’-]+/gu) || [];
    const sentences = t.split(/[.!?]+(?:\s|$)/).filter((s) => s.trim()).length;
    const paragraphs = t.split(/\n\s*\n/).filter((s) => s.trim()).length;
    set('words', String(words.length));
    set('chars', String(t.length));
    set('charsNoSpace', String(t.replace(/\s/g, '').length));
    set('sentences', String(sentences));
    set('paragraphs', String(paragraphs));
    set('read', mins(words.length / 230));
    set('speak', mins(words.length / 140));
    const syl = words.reduce((a, w) => a + syllables(w), 0);
    const flesch = words.length && sentences ? Math.round(206.835 - 1.015 * (words.length / sentences) - 84.6 * (syl / words.length)) : 0;
    set('flesch', words.length ? String(Math.max(0, Math.min(100, flesch))) : '0');
    const freq = new Map<string, number>();
    words.forEach((w) => { const l = w.toLowerCase(); if (l.length > 2 && !STOP.has(l)) freq.set(l, (freq.get(l) || 0) + 1); });
    const top = [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12);
    kw.replaceChildren(...(top.length ? top.map(([w, c]) => { const li = el('li', 'tag'); li.textContent = `${w} · ${c} · ${((c / words.length) * 100).toFixed(1)}%`; return li; }) : [el('li', 'text-sm text-mist-500', 'Start typing to see keyword density.')]));
  };
  ta.addEventListener('input', update);
}

function initPassword(root: HTMLElement) {
  const out = root.querySelector<HTMLElement>('[data-pw-out]')!;
  const len = root.querySelector<HTMLInputElement>('[data-pw-len]')!;
  const bar = root.querySelector<HTMLElement>('[data-pw-bar]')!;
  const label = root.querySelector<HTMLElement>('[data-pw-strength]')!;
  const opt = (k: string) => root.querySelector<HTMLInputElement>(`[data-pw-opt="${k}"]`)!.checked;
  const gen = () => {
    const sets: Record<string, string> = { upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', lower: 'abcdefghijklmnopqrstuvwxyz', digits: '0123456789', symbols: '!@#$%^&*()-_=+[]{};:,.?/' };
    let pool = Object.keys(sets).filter(opt).map((k) => sets[k]).join('');
    if (opt('noambig')) pool = pool.replace(/[lI1O0o]/g, '');
    if (!pool) { out.textContent = 'Select at least one character type.'; return; }
    const n = Number(len.value);
    const rnd = new Uint32Array(n);
    crypto.getRandomValues(rnd);
    out.textContent = Array.from(rnd, (r) => pool[r % pool.length]).join('');
    const bits = Math.round(n * Math.log2(pool.length));
    const [txt, color, pct] = bits >= 100 ? ['Excellent', '#10b981', 100] : bits >= 75 ? ['Strong', '#22d3ee', 78] : bits >= 50 ? ['Fair', '#f5b544', 50] : ['Weak', '#ff4f7a', 25];
    bar.style.width = pct + '%'; bar.style.background = color; bar.style.boxShadow = `0 0 12px ${color}`;
    label.textContent = `${txt} · about ${bits} bits of entropy`; label.style.color = color as string;
    root.querySelector('[data-pw-len-val]')!.textContent = String(n);
  };
  root.querySelectorAll('input').forEach((i) => i.addEventListener('input', gen));
  root.querySelector('[data-pw-new]')!.addEventListener('click', gen);
  bindCopy(root);
  gen();
}

function initImage(root: HTMLElement) {
  const input = root.querySelector<HTMLInputElement>('[data-img-input]')!;
  const drop = root.querySelector<HTMLElement>('[data-img-drop]')!;
  const w = root.querySelector<HTMLInputElement>('[data-img-w]')!;
  const f = root.querySelector<HTMLSelectElement>('[data-img-f]')!;
  const qEl = root.querySelector<HTMLInputElement>('[data-img-q]')!;
  let file: File | null = null;
  let url = '';
  const run = async () => {
    root.querySelector('[data-img-qv]')!.textContent = qEl.value;
    if (!file) return;
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, Number(w.value || bmp.width) / bmp.width);
    const c = document.createElement('canvas');
    c.width = Math.round(bmp.width * scale); c.height = Math.round(bmp.height * scale);
    c.getContext('2d')!.drawImage(bmp, 0, 0, c.width, c.height);
    const blob: Blob | null = await new Promise((r) => c.toBlob(r, f.value, Number(qEl.value) / 100));
    if (!blob) return;
    if (url) URL.revokeObjectURL(url);
    url = URL.createObjectURL(blob);
    root.querySelector('[data-img-result]')!.classList.remove('hidden');
    root.querySelector('[data-img-before]')!.textContent = fmtBytes(file.size);
    root.querySelector('[data-img-after]')!.textContent = fmtBytes(blob.size);
    root.querySelector('[data-img-saved]')!.textContent = Math.max(0, Math.round((1 - blob.size / file.size) * 100)) + '%';
    (root.querySelector('[data-img-preview]') as HTMLImageElement).src = url;
    const a = root.querySelector<HTMLAnchorElement>('[data-img-download]')!;
    a.href = url;
    a.download = file.name.replace(/\.[^.]+$/, '') + (f.value === 'image/webp' ? '.webp' : '.jpg');
  };
  const take = (fl?: FileList | null) => { if (fl && fl[0] && /^image\/(jpeg|png|webp)$/.test(fl[0].type)) { file = fl[0]; run(); } };
  input.addEventListener('change', () => take(input.files));
  drop.addEventListener('dragover', (e) => { e.preventDefault(); drop.classList.add('border-neon'); });
  drop.addEventListener('dragleave', () => drop.classList.remove('border-neon'));
  drop.addEventListener('drop', (e) => { e.preventDefault(); drop.classList.remove('border-neon'); take(e.dataTransfer?.files); });
  [w, f, qEl].forEach((x) => x.addEventListener('input', run));
}

export function initClientTool(root: HTMLElement) {
  const kind = root.dataset.clientTool;
  if (kind === 'utm') initUtm(root);
  else if (kind === 'words') initWords(root);
  else if (kind === 'password') initPassword(root);
  else if (kind === 'image') initImage(root);
}
