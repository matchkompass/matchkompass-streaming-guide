import React from 'react';
import { Search, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useClubSelection } from '@/hooks/useClubSelection';

export default function ClubSelector() {
  const {
    clubs,
    selectedClubs,
    loading,
    searchTerm,
    setSearchTerm,
    toggleClub
  } = useClubSelection();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Verein suchen..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-96 overflow-y-auto">
        {clubs.map((club) => {
          const isSelected = selectedClubs.includes(club.club_id);
          
          return (
            <Card
              key={club.club_id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                isSelected
                  ? 'ring-2 ring-blue-500 bg-blue-50'
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => toggleClub(club.club_id)}
            >
              <CardContent className="p-3 text-center">
                <div className="mb-2">
                  {club.logo_url ? (
                    <img 
                      src={club.logo_url} 
                      alt={club.name} 
                      className="w-8 h-8 mx-auto object-contain" 
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mx-auto text-lg">
                      ⚽
                    </div>
                  )}
                </div>
                
                <h3 className="font-medium text-sm mb-1 line-clamp-2">
                  {club.name}
                </h3>
                
                <p className="text-xs text-gray-600 mb-2">
                  {club.country}
                </p>

                {isSelected && (
                  <div className="mt-2">
                    <Check className="h-5 w-5 text-blue-600 mx-auto" />
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedClubs.length > 0 && (
        <div className="text-center">
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
            {selectedClubs.length} Vereine ausgewählt
          </span>
        </div>
      )}
    </div>
  );
}