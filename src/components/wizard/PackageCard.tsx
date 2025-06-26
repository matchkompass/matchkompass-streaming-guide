
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ChevronRight, Check, ExternalLink, Tv, Smartphone, Download, Users } from "lucide-react";
import { StreamingProvider } from "@/hooks/useStreaming";

interface CompetitionCoverage {
  competition: string;
  totalGames: number;
  coveredGames: number;
  coverage: number;
}

interface PackageCardProps {
  type: string;
  coverage: number;
  price: number;
  providers: StreamingProvider[];
  competitions: CompetitionCoverage[];
  totalGames: number;
  coveredGames: number;
  description: string;
  highlight: string;
  isRecommended?: boolean;
}

const PackageCard: React.FC<PackageCardProps> = ({
  type,
  coverage,
  price,
  providers,
  competitions,
  totalGames,
  coveredGames,
  description,
  highlight,
  isRecommended = false
}) => {
  const getCoverageColor = (coverage: number) => {
    if (coverage >= 90) return 'text-green-600';
    if (coverage >= 70) return 'text-orange-600';
    return 'text-red-600';
  };

  const getCoverageBgColor = (coverage: number) => {
    if (coverage >= 90) return 'bg-green-50';
    if (coverage >= 70) return 'bg-orange-50';
    return 'bg-red-50';
  };

  const getFeatureIcon = (feature: string) => {
    switch (feature.toLowerCase()) {
      case '4k': return <Tv className="h-4 w-4" />;
      case 'mobile': return <Smartphone className="h-4 w-4" />;
      case 'download': return <Download className="h-4 w-4" />;
      case 'streams': return <Users className="h-4 w-4" />;
      default: return <Check className="h-4 w-4" />;
    }
  };

  const parseFeatures = (provider: StreamingProvider) => {
    const features = [];
    if (provider.features) {
      try {
        const featureObj = typeof provider.features === 'string' 
          ? JSON.parse(provider.features) 
          : provider.features;
        
        if (featureObj['4K']) features.push('4K');
        if (featureObj.mobile) features.push('Mobile App');
        if (featureObj.streams) features.push(`${featureObj.streams} Streams`);
        if (featureObj.download) features.push('Download');
      } catch (e) {
        // Fallback features
        features.push('HD Streaming', 'Mobile App');
      }
    }
    return features;
  };

  const handleAffiliateClick = (provider: StreamingProvider) => {
    const affiliateUrl = provider.affiliate_url || '#';
    window.open(affiliateUrl, '_blank');
  };

  return (
    <Card className={`relative ${isRecommended ? 'ring-2 ring-green-500 shadow-lg' : 'shadow-md'} hover:shadow-lg transition-shadow`}>
      {isRecommended && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-green-600 text-white px-4 py-1">
            Empfohlen
          </Badge>
        </div>
      )}
      
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              {type}
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-green-600">
              {price.toFixed(2)} €
            </div>
            <div className="text-sm text-gray-500">pro Monat</div>
            <Badge className={isRecommended ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
              {highlight}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Coverage Display */}
        <div className={`p-4 rounded-lg ${getCoverageBgColor(coverage)}`}>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-900">Abdeckung</h4>
            <span className={`text-2xl font-bold ${getCoverageColor(coverage)}`}>
              {coverage}%
            </span>
          </div>
          <Progress value={coverage} className="h-3 mb-2" />
          <p className="text-sm text-gray-600">
            {coveredGames} von {totalGames} Spielen abgedeckt
          </p>
        </div>

        {/* Provider Display */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">
            {providers.length === 1 ? 'Streaming-Anbieter:' : 'Benötigte Anbieter:'}
          </h4>
          
          {providers.length === 1 ? (
            // Single Provider Layout
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl">
                  {providers[0].logo_url ? (
                    <img src={providers[0].logo_url} alt={providers[0].provider_name} className="w-8 h-8 object-contain" />
                  ) : (
                    "📺"
                  )}
                </div>
                <div className="flex-1">
                  <h5 className="font-medium">{providers[0].provider_name}</h5>
                  <p className="text-sm text-gray-600">{providers[0].name}</p>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-green-600">{providers[0].monthly_price}</div>
                  <div className="text-xs text-gray-500">monatlich</div>
                </div>
              </div>
              
              {/* Features */}
              <div>
                <p className="text-sm font-medium mb-2 text-gray-700">Features:</p>
                <div className="flex flex-wrap gap-2">
                  {parseFeatures(providers[0]).map((feature, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {getFeatureIcon(feature)}
                      <span className="ml-1">{feature}</span>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            // Multiple Providers Layout
            <div className="grid gap-3">
              {providers.map((provider, idx) => (
                <div key={idx} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="text-xl">
                    {provider.logo_url ? (
                      <img src={provider.logo_url} alt={provider.provider_name} className="w-6 h-6 object-contain" />
                    ) : (
                      "📺"
                    )}
                  </div>
                  <div className="flex-1">
                    <h5 className="font-medium text-sm">{provider.provider_name}</h5>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-green-600 text-sm">{provider.monthly_price}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Competition Breakdown */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Wettbewerb-Abdeckung:</h4>
          <div className="space-y-2">
            {competitions.map((comp, idx) => (
              <div key={idx} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded">
                <span className="font-medium">{comp.competition}</span>
                <div className="text-right">
                  <span className={`font-semibold ${
                    comp.coverage === 100 ? 'text-green-600' : 
                    comp.coverage >= 70 ? 'text-orange-600' : 'text-red-600'
                  }`}>
                    {comp.coverage}%
                  </span>
                  <div className="text-xs text-gray-500">
                    {comp.coveredGames}/{comp.totalGames} Spiele
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-4">
          {providers.length === 1 ? (
            <Button 
              className="w-full bg-green-600 hover:bg-green-700 text-lg py-6"
              size="lg"
              onClick={() => handleAffiliateClick(providers[0])}
            >
              Jetzt bei {providers[0].provider_name} bestellen
              <ExternalLink className="ml-2 h-5 w-5" />
            </Button>
          ) : (
            <div className="space-y-2">
              <div className="text-center mb-3">
                <p className="text-sm text-gray-600">Beide Anbieter benötigt:</p>
              </div>
              {providers.map((provider, idx) => (
                <Button 
                  key={idx}
                  variant="outline"
                  className="w-full border-green-300 text-green-700 hover:bg-green-50"
                  onClick={() => handleAffiliateClick(provider)}
                >
                  {provider.provider_name} bestellen
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PackageCard;
