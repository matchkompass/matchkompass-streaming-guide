import React, { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { StreamingProviderEnhanced } from "@/hooks/useStreamingEnhanced";
import { LeagueEnhanced } from "@/hooks/useLeaguesEnhanced";
import { Trophy, Award, Star, Euro, Calendar, Tv, ChevronDown, ChevronUp, ArrowUpDown, Dumbbell } from "lucide-react";
import { Club } from "@/hooks/useClubs";

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
  const [sortBy, setSortBy] = useState<'coverage' | 'price'>('coverage');

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

  const recommendations = useMemo(() => {
    if (selectedCompetitions.length === 0) return [];

    const availableProviders = providers.filter(p => !existingProviders.includes(p.streamer_id));

    // Helper: Calculate stats for a set of providers
    const calculateStats = (providerSet: StreamingProviderEnhanced[]) => {
      const totalCost = providerSet.reduce((sum, p) => sum + parsePrice(p.monthly_price), 0);
      const yearlyCost = providerSet.reduce((sum, p) => sum + (parsePrice(p.yearly_price) || parsePrice(p.monthly_price) * 12), 0);

      const competitionStats = selectedCompetitions.map(comp => {
        const league = leagues.find(l => l.league_slug === comp);
        const total = league?.['number of games'] || 0;
        let maxCovered = 0;
        providerSet.forEach(p => {
          const pGames = (p[comp as keyof StreamingProviderEnhanced] as number) || 0;
          maxCovered = Math.max(maxCovered, Math.min(pGames, total));
        });
        const coverage = total > 0 ? Math.round((maxCovered / total) * 100) : 0;
        return { name: league?.league || comp, coverage, games: `${maxCovered}/${total}`, rawCovered: maxCovered, rawTotal: total };
      });

      const totalGamesSum = competitionStats.reduce((sum, c) => sum + c.rawTotal, 0);
      const coveredGamesSum = competitionStats.reduce((sum, c) => sum + c.rawCovered, 0);
      const coveragePercentage = totalGamesSum > 0 ? Math.round((coveredGamesSum / totalGamesSum) * 100) : 0;
      const costPerGame = coveredGamesSum > 0 ? totalCost / coveredGamesSum : 0;

      return {
        providers: providerSet,
        totalCost,
        yearlyCost,
        coveragePercentage,
        costPerGame,
        competitions: competitionStats.map(({ name, coverage, games }) => ({ name, coverage, games })),
        otherSports: [], // To be filled later
      };
    };

    // --- GAP FILLING LOGIC ---
    const findGapFiller = (baseProvider: StreamingProviderEnhanced, missingComps: string[]): StreamingProviderEnhanced | null => {
      let bestFiller: StreamingProviderEnhanced | null = null;
      let bestFillerPrice = Infinity;

      for (const candidate of availableProviders) {
        if (candidate.streamer_id === baseProvider.streamer_id) continue;

        // Check if candidate covers ALL missing comps
        const coversAllMissing = missingComps.every(comp => {
          const pGames = (candidate[comp as keyof StreamingProviderEnhanced] as number) || 0;
          const league = leagues.find(l => l.league_slug === comp);
          const total = league?.['number of games'] || 0;
          return pGames >= total; // Must fully cover the gap
        });

        if (coversAllMissing) {
          const price = parsePrice(candidate.monthly_price);
          if (price < bestFillerPrice) {
            bestFiller = candidate;
            bestFillerPrice = price;
          }
        }
      }
      return bestFiller;
    };

    const findBestComboForTarget = (minCoveragePercent: number): any | null => {
      const totalGamesNeeded = selectedCompetitions.reduce((sum, comp) => {
        const league = leagues.find(l => l.league_slug === comp);
        return sum + (league?.['number of games'] || 0);
      }, 0);
      const minGamesTarget = Math.ceil(totalGamesNeeded * (minCoveragePercent / 100));

      let bestSolution: { providers: StreamingProviderEnhanced[], price: number, coverage: number } | null = null;

      // 1. Check Single Providers & Smart Gap Filling
      for (const provider of availableProviders) {
        const stats = calculateStats([provider]);

        // A) Is it good enough alone?
        if (stats.coveragePercentage >= minCoveragePercent) {
          if (!bestSolution || stats.totalCost < bestSolution.price || (stats.totalCost === bestSolution.price && stats.coveragePercentage > bestSolution.coverage)) {
            bestSolution = { providers: [provider], price: stats.totalCost, coverage: stats.coveragePercentage };
          }
        }

        // B) Gap Filling: If close to 100% (e.g. >80%), try to fill the gap to reach 100%
        if (minCoveragePercent === 100 && stats.coveragePercentage >= 80 && stats.coveragePercentage < 100) {
          // Identify missing competitions (where coverage < 100%)
          const missingComps = selectedCompetitions.filter(comp => {
            const league = leagues.find(l => l.league_slug === comp);
            const total = league?.['number of games'] || 0;
            const pGames = (provider[comp as keyof StreamingProviderEnhanced] as number) || 0;
            return pGames < total;
          });

          if (missingComps.length > 0) {
            const gapFiller = findGapFiller(provider, missingComps);
            if (gapFiller) {
              const comboStats = calculateStats([provider, gapFiller]);
              if (comboStats.coveragePercentage >= 100) {
                if (!bestSolution || comboStats.totalCost < bestSolution.price) {
                  bestSolution = { providers: [provider, gapFiller], price: comboStats.totalCost, coverage: comboStats.coveragePercentage };
                }
              }
            }
          }
        }
      }

      // 2. Check Brute Force Combinations (Pairs) if no cheap Gap Filler found
      // Only do deep check if we don't have a very cheap 100% solution yet
      if (!bestSolution || bestSolution.price > 40) {
        for (let i = 0; i < availableProviders.length; i++) {
          for (let j = i + 1; j < availableProviders.length; j++) {
            const combo = [availableProviders[i], availableProviders[j]];
            const stats = calculateStats(combo);
            if (stats.coveragePercentage >= minCoveragePercent) {
              if (!bestSolution || stats.totalCost < bestSolution.price) {
                bestSolution = { providers: combo, price: stats.totalCost, coverage: stats.coveragePercentage };
              }
            }
          }
        }
      }

      if (!bestSolution) return null;

      return {
        ...calculateStats(bestSolution.providers),
        scenario: "",
        icon: null,
        rank: 0
      };
    };

    // Calculate Tiers
    const rec100 = findBestComboForTarget(100);
    const rec90 = findBestComboForTarget(90);
    const rec66 = findBestComboForTarget(66);

    const finalRecs: OptimizedRecommendation[] = [];

    const isDuplicate = (providers: StreamingProviderEnhanced[]) => {
      const newIds = providers.map(p => p.streamer_id).sort().join(',');
      return finalRecs.some(rec => rec.providers.map(p => p.streamer_id).sort().join(',') === newIds);
    };

    if (rec100) {
      finalRecs.push({
        ...rec100,
        scenario: "Rundum-Sorglos (100%)",
        icon: <Trophy className="h-5 w-5 text-yellow-500" />,
        rank: 1
      });
    }

    if (rec90 && !isDuplicate(rec90.providers)) {
      finalRecs.push({
        ...rec90,
        scenario: "Preis-Leistungssieger (>90%)",
        icon: <Award className="h-5 w-5 text-blue-500" />,
        rank: 2
      });
    }

    if (rec66 && !isDuplicate(rec66.providers)) {
      finalRecs.push({
        ...rec66,
        scenario: "Spar-Tipp (>66%)",
        icon: <Star className="h-5 w-5 text-green-600" />,
        rank: 3
      });
    }

    return finalRecs;
  }, [selectedCompetitions, providers, leagues, existingProviders]);

  // Dynamic leagues & clubs list for header
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
      { key: 'dfb_pokal', label: 'DFB Pokal', icon: '🏆' },
      { key: 'eredevise', label: 'Eredivisie', icon: '🇳🇱' },
      { key: 'copa_del_rey', label: 'Copa del Rey', icon: '🇪🇸' },
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
    const list = providers
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

        // Parse further_offers for Other Sports
        let otherSports: string[] = [];
        if (provider.further_offers && typeof provider.further_offers === 'object') {
          // Assuming further_offers keys or values might indicate sports. 
          // Without exact schema, let's assume it's like features.
          // If it's just raw JSON, we iterate keys or standard sports
          const commonSports = ['Tennis', 'Basketball', 'NFL', 'Formel 1', 'Darts', 'Handball', 'Eishockey'];
          // Mocking usage for now as schema is generic JSON. 
          // In real app we'd parse specific keys.
          // We'll extract non-null values if it's a simple list, or random common ones if empty for demo
          if (Object.keys(provider.further_offers).length > 0) {
            otherSports = Object.keys(provider.further_offers).filter(k => provider.further_offers[k] === true || provider.further_offers[k] === "true");
          }
          if (otherSports.length === 0) {
            // Fallback if data structure is different, check for string keywords in stringified JSON
            const str = JSON.stringify(provider.further_offers).toLowerCase();
            commonSports.forEach(sport => {
              if (str.includes(sport.toLowerCase())) otherSports.push(sport);
            });
          }
        }
        // Fill dummy if still empty for visual consistency in demo if requested (user asked to pull from data, so try data first)
        if (otherSports.length === 0) {
          // Fallback to random if data is missing, BUT user said "pull from data". 
          // If data is empty, better show nothing than fake info?
          // User prompt: "ziehe die daten aus dem supabase table... further_offers"
          // Using logic above to try to extract.
          // If still empty, try parsing features string often has sports too? No, further_offers is the place.
        }

        return {
          ...provider,
          competitions,
          overallCoverage,
          costPerGame,
          otherSports
        };
      });

    return list
      .filter(p => sortBy === 'price' ? p.overallCoverage > 0 : true)
      .sort((a, b) => {
        if (sortBy === 'coverage') return b.overallCoverage - a.overallCoverage;
        return parsePrice(a.monthly_price) - parsePrice(b.monthly_price);
      });
  }, [providers, selectedCompetitions, leagues, existingProviders, sortBy]);

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
      } catch (e) { }
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

        {/* Selected Items Header */}
        <div className="mt-8 flex flex-col gap-6 max-w-4xl mx-auto">
          {/* Row 1: Selected Clubs */}
          {selectedClubs.length > 0 && (
            <div className="flex flex-col items-center gap-2">
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Deine Vereine</p>
              <div className="flex flex-wrap gap-3 justify-center">
                {selectedClubs.map(club => (
                  <Badge key={club.club_id} variant="outline" className="bg-green-50 border-green-600 text-green-900 px-3 py-1.5 text-sm gap-2 shadow-sm hover:bg-green-100">
                    {club.logo_url ? <img src={club.logo_url} className="w-5 h-5 object-contain mr-2" alt="" /> : <span className="mr-2">⚽</span>}
                    {club.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Row 2: Selected Leagues */}
          {selectedCompetitions.length > 0 && (
            <div className="flex flex-col items-center gap-2">
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Deine Wettbewerbe</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {selectedCompetitions.map(comp => {
                  const league = dynamicLeaguesList.find(l => l.key === comp);
                  return (
                    <Badge key={comp} className="bg-blue-100/50 text-blue-700 hover:bg-blue-200 border-blue-200 px-3 py-1 text-xs">
                      {league?.icon} {league?.label || comp}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Top Recommendations */}
      {false && recommendations.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Top Empfehlungen
          </h3>

          <div className={`grid lg:grid-cols-${Math.min(recommendations.length, 3)} gap-6`}>
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

                  {/* Features & Sport Section */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-3">
                      <Tv className="h-4 w-4 text-purple-600" />
                      <h4 className="font-semibold text-gray-900">Features</h4>
                    </div>
                    <div className="flex flex-col gap-3">
                      {/* Tech Features */}
                      <div className="flex flex-wrap gap-2">
                        {rec.providers.map((provider, idx) => {
                          const features = parseFeatures(provider);
                          return (
                            <React.Fragment key={idx}>
                              {features.fourK && <Badge className="bg-green-100 text-green-800">4K</Badge>}
                              {features.mobile && <Badge className="bg-blue-100 text-blue-800">Mobile</Badge>}
                            </React.Fragment>
                          );
                        })}
                      </div>
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
                        Alle Angebote ansehen
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* All Providers List */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <h3 className="text-xl font-semibold text-gray-900">Alle Streaming-Anbieter</h3>

          {/* Sorting Toggle */}
          <div className="flex items-center bg-gray-100 p-1 rounded-lg">
            <Button
              variant={sortBy === 'coverage' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSortBy('coverage')}
              className={`gap-2 ${sortBy === 'coverage' ? 'bg-green-600 hover:bg-green-700 text-white' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-20'}`}
            >
              <Trophy className="h-4 w-4" />
              Nach Abdeckung
            </Button>
            <Button
              variant={sortBy === 'price' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSortBy('price')}
              className={`gap-2 ${sortBy === 'price' ? 'bg-green-600 hover:bg-green-700 text-white' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-20'}`}
            >
              <ArrowUpDown className="h-4 w-4" />
              Nach Preis
            </Button>
          </div>
        </div>

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
                          <span>Im Monatsabo:</span>
                          <span className="font-semibold text-gray-900">€{parsePrice(provider.monthly_price).toFixed(2)}</span>
                        </div>
                        {provider.yearly_price && (
                          <div className="flex justify-between text-sm">
                            <span>Im Jahresabo:</span>
                            <span className="text-gray-900">€{parsePrice(provider.yearly_price).toFixed(2)}</span>
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
                            <div className={`px-2 py-1 rounded text-xs font-medium ${comp.coverage >= 90 ? 'bg-green-100 text-green-800' :
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

                  {/* Features & Sport Section */}
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

                    {/* Further Offers / Other Sports */}
                    {provider.otherSports && provider.otherSports.length > 0 && (
                      <div className="pt-2">
                        <p className="flex items-center gap-1.5 text-sm font-semibold text-gray-900 mb-2">
                          <Dumbbell className="h-4 w-4 text-indigo-500" />
                          Weitere Sportarten
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {provider.otherSports.slice(0, 7).map((sport, i) => (
                            <Badge key={i} variant="secondary" className="font-normal bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-100">
                              {sport}
                            </Badge>
                          ))}
                          {provider.otherSports.length > 7 && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Badge variant="outline" className="font-normal text-gray-500 border-dashed cursor-help">
                                    +{provider.otherSports.length - 7}
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <div className="flex flex-col gap-1">
                                    {provider.otherSports.slice(7).map((s, i) => (
                                      <span key={i}>{s}</span>
                                    ))}
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      </div>
                    )}
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
                              <div className={`px-2 py-1 rounded text-xs font-medium ${league.covered ?
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
