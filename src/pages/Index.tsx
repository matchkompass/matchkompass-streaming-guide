
import { Link } from "react-router-dom";
import { Search, Shield, TrendingUp, Users, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import EnhancedGlobalSearch from "@/components/enhanced/EnhancedGlobalSearch";
import ProviderSlider from "@/components/home/ProviderSlider";
import LeagueSlider from "@/components/home/LeagueSlider";
import ClubSlider from "@/components/home/ClubSlider";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import NewsletterSection from "@/components/home/NewsletterSection";
import FAQSection from "@/components/FAQSection";
import DealsSection from "@/components/DealsSection";


const Index = () => {

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
      <SEOHead 
        title="MatchStream - Streaming Guide für Fußball | Optimaler Streaming-Vergleich"
        description="Finde die perfekte Streaming-Kombination für deine Lieblingsvereine. Vergleiche alle Anbieter und spare Geld beim Fußball-Streaming. ✓ Bundesliga ✓ Champions League ✓ Premier League"
        keywords="Fußball Streaming, Bundesliga Stream, Champions League, Sky, DAZN, Streaming Vergleich, Fußball schauen"
        canonical="https://matchstream.de/"
        ogType="website"
        ogImage="https://lovable.dev/opengraph-image-p98pqg.png"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "MatchStream",
          "description": "Streaming Guide für Fußball - Finde die perfekte Kombination",
          "url": "https://matchstream.de",
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://matchstream.de/search?q={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        }}
      />
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
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto hidden md:block">
            MatchStream berechnet präzise, welche Streaming-Dienste du brauchst, 
            um alle Spiele deiner Lieblingsvereine zu verfolgen – zum besten Preis.
          </p>

          {/* Global Search Field - gleiche Breite wie Buttons */}
          <div className="mb-8 flex justify-center">
            <div className="w-full max-w-lg">
              <EnhancedGlobalSearch />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
            <Button asChild size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg">
              <Link to="/wizard">
                <Search className="mr-2 h-5 w-5" />
                Optimale Kombination finden
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="px-8 py-4 text-lg border-2">
              <Link to="/vergleich">
                Anbieter vergleichen
              </Link>
            </Button>
          </div>
          
          {/* Additional Internal Links */}
          <div className="grid grid-cols-3 gap-2 max-w-lg mx-auto mt-6">
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link to="/ligen">Alle Ligen</Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link to="/anbieter">Alle Anbieter</Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link to="/deals">Deals & News</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Provider Slider Section */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <ProviderSlider />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Warum MatchStream?
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

      {/* League Slider Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <LeagueSlider />
        </div>
      </section>

      {/* Club Slider Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <ClubSlider />
        </div>
      </section>

      {/* Deals Section */}
      <DealsSection />

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* Newsletter Section */}
      <NewsletterSection />

      {/* FAQ Section */}
      <FAQSection />

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
