
import { useState, useMemo } from "react";
import { Filter, Star, Check, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useStreaming } from "@/hooks/useStreaming";
import { useLeagues } from "@/hooks/useLeagues";

interface EnhancedFilters {
  paymentMode: 'monthly' | 'yearly';
  selectedLeagues: string[];
  features: {
    fourK: boolean;
    offline: boolean;
    mobile: boolean;
    smartTV: boolean;
  };
  sortBy: string;
}

const EnhancedVergleich = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filters, setFilters] = useState<EnhancedFilters>({
    paymentMode: 'monthly',
    selectedLeagues: [],
    features: { fourK: false, offline: false, mobile: false, smartTV: false },
    sortBy: 'relevance'
  });

  const { providers, loading: providersLoading } = useStreaming();
  const { leagues, loading: leaguesLoading } = useLeagues();

  const parsePrice = (priceString?: string): number => {
    if (!priceString) return 0;
    return parseFloat(priceString.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
  };

  const parseFeatures = (provider: any) => {
    const features = { fourK: false, offline: false, mobile: false, smartTV: false };
    if (provider.features) {
      try {
        const featureObj = typeof provider.features === 'string' 
          ? JSON.parse(provider.features) 
          : provider.features;
        
        features.fourK = featureObj['4K'] || false;
        features.offline = featureObj['offline'] || featureObj['download'] || false;
        features.mobile = featureObj['mobile'] || false;
        features.smartTV = featureObj['smartTV'] || featureObj['smart_tv'] || false;
      } catch (e) {
        // Fallback features
      }
    }
    return features;
  };

  const getProviderCoverage = (provider: any, selectedLeagues: string[]) => {
    if (selectedLeagues.length === 0) return { totalGames: 0, coveredGames: 0, percentage: 0, details: [] };
    
    let totalGames = 0;
    let coveredGames = 0;
    const details: Array<{league: string, total: number, covered: number, percentage: number}> = [];
    
    selectedLeagues.forEach(leagueSlug => {
      const league = leagues.find(l => l.league_slug === leagueSlug);
      const totalLeagueGames = league ? league['number of games'] : 0;
      const providerGames = provider[leagueSlug] || 0;
      const covered = Math.min(providerGames, totalLeagueGames);
      const percentage = totalLeagueGames > 0 ? Math.round((covered / totalLeagueGames) * 100) : 0;
      
      details.push({
        league: league?.league || leagueSlug,
        total: totalLeagueGames,
        covered,
        percentage
      });
      
      totalGames += totalLeagueGames;
      coveredGames += covered;
    });

    const overallPercentage = totalGames > 0 ? Math.round((coveredGames / totalGames) * 100) : 0;
    return { totalGames, coveredGames, percentage: overallPercentage, details };
  };

  const filteredProviders = useMemo(() => {
    let filtered = providers.filter(provider => {
      const features = parseFeatures(provider);
      
      // Feature filters
      if (filters.features.fourK && !features.fourK) return false;
      if (filters.features.offline && !features.offline) return false;
      if (filters.features.mobile && !features.mobile) return false;
      if (filters.features.smartTV && !features.smartTV) return false;
      
      // League filters - provider must have coverage for at least one selected league
      if (filters.selectedLeagues.length > 0) {
        const hasAnyCoverage = filters.selectedLeagues.some(league => (provider[league] || 0) >= 1);
        if (!hasAnyCoverage) return false;
      }
      
      return true;
    });

    // Sorting
    filtered.sort((a, b) => {
      const priceA = parsePrice(filters.paymentMode === 'monthly' ? a.monthly_price : a.yearly_price);
      const priceB = parsePrice(filters.paymentMode === 'monthly' ? b.monthly_price : b.yearly_price);
      const coverageA = getProviderCoverage(a, filters.selectedLeagues);
      const coverageB = getProviderCoverage(b, filters.selectedLeagues);
      
      switch (filters.sortBy) {
        case 'price-asc':
          return priceA - priceB;
        case 'price-desc':
          return priceB - priceA;
        case 'games':
          return coverageB.coveredGames - coverageA.coveredGames;
        case 'relevance':
        default:
          return coverageB.percentage - coverageA.percentage;
      }
    });

    return filtered;
  }, [providers, filters, leagues]);

  const updateFilters = (updates: Partial<EnhancedFilters>) => {
    setFilters(prev => ({ ...prev, ...updates }));
  };

  const toggleLeague = (leagueSlug: string) => {
    const newLeagues = filters.selectedLeagues.includes(leagueSlug)
      ? filters.selectedLeagues.filter(l => l !== leagueSlug)
      : [...filters.selectedLeagues, leagueSlug];
    updateFilters({ selectedLeagues: newLeagues });
  };

  const updateFeature = (feature: keyof EnhancedFilters['features'], value: boolean) => {
    updateFilters({
      features: { ...filters.features, [feature]: value }
    });
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
            Streaming-Anbieter Vergleich v2
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Finde den perfekten Streaming-Service für deine Lieblings-Ligen
          </p>
        </div>

        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Filter</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Payment Toggle */}
                <div>
                  <h4 className="font-medium mb-3">Zahlungsweise</h4>
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => updateFilters({ paymentMode: 'monthly' })}
                      className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                        filters.paymentMode === 'monthly'
                          ? 'bg-white text-green-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Monatlich
                    </button>
                    <button
                      onClick={() => updateFilters({ paymentMode: 'yearly' })}
                      className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                        filters.paymentMode === 'yearly'
                          ? 'bg-white text-green-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Jährlich
                    </button>
                  </div>
                </div>

                {/* League Filter */}
                <div>
                  <h4 className="font-medium mb-3">Wettbewerbe</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {leagues.map((league) => (
                      <div key={league.league_slug} className="flex items-center space-x-2">
                        <Checkbox
                          id={league.league_slug}
                          checked={filters.selectedLeagues.includes(league.league_slug || '')}
                          onCheckedChange={() => toggleLeague(league.league_slug || '')}
                        />
                        <label 
                          htmlFor={league.league_slug} 
                          className="text-sm cursor-pointer flex-1 truncate"
                        >
                          {league.league}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Feature Filter */}
                <div>
                  <h4 className="font-medium mb-3">Features</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm">4K Streaming</label>
                      <Switch
                        checked={filters.features.fourK}
                        onCheckedChange={(checked) => updateFeature('fourK', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm">Offline-Viewing</label>
                      <Switch
                        checked={filters.features.offline}
                        onCheckedChange={(checked) => updateFeature('offline', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm">Mobile App</label>
                      <Switch
                        checked={filters.features.mobile}
                        onCheckedChange={(checked) => updateFeature('mobile', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm">Smart TV App</label>
                      <Switch
                        checked={filters.features.smartTV}
                        onCheckedChange={(checked) => updateFeature('smartTV', checked)}
                      />
                    </div>
                  </div>
                </div>

                {/* Sort Options */}
                <div>
                  <h4 className="font-medium mb-3">Sortierung</h4>
                  <Select value={filters.sortBy} onValueChange={(value) => updateFilters({ sortBy: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevance">Relevanz</SelectItem>
                      <SelectItem value="price-asc">Preis ↑</SelectItem>
                      <SelectItem value="price-desc">Preis ↓</SelectItem>
                      <SelectItem value="games">Abgedeckte Spiele</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600">
                {filteredProviders.length} Anbieter gefunden
              </p>
            </div>

            {/* Provider Cards */}
            <div className="space-y-4">
              {filteredProviders.map((provider) => {
                const price = parsePrice(filters.paymentMode === 'monthly' ? provider.monthly_price : provider.yearly_price);
                const features = parseFeatures(provider);
                const coverage = getProviderCoverage(provider, filters.selectedLeagues);
                const isTopDeal = coverage.percentage >= 90 && filters.selectedLeagues.length > 0;

                return (
                  <Card key={provider.streamer_id} className="hover:shadow-lg transition-all duration-200">
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
                            <CardTitle className="text-xl flex items-center gap-2">
                              {provider.provider_name}
                              {isTopDeal && (
                                <Badge className="bg-orange-500 text-white">Top-Deal</Badge>
                              )}
                            </CardTitle>
                            <CardDescription>{provider.name}</CardDescription>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600">
                            ab {price.toFixed(2)}€
                          </div>
                          <div className="text-sm text-gray-500">
                            {filters.paymentMode === 'monthly' ? 'pro Monat' : 'pro Jahr'}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      {/* Features */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {features.fourK && <Badge variant="secondary">4K</Badge>}
                        {features.mobile && <Badge variant="secondary">Mobile App</Badge>}
                        {features.offline && <Badge variant="secondary">Offline</Badge>}
                        {features.smartTV && <Badge variant="secondary">Smart TV</Badge>}
                      </div>

                      {/* Coverage Accordion */}
                      {filters.selectedLeagues.length > 0 && (
                        <Accordion type="single" collapsible className="mb-4">
                          <AccordionItem value="coverage">
                            <AccordionTrigger className="text-sm">
                              Abgedeckte Wettbewerbe ({coverage.percentage}% - {coverage.coveredGames}/{coverage.totalGames} Spiele)
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-2">
                                {coverage.details.map((detail, idx) => (
                                  <div key={idx} className="flex justify-between items-center text-sm">
                                    <span>{detail.league}</span>
                                    <div className="flex items-center gap-2">
                                      <span className="text-gray-600">
                                        {detail.covered}/{detail.total}
                                      </span>
                                      <Badge 
                                        variant={detail.percentage >= 90 ? 'default' : detail.percentage >= 50 ? 'secondary' : 'outline'}
                                        className={
                                          detail.percentage >= 90 ? 'bg-green-500' : 
                                          detail.percentage >= 50 ? 'bg-orange-500' : 
                                          'bg-red-500 text-white'
                                        }
                                      >
                                        {detail.percentage}%
                                      </Badge>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      )}

                      <Button 
                        className="w-full bg-green-600 hover:bg-green-700"
                        onClick={() => {
                          const affiliateUrl = `${provider.affiliate_url}${provider.affiliate_url?.includes('?') ? '&' : '?'}affiliate=matchkompass`;
                          window.open(affiliateUrl, '_blank');
                        }}
                      >
                        Jetzt bestellen
                      </Button>
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
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default EnhancedVergleich;
