import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const ClubSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(4);

  const { data: clubs = [], isLoading } = useQuery({
    queryKey: ['topClubs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clubs')
        .select('*')
        .order('popularity', { ascending: false, nullsFirst: false })
        .limit(20);
      
      if (error) throw error;
      return data || [];
    }
  });

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

  const totalPages = Math.ceil(clubs.length / itemsPerView);
  const currentPage = Math.floor(currentIndex / itemsPerView);

  const nextSlide = () => {
    setCurrentIndex((prev) => 
      prev + itemsPerView >= clubs.length ? 0 : prev + itemsPerView
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => 
      prev === 0 ? Math.max(0, clubs.length - itemsPerView) : Math.max(0, prev - itemsPerView)
    );
  };

  const goToPage = (page: number) => {
    setCurrentIndex(page * itemsPerView);
  };

  if (isLoading || clubs.length === 0) {
    return (
      <div className="flex justify-center py-8">
        <div className="text-gray-500">Lade Top Vereine...</div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-gray-900">Top Vereine</h3>
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
            disabled={currentIndex + itemsPerView >= clubs.length}
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
            width: `${(clubs.length * 100) / itemsPerView}%`
          }}
        >
          {clubs.map((club) => (
            <div 
              key={club.club_id} 
              className="flex-shrink-0 px-2"
              style={{ width: `${100 / clubs.length}%` }}
            >
              <Link to={`/club/${club.slug}`}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <div className="flex justify-center mb-4">
                      {club.logo_url ? (
                        <img 
                          src={club.logo_url} 
                          alt={club.name} 
                          className="h-12 w-12 object-contain rounded-full"
                        />
                      ) : (
                        <div 
                          className="h-12 w-12 rounded-full flex items-center justify-center text-white font-bold"
                          style={{ backgroundColor: club.primary_color || '#666' }}
                        >
                          {club.name?.charAt(0) || '?'}
                        </div>
                      )}
                    </div>
                    <h4 className="font-semibold text-lg mb-1">{club.name}</h4>
                    <p className="text-gray-600 text-sm mb-4">{club.country}</p>
                    <Button 
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
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

export default ClubSlider;