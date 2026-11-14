/**
 * Post-build: finalises dist/ for static hosting.
 *  - writes an absolute Sitemap URL into robots.txt
 *  - removes any accidental secrets / dev files from dist
 *  - reports remaining PLACEHOLDER markers
 */
import { readFileSync, writeFileSync, rmSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const dist = new URL('../dist/', import.meta.url).pathname;
const site = (process.env.PUBLIC_SITE_URL || 'https://www.example.com').replace(/\/$/, '');

const robots = join(dist, 'robots.txt');
if (existsSync(robots)) {
  writeFileSync(robots, readFileSync(robots, 'utf8').replace(/^Sitemap: .*$/m, `Sitemap: ${site}/sitemap-index.xml`));
}

for (const f of ['api/config.php', 'api/vendor/.git', 'api/composer.lock']) {
  const p = join(dist, f);
  if (existsSync(p)) { rmSync(p, { recursive: true, force: true }); console.log(`[postbuild] removed ${f}`); }
}

let count = 0;
const walk = (d) => readdirSync(d).forEach((n) => {
  const p = join(d, n);
  if (statSync(p).isDirectory()) return walk(p);
  if (p.endsWith('.html')) count += (readFileSync(p, 'utf8').match(/data-placeholder/g) || []).length;
});
walk(dist);

if (!process.env.PUBLIC_SITE_URL) console.warn('[postbuild] WARNING: PUBLIC_SITE_URL is not set — canonical URLs use https://www.example.com');
console.log(`[postbuild] done. Visible placeholder markers in output: ${count}`);
