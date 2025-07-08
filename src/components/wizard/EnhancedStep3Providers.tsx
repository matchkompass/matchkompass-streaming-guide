
import { useState } from "react";
import { Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StreamingProviderEnhanced } from "@/hooks/useStreamingEnhanced";
import HighlightBadge from "@/components/ui/highlight-badge";

interface EnhancedStep3ProvidersProps {
  providers: StreamingProviderEnhanced[];
  existingProviders: number[];
  onToggleProvider: (providerId: number) => void;
}

const EnhancedStep3Providers = ({ 
  providers, 
  existingProviders, 
  onToggleProvider 
}: EnhancedStep3ProvidersProps) => {
  // Group providers by provider_name
  const providerGroups = providers.reduce((acc, provider) => {
    const groupName = provider.provider_name || 'Other';
    if (!acc[groupName]) {
      acc[groupName] = [];
    }
    acc[groupName].push(provider);
    return acc;
  }, {} as Record<string, StreamingProviderEnhanced[]>);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Bestehende Abonnements
        </h2>
        <p className="text-gray-600 mb-6">
          Welche Streaming-Dienste nutzt du bereits?
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={existingProviders.length === 0}
            onChange={() => {
              if (existingProviders.length > 0) {
                // Clear all existing providers
                existingProviders.forEach(id => onToggleProvider(id));
              }
            }}
            className="mr-2"
          />
          <span className="font-medium">Ich habe noch kein Streaming-Abonnement</span>
        </label>
      </div>

      <div className="space-y-8">
        {Object.entries(providerGroups)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([groupName, groupProviders]) => (
            <div key={groupName} className="space-y-4">
              <div className="flex items-center gap-3 border-b pb-2">
                {/* Provider Group Logo - use first provider's logo */}
                {groupProviders[0]?.logo_url ? (
                  <img 
                    src={groupProviders[0].logo_url} 
                    alt={groupName} 
                    className="w-8 h-8 object-contain" 
                  />
                ) : (
                  <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center text-sm">
                    📺
                  </div>
                )}
                <h3 className="text-xl font-semibold text-gray-800">{groupName}</h3>
                <Badge variant="secondary" className="text-xs">
                  {groupProviders.length} {groupProviders.length === 1 ? 'Paket' : 'Pakete'}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupProviders
                  .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
                  .map((provider) => (
                    <Card
                      key={provider.streamer_id}
                      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                        existingProviders.includes(provider.streamer_id)
                          ? 'ring-2 ring-blue-500 bg-blue-50'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => onToggleProvider(provider.streamer_id)}
                    >
                      <CardContent className="p-4">
                        <div className="text-center">
                          <div className="mb-3">
                            {provider.logo_url ? (
                              <img 
                                src={provider.logo_url} 
                                alt={provider.name || provider.provider_name} 
                                className="w-12 h-12 mx-auto object-contain" 
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gray-200 rounded-lg mx-auto flex items-center justify-center">
                                📺
                              </div>
                            )}
                          </div>
                          
                          <h4 className="font-medium text-sm mb-2 min-h-[2.5rem] flex items-center justify-center">
                            {provider.name || provider.provider_name}
                          </h4>
                          
                          <div className="mb-3">
                            <p className="text-sm font-semibold text-green-600">
                              {provider.monthly_price}/Monat
                            </p>
                            {provider.yearly_price && (
                              <p className="text-xs text-gray-500">
                                {provider.yearly_price}/Jahr
                              </p>
                            )}
                          </div>

                          {/* Highlights */}
                          <div className="flex flex-wrap gap-1 justify-center mb-3 min-h-[4rem]">
                            {provider.highlights.highlight_1 && (
                              <HighlightBadge
                                text={provider.highlights.highlight_1}
                                priority="primary"
                                tooltip={true}
                                className="text-xs"
                              />
                            )}
                            {provider.highlights.highlight_2 && (
                              <HighlightBadge
                                text={provider.highlights.highlight_2}
                                priority="secondary"
                                tooltip={true}
                                className="text-xs"
                              />
                            )}
                            {provider.highlights.highlight_3 && (
                              <HighlightBadge
                                text={provider.highlights.highlight_3}
                                priority="tertiary"
                                tooltip={true}
                                className="text-xs"
                              />
                            )}
                          </div>
                          
                          {existingProviders.includes(provider.streamer_id) && (
                            <div className="mt-2">
                              <Check className="h-5 w-5 text-blue-600 mx-auto" />
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          ))}
      </div>

      {existingProviders.length > 0 && (
        <div className="text-center">
          <Badge className="bg-blue-100 text-blue-800">
            {existingProviders.length} Anbieter bereits vorhanden
          </Badge>
        </div>
      )}
    </div>
  );
};

export default EnhancedStep3Providers;
