import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useClubs } from '@/hooks/useClubs';
import { useLeaguesEnhanced } from '@/hooks/useLeaguesEnhanced';
import { useStreamingEnhanced } from '@/hooks/useStreamingEnhanced';
import { useNavigate } from 'react-router-dom';

interface SearchResult {
  type: 'club' | 'competition' | 'provider';
  id: string;
  title: string;
  subtitle?: string;
  route: string;
  logo?: string;
}

const EnhancedGlobalSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { clubs } = useClubs();
  const { leagues } = useLeaguesEnhanced();
  const { providers } = useStreamingEnhanced();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const searchResults: SearchResult[] = [];
    const lowerQuery = query.toLowerCase();

    // Search clubs
    clubs
      .filter(club => 
        club.name?.toLowerCase().includes(lowerQuery) ||
        club.country?.toLowerCase().includes(lowerQuery)
      )
      .slice(0, 3)
      .forEach(club => {
        searchResults.push({
          type: 'club',
          id: club.club_id.toString(),
          title: club.name || '',
          subtitle: club.country || '',
          route: `/club/${club.slug}`,
          logo: club.logo_url || ''
        });
      });

    // Search leagues using new enhanced data structure
    leagues
      .filter(league => 
        league.league?.toLowerCase().includes(lowerQuery) ||
        league.league_slug?.toLowerCase().includes(lowerQuery) ||
        league.country?.toLowerCase().includes(lowerQuery)
      )
      .slice(0, 3)
      .forEach(league => {
        searchResults.push({
          type: 'competition',
          id: league.league_id.toString(),
          title: league.league || '',
          subtitle: `${league['number of games']} Spiele • ${league.country}`,
          route: `/competition/${league.league_slug}`
        });
      });

    // Search providers with highlights information
    providers
      .filter(provider => 
        provider.provider_name?.toLowerCase().includes(lowerQuery) ||
        provider.name?.toLowerCase().includes(lowerQuery) ||
        provider.highlights.highlight_1?.toLowerCase().includes(lowerQuery) ||
        provider.highlights.highlight_2?.toLowerCase().includes(lowerQuery) ||
        provider.highlights.highlight_3?.toLowerCase().includes(lowerQuery)
      )
      .slice(0, 3)
      .forEach(provider => {
        // Find the primary highlight that matches the search
        const matchingHighlight = 
          provider.highlights.highlight_1?.toLowerCase().includes(lowerQuery) ? provider.highlights.highlight_1 :
          provider.highlights.highlight_2?.toLowerCase().includes(lowerQuery) ? provider.highlights.highlight_2 :
          provider.highlights.highlight_3?.toLowerCase().includes(lowerQuery) ? provider.highlights.highlight_3 :
          `ab ${provider.monthly_price}/Monat`;
          
        searchResults.push({
          type: 'provider',
          id: provider.streamer_id.toString(),
          title: provider.provider_name || '',
          subtitle: matchingHighlight,
          route: `/streaming-provider/${provider.slug}`,
          logo: provider.logo_url || ''
        });
      });

    // Limit to 8 results total
    setResults(searchResults.slice(0, 8));
    setIsOpen(true);
  }, [query, clubs, leagues, providers]);

  const handleResultClick = (route: string) => {
    navigate(route);
    setIsOpen(false);
    setQuery('');
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'club': return 'Verein';
      case 'competition': return 'Liga';
      case 'provider': return 'Anbieter';
      default: return '';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'club': return 'bg-green-100 text-green-800';
      case 'competition': return 'bg-blue-100 text-blue-800';
      case 'provider': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div ref={searchRef} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Vereine, Ligen oder Anbieter suchen..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          className="pl-10 pr-4"
        />
      </div>

      {isOpen && results.length > 0 && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-96 overflow-y-auto bg-white border shadow-lg">
          <div className="p-2">
            {/* Group results by type */}
            {['club', 'competition', 'provider'].map(type => {
              const typeResults = results.filter(r => r.type === type);
              if (typeResults.length === 0) return null;

              return (
                <div key={type} className="mb-3 last:mb-0">
                  <div className="px-2 py-1 text-xs font-medium text-gray-500 uppercase tracking-wide">
                    {getTypeLabel(type)}
                  </div>
                  {typeResults.map((result) => (
                    <div
                      key={`${result.type}-${result.id}`}
                      onClick={() => handleResultClick(result.route)}
                      className="flex items-center gap-3 p-2 hover:bg-gray-50 cursor-pointer rounded-md transition-colors"
                    >
                      {result.logo ? (
                        <img 
                          src={result.logo} 
                          alt={result.title}
                          className="w-8 h-8 object-contain rounded"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center text-sm">
                          {result.type === 'club' ? '⚽' : 
                           result.type === 'competition' ? '🏆' : '📺'}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-gray-900 truncate">
                          {highlightMatch(result.title, query)}
                        </div>
                        {result.subtitle && (
                          <div className="text-xs text-gray-500 truncate">
                            {result.subtitle}
                          </div>
                        )}
                      </div>
                      <Badge variant="outline" className={`text-xs ${getTypeColor(result.type)}`}>
                        {getTypeLabel(result.type)}
                      </Badge>
                    </div>
                  ))}
                </div>
              );
            })}

            {/* No results message */}
            {results.length === 0 && query.length >= 2 && (
              <div className="p-4 text-center text-gray-500 text-sm">
                Keine Ergebnisse für "{query}" gefunden
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default EnhancedGlobalSearch;
