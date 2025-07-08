
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExternalLink, Star, Trophy, Award } from 'lucide-react';
import HighlightBadge from '@/components/ui/highlight-badge';
import { StreamingProviderEnhanced } from '@/hooks/useStreamingEnhanced';

interface EnhancedOptimizationResult {
  providers: StreamingProviderEnhanced[];
  totalCost: number;
  coveragePercentage: number;
  coveredLeagues: number;
  totalLeagues: number;
  costPerGame?: number;
  rank: number;
  type: 'combination' | 'individual';
}

interface EnhancedOptimizationResultsProps {
  results: EnhancedOptimizationResult[];
  individualProviders: EnhancedOptimizationResult[];
}

const EnhancedOptimizationResults: React.FC<EnhancedOptimizationResultsProps> = ({ 
  results, 
  individualProviders 
}) => {
  const [selectedTab, setSelectedTab] = useState('combinations');

  const parsePrice = (priceString?: string): number => {
    if (!priceString) return 0;
    return parseFloat(priceString.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
  };

  const getResultTypeIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="h-4 w-4 text-yellow-500" />;
      case 2: return <Award className="h-4 w-4 text-gray-400" />;
      case 3: return <Star className="h-4 w-4 text-amber-600" />;
      default: return null;
    }
  };

  const getResultTypeLabel = (rank: number, coverage: number) => {
    if (rank === 1) return 'Beste Lösung';
    if (coverage >= 95) return 'Premium';
    if (coverage >= 80) return 'Optimal';
    if (coverage >= 60) return 'Budget';
    return 'Basic';
  };

  const ResultCard: React.FC<{ result: EnhancedOptimizationResult; showRank?: boolean }> = ({ 
    result, 
    showRank = true 
  }) => (
    <Card className={`relative ${result.rank <= 3 ? 'ring-2 ring-green-500 bg-green-50' : ''}`}>
      {showRank && result.rank <= 3 && (
        <div className="absolute -top-2 -right-2">
          <Badge className="bg-green-500 text-white flex items-center gap-1">
            {getResultTypeIcon(result.rank)}
            #{result.rank}
          </Badge>
        </div>
      )}

      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>{getResultTypeLabel(result.rank, result.coveragePercentage)}</span>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">
              €{result.totalCost.toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">pro Monat</div>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Coverage and Cost Info */}
        <div className="flex justify-between items-center">
          <div>
            <div className={`text-2xl font-bold ${
              result.coveragePercentage >= 90 ? 'text-green-600' : 
              result.coveragePercentage >= 70 ? 'text-orange-600' : 'text-red-600'
            }`}>
              {result.coveragePercentage}%
            </div>
            <div className="text-sm text-gray-600">Abdeckung</div>
          </div>
          {result.costPerGame && (
            <div className="text-right">
              <div className="text-lg font-medium">
                €{result.costPerGame.toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">pro Spiel</div>
            </div>
          )}
        </div>

        {/* Providers */}
        <div>
          <h4 className="font-medium text-sm mb-3">
            {result.type === 'combination' ? 'Anbieter-Kombination:' : 'Anbieter:'}
          </h4>
          <div className="space-y-3">
            {result.providers.map((provider, idx) => (
              <div key={idx} className="border rounded-lg p-3">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    {provider.logo_url ? (
                      <img src={provider.logo_url} alt={provider.provider_name} 
                           className="w-6 h-6 object-contain" />
                    ) : (
                      <div className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center text-xs">
                        📺
                      </div>
                    )}
                    <span className="font-medium">{provider.provider_name}</span>
                  </div>
                  <span className="text-sm text-gray-600">
                    €{parsePrice(provider.monthly_price).toFixed(2)}
                  </span>
                </div>

                {/* Provider Highlights */}
                <div className="flex flex-wrap gap-1 mb-2">
                  {provider.highlights.highlight_1 && (
                    <HighlightBadge 
                      text={provider.highlights.highlight_1} 
                      priority="primary" 
                    />
                  )}
                  {provider.highlights.highlight_2 && (
                    <HighlightBadge 
                      text={provider.highlights.highlight_2} 
                      priority="secondary" 
                    />
                  )}
                  {provider.highlights.highlight_3 && (
                    <HighlightBadge 
                      text={provider.highlights.highlight_3} 
                      priority="tertiary" 
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Coverage Details */}
        <div className="text-sm text-gray-600 pt-2 border-t">
          <div className="flex justify-between">
            <span>Abgedeckte Ligen:</span>
            <span>{result.coveredLeagues} von {result.totalLeagues}</span>
          </div>
          <div className="flex justify-between">
            <span>Jahreskosten:</span>
            <span>€{(result.totalCost * 12).toFixed(2)}</span>
          </div>
        </div>

        {/* Action Button */}
        <Button className="w-full mt-4 bg-green-600 hover:bg-green-700">
          <ExternalLink className="h-4 w-4 mr-2" />
          Jetzt abschließen
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="combinations">
            Anbieter-Kombinationen ({results.length})
          </TabsTrigger>
          <TabsTrigger value="individual">
            Einzelanbieter (Top 20)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="combinations" className="space-y-4">
          <div className="text-sm text-gray-600 mb-4">
            Sortiert nach Abdeckung (primär) und Preis (sekundär). Maximale Transparenz mit allen möglichen Kombinationen.
          </div>
          <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {results.map((result, index) => (
              <ResultCard key={index} result={result} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="individual" className="space-y-4">
          <div className="text-sm text-gray-600 mb-4">
            Top 20 Streaming-Anbieter nach Abdeckung der gewählten Ligen sortiert.
          </div>
          <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {individualProviders.slice(0, 20).map((result, index) => (
              <ResultCard key={index} result={result} showRank={index < 3} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedOptimizationResults;
