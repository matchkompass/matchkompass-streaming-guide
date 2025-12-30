import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import {
  Filter,
  Play,
  Shield,
  Sparkles,
  ChevronDown,
  ChevronUp,
  X,
  Dumbbell
} from "lucide-react";
import { useLeaguesEnhanced } from "@/hooks/useLeaguesEnhanced";
import { useStreamingEnhanced } from "@/hooks/useStreamingEnhanced";

export interface HorizontalFilterBarFilters {
  leagues: string[];
  providers: number[];
  otherSports: string[];
  features: {
    fourK: boolean;
    mobile: boolean;
    download: boolean;
    multiStream: boolean;
  };
}

interface HorizontalFilterBarProps {
  filters: HorizontalFilterBarFilters;
  onFiltersChange: (filters: HorizontalFilterBarFilters) => void;
  availableOtherSports: string[];
}

const HorizontalFilterBar: React.FC<HorizontalFilterBarProps> = ({
  filters,
  onFiltersChange,
  availableOtherSports
}) => {
  const { leagues } = useLeaguesEnhanced();
  const { providers } = useStreamingEnhanced();
  const [isExpanded, setIsExpanded] = useState(false);

  const updateFilters = (updates: Partial<HorizontalFilterBarFilters>) => {
    onFiltersChange({
      ...filters,
      ...updates
    });
  };

  const updateFeatures = (feature: keyof HorizontalFilterBarFilters['features'], value: boolean) => {
    updateFilters({
      features: {
        ...filters.features,
        [feature]: value
      }
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

  const toggleOtherSport = (sport: string) => {
    const newSports = filters.otherSports.includes(sport)
      ? filters.otherSports.filter(s => s !== sport)
      : [...filters.otherSports, sport];
    updateFilters({ otherSports: newSports });
  };

  const clearAllFilters = () => {
    updateFilters({
      leagues: [],
      providers: providers.map(p => p.streamer_id),
      otherSports: [],
      features: {
        fourK: false,
        mobile: false,
        download: false,
        multiStream: false
      }
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
    Object.keys(grouped).forEach(country => {
      grouped[country].sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    });
    return grouped;
  }, [leagues]);

  const activeFilterCount =
    (filters.leagues.length > 0 ? 1 : 0) +
    (filters.otherSports.length > 0 ? 1 : 0) +
    (Object.values(filters.features).some(Boolean) ? 1 : 0) +
    (filters.providers.length < providers.length ? 1 : 0);

  const displayedProviderCount = filters.providers.length;

  return (
    <div className="bg-white rounded-lg border shadow-sm mb-6">
      {/* Header Row */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <Filter className="h-5 w-5 text-gray-600" />
          <span className="font-semibold text-gray-900">Filter</span>
          <Badge variant="secondary" className="bg-green-100 text-green-800 font-medium">
            {displayedProviderCount} von {providers.length} Anbietern
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                clearAllFilters();
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4 mr-1" />
              Zurücksetzen
            </Button>
          )}
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </div>
      </div>

      {/* Filter Dropdowns Row */}
      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 pt-0">

          {/* 1. Streaming/Leagues Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between h-12 text-left font-normal hover:bg-green-50 hover:border-green-500 hover:text-gray-900 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Play className="h-4 w-4 text-green-600" />
                  <span>Ligen & Wettbewerbe</span>
                </div>
                <div className="flex items-center gap-2">
                  {filters.leagues.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {filters.leagues.length} Ligen
                    </Badge>
                  )}
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </div>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[calc(100vw-32px)] sm:w-80 p-4" align="start">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Ligen & Wettbewerbe</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                    onClick={() => updateFilters({ leagues: [] })}
                  >
                    Alle anzeigen
                  </Button>
                </div>
                <div className="max-h-64 overflow-y-auto space-y-3">
                  {Object.entries(groupedLeagues).map(([country, countryLeagues]) => (
                    <div key={country}>
                      <span className="text-sm font-medium text-gray-700">{country}</span>
                      <div className="space-y-2 mt-2 pl-2">
                        {countryLeagues.map(league => (
                          <div key={league.league_slug} className="flex items-center space-x-2">
                            <Checkbox
                              id={`league-${league.league_slug}`}
                              checked={filters.leagues.includes(league.league_slug || '')}
                              onCheckedChange={() => toggleLeague(league.league_slug || '')}
                            />
                            <span className="text-lg">{league.icon || '🏆'}</span>
                            <label
                              htmlFor={`league-${league.league_slug}`}
                              className="text-sm cursor-pointer flex-1"
                            >
                              {league.league}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* 2. Providers Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between h-12 text-left font-normal hover:bg-green-50 hover:border-green-500 hover:text-gray-900 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span>Anbieter</span>
                </div>
                <div className="flex items-center gap-2">
                  {filters.providers.length < providers.length && (
                    <Badge variant="secondary" className="text-xs">
                      {filters.providers.length} / {providers.length}
                    </Badge>
                  )}
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </div>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[calc(100vw-32px)] sm:w-80 p-4" align="start">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Anbieter</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                    onClick={() => updateFilters({ providers: providers.map(p => p.streamer_id) })}
                  >
                    Alle auswählen
                  </Button>
                </div>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {providers.map(provider => (
                    <div key={provider.streamer_id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`provider-${provider.streamer_id}`}
                        checked={filters.providers.includes(provider.streamer_id)}
                        onCheckedChange={() => toggleProvider(provider.streamer_id)}
                      />
                      <div className="flex items-center space-x-2 flex-1">
                        {provider.logo_url ? (
                          <img
                            src={provider.logo_url}
                            alt={provider.name || ''}
                            className="w-5 h-5 object-contain rounded-full bg-white border"
                          />
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
            </PopoverContent>
          </Popover>

          {/* 3. Features Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between h-12 text-left font-normal hover:bg-green-50 hover:border-green-500 hover:text-gray-900 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-green-600" />
                  <span>Features</span>
                </div>
                <div className="flex items-center gap-2">
                  {Object.values(filters.features).some(Boolean) && (
                    <Badge variant="secondary" className="text-xs">
                      {Object.values(filters.features).filter(Boolean).length} aktiv
                    </Badge>
                  )}
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </div>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[calc(100vw-32px)] sm:w-80 p-4" align="end">
              <div className="space-y-4">
                <h4 className="font-medium">Features</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm">4K Streaming</label>
                    <Switch
                      checked={filters.features.fourK}
                      onCheckedChange={checked => updateFeatures('fourK', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm">Mobile App</label>
                    <Switch
                      checked={filters.features.mobile}
                      onCheckedChange={checked => updateFeatures('mobile', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm">Download/Offline</label>
                    <Switch
                      checked={filters.features.download}
                      onCheckedChange={checked => updateFeatures('download', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm">Multi-Stream</label>
                    <Switch
                      checked={filters.features.multiStream}
                      onCheckedChange={checked => updateFeatures('multiStream', checked)}
                    />
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* 4. Other Sports Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between h-12 text-left font-normal hover:bg-green-50 hover:border-green-500 hover:text-gray-900 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Dumbbell className="h-4 w-4 text-green-600" />
                  <span>Weitere Sportarten</span>
                </div>
                <div className="flex items-center gap-2">
                  {filters.otherSports.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {filters.otherSports.length}
                    </Badge>
                  )}
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </div>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[calc(100vw-32px)] sm:w-80 p-4" align="end">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Weitere Sportarten</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                    onClick={() => updateFilters({ otherSports: [] })}
                  >
                    Alle abwählen
                  </Button>
                </div>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {availableOtherSports.map(sport => (
                    <div key={sport} className="flex items-center space-x-2">
                      <Checkbox
                        id={`sport-${sport}`}
                        checked={filters.otherSports.includes(sport)}
                        onCheckedChange={() => toggleOtherSport(sport)}
                      />
                      <label
                        htmlFor={`sport-${sport}`}
                        className="text-sm cursor-pointer flex-1"
                      >
                        {sport}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>

        </div>
      )}
    </div>
  );
};

export default HorizontalFilterBar;
