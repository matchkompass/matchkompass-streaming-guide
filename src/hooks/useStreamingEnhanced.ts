
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface StreamingProviderEnhanced {
  streamer_id: number;
  provider_name: string;
  name: string;
  slug: string;
  logo_url: string;
  monthly_price: string;
  yearly_price: string;
  affiliate_url: string;
  features: any;
  highlights: {
    highlight_1: string;
    highlight_2: string;
    highlight_3: string;
  };
  // League coverage fields
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
  further_offers: any;
  min_contract_duration: string;
}

const fetchEnhancedProviders = async (): Promise<StreamingProviderEnhanced[]> => {
  console.log('Fetching enhanced streaming providers with highlights from Supabase...');

  const { data, error } = await supabase
    .from('streaming')
    .select('*')
    .order('provider_name');

  if (error) {
    console.error('Error fetching enhanced streaming providers:', error);
    throw error;
  }

  // Transform data to include structured highlights
  const enhancedData = data?.map(provider => ({
    ...provider,
    highlights: {
      highlight_1: provider.highlight_1 || '',
      highlight_2: provider.highlight_2 || '',
      highlight_3: provider.highlight_3 || ''
    },
    further_offers: provider.further_offers,
    min_contract_duration: provider.min_contract_duration || ''
  })) || [];

  console.log('Enhanced streaming providers fetched successfully:', enhancedData.length, 'providers');
  return enhancedData;
};

export const useStreamingEnhanced = () => {
  const query = useQuery({
    queryKey: ['streaming-enhanced'],
    queryFn: fetchEnhancedProviders,
  });

  return {
    providers: query.data || [],
    loading: query.isLoading,
    error: query.error?.message || null,
  };
};
