import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const ClubSlider = () => {
  const [currentPage, setCurrentPage] = useState(0);
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
  const startIndex = currentPage * itemsPerView;
  const currentClubs = clubs.slice(startIndex, startIndex + itemsPerView);

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
        {currentClubs.map((club) => (
          <Link key={club.club_id} to={`/club/${club.slug}`}>
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  {club.logo_url ? (
                    <img 
                      src={club.logo_url} 
                      alt={`${club.name} Logo`}
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

export default ClubSlider;