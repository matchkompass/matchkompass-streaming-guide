import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { X, Filter } from "lucide-react";
import { useLeaguesEnhanced } from "@/hooks/useLeaguesEnhanced";
import { useStreamingEnhanced } from "@/hooks/useStreamingEnhanced";

interface DetailComparisonFilters {
  leagues: string[];
  providers: number[];
  priceRange: [number, number];
  features: {
    fourK: boolean;
    mobile: boolean;
    download: boolean;
    multiStream: boolean;
  };
}

interface DetailComparisonSidebarProps {
  filters: DetailComparisonFilters;
  onFiltersChange: (filters: DetailComparisonFilters) => void;
  isOpen: boolean;
  onClose: () => void;
}

const DetailComparisonSidebar: React.FC<DetailComparisonSidebarProps> = ({
  filters,
  onFiltersChange,
  isOpen,
  onClose
}) => {
  const { leagues } = useLeaguesEnhanced();
  const { providers } = useStreamingEnhanced();

  const updateFilters = (updates: Partial<DetailComparisonFilters>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const updateFeatures = (feature: keyof DetailComparisonFilters['features'], value: boolean) => {
    updateFilters({
      features: { ...filters.features, [feature]: value }
    });
  };

  const toggleLeague = (leagueSlug: string) => {
    const newLeagues = filters.leagues.includes(leagueSlug)
      ? filters.leagues.filter(l => l !== leagueSlug)
      : [...filters.leagues, leagueSlug];
    updateFilters({ leagues: newLeagues });
  };

  const toggleProvider = (providerId: number) => {
    const newProviders = filters.providers.includes(providerId)
      ? filters.providers.filter(p => p !== providerId)
      : [...filters.providers, providerId];
    updateFilters({ providers: newProviders });
  };

  const selectAllLeagues = () => {
    updateFilters({ leagues: leagues.map(l => l.league_slug) });
  };

  const clearAllFilters = () => {
    updateFilters({
      leagues: [],
      providers: providers.map(p => p.streamer_id),
      priceRange: [0, 100],
      features: { fourK: false, mobile: false, download: false, multiStream: false }
    });
  };

  // Group leagues by country
  const groupedLeagues = React.useMemo(() => {
    const grouped: { [key: string]: typeof leagues } = {};
    leagues.forEach(league => {
      const country = league.country || 'International';
      if (!grouped[country]) grouped[country] = [];
      grouped[country].push(league);
    });
    
    // Sort by popularity within each group
    Object.keys(grouped).forEach(country => {
      grouped[country].sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    });
    
    return grouped;
  }, [leagues]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:relative lg:inset-auto">
      {/* Mobile overlay */}
      <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      <Card className="h-full lg:h-auto w-80 bg-white lg:bg-transparent lg:shadow-none fixed right-0 top-0 lg:relative lg:right-auto lg:top-auto overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between lg:hidden">
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filter
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Clear Filters */}
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Filter</h3>
            <Button variant="ghost" size="sm" onClick={clearAllFilters}>
              Zurücksetzen
            </Button>
          </div>

          {/* Price Range */}
          <div>
            <h4 className="font-medium mb-3">Preisspanne (€/Monat)</h4>
            <div className="px-2">
              <Slider
                value={filters.priceRange}
                onValueChange={(value) => updateFilters({ priceRange: value as [number, number] })}
                max={100}
                min={0}
                step={5}
                className="mb-2"
              />
              <div className="flex justify-between text-sm text-gray-600">
                <span>{filters.priceRange[0]}€</span>
                <span>{filters.priceRange[1]}€</span>
              </div>
            </div>
          </div>

          {/* Features */}
          <div>
            <h4 className="font-medium mb-3">Features</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm">4K Streaming</label>
                <Switch
                  checked={filters.features.fourK}
                  onCheckedChange={(checked) => updateFeatures('fourK', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm">Mobile App</label>
                <Switch
                  checked={filters.features.mobile}
                  onCheckedChange={(checked) => updateFeatures('mobile', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm">Download/Offline</label>
                <Switch
                  checked={filters.features.download}
                  onCheckedChange={(checked) => updateFeatures('download', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm">Multi-Stream</label>
                <Switch
                  checked={filters.features.multiStream}
                  onCheckedChange={(checked) => updateFeatures('multiStream', checked)}
                />
              </div>
            </div>
          </div>

          {/* Providers */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium">Anbieter</h4>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs px-2 py-1 h-auto"
                onClick={() => updateFilters({ providers: providers.map(p => p.streamer_id) })}
              >
                Alle
              </Button>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {providers.map((provider) => (
                <div key={provider.streamer_id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`provider-${provider.streamer_id}`}
                    checked={filters.providers.includes(provider.streamer_id)}
                    onCheckedChange={() => toggleProvider(provider.streamer_id)}
                  />
                  <div className="flex items-center space-x-2 flex-1">
                    {provider.logo_url ? (
                      <img src={provider.logo_url} alt={provider.name} className="w-5 h-5 object-contain rounded-full bg-white border" />
                    ) : (
                      <span className="w-5 h-5 flex items-center justify-center rounded-full bg-gray-200 text-xs">📺</span>
                    )}
                    <label 
                      htmlFor={`provider-${provider.streamer_id}`} 
                      className="text-sm cursor-pointer flex-1"
                    >
                      {provider.name}
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Leagues */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium">Ligen</h4>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs px-2 py-1 h-auto"
                onClick={selectAllLeagues}
              >
                Alle
              </Button>
            </div>
            <div className="space-y-4 max-h-64 overflow-y-auto">
              {Object.entries(groupedLeagues).map(([country, countryLeagues]) => (
                <div key={country}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{country}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs px-2 py-1 h-auto"
                      onClick={() => {
                        const allSelected = countryLeagues.every(l => filters.leagues.includes(l.league_slug));
                        const newLeagues = allSelected
                          ? filters.leagues.filter(l => !countryLeagues.find(cl => cl.league_slug === l))
                          : [...new Set([...filters.leagues, ...countryLeagues.map(l => l.league_slug)])];
                        updateFilters({ leagues: newLeagues });
                      }}
                    >
                      {countryLeagues.every(l => filters.leagues.includes(l.league_slug)) ? 'Alle ab' : 'Alle'}
                    </Button>
                  </div>
                  <div className="space-y-2 pl-2">
                    {countryLeagues.map((league) => (
                      <div key={league.league_slug} className="flex items-center space-x-2">
                        <Checkbox
                          id={league.league_slug}
                          checked={filters.leagues.includes(league.league_slug)}
                          onCheckedChange={() => toggleLeague(league.league_slug)}
                        />
                        <span className="text-lg">
                          {league.icon || '🏆'}
                        </span>
                        <label htmlFor={league.league_slug} className="text-sm cursor-pointer flex-1">
                          {league.league}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Filters Summary */}
          {(filters.leagues.length > 0 || filters.features.fourK || filters.features.mobile || 
            filters.features.download || filters.features.multiStream) && (
            <div>
              <h4 className="font-medium mb-2">Aktive Filter</h4>
              <div className="flex flex-wrap gap-1">
                {filters.leagues.slice(0, 3).map((leagueSlug) => {
                  const league = leagues.find(l => l.league_slug === leagueSlug);
                  return (
                    <Badge key={leagueSlug} variant="secondary" className="text-xs">
                      {league?.league || leagueSlug}
                    </Badge>
                  );
                })}
                {filters.leagues.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{filters.leagues.length - 3}
                  </Badge>
                )}
                {Object.entries(filters.features).map(([key, value]) => value && (
                  <Badge key={key} variant="secondary" className="text-xs">
                    {key === 'fourK' ? '4K' : key === 'multiStream' ? 'Multi-Stream' : key}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DetailComparisonSidebar;