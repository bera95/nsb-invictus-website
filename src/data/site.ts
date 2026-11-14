/**
 * Global site configuration.
 * Values marked `PLACEHOLDER` require confirmation from NSB INVICTUS before launch.
 * Search the codebase for "PLACEHOLDER" to find every outstanding item.
 */
export const site = {
  name: 'NSB INVICTUS',
  tagline: 'Where vision becomes reality.',
  description:
    'NSB INVICTUS is a technology and digital innovation company. We design, engineer and grow digital solutions — from AI and custom software to data, cloud and digital growth.',
  /** Production URL is injected at build time via PUBLIC_SITE_URL. */
  locale: 'en',

  contact: {
    /** PLACEHOLDER — public inquiry address. */
    email: 'hello@example.com' as string,
    emailIsPlaceholder: true,
    /** PLACEHOLDER — optional phone number, leave empty to hide. */
    phone: '' as string,
  },

  legal: {
    /** PLACEHOLDER — registered legal entity name, e.g. "NSB INVICTUS d.o.o." */
    entityName: '[Registered company name]',
    /** PLACEHOLDER — registered address. */
    address: '[Registered address]',
    /** PLACEHOLDER — company registration / VAT numbers. */
    registration: '[Registration number] · [VAT number]',
    /** PLACEHOLDER — jurisdiction governing privacy & legal pages. */
    jurisdiction: '[Country of registration]',
    isPlaceholder: true,
  },

  social: [
    // PLACEHOLDER — add real profiles, e.g. { label: 'LinkedIn', href: 'https://www.linkedin.com/company/...' }
  ] as { label: string; href: string }[],

  /** Show yellow "input required" markers. Set to false only when every placeholder is resolved. */
  showPlaceholders: true,

  /** Inquiry endpoint (PHP, deployed alongside the static site). */
  inquiryEndpoint: '/api/inquiry.php',
} as const;

export const navigation = [
  { label: 'Capabilities', href: '/capabilities/' },
  { label: 'Industries', href: '/industries/' },
  { label: 'Products', href: '/products/' },
  { label: 'Approach', href: '/approach/' },
] as const;
