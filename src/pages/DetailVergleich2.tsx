import { useState, useMemo, useEffect } from "react";
import { Download, Filter, Pin, X, Check, Star, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useStreamingEnhanced } from "@/hooks/useStreamingEnhanced";
import { useLeaguesEnhanced } from "@/hooks/useLeaguesEnhanced";

const DetailVergleich2 = () => {
  const [selectedLeagues, setSelectedLeagues] = useState<string[]>([]);
  const [pinnedProviders, setPinnedProviders] = useState<number[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);
  const [featureFilters, setFeatureFilters] = useState({
    fourK: false,
    mobile: false,
    download: false,
    multiStream: false,
  });
  const { providers, loading: providersLoading } = useStreamingEnhanced();
  const { leagues, loading: leaguesLoading } = useLeaguesEnhanced();

  // Preselect all leagues after leagues are loaded
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
      // Price filter
      const monthly = parsePrice(provider.monthly_price);
      if (monthly < priceRange[0] || monthly > priceRange[1]) return false;
      // Feature filters
      const features = parseFeatures(provider);
      if (featureFilters.fourK && !features.fourK) return false;
      if (featureFilters.mobile && !features.mobile) return false;
      if (featureFilters.download && !features.download) return false;
      if (featureFilters.multiStream && !features.multiStream) return false;
      // League filter
      return selectedLeagues.some(league => (provider[league] || 0) > 0);
    });
    return filtered;
  }, [providers, selectedLeagues, priceRange, featureFilters]);

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

  const togglePin = (providerId: number) => {
    setPinnedProviders(prev => 
      prev.includes(providerId)
        ? prev.filter(id => id !== providerId)
        : [...prev, providerId]
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

  const exportToCSV = () => {
    const headers = ['Liga', ...displayProviders.map(p => p.name)];
    const rows = selectedLeagues.map(leagueSlug => [
      leagues.find(l => l.league_slug === leagueSlug)?.league || leagueSlug,
      ...displayProviders.map(provider => {
        const coverage = getProviderCoverage(provider, leagueSlug);
        return `${coverage.percentage}% (${coverage.coveredGames}/${coverage.totalGames})`;
      })
    ]);
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'streaming-vergleich-detailiert.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Detaillierter Streaming-Vergleich
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Vergleichen Sie Streaming-Anbieter Seite an Seite mit detaillierter Analyse
          </p>
        </div>

        {/* Filter Bar */}
        <div className="mb-6 bg-white rounded-lg border p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">Filter:</span>
            </div>
            
            {/* Price Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm">Preis:</span>
              <input
                type="range"
                min={0}
                max={100}
                value={priceRange[1]}
                onChange={e => setPriceRange([0, Number(e.target.value)])}
                className="w-20"
              />
              <span className="text-sm text-gray-600">bis {priceRange[1]}€</span>
            </div>

            {/* Feature Filters */}
            <div className="flex gap-2">
              {Object.entries(featureFilters).map(([key, value]) => (
                <Badge 
                  key={key}
                  variant={value ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setFeatureFilters(f => ({ ...f, [key]: !f[key] }))}
                >
                  {key === 'fourK' ? '4K' : key === 'multiStream' ? 'Multi-Stream' : key}
                </Badge>
              ))}
            </div>

            <Button onClick={exportToCSV} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="bg-white rounded-lg border overflow-hidden">
          {/* Provider Headers */}
          <div className="flex border-b">
            <div className="w-64 p-4 bg-gray-50 font-semibold border-r">
              Kriterien
            </div>
            {displayProviders.map((provider, index) => (
              <div key={provider.streamer_id} className={`flex-1 min-w-72 p-4 text-center border-r last:border-r-0 ${
                pinnedProviders.includes(provider.streamer_id) ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'
              } ${index < 3 ? 'border-blue-300' : ''}`}>
                
                {/* Ranking Badge */}
                <div className="flex justify-between items-start mb-2">
                  <Badge variant={index === 0 ? "default" : "outline"} className="text-xs">
                    {index + 1}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => togglePin(provider.streamer_id)}
                    className={`p-1 h-6 w-6 ${pinnedProviders.includes(provider.streamer_id) ? 'text-blue-600' : 'text-gray-400'}`}
                  >
                    <Pin className="h-3 w-3" />
                  </Button>
                </div>

                {/* Provider Logo and Name */}
                <div className="flex flex-col items-center mb-3">
                  {provider.logo_url && (
                    <img 
                      src={provider.logo_url} 
                      alt={provider.name} 
                      className="w-16 h-16 object-contain mb-2 rounded-lg bg-white border" 
                    />
                  )}
                  <h3 className="font-semibold text-lg mb-1">{provider.name}</h3>
                  
                  {/* Price-Performance Winner Badge */}
                  {bestValueProvider?.streamer_id === provider.streamer_id && (
                    <Badge className="bg-orange-100 text-orange-800 border-orange-300 mb-2">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Preis-Leistungs-Sieger
                    </Badge>
                  )}
                </div>

                {/* CTA Button */}
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white mb-2"
                  onClick={() => window.open(provider.affiliate_url, '_blank')}
                >
                  Zum Angebot*
                </Button>
                
                {/* Highlight */}
                {provider.highlights?.highlight_1 && (
                  <div className="text-xs text-green-700 bg-green-100 rounded px-2 py-1">
                    {provider.highlights.highlight_1}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Anbieter Name Section */}
          <div className="flex border-b">
            <div className="w-64 p-4 bg-gray-50 font-medium border-r">Anbieter</div>
            {displayProviders.map(provider => (
              <div key={provider.streamer_id} className="flex-1 min-w-72 p-4 text-center border-r last:border-r-0">
                <span className="font-semibold text-lg">{provider.name}</span>
              </div>
            ))}
          </div>

          {/* Monthly Price Section */}
          <div className="flex border-b">
            <div className="w-64 p-4 bg-gray-50 font-medium border-r">Monatlicher Preis</div>
            {displayProviders.map(provider => (
              <div key={provider.streamer_id} className="flex-1 min-w-72 p-4 text-center border-r last:border-r-0">
                <span className="text-lg font-semibold text-green-600">
                  {parsePrice(provider.monthly_price).toFixed(2)}€
                </span>
              </div>
            ))}
          </div>

          {/* Yearly Price Section */}
          <div className="flex border-b">
            <div className="w-64 p-4 bg-gray-50 font-medium border-r">Jährlicher Preis</div>
            {displayProviders.map(provider => (
              <div key={provider.streamer_id} className="flex-1 min-w-72 p-4 text-center border-r last:border-r-0">
                <span className="text-lg font-semibold">
                  {parsePrice(provider.yearly_price).toFixed(2)}€
                </span>
                {provider.yearly_price && provider.monthly_price && (
                  <div className="text-xs text-gray-500 mt-1">
                    Ersparnis: {(parsePrice(provider.monthly_price) * 12 - parsePrice(provider.yearly_price)).toFixed(2)}€
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Cost Per Game Section */}
          <div className="flex border-b">
            <div className="w-64 p-4 bg-gray-50 font-medium border-r">Kosten pro Spiel</div>
            {displayProviders.map(provider => (
              <div key={provider.streamer_id} className="flex-1 min-w-72 p-4 text-center border-r last:border-r-0">
                <span className="text-lg font-semibold text-blue-600">
                  {calculateCostPerGame(provider).toFixed(2)}€
                </span>
                <div className="text-xs text-gray-500 mt-1">pro Spiel</div>
              </div>
            ))}
          </div>

          {/* Features Section */}
          <div className="flex border-b">
            <div className="w-64 p-4 bg-gray-50 font-medium border-r">Features</div>
            {displayProviders.map(provider => {
              const features = parseFeatures(provider);
              return (
                <div key={provider.streamer_id} className="flex-1 min-w-72 p-4 border-r last:border-r-0">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      {features.fourK ? <Check className="h-4 w-4 text-green-600" /> : <X className="h-4 w-4 text-red-500" />}
                      4K Streaming
                    </div>
                    <div className="flex items-center gap-2">
                      {features.mobile ? <Check className="h-4 w-4 text-green-600" /> : <X className="h-4 w-4 text-red-500" />}
                      Mobile App
                    </div>
                    <div className="flex items-center gap-2">
                      {features.download ? <Check className="h-4 w-4 text-green-600" /> : <X className="h-4 w-4 text-red-500" />}
                      Download
                    </div>
                    <div className="flex items-center gap-2">
                      {features.multiStream ? <Check className="h-4 w-4 text-green-600" /> : <X className="h-4 w-4 text-red-500" />}
                      Multi-Stream ({features.streams})
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Leagues Section */}
          <div className="border-b">
            <div className="flex bg-gray-100">
              <div className="w-64 p-4 font-semibold border-r">Ligen & Wettbewerbe</div>
              <div className="flex-1 p-4 text-center text-sm text-gray-600">
                Abdeckung (verfügbare Spiele / gesamt)
              </div>
            </div>
            
            {Object.entries(groupedLeagues).map(([country, countryLeagues]) => (
              <div key={country}>
                {/* Country Header */}
                <div className="flex bg-gray-50">
                  <div className="w-64 p-3 font-medium border-r text-gray-700">
                    {country}
                  </div>
                  {displayProviders.map(() => (
                    <div key={country} className="flex-1 min-w-72 border-r last:border-r-0"></div>
                  ))}
                </div>
                
                {/* League Rows */}
                {countryLeagues
                  .filter(league => selectedLeagues.includes(league.league_slug || ''))
                  .map(league => (
                    <div key={league.league_slug} className="flex">
                      <div className="w-64 p-3 border-r border-b">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={selectedLeagues.includes(league.league_slug || '')}
                            onCheckedChange={() => toggleLeague(league.league_slug || '')}
                          />
                          <span className="text-sm">{league.league}</span>
                        </div>
                      </div>
                      {displayProviders.map(provider => {
                        const coverage = getProviderCoverage(provider, league.league_slug || '');
                        return (
                          <div key={provider.streamer_id} className="flex-1 min-w-72 p-3 text-center border-r last:border-r-0 border-b">
                            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-sm ${getCellBackgroundColor(coverage.percentage)}`}>
                              {coverage.percentage}%
                              <span className="text-xs">({coverage.coveredGames}/{coverage.totalGames})</span>
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
            <div className="w-64 p-4 bg-gray-50 font-semibold border-r">Angebot</div>
            {displayProviders.map(provider => (
              <div key={provider.streamer_id} className="flex-1 min-w-72 p-4 text-center border-r last:border-r-0">
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => window.open(provider.affiliate_url, '_blank')}
                >
                  Zum Angebot*
                </Button>
                {provider.highlights?.highlight_2 && (
                  <div className="text-xs text-blue-600 mt-2">{provider.highlights.highlight_2}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-4 text-xs text-gray-500 text-center">
          * Affiliate-Links: Wir erhalten eine Provision bei Abschluss eines Abonnements über unsere Links.
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default DetailVergleich2; 