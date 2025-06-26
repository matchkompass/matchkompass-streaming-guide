
import { Club } from '@/hooks/useClubs';
import { StreamingProvider } from '@/hooks/useStreaming';
import { League } from '@/hooks/useLeagues';

export interface CompetitionCoverage {
  competition: string;
  totalGames: number;
  coveredGames: number;
  coverage: number;
}

export interface EnhancedProviderRecommendation {
  type: string;
  coverage: number;
  price: number;
  yearlyPrice?: number;
  providers: StreamingProvider[];
  competitions: CompetitionCoverage[];
  totalGames: number;
  coveredGames: number;
  description: string;
  highlight: string;
  savings?: number;
  costPerGame?: number;
}

const COMPETITION_MAPPING = {
  bundesliga: 'bundesliga',
  second_bundesliga: 'second_bundesliga',
  dfb_pokal: 'dfb_pokal',
  champions_league: 'champions_league',
  europa_league: 'europa_league',
  conference_league: 'conference_league',
  club_world_cup: 'club_world_cup',
  premier_league: 'premier_league',
  fa_cup: 'fa_cup',
  la_liga: 'la_liga',
  copa_del_rey: 'copa_del_rey',
  serie_a: 'serie_a',
  ligue_1: 'ligue_1',
  eredevise: 'eredevise',
  liga_portugal: 'liga_portugal',
  sueper_lig: 'sueper_lig',
  mls: 'mls',
  saudi_pro_league: 'saudi_pro_league'
};

export const getClubCompetitions = (club: Club): string[] => {
  const competitions: string[] = [];
  
  Object.entries(COMPETITION_MAPPING).forEach(([key, value]) => {
    if (club[key as keyof Club] === true) {
      competitions.push(value);
    }
  });
  
  return competitions;
};

export const getAllCompetitionsForClubs = (clubs: Club[]): string[] => {
  const competitionsSet = new Set<string>();
  
  clubs.forEach(club => {
    const clubCompetitions = getClubCompetitions(club);
    clubCompetitions.forEach(comp => competitionsSet.add(comp));
  });
  
  return Array.from(competitionsSet);
};

