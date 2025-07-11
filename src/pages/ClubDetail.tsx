
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ExternalLink, Users, Calendar, MapPin, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useClubs, Club } from "@/hooks/useClubs";
import { useLeagues } from "@/hooks/useLeagues";
import { getClubCompetitions } from "@/utils/enhancedCoverageCalculator";
import { useStreaming } from "@/hooks/useStreaming";
import { useIsMobile } from "@/hooks/use-mobile";

const ClubDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { clubs, loading: clubsLoading } = useClubs();
  const { leagues } = useLeagues();
  const [club, setClub] = useState<Club | null>(null);
  const { providers } = useStreaming();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (clubs.length > 0 && slug) {
      const foundClub = clubs.find(c => c.slug === slug);
      setClub(foundClub || null);
    }
  }, [clubs, slug]);

  const getCompetitionDetails = (club: Club) => {
    const competitionSlugs = getClubCompetitions(club);
    return competitionSlugs.map(slug => {
      const league = leagues.find(l => l.league_slug === slug);
      return {
        slug,
        name: league?.league || slug.replace('_', ' '),
        games: league?.['number of games'] || 0
      };
    });
  };

  if (clubsLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Lade Vereinsdaten...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!club) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Verein nicht gefunden</h1>
            <p className="text-gray-600">Der angegebene Verein konnte nicht gefunden werden.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const competitions = getCompetitionDetails(club);

  // Helper: get all leagues for this club
  const clubLeagues = Object.keys(club)
    .filter(key => club[key] === true && key !== 'slug' && key !== 'name')
    .filter(key => leagues.some(l => l.league_slug === key));
  // Compute provider coverage for this club (sum covered games for all club leagues)
  const providerCoverages = providers.map(provider => {
    let coveredGames = 0;
    let totalGames = 0;
    clubLeagues.forEach(leagueSlug => {
      const league = leagues.find(l => l.league_slug === leagueSlug);
      if (!league) return;
      const games = league['number of games'] || 0;
      totalGames += games;
      coveredGames += (provider[leagueSlug] || 0);
    });
    const percentage = totalGames > 0 ? Math.round((coveredGames / totalGames) * 100) : 0;
    return {
      provider,
      coveredGames,
      totalGames,
      percentage,
      price: parseFloat(provider.monthly_price) || 0,
    };
  })
    .filter(item => item.coveredGames > 0)
    .sort((a, b) => b.percentage - a.percentage || a.price - b.price)
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Providers Coverage Section */}
        {providerCoverages.length > 0 && (
          <div className="mb-6">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">📺</span>
                  Top Streaming-Anbieter für {club.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border border-dashed rounded-lg p-2 bg-white mb-2">
                  <div className="text-xs text-gray-700 font-semibold mb-1">Verfügbar bei:</div>
                  {providerCoverages.map((item) => (
                    <div key={item.provider.streamer_id} className="flex items-center justify-between border-b last:border-b-0 border-dotted border-gray-200 px-2 py-1 text-sm">
                      <div className="flex items-center gap-2">
                        {item.provider.logo_url ? (
                          <img src={item.provider.logo_url} alt={item.provider.provider_name} className="w-4 h-4 object-contain rounded-full" />
                        ) : (
                          <span className="w-4 h-4 bg-gray-200 rounded-full flex items-center justify-center">📺</span>
                        )}
                        <span className="font-medium">{item.provider.provider_name}</span>
                      </div>
                      <Badge
                        className={
                          `${item.percentage >= 90 ? 'bg-green-500' : item.percentage >= 50 ? 'bg-orange-500' : 'bg-red-500'} ${isMobile ? 'mx-auto flex justify-center' : ''}`
                        }
                      >
                        {item.percentage}%
                      </Badge>
                      <span className="text-xs text-gray-700 font-semibold min-w-[60px] text-right">€{item.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        {/* Hero Section */}
        <div className="bg-white rounded-lg shadow-sm mb-6 overflow-hidden">
          <div 
            className="h-32 bg-gradient-to-r"
            style={{
              background: `linear-gradient(135deg, ${club.primary_color || '#2E7D32'}, ${club.secondary_color || '#1565C0'})`
            }}
          />
          <div className="px-6 pb-6 -mt-16 relative">
            <div className="flex flex-col md:flex-row md:items-end gap-4">
              <div className="bg-white rounded-lg p-4 shadow-lg">
                {club.logo_url ? (
                  <img src={club.logo_url} alt={club.name} className="w-20 h-20 object-contain" />
                ) : (
                  <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center text-3xl">
                    ⚽
                  </div>
                )}
              </div>
              <div className="text-white md:text-gray-900 flex-1">
                <h1 className="text-3xl font-bold mb-2">{club.name}</h1>
                <div className="flex flex-wrap gap-4 text-sm">
                  {club.founded_year && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Gegründet {club.founded_year}
                    </div>
                  )}
                  {club.stadium_name && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {club.stadium_name}
                      {club.stadium_capacity && ` (${club.stadium_capacity?.toLocaleString()} Plätze)`}
                    </div>
                  )}
                  {club.members_count && (
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {club.members_count.toLocaleString()} Mitglieder
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Current Competitions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Aktuelle Wettbewerbe
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {competitions.map((comp, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium">{comp.name}</h4>
                        <p className="text-sm text-gray-600">{comp.games} Spiele</p>
                      </div>
                      <Badge variant="outline">{comp.slug.replace('_', ' ')}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Best Streaming Combo */}
            <Card>
              <CardHeader>
                <CardTitle>Beste Streaming-Kombination</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Finde die optimale Streaming-Lösung für alle {club.name} Spiele
                </p>
                <Button 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    // Navigate to wizard with club pre-selected
                    window.location.href = `/wizard?club=${club.slug}`;
                  }}
                >
                  Jetzt optimieren
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Quick Facts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {club.website_url && (
                  <div>
                    <label className="text-sm font-medium text-gray-600 block mb-1">Website</label>
                    <a 
                      href={club.website_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Offizielle Website <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
                
                {club.fanshop_url && (
                  <div>
                    <label className="text-sm font-medium text-gray-600 block mb-1">Fanshop</label>
                    <a 
                      href={club.fanshop_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Online Shop <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}

                {club.stadium_location && (
                  <div>
                    <label className="text-sm font-medium text-gray-600 block mb-1">Stadion-Standort</label>
                    <p className="text-sm">{club.stadium_location}</p>
                  </div>
                )}

                {club.country && (
                  <div>
                    <label className="text-sm font-medium text-gray-600 block mb-1">Land</label>
                    <p className="text-sm">{club.country}</p>
                  </div>
                )}

                {/* Social Media Links */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600 block">Social Media</label>
                  <div className="flex gap-2">
                    {club.twitter_url && (
                      <a 
                        href={club.twitter_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-600"
                      >
                        Twitter
                      </a>
                    )}
                    {club.instagram_url && (
                      <a 
                        href={club.instagram_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-pink-500 hover:text-pink-700"
                      >
                        Instagram
                      </a>
                    )}
                    {club.facebook_url && (
                      <a 
                        href={club.facebook_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Facebook
                      </a>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ClubDetail;
