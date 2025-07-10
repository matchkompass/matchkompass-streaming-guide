
import { Link } from "react-router-dom";
import { Search, Shield, TrendingUp, Users, Calendar, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { LEAGUE_CLUSTERS } from "./Wizard";

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

      {/* Today's Matches */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              <Calendar className="inline mr-3 h-8 w-8 text-green-600" />
              Heute im TV
            </h2>
            <Button asChild variant="outline">
              <Link to="/news">Alle Spiele anzeigen</Link>
            </Button>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {todaysMatches.map((match, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-gray-500">{match.time}</span>
                    <Badge className="bg-blue-100 text-blue-800">{match.provider}</Badge>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-lg">
                      {match.home} vs {match.away}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Clubs */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Beliebte Vereine
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {topClubs.map((club, index) => (
              <Link 
                key={index} 
                to={`/verein/${club.name.toLowerCase().replace(' ', '-')}`}
                className="group"
              >
                <Card className="text-center hover:shadow-lg transition-all duration-300 group-hover:scale-105 cursor-pointer">
                  <CardContent className="p-6">
                    <div className="text-4xl mb-3">{club.logo}</div>
                    <h3 className="font-semibold text-lg mb-2">{club.name}</h3>
                    <Badge variant="secondary">{club.league}</Badge>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Top-Ligen Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Top-Ligen</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {LEAGUE_CLUSTERS.flatMap(cluster =>
              cluster.leagues.map(league => (
                <Card key={league.slug} className="flex items-center gap-3 p-4">
                  <span className="text-2xl">{league.flag}</span>
                  <div>
                    <h3 className="font-semibold text-lg">{league.name}</h3>
                    <p className="text-xs text-gray-500">{cluster.name}</p>
                  </div>
                </Card>
              ))
            )}
          </div>
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
