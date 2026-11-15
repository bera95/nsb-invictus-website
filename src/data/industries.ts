/**
 * Industry verticals. Add a new object to extend the site with another industry —
 * the index, navigation, sitemap and landing page are generated automatically.
 */
import type { ShapeName } from '../scripts/architecture/shapes';
import type { CapabilitySlug } from './capabilities';

export interface Industry {
  slug: string;
  name: string;
  shortName: string;
  shape: ShapeName;
  flagship?: boolean;
  summary: string;
  headline: string;
  intro: string;
  solutions: { title: string; text: string; capability: CapabilitySlug }[];
  challenges: string[];
  seo: { title: string; description: string };
}

export const industries: Industry[] = [
  {
    slug: 'property-technology',
    name: 'Property Technology & Digital Real Estate',
    shortName: 'Property Technology',
    shape: 'building',
    flagship: true,
    summary:
      'Real estate platforms, property management software, interactive property experiences and digital property marketing — designed and engineered by one team.',
    headline: 'Real estate, experienced and managed digitally.',
    intro:
      'Buyers and tenants now research properties online long before they visit, and property businesses need systems that keep up with portfolios, leads and paperwork. NSB INVICTUS brings software engineering, automation, search visibility and marketing together for developers, agencies and property managers.',
    solutions: [
      { title: 'Interactive property experiences', text: 'Interactive building and unit selectors, availability maps and visual presentations for developments and off-plan projects.', capability: 'software-engineering' },
      { title: 'Property management software', text: 'Custom systems for leases, tenants, maintenance requests, documents and payments — shaped around your portfolio.', capability: 'software-engineering' },
      { title: 'Real estate platforms', text: 'Listing portals, agent tools and client portals with search, filtering, CRM integration and lead capture.', capability: 'software-engineering' },
      { title: 'Digital property marketing', text: 'Listing content, campaigns and lead generation built around each property and development.', capability: 'digital-growth' },
      { title: 'Real estate SEO & local visibility', text: 'Local and international search visibility for agencies and developments — on Google, on maps and in AI assistants.', capability: 'search-visibility' },
      { title: 'Real estate workflow automation', text: 'Automated lead routing, viewing scheduling, document preparation and follow-ups using AI where it adds value.', capability: 'ai-automation' },
    ],
    challenges: [
      'Listings fail to stand out and generate too many unqualified viewings.',
      'Portfolio information lives in spreadsheets, inboxes and paper files.',
      'Off-plan projects are hard to visualise and sell before completion.',
      'Leads arrive from many channels and are followed up inconsistently.',
    ],
    seo: {
      title: 'Property Technology — Real Estate Software, Platforms & Marketing',
      description: 'Real estate platforms, property management software, interactive property experiences, real estate SEO and workflow automation for developers, agencies and property managers.',
    },
  },
  {
    slug: 'ecommerce-retail',
    name: 'E-commerce & Retail',
    shortName: 'E-commerce & Retail',
    shape: 'modules',
    summary: 'Commerce platforms, integrations, data and growth systems for online and omnichannel retailers.',
    headline: 'Commerce systems that scale with demand.',
    intro:
      'Growing retailers usually outgrow their first setup in the same places: integrations, operations, data and customer acquisition. We help e-commerce businesses connect their stack, automate operations and grow traffic and conversion with measurable results.',
    solutions: [
      { title: 'Custom storefronts & commerce platforms', text: 'Fast, conversion-focused storefronts and headless commerce builds on proven platforms.', capability: 'software-engineering' },
      { title: 'Systems integration', text: 'Connections between store, ERP, inventory, logistics, payments and marketplaces.', capability: 'software-engineering' },
      { title: 'Commerce analytics', text: 'Dashboards for revenue, margin, inventory, customer lifetime value and campaign performance.', capability: 'data-intelligence' },
      { title: 'Operations automation', text: 'Automated order handling, customer service triage, product content and catalogue enrichment.', capability: 'ai-automation' },
      { title: 'E-commerce SEO, AEO & GEO', text: 'Product and category visibility in search engines and AI shopping assistants.', capability: 'search-visibility' },
      { title: 'Tracking & conversion optimisation', text: 'GA4 e-commerce tracking, consent mode and conversion rate optimisation across the funnel.', capability: 'data-intelligence' },
      { title: 'Performance marketing', text: 'Paid acquisition, retention and lifecycle campaigns with clear attribution.', capability: 'digital-growth' },
    ],
    challenges: [
      'Disconnected systems create manual work and stock errors.',
      'Site speed and checkout friction limit conversion.',
      'Acquisition costs rise without clear attribution.',
    ],
    seo: {
      title: 'E-commerce & Retail Technology — Platforms, Integrations, Growth',
      description: 'E-commerce platforms, systems integration, commerce analytics, automation and performance marketing for online and omnichannel retailers.',
    },
  },
];

export const getIndustry = (slug: string) => industries.find((i) => i.slug === slug);
