import React, { useState, useMemo } from "react";
import { Filter, Star, Check, X, Menu, Euro, Calendar, Tv } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useStreaming } from "@/hooks/useStreaming";
import { useLeagues } from "@/hooks/useLeagues";
import ComparisonSidebar from "@/components/comparison/ComparisonSidebar";
import { Checkbox } from "@/components/ui/checkbox";
import HighlightBadge from "@/components/ui/highlight-badge";

interface ComparisonFilters {
  competitions: string[];
  priceRange: [number, number];
  features: {
    fourK: boolean;
    mobile: boolean;
    download: boolean;
    multiStream: boolean;
  };
  simultaneousStreams: number;
  sortBy: string;
}

const EnhancedVergleich = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
  const [filters, setFilters] = useState<ComparisonFilters>({
    competitions: [],
    priceRange: [0, 100],
    features: { fourK: false, mobile: false, download: false, multiStream: false },
    simultaneousStreams: 1,
    sortBy: 'relevance'
  });
  const [paymentType, setPaymentType] = useState<'monthly' | 'yearly'>('monthly');
  const [expandedProvider, setExpandedProvider] = useState<number | null>(null);

  const { providers, loading: providersLoading, error: providersError } = useStreaming();
  const { leagues, loading: leaguesLoading, error: leaguesError } = useLeagues();

  const parsePrice = (priceString?: string): number => {
    if (!priceString) return 0;
    return parseFloat(priceString.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
  };

  const parseFeatures = (provider: any) => {
    const features = { fourK: false, mobile: false, download: false, streams: 1 };
    if (provider.features) {
      try {
        const featureObj = typeof provider.features === 'string' 
          ? JSON.parse(provider.features) 
          : provider.features;
        
        features.fourK = featureObj['4K'] || false;
        features.mobile = featureObj.mobile || false;
        features.download = featureObj.download || false;
        features.streams = featureObj.streams || 1;
      } catch (e) {
        // Fallback features
      }
    }
    return features;
  };

  const getProviderCoverage = (provider: any, competitions: string[]) => {
    if (competitions.length === 0) return 0;
    
    let totalPossible = 0;
    let totalCovered = 0;
    
    competitions.forEach(comp => {
      const league = leagues.find(l => l.league_slug === comp);
      const totalGames = league ? league['number of games'] : 0;
      const providerGames = provider[comp] || 0;
      
      totalPossible += totalGames;
      totalCovered += Math.min(providerGames, totalGames);
    });
    
    return totalPossible > 0 ? Math.round((totalCovered / totalPossible) * 100) : 0;
  };

  const filteredProviders = useMemo(() => {
    let filtered = providers.filter(provider => {
      const price = parsePrice(paymentType === 'yearly' ? provider.yearly_price : provider.monthly_price);
      const features = parseFeatures(provider);
      
      if (price < filters.priceRange[0] || price > filters.priceRange[1]) return false;
      if (filters.features.fourK && !features.fourK) return false;
      if (filters.features.mobile && !features.mobile) return false;
      if (filters.features.download && !features.download) return false;
      if (filters.features.multiStream && features.streams < 2) return false;
      if (features.streams < filters.simultaneousStreams) return false;
      
      return true;
    });

    filtered.sort((a, b) => {
      const priceA = parsePrice(paymentType === 'yearly' ? a.yearly_price : a.monthly_price);
      const priceB = parsePrice(paymentType === 'yearly' ? b.yearly_price : b.monthly_price);
      const coverageA = getProviderCoverage(a, filters.competitions);
      const coverageB = getProviderCoverage(b, filters.competitions);
      
      switch (filters.sortBy) {
        case 'price-asc':
          return priceA - priceB;
        case 'price-desc':
          return priceB - priceA;
        case 'coverage':
          return coverageB - coverageA;
        case 'popularity':
          return (b.provider_name.length) - (a.provider_name.length);
        default:
          return (coverageB * 0.7) + ((100 - Math.min(priceB, 100)) * 0.3) - 
                 ((coverageA * 0.7) + ((100 - Math.min(priceA, 100)) * 0.3));
      }
    });

    return filtered;
  }, [providers, filters, leagues, paymentType]);

  const availableCompetitions = useMemo(() => {
    return leagues.map(league => league.league_slug);
  }, [leagues]);

  const handleProviderToggle = (providerId: string) => {
    setSelectedProviders(prev => 
      prev.includes(providerId)
        ? prev.filter(id => id !== providerId)
        : [...prev, providerId]
    );
  };

  const handleAffiliateClick = (provider: any) => {
    const affiliateUrl = provider.affiliate_url || '#';
    window.open(affiliateUrl, '_blank');
  };

  const toggleCompetition = (competitionId: string) => {
    setFilters(prev => ({
      ...prev,
      competitions: prev.competitions.includes(competitionId)
        ? prev.competitions.filter(id => id !== competitionId)
        : [...prev.competitions, competitionId]
    }));
  };

  if (providersLoading || leaguesLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Lade Anbieter-Daten...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Streaming-Anbieter Vergleich
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Vergleiche alle wichtigen Streaming-Dienste für Fußball und finde die beste Option
          </p>
        </div>

        <div className="flex gap-6">
          <div className="hidden lg:block w-80 flex-shrink-0">
            <ComparisonSidebar
              filters={filters}
              onFiltersChange={setFilters}
              availableCompetitions={availableCompetitions}
              isOpen={true}
              onClose={() => {}}
            />
          </div>

          <div className="lg:hidden fixed top-20 right-4 z-40">
            <Button
              onClick={() => setSidebarOpen(true)}
              className="bg-green-600 hover:bg-green-700 shadow-lg"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>

          {sidebarOpen && (
            <ComparisonSidebar
              filters={filters}
              onFiltersChange={setFilters}
              availableCompetitions={availableCompetitions}
              isOpen={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
            />
          )}

          <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600">
                {filteredProviders.length} Anbieter gefunden
              </p>
              {selectedProviders.length > 0 && (
                <Button
                  onClick={() => console.log('Compare selected:', selectedProviders)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {selectedProviders.length} Anbieter vergleichen
                </Button>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex-1">
                <div className="flex flex-col gap-6">
                  {filteredProviders.map((provider) => {
                    const isExpanded = expandedProvider === provider.streamer_id;
                    return (
                      <Card key={provider.streamer_id} className="p-0 overflow-hidden">
                        <div className="flex flex-col md:flex-row items-center md:items-stretch gap-4 p-4">
                          {/* Logo and Name */}
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            <img src={provider.logo_url} alt={provider.provider_name} className="w-14 h-14 object-contain rounded bg-white border" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-bold text-lg truncate">{provider.provider_name}</h3>
                                {/* Optional: Rating/Badge */}
                              </div>
                              <div className="flex flex-wrap gap-2 mb-1">
                                {provider.highlight_1 && <Badge variant="secondary">{provider.highlight_1}</Badge>}
                                {provider.highlight_2 && <Badge variant="secondary">{provider.highlight_2}</Badge>}
                                {provider.highlight_3 && <Badge variant="secondary">{provider.highlight_3}</Badge>}
                              </div>
                              <div className="text-sm text-gray-600">ab {provider.monthly_price}/Monat</div>
                            </div>
                          </div>
                          {/* Expand/Collapse Button */}
                          <div className="flex flex-col items-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setExpandedProvider(isExpanded ? null : provider.streamer_id)}
                              className="min-w-[120px]"
                            >
                              {isExpanded ? 'Details ausblenden' : 'Details anzeigen'}
                            </Button>
                            <Button
                              asChild
                              size="sm"
                              className="bg-green-600 text-white hover:bg-green-700 w-full"
                            >
                              <a href={provider.affiliate_url} target="_blank" rel="noopener noreferrer">
                                Zum Angebot
                              </a>
                            </Button>
                          </div>
                        </div>
                        {/* Details Section */}
                        {isExpanded && (
                          <div className="bg-gray-50 border-t px-6 py-4 animate-fade-in">
                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-semibold mb-2">Leistungs-Highlights</h4>
                                <ul className="list-disc pl-5 space-y-1 text-sm">
                                  {provider.highlight_1 && <li>{provider.highlight_1}</li>}
                                  {provider.highlight_2 && <li>{provider.highlight_2}</li>}
                                  {provider.highlight_3 && <li>{provider.highlight_3}</li>}
                                </ul>
                              </div>
                              <div>
                                <h4 className="font-semibold mb-2">Weitere Details</h4>
                                <div className="flex flex-col gap-1 text-sm">
                                  <div>Monatspreis: <span className="font-medium">{provider.monthly_price}</span></div>
                                  <div>Jahrespreis: <span className="font-medium">{provider.yearly_price}</span></div>
                                  {/* Add more details as needed */}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </Card>
                    );
                  })}
                </div>
              </div>
            </div>

            {filteredProviders.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Filter className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Keine Anbieter gefunden
                </h3>
                <p className="text-gray-600">
                  Versuche deine Filter anzupassen, um mehr Ergebnisse zu sehen.
                </p>
              </div>
            )}

            <div className="mt-8 p-4 bg-gray-100 rounded-lg">
              <p className="text-sm text-gray-600 text-center">
                * Affiliate-Links: Wir erhalten eine Provision, wenn Sie über unsere Links ein Abonnement abschließen. 
                Dies beeinflusst nicht unsere Bewertungen und Vergleiche. Alle Preise sind unverbindlich und können sich ändern.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default EnhancedVergleich;
