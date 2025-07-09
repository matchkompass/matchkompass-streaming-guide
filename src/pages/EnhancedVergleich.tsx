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
      const price = parsePrice(paymentType === 'yearly' ? provider.yearly_price : provider.monthly_price);
      const features = parseFeatures(provider);
      
      if (price < filters.priceRange[0] || price > filters.priceRange[1]) return false;
      if (filters.features.fourK && !features.fourK) return false;
      if (filters.features.mobile && !features.mobile) return false;
      if (filters.features.download && !features.download) return false;
      if (filters.features.multiStream && features.streams < 2) return false;
      if (features.streams < filters.simultaneousStreams) return false;
      
      return true;
    });

    filtered.sort((a, b) => {
      const priceA = parsePrice(paymentType === 'yearly' ? a.yearly_price : a.monthly_price);
      const priceB = parsePrice(paymentType === 'yearly' ? b.yearly_price : b.monthly_price);
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
          return (b.provider_name.length) - (a.provider_name.length);
        default:
          return (coverageB * 0.7) + ((100 - Math.min(priceB, 100)) * 0.3) - 
                 ((coverageA * 0.7) + ((100 - Math.min(priceA, 100)) * 0.3));
      }
    });

    return filtered;
  }, [providers, filters, leagues, paymentType]);

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
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Streaming-Anbieter Vergleich
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Vergleiche alle wichtigen Streaming-Dienste für Fußball und finde die beste Option
          </p>
        </div>

        <div className="flex gap-6">
          <div className="hidden lg:block w-80 flex-shrink-0">
            <ComparisonSidebar
              filters={filters}
              onFiltersChange={setFilters}
              availableCompetitions={availableCompetitions}
              isOpen={true}
              onClose={() => {}}
            />
          </div>

          <div className="lg:hidden fixed top-20 right-4 z-40">
            <Button
              onClick={() => setSidebarOpen(true)}
              className="bg-green-600 hover:bg-green-700 shadow-lg"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>

          {sidebarOpen && (
            <ComparisonSidebar
              filters={filters}
              onFiltersChange={setFilters}
              availableCompetitions={availableCompetitions}
              isOpen={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
            />
          )}

          <div className="flex-1 space-y-4">
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

            <div className="space-y-4">
              {filteredProviders.map((provider) => {
                const monthlyCost = parsePrice(provider.monthly_price);
                const yearlyCost = parsePrice(provider.yearly_price);
                const features = parseFeatures(provider);
                const overallCoverage = getProviderCoverage(provider, filters.competitions);
                const isSelected = selectedProviders.includes(provider.streamer_id.toString());

                const competitions = filters.competitions.length > 0 ? filters.competitions.map(comp => {
                  const league = leagues.find(l => l.league_slug === comp);
                  const totalGames = league?.['number of games'] || 0;
                  const providerGames = provider[comp] || 0;
                  const coverage = totalGames > 0 ? Math.round((Math.min(providerGames, totalGames) / totalGames) * 100) : 0;
                  
                  return {
                    name: league?.league || comp,
                    coverage,
                    games: `${Math.min(providerGames, totalGames)}/${totalGames}`
                  };
                }) : [];

                const totalGames = competitions.reduce((sum, c) => sum + parseInt(c.games.split('/')[1]), 0);
                const coveredGames = competitions.reduce((sum, c) => sum + parseInt(c.games.split('/')[0]), 0);
                const costPerGame = coveredGames > 0 ? monthlyCost / coveredGames : 0;

                const otherSports = ["Tennis", "Basketball", "Golf", "Formel 1", "UFC", "NFL"].slice(0, 3 + Math.floor(Math.random() * 2));

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
                          <Badge className="bg-blue-100 text-blue-800 mb-2">
                            {overallCoverage}% Abdeckung
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="grid lg:grid-cols-3 gap-6 mb-6">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Euro className="h-4 w-4 text-green-600" />
                            <h4 className="font-semibold text-gray-900">Preise</h4>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Monatlich:</span>
                              <span className="font-semibold text-green-600">€{monthlyCost.toFixed(2)}</span>
                            </div>
                            {yearlyCost > 0 && (
                              <>
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-600">Jährlich:</span>
                                  <span className="font-semibold">€{yearlyCost.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-600">Ersparnis:</span>
                                  <span className="font-semibold text-orange-600">
                                    €{Math.max(0, (monthlyCost * 12) - yearlyCost).toFixed(2)}
                                  </span>
                                </div>
                              </>
                            )}
                            {costPerGame > 0 && (
                              <div className="flex justify-between border-t pt-2">
                                <span className="text-sm text-gray-600">Pro Spiel:</span>
                                <span className="font-semibold">€{costPerGame.toFixed(2)}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {competitions.length > 0 && (
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-blue-600" />
                              <h4 className="font-semibold text-gray-900">Wettbewerbe</h4>
                            </div>
                            <div className="space-y-2">
                              {competitions.slice(0, 4).map((comp, idx) => (
                                <div key={idx} className="flex justify-between items-center">
                                  <span className="text-sm text-gray-700">{comp.name}</span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500">{comp.games}</span>
                                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                                      comp.coverage >= 90 ? 'bg-green-100 text-green-800' :
                                      comp.coverage >= 70 ? 'bg-yellow-100 text-yellow-800' :
                                      comp.coverage > 0 ? 'bg-orange-100 text-orange-800' :
                                      'bg-gray-100 text-gray-500'
                                    }`}>
                                      {comp.coverage}%
                                    </div>
                                  </div>
                                </div>
                              ))}
                              {competitions.length > 4 && (
                                <div className="text-xs text-gray-500 text-center">
                                  +{competitions.length - 4} weitere
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Tv className="h-4 w-4 text-purple-600" />
                            <h4 className="font-semibold text-gray-900">Weitere Inhalte</h4>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {otherSports.map((sport, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {sport}
                              </Badge>
                            ))}
                          </div>
                          
                          <div className="mt-3">
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
                        </div>
                      </div>

                      {(provider.highlight_1 || provider.highlight_2 || provider.highlight_3) && (
                        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                          <h5 className="font-medium text-sm mb-2 text-blue-900">Highlights</h5>
                          <div className="flex flex-wrap gap-2">
                            {provider.highlight_1 && (
                              <HighlightBadge text={provider.highlight_1} priority="primary" className="text-xs" />
                            )}
                            {provider.highlight_2 && (
                              <HighlightBadge text={provider.highlight_2} priority="secondary" className="text-xs" />
                            )}
                            {provider.highlight_3 && (
                              <HighlightBadge text={provider.highlight_3} priority="tertiary" className="text-xs" />
                            )}
                          </div>
                        </div>
                      )}

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
