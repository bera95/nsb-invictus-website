/**
 * Capability (service) architecture — single source of truth for navigation,
 * the homepage ecosystem, capability landing pages, FAQ schema and the inquiry form.
 */
import type { ShapeName } from '../scripts/architecture/shapes';

export type CapabilitySlug =
  | 'ai-automation'
  | 'search-visibility'
  | 'software-engineering'
  | 'data-intelligence'
  | 'cloud-platform'
  | 'digital-growth';

export interface Capability {
  slug: CapabilitySlug;
  index: string;
  name: string;
  shortName: string;
  shape: ShapeName;
  accent: string;
  summary: string;
  headline: string;
  intro: string;
  offerings: { title: string; text: string }[];
  problems: string[];
  outcomes: string[];
  connections: { to: CapabilitySlug; label: string }[];
  faq: { q: string; a: string }[];
  seo: { title: string; description: string };
}

export const capabilities: Capability[] = [
  {
    slug: 'ai-automation',
    index: '01',
    name: 'AI, Agents & Automation',
    shortName: 'AI & Agents',
    shape: 'neural',
    accent: '#a996ff',
    summary: 'AI agents, LLM integrations and intelligent automation built into real business workflows — not demos.',
    headline: 'AI that does real work inside your business.',
    intro:
      'We design and build AI systems around concrete processes. That means grounding large language models in your own data, connecting agents to the tools your teams already use, and adding the evaluation and controls needed to run them responsibly in production.',
    offerings: [
      { title: 'AI agents', text: 'Task-oriented agents that research, draft, triage and act across your systems, with human review where it matters.' },
      { title: 'LLM integrations', text: 'Language models connected to your documents, databases and applications — including retrieval-augmented generation (RAG).' },
      { title: 'Intelligent automation', text: 'End-to-end automation of document handling, data entry, routing and approvals that previously required manual work.' },
      { title: 'AI-powered workflows', text: 'Business processes redesigned so AI handles the routine steps and people handle the decisions.' },
      { title: 'Custom AI tools', text: 'Purpose-built assistants, classifiers, search and extraction systems for a specific business problem.' },
      { title: 'Evaluation & guardrails', text: 'Testing, monitoring and access controls that make AI behaviour measurable, predictable and auditable.' },
    ],
    problems: [
      'Teams spend hours on repetitive document, email and data tasks.',
      'Company knowledge is scattered and hard to search.',
      'AI pilots never made it into day-to-day operations.',
    ],
    outcomes: ['Fewer manual steps per process', 'Faster response and turnaround times', 'Knowledge that is searchable and reusable'],
    connections: [
      { to: 'data-intelligence', label: 'AI is only as good as the data it is grounded in.' },
      { to: 'software-engineering', label: 'Models become useful when embedded in real applications.' },
      { to: 'cloud-platform', label: 'Secure, governed infrastructure to run AI in production.' },
      { to: 'search-visibility', label: 'AI-assisted research, content operations and GEO.' },
    ],
    faq: [
      { q: 'What is an AI agent?', a: 'An AI agent is software that uses a language model to plan and carry out multi-step tasks — such as researching, drafting, classifying or updating records — by calling the tools and systems it is given access to, with human approval where needed.' },
      { q: 'Can AI work with our own company data securely?', a: 'Yes. We connect models to your data through controlled interfaces, apply access permissions, and choose hosting and model providers that match your security and data-residency requirements.' },
      { q: 'How do you start an AI project?', a: 'Usually with a short discovery phase: we identify the processes where AI saves the most time, build a focused pilot, measure the results, and then scale what works.' },
    ],
    seo: {
      title: 'AI Agents, LLM Integration & Intelligent Automation',
      description: 'Custom AI agents, LLM integrations, RAG and intelligent automation designed around real business workflows — built for production with evaluation and guardrails.',
    },
  },
  {
    slug: 'search-visibility',
    index: '02',
    name: 'Search, AI & Local Visibility',
    shortName: 'SEO · AEO · GEO',
    shape: 'beacon',
    accent: '#ff4fd8',
    summary: 'SEO, AEO and GEO: visibility in Google, in AI assistants and in local search — across Europe, the US, Canada and beyond.',
    headline: 'Be the answer — on Google, in AI assistants and on the map.',
    intro:
      'Search has split into many surfaces: classic results, featured answers, AI overviews, chat assistants and local maps. We optimise for all of them at once — technically, editorially and locally — and measure visibility with our own proprietary search intelligence tools.',
    offerings: [
      { title: 'Technical SEO', text: 'Crawlability, indexation, site speed, Core Web Vitals, structured data and site architecture — fixed at the source.' },
      { title: 'Content & on-page SEO', text: 'Keyword and intent research, content strategy and on-page optimisation that build topical authority.' },
      { title: 'AEO — answer engine optimisation', text: 'Content structured to win featured snippets, “People also ask”, voice answers and AI overviews.' },
      { title: 'GEO — generative engine optimisation', text: 'Visibility and accurate brand representation in ChatGPT, Gemini, Perplexity, Copilot and other AI assistants.' },
      { title: 'Local & international SEO', text: 'Google Business Profile, local citations, multi-location and multilingual (hreflang) SEO for Europe, the US and Canada.' },
      { title: 'Search intelligence & reporting', text: 'Rank, AI-visibility and competitor tracking with our proprietary SEODREAM platform, plus clear reporting.' },
    ],
    problems: [
      'Competitors appear in search results and AI answers — you do not.',
      'Traffic dropped after algorithm or AI-overview changes.',
      'You serve several countries or cities but rank in none of them.',
    ],
    outcomes: ['Higher qualified organic visibility', 'Presence in AI-generated answers', 'Local visibility in every target market'],
    connections: [
      { to: 'data-intelligence', label: 'Search Console, GA4 and tracking that prove the impact.' },
      { to: 'software-engineering', label: 'Fast, crawlable websites built for search from day one.' },
      { to: 'digital-growth', label: 'Content and brand that earn links and citations.' },
      { to: 'ai-automation', label: 'AI-assisted research and content operations at scale.' },
    ],
    faq: [
      { q: 'What is the difference between SEO, AEO and GEO?', a: 'SEO (search engine optimisation) improves rankings in classic search results. AEO (answer engine optimisation) structures content so search engines and voice assistants can use it as a direct answer. GEO (generative engine optimisation) improves how often and how accurately AI assistants such as ChatGPT, Gemini and Perplexity mention and cite your brand.' },
      { q: 'Do you do local SEO outside Serbia?', a: 'Yes. We work internationally — across Europe, the United States, Canada and other markets — including Google Business Profile optimisation, local citations and multilingual SEO with correct hreflang setup.' },
      { q: 'How long does SEO take to show results?', a: 'Technical fixes can show impact within weeks; content and authority typically build over several months. We agree measurable milestones up front and report against them.' },
    ],
    seo: {
      title: 'SEO, AEO & GEO Services — Search, AI and Local Visibility',
      description: 'Technical SEO, content SEO, answer engine optimisation (AEO), generative engine optimisation (GEO) and local SEO for Europe, the US and Canada — powered by proprietary search tools.',
    },
  },
  {
    slug: 'software-engineering',
    index: '03',
    name: 'Websites, Apps & SaaS',
    shortName: 'Web, Apps & SaaS',
    shape: 'modules',
    accent: '#7fe6f6',
    summary: 'Websites, web and mobile applications, SaaS platforms and e-commerce tools — engineered to be fast, secure and scalable.',
    headline: 'Websites and software engineered to last, not just to launch.',
    intro:
      'From high-performance company websites to complex SaaS platforms, we take products from requirements to production. We favour clear architecture, automated testing and documentation, so what we build remains an asset you can extend.',
    offerings: [
      { title: 'Websites', text: 'Fast, accessible, search-ready company websites and landing pages with modern frameworks or a CMS.' },
      { title: 'Web applications', text: 'Portals, dashboards and internal tools built around how your organisation actually works.' },
      { title: 'Mobile apps', text: 'Cross-platform iOS and Android applications that share code and design with the web.' },
      { title: 'SaaS platforms', text: 'Multi-tenant products with subscriptions, permissions and administration designed in from day one.' },
      { title: 'E-commerce & commerce tools', text: 'Online stores, headless commerce and custom tools for catalogues, pricing, inventory and orders.' },
      { title: 'APIs & integrations', text: 'Robust APIs and integrations that connect CRMs, ERPs, payment providers and third-party services.' },
    ],
    problems: [
      'Your website is slow, outdated or hard to update.',
      'Operations depend on spreadsheets and manual hand-offs.',
      'A product idea needs to become a working, testable release.',
    ],
    outcomes: ['A fast, modern digital presence', 'Shorter time from idea to release', 'Code you own, documented and maintainable'],
    connections: [
      { to: 'ai-automation', label: 'Intelligent features built directly into the product.' },
      { to: 'cloud-platform', label: 'Secure hosting, CI/CD and infrastructure designed alongside the code.' },
      { to: 'search-visibility', label: 'Technical SEO and structured data built in from the start.' },
      { to: 'data-intelligence', label: 'Analytics and event tracking implemented correctly at launch.' },
    ],
    faq: [
      { q: 'Do you build websites or only complex software?', a: 'Both. We build company websites and landing pages as well as web applications, mobile apps, SaaS platforms and e-commerce systems.' },
      { q: 'Who owns the code?', a: 'You do. Source code, documentation and infrastructure access are handed over — there is no artificial lock-in.' },
      { q: 'Can you take over an existing project?', a: 'Yes. We start with a technical review of the codebase and infrastructure, then propose a plan to stabilise, improve or rebuild where it makes sense.' },
    ],
    seo: {
      title: 'Website, Web App, Mobile App & SaaS Development',
      description: 'Website development, web and mobile applications, SaaS platforms, e-commerce tools and API integrations — engineered for performance, security and scale.',
    },
  },
  {
    slug: 'data-intelligence',
    index: '04',
    name: 'Analytics, Tracking & Data',
    shortName: 'Analytics & Data',
    shape: 'terrain',
    accent: '#5fdcb0',
    summary: 'GA4, Google Tag Manager, Search Console, consent mode, live dashboards and conversion analysis — data you can trust.',
    headline: 'Tracking you can trust. Insight you can act on.',
    intro:
      'Most analytics setups are incomplete, inconsistent or non-compliant. We implement GA4, Google Tag Manager, Search Console and consent mode correctly, connect them in live dashboards, and use our proprietary analytics platform to detect and resolve issues continuously.',
    offerings: [
      { title: 'GA4 implementation & audits', text: 'Clean Google Analytics 4 properties with meaningful events, conversions and audiences — or a full audit of your existing setup.' },
      { title: 'Google Tag Manager', text: 'Structured, documented GTM containers with server-side tagging where it adds value.' },
      { title: 'Consent mode & cookie compliance', text: 'Cookie consent banners and Google Consent Mode v2 configured to meet GDPR requirements without losing measurement.' },
      { title: 'Search Console & search data', text: 'Search Console setup, indexing monitoring and search performance analysis combined with analytics data.' },
      { title: 'Live dashboards & BI', text: 'Real-time dashboards that combine analytics, search, advertising and business data in one view.' },
      { title: 'Analysis & CRO', text: 'Funnel analysis, experimentation and conversion rate optimisation that turn insight into revenue.' },
    ],
    problems: [
      'Analytics numbers do not match reality — or each other.',
      'Cookie consent is missing, broken or blocking measurement.',
      'Reporting is manual, slow and nobody trusts it.',
    ],
    outcomes: ['Accurate, compliant tracking', 'Live dashboards instead of manual reports', 'Issues found before they cost money'],
    connections: [
      { to: 'search-visibility', label: 'Search Console and analytics data for SEO decisions.' },
      { to: 'ai-automation', label: 'AI-assisted anomaly detection and analysis.' },
      { to: 'cloud-platform', label: 'Server-side tagging and privacy-safe infrastructure.' },
      { to: 'digital-growth', label: 'Attribution and campaign performance measurement.' },
    ],
    faq: [
      { q: 'What is Google Consent Mode v2 and do I need it?', a: 'Consent Mode v2 tells Google tags whether a visitor has agreed to analytics and advertising storage. For websites with visitors from the EU and EEA it is required to keep using Google advertising features and to measure compliantly.' },
      { q: 'Can you audit our existing GA4 and GTM setup?', a: 'Yes. We review data quality, events, conversions, consent configuration and tag governance, then deliver a prioritised list of fixes — and can implement them.' },
      { q: 'What is a live analytics dashboard?', a: 'A continuously updated view that combines sources such as GA4, Search Console, advertising platforms and consent status, so you can see performance and problems without building reports manually.' },
    ],
    seo: {
      title: 'GA4, Google Tag Manager, Consent Mode & Analytics Dashboards',
      description: 'GA4 and Google Tag Manager implementation and audits, Consent Mode v2 and cookie compliance, Search Console, live dashboards and conversion rate optimisation.',
    },
  },
  {
    slug: 'cloud-platform',
    index: '05',
    name: 'Cloud, Security & Compliance',
    shortName: 'Cloud & Security',
    shape: 'strata',
    accent: '#7c5cff',
    summary: 'Cloud architecture, DevOps, website and application security, and privacy compliance — systems that stay fast, safe and lawful.',
    headline: 'Secure, compliant infrastructure that never gets in the way.',
    intro:
      'We design cloud foundations that are secure by default, observable and sized to real demand — and we harden the websites and applications running on them. Security and privacy compliance are part of the architecture, not an afterthought.',
    offerings: [
      { title: 'Cloud architecture', text: 'Well-structured environments on major cloud providers, designed around security, resilience and cost.' },
      { title: 'DevOps & CI/CD', text: 'Automated build, test and deployment pipelines that make releases routine instead of risky.' },
      { title: 'Website & application security', text: 'Security audits, hardening, security headers, dependency and vulnerability management, and incident response.' },
      { title: 'Privacy & GDPR compliance', text: 'Privacy-by-design implementation, cookie consent, data-processing reviews and compliant data flows.' },
      { title: 'Performance & optimisation', text: 'Profiling and tuning of applications, databases and infrastructure — including cost optimisation.' },
      { title: 'Monitoring & reliability', text: 'Logging, uptime monitoring and alerting that surface problems before customers notice them.' },
    ],
    problems: [
      'Your website or application has never had a security review.',
      'Deployments are manual, infrequent and stressful.',
      'You are unsure whether your data handling is GDPR-compliant.',
    ],
    outcomes: ['Measurably stronger security posture', 'Frequent, low-risk releases', 'Documented, compliant data handling'],
    connections: [
      { to: 'software-engineering', label: 'The secure platform every application runs on.' },
      { to: 'data-intelligence', label: 'Compliant tracking and consent infrastructure.' },
      { to: 'ai-automation', label: 'Governed environments for AI workloads.' },
      { to: 'search-visibility', label: 'Speed and stability that search engines reward.' },
    ],
    faq: [
      { q: 'What does a website security audit include?', a: 'A review of server and application configuration, security headers, authentication, dependencies and known vulnerabilities, data handling and backups — followed by a prioritised remediation plan.' },
      { q: 'Can you help with GDPR compliance for our website?', a: 'Yes, on the technical side: cookie consent, consent mode, data flows, processor configuration and privacy-by-design implementation. We work alongside your legal advisers for legal documentation.' },
      { q: 'Which cloud providers do you work with?', a: 'We work with the major cloud providers as well as managed hosting, and choose based on your requirements for performance, cost, compliance and data location.' },
    ],
    seo: {
      title: 'Cloud, DevOps, Website Security & GDPR Compliance',
      description: 'Cloud architecture, DevOps and CI/CD, website and application security audits and hardening, GDPR and cookie compliance, performance optimisation and monitoring.',
    },
  },
  {
    slug: 'digital-growth',
    index: '06',
    name: 'Marketing, Content & Social',
    shortName: 'Marketing & Content',
    shape: 'radiance',
    accent: '#22d3ee',
    summary: 'Digital marketing, content for websites and blogs, social media and performance campaigns — engineered and measured like any other system.',
    headline: 'Marketing and content that people find, read and act on.',
    intro:
      'Our team plans, writes, designs and runs marketing across every channel — from SEO-driven blog content and website copy to social media and paid campaigns. Because we also build software and analytics, every campaign lands on fast pages and every result is tracked correctly.',
    offerings: [
      { title: 'Digital marketing strategy', text: 'Positioning, audience and channel strategy grounded in data rather than assumptions.' },
      { title: 'Website & blog content', text: 'SEO copywriting, blog articles, landing pages and long-form content — produced at scale with our AI content workflows and edited by people, for readers, search engines and AI answers.' },
      { title: 'Social media — images & text', text: 'Content calendars, post copy, branded images, carousels and short-form video, community management and reporting across LinkedIn, Instagram, Facebook and TikTok.' },
      { title: 'Performance marketing', text: 'Google Ads, Meta, LinkedIn and TikTok campaigns with clear attribution, testing discipline and budget control.' },
      { title: 'Brand & creative', text: 'Brand identity, messaging, design systems and creative assets that stay consistent across every touchpoint.' },
      { title: 'Email & marketing automation', text: 'Newsletters, lead nurturing and CRM automation that turn interest into customers.' },
    ],
    problems: [
      'Your blog and social channels are inactive or inconsistent.',
      'Marketing spend is hard to connect to revenue.',
      'Leads arrive but are not followed up systematically.',
    ],
    outcomes: ['A steady flow of quality content', 'Attribution you can act on', 'More leads converted into customers'],
    connections: [
      { to: 'search-visibility', label: 'Content strategy built on search and AI-answer demand.' },
      { to: 'data-intelligence', label: 'Attribution and campaign dashboards.' },
      { to: 'ai-automation', label: 'AI-assisted content operations and lead qualification.' },
      { to: 'software-engineering', label: 'High-performance landing pages and campaign sites.' },
    ],
    faq: [
      { q: 'Do you write content for blogs and websites?', a: 'Yes. Our team writes SEO-driven blog articles, website copy, landing pages and long-form guides — researched with our search tools and structured to perform in search engines and AI answers.' },
      { q: 'Can you manage our social media?', a: 'Yes — strategy, content calendars, posts and short-form video, community management and monthly reporting for LinkedIn, Instagram, Facebook and TikTok.' },
      { q: 'How do you measure marketing results?', a: 'With properly configured GA4, Tag Manager and Consent Mode, combined into live dashboards that connect content and campaigns to leads and revenue.' },
    ],
    seo: {
      title: 'Digital Marketing, Content Writing & Social Media Management',
      description: 'Digital marketing strategy, SEO blog and website content, social media management, performance marketing, branding and email automation — measured end to end.',
    },
  },
];

export const advisory = {
  name: 'Strategy & Consulting',
  summary:
    'Independent technology and digital consulting: we turn an idea or a problem into a clear roadmap — scope, priorities, architecture and budget — before any large commitment.',
  steps: ['Business & process discovery', 'Technical, data and search audit', 'Solution architecture & roadmap', 'Estimate and delivery plan'],
};

export const getCapability = (slug: string) => capabilities.find((c) => c.slug === slug);
