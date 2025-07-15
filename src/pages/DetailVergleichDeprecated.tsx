
import { useState, useMemo } from "react";
import { Download, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useStreamingEnhanced } from "@/hooks/useStreamingEnhanced";
import { useLeaguesEnhanced } from "@/hooks/useLeaguesEnhanced";

const DetailVergleich = () => {
  const [selectedLeagues, setSelectedLeagues] = useState<string[]>(['bundesliga', 'champions_league']);
  const { providers, loading: providersLoading } = useStreamingEnhanced();
  const { leagues, loading: leaguesLoading } = useLeaguesEnhanced();

  const parsePrice = (priceString?: string): number => {
    if (!priceString) return 0;
    return parseFloat(priceString.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
  };

  const getProviderCoverage = (provider: any, leagueSlug: string) => {
    const league = leagues.find(l => l.league_slug === leagueSlug);
    const totalGames = league?.['number of games'] || 0;
    const coveredGames = (provider[leagueSlug] as number) || 0;
    const percentage = totalGames > 0 ? Math.round((coveredGames / totalGames) * 100) : 0;
    
    return { coveredGames, totalGames, percentage };
  };

  const getBestCombination = () => {
    if (selectedLeagues.length === 0) return null;

    // Calculate best single provider
    const singleProviderScores = providers.map(provider => {
      let totalCoverage = 0;
      let totalGames = 0;
      let coveredGames = 0;

      selectedLeagues.forEach(leagueSlug => {
        const coverage = getProviderCoverage(provider, leagueSlug);
        totalGames += coverage.totalGames;
        coveredGames += coverage.coveredGames;
      });

      totalCoverage = totalGames > 0 ? Math.round((coveredGames / totalGames) * 100) : 0;
      const price = parsePrice(provider.monthly_price);

      return {
        providers: [provider],
        coverage: totalCoverage,
        price,
        coveredGames,
        totalGames
      };
    });

    // Find best single provider
    const bestSingle = singleProviderScores.reduce((best, current) => {
      if (current.coverage > best.coverage) return current;
      if (current.coverage === best.coverage && current.price < best.price) return current;
      return best;
    }, singleProviderScores[0]);

    // For now, return best single provider (complex combination logic would be expensive)
    return bestSingle;
  };

  const filteredProviders = useMemo(() => {
    return providers.filter(provider => {
      // Only show providers that have coverage for at least one selected league
      return selectedLeagues.some(league => (provider[league] || 0) > 0);
    });
  }, [providers, selectedLeagues]);

  const bestCombination = getBestCombination();

  const toggleLeague = (leagueSlug: string) => {
    setSelectedLeagues(prev => 
      prev.includes(leagueSlug)
        ? prev.filter(l => l !== leagueSlug)
        : [...prev, leagueSlug]
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
    const headers = ['Anbieter', 'Monatspreis', 'Jahrespreis', ...selectedLeagues.map(l => 
      leagues.find(league => league.league_slug === l)?.league || l
    )];
    
    const rows = filteredProviders.map(provider => [
      provider.provider_name,
      parsePrice(provider.monthly_price).toFixed(2) + '€',
      parsePrice(provider.yearly_price).toFixed(2) + '€',
      ...selectedLeagues.map(league => {
        const coverage = getProviderCoverage(provider, league);
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
    link.setAttribute('download', 'streaming-vergleich.csv');
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
            Power-User Vergleichstabelle mit präzisen Abdeckungsdaten
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar Filter */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Liga-Filter
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
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
                    CSV Export
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Table */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Vergleichstabelle</CardTitle>
                  <Badge variant="secondary">
                    {filteredProviders.length} Anbieter
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {selectedLeagues.length === 0 ? (
                  <div className="text-center py-12">
                    <Filter className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Keine Ligen ausgewählt
                    </h3>
                    <p className="text-gray-600">
                      Wähle mindestens eine Liga aus, um den Vergleich zu starten.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Best Combination Row */}
                    {bestCombination && (
                      <div className="mb-6">
                        <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                          🏆 Beste Kombination
                        </h3>
                        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">
                              {bestCombination.providers.map(p => p.provider_name).join(' + ')}
                            </span>
                            <div className="flex items-center gap-4">
                              <Badge className="bg-green-500">
                                {bestCombination.coverage}% Abdeckung
                              </Badge>
                              <span className="font-bold text-green-600">
                                {bestCombination.price.toFixed(2)}€/Monat
                              </span>
                            </div>
                          </div>
                          <div className="mb-2">
                            <Progress value={bestCombination.coverage} className="h-2" />
                          </div>
                          <p className="text-sm text-gray-600">
                            {bestCombination.coveredGames}/{bestCombination.totalGames} Spiele abgedeckt
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Comparison Table */}
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="sticky left-0 bg-white border-r">Anbieter</TableHead>
                            <TableHead>Monatspreis</TableHead>
                            <TableHead>Jahrespreis</TableHead>
                            {selectedLeagues.map(leagueSlug => {
                              const league = leagues.find(l => l.league_slug === leagueSlug);
                              return (
                                <TableHead key={leagueSlug} className="text-center min-w-32">
                                  {league?.league || leagueSlug}
                                </TableHead>
                              );
                            })}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredProviders.map((provider) => (
                            <TableRow key={provider.streamer_id}>
                              <TableCell className="sticky left-0 bg-white border-r font-medium">
                                <div className="flex items-center gap-2">
                                  {provider.logo_url ? (
                                    <img 
                                      src={provider.logo_url} 
                                      alt={provider.provider_name} 
                                      className="w-6 h-6 object-contain" 
                                    />
                                  ) : (
                                    <div className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center text-xs">
                                      📺
                                    </div>
                                  )}
                                  <span className="truncate">{provider.provider_name}</span>
                                </div>
                              </TableCell>
                              <TableCell>{parsePrice(provider.monthly_price).toFixed(2)}€</TableCell>
                              <TableCell>
                                {provider.yearly_price ? 
                                  `${parsePrice(provider.yearly_price).toFixed(2)}€` : 
                                  '-'
                                }
                              </TableCell>
                              {selectedLeagues.map(leagueSlug => {
                                const coverage = getProviderCoverage(provider, leagueSlug);
                                return (
                                  <TableCell 
                                    key={leagueSlug} 
                                    className={`text-center ${getCellBackgroundColor(coverage.percentage)}`}
                                  >
                                    <div className="text-sm font-medium">
                                      {coverage.percentage}%
                                    </div>
                                    <div className="text-xs opacity-75">
                                      {coverage.coveredGames}/{coverage.totalGames}
                                    </div>
                                  </TableCell>
                                );
                              })}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Legend */}
                    <div className="mt-4 flex flex-wrap gap-2 text-xs">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-green-100 border"></div>
                        <span>90-100%</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-yellow-100 border"></div>
                        <span>70-89%</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-orange-100 border"></div>
                        <span>50-69%</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-red-100 border"></div>
                        <span>1-49%</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-gray-50 border"></div>
                        <span>0%</span>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default DetailVergleich;
