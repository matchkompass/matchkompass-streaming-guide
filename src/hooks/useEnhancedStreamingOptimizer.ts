import { useState, useCallback } from 'react';
import { EnhancedStreamingOptimizer, OptimizationRequest, EnhancedOptimizationResult } from '@/lib/EnhancedStreamingOptimizer';

export function useEnhancedStreamingOptimizer() {
  const [results, setResults] = useState<{
    combinations: EnhancedOptimizationResult[];
    individuals: EnhancedOptimizationResult[];
  }>({ combinations: [], individuals: [] });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const optimize = useCallback(async (request: OptimizationRequest) => {
    if (!request.selectedClubs.length || !request.selectedCompetitions.length) {
      setError('Bitte wählen Sie mindestens einen Verein und eine Liga aus');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const optimizer = new EnhancedStreamingOptimizer();
      const optimizationResults = await optimizer.optimizeForSelection(request);
      
      console.log('Optimization completed:', {
        combinations: optimizationResults.combinations.length,
        individuals: optimizationResults.individuals.length
      });

      setResults(optimizationResults);
    } catch (err) {
      console.error('Enhanced optimization error:', err);
      setError('Fehler bei der Optimierung. Bitte versuchen Sie es erneut.');
    } finally {
      setLoading(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults({ combinations: [], individuals: [] });
    setError(null);
  }, []);

  return {
    optimize,
    results,
    loading,
    error,
    clearResults
  };
}