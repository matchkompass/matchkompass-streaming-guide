
import { useState, useMemo } from "react";
import { Search, ChevronDown, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLeagues, League } from "@/hooks/useLeagues";
import { Club } from "@/hooks/useClubs";
import { getClubCompetitions } from "@/utils/enhancedCoverageCalculator";

interface SimplifiedCompetitionSelectorProps {
  selectedCompetitions: string[];
  onCompetitionToggle: (competitionId: string) => void;
  selectedClubs: Club[];
}

const SimplifiedCompetitionSelector: React.FC<SimplifiedCompetitionSelectorProps> = ({
  selectedCompetitions,
  onCompetitionToggle,
  selectedClubs
}) => {
  const { leagues } = useLeagues();
  const [searchTerm, setSearchTerm] = useState("");
  const [showAll, setShowAll] = useState(false);

  // Get recommended competitions from selected clubs
  const recommendedCompetitions = useMemo(() => {
    if (selectedClubs.length === 0) return [];
    const allClubCompetitions = selectedClubs.flatMap(club => getClubCompetitions(club));
    return [...new Set(allClubCompetitions)];
  }, [selectedClubs]);

  // Filter and sort leagues
  const filteredLeagues = useMemo(() => {
    let filtered = leagues.filter(league => 
      league.league?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      league.league_slug?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort by: recommended first, then by name
    filtered.sort((a, b) => {
      const aRecommended = recommendedCompetitions.includes(a.league_slug || '');
      const bRecommended = recommendedCompetitions.includes(b.league_slug || '');
      
      if (aRecommended && !bRecommended) return -1;
      if (!aRecommended && bRecommended) return 1;
      return (a.league || '').localeCompare(b.league || '');
    });

    return filtered;
  }, [leagues, searchTerm, recommendedCompetitions]);

  // Display logic: show first 16 by default, all when expanded
  const displayedLeagues = showAll ? filteredLeagues : filteredLeagues.slice(0, 16);
  const remainingCount = filteredLeagues.length - 16;

  const getCompetitionDisplayName = (league: League) => {
    return league.league || league.league_slug?.replace('_', ' ') || 'Unbekannt';
  };

  const isRecommended = (leagueSlug: string) => {
    return recommendedCompetitions.includes(leagueSlug);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Wähle deine Wettbewerbe
        </h2>
        <p className="text-gray-600 mb-6">
          Basierend auf deinen Vereinen haben wir passende Ligen vorausgewählt
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md mx-auto">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Liga suchen..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Competition Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {displayedLeagues.map((league) => {
          const isSelected = selectedCompetitions.includes(league.league_slug || '');
          const recommended = isRecommended(league.league_slug || '');
          
          return (
            <Card
              key={league.league_slug}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                isSelected
                  ? 'ring-2 ring-green-500 bg-green-50'
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => onCompetitionToggle(league.league_slug || '')}
            >
              <CardContent className="p-4 text-center">
                <div className="mb-2">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mx-auto text-xl">
                    🏆
                  </div>
                </div>
                
                <h3 className="font-medium text-sm mb-1 line-clamp-2">
                  {getCompetitionDisplayName(league)}
                </h3>
                
                <p className="text-xs text-gray-600 mb-2">
                  {league['number of games']} Spiele
                </p>

                {recommended && (
                  <Badge variant="secondary" className="text-xs mb-2">
                    Empfohlen
                  </Badge>
                )}

                {isSelected && (
                  <div className="mt-2">
                    <Check className="h-5 w-5 text-green-600 mx-auto" />
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Load More Button */}
      {!showAll && remainingCount > 0 && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={() => setShowAll(true)}
            className="flex items-center gap-2"
          >
            <ChevronDown className="h-4 w-4" />
            Weitere Wettbewerbe anzeigen ({remainingCount} weitere)
          </Button>
        </div>
      )}

      {/* Selection Summary */}
      {selectedCompetitions.length > 0 && (
        <div className="text-center">
          <Badge className="bg-green-100 text-green-800">
            {selectedCompetitions.length} Wettbewerbe ausgewählt
          </Badge>
        </div>
      )}

      {/* Quick Stats */}
      {selectedCompetitions.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-sm mb-2">Ausgewählte Wettbewerbe:</h4>
          <div className="flex flex-wrap gap-1">
            {selectedCompetitions.slice(0, 6).map((competitionSlug) => {
              const league = leagues.find(l => l.league_slug === competitionSlug);
              return (
                <Badge key={competitionSlug} variant="outline" className="text-xs">
                  {getCompetitionDisplayName(league!)}
                </Badge>
              );
            })}
            {selectedCompetitions.length > 6 && (
              <Badge variant="outline" className="text-xs">
                +{selectedCompetitions.length - 6} weitere
              </Badge>
            )}
          </div>
          <p className="text-xs text-gray-600 mt-2">
            Gesamt: {selectedCompetitions.reduce((total, competitionSlug) => {
              const league = leagues.find(l => l.league_slug === competitionSlug);
              return total + (league?.['number of games'] || 0);
            }, 0)} Spiele
          </p>
        </div>
      )}
    </div>
  );
};

export default SimplifiedCompetitionSelector;
