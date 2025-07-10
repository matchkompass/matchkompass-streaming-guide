
import { Link } from "react-router-dom";
import { Search, Shield, TrendingUp, Users, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DealsSection from "@/components/DealsSection";
import FAQSection from "@/components/FAQSection";
import { useClubs } from "@/hooks/useClubs";
import { useLeagues } from "@/hooks/useLeagues";
import { LEAGUE_CLUSTERS } from "./Wizard";

const Index = () => {
  const { clubs } = useClubs();
  const { leagues } = useLeagues();
  
  // Get popular clubs sorted by popularity
  const popularClubs = clubs
    .filter(club => club.popularity_score && club.popularity_score > 7)
    .sort((a, b) => (b.popularity_score || 0) - (a.popularity_score || 0))
    .slice(0, 8);

  // Get popular leagues (filtered by popularity if available)
  const popularLeagues = leagues
    .filter(league => (league as any).popularity && (league as any).popularity > 7)
    .sort((a, b) => ((b as any).popularity || 0) - ((a as any).popularity || 0))
    .slice(0, 6);

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

      {/* Deals Section */}
      <DealsSection />

      {/* Popular Clubs */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Beliebte Vereine
            </h2>
            <p className="text-gray-600">
              Die beliebtesten Fußballvereine auf MatchKompass
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {popularClubs.map((club) => (
              <Link 
                key={club.club_id} 
                to={`/club/${club.slug}`}
                className="group"
              >
                <Card className="text-center hover:shadow-lg transition-all duration-300 group-hover:scale-105 cursor-pointer border-0 shadow-md">
                  <CardContent className="p-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      {club.logo_url ? (
                        <img src={club.logo_url} alt={club.name || ''} className="w-10 h-10 object-contain" />
                      ) : (
                        <span className="text-2xl">⚽</span>
                      )}
                    </div>
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-green-600 transition-colors">
                      {club.name}
                    </h3>
                    <Badge variant="secondary" className="mb-2">
                      {club.country}
                    </Badge>
                    {club.popularity_score && (
                      <div className="text-sm text-green-600 font-semibold">
                        ★ {club.popularity_score}/10
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Button asChild variant="outline" size="lg">
              <Link to="/ligen">
                Alle Vereine nach Liga anzeigen
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Popular Leagues */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Top-Ligen</h2>
          {LEAGUE_CLUSTERS.map(cluster => (
            <div key={cluster.key} className="mb-8">
              <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">{cluster.name}</h3>
              <div className="grid md:grid-cols-3 gap-6">
                {cluster.leagues.map(league => (
                  <Link key={league.slug} to={`/competition/${league.slug}`} className="group">
                    <Card className="flex items-center gap-3 p-4 hover:shadow-lg transition-all duration-300 group-hover:scale-105 cursor-pointer">
                      <span className="text-2xl">{league.flag}</span>
                      <div>
                        <h3 className="font-semibold text-lg group-hover:text-green-600 transition-colors">{league.name}</h3>
                        <p className="text-xs text-gray-500">{cluster.name}</p>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          ))}
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

      {/* FAQ Section */}
      <FAQSection />

      <Footer />
    </div>
  );
};

export default Index;
