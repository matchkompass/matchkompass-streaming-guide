
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Club } from "@/hooks/useClubs";
import { StreamingProviderEnhanced } from "@/hooks/useStreamingEnhanced";
import { LeagueEnhanced } from "@/hooks/useLeaguesEnhanced";

interface ProviderRecommendation {
  scenario: string;
  providers: StreamingProviderEnhanced[];
  totalCost: number;
  coveragePercentage: number;
}
import HighlightBadge from "@/components/ui/highlight-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

interface EnhancedStep4ResultsProps {
  selectedClubs: Club[];
  selectedCompetitions: string[];
  existingProviders: number[];
  providers: StreamingProviderEnhanced[];
  leagues: LeagueEnhanced[];
}

const EnhancedStep4Results = ({
  selectedClubs,
  selectedCompetitions,
  existingProviders,
  providers,
  leagues
}: EnhancedStep4ResultsProps) => {
  const recommendations = useMemo(() => {
    if (selectedClubs.length === 0 || selectedCompetitions.length === 0 || providers.length === 0) {
      return [];
    }
    
    const availableProviders = providers.filter(p => !existingProviders.includes(p.streamer_id));
    
    // Calculate best combinations for 100%, 90%, and 66% coverage
    const combinations: ProviderRecommendation[] = [
      {
        scenario: "Optimale Abdeckung (100%)",
        providers: availableProviders.slice(0, 2), // Simple mock for now
        totalCost: 45.99,
        coveragePercentage: 100
      },
      {
        scenario: "Gutes Preis-Leistungs-Verhältnis (90%)",
        providers: availableProviders.slice(0, 1),
        totalCost: 29.99,
        coveragePercentage: 90
      },
      {
        scenario: "Budget-Option (66%)",
        providers: availableProviders.slice(0, 1),
        totalCost: 19.99,
        coveragePercentage: 66
      }
    ];
    
    return combinations;
  }, [selectedClubs, selectedCompetitions, providers, leagues, existingProviders]);

  const parsePrice = (priceString?: string): number => {
    if (!priceString) return 0;
    return parseFloat(priceString.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
  };

  const getProviderCoverage = (provider: StreamingProviderEnhanced, leagueSlug: string) => {
    const league = leagues.find(l => l.league_slug === leagueSlug);
    const totalGames = league?.['number of games'] || 0;
    const coveredGames = (provider[leagueSlug as keyof StreamingProviderEnhanced] as number) || 0;
    const percentage = totalGames > 0 ? Math.round((coveredGames / totalGames) * 100) : 0;
    
    return { coveredGames, totalGames, percentage };
  };

  const getCellBackgroundColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-100 text-green-800';
    if (percentage >= 70) return 'bg-yellow-100 text-yellow-800';
    if (percentage >= 50) return 'bg-orange-100 text-orange-800';
    if (percentage > 0) return 'bg-red-100 text-red-800';
    return 'bg-gray-50 text-gray-500';
  };

  if (recommendations.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Keine Empfehlungen verfügbar. Bitte wähle Vereine und Wettbewerbe aus.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Deine optimalen Streaming-Pakete
        </h2>
        <p className="text-gray-600 mb-6">
          Hier sind die besten Kombinationen für deine Auswahl
        </p>
      </div>

      <Tabs defaultValue="recommendations" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="recommendations">Top Empfehlungen</TabsTrigger>
          <TabsTrigger value="providers">Provider Details</TabsTrigger>
          <TabsTrigger value="comparison">Vergleichstabelle</TabsTrigger>
        </TabsList>

        <TabsContent value="recommendations" className="space-y-4">
          {recommendations.map((rec, index) => (
            <Card key={index} className={index === 0 ? "border-2 border-green-500" : ""}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    {index === 0 && "🏆"} {rec.scenario}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge className={index === 0 ? "bg-green-500" : "bg-blue-500"}>
                      {rec.coveragePercentage}% Abdeckung
                    </Badge>
                    <span className="font-bold text-lg text-green-600">
                      {rec.totalCost.toFixed(2)}€/Monat
                    </span>
                  </div>
                </div>
                <Progress value={rec.coveragePercentage} className="h-2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {rec.providers.map((provider, pIndex) => (
                    <div key={pIndex} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {provider.logo_url && (
                          <img src={provider.logo_url} alt={provider.name} className="w-8 h-8 object-contain" />
                        )}
                        <div>
                          <p className="font-medium">{provider.name}</p>
                          <div className="flex gap-1 mt-1">
                           {provider.highlights.highlight_1 && (
                               <HighlightBadge text={provider.highlights.highlight_1} priority="primary" className="text-xs" />
                             )}
                             {provider.highlights.highlight_2 && (
                               <HighlightBadge text={provider.highlights.highlight_2} priority="secondary" className="text-xs" />
                             )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{parsePrice(provider.monthly_price).toFixed(2)}€/Monat</p>
                        <Button 
                          size="sm" 
                          className="mt-1"
                          onClick={() => window.open(provider.affiliate_url, '_blank')}
                        >
                          Jetzt buchen
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="providers" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {providers
              .filter(p => !existingProviders.includes(p.streamer_id))
              .slice(0, 12)
              .map((provider) => {
                const totalCoverage = selectedCompetitions.reduce((sum, comp) => {
                  const coverage = getProviderCoverage(provider, comp);
                  return sum + coverage.percentage;
                }, 0) / selectedCompetitions.length;

                return (
                  <Card key={provider.streamer_id} className="h-full">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2 mb-2">
                        {provider.logo_url && (
                          <img src={provider.logo_url} alt={provider.provider_name} className="w-8 h-8 object-contain" />
                        )}
                        <CardTitle className="text-lg">{provider.provider_name}</CardTitle>
                      </div>
                      <Badge className="bg-blue-500 w-fit">
                        {Math.round(totalCoverage)}% Abdeckung
                      </Badge>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        <div>
                           <p className="font-semibold text-green-600">{provider.monthly_price}/Monat</p>
                           {provider.yearly_price && (
                             <p className="text-sm text-gray-500">{provider.yearly_price}/Jahr</p>
                           )}
                         </div>
                         
                         {/* League Coverage Details like in /vergleich */}
                         <div className="space-y-2 mt-3">
                           <h4 className="text-sm font-semibold text-gray-700">Liga-Abdeckung:</h4>
                           {selectedCompetitions.slice(0, 4).map(leagueSlug => {
                             const league = leagues.find(l => l.league_slug === leagueSlug);
                             const coverage = getProviderCoverage(provider, leagueSlug);
                             const isNotFullCoverage = coverage.percentage < 100;
                             
                             return (
                               <div key={leagueSlug} className="flex items-center justify-between text-xs">
                                 <div className="flex items-center gap-1">
                                   <span>{league?.league || leagueSlug}</span>
                                   {isNotFullCoverage && <span className="text-orange-500">⚠️</span>}
                                 </div>
                                 <span className={`font-medium ${coverage.percentage >= 90 ? 'text-green-600' : coverage.percentage >= 50 ? 'text-orange-600' : 'text-red-600'}`}>
                                   {coverage.percentage}% ({coverage.coveredGames}/{coverage.totalGames})
                                 </span>
                               </div>
                             );
                           })}
                         </div>
                        
                         <div className="space-y-1">
                           {provider.highlights.highlight_1 && (
                             <HighlightBadge text={provider.highlights.highlight_1} priority="primary" className="text-xs" />
                           )}
                           {provider.highlights.highlight_2 && (
                             <HighlightBadge text={provider.highlights.highlight_2} priority="secondary" className="text-xs" />
                           )}
                           {provider.highlights.highlight_3 && (
                             <HighlightBadge text={provider.highlights.highlight_3} priority="tertiary" className="text-xs" />
                           )}
                         </div>

                        <Button 
                          size="sm" 
                          className="w-full"
                          onClick={() => window.open(provider.affiliate_url, '_blank')}
                        >
                          Details ansehen
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        </TabsContent>

        <TabsContent value="comparison">
          <Card>
            <CardHeader>
              <CardTitle>Vergleichstabelle</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="sticky left-0 bg-white border-r">Anbieter</TableHead>
                      <TableHead>Monatspreis</TableHead>
                      {selectedCompetitions.slice(0, 4).map(comp => {
                        const league = leagues.find(l => l.league_slug === comp);
                        return (
                          <TableHead key={comp} className="text-center min-w-32">
                            {league?.league || comp}
                          </TableHead>
                        );
                      })}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {providers
                      .filter(p => !existingProviders.includes(p.streamer_id))
                      .slice(0, 10)
                      .map((provider) => (
                        <TableRow key={provider.streamer_id}>
                          <TableCell className="sticky left-0 bg-white border-r font-medium">
                            <div className="flex items-center gap-2">
                              {provider.logo_url && (
                                <img src={provider.logo_url} alt={provider.provider_name} className="w-6 h-6 object-contain" />
                              )}
                              <span className="truncate">{provider.provider_name}</span>
                            </div>
                          </TableCell>
                          <TableCell>{parsePrice(provider.monthly_price).toFixed(2)}€</TableCell>
                          {selectedCompetitions.slice(0, 4).map(comp => {
                            const coverage = getProviderCoverage(provider, comp);
                            return (
                              <TableCell 
                                key={comp} 
                                className={`text-center ${getCellBackgroundColor(coverage.percentage)}`}
                              >
                                <div className="text-sm font-medium">
                                  {coverage.percentage}%
                                </div>
                                <div className="text-xs opacity-75">
                                  {coverage.coveredGames}/{coverage.totalGames}
                                </div>
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedStep4Results;
