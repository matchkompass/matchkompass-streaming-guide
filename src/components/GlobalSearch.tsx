import { useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const GlobalSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
      setSearchTerm("");
      setIsExpanded(false);
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
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Verein oder Liga suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
          </div>
        </form>
      )}
    </div>
  );
};

export default GlobalSearch;