import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase configuration
const SUPABASE_URL = "https://emgsdptbhoupocvvpogl.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtZ3NkcHRiaG91cG9jdnZwb2dsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NzYyNjcsImV4cCI6MjA2NjQ1MjI2N30.VCqXbSuZZcYhY8TCp6DkHavEX_lEjSK8g4d63E0_MJk";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

const generateSitemap = async () => {
  const baseUrl = 'https://matchstream.de';
  const currentDate = new Date().toISOString().split('T')[0];

  // Static pages with high priority
  const staticPages = [
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

  const dynamicPages = [];

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

  // Save to public folder
  const publicPath = path.join(__dirname, '..', 'public', 'sitemap.xml');
  fs.writeFileSync(publicPath, sitemapXml);
  console.log(`Sitemap saved to: ${publicPath}`);

  return sitemapXml;
};

// Run the script
generateSitemap()
  .then(() => {
    console.log('Sitemap generation completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error generating sitemap:', error);
    process.exit(1);
  }); 