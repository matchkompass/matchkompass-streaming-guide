
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface League {
  league_id: number;
  league: string;
  league_slug: string;
  'country code': string;
  'number of games': number;
}

export const useLeagues = () => {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeagues = async () => {
      try {
        const { data, error } = await supabase
          .from('leagues')
          .select('*')
          .order('league');

        if (error) throw error;
        setLeagues(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchLeagues();
  }, []);

  return { leagues, loading, error };
};
