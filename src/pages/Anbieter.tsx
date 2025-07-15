import { useStreaming } from "@/hooks/useStreaming";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Anbieter = () => {
  const { providers, loading } = useStreaming();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-8 text-center">Alle Streaming-Anbieter</h1>
        {loading ? (
          <div className="text-center text-gray-500 py-20">Lade Anbieter...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {providers.map((provider) => (
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
                      {[provider.highlight_1, provider.highlight_2, provider.highlight_3].filter(Boolean).map((h, i) => (
                        <span key={i} className="block">{h}</span>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Button asChild size="sm" className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 text-xs">
                        <a href={provider.affiliate_url || provider.website_url || "#"} target="_blank" rel="noopener noreferrer">
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
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Anbieter; 