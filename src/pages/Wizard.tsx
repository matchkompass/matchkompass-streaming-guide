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

import EnhancedStep4Results from "@/components/wizard/EnhancedStep4Results";
import OptimizedStep4Results from "@/components/wizard/OptimizedStep4Results";
import { useClubs, Club } from "@/hooks/useClubs";
import { useStreamingEnhanced } from "@/hooks/useStreamingEnhanced";
import { useLeaguesEnhanced } from "@/hooks/useLeaguesEnhanced";
import { getAllCompetitionsForClubs, getClubCompetitions } from "@/utils/enhancedCoverageCalculator";

// Shared cluster structure for both steps
export const LEAGUE_CLUSTERS = [
  {
    name: "🇩🇪 Deutschland",
    key: "deutschland",
    color: "bg-blue-50 border-blue-200",
    headerColor: "bg-blue-100 text-blue-800",
    expandedByDefault: true,
    leagues: [
      { slug: "bundesliga", name: "Bundesliga", flag: "🇩🇪" },
      { slug: "second_bundesliga", name: "2. Bundesliga", flag: "🇩🇪" },
      { slug: "third_bundesliga", name: "3. Bundesliga", flag: "🇩🇪" },
      { slug: "dfb_pokal", name: "DFB Pokal", flag: "🇩🇪" }
    ]
  },
  {
    name: "🌐 Internationale Wettbewerbe",
    key: "int_wettbewerbe",
    color: "bg-green-50 border-green-200",
    headerColor: "bg-green-100 text-green-800",
    expandedByDefault: true,
    leagues: [
      { slug: "champions_league", name: "Champions League", flag: "⭐" },
      { slug: "europa_league", name: "Europa League", flag: "🏅" },
      { slug: "conference_league", name: "Conference League", flag: "🏅" },
      { slug: "klub_weltmeisterschaft", name: "Klub-Weltmeisterschaft", flag: "🌍" }
    ]
  },
  {
    name: "🌍 Internationale Ligen",
    key: "int_ligen",
    color: "bg-yellow-50 border-yellow-200",
    headerColor: "bg-yellow-100 text-yellow-800",
    expandedByDefault: false,
    leagues: [
      { slug: "premier_league", name: "Premier League", flag: "🏴" },
      { slug: "la_liga", name: "La Liga", flag: "🇪🇸" },
      { slug: "serie_a", name: "Serie A", flag: "🇮🇹" },
      { slug: "ligue_1", name: "Ligue 1", flag: "🇫🇷" },
      { slug: "sueper_lig", name: "Süper Lig", flag: "🇹🇷" },
      { slug: "eredivisie", name: "Eredivisie", flag: "🇳🇱" },
      { slug: "liga_portugal", name: "Liga Portugal", flag: "🇵🇹" },
      { slug: "saudi_pro_league", name: "Saudi Pro League", flag: "🇸🇦" },
      { slug: "mls", name: "Major Soccer League", flag: "🇺🇸" }
    ]
  },
  {
    name: "🏆 Nationale Pokalwettbewerbe (international)",
    key: "pokale",
    color: "bg-orange-50 border-orange-200",
    headerColor: "bg-orange-100 text-orange-800",
    expandedByDefault: false,
    leagues: [
      { slug: "fa_cup", name: "FA Cup", flag: "🏴" },
      { slug: "efl_cup", name: "EFL Cup", flag: "🏴" },
      { slug: "copa_del_rey", name: "Copa del Rey", flag: "🇪🇸" },
      { slug: "coppa_italia", name: "Coppa Italia", flag: "🇮🇹" },
      { slug: "coupe_de_france", name: "Coupe de France", flag: "🇫🇷" }
    ]
  }
];

// Helper: slug to real name
const LEAGUE_SLUG_TO_NAME = Object.fromEntries(
  LEAGUE_CLUSTERS.flatMap(cluster => cluster.leagues.map(l => [l.slug, l.name]))
);

// Helper: slug to flag
const LEAGUE_SLUG_TO_FLAG = Object.fromEntries(
  LEAGUE_CLUSTERS.flatMap(cluster => cluster.leagues.map(l => [l.slug, l.flag]))
);

// Get all leagues that should be expanded by default
const getDefaultExpandedLeagues = () => [
  'Bundesliga',
  'Champions League'
];

// Get the order index for a league
const getLeagueOrder = (leagueName: string) => {
  let order = 0;
  for (const cluster of LEAGUE_CLUSTERS) {
    const index = cluster.leagues.findIndex(l => l.name === leagueName);
    if (index !== -1) {
      return order + index;
    }
    order += cluster.leagues.length;
  }
  return order + 1000; // For leagues not in our custom clusters
};

