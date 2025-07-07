
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Club {
  club_id: number;
  name: string;
  slug: string;
  logo_url: string;
  country: string;
  primary_color: string;
  secondary_color: string;
  founded_year: number;
  stadium_name: string;
  stadium_capacity: number;
  stadium_location: string;
  members_count: number;
  website_url: string;
  fanshop_url: string;
  facebook_url: string;
  twitter_url: string;
  instagram_url: string;
  bundesliga: boolean;
  second_bundesliga: boolean;
  dfb_pokal: boolean;
  champions_league: boolean;
  europa_league: boolean;
  conference_league: boolean;
  club_world_cup: boolean;
  premier_league: boolean;
  fa_cup: boolean;
  la_liga: boolean;
  copa_del_rey: boolean;
  third_bundesliga: boolean;
  serie_a: boolean;
  ligue_1: boolean;
  eredevise: boolean;
  sueper_lig: boolean;
  liga_portugal: boolean;
  saudi_pro_league: boolean;
  mls: boolean;
  efl_cup: boolean;
  coppa_italia: boolean;
  coupe_de_france: boolean;
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
