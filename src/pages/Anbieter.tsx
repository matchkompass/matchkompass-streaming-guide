import { useState, useMemo } from "react";
import { useStreamingEnhanced } from "@/hooks/useStreamingEnhanced";
import { useLeaguesEnhanced } from "@/hooks/useLeaguesEnhanced";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BreadcrumbNavigation from "@/components/BreadcrumbNavigation";
import SEOHead from "@/components/SEOHead";
import FAQSection from "@/components/FAQSection";
import StructuredData from "@/components/StructuredData";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { Search, ArrowRight } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Anbieter = () => {
  const { providers, loading } = useStreamingEnhanced();
  const { leagues } = useLeaguesEnhanced();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("relevance");
  const navigate = useNavigate();

  // Calculate statistics
  const totalGames = useMemo(() => {
    return leagues.reduce((sum, league) => sum + (league['number of games'] || 0), 0);
  }, [leagues]);

  const totalCountries = useMemo(() => {
    const countries = new Set(leagues.map(league => league.country));
    return countries.size;
  }, [leagues]);

  // Filter and sort providers
  const filteredProviders = useMemo(() => {
    let result = providers;

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      result = result.filter(provider =>
        provider.name?.toLowerCase().includes(searchLower) ||
        provider.provider_name?.toLowerCase().includes(searchLower) ||
        provider.highlights?.highlight_1?.toLowerCase().includes(searchLower) ||
        provider.highlights?.highlight_2?.toLowerCase().includes(searchLower) ||
        provider.highlights?.highlight_3?.toLowerCase().includes(searchLower)
      );
    }

    // Sort the result
    return [...result].sort((a, b) => {
      if (sortBy === "alphabetical") {
        return (a.name || "").localeCompare(b.name || "");
      }

      if (sortBy === "price") {
        const priceA = parseFloat(String(a.monthly_price).replace(/[^\d.]/g, '').replace(',', '.') || "0");
        const priceB = parseFloat(String(b.monthly_price).replace(/[^\d.]/g, '').replace(',', '.') || "0");
        return priceA - priceB;
      }

      // Default: Relevance (Top 5 Leagues + CL/EL coverage)
      const getScore = (p: any) => {
        const majorLeagues = [
          'bundesliga', 'premier_league', 'la_liga', 'serie_a', 'ligue_1',
          'champions_league', 'europa_league'
        ];
        return majorLeagues.reduce((sum, league) => sum + (p[league] || 0), 0);
      };
      return getScore(b) - getScore(a);
    });
  }, [providers, searchTerm, sortBy]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50">
      <SEOHead
        title="Alle Streaming-Anbieter für Fußball | Übersicht & Vergleich | MatchStream"
        description="Entdecke alle verfügbaren Streaming-Anbieter für Fußball. ✓ Sky ✓ DAZN ✓ Amazon Prime Video ✓ Vollständige Übersicht mit Preisen und Liga-Abdeckung."
        keywords="Streaming Anbieter, Fußball Streaming Dienste, Sky, DAZN, Amazon Prime Video, Streaming Services"
        canonical="https://matchstream.de/streaming-provider"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          "name": "Streaming-Anbieter für Fußball",
          "description": "Alle verfügbaren Streaming-Anbieter für Fußball mit Preisen und Liga-Abdeckung",
          "numberOfItems": providers.length,
          "itemListElement": providers.map((provider, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "item": {
              "@type": "Service",
              "name": provider.name || provider.provider_name,
              "url": `https://matchstream.de/streaming-provider/${provider.slug}`,
              "description": `Streaming-Service für Fußball: ${provider.highlights?.highlight_1 || ''}`,
              "provider": {
                "@type": "Organization",
                "name": provider.name || provider.provider_name
              }
            }
          }))
        }}
      />
      <StructuredData
        type="organization"
        data={{}}
      />
      <Header />

      {/* Hero Section - Compacted */}
      <section className="relative py-8 px-4 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.03]">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="anbieter-pattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                <circle cx="30" cy="30" r="2" fill="currentColor" className="text-green-900" />
                <path d="M0 30h60M30 0v60" stroke="currentColor" strokeWidth="0.5" className="text-green-900" opacity="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#anbieter-pattern)" />
          </svg>
        </div>

        <div className="relative max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Alle Streaming-Anbieter
          </h1>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto mb-8">
            Entdecke alle verfügbaren Streaming-Anbieter für Fußball und finde den perfekten Service für deine Bedürfnisse.
          </p>

          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Anbieter suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-14 text-lg shadow-sm font-medium"
            />
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="text-center p-4">
            <div className="text-2xl font-bold text-green-600 mb-1">{leagues.length}</div>
            <div className="text-xs text-gray-600">Verfügbare Ligen</div>
          </Card>
          <Card className="text-center p-4">
            <div className="text-2xl font-bold text-blue-600 mb-1">{totalGames}</div>
            <div className="text-xs text-gray-600">Spiele pro Saison</div>
          </Card>
          <Card className="text-center p-4">
            <div className="text-2xl font-bold text-orange-600 mb-1">{totalCountries}</div>
            <div className="text-xs text-gray-600">Länder</div>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="text-lg font-bold mb-1 truncate">Optimale Kombination</h3>
                  <p className="text-xs opacity-90 line-clamp-1">Finde das perfekte Paket für deine Vereine</p>
                </div>
                <ArrowRight className="h-6 w-6 shrink-0 opacity-50" />
              </div>
              <Button asChild size="sm" className="mt-4 bg-white text-green-600 hover:bg-gray-100 w-full md:w-auto h-8 text-xs">
                <Link to="/wizard">Wizard starten</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="text-lg font-bold mb-1 truncate">Anbieter vergleichen</h3>
                  <p className="text-xs opacity-90 line-clamp-1">Abdeckung, Features und Preise im Überblick</p>
                </div>
                <ArrowRight className="h-6 w-6 shrink-0 opacity-50" />
              </div>
              <Button asChild size="sm" className="mt-4 bg-white text-blue-600 hover:bg-gray-100 w-full md:w-auto h-8 text-xs">
                <Link to="/vergleich">Vergleich starten</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {loading ? (
          <div className="text-center text-gray-500 py-20">Lade Anbieter...</div>
        ) : (
          <>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <p className="text-gray-600">
                {filteredProviders.length} von {providers.length} Anbietern
                {searchTerm && <span> für "{searchTerm}"</span>}
              </p>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 whitespace-nowrap">Sortieren nach:</span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[200px] bg-white h-9 border-gray-200">
                    <SelectValue placeholder="Sortierung" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Relevanz (Top Ligen)</SelectItem>
                    <SelectItem value="alphabetical">Name (A-Z)</SelectItem>
                    <SelectItem value="price">Günstigster Preis</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
              {filteredProviders.map((provider) => (
                <Card
                  key={provider.streamer_id}
                  className="bg-white border border-gray-200 hover:shadow-md transition-shadow cursor-pointer group"
                  onClick={() => navigate(`/streaming-provider/${provider.slug}`)}
                >
                  <CardContent className="flex items-center gap-4 p-4">
                    {provider.logo_url ? (
                      <img src={provider.logo_url} alt={`${provider.name} Logo`} className="w-16 h-16 object-contain rounded-full" />
                    ) : (
                      <span className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-2xl">📺</span>
                    )}
                    <div className="flex-1 min-w-0">
                      <h2 className="font-bold text-lg text-gray-900 mb-0.5 truncate group-hover:text-green-600 transition-colors">{provider.name}</h2>
                      <div className="flex flex-col gap-1 mb-2">
                        <Badge variant="outline" className="bg-gray-50/50 text-gray-700 border-gray-200 shadow-none font-medium w-fit">Monatsabo: {provider.monthly_price}</Badge>
                        {provider.yearly_price && <Badge variant="outline" className="bg-gray-50/50 text-gray-700 border-gray-200 shadow-none font-medium w-fit">Jahresabo: {provider.yearly_price}</Badge>}
                      </div>
                      <div className="flex flex-col gap-1.5 mt-2 mb-4">
                        {provider.highlights?.highlight_1 && (
                          <div className="px-3 py-1.5 rounded-md bg-green-50 text-green-700 text-xs font-semibold">
                            {provider.highlights.highlight_1}
                          </div>
                        )}
                        {provider.highlights?.highlight_2 && (
                          <div className="px-3 py-1.5 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold">
                            {provider.highlights.highlight_2}
                          </div>
                        )}
                        {provider.highlights?.highlight_3 && (
                          <div className="px-3 py-1.5 rounded-md bg-purple-50 text-purple-700 text-xs font-semibold">
                            {provider.highlights.highlight_3}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Button
                          asChild
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 text-xs"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <a href={provider.affiliate_url || "#"} target="_blank" rel="noopener noreferrer">
                            Zum Anbieter*
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

      <FAQSection />
      <Footer />
    </div>
  );
};

export default Anbieter;
