// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Canonical production domain. Can be overridden with PUBLIC_SITE_URL (e.g. for a staging build).
const site = process.env.PUBLIC_SITE_URL || 'https://nsbinvictus.tech';

export default defineConfig({
  site,
  output: 'static',
  devToolbar: { enabled: false },
  trailingSlash: 'always',
  build: { format: 'directory', assets: '_assets' },
  integrations: [sitemap({ filter: (page) => !page.includes('/404'), lastmod: new Date(), changefreq: 'monthly' })],
  vite: { plugins: [tailwindcss()] },
});
