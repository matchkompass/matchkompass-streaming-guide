import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useClubs } from "@/hooks/useClubs";
import { useLeagues } from "@/hooks/useLeagues";

const GlobalSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const navigate = useNavigate();
  const { clubs } = useClubs();
  const { leagues } = useLeagues();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!searchTerm) {
      setSuggestions([]);
      setHighlightedIndex(-1);
      return;
    }
    const lower = searchTerm.toLowerCase();
    const clubMatches = clubs.filter(c => c.name && c.name.toLowerCase().includes(lower)).map(c => ({
      type: 'club',
      label: c.name,
      slug: c.slug
    }));
    const leagueMatches = leagues.filter(l => l.league && l.league.toLowerCase().includes(lower)).map(l => ({
      type: 'league',
      label: l.league,
      slug: l.league_slug
    }));
    setSuggestions([...clubMatches, ...leagueMatches].slice(0, 8));
    setHighlightedIndex(-1);
  }, [searchTerm, clubs, leagues]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      if (suggestions.length > 0) {
        handleSelect(suggestions[0]);
      } else {
        navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
      }
      setSearchTerm("");
      setIsExpanded(false);
    }
  };

  const handleSelect = (item: any) => {
    if (item.type === 'club') {
      navigate(`/club/${item.slug}`);
    } else if (item.type === 'league') {
      navigate(`/league/${item.slug}`);
    }
    setSearchTerm("");
    setIsExpanded(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!suggestions.length) return;
    if (e.key === 'ArrowDown') {
      setHighlightedIndex(i => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      setHighlightedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      handleSelect(suggestions[highlightedIndex]);
    }
  };

  return (
    <div className="relative">
      {!isExpanded ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(true)}
          className="h-9 w-9 p-0"
        >
          <Search className="h-4 w-4" />
        </Button>
      ) : (
        <form onSubmit={handleSearch} className="flex items-center">
          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              ref={inputRef}
              placeholder="Verein oder Liga suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-10 pr-10 w-64"
              autoFocus
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsExpanded(false);
                setSearchTerm("");
              }}
              className="absolute right-1 top-0.5 h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
            {suggestions.length > 0 && (
              <ul className="absolute z-10 left-0 mt-1 w-full bg-white border rounded shadow-lg max-h-60 overflow-auto">
                {suggestions.map((item, idx) => (
                  <li
                    key={item.type + item.slug}
                    className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${idx === highlightedIndex ? 'bg-gray-100' : ''}`}
                    onMouseDown={() => handleSelect(item)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                  >
                    <span className="font-medium">{item.label}</span>
                    <span className="ml-2 text-xs text-gray-400">{item.type === 'club' ? 'Verein' : 'Liga'}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </form>
      )}
    </div>
  );
};

export default GlobalSearch;