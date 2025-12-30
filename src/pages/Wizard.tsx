import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Check, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import EnhancedCompetitionSelector from "@/components/wizard/EnhancedCompetitionSelector";

import EnhancedStep4Results from "@/components/wizard/EnhancedStep4Results";
import OptimizedStep4Results from "@/components/wizard/OptimizedStep4Results";
import ClubSelectionStep from "@/components/wizard/ClubSelectionStep"; // Import new step
import { useClubs } from "@/hooks/useClubs";
import { useStreamingEnhanced } from "@/hooks/useStreamingEnhanced";
import { useLeaguesEnhanced } from "@/hooks/useLeaguesEnhanced";
import { getAllCompetitionsForClubs } from "@/utils/enhancedCoverageCalculator";
import { LEAGUE_CLUSTERS, getDefaultExpandedLeagues } from "@/utils/constants";

const Wizard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedClubIds, setSelectedClubIds] = useState<number[]>([]);
  const [selectedCompetitions, setSelectedCompetitions] = useState<string[]>([]);
  const [existingProviders] = useState<number[]>([]); // Always empty - no step 3

  const { clubs, loading: clubsLoading, error: clubsError } = useClubs();
  const { providers, loading: providersLoading, error: providersError } = useStreamingEnhanced();
  const { leagues, loading: leaguesLoading, error: leaguesError } = useLeaguesEnhanced();

  const selectedClubs = useMemo(() => {
    return clubs.filter(club => selectedClubIds.includes(club.club_id));
  }, [clubs, selectedClubIds]);

  const clubCompetitions = useMemo(() => {
    if (selectedClubs.length === 0) return [];
    return getAllCompetitionsForClubs(selectedClubs);
  }, [selectedClubs]);

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

  // Auto-select ALL competitions where clubs participate
  useMemo(() => {
    if (clubCompetitions.length > 0) {
      setSelectedCompetitions(clubCompetitions);
    }
  }, [clubCompetitions]);

  // Handle loading states
  if (clubsLoading || providersLoading || leaguesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-sport-green-light/30">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <h2 className="text-xl font-semibold mb-2 text-foreground">Lade Daten...</h2>
            <p className="text-muted-foreground">
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
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-sport-green-light/30">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Alert className="mb-6 border-destructive/50 bg-destructive/10">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <AlertDescription>
              <strong className="text-foreground">Fehler beim Laden der Daten:</strong>
              <ul className="mt-2 list-disc list-inside text-muted-foreground">
                {clubsError && <li>Vereinsdaten: {clubsError}</li>}
                {providersError && <li>Streaming-Anbieter: {providersError}</li>}
                {leaguesError && <li>Liga-Daten: {leaguesError}</li>}
              </ul>
            </AlertDescription>
          </Alert>
          <Button onClick={() => window.location.reload()} className="bg-primary hover:bg-primary/90">
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
          <ClubSelectionStep
            clubs={clubs}
            leagues={leagues}
            selectedClubIds={selectedClubIds}
            onClubToggle={handleClubToggle}
            headerAction={
              <Button
                onClick={() => setCurrentStep(prev => prev + 1)}
                disabled={!canProceed()}
                size="lg"
                className="bg-primary hover:bg-primary/90 shadow-md"
              >
                Weiter
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            }
          />
        );

      case 2:
        return (
          <EnhancedCompetitionSelector
            selectedCompetitions={selectedCompetitions}
            onCompetitionToggle={handleCompetitionToggle}
            leagues={leagues as any}
            recommendedCompetitions={clubCompetitions}
          />
        );

      case 3:
        return (
          <OptimizedStep4Results
            selectedClubs={selectedClubs}
            selectedCompetitions={selectedCompetitions}
            existingProviders={existingProviders}
            providers={providers}
            leagues={leagues}
          />
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-sport-green-light/30">
      <SEOHead
        title="Streaming-Optimizer Wizard | Perfekte Kombination finden | MatchStream"
        description="Finde in nur 3 Schritten die optimale Streaming-Kombination für deine Lieblingsvereine. ✓ Persönliche Empfehlungen ✓ Beste Preise ✓ 100% Abdeckung"
        keywords="Streaming Optimizer, Fußball Streaming Wizard, Personalisierte Empfehlung, Streaming Kombination"
        canonical="https://matchstream.de/wizard"
      />
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Modern Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center mb-6">
            {[
              { step: 1, label: "Vereine", icon: "⚽" },
              { step: 2, label: "Wettbewerbe", icon: "🏆" },
              { step: 3, label: "Ergebnis", icon: "✨" }
            ].map((item, index) => (
              <div key={item.step} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center text-lg font-bold transition-all duration-300 shadow-md ${currentStep >= item.step
                      ? 'bg-green-600 text-white shadow-green-600/30'
                      : 'bg-muted text-muted-foreground'
                      }`}
                  >
                    {currentStep > item.step ? (
                      <Check className="h-6 w-6" />
                    ) : (
                      <span className="text-xl">{item.icon}</span>
                    )}
                  </div>
                  <span className={`mt-2 text-xs md:text-sm font-medium ${currentStep >= item.step ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                    {item.label}
                  </span>
                </div>
                {index < 2 && (
                  <div className={`w-16 md:w-24 h-1 mx-2 md:mx-4 rounded-full transition-all duration-300 ${currentStep > item.step ? 'bg-green-600' : 'bg-muted'
                    }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Floating Action Button */}
        {currentStep < 3 && canProceed() && (
          <div className="fixed bottom-6 right-6 z-50 md:hidden">
            <Button
              onClick={() => setCurrentStep(prev => prev + 1)}
              size="lg"
              className="rounded-full w-14 h-14 shadow-lg bg-green-600 hover:bg-green-700"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>
        )}

        {/* Desktop Top Actions */}
        {currentStep < 3 && currentStep !== 1 && (
          <div className="hidden md:flex justify-end mb-6">
            <Button
              onClick={() => setCurrentStep(prev => prev + 1)}
              disabled={!canProceed()}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {currentStep === 1 ? 'Weiter zu Wettbewerben' : 'Ergebnisse anzeigen'}
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Main Content Card */}
        <div className="glass-card rounded-2xl p-4 md:p-8 mb-6">
          {renderStepContent()}
        </div>

        {/* Bottom Navigation */}
        <div className="flex justify-between items-center bg-card rounded-xl p-4 shadow-sm border border-border">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
              disabled={currentStep === 1}
              className="border-border"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Zurück</span>
            </Button>
            {(currentStep === 1 || currentStep === 2) && (
              <Button
                variant="ghost"
                onClick={() => setCurrentStep(3)}
                className="text-muted-foreground hover:text-foreground"
              >
                Überspringen
              </Button>
            )}
          </div>

          <div className="flex items-center gap-4">
            {selectedClubIds.length > 0 && currentStep === 1 && (
              <div className="hidden md:flex items-center gap-2 bg-sport-green-light text-sport-green-dark px-4 py-2 rounded-full text-sm font-medium">
                <Check className="h-4 w-4" />
                {selectedClubIds.length} Vereine ausgewählt
              </div>
            )}

            {currentStep < 3 ? (
              <Button
                onClick={() => setCurrentStep(prev => prev + 1)}
                disabled={!canProceed()}
                size="lg"
                className="bg-primary hover:bg-primary/90"
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
                size="lg"
                className="bg-primary hover:bg-primary/90"
              >
                Neue Analyse starten
              </Button>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Wizard;
