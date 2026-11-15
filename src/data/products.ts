/**
 * Proprietary products — kept fully separate from client services.
 *
 * IMPORTANT: Only add real products with accurate statuses. Do not list a product
 * as "available" unless it can be purchased or used today.
 *
 * Example entry (copy, then edit):
 * {
 *   slug: 'product-slug',
 *   name: 'Product Name',
 *   category: 'Property technology',
 *   status: 'in-development',
 *   summary: 'One sentence describing who it is for and what it does.',
 *   url: '',                // external product site, optional
 *   independentBrand: false // true if the product has its own brand/site
 * }
 */
export type ProductStatus = 'concept' | 'in-development' | 'in-use' | 'private-beta' | 'public-beta' | 'available';

export interface Product {
  slug: string;
  name: string;
  category: string;
  status: ProductStatus;
  summary: string;
  /** Key capabilities, kept factual. */
  features?: string[];
  /** Visual used in the showcase. */
  visual?: 'radar' | 'pulse';
  /** Name may still change — shows a note. */
  workingName?: boolean;
  url?: string;
  independentBrand?: boolean;
}

export const productStatuses: Record<ProductStatus, { label: string; description: string; tone: string }> = {
  concept: { label: 'Concept', description: 'Under research and validation', tone: '#8d93a6' },
  'in-development': { label: 'In development', description: 'Actively being built', tone: '#a996ff' },
  'in-use': { label: 'In use with clients', description: 'Used in our client work', tone: '#ff4fd8' },
  'private-beta': { label: 'Private beta', description: 'Tested with selected users', tone: '#7fe6f6' },
  'public-beta': { label: 'Public beta', description: 'Open for early access', tone: '#22d3ee' },
  available: { label: 'Available', description: 'Commercially available', tone: '#10b981' },
};

export const products: Product[] = [
  {
    slug: 'seodream',
    name: 'SEODREAM',
    category: 'Search intelligence platform',
    status: 'in-use',
    workingName: true,
    visual: 'radar',
    summary:
      'Our all-in-one search intelligence platform for SEO, AEO and GEO. It covers the full search workflow — research, audits, tracking and reporting — in one place.',
    features: ['Keyword & competitor research', 'Technical site audits', 'Rank & AI-visibility tracking', 'Reporting'],
  },
  {
    slug: 'analytics-command-center',
    name: 'Analytics Command Center',
    category: 'Live analytics & monitoring',
    status: 'in-use',
    workingName: true,
    visual: 'pulse',
    summary:
      'A live dashboard that brings GA4, Google Tag Manager, Search Console and cookie consent together — with an automated analyst that detects tracking and performance problems and helps resolve them.',
    features: ['GA4 · GTM · Search Console', 'Consent monitoring', 'Live dashboards', 'Automated issue detection'],
  },
];
