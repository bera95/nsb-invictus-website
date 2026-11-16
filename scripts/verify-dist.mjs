/**
 * Verifies dist/ is a correct, safe Hostinger public_html payload:
 *  1. required files exist (pages, .htaccess, PHP endpoint, SEO files)
 *  2. no source, dev or secret files are present
 *  3. every internal link, asset, form action and image path resolves
 *  4. canonical URLs use the production domain
 * Exits non-zero on any problem. Run after `npm run build`.
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, dirname, posix } from 'node:path';

const dist = new URL('../dist/', import.meta.url).pathname;
const domain = (process.env.PUBLIC_SITE_URL || 'https://nsbinvictus.tech').replace(/\/$/, '');
const errors = [];
const files = [];
const walk = (d) => readdirSync(d).forEach((n) => { const p = join(d, n); statSync(p).isDirectory() ? walk(p) : files.push(relative(dist, p)); });
if (!existsSync(dist)) { console.error('dist/ not found — run npm run build'); process.exit(1); }
walk(dist);

// 1. Required
const required = ['index.html', '404.html', '.htaccess', 'robots.txt', 'sitemap-index.xml', 'favicon.ico', 'og-image.png', 'site.webmanifest',
  'api/inquiry.php', 'api/tools.php', 'api/.htaccess', 'tools/index.html', 'api/config.example.php', 'contact/index.html', 'privacy/index.html', 'legal/index.html'];
for (const r of required) if (!files.includes(r)) errors.push(`missing required file: ${r}`);

// 2. Forbidden (vendor/ is allowed: PHPMailer is installed during the production build)
const forbidden = [
  [/(^|\/)\.env/, '.env file'], [/^api\/config\.php$/, 'real PHP config inside web root'], [/(^|\/)private\//, 'private/ directory'],
  [/(^|\/)node_modules\//, 'node_modules'], [/^src\//, 'source directory'], [/\.(ts|tsx|astro|mjs|map)$/, 'source/dev file'],
  [/^(package(-lock)?\.json|tsconfig\.json|astro\.config\.mjs|README\.md|CLAUDE\.md)$/, 'project file'],
  [/(^|\/)scripts\//, 'build scripts'], [/router\.php$/, 'dev router'], [/(^|\/)\.git(\/|$)/, '.git'], [/(^|\/)docs\//, 'docs'],
];
for (const f of files) {
  if (f.startsWith('api/vendor/')) continue;
  for (const [re, why] of forbidden) if (re.test(f)) errors.push(`forbidden in production: ${f} (${why})`);
}

// 3. Links
const exists = (urlPath) => {
  const clean = decodeURIComponent(urlPath.split(/[?#]/)[0]);
  const rel = clean.replace(/^\//, '');
  if (rel === '') return files.includes('index.html');
  if (files.includes(rel)) return true;
  return files.includes(posix.join(rel, 'index.html'));
};
let linkCount = 0;
for (const f of files.filter((x) => x.endsWith('.html'))) {
  const html = readFileSync(join(dist, f), 'utf8');
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
  for (const m of html.matchAll(/\s(href|src|action|content)="([^"]+)"/g)) {
    let url = m[2];
    if (m[1] === 'content' && !url.startsWith('/') && !url.startsWith(domain)) continue;
    if (url.startsWith(domain)) url = url.slice(domain.length) || '/';
    if (/^(https?:|mailto:|tel:|data:|blob:|javascript:)/.test(url) || !/^[/#]/.test(url)) continue;
    if (/^\/\//.test(url)) continue;
    linkCount++;
    if (url.startsWith('#')) { if (url.length > 1 && !ids.has(url.slice(1))) errors.push(`${f}: missing anchor ${url}`); continue; }
    if (!exists(url)) errors.push(`${f}: broken link ${url}`);
    const pagePath = url.split(/[?#]/)[0];
    if (!/\.[a-z0-9]+$/i.test(pagePath) && !pagePath.endsWith('/')) errors.push(`${f}: link without trailing slash ${url}`);
  }
  // 4. Canonical
  const canon = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  if (f !== '404.html' && !canon?.startsWith(domain + '/')) errors.push(`${f}: canonical not on ${domain} (${canon})`);
  if (html.includes('example.com')) errors.push(`${f}: contains example.com`);
}
for (const x of ['robots.txt', 'sitemap-0.xml']) {
  if (files.includes(x) && readFileSync(join(dist, x), 'utf8').includes('example.com')) errors.push(`${x}: contains example.com`);
}

console.log(`[verify] ${files.length} files, ${linkCount} internal references checked, domain ${domain}`);
if (errors.length) { console.error(errors.map((e) => '  ✗ ' + e).join('\n')); process.exit(1); }
console.log('[verify] ✓ dist/ is a valid public_html payload');
