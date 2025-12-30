
import { useStreamingEnhanced } from "@/hooks/useStreamingEnhanced";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const ProviderGrid = () => {
    const { providers, loading } = useStreamingEnhanced();

    // Sort/Filter logic if needed
    const displayProviders = (providers || []).slice(0, 8);

    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="h-24 animate-pulse bg-gray-100 border-0" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900">Streaming Anbieter</h3>
                <Link to="/anbieter" className="text-green-600 hover:text-green-700 font-medium text-sm flex items-center">
                    Alle ansehen <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {displayProviders.map((provider) => (
                    <Link key={provider.streamer_id} to={`/streaming-provider/${provider.slug}`}>
                        <Card className="hover:shadow-md transition-all cursor-pointer border shadow-sm group bg-white">
                            <CardContent className="p-4 flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="flex-shrink-0 w-10 h-10 bg-white border border-gray-100 rounded-lg flex items-center justify-center p-1">
                                        {provider.logo_url ? (
                                            <img
                                                src={provider.logo_url}
                                                alt={provider.name}
                                                className="w-full h-full object-contain"
                                            />
                                        ) : (
                                            <span className="text-gray-400 font-bold text-xs">
                                                {provider.name.charAt(0)}
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                                            {provider.name}
                                        </h4>
                                        <p className="text-xs text-gray-500">
                                            ab €{provider.monthly_price}/Monat
                                        </p>
                                    </div>
                                </div>
                                <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-green-500 transition-colors" />
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            <div className="text-center sm:hidden">
                <Button asChild variant="outline" className="w-full">
                    <Link to="/anbieter">Alle Anbieter anzeigen</Link>
                </Button>
            </div>
        </div>
    );
};

export default ProviderGrid;
