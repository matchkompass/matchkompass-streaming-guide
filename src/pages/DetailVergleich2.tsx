import { useState, useMemo } from "react";
import { Download, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useStreamingEnhanced } from "@/hooks/useStreamingEnhanced";
import { useLeaguesEnhanced } from "@/hooks/useLeaguesEnhanced";

const DetailVergleich2 = () => {
  const [selectedLeagues, setSelectedLeagues] = useState<string[]>(['bundesliga', 'champions_league']);
  const [selectedProviders, setSelectedProviders] = useState<number[]>([]);
  const { providers, loading: providersLoading } = useStreamingEnhanced();
  const { leagues, loading: leaguesLoading } = useLeaguesEnhanced();

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
      // Only show providers that have coverage for at least one selected league
      if (selectedProviders.length > 0 && !selectedProviders.includes(provider.streamer_id)) return false;
      return selectedLeagues.some(league => (provider[league] || 0) > 0);
    });
    return filtered;
  }, [providers, selectedLeagues, selectedProviders]);

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
                <div className="mb-6">
                  <div className="font-semibold mb-2">Anbieter</div>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {providers.map((provider) => (
                      <div key={provider.streamer_id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`provider-${provider.streamer_id}`}
                          checked={selectedProviders.length === 0 || selectedProviders.includes(provider.streamer_id)}
                          onCheckedChange={() => toggleProvider(provider.streamer_id)}
                        />
                        <label htmlFor={`provider-${provider.streamer_id}`} className="text-sm cursor-pointer flex-1">
                          <span className="inline-flex items-center gap-1">
                            {provider.logo_url && (
                              <img src={provider.logo_url} alt={provider.name} className="w-5 h-5 object-contain rounded bg-white border" />
                            )}
                            {provider.name}
                          </span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
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
            <div className="rounded-lg border bg-white shadow-sm overflow-x-auto">
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
                            <Button
                              size="sm"
                              className="mt-2 w-full bg-green-600 hover:bg-green-700 text-white"
                              onClick={() => window.open(provider.affiliate_url, '_blank')}
                            >
                              Zum Angebot
                            </Button>
                            <div className="flex gap-1 mt-2">
                              {features.fourK && <span className="text-xs bg-gray-200 rounded px-1">4K</span>}
                              {features.mobile && <span className="text-xs bg-gray-200 rounded px-1">Mobile</span>}
                              {features.download && <span className="text-xs bg-gray-200 rounded px-1">Download</span>}
                              {features.multiStream && <span className="text-xs bg-gray-200 rounded px-1">Multi</span>}
                            </div>
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
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
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default DetailVergleich2; 