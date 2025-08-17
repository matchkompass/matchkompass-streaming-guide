import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import BreadcrumbNavigation from "@/components/BreadcrumbNavigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Shield, TrendingUp, Users, Star } from "lucide-react";

const BundesligaStreaming = () => {
  const providers = [
    { name: "Sky", coverage: "306 Spiele", price: "€29.99/Monat", highlight: "Alle Samstag Spiele" },
    { name: "DAZN", coverage: "121 Spiele", price: "€44.99/Monat", highlight: "Freitag & Sonntag Spiele" },
    { name: "RTL+", coverage: "33 Spiele", price: "€4.99/Monat", highlight: "Ausgewählte Highlights" },
    { name: "Amazon Prime", coverage: "16 Spiele", price: "€8.99/Monat", highlight: "Dienstag Spiele" }
  ];

  const teams = [
    "FC Bayern München", "Borussia Dortmund", "RB Leipzig", "Bayer Leverkusen",
    "Eintracht Frankfurt", "VfL Wolfsburg", "SC Freiburg", "Borussia Mönchengladbach",
    "1. FC Union Berlin", "VfB Stuttgart", "TSG Hoffenheim", "1. FSV Mainz 05",
    "FC Augsburg", "Werder Bremen", "VfL Bochum", "1. FC Köln", "Hertha BSC", "FC Schalke 04"
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Bundesliga Streaming 2024/25 - Alle Anbieter im Vergleich | MatchStream"
        description="Bundesliga Live Stream Guide 2024/25: Vergleiche Sky, DAZN, RTL+ und Amazon Prime. Finde die beste Kombination für alle Bundesliga Spiele zum günstigsten Preis."
        keywords="Bundesliga Stream, Bundesliga Streaming, Sky Bundesliga, DAZN Bundesliga, RTL+ Bundesliga, Bundesliga Live, Fußball Stream Deutschland"
        canonical="https://matchstream.de/bundesliga-streaming"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": "Bundesliga Streaming Guide 2024/25",
          "description": "Kompletter Guide für Bundesliga Streaming mit allen Anbietern",
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
        { label: 'Ligen', href: '/ligen' },
        { label: 'Bundesliga Streaming' }
      ]} />
      
      <main className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Bundesliga Streaming 2024/25
              <span className="text-primary block">Alle Anbieter im Vergleich</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Entdecke die beste Streaming-Kombination für alle Bundesliga Spiele. 
              Vergleiche Sky, DAZN, RTL+ und Amazon Prime und spare beim Fußball-Streaming.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button asChild size="lg">
                <Link to="/wizard">Optimale Kombination finden</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/vergleich">Alle Anbieter vergleichen</Link>
              </Button>
            </div>
          </div>

          {/* Provider Comparison */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-8">Bundesliga Streaming Anbieter 2024/25</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {providers.map((provider, index) => (
                <Card key={index} className="border-2 hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-xl">{provider.name}</CardTitle>
                    <div className="text-2xl font-bold text-primary">{provider.price}</div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">Spiele pro Saison</div>
                        <div className="text-lg font-semibold">{provider.coverage}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">Highlight</div>
                        <div className="text-sm">{provider.highlight}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Features */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-8">Warum MatchStream für Bundesliga?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="text-center">
                <CardHeader>
                  <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle>Vollständige Abdeckung</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Alle 306 Bundesliga Spiele der Saison 2024/25 im Überblick</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardHeader>
                  <TrendingUp className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle>Preis-Optimierung</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Spare bis zu 40% durch die optimale Anbieter-Kombination</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardHeader>
                  <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle>Team-spezifisch</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Personalisierte Empfehlungen für deinen Lieblingsverein</p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Teams Grid */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-8">Alle Bundesliga Vereine 2024/25</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {teams.map((team, index) => (
                <Link
                  key={index}
                  to={`/club/${team.toLowerCase().replace(/[\s\.]+/g, '-')}`}
                  className="p-4 border rounded-lg hover:shadow-md transition-shadow hover:border-primary"
                >
                  <div className="text-sm font-medium text-center">{team}</div>
                </Link>
              ))}
            </div>
          </section>

          {/* CTA Section */}
          <section className="text-center bg-primary/10 rounded-lg p-8">
            <Star className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4">Finde deine optimale Bundesliga Streaming-Lösung</h2>
            <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
              Nutze unseren kostenlosen Wizard und entdecke, wie du alle Spiele deines Lieblingsvereins 
              zum besten Preis schauen kannst.
            </p>
            <Button asChild size="lg">
              <Link to="/wizard">Kostenlose Analyse starten</Link>
            </Button>
          </section>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default BundesligaStreaming;