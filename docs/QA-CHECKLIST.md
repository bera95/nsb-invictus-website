# Pre-launch QA checklist

## Content
- [ ] All `PLACEHOLDER` items resolved (see README), then `site.showPlaceholders = false`
- [ ] Contact email, company details and jurisdiction correct on `/contact/`, `/legal/` and `/privacy/`
- [ ] Privacy policy effective date current; company details filled in once registered
- [ ] Products listed only with accurate statuses
- [ ] No invented clients, statistics, awards or partnerships anywhere

## Functionality
- [ ] Contact form: valid submission arrives by email, with Reply-To set to the sender
- [ ] Contact form: invalid fields show an error; honeypot and rate limit work
- [ ] Topic preselection works (`/contact/?topic=ai-automation`)
- [ ] Mobile menu opens and closes (button, Escape, link click)
- [ ] Capability ecosystem: click, hover, arrow keys, Home/End
- [ ] 360° tour starts once a panorama is configured

## Visual / responsive
- [ ] Check at 360, 390, 768, 1024, 1280, 1440 and 1920 px widths
- [ ] Homepage scroll assembly is smooth on a mid-range phone
- [ ] No horizontal scrolling on any page
- [ ] Reduced motion (OS setting): no pinned hero and no animation loop; content fully readable
- [ ] WebGL disabled: static fallback illustration shown

## Free tools & protection
- [ ] Website audit on a real site: score, categories, 3 findings visible, rest locked; "full report" lead email arrives
- [ ] AI crawler, security headers, email and tracking checks return results for a real domain
- [ ] Browser tools work: UTM builder, word counter, password generator, image compressor
- [ ] After a scan the page stays at the top of the results
- [ ] Page text cannot be selected or copied; URL fields accept paste; "Copy results" works
- [ ] `/api/tools.php` opened directly in the browser returns an error (POST + header required)

## Accessibility
- [ ] Automated audit (axe) — 0 violations on all 29 pages *(passing at the time of handover)*
- [ ] Keyboard-only navigation through every page, with visible focus
- [ ] Skip link works
- [ ] Screen reader check of navigation, tabs and form

## SEO & technical
- [ ] `npm run verify` passes (canonicals and sitemap use https://nsbinvictus.tech)
- [ ] `/sitemap-index.xml` and `/robots.txt` load
- [ ] Submit the sitemap in Google Search Console
- [ ] Structured data validates (Rich Results Test)
- [ ] OG image previews correctly (LinkedIn Post Inspector)
- [ ] HTTPS redirect and canonical-host redirect active
- [ ] Security headers present (securityheaders.com)
- [ ] Lighthouse: Performance ≥ 90 on mobile; Accessibility, Best Practices and SEO ≥ 95
- [ ] `/api/config.php` and `/api/vendor/` are not reachable from the browser
- [ ] `npm run check` passes with 0 errors
