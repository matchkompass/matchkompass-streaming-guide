import { useLeagues } from "@/hooks/useLeagues";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { LEAGUE_CLUSTERS } from "@/pages/Wizard";

const LeagueSlider = () => {
  const { leagues, loading } = useLeagues();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(4);

  useEffect(() => {
    const updateItemsPerView = () => {
      if (window.innerWidth < 640) {
        setItemsPerView(1);
      } else if (window.innerWidth < 768) {
        setItemsPerView(2);
      } else if (window.innerWidth < 1024) {
        setItemsPerView(3);
      } else {
        setItemsPerView(4);
      }
    };

    updateItemsPerView();
    window.addEventListener('resize', updateItemsPerView);
    return () => window.removeEventListener('resize', updateItemsPerView);
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prev) => 
      prev + itemsPerView >= leagues.length ? 0 : prev + itemsPerView
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => 
      prev === 0 ? Math.max(0, leagues.length - itemsPerView) : Math.max(0, prev - itemsPerView)
    );
  };

  if (loading || leagues.length === 0) {
    return (
      <div className="flex justify-center py-8">
        <div className="text-gray-500">Lade Ligen...</div>
      </div>
    );
  }

  // Get flag for league
  const getLeagueFlag = (league: any) => {
    return league.icon || LEAGUE_CLUSTERS.flatMap(c => c.leagues).find(l => l.slug === league.league_slug)?.flag || "🏆";
  };

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-gray-900">Unsere Ligen</h3>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={prevSlide}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={nextSlide}
            disabled={currentIndex + itemsPerView >= leagues.length}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="overflow-hidden">
        <div 
          className="flex transition-transform duration-300 ease-in-out"
          style={{ 
            transform: `translateX(-${(currentIndex * 100) / itemsPerView}%)`,
            width: `${(leagues.length * 100) / itemsPerView}%`
          }}
        >
          {leagues.map((league) => (
            <div 
              key={league.league_id} 
              className="flex-shrink-0 px-2"
              style={{ width: `${100 / leagues.length}%` }}
            >
              <Link to={`/competition/${league.league_slug}`}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <div className="flex justify-center mb-4">
                      <span className="text-4xl">{getLeagueFlag(league)}</span>
                    </div>
                    <h4 className="font-semibold text-lg mb-2">{league.league}</h4>
                    <p className="text-gray-600 text-sm">
                      {league['number of games']} Spiele
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LeagueSlider;