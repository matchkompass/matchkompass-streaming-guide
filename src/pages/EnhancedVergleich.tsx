import React, { useState, useMemo } from "react";
import { Filter, Star, Check, X, Menu, Euro, Calendar, Tv } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useStreaming } from "@/hooks/useStreaming";
import { useLeagues } from "@/hooks/useLeagues";
import ComparisonSidebar from "@/components/comparison/ComparisonSidebar";
import { Checkbox } from "@/components/ui/checkbox";
import HighlightBadge from "@/components/ui/highlight-badge";
import { LEAGUE_CLUSTERS } from "./Wizard";
import { useIsMobile } from "@/hooks/use-mobile";

interface ComparisonFilters {
  competitions: string[];
  priceRange: [number, number];
  features: {
    fourK: boolean;
    mobile: boolean;
    download: boolean;
    multiStream: boolean;
  };
  simultaneousStreams: number;
  sortBy: string;
}

const EnhancedVergleich = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
  const [filters, setFilters] = useState<ComparisonFilters>({
    competitions: [],
    priceRange: [0, 100],
    features: { fourK: false, mobile: false, download: false, multiStream: false },
    simultaneousStreams: 1,
    sortBy: 'relevance'
  });
  const [paymentType, setPaymentType] = useState<'monthly' | 'yearly'>('monthly');
  const [expandedProvider, setExpandedProvider] = useState<number | null>(null);
  const [expandedMobileCard, setExpandedMobileCard] = useState<number | null>(null);

  const { providers, loading: providersLoading, error: providersError } = useStreaming();
  const { leagues, loading: leaguesLoading, error: leaguesError } = useLeagues();
  const isMobile = useIsMobile();

  const parsePrice = (priceString?: string): number => {
    if (!priceString) return 0;
    return parseFloat(priceString.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
  };

  const parseFeatures = (provider: any) => {
    const features = {
      fourK: false,
      mobile: false,
      download: false,
      multiStream: false,
      streams: 1,
    };
    if (provider.features) {
      try {
        const featureObj = typeof provider.features === 'string'
          ? JSON.parse(provider.features)
          : provider.features;
        features.fourK = featureObj['has_4k_streaming'] || false;
        features.mobile = featureObj['has_mobile_app'] || false;
        features.download = featureObj['has_offline_viewing'] || false;
        features.streams = featureObj['max_simultaneous_streams'] || 1;
        features.multiStream = features.streams > 1;
      } catch (e) {
        // Fallback features
      }
    }
    return features;
  };

  const getProviderCoverage = (provider: any, competitions: string[]) => {
    if (competitions.length === 0) return 0;
    
    let totalPossible = 0;
    let totalCovered = 0;
    
    competitions.forEach(comp => {
      const league = leagues.find(l => l.league_slug === comp);
      const totalGames = league ? league['number of games'] : 0;
      const providerGames = provider[comp] || 0;
      
      totalPossible += totalGames;
      totalCovered += Math.min(providerGames, totalGames);
    });
    
    return totalPossible > 0 ? Math.round((totalCovered / totalPossible) * 100) : 0;
  };

  // Helper to get coverage for a single league
  const getProviderCoverageForLeague = (provider: any, leagueSlug: string) => {
    const providerKey = competitionKeyMap[leagueSlug] || leagueSlug;
    const league = leagues.find(l => l.league_slug === leagueSlug);
    const totalGames = league?.['number of games'] || 0;
    const coveredGames = (provider[providerKey] as number) || 0;
    const percentage = totalGames > 0 ? Math.round((coveredGames / totalGames) * 100) : 0;
    return { coveredGames, totalGames, percentage };
  };
  // Helper to calculate cost per game
  const calculateCostPerGame = (provider: any, selectedLeagues: string[]) => {
    let totalGames = 0;
    selectedLeagues.forEach(leagueSlug => {
      const coverage = getProviderCoverageForLeague(provider, leagueSlug);
      totalGames += coverage.coveredGames;
    });
    const monthlyPrice = parsePrice(provider.monthly_price);
    return totalGames > 0 ? monthlyPrice / totalGames : 0;
  };
  // Mapping from sidebar competition names to provider keys
  const competitionKeyMap: Record<string, string> = {
    'Bundesliga': 'bundesliga',
    '2. Bundesliga': 'second_bundesliga',
    'DFB-Pokal': 'dfb_pokal',
    'Champions League': 'champions_league',
    'Europa League': 'europa_league',
    'Conference League': 'conference_league',
    'Premier League': 'premier_league',
    'La Liga': 'la_liga',
    'Serie A': 'serie_a',
    'Ligue 1': 'ligue_1',
    'Nationalmannschaft': 'nationalmannschaft',
  };

  // Helper to get flag for a league_slug
  const getFlagForLeague = (league_slug: string) => LEAGUE_CLUSTERS.flatMap(c => c.leagues).find(l => l.slug === league_slug)?.flag || "🏆";

  // Updated filter logic
  const filteredProviders = useMemo(() => {
    return providers.filter(provider => {
      // Features
      const features = parseFeatures(provider);
      if (filters.features.fourK && !features.fourK) return false;
      if (filters.features.mobile && !features.mobile) return false;
      if (filters.features.download && !features.download) return false;
      if (filters.features.multiStream && !features.multiStream) return false;
      // Competitions
      if (filters.competitions.length > 0) {
        let coversAny = false;
        for (const leagueSlug of filters.competitions) {
          const providerKey = competitionKeyMap[leagueSlug] || leagueSlug;
          if ((provider[providerKey] || 0) > 0) coversAny = true;
        }
        if (!coversAny) return false;
      }
      // Price
      const price = parsePrice(paymentType === 'yearly' ? provider.yearly_price : provider.monthly_price);
      if (price < filters.priceRange[0] || price > filters.priceRange[1]) return false;
      return true;
    });
  }, [providers, filters, paymentType]);

  const availableCompetitions = useMemo(() => {
    return leagues.map(league => league.league_slug);
  }, [leagues]);

  const handleProviderToggle = (providerId: string) => {
    setSelectedProviders(prev => 
      prev.includes(providerId)
        ? prev.filter(id => id !== providerId)
        : [...prev, providerId]
    );
  };

  const handleAffiliateClick = (provider: any) => {
    const affiliateUrl = provider.affiliate_url || '#';
    window.open(affiliateUrl, '_blank');
  };

  const toggleCompetition = (competitionId: string) => {
    setFilters(prev => ({
      ...prev,
      competitions: prev.competitions.includes(competitionId)
        ? prev.competitions.filter(id => id !== competitionId)
        : [...prev.competitions, competitionId]
    }));
  };

  if (providersLoading || leaguesLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Lade Anbieter-Daten...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Streaming-Anbieter Vergleich
          </h1>
          <p className="text-sm text-gray-600">
            Vergleiche alle wichtigen Streaming-Dienste für Fußball und finde die beste Option
          </p>
        </div>
        {/* Mobile filter button */}
        <div className="lg:hidden flex justify-end mb-4">
          <Button
            onClick={() => setSidebarOpen(true)}
            className="bg-green-600 hover:bg-green-700 shadow-lg"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
        <div className="flex gap-6">
          {/* Sidebar: only show as column on desktop */}
          <div className="hidden lg:block w-72 min-w-[16rem]">
            <ComparisonSidebar
              filters={filters}
              onFiltersChange={setFilters}
              availableCompetitions={leagues.map(l => l.league_slug)}
              isOpen={true}
              onClose={() => {}}
            />
          </div>
          {/* Mobile sidebar drawer/modal */}
          {sidebarOpen && (
            <div className="fixed inset-0 z-50 flex lg:hidden">
              <div className="fixed inset-0 bg-black bg-opacity-40" onClick={() => setSidebarOpen(false)} />
              <div className="relative w-80 max-w-full h-full bg-white shadow-xl z-50 ml-auto animate-slide-in-right">
                <ComparisonSidebar
                  filters={filters}
                  onFiltersChange={setFilters}
                  availableCompetitions={leagues.map(l => l.league_slug)}
                  isOpen={sidebarOpen}
                  onClose={() => setSidebarOpen(false)}
                />
              </div>
            </div>
          )}
          <div className="flex-1">
            <div className="bg-white rounded-lg border overflow-x-auto">
              <div className="min-w-[1200px]">
                {/* Provider Logo/Name Row */}
                <div className="flex border-b">
                  <div className="w-40 p-3 bg-gray-50 font-medium border-r text-sm"></div>
                  {filteredProviders.map(provider => (
                    <div key={provider.streamer_id} className="w-48 p-3 text-center border-r last:border-r-0 flex flex-col items-center justify-center">
                      {provider.logo_url ? (
                        <img src={provider.logo_url} alt={provider.name} className="w-10 h-10 object-contain rounded-full bg-white border mb-1" />
                      ) : (
                        <span className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-200 mb-1">📺</span>
                      )}
                      <span className="text-sm font-semibold text-gray-900">{provider.name}</span>
                    </div>
                  ))}
                </div>
                {/* Coverage Row */}
                <div className="flex border-b">
                  <div className="w-40 p-3 bg-gray-50 font-medium border-r text-sm">Abdeckung</div>
                  {filteredProviders.map(provider => {
                    let totalCovered = 0;
                    let totalGames = 0;
                    filters.competitions.forEach(leagueSlug => {
                      const coverage = getProviderCoverageForLeague(provider, leagueSlug);
                      totalCovered += coverage.coveredGames;
                      totalGames += coverage.totalGames;
                    });
                    const percentage = totalGames > 0 ? Math.round((totalCovered / totalGames) * 100) : 0;
                    return (
                      <div key={provider.streamer_id} className="w-48 p-3 text-center border-r last:border-r-0">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${percentage >= 90 ? 'bg-green-100 text-green-800' : percentage >= 50 ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-500'}`}>
                          {percentage}% ({totalCovered}/{totalGames})
                        </span>
                      </div>
                    );
                  })}
                </div>
                {/* Cost Per Game Row */}
                <div className="flex border-b">
                  <div className="w-40 p-3 bg-gray-50 font-medium border-r text-sm">Kosten pro Spiel</div>
                  {filteredProviders.map(provider => (
                    <div key={provider.streamer_id} className="w-48 p-3 text-center border-r last:border-r-0">
                      <span className="text-sm font-semibold text-blue-600">
                        {calculateCostPerGame(provider, filters.competitions).toFixed(2)}€
                      </span>
                      <div className="text-xs text-gray-500">pro Spiel</div>
                    </div>
                  ))}
                </div>
                {/* Jetzt abonnieren Button Row */}
                <div className="flex border-b">
                  <div className="w-40 p-3 bg-gray-50 font-medium border-r text-sm">Jetzt abonnieren</div>
                  {filteredProviders.map(provider => (
                    <div key={provider.streamer_id} className="w-48 p-3 text-center border-r last:border-r-0">
                      {provider.affiliate_url && (
                        <Button className="w-full bg-green-600 hover:bg-green-700 text-white text-sm py-2" onClick={() => window.open(provider.affiliate_url, '_blank')}>
                          Jetzt abonnieren
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                {/* ... rest of the table ... */}
              </div>
            </div>

            {filteredProviders.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Filter className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Keine Anbieter gefunden
                </h3>
                <p className="text-gray-600">
                  Versuche deine Filter anzupassen, um mehr Ergebnisse zu sehen.
                </p>
              </div>
            )}

            <div className="mt-8 p-4 bg-gray-100 rounded-lg">
              <p className="text-sm text-gray-600 text-center">
                * Affiliate-Links: Wir erhalten eine Provision, wenn Sie über unsere Links ein Abonnement abschließen. 
                Dies beeinflusst nicht unsere Bewertungen und Vergleiche. Alle Preise sind unverbindlich und können sich ändern.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default EnhancedVergleich;
