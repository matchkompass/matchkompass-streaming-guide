
import React, { useState } from 'react';
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
  region: 'Deutschland' | 'Europa' | 'International';
}

interface CompetitionSelectorProps {
  allCompetitions: Competition[];
  selectedCompetitions: string[];
  onCompetitionToggle: (competitionId: string) => void;
  leagues: League[];
}

const CompetitionSelector: React.FC<CompetitionSelectorProps> = ({
  allCompetitions,
  selectedCompetitions,
  onCompetitionToggle,
  leagues
}) => {
  const [showAllCompetitions, setShowAllCompetitions] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedRegions, setExpandedRegions] = useState<string[]>(['Deutschland']);

  const recommendedCompetitions = allCompetitions.filter(comp => comp.isRecommended);
  const additionalCompetitions = allCompetitions.filter(comp => !comp.isRecommended);
  
  const filteredAdditionalCompetitions = additionalCompetitions.filter(comp =>
    comp.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedCompetitions = filteredAdditionalCompetitions.reduce((acc, comp) => {
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

  const getGameCount = (competitionId: string) => {
    const league = leagues.find(l => l.league_slug === competitionId);
    return league?.['number of games'] || 0;
  };

  const CompetitionCard = ({ competition, isSelected }: { competition: Competition; isSelected: boolean }) => (
    <Card
      key={competition.id}
      className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
        isSelected
          ? 'ring-2 ring-green-500 bg-green-50'
          : competition.isRecommended
          ? 'ring-1 ring-blue-300 bg-blue-50'
          : 'hover:bg-gray-50'
      }`}
      onClick={() => onCompetitionToggle(competition.id)}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{competition.logo}</span>
            <div>
              <h4 className="font-semibold">{competition.name}</h4>
              <p className="text-sm text-gray-500">
                {getGameCount(competition.id)} Spiele pro Saison
              </p>
            </div>
          </div>
          <div className="text-right">
            {competition.isRecommended && (
              <Badge className="bg-blue-100 text-blue-800 mb-2">
                Empfohlen
              </Badge>
            )}
            {isSelected && (
              <div>
                <Check className="h-5 w-5 text-green-600" />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Wettbewerbe auswählen
        </h2>
        <p className="text-gray-600 mb-8">
          Basierend auf deinen Vereinen empfehlen wir diese Wettbewerbe
        </p>
      </div>

      {/* Recommended Competitions */}
      {recommendedCompetitions.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4 text-blue-800">
            Empfohlene Wettbewerbe (basierend auf deinen Vereinen)
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {recommendedCompetitions.map((competition) => (
              <CompetitionCard
                key={competition.id}
                competition={competition}
                isSelected={selectedCompetitions.includes(competition.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Additional Competitions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-700">
            Weitere Wettbewerbe
          </h3>
          {!showAllCompetitions && (
            <Button
              variant="outline"
              onClick={() => setShowAllCompetitions(true)}
              className="text-blue-600 border-blue-300 hover:bg-blue-50"
            >
              Weitere Wettbewerbe anzeigen ({additionalCompetitions.length} weitere)
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>

        {showAllCompetitions && (
          <div className="space-y-6">
            {/* Search */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Wettbewerb suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Grouped Competitions */}
            {Object.entries(groupedCompetitions).map(([region, competitions]) => (
              <div key={region} className="space-y-3">
                <div
                  className="flex items-center justify-between cursor-pointer p-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  onClick={() => toggleRegion(region)}
                >
                  <h4 className="font-semibold text-gray-800 flex items-center">
                    <span className="mr-2">
                      {region === 'Deutschland' ? '🇩🇪' : region === 'Europa' ? '🇪🇺' : '🌍'}
                    </span>
                    {region}
                    <Badge variant="secondary" className="ml-2">
                      {competitions.length}
                    </Badge>
                  </h4>
                  {expandedRegions.includes(region) ? (
                    <ChevronUp className="h-5 w-5 text-gray-600" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-600" />
                  )}
                </div>

                {expandedRegions.includes(region) && (
                  <div className="grid md:grid-cols-2 gap-4 pl-4">
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

            <div className="text-center pt-4">
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

export default CompetitionSelector;
