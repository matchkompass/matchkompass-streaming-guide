import { useStreaming } from "@/hooks/useStreaming";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const ProviderSlider = () => {
  const { providers, loading } = useStreaming();
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(4);

  // Sort providers by name (alphabetical)
  const sortedProviders = [...providers].sort((a, b) => 
    a.name.localeCompare(b.name)
  );

  useEffect(() => {
    const updateItemsPerView = () => {
      if (window.innerWidth < 640) {
        setItemsPerView(1);
      } else if (window.innerWidth < 768) {
        setItemsPerView(2);
      } else if (window.innerWidth < 1024) {
        setItemsPerView(3);
      } else {
        setItemsPerView(4);
      }
    };

    updateItemsPerView();
    window.addEventListener('resize', updateItemsPerView);
    return () => window.removeEventListener('resize', updateItemsPerView);
  }, []);

  const totalPages = Math.ceil(sortedProviders.length / itemsPerView);
  const startIndex = currentPage * itemsPerView;
  const currentProviders = sortedProviders.slice(startIndex, startIndex + itemsPerView);

  const nextSlide = () => {
    setCurrentPage((prev) => 
      prev + 1 >= totalPages ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    setCurrentPage((prev) => 
      prev === 0 ? totalPages - 1 : prev - 1
    );
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  if (loading || sortedProviders.length === 0) {
    return (
      <div className="flex justify-center py-8">
        <div className="text-gray-500">Lade Streaming-Anbieter...</div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-gray-900">Unsere Partner</h3>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={prevSlide}
            disabled={totalPages <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={nextSlide}
            disabled={totalPages <= 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {currentProviders.map((provider) => (
          <Link key={provider.streamer_id} to={`/streaming-provider/${provider.slug}`}>
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  {provider.logo_url ? (
                    <img 
                      src={provider.logo_url} 
                      alt={`${provider.name} Logo`}
                      className="h-12 w-auto object-contain"
                    />
                  ) : (
                    <div className="h-12 w-12 bg-gray-200 rounded-lg flex items-center justify-center">
                      <span className="text-gray-500 font-bold">
                        {provider.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <h4 className="font-semibold text-lg mb-2">{provider.name}</h4>
                <p className="text-green-600 font-bold text-xl mb-4">
                  ab €{provider.monthly_price}
                </p>
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  Mehr erfahren
                </Button>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
      
      {/* Pagination dots */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 gap-2">
          {Array.from({ length: Math.min(totalPages, 4) }).map((_, index) => (
            <button
              key={index}
              onClick={() => goToPage(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                currentPage === index ? 'bg-green-600' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProviderSlider;