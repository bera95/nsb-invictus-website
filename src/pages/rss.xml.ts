import { insights } from '../data/insights';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function GET({ site }: { site: URL }) {
  const base = site.toString().replace(/\/$/, '');
  const items = insights.map((p) => `
    <item>
      <title>${esc(p.title)}</title>
      <link>${base}/insights/${p.slug}/</link>
      <guid>${base}/insights/${p.slug}/</guid>
      <pubDate>${p.date.toUTCString()}</pubDate>
      <category>${esc(p.category)}</category>
      <description>${esc(p.description)}</description>
    </item>`).join('');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>NSB INVICTUS Insights</title>
    <link>${base}/insights/</link>
    <description>Guides on SEO, AEO and GEO, AI agents, websites and apps, analytics, security and marketing.</description>
    <language>en</language>${items}
  </channel>
</rss>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
}
