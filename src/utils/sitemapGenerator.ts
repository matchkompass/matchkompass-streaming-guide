import { supabase } from '@/integrations/supabase/client';

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
      url: `${baseUrl}/streaming-provider`,
      changefreq: 'weekly',
      priority: 0.9,
      lastmod: currentDate
    },
    {
      url: `${baseUrl}/bundesliga-streaming`,
      changefreq: 'weekly',
      priority: 0.9,
      lastmod: currentDate
    },
    {
      url: `${baseUrl}/champions-league-streaming`,
      changefreq: 'weekly',
      priority: 0.9,
      lastmod: currentDate
    },
    {
      url: `${baseUrl}/ueber-uns`,
      changefreq: 'monthly',
      priority: 0.7,
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
    },
    {
      url: `${baseUrl}/barrierefreiheit`,
      changefreq: 'monthly',
      priority: 0.3,
      lastmod: currentDate
    },
    {
      url: `${baseUrl}/widerrufsrecht`,
      changefreq: 'monthly',
      priority: 0.3,
      lastmod: currentDate
    }
  ];

  const dynamicPages: SitemapUrl[] = [];

  try {
    // Fetch all clubs from Supabase
    console.log('Fetching clubs from Supabase...');
    const { data: clubs, error: clubsError } = await supabase
      .from('clubs')
      .select('slug, name, popularity')
      .not('slug', 'is', null)
      .order('popularity', { ascending: false, nullsFirst: false });

    if (clubsError) {
      console.error('Error fetching clubs:', clubsError);
    } else if (clubs) {
      console.log(`Found ${clubs.length} clubs`);
      clubs.forEach(club => {
        if (club.slug) {
          dynamicPages.push({
            url: `${baseUrl}/club/${club.slug}`,
            changefreq: 'weekly',
            priority: club.popularity ? Math.min(0.8, 0.5 + (club.popularity / 100)) : 0.6,
            lastmod: currentDate
          });
        }
      });
    }

    // Fetch all leagues from Supabase
    console.log('Fetching leagues from Supabase...');
    const { data: leagues, error: leaguesError } = await supabase
      .from('leagues')
      .select('league_slug, league, popularity')
      .not('league_slug', 'is', null)
      .order('popularity', { ascending: false, nullsFirst: false });

    if (leaguesError) {
      console.error('Error fetching leagues:', leaguesError);
    } else if (leagues) {
      console.log(`Found ${leagues.length} leagues`);
      leagues.forEach(league => {
        if (league.league_slug) {
          dynamicPages.push({
            url: `${baseUrl}/competition/${league.league_slug}`,
            changefreq: 'weekly',
            priority: league.popularity ? Math.min(0.8, 0.5 + (league.popularity / 100)) : 0.7,
            lastmod: currentDate
          });
        }
      });
    }

    // Fetch all streaming providers from Supabase
    console.log('Fetching streaming providers from Supabase...');
    const { data: providers, error: providersError } = await supabase
      .from('streaming')
      .select('slug, name, provider_name')
      .not('slug', 'is', null)
      .order('name');

    if (providersError) {
      console.error('Error fetching providers:', providersError);
    } else if (providers) {
      console.log(`Found ${providers.length} providers`);
      providers.forEach(provider => {
        if (provider.slug) {
          dynamicPages.push({
            url: `${baseUrl}/streaming-provider/${provider.slug}`,
            changefreq: 'weekly',
            priority: 0.8,
            lastmod: currentDate
          });
        }
      });
    }

  } catch (error) {
    console.error('Error generating dynamic sitemap:', error);
  }

  // Generate XML sitemap
  const allPages = [...staticPages, ...dynamicPages];
  
  console.log(`Generated sitemap with ${allPages.length} total URLs:`);
  console.log(`- ${staticPages.length} static pages`);
  console.log(`- ${dynamicPages.length} dynamic pages`);
  
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

# Allow important pages
Allow: /ligen
Allow: /streaming-provider
Allow: /vergleich
Allow: /wizard
Allow: /deals
Allow: /club/
Allow: /competition/
Allow: /streaming-provider/

# Block unnecessary files
Disallow: /*.json$
Disallow: /*.xml$
Disallow: /api/
Disallow: /_next/
Disallow: /static/
`;
};

// Function to save sitemap to public folder
export const saveSitemap = async (): Promise<void> => {
  try {
    const sitemapXml = await generateSitemap();
    
    // In a real environment, you would write this to the public folder
    // For now, we'll log it and you can manually save it
    console.log('Generated Sitemap XML:');
    console.log(sitemapXml);
    
    // You can also download it
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