import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Search, Check, Loader2, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import EnhancedCompetitionSelector from "@/components/wizard/EnhancedCompetitionSelector";
import EnhancedStep3Providers from "@/components/wizard/EnhancedStep3Providers";
import EnhancedStep4Results from "@/components/wizard/EnhancedStep4Results";
import OptimizedStep4Results from "@/components/wizard/OptimizedStep4Results";
import { useClubs, Club } from "@/hooks/useClubs";
import { useStreamingEnhanced } from "@/hooks/useStreamingEnhanced";
import { useLeaguesEnhanced } from "@/hooks/useLeaguesEnhanced";
import { getAllCompetitionsForClubs, getClubCompetitions } from "@/utils/enhancedCoverageCalculator";

// Define the custom league ordering and grouping
const LEAGUE_TIERS = {
  tier1: {
    name: "🇩🇪 Deutschland",
    color: "bg-blue-50 border-blue-200",
    headerColor: "bg-blue-100 text-blue-800",
    leagues: [
      "Bundesliga",
      "2. Bundesliga", 
      "3. Bundesliga",
      "DFB Pokal"
    ],
    expandedByDefault: true
  },
  tier2: {
    name: "🌍 Europa",
    color: "bg-green-50 border-green-200", 
    headerColor: "bg-green-100 text-green-800",
    leagues: [
      "Champions League",
      "Europa League",
      "Conference League",
      "Klub Weltmeisterschaft"
    ],
    expandedByDefault: true
  },
  tier3: {
    name: "🏆 Internationale Wettbewerbe",
    color: "bg-yellow-50 border-yellow-200",
    headerColor: "bg-yellow-100 text-yellow-800", 
    leagues: [
      "Premier League",
      "La Liga",
      "Serie A",
      "Ligue 1",
      "Süper Lig"
    ],
    expandedByDefault: false
  },
  tier4: {
    name: "⚽ Top-Ligen weltweit",
    color: "bg-orange-50 border-orange-200",
    headerColor: "bg-orange-100 text-orange-800",
    leagues: [
      "FA Cup",
      "EFL Cup", 
      "Copa del Rey",
      "Coppa Italia",
      "Coupe de France",
      "Eredivisie",
      "Liga Portugal"
    ],
    expandedByDefault: false
  },
  tier5: {
    name: "🧪 Alle anzeigen / Vergleichen",
    color: "bg-red-50 border-red-200",
    headerColor: "bg-red-100 text-red-800",
    leagues: [
      "Major Soccer League",
      "Saudi Pro League"
    ],
    expandedByDefault: false
  }
};

// Get all leagues that should be expanded by default
const getDefaultExpandedLeagues = () => {
  return Object.values(LEAGUE_TIERS)
    .filter(tier => tier.expandedByDefault)
    .flatMap(tier => tier.leagues);
};

// Get the tier for a league name
const getLeagueTier = (leagueName: string) => {
  for (const [tierKey, tier] of Object.entries(LEAGUE_TIERS)) {
    if (tier.leagues.includes(leagueName)) {
      return { tierKey, tier };
    }
  }
  return null;
};

// Get the order index for a league
const getLeagueOrder = (leagueName: string) => {
  let order = 0;
  for (const tier of Object.values(LEAGUE_TIERS)) {
    const index = tier.leagues.indexOf(leagueName);
    if (index !== -1) {
      return order + index;
    }
    order += tier.leagues.length;
  }
  return order; // For leagues not in our custom order
};

