
import { useState, useEffect } from 'react';
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

export const useClubs = () => {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const { data, error } = await supabase
          .from('clubs')
          .select('*')
          .order('name');

        if (error) throw error;
        setClubs(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchClubs();
  }, []);

  return { clubs, loading, error };
};
