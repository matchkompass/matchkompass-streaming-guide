import { useState, useEffect } from "react";
import { Clock, Percent, Star, TrendingUp, Calendar, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";

const Deals = () => {
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const { data, error } = await supabase
          .from('deals')
          .select('*')
          .eq('active', true)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching deals:', error);
        } else {
          setDeals(data || []);
        }
      } catch (error) {
        console.error('Error fetching deals:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDeals();
  }, []);

  const newsItems = [
    {
      title: "Neue Bundesliga-Rechte: Sky und DAZN teilen sich die Übertragung",
      date: "15.01.2025",
      category: "Rechte",
      summary: "Die Bundesliga-Rechte für die kommende Saison wurden zwischen Sky und DAZN aufgeteilt. Sky zeigt die Samstagsspiele, DAZN die Freitagsspiele.",
      isHighlighted: true
    },
    {
      title: "Champions League: Neue Übertragungszeiten ab Februar",
      date: "12.01.2025",
      category: "Spielplan",
      summary: "Die UEFA hat neue Anstoßzeiten für die Champions League bekanntgegeben. Alle Änderungen im Überblick.",
      isHighlighted: false
    },
    {
      title: "Streaming-Preise 2025: Diese Anbieter werden teurer",
      date: "10.01.2025",
      category: "Preise",
      summary: "Mehrere Streaming-Anbieter haben Preiserhöhungen für 2025 angekündigt. Wir zeigen, welche Alternativen es gibt.",
      isHighlighted: false
    }
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const parsePrice = (price: number | string) => {
    if (typeof price === 'number') return price;
    return parseFloat(price?.toString().replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Lade Angebote...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Deals & News
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Aktuelle Angebote und Neuigkeiten aus der Welt des Fußball-Streamings
          </p>
        </div>

        {/* News Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
            <Calendar className="mr-3 h-6 w-6 text-blue-600" />
            Aktuelle News
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {newsItems.map((item, index) => (
              <Card key={index} className={`hover:shadow-lg transition-shadow ${item.isHighlighted ? 'ring-2 ring-blue-500' : ''}`}>
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge className="bg-blue-100 text-blue-800">{item.category}</Badge>
                    <span className="text-sm text-gray-500">{item.date}</span>
                  </div>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">{item.summary}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Deals Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
            <Tag className="mr-3 h-6 w-6 text-green-600" />
            Aktuelle Deals
          </h2>
          {deals.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500">Keine aktuellen Deals verfügbar</div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {deals.map((deal) => (
                <Card key={deal.id} className="hover:shadow-lg transition-shadow border-2 border-green-200">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <span className="text-2xl mr-2">🎯</span>
                        <Badge className="bg-green-100 text-green-800">{deal.provider_name}</Badge>
                      </div>
                      {deal.end_date && (
                        <div className="text-right">
                          <Clock className="h-4 w-4 text-red-500 inline mr-1" />
                          <span className="text-sm text-red-500">
                            bis {formatDate(deal.end_date)}
                          </span>
                        </div>
                      )}
                    </div>
                    <CardTitle className="text-lg">{deal.headline || deal.name}</CardTitle>
                    <CardDescription>{deal.text}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Price Display */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {deal.normal_price && (
                            <span className="text-lg text-gray-500 line-through">
                              €{parsePrice(deal.normal_price).toFixed(2)}
                            </span>
                          )}
                          <span className="text-2xl font-bold text-green-600">
                            €{parsePrice(deal.deal_price).toFixed(2)}
                          </span>
                        </div>
                        {deal.normal_price && deal.deal_price && (
                          <div className="text-right">
                            <div className="text-sm text-green-600 font-semibold">
                              -{Math.round(((parsePrice(deal.normal_price) - parsePrice(deal.deal_price)) / parsePrice(deal.normal_price)) * 100)}%
                            </div>
                            <div className="text-xs text-gray-500">
                              Ersparnis: €{(parsePrice(deal.normal_price) - parsePrice(deal.deal_price)).toFixed(2)}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Highlights */}
                      {deal.highlights && (
                        <div className="space-y-2">
                          <h4 className="font-semibold text-sm">Highlights:</h4>
                          <div className="text-sm text-gray-600">
                            {deal.highlights.split(',').map((highlight: string, index: number) => (
                              <div key={index} className="flex items-center">
                                <Star className="h-3 w-3 text-green-600 mr-1" />
                                {highlight.trim()}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Long Text */}
                      {deal.text_long && (
                        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                          {deal.text_long}
                        </div>
                      )}

                      {/* Conditions */}
                      {deal.conditions && (
                        <div className="text-xs text-gray-500 border-t pt-2">
                          <strong>Bedingungen:</strong> {deal.conditions}
                        </div>
                      )}

                      {/* CTA Button */}
                      {deal.affiliate_link && (
                        <Button 
                          className="w-full bg-green-600 hover:bg-green-700"
                          onClick={() => window.open(deal.affiliate_link, '_blank')}
                        >
                          Zum Angebot
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
      
      <Footer />
    </div>
  );
};

export default Deals;