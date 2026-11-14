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
export type ProductStatus = 'concept' | 'in-development' | 'private-beta' | 'public-beta' | 'available';

export interface Product {
  slug: string;
  name: string;
  category: string;
  status: ProductStatus;
  summary: string;
  url?: string;
  independentBrand?: boolean;
}

export const productStatuses: Record<ProductStatus, { label: string; description: string; tone: string }> = {
  concept: { label: 'Concept', description: 'Under research and validation', tone: '#8d93a6' },
  'in-development': { label: 'In development', description: 'Actively being built', tone: '#a996ff' },
  'private-beta': { label: 'Private beta', description: 'Tested with selected users', tone: '#7fe6f6' },
  'public-beta': { label: 'Public beta', description: 'Open for early access', tone: '#22d3ee' },
  available: { label: 'Available', description: 'Commercially available', tone: '#10b981' },
};

/** PLACEHOLDER — add real NSB INVICTUS products here. */
export const products: Product[] = [];
