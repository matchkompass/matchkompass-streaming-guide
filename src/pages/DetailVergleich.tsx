import React, { useState, useMemo, useEffect } from "react";
import { Download, Filter, Pin, X, Check, TrendingUp, Sliders, Award, Users, ShieldCheck, Shield, Sparkles, CreditCard, Monitor, Trophy, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useStreamingEnhanced } from "@/hooks/useStreamingEnhanced";
import { useLeaguesEnhanced } from "@/hooks/useLeaguesEnhanced";
import { useClubs } from "@/hooks/useClubs";
import { useIsMobile } from "@/hooks/use-mobile";
import DetailComparisonSidebar from "@/components/comparison/DetailComparisonSidebar";
import HorizontalFilterBar, { HorizontalFilterBarFilters } from "@/components/comparison/HorizontalFilterBar";
import ComparisonSearch, { SearchEntity } from "@/components/comparison/ComparisonSearch";
import { getClubCompetitions } from "@/utils/enhancedCoverageCalculator";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const DetailVergleich = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pinnedProviders, setPinnedProviders] = useState<number[]>([]);
  const [expandedProvider, setExpandedProvider] = useState<number | null>(null);
  const [activeTabs, setActiveTabs] = useState<{ [key: number]: string }>({});

  const [selectedEntities, setSelectedEntities] = useState<SearchEntity[]>([]);

  const [filters, setFilters] = useState<HorizontalFilterBarFilters>({
    leagues: [] as string[],
    providers: [] as number[],
    otherSports: [] as string[],
    features: {
      fourK: false,
      mobile: false,
      download: false,
      multiStream: false,
    },
  });

  const { providers, loading: providersLoading } = useStreamingEnhanced();
  const { leagues, loading: leaguesLoading } = useLeaguesEnhanced();
  const { clubs, loading: clubsLoading } = useClubs();
  const isMobile = useIsMobile();

  // Fetch latest deal for header badge
  const { data: latestDeal } = useQuery({
    queryKey: ['latest-deal'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deals')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) return null;
      return data;
    }
  });

  // Preselect all providers after data is loaded
  useEffect(() => {
    if (providers.length > 0 && filters.providers.length === 0) {
      setFilters(prev => ({
        ...prev,
        providers: providers.map(p => p.streamer_id)
      }));
    }
  }, [providers]);

  // Calculate available other sports from providers
  const availableOtherSports = useMemo(() => {
    const sports = new Set<string>();
    providers.forEach(p => {
      if (p.further_offers) {
        let offers = p.further_offers;
        if (typeof offers === 'string') {
          try { offers = JSON.parse(offers); } catch (e) { offers = {}; }
        }

        if (Array.isArray(offers)) {
          offers.forEach((s: string) => sports.add(s));
        } else if (offers && typeof offers === 'object') {
          Object.keys(offers).forEach(key => {
            if ((offers as any)[key] === true) {
              sports.add(key);
            }
          });
        }
      }
    });
    return Array.from(sports).sort();
  }, [providers]);

  const parsePrice = (priceString?: string): number => {
    if (!priceString) return 0;
    return parseFloat(priceString.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
  };

  const parseFeatures = (provider: any) => {
    const features = {
      fourK: false,
      mobile: false,
      download: false,
      multiStream: false,
      streams: 1,
    };
    if (provider.features) {
      try {
        const featureObj = typeof provider.features === 'string'
          ? JSON.parse(provider.features)
          : provider.features;
        features.fourK = featureObj['has_4k_streaming'] || false;
        features.mobile = featureObj['has_mobile_app'] || false;
        features.download = featureObj['has_offline_viewing'] || false;
        features.streams = featureObj['max_simultaneous_streams'] || 1;
        features.multiStream = features.streams > 1;
      } catch (e) { }
    }
    return features;
  };

  const getProviderCoverage = (provider: any, leagueSlug: string) => {
    const league = leagues.find(l => l.league_slug === leagueSlug);
    const totalGames = league?.['number of games'] || 0;
    const coveredGames = (provider[leagueSlug] as number) || 0;
    const percentage = totalGames > 0 ? Math.round((coveredGames / totalGames) * 100) : 0;
    return { coveredGames, totalGames, percentage };
  };

  const calculateCostPerGame = (provider: any) => {
    const monthlyPrice = parsePrice(provider.monthly_price);
    let totalGames = 0;

    // Logic for cost per game based on selected leagues or all displayed leagues
    const leaguesToCheck = filters.leagues.length > 0 ? filters.leagues : leagues.map(l => l.league_slug);
    leaguesToCheck.forEach(leagueSlug => {
      const coverage = getProviderCoverage(provider, leagueSlug);
      totalGames += coverage.coveredGames;
    });

    return totalGames > 0 ? monthlyPrice / totalGames : 0;
  };

  const filteredProviders = useMemo(() => {
    let filtered = providers.filter(provider => {
      // 1. Provider filter
      if (!filters.providers.includes(provider.streamer_id)) return false;

      // 2. Feature filters
      const features = parseFeatures(provider);
      if (filters.features.fourK && !features.fourK) return false;
      if (filters.features.mobile && !features.mobile) return false;
      if (filters.features.download && !features.download) return false;
      if (filters.features.multiStream && !features.multiStream) return false;

      // 3. Other Sports filter
      if (filters.otherSports.length > 0) {
        let offers = provider.further_offers;
        if (typeof offers === 'string') {
          try { offers = JSON.parse(offers); } catch (e) { offers = {}; }
        }

        const offersList = Array.isArray(offers)
          ? offers
          : (offers && typeof offers === 'object'
            ? Object.keys(offers).filter(key => (offers as any)[key] === true)
            : []);

        const matchesAny = filters.otherSports.some(s => offersList.includes(s));
        if (!matchesAny) return false;
      }

      // 4. Manual League filter (from dropdown)
      // if leagues are selected, provider must cover at least one selected league
      if (filters.leagues.length > 0) {
        if (!filters.leagues.some(league => (provider[league] || 0) > 0)) return false;
      }

      // 5. Search Entity Logic (Club/League Autocomplete)
      if (selectedEntities.length > 0) {
        const matchesAllEntities = selectedEntities.every(entity => {
          if (entity.type === 'league') {
            return (provider[entity.id] || 0) > 0;
          } else if (entity.type === 'club') {
            const club = clubs.find(c => c.club_id === entity.id);
            if (!club) return false;

            const cups = ['dfb_pokal', 'fa_cup', 'copa_del_rey', 'coppa_italia', 'coupe_de_france', 'efl_cup', 'club_world_cup'];
            const allComps = getClubCompetitions(club);
            const validComps = allComps.filter(c => !cups.includes(c));

            if (validComps.length === 0) return true;

            return validComps.every(comp => (provider[comp] || 0) > 0);
          }
          return true;
        });
        if (!matchesAllEntities) return false;
      }

      return true;
    });

    // Sort providers by coverage of Top 5 leagues + CL/EL
    return [...filtered].sort((a, b) => {
      const getScore = (p: any) => {
        const majorLeagues = [
          'bundesliga', 'premier_league', 'la_liga', 'serie_a', 'ligue_1',
          'champions_league', 'europa_league'
        ];
        return majorLeagues.reduce((sum, league) => sum + (p[league] || 0), 0);
      };
      return getScore(b) - getScore(a);
    });
  }, [providers, filters, selectedEntities, clubs]);

  const displayProviders = useMemo(() => {
    const pinned = filteredProviders.filter(p => pinnedProviders.includes(p.streamer_id));
    const unpinned = filteredProviders.filter(p => !pinnedProviders.includes(p.streamer_id));
    return [...pinned, ...unpinned];
  }, [filteredProviders, pinnedProviders]);

  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  const togglePin = (providerId: number) => {
    setPinnedProviders(prev =>
      prev.includes(providerId)
        ? prev.filter(id => id !== providerId)
        : [...prev, providerId]
    );
  };

  const toggleExpanded = (providerId: number) => {
    setExpandedProvider(prev => prev === providerId ? null : providerId);
  };

  const groupedLeagues = useMemo(() => {
    const grouped: { [key: string]: typeof leagues } = {};
    leagues.forEach(league => {
      const country = league.country || 'International';
      if (!grouped[country]) grouped[country] = [];
      grouped[country].push(league);
    });

    Object.keys(grouped).forEach(country => {
      grouped[country].sort((a, b) => (a.popularity || 0) - (b.popularity || 0));
    });

    return grouped;
  }, [leagues]);

  const getCellBackgroundColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-100 text-green-800';
    if (percentage >= 70) return 'bg-yellow-100 text-yellow-800';
    if (percentage >= 50) return 'bg-orange-100 text-orange-800';
    if (percentage > 0) return 'bg-red-100 text-red-800';
    return 'bg-gray-50 text-gray-500';
  };

  if (providersLoading || leaguesLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Lade Vergleichsdaten...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50">
      <Header />
      {/* Professional Comparison Header */}
      <div className="w-full px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8 items-start">
            {/* Left: Title and Description */}
            <div className="lg:col-span-2">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Streaming-Vergleich 2025
              </h1>
              <p className="text-lg text-gray-700 mb-4">
                Die besten Streaming-Anbieter für Fußball {new Date().toLocaleDateString('de-DE', { month: 'numeric', year: 'numeric' }).replace('/', '/')}
              </p>
              <p className="text-gray-600 leading-relaxed mb-6 hidden md:block text-sm">
                Mit unserem Streaming-Vergleich findest du den perfekten Anbieter für dein Fußball-Erlebnis.
                In einer Zeit von Split-Rechten und unzähligen Paketen behalten wir für dich den Überblick.
                Wir analysieren wöchentlich die Rechtevergaben und Paketstrukturen, damit du garantiert
                kein Spiel deiner Lieblingsmannschaft verpasst.
                Unsere Berechnungen basieren auf {providers.length} geprüften Anbietern und {leagues.length} Wettbewerben.
              </p>

              {/* Stats Badges - Side-by-side with black text */}
              <div className="flex flex-row gap-3 w-full">
                <div className="bg-white/80 backdrop-blur-md border border-white/40 rounded-2xl p-3 sm:p-4 flex items-center gap-2 sm:gap-4 flex-1 shadow-lg hover:bg-white transition-all group">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-500/20 text-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner shrink-0">
                    <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-black text-gray-900 leading-none">{providers.length}</div>
                    <div className="text-[8px] sm:text-xs text-gray-600 font-bold uppercase tracking-tighter mt-0.5 sm:mt-1">Geprüfte Anbieter</div>
                  </div>
                </div>
                <div className="bg-white/80 backdrop-blur-md border border-white/40 rounded-2xl p-3 sm:p-4 flex items-center gap-2 sm:gap-4 flex-1 shadow-lg hover:bg-white transition-all group">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500/20 text-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner shrink-0">
                    <Award className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-black text-gray-900 leading-none">{leagues.length}</div>
                    <div className="text-[8px] sm:text-xs text-gray-600 font-bold uppercase tracking-tighter mt-0.5 sm:mt-1">Wettbewerbe</div>
                  </div>
                </div>

                {/* Team Card with Initials Fix */}
                <div className="bg-white/80 backdrop-blur-md border border-white/40 rounded-2xl p-3 sm:p-4 flex items-center gap-2 sm:gap-4 flex-1 shadow-lg hover:bg-white transition-all group cursor-pointer" onClick={() => window.location.href = '/ueber-uns'}>
                  <div className="flex -space-x-3 group-hover:space-x-1 transition-all">
                    {/* Alexander (AS) */}
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-white shadow-sm bg-blue-600 flex items-center justify-center text-white text-xs sm:text-sm font-bold">
                      AS
                    </div>
                    {/* David (DA) */}
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-white shadow-sm bg-emerald-600 flex items-center justify-center text-white text-xs sm:text-sm font-bold">
                      DA
                    </div>
                  </div>
                  <div>
                    <div className="text-sm sm:text-base font-black text-gray-900 leading-tight">Experten Team</div>
                    <div className="text-[8px] sm:text-xs text-gray-600 font-bold uppercase tracking-tighter mt-0.5">David & Alexander</div>
                  </div>
                </div>

                {/* Right: Latest Deal - Hidden on mobile */}
                <div className="hidden md:flex flex-col gap-2">
                  {latestDeal && (
                    <Card className="bg-white/90 backdrop-blur-md border border-white shadow-xl group overflow-hidden cursor-pointer" onClick={() => window.open(latestDeal.affiliate_link, '_blank')}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 bg-green-500/10 text-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner shrink-0 border border-green-100">
                            <Sparkles className="w-6 h-6" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-lg font-black text-gray-900 group-hover:text-green-600 transition-colors line-clamp-1">{latestDeal.headline}</div>
                            <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">{latestDeal.provider_name}</div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-black text-green-600">€{latestDeal.deal_price?.toFixed(2)}</span>
                            {latestDeal.normal_price > latestDeal.deal_price && (
                              <span className="text-sm text-gray-400 line-through font-medium">Statt €{latestDeal.normal_price?.toFixed(2)}</span>
                            )}
                            <span className="text-[10px] text-gray-500 font-medium uppercase tracking-tighter">Monatlich</span>
                          </div>

                          {latestDeal.text && (
                            <div className="text-xs text-gray-700 leading-relaxed font-medium bg-gray-50 p-2.5 rounded-lg border border-gray-100 line-clamp-2">
                              {latestDeal.text}
                            </div>
                          )}

                          <div className="flex items-center justify-end mt-2">
                            <div className="text-[9px] text-gray-400 font-medium tracking-tight">
                              Angebot endet: {latestDeal.end_date ? new Date(latestDeal.end_date).toLocaleDateString('de-DE') : 'Bald'}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="w-full px-4 py-4">

            {/* Comparison Search - Prominent Field above filters */}
            <div className="max-w-7xl mx-auto w-full mb-8">
              <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl border-2 border-green-500/20 ring-4 ring-green-500/5">
                <ComparisonSearch
                  clubs={clubs}
                  leagues={leagues}
                  selectedEntities={selectedEntities}
                  onSelectionChange={setSelectedEntities}
                  placeholder={isMobile ? "Suche Vereine & Ligen" : "Suche nach Vereinen (z.B. FC Bayern) oder Ligen..."}
                />
              </div>
            </div>

            {/* Mobile View - Card layout */}
            {isMobile ? (
              <div className="flex flex-col gap-4">
                {/* Horizontal Filter Bar for Mobile */}
                <HorizontalFilterBar
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                  availableOtherSports={availableOtherSports}
                />

                <div className="space-y-4">
                  {displayProviders.length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                      Keine Anbieter gefunden, die Ihren Kriterien entsprechen.
                    </div>
                  )}
                  {displayProviders.map((provider) => {
                    const monthlyPrice = parsePrice(provider.monthly_price);
                    const yearlyPrice = parsePrice(provider.yearly_price);
                    const isExpanded = expandedProvider === provider.streamer_id;
                    const costPerGame = calculateCostPerGame(provider);
                    const activeTab = activeTabs[provider.streamer_id] || 'coverage';
                    const savings = (monthlyPrice * 12) - (yearlyPrice * 12);

                    const tabs = [
                      { id: 'coverage', label: 'Abdeckung', icon: Trophy },
                      { id: 'prices', label: 'Preise', icon: CreditCard },
                      { id: 'features', label: 'Features', icon: Monitor },
                      { id: 'sports', label: 'Sports', icon: Sparkles },
                    ];

                    const categories = [
                      {
                        id: 'germany',
                        label: 'Deutschland',
                        leagues: ['bundesliga', 'second_bundesliga', 'third_bundesliga', 'dfb_pokal']
                      },
                      {
                        id: 'intl_comp',
                        label: 'Int. Wettbewerbe',
                        leagues: ['champions_league', 'europa_league', 'conference_league', 'club_world_cup']
                      },
                      {
                        id: 'intl_leagues',
                        label: 'Internat. Ligen',
                        leagues: ['premier_league', 'la_liga', 'serie_a', 'ligue_1', 'eredevise', 'sueper_lig', 'liga_portugal', 'saudi_pro_league', 'mls']
                      },
                      {
                        id: 'cups_more',
                        label: 'Pokale & mehr',
                        leagues: ['fa_cup', 'copa_del_rey', 'coppa_italia', 'coupe_de_france', 'efl_cup']
                      }
                    ];

                    const furtherOffers = (() => {
                      let offers = provider.further_offers;
                      if (typeof offers === 'string') {
                        try { offers = JSON.parse(offers); } catch (e) { offers = {}; }
                      }
                      return Array.isArray(offers)
                        ? offers
                        : (offers && typeof offers === 'object'
                          ? Object.keys(offers).filter(key => (offers as any)[key] === true)
                          : []);
                    })();

                    return (
                      <Card key={provider.streamer_id} className="overflow-hidden border-2 border-gray-100 shadow-sm transition-all hover:shadow-md">
                        <CardHeader className="pb-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-white border-2 border-gray-100 rounded-xl p-1 shadow-sm flex items-center justify-center shrink-0">
                                {provider.logo_url ? (
                                  <img src={provider.logo_url} alt={provider.name} className="w-full h-full object-contain rounded-lg" />
                                ) : (
                                  <div className="w-full h-full bg-green-50 rounded-lg flex items-center justify-center text-green-600 font-bold">
                                    {provider.name[0]}
                                  </div>
                                )}
                              </div>
                              <div>
                                <h3 className="font-bold text-gray-900 line-clamp-1">{provider.name}</h3>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xl font-bold text-green-600 leading-tight">
                                €{monthlyPrice.toFixed(2)}
                              </div>
                              <div className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Pro Monat</div>
                            </div>
                          </div>

                          <div className="mt-4 flex flex-wrap gap-1.5">
                            {provider.highlights?.highlight_1 && (
                              <div className="text-xs text-green-700 bg-green-100 rounded px-2 py-1">
                                {provider.highlights.highlight_1}
                              </div>
                            )}
                            {provider.highlights?.highlight_2 && (
                              <div className="text-xs text-blue-700 bg-blue-100 rounded px-2 py-1">
                                {provider.highlights.highlight_2}
                              </div>
                            )}
                            {provider.highlights?.highlight_3 && (
                              <div className="text-xs text-purple-700 bg-purple-100 rounded px-2 py-1">
                                {provider.highlights.highlight_3}
                              </div>
                            )}
                          </div>
                        </CardHeader>

                        <CardContent className="pb-4">
                          <div className="flex gap-2 mb-4">
                            <Button
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold h-12 shadow-lg active:scale-95 transition-all text-sm uppercase tracking-wide"
                              onClick={() => window.open(provider.affiliate_url, '_blank')}
                            >
                              Zum Angebot*
                            </Button>
                            <Button
                              variant="outline"
                              className={`h-12 px-6 font-semibold transition-all ${isExpanded ? 'bg-white text-gray-900 border-gray-200' : 'text-gray-700 hover:bg-gray-50'}`}
                              onClick={() => {
                                if (!isExpanded) {
                                  setActiveTabs(prev => ({ ...prev, [provider.streamer_id]: 'coverage' }));
                                }
                                toggleExpanded(provider.streamer_id);
                              }}
                            >
                              {isExpanded ? 'Weniger' : 'Details'}
                            </Button>
                          </div>

                          {isExpanded && (
                            <div className="mt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                              <div className="flex bg-green-50/50 rounded-lg p-1 mb-6 border border-green-100/30">
                                {tabs.map((tab) => (
                                  <button
                                    key={tab.id}
                                    onClick={() => setActiveTabs(prev => ({ ...prev, [provider.streamer_id]: tab.id }))}
                                    className={`flex-1 flex flex-col items-center justify-center py-1.5 rounded-md transition-all ${activeTab === tab.id
                                      ? 'bg-white text-green-600 shadow-sm border border-green-200'
                                      : 'text-gray-400 hover:text-green-500'
                                      }`}
                                  >
                                    <tab.icon className={`w-3.5 h-3.5 mb-0.5 ${activeTab === tab.id ? 'text-green-600' : 'text-gray-400'}`} />
                                    <span className="text-[7px] font-bold uppercase tracking-tight">{tab.label}</span>
                                  </button>
                                ))}
                              </div>

                              <div className="space-y-6 pt-2 border-t border-gray-100">
                                {activeTab === 'prices' && (
                                  <div className="space-y-5">
                                    <div className="flex items-center gap-2">
                                      <CreditCard className="w-4 h-4 text-green-600" />
                                      <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Preise & Modalitäten</h4>
                                    </div>
                                    <div className="grid grid-cols-1 gap-3">
                                      {savings > 0 && (
                                        <div className="bg-green-50/50 rounded-lg p-3 text-green-700 border border-green-100/50 flex items-center justify-between">
                                          <div className="flex flex-col">
                                            <span className="text-[8px] text-green-500 uppercase font-bold tracking-tight">Deine Ersparnis</span>
                                            <span className="text-sm font-bold">€{savings.toFixed(2)} / Jahr</span>
                                          </div>
                                          <TrendingUp className="w-3.5 h-3.5 text-green-400" />
                                        </div>
                                      )}
                                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex justify-between items-center">
                                        <div className="flex flex-col">
                                          <span className="text-[10px] text-gray-500 uppercase font-bold tracking-tight">Monatlich</span>
                                          <span className="text-lg font-black text-gray-900">€{monthlyPrice.toFixed(2)}</span>
                                        </div>
                                        <Badge className="bg-green-100 text-green-700 border-green-200">Flexibel</Badge>
                                      </div>
                                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex justify-between items-center">
                                        <div className="flex flex-col">
                                          <span className="text-[10px] text-gray-500 uppercase font-bold tracking-tight">Jährlich (Gesamt)</span>
                                          <span className="text-lg font-black text-gray-900">€{yearlyPrice.toFixed(2)}</span>
                                        </div>
                                        <div className="text-right">
                                          <div className="text-[10px] text-green-600 font-bold">Bestes Angebot</div>
                                          <div className="text-xs text-gray-500 font-medium">Bequem jährlich zahlen</div>
                                        </div>
                                      </div>
                                      <div className="grid grid-cols-2 gap-3 mt-1">
                                        <div className="bg-green-50/50 rounded-xl p-3 border border-green-100/50">
                                          <div className="text-[9px] text-green-700 uppercase font-bold">Mindestlaufzeit</div>
                                          <div className="text-sm font-bold text-gray-800">{provider.min_contract_duration || '1 Monat'}</div>
                                        </div>
                                        <div className="bg-blue-50/50 rounded-xl p-3 border border-blue-100/50">
                                          <div className="text-[9px] text-blue-700 uppercase font-bold">Kosten pro Spiel</div>
                                          <div className="text-sm font-bold text-gray-800">€{costPerGame.toFixed(2)}</div>
                                        </div>
                                      </div>
                                    </div>
                                    <Button
                                      className="w-full bg-green-600 hover:bg-green-700 text-white font-bold h-11 text-xs uppercase tracking-wider mt-4"
                                      onClick={() => window.open(provider.affiliate_url, '_blank')}
                                    >
                                      Jetzt Angebot sichern*
                                    </Button>
                                  </div>
                                )}

                                {activeTab === 'coverage' && (
                                  <div className="space-y-6">
                                    <div className="flex items-center gap-2">
                                      <Trophy className="w-4 h-4 text-green-600" />
                                      <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Streaming Coverage</h4>
                                    </div>
                                    {categories.map(category => (
                                      <div key={category.id} className="space-y-3 pl-2 border-l-2 border-gray-100">
                                        <h5 className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                                          {category.label}
                                        </h5>
                                        <div className="grid grid-cols-1 gap-2">
                                          {category.leagues.map(slug => {
                                            const coverage = getProviderCoverage(provider, slug);
                                            const leagueData = leagues.find(l => l.league_slug === slug);
                                            if (!leagueData) return null;
                                            return (
                                              <div key={slug} className="flex items-center justify-between text-xs py-2 px-3 bg-white border border-gray-50 rounded-lg shadow-sm">
                                                <span className="text-gray-600 font-medium">{leagueData.league}</span>
                                                <div className="flex items-center gap-2">
                                                  <span className={`text-[10px] font-bold ${coverage.percentage > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                                                    {coverage.percentage}%
                                                    <span className="ml-1 opacity-70">({coverage.coveredGames}/{coverage.totalGames})</span>
                                                  </span>
                                                  {coverage.percentage > 0 ? (
                                                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                                                      <Check className="w-3 h-3 text-green-600 stroke-[4px]" />
                                                    </div>
                                                  ) : (
                                                    <X className="w-3.5 h-3.5 text-gray-200" />
                                                  )}
                                                </div>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    ))}
                                    <Button
                                      className="w-full bg-green-600 hover:bg-green-700 text-white font-bold h-11 text-xs uppercase tracking-wider mt-2"
                                      onClick={() => window.open(provider.affiliate_url, '_blank')}
                                    >
                                      Jetzt passendes Abo finden*
                                    </Button>
                                  </div>
                                )}

                                {activeTab === 'features' && (
                                  <div className="space-y-5">
                                    <div className="flex items-center gap-2">
                                      <Monitor className="w-4 h-4 text-green-600" />
                                      <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Features & Quality</h4>
                                    </div>
                                    <div className="grid grid-cols-1 gap-3">
                                      {[
                                        { label: '4K Streaming Qualität', active: parseFeatures(provider).fourK, icon: Shield },
                                        { label: 'Mobile App Verfugbarkeit', active: parseFeatures(provider).mobile, icon: Monitor },
                                        { label: 'Offline / Download Modus', active: parseFeatures(provider).download, icon: Download },
                                        { label: `${parseFeatures(provider).streams}x Parallele Streams`, active: parseFeatures(provider).multiStream || parseFeatures(provider).streams > 1, icon: Users },
                                      ].map((feat, idx) => (
                                        <div key={idx} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${feat.active ? 'bg-green-50/30 border-green-100' : 'bg-gray-50/50 border-gray-100 opacity-60'}`}>
                                          <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${feat.active ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                              <feat.icon className="w-4 h-4" />
                                            </div>
                                            <span className="text-xs font-bold text-gray-700">{feat.label}</span>
                                          </div>
                                          {feat.active ? (
                                            <Check className="w-5 h-5 text-green-500 stroke-[3px]" />
                                          ) : (
                                            <X className="w-5 h-5 text-gray-300" />
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                    <Button
                                      className="w-full bg-green-600 hover:bg-green-700 text-white font-bold h-11 text-xs uppercase tracking-wider mt-4"
                                      onClick={() => window.open(provider.affiliate_url, '_blank')}
                                    >
                                      Jetzt Features nutzen*
                                    </Button>
                                  </div>
                                )}

                                {activeTab === 'sports' && (
                                  <div className="space-y-5">
                                    <div className="flex items-center gap-2">
                                      <Sparkles className="w-4 h-4 text-green-600" />
                                      <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Weitere Sportangebote</h4>
                                    </div>
                                    {furtherOffers.length > 0 ? (
                                      <div className="grid grid-cols-2 gap-2 pl-2">
                                        {furtherOffers.map(sport => (
                                          <div key={sport} className="flex items-center gap-2 bg-white p-3 rounded-lg border border-gray-50 shadow-sm">
                                            <div className="w-2 h-2 rounded-full bg-green-500" />
                                            <span className="text-xs font-bold text-gray-700">{sport}</span>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                        <Info className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                        <p className="text-xs text-gray-400 font-medium">Keine weiteren Sportarten gelistet</p>
                                      </div>
                                    )}
                                    <Button
                                      className="w-full bg-green-600 hover:bg-green-700 text-white font-bold h-11 text-xs uppercase tracking-wider mt-6"
                                      onClick={() => window.open(provider.affiliate_url, '_blank')}
                                    >
                                      Jetzt gesamte Sportwelt sichern*
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Desktop View - Table layout with horizontal filter bar */
              <div className="flex flex-col gap-4">
                {/* Horizontal Filter Bar above table */}
                <div className="max-w-7xl mx-auto w-full">
                  <HorizontalFilterBar
                    filters={filters}
                    onFiltersChange={handleFiltersChange}
                    availableOtherSports={availableOtherSports}
                  />
                </div>
                {/* Table */}
                <div className="bg-white rounded-lg border overflow-auto">
                  <div className="relative">
                    <table className="w-full min-w-[1200px]">
                      <thead>
                        {/* Provider Logo/Name Row */}
                        <tr className="border-b sticky top-0 bg-white z-20">
                          <th className="w-40 p-3 bg-gray-50 font-medium border-r text-sm text-left sticky left-0 z-30"></th>
                          {displayProviders.map(provider => {
                            const isPinned = pinnedProviders.includes(provider.streamer_id);
                            return (
                              <th key={provider.streamer_id} className="w-96 min-w-[250px] p-3 text-center border-r last:border-r-0 bg-white">
                                <div className="flex flex-col items-center justify-center">
                                  {provider.logo_url ? (
                                    <img src={provider.logo_url} alt={provider.name} className="w-10 h-10 object-contain rounded-full bg-white border mb-1" />
                                  ) : (
                                    <span className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-200 mb-1">📺</span>
                                  )}
                                  <span className="text-sm font-semibold text-gray-900">{provider.name}</span>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => togglePin(provider.streamer_id)}
                                    className={isPinned ? "bg-green-50 border-green-300 mt-2" : "mt-2"}
                                    aria-label={isPinned ? "Unpin provider" : "Pin provider"}
                                  >
                                    <Pin className={`h-4 w-4 ${isPinned ? "text-green-600" : ""}`} />
                                  </Button>
                                </div>
                              </th>
                            );
                          })}
                        </tr>
                        {/* Jetzt abonnieren Button Row */}
                        <tr className="border-b sticky top-[73px] bg-white z-20">
                          <th className="w-40 p-3 bg-gray-50 font-medium border-r text-sm text-left sticky left-0 z-30">Jetzt abonnieren</th>
                          {displayProviders.map(provider => (
                            <td key={provider.streamer_id} className="w-96 min-w-[250px] p-3 text-center border-r last:border-r-0 bg-white">
                              {provider.affiliate_url && (
                                <Button className="w-full bg-green-600 hover:bg-green-700 text-white text-sm py-2" onClick={() => window.open(provider.affiliate_url, '_blank')}>
                                  Jetzt abonnieren*
                                </Button>
                              )}
                            </td>
                          ))}
                        </tr>
                      </thead>
                      <tbody>

                        {/* Highlights Section */}
                        <tr className="border-b">
                          <td className="w-40 p-3 bg-gray-50 font-medium border-r text-sm sticky left-0 z-10">Highlights</td>
                          {displayProviders.map(provider => (
                            <td key={provider.streamer_id} className="w-96 min-w-[250px] p-2 border-r last:border-r-0">
                              <div className="space-y-1">
                                {provider.highlights?.highlight_1 && (
                                  <div className="text-xs text-green-700 bg-green-100 rounded px-2 py-1">
                                    {provider.highlights.highlight_1}
                                  </div>
                                )}
                                {provider.highlights?.highlight_2 && (
                                  <div className="text-xs text-blue-700 bg-blue-100 rounded px-2 py-1">
                                    {provider.highlights.highlight_2}
                                  </div>
                                )}
                                {provider.highlights?.highlight_3 && (
                                  <div className="text-xs text-purple-700 bg-purple-100 rounded px-2 py-1">
                                    {provider.highlights.highlight_3}
                                  </div>
                                )}
                              </div>
                            </td>
                          ))}
                        </tr>


                        {/* Monthly Price Section */}
                        <tr className="border-b">
                          <td className="w-40 p-3 bg-gray-50 font-medium border-r text-sm sticky left-0 z-10">Monatlicher Preis</td>
                          {displayProviders.map(provider => (
                            <td key={provider.streamer_id} className="w-96 min-w-[250px] p-3 text-center border-r last:border-r-0">
                              <span className="text-sm font-semibold text-green-600">
                                {parsePrice(provider.monthly_price).toFixed(2)}€
                              </span>
                            </td>
                          ))}
                        </tr>

                        {/* Yearly Price Section */}
                        <tr className="border-b">
                          <td className="w-40 p-3 bg-gray-50 font-medium border-r text-sm sticky left-0 z-10">Jährlicher Preis</td>
                          {displayProviders.map(provider => (
                            <td key={provider.streamer_id} className="w-96 min-w-[250px] p-3 text-center border-r last:border-r-0">
                              <span className="text-sm font-semibold">
                                {parsePrice(provider.yearly_price).toFixed(2)}€
                              </span>
                              {provider.yearly_price && provider.monthly_price && (
                                <div className="text-xs text-green-600 font-medium mt-1">
                                  {(() => {
                                    const savings = (parsePrice(provider.monthly_price) * 12 - parsePrice(provider.yearly_price) * 12);
                                    return savings > 0 ? `Ersparnis: ${savings.toFixed(0)}€/Jahr` : null;
                                  })()}
                                </div>
                              )}
                            </td>
                          ))}
                        </tr>

                        {/* Cost Per Game Section */}
                        <tr className="border-b">
                          <td className="w-40 p-3 bg-gray-50 font-medium border-r text-sm sticky left-0 z-10">Kosten pro Spiel</td>
                          {displayProviders.map(provider => (
                            <td key={provider.streamer_id} className="w-96 min-w-[250px] p-3 text-center border-r last:border-r-0">
                              <span className="text-sm font-semibold text-blue-600">
                                {calculateCostPerGame(provider).toFixed(2)}€
                              </span>
                              <div className="text-xs text-gray-500">pro Spiel</div>
                            </td>
                          ))}
                        </tr>

                        {/* Min. Vertragslaufzeit Section */}
                        <tr className="border-b">
                          <td className="w-40 p-3 bg-gray-50 font-medium border-r text-sm sticky left-0 z-10">Min. Vertragslaufzeit</td>
                          {displayProviders.map(provider => (
                            <td key={provider.streamer_id} className="w-96 min-w-[250px] p-3 text-center border-r last:border-r-0">
                              <span className="text-xs text-gray-700">
                                {provider.min_contract_duration || '-'}
                              </span>
                            </td>
                          ))}
                        </tr>

                        {/* Features Section */}
                        <tr className="border-b">
                          <td className="w-40 p-3 bg-gray-50 font-medium border-r text-sm sticky left-0 z-10">Features</td>
                          {displayProviders.map(provider => {
                            const features = parseFeatures(provider);
                            return (
                              <td key={provider.streamer_id} className="w-96 min-w-[250px] p-2 border-r last:border-r-0">
                                <div className="grid grid-cols-1 gap-1 text-xs">
                                  <div className="flex items-center gap-1">
                                    {features.fourK ? <Check className="h-3 w-3 text-green-600" /> : <X className="h-3 w-3 text-red-500" />}
                                    4K
                                  </div>
                                  <div className="flex items-center gap-1">
                                    {features.mobile ? <Check className="h-3 w-3 text-green-600" /> : <X className="h-3 w-3 text-red-500" />}
                                    Mobile
                                  </div>
                                  <div className="flex items-center gap-1">
                                    {features.download ? <Check className="h-3 w-3 text-green-600" /> : <X className="h-3 w-3 text-red-500" />}
                                    Download
                                  </div>
                                  <div className="flex items-center gap-1">
                                    {features.multiStream ? <Check className="h-3 w-3 text-green-600" /> : <X className="h-3 w-3 text-red-500" />}
                                    Multi ({features.streams})
                                  </div>
                                </div>
                              </td>
                            );
                          })}
                        </tr>

                        {/* Weitere Sportarten Section */}
                        <tr className="border-b">
                          <td className="w-40 p-3 bg-gray-50 font-medium border-r text-sm sticky left-0 z-10">Weitere Sportarten</td>
                          {displayProviders.map(provider => {
                            let offers = provider.further_offers;
                            if (typeof offers === 'string') {
                              try { offers = JSON.parse(offers); } catch (e) { offers = {}; }
                            }

                            // Handle both array format and object format { "Tennis": true }
                            const offersList = Array.isArray(offers)
                              ? offers
                              : (offers && typeof offers === 'object'
                                ? Object.keys(offers).filter(key => (offers as any)[key] === true)
                                : []);

                            return (
                              <td key={provider.streamer_id} className="w-96 min-w-[250px] p-2 border-r last:border-r-0">
                                {offersList.length > 0 ? (
                                  <div className="flex flex-wrap gap-1">
                                    {offersList.map((sport: string) => (
                                      <Badge key={sport} variant="outline" className="text-[10px] py-0 px-1 border-green-200 bg-green-50">
                                        {sport}
                                      </Badge>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-xs text-gray-400">-</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>

                        {/* Leagues Section */}
                        {Object.entries(groupedLeagues).map(([country, countryLeagues]) => (
                          <React.Fragment key={country}>
                            {/* Country Header Row */}
                            <tr className="bg-gray-50">
                              <td className="w-40 p-2 font-medium border-r text-xs text-gray-700 sticky left-0 z-10 bg-gray-50">
                                {country}
                              </td>
                              {displayProviders.map((provider) => (
                                <td key={provider.streamer_id} className="w-96 min-w-[250px] border-r last:border-r-0"></td>
                              ))}
                            </tr>

                            {/* League Rows */}
                            {countryLeagues
                              .filter(league => filters.leagues.length === 0 || filters.leagues.includes(league.league_slug || ''))
                              .map(league => (
                                <tr key={league.league_slug} className="border-b">
                                  <td className="w-40 p-2 border-r sticky left-0 z-10 bg-white">
                                    <span className="text-xs">{league.league}</span>
                                  </td>
                                  {displayProviders.map(provider => {
                                    const coverage = getProviderCoverage(provider, league.league_slug || '');
                                    return (
                                      <td key={provider.streamer_id} className="w-96 min-w-[250px] p-2 text-center border-r last:border-r-0">
                                        <div className={`inline-flex items-center px-2 py-1 rounded text-xs ${getCellBackgroundColor(coverage.percentage)}`}>
                                          {coverage.percentage}%
                                          <span className="ml-1">({coverage.coveredGames}/{coverage.totalGames})</span>
                                        </div>
                                      </td>
                                    );
                                  })}
                                </tr>
                              ))}
                          </React.Fragment>
                        ))}

                        {/* Final CTA Section */}
                        <tr>
                          <td className="w-40 p-3 bg-gray-50 font-semibold border-r text-sm sticky left-0 z-10">Angebot</td>
                          {displayProviders.map(provider => (
                            <td key={provider.streamer_id} className="w-96 min-w-[250px] p-3 text-center border-r last:border-r-0">
                              <Button
                                className="w-full bg-green-600 hover:bg-green-700 text-white text-sm py-2"
                                onClick={() => window.open(provider.affiliate_url, '_blank')}
                              >
                                Zum Angebot*
                              </Button>
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Disclaimer and Note */}
                <div className="mt-6 p-4 bg-white rounded-lg border border-gray-100 shadow-sm max-w-4xl mx-auto">
                  <p className="text-xs text-gray-600 leading-relaxed text-center">
                    <strong>Sortierung:</strong> Die Anbieter werden standardmäßig nach ihrer Gesamtabdeckung der Top-Ligen (Bundesliga, Premier League, La Liga, Serie A, Ligue 1) sowie der Champions League und Europa League sortiert. So siehst du immer zuerst die Anbieter mit dem umfangreichsten Fußball-Angebot.
                  </p>
                  <div className="mt-3 pt-3 border-t border-gray-100 text-[10px] text-gray-500 text-center">
                    * Affiliate-Links: Bei Abschluss eines Abonnements über diese Links erhalten wir eine Provision. Der Preis für dich bleibt gleich.
                  </div>
                </div>
              </div>
            )}
          </div>
          <Footer />
        </div>
        );
};

        export default DetailVergleich;