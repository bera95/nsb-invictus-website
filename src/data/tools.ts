/**
 * Free tools — lead-generating utilities that run on our own PHP endpoint (api/tools.php)
 * or fully in the browser. Add a tool here to create its page, navigation entry and sitemap URL.
 */
import type { CapabilitySlug } from './capabilities';

export type ToolSlug = 'website-audit' | 'ai-crawler-checker' | 'security-headers' | 'email-deliverability' | 'tracking-checker' | 'serp-preview';

export interface Tool {
  slug: ToolSlug;
  api: 'audit' | 'ai-crawlers' | 'headers' | 'email' | 'tracking' | 'client';
  name: string;
  short: string;
  badge?: string;
  input: 'url' | 'domain' | 'serp';
  placeholder: string;
  description: string;
  howItWorks: string[];
  capability: CapabilitySlug;
  gated?: boolean;
  faq: { q: string; a: string }[];
  seo: { title: string; description: string };
}

export const tools: Tool[] = [
  {
    slug: 'website-audit',
    api: 'audit',
    name: 'Website SEO, AEO & GEO Audit',
    short: 'Score your site for search, AI answers, speed, security and tracking — in seconds.',
    badge: 'Most popular',
    input: 'url',
    placeholder: 'yourwebsite.com',
    description:
      'Run 30+ live checks on any page: on-page SEO, structured data, answer-engine readiness, AI crawler access, server speed, security headers, analytics and cookie consent. You get an overall score, category scores and the most important issues — free.',
    howItWorks: ['Enter any public web address', 'Our server fetches the page and its robots.txt live', 'You get a score, category breakdown and top issues instantly', 'Unlock the full report with fix recommendations from our team'],
    capability: 'search-visibility',
    gated: true,
    faq: [
      { q: 'Is the website audit really free?', a: 'Yes. The score, category scores and the most important issues are free. The full report with every finding and recommended fixes is prepared by our team when you request it.' },
      { q: 'What does the audit check?', a: 'Title and meta tags, headings, canonical and indexability, mobile viewport, image alt text, content depth, Open Graph, schema.org structured data, FAQ and answer readiness, AI crawler access, llms.txt, robots.txt and sitemap, response time, compression, HTTPS and security headers, analytics tags and cookie consent.' },
      { q: 'Does the audit store my website data?', a: 'No page content is stored. We keep only a short-lived, anonymised counter to prevent abuse.' },
    ],
    seo: {
      title: 'Free Website Audit — SEO, AEO & GEO Checker',
      description: 'Free live website audit: 30+ checks for SEO, AI-search readiness (AEO & GEO), structured data, speed, security headers, analytics and cookie consent. Instant score.',
    },
  },
  {
    slug: 'ai-crawler-checker',
    api: 'ai-crawlers',
    name: 'AI Crawler Access Checker',
    short: 'Can ChatGPT, Claude, Perplexity and Gemini read your website?',
    badge: 'GEO',
    input: 'url',
    placeholder: 'yourwebsite.com',
    description:
      'Check your robots.txt against the crawlers used by AI assistants and search engines — GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot, Google-Extended, Bingbot and more. Blocked crawlers mean your brand may be missing from AI answers.',
    howItWorks: ['Enter your domain', 'We fetch and parse your robots.txt live', 'See which AI and search crawlers are allowed or blocked'],
    capability: 'search-visibility',
    faq: [
      { q: 'Should I allow AI crawlers?', a: 'If you want to appear in AI assistants such as ChatGPT search, Perplexity or Copilot, their search crawlers must be able to read your site. Training crawlers can be blocked separately if you prefer — the right setup depends on your goals.' },
      { q: 'What is GEO?', a: 'Generative engine optimisation (GEO) improves how often and how accurately AI assistants mention and cite your brand. Crawler access is the first technical requirement.' },
    ],
    seo: {
      title: 'AI Crawler Checker — Is Your Site Visible to ChatGPT & AI?',
      description: 'Free AI crawler access checker: see whether GPTBot, ClaudeBot, PerplexityBot, Google-Extended and other AI crawlers can access your website via robots.txt.',
    },
  },
  {
    slug: 'security-headers',
    api: 'headers',
    name: 'Security Headers Checker',
    short: 'Grade your website’s HTTP security headers from A to F.',
    input: 'url',
    placeholder: 'yourwebsite.com',
    description:
      'Test HTTPS, HSTS, Content-Security-Policy, clickjacking protection, X-Content-Type-Options, Referrer-Policy, Permissions-Policy and server version disclosure — with a clear grade and explanation for each header.',
    howItWorks: ['Enter a web address', 'We request it and analyse the response headers', 'Get a grade with an explanation for every header'],
    capability: 'cloud-platform',
    faq: [
      { q: 'Why do security headers matter?', a: 'Security headers tell browsers how to protect your visitors — for example by enforcing HTTPS, blocking clickjacking and limiting injected scripts. They are quick to add and close common attack paths.' },
      { q: 'Is an A grade enough to be secure?', a: 'No — headers are one layer. A full security review also covers the application, server configuration, dependencies, authentication and backups.' },
    ],
    seo: {
      title: 'Free Security Headers Checker — HSTS, CSP & More',
      description: 'Free security headers test: grade HTTPS, HSTS, Content-Security-Policy, X-Frame-Options, Referrer-Policy and Permissions-Policy for any website.',
    },
  },
  {
    slug: 'email-deliverability',
    api: 'email',
    name: 'Email Deliverability Checker',
    short: 'Check SPF, DMARC and MX records — and why your emails land in spam.',
    input: 'domain',
    placeholder: 'yourdomain.com',
    description:
      'Look up your domain’s live DNS records: mail servers (MX), SPF, DMARC policy and BIMI. Missing or weak records are a common reason emails go to spam — and Gmail and Yahoo now require them for bulk senders.',
    howItWorks: ['Enter your email domain', 'We query its public DNS records live', 'See what is configured and what is missing'],
    capability: 'cloud-platform',
    faq: [
      { q: 'What are SPF and DMARC?', a: 'SPF lists the servers allowed to send email for your domain. DMARC tells receiving servers what to do with messages that fail authentication and sends you reports. Together they protect your domain from spoofing and improve deliverability.' },
      { q: 'Why is DKIM not shown?', a: 'DKIM records are published under a selector name that only your email provider knows, so they cannot be discovered from the domain alone. We check DKIM as part of a full review.' },
    ],
    seo: {
      title: 'Free Email Deliverability Checker — SPF, DMARC & MX',
      description: 'Free email deliverability test: check MX, SPF, DMARC and BIMI DNS records for your domain and find out why emails may land in spam.',
    },
  },
  {
    slug: 'tracking-checker',
    api: 'tracking',
    name: 'Tracking & Consent Checker',
    short: 'Detect GA4, Google Tag Manager, pixels and cookie consent on any site.',
    input: 'url',
    placeholder: 'yourwebsite.com',
    description:
      'See which analytics and marketing tags a page loads — Google Tag Manager, GA4, Google Ads, Meta Pixel, LinkedIn, TikTok, Clarity, Hotjar — and whether a cookie consent platform and Google Consent Mode are present.',
    howItWorks: ['Enter a web address', 'We scan the page source live', 'See detected tags, IDs and consent setup'],
    capability: 'data-intelligence',
    faq: [
      { q: 'Why does the checker not find my GA4 tag?', a: 'The checker reads the page source. Tags loaded later — for example by Google Tag Manager or only after cookie consent — may not appear. That is often correct behaviour; a full tracking audit verifies what fires in the browser.' },
      { q: 'Do I need Google Consent Mode v2?', a: 'If you have visitors from the EU/EEA and use Google Analytics or Google Ads, Consent Mode v2 is required to measure compliantly and keep advertising features.' },
    ],
    seo: {
      title: 'Free GA4, GTM & Cookie Consent Checker',
      description: 'Free tracking checker: detect Google Tag Manager, GA4, Google Ads, Meta Pixel and other tags, plus cookie consent and Google Consent Mode on any website.',
    },
  },
  {
    slug: 'serp-preview',
    api: 'client',
    name: 'SERP Snippet Preview',
    short: 'Preview how your title and description appear in Google — with pixel limits.',
    input: 'serp',
    placeholder: '',
    description:
      'Write and test your page title and meta description with a live Google-style preview, pixel-width measurement and truncation warnings — on desktop and mobile. Runs entirely in your browser.',
    howItWorks: ['Type a title, description and URL', 'See the live search snippet as you type', 'Adjust until nothing is truncated'],
    capability: 'search-visibility',
    faq: [
      { q: 'How long should a title tag be?', a: 'Google truncates titles by pixel width, roughly 580 px on desktop — usually 50–60 characters. Put the most important words first.' },
      { q: 'Does Google always use my meta description?', a: 'Not always. Google may rewrite snippets to match the search query, but a clear, relevant description is used more often and improves click-through rate.' },
    ],
    seo: {
      title: 'Free SERP Snippet Preview — Title & Meta Description Tool',
      description: 'Free SERP preview tool: test your title tag and meta description with live Google-style preview, pixel width measurement and truncation warnings.',
    },
  },
];

export const getTool = (slug: string) => tools.find((t) => t.slug === slug);
