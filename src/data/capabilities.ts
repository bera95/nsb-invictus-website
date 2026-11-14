/**
 * Capability (service) architecture — single source of truth for navigation,
 * the homepage ecosystem, capability landing pages and the inquiry form.
 */
import type { ShapeName } from '../scripts/architecture/shapes';

export type CapabilitySlug = 'ai-automation' | 'software-engineering' | 'data-intelligence' | 'cloud-platform' | 'digital-growth';

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
  seo: { title: string; description: string };
}

export const capabilities: Capability[] = [
  {
    slug: 'ai-automation',
    index: '01',
    name: 'AI & Intelligent Automation',
    shortName: 'AI & Automation',
    shape: 'neural',
    accent: '#a996ff',
    summary: 'Practical AI that sits inside real workflows — agents, LLM integrations and automation that remove repetitive work.',
    headline: 'AI that does real work inside your business.',
    intro:
      'We design and build AI systems around concrete processes rather than demos. That means grounding language models in your own data, connecting them to the tools your teams already use, and adding the controls needed to run them responsibly in production.',
    offerings: [
      { title: 'AI agents', text: 'Task-oriented agents that research, draft, triage and act across your systems, with human review where it matters.' },
      { title: 'LLM integrations', text: 'Language models connected to your documents, databases and applications through secure, well-defined interfaces.' },
      { title: 'Intelligent automation', text: 'End-to-end automation of document handling, data entry, routing and approvals that previously required manual effort.' },
      { title: 'AI-powered workflows', text: 'Existing business processes redesigned so that AI handles the routine steps and people handle the decisions.' },
      { title: 'Custom AI applications', text: 'Purpose-built tools — assistants, classifiers, search and extraction systems — designed for a specific business problem.' },
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
      { to: 'cloud-platform', label: 'Secure, scalable infrastructure to run AI in production.' },
      { to: 'digital-growth', label: 'Automated content, personalisation and lead handling.' },
    ],
    seo: {
      title: 'AI & Intelligent Automation — AI Agents, LLM Integration',
      description: 'AI agents, LLM integrations and intelligent automation designed around real business workflows. Built for production, with evaluation and guardrails.',
    },
  },
  {
    slug: 'software-engineering',
    index: '02',
    name: 'Software & Product Engineering',
    shortName: 'Software & Product',
    shape: 'modules',
    accent: '#7fe6f6',
    summary: 'Custom software, SaaS platforms and web applications engineered to be maintainable, secure and ready to scale.',
    headline: 'Software engineered to last, not just to launch.',
    intro:
      'From a first MVP to complex business systems, we take products from requirements to production. We favour clear architecture, automated testing and documentation, so the software remains an asset you can extend rather than a liability you work around.',
    offerings: [
      { title: 'Custom software', text: 'Applications built around how your organisation actually operates, not around the limits of off-the-shelf tools.' },
      { title: 'SaaS platforms', text: 'Multi-tenant products with subscription, permissions and administration designed in from day one.' },
      { title: 'Web applications', text: 'Fast, accessible, responsive applications built with modern, well-supported frameworks.' },
      { title: 'Business management systems', text: 'Internal platforms that replace spreadsheets and disconnected tools with one reliable system of record.' },
      { title: 'APIs & integrations', text: 'Robust APIs and integrations that connect CRMs, ERPs, payment providers and third-party services.' },
      { title: 'Digital product development', text: 'Discovery, UX design, prototyping and iterative delivery for new digital products.' },
    ],
    problems: [
      'Operations depend on spreadsheets and manual hand-offs.',
      'Existing software is hard to change and expensive to maintain.',
      'A product idea needs to become a working, testable release.',
    ],
    outcomes: ['One reliable system of record', 'Shorter time from idea to release', 'Code you own, documented and maintainable'],
    connections: [
      { to: 'ai-automation', label: 'Intelligent features built directly into the product.' },
      { to: 'cloud-platform', label: 'Deployment pipelines and infrastructure designed alongside the code.' },
      { to: 'data-intelligence', label: 'Applications that capture clean, analysable data from the start.' },
      { to: 'digital-growth', label: 'Products designed to be found, adopted and grown.' },
    ],
    seo: {
      title: 'Software & Product Engineering — Custom Software, SaaS, APIs',
      description: 'Custom software, SaaS platforms, web applications, business systems and API integrations — engineered for maintainability, security and scale.',
    },
  },
  {
    slug: 'data-intelligence',
    index: '03',
    name: 'Data & Business Intelligence',
    shortName: 'Data & BI',
    shape: 'terrain',
    accent: '#5fdcb0',
    summary: 'Dashboards, analytics and predictive models that turn operational data into decisions.',
    headline: 'Turn the data you already have into decisions you can trust.',
    intro:
      'Most organisations already hold the data they need — it is simply spread across systems and difficult to trust. We consolidate, model and visualise it, so leaders and teams work from a single, reliable view of performance.',
    offerings: [
      { title: 'Business intelligence', text: 'A consistent reporting layer with agreed definitions for the metrics that run your business.' },
      { title: 'Data analytics', text: 'Analysis that answers specific commercial and operational questions, not just descriptive reports.' },
      { title: 'Interactive dashboards', text: 'Clear, role-specific dashboards that people actually open and use.' },
      { title: 'Reporting & visualisation', text: 'Automated reporting that replaces manual monthly spreadsheet work.' },
      { title: 'Predictive analytics', text: 'Forecasting and scoring models for demand, churn, pricing and risk.' },
      { title: 'Data pipelines', text: 'Reliable extraction, transformation and storage that keeps every report up to date.' },
    ],
    problems: [
      'Different teams report different numbers for the same metric.',
      'Reporting is manual, slow and error-prone.',
      'Decisions rely on intuition because data is hard to access.',
    ],
    outcomes: ['A single source of truth for key metrics', 'Automated, always-current reporting', 'Forward-looking insight, not just history'],
    connections: [
      { to: 'ai-automation', label: 'Clean data foundations for AI and machine learning.' },
      { to: 'software-engineering', label: 'Embedded analytics inside your own applications.' },
      { to: 'cloud-platform', label: 'Scalable warehouses and pipelines in the cloud.' },
      { to: 'digital-growth', label: 'Marketing attribution and performance measurement.' },
    ],
    seo: {
      title: 'Data & Business Intelligence — Dashboards, Analytics, Forecasting',
      description: 'Business intelligence, interactive dashboards, automated reporting and predictive analytics that turn operational data into reliable decisions.',
    },
  },
  {
    slug: 'cloud-platform',
    index: '04',
    name: 'Cloud & Platform Engineering',
    shortName: 'Cloud & Platform',
    shape: 'strata',
    accent: '#7c5cff',
    summary: 'Cloud architecture, DevOps and performance engineering for systems that stay fast, secure and cost-efficient.',
    headline: 'Infrastructure that stays out of the way — and never falls over.',
    intro:
      'We design cloud foundations that are secure by default, observable and sized to real demand. Whether you are moving to the cloud, modernising a legacy platform or reducing costs, the goal is the same: dependable systems that teams can deploy to with confidence.',
    offerings: [
      { title: 'Cloud architecture', text: 'Well-structured environments on major cloud providers, designed around security, resilience and cost.' },
      { title: 'DevOps & CI/CD', text: 'Automated build, test and deployment pipelines that make releases routine instead of risky.' },
      { title: 'Infrastructure as code', text: 'Reproducible, version-controlled infrastructure that can be reviewed like application code.' },
      { title: 'Migration & modernisation', text: 'Planned migration of legacy systems with minimal disruption to the business.' },
      { title: 'Performance & optimisation', text: 'Profiling and tuning of applications, databases and infrastructure — including cost optimisation.' },
      { title: 'Monitoring & reliability', text: 'Logging, metrics and alerting that surface problems before your customers notice them.' },
    ],
    problems: [
      'Deployments are manual, infrequent and stressful.',
      'Cloud costs are rising without clear visibility.',
      'Legacy infrastructure limits what the business can build next.',
    ],
    outcomes: ['Frequent, low-risk releases', 'Predictable infrastructure costs', 'Measurable reliability and security'],
    connections: [
      { to: 'software-engineering', label: 'The platform every application is deployed on.' },
      { to: 'ai-automation', label: 'Secure, governed environments for AI workloads.' },
      { to: 'data-intelligence', label: 'Data platforms that scale with your volume.' },
      { to: 'digital-growth', label: 'Fast, resilient websites that convert and rank.' },
    ],
    seo: {
      title: 'Cloud & Platform Engineering — Cloud Architecture, DevOps',
      description: 'Cloud architecture, DevOps, CI/CD, migration and performance optimisation for secure, observable and cost-efficient platforms.',
    },
  },
  {
    slug: 'digital-growth',
    index: '05',
    name: 'Digital Growth & Brand',
    shortName: 'Growth & Brand',
    shape: 'radiance',
    accent: '#22d3ee',
    summary: 'Brand, content, SEO, GEO and performance marketing — engineered and measured like any other system.',
    headline: 'Growth built on brand clarity and measurable systems.',
    intro:
      'Visibility is now earned across search engines, AI assistants and social platforms at once. We connect brand, content and performance marketing into one measurable system — and because we also engineer software, the experiences we create are fast, accessible and properly instrumented.',
    offerings: [
      { title: 'Digital strategy', text: 'Positioning, audience and channel strategy grounded in data rather than assumptions.' },
      { title: 'SEO & GEO', text: 'Technical and content optimisation for search engines and generative AI answer engines.' },
      { title: 'Content strategy & production', text: 'Editorial planning and production that builds authority in your market.' },
      { title: 'Brand development', text: 'Identity, messaging and design systems that stay consistent across every touchpoint.' },
      { title: 'Performance marketing', text: 'Paid acquisition with clear attribution, testing discipline and budget control.' },
      { title: 'Marketing automation & creative experiences', text: 'Lifecycle automation and interactive digital experiences that engage and convert.' },
    ],
    problems: [
      'Strong products are invisible in search and AI answers.',
      'Marketing spend is hard to connect to revenue.',
      'Brand presentation is inconsistent across channels.',
    ],
    outcomes: ['Higher qualified visibility', 'Attribution you can act on', 'A consistent, recognisable brand'],
    connections: [
      { to: 'data-intelligence', label: 'Attribution and performance dashboards.' },
      { to: 'ai-automation', label: 'Automated lead qualification and personalisation.' },
      { to: 'software-engineering', label: 'High-performance websites and campaign platforms.' },
      { to: 'cloud-platform', label: 'Infrastructure that keeps digital experiences fast.' },
    ],
    seo: {
      title: 'Digital Growth & Brand — SEO, GEO, Content, Performance Marketing',
      description: 'Digital strategy, SEO and GEO, content, brand development and performance marketing connected into one measurable growth system.',
    },
  },
];

export const advisory = {
  name: 'Strategy & Advisory',
  summary:
    'A focused discovery and architecture engagement that turns an idea or a problem into a clear technical roadmap — scope, priorities, architecture and budget — before any large commitment.',
  steps: ['Stakeholder & process discovery', 'Technical and data assessment', 'Solution architecture & roadmap', 'Estimate and delivery plan'],
};

export const getCapability = (slug: string) => capabilities.find((c) => c.slug === slug);
