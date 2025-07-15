import React, { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Club } from "@/hooks/useClubs";
import { StreamingProviderEnhanced } from "@/hooks/useStreamingEnhanced";
import { LeagueEnhanced } from "@/hooks/useLeaguesEnhanced";
import HighlightBadge from "@/components/ui/highlight-badge";
import { Trophy, Award, Star, Euro, Calendar, Tv, ChevronDown, ChevronUp } from "lucide-react";

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
  const [expandedProvider, setExpandedProvider] = useState<number | null>(null);

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

  // Improved Set Cover Algorithm (now prefers single full-coverage provider if cheaper or equal)
  const findOptimalCombinations = (targetCoverage: number): StreamingProviderEnhanced[] => {
    const availableProviders = providers.filter(p => !existingProviders.includes(p.streamer_id));
    if (availableProviders.length === 0) return [];

    // Calculate total games needed
    const totalGames = selectedCompetitions.reduce((sum, comp) => {
      const league = leagues.find(l => l.league_slug === comp);
      return sum + (league?.['number of games'] || 0);
    }, 0);
    const targetGames = Math.ceil((totalGames * targetCoverage) / 100);

    // 1. Find all single providers with 100% coverage
    const fullCoverageProviders = availableProviders.filter(provider => {
      return selectedCompetitions.every(comp => {
        const league = leagues.find(l => l.league_slug === comp);
        const total = league?.['number of games'] || 0;
        const covered = (provider[comp as keyof StreamingProviderEnhanced] as number) || 0;
        return total > 0 && Math.min(covered, total) === total;
      });
    });

    // 2. Find all combinations of providers that together give exactly 100% coverage
    // For performance, only check all pairs and triplets (not all possible sets)
    function getCoverageForCombo(combo: StreamingProviderEnhanced[]): number {
      let coveredGames = 0;
      selectedCompetitions.forEach(comp => {
        const league = leagues.find(l => l.league_slug === comp);
        const total = league?.['number of games'] || 0;
        let maxCovered = 0;
        combo.forEach(provider => {
          const covered = (provider[comp as keyof StreamingProviderEnhanced] as number) || 0;
          maxCovered = Math.max(maxCovered, Math.min(covered, total));
        });
        coveredGames += maxCovered;
      });
      return coveredGames;
    }
    function getPriceForCombo(combo: StreamingProviderEnhanced[]): number {
      return combo.reduce((sum, p) => sum + parsePrice(p.monthly_price), 0);
    }
    // Generate all pairs and triplets
    const combos: StreamingProviderEnhanced[][] = [];
    for (let i = 0; i < availableProviders.length; i++) {
      for (let j = i + 1; j < availableProviders.length; j++) {
        combos.push([availableProviders[i], availableProviders[j]]);
        for (let k = j + 1; k < availableProviders.length; k++) {
          combos.push([availableProviders[i], availableProviders[j], availableProviders[k]]);
        }
      }
    }
    // Only keep combos with exact 100% coverage
    const exactCombos = combos.filter(combo => getCoverageForCombo(combo) === targetGames);
    // Find the cheapest such combo
    let cheapestCombo: StreamingProviderEnhanced[] | null = null;
    let cheapestComboPrice = Infinity;
    for (const combo of exactCombos) {
      const price = getPriceForCombo(combo);
      if (price < cheapestComboPrice) {
        cheapestCombo = combo;
        cheapestComboPrice = price;
      }
    }
    // Find the cheapest single full-coverage provider
    let cheapestSingle: StreamingProviderEnhanced | null = null;
    let cheapestSinglePrice = Infinity;
    for (const provider of fullCoverageProviders) {
      const price = parsePrice(provider.monthly_price);
      if (price < cheapestSinglePrice) {
        cheapestSingle = provider;
        cheapestSinglePrice = price;
      }
    }
    // Decision logic
    if (cheapestSingle && (cheapestCombo == null || cheapestSinglePrice <= cheapestComboPrice)) {
      return [cheapestSingle];
    } else if (cheapestCombo) {
      return cheapestCombo;
    }
    // Fallback: use greedy set cover as before
    // Greedy set cover algorithm
    const selectedProviders: StreamingProviderEnhanced[] = [];
    const coveredGames = new Map<string, number>();
    selectedCompetitions.forEach(comp => coveredGames.set(comp, 0));
    while (true) {
      let bestProvider: StreamingProviderEnhanced | null = null;
      let bestScore = 0;
      let bestNewCoverage = 0;
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
          const score = newCoverage / Math.max(price, 1);
          if (score > bestScore) {
            bestScore = score;
            bestProvider = provider;
            bestNewCoverage = newCoverage;
          }
        }
      }
      if (!bestProvider || bestNewCoverage === 0) break;
      selectedProviders.push(bestProvider);
      selectedCompetitions.forEach(comp => {
        const currentCovered = coveredGames.get(comp) || 0;
        const providerGames = (bestProvider![comp as keyof StreamingProviderEnhanced] as number) || 0;
        const league = leagues.find(l => l.league_slug === comp);
        const maxGames = league?.['number of games'] || 0;
        coveredGames.set(comp, Math.max(currentCovered, Math.min(providerGames, maxGames)));
      });
      const totalCovered = Array.from(coveredGames.values()).reduce((sum, games) => sum + games, 0);
      if (totalCovered >= targetGames) break;
    }
    return selectedProviders;
  };

  const recommendations = useMemo(() => {
    if (selectedCompetitions.length === 0) return [];

    const scenarios = [
      { target: 100, name: "Beste Abdeckung (100%)", icon: <Trophy className="h-5 w-5 text-yellow-500" /> },
      { target: 90, name: "Preis-Leistungssieger (90%)", icon: <Award className="h-5 w-5 text-gray-400" /> },
      { target: 66, name: "Budget-Option (66%)", icon: <Star className="h-5 w-5 text-amber-600" /> }
    ];

    // --- NEU: Einzelanbieter und Kombi für 100% immer berechnen ---
    // Einzelanbieter mit 100%
    const availableProviders = providers.filter(p => !existingProviders.includes(p.streamer_id));
    const totalGames = selectedCompetitions.reduce((sum, comp) => {
      const league = leagues.find(l => l.league_slug === comp);
      return sum + (league?.['number of games'] || 0);
    }, 0);
    const targetGames = Math.ceil((totalGames * 1));
    const fullCoverageProviders = availableProviders.filter(provider => {
      return selectedCompetitions.every(comp => {
        const league = leagues.find(l => l.league_slug === comp);
        const total = league?.['number of games'] || 0;
        const covered = (provider[comp as keyof StreamingProviderEnhanced] as number) || 0;
        return total > 0 && Math.min(covered, total) === total;
      });
    });
    let cheapestSingle: StreamingProviderEnhanced | null = null;
    let cheapestSinglePrice = Infinity;
    for (const provider of fullCoverageProviders) {
      const price = parsePrice(provider.monthly_price);
      if (price < cheapestSinglePrice) {
        cheapestSingle = provider;
        cheapestSinglePrice = price;
      }
    }
    // Günstigste Kombi (wie im Algorithmus)
    function getCoverageForCombo(combo: StreamingProviderEnhanced[]): number {
      let coveredGames = 0;
      selectedCompetitions.forEach(comp => {
        const league = leagues.find(l => l.league_slug === comp);
        const total = league?.['number of games'] || 0;
        let maxCovered = 0;
        combo.forEach(provider => {
          const covered = (provider[comp as keyof StreamingProviderEnhanced] as number) || 0;
          maxCovered = Math.max(maxCovered, Math.min(covered, total));
        });
        coveredGames += maxCovered;
      });
      return coveredGames;
    }
    function getPriceForCombo(combo: StreamingProviderEnhanced[]): number {
      return combo.reduce((sum, p) => sum + parsePrice(p.monthly_price), 0);
    }
    const combos: StreamingProviderEnhanced[][] = [];
    for (let i = 0; i < availableProviders.length; i++) {
      for (let j = i + 1; j < availableProviders.length; j++) {
        combos.push([availableProviders[i], availableProviders[j]]);
        for (let k = j + 1; k < availableProviders.length; k++) {
          combos.push([availableProviders[i], availableProviders[j], availableProviders[k]]);
        }
      }
    }
    const exactCombos = combos.filter(combo => getCoverageForCombo(combo) === totalGames);
    let cheapestCombo: StreamingProviderEnhanced[] | null = null;
    let cheapestComboPrice = Infinity;
    for (const combo of exactCombos) {
      const price = getPriceForCombo(combo);
      if (price < cheapestComboPrice) {
        cheapestCombo = combo;
        cheapestComboPrice = price;
      }
    }
    // --- Empfehlungen bauen ---
    const recs: any[] = [];
    if (cheapestSingle) {
      // Coverage/Stats berechnen wie unten
      const providers = [cheapestSingle];
      const totalCost = parsePrice(cheapestSingle.monthly_price);
      const yearlyCost = parsePrice(cheapestSingle.yearly_price) || totalCost * 12;
      const competitionStats = selectedCompetitions.map(comp => {
        const league = leagues.find(l => l.league_slug === comp);
        const totalGames = league?.['number of games'] || 0;
        const providerGames = (cheapestSingle[comp as keyof StreamingProviderEnhanced] as number) || 0;
        const maxCovered = Math.min(providerGames, totalGames);
        const coverage = totalGames > 0 ? Math.round((maxCovered / totalGames) * 100) : 0;
        return {
          name: league?.league || comp,
          coverage,
          games: `${maxCovered}/${totalGames}`
        };
      });
      const totalGamesSum = competitionStats.reduce((sum, c) => sum + parseInt(c.games.split('/')[1]), 0);
      const coveredGamesSum = competitionStats.reduce((sum, c) => sum + parseInt(c.games.split('/')[0]), 0);
      const actualCoverage = totalGamesSum > 0 ? Math.round((coveredGamesSum / totalGamesSum) * 100) : 0;
      recs.push({
        scenario: "Einzelanbieter (100%)",
        providers,
        totalCost,
        yearlyCost,
        coveragePercentage: actualCoverage,
        competitions: competitionStats,
        icon: <Trophy className="h-5 w-5 text-yellow-500" />,
        rank: 1
      });
    }
    if (cheapestCombo) {
      const providers = cheapestCombo;
      const totalCost = getPriceForCombo(cheapestCombo);
      const yearlyCost = providers.reduce((sum, p) => {
        const yearly = parsePrice(p.yearly_price);
        return sum + (yearly || parsePrice(p.monthly_price) * 12);
      }, 0);
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
      const totalGamesSum = competitionStats.reduce((sum, c) => sum + parseInt(c.games.split('/')[1]), 0);
      const coveredGamesSum = competitionStats.reduce((sum, c) => sum + parseInt(c.games.split('/')[0]), 0);
      const actualCoverage = totalGamesSum > 0 ? Math.round((coveredGamesSum / totalGamesSum) * 100) : 0;
      recs.push({
        scenario: "Kombi (100%)",
        providers,
        totalCost,
        yearlyCost,
        coveragePercentage: actualCoverage,
        competitions: competitionStats,
        icon: <Award className="h-5 w-5 text-gray-400" />,
        rank: 2
      });
    }
    // --- Restliche Szenarien wie gehabt ---
    return [
      ...recs,
      ...scenarios.slice(1).map((scenario, index) => {
        if (scenario.target === 100) return null; // 100% schon oben behandelt
        const providers = findOptimalCombinations(scenario.target);
        const totalCost = providers.reduce((sum, p) => sum + parsePrice(p.monthly_price), 0);
        const yearlyCost = providers.reduce((sum, p) => {
          const yearly = parsePrice(p.yearly_price);
          return sum + (yearly || parsePrice(p.monthly_price) * 12);
        }, 0);
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
        const totalGamesSum = competitionStats.reduce((sum, c) => sum + parseInt(c.games.split('/')[1]), 0);
        const coveredGamesSum = competitionStats.reduce((sum, c) => sum + parseInt(c.games.split('/')[0]), 0);
        const actualCoverage = totalGamesSum > 0 ? Math.round((coveredGamesSum / totalGamesSum) * 100) : 0;
        if (providers.length === 0 || (scenario.target === 100 && actualCoverage < 100)) {
          return null;
        }
        return {
          scenario: scenario.name,
          providers,
          totalCost,
          yearlyCost,
          coveragePercentage: actualCoverage,
          competitions: competitionStats,
          icon: scenario.icon,
          rank: 3 + index
        };
      }).filter(Boolean)
    ];
  }, [selectedClubs, selectedCompetitions, providers, leagues, existingProviders]);

  // Dynamic leagues mapping
  const dynamicLeaguesList = useMemo(() => {
    const allLeagues = [
      { key: 'bundesliga', label: 'Bundesliga', icon: '🇩🇪' },
      { key: 'champions_league', label: 'Champions League', icon: '⭐' },
      { key: 'second_bundesliga', label: '2. Bundesliga', icon: '2️⃣' },
      { key: 'premier_league', label: 'Premier League', icon: '🇬🇧' },
      { key: 'la_liga', label: 'La Liga', icon: '🇪🇸' },
      { key: 'serie_a', label: 'Serie A', icon: '🇮🇹' },
      { key: 'ligue_1', label: 'Ligue 1', icon: '🇫🇷' },
      { key: 'europa_league', label: 'Europa League', icon: '🥈' },
      { key: 'conference_league', label: 'Conference League', icon: '🥉' },
      { key: 'third_bundesliga', label: '3. Bundesliga', icon: '3️⃣' },
      { key: 'club_world_cup', label: 'Klub Weltmeisterschaft', icon: '🌐' },
      { key: 'sueper_lig', label: 'Süper Lig', icon: '🇹🇷' },
      { key: 'mls', label: 'Major Soccer League', icon: '🇺🇸' },
      { key: 'saudi_pro_league', label: 'Saudi Pro League', icon: '🇸🇦' },
      { key: 'liga_portugal', label: 'Liga Portugal', icon: '🇵🇹' },
      { key: 'dfb_pokal', label: 'DFB Pokal ', icon: '🏆' },
      { key: 'eredevise', label: 'Eredevise', icon: '🇳🇱' },
      { key: 'copa_del_rey', label: 'Copa del rey', icon: '🇪🇸' },
      { key: 'fa_cup', label: 'FA Cup', icon: '🇬🇧' },
      { key: 'efl_cup', label: 'EFL Cup', icon: '🇬🇧' },
      { key: 'coupe_de_france', label: 'Coupe de France', icon: '🇫🇷' },
      { key: 'coppa_italia', label: 'Coppa Italia', icon: '🇮🇹' }
    ];

    return allLeagues.map(league => {
      const isInSelectedClubs = selectedClubs.some(club => club[league.key as keyof Club] === true);
      return {
        ...league,
        covered: isInSelectedClubs
      };
    });
  }, [selectedClubs]);

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

  // Helper to parse features
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
                       <span className="text-sm text-gray-600">Preis im Monatsabo:</span>
                       <span className="font-semibold text-green-600">€{rec.totalCost.toFixed(2)}</span>
                     </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Preis im Jahresabo:</span>
                        <span className="font-semibold">€{rec.yearlyCost.toFixed(2)}</span>
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

                {/* Features Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-3">
                    <Tv className="h-4 w-4 text-purple-600" />
                    <h4 className="font-semibold text-gray-900">Features</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {rec.providers.map((provider, idx) => {
                      const features = parseFeatures(provider);
                      return (
                        <div key={idx} className="flex flex-wrap gap-2">
                          {features.fourK && <Badge className="bg-green-100 text-green-800">4K</Badge>}
                          {features.mobile && <Badge className="bg-blue-100 text-blue-800">Mobile</Badge>}
                          {features.download && <Badge className="bg-purple-100 text-purple-800">Download</Badge>}
                          {features.streams > 1 && <Badge className="bg-orange-100 text-orange-800">{features.streams} Streams</Badge>}
                        </div>
                      );
                    })}
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
                            <img src={provider.logo_url} alt={provider.name} className="w-6 h-6 object-contain" />
                          )}
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{provider.name}</span>
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
                        <img src={provider.logo_url} alt={provider.name} className="w-10 h-10 object-contain" />
                      )}
                      <div>
                        <h4 className="font-semibold text-lg">{provider.name}</h4>
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

                  {/* Features Section */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Tv className="h-4 w-4 text-purple-600" />
                      <span className="font-semibold">Features</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(() => {
                        const features = parseFeatures(provider);
                        return <>
                          {features.fourK && <Badge className="bg-green-100 text-green-800">4K</Badge>}
                          {features.mobile && <Badge className="bg-blue-100 text-blue-800">Mobile</Badge>}
                          {features.download && <Badge className="bg-purple-100 text-purple-800">Download</Badge>}
                          {features.streams > 1 && <Badge className="bg-orange-100 text-orange-800">{features.streams} Streams</Badge>}
                        </>;
                      })()}
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
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setExpandedProvider(
                        expandedProvider === provider.streamer_id ? null : provider.streamer_id
                      )}
                      className="flex items-center gap-2"
                    >
                      Details anzeigen
                      {expandedProvider === provider.streamer_id ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Expanded Details Section */}
                {expandedProvider === provider.streamer_id && (
                  <div className="border-t pt-4 mt-4">
                    <div className="space-y-4">
                      <h4 className="font-medium mb-2">Vollständige Liga-Abdeckung:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {dynamicLeaguesList.map(league => {
                          const leagueData = leagues.find(l => l.league_slug === league.key);
                          const totalGames = leagueData ? leagueData['number of games'] : 0;
                          const providerGames = provider[league.key as keyof typeof provider] || 0;
                          const percentage = totalGames > 0 ? Math.round((Math.min(Number(providerGames), totalGames) / totalGames) * 100) : 0;
                          
                          return (
                            <div key={league.key} className="flex items-center justify-between text-sm">
                              <div className="flex items-center space-x-2">
                                <span>{league.icon}</span>
                                <span>{league.label}</span>
                              </div>
                              <div className={`px-2 py-1 rounded text-xs font-medium ${
                                league.covered ? 
                                  (percentage >= 100 ? 'text-green-600 bg-green-100' : 'text-orange-600 bg-orange-100') : 
                                  'text-gray-400 bg-gray-100'
                              }`}>
                                {league.covered ? `${percentage}% (${Math.min(Number(providerGames), totalGames)}/${totalGames})` : '0%'}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OptimizedStep4Results;
