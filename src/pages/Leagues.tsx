import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search, Trophy, Users, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FAQSection from "@/components/FAQSection";
import { useLeaguesEnhanced } from "@/hooks/useLeaguesEnhanced";
import { useStreamingEnhanced } from "@/hooks/useStreamingEnhanced";
import { LEAGUE_CLUSTERS } from "./Wizard";
import { useIsMobile } from "@/hooks/use-mobile";
import { useClubs } from "@/hooks/useClubs";

// Helper: slug to flag
const LEAGUE_SLUG_TO_FLAG = Object.fromEntries(
  LEAGUE_CLUSTERS.flatMap(cluster => cluster.leagues.map(l => [l.slug, l.flag]))
);

const Leagues = () => {
  const { leagues, loading } = useLeaguesEnhanced();
  const { clubs } = useClubs();
  const [searchTerm, setSearchTerm] = useState("");
  const { providers, loading: providersLoading } = useStreamingEnhanced();
  const isMobile = useIsMobile();

  // Calculate statistics
  const totalGames = useMemo(() => {
    return leagues.reduce((sum, league) => sum + (league['number of games'] || 0), 0);
  }, [leagues]);

  const totalCountries = useMemo(() => {
    const countries = new Set(leagues.map(league => league.country));
    return countries.size;
  }, [leagues]);

  // Filter leagues based on search term
  const filteredLeagues = useMemo(() => {
    if (!searchTerm.trim()) return leagues;
    const searchLower = searchTerm.toLowerCase().trim();
    return leagues.filter(league =>
      league.league?.toLowerCase().includes(searchLower) ||
      league.country?.toLowerCase().includes(searchLower) ||
      league.league_slug?.toLowerCase().includes(searchLower)
    );
  }, [leagues, searchTerm]);

  // Group leagues by competition type
  const groupedLeagues = filteredLeagues.reduce((acc, league) => {
    const type = 'Sonstige';
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
    const price = parseFloat(provider.monthly_price?.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
    return {
      provider,
      coveredGames,
      totalGames,
      percentage,
      price,
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
              Alle Vereine & Ligen
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

        {/* Statistics - Hidden on mobile */}
        <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
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
                {totalGames}
              </div>
              <p className="text-gray-600">Spiele pro Saison</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {totalCountries}
              </div>
              <p className="text-gray-600">Länder</p>
            </CardContent>
          </Card>
        </div>

        {/* Conversion Elements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2">Optimale Kombination finden</h3>
                  <p className="opacity-90">Lass uns die perfekte Streaming-Kombination für deine Vereine berechnen</p>
                </div>
                <ArrowRight className="h-8 w-8" />
              </div>
              <Button asChild className="mt-4 bg-white text-green-600 hover:bg-gray-100">
                <Link to="/wizard">Wizard starten</Link>
              </Button>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2">Alle Anbieter vergleichen</h3>
                  <p className="opacity-90">Detaillierter Vergleich aller Features und Preise</p>
                </div>
                <ArrowRight className="h-8 w-8" />
              </div>
              <Button asChild className="mt-4 bg-white text-blue-600 hover:bg-gray-100">
                <Link to="/vergleich">Vergleich starten</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Leagues by Category */}
        {LEAGUE_CLUSTERS.map((cluster) => {
          // Get leagues in this cluster that exist in the fetched leagues data
          const clusterLeagues = cluster.leagues
            .map((cl) => leagues.find((l) => l.league_slug === cl.slug))
            .filter(Boolean);
          if (clusterLeagues.length === 0) return null;
          return (
            <div key={cluster.key} className="mb-12">
              <h2 className={`text-2xl font-bold mb-6 flex items-center ${cluster.headerColor}`}>
                {cluster.name}
                <Badge variant="secondary" className="ml-3">
                  {clusterLeagues.length} Ligen
                </Badge>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {clusterLeagues.map((league) => {
                  // Compute all provider coverages for this league
                  const allProviderCoverages = providers
                    .map((provider) => getProviderCoverage(provider, league))
                    .filter((item) => item.coveredGames > 0);
                  // Find the cheapest 100% coverage provider
                  const fullCoverageProviders = allProviderCoverages.filter(item => item.percentage === 100).sort((a, b) => a.price - b.price);
                  const cheapestFullCoverage = fullCoverageProviders[0] || null;
                  // Get up to 2 more providers with any coverage, excluding the 100% provider
                  const otherProviders = allProviderCoverages
                    .filter(item => !cheapestFullCoverage || item.provider.streamer_id !== cheapestFullCoverage.provider.streamer_id)
                    .sort((a, b) => a.price - b.price)
                    .slice(0, 2);
                  // Use icon from league data, else flag, else trophy
                  const flag = league.icon || LEAGUE_CLUSTERS.flatMap(c => c.leagues).find(l => l.slug === league.league_slug)?.flag || "🏆";
                  return (
                    <Card key={league.league_id} className="bg-blue-50 border-blue-200 hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <Link to={`/competition/${league.league_slug}`} className="flex items-center gap-3 hover:text-green-600 transition-colors">
                            <div className="bg-gray-100 rounded-lg p-3 sm:p-4 self-center sm:self-auto">
                              <span className="text-3xl sm:text-4xl">{league.icon || flag}</span>
                            </div>
                            <div>
                              <h3 className="font-bold text-lg text-gray-900">{league.league}</h3>
                              <p className="text-sm text-gray-600">{league['number of games']} Spiele</p>
                            </div>
                          </Link>
                        </div>
                        {(!cheapestFullCoverage && otherProviders.length === 0) ? (
                          <div className="text-sm text-gray-400 italic">Kein Anbieter verfügbar</div>
                        ) : (
                          <div className="space-y-2">
                            {cheapestFullCoverage && (
                              <div key={cheapestFullCoverage.provider.streamer_id} className="flex items-center justify-between bg-white rounded-lg p-3 border border-green-500 shadow-sm">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                  {cheapestFullCoverage.provider.logo_url ? (
                                    <img src={cheapestFullCoverage.provider.logo_url} alt={cheapestFullCoverage.provider.name} className="w-6 h-6 object-contain rounded-full flex-shrink-0" />
                                  ) : (
                                    <span className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">📺</span>
                                  )}
                                  <span className="font-medium text-sm truncate">{cheapestFullCoverage.provider.name}</span>
                                </div>
                                <div className="flex items-center gap-3 flex-shrink-0">
                                  <Badge className="bg-green-500 text-xs">100%</Badge>
                                  <span className="text-gray-700 font-semibold text-sm">€{cheapestFullCoverage.price.toFixed(2)}</span>
                                  {cheapestFullCoverage.provider.affiliate_url && (
                                    <Button 
                                      size="sm" 
                                      className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        window.open(cheapestFullCoverage.provider.affiliate_url, '_blank');
                                      }}
                                    >
                                      Jetzt abonnieren
                                    </Button>
                                  )}
                                </div>
                              </div>
                            )}
                            {otherProviders.map((item) => (
                              <div key={item.provider.streamer_id} className="flex items-center justify-between bg-white rounded-lg p-3 border">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                  {item.provider.logo_url ? (
                                    <img src={item.provider.logo_url} alt={item.provider.name} className="w-6 h-6 object-contain rounded-full flex-shrink-0" />
                                  ) : (
                                    <span className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">📺</span>
                                  )}
                                  <span className="font-medium text-sm truncate">{item.provider.name}</span>
                                </div>
                                <div className="flex items-center gap-3 flex-shrink-0">
                                  <Badge className={
                                    `${item.percentage >= 90 ? 'bg-green-500' : item.percentage >= 50 ? 'bg-orange-500' : 'bg-red-500'} text-xs`
                                  }>
                                    {item.percentage}%
                                  </Badge>
                                  <span className="text-gray-700 font-semibold text-sm">€{item.price.toFixed(2)}</span>
                                  {item.provider.affiliate_url && (
                                    <Button 
                                      size="sm" 
                                      className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        window.open(item.provider.affiliate_url, '_blank');
                                      }}
                                    >
                                      Jetzt abonnieren
                                    </Button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })}

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