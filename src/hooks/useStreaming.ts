
import { useQuery } from '@tanstack/react-query';
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
  highlight_1: string;
  highlight_2: string;
  highlight_3: string;
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

const fetchProviders = async (): Promise<StreamingProvider[]> => {
  console.log('Fetching streaming providers from Supabase...');
  
  const { data, error } = await supabase
    .from('streaming')
    .select('*')
    .order('provider_name');

  if (error) {
    console.error('Error fetching streaming providers:', error);
    throw error;
  }

  console.log('Streaming providers fetched successfully:', data?.length || 0, 'providers');
  return data || [];
};

export const useStreaming = () => {
  const query = useQuery({
    queryKey: ['streaming'],
    queryFn: fetchProviders,
  });

  return {
    providers: query.data || [],
    loading: query.isLoading,
    error: query.error?.message || null,
  };
};
