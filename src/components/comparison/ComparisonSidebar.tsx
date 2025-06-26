
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { X, Filter } from "lucide-react";

interface ComparisonFilters {
  competitions: string[];
  priceRange: [number, number];
  features: {
    fourK: boolean;
    mobile: boolean;
    download: boolean;
    multiStream: boolean;
  };
  simultaneousStreams: number;
  sortBy: string;
}

interface ComparisonSidebarProps {
  filters: ComparisonFilters;
  onFiltersChange: (filters: ComparisonFilters) => void;
  availableCompetitions: string[];
  isOpen: boolean;
  onClose: () => void;
}

const ComparisonSidebar: React.FC<ComparisonSidebarProps> = ({
  filters,
  onFiltersChange,
  availableCompetitions,
  isOpen,
  onClose
}) => {
  const competitionCategories = {
    'Deutschland': ['Bundesliga', '2. Bundesliga', 'DFB-Pokal'],
    'Europa': ['Champions League', 'Europa League', 'Conference League'],
    'International': ['Premier League', 'La Liga', 'Serie A', 'Ligue 1', 'FA Cup', 'Copa del Rey']
  };

  const updateFilters = (updates: Partial<ComparisonFilters>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const updateFeatures = (feature: keyof ComparisonFilters['features'], value: boolean) => {
    updateFilters({
      features: { ...filters.features, [feature]: value }
    });
  };

  const toggleCompetition = (competition: string) => {
    const newCompetitions = filters.competitions.includes(competition)
      ? filters.competitions.filter(c => c !== competition)
      : [...filters.competitions, competition];
    updateFilters({ competitions: newCompetitions });
  };

  const toggleAllInCategory = (category: string, competitions: string[]) => {
    const allSelected = competitions.every(comp => filters.competitions.includes(comp));
    const newCompetitions = allSelected
      ? filters.competitions.filter(c => !competitions.includes(c))
      : [...new Set([...filters.competitions, ...competitions])];
    updateFilters({ competitions: newCompetitions });
  };

  const clearAllFilters = () => {
    updateFilters({
      competitions: [],
      priceRange: [0, 100],
      features: { fourK: false, mobile: false, download: false, multiStream: false },
      simultaneousStreams: 1,
      sortBy: 'relevance'
    });
  };

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
            <h4 className="font-medium mb-3">Preisspanne</h4>
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

          {/* Sort Options */}
          <div>
            <h4 className="font-medium mb-3">Sortierung</h4>
            <Select value={filters.sortBy} onValueChange={(value) => updateFilters({ sortBy: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Nach Relevanz</SelectItem>
                <SelectItem value="price-asc">Preis aufsteigend</SelectItem>
                <SelectItem value="price-desc">Preis absteigend</SelectItem>
                <SelectItem value="coverage">Nach Abdeckung</SelectItem>
                <SelectItem value="popularity">Nach Beliebtheit</SelectItem>
              </SelectContent>
            </Select>
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

          {/* Simultaneous Streams */}
          <div>
            <h4 className="font-medium mb-3">Gleichzeitige Streams</h4>
            <div className="px-2">
              <Slider
                value={[filters.simultaneousStreams]}
                onValueChange={(value) => updateFilters({ simultaneousStreams: value[0] })}
                max={4}
                min={1}
                step={1}
                className="mb-2"
              />
              <div className="text-center text-sm text-gray-600">
                {filters.simultaneousStreams} Stream{filters.simultaneousStreams > 1 ? 's' : ''}
              </div>
            </div>
          </div>

          {/* Competitions */}
          <div>
            <h4 className="font-medium mb-3">Wettbewerbe</h4>
            <div className="space-y-4">
              {Object.entries(competitionCategories).map(([category, competitions]) => (
                <div key={category}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium flex items-center">
                      {category === 'Deutschland' ? '🇩🇪' : category === 'Europa' ? '🇪🇺' : '🌍'}
                      <span className="ml-2">{category}</span>
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs px-2 py-1 h-auto"
                      onClick={() => toggleAllInCategory(category, competitions)}
                    >
                      {competitions.every(comp => filters.competitions.includes(comp)) ? 'Alle ab' : 'Alle'}
                    </Button>
                  </div>
                  <div className="space-y-2 pl-2">
                    {competitions.map((competition) => (
                      <div key={competition} className="flex items-center space-x-2">
                        <Checkbox
                          id={competition}
                          checked={filters.competitions.includes(competition)}
                          onCheckedChange={() => toggleCompetition(competition)}
                        />
                        <label htmlFor={competition} className="text-sm cursor-pointer flex-1">
                          {competition}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Filters Summary */}
          {(filters.competitions.length > 0 || filters.features.fourK || filters.features.mobile || 
            filters.features.download || filters.features.multiStream) && (
            <div>
              <h4 className="font-medium mb-2">Aktive Filter</h4>
              <div className="flex flex-wrap gap-1">
                {filters.competitions.slice(0, 3).map((comp) => (
                  <Badge key={comp} variant="secondary" className="text-xs">
                    {comp}
                  </Badge>
                ))}
                {filters.competitions.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{filters.competitions.length - 3}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ComparisonSidebar;
