import { supabase } from '@/integrations/supabase/client';
import { StreamingProviderEnhanced } from '@/hooks/useStreamingEnhanced';
import { LeagueEnhanced } from '@/hooks/useLeaguesEnhanced';
import { Club } from '@/hooks/useClubs';

export interface OptimizationRequest {
  selectedClubs: Club[];
  selectedCompetitions: string[];
  existingProviders: number[];
  maxProviders?: number;
  targetCoverage?: number;
  budgetLimit?: number;
}

export interface CompetitionCoverage {
  competition: string;
  totalGames: number;
  coveredGames: number;
  coverage: number;
}

export interface EnhancedOptimizationResult {
  providers: StreamingProviderEnhanced[];
  totalCost: number;
  coveragePercentage: number;
  coveredLeagues: number;
  totalLeagues: number;
  costPerGame?: number;
  rank: number;
  type: 'combination' | 'individual';
  competitions: CompetitionCoverage[];
  savings?: number;
  yearlyPrice?: number;
  efficiency: number; // Coverage per euro
}

export class EnhancedStreamingOptimizer {
  private cache = new Map<string, EnhancedOptimizationResult[]>();

  constructor() {}

  async optimizeForSelection(request: OptimizationRequest): Promise<{
    combinations: EnhancedOptimizationResult[];
    individuals: EnhancedOptimizationResult[];
  }> {
    const cacheKey = JSON.stringify(request);
    
    try {
      // Get all available providers (excluding existing ones)
      const availableProviders = await this.getAvailableProviders(request.existingProviders);
      
      // Calculate league coverage requirements
      const leagueRequirements = await this.calculateLeagueRequirements(
        request.selectedCompetitions
      );

      // Generate all possible combinations
      const combinations = await this.generateOptimalCombinations(
        availableProviders,
        leagueRequirements,
        request
      );

      // Generate individual provider recommendations
      const individuals = await this.generateIndividualRecommendations(
        availableProviders,
        leagueRequirements,
        request
      );

      return {
        combinations: combinations.slice(0, 50), // Top 50 combinations
        individuals: individuals.slice(0, 20)    // Top 20 individual providers
      };

    } catch (error) {
      console.error('Optimization error:', error);
      throw new Error('Failed to optimize streaming selection');
    }
  }

  private async getAvailableProviders(existingProviders: number[]): Promise<StreamingProviderEnhanced[]> {
    const { data, error } = await supabase
      .from('streaming')
      .select('*')
      .not('streamer_id', 'in', `(${existingProviders.join(',')})`)
      .order('provider_name');

    if (error) throw error;

    return (data || []).map(provider => ({
      ...provider,
      highlights: {
        highlight_1: provider.highlight_1 || '',
        highlight_2: provider.highlight_2 || '',
        highlight_3: provider.highlight_3 || ''
      },
      min_contract_duration: provider.min_contract_duration || ''
    }));
  }

  private async calculateLeagueRequirements(selectedCompetitions: string[]): Promise<{
    [league: string]: number;
  }> {
    const { data, error } = await supabase
      .from('leagues')
      .select('league_slug, "number of games"')
      .in('league_slug', selectedCompetitions);

    if (error) throw error;

    const requirements: { [league: string]: number } = {};
    data?.forEach(league => {
      requirements[league.league_slug] = league['number of games'] || 0;
    });

    return requirements;
  }

  private async generateOptimalCombinations(
    providers: StreamingProviderEnhanced[],
    leagueRequirements: { [league: string]: number },
    request: OptimizationRequest
  ): Promise<EnhancedOptimizationResult[]> {
    const combinations: EnhancedOptimizationResult[] = [];
    const maxCombinationSize = Math.min(request.maxProviders || 4, 4);

    // Generate combinations of different sizes
    for (let size = 1; size <= maxCombinationSize; size++) {
      const sizeCombinations = this.generateCombinations(providers, size);
      
      for (const combination of sizeCombinations) {
        const result = this.evaluateCombination(
          combination,
          leagueRequirements,
          request.selectedCompetitions
        );

        if (result.coveragePercentage >= (request.targetCoverage || 0)) {
          combinations.push({
            ...result,
            type: 'combination',
            rank: 0 // Will be set later
          });
        }
      }
    }

    // Sort by efficiency (coverage per euro) and coverage
    combinations.sort((a, b) => {
      // Primary: Coverage percentage (higher is better)
      if (Math.abs(a.coveragePercentage - b.coveragePercentage) > 5) {
        return b.coveragePercentage - a.coveragePercentage;
      }
      // Secondary: Efficiency (coverage per euro)
      return b.efficiency - a.efficiency;
    });

    // Assign ranks
    combinations.forEach((combo, index) => {
      combo.rank = index + 1;
    });

    return combinations;
  }

  private async generateIndividualRecommendations(
    providers: StreamingProviderEnhanced[],
    leagueRequirements: { [league: string]: number },
    request: OptimizationRequest
  ): Promise<EnhancedOptimizationResult[]> {
    const individuals: EnhancedOptimizationResult[] = [];

    providers.forEach(provider => {
      const result = this.evaluateCombination(
        [provider],
        leagueRequirements,
        request.selectedCompetitions
      );

      individuals.push({
        ...result,
        type: 'individual',
        rank: 0 // Will be set later
      });
    });

    // Sort by coverage percentage, then by price
    individuals.sort((a, b) => {
      if (Math.abs(a.coveragePercentage - b.coveragePercentage) > 5) {
        return b.coveragePercentage - a.coveragePercentage;
      }
      return a.totalCost - b.totalCost;
    });

    // Assign ranks
    individuals.forEach((individual, index) => {
      individual.rank = index + 1;
    });

    return individuals;
  }

  private evaluateCombination(
    providers: StreamingProviderEnhanced[],
    leagueRequirements: { [league: string]: number },
    selectedCompetitions: string[]
  ): Omit<EnhancedOptimizationResult, 'type' | 'rank'> {
    let totalCost = 0;
    let yearlyPrice = 0;
    let totalGames = 0;
    let coveredGames = 0;
    const competitions: CompetitionCoverage[] = [];

    // Calculate total cost
    providers.forEach(provider => {
      totalCost += this.parsePrice(provider.monthly_price);
      const yearly = this.parsePrice(provider.yearly_price);
      yearlyPrice += yearly || (this.parsePrice(provider.monthly_price) * 12);
    });

    // Calculate coverage for each competition
    selectedCompetitions.forEach(competition => {
      const totalCompGames = leagueRequirements[competition] || 0;
      let maxCoveredForComp = 0;

      // Find maximum coverage from any provider in the combination
      providers.forEach(provider => {
        const providerGames = (provider[competition as keyof StreamingProviderEnhanced] as number) || 0;
        maxCoveredForComp = Math.max(maxCoveredForComp, providerGames);
      });

      const covered = Math.min(maxCoveredForComp, totalCompGames);
      
      competitions.push({
        competition,
        totalGames: totalCompGames,
        coveredGames: covered,
        coverage: totalCompGames > 0 ? Math.round((covered / totalCompGames) * 100) : 0
      });

      totalGames += totalCompGames;
      coveredGames += covered;
    });

    const coveragePercentage = totalGames > 0 ? Math.round((coveredGames / totalGames) * 100) : 0;
    const costPerGame = coveredGames > 0 ? totalCost / coveredGames : Infinity;
    const efficiency = totalCost > 0 ? coveragePercentage / totalCost : 0;

    // Calculate potential savings for combinations
    const savings = providers.length > 1 ? 
      Math.max(0, (providers.reduce((sum, p) => sum + this.parsePrice(p.monthly_price), 0) * 0.05)) : 
      undefined;

    return {
      providers,
      totalCost: Math.round(totalCost * 100) / 100,
      yearlyPrice: yearlyPrice > 0 ? Math.round(yearlyPrice * 100) / 100 : undefined,
      coveragePercentage,
      coveredLeagues: competitions.filter(c => c.coverage > 0).length,
      totalLeagues: selectedCompetitions.length,
      costPerGame: costPerGame !== Infinity ? Math.round(costPerGame * 100) / 100 : undefined,
      competitions,
      savings,
      efficiency: Math.round(efficiency * 100) / 100
    };
  }

  private generateCombinations<T>(arr: T[], size: number): T[][] {
    if (size > arr.length || size <= 0) return [];
    if (size === 1) return arr.map(item => [item]);

    const combinations: T[][] = [];
    
    for (let i = 0; i <= arr.length - size; i++) {
      const head = arr[i];
      const tailCombinations = this.generateCombinations(arr.slice(i + 1), size - 1);
      
      for (const tail of tailCombinations) {
        combinations.push([head, ...tail]);
      }
    }
    
    return combinations;
  }

  private parsePrice(priceString?: string): number {
    if (!priceString) return 0;
    return parseFloat(priceString.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
  }

  clearCache(): void {
    this.cache.clear();
  }
}