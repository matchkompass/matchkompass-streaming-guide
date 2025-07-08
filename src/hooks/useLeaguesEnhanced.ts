
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface LeagueEnhanced {
  league_id: number;
  league: string;
  league_slug: string;
  country: string; // Using country instead of country_code
  'number of games': number;
}

const fetchEnhancedLeagues = async (): Promise<LeagueEnhanced[]> => {
  console.log('Fetching enhanced leagues from Supabase...');
  
  const { data, error } = await supabase
    .from('leagues')
    .select('league_id, league, league_slug, country, "number of games"')
    .order('country, league');

  if (error) {
    console.error('Error fetching enhanced leagues:', error);
    throw error;
  }

  console.log('Enhanced leagues fetched successfully:', data?.length || 0, 'leagues');
  return data || [];
};

export const useLeaguesEnhanced = () => {
  const query = useQuery({
    queryKey: ['leagues-enhanced'],
    queryFn: fetchEnhancedLeagues,
  });

  // Group leagues by country
  const leaguesByCountry = (query.data || []).reduce((acc, league) => {
    const country = league.country || 'Other';
    if (!acc[country]) acc[country] = [];
    acc[country].push(league);
    return acc;
  }, {} as Record<string, LeagueEnhanced[]>);

  return {
    leagues: query.data || [],
    leaguesByCountry,
    loading: query.isLoading,
    error: query.error?.message || null,
  };
};
