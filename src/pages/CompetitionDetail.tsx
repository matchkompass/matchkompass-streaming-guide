
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Trophy, Users, Play, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { useLeagues, League } from "@/hooks/useLeagues";
import { useClubs } from "@/hooks/useClubs";
import { useStreaming } from "@/hooks/useStreaming";

const CompetitionDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { leagues, loading: leaguesLoading } = useLeagues();
  const { clubs } = useClubs();
  const { providers } = useStreaming();
  const [league, setLeague] = useState<League | null>(null);

  useEffect(() => {
    if (leagues.length > 0 && slug) {
      const foundLeague = leagues.find(l => l.league_slug === slug);
      setLeague(foundLeague || null);
    }
  }, [leagues, slug]);

  const getParticipatingClubs = () => {
    if (!league) return [];
    return clubs.filter(club => {
      const leagueKey = league.league_slug as keyof typeof club;
      return club[leagueKey] === true;
    });
  };

  const getStreamingCoverage = () => {
    if (!league) return [];
    
    return providers
      .map(provider => {
        const leagueKey = league.league_slug as keyof typeof provider;
        const coveredGames = (provider[leagueKey] as number) || 0;
        const totalGames = league['number of games'] || 0;
        const percentage = totalGames > 0 ? Math.round((coveredGames / totalGames) * 100) : 0;
        
        return {
          provider,
          coveredGames,
          totalGames,
          percentage
        };
      })
      .filter(item => item.coveredGames > 0)
      .sort((a, b) => b.percentage - a.percentage);
  };

  const parsePrice = (priceString?: string): number => {
    if (!priceString) return 0;
    return parseFloat(priceString.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
  };

  if (leaguesLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Lade Liga-Daten...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!league) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Liga nicht gefunden</h1>
            <p className="text-gray-600">Die angegebene Liga konnte nicht gefunden werden.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const participatingClubs = getParticipatingClubs()
    .sort((a, b) => (b.popularity_score || 0) - (a.popularity_score || 0))
    .slice(0, 8);
  const streamingCoverage = getStreamingCoverage();

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead 
        title={`${league?.league} Streaming-Guide | MatchStream`}
        description={`Alle Streaming-Optionen für ${league?.league}. Vergleiche Sky, DAZN & Co für alle ${league?.['number of games']} Spiele der Saison.`}
        keywords={`${league?.league} Stream, ${league?.league} schauen, Fußball Streaming, ${league?.['country code'] || ''}`}
        canonical={`https://matchstream.de/competition/${slug}`}
        ogType="website"
        ogImage={league?.icon || "https://lovable.dev/opengraph-image-p98pqg.png"}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "SportsOrganization",
          "name": league?.league,
          "sport": "Fußball",
          "url": `https://matchstream.de/competition/${slug}`,
          "numberOfGames": league?.['number of games'],
          "memberOf": {
            "@type": "Country",
            "name": league?.['country code']
          }
        }}
      />
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        {/* Hero Section */}
        <div className="bg-white rounded-lg shadow-sm mb-6 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
            <div className="bg-gray-100 rounded-lg p-3 sm:p-4 self-center sm:self-auto">
              <Trophy className="h-12 w-12 sm:h-16 sm:w-16 text-gray-600" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{league.league}</h1>
              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-gray-600 text-sm sm:text-base">
                <div className="flex items-center gap-1">
                  <Play className="h-4 w-4" />
                  {league['number of games']} Spiele pro Saison
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {participatingClubs.length} Teilnehmer
                </div>
                {league['country code'] && (
                  <Badge variant="outline">{league['country code']}</Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Participating Teams */}
            <Card>
              <CardHeader>
                <CardTitle><h2>Teilnehmer</h2></CardTitle>
              </CardHeader>
              <CardContent>
                {participatingClubs.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3 sm:gap-4">
                    {participatingClubs.map((club) => (
                      <Link
                        key={club.club_id}
                        to={`/club/${club.slug}`}
                        className="flex flex-col items-center p-2 sm:p-3 bg-gray-50 rounded-lg hover:bg-green-50 border border-transparent hover:border-green-300 transition-colors"
                      >
                        <div className="mb-2">
                          {club.logo_url ? (
                            <img src={club.logo_url} alt={`${club.name} Logo`} className="w-6 h-6 sm:w-8 sm:h-8 object-contain" />
                          ) : (
                            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-300 rounded-full flex items-center justify-center text-xs sm:text-sm">
                              ⚽
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-center font-medium leading-tight">{club.name}</span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-sm sm:text-base">Keine teilnehmenden Vereine in der Datenbank gefunden</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Streaming Coverage */}
            <Card>
              <CardHeader>
                <CardTitle><h2>Streaming-Verfügbarkeit</h2></CardTitle>
              </CardHeader>
              <CardContent>
                {streamingCoverage.length > 0 ? (
                  <>
                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Anbieter</TableHead>
                            <TableHead>Spiele</TableHead>
                            <TableHead>Abdeckung</TableHead>
                            <TableHead>Preis & Abonnement</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {streamingCoverage.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  {item.provider.logo_url ? (
                                    <img 
                                      src={item.provider.logo_url} 
                                      alt={item.provider.provider_name} 
                                      className="w-8 h-8 object-contain" 
                                    />
                                  ) : (
                                    <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                                      📺
                                    </div>
                                  )}
                                  <span className="font-medium">{item.provider.provider_name}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                {item.coveredGames}/{item.totalGames}
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  className={
                                    item.percentage >= 90 ? 'bg-green-500' : 
                                    item.percentage >= 50 ? 'bg-orange-500' : 
                                    'bg-red-500'
                                  }
                                >
                                  {item.percentage}%
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col gap-2">
                                  <span>ab {parsePrice(item.provider.monthly_price).toFixed(2)}€/Monat</span>
                                  {item.provider.affiliate_url && (
                                    <Button 
                                      size="sm"
                                      className="bg-green-600 hover:bg-green-700 text-white"
                                      onClick={() => window.open(item.provider.affiliate_url, '_blank')}
                                    >
                                      Jetzt abonnieren
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden space-y-3">
                      {streamingCoverage.map((item, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              {item.provider.logo_url ? (
                                <img 
                                  src={item.provider.logo_url} 
                                  alt={item.provider.provider_name} 
                                  className="w-8 h-8 object-contain" 
                                />
                              ) : (
                                <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                                  📺
                                </div>
                              )}
                              <span className="font-medium text-sm">{item.provider.provider_name}</span>
                            </div>
                            <Badge 
                              className={
                                item.percentage >= 90 ? 'bg-green-500' : 
                                item.percentage >= 50 ? 'bg-orange-500' : 
                                'bg-red-500'
                              }
                            >
                              {item.percentage}%
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                            <div>
                              <span className="text-gray-600">Spiele:</span>
                              <span className="ml-1 font-medium">{item.coveredGames}/{item.totalGames}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Preis:</span>
                              <span className="ml-1 font-medium">ab {parsePrice(item.provider.monthly_price).toFixed(2)}€/Mon.</span>
                            </div>
                          </div>
                          {item.provider.affiliate_url && (
                            <Button 
                              className="w-full bg-green-600 hover:bg-green-700 text-white text-sm"
                              onClick={() => window.open(item.provider.affiliate_url, '_blank')}
                            >
                              Jetzt abonnieren
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Play className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-sm sm:text-base">Keine Streaming-Anbieter für diese Liga verfügbar</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle><h2>Beste Kombi für {league.league}</h2></CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Finde die optimale Streaming-Lösung für alle {league.league} Spiele
                </p>
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    window.location.href = `/wizard?league=${league.league_slug}`;
                  }}
                >
                  Jetzt optimieren
                </Button>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle><h2>Liga-Statistiken</h2></CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Gesamte Spiele:</span>
                  <span className="font-medium">{league['number of games']}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Teilnehmer:</span>
                  <span className="font-medium">{participatingClubs.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Streaming-Anbieter:</span>
                  <span className="font-medium">{streamingCoverage.length}</span>
                </div>
                {streamingCoverage.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Beste Abdeckung:</span>
                    <span className="font-medium">{streamingCoverage[0].percentage}%</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CompetitionDetail;
