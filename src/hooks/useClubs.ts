
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Club {
  club_id: number;
  name: string | null;
  slug: string | null;
  country: string | null;
  logo_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  stadium_name: string | null;
  stadium_location: string | null;
  stadium_capacity: number | null;
  founded_year: number | null;
  members_count: number | null;
  popularity_score: number | null; // Added this missing field
  website_url: string | null;
  fanshop_url: string | null;
  instagram_url: string | null;
  twitter_url: string | null;
  facebook_url: string | null;
  // League participation flags
  bundesliga: boolean | null;
  second_bundesliga: boolean | null;
  third_bundesliga: boolean | null;
  dfb_pokal: boolean | null;
  champions_league: boolean | null;
  europa_league: boolean | null;
  conference_league: boolean | null;
  club_world_cup: boolean | null;
  premier_league: boolean | null;
  fa_cup: boolean | null;
  efl_cup: boolean | null;
  la_liga: boolean | null;
  copa_del_rey: boolean | null;
  serie_a: boolean | null;
  coppa_italia: boolean | null;
  ligue_1: boolean | null;
  coupe_de_france: boolean | null;
  eredevise: boolean | null;
  sueper_lig: boolean | null;
  liga_portugal: boolean | null;
  saudi_pro_league: boolean | null;
  mls: boolean | null;
}

const fetchClubs = async (): Promise<Club[]> => {
  console.log('Fetching clubs from Supabase...');
  
  const { data, error } = await supabase
    .from('clubs')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching clubs:', error);
    throw error;
  }

  console.log('Clubs fetched successfully:', data?.length || 0, 'clubs');
  return data || [];
};

export const useClubs = () => {
  const query = useQuery({
    queryKey: ['clubs'],
    queryFn: fetchClubs,
  });

  return {
    clubs: query.data || [],
    loading: query.isLoading,
    error: query.error?.message || null,
  };
};
