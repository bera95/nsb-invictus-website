/**
 * Notifies IndexNow-enabled search engines (Bing, Yandex, Seznam, Naver…) about every URL
 * in the built sitemap. Run after a production deploy: `node scripts/indexnow.mjs`.
 * The key file (public/<key>.txt) must already be live on the site.
 */
import { readFileSync, existsSync } from 'node:fs';

const site = (process.env.PUBLIC_SITE_URL || 'https://nsbinvictus.tech').replace(/\/$/, '');
const key = readFileSync(new URL('./indexnow-key.txt', import.meta.url), 'utf8').trim();
const sitemap = new URL('../dist/sitemap-0.xml', import.meta.url);
if (!existsSync(sitemap)) { console.error('[indexnow] dist/sitemap-0.xml not found — build first'); process.exit(1); }
const urls = [...readFileSync(sitemap, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const body = { host: new URL(site).host, key, keyLocation: `${site}/${key}.txt`, urlList: urls };
const res = await fetch('https://api.indexnow.org/indexnow', { method: 'POST', headers: { 'Content-Type': 'application/json; charset=utf-8' }, body: JSON.stringify(body) });
console.log(`[indexnow] submitted ${urls.length} URLs → HTTP ${res.status}`);
if (res.status >= 400 && res.status !== 429) process.exit(1);
