
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
  const [expanded, setExpanded] = useState(existingProviders.length === 0);

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
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-800">Streaming-Anbieter</h3>
          {existingProviders.length > 0 && (
            <button
              className="text-blue-600 text-xs underline"
              onClick={() => setExpanded(e => !e)}
            >
              {expanded ? 'Liste einklappen' : 'Liste anzeigen'}
            </button>
          )}
        </div>
        {expanded && (
          <div className="flex flex-col gap-2">
            {providers
              .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
              .map((provider) => (
                <Card
                  key={provider.streamer_id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md w-full max-w-lg mx-auto ${
                    existingProviders.includes(provider.streamer_id)
                      ? 'ring-2 ring-blue-500 bg-blue-50'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => onToggleProvider(provider.streamer_id)}
                >
                  <CardContent className="p-2 flex items-center gap-3">
                    <div className="text-2xl">
                      {provider.logo_url ? (
                        <img 
                          src={provider.logo_url} 
                          alt={provider.name || provider.provider_name} 
                          className="w-8 h-8 object-contain" 
                        />
                      ) : (
                        <span role="img" aria-label="Provider">📺</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-xs mb-1 line-clamp-2">{provider.name || provider.provider_name}</h4>
                      <p className="text-xxs font-semibold text-green-600">{provider.monthly_price}/Monat</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {provider.highlights.highlight_1 && (
                          <HighlightBadge
                            text={provider.highlights.highlight_1}
                            priority="primary"
                            tooltip={true}
                            className="text-[10px] px-1 py-0.5"
                          />
                        )}
                        {provider.highlights.highlight_2 && (
                          <HighlightBadge
                            text={provider.highlights.highlight_2}
                            priority="secondary"
                            tooltip={true}
                            className="text-[10px] px-1 py-0.5"
                          />
                        )}
                      </div>
                    </div>
                    {existingProviders.includes(provider.streamer_id) && (
                      <Check className="h-4 w-4 text-blue-600" />
                    )}
                  </CardContent>
                </Card>
              ))}
          </div>
        )}
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
