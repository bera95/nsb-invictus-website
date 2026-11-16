---
title: "How to Get Your Business Mentioned in ChatGPT, Perplexity and AI Overviews"
description: "A practical GEO guide: how AI assistants choose sources, why some brands are cited and others ignored, and the concrete steps to improve your visibility in AI answers."
date: 2026-11-16
category: "Search & AI"
capability: search-visibility
tool: ai-crawler-checker
keywords: ["how to appear in ChatGPT", "get mentioned by AI", "AI search visibility", "GEO guide", "Perplexity SEO"]
faq:
  - q: "Can I pay to appear in ChatGPT answers?"
    a: "No — organic answers in AI assistants cannot be bought. Visibility comes from being crawlable, clearly described and cited by trustworthy sources."
  - q: "Should I block AI crawlers?"
    a: "Block training crawlers if you prefer, but allow AI search and assistant crawlers. If they cannot read your site, they cannot cite it."
  - q: "How do I measure AI visibility?"
    a: "Track referral traffic from AI tools in GA4, monitor brand mentions for your key questions across assistants, and watch impressions in Search Console for AI-overview-style queries."
---

**Short answer:** AI assistants cite businesses that they can *access*, *understand* and *trust*. Make sure AI search crawlers can read your site, describe your company and services consistently with structured data, publish specific, answer-first content, and earn mentions on other reputable sites.

## How AI assistants pick sources

When ChatGPT search, Perplexity, Copilot or Google’s AI overviews answer a question, they retrieve pages from the web and summarise them. Pages are more likely to be used when they:

- are **accessible** to the assistant’s crawler,
- **directly answer** the question asked,
- contain **specific facts** (definitions, steps, comparisons, prices, locations),
- come from a site with **clear identity and trust signals**.

## Step 1 — Let AI search crawlers in

Many websites block AI crawlers without realising it, often through a security plugin or a copied robots.txt. Distinguish between two groups:

- **Training crawlers** (for example GPTBot, Google-Extended, CCBot) collect data to train models. Blocking them does not remove you from AI search.
- **Search and assistant crawlers** (for example OAI-SearchBot, ChatGPT-User, PerplexityBot, Claude-SearchBot, Bingbot) fetch pages to answer questions in real time. Block these and you disappear from AI answers.

Check your current setup in seconds with our [free AI crawler checker](/tools/ai-crawler-checker/).

## Step 2 — Make your company unambiguous

AI models connect information about *entities*. Help them:

- Use the **same company name, description and location** everywhere.
- Add **Organization** (or LocalBusiness) schema with services, area served and contact options.
- Create clear pages for **each service**, each industry and your company story.
- Publish an **llms.txt** file listing your key pages.

## Step 3 — Write content that can be quoted

Assistants quote sentences that stand on their own. For each important question:

1. Use the question as a heading.
2. Answer it in the first two sentences.
3. Follow with detail: steps, examples, tables, pros and cons.
4. Add an FAQ section with FAQPage markup.

Avoid vague marketing language — “innovative solutions” gives a model nothing to cite.

## Step 4 — Earn mentions elsewhere

Assistants trust what multiple sources agree on. Business directories, industry publications, partner pages, reviews and expert contributions all reinforce your entity.

## Step 5 — Measure and iterate

- In GA4, watch sessions referred by AI tools (for example chatgpt.com or perplexity.ai).
- Regularly ask assistants your customers’ real questions and note who is cited.
- Update pages that are close but not yet cited with clearer answers and fresher detail.

GEO is still young, which is an advantage: businesses that build these foundations now are the ones AI assistants will keep recommending. Our [search & AI visibility team](/capabilities/search-visibility/) can run the full process for you.
