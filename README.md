# NSB INVICTUS — Website

**Where vision becomes reality.**

Corporate website for NSB INVICTUS — **https://nsbinvictus.tech**: a static Astro site with a WebGL "Living Architecture" experience and a small PHP endpoint for inquiries. Designed to run on **Hostinger Premium Web Hosting** with no Node.js production runtime, database or VPS.

| | |
|---|---|
| Framework | [Astro](https://astro.build) (static output) + TypeScript |
| Styling | Tailwind CSS v4, design tokens in `src/styles/global.css` |
| 3D | three.js (custom shaders), lazy-loaded after first paint |
| Motion | Ambient 2D canvas (packets, comets), neon CSS layer, view transitions — all off for reduced motion |
| Analytics | GTM + Consent Mode v2 via `src/components/layout/CookieConsent.astro` |
| Forms | `public/api/inquiry.php` (PHP 7.4+/8.x, PHPMailer over SMTP) |
| Fonts | Self-hosted via Fontsource (no Google Fonts requests) |
| Hosting | Hostinger Premium — static files + PHP |

## Quick start

```bash
npm install
npm run dev          # http://localhost:4321  (live reload; the PHP form endpoint is not active here)
npm run build        # production build → dist/
npm run preview      # http://localhost:4322  (serves dist/ with PHP — the contact form works)
npm run verify       # checks dist/ is a safe, complete public_html payload (run after build)
npm run check        # TypeScript / Astro diagnostics
```

To test the contact form locally, create `private/nsb-config.php` (git-ignored) from `public/api/config.example.php` and set `'log_only' => true`. Submissions are then written to `<system temp dir>/nsb-inquiries.log` instead of being emailed.

## Project structure

```
src/
  data/            ← ALL editable content and configuration
    site.ts          global settings, contact & legal details, navigation
    capabilities.ts  the six capabilities (+ FAQ) + Strategy & Consulting
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
scripts/           post-build, dist verification, local PHP preview
.github/workflows/ ci.yml (every push) · publish-production.yml (manual)
```

## Editing content

- **Contact details, legal entity, social links** → `src/data/site.ts`
- **Services** → `src/data/capabilities.ts` (pages, navigation, homepage ecosystem and form options update automatically)
- **New industry** → add an entry to `src/data/industries.ts`
- **Products** → add entries to `src/data/products.ts` using an honest `status` (`concept`, `in-development`, `private-beta`, `public-beta`, `available`)
- **360° demo tour** → place an equirectangular image in `public/media/tours/` and set `propertyTourDemo.panorama`

## Configured

- Domain `nsbinvictus.tech` (canonical URLs, sitemap, robots, `.htaccess` www→apex redirect)
- Contact: nikola.bera@gmail.com (temporary), +353 87 443 3160 (Ireland), +387 64 191 4707
- Jurisdiction: Republic of Serbia (Kikinda). The privacy policy covers ZZPL (Serbia) and GDPR (EU visitors).
- Google Tag Manager `GTM-WWSDNF2G`, loaded only after cookie consent (Consent Mode v2). Configure GA4 inside GTM.
- Proprietary tools (SEODREAM, Analytics Command Center) — `products.ts`; names marked as working names.

## Outstanding placeholders

Search for `PLACEHOLDER` in the code. Yellow "Input required" markers stay visible until `site.showPlaceholders` is set to `false`.

1. Registered company name, street address, MB (registration no.) and PIB (tax ID) from APR — `site.ts`, then set `legal.isPlaceholder: false`
2. *(Later)* domain mailbox to replace the Gmail address, and social profiles — `site.ts`

## Deployment

See **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)**.

- Push to `main` → **CI** workflow: type check, build, verify. **Nothing is published.**
- Actions → **Publish production** (manual, type `publish`) → the built site goes to the `production` branch.
- Hostinger Git deployment pulls `production` into `public_html`.
- SMTP credentials live only in `~/domains/nsbinvictus.tech/private/nsb-config.php`, outside `public_html`.

## Documentation

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — technical decisions and the Living Architecture system
- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) — Hostinger setup, email, secrets, rollback
- [docs/QA-CHECKLIST.md](docs/QA-CHECKLIST.md) — pre-launch checklist
