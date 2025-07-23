import { useStreaming } from "@/hooks/useStreaming";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const ProviderSlider = () => {
  const { providers, loading } = useStreaming();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(4);

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

  const totalPages = Math.ceil(providers.length / itemsPerView);
  const currentPage = Math.floor(currentIndex / itemsPerView);

  const nextSlide = () => {
    setCurrentIndex((prev) => 
      prev + itemsPerView >= providers.length ? 0 : prev + itemsPerView
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => 
      prev === 0 ? Math.max(0, providers.length - itemsPerView) : Math.max(0, prev - itemsPerView)
    );
  };

  const goToPage = (page: number) => {
    setCurrentIndex(page * itemsPerView);
  };

  if (loading || providers.length === 0) {
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
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={nextSlide}
            disabled={currentIndex + itemsPerView >= providers.length}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="overflow-hidden">
        <div 
          className="flex transition-transform duration-300 ease-in-out"
          style={{ 
            transform: `translateX(-${(currentIndex * 100) / itemsPerView}%)`,
            width: `${(providers.length * 100) / itemsPerView}%`
          }}
        >
          {providers.map((provider) => (
            <div 
              key={provider.streamer_id} 
              className="flex-shrink-0 px-2"
              style={{ width: `${100 / providers.length}%` }}
            >
              <Link to={`/provider/${provider.slug}`}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <div className="flex justify-center mb-4">
                      {provider.logo_url ? (
                        <img 
                          src={provider.logo_url} 
                          alt={provider.name} 
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
            </div>
          ))}
        </div>
      </div>
      
      {/* Pagination dots */}
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
    </div>
  );
};

export default ProviderSlider;