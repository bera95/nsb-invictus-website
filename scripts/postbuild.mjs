/**
 * Post-build: finalises dist/ for static hosting.
 *  - writes an absolute Sitemap URL into robots.txt
 *  - removes any accidental secrets / dev files from dist
 *  - reports remaining PLACEHOLDER markers
 */
import { readFileSync, writeFileSync, rmSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import { createHash } from 'node:crypto';
import { renameSync } from 'node:fs';

const dist = new URL('../dist/', import.meta.url).pathname;
const site = (process.env.PUBLIC_SITE_URL || 'https://nsbinvictus.tech').replace(/\/$/, '');

const robots = join(dist, 'robots.txt');
if (existsSync(robots)) {
  writeFileSync(robots, readFileSync(robots, 'utf8').replace(/^Sitemap: .*$/m, `Sitemap: ${site}/sitemap-index.xml`));
}

for (const f of ['api/config.php', 'api/vendor/.git', 'api/composer.lock']) {
  const p = join(dist, f);
  if (existsSync(p)) { rmSync(p, { recursive: true, force: true }); console.log(`[postbuild] removed ${f}`); }
}

/* ---- Remove technology fingerprints from the public output ---------------- */
const scrub = (d) => readdirSync(d).forEach((n) => {
  const p = join(d, n);
  if (statSync(p).isDirectory()) { if (!p.endsWith('/api')) scrub(p); return; }
  if (!/\.(html|css|js|xml|txt)$/.test(p)) return;
  let t = readFileSync(p, 'utf8');
  const o = t;
  t = t.replace(/data-astro-cid-([a-z0-9]+)/g, 'data-v-$1')          // scoped-style attributes
       .replace(/astro-cid-([a-z0-9]+)/g, 'v-$1')
       .replace(/\/\*![^*]*tailwindcss[^*]*\*\//gi, '')             // CSS library banner
       .replace(/data-astro-[a-z-]+/g, 'data-x');
  if (p.endsWith('.html')) t = t.replace(/<!--(?!\[if)[\s\S]*?-->/g, ''); // HTML comments
  if (t !== o) writeFileSync(p, t);
});
scrub(dist);

/* ---- Rename any asset that still carries a source/component name ---------- */
const assetDir = join(dist, '_a');
if (existsSync(assetDir)) {
  const renames = [];
  for (const n of readdirSync(assetDir)) {
    if (/^[A-Za-z0-9_-]{6,12}\.[a-z0-9]+$/.test(n)) continue; // already hash-only
    const ext = extname(n);
    const hash = createHash('sha256').update(readFileSync(join(assetDir, n))).digest('base64url').slice(0, 10).replace(/[-_]/g, 'x');
    renames.push([n, hash + ext]);
  }
  for (const [from, to] of renames) renameSync(join(assetDir, from), join(assetDir, to));
  if (renames.length) {
    const fix = (d) => readdirSync(d).forEach((n) => {
      const p = join(d, n);
      if (statSync(p).isDirectory()) { if (!p.endsWith('/api')) fix(p); return; }
      if (!/\.(html|css|js)$/.test(p)) return;
      let t = readFileSync(p, 'utf8'); const o = t;
      for (const [from, to] of renames) t = t.split(from).join(to);
      if (t !== o) writeFileSync(p, t);
    });
    fix(dist);
    console.log(`[postbuild] renamed ${renames.length} named assets to neutral hashes`);
  }
}

let count = 0;
const walk = (d) => readdirSync(d).forEach((n) => {
  const p = join(d, n);
  if (statSync(p).isDirectory()) return walk(p);
  if (p.endsWith('.html')) count += (readFileSync(p, 'utf8').match(/data-placeholder/g) || []).length;
});
walk(dist);

console.log(`[postbuild] canonical site: ${site}`);
console.log(`[postbuild] done. Visible placeholder markers in output: ${count}`);
