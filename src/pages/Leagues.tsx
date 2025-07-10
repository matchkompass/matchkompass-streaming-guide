import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Trophy, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FAQSection from "@/components/FAQSection";
import { useLeagues } from "@/hooks/useLeagues";
import { useStreaming } from "@/hooks/useStreaming";

const Leagues = () => {
  const { leagues, loading } = useLeagues();
  const [searchTerm, setSearchTerm] = useState("");
  const { providers, loading: providersLoading } = useStreaming();

  const filteredLeagues = leagues.filter(league =>
    league.league?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (league as any).country?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group leagues by competition type
  const groupedLeagues = filteredLeagues.reduce((acc, league) => {
    const type = (league as any).competition_type || 'Sonstige';
    if (!acc[type]) acc[type] = [];
    acc[type].push(league);
    return acc;
  }, {} as Record<string, typeof leagues>);

  // Helper to compute provider coverage for a league
  const getProviderCoverage = (provider, league) => {
    const leagueKey = league.league_slug as keyof typeof provider;
    const coveredGames = (provider[leagueKey] as number) || 0;
    const totalGames = league['number of games'] || 0;
    const percentage = totalGames > 0 ? Math.round((coveredGames / totalGames) * 100) : 0;
    return {
      provider,
      coveredGames,
      totalGames,
      percentage,
    };
  };

  const leagueFAQs = [
    {
      question: "Welche Ligen sind auf MatchKompass verfügbar?",
      answer: "MatchKompass deckt alle wichtigen nationalen und internationalen Fußballligen ab, einschließlich Bundesliga, Premier League, La Liga, Serie A, Champions League, Europa League und viele mehr. Insgesamt sind über 50 Wettbewerbe in unserer Datenbank."
    },
    {
      question: "Wie finde ich heraus, welche Streaming-Dienste eine bestimmte Liga übertragen?",
      answer: "Klicke einfach auf die gewünschte Liga und du erhältst eine Übersicht aller Streaming-Anbieter, die Spiele dieser Liga übertragen, inklusive Anzahl der Spiele und Kosten."
    },
    {
      question: "Warum sind manche Ligen nicht komplett bei einem Anbieter verfügbar?",
      answer: "Die Übertragungsrechte für Fußballligen sind oft zwischen verschiedenen Anbietern aufgeteilt. Zum Beispiel überträgt Sky bestimmte Bundesliga-Spiele, während DAZN andere hat. MatchKompass hilft dir, die optimale Kombination zu finden."
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-12 bg-gray-300 rounded w-64 mx-auto"></div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-300 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Trophy className="h-10 w-10 text-green-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">
              Alle Fußball-Ligen
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Entdecke alle verfügbaren Fußballligen und finde heraus, 
            welche Streaming-Dienste du für deine Lieblingswettbewerbe brauchst.
          </p>
          
          {/* Search Bar */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Liga oder Land suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 text-lg py-6"
            />
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {leagues.length}
              </div>
              <p className="text-gray-600">Verfügbare Ligen</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {leagues.reduce((sum, league) => sum + (league['number of games'] || 0), 0)}
              </div>
              <p className="text-gray-600">Spiele pro Saison</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {new Set(leagues.map(l => (l as any).country)).size}
              </div>
              <p className="text-gray-600">Länder</p>
            </CardContent>
          </Card>
        </div>

        {/* Leagues by Category */}
        {Object.entries(groupedLeagues).map(([category, categoryLeagues]) => (
          <div key={category} className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Trophy className="h-6 w-6 text-green-600 mr-2" />
              {category}
              <Badge variant="secondary" className="ml-3">
                {categoryLeagues.length} Ligen
              </Badge>
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoryLeagues
                .sort((a, b) => ((b as any).popularity || 0) - ((a as any).popularity || 0))
                .map((league) => (
                <Link 
                  key={league.league_id}
                  to={`/competition/${league.league_slug}`}
                  className="group"
                >
                  <Card className="hover:shadow-lg transition-all duration-300 group-hover:scale-105 cursor-pointer h-full">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center">
                          <Trophy className="h-6 w-6 text-green-600" />
                        </div>
                        {(league as any).popularity && (league as any).popularity > 7 && (
                          <Badge className="bg-yellow-100 text-yellow-800">
                            Beliebt
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg group-hover:text-green-600 transition-colors">
                        {league.league}
                      </CardTitle>
                    </CardHeader>
                    
                    <CardContent className="space-y-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="font-medium">{(league as any).country || 'International'}</span>
                        {(league as any)['country code'] && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            {(league as any)['country code']}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center text-gray-600 text-xs mb-2">
                        <Users className="h-4 w-4 mr-1" />
                        <span>{league['number of games']} Spiele</span>
                      </div>
                      
                      {/* Streaming Providers Coverage */}
                      <div className="space-y-1">
                        {providersLoading ? (
                          <div className="text-xs text-gray-400">Lade Anbieter...</div>
                        ) : (
                          providers
                            .map((provider) => getProviderCoverage(provider, league))
                            .filter((item) => item.coveredGames > 0)
                            .sort((a, b) => b.percentage - a.percentage)
                            .map((item) => (
                              <div key={item.provider.streamer_id} className="flex items-center justify-between border rounded px-2 py-1 text-xs">
                                <div className="flex items-center gap-2">
                                  {item.provider.logo_url ? (
                                    <img src={item.provider.logo_url} alt={item.provider.provider_name} className="w-4 h-4 object-contain" />
                                  ) : (
                                    <span className="w-4 h-4 bg-gray-200 rounded flex items-center justify-center">📺</span>
                                  )}
                                  <span>{item.provider.provider_name}</span>
                                </div>
                                <span className="font-mono text-xs bg-gray-100 rounded px-2 py-0.5">{item.percentage}%</span>
                                <span className="text-xs text-gray-500">ab {parseFloat(item.provider.monthly_price).toFixed(2)}€</span>
                              </div>
                            ))
                        )}
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full group-hover:bg-green-50 group-hover:border-green-500 group-hover:text-green-700"
                      >
                        Alle Vereine anzeigen
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        ))}

        {filteredLeagues.length === 0 && searchTerm && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Keine Ligen gefunden
            </h3>
            <p className="text-gray-600 mb-4">
              Versuche es mit einem anderen Suchbegriff.
            </p>
            <Button 
              variant="outline" 
              onClick={() => setSearchTerm("")}
            >
              Alle Ligen anzeigen
            </Button>
          </div>
        )}
      </div>

      <FAQSection faqs={leagueFAQs} />
      <Footer />
    </div>
  );
};

export default Leagues;