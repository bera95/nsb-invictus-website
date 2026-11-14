# CLAUDE.md — NSB INVICTUS website

Static Astro site + one PHP endpoint, hosted on Hostinger Premium (no Node.js in production).
Production domain: https://nsbinvictus.tech

## Commands
- `npm run dev` — dev server (http://localhost:4321). The PHP form does not run here.
- `npm run build` — build into `dist/` (`astro build` + `scripts/postbuild.mjs`).
- `npm run verify` — checks `dist/` is a safe, complete public_html payload (required files, no source or secrets, all internal links resolve, canonical domain). Run after every build.
- `npm run preview` — serves `dist/` with `php -S` so the contact form works (http://localhost:4322).
- `npm run check` — TypeScript and Astro diagnostics. Must report 0 errors.

## Where things live
- All content and configuration: `src/data/*.ts` (site, capabilities, industries, products, approach). Pages are generated from these files — edit data, not page markup.
- Design tokens: `src/styles/global.css` (`@theme`).
- 3D "Living Architecture": `src/scripts/architecture/` (shapes, engine, mount). Homepage sections drive it with `data-scene` / `data-dim` / `data-offset`.
- PHP endpoint: `public/api/inquiry.php`. It reads config ONLY from `<public_html>/../private/nsb-config.php`.

## Rules
- Never commit secrets. `private/`, `.env*`, `public/api/config.php` and `api/vendor/` are git-ignored. Local test config goes in `private/nsb-config.php` with `'log_only' => true`.
- Do not invent clients, statistics, awards, partnerships or products. Product statuses must be accurate.
- Keep yellow `<Placeholder>` markers for information the client has not supplied yet.
- Internal links use trailing slashes (`/capabilities/`).
- Preserve accessibility: axe with 0 violations, `prefers-reduced-motion` support, and the no-WebGL fallback.
- Pushing to `main` only runs CI. Publishing to the `production` branch is manual (the "Publish production" workflow). Never publish or deploy without the owner's explicit instruction.
- Tone: confident, precise international English (British spelling); no hype.
