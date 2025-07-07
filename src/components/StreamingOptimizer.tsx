import React from 'react';
import { useStreamingOptimizer } from '@/hooks/useStreamingOptimizer';
import { useClubSelection } from '@/hooks/useClubSelection';
import ClubSelector from './ClubSelector';
import OptimizationResults from './OptimizationResults';

export default function StreamingOptimizer() {
  const { optimize, results, loading, error } = useStreamingOptimizer();
  const { selectedClubs, getSelectedClubNames } = useClubSelection();

  const handleOptimize = () => {
    optimize(selectedClubs);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Streaming-Anbieter Optimierung
        </h1>
        <p className="text-lg text-gray-600">
          Finden Sie die günstigste Kombination für Ihre Lieblings-Vereine
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">1. Vereine auswählen</h2>
        <ClubSelector />

        {selectedClubs.length > 0 && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-800">Ausgewählte Vereine:</h3>
            <p className="text-blue-600">{getSelectedClubNames().join(', ')}</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">2. Optimierung starten</h2>
        <button
          onClick={handleOptimize}
          disabled={loading || selectedClubs.length === 0}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Berechne optimale Kombinationen...' : 'Beste Pakete finden'}
        </button>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}
      </div>

      {results.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">3. Optimale Lösungen</h2>
          <OptimizationResults results={results} />
        </div>
      )}
    </div>
  );
}