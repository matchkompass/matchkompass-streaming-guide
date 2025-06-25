
import { Club } from '@/hooks/useClubs';
import { StreamingProvider } from '@/hooks/useStreaming';
import { League } from '@/hooks/useLeagues';

export interface CompetitionCoverage {
  competition: string;
  totalGames: number;
  coveredGames: number;
  coverage: number;
}

export interface ProviderRecommendation {
  type: string;
  coverage: number;
  price: number;
  providers: StreamingProvider[];
  competitions: CompetitionCoverage[];
  totalGames: number;
  coveredGames: number;
  description: string;
  highlight: string;
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
  copa_del_rey: 'copa_del_rey'
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

export const calculateCoverage = (
  selectedClubs: Club[],
  selectedCompetitions: string[],
  providers: StreamingProvider[],
  leagues: League[]
): ProviderRecommendation[] => {
  // Calculate total games for selected competitions
  let totalGames = 0;
  const competitionGames: { [key: string]: number } = {};
  
  selectedCompetitions.forEach(comp => {
    const league = leagues.find(l => l.league_slug === comp);
    const games = league ? league['number of games'] : 0;
    competitionGames[comp] = games;
    totalGames += games;
  });

  // Calculate coverage for each provider combination
  const recommendations: ProviderRecommendation[] = [];

  // Single provider recommendations
  providers.forEach(provider => {
    let coveredGames = 0;
    const competitions: CompetitionCoverage[] = [];

    selectedCompetitions.forEach(comp => {
      const providerGames = provider[comp as keyof StreamingProvider] as number || 0;
      const totalCompGames = competitionGames[comp];
      const covered = Math.min(providerGames, totalCompGames);
      
      competitions.push({
        competition: comp,
        totalGames: totalCompGames,
        coveredGames: covered,
        coverage: totalCompGames > 0 ? Math.round((covered / totalCompGames) * 100) : 0
      });
      
      coveredGames += covered;
    });

    const overallCoverage = totalGames > 0 ? Math.min(100, Math.round((coveredGames / totalGames) * 100)) : 0;
    const monthlyPrice = parseFloat(provider.monthly_price?.replace(/[^\d.,]/g, '').replace(',', '.') || '0');

    recommendations.push({
      type: `${provider.provider_name}`,
      coverage: overallCoverage,
      price: monthlyPrice,
      providers: [provider],
      competitions,
      totalGames,
      coveredGames,
      description: `${provider.provider_name} Einzelpaket`,
      highlight: overallCoverage >= 90 ? 'Empfohlen' : overallCoverage >= 50 ? 'Gut' : 'Basis'
    });
  });

  // Multi-provider combinations (simplified - top combinations)
  // This would need more sophisticated logic for all combinations
  
  // Sort by coverage and price
  recommendations.sort((a, b) => {
    if (Math.abs(a.coverage - b.coverage) < 5) {
      return a.price - b.price;
    }
    return b.coverage - a.coverage;
  });

  // Create final recommendation tiers
  const finalRecommendations: ProviderRecommendation[] = [];
  
  // Maximum coverage option
  const maxCoverage = recommendations.find(r => r.coverage >= 90) || recommendations[0];
  if (maxCoverage) {
    finalRecommendations.push({
      ...maxCoverage,
      type: 'Maximalabdeckung',
      description: 'Beste Abdeckung für deine Vereine',
      highlight: 'Empfohlen'
    });
  }

  // Balanced option
  const balancedOption = recommendations.find(r => r.coverage >= 70 && r.coverage < 90) || recommendations[1];
  if (balancedOption && balancedOption !== maxCoverage) {
    finalRecommendations.push({
      ...balancedOption,
      type: 'Preis-Leistungs-Empfehlung',
      description: 'Beste Balance zwischen Kosten und Abdeckung',
      highlight: 'Beliebt'
    });
  }

  // Budget option
  const budgetOption = recommendations.find(r => r.price < 40) || recommendations[recommendations.length - 1];
  if (budgetOption && !finalRecommendations.includes(budgetOption)) {
    finalRecommendations.push({
      ...budgetOption,
      type: 'Budget-Option',
      description: 'Günstigste Option für die wichtigsten Spiele',
      highlight: 'Günstig'
    });
  }

  return finalRecommendations.slice(0, 3);
};
