
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface League {
  league_id: number;
  league: string;
  league_slug: string;
  'country code': string;
  'number of games': number;
}

const fetchLeagues = async (): Promise<League[]> => {
  console.log('Fetching leagues from Supabase...');
  
  const { data, error } = await supabase
    .from('leagues')
    .select('*')
    .order('popularity', { ascending: false, nullsFirst: false });

  if (error) {
    console.error('Error fetching leagues:', error);
    throw error;
  }

  console.log('Leagues fetched successfully:', data?.length || 0, 'leagues');
  return data || [];
};

export const useLeagues = () => {
  const query = useQuery({
    queryKey: ['leagues'],
    queryFn: fetchLeagues,
  });

  return {
    leagues: query.data || [],
    loading: query.isLoading,
    error: query.error?.message || null,
  };
};
