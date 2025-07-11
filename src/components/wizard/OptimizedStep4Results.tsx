import React, { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Club } from "@/hooks/useClubs";
import { StreamingProviderEnhanced } from "@/hooks/useStreamingEnhanced";
import { LeagueEnhanced } from "@/hooks/useLeaguesEnhanced";
import HighlightBadge from "@/components/ui/highlight-badge";
import { Trophy, Award, Star, Euro, Calendar, Tv } from "lucide-react";

interface OptimizedRecommendation {
  scenario: string;
  providers: StreamingProviderEnhanced[];
  totalCost: number;
  yearlyCost: number;
  coveragePercentage: number;
  costPerGame: number;
  competitions: { name: string; coverage: number; games: string }[];
  otherSports: string[];
  icon: React.ReactNode;
  rank: number;
}

interface OptimizedStep4ResultsProps {
  selectedClubs: Club[];
  selectedCompetitions: string[];
  existingProviders: number[];
  providers: StreamingProviderEnhanced[];
  leagues: LeagueEnhanced[];
}

const OptimizedStep4Results = ({
  selectedClubs,
  selectedCompetitions,
  existingProviders,
  providers,
  leagues
}: OptimizedStep4ResultsProps) => {
  const parsePrice = (priceString?: string): number => {
    if (!priceString) return 0;
    return parseFloat(priceString.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
  };

  const getProviderCoverage = (provider: StreamingProviderEnhanced, leagueSlug: string) => {
    const league = leagues.find(l => l.league_slug === leagueSlug);
    const totalGames = league?.['number of games'] || 0;
    const coveredGames = (provider[leagueSlug as keyof StreamingProviderEnhanced] as number) || 0;
    const percentage = totalGames > 0 ? Math.round((Math.min(coveredGames, totalGames) / totalGames) * 100) : 0;
    
    return { coveredGames: Math.min(coveredGames, totalGames), totalGames, percentage };
  };

  // Improved Set Cover Algorithm
  const findOptimalCombinations = (targetCoverage: number): StreamingProviderEnhanced[] => {
    const availableProviders = providers.filter(p => !existingProviders.includes(p.streamer_id));
    
    if (availableProviders.length === 0) return [];

    // Calculate total games needed
    const totalGames = selectedCompetitions.reduce((sum, comp) => {
      const league = leagues.find(l => l.league_slug === comp);
      return sum + (league?.['number of games'] || 0);
    }, 0);

    const targetGames = Math.ceil((totalGames * targetCoverage) / 100);

    // Greedy set cover algorithm
    const selectedProviders: StreamingProviderEnhanced[] = [];
    const coveredGames = new Map<string, number>();
    
    selectedCompetitions.forEach(comp => coveredGames.set(comp, 0));

    while (true) {
      let bestProvider: StreamingProviderEnhanced | null = null;
      let bestScore = 0;
      let bestNewCoverage = 0;

      // Find provider that covers most uncovered games with best price ratio
      for (const provider of availableProviders) {
        if (selectedProviders.includes(provider)) continue;

        let newCoverage = 0;
        selectedCompetitions.forEach(comp => {
          const currentCovered = coveredGames.get(comp) || 0;
          const providerGames = (provider[comp as keyof StreamingProviderEnhanced] as number) || 0;
          const league = leagues.find(l => l.league_slug === comp);
          const maxGames = league?.['number of games'] || 0;
          
          const additionalCoverage = Math.max(0, Math.min(providerGames, maxGames) - currentCovered);
          newCoverage += additionalCoverage;
        });

        if (newCoverage > 0) {
          const price = parsePrice(provider.monthly_price);
          const score = newCoverage / Math.max(price, 1); // Games per euro
          
          if (score > bestScore) {
            bestScore = score;
            bestProvider = provider;
            bestNewCoverage = newCoverage;
          }
        }
      }

      if (!bestProvider || bestNewCoverage === 0) break;

      selectedProviders.push(bestProvider);
      
      // Update covered games
      selectedCompetitions.forEach(comp => {
        const currentCovered = coveredGames.get(comp) || 0;
        const providerGames = (bestProvider![comp as keyof StreamingProviderEnhanced] as number) || 0;
        const league = leagues.find(l => l.league_slug === comp);
        const maxGames = league?.['number of games'] || 0;
        
        coveredGames.set(comp, Math.max(currentCovered, Math.min(providerGames, maxGames)));
      });

      // Check if we've reached target coverage
      const totalCovered = Array.from(coveredGames.values()).reduce((sum, games) => sum + games, 0);
      if (totalCovered >= targetGames) break;
    }

    return selectedProviders;
  };

  const recommendations = useMemo(() => {
    if (selectedCompetitions.length === 0) return [];

    const scenarios = [
      { target: 100, name: "Beste Abdeckung (100%)", icon: <Trophy className="h-5 w-5 text-yellow-500" /> },
      { target: 90, name: "Optimale Lösung (90%)", icon: <Award className="h-5 w-5 text-gray-400" /> },
      { target: 66, name: "Budget-Option (66%)", icon: <Star className="h-5 w-5 text-amber-600" /> }
    ];

    return scenarios.map((scenario, index) => {
      const providers = findOptimalCombinations(scenario.target);
      const totalCost = providers.reduce((sum, p) => sum + parsePrice(p.monthly_price), 0);
      const yearlyCost = providers.reduce((sum, p) => {
        const yearly = parsePrice(p.yearly_price);
        return sum + (yearly || parsePrice(p.monthly_price) * 12);
      }, 0);
      const savings = Math.max(0, (totalCost * 12) - yearlyCost);

      // Calculate actual coverage
      const competitionStats = selectedCompetitions.map(comp => {
        const league = leagues.find(l => l.league_slug === comp);
        const totalGames = league?.['number of games'] || 0;
        let maxCovered = 0;
        
        providers.forEach(provider => {
          const providerGames = (provider[comp as keyof StreamingProviderEnhanced] as number) || 0;
          maxCovered = Math.max(maxCovered, Math.min(providerGames, totalGames));
        });

        const coverage = totalGames > 0 ? Math.round((maxCovered / totalGames) * 100) : 0;
        return {
          name: league?.league || comp,
          coverage,
          games: `${maxCovered}/${totalGames}`
        };
      });

      const totalGames = competitionStats.reduce((sum, c) => sum + parseInt(c.games.split('/')[1]), 0);
      const coveredGames = competitionStats.reduce((sum, c) => sum + parseInt(c.games.split('/')[0]), 0);
      const actualCoverage = totalGames > 0 ? Math.round((coveredGames / totalGames) * 100) : 0;
      const costPerGame = coveredGames > 0 ? totalCost / coveredGames : 0;

      // Mock other sports data
      const otherSports = providers.length > 0 ? 
        ["Tennis", "Basketball", "Golf", "Formel 1", "Champions League", "Europa League"].slice(0, 3 + providers.length) : 
        [];

      return {
        scenario: scenario.name,
        providers,
        totalCost,
        yearlyCost,
        savings,
        coveragePercentage: actualCoverage,
        costPerGame,
        competitions: competitionStats,
        otherSports,
        icon: scenario.icon,
        rank: index + 1
      };
    }).filter(rec => rec.providers.length > 0);
  }, [selectedClubs, selectedCompetitions, providers, leagues, existingProviders]);

  const allProviders = useMemo(() => {
    return providers
      .filter(p => !existingProviders.includes(p.streamer_id))
      .map(provider => {
        const competitions = selectedCompetitions.map(comp => {
          const coverage = getProviderCoverage(provider, comp);
          const league = leagues.find(l => l.league_slug === comp);
          return {
            name: league?.league || comp,
            coverage: coverage.percentage,
            games: `${coverage.coveredGames}/${coverage.totalGames}`
          };
        });

        const totalGames = competitions.reduce((sum, c) => sum + parseInt(c.games.split('/')[1]), 0);
        const coveredGames = competitions.reduce((sum, c) => sum + parseInt(c.games.split('/')[0]), 0);
        const overallCoverage = totalGames > 0 ? Math.round((coveredGames / totalGames) * 100) : 0;
        const monthlyCost = parsePrice(provider.monthly_price);
        const costPerGame = coveredGames > 0 ? monthlyCost / coveredGames : 0;

        return {
          ...provider,
          competitions,
          overallCoverage,
          costPerGame,
          otherSports: ["Tennis", "Basketball", "Golf", "Formel 1"].slice(0, 2 + Math.floor(Math.random() * 3))
        };
      })
      .sort((a, b) => b.overallCoverage - a.overallCoverage);
  }, [providers, selectedCompetitions, leagues, existingProviders]);

  if (selectedCompetitions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Bitte wähle Wettbewerbe aus, um Empfehlungen zu erhalten.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Deine optimalen Streaming-Lösungen
        </h2>
        <p className="text-gray-600 mb-6">
          Die besten Kombinationen für deine ausgewählten Wettbewerbe
        </p>
      </div>

      {/* Top 3 Recommendations */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Top Empfehlungen
        </h3>
        
        <div className="grid lg:grid-cols-3 gap-6">
          {recommendations.map((rec, index) => (
            <Card key={index} className={`${index === 0 ? 'ring-2 ring-green-500 relative' : ''}`}>
              {index === 0 && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-green-500 text-white px-4 py-1">
                    Beste Wahl
                  </Badge>
                </div>
              )}
              
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between text-lg">
                  <div className="flex items-center gap-2">
                    {rec.icon}
                    <span className="text-sm">{rec.scenario}</span>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">
                    {rec.coveragePercentage}%
                  </Badge>
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Price Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-3">
                    <Euro className="h-4 w-4 text-green-600" />
                    <h4 className="font-semibold text-gray-900">Preise</h4>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Monatliches Abo:</span>
                      <span className="font-semibold text-green-600">€{rec.totalCost.toFixed(2)}</span>
                    </div>
                     <div className="flex justify-between">
                       <span className="text-sm text-gray-600">Jährliches Abo:</span>
                       <span className="font-semibold">€{rec.yearlyCost.toFixed(2)}</span>
                     </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-sm text-gray-600">Pro Spiel:</span>
                      <span className="font-semibold">€{rec.costPerGame.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Competitions Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <h4 className="font-semibold text-gray-900">Wettbewerbe</h4>
                  </div>
                  <div className="space-y-2">
                    {rec.competitions.slice(0, 3).map((comp, idx) => (
                      <div key={idx} className="flex justify-between items-center">
                        <span className="text-sm text-gray-700">{comp.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">{comp.games}</span>
                          <Badge variant={comp.coverage >= 90 ? "default" : comp.coverage >= 70 ? "secondary" : "outline"} 
                                 className="text-xs">
                            {comp.coverage}%
                          </Badge>
                        </div>
                      </div>
                    ))}
                    {rec.competitions.length > 3 && (
                      <div className="text-xs text-gray-500 text-center pt-1">
                        +{rec.competitions.length - 3} weitere
                      </div>
                    )}
                  </div>
                </div>

                {/* Other Coverage */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-3">
                    <Tv className="h-4 w-4 text-purple-600" />
                    <h4 className="font-semibold text-gray-900">Weitere Inhalte</h4>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {rec.otherSports.slice(0, 4).map((sport, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {sport}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Providers */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">Anbieter ({rec.providers.length})</h4>
                  <div className="space-y-2">
                    {rec.providers.map((provider, pIdx) => (
                      <div key={pIdx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-2">
                          {provider.logo_url && (
                            <img src={provider.logo_url} alt={provider.provider_name} className="w-6 h-6 object-contain" />
                          )}
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{provider.provider_name}</span>
                            <span className="text-xs text-gray-500">
                              Monatlich: €{parsePrice(provider.monthly_price).toFixed(2)}
                            </span>
                          </div>
                        </div>
                        {provider.affiliate_url && (
                          <Button 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1"
                            onClick={() => window.open(provider.affiliate_url, '_blank')}
                          >
                            Jetzt buchen
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  {rec.providers.length === 1 && rec.providers[0].affiliate_url ? (
                    <Button 
                      className="w-full bg-green-600 hover:bg-green-700" 
                      size="lg"
                      onClick={() => window.open(rec.providers[0].affiliate_url, '_blank')}
                    >
                      Jetzt zum Angebot
                    </Button>
                  ) : (
                    <Button 
                      className="w-full bg-green-600 hover:bg-green-700" 
                      size="lg"
                      onClick={() => {
                        rec.providers.forEach(provider => {
                          if (provider.affiliate_url) {
                            window.open(provider.affiliate_url, '_blank');
                          }
                        });
                      }}
                    >
                      Alle Angebote öffnen
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* All Providers List */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-gray-900">Alle Streaming-Anbieter</h3>
        
        <div className="grid gap-4">
          {allProviders.slice(0, 10).map((provider) => (
            <Card key={provider.streamer_id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="grid lg:grid-cols-4 gap-6">
                  {/* Provider Info & Price */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      {provider.logo_url && (
                        <img src={provider.logo_url} alt={provider.provider_name} className="w-10 h-10 object-contain" />
                      )}
                      <div>
                        <h4 className="font-semibold text-lg">{provider.provider_name}</h4>
                        <p className="text-sm text-gray-600">{provider.name}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Euro className="h-4 w-4 text-green-600" />
                        <span className="font-semibold text-green-600">Preise</span>
                      </div>
                      <div className="bg-gray-50 rounded p-3 space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Monatliches Abo:</span>
                          <span className="font-semibold">€{parsePrice(provider.monthly_price).toFixed(2)}</span>
                        </div>
                        {provider.yearly_price && (
                          <div className="flex justify-between text-sm">
                            <span>Jährliches Abo:</span>
                            <span>€{parsePrice(provider.yearly_price).toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm border-t pt-1">
                          <span>Pro Spiel:</span>
                          <span className="font-semibold">€{provider.costPerGame.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Competitions */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span className="font-semibold">Wettbewerbe</span>
                      <Badge className="bg-blue-100 text-blue-800 ml-auto">
                        {provider.overallCoverage}%
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      {provider.competitions.map((comp, idx) => (
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
                    </div>
                  </div>

                  {/* Other Sports */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Tv className="h-4 w-4 text-purple-600" />
                      <span className="font-semibold">Weitere Inhalte</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {provider.otherSports.map((sport, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {sport}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    {provider.affiliate_url ? (
                      <Button 
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => window.open(provider.affiliate_url, '_blank')}
                      >
                        Jetzt buchen
                      </Button>
                    ) : (
                      <Button className="bg-gray-400 cursor-not-allowed" disabled>
                        Kein Angebot verfügbar
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      Details anzeigen
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OptimizedStep4Results;
