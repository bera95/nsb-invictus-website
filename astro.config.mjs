// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// PUBLIC_SITE_URL must be set to the production domain before a release build.
const site = process.env.PUBLIC_SITE_URL || 'https://www.example.com';

export default defineConfig({
  site,
  output: 'static',
  devToolbar: { enabled: false },
  trailingSlash: 'always',
  build: { format: 'directory', assets: '_assets' },
  integrations: [sitemap({ filter: (page) => !page.includes('/404') })],
  vite: { plugins: [tailwindcss()] },
});
