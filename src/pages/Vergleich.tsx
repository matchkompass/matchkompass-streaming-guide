
import { useState, useMemo } from "react";
import { Filter, Star, Check, X, Menu } from "lucide-react";
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
import { useNavigate } from "react-router-dom";
import { LEAGUE_CLUSTERS } from "./Wizard";

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

const Vergleich = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
  const [filters, setFilters] = useState<ComparisonFilters>({
    competitions: [],
    priceRange: [0, 100],
    features: { fourK: false, mobile: false, download: false, multiStream: false },
    simultaneousStreams: 1,
    sortBy: 'relevance'
  });
  const [expandedProvider, setExpandedProvider] = useState<string | null>(null);
  const navigate = useNavigate();

  const { providers, loading: providersLoading, error: providersError } = useStreaming();
  const { leagues, loading: leaguesLoading, error: leaguesError } = useLeagues();

  const parsePrice = (priceString?: string): number => {
    if (!priceString) return 0;
    return parseFloat(priceString.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
  };

  const parseFeatures = (provider: any) => {
    const features = { fourK: false, mobile: false, download: false, streams: 1 };
    if (provider.features) {
      try {
        const featureObj = typeof provider.features === 'string' 
          ? JSON.parse(provider.features) 
          : provider.features;
        
        features.fourK = featureObj['4K'] || false;
        features.mobile = featureObj.mobile || false;
        features.download = featureObj.download || false;
        features.streams = featureObj.streams || 1;
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

  const filteredProviders = useMemo(() => {
    let filtered = providers.filter(provider => {
      const price = parsePrice(provider.monthly_price);
      const features = parseFeatures(provider);
      
      // Price filter
      if (price < filters.priceRange[0] || price > filters.priceRange[1]) return false;
      
      // Feature filters
      if (filters.features.fourK && !features.fourK) return false;
      if (filters.features.mobile && !features.mobile) return false;
      if (filters.features.download && !features.download) return false;
      if (filters.features.multiStream && features.streams < 2) return false;
      if (features.streams < filters.simultaneousStreams) return false;
      
      return true;
    });

    // Sorting
    filtered.sort((a, b) => {
      const priceA = parsePrice(a.monthly_price);
      const priceB = parsePrice(b.monthly_price);
      const coverageA = getProviderCoverage(a, filters.competitions);
      const coverageB = getProviderCoverage(b, filters.competitions);
      
      switch (filters.sortBy) {
        case 'price-asc':
          return priceA - priceB;
        case 'price-desc':
          return priceB - priceA;
        case 'coverage':
          return coverageB - coverageA;
        case 'popularity':
          return (b.provider_name.length) - (a.provider_name.length); // Mock popularity
        default: // relevance
          return (coverageB * 0.7) + ((100 - Math.min(priceB, 100)) * 0.3) - 
                 ((coverageA * 0.7) + ((100 - Math.min(priceA, 100)) * 0.3));
      }
    });

    return filtered;
  }, [providers, filters, leagues]);

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

  // Helper to get flag for a league_slug
  const getFlagForLeague = (league_slug: string) => LEAGUE_CLUSTERS.flatMap(c => c.leagues).find(l => l.slug === league_slug)?.flag || "🏆";

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
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Streaming-Anbieter Vergleich
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Vergleiche alle wichtigen Streaming-Dienste für Fußball und finde die beste Option
          </p>
        </div>

        <div className="flex gap-6">
          {/* Sidebar for desktop, drawer for mobile */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <ComparisonSidebar
              filters={filters}
              onFiltersChange={setFilters}
              availableCompetitions={availableCompetitions}
              isOpen={true}
              onClose={() => {}}
            />
          </div>

          {/* Mobile filter button */}
          <div className="lg:hidden fixed top-20 right-4 z-40">
            <Button
              onClick={() => setSidebarOpen(true)}
              className="bg-green-600 hover:bg-green-700 shadow-lg"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>

          {/* Mobile sidebar */}
          {sidebarOpen && (
            <ComparisonSidebar
              filters={filters}
              onFiltersChange={setFilters}
              availableCompetitions={availableCompetitions}
              isOpen={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
            />
          )}

          {/* Provider Cards */}
          <div className="flex-1 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProviders.map((provider) => {
                const price = parsePrice(provider.monthly_price);
                const features = parseFeatures(provider);
                const isSelected = selectedProviders.includes(provider.streamer_id?.toString());
                // Get competitions this provider actually covers (coveredGames > 0)
                const coveredCompetitions = filters.competitions
                  .map(slug => {
                    const league = leagues.find(l => l.league_slug === slug);
                    const coveredGames = provider[slug] || 0;
                    return coveredGames > 0 && league ? { league, coveredGames } : null;
                  })
                  .filter(Boolean);
                return (
                  <Card key={provider.streamer_id} className={`relative ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
                    <div className="absolute top-2 left-2 z-10">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handleProviderToggle(provider.streamer_id?.toString())}
                      />
                    </div>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        {provider.logo_url && (
                          <img src={provider.logo_url} alt={provider.name} className="w-10 h-10 object-contain rounded bg-white border" />
                        )}
                        <CardTitle>{provider.name}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-1">
                          {features.fourK && <Badge>4K</Badge>}
                          {features.mobile && <Badge>Mobile</Badge>}
                          {features.download && <Badge>Download</Badge>}
                          {features.streams > 1 && <Badge>Multi</Badge>}
                        </div>
                        <div className="text-sm text-gray-600">{price.toFixed(2)}€ / Monat</div>
                        {/* Dynamic league/flag tiles */}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {coveredCompetitions.map(({ league }) => (
                            <div key={league.league_slug} className="flex items-center space-x-2 bg-gray-50 rounded px-2 py-1">
                              <span className="text-sm">{league.icon || getFlagForLeague(league.league_slug)}</span>
                              <span className="text-xs text-gray-600 flex-1">{league.league}</span>
                              <div className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs bg-gray-100 cursor-pointer">
                                <X className="h-4 w-4 text-gray-400" />
                              </div>
                            </div>
                          ))}
                        </div>
                        <Button
                          size="sm"
                          className="w-full bg-green-600 hover:bg-green-700 text-white mt-2"
                          onClick={() => handleAffiliateClick(provider)}
                        >
                          Zum Angebot
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            {/* Sticky Compare Bar */}
            {selectedProviders.length > 1 && (
              <div className="sticky bottom-0 left-0 w-full bg-blue-50 border-t z-10 shadow flex px-4 py-3 gap-4 overflow-x-auto mt-4">
                <div className="w-48 font-semibold text-blue-700 flex items-center">{selectedProviders.length} Anbieter ausgewählt</div>
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => navigate(`/detailvergleich2?providers=${selectedProviders.join(',')}`)}
                >
                  Vergleichen
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Vergleich;
