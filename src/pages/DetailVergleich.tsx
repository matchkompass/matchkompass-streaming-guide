import { useState, useMemo, useEffect } from "react";
import { Download, Filter, Pin, X, Check, Star, TrendingUp, Sliders } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useStreamingEnhanced } from "@/hooks/useStreamingEnhanced";
import { useLeaguesEnhanced } from "@/hooks/useLeaguesEnhanced";
import { useIsMobile } from "@/hooks/use-mobile";
import DetailComparisonSidebar from "@/components/comparison/DetailComparisonSidebar";

const DetailVergleich2 = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pinnedProviders, setPinnedProviders] = useState<number[]>([]);
  const [expandedProvider, setExpandedProvider] = useState<number | null>(null);
  const [filters, setFilters] = useState({
    leagues: [] as string[],
    providers: [] as number[],
    priceRange: [0, 100] as [number, number],
    features: {
      fourK: false,
      mobile: false,
      download: false,
      multiStream: false,
    },
  });
  const { providers, loading: providersLoading } = useStreamingEnhanced();
  const { leagues, loading: leaguesLoading } = useLeaguesEnhanced();
  const isMobile = useIsMobile();

  // Preselect all providers and leagues after data is loaded
  useEffect(() => {
    if (providers.length > 0 && filters.providers.length === 0) {
      setFilters(prev => ({
        ...prev,
        providers: providers.map(p => p.streamer_id)
      }));
    }
  }, [providers]);

  // By default all leagues should be selected (but not ticked) - this means empty array shows all
  useEffect(() => {
    if (leagues.length > 0 && filters.leagues.length === 0) {
      // Don't preselect leagues - empty array means show all
      setFilters(prev => ({
        ...prev,
        leagues: []
      }));
    }
  }, [leagues]);

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
      } catch (e) {}
    }
    return features;
  };

  const getProviderCoverage = (provider: any, leagueSlug: string) => {
    const league = leagues.find(l => l.league_slug === leagueSlug);
    const totalGames = league?.['number of games'] || 0;
    const coveredGames = (provider[leagueSlug] as number) || 0;
    const percentage = totalGames > 0 ? Math.round((coveredGames / totalGames) * 100) : 0;
    return { coveredGames, totalGames, percentage };
  };

  const calculateCostPerGame = (provider: any) => {
    const monthlyPrice = parsePrice(provider.monthly_price);
    let totalGames = 0;
    
    const leaguesToCheck = filters.leagues.length > 0 ? filters.leagues : leagues.map(l => l.league_slug);
    leaguesToCheck.forEach(leagueSlug => {
      const coverage = getProviderCoverage(provider, leagueSlug);
      totalGames += coverage.coveredGames;
    });
    
    return totalGames > 0 ? monthlyPrice / totalGames : 0;
  };

  const filteredProviders = useMemo(() => {
    let filtered = providers.filter(provider => {
      // Provider filter
      if (!filters.providers.includes(provider.streamer_id)) return false;
      
      // Price filter
      const monthly = parsePrice(provider.monthly_price);
      if (monthly < filters.priceRange[0] || monthly > filters.priceRange[1]) return false;
      
      // Feature filters
      const features = parseFeatures(provider);
      if (filters.features.fourK && !features.fourK) return false;
      if (filters.features.mobile && !features.mobile) return false;
      if (filters.features.download && !features.download) return false;
      if (filters.features.multiStream && !features.multiStream) return false;
      
      // League filter - if no leagues selected, show all providers
      // if leagues are selected, provider must cover at least one selected league
      if (filters.leagues.length > 0) {
        return filters.leagues.some(league => (provider[league] || 0) > 0);
      }
      
      return true;
    });
    return filtered;
  }, [providers, filters]);

  // Find best price-performance ratio
  const bestValueProvider = useMemo(() => {
    if (filteredProviders.length === 0) return null;
    return filteredProviders.reduce((best, current) => {
      const currentCost = calculateCostPerGame(current);
      const bestCost = calculateCostPerGame(best);
      return currentCost < bestCost && currentCost > 0 ? current : best;
    });
  }, [filteredProviders, filters.leagues]);

  const displayProviders = useMemo(() => {
    const pinned = filteredProviders.filter(p => pinnedProviders.includes(p.streamer_id));
    const unpinned = filteredProviders.filter(p => !pinnedProviders.includes(p.streamer_id));
    return [...pinned, ...unpinned];
  }, [filteredProviders, pinnedProviders]);

  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  const togglePin = (providerId: number) => {
    setPinnedProviders(prev => 
      prev.includes(providerId) 
        ? prev.filter(id => id !== providerId)
        : [...prev, providerId]
    );
  };
  
  const toggleExpanded = (providerId: number) => {
    setExpandedProvider(prev => prev === providerId ? null : providerId);
  };


  const groupedLeagues = useMemo(() => {
    const grouped: { [key: string]: typeof leagues } = {};
    leagues.forEach(league => {
      const country = league.country || 'International';
      if (!grouped[country]) grouped[country] = [];
      grouped[country].push(league);
    });
    
    // Sort by popularity within each group
    Object.keys(grouped).forEach(country => {
      grouped[country].sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    });
    
    return grouped;
  }, [leagues]);

  const getCellBackgroundColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-100 text-green-800';
    if (percentage >= 70) return 'bg-yellow-100 text-yellow-800';
    if (percentage >= 50) return 'bg-orange-100 text-orange-800';
    if (percentage > 0) return 'bg-red-100 text-red-800';
    return 'bg-gray-50 text-gray-500';
  };

  if (providersLoading || leaguesLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Lade Vergleichsdaten...</p>
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
            Detaillierter Streaming-Vergleich
          </h1>
          <p className="text-sm text-gray-600">
            Vergleichen Sie Streaming-Anbieter Seite an Seite
          </p>
        </div>
        {/* Table and rest of layout remain unchanged */}
        {isMobile ? (
          <div className="flex flex-col gap-4">
            {/* Mobile filter button */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Filter Ergebnisse</h2>
              <Button 
                variant="outline"
                onClick={() => setSidebarOpen(true)}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>

            {/* Mobile sidebar */}
            {sidebarOpen && (
              <DetailComparisonSidebar
                filters={filters}
                onFiltersChange={handleFiltersChange}
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
              />
            )}

            {displayProviders.map((provider) => {
              const price = parsePrice(provider.monthly_price);
              const features = parseFeatures(provider);
              const sortedLeagues = [...leagues].sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
              const dynamicLeaguesList = sortedLeagues.map(league => ({
                key: league.league_slug,
                label: league.league,
                icon: '🏆',
                covered: provider[league.league_slug] > 0
              }));
              const isExpanded = expandedProvider === provider.streamer_id;
              const isPinned = pinnedProviders.includes(provider.streamer_id);
              return (
                <Card key={provider.streamer_id} className="shadow-md">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{provider.logo_url ? <img src={provider.logo_url} alt={provider.name} className="w-8 h-8 object-contain rounded-full bg-white border" /> : "🔵"}</span>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-0.5">{provider.name}</h3>
                        <div className="text-xs text-gray-500">€{price.toFixed(2)}/Monat</div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => togglePin(provider.streamer_id)}
                          className={isPinned ? "bg-green-50 border-green-300" : ""}
                        >
                          <Pin className={`h-4 w-4 ${isPinned ? "text-green-600" : ""}`} />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleExpanded(provider.streamer_id)}
                        >
                          {isExpanded ? "Weniger" : "Details"}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      {dynamicLeaguesList.slice(0, isExpanded ? dynamicLeaguesList.length : 8).map(league => (
                        <div key={league.key} className="flex items-center gap-1">
                          <span className="text-sm">{league.icon}</span>
                          <span className="text-xs text-gray-600 flex-1">{league.label}</span>
                          <div className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs bg-gray-100">
                            {league.covered ? "✔️" : "✖️"}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {isExpanded && (
                      <div className="mt-4 space-y-3 border-t pt-3">
                        <div>
                          <h4 className="text-sm font-semibold mb-2">Preise</h4>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>Monatlich: €{price.toFixed(2)}</div>
                            <div>Jährlich: €{parsePrice(provider.yearly_price).toFixed(2)}</div>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold mb-2">Highlights</h4>
                          <div className="space-y-1">
                            {provider.highlights?.highlight_1 && (
                              <div className="text-xs text-green-700 bg-green-100 rounded px-2 py-1">
                                {provider.highlights.highlight_1}
                              </div>
                            )}
                            {provider.highlights?.highlight_2 && (
                              <div className="text-xs text-blue-700 bg-blue-100 rounded px-2 py-1">
                                {provider.highlights.highlight_2}
                              </div>
                            )}
                            {provider.highlights?.highlight_3 && (
                              <div className="text-xs text-purple-700 bg-purple-100 rounded px-2 py-1">
                                {provider.highlights.highlight_3}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex flex-wrap gap-2 mt-2">
                      {features.fourK && <Badge className="bg-green-100 text-green-800">4K</Badge>}
                      {features.mobile && <Badge className="bg-blue-100 text-blue-800">Mobile</Badge>}
                      {features.download && <Badge className="bg-purple-100 text-purple-800">Download</Badge>}
                      {features.streams > 1 && <Badge className="bg-orange-100 text-orange-800">{features.streams} Streams</Badge>}
                    </div>
                    <Button className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white text-sm py-2" onClick={() => window.open(provider.affiliate_url, '_blank')}>
                      Zum Anbieter
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="flex gap-6">
            <div className="w-72 min-w-[16rem] flex-shrink-0">
              <DetailComparisonSidebar
                filters={filters}
                onFiltersChange={handleFiltersChange}
                isOpen={true}
                onClose={() => {}}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="bg-white rounded-lg border overflow-auto">
                <div className="relative">
                  <table className="w-full min-w-[1200px]">
                    <thead>
                      {/* Provider Logo/Name Row */}
                      <tr className="border-b sticky top-0 bg-white z-20">
                        <th className="w-40 p-3 bg-gray-50 font-medium border-r text-sm text-left sticky left-0 z-30"></th>
                        {displayProviders.map(provider => {
                          const isPinned = pinnedProviders.includes(provider.streamer_id);
                          return (
                            <th key={provider.streamer_id} className="w-48 p-3 text-center border-r last:border-r-0 bg-white">
                              <div className="flex flex-col items-center justify-center">
                                {provider.logo_url ? (
                                  <img src={provider.logo_url} alt={provider.name} className="w-10 h-10 object-contain rounded-full bg-white border mb-1" />
                                ) : (
                                  <span className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-200 mb-1">📺</span>
                                )}
                                <span className="text-sm font-semibold text-gray-900">{provider.name}</span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => togglePin(provider.streamer_id)}
                                  className={isPinned ? "bg-green-50 border-green-300 mt-2" : "mt-2"}
                                  aria-label={isPinned ? "Unpin provider" : "Pin provider"}
                                >
                                  <Pin className={`h-4 w-4 ${isPinned ? "text-green-600" : ""}`} />
                                </Button>
                              </div>
                            </th>
                          );
                        })}
                      </tr>
                      {/* Jetzt abonnieren Button Row */}
                      <tr className="border-b sticky top-[73px] bg-white z-20">
                        <th className="w-40 p-3 bg-gray-50 font-medium border-r text-sm text-left sticky left-0 z-30">Jetzt abonnieren</th>
                        {displayProviders.map(provider => (
                          <td key={provider.streamer_id} className="w-48 p-3 text-center border-r last:border-r-0 bg-white">
                            {provider.affiliate_url && (
                              <Button className="w-full bg-green-600 hover:bg-green-700 text-white text-sm py-2" onClick={() => window.open(provider.affiliate_url, '_blank')}>
                                Jetzt abonnieren
                              </Button>
                            )}
                          </td>
                        ))}
                      </tr>
                    </thead>
                    <tbody>

                      {/* Highlights Section */}
                      <tr className="border-b">
                        <td className="w-40 p-3 bg-gray-50 font-medium border-r text-sm sticky left-0 z-10">Highlights</td>
                        {displayProviders.map(provider => (
                          <td key={provider.streamer_id} className="w-48 p-2 border-r last:border-r-0">
                            <div className="space-y-1">
                              {provider.highlights?.highlight_1 && (
                                <div className="text-xs text-green-700 bg-green-100 rounded px-2 py-1">
                                  {provider.highlights.highlight_1}
                                </div>
                              )}
                              {provider.highlights?.highlight_2 && (
                                <div className="text-xs text-blue-700 bg-blue-100 rounded px-2 py-1">
                                  {provider.highlights.highlight_2}
                                </div>
                              )}
                              {provider.highlights?.highlight_3 && (
                                <div className="text-xs text-purple-700 bg-purple-100 rounded px-2 py-1">
                                  {provider.highlights.highlight_3}
                                </div>
                              )}
                            </div>
                          </td>
                        ))}
                      </tr>

                      {/* Monthly Price Section */}
                      <tr className="border-b">
                        <td className="w-40 p-3 bg-gray-50 font-medium border-r text-sm sticky left-0 z-10">Monatlicher Preis</td>
                        {displayProviders.map(provider => (
                          <td key={provider.streamer_id} className="w-48 p-3 text-center border-r last:border-r-0">
                            <span className="text-sm font-semibold text-green-600">
                              {parsePrice(provider.monthly_price).toFixed(2)}€
                            </span>
                          </td>
                        ))}
                      </tr>

                      {/* Yearly Price Section */}
                      <tr className="border-b">
                        <td className="w-40 p-3 bg-gray-50 font-medium border-r text-sm sticky left-0 z-10">Jährlicher Preis</td>
                        {displayProviders.map(provider => (
                          <td key={provider.streamer_id} className="w-48 p-3 text-center border-r last:border-r-0">
                            <span className="text-sm font-semibold">
                              {parsePrice(provider.yearly_price).toFixed(2)}€
                            </span>
                            {provider.yearly_price && provider.monthly_price && (
                              <div className="text-xs text-gray-500 mt-1">
                                Ersparnis: {(parsePrice(provider.monthly_price) * 12 - parsePrice(provider.yearly_price)).toFixed(0)}€
                              </div>
                            )}
                          </td>
                        ))}
                      </tr>

                      {/* Cost Per Game Section */}
                      <tr className="border-b">
                        <td className="w-40 p-3 bg-gray-50 font-medium border-r text-sm sticky left-0 z-10">Kosten pro Spiel</td>
                        {displayProviders.map(provider => (
                          <td key={provider.streamer_id} className="w-48 p-3 text-center border-r last:border-r-0">
                            <span className="text-sm font-semibold text-blue-600">
                              {calculateCostPerGame(provider).toFixed(2)}€
                            </span>
                            <div className="text-xs text-gray-500">pro Spiel</div>
                          </td>
                        ))}
                      </tr>

                      {/* Features Section */}
                      <tr className="border-b">
                        <td className="w-40 p-3 bg-gray-50 font-medium border-r text-sm sticky left-0 z-10">Features</td>
                        {displayProviders.map(provider => {
                          const features = parseFeatures(provider);
                          return (
                            <td key={provider.streamer_id} className="w-48 p-2 border-r last:border-r-0">
                              <div className="grid grid-cols-1 gap-1 text-xs">
                                <div className="flex items-center gap-1">
                                  {features.fourK ? <Check className="h-3 w-3 text-green-600" /> : <X className="h-3 w-3 text-red-500" />}
                                  4K
                                </div>
                                <div className="flex items-center gap-1">
                                  {features.mobile ? <Check className="h-3 w-3 text-green-600" /> : <X className="h-3 w-3 text-red-500" />}
                                  Mobile
                                </div>
                                <div className="flex items-center gap-1">
                                  {features.download ? <Check className="h-3 w-3 text-green-600" /> : <X className="h-3 w-3 text-red-500" />}
                                  Download
                                </div>
                                <div className="flex items-center gap-1">
                                  {features.multiStream ? <Check className="h-3 w-3 text-green-600" /> : <X className="h-3 w-3 text-red-500" />}
                                  Multi ({features.streams})
                                </div>
                              </div>
                            </td>
                          );
                        })}
                      </tr>

                      {/* Leagues Section */}
                      <tr>
                        <td colSpan={displayProviders.length + 1} className="p-0">
                          <div className="border-b">
                            <div className="flex bg-gray-100">
                              <div className="w-40 p-3 font-semibold border-r text-sm sticky left-0 z-10">Ligen & Wettbewerbe</div>
                              <div className="flex-1 p-3 text-center text-xs text-gray-600">
                                Abdeckung (Spiele / gesamt)
                              </div>
                            </div>
                            
                            {Object.entries(groupedLeagues).map(([country, countryLeagues]) => (
                              <div key={country}>
                                {/* Country Header */}
                                <div className="flex bg-gray-50">
                                  <div className="w-40 p-2 font-medium border-r text-xs text-gray-700 sticky left-0 z-10">
                                    {country}
                                  </div>
                                  {displayProviders.map(() => (
                                    <div key={country} className="w-48 border-r last:border-r-0"></div>
                                  ))}
                                </div>
                                
                                {/* League Rows */}
                                {countryLeagues
                                  .filter(league => filters.leagues.length === 0 || filters.leagues.includes(league.league_slug || ''))
                                  .map(league => (
                                    <div key={league.league_slug} className="flex">
                                      <div className="w-40 p-2 border-r border-b sticky left-0 z-10 bg-white">
                                        <span className="text-xs">{league.league}</span>
                                      </div>
                                      {displayProviders.map(provider => {
                                        const coverage = getProviderCoverage(provider, league.league_slug || '');
                                        return (
                                          <div key={provider.streamer_id} className="w-48 p-2 text-center border-r last:border-r-0 border-b">
                                            <div className={`inline-flex items-center px-2 py-1 rounded text-xs ${getCellBackgroundColor(coverage.percentage)}`}>
                                              {coverage.percentage}%
                                              <span className="ml-1">({coverage.coveredGames}/{coverage.totalGames})</span>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  ))}
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>

                      {/* Final CTA Section */}
                      <tr>
                        <td className="w-40 p-3 bg-gray-50 font-semibold border-r text-sm sticky left-0 z-10">Angebot</td>
                        {displayProviders.map(provider => (
                          <td key={provider.streamer_id} className="w-48 p-3 text-center border-r last:border-r-0">
                            <Button 
                              className="w-full bg-green-600 hover:bg-green-700 text-white text-sm py-2"
                              onClick={() => window.open(provider.affiliate_url, '_blank')}
                            >
                              Zum Angebot*
                            </Button>
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="mt-3 text-xs text-gray-500 text-center">
                * Affiliate-Links: Wir erhalten eine Provision bei Abschluss eines Abonnements über unsere Links.
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default DetailVergleich2;