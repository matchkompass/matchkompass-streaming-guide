
import React, { useState, useMemo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, ChevronDown, ChevronUp, Check } from "lucide-react";
import { League } from "@/hooks/useLeagues";

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
  const [expandedRegions, setExpandedRegions] = useState<string[]>(['Deutschland', 'Europa']);

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

  const CompetitionCard = ({ competition, isSelected }: { competition: Competition; isSelected: boolean }) => (
    <Card
      key={competition.id}
      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
        isSelected
          ? 'ring-2 ring-green-500 bg-green-50'
          : competition.isRecommended
          ? 'ring-1 ring-blue-300 bg-blue-50'
          : 'hover:bg-gray-50'
      }`}
      onClick={() => onCompetitionToggle(competition.id)}
    >
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xl">{competition.logo}</span>
            <div>
              <h4 className="font-medium text-sm">{competition.name}</h4>
              <p className="text-xs text-gray-500">
                {competition.gameCount} Spiele
              </p>
            </div>
          </div>
          <div className="text-right">
            {competition.isRecommended && (
              <Badge className="bg-blue-100 text-blue-800 text-xs mb-1">
                Empfohlen
              </Badge>
            )}
            {isSelected && (
              <Check className="h-4 w-4 text-green-600" />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Wettbewerbe auswählen
        </h2>
        <p className="text-gray-600 mb-6">
          Basierend auf deinen Vereinen empfehlen wir diese Wettbewerbe
        </p>
      </div>

      {/* Recommended Competitions */}
      {recommendedComps.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 text-blue-800">
            Empfohlene Wettbewerbe
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {recommendedComps.map((competition) => (
              <CompetitionCard
                key={competition.id}
                competition={competition}
                isSelected={selectedCompetitions.includes(competition.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Initial Additional Competitions */}
      {initialAdditionalComps.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-700">
            Weitere beliebte Wettbewerbe
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {initialAdditionalComps.map((competition) => (
              <CompetitionCard
                key={competition.id}
                competition={competition}
                isSelected={selectedCompetitions.includes(competition.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Show More Button / All Remaining Competitions */}
      {remainingAdditionalComps.length > 0 && (
        <div>
          {!showAllCompetitions ? (
            <div className="text-center">
              <Button
                variant="outline"
                onClick={() => setShowAllCompetitions(true)}
                className="text-blue-600 border-blue-300 hover:bg-blue-50"
              >
                Weitere Wettbewerbe anzeigen ({remainingAdditionalComps.length} weitere)
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Search */}
              <div className="relative max-w-md mx-auto">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Wettbewerb suchen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Grouped Competitions */}
              {Object.entries(groupedRemainingComps).map(([region, competitions]) => (
                <div key={region} className="space-y-2">
                  <div
                    className="flex items-center justify-between cursor-pointer p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    onClick={() => toggleRegion(region)}
                  >
                    <h4 className="font-medium text-gray-800 flex items-center">
                      <span className="mr-2">
                        {region === 'Deutschland' ? '🇩🇪' : region === 'Europa' ? '🇪🇺' : '🌍'}
                      </span>
                      {region}
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {competitions.length}
                      </Badge>
                    </h4>
                    {expandedRegions.includes(region) ? (
                      <ChevronUp className="h-4 w-4 text-gray-600" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-600" />
                    )}
                  </div>

                  {expandedRegions.includes(region) && (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 pl-2">
                      {competitions.map((competition) => (
                        <CompetitionCard
                          key={competition.id}
                          competition={competition}
                          isSelected={selectedCompetitions.includes(competition.id)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}

              <div className="text-center pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowAllCompetitions(false)}
                  className="text-gray-600"
                >
                  Weniger anzeigen
                  <ChevronUp className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {selectedCompetitions.length > 0 && (
        <div className="text-center">
          <Badge className="bg-green-100 text-green-800">
            {selectedCompetitions.length} Wettbewerbe ausgewählt
          </Badge>
        </div>
      )}
    </div>
  );
};

export default EnhancedCompetitionSelector;
