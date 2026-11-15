# Security & content protection

## What is in place
| Layer | Protection |
|---|---|
| Web server (`public/.htaccess`) | HTTPS + HSTS, strict Content-Security-Policy, clickjacking, MIME-sniffing and cross-origin policies; hidden server headers; blocked TRACE/PUT/DELETE; no directory listing; hidden/config/backup/source files return 403; website copiers, vulnerability scanners and abusive scrapers blocked by user agent; common attack probes (CMS admin scans, path traversal, SQL/script injection) blocked; hotlink protection for images and fonts |
| Crawlers (`public/robots.txt`) | Search engines and AI *search/assistant* crawlers allowed (needed for SEO and GEO); AI *training* crawlers (GPTBot, Google-Extended, ClaudeBot, CCBot, Applebot-Extended, Bytespider, Meta-ExternalAgent, cohere-ai, Diffbot, Omgilibot) disallowed |
| Contact form (`api/inquiry.php`) | Same-origin check, honeypot, timing check, bot user-agent filter, max 3 links per message, hourly rate limit per hashed IP, config outside `public_html` |
| Free tools (`api/tools.php`) | Same-origin + custom header + JSON only, bot filter, SSRF protection (public IPs only, pinned DNS, validated redirects, ports 80/443), size/time limits, hourly (30) and daily (80) limits per visitor, results gated server-side |
| Content | Text and images cannot be selected, copied, dragged or saved via the context menu; view-source/save/print shortcuts disabled; printing disabled. Form fields, tool results and contact details remain copyable; "Copy results" button on tools |
| Technology fingerprints | Neutral hashed asset names (`/_a/…`), framework attributes renamed, library banners and HTML comments stripped at build time, no source maps, `X-Powered-By` removed |
| Disclosure | `/.well-known/security.txt` |

## Honest limits
- Copy protection is a **deterrent**. Anything a browser displays can still be captured by a determined person (screenshots, developer tools). The real protection for your valuable logic is that it runs **server-side** (PHP endpoints, SEODREAM), where visitors never see it.
- User-agent blocking stops lazy bots, not targeted attackers who fake a browser.

## Strongly recommended next step: Cloudflare (free plan)
Put the domain behind Cloudflare (change the nameservers in Hostinger to the two Cloudflare gives you):
1. **Bot Fight Mode** on (Security → Bots).
2. **WAF managed rules** on (free set).
3. **Rate limiting rule**: `/api/*` → max 20 requests per minute per IP.
4. **Turnstile** for forms: add the site key to the GitHub variable `PUBLIC_TURNSTILE_SITE_KEY` and the secret to `nsb-config.php` (`turnstile_secret`) — already supported by the code.
5. SSL/TLS mode **Full (strict)**.

## Local-only settings — never in production
`tools_allow_private` and `allow_automation` in `nsb-config.php` must stay `false` on Hostinger.
