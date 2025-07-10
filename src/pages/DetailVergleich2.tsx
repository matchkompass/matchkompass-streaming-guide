import { useState, useMemo, useEffect } from "react";
import { Download, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useStreamingEnhanced } from "@/hooks/useStreamingEnhanced";
import { useLeaguesEnhanced } from "@/hooks/useLeaguesEnhanced";

const DetailVergleich2 = () => {
  const [selectedLeagues, setSelectedLeagues] = useState<string[]>([]);
  const [selectedProviders, setSelectedProviders] = useState<number[]>([]);
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

  const filteredProviders = useMemo(() => {
    let filtered = providers.filter(provider => {
      // Price filter
      const monthly = parsePrice(provider.monthly_price);
      const yearly = parsePrice(provider.yearly_price);
      if (monthly < priceRange[0] || monthly > priceRange[1]) return false;
      // Feature filters
      const features = parseFeatures(provider);
      if (featureFilters.fourK && !features.fourK) return false;
      if (featureFilters.mobile && !features.mobile) return false;
      if (featureFilters.download && !features.download) return false;
      if (featureFilters.multiStream && !features.multiStream) return false;
      // Provider filter
      if (selectedProviders.length > 0 && !selectedProviders.includes(provider.streamer_id)) return false;
      // League filter
      return selectedLeagues.some(league => (provider[league] || 0) > 0);
    });
    return filtered;
  }, [providers, selectedLeagues, selectedProviders, priceRange, featureFilters]);

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

  const getCellBackgroundColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-100 text-green-800';
    if (percentage >= 70) return 'bg-yellow-100 text-yellow-800';
    if (percentage >= 50) return 'bg-orange-100 text-orange-800';
    if (percentage > 0) return 'bg-red-100 text-red-800';
    return 'bg-gray-50 text-gray-500';
  };

  const exportToCSV = () => {
    const headers = ['Liga', ...filteredProviders.map(p => p.name)];
    const rows = selectedLeagues.map(leagueSlug => [
      leagues.find(l => l.league_slug === leagueSlug)?.league || leagueSlug,
      ...filteredProviders.map(provider => {
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
    link.setAttribute('download', 'streaming-vergleich-vertikal.csv');
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
            Vertikaler Streaming-Vergleich
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Vergleichstabelle mit Anbietern oben und Ligen links
          </p>
        </div>
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar Filter */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filter
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Pricing Section */}
                <div className="mb-6">
                  <div className="font-semibold mb-2">Preis (Monatlich)</div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={priceRange[0]}
                    onChange={e => setPriceRange([Number(e.target.value), priceRange[1]])}
                  />
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={priceRange[1]}
                    onChange={e => setPriceRange([priceRange[0], Number(e.target.value)])}
                  />
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>{priceRange[0]}€</span>
                    <span>{priceRange[1]}€</span>
                  </div>
                </div>
                {/* Features Section */}
                <div className="mb-6">
                  <div className="font-semibold mb-2">Features</div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm">
                      <Checkbox checked={featureFilters.fourK} onCheckedChange={() => setFeatureFilters(f => ({ ...f, fourK: !f.fourK }))} />
                      4K Streaming
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <Checkbox checked={featureFilters.mobile} onCheckedChange={() => setFeatureFilters(f => ({ ...f, mobile: !f.mobile }))} />
                      Mobile App
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <Checkbox checked={featureFilters.download} onCheckedChange={() => setFeatureFilters(f => ({ ...f, download: !f.download }))} />
                      Download/Offline
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <Checkbox checked={featureFilters.multiStream} onCheckedChange={() => setFeatureFilters(f => ({ ...f, multiStream: !f.multiStream }))} />
                      Multi-Stream
                    </label>
                  </div>
                </div>
                {/* League/Competition Section */}
                <div className="font-semibold mb-2">Ligen</div>
                <div className="space-y-3 max-h-40 overflow-y-auto">
                  {leagues.map((league) => (
                    <div key={league.league_slug} className="flex items-center space-x-2">
                      <Checkbox
                        id={league.league_slug}
                        checked={selectedLeagues.includes(league.league_slug || '')}
                        onCheckedChange={() => toggleLeague(league.league_slug || '')}
                      />
                      <label 
                        htmlFor={league.league_slug} 
                        className="text-sm cursor-pointer flex-1"
                      >
                        {league.league}
                      </label>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs text-gray-600 mb-2">
                    {selectedLeagues.length} Ligen ausgewählt
                  </p>
                  <Button
                    onClick={exportToCSV}
                    variant="outline"
                    size="sm"
                    className="w-full"
                    disabled={filteredProviders.length === 0}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export als CSV
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Vertical Table */}
          <div className="lg:col-span-3 overflow-x-auto">
            <div className="rounded-lg border bg-white shadow-sm overflow-x-auto relative">
              <table className="min-w-full text-sm">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold bg-gray-50">Liga / Anbieter</th>
                    {filteredProviders.map(provider => {
                      const features = parseFeatures(provider);
                      return (
                        <th key={provider.streamer_id} className="px-4 py-2 text-center font-semibold bg-gray-50 min-w-[220px]">
                          <div className="flex flex-col items-center gap-1">
                            {provider.logo_url && (
                              <img src={provider.logo_url} alt={provider.name} className="w-10 h-10 object-contain mb-1 rounded bg-white border" />
                            )}
                            <span className="font-medium truncate max-w-[100px]">{provider.name}</span>
                            <span className="text-xs text-gray-500">{parsePrice(provider.monthly_price).toFixed(2)}€ / Monat</span>
                            {provider.highlights?.highlight_1 && (
                              <span className="text-xs text-green-700 bg-green-100 rounded px-2 py-0.5 mt-1">{provider.highlights.highlight_1}</span>
                            )}
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {/* Features Row */}
                  <tr>
                    <td className="px-4 py-2 font-medium bg-gray-50">Features</td>
                    {filteredProviders.map(provider => {
                      const features = parseFeatures(provider);
                      return (
                        <td key={provider.streamer_id} className="px-4 py-2 text-center">
                          <div className="flex flex-col gap-1 items-center">
                            <div className="flex gap-1">
                              <span title="4K Streaming" className={`text-xs px-2 py-0.5 rounded ${features.fourK ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-400'}`}>4K</span>
                              <span title="Mobile App" className={`text-xs px-2 py-0.5 rounded ${features.mobile ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-400'}`}>Mobile</span>
                              <span title="Download/Offline" className={`text-xs px-2 py-0.5 rounded ${features.download ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-400'}`}>Download</span>
                              <span title="Multi-Stream" className={`text-xs px-2 py-0.5 rounded ${features.multiStream ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-400'}`}>Multi</span>
                            </div>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                  {/* League Rows */}
                  {selectedLeagues.map(leagueSlug => {
                    const league = leagues.find(l => l.league_slug === leagueSlug);
                    return (
                      <tr key={leagueSlug}>
                        <td className="px-4 py-2 font-medium bg-gray-50">
                          {league?.league || leagueSlug}
                        </td>
                        {filteredProviders.map(provider => {
                          const coverage = getProviderCoverage(provider, leagueSlug);
                          return (
                            <td key={provider.streamer_id} className={`px-4 py-2 text-center ${getCellBackgroundColor(coverage.percentage)}`}>
                              {coverage.percentage}%
                              <div className="text-xs text-gray-500">{coverage.coveredGames}/{coverage.totalGames}</div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {/* Sticky Conversion Section */}
              <div className="sticky bottom-0 left-0 w-full bg-white border-t z-10 shadow flex px-4 py-3 gap-4 overflow-x-auto">
                <div className="w-48 font-semibold text-gray-700 flex items-center">Jetzt Angebot sichern:</div>
                {filteredProviders.map(provider => (
                  <div key={provider.streamer_id} className="min-w-[220px] flex flex-col items-center">
                    <Button
                      size="sm"
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => window.open(provider.affiliate_url, '_blank')}
                    >
                      Zum Angebot
                    </Button>
                    {provider.highlights?.highlight_1 && (
                      <span className="text-xs text-green-700 bg-green-100 rounded px-2 py-0.5 mt-1">{provider.highlights.highlight_1}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default DetailVergleich2; 