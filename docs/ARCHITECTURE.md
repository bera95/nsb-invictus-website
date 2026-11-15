# Architecture & decisions

## Environments

| Layer | Where | What |
|---|---|---|
| Development | Local machine | `npm run dev` (Astro dev server), `npm run preview` (built site + PHP) |
| Build | GitHub Actions (or locally) | `astro build` → static HTML/CSS/JS in `dist/`, `npm run verify`, plus PHPMailer via Composer on publish |
| Production hosting | Hostinger Premium | Static files served by LiteSpeed/Apache; `api/inquiry.php` runs on the plan's PHP |
| Frontend rendering | Build time | Every page is pre-rendered HTML. JavaScript only enhances (3D, tabs, form UX) |
| Backend functionality | `api/inquiry.php` | Validation, spam protection, rate limiting, email notification. No database |
| External integrations | Optional | SMTP (Hostinger mail), Cloudflare Turnstile, cookieless analytics |

## Key decisions

**Astro, static output.** The site is content-led, so pre-rendered HTML gives the best SEO, the fastest first paint and zero server requirements. Astro ships no framework runtime. Interactive parts are small, isolated scripts.

**No Node.js in production.** Hostinger Premium does not run Node.js apps (that is Business and Cloud). Nothing on this site needs it.

**PHP only for the form.** Sending email requires a server-side secret (the SMTP password). A ~200-line PHP file on the existing plan is simpler, cheaper and more private than a third-party form service.

**GSAP removed after validation.** GSAP was approved in principle. In the implementation, all scroll choreography is driven by one CSS variable (`--p`) and a scroll-to-scene mapping of about 60 lines, so GSAP would have added about 30 KB gzipped for no visible benefit. It can be reintroduced if future pages need complex timelines.

**three.js without React Three Fiber.** One shader-driven `Points` system and a few `LineSegments`. React would add runtime weight without adding capability.

**Self-hosted fonts.** Space Grotesk (display), Inter (body) and JetBrains Mono (labels) are bundled at build time. No requests to Google, which simplifies GDPR compliance.

## The Living Architecture system

`src/scripts/architecture/`

- `shapes.ts` — a library of point structures (vision, architecture, ecosystem, building, neural, modules, terrain, strata, radiance). Every shape has exactly N points, sampled along line segments, so any shape can morph into any other. Generation is deterministic (seeded PRNG).
- `engine.ts` — the WebGL renderer. A custom vertex shader interpolates between two shapes with a **per-point delay**, so structures assemble progressively instead of cross-fading. Points in transit lift and brighten. Colour follows the brand narrative: violet (vision) → cyan (structure) → emerald accents (reality). A shape's line segments fade in only once its points have settled.
- `mount.ts` — two modes:
  - `scroll` (homepage): sections declare `data-scene`, `data-dim` and `data-offset`. Each scene holds steady while its section is in view, and morphs in the gaps between sections.
  - `intro` (inner pages): assembles once on load into that page's shape.

### Performance safeguards

- three.js loads after `requestIdleCallback`, so it never blocks first paint or LCP. The engine chunk is about 133 KB gzipped.
- 14,000 points on desktop and 6,500 on small or low-core devices. Pixel ratio is capped at 1.75 (1.5 on mobile).
- Rendering pauses when the canvas is off-screen or the tab is hidden.
- `prefers-reduced-motion`: no animation loop. The scene renders statically, and the hero is not scroll-pinned.
- No WebGL: a static SVG/CSS architectural illustration stays in place.

## SEO

- Unique `<title>`/description per page, canonical URLs, Open Graph and Twitter cards.
- JSON-LD: `Organization` (all pages), `WebSite` (home), `Service` (capability and industry pages), `BreadcrumbList`.
- `sitemap-index.xml` generated at build time. `robots.txt` gets an absolute sitemap URL in post-build.
- Trailing-slash URLs everywhere, enforced by `.htaccess`.

## Privacy, consent & analytics

`src/components/layout/CookieConsent.astro` sets Google Consent Mode v2 defaults to *denied* before anything else, shows a banner (Accept all / Reject optional / Customise), stores the choice in `localStorage` (`nsb-consent`, 12 months) and loads Google Tag Manager (`site.gtmId`) **only after** analytics or marketing consent. The footer "Cookie settings" button reopens it. GA4 is configured inside GTM with a Google tag. The CSP in `public/.htaccess` allows the Google Tag Manager and Google Analytics endpoints.

## Motion layer

- `AmbientLayer.astro` + `scripts/ambient.ts` — drifting neon orbs, data packets that link into constellations, and comets. A 2D canvas on every page, paused when the tab is hidden.
- `scripts/effects.ts` — cursor glow, card spotlight, 3D tilt (`data-tilt`), magnetic buttons, text scramble on eyebrows, and a scroll progress bar.
- `global.css` "NEON & MOTION LAYER" — neon gradient text, glitch (`.glitch` + `data-text`), animated conic neon frames (`.neon-frame`), button shine, neon grid floor and cross-document view transitions.
- With `prefers-reduced-motion`, every decorative animation is disabled.
