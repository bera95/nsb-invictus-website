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
  /** Production URL (canonical). Override at build time with PUBLIC_SITE_URL. */
  url: 'https://nsbinvictus.tech',
  locale: 'en',

  contact: {
    /** No public email address: all contact goes through the website form (spam protection). */
    email: '' as string,
    emailIsPlaceholder: false,
    /** Public phone numbers. `tel` must be in international E.164 format. */
    phones: [
      { label: 'Ireland', display: '+353 87 443 3160', tel: '+353874433160' },
      { label: 'Serbia', display: '+381 64 191 4707', tel: '+381641914707' },
    ] as { label: string; display: string; tel: string }[],
  },

  legal: {
    /** PLACEHOLDER — registered legal entity name as in the Serbian Business Registers Agency (APR), e.g. "NSB INVICTUS d.o.o." */
    entityName: '[Registered company name]',
    /** PLACEHOLDER — registered address in Serbia. */
    address: 'Kikinda, Serbia',
    city: 'Kikinda',
    /** PLACEHOLDER — Serbian company registration number (matični broj) and tax ID (PIB). */
    registration: 'Registration no. (MB): [—] · Tax ID (PIB): [—]',
    jurisdiction: 'Republic of Serbia',
    countryCode: 'RS',
    /** Set to false once entityName, address and registration are filled in. */
    isPlaceholder: true,
  },

  social: [
    // Add real profiles when available, e.g. { label: 'LinkedIn', href: 'https://www.linkedin.com/company/...' }
  ] as { label: string; href: string }[],

  /** Where we serve clients (local & international SEO). */
  areaServed: ['Europe', 'United States', 'Canada', 'Serbia', 'Ireland', 'Worldwide'],

  /** Google Tag Manager container. Loaded only after cookie consent (Consent Mode v2). */
  gtmId: 'GTM-NRSWNFPN',
  /**
   * GA4 measurement ID, loaded directly (gtag.js) after analytics consent.
   * Do NOT also add a GA4 "Google tag" with this ID inside GTM — that would count every visit twice.
   */
  ga4Id: 'G-TVMB41JF0P',

  /** Show yellow "input required" markers. Set to false only when every placeholder is resolved. */
  showPlaceholders: true,

  /** Inquiry endpoint (PHP, deployed alongside the static site). */
  inquiryEndpoint: '/api/inquiry.php',
} as const;

export const navigation = [
  { label: 'Capabilities', href: '/capabilities/' },
  { label: 'Industries', href: '/industries/' },
  { label: 'AI Agents', href: '/ai-agents/' },
  { label: 'Products', href: '/products/' },
  { label: 'Insights', href: '/insights/' },
  { label: 'Free tools', href: '/tools/' },
] as const;
