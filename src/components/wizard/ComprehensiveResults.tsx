import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { EnhancedProviderRecommendation } from '@/utils/enhancedCoverageCalculator';
import { ExternalLink, Star, Info, ChevronDown, ChevronUp } from 'lucide-react';

interface ComprehensiveResultsProps {
  recommendations: EnhancedProviderRecommendation[];
  allCombinations: EnhancedProviderRecommendation[];
}

const ComprehensiveResults: React.FC<ComprehensiveResultsProps> = ({ 
  recommendations, 
  allCombinations 
}) => {
  const [showAllCombinations, setShowAllCombinations] = useState(false);
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());

  const toggleCardExpansion = (index: number) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedCards(newExpanded);
  };

  const displayedCombinations = showAllCombinations ? allCombinations : recommendations;

  const getCoverageColor = (coverage: number) => {
    if (coverage >= 95) return 'text-green-600 bg-green-100';
    if (coverage >= 85) return 'text-blue-600 bg-blue-100';
    if (coverage >= 70) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getPriceColor = (price: number) => {
    if (price <= 25) return 'text-green-600';
    if (price <= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Deine optimalen Streaming-Pakete
          </h2>
          <p className="text-gray-600 mb-6">
            {showAllCombinations ? 
              `Alle ${allCombinations.length} möglichen Kombinationen` : 
              `Top ${recommendations.length} Empfehlungen`
            }
          </p>
        </div>

        {/* Toggle Button */}
        <div className="text-center">
          <Button
            variant="outline"
            onClick={() => setShowAllCombinations(!showAllCombinations)}
            className="flex items-center gap-2"
          >
            {showAllCombinations ? (
              <>
                <ChevronUp className="h-4 w-4" />
                Top Empfehlungen anzeigen
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                Alle {allCombinations.length} Kombinationen anzeigen
              </>
            )}
          </Button>
        </div>

        {/* Package Cards */}
        <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {displayedCombinations.map((pkg, index) => {
            const isExpanded = expandedCards.has(index);
            const isTopRecommendation = !showAllCombinations && index === 0;

            return (
              <Card
                key={index}
                className={`relative transition-all duration-200 ${
                  isTopRecommendation 
                    ? 'ring-2 ring-green-500 bg-green-50' 
                    : pkg.coverage >= 90 
                      ? 'ring-1 ring-blue-300 bg-blue-50'
                      : 'hover:shadow-md'
                }`}
              >
                {isTopRecommendation && (
                  <div className="absolute -top-2 -right-2">
                    <Badge className="bg-yellow-500 text-white flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      Empfohlen
                    </Badge>
                  </div>
                )}

                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{pkg.type}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{pkg.description}</p>
                      <Badge variant="outline" className="mt-2 text-xs">
                        {pkg.highlight}
                      </Badge>
                    </div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleCardExpansion(index)}
                        >
                          <Info className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Details anzeigen</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Price and Coverage Header */}
                  <div className="flex justify-between items-center">
                    <div>
                      <div className={`text-2xl font-bold ${getPriceColor(pkg.price)}`}>
                        €{pkg.price.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-600">pro Monat</div>
                      {pkg.yearlyPrice && (
                        <div className="text-xs text-green-600">
                          Jahrespreis: €{pkg.yearlyPrice.toFixed(2)}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold px-2 py-1 rounded ${getCoverageColor(pkg.coverage)}`}>
                        {pkg.coverage}%
                      </div>
                      <div className="text-sm text-gray-600">Abdeckung</div>
                    </div>
                  </div>

                  {/* Basic Provider Info */}
                  <div>
                    <h4 className="font-medium text-sm mb-2">
                      {pkg.providers.length > 1 ? 'Anbieter-Kombination:' : 'Anbieter:'}
                    </h4>
                    <div className="space-y-1">
                      {pkg.providers.map((provider, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span>{provider.provider_name}</span>
                          <span className="text-gray-600">
                            €{parseFloat(provider.monthly_price || '0').toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="space-y-4 border-t pt-4">
                      <h4 className="font-medium text-sm">Liga-Abdeckung im Detail:</h4>
                      <div className="grid grid-cols-1 gap-2">
                        {pkg.competitions.map((comp, idx) => (
                          <div key={idx} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {comp.competition.replace('_', ' ')}
                              </span>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="h-3 w-3 text-gray-400 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>
                                    {comp.coveredGames} von {comp.totalGames} Spielen abgedeckt
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-600">
                                {comp.coveredGames}/{comp.totalGames}
                              </span>
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${getCoverageColor(comp.coverage)}`}
                              >
                                {comp.coverage}%
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Additional Stats */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Gesamtspiele:</span>
                          <span className="font-medium ml-2">{pkg.totalGames}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Abgedeckt:</span>
                          <span className="font-medium ml-2">{pkg.coveredGames}</span>
                        </div>
                        {pkg.costPerGame && (
                          <div className="col-span-2">
                            <span className="text-gray-600">Kosten pro Spiel:</span>
                            <span className="font-medium ml-2">€{pkg.costPerGame.toFixed(2)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  <Button 
                    className={`w-full mt-4 ${
                      isTopRecommendation 
                        ? "bg-green-600 hover:bg-green-700" 
                        : ""
                    }`}
                    variant={isTopRecommendation ? "default" : "outline"}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Jetzt abschließen
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Summary Statistics */}
        {displayedCombinations.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="font-semibold mb-4">Zusammenfassung</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-gray-600">Günstigste Option:</div>
                <div className="font-medium">
                  €{Math.min(...displayedCombinations.map(c => c.price)).toFixed(2)}/Monat
                </div>
              </div>
              <div>
                <div className="text-gray-600">Beste Abdeckung:</div>
                <div className="font-medium">
                  {Math.max(...displayedCombinations.map(c => c.coverage))}%
                </div>
              </div>
              <div>
                <div className="text-gray-600">Durchschnittspreis:</div>
                <div className="font-medium">
                  €{(displayedCombinations.reduce((sum, c) => sum + c.price, 0) / displayedCombinations.length).toFixed(2)}/Monat
                </div>
              </div>
              <div>
                <div className="text-gray-600">Optionen angezeigt:</div>
                <div className="font-medium">
                  {displayedCombinations.length} von {allCombinations.length}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};

export default ComprehensiveResults;