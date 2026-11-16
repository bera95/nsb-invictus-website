/**
 * Insights (blog) — articles live as Markdown in src/content/insights/*.md.
 * Add a new .md file with the same frontmatter to publish a new article.
 */
export interface InsightFrontmatter {
  title: string;
  description: string;
  date: string | Date;
  category: string;
  capability?: string;
  tool?: string;
  keywords?: string[];
  faq?: { q: string; a: string }[];
}
interface MdModule {
  frontmatter: InsightFrontmatter;
  Content: any;
  file: string;
  rawContent: () => string;
  getHeadings: () => { depth: number; slug: string; text: string }[];
}

const modules = import.meta.glob<MdModule>('../content/insights/*.md', { eager: true });

export const insights = Object.entries(modules)
  .map(([path, mod]) => {
    const slug = path.split('/').pop()!.replace(/\.md$/, '');
    const words = mod.rawContent().split(/\s+/).filter(Boolean).length;
    const date = new Date(mod.frontmatter.date);
    return { slug, ...mod.frontmatter, date, readingMinutes: Math.max(2, Math.round(words / 230)), Content: mod.Content, headings: mod.getHeadings() };
  })
  .sort((a, b) => b.date.getTime() - a.date.getTime() || a.title.localeCompare(b.title));

export type Insight = (typeof insights)[number];
export const insightCategories = [...new Set(insights.map((i) => i.category))];
export const formatDate = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
