
import { useState, useMemo } from "react";
import { Search, ChevronDown, ChevronUp, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Club } from "@/hooks/useClubs";
import { LeagueEnhanced } from "@/hooks/useLeaguesEnhanced";
import { LEAGUE_CLUSTERS } from "@/utils/constants";
import { getClubCompetitions } from "@/utils/enhancedCoverageCalculator";

interface ClubSelectionStepProps {
    clubs: Club[];
    leagues: LeagueEnhanced[];
    selectedClubIds: number[];
    onClubToggle: (clubId: number) => void;
    headerAction?: React.ReactNode;
}

const ClubSelectionStep = ({ clubs, leagues, selectedClubIds, onClubToggle, headerAction }: ClubSelectionStepProps) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [expandedLeagues, setExpandedLeagues] = useState<string[]>(["Bundesliga", "Champions League"]);
    const [showAllClubs, setShowAllClubs] = useState<Record<string, boolean>>({});

    const toggleLeague = (leagueName: string) => {
        setExpandedLeagues(prev =>
            prev.includes(leagueName)
                ? prev.filter(name => name !== leagueName)
                : [...prev, leagueName]
        );
    };

    // Filter clubs by search term
    const filteredClubs = useMemo(() => {
        if (!searchTerm) return clubs;
        const lowerTerm = searchTerm.toLowerCase();
        return clubs.filter(club =>
            club.name?.toLowerCase().includes(lowerTerm) ||
            club.country?.toLowerCase().includes(lowerTerm)
        );
    }, [clubs, searchTerm]);

    // Custom Popularity Map
    const CUSTOM_POPULARITY: Record<string, number> = {
        "FC Bayern München": 100,
        "Borussia Dortmund": 99,
        "FC Schalke 04": 98,
        "FC Barcelona": 97,
        "Real Madrid": 96,
        "FC Liverpool": 95,
        "Paris Saint-Germain": 94,
        "AC Mailand": 93,
        "Galatasaray": 92
    };

    // Top 9 Popular Clubs (based on custom map then popularity_score)
    const popularClubs = useMemo(() => {
        if (searchTerm) return []; // Don't show popular section when searching

        return [...clubs]
            .sort((a, b) => {
                const scoreA = CUSTOM_POPULARITY[a.name || ""] || 0;
                const scoreB = CUSTOM_POPULARITY[b.name || ""] || 0;
                if (scoreA !== scoreB) return scoreB - scoreA;
                return (b.popularity_score || 0) - (a.popularity_score || 0);
            })
            .slice(0, 9);
    }, [clubs, searchTerm]);

    // Group clubs by league (using slug as key for stability)
    const clubsByLeague = useMemo(() => {
        const grouped: Record<string, Club[]> = {};

        // We only categorize the *filtered* clubs
        filteredClubs.forEach(club => {
            const clubLeagues = getClubCompetitions(club);
            clubLeagues.forEach(leagueSlug => {
                // Ensure we use the slug as key
                if (!grouped[leagueSlug]) {
                    grouped[leagueSlug] = [];
                }
                // Avoid duplicates in the same league list
                if (!grouped[leagueSlug].find(c => c.club_id === club.club_id)) {
                    grouped[leagueSlug].push(club);
                }
            });
        });

        // Sort clubs inside leagues by popularity
        Object.keys(grouped).forEach(leagueSlug => {
            grouped[leagueSlug].sort((a, b) => (b.popularity_score || 0) - (a.popularity_score || 0));
        });

        return grouped;
    }, [filteredClubs, leagues]);

    return (
        <div className="space-y-8">
            <div className="relative mb-8">
                <div className="text-center px-4 md:px-32">
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-1">
                        Wähle deine Lieblingsvereine
                    </h2>
                    <p className="text-muted-foreground text-lg">
                        Markiere alle Vereine, deren Spiele du verfolgen möchtest
                    </p>
                </div>
                {headerAction && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 hidden md:block">
                        {headerAction}
                    </div>
                )}
                {headerAction && (
                    <div className="md:hidden mt-4 flex justify-center">
                        {headerAction}
                    </div>
                )}
            </div>

            {/* Search */}
            <div className="relative max-w-lg mx-auto mb-8">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    placeholder="Verein suchen (z.B. Bayern, BVB, Real...)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-12 text-lg bg-background border-border rounded-xl shadow-sm focus:ring-2 focus:ring-primary/20"
                />
            </div>

            {/* Selected Clubs Preview */}
            {selectedClubIds.length > 0 && (
                <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
                    {clubs.filter(c => selectedClubIds.includes(c.club_id)).slice(0, 5).map(club => (
                        <div key={club.club_id} className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1.5 rounded-full text-sm font-medium border border-green-200">
                            {club.logo_url && <img src={club.logo_url} alt="" className="w-4 h-4 object-contain" />}
                            {club.name}
                            <button onClick={() => onClubToggle(club.club_id)} className="hover:text-red-600 ml-1">×</button>
                        </div>
                    ))}
                    {selectedClubIds.length > 5 && (
                        <span className="text-muted-foreground text-sm">+{selectedClubIds.length - 5} weitere</span>
                    )}
                </div>
            )}

            {/* Popular Clubs Section */}
            {popularClubs.length > 0 && !searchTerm && (
                <div className="mb-10">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        🔥 Beliebte Vereine
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {popularClubs.map(club => (
                            <ClubCard
                                key={`popular-${club.club_id}`}
                                club={club}
                                isSelected={selectedClubIds.includes(club.club_id)}
                                onToggle={() => onClubToggle(club.club_id)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* League Clusters */}
            {filteredClubs.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-muted-foreground text-lg">Keine Vereine gefunden.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {LEAGUE_CLUSTERS.map((cluster) => {
                        const clusterLeagues = cluster.leagues.filter(league =>
                            clubsByLeague[league.slug] && clubsByLeague[league.slug].length > 0
                        );

                        if (clusterLeagues.length === 0) return null;

                        // Determine cluster theme colors
                        const themeColors = {
                            deutschland: { bg: 'bg-blue-50', border: 'border-blue-100', header: 'text-blue-800' },
                            int_wettbewerbe: { bg: 'bg-green-50', border: 'border-green-100', header: 'text-green-800' },
                            int_ligen: { bg: 'bg-yellow-50', border: 'border-yellow-100', header: 'text-yellow-800' },
                            pokale: { bg: 'bg-orange-50', border: 'border-orange-100', header: 'text-orange-800' }
                        };
                        const colors = themeColors[cluster.key as keyof typeof themeColors] || themeColors.deutschland;

                        return (
                            <div key={cluster.name} className={`rounded-2xl border ${colors.border} ${colors.bg} overflow-hidden`}>
                                <div className={`px-4 py-3 font-semibold ${colors.header} border-b ${colors.border} bg-white/50`}>
                                    {cluster.name}
                                </div>
                                <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {clusterLeagues.map(league => {
                                        const leagueClubs = clubsByLeague[league.slug];
                                        const isExpanded = expandedLeagues.includes(league.name) || !!searchTerm; // Auto expand on search
                                        const showAll = showAllClubs[league.name] || false;
                                        const displayedClubs = showAll || searchTerm ? leagueClubs : leagueClubs.slice(0, 6); // Show less initially inside league lists to save space

                                        return (
                                            <div
                                                key={league.name}
                                                className={`bg-white rounded-xl shadow-sm border border-gray-100 h-fit transition-all duration-300 ${isExpanded ? 'md:col-span-3' : 'col-span-1'
                                                    }`}
                                            >
                                                <button
                                                    onClick={() => toggleLeague(league.name)}
                                                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors rounded-t-xl"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-xl">{league.flag}</span>
                                                        <span className="font-semibold text-gray-900 text-sm">{league.name}</span>
                                                        <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                                                            {leagueClubs.length}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {isExpanded ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                                                    </div>
                                                </button>

                                                {isExpanded && (
                                                    <div className="px-3 pb-3 border-t border-gray-50 pt-3">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                            {displayedClubs.map(club => (
                                                                <ClubCard
                                                                    key={`${league.name}-${club.club_id}`}
                                                                    club={club}
                                                                    isSelected={selectedClubIds.includes(club.club_id)}
                                                                    onToggle={() => onClubToggle(club.club_id)}
                                                                />
                                                            ))}
                                                        </div>
                                                        {leagueClubs.length > 6 && !showAll && !searchTerm && (
                                                            <div className="mt-2 text-center">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => setShowAllClubs(prev => ({ ...prev, [league.name]: true }))}
                                                                    className="text-xs text-gray-500 hover:text-gray-900 w-full"
                                                                >
                                                                    Alle {leagueClubs.length} anzeigen
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

// Subcomponent for the Club Card
const ClubCard = ({ club, isSelected, onToggle }: { club: Club, isSelected: boolean, onToggle: () => void }) => {
    return (
        <Card
            className={`cursor-pointer transition-all duration-200 border shadow-sm hover:shadow-md group relative
            ${isSelected ? 'border-2 border-green-600 bg-green-50' : 'hover:border-green-300 border-gray-200 bg-white'}`}
            onClick={onToggle}
        >
            <CardContent className="p-3 flex items-center space-x-3">
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center overflow-hidden border ${isSelected ? 'border-green-200 bg-white' : 'border-gray-100 bg-gray-50'}`}>
                    {club.logo_url ? (
                        <img src={club.logo_url} alt={club.name || ''} className="w-full h-full object-contain" />
                    ) : (
                        <span className="text-xs font-bold text-gray-400">{club.name?.charAt(0)}</span>
                    )}
                </div>
                <div className="flex-1 min-w-0 text-left">
                    <h4 className={`font-semibold text-sm truncate ${isSelected ? 'text-green-900' : 'text-gray-900'}`}>
                        {club.name}
                    </h4>
                    <p className="text-xs text-gray-500 truncate">
                        {club.country}
                    </p>
                </div>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-colors ${isSelected ? 'bg-green-600 border-green-600' : 'border-gray-300 group-hover:border-green-400'}`}>
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                </div>
            </CardContent>
        </Card>
    );
};

export default ClubSelectionStep;
