
import { Link } from "react-router-dom";
import { Search, Shield, TrendingUp, Users, Calendar, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { LEAGUE_CLUSTERS } from "./Wizard";
import { useLeagues } from "@/hooks/useLeagues";
import { useStreaming } from "@/hooks/useStreaming";
import { useIsMobile } from "@/hooks/use-mobile";

// Helper: slug to flag
const LEAGUE_SLUG_TO_FLAG = Object.fromEntries(
  LEAGUE_CLUSTERS.flatMap(cluster => cluster.leagues.map(l => [l.slug, l.flag]))
);

const Index = () => {
  const topClubs = [
    { name: "Bayern München", logo: "⚽", league: "Bundesliga" },
    { name: "Barcelona", logo: "🔵", league: "La Liga" },
    { name: "Hertha BSC", logo: "🔷", league: "2. Bundesliga" },
    { name: "Dortmund", logo: "🟡", league: "Bundesliga" }
  ];

  const features = [
    {
      icon: <Shield className="h-8 w-8 text-green-600" />,
      title: "100% Abdeckung",
      description: "Finde die kostengünstigste Kombination für alle Spiele deiner Vereine"
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-blue-600" />,
      title: "Preis-Optimierung",
      description: "Beste Balance zwischen Kosten und Spielabdeckung (90%+)"
    },
    {
      icon: <Users className="h-8 w-8 text-orange-600" />,
      title: "Personalisiert",
      description: "Maßgeschneiderte Empfehlungen für deine Lieblingsvereine"
    }
  ];

  const todaysMatches = [
    { home: "Bayern", away: "Dortmund", time: "18:30", provider: "Sky" },
    { home: "Barcelona", away: "Real Madrid", time: "21:00", provider: "DAZN" },
    { home: "Hertha", away: "Hamburg", time: "13:30", provider: "Sky" }
  ];

  const { leagues, loading: leaguesLoading } = useLeagues();
  const { providers, loading: providersLoading } = useStreaming();
  const isMobile = useIsMobile();

  // Helper to compute provider coverage for a league
  const getProviderCoverage = (provider, league) => {
    const leagueKey = league.league_slug as keyof typeof provider;
    const coveredGames = (provider[leagueKey] as number) || 0;
    const totalGames = league['number of games'] || 0;
    const percentage = totalGames > 0 ? Math.round((coveredGames / totalGames) * 100) : 0;
    const price = parseFloat(provider.monthly_price) || 0;
    return {
      provider,
      coveredGames,
      totalGames,
      percentage,
      price,
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-8">
            <Badge className="mb-4 bg-green-100 text-green-800 hover:bg-green-200">
              🏆 Deutschlands #1 Streaming-Guide für Fußball
            </Badge>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Finde die perfekte 
            <span className="text-green-600 block">Streaming-Kombination</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            MatchKompass berechnet präzise, welche Streaming-Dienste du brauchst, 
            um alle Spiele deiner Lieblingsvereine zu verfolgen – zum besten Preis.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg">
              <Link to="/wizard">
                <Search className="mr-2 h-5 w-5" />
                Jetzt optimale Kombination finden
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="px-8 py-4 text-lg border-2">
              <Link to="/vergleich">
                Anbieter vergleichen
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Warum MatchKompass?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow border-0 shadow-md">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Leagues Section (moved and redesigned) */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Alle Ligen & Streaming-Anbieter</h2>
          {(leaguesLoading || providersLoading) ? (
            <div className="text-center py-12 text-gray-500">Lade Ligen und Anbieter...</div>
          ) : (
            <>
              {LEAGUE_CLUSTERS.map((cluster) => {
                // Get leagues in this cluster that exist in the fetched leagues data
                const clusterLeagues = cluster.leagues
                  .map((cl) => leagues.find((l) => l.league_slug === cl.slug))
                  .filter(Boolean);
                if (clusterLeagues.length === 0) return null;
                return (
                  <div key={cluster.key} className="mb-10">
                    <h3 className={`text-xl font-bold mb-4 ${cluster.headerColor}`}>{cluster.name}</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      {clusterLeagues.map((league) => {
                        // Get top 4 cheapest providers with coverage > 0
                        const providerCoverages = providers
                          .map((provider) => getProviderCoverage(provider, league))
                          .filter((item) => item.coveredGames > 0)
                          .sort((a, b) => a.price - b.price)
                          .slice(0, 4);
                        // Use icon from league data, else flag, else trophy
                        const flag = league.icon || LEAGUE_CLUSTERS.flatMap(c => c.leagues).find(l => l.slug === league.league_slug)?.flag || "🏆";
                        return (
                          <Link key={league.league_id} to={`/competition/${league.league_slug}`} className="group">
                            <Card className="hover:shadow-lg transition-all duration-300 group-hover:scale-105 cursor-pointer">
                              <CardContent className="p-6">
                                {/* League Header */}
                                <div className="flex items-center gap-3 mb-2">
                                  <span className="text-2xl">{flag}</span>
                                  <div>
                                    <h3 className="font-bold text-lg mb-0.5">{league.league}</h3>
                                  </div>
                                </div>
                                <div className="text-xs text-gray-500 mb-2">{league['number of games']} Spiele pro Saison</div>
                                {/* Provider List Styled Box */}
                                <div className="border border-dashed rounded-lg p-2 bg-white mb-2">
                                  <div className="text-xs text-gray-700 font-semibold mb-1">Verfügbar bei:</div>
                                  {providerCoverages.length === 0 ? (
                                    <div className="text-xs text-gray-400 italic">Kein Anbieter verfügbar</div>
                                  ) : (
                                    providerCoverages.map((item) => (
                                      <div key={item.provider.streamer_id} className="flex items-center justify-between border-b last:border-b-0 border-dotted border-gray-200 px-2 py-1 text-sm">
                                        <div className="flex items-center gap-2">
                                          {item.provider.logo_url ? (
                                            <img src={item.provider.logo_url} alt={item.provider.provider_name} className="w-4 h-4 object-contain rounded-full" />
                                          ) : (
                                            <span className="w-4 h-4 bg-gray-200 rounded-full flex items-center justify-center">📺</span>
                                          )}
                                          <span className="font-medium" style={{ color: item.provider.highlight_color || undefined }}>{item.provider.provider_name}</span>
                                        </div>
                                        <Badge
                                          className={
                                            `${item.percentage >= 90 ? 'bg-green-500' : item.percentage >= 50 ? 'bg-orange-500' : 'bg-red-500'} ${isMobile ? 'mx-auto flex justify-center' : ''}`
                                          }
                                        >
                                          {item.percentage}%
                                        </Badge>
                                        <span className="text-xs text-gray-700 font-semibold min-w-[60px] text-right">€{item.price.toFixed(2)}</span>
                                        {item.provider.affiliate_url && (
                                          <Button size="sm" className="ml-2 bg-green-600 hover:bg-green-700 text-white px-3 py-1 text-xs" onClick={(e) => { e.preventDefault(); window.open(item.provider.affiliate_url, '_blank'); }}>
                                            Jetzt abonnieren
                                          </Button>
                                        )}
                                      </div>
                                    ))
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-green-600 to-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <Star className="h-12 w-12 mx-auto mb-6 text-yellow-300" />
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Bereit für die perfekte Streaming-Lösung?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Starte jetzt und finde heraus, wie du alle Spiele deiner Lieblingsvereine 
            zum besten Preis schauen kannst.
          </p>
          <Button asChild size="lg" className="bg-white text-green-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold">
            <Link to="/wizard">
              Kostenlose Analyse starten
            </Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
