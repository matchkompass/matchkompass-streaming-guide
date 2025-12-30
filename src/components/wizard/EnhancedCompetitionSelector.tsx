import React, { useState, useMemo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, ChevronDown, ChevronUp, Check } from "lucide-react";
import { League } from "@/hooks/useLeagues";
import { LEAGUE_CLUSTERS, LEAGUE_SLUG_TO_NAME, LEAGUE_SLUG_TO_FLAG } from "@/utils/constants";

interface Competition {
  id: string;
  name: string;
  logo: string;
  isRecommended: boolean;
  region: string;
  gameCount: number;
}

interface EnhancedCompetitionSelectorProps {
  selectedCompetitions: string[];
  onCompetitionToggle: (competitionId: string) => void;
  leagues: League[];
  recommendedCompetitions: string[];
}

const EnhancedCompetitionSelector: React.FC<EnhancedCompetitionSelectorProps> = ({
  selectedCompetitions,
  onCompetitionToggle,
  leagues,
  recommendedCompetitions
}) => {
  const [showAllCompetitions, setShowAllCompetitions] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedRegions, setExpandedRegions] = useState<string[]>(['Deutschland', 'Europa', 'International']);

  // Create competitions from database leagues
  const allCompetitions = useMemo(() => {
    const competitionMap: { [key: string]: { name: string; logo: string; region: string } } = {
      bundesliga: { name: "Bundesliga", logo: "🏆", region: 'Deutschland' },
      second_bundesliga: { name: "2. Bundesliga", logo: "🥈", region: 'Deutschland' },
      dfb_pokal: { name: "DFB-Pokal", logo: "🏆", region: 'Deutschland' },
      champions_league: { name: "Champions League", logo: "⭐", region: 'Europa' },
      europa_league: { name: "Europa League", logo: "🏅", region: 'Europa' },
      conference_league: { name: "Conference League", logo: "🏅", region: 'Europa' },
      premier_league: { name: "Premier League", logo: "👑", region: 'International' },
      fa_cup: { name: "FA Cup", logo: "🏆", region: 'International' },
      la_liga: { name: "La Liga", logo: "🇪🇸", region: 'International' },
      copa_del_rey: { name: "Copa del Rey", logo: "👑", region: 'International' },
      serie_a: { name: "Serie A", logo: "🇮🇹", region: 'International' },
      ligue_1: { name: "Ligue 1", logo: "🇫🇷", region: 'International' },
      eredevise: { name: "Eredivisie", logo: "🇳🇱", region: 'International' },
      liga_portugal: { name: "Liga Portugal", logo: "🇵🇹", region: 'International' },
      sueper_lig: { name: "Süper Lig", logo: "🇹🇷", region: 'International' },
      mls: { name: "MLS", logo: "🇺🇸", region: 'International' },
      saudi_pro_league: { name: "Saudi Pro League", logo: "🇸🇦", region: 'International' }
    };

    return leagues.map(league => ({
      id: league.league_slug,
      name: competitionMap[league.league_slug]?.name || league.league,
      logo: competitionMap[league.league_slug]?.logo || "⚽",
      isRecommended: recommendedCompetitions.includes(league.league_slug),
      region: competitionMap[league.league_slug]?.region || 'International',
      gameCount: league['number of games'] || 0
    }));
  }, [leagues, recommendedCompetitions]);

  const recommendedComps = allCompetitions.filter(comp => comp.isRecommended);
  const additionalComps = allCompetitions.filter(comp => !comp.isRecommended);

  // Show first 16 competitions initially (8 recommended + 8 additional)
  const initialAdditionalComps = additionalComps.slice(0, 8);
  const remainingAdditionalComps = additionalComps.slice(8);

  const filteredRemainingComps = remainingAdditionalComps.filter(comp =>
    comp.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedRemainingComps = filteredRemainingComps.reduce((acc, comp) => {
    if (!acc[comp.region]) {
      acc[comp.region] = [];
    }
    acc[comp.region].push(comp);
    return acc;
  }, {} as Record<string, Competition[]>);

  const toggleRegion = (region: string) => {
    setExpandedRegions(prev =>
      prev.includes(region)
        ? prev.filter(r => r !== region)
        : [...prev, region]
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
          Wettbewerbe auswählen
        </h2>
        <p className="text-muted-foreground text-lg">
          Basierend auf deinen Vereinen empfehlen wir diese Wettbewerbe
        </p>
      </div>

      {/* Selected Competitions Section */}
      {selectedCompetitions.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full border border-green-200">
              <Check className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-900">{selectedCompetitions.length} Wettbewerbe ausgewählt</span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {selectedCompetitions.map(slug => {
              const comp = allCompetitions.find(c => c.id === slug);
              if (!comp) return null;
              return (
                <Card
                  key={slug}
                  className="cursor-pointer transition-all duration-200 hover-lift border-2 border-green-600 bg-green-50"
                  onClick={() => onCompetitionToggle(slug)}
                >
                  <CardContent className="p-3 md:p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{LEAGUE_SLUG_TO_FLAG[comp.id] || comp.logo}</span>
                        <div>
                          <h4 className="font-medium text-sm md:text-base text-foreground">{LEAGUE_SLUG_TO_NAME[comp.id] || comp.name}</h4>
                          <p className="text-xs text-muted-foreground">{comp.gameCount} Spiele</p>
                        </div>
                      </div>
                      <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Available Competitions Section */}
      <div className="mb-6">
        <div className="flex items-center justify-center mb-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-full border border-border">
            <span className="text-sm font-medium text-muted-foreground">Weitere Wettbewerbe hinzufügen</span>
          </div>
        </div>

        {/* Clustered Competitions using shared LEAGUE_CLUSTERS */}
        {LEAGUE_CLUSTERS.map((cluster) => {
          const comps = allCompetitions.filter(comp =>
            cluster.leagues.some(l => l.slug === comp.id)
          );
          if (comps.length === 0) return null;

          const themeColors = cluster.key === 'deutschland'
            ? 'text-sport-blue'
            : cluster.key === 'int_wettbewerbe' || cluster.key === 'int_ligen'
              ? 'text-sport-green'
              : 'text-sport-gold';

          return (
            <div key={cluster.name} className="mb-6">
              <h3 className={`text-lg font-semibold mb-3 ${themeColors} flex items-center gap-2`}>
                {cluster.name}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {comps.map(competition => (
                  <Card
                    key={competition.id}
                    className={`cursor-pointer transition-all duration-200 hover-lift ${selectedCompetitions.includes(competition.id)
                      ? 'border-2 border-green-600 bg-green-50'
                      : 'hover:border-green-300 border-gray-200 bg-white'
                      }`}
                    onClick={() => onCompetitionToggle(competition.id)}
                  >
                    <CardContent className="p-3 md:p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{LEAGUE_SLUG_TO_FLAG[competition.id] || competition.logo}</span>
                          <div>
                            <h4 className="font-medium text-sm md:text-base text-foreground">{LEAGUE_SLUG_TO_NAME[competition.id] || competition.name}</h4>
                            <p className="text-xs text-muted-foreground">{competition.gameCount} Spiele</p>
                          </div>
                        </div>
                        {selectedCompetitions.includes(competition.id) && (
                          <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}

        {/* Weitere Wettbewerbe cluster */}
        {(() => {
          const allClusterSlugs = LEAGUE_CLUSTERS.flatMap(cluster => cluster.leagues.map(l => l.slug));
          const weitereComps = allCompetitions.filter(comp => !allClusterSlugs.includes(comp.id));
          if (weitereComps.length === 0) return null;
          return (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 text-muted-foreground">
                📋 Weitere Wettbewerbe
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {weitereComps.map(competition => (
                  <Card
                    key={competition.id}
                    className={`cursor-pointer transition-all duration-200 hover-lift ${selectedCompetitions.includes(competition.id)
                      ? 'border-2 border-green-600 bg-green-50'
                      : 'hover:border-green-300 border-gray-200 bg-white'
                      }`}
                    onClick={() => onCompetitionToggle(competition.id)}
                  >
                    <CardContent className="p-3 md:p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{competition.logo}</span>
                          <div>
                            <h4 className="font-medium text-sm md:text-base text-foreground">{competition.name}</h4>
                            <p className="text-xs text-muted-foreground">{competition.gameCount} Spiele</p>
                          </div>
                        </div>
                        {selectedCompetitions.includes(competition.id) && (
                          <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
};

export default EnhancedCompetitionSelector;