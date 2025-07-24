import { supabase } from '@/integrations/supabase/client';

interface SitemapUrl {
  loc: string;
  lastmod: string;
  changefreq: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: string;
}

export const generateSitemap = async (): Promise<string> => {
  const baseUrl = 'https://matchstream.de';
  const now = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  
  const urls: SitemapUrl[] = [];

  // Static pages with high priority
  const staticPages = [
    { path: '', priority: '1.0', changefreq: 'daily' as const },
    { path: '/wizard', priority: '0.9', changefreq: 'weekly' as const },
    { path: '/vergleich', priority: '0.9', changefreq: 'weekly' as const },
    { path: '/detailvergleich', priority: '0.8', changefreq: 'weekly' as const },
    { path: '/ligen', priority: '0.8', changefreq: 'monthly' as const },
    { path: '/anbieter', priority: '0.8', changefreq: 'monthly' as const },
    { path: '/deals', priority: '0.7', changefreq: 'daily' as const },
  ];

  staticPages.forEach(page => {
    urls.push({
      loc: `${baseUrl}${page.path}`,
      lastmod: now,
      changefreq: page.changefreq,
      priority: page.priority
    });
  });

  // Legal pages with lower priority
  const legalPages = [
    '/impressum', '/datenschutz', '/agb', '/cookies', '/barrierefreiheit', '/widerrufsrecht'
  ];

  legalPages.forEach(path => {
    urls.push({
      loc: `${baseUrl}${path}`,
      lastmod: now,
      changefreq: 'yearly',
      priority: '0.3'
    });
  });

  try {
    // Fetch clubs for dynamic club pages
    const { data: clubs } = await supabase
      .from('clubs')
      .select('slug')
      .order('name');

    if (clubs) {
      clubs.forEach(club => {
        urls.push({
          loc: `${baseUrl}/club/${club.slug}`,
          lastmod: now,
          changefreq: 'monthly',
          priority: '0.7'
        });
      });
    }

    // Fetch leagues for dynamic competition pages
    const { data: leagues } = await supabase
      .from('leagues')
      .select('league_slug')
      .order('popularity', { ascending: false, nullsFirst: false });

    if (leagues) {
      leagues.forEach(league => {
        urls.push({
          loc: `${baseUrl}/competition/${league.league_slug}`,
          lastmod: now,
          changefreq: 'monthly',
          priority: '0.6'
        });
      });
    }

    // Fetch streaming providers for dynamic provider pages
    const { data: providers } = await supabase
      .from('streaming')
      .select('slug')
      .order('provider_name');

    if (providers) {
      providers.forEach(provider => {
        urls.push({
          loc: `${baseUrl}/provider/${provider.slug}`,
          lastmod: now,
          changefreq: 'monthly',
          priority: '0.6'
        });
      });
    }

  } catch (error) {
    console.error('Error fetching dynamic URLs for sitemap:', error);
  }

  // Generate XML
  const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>';
  const urlsetOpen = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
  const urlsetClose = '</urlset>';

  const urlElements = urls.map(url => `
  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('');

  return `${xmlHeader}\n${urlsetOpen}${urlElements}\n${urlsetClose}`;
};

export const downloadSitemap = async () => {
  try {
    const sitemapXml = await generateSitemap();
    const blob = new Blob([sitemapXml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sitemap.xml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log('Sitemap downloaded successfully');
  } catch (error) {
    console.error('Error generating sitemap:', error);
  }
};