
import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useClubs } from "@/hooks/useClubs";
import { useLeagues } from "@/hooks/useLeagues";
import { useStreaming } from "@/hooks/useStreaming";

interface SearchResult {
  type: 'club' | 'league' | 'provider';
  id: string;
  name: string;
  slug: string;
  route: string;
  icon: string;
}

const GlobalSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { clubs } = useClubs();
  const { leagues } = useLeagues();
  const { providers } = useStreaming();

  // Search logic
  useEffect(() => {
    if (searchTerm.trim().length < 2) {
      setResults([]);
      return;
    }

    const searchQuery = searchTerm.toLowerCase();
    const allResults: SearchResult[] = [];

    // Search clubs
    clubs.forEach(club => {
      if (club.name?.toLowerCase().includes(searchQuery)) {
        allResults.push({
          type: 'club',
          id: club.club_id.toString(),
          name: club.name,
          slug: club.slug || '',
          route: `/club/${club.slug}`,
          icon: '⚽'
        });
      }
    });

    // Search leagues
    leagues.forEach(league => {
      if (league.league?.toLowerCase().includes(searchQuery)) {
        allResults.push({
          type: 'league',
          id: league.league_id.toString(),
          name: league.league || '',
          slug: league.league_slug || '',
          route: `/competition/${league.league_slug}`,
          icon: '🏆'
        });
      }
    });

    // Search providers
    providers.forEach(provider => {
      if (
        provider.provider_name?.toLowerCase().includes(searchQuery) ||
        provider.name?.toLowerCase().includes(searchQuery)
      ) {
        allResults.push({
          type: 'provider',
          id: provider.streamer_id.toString(),
          name: provider.provider_name || provider.name || '',
          slug: provider.slug || '',
          route: `/streaming-provider/${provider.slug}`,
          icon: '📺'
        });
      }
    });

    // Limit to 8 results and group by type
    const limitedResults = allResults.slice(0, 8);
    setResults(limitedResults);
  }, [searchTerm, clubs, leagues, providers]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleResultClick = (result: SearchResult) => {
    window.location.href = result.route;
    setIsOpen(false);
    setSearchTerm("");
  };

  const clearSearch = () => {
    setSearchTerm("");
    setResults([]);
    inputRef.current?.focus();
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'club': return 'Vereine';
      case 'league': return 'Ligen';
      case 'provider': return 'Anbieter';
      default: return '';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'club': return 'bg-green-100 text-green-800';
      case 'league': return 'bg-blue-100 text-blue-800';
      case 'provider': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Group results by type
  const groupedResults = results.reduce((groups, result) => {
    if (!groups[result.type]) {
      groups[result.type] = [];
    }
    groups[result.type].push(result);
    return groups;
  }, {} as Record<string, SearchResult[]>);

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Vereine, Ligen oder Anbieter suchen..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className="pl-10 pr-10 w-full md:w-80"
        />
        {searchTerm && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (searchTerm.length >= 2 || results.length > 0) && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
        >
          {results.length === 0 && searchTerm.length >= 2 ? (
            <div className="p-4 text-center text-gray-500">
              <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p>Keine Ergebnisse für "{searchTerm}"</p>
            </div>
          ) : (
            <div className="py-2">
              {Object.entries(groupedResults).map(([type, typeResults]) => (
                <div key={type}>
                  <div className="px-4 py-2 border-b border-gray-100">
                    <Badge variant="secondary" className={getTypeColor(type)}>
                      {getTypeLabel(type)}
                    </Badge>
                  </div>
                  {typeResults.map((result) => (
                    <button
                      key={`${result.type}-${result.id}`}
                      onClick={() => handleResultClick(result)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left transition-colors"
                    >
                      <span className="text-lg">{result.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {result.name}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              ))}

              {/* Show all results link */}
              {results.length === 8 && (
                <div className="border-t border-gray-100 p-2">
                  <button className="w-full text-center text-sm text-blue-600 hover:text-blue-800 py-2">
                    Alle Ergebnisse anzeigen
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;
