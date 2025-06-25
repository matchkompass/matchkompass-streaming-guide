import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Search, Check, Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useClubs, Club } from "@/hooks/useClubs";
import { useStreaming } from "@/hooks/useStreaming";
import { useLeagues } from "@/hooks/useLeagues";
import { calculateCoverage, getAllCompetitionsForClubs, getClubCompetitions } from "@/utils/coverageCalculator";

const Wizard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedClubIds, setSelectedClubIds] = useState<number[]>([]);
  const [selectedCompetitions, setSelectedCompetitions] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const { clubs, loading: clubsLoading } = useClubs();
  const { providers, loading: providersLoading } = useStreaming();
  const { leagues, loading: leaguesLoading } = useLeagues();

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

  const allCompetitions = useMemo(() => {
    const competitionNames = {
      bundesliga: { name: "Bundesliga", logo: "🏆" },
      second_bundesliga: { name: "2. Bundesliga", logo: "🥈" },
      dfb_pokal: { name: "DFB-Pokal", logo: "🏆" },
      champions_league: { name: "Champions League", logo: "⭐" },
      europa_league: { name: "Europa League", logo: "🏅" },
      conference_league: { name: "Conference League", logo: "🏅" },
      club_world_cup: { name: "FIFA-Club-WM", logo: "🌍" },
      premier_league: { name: "Premier League", logo: "👑" },
      fa_cup: { name: "FA Cup", logo: "🏆" },
      la_liga: { name: "La Liga", logo: "🇪🇸" },
      copa_del_rey: { name: "Copa del Rey", logo: "👑" }
    };

    return Object.entries(competitionNames).map(([key, value]) => ({
      id: key,
      ...value,
      isRecommended: clubCompetitions.includes(key)
    }));
  }, [clubCompetitions]);

  const recommendations = useMemo(() => {
    if (selectedClubs.length === 0 || selectedCompetitions.length === 0 || providers.length === 0) {
      return [];
    }
    return calculateCoverage(selectedClubs, selectedCompetitions, providers, leagues);
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

  if (clubsLoading || providersLoading || leaguesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Lade Vereinsdaten...</p>
        </div>
      </div>
    );
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Wähle deine Lieblingsvereine
              </h2>
              <p className="text-gray-600 mb-8">
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

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {filteredClubs.map((club) => (
                <Card
                  key={club.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                    selectedClubIds.includes(club.id)
                      ? 'ring-2 ring-green-500 bg-green-50'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleClubToggle(club.id)}
                >
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-3">
                      {club.logo_url ? (
                        <img src={club.logo_url} alt={club.name} className="w-12 h-12 mx-auto object-contain" />
                      ) : (
                        "⚽"
                      )}
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{club.name}</h3>
                    <div className="flex flex-wrap gap-1 justify-center">
                      {getClubCompetitions(club).slice(0, 2).map((comp, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {comp}
                        </Badge>
                      ))}
                      {getClubCompetitions(club).length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{getClubCompetitions(club).length - 2}
                        </Badge>
                      )}
                    </div>
                    {selectedClubIds.includes(club.id) && (
                      <div className="mt-3">
                        <Check className="h-6 w-6 text-green-600 mx-auto" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

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
        // Auto-select recommended competitions on first render
        if (selectedCompetitions.length === 0 && clubCompetitions.length > 0) {
          setSelectedCompetitions(clubCompetitions);
        }
        
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Wettbewerbe auswählen
              </h2>
              <p className="text-gray-600 mb-8">
                Basierend auf deinen Vereinen empfehlen wir diese Wettbewerbe
              </p>
            </div>

            {/* Recommended Competitions */}
            {clubCompetitions.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4 text-blue-800">
                  Empfohlene Wettbewerbe (basierend auf deinen Vereinen)
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {allCompetitions.filter(comp => comp.isRecommended).map((competition) => {
                    const isSelected = selectedCompetitions.includes(competition.id);
                    const league = leagues.find(l => l.league_slug === competition.id);
                    
                    return (
                      <Card
                        key={competition.id}
                        className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                          isSelected
                            ? 'ring-2 ring-green-500 bg-green-50'
                            : 'ring-1 ring-blue-300 bg-blue-50'
                        }`}
                        onClick={() => handleCompetitionToggle(competition.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <span className="text-2xl">{competition.logo}</span>
                              <div>
                                <h4 className="font-semibold">{competition.name}</h4>
                                <p className="text-sm text-gray-500">
                                  {league?.['number of games'] || 0} Spiele pro Saison
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge className="bg-blue-100 text-blue-800 mb-2">
                                Empfohlen
                              </Badge>
                              {isSelected && (
                                <div>
                                  <Check className="h-5 w-5 text-green-600" />
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Other Competitions */}
            <div>
              <h3 className="text-xl font-semibold mb-4 text-gray-700">
                Weitere Wettbewerbe
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {allCompetitions.filter(comp => !comp.isRecommended).map((competition) => {
                  const isSelected = selectedCompetitions.includes(competition.id);
                  const league = leagues.find(l => l.league_slug === competition.id);
                  
                  return (
                    <Card
                      key={competition.id}
                      className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                        isSelected
                          ? 'ring-2 ring-green-500 bg-green-50'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => handleCompetitionToggle(competition.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{competition.logo}</span>
                            <div>
                              <h4 className="font-semibold">{competition.name}</h4>
                              <p className="text-sm text-gray-500">
                                {league?.['number of games'] || 0} Spiele pro Saison
                              </p>
                            </div>
                          </div>
                          {isSelected && (
                            <Check className="h-5 w-5 text-green-600" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {selectedCompetitions.length > 0 && (
              <div className="text-center">
                <Badge className="bg-green-100 text-green-800">
                  {selectedCompetitions.length} Wettbewerbe ausgewählt
                </Badge>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Deine optimalen Streaming-Pakete
              </h2>
              <p className="text-gray-600 mb-8">
                Hier sind die besten Kombinationen für deine Auswahl
              </p>
            </div>

            <div className="grid gap-6">
              {recommendations.map((pkg, index) => (
                <Card key={index} className={`${index === 0 ? 'ring-2 ring-green-500' : ''}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl flex items-center gap-2">
                          {pkg.type}
                          {index === 0 && <Star className="h-5 w-5 text-yellow-500 fill-current" />}
                        </CardTitle>
                        <CardDescription>{pkg.description}</CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">
                          {pkg.price.toFixed(2)} €
                        </div>
                        <div className="text-sm text-gray-500">pro Monat</div>
                        <Badge className={index === 0 ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                          {pkg.highlight}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">Abdeckung</span>
                          <span className="text-sm font-medium">{pkg.coverage}%</span>
                        </div>
                        <Progress value={pkg.coverage} className="h-2" />
                        <p className="text-xs text-gray-500 mt-1">
                          {pkg.coveredGames} von {pkg.totalGames} Spielen
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-medium mb-2">Benötigte Anbieter:</p>
                        <div className="flex flex-wrap gap-2">
                          {pkg.providers.map((provider, idx) => (
                            <Badge key={idx} variant="outline">
                              {provider.provider_name}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-medium mb-2">Wettbewerb-Abdeckung:</p>
                        <div className="space-y-1">
                          {pkg.competitions.map((comp, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                              <span>{comp.competition}</span>
                              <span className={comp.coverage === 100 ? 'text-green-600' : 'text-orange-600'}>
                                {comp.coverage}% ({comp.coveredGames}/{comp.totalGames})
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Button 
                        className="w-full bg-green-600 hover:bg-green-700"
                        size="lg"
                        onClick={() => {
                          // Link to provider's affiliate URL
                          if (pkg.providers[0]?.affiliate_url) {
                            window.open(pkg.providers[0].affiliate_url, '_blank');
                          }
                        }}
                      >
                        Zu den Streaming-Paketen
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
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
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4 mb-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep >= step
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {currentStep > step ? <Check className="h-5 w-5" /> : step}
                </div>
                {step < 3 && (
                  <div className={`w-16 h-1 mx-2 ${currentStep > step ? 'bg-green-600' : 'bg-gray-200'}`} />
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
        <div className="mb-8">
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
