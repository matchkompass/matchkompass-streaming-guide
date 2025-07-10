import { Clock, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const DealsSection = () => {
  const { data: deals, isLoading } = useQuery({
    queryKey: ['deals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deals')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false })
        .limit(4);
      
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return (
      <section className="py-16 px-4 bg-gradient-to-r from-orange-50 to-red-50">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-64 mx-auto mb-4"></div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-300 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!deals?.length) return null;

  return (
    <section className="py-16 px-4 bg-gradient-to-r from-orange-50 to-red-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Star className="h-8 w-8 text-orange-500 mr-3 fill-current" />
            <h2 className="text-3xl font-bold text-gray-900">
              🔥 Heiße Deals
            </h2>
          </div>
          <p className="text-gray-600">
            Limitierte Sonderangebote für Fußball-Streaming
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {deals.map((deal) => (
            <Card key={deal.id} className="hover:shadow-lg transition-all duration-300 hover:scale-105 border-0 shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="text-lg">{deal.provider_name}</CardTitle>
                  <Badge className="bg-red-100 text-red-800 animate-pulse">
                    <Clock className="h-3 w-3 mr-1" />
                    Limitiert
                  </Badge>
                </div>
                <CardDescription className="font-semibold text-green-600">
                  {deal.headline}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600 line-clamp-3">
                  {deal.text}
                </p>
                
                {deal.end_date && (
                  <div className="text-xs text-orange-600 font-semibold">
                    Gültig bis: {new Date(deal.end_date).toLocaleDateString('de-DE')}
                  </div>
                )}

                <Button 
                  asChild 
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                  size="sm"
                >
                  <a 
                    href={deal.affiliate_link || '#'} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    Deal sichern
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DealsSection;