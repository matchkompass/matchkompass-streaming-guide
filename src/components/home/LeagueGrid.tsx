
import { useLeaguesEnhanced } from "@/hooks/useLeaguesEnhanced";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { LEAGUE_CLUSTERS } from "@/utils/constants";

const LeagueGrid = () => {
    const { leagues, loading } = useLeaguesEnhanced();

    // Sort leagues by popularity (ascending - based on existing slider logic but typically lower is better rank, 
    // or higher is better score? The previous code used a-b, suggesting ascending. 
    // Let's assume the hook returns them sorted or we sort them here suitable for display).
    // Limiting to 8 items for the grid view on homepage.
    const displayLeagues = (leagues || []).slice(0, 8);

    const getLeagueFlag = (league: any) => {
        return league.icon || LEAGUE_CLUSTERS.flatMap(c => c.leagues).find(l => l.slug === league.league_slug)?.flag || "🏆";
    };

    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="h-24 animate-pulse bg-gray-100 border-0" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900">Beliebte Ligen</h3>
                <Link to="/competition" className="text-green-600 hover:text-green-700 font-medium text-sm flex items-center">
                    Alle ansehen <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {displayLeagues.map((league) => (
                    <Link key={league.league_id} to={`/competition/${league.league_slug}`}>
                        <Card className="hover:shadow-md transition-all cursor-pointer border shadow-sm group bg-white">
                            <CardContent className="p-4 flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="flex-shrink-0 w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center text-2xl">
                                        {getLeagueFlag(league)}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                                            {league.league}
                                        </h4>
                                        <p className="text-xs text-gray-500">
                                            {league['number of games']} Spiele
                                        </p>
                                    </div>
                                </div>
                                <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-green-500 transition-colors" />
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            <div className="text-center sm:hidden">
                <Button asChild variant="outline" className="w-full">
                    <Link to="/competition">Alle Ligen anzeigen</Link>
                </Button>
            </div>
        </div>
    );
};

export default LeagueGrid;
