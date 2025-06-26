
import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Search, Check, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useClubs, Club } from "@/hooks/useClubs";
import { useStreaming } from "@/hooks/useStreaming";
import { useLeagues } from "@/hooks/useLeagues";
import { calculateEnhancedCoverage, getAllCompetitionsForClubs, getClubCompetitions } from "@/utils/enhancedCoverageCalculator";
import EnhancedPackageCard from "@/components/wizard/EnhancedPackageCard";
import SimplifiedCompetitionSelector from "@/components/wizard/SimplifiedCompetitionSelector";

const Wizard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedClubIds, setSelectedClubIds] = useState<number[]>([]);
  const [selectedCompetitions, setSelectedCompetitions] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const { clubs, loading: clubsLoading, error: clubsError } = useClubs();
  const { providers, loading: providersLoading, error: providersError } = useStreaming();
  const { leagues, loading: leaguesLoading, error: leaguesError } = useLeagues();

  console.log('Enhanced Wizard render - Data status:', {
    clubs: clubs.length,
    providers: providers.length,
    leagues: leagues.length,
    loading: { clubsLoading, providersLoading, leaguesLoading },
    errors: { clubsError, providersError, leaguesError }
  });

  const selectedClubs = useMemo(() => {
    return clubs.filter(club => selectedClubIds.includes(club.id));
  }, [clubs, selectedClubIds]);

  const filteredClubs = useMemo(() => {
    return clubs.filter(club => 
      club.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [clubs, searchTerm]);

  const clubCompetitions = useMemo(() => {
    if (selectedClubs.length === 0) return [];
    return getAllCompetitionsForClubs(selectedClubs);
  }, [selectedClubs]);

  const recommendations = useMemo(() => {
    if (selectedClubs.length === 0 || selectedCompetitions.length === 0 || providers.length === 0) {
      return [];
    }
    return calculateEnhancedCoverage(selectedClubs, selectedCompetitions, providers, leagues);
  }, [selectedClubs, selectedCompetitions, providers, leagues]);

  const handleClubToggle = (clubId: number) => {
    setSelectedClubIds(prev => 
      prev.includes(clubId) 
        ? prev.filter(id => id !== clubId)
        : [...prev, clubId]
    );
  };

  const handleCompetitionToggle = (competitionId: string) => {
    setSelectedCompetitions(prev => 
      prev.includes(competitionId)
        ? prev.filter(id => id !== competitionId)
        : [...prev, competitionId]
    );
  };

  // Auto-select recommended competitions when clubs change
  useMemo(() => {
    if (clubCompetitions.length > 0 && selectedCompetitions.length === 0) {
      setSelectedCompetitions(clubCompetitions);
    }
  }, [clubCompetitions]);

  // Handle loading states
  if (clubsLoading || providersLoading || leaguesLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-green-600" />
            <h2 className="text-xl font-semibold mb-2">Lade Daten...</h2>
            <p className="text-gray-600">
              {clubsLoading && "Lade Vereinsdaten... "}
              {providersLoading && "Lade Streaming-Anbieter... "}
              {leaguesLoading && "Lade Liga-Informationen... "}
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Handle error states
  if (clubsError || providersError || leaguesError) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Fehler beim Laden der Daten:</strong>
              <ul className="mt-2 list-disc list-inside">
                {clubsError && <li>Vereinsdaten: {clubsError}</li>}
                {providersError && <li>Streaming-Anbieter: {providersError}</li>}
                {leaguesError && <li>Liga-Daten: {leaguesError}</li>}
              </ul>
            </AlertDescription>
          </Alert>
          <Button onClick={() => window.location.reload()} className="bg-green-600 hover:bg-green-700">
            Seite neu laden
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Wähle deine Lieblingsvereine
              </h2>
              <p className="text-gray-600 mb-6">
                Markiere alle Vereine, deren Spiele du verfolgen möchtest
              </p>
            </div>

            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Verein suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {filteredClubs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Keine Vereine gefunden.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {filteredClubs.map((club) => (
                  <Card
                    key={club.id}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                      selectedClubIds.includes(club.id)
                        ? 'ring-2 ring-green-500 bg-green-50'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleClubToggle(club.id)}
                  >
                    <CardContent className="p-3 text-center">
                      <div className="text-3xl mb-2">
                        {club.logo_url ? (
                          <img src={club.logo_url} alt={club.name} className="w-8 h-8 mx-auto object-contain" />
                        ) : (
                          "⚽"
                        )}
                      </div>
                      <h3 className="font-medium text-sm mb-2">{club.name}</h3>
                      <div className="flex flex-wrap gap-1 justify-center">
                        {getClubCompetitions(club).slice(0, 1).map((comp, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {comp.replace('_', ' ')}
                          </Badge>
                        ))}
                        {getClubCompetitions(club).length > 1 && (
                          <Badge variant="secondary" className="text-xs">
                            +{getClubCompetitions(club).length - 1}
                          </Badge>
                        )}
                      </div>
                      {selectedClubIds.includes(club.id) && (
                        <div className="mt-2">
                          <Check className="h-5 w-5 text-green-600 mx-auto" />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {selectedClubIds.length > 0 && (
              <div className="text-center">
                <Badge className="bg-green-100 text-green-800">
                  {selectedClubIds.length} Vereine ausgewählt
                </Badge>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <SimplifiedCompetitionSelector
            selectedCompetitions={selectedCompetitions}
            onCompetitionToggle={handleCompetitionToggle}
            selectedClubs={selectedClubs}
          />
        );

      case 3:
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

            {recommendations.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Keine Empfehlungen verfügbar. Bitte wähle Vereine und Wettbewerbe aus.</p>
              </div>
            ) : (
              <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {recommendations.map((pkg, index) => (
                  <EnhancedPackageCard
                    key={index}
                    type={pkg.type}
                    coverage={pkg.coverage}
                    price={pkg.price}
                    yearlyPrice={pkg.yearlyPrice}
                    providers={pkg.providers}
                    competitions={pkg.competitions}
                    totalGames={pkg.totalGames}
                    coveredGames={pkg.coveredGames}
                    description={pkg.description}
                    highlight={pkg.highlight}
                    isRecommended={index === 0}
                    savings={pkg.savings}
                  />
                ))}
              </div>
            )}

            {/* Quick comparison table */}
            {recommendations.length > 1 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">Schnellvergleich</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paket</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Preis</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Abdeckung</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Anbieter</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {recommendations.map((pkg, index) => (
                        <tr key={index} className={index === 0 ? 'bg-green-50' : ''}>
                          <td className="px-4 py-3 text-sm font-medium">{pkg.type}</td>
                          <td className="px-4 py-3 text-sm">{pkg.price.toFixed(2)}€/Monat</td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`font-medium ${
                              pkg.coverage >= 90 ? 'text-green-600' : 
                              pkg.coverage >= 70 ? 'text-orange-600' : 'text-red-600'
                            }`}>
                              {pkg.coverage}%
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {pkg.providers.map(p => p.provider_name).join(', ')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    if (currentStep === 1) return selectedClubIds.length > 0;
    if (currentStep === 2) return selectedCompetitions.length > 0;
    return true;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Progress Indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-center space-x-4 mb-3">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep >= step
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {currentStep > step ? <Check className="h-4 w-4" /> : step}
                </div>
                {step < 3 && (
                  <div className={`w-12 h-1 mx-2 ${currentStep > step ? 'bg-green-600' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Schritt {currentStep} von 3
            </p>
          </div>
        </div>

        {/* Step Content */}
        <div className="mb-6">
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
            disabled={currentStep === 1}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Zurück
          </Button>

          {currentStep < 3 ? (
            <Button
              onClick={() => setCurrentStep(prev => prev + 1)}
              disabled={!canProceed()}
              className="bg-green-600 hover:bg-green-700"
            >
              Weiter
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={() => {
                setCurrentStep(1);
                setSelectedClubIds([]);
                setSelectedCompetitions([]);
              }}
              className="bg-green-600 hover:bg-green-700"
            >
              Neue Analyse starten
            </Button>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Wizard;
