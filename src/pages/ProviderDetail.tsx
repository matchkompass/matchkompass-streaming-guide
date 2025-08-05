
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ExternalLink, Play, Star, Check, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { useStreaming, StreamingProvider } from "@/hooks/useStreaming";
import { useLeagues } from "@/hooks/useLeagues";

const ProviderDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { providers, loading: providersLoading } = useStreaming();
  const { leagues } = useLeagues();
  const [provider, setProvider] = useState<StreamingProvider | null>(null);
  const [showYearly, setShowYearly] = useState(false);

  useEffect(() => {
    if (providers.length > 0 && slug) {
      const foundProvider = providers.find(p => p.slug === slug);
      setProvider(foundProvider || null);
    }
  }, [providers, slug]);

  const parsePrice = (priceString?: string): number => {
    if (!priceString) return 0;
    return parseFloat(priceString.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
  };

  const parseFeatures = (provider: StreamingProvider) => {
    const defaultFeatures = {
      '4K': false,
      'mobile': false,
      'offline': false,
      'smartTV': false,
      'streams': 1,
      'download': false
    };

    if (provider.features) {
      try {
        const featureObj = typeof provider.features === 'string' 
          ? JSON.parse(provider.features) 
          : provider.features;
        return { ...defaultFeatures, ...featureObj };
      } catch (e) {
        return defaultFeatures;
      }
    }
    return defaultFeatures;
  };

  const getLeagueCoverage = () => {
    if (!provider) return [];
    
    const leagueColumns = [
      'bundesliga', 'second_bundesliga', 'dfb_pokal', 'champions_league', 
      'europa_league', 'conference_league', 'club_world_cup', 'premier_league',
      'fa_cup', 'la_liga', 'copa_del_rey', 'serie_a', 'ligue_1', 'eredevise',
      'sueper_lig', 'liga_portugal', 'saudi_pro_league', 'mls'
    ];

    return leagueColumns
      .map(column => {
        const coveredGames = (provider[column as keyof StreamingProvider] as number) || 0;
        const league = leagues.find(l => l.league_slug === column);
        const totalGames = league?.['number of games'] || 0;
        const percentage = totalGames > 0 ? Math.round((coveredGames / totalGames) * 100) : 0;
        
        return {
          league: league?.league || column.replace('_', ' '),
          slug: column,
          coveredGames,
          totalGames,
          percentage
        };
      })
      .filter(item => item.coveredGames > 0)
      .sort((a, b) => b.percentage - a.percentage);
  };

  if (providersLoading) {
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

  if (!provider) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Anbieter nicht gefunden</h1>
            <p className="text-gray-600">Der angegebene Streaming-Anbieter konnte nicht gefunden werden.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const features = parseFeatures(provider);
  const leagueCoverage = getLeagueCoverage();
  const monthlyPrice = parsePrice(provider.monthly_price);
  const yearlyPrice = parsePrice(provider.yearly_price);
  const currentPrice = showYearly ? yearlyPrice : monthlyPrice;
  const yearlyMonthlySavings = yearlyPrice > 0 ? (monthlyPrice * 12) - yearlyPrice : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead 
        title={`${provider?.provider_name} Streaming - Preise & Test | MatchStream`}
        description={`${provider?.provider_name} im Test: Alle Infos zu Preisen, Liga-Abdeckung und Features. Ab ${monthlyPrice.toFixed(2)}€/Monat für Fußball-Streaming.`}
        keywords={`${provider?.provider_name} Test, ${provider?.provider_name} Preis, Fußball Streaming, Streaming Anbieter`}
        canonical={`https://matchstream.de/streaming-provider/${slug}`}
        ogType="product"
        ogImage={provider?.logo_url || "/banner.png"}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Product",
          "name": provider?.provider_name,
          "description": `Streaming-Service für Fußball ab ${monthlyPrice.toFixed(2)}€/Monat`,
          "brand": provider?.provider_name,
          "image": provider?.logo_url,
          "offers": {
            "@type": "Offer",
            "price": monthlyPrice.toFixed(2),
            "priceCurrency": "EUR",
            "availability": "https://schema.org/InStock"
          }
        }}
      />
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Hero Section */}
        <div className="bg-white rounded-lg shadow-sm mb-6 p-6">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="bg-gray-100 rounded-lg p-4">
              {provider.logo_url ? (
                <img src={provider.logo_url} alt={provider.provider_name} className="w-20 h-20 object-contain" />
              ) : (
                <div className="w-20 h-20 bg-gray-300 rounded-lg flex items-center justify-center text-3xl">
                  📺
                </div>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{provider.provider_name}</h1>
              <p className="text-gray-600 mb-4">{provider.name}</p>
              <div className="flex items-center gap-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">(4.0/5)</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-green-600">
                {currentPrice.toFixed(2)}€
              </div>
              <div className="text-sm text-gray-500">
                {showYearly ? 'pro Jahr' : 'pro Monat'}
              </div>
              {yearlyMonthlySavings > 0 && showYearly && (
                <div className="text-sm text-orange-600 mt-1">
                  Ersparnis: {yearlyMonthlySavings.toFixed(2)}€/Jahr
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Package Options */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Paket-Optionen
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm ${!showYearly ? 'font-medium' : 'text-gray-500'}`}>
                      Monatlich
                    </span>
                    <Switch
                      checked={showYearly}
                      onCheckedChange={setShowYearly}
                    />
                    <span className={`text-sm ${showYearly ? 'font-medium' : 'text-gray-500'}`}>
                      Jährlich
                    </span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{provider.name}</h3>
                      <p className="text-gray-600">Standard-Paket</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">
                        {currentPrice.toFixed(2)}€
                      </div>
                      <div className="text-sm text-gray-500">
                        {showYearly ? '/Jahr' : '/Monat'}
                      </div>
                    </div>
                  </div>
                  
                  {/* Features */}
                  <div className="grid md:grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center gap-2">
                      {features['4K'] ? <Check className="h-4 w-4 text-green-500" /> : <X className="h-4 w-4 text-red-500" />}
                      <span className="text-sm">4K Streaming</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {features.mobile ? <Check className="h-4 w-4 text-green-500" /> : <X className="h-4 w-4 text-red-500" />}
                      <span className="text-sm">Mobile App</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {features.offline || features.download ? <Check className="h-4 w-4 text-green-500" /> : <X className="h-4 w-4 text-red-500" />}
                      <span className="text-sm">Offline-Viewing</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {features.smartTV ? <Check className="h-4 w-4 text-green-500" /> : <X className="h-4 w-4 text-red-500" />}
                      <span className="text-sm">Smart TV App</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{features.streams || 1} simultane Stream{(features.streams || 1) > 1 ? 's' : ''}</span>
                    </div>
                  </div>

                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      const affiliateUrl = `${provider.affiliate_url}${provider.affiliate_url?.includes('?') ? '&' : '?'}affiliate=matchkompass`;
                      window.open(affiliateUrl, '_blank');
                    }}
                  >
                    Jetzt buchen <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* League Coverage */}
            <Card>
              <CardHeader>
                <CardTitle>Liga-Übersicht</CardTitle>
              </CardHeader>
              <CardContent>
                {leagueCoverage.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Liga</TableHead>
                        <TableHead>Spiele</TableHead>
                        <TableHead>Abdeckung</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leagueCoverage.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{item.league}</TableCell>
                          <TableCell>
                            {item.coveredGames}/{item.totalGames}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${
                                    item.percentage >= 90 ? 'bg-green-500' : 
                                    item.percentage >= 50 ? 'bg-orange-500' : 
                                    'bg-red-500'
                                  }`}
                                  style={{ width: `${item.percentage}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium w-12">
                                {item.percentage}%
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Play className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Keine Liga-Abdeckung verfügbar</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Auf einen Blick</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Monatspreis:</span>
                  <span className="font-medium">{monthlyPrice.toFixed(2)}€</span>
                </div>
                {yearlyPrice > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Jahrespreis:</span>
                    <span className="font-medium">{yearlyPrice.toFixed(2)}€</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Ligen:</span>
                  <span className="font-medium">{leagueCoverage.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Streams:</span>
                  <span className="font-medium">{features.streams || 1}</span>
                </div>
              </CardContent>
            </Card>

            {/* Top Features */}
            <Card>
              <CardHeader>
                <CardTitle>Top Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {features['4K'] && (
                    <Badge className="mr-2 mb-2 bg-blue-500">4K Ultra HD</Badge>
                  )}
                  {features.mobile && (
                    <Badge className="mr-2 mb-2 bg-green-500">Mobile App</Badge>
                  )}
                  {(features.offline || features.download) && (
                    <Badge className="mr-2 mb-2 bg-purple-500">Offline</Badge>
                  )}
                  {features.smartTV && (
                    <Badge className="mr-2 mb-2 bg-orange-500">Smart TV</Badge>
                  )}
                  {features.streams > 1 && (
                    <Badge className="mr-2 mb-2 bg-red-500">Multi-Stream</Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* CTA */}
            <Card>
              <CardContent className="pt-6">
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700 text-lg py-3"
                  onClick={() => {
                    const affiliateUrl = `${provider.affiliate_url}${provider.affiliate_url?.includes('?') ? '&' : '?'}affiliate=matchkompass`;
                    window.open(affiliateUrl, '_blank');
                  }}
                >
                  Jetzt bestellen
                  <ExternalLink className="h-5 w-5 ml-2" />
                </Button>
                <p className="text-xs text-gray-500 text-center mt-2">
                  * Affiliate-Link: Wir erhalten eine Provision
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProviderDetail;