const parsePrice = (priceString?: string): number => {
  if (!priceString) return 0;
  return parseFloat(priceString.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
};

const calculateProviderCombinationCoverage = (
  providers: StreamingProvider[],
  selectedCompetitions: string[],
  leagues: League[]
): { competitions: CompetitionCoverage[]; totalGames: number; coveredGames: number; coverage: number } => {
  let totalGames = 0;
  let totalCoveredGames = 0;
  const competitions: CompetitionCoverage[] = [];

  selectedCompetitions.forEach(comp => {
    const league = leagues.find(l => l.league_slug === comp);
    const totalCompGames = league ? league['number of games'] : 0;
    
    // Calculate maximum coverage from all providers for this competition
    let maxCoveredForComp = 0;
    providers.forEach(provider => {
      const providerGames = provider[comp as keyof StreamingProvider] as number || 0;
      maxCoveredForComp = Math.max(maxCoveredForComp, providerGames);
    });
    
    const covered = Math.min(maxCoveredForComp, totalCompGames);
    
    competitions.push({
      competition: comp,
      totalGames: totalCompGames,
      coveredGames: covered,
      coverage: totalCompGames > 0 ? Math.round((covered / totalCompGames) * 100) : 0
    });
    
    totalGames += totalCompGames;
    totalCoveredGames += covered;
  });

  const overallCoverage = totalGames > 0 ? Math.min(100, Math.round((totalCoveredGames / totalGames) * 100)) : 0;

  return {
    competitions,
    totalGames,
    coveredGames: totalCoveredGames,
    coverage: overallCoverage
  };
};

const generateProviderCombinations = (providers: StreamingProvider[]): StreamingProvider[][] => {
  const combinations: StreamingProvider[][] = [];
  
  // Single providers
  providers.forEach(provider => {
    combinations.push([provider]);
  });
  
  // Two-provider combinations
  for (let i = 0; i < providers.length; i++) {
    for (let j = i + 1; j < providers.length; j++) {
      combinations.push([providers[i], providers[j]]);
    }
  }
  
  // Three-provider combinations (limited to most relevant ones)
  const topProviders = providers.slice(0, 4); // Limit to top 4 providers
  for (let i = 0; i < topProviders.length; i++) {
    for (let j = i + 1; j < topProviders.length; j++) {
      for (let k = j + 1; k < topProviders.length; k++) {
        combinations.push([topProviders[i], topProviders[j], topProviders[k]]);
      }
    }
  }
  
  return combinations;
};

export const calculateEnhancedCoverage = (
  selectedClubs: Club[],
  selectedCompetitions: string[],
  providers: StreamingProvider[],
  leagues: League[]
): EnhancedProviderRecommendation[] => {
  if (selectedClubs.length === 0 || selectedCompetitions.length === 0 || providers.length === 0) {
    return [];
  }

  // Generate all possible provider combinations
  const combinations = generateProviderCombinations(providers);
  const recommendations: EnhancedProviderRecommendation[] = [];

  combinations.forEach(providerCombo => {
    const { competitions, totalGames, coveredGames, coverage } = calculateProviderCombinationCoverage(
      providerCombo,
      selectedCompetitions,
      leagues
    );

    const monthlyPrice = providerCombo.reduce((sum, provider) => sum + parsePrice(provider.monthly_price), 0);
    const yearlyPrice = providerCombo.reduce((sum, provider) => {
      const yearly = parsePrice(provider.yearly_price);
      return sum + (yearly || monthlyPrice * 12);
    }, 0);

    const costPerGame = coveredGames > 0 ? monthlyPrice / coveredGames : Infinity;

    const getRecommendationType = (providers: StreamingProvider[], coverage: number, price: number) => {
      if (providers.length === 1) {
        return `${providers[0].provider_name}`;
      } else {
        return `${providers.length}-Anbieter Kombination`;
      }
    };

    const getDescription = (providers: StreamingProvider[], coverage: number) => {
      if (providers.length === 1) {
        return `Alle Inhalte über ${providers[0].provider_name}`;
      } else {
        return `Optimale Kombination aus ${providers.map(p => p.provider_name).join(' + ')}`;
      }
    };

    const getHighlight = (coverage: number, price: number, costPerGame: number) => {
      if (coverage >= 95) return 'Komplettabdeckung';
      if (coverage >= 90) return 'Premium';
      if (price <= 30) return 'Budget';
      if (costPerGame <= 2) return 'Preis-Hit';
      return 'Solide Option';
    };

    recommendations.push({
      type: getRecommendationType(providerCombo, coverage, monthlyPrice),
      coverage,
      price: monthlyPrice,
      yearlyPrice: yearlyPrice > 0 ? yearlyPrice : undefined,
      providers: providerCombo,
      competitions,
      totalGames,
      coveredGames,
      description: getDescription(providerCombo, coverage),
      highlight: getHighlight(coverage, monthlyPrice, costPerGame),
      costPerGame,
      savings: providerCombo.length > 1 ? Math.max(0, (providerCombo.reduce((sum, p) => sum + parsePrice(p.monthly_price), 0) * 0.1)) : undefined
    });
  });

  // Sort recommendations by a composite score
  recommendations.sort((a, b) => {
    const scoreA = (a.coverage * 0.6) + ((100 - Math.min(a.price, 100)) * 0.3) + (a.coveredGames * 0.1);
    const scoreB = (b.coverage * 0.6) + ((100 - Math.min(b.price, 100)) * 0.3) + (b.coveredGames * 0.1);
    return scoreB - scoreA;
  });

  // Create final recommendation tiers
  const finalRecommendations: EnhancedProviderRecommendation[] = [];
  
  // Best overall (highest coverage)
  const bestOverall = recommendations.find(r => r.coverage >= 90) || recommendations[0];
  if (bestOverall) {
    finalRecommendations.push({
      ...bestOverall,
      type: 'Beste Abdeckung',
      description: 'Maximale Spieleabdeckung für deine Auswahl',
      highlight: 'Empfohlen'
    });
  }

  // Best value (best cost per game ratio under €40)
  const bestValue = recommendations
    .filter(r => r.price <= 40 && r.coverage >= 70 && r !== bestOverall)
    .sort((a, b) => (a.costPerGame || Infinity) - (b.costPerGame || Infinity))[0];
  
  if (bestValue) {
    finalRecommendations.push({
      ...bestValue,
      type: 'Preis-Leistungs-Sieger',
      description: 'Beste Balance zwischen Kosten und Abdeckung',
      highlight: 'Beliebt'
    });
  }

  // Budget option (cheapest with decent coverage)
  const budgetOption = recommendations
    .filter(r => r.coverage >= 50 && r !== bestOverall && r !== bestValue)
    .sort((a, b) => a.price - b.price)[0];
  
  if (budgetOption) {
    finalRecommendations.push({
      ...budgetOption,
      type: 'Budget-Option',
      description: 'Günstigste Option für die wichtigsten Spiele',
      highlight: 'Günstig'
    });
  }

  return finalRecommendations.slice(0, 3);
};
