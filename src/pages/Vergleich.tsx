
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

          {/* Main content */}
          <div className="flex-1 space-y-4">
            {/* Results header */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600">
                {filteredProviders.length} Anbieter gefunden
              </p>
              {selectedProviders.length > 0 && (
                <Button
                  onClick={() => console.log('Compare selected:', selectedProviders)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {selectedProviders.length} Anbieter vergleichen
                </Button>
              )}
            </div>

            {/* Provider cards */}
            <div className="space-y-4">
              {filteredProviders.map((provider) => {
                const price = parsePrice(provider.monthly_price);
                const features = parseFeatures(provider);
                const coverage = getProviderCoverage(provider, filters.competitions);
                const isSelected = selectedProviders.includes(provider.streamer_id.toString());

                return (
                  <Card key={provider.streamer_id} className={`hover:shadow-lg transition-all duration-200 ${
                    isSelected ? 'ring-2 ring-blue-500' : ''
                  }`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="text-3xl">
                            {provider.logo_url ? (
                              <img src={provider.logo_url} alt={provider.provider_name} className="w-12 h-12 object-contain" />
                            ) : (
                              "📺"
                            )}
                          </div>
                          <div>
                            <CardTitle className="text-xl">{provider.provider_name}</CardTitle>
                            <CardDescription>{provider.name}</CardDescription>
                            <div className="flex items-center space-x-2 mt-2">
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-gray-600">(4.0)</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600">
                            {price.toFixed(2)}€
                          </div>
                          <div className="text-sm text-gray-500">pro Monat</div>
                          {provider.yearly_price && (
                            <div className="text-xs text-orange-600 mt-1">
                              Jahresabo verfügbar
                            </div>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="grid md:grid-cols-3 gap-4 mb-4">
                        {/* Coverage */}
                        {filters.competitions.length > 0 && (
                          <div>
                            <h4 className="font-medium text-sm mb-2">Abdeckung</h4>
                            <div className="space-y-2">
                              <Progress value={coverage} className="h-2" />
                              <p className="text-xs text-gray-600">{coverage}% der gewählten Ligen</p>
                            </div>
                          </div>
                        )}

                        {/* Features */}
                        <div>
                          <h4 className="font-medium text-sm mb-2">Features</h4>
                          <div className="flex flex-wrap gap-1">
                            {features.fourK && (
                              <Badge variant="secondary" className="text-xs">4K</Badge>
                            )}
                            {features.mobile && (
                              <Badge variant="secondary" className="text-xs">Mobile</Badge>
                            )}
                            {features.download && (
                              <Badge variant="secondary" className="text-xs">Download</Badge>
                            )}
                            <Badge variant="secondary" className="text-xs">
                              {features.streams} Stream{features.streams > 1 ? 's' : ''}
                            </Badge>
                          </div>
                        </div>

                        {/* Top competitions */}
                        <div>
                          <h4 className="font-medium text-sm mb-2">Top Ligen</h4>
                          <div className="flex flex-wrap gap-1">
                            {['bundesliga', 'champions_league', 'premier_league'].map(comp => {
                              const games = provider[comp] || 0;
                              if (games > 0) {
                                return (
                                  <Badge key={comp} variant="outline" className="text-xs">
                                    {comp.replace('_', ' ')}
                                  </Badge>
                                );
                              }
                              return null;
                            })}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          onClick={() => handleAffiliateClick(provider)}
                        >
                          Zum Anbieter
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => handleProviderToggle(provider.streamer_id.toString())}
                          className={isSelected ? 'bg-blue-50 border-blue-300' : ''}
                        >
                          {isSelected ? (
                            <>
                              <Check className="h-4 w-4 mr-2" />
                              Ausgewählt
                            </>
                          ) : (
                            'Vergleichen'
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
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

            {/* Disclaimer */}
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

export default Vergleich;
