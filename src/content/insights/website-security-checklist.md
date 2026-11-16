---
title: "Website Security Checklist: 15 Checks Every Business Site Needs"
description: "A practical website security checklist for business owners: HTTPS, security headers, updates, backups, access control, forms, monitoring and GDPR — with free tools to test your site."
date: 2026-11-16
category: "Security & Cloud"
capability: cloud-platform
tool: security-headers
keywords: ["website security checklist", "secure business website", "security headers", "website hacked prevention"]
faq:
  - q: "How do I know if my website is secure?"
    a: "Start with HTTPS and security headers, check that all software is up to date, review who has admin access and confirm you have tested backups. A professional audit covers server, application and data handling in depth."
  - q: "Do small business websites get hacked?"
    a: "Yes. Most attacks are automated and target known vulnerabilities and weak passwords, regardless of company size."
  - q: "What should I do if my site is hacked?"
    a: "Take it offline or into maintenance mode, change all passwords, restore a clean backup, patch the vulnerability that was exploited and review logs to understand what happened."
---

**Short answer:** most website attacks are automated and exploit the basics — outdated software, weak passwords, missing HTTPS and misconfigured servers. Work through the checklist below, test with free tools, and schedule a professional review at least once a year.

## Connection and headers

1. **HTTPS everywhere**, with automatic redirect from HTTP.
2. **HSTS** so browsers never fall back to HTTP.
3. **Content-Security-Policy** to limit injected scripts.
4. **Clickjacking protection** (X-Frame-Options or frame-ancestors).
5. **X-Content-Type-Options, Referrer-Policy and Permissions-Policy.**

Test these instantly with our [security headers checker](/tools/security-headers/).

## Software and access

6. **Update** CMS, plugins, themes, libraries and server software promptly.
7. **Remove** unused plugins, themes, test pages and old admin accounts.
8. **Strong, unique passwords** and a password manager — try our [password generator](/tools/password-generator/).
9. **Two-factor authentication** on hosting, domain, CMS, email and code repositories.
10. **Least privilege** — give each person only the access they need.

## Data, forms and email

11. **Protect forms** against spam and abuse with server-side validation, rate limits and bot checks.
12. **Keep secrets out of public folders** — configuration files and keys belong outside the web root.
13. **Authenticate your email domain** with SPF, DKIM and DMARC — check it with our [email deliverability checker](/tools/email-deliverability/).

## Recovery and monitoring

14. **Automatic, off-site backups** — and test that you can actually restore them.
15. **Monitoring and alerts** for uptime, file changes and unusual login activity.

## Do not forget compliance

Security and privacy go together: a cookie consent banner, a clear privacy policy and secure handling of personal data are part of a professional website in the EU.

Want a full review? Our [cloud, security & compliance team](/capabilities/cloud-platform/) audits and hardens websites, applications and infrastructure.