const Wizard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedClubIds, setSelectedClubIds] = useState<number[]>([]);
  const [selectedCompetitions, setSelectedCompetitions] = useState<string[]>([]);
  const [existingProviders, setExistingProviders] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedLeagues, setExpandedLeagues] = useState<string[]>(getDefaultExpandedLeagues());
  const [showAllClubs, setShowAllClubs] = useState<Record<string, boolean>>({});

  const { clubs, loading: clubsLoading, error: clubsError } = useClubs();
  const { providers, loading: providersLoading, error: providersError } = useStreamingEnhanced();
  const { leagues, loading: leaguesLoading, error: leaguesError } = useLeaguesEnhanced();

  console.log('Enhanced Wizard render - Data status:', {
    clubs: clubs.length,
    providers: providers.length,
    leagues: leagues.length,
    loading: { clubsLoading, providersLoading, leaguesLoading },
    errors: { clubsError, providersError, leaguesError }
  });

  const selectedClubs = useMemo(() => {
    return clubs.filter(club => selectedClubIds.includes(club.club_id));
  }, [clubs, selectedClubIds]);

  // Group clubs by league and sort by popularity from database
  const clubsByLeague = useMemo(() => {
    const grouped = clubs.reduce((acc, club) => {
      const clubLeagues = getClubCompetitions(club);
      
      clubLeagues.forEach(leagueSlug => {
        const league = leagues.find(l => l.league_slug === leagueSlug);
        if (league) {
          const leagueName = league.league || leagueSlug;
          if (!acc[leagueName]) {
            acc[leagueName] = {
              clubs: [],
              popularity: (league as any).popularity || 0
            };
          }
          
          if (!acc[leagueName].clubs.find(c => c.club_id === club.club_id)) {
            acc[leagueName].clubs.push(club);
          }
        }
      });
      
      return acc;
    }, {} as Record<string, { clubs: Club[], popularity: number }>);

    // Sort clubs within each league by popularity_score from database (highest first)
    Object.keys(grouped).forEach(leagueName => {
      grouped[leagueName].clubs = grouped[leagueName].clubs
        .sort((a, b) => (b.popularity_score || 0) - (a.popularity_score || 0));
    });

    // Filter by search term
    if (searchTerm) {
      Object.keys(grouped).forEach(leagueName => {
        grouped[leagueName].clubs = grouped[leagueName].clubs.filter(club =>
          club.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          club.country?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    return grouped;
  }, [clubs, leagues, searchTerm]);

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

  const handleProviderToggle = (providerId: number) => {
    setExistingProviders(prev =>
      prev.includes(providerId)
        ? prev.filter(id => id !== providerId)
        : [...prev, providerId]
    );
  };

  const toggleLeague = (leagueName: string) => {
    setExpandedLeagues(prev => 
      prev.includes(leagueName)
        ? prev.filter(name => name !== leagueName)
        : [...prev, leagueName]
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
                placeholder="Verein oder Liga suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {Object.keys(clubsByLeague).length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Keine Vereine gefunden.</p>
              </div>
            ) : (
              <div className="space-y-8">
                {Object.entries(LEAGUE_TIERS).map(([tierKey, tierConfig]) => {
                  // Get leagues in this tier that have clubs
                  const tierLeagues = tierConfig.leagues.filter(leagueName => 
                    clubsByLeague[leagueName] && clubsByLeague[leagueName].clubs.length > 0
                  );
                  
                  if (tierLeagues.length === 0) return null;
                  
                  return (
                    <div key={tierKey} className={`border-2 rounded-lg ${tierConfig.color}`}>
                      <div className={`px-6 py-3 ${tierConfig.headerColor} font-semibold text-lg`}>
                        {tierConfig.name}
                      </div>
                      
                      <div className="p-6 space-y-4">
                        {tierLeagues
                          .sort((a, b) => getLeagueOrder(a) - getLeagueOrder(b))
                          .map((leagueName) => {
                            const leagueData = clubsByLeague[leagueName];
                            if (!leagueData || leagueData.clubs.length === 0) return null;
                            
                            const isExpanded = expandedLeagues.includes(leagueName);
                            const showAll = showAllClubs[leagueName] || false;
                            const displayedClubs = showAll ? leagueData.clubs : leagueData.clubs.slice(0, 8);
                            
                            return (
                              <div key={leagueName} className="border rounded-lg bg-white shadow-sm">
                                <button
                                  onClick={() => toggleLeague(leagueName)}
                                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                                >
                                  <div className="flex items-center gap-3">
                                    <h3 className="text-lg font-semibold text-gray-800">
                                      🏆 {leagueName}
                                    </h3>
                                    <Badge variant="secondary" className="text-xs">
                                      {leagueData.clubs.length} Vereine
                                    </Badge>
                                  </div>
                                  {isExpanded ? 
                                    <ChevronUp className="h-5 w-5 text-gray-500" /> : 
                                    <ChevronDown className="h-5 w-5 text-gray-500" />
                                  }
                                </button>
                                
                                {isExpanded && (
                                  <div className="px-6 pb-6">
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                      {displayedClubs.map((club) => (
                                        <Card
                                          key={club.club_id}
                                          className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                                            selectedClubIds.includes(club.club_id)
                                              ? 'ring-2 ring-green-500 bg-green-50'
                                              : 'hover:bg-gray-50'
                                          }`}
                                          onClick={() => handleClubToggle(club.club_id)}
                                        >
                                          <CardContent className="p-3 text-center">
                                            <div className="text-3xl mb-2">
                                              {club.logo_url ? (
                                                <img src={club.logo_url} alt={club.name} className="w-8 h-8 mx-auto object-contain" />
                                              ) : (
                                                "⚽"
                                              )}
                                            </div>
                                            <h3 className="font-medium text-sm mb-2 line-clamp-2">{club.name}</h3>
                                            
                                            {club.popularity_score && (
                                              <div className="flex items-center justify-center gap-1 mb-2">
                                                <div className="flex">
                                                  {[...Array(5)].map((_, i) => (
                                                    <div
                                                      key={i}
                                                      className={`w-2 h-2 rounded-full ${
                                                        i < Math.min(5, Math.floor((club.popularity_score || 0) / 20))
                                                          ? 'bg-yellow-400'
                                                          : 'bg-gray-200'
                                                      }`}
                                                    />
                                                  ))}
                                                </div>
                                                <span className="text-xs text-gray-500">
                                                  {club.popularity_score}
                                                </span>
                                              </div>
                                            )}
                                            
                                            <div className="flex flex-wrap gap-1 justify-center mb-2">
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
                                            
                                            {selectedClubIds.includes(club.club_id) && (
                                              <div className="mt-2">
                                                <Check className="h-5 w-5 text-green-600 mx-auto" />
                                              </div>
                                            )}
                                          </CardContent>
                                        </Card>
                                      ))}
                                    </div>
                                    
                                    {leagueData.clubs.length > 8 && (
                                      <div className="mt-4 text-center">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => setShowAllClubs(prev => ({
                                            ...prev,
                                            [leagueName]: !showAll
                                          }))}
                                        >
                                          {showAll ? 'Weniger anzeigen' : `Alle ${leagueData.clubs.length} Vereine anzeigen`}
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  );
                })}
                
                {/* Handle leagues not in predefined tiers */}
                {(() => {
                  const allPredefinedLeagues = Object.values(LEAGUE_TIERS).flatMap(tier => tier.leagues);
                  const otherLeagues = Object.keys(clubsByLeague).filter(leagueName => 
                    !allPredefinedLeagues.includes(leagueName) && clubsByLeague[leagueName].clubs.length > 0
                  );
                  
                  if (otherLeagues.length === 0) return null;
                  
                  return (
                    <div className="border-2 rounded-lg bg-gray-50 border-gray-200">
                      <div className="px-6 py-3 bg-gray-100 text-gray-800 font-semibold text-lg">
                        📋 Weitere Ligen
                      </div>
                      
                      <div className="p-6 space-y-4">
                        {otherLeagues
                          .sort((a, b) => (clubsByLeague[b].popularity || 0) - (clubsByLeague[a].popularity || 0))
                          .map((leagueName) => {
                            const leagueData = clubsByLeague[leagueName];
                            const isExpanded = expandedLeagues.includes(leagueName);
                            const showAll = showAllClubs[leagueName] || false;
                            const displayedClubs = showAll ? leagueData.clubs : leagueData.clubs.slice(0, 8);
                            
                            return (
                              <div key={leagueName} className="border rounded-lg bg-white shadow-sm">
                                <button
                                  onClick={() => toggleLeague(leagueName)}
                                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                                >
                                  <div className="flex items-center gap-3">
                                    <h3 className="text-lg font-semibold text-gray-800">
                                      🏆 {leagueName}
                                    </h3>
                                    <Badge variant="secondary" className="text-xs">
                                      {leagueData.clubs.length} Vereine
                                    </Badge>
                                  </div>
                                  {isExpanded ? 
                                    <ChevronUp className="h-5 w-5 text-gray-500" /> : 
                                    <ChevronDown className="h-5 w-5 text-gray-500" />
                                  }
                                </button>
                                
                                {isExpanded && (
                                  <div className="px-6 pb-6">
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                      {displayedClubs.map((club) => (
                                        <Card
                                          key={club.club_id}
                                          className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                                            selectedClubIds.includes(club.club_id)
                                              ? 'ring-2 ring-green-500 bg-green-50'
                                              : 'hover:bg-gray-50'
                                          }`}
                                          onClick={() => handleClubToggle(club.club_id)}
                                        >
                                          <CardContent className="p-3 text-center">
                                            <div className="text-3xl mb-2">
                                              {club.logo_url ? (
                                                <img src={club.logo_url} alt={club.name} className="w-8 h-8 mx-auto object-contain" />
                                              ) : (
                                                "⚽"
                                              )}
                                            </div>
                                            <h3 className="font-medium text-sm mb-2 line-clamp-2">{club.name}</h3>
                                            
                                            {club.popularity_score && (
                                              <div className="flex items-center justify-center gap-1 mb-2">
                                                <div className="flex">
                                                  {[...Array(5)].map((_, i) => (
                                                    <div
                                                      key={i}
                                                      className={`w-2 h-2 rounded-full ${
                                                        i < Math.min(5, Math.floor((club.popularity_score || 0) / 20))
                                                          ? 'bg-yellow-400'
                                                          : 'bg-gray-200'
                                                      }`}
                                                    />
                                                  ))}
                                                </div>
                                                <span className="text-xs text-gray-500">
                                                  {club.popularity_score}
                                                </span>
                                              </div>
                                            )}
                                            
                                            <div className="flex flex-wrap gap-1 justify-center mb-2">
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
                                            
                                            {selectedClubIds.includes(club.club_id) && (
                                              <div className="mt-2">
                                                <Check className="h-5 w-5 text-green-600 mx-auto" />
                                              </div>
                                            )}
                                          </CardContent>
                                        </Card>
                                      ))}
                                    </div>
                                    
                                    {leagueData.clubs.length > 8 && (
                                      <div className="mt-4 text-center">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => setShowAllClubs(prev => ({
                                            ...prev,
                                            [leagueName]: !showAll
                                          }))}
                                        >
                                          {showAll ? 'Weniger anzeigen' : `Alle ${leagueData.clubs.length} Vereine anzeigen`}
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  );
                })()}
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
          <EnhancedCompetitionSelector
            selectedCompetitions={selectedCompetitions}
            onCompetitionToggle={handleCompetitionToggle}
            leagues={leagues as any}
            recommendedCompetitions={clubCompetitions}
          />
        );

      case 3:
        return (
          <EnhancedStep3Providers
            providers={providers}
            existingProviders={existingProviders}
            onToggleProvider={handleProviderToggle}
          />
        );

      case 4:
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
    if (currentStep === 3) return true;
    return true;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="flex items-center justify-center space-x-4 mb-3">
            {[1, 2, 3, 4].map((step) => (
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
                {step < 4 && (
                  <div className={`w-12 h-1 mx-2 ${currentStep > step ? 'bg-green-600' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Schritt {currentStep} von 4
            </p>
          </div>
        </div>

        {/* Always visible next button at top */}
        {currentStep < 4 && (
          <div className="mb-4 flex justify-end">
            <Button
              onClick={() => setCurrentStep(prev => prev + 1)}
              disabled={!canProceed()}
              className="bg-green-600 hover:bg-green-700"
            >
              Weiter
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}

        <div className="mb-6">
          {renderStepContent()}
        </div>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
            disabled={currentStep === 1}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Zurück
          </Button>

          {currentStep < 4 ? (
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
                setExistingProviders([]);
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
