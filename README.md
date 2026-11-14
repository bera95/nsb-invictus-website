# NSB INVICTUS — Website

**Where vision becomes reality.**

Corporate website for NSB INVICTUS: a static Astro site with a WebGL "Living Architecture" experience and a small PHP endpoint for inquiries. Designed to run on **Hostinger Premium Web Hosting** with no Node.js production runtime, database or VPS.

| | |
|---|---|
| Framework | [Astro](https://astro.build) (static output) + TypeScript |
| Styling | Tailwind CSS v4, design tokens in `src/styles/global.css` |
| 3D | three.js (custom shaders), lazy-loaded after first paint |
| Forms | `public/api/inquiry.php` (PHP 7.4+/8.x, PHPMailer over SMTP) |
| Fonts | Self-hosted via Fontsource (no Google Fonts requests) |
| Hosting | Hostinger Premium — static files + PHP |

## Quick start

```bash
npm install
npm run dev          # http://localhost:4321  (live reload; the PHP form endpoint is not active here)
npm run build        # production build → dist/
npm run preview      # http://localhost:4322  (serves dist/ with PHP — the contact form works)
npm run check        # TypeScript / Astro diagnostics
```

To test the contact form locally, create `private/nsb-config.php` (git-ignored) from `public/api/config.example.php` and set `'log_only' => true`. Submissions are then written to `<system temp dir>/nsb-inquiries.log` instead of being emailed.

## Project structure

```
src/
  data/            ← ALL editable content and configuration
    site.ts          global settings, contact & legal details, navigation
    capabilities.ts  the five capabilities + Strategy & Advisory
    industries.ts    industry verticals (add an object → new page)
    products.ts      proprietary products with status labels
    approach.ts      process, engagement models, principles, technology
  components/      layout, home sections, UI, visual (3D canvas, 360° tour)
  layouts/Base.astro   <head>, SEO, structured data, header/footer
  pages/           routes (file-based)
  scripts/
    architecture/  Living Architecture engine (shapes.ts, engine.ts, mount.ts)
    panorama.ts    360° viewer
public/
  api/             PHP inquiry endpoint, config template, composer.json
  .htaccess        HTTPS, security headers, caching, 404
docs/              architecture decisions, deployment, QA checklist
scripts/           post-build + local PHP preview
```

## Editing content

- **Contact details, legal entity, social links** → `src/data/site.ts`
- **Services** → `src/data/capabilities.ts` (pages, navigation, homepage ecosystem and form options update automatically)
- **New industry** → add an entry to `src/data/industries.ts`
- **Products** → add entries to `src/data/products.ts` using an honest `status` (`concept`, `in-development`, `private-beta`, `public-beta`, `available`)
- **360° demo tour** → place an equirectangular image in `public/media/tours/` and set `propertyTourDemo.panorama`

## Outstanding placeholders

Search for `PLACEHOLDER` in the code. Yellow "Input required" markers are shown on the site until `site.showPlaceholders` is set to `false`.

1. Public contact email (and optional phone) — `site.ts`
2. Registered company name, address, registration/VAT numbers, jurisdiction — `site.ts`
3. Production domain — `PUBLIC_SITE_URL` (GitHub variable / `.env`), `.htaccess` canonical host, `config.php` `allowed_host`
4. Real products — `products.ts`
5. Property panorama(s) for the 360° demo — `industries.ts`
6. Social profiles — `site.ts`
7. Legal review of the privacy policy for the relevant jurisdiction

## Deployment

See **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)**. Short version: push to `main` → GitHub Actions builds and publishes `dist/` to the `production` branch → Hostinger Git deployment pulls it into `public_html`.

## Documentation

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — technical decisions and the Living Architecture system
- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) — Hostinger setup, email, secrets, rollback
- [docs/QA-CHECKLIST.md](docs/QA-CHECKLIST.md) — pre-launch checklist
