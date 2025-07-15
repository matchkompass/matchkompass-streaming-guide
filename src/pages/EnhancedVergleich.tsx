// Minor change: Triggering a commit for push
import React, { useState, useMemo } from "react";
import { Filter, Star, Check, X, Menu, Euro, Calendar, Tv, ChevronUp, ChevronDown, Pin } from "lucide-react";
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
  const [pinnedProviders, setPinnedProviders] = useState<number[]>([]);

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

  // Helper to get flag for a league_slug
  const getFlagForLeague = (league_slug: string) => LEAGUE_CLUSTERS.flatMap(c => c.leagues).find(l => l.slug === league_slug)?.flag || "🏆";

  const filteredProviders = useMemo(() => {
    let filtered = providers.filter(provider => {
      const price = parsePrice(paymentType === 'yearly' ? provider.yearly_price : provider.monthly_price);
      const features = parseFeatures(provider);
      // Price filter
      if (price < filters.priceRange[0] || price > filters.priceRange[1]) return false;
      // Feature filters
      if (filters.features.fourK && !features.fourK) return false;
      if (filters.features.mobile && !features.mobile) return false;
      if (filters.features.download && !features.download) return false;
      if (filters.features.multiStream && !features.multiStream) return false;
      if (features.streams < filters.simultaneousStreams) return false;
      // Competition filter (use competition slugs directly)
      if (filters.competitions.length > 0) {
        for (const compSlug of filters.competitions) {
          if (!provider[compSlug] || provider[compSlug] <= 0) {
            return false;
          }
        }
      }
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

  // Pinning logic
  const togglePin = (providerId: number) => {
    setPinnedProviders(prev =>
      prev.includes(providerId)
        ? prev.filter(id => id !== providerId)
        : [...prev, providerId]
    );
  };

  // Sort providers: pinned first
  const displayProviders = useMemo(() => {
    const pinned = filteredProviders.filter(p => pinnedProviders.includes(p.streamer_id));
    const unpinned = filteredProviders.filter(p => !pinnedProviders.includes(p.streamer_id));
    return [...pinned, ...unpinned];
  }, [filteredProviders, pinnedProviders]);

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
              {/* Main provider/league display */}
              {isMobile ? (
                <div className="space-y-4">
                  {displayProviders.map((provider) => {
                    const price = parsePrice(provider.monthly_price);
                    const yearlyPrice = parsePrice(provider.yearly_price);
                    const features = parseFeatures(provider);
                    const sortedLeagues = [...leagues].sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
                    const dynamicLeaguesList = sortedLeagues.map(league => ({
                      key: league.league_slug,
                      label: league.league,
                      icon: league.icon || getFlagForLeague(league.league_slug),
                      covered: provider[league.league_slug] > 0
                    }));
                    const isExpanded = expandedMobileCard === provider.streamer_id;
                    const isPinned = pinnedProviders.includes(provider.streamer_id);
                    return (
                      <Card key={provider.streamer_id} className="shadow-md">
                        <CardHeader className="pb-4">
                          <div className="flex items-center gap-3 mb-3">
                            {provider.logo_url ? (
                              <img src={provider.logo_url} alt={provider.provider_name} className="w-10 h-10 object-contain rounded-full bg-white border" />
                            ) : (
                              <span className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-200">📺</span>
                            )}
                            <div>
                              <h3 className="font-bold text-lg">{provider.name}</h3>
                              <div className="text-sm text-gray-600">
                                €{price.toFixed(2)}/Monat
                                {yearlyPrice > 0 && (
                                  <span className="ml-2 text-green-600">
                                    • €{yearlyPrice.toFixed(2)}/Jahr
                                  </span>
                                )}
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => togglePin(provider.streamer_id)}
                              className={isPinned ? "bg-green-50 border-green-300 ml-auto" : "ml-auto"}
                              aria-label={isPinned ? "Unpin provider" : "Pin provider"}
                            >
                              <Pin className={`h-4 w-4 ${isPinned ? "text-green-600" : ""}`} />
                            </Button>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 mb-3">
                            {features.fourK && <Badge className="bg-green-100 text-green-800 text-xs">4K</Badge>}
                            {features.mobile && <Badge className="bg-blue-100 text-blue-800 text-xs">Mobile</Badge>}
                            {features.download && <Badge className="bg-purple-100 text-purple-800 text-xs">Download</Badge>}
                            {features.streams > 1 && <Badge className="bg-orange-100 text-orange-800 text-xs">{features.streams} Streams</Badge>}
                          </div>

                          <div className="grid grid-cols-2 gap-2 mb-3">
                            {dynamicLeaguesList.slice(0, 8).map(league => {
                              const leagueData = leagues.find(l => l.league_slug === league.key);
                              const totalGames = leagueData ? leagueData['number of games'] : 0;
                              const providerGames = provider[league.key] || 0;
                              const isFullCoverage = providerGames >= totalGames && totalGames > 0;
                              
                              return (
                                <div key={league.key} className="flex items-center gap-2">
                                  <span className="text-sm">{league.icon}</span>
                                  <span className="text-xs text-gray-600 flex-1 truncate">{league.label}</span>
                                  <div className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs bg-gray-100 flex-shrink-0">
                                    {league.covered ? (isFullCoverage ? "✔️" : "❗") : "✖️"}
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          <Button 
                            className="w-full mb-3 bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => handleAffiliateClick(provider)}
                          >
                            Zum Anbieter
                          </Button>

                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => setExpandedMobileCard(isExpanded ? null : provider.streamer_id)}
                          >
                            {isExpanded ? 'Details ausblenden' : 'Details anzeigen'}
                            {isExpanded ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
                          </Button>
                        </CardHeader>
                        
                        {isExpanded && (
                          <CardContent className="pt-0">
                            <div>
                              <h4 className="font-medium mb-2">Vollständige Liga-Abdeckung:</h4>
                              <div className="grid grid-cols-1 gap-2">
                                {dynamicLeaguesList.map(league => {
                                  const leagueData = leagues.find(l => l.league_slug === league.key);
                                  const totalGames = leagueData ? leagueData['number of games'] : 0;
                                  const providerGames = provider[league.key] || 0;
                                  const percentage = totalGames > 0 ? Math.round((Math.min(providerGames, totalGames) / totalGames) * 100) : 0;
                                  
                                  return (
                                    <div key={league.key} className="flex items-center justify-between text-sm">
                                      <div className="flex items-center space-x-2">
                                        <span>{league.icon}</span>
                                        <span>{league.label}</span>
                                      </div>
                                      <div className={`px-2 py-1 rounded text-xs font-medium ${league.covered ? (percentage >= 100 ? 'text-green-600 bg-green-100' : 'text-orange-600 bg-orange-100') : 'text-gray-400 bg-gray-100'}`}>
                                        {league.covered ? `${percentage}% (${Math.min(providerGames, totalGames)}/${totalGames})` : '0%'}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </CardContent>
                        )}
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {displayProviders.map((provider) => {
                    const price = parsePrice(provider.monthly_price);
                    const yearlyPrice = parsePrice(provider.yearly_price);
                    const features = parseFeatures(provider);
                    const isExpanded = expandedProvider === provider.streamer_id;
                    const isPinned = pinnedProviders.includes(provider.streamer_id);
                    // Dynamic leagues list from DB
                    const dynamicLeaguesList = [...leagues]
                      .sort((a, b) => (a.popularity || 0) - (b.popularity || 0))
                      .map(league => ({
                        key: league.league_slug,
                        label: league.league,
                        icon: league.icon || getFlagForLeague(league.league_slug),
                        covered: provider[league.league_slug] > 0
                      }));
                    // Define features
                    const featuresList = [
                      { key: 'fourK', label: '4K', value: features.fourK },
                      { key: 'mobile', label: 'Mobile', value: features.mobile },
                      { key: 'download', label: 'Download', value: features.download },
                      { key: 'streams', label: `${features.streams} Streams`, value: features.streams > 0 },
                    ];
                    // Helper for check/cross icons
                    const CheckIcon = (
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check h-4 w-4 text-green-600"><path d="M20 6 9 17l-5-5"></path></svg>
                    );
                    const CrossIcon = (
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x h-4 w-4 text-gray-400"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
                    );
                    // Helper for star icon
                    const StarIcon = (
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-star h-4 w-4 text-yellow-500 fill-current"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"></path></svg>
                    );
                    // Helper for expand/collapse icon
                    const ChevronIcon = (
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`lucide lucide-chevron-up h-4 w-4 transition-transform ${isExpanded ? '' : 'rotate-180'}` }><path d="m18 15-6-6-6 6"></path></svg>
                    );
                    return (
                      <div key={provider.streamer_id} className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
                        <div className="flex flex-col space-y-1.5 p-6 pb-4">
                          <div className="flex items-center gap-3 mb-3">
                            {provider.logo_url ? (
                              <img src={provider.logo_url} alt={provider.provider_name} className="w-10 h-10 object-contain rounded-full bg-white border" />
                            ) : (
                              <span className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-200">📺</span>
                            )}
                            <div>
                              <h3 className="font-bold text-lg">{provider.name}</h3>
                              <div className="text-sm text-gray-600">
                                €{price.toFixed(2)}/Monat
                                {yearlyPrice > 0 && (
                                  <span className="ml-2 text-green-600">
                                    • €{yearlyPrice.toFixed(2)}/Jahr
                                  </span>
                                )}
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => togglePin(provider.streamer_id)}
                              className={isPinned ? "bg-green-50 border-green-300 ml-auto" : "ml-auto"}
                              aria-label={isPinned ? "Unpin provider" : "Pin provider"}
                            >
                              <Pin className={`h-4 w-4 ${isPinned ? "text-green-600" : ""}`} />
                            </Button>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 mb-3">
                            {features.fourK && <Badge className="bg-green-100 text-green-800 text-xs">4K</Badge>}
                            {features.mobile && <Badge className="bg-blue-100 text-blue-800 text-xs">Mobile</Badge>}
                            {features.download && <Badge className="bg-purple-100 text-purple-800 text-xs">Download</Badge>}
                            {features.streams > 1 && <Badge className="bg-orange-100 text-orange-800 text-xs">{features.streams} Streams</Badge>}
                          </div>

                          <div className="grid grid-cols-2 gap-2 mb-3">
                            {dynamicLeaguesList.slice(0, 8).map(league => {
                              const leagueData = leagues.find(l => l.league_slug === league.key);
                              const totalGames = leagueData ? leagueData['number of games'] : 0;
                              const providerGames = provider[league.key] || 0;
                              const isFullCoverage = providerGames >= totalGames && totalGames > 0;
                              
                              return (
                                <div key={league.key} className="flex items-center gap-2">
                                  <span className="text-sm">{league.icon}</span>
                                  <span className="text-xs text-gray-600 flex-1 truncate">{league.label}</span>
                                  <div className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs bg-gray-100 flex-shrink-0">
                                    {league.covered ? (isFullCoverage ? CheckIcon : <span className="text-orange-500">❗</span>) : CrossIcon}
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          <Button 
                            className="w-full mb-3 bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => handleAffiliateClick(provider)}
                          >
                            Zum Anbieter
                          </Button>

                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => setExpandedProvider(isExpanded ? null : provider.streamer_id)}
                          >
                            {isExpanded ? 'Details ausblenden' : 'Details anzeigen'}
                            {isExpanded ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
                          </Button>
                        </div>
                        {isExpanded && (
                          <div className="px-6 pb-6 pt-0">
                            {/* Features Section */}
                            <div className="mb-4">
                              <h4 className="font-medium mb-2">Alle Features:</h4>
                              <div className="grid grid-cols-2 gap-2">
                                {featuresList.map(feature => (
                                  <div key={feature.key} className="flex items-center justify-between text-sm">
                                    <span>{feature.label}</span>
                                    {feature.value ? CheckIcon : CrossIcon}
                                  </div>
                                ))}
                              </div>
                            </div>
                            {/* League Coverage Section */}
                            <div className="mb-4">
                              <h4 className="font-medium mb-2">Vollständige Liga-Abdeckung:</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {dynamicLeaguesList.map(league => {
                                  const leagueData = leagues.find(l => l.league_slug === league.key);
                                  const totalGames = leagueData ? leagueData['number of games'] : 0;
                                  const providerGames = provider[league.key] || 0;
                                  const percentage = totalGames > 0 ? Math.round((Math.min(providerGames, totalGames) / totalGames) * 100) : 0;
                                  return (
                                    <div key={league.key} className="flex items-center justify-between text-sm">
                                      <div className="flex items-center space-x-2">
                                        <span>{league.icon}</span>
                                        <span>{league.label}</span>
                                      </div>
                                      <div className={`px-2 py-1 rounded text-xs font-medium ${league.covered ? (percentage >= 100 ? 'text-green-600 bg-green-100' : 'text-orange-600 bg-orange-100') : 'text-gray-400 bg-gray-100'}`}>
                                        {league.covered ? `${percentage}% (${Math.min(providerGames, totalGames)}/${totalGames})` : '0%'}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                            {/* Price Overview Section */}
                            <div className="border-t pt-4">
                              <div className="grid grid-cols-2 gap-4 text-center">
                                <div>
                                  <div className="text-lg font-bold">€{price.toFixed(2)}</div>
                                  <div className="text-xs text-gray-500">Monatlich</div>
                                </div>
                                <div>
                                  <div className="text-lg font-bold text-green-600">€{yearlyPrice ? yearlyPrice.toFixed(2) : (price * 12).toFixed(2)}</div>
                                  <div className="text-xs text-gray-500">Jahrespreis</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
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