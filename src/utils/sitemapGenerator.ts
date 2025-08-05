import { useStreamingEnhanced } from "@/hooks/useStreamingEnhanced";
import { useLeaguesEnhanced } from "@/hooks/useLeaguesEnhanced";
import { useClubs } from "@/hooks/useClubs";

export interface SitemapUrl {
  url: string;
  lastmod?: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}

export const generateSitemap = async (): Promise<string> => {
  const baseUrl = 'https://matchstream.de';
  const currentDate = new Date().toISOString().split('T')[0];

  // Static pages with high priority
  const staticPages: SitemapUrl[] = [
    {
      url: `${baseUrl}/`,
      changefreq: 'daily',
      priority: 1.0,
      lastmod: currentDate
    },
    {
      url: `${baseUrl}/ligen`,
      changefreq: 'weekly',
      priority: 0.9,
      lastmod: currentDate
    },
    {
      url: `${baseUrl}/anbieter`,
      changefreq: 'weekly',
      priority: 0.9,
      lastmod: currentDate
    },
    {
      url: `${baseUrl}/vergleich`,
      changefreq: 'weekly',
      priority: 0.9,
      lastmod: currentDate
    },
    {
      url: `${baseUrl}/wizard`,
      changefreq: 'weekly',
      priority: 0.9,
      lastmod: currentDate
    },
    {
      url: `${baseUrl}/deals`,
      changefreq: 'daily',
      priority: 0.8,
      lastmod: currentDate
    },
    {
      url: `${baseUrl}/impressum`,
      changefreq: 'monthly',
      priority: 0.3,
      lastmod: currentDate
    },
    {
      url: `${baseUrl}/datenschutz`,
      changefreq: 'monthly',
      priority: 0.3,
      lastmod: currentDate
    },
    {
      url: `${baseUrl}/agb`,
      changefreq: 'monthly',
      priority: 0.3,
      lastmod: currentDate
    },
    {
      url: `${baseUrl}/cookies`,
      changefreq: 'monthly',
      priority: 0.3,
      lastmod: currentDate
    }
  ];

  // Dynamic pages (competitions, clubs, providers)
  const dynamicPages: SitemapUrl[] = [];

  // Add competition pages
  const competitions = [
    'bundesliga', 'second_bundesliga', 'third_bundesliga', 'dfb_pokal',
    'champions_league', 'europa_league', 'conference_league',
    'premier_league', 'la_liga', 'serie_a', 'ligue_1',
    'fa_cup', 'copa_del_rey', 'coppa_italia'
  ];

  competitions.forEach(competition => {
    dynamicPages.push({
      url: `${baseUrl}/competition/${competition}`,
      changefreq: 'weekly',
      priority: 0.8,
      lastmod: currentDate
    });
  });

  // Add popular club pages
  const popularClubs = [
    'bayern-muenchen', 'borussia-dortmund', 'fc-barcelona', 'real-madrid',
    'manchester-united', 'liverpool', 'arsenal', 'chelsea',
    'rb-leipzig', 'bayer-leverkusen', 'vfb-stuttgart'
  ];

  popularClubs.forEach(club => {
    dynamicPages.push({
      url: `${baseUrl}/club/${club}`,
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: currentDate
    });
  });

  // Add provider pages
  const providers = ['sky', 'dazn', 'amazon-prime-video', 'wow', 'disney-plus'];

  providers.forEach(provider => {
    dynamicPages.push({
      url: `${baseUrl}/streaming-provider/${provider}`,
      changefreq: 'weekly',
      priority: 0.8,
      lastmod: currentDate
    });
  });

  // Generate XML sitemap
  const allPages = [...staticPages, ...dynamicPages];
  
  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(page => `  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return sitemapXml;
};

export const generateRobotsTxt = (): string => {
  return `User-agent: *
Allow: /

# Sitemap
Sitemap: https://matchstream.de/sitemap.xml

# Crawl-delay
Crawl-delay: 1

# Disallow admin and private areas
Disallow: /admin/
Disallow: /private/
Disallow: /api/
`;
};