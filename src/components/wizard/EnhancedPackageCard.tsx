
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, Check, ExternalLink, Tv, Smartphone, Download, Users, Star } from "lucide-react";
import { StreamingProvider } from "@/hooks/useStreaming";

interface CompetitionCoverage {
  competition: string;
  totalGames: number;
  coveredGames: number;
  coverage: number;
}

interface EnhancedPackageCardProps {
  type: string;
  coverage: number;
  price: number;
  yearlyPrice?: number;
  providers: StreamingProvider[];
  competitions: CompetitionCoverage[];
  totalGames: number;
  coveredGames: number;
  description: string;
  highlight: string;
  isRecommended?: boolean;
  savings?: number;
}

const EnhancedPackageCard: React.FC<EnhancedPackageCardProps> = ({
  type,
  coverage,
  price,
  yearlyPrice,
  providers,
  competitions,
  totalGames,
  coveredGames,
  description,
  highlight,
  isRecommended = false,
  savings
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showYearlyPrice, setShowYearlyPrice] = useState(false);

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
      case '4k': return <Tv className="h-3 w-3" />;
      case 'mobile': return <Smartphone className="h-3 w-3" />;
      case 'download': return <Download className="h-3 w-3" />;
      case 'streams': return <Users className="h-3 w-3" />;
      default: return <Check className="h-3 w-3" />;
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
        features.push('HD Streaming', 'Mobile App');
      }
    }
    return features;
  };

  const handleAffiliateClick = (provider: StreamingProvider) => {
    const affiliateUrl = provider.affiliate_url || '#';
    window.open(affiliateUrl, '_blank');
  };

  const displayPrice = showYearlyPrice && yearlyPrice ? yearlyPrice / 12 : price;
  const priceLabel = showYearlyPrice && yearlyPrice ? 'jährlich (monatlich umgerechnet)' : 'monatlich';

  return (
    <Card className={`relative ${isRecommended ? 'ring-2 ring-green-500 shadow-lg' : 'shadow-md'} hover:shadow-lg transition-all duration-200`}>
      {isRecommended && (
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-10">
          <Badge className="bg-green-600 text-white px-3 py-1 flex items-center">
            <Star className="h-3 w-3 mr-1" />
            Empfohlen
          </Badge>
        </div>
      )}
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-bold">{type}</CardTitle>
            <p className="text-sm text-gray-600 mt-1">{description}</p>
            {savings && savings > 0 && (
              <Badge className="mt-2 bg-orange-100 text-orange-800 text-xs">
                Spart {savings.toFixed(2)}€/Monat
              </Badge>
            )}
          </div>
          <div className="text-right ml-4">
            <div className="flex items-center space-x-2 mb-1">
              {yearlyPrice && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowYearlyPrice(!showYearlyPrice)}
                  className="text-xs px-2 py-1 h-auto"
                >
                  {showYearlyPrice ? 'Monatlich' : 'Jährlich'}
                </Button>
              )}
            </div>
            <div className="text-2xl font-bold text-green-600">
              {displayPrice.toFixed(2)} €
            </div>
            <div className="text-xs text-gray-500">{priceLabel}</div>
            <Badge className={isRecommended ? 'bg-green-100 text-green-800 text-xs' : 'bg-blue-100 text-blue-800 text-xs'}>
              {highlight}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Compact Coverage Display */}
        <div className={`p-3 rounded-lg ${getCoverageBgColor(coverage)}`}>
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-sm">Abdeckung</h4>
            <span className={`text-xl font-bold ${getCoverageColor(coverage)}`}>
              {coverage}%
            </span>
          </div>
          <Progress value={coverage} className="h-2 mb-1" />
          <p className="text-xs text-gray-600">
            {coveredGames} von {totalGames} Spielen
          </p>
        </div>

        {/* Compact Provider Display */}
        <div>
          <h4 className="font-medium text-sm mb-2">
            {providers.length === 1 ? 'Anbieter:' : `${providers.length} Anbieter:`}
          </h4>
          
          <div className="grid gap-2">
            {providers.map((provider, idx) => (
              <div key={idx} className="flex items-center space-x-2 p-2 bg-gray-50 rounded text-sm">
                <div className="text-lg">
                  {provider.logo_url ? (
                    <img src={provider.logo_url} alt={provider.provider_name} className="w-5 h-5 object-contain" />
                  ) : (
                    "📺"
                  )}
                </div>
                <div className="flex-1">
                  <span className="font-medium">{provider.provider_name}</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-green-600">{provider.monthly_price}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Expandable Details */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-2 h-auto">
              <span className="text-sm">Details anzeigen</span>
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3">
            {/* Features for each provider */}
            {providers.map((provider, idx) => (
              <div key={idx} className="space-y-2">
                <h5 className="font-medium text-sm">{provider.provider_name} Features:</h5>
                <div className="flex flex-wrap gap-1">
                  {parseFeatures(provider).map((feature, featureIdx) => (
                    <Badge key={featureIdx} variant="outline" className="text-xs">
                      {getFeatureIcon(feature)}
                      <span className="ml-1">{feature}</span>
                    </Badge>
                  ))}
                </div>
              </div>
            ))}

            {/* Competition Breakdown */}
            <div>
              <h5 className="font-medium text-sm mb-2">Liga-Abdeckung:</h5>
              <div className="space-y-1">
                {competitions.slice(0, 5).map((comp, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs p-1 bg-gray-50 rounded">
                    <span>{comp.competition}</span>
                    <div className="text-right">
                      <span className={`font-medium ${
                        comp.coverage === 100 ? 'text-green-600' : 
                        comp.coverage >= 70 ? 'text-orange-600' : 'text-red-600'
                      }`}>
                        {comp.coverage}%
                      </span>
                      <div className="text-gray-500">
                        {comp.coveredGames}/{comp.totalGames}
                      </div>
                    </div>
                  </div>
                ))}
                {competitions.length > 5 && (
                  <div className="text-xs text-gray-500 text-center">
                    +{competitions.length - 5} weitere Ligen
                  </div>
                )}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          {providers.length === 1 ? (
            <Button 
              className="w-full bg-green-600 hover:bg-green-700"
              onClick={() => handleAffiliateClick(providers[0])}
            >
              Jetzt bestellen
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <div className="space-y-2">
              <div className="text-center mb-2">
                <p className="text-xs text-gray-600">Beide Anbieter benötigt:</p>
              </div>
              {providers.map((provider, idx) => (
                <Button 
                  key={idx}
                  variant="outline"
                  size="sm"
                  className="w-full border-green-300 text-green-700 hover:bg-green-50 text-xs"
                  onClick={() => handleAffiliateClick(provider)}
                >
                  {provider.provider_name}
                  <ExternalLink className="ml-2 h-3 w-3" />
                </Button>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedPackageCard;
