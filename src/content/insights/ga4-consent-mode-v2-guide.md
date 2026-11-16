---
title: "Google Consent Mode v2 and GA4: A Clear Setup Guide for EU Websites"
description: "What Google Consent Mode v2 is, why EU and EEA websites need it, basic vs advanced mode, and a step-by-step setup with GA4 and Google Tag Manager — plus how to test it."
date: 2026-11-16
category: "Analytics & Tracking"
capability: data-intelligence
tool: tracking-checker
keywords: ["Consent Mode v2", "GA4 consent mode setup", "cookie consent GA4", "Google Tag Manager consent"]
faq:
  - q: "Is Consent Mode v2 mandatory?"
    a: "If you use Google advertising features or measurement for visitors in the EU/EEA, Google requires consent signals via Consent Mode v2. It is also the practical way to respect user choice while keeping measurement."
  - q: "What is the difference between basic and advanced Consent Mode?"
    a: "In basic mode, Google tags do not load until the user consents. In advanced mode, tags load with consent denied and send limited, cookieless signals that Google uses for modelling."
  - q: "Why does GA4 show fewer users after adding a cookie banner?"
    a: "Visitors who decline analytics are not measured with cookies. That is expected; Consent Mode modelling and good banner design reduce the gap without breaking the rules."
---

**Short answer:** Consent Mode v2 tells Google tags whether a visitor agreed to analytics and advertising storage. EU/EEA websites using Google Analytics 4 or Google Ads need it to measure compliantly. Set consent to *denied* by default, update it when the visitor chooses, and only then let tags store data.

## The four consent signals

- `analytics_storage` — cookies for analytics such as GA4
- `ad_storage` — cookies for advertising
- `ad_user_data` — sending user data to Google for advertising
- `ad_personalization` — personalised advertising (remarketing)

Version 2 added the last two, which is why older setups need an update.

## Basic vs advanced mode

- **Basic:** nothing Google-related loads until consent. Maximum privacy, less data.
- **Advanced:** tags load with consent denied and send cookieless pings that enable modelling. More data, but requires a careful legal review.

Many EU businesses choose basic mode for simplicity and certainty.

## Step-by-step setup

1. **Choose a consent banner** — a certified consent platform or a well-built custom banner.
2. **Set defaults before any tag loads**: all four signals `denied`.
3. **Update consent** when the visitor accepts, rejects or customises.
4. **Load GA4 and Tag Manager only when allowed** (basic mode) or with consent awareness (advanced mode).
5. **Offer a way to change the choice** at any time, for example a “Cookie settings” link in the footer.
6. **Document the setup** in your privacy policy, including a list of cookies.

## How to test it

- Open your site in a private window and check that no analytics cookies are set before consent.
- Accept and confirm in GA4 **Realtime** that your visit appears.
- Use Tag Assistant to see consent states and which tags fire.
- Reject and confirm nothing optional loads.

Our free [tracking & consent checker](/tools/tracking-checker/) shows which tags and consent signals a page exposes in its source.

## Common mistakes

- Setting defaults *after* tags load
- Adding GA4 twice (directly and in Tag Manager), which doubles every visit
- Banners without a real “reject” option
- Forgetting to update the privacy policy

Need it done properly? Our [analytics team](/capabilities/data-intelligence/) implements GA4, GTM and Consent Mode v2 — and monitors them live.