const Wizard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedClubIds, setSelectedClubIds] = useState<number[]>([]);
  const [selectedCompetitions, setSelectedCompetitions] = useState<string[]>([]);
  const [existingProviders] = useState<number[]>([]); // Always empty - no step 3
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
                {LEAGUE_CLUSTERS.map((cluster, idx) => {
                  const clusterLeagues = cluster.leagues.filter(league => clubsByLeague[league.name] && clubsByLeague[league.name].clubs.length > 0);
                  if (clusterLeagues.length === 0) return null;
                  return (
                    <div key={cluster.name} className={`border-2 rounded-lg ${cluster.color}`}>
                      <div className={`px-6 py-3 ${cluster.headerColor} font-semibold text-lg`}>
                        {cluster.name}
                      </div>
                      <div className="p-6 space-y-4">
                        {clusterLeagues.map(league => {
                          const leagueData = clubsByLeague[league.name];
                          if (!leagueData || leagueData.clubs.length === 0) return null;
                          const isExpanded = expandedLeagues.includes(league.name);
                          const showAll = showAllClubs[league.name] || false;
                          const displayedClubs = showAll ? leagueData.clubs : leagueData.clubs.slice(0, 8);
                          return (
                            <div key={league.name} className="border rounded-lg bg-white shadow-sm">
                              <button
                                onClick={() => toggleLeague(league.name)}
                                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <h3 className="text-lg font-semibold text-gray-800">
                                    🏆 {league.name}
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
                                   <div className="grid grid-cols-3 gap-3">
                                    {displayedClubs.map((club) => (
                                       <Card
                                         key={club.club_id}
                                         className={`cursor-pointer transition-all duration-200 hover:shadow-md w-full ${
                                           selectedClubIds.includes(club.club_id)
                                             ? 'ring-2 ring-green-500 bg-green-50'
                                             : 'hover:bg-gray-50'
                                         }`}
                                         onClick={() => handleClubToggle(club.club_id)}
                                       >
                                         <CardContent className="p-3 flex flex-col items-center min-h-[120px]">
                                           <div className="text-2xl mb-2">
                                             {club.logo_url ? (
                                               <img src={club.logo_url} alt={club.name} className="w-8 h-8 object-contain" />
                                             ) : (
                                               "⚽"
                                             )}
                                           </div>
                                           <h3 className="font-medium text-sm mb-2 text-center line-clamp-2">{club.name}</h3>
                                           <div className="flex flex-wrap gap-1 justify-center mb-2">
                                             {getClubCompetitions(club).slice(0, 2).map((slug, idx) => {
                                               // Get icon from database
                                               const league = leagues.find(l => l.league_slug === slug);
                                               const leagueIcon = league?.icon || LEAGUE_SLUG_TO_FLAG[slug] || "🏆";
                                               return (
                                                 <Badge key={idx} variant="secondary" className="text-xs flex items-center gap-1">
                                                   <span>{leagueIcon}</span>
                                                   <span>{LEAGUE_SLUG_TO_NAME[slug] || slug.replace('_', ' ')}</span>
                                                 </Badge>
                                               );
                                             })}
                                           </div>
                                           {selectedClubIds.includes(club.club_id) && (
                                             <div className="mt-auto">
                                               <Check className="h-4 w-4 text-green-600 mx-auto" />
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
                                          [league.name]: !showAll
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
                {/* Weitere Wettbewerbe cluster */}
                {(() => {
                  const allClusterLeagues = LEAGUE_CLUSTERS.flatMap(cluster => cluster.leagues.map(l => l.name));
                  const weitereLeagues = Object.keys(clubsByLeague).filter(leagueName => !allClusterLeagues.includes(leagueName) && clubsByLeague[leagueName].clubs.length > 0);
                  if (weitereLeagues.length === 0) return null;
                  return (
                    <div className="border-2 rounded-lg bg-gray-50 border-gray-200">
                      <div className="px-6 py-3 bg-gray-100 text-gray-800 font-semibold text-lg">
                        📋 Weitere Wettbewerbe
                      </div>
                      <div className="p-6 space-y-4">
                        {weitereLeagues.map(leagueName => {
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
                                  <div className="grid grid-cols-3 gap-3">
                                    {displayedClubs.map((club) => (
                                       <Card
                                         key={club.club_id}
                                         className={`cursor-pointer transition-all duration-200 hover:shadow-md w-full ${
                                           selectedClubIds.includes(club.club_id)
                                             ? 'ring-2 ring-green-500 bg-green-50'
                                             : 'hover:bg-gray-50'
                                         }`}
                                         onClick={() => handleClubToggle(club.club_id)}
                                       >
                                         <CardContent className="p-3 flex flex-col items-center min-h-[120px]">
                                           <div className="text-2xl mb-2">
                                             {club.logo_url ? (
                                               <img src={club.logo_url} alt={club.name} className="w-8 h-8 object-contain" />
                                             ) : (
                                               "⚽"
                                             )}
                                           </div>
                                           <h3 className="font-medium text-sm mb-2 text-center line-clamp-2">{club.name}</h3>
                                           <div className="flex flex-wrap gap-1 justify-center mb-2">
                                             {getClubCompetitions(club).slice(0, 2).map((slug, idx) => {
                                               // Get icon from database
                                               const league = leagues.find(l => l.league_slug === slug);
                                               const leagueIcon = league?.icon || LEAGUE_SLUG_TO_FLAG[slug] || "🏆";
                                               return (
                                                 <Badge key={idx} variant="secondary" className="text-xs flex items-center gap-1">
                                                   <span>{leagueIcon}</span>
                                                   <span>{LEAGUE_SLUG_TO_NAME[slug] || slug.replace('_', ' ')}</span>
                                                 </Badge>
                                               );
                                             })}
                                           </div>
                                           {selectedClubIds.includes(club.club_id) && (
                                             <div className="mt-auto">
                                               <Check className="h-4 w-4 text-green-600 mx-auto" />
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
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-6">
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

        {/* Always visible next button at top */}
        {currentStep < 3 && (
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
