import { useState, useMemo } from "react";
import { useStreamingEnhanced } from "@/hooks/useStreamingEnhanced";
import { useLeaguesEnhanced } from "@/hooks/useLeaguesEnhanced";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import FAQSection from "@/components/FAQSection";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { Search, ArrowRight, Users, Trophy, Globe } from "lucide-react";

const Anbieter = () => {
  const { providers, loading } = useStreamingEnhanced();
  const { leagues } = useLeaguesEnhanced();
  const [searchTerm, setSearchTerm] = useState("");

  // Calculate statistics
  const totalGames = useMemo(() => {
    return leagues.reduce((sum, league) => sum + (league['number of games'] || 0), 0);
  }, [leagues]);

  const totalCountries = useMemo(() => {
    const countries = new Set(leagues.map(league => league.country));
    return countries.size;
  }, [leagues]);

  // Filter providers based on search term
  const filteredProviders = useMemo(() => {
    if (!searchTerm.trim()) return providers;
    const searchLower = searchTerm.toLowerCase().trim();
    return providers.filter(provider => 
      provider.name?.toLowerCase().includes(searchLower) ||
      provider.provider_name?.toLowerCase().includes(searchLower) ||
      provider.highlights?.highlight_1?.toLowerCase().includes(searchLower) ||
      provider.highlights?.highlight_2?.toLowerCase().includes(searchLower) ||
      provider.highlights?.highlight_3?.toLowerCase().includes(searchLower)
    );
  }, [providers, searchTerm]);

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead 
        title="Alle Streaming-Anbieter für Fußball | Übersicht & Vergleich | MatchStream"
        description="Entdecke alle verfügbaren Streaming-Anbieter für Fußball. ✓ Sky ✓ DAZN ✓ Amazon Prime Video ✓ Vollständige Übersicht mit Preisen und Liga-Abdeckung."
        keywords="Streaming Anbieter, Fußball Streaming Dienste, Sky, DAZN, Amazon Prime Video, Streaming Services"
        canonical="https://matchstream.de/anbieter"
      />
      <Header />
      
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Alle Streaming-Anbieter</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Entdecke alle verfügbaren Streaming-Anbieter für Fußball und finde den perfekten Service für deine Bedürfnisse.
          </p>
        </div>

        {/* Statistics Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="text-center p-6">
            <div className="text-3xl font-bold text-green-600 mb-2">{leagues.length}</div>
            <div className="text-gray-600">Verfügbare Ligen</div>
          </Card>
          <Card className="text-center p-6">
            <div className="text-3xl font-bold text-blue-600 mb-2">{totalGames}</div>
            <div className="text-gray-600">Spiele pro Saison</div>
          </Card>
          <Card className="text-center p-6">
            <div className="text-3xl font-bold text-orange-600 mb-2">{totalCountries}</div>
            <div className="text-gray-600">Länder</div>
          </Card>
        </div>

        {/* Search Bar */}
        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Anbieter suchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12 text-base"
          />
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

        {/* Providers Grid */}
        {loading ? (
          <div className="text-center text-gray-500 py-20">Lade Anbieter...</div>
        ) : (
          <>
            <div className="mb-4">
              <p className="text-gray-600">
                {filteredProviders.length} von {providers.length} Anbietern
                {searchTerm && <span> für "{searchTerm}"</span>}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
              {filteredProviders.map((provider) => (
                <Card key={provider.streamer_id} className="bg-white border border-gray-200 hover:shadow-md transition-shadow">
                  <CardContent className="flex items-center gap-6 p-6">
                    {provider.logo_url ? (
                      <img src={provider.logo_url} alt={provider.name} className="w-16 h-16 object-contain rounded-full" />
                    ) : (
                      <span className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-2xl">📺</span>
                    )}
                    <div className="flex-1 min-w-0">
                      <h2 className="font-bold text-xl text-gray-900 mb-1">{provider.name}</h2>
                      <div className="flex flex-wrap gap-2 mb-2">
                        <Badge className="bg-green-100 text-green-800">ab €{provider.monthly_price}/Monat</Badge>
                        {provider.yearly_price && <Badge className="bg-blue-100 text-blue-800">Jahresabo: €{provider.yearly_price}</Badge>}
                      </div>
                      <div className="text-gray-600 text-sm mb-2">
                        {[provider.highlights?.highlight_1, provider.highlights?.highlight_2, provider.highlights?.highlight_3].filter(Boolean).map((h, i) => (
                          <span key={i} className="block">{h}</span>
                        ))}
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Button asChild size="sm" className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 text-xs">
                          <a href={provider.affiliate_url || "#"} target="_blank" rel="noopener noreferrer">
                            Zum Anbieter
                          </a>
                        </Button>
                        <Button asChild size="sm" variant="outline" className="text-xs px-3 py-1">
                          <Link to={`/streaming-provider/${provider.slug}`}>Details</Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>

      {/* FAQ Section */}
      <FAQSection />
      
      <Footer />
    </div>
  );
};

export default Anbieter;