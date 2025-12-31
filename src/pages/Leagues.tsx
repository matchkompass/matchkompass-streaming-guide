import { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Search, Trophy, Users, ArrowRight, Check, ChevronDown, ChevronUp, ExternalLink, LayoutGrid } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BreadcrumbNavigation from "@/components/BreadcrumbNavigation";
import SEOHead from "@/components/SEOHead";
import FAQSection from "@/components/FAQSection";
import StructuredData from "@/components/StructuredData";
import { useLeaguesEnhanced } from "@/hooks/useLeaguesEnhanced";
import { useStreamingEnhanced } from "@/hooks/useStreamingEnhanced";
import { LEAGUE_CLUSTERS } from "@/utils/constants";
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
  const [expandedLeagues, setExpandedLeagues] = useState<Record<number, boolean>>({});
  const { providers, loading: providersLoading } = useStreamingEnhanced();
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const toggleLeagueExpansion = (id: number) => {
    setExpandedLeagues(prev => ({ ...prev, [id]: !prev[id] }));
  };

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

  // Group leagues by competition type using LEAGUE_CLUSTERS
  const groupedLeagues = useMemo(() => {
    return LEAGUE_CLUSTERS.map(cluster => {
      const clusterLeagues = cluster.leagues
        .map(cl => filteredLeagues.find(l => l.league_slug === cl.slug))
        .filter(Boolean) as any[];

      return {
        ...cluster,
        leagues: clusterLeagues
      };
    }).filter(cluster => cluster.leagues.length > 0);
  }, [filteredLeagues]);

  // Helper to compute provider coverage for a league
  const getProviderCoverage = (provider: any, league: any) => {
    const leagueKey = league.league_slug;
    const coveredGames = Math.min(Number(provider[leagueKey] || 0), Number(league['number of games'] || 0));
    const totalGames = Number(league['number of games'] || 0);
    const percentage = totalGames > 0 ? Math.round((coveredGames / totalGames) * 100) : 0;

    // Clean price string
    const priceStr = String(provider.monthly_price || "0");
    const price = parseFloat(priceStr.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;

    return {
      provider,
      coveredGames,
      totalGames,
      percentage,
      price,
      priceFormatted: provider.monthly_price
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
        <BreadcrumbNavigation />
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50">
      <SEOHead
        title="Alle Fußball-Ligen & Wettbewerbe | Streaming-Guide | MatchStream"
        description="Entdecke alle verfügbaren Fußballligen und Wettbewerbe. ✓ Bundesliga ✓ Champions League ✓ Premier League ✓ La Liga. Finde die besten Streaming-Optionen."
        keywords="Fußball Ligen, Bundesliga, Champions League, Premier League, La Liga, Serie A, Wettbewerbe"
        canonical="https://matchstream.de/competition"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          "name": "Fußball-Ligen und Wettbewerbe",
          "description": "Alle verfügbaren Fußballligen und Wettbewerbe mit Streaming-Informationen",
          "numberOfItems": leagues.length,
          "itemListElement": leagues.map((league, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "item": {
              "@type": "SportsOrganization",
              "name": league.league,
              "url": `https://matchstream.de/competition/${league.league_slug}`,
              "description": `${league.league} - ${league.country}`
            }
          }))
        }}
      />
      <StructuredData
        type="faq"
        data={{
          questions: leagueFAQs
        }}
      />
      <Header />

      {/* Hero Section - Compacted */}
      <section className="relative py-8 px-4 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.03]">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="leagues-pattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                <circle cx="30" cy="30" r="2" fill="currentColor" className="text-green-900" />
                <path d="M0 30h60M30 0v60" stroke="currentColor" strokeWidth="0.5" className="text-green-900" opacity="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#leagues-pattern)" />
          </svg>
        </div>

        <div className="relative max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Alle Vereine & Ligen
          </h1>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto mb-8">
            Entdecke alle verfügbaren Fußballligen und finde heraus, welche Streaming-Dienste du für deine Lieblingswettbewerbe brauchst.
          </p>

          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Liga oder Land suchen..."
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

        {/* Leagues by Category */}
        {groupedLeagues.map((cluster: any) => (
          <div key={cluster.key} className="mb-8">
            <div className={`flex items-center gap-2 py-2 mb-4 border-b-2 ${cluster.headerColor.replace('bg-', 'border-').replace('text-', 'text-')}`}>
              <span className="text-lg">{cluster.flag || cluster.name.split(' ')[0]}</span>
              <h2 className="text-lg font-bold uppercase tracking-tight">{cluster.name.replace(/^[^\s]+\s/, '')}</h2>
              <Badge variant="secondary" className="text-xs opacity-60 ml-auto lowercase bg-transparent border-none">
                {cluster.leagues.length} Wettbewerbe
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cluster.leagues.map((league: any) => {
                const allCoverages = providers
                  .map(p => getProviderCoverage(p, league))
                  .filter(c => c.coveredGames > 0)
                  .sort((a, b) => b.percentage - a.percentage || a.price - b.price);

                // Featured choice is the first one in the sorted list (highest coverage fallback)
                const featuredChoice = allCoverages[0];
                const otherProviders = allCoverages.filter(c => c !== featuredChoice);
                const isExpanded = expandedLeagues[league.league_id];
                const flag = league.icon || LEAGUE_SLUG_TO_FLAG[league.league_slug] || "🏆";

                return (
                  <Card
                    key={league.league_id}
                    className="bg-white border-gray-200 overflow-hidden hover:shadow-md transition-all cursor-pointer group"
                    onClick={() => navigate(`/competition/${league.league_slug}`)}
                  >
                    <CardContent className="p-0">
                      {/* League Header - denser */}
                      <div className="px-4 py-3 flex items-center justify-between border-b bg-gray-50/30">
                        <div className="flex items-center gap-3">
                          <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-100 text-xl">
                            {flag}
                          </div>
                          <div>
                            <h3 className="font-bold text-base text-gray-900 leading-none mb-1">
                              {league.league}
                            </h3>
                            <p className="text-[11px] text-gray-500 font-medium">
                              {league['number of games']} Spiele pro Saison
                            </p>
                          </div>
                        </div>
                        <Button
                          asChild
                          variant="ghost"
                          size="sm"
                          className="h-8 text-green-600 hover:text-green-700 hover:bg-green-50 gap-1.5 font-bold text-[11px] px-2"
                        >
                          <Link to={`/competition/${league.league_slug}`} onClick={(e) => e.stopPropagation()}>
                            <Users className="h-3.5 w-3.5" />
                            Vereine ansehen
                          </Link>
                        </Button>
                      </div>

                      {/* Best Option / Streaming Info */}
                      <div className="p-4 space-y-3">
                        {!featuredChoice ? (
                          <div className="text-center py-4 bg-gray-50 rounded-xl border border-dashed border-gray-200" onClick={(e) => e.stopPropagation()}>
                            <p className="text-sm text-gray-400 italic font-medium">Aktuell kein Streaming-Anbieter verfügbar</p>
                          </div>
                        ) : (
                          <>
                            {/* Primary Choice */}
                            <div className={`${featuredChoice.percentage === 100 ? 'bg-green-50/50 border-green-100' : 'bg-blue-50/50 border-blue-100'} border rounded-lg p-3`}>
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                  {featuredChoice.provider.logo_url ? (
                                    <img
                                      src={featuredChoice.provider.logo_url}
                                      alt={featuredChoice.provider.name}
                                      className="w-9 h-9 object-contain rounded-lg bg-white p-1 shadow-sm border border-gray-100 shrink-0"
                                    />
                                  ) : (
                                    <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center text-lg shadow-sm border border-gray-100 shrink-0">📺</div>
                                  )}
                                  <div className="min-w-0">
                                    <p className="text-xs font-bold text-gray-900 truncate">
                                      {featuredChoice.provider.name}
                                    </p>
                                    <p className={`text-[10px] font-bold flex items-center gap-1 ${featuredChoice.percentage === 100 ? 'text-green-700' : 'text-blue-700'}`}>
                                      {featuredChoice.percentage === 100 ? <Check className="h-3 w-3 stroke-[3]" /> : <LayoutGrid className="h-3 w-3" />}
                                      {featuredChoice.percentage}% ({featuredChoice.coveredGames}/{featuredChoice.totalGames} Spiele)
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right shrink-0">
                                  <p className="text-xs font-normal text-gray-900 mb-1.5 opacity-80">
                                    ab {featuredChoice.priceFormatted} monatlich
                                  </p>
                                  <Button
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700 text-white shadow-sm font-bold h-8 px-3 text-[11px]"
                                    asChild
                                  >
                                    <a
                                      href={featuredChoice.provider.affiliate_url || "#"}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      Jetzt abonnieren*
                                    </a>
                                  </Button>
                                </div>
                              </div>
                            </div>

                            {/* Additional Providers Toggle */}
                            {otherProviders.length > 0 && (
                              <div className="mt-1 text-center">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleLeagueExpansion(league.league_id);
                                  }}
                                  className="text-[10px] font-bold text-gray-400 hover:text-gray-700 transition-colors flex items-center gap-1 mx-auto py-0.5"
                                >
                                  {otherProviders.length} weitere Optionen {isExpanded ? 'ausblenden' : 'anzeigen'}
                                  {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                </button>

                                {isExpanded && (
                                  <div className="mt-3 space-y-2 pt-3 border-t border-gray-100" onClick={(e) => e.stopPropagation()}>
                                    {otherProviders.map((item) => (
                                      <div key={item.provider.streamer_id} className="flex items-center justify-between gap-3 p-2 rounded-lg border border-gray-100 hover:border-gray-200 transition-all bg-gray-50/20">
                                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                          {item.provider.logo_url ? (
                                            <img
                                              src={item.provider.logo_url}
                                              alt={item.provider.name}
                                              className="w-6 h-6 object-contain rounded-md bg-white p-0.5 shadow-sm border border-gray-50 shrink-0"
                                            />
                                          ) : (
                                            <div className="w-6 h-6 bg-gray-100 rounded-md flex items-center justify-center text-[10px] shadow-sm border border-gray-50 shrink-0">📺</div>
                                          )}
                                          <div className="min-w-0 text-left">
                                            <p className="text-[11px] font-bold text-gray-800 truncate">
                                              {item.provider.name}
                                            </p>
                                            <p className={`text-[9px] font-bold ${item.percentage >= 90 ? 'text-green-600' : 'text-orange-600'}`}>
                                              {item.percentage}% ({item.coveredGames}/{item.totalGames} Spiele)
                                            </p>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <span className="text-[11px] font-normal text-gray-600 whitespace-nowrap">ab {item.priceFormatted}</span>
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-7 px-2 text-[10px] font-bold border-gray-200 hover:bg-white hover:border-green-500 hover:text-green-600 shrink-0"
                                            asChild
                                          >
                                            <a
                                              href={item.provider.affiliate_url || "#"}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              onClick={(e) => e.stopPropagation()}
                                            >
                                              Wählen
                                            </a>
                                          </Button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}

                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
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