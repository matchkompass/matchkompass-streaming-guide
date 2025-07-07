import { supabase } from '@/integrations/supabase/client';

export interface OptimizationRequest {
  clubIds: number[];
  targetCoverage: number;
  maxProviders?: number;
}

export interface OptimizationResult {
  providers: StreamingProvider[];
  totalCost: number;
  coveragePercentage: number;
  coveredLeagues: number;
  totalLeagues: number;
  savings?: number;
}

export interface StreamingProvider {
  streamer_id: number;
  provider_name: string;
  monthly_price: string;
  covered_league_ids: number[];
}

export class StreamingOptimizer {
  private supabase = supabase;
  private cache = new Map<string, OptimizationResult[]>();

  constructor() {}

  async optimizeForClubs(request: OptimizationRequest): Promise<OptimizationResult[]> {
    const cacheKey = JSON.stringify(request);
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    // 1. Get required leagues for selected clubs
    const requiredLeagueIds = await this.getRequiredLeagues(request.clubIds);

    // 2. Get all streaming providers with their coverage
    const providers = await this.getStreamingProviders(requiredLeagueIds);

    // 3. Calculate optimal combinations for different coverage levels
    const results = await Promise.all([
      this.findOptimalCombination(requiredLeagueIds, providers, 100),
      this.findOptimalCombination(requiredLeagueIds, providers, 90),
      this.findOptimalCombination(requiredLeagueIds, providers, 66)
    ]);

    this.cache.set(cacheKey, results.filter(Boolean));
    return results.filter(Boolean);
  }

  private async getRequiredLeagues(clubIds: number[]): Promise<number[]> {
    const { data } = await this.supabase
      .from('club_leagues')
      .select('league_id')
      .in('club_id', clubIds);

    return [...new Set(data?.map(cl => cl.league_id) || [])];
  }

  private async getStreamingProviders(requiredLeagueIds: number[]): Promise<StreamingProvider[]> {
    const { data } = await this.supabase
      .from('streaming')
      .select(`
        streamer_id,
        provider_name,
        monthly_price,
        streaming_leagues!inner(
          league_id,
          coverage_percentage
        )
      `)
      .in('streaming_leagues.league_id', requiredLeagueIds);

    return data?.map(provider => ({
      ...provider,
      covered_league_ids: provider.streaming_leagues
        .filter(sl => sl.coverage_percentage > 0)
        .map(sl => sl.league_id)
    })) || [];
  }

  private async findOptimalCombination(
    requiredLeagueIds: number[],
    providers: StreamingProvider[],
    targetCoverage: number
  ): Promise<OptimizationResult | null> {
    const maxCombinations = 4; // Maximum 4 providers
    let bestSolution: OptimizationResult | null = null;

    // Try combinations of 1 to maxCombinations providers
    for (let size = 1; size <= maxCombinations; size++) {
      const combinations = this.getCombinations(providers, size);

      for (const combination of combinations) {
        const solution = this.evaluateCombination(
          combination,
          requiredLeagueIds,
          targetCoverage
        );

        if (solution && solution.coveragePercentage >= targetCoverage) {
          if (!bestSolution || solution.totalCost < bestSolution.totalCost) {
            bestSolution = solution;
          }
        }
      }

      // If we found a solution at this size, we can stop (greedy approach)
      if (bestSolution) break;
    }

    return bestSolution;
  }

  private evaluateCombination(
    providers: StreamingProvider[],
    requiredLeagueIds: number[],
    targetCoverage: number
  ): OptimizationResult {
    const coveredLeagues = new Set<number>();
    let totalCost = 0;

    // Calculate coverage and cost
    providers.forEach(provider => {
      provider.covered_league_ids.forEach(leagueId => {
        if (requiredLeagueIds.includes(leagueId)) {
          coveredLeagues.add(leagueId);
        }
      });
      totalCost += this.parsePrice(provider.monthly_price);
    });

    const coveragePercentage = (coveredLeagues.size / requiredLeagueIds.length) * 100;

    return {
      providers,
      totalCost: Math.round(totalCost * 100) / 100,
      coveragePercentage: Math.round(coveragePercentage),
      coveredLeagues: coveredLeagues.size,
      totalLeagues: requiredLeagueIds.length
    };
  }

  private getCombinations<T>(arr: T[], size: number): T[][] {
    if (size > arr.length) return [];
    if (size === 1) return arr.map(item => [item]);

    const combinations: T[][] = [];
    for (let i = 0; i <= arr.length - size; i++) {
      const head = arr[i];
      const tailCombinations = this.getCombinations(arr.slice(i + 1), size - 1);
      for (const tail of tailCombinations) {
        combinations.push([head, ...tail]);
      }
    }
    return combinations;
  }

  private parsePrice(priceString: string): number {
    if (!priceString) return 0;
    return parseFloat(priceString.replace(/[^0-9.,]/g, '').replace(',', '.')) || 0;
  }

  // Clear cache when prices might have changed
  clearCache(): void {
    this.cache.clear();
  }
}