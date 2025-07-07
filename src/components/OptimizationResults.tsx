import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { OptimizationResult } from '@/lib/StreamingOptimizer';
import { ExternalLink, Star } from 'lucide-react';

interface OptimizationResultsProps {
  results: OptimizationResult[];
}

export default function OptimizationResults({ results }: OptimizationResultsProps) {
  const getPackageType = (coverage: number) => {
    if (coverage >= 100) return 'Maximale Abdeckung';
    if (coverage >= 90) return 'Optimaler Mix';
    return 'Budget-Option';
  };

  const getPackageDescription = (coverage: number) => {
    if (coverage >= 100) return 'Alle Ihre Spiele, keine Kompromisse';
    if (coverage >= 90) return 'Beste Balance aus Preis und Abdeckung';
    return 'Grundsolide Abdeckung zu kleinem Preis';
  };

  return (
    <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-4">
      {results.map((result, index) => (
        <Card
          key={index}
          className={`relative ${
            result.coveragePercentage >= 100
              ? 'ring-2 ring-green-500 bg-green-50'
              : result.coveragePercentage >= 90
              ? 'ring-2 ring-blue-500 bg-blue-50'
              : 'ring-2 ring-orange-500 bg-orange-50'
          }`}
        >
          {index === 0 && (
            <div className="absolute -top-2 -right-2">
              <Badge className="bg-yellow-500 text-white flex items-center gap-1">
                <Star className="h-3 w-3" />
                Empfohlen
              </Badge>
            </div>
          )}

          <CardHeader className="pb-3">
            <CardTitle className="text-lg">
              {getPackageType(result.coveragePercentage)}
            </CardTitle>
            <p className="text-sm text-gray-600">
              {getPackageDescription(result.coveragePercentage)}
            </p>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Price and Coverage */}
            <div className="flex justify-between items-center">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  €{result.totalCost.toFixed(2)}
                </div>
                <div className="text-sm text-gray-600">pro Monat</div>
              </div>
              <div className="text-right">
                <div className={`text-2xl font-bold ${
                  result.coveragePercentage >= 90 ? 'text-green-600' : 
                  result.coveragePercentage >= 70 ? 'text-orange-600' : 'text-red-600'
                }`}>
                  {result.coveragePercentage}%
                </div>
                <div className="text-sm text-gray-600">Abdeckung</div>
              </div>
            </div>

            {/* Providers */}
            <div>
              <h4 className="font-medium text-sm mb-2">Anbieter:</h4>
              <div className="space-y-1">
                {result.providers.map((provider, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span>{provider.provider_name}</span>
                    <span className="text-gray-600">
                      €{parseFloat(provider.monthly_price || '0').toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Coverage Details */}
            <div className="text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Abgedeckte Ligen:</span>
                <span>{result.coveredLeagues} von {result.totalLeagues}</span>
              </div>
            </div>

            {/* Yearly Savings */}
            <div className="pt-2 border-t">
              <div className="text-sm text-green-600 font-medium">
                Jahrespreis: €{(result.totalCost * 12).toFixed(2)}
              </div>
            </div>

            {/* Action Button */}
            <Button 
              className="w-full mt-4"
              variant={index === 0 ? "default" : "outline"}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Jetzt abschließen
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}