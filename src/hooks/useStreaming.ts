
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface StreamingProvider {
  streamer_id: number;
  provider_name: string;
  name: string;
  slug: string;
  logo_url: string;
  monthly_price: string;
  yearly_price: string;
  affiliate_url: string;
  features: any;
  bundesliga: number;
  second_bundesliga: number;
  dfb_pokal: number;
  champions_league: number;
  europa_league: number;
  conference_league: number;
  club_world_cup: number;
  premier_league: number;
  fa_cup: number;
  la_liga: number;
  copa_del_rey: number;
  third_bundesliga: number;
  serie_a: number;
  ligue_1: number;
  eredevise: number;
  sueper_lig: number;
  liga_portugal: number;
  saudi_pro_league: number;
  mls: number;
  efl_cup: number;
  coppa_italia: number;
  coupe_de_france: number;
}

export const useStreaming = () => {
  const [providers, setProviders] = useState<StreamingProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const { data, error } = await supabase
          .from('streaming')
          .select('*')
          .order('provider_name');

        if (error) throw error;
        setProviders(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchProviders();
  }, []);

  return { providers, loading, error };
};
