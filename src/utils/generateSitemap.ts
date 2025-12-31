// Utility to generate sitemap entries for better SEO indexing
export interface SitemapEntry {
  url: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

export const generateSitemapEntries = (): SitemapEntry[] => {
  const baseUrl = 'https://matchstream.de';
  const currentDate = new Date().toISOString().split('T')[0];
  
  const staticPages: SitemapEntry[] = [
    { url: `${baseUrl}/`, lastmod: currentDate, changefreq: 'daily', priority: 1.0 },
    { url: `${baseUrl}/wizard`, lastmod: currentDate, changefreq: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/vergleich`, lastmod: currentDate, changefreq: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/ligen`, lastmod: currentDate, changefreq: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/streaming-provider`, lastmod: currentDate, changefreq: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/deals`, lastmod: currentDate, changefreq: 'daily', priority: 0.7 },
    
    // SEO Landing Pages
    { url: `${baseUrl}/bundesliga-streaming`, lastmod: currentDate, changefreq: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/champions-league-streaming`, lastmod: currentDate, changefreq: 'weekly', priority: 0.9 },
    
    // Legal Pages
    { url: `${baseUrl}/impressum`, lastmod: currentDate, changefreq: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/datenschutz`, lastmod: currentDate, changefreq: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/agb`, lastmod: currentDate, changefreq: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/cookies`, lastmod: currentDate, changefreq: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/barrierefreiheit`, lastmod: currentDate, changefreq: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/widerrufsrecht`, lastmod: currentDate, changefreq: 'yearly', priority: 0.3 },
  ];

  // Dynamic pages could be added here (clubs, competitions, providers)
  // These would be populated from the database in a real implementation
  
  return staticPages;
};

export const generateSitemapXml = (entries: SitemapEntry[]): string => {
  const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>';
  const urlsetOpen = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
  const urlsetClose = '</urlset>';
  
  const urls = entries.map(entry => `
  <url>
    <loc>${entry.url}</loc>
    ${entry.lastmod ? `<lastmod>${entry.lastmod}</lastmod>` : ''}
    ${entry.changefreq ? `<changefreq>${entry.changefreq}</changefreq>` : ''}
    ${entry.priority ? `<priority>${entry.priority}</priority>` : ''}
  </url>`).join('');
  
  return `${xmlHeader}\n${urlsetOpen}${urls}\n${urlsetClose}`;
};