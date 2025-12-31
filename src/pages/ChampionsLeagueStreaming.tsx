import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import BreadcrumbNavigation from "@/components/BreadcrumbNavigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Trophy, Star, Users, Shield } from "lucide-react";
import { useClubs } from "@/hooks/useClubs";

const ChampionsLeagueStreaming = () => {
  const { clubs } = useClubs();
  
  // Helper function to find club slug by name
  const getClubSlug = (teamName: string): string => {
    const club = clubs.find(c => 
      c.name?.toLowerCase() === teamName.toLowerCase() ||
      c.name?.toLowerCase().includes(teamName.toLowerCase()) ||
      teamName.toLowerCase().includes(c.name?.toLowerCase() || '')
    );
    return club?.slug || teamName.toLowerCase().replace(/[\s\.]+/g, '-');
  };
  const providers = [
    { 
      name: "Amazon Prime Video", 
      coverage: "16 Spiele", 
      price: "€8.99/Monat", 
      highlight: "Dienstag Topspiele",
      description: "Exklusiv: Die besten Dienstag-Partien der Champions League"
    },
    { 
      name: "DAZN", 
      coverage: "108+ Spiele", 
      price: "€44.99/Monat", 
      highlight: "Alle anderen Spiele",
      description: "Komplettpaket: Alle weiteren CL-Spiele live und on-demand"
    }
  ];

  const germanTeams = [
    "FC Bayern München",
    "Borussia Dortmund", 
    "RB Leipzig",
    "Bayer Leverkusen"
  ];

  const topTeams = [
    "Real Madrid", "FC Barcelona", "Manchester City", "Arsenal FC",
    "Paris Saint-Germain", "AC Milan", "Inter Milan", "Atletico Madrid",
    "Liverpool FC", "Manchester United", "Chelsea FC", "Juventus Turin"
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Champions League Streaming 2024/25 - Amazon Prime & DAZN | MatchStream"
        description="Champions League Live Stream 2024/25: Alle Spiele auf Amazon Prime Video und DAZN. Bayern, BVB, Leipzig & Leverkusen live verfolgen. Günstige Streaming-Pakete."
        keywords="Champions League Stream, CL Streaming, Amazon Prime Champions League, DAZN Champions League, Bayern München CL, Borussia Dortmund CL"
        canonical="https://matchstream.de/champions-league-streaming"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": "Champions League Streaming Guide 2024/25",
          "description": "Kompletter Guide für Champions League Streaming mit Amazon Prime und DAZN",
          "author": {
            "@type": "Organization",
            "name": "MatchStream"
          },
          "publisher": {
            "@type": "Organization",
            "name": "MatchStream"
          },
          "datePublished": "2024-08-17",
          "dateModified": "2024-08-17"
        }}
      />
      <Header />
      <BreadcrumbNavigation customItems={[
        { label: 'Home', href: '/' },
        { label: 'Ligen', href: '/competition' },
        { label: 'Champions League Streaming' }
      ]} />
      
      <main className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-blue-100 text-blue-800">
              🏆 UEFA Champions League 2024/25
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Champions League Streaming
              <span className="text-primary block">Amazon Prime & DAZN Guide</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Verpasse kein Champions League Spiel! Bayern, BVB, Leipzig und Leverkusen live auf 
              Amazon Prime Video und DAZN. Finde die günstigste Kombination.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button asChild size="lg">
                <Link to="/wizard">Optimale CL-Kombination finden</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/vergleich">Anbieter vergleichen</Link>
              </Button>
            </div>
          </div>

          {/* Provider Comparison */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-8">Champions League Streaming Anbieter</h2>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {providers.map((provider, index) => (
                <Card key={index} className="border-2 hover:shadow-xl transition-all duration-300">
                  <CardHeader className="text-center">
                    <div className="text-2xl font-bold text-primary mb-2">{provider.name}</div>
                    <div className="text-3xl font-bold">{provider.price}</div>
                    <Badge variant="secondary" className="mt-2">{provider.highlight}</Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-lg font-semibold">{provider.coverage}</div>
                        <div className="text-sm text-muted-foreground">pro Saison</div>
                      </div>
                      <div className="text-center">
                        <p className="text-sm">{provider.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* German Teams */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-8">Deutsche Teams in der Champions League</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {germanTeams.map((team, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow group">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                      <Trophy className="h-8 w-8 text-primary" />
                    </div>
                    <Link 
                      to={`/club/${getClubSlug(team)}`}
                      className="font-semibold hover:text-primary transition-colors"
                    >
                      {team}
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Features */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-8">Champions League Streaming Vorteile</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="text-center">
                <CardHeader>
                  <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle>Alle CL-Spiele</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Komplette Abdeckung: Gruppenphase bis Finale auf Prime Video + DAZN</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardHeader>
                  <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle>Deutsche Teams</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Alle Spiele von Bayern, BVB, Leipzig und Leverkusen live verfolgen</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardHeader>
                  <Star className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle>Günstige Kombi</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Bereits ab €53.98/Monat alle Champions League Spiele schauen</p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Top European Teams */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-8">Top Champions League Teams</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {topTeams.map((team, index) => (
                <Link
                  key={index}
                  to={`/club/${team.toLowerCase().replace(/[\s\.]+/g, '-')}`}
                  className="p-4 border rounded-lg hover:shadow-md transition-shadow hover:border-primary text-center"
                >
                  <div className="text-sm font-medium">{team}</div>
                </Link>
              ))}
            </div>
          </section>

          {/* Pricing Info */}
          <section className="mb-16 bg-muted/30 rounded-lg p-8">
            <h2 className="text-3xl font-bold text-center mb-6">Champions League Streaming Kosten</h2>
            <div className="max-w-2xl mx-auto">
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-background rounded-lg">
                  <span className="font-medium">Amazon Prime Video (CL Topspiele)</span>
                  <span className="text-lg font-bold">€8.99/Monat</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-background rounded-lg">
                  <span className="font-medium">DAZN (Alle anderen CL-Spiele)</span>
                  <span className="text-lg font-bold">€44.99/Monat</span>
                </div>
                <div className="border-t-2 pt-4">
                  <div className="flex justify-between items-center p-4 bg-primary/10 rounded-lg">
                    <span className="font-bold">Komplettpaket für alle CL-Spiele</span>
                    <span className="text-xl font-bold text-primary">€53.98/Monat</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-8">
            <Trophy className="h-16 w-16 mx-auto mb-6 text-yellow-300" />
            <h2 className="text-3xl font-bold mb-4">Bereit für die Champions League?</h2>
            <p className="text-lg mb-6 max-w-2xl mx-auto opacity-90">
              Nutze unseren kostenlosen Wizard und finde heraus, wie du alle Champions League Spiele 
              deiner deutschen Teams optimal schauen kannst.
            </p>
            <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              <Link to="/wizard">Champions League Analyse starten</Link>
            </Button>
          </section>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ChampionsLeagueStreaming;