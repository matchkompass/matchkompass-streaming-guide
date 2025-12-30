import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Search, Check, Loader2, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
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
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                Wähle deine Lieblingsvereine
              </h2>
              <p className="text-muted-foreground text-lg">
                Markiere alle Vereine, deren Spiele du verfolgen möchtest
              </p>
            </div>

            {/* Search with better styling */}
            <div className="relative max-w-lg mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Verein suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 text-lg bg-background border-border rounded-xl shadow-sm focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Selected clubs preview */}
            {selectedClubIds.length > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-2 py-4">
                {selectedClubs.slice(0, 5).map(club => (
                  <div key={club.club_id} className="flex items-center gap-2 bg-sport-green-light text-sport-green-dark px-3 py-1.5 rounded-full text-sm font-medium">
                    {club.logo_url && <img src={club.logo_url} alt="" className="w-4 h-4 object-contain" />}
                    {club.name}
                    <button onClick={() => handleClubToggle(club.club_id)} className="hover:text-destructive">×</button>
                  </div>
                ))}
                {selectedClubIds.length > 5 && (
                  <span className="text-muted-foreground text-sm">+{selectedClubIds.length - 5} weitere</span>
                )}
              </div>
            )}

            {Object.keys(clubsByLeague).length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">Keine Vereine gefunden.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {LEAGUE_CLUSTERS.map((cluster) => {
                  if (cluster.key === "pokale") return null;
                  const clusterLeagues = cluster.leagues.filter(league => 
                    clubsByLeague[league.name] && clubsByLeague[league.name].clubs.length > 0 &&
                    !["DFB Pokal", "Copa del Rey", "Eredivisie"].includes(league.name)
                  );
                  if (clusterLeagues.length === 0) return null;
                  
                  // Determine cluster theme colors
                  const themeColors = {
                    deutschland: { bg: 'bg-sport-blue-light', border: 'border-sport-blue/20', header: 'bg-sport-blue/10 text-sport-blue' },
                    int_wettbewerbe: { bg: 'bg-sport-green-light', border: 'border-sport-green/20', header: 'bg-sport-green/10 text-sport-green' },
                    int_ligen: { bg: 'bg-sport-gold-light', border: 'border-sport-gold/20', header: 'bg-sport-gold/10 text-sport-gold' },
                    pokale: { bg: 'bg-sport-orange-light', border: 'border-sport-orange/20', header: 'bg-sport-orange/10 text-sport-orange' }
                  };
                  const colors = themeColors[cluster.key as keyof typeof themeColors] || themeColors.deutschland;
                  
                  return (
                    <div key={cluster.name} className={`rounded-2xl border-2 ${colors.border} ${colors.bg} overflow-hidden`}>
                      <div className={`px-4 md:px-6 py-3 md:py-4 ${colors.header} font-bold text-lg md:text-xl`}>
                        {cluster.name}
                      </div>
                      <div className="p-4 md:p-6 space-y-4">
                        {clusterLeagues.map(league => {
                          const leagueData = clubsByLeague[league.name];
                          if (!leagueData || leagueData.clubs.length === 0) return null;
                          const isExpanded = expandedLeagues.includes(league.name);
                          const showAll = showAllClubs[league.name] || false;
                          const displayedClubs = showAll ? leagueData.clubs : leagueData.clubs.slice(0, 8);
                          
                          return (
                            <div key={league.name} className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                              <button
                                onClick={() => toggleLeague(league.name)}
                                className="w-full px-4 md:px-6 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <span className="text-2xl">🏆</span>
                                  <h3 className="text-base md:text-lg font-semibold text-foreground">
                                    {league.name}
                                  </h3>
                                  <Badge variant="secondary" className="text-xs font-medium">
                                    {leagueData.clubs.length} Vereine
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-2">
                                  {leagueData.clubs.filter(c => selectedClubIds.includes(c.club_id)).length > 0 && (
                                    <Badge className="bg-primary text-primary-foreground text-xs">
                                      {leagueData.clubs.filter(c => selectedClubIds.includes(c.club_id)).length} ausgewählt
                                    </Badge>
                                  )}
                                  {isExpanded ? 
                                    <ChevronUp className="h-5 w-5 text-muted-foreground" /> : 
                                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                                  }
                                </div>
                              </button>
                              {isExpanded && (
                                <div className="px-4 md:px-6 pb-6">
                                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                    {displayedClubs.map((club) => {
                                      const isSelected = selectedClubIds.includes(club.club_id);
                                      return (
                                        <Card
                                          key={club.club_id}
                                          className={`cursor-pointer transition-all duration-200 hover-lift group ${
                                            isSelected
                                              ? 'ring-2 ring-primary bg-sport-green-light border-primary'
                                              : 'hover:border-primary/50 border-border'
                                          }`}
                                          onClick={() => handleClubToggle(club.club_id)}
                                        >
                                          <CardContent className="p-3 flex flex-col items-center min-h-[100px] justify-center relative">
                                            {isSelected && (
                                              <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                                                <Check className="h-3 w-3 text-primary-foreground" />
                                              </div>
                                            )}
                                            <div className="mb-2">
                                              {club.logo_url ? (
                                                <img 
                                                  src={club.logo_url} 
                                                  alt={club.name} 
                                                  className="w-10 h-10 md:w-12 md:h-12 object-contain"
                                                />
                                              ) : (
                                                <div className="w-10 h-10 md:w-12 md:h-12 bg-muted rounded-full flex items-center justify-center text-2xl">
                                                  ⚽
                                                </div>
                                              )}
                                            </div>
                                            <h3 className="font-medium text-sm text-center text-foreground line-clamp-2 leading-tight">
                                              {club.name}
                                            </h3>
                                          </CardContent>
                                        </Card>
                                      );
                                    })}
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
                                        className="border-border"
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
                    className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center text-lg font-bold transition-all duration-300 shadow-md ${
                      currentStep >= item.step
                        ? 'bg-primary text-primary-foreground shadow-primary/30'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {currentStep > item.step ? (
                      <Check className="h-6 w-6" />
                    ) : (
                      <span className="text-xl">{item.icon}</span>
                    )}
                  </div>
                  <span className={`mt-2 text-xs md:text-sm font-medium ${
                    currentStep >= item.step ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    {item.label}
                  </span>
                </div>
                {index < 2 && (
                  <div className={`w-16 md:w-24 h-1 mx-2 md:mx-4 rounded-full transition-all duration-300 ${
                    currentStep > item.step ? 'bg-primary' : 'bg-muted'
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
              className="rounded-full w-14 h-14 shadow-lg bg-primary hover:bg-primary/90"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>
        )}

        {/* Desktop Top Actions */}
        {currentStep < 3 && (
          <div className="hidden md:flex justify-end mb-6">
            <Button
              onClick={() => setCurrentStep(prev => prev + 1)}
              disabled={!canProceed()}
              size="lg"
              className="bg-primary hover:bg-primary/90 shadow-md"
            >
              Weiter zu {currentStep === 1 ? 'Wettbewerben' : 'Ergebnissen'}
              <ChevronRight className="ml-2 h-5 w-5" />
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
