
import { useState } from "react";
import { ChevronLeft, ChevronRight, Search, Check, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Wizard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedClubs, setSelectedClubs] = useState<string[]>([]);
  const [selectedCompetitions, setSelectedCompetitions] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const clubs = [
    { id: "bayern", name: "Bayern München", logo: "⚽", competitions: ["Bundesliga", "Champions League", "DFB-Pokal"] },
    { id: "dortmund", name: "Borussia Dortmund", logo: "🟡", competitions: ["Bundesliga", "Champions League", "DFB-Pokal"] },
    { id: "barcelona", name: "FC Barcelona", logo: "🔵", competitions: ["La Liga", "Champions League", "Copa del Rey"] },
    { id: "hertha", name: "Hertha BSC", logo: "🔷", competitions: ["2. Bundesliga", "DFB-Pokal"] },
    { id: "real", name: "Real Madrid", logo: "⚪", competitions: ["La Liga", "Champions League", "Copa del Rey"] },
    { id: "schalke", name: "Schalke 04", logo: "🔵", competitions: ["2. Bundesliga", "DFB-Pokal"] }
  ];

  const competitions = [
    { id: "bundesliga", name: "Bundesliga", logo: "🏆", games: 308, provider: "Sky" },
    { id: "2bundesliga", name: "2. Bundesliga", logo: "🥈", games: 306, provider: "Sky" },
    { id: "champions", name: "Champions League", logo: "⭐", games: 189, provider: "DAZN" },
    { id: "dfb", name: "DFB-Pokal", logo: "🏆", games: 63, provider: "Sky" },
    { id: "laliga", name: "La Liga", logo: "🇪🇸", games: 380, provider: "DAZN" },
    { id: "copa", name: "Copa del Rey", logo: "👑", games: 61, provider: "DAZN" }
  ];

  const streamingPackages = [
    {
      type: "Maximalabdeckung",
      coverage: 100,
      price: 67.47,
      providers: ["DAZN", "WOW", "Amazon Prime"],
      description: "Alle Spiele deiner Vereine sichtbar",
      highlight: "Empfehlung",
      games: "308 von 308"
    },
    {
      type: "Preis-Leistungs-Empfehlung",
      coverage: 99,
      price: 59.98,
      providers: ["DAZN", "WOW"],
      description: "Beste Balance zwischen Kosten und Abdeckung",
      highlight: "Beliebt",
      games: "305 von 308"
    },
    {
      type: "Budget-Option",
      coverage: 78,
      price: 29.99,
      providers: ["DAZN"],
      description: "Günstigste Option für die wichtigsten Spiele",
      highlight: "Günstig",
      games: "240 von 308"
    }
  ];

  const filteredClubs = clubs.filter(club => 
    club.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleClubToggle = (clubId: string) => {
    setSelectedClubs(prev => 
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

  const getRecommendedCompetitions = () => {
    const recommendedCompetitions = new Set<string>();
    selectedClubs.forEach(clubId => {
      const club = clubs.find(c => c.id === clubId);
      if (club) {
        club.competitions.forEach(comp => {
          const competition = competitions.find(c => c.name === comp);
          if (competition) {
            recommendedCompetitions.add(competition.id);
          }
        });
      }
    });
    return Array.from(recommendedCompetitions);
  };

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
                    selectedClubs.includes(club.id)
                      ? 'ring-2 ring-green-500 bg-green-50'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleClubToggle(club.id)}
                >
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-3">{club.logo}</div>
                    <h3 className="font-semibold text-lg mb-2">{club.name}</h3>
                    <div className="flex flex-wrap gap-1 justify-center">
                      {club.competitions.slice(0, 2).map((comp, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {comp}
                        </Badge>
                      ))}
                      {club.competitions.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{club.competitions.length - 2}
                        </Badge>
                      )}
                    </div>
                    {selectedClubs.includes(club.id) && (
                      <div className="mt-3">
                        <Check className="h-6 w-6 text-green-600 mx-auto" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {selectedClubs.length > 0 && (
              <div className="text-center">
                <Badge className="bg-green-100 text-green-800">
                  {selectedClubs.length} Vereine ausgewählt
                </Badge>
              </div>
            )}
          </div>
        );

      case 2:
        const recommendedCompetitionIds = getRecommendedCompetitions();
        
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

            <div className="grid md:grid-cols-2 gap-6">
              {competitions.map((competition) => {
                const isRecommended = recommendedCompetitionIds.includes(competition.id);
                const isSelected = selectedCompetitions.includes(competition.id);
                
                return (
                  <Card
                    key={competition.id}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                      isSelected
                        ? 'ring-2 ring-green-500 bg-green-50'
                        : isRecommended
                        ? 'ring-1 ring-blue-300 bg-blue-50'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleCompetitionToggle(competition.id)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{competition.logo}</span>
                          <div>
                            <h3 className="font-semibold text-lg">{competition.name}</h3>
                            <p className="text-sm text-gray-500">
                              {competition.games} Spiele pro Saison
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className="mb-2">{competition.provider}</Badge>
                          {isRecommended && (
                            <div>
                              <Badge className="bg-blue-100 text-blue-800">
                                Empfohlen
                              </Badge>
                            </div>
                          )}
                          {isSelected && (
                            <div className="mt-2">
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
              {streamingPackages.map((pkg, index) => (
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
                        <p className="text-xs text-gray-500 mt-1">{pkg.games} Spiele</p>
                      </div>

                      <div>
                        <p className="text-sm font-medium mb-2">Benötigte Anbieter:</p>
                        <div className="flex flex-wrap gap-2">
                          {pkg.providers.map((provider, idx) => (
                            <Badge key={idx} variant="outline">
                              {provider}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <Button 
                        className="w-full bg-green-600 hover:bg-green-700"
                        size="lg"
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
    if (currentStep === 1) return selectedClubs.length > 0;
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
              onClick={() => setCurrentStep(1)}
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
