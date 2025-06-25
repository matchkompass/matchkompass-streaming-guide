
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Club {
  id: number;
  name: string;
  slug: string;
  logo_url: string;
  country: string;
  primary_color: string;
  secondary_color: string;
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
