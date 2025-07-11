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

const DetailVergleich2 = () => {
  const [selectedLeagues, setSelectedLeagues] = useState<string[]>([]);
  const [selectedProviders, setSelectedProviders] = useState<number[]>([]);
  const [pinnedProviders, setPinnedProviders] = useState<number[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const { providers, loading: providersLoading } = useStreamingEnhanced();
  const { leagues, loading: leaguesLoading } = useLeaguesEnhanced();

  // Preselect all providers and leagues after data is loaded
  useEffect(() => {
    if (providers.length > 0 && selectedProviders.length === 0) {
      setSelectedProviders(providers.map(p => p.streamer_id));
    }
  }, [providers]);

  useEffect(() => {
    if (leagues.length > 0 && selectedLeagues.length === 0) {
      setSelectedLeagues(leagues.map(l => l.league_slug));
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
    
    selectedLeagues.forEach(leagueSlug => {
      const coverage = getProviderCoverage(provider, leagueSlug);
      totalGames += coverage.coveredGames;
    });
    
    return totalGames > 0 ? monthlyPrice / totalGames : 0;
  };

  const filteredProviders = useMemo(() => {
    let filtered = providers.filter(provider => {
      // Provider filter
      if (!selectedProviders.includes(provider.streamer_id)) return false;
      
      // Price filter
      const monthly = parsePrice(provider.monthly_price);
      if (monthly < priceRange[0] || monthly > priceRange[1]) return false;
      
      // Feature filters
      const features = parseFeatures(provider);
      if (selectedFeatures.includes('4K') && !features.fourK) return false;
      if (selectedFeatures.includes('Mobile') && !features.mobile) return false;
      if (selectedFeatures.includes('Download') && !features.download) return false;
      if (selectedFeatures.includes('Multi-Stream') && !features.multiStream) return false;
      
      // League filter
      return selectedLeagues.some(league => (provider[league] || 0) > 0);
    });
    return filtered;
  }, [providers, selectedProviders, selectedLeagues, priceRange, selectedFeatures]);

  // Find best price-performance ratio
  const bestValueProvider = useMemo(() => {
    if (filteredProviders.length === 0) return null;
    return filteredProviders.reduce((best, current) => {
      const currentCost = calculateCostPerGame(current);
      const bestCost = calculateCostPerGame(best);
      return currentCost < bestCost && currentCost > 0 ? current : best;
    });
  }, [filteredProviders, selectedLeagues]);

  const displayProviders = useMemo(() => {
    const pinned = filteredProviders.filter(p => pinnedProviders.includes(p.streamer_id));
    const unpinned = filteredProviders.filter(p => !pinnedProviders.includes(p.streamer_id));
    return [...pinned, ...unpinned];
  }, [filteredProviders, pinnedProviders]);

  const toggleLeague = (leagueSlug: string) => {
    setSelectedLeagues(prev => 
      prev.includes(leagueSlug)
        ? prev.filter(l => l !== leagueSlug)
        : [...prev, leagueSlug]
    );
  };

  const toggleProvider = (providerId: number) => {
    setSelectedProviders(prev => 
      prev.includes(providerId)
        ? prev.filter(id => id !== providerId)
        : [...prev, providerId]
    );
  };

  const togglePin = (providerId: number) => {
    setPinnedProviders(prev => 
      prev.includes(providerId)
        ? prev.filter(id => id !== providerId)
        : [...prev, providerId]
    );
  };

  const toggleFeature = (feature: string) => {
    setSelectedFeatures(prev => 
      prev.includes(feature)
        ? prev.filter(f => f !== feature)
        : [...prev, feature]
    );
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

        <div className="flex gap-6">
          {/* Left Sidebar - Filters */}
          <div className="w-64 space-y-4">
            {/* Price Filter */}
            <Card className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Sliders className="h-4 w-4" />
                Preis
              </h3>
              <div className="space-y-3">
                <div className="px-2">
                  <Slider
                    value={[priceRange[1]]}
                    onValueChange={([value]) => setPriceRange([0, value])}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>
                <div className="text-sm text-gray-600 text-center">
                  Bis {priceRange[1]}€ / Monat
                </div>
              </div>
            </Card>

            {/* Features Filter */}
            <Card className="p-4">
              <h3 className="font-semibold mb-3">Features</h3>
              <div className="space-y-2">
                {['4K', 'Mobile', 'Download', 'Multi-Stream'].map(feature => (
                  <div key={feature} className="flex items-center space-x-2">
                    <Checkbox
                      id={feature}
                      checked={selectedFeatures.includes(feature)}
                      onCheckedChange={() => toggleFeature(feature)}
                    />
                    <Label htmlFor={feature} className="text-sm">{feature}</Label>
                  </div>
                ))}
              </div>
            </Card>

            {/* Providers Filter */}
            <Card className="p-4">
              <h3 className="font-semibold mb-3">Anbieter</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {providers.map(provider => (
                  <div key={provider.streamer_id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`provider-${provider.streamer_id}`}
                      checked={selectedProviders.includes(provider.streamer_id)}
                      onCheckedChange={() => toggleProvider(provider.streamer_id)}
                    />
                    <Label htmlFor={`provider-${provider.streamer_id}`} className="text-sm">
                      {provider.name}
                    </Label>
                  </div>
                ))}
              </div>
            </Card>

            {/* Leagues Filter */}
            <Card className="p-4">
              <h3 className="font-semibold mb-3">Ligen</h3>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {Object.entries(groupedLeagues).map(([country, countryLeagues]) => (
                  <div key={country}>
                    <h4 className="font-medium text-sm text-gray-700 mb-2">{country}</h4>
                    <div className="space-y-1 ml-2">
                      {countryLeagues.map(league => (
                        <div key={league.league_slug} className="flex items-center space-x-2">
                          <Checkbox
                            id={league.league_slug}
                            checked={selectedLeagues.includes(league.league_slug || '')}
                            onCheckedChange={() => toggleLeague(league.league_slug || '')}
                          />
                          <Label htmlFor={league.league_slug} className="text-xs">
                            {league.league}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Main Content - Comparison Table */}
          <div className="flex-1">
            <div className="bg-white rounded-lg border overflow-x-auto">
              <div className="min-w-[1000px]">
                {/* Header Row with Provider Names */}
                <div className="flex border-b">
                  <div className="w-40 p-3 bg-gray-50 font-semibold border-r text-sm">
                    Kriterien
                  </div>
                  {displayProviders.map((provider, index) => (
                    <div key={provider.streamer_id} className={`w-48 p-3 text-center border-r last:border-r-0 ${
                      pinnedProviders.includes(provider.streamer_id) ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'
                    }`}>
                      
                      {/* Ranking Badge and Pin */}
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant={index === 0 ? "default" : "outline"} className="text-xs">
                          {index + 1}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => togglePin(provider.streamer_id)}
                          className={`p-1 h-5 w-5 ${pinnedProviders.includes(provider.streamer_id) ? 'text-blue-600' : 'text-gray-400'}`}
                        >
                          <Pin className="h-3 w-3" />
                        </Button>
                      </div>

                      {/* Provider Logo and Name */}
                      <div className="flex flex-col items-center">
                        {provider.logo_url && (
                          <img 
                            src={provider.logo_url} 
                            alt={provider.name} 
                            className="w-12 h-12 object-contain mb-1 rounded bg-white border" 
                          />
                        )}
                        <h3 className="font-semibold text-sm">{provider.name}</h3>
                        
                        {/* Price-Performance Winner Badge */}
                        {bestValueProvider?.streamer_id === provider.streamer_id && (
                          <Badge className="bg-orange-100 text-orange-800 border-orange-300 text-xs mt-1">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Preis-Leistungs-Sieger
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Anbieter Section */}
                <div className="flex border-b">
                  <div className="w-40 p-3 bg-gray-50 font-medium border-r text-sm">Anbieter</div>
                  {displayProviders.map(provider => (
                    <div key={provider.streamer_id} className="w-48 p-3 text-center border-r last:border-r-0">
                      <span className="font-semibold text-sm">{provider.name}</span>
                    </div>
                  ))}
                </div>

                {/* Highlights Section */}
                <div className="flex border-b">
                  <div className="w-40 p-3 bg-gray-50 font-medium border-r text-sm">Highlights</div>
                  {displayProviders.map(provider => (
                    <div key={provider.streamer_id} className="w-48 p-2 border-r last:border-r-0">
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
                  ))}
                </div>

                {/* Monthly Price Section */}
                <div className="flex border-b">
                  <div className="w-40 p-3 bg-gray-50 font-medium border-r text-sm">Monatlicher Preis</div>
                  {displayProviders.map(provider => (
                    <div key={provider.streamer_id} className="w-48 p-3 text-center border-r last:border-r-0">
                      <span className="text-sm font-semibold text-green-600">
                        {parsePrice(provider.monthly_price).toFixed(2)}€
                      </span>
                    </div>
                  ))}
                </div>

                {/* Yearly Price Section */}
                <div className="flex border-b">
                  <div className="w-40 p-3 bg-gray-50 font-medium border-r text-sm">Jährlicher Preis</div>
                  {displayProviders.map(provider => (
                    <div key={provider.streamer_id} className="w-48 p-3 text-center border-r last:border-r-0">
                      <span className="text-sm font-semibold">
                        {parsePrice(provider.yearly_price).toFixed(2)}€
                      </span>
                      {provider.yearly_price && provider.monthly_price && (
                        <div className="text-xs text-gray-500 mt-1">
                          Ersparnis: {(parsePrice(provider.monthly_price) * 12 - parsePrice(provider.yearly_price)).toFixed(0)}€
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Cost Per Game Section */}
                <div className="flex border-b">
                  <div className="w-40 p-3 bg-gray-50 font-medium border-r text-sm">Kosten pro Spiel</div>
                  {displayProviders.map(provider => (
                    <div key={provider.streamer_id} className="w-48 p-3 text-center border-r last:border-r-0">
                      <span className="text-sm font-semibold text-blue-600">
                        {calculateCostPerGame(provider).toFixed(2)}€
                      </span>
                      <div className="text-xs text-gray-500">pro Spiel</div>
                    </div>
                  ))}
                </div>

                {/* Features Section */}
                <div className="flex border-b">
                  <div className="w-40 p-3 bg-gray-50 font-medium border-r text-sm">Features</div>
                  {displayProviders.map(provider => {
                    const features = parseFeatures(provider);
                    return (
                      <div key={provider.streamer_id} className="w-48 p-2 border-r last:border-r-0">
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
                      </div>
                    );
                  })}
                </div>

                {/* Leagues Section */}
                <div className="border-b">
                  <div className="flex bg-gray-100">
                    <div className="w-40 p-3 font-semibold border-r text-sm">Ligen & Wettbewerbe</div>
                    <div className="flex-1 p-3 text-center text-xs text-gray-600">
                      Abdeckung (Spiele / gesamt)
                    </div>
                  </div>
                  
                  {Object.entries(groupedLeagues).map(([country, countryLeagues]) => (
                    <div key={country}>
                      {/* Country Header */}
                      <div className="flex bg-gray-50">
                        <div className="w-40 p-2 font-medium border-r text-xs text-gray-700">
                          {country}
                        </div>
                        {displayProviders.map(() => (
                          <div key={country} className="w-48 border-r last:border-r-0"></div>
                        ))}
                      </div>
                      
                      {/* League Rows */}
                      {countryLeagues
                        .filter(league => selectedLeagues.includes(league.league_slug || ''))
                        .map(league => (
                          <div key={league.league_slug} className="flex">
                            <div className="w-40 p-2 border-r border-b">
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

                {/* Final CTA Section */}
                <div className="flex">
                  <div className="w-40 p-3 bg-gray-50 font-semibold border-r text-sm">Angebot</div>
                  {displayProviders.map(provider => (
                    <div key={provider.streamer_id} className="w-48 p-3 text-center border-r last:border-r-0">
                      <Button 
                        className="w-full bg-green-600 hover:bg-green-700 text-white text-sm py-2"
                        onClick={() => window.open(provider.affiliate_url, '_blank')}
                      >
                        Zum Angebot*
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="mt-3 text-xs text-gray-500 text-center">
              * Affiliate-Links: Wir erhalten eine Provision bei Abschluss eines Abonnements über unsere Links.
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default DetailVergleich2;