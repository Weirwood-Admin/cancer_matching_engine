'use client';

import { useState } from 'react';
import { api, PatientMatchResponse } from '@/lib/api';
import { PatientMatchForm } from '@/components/match/PatientMatchForm';
import { ParsedProfileCard } from '@/components/match/ParsedProfileCard';
import { MatchResults } from '@/components/match/MatchResults';
import { ErrorMessage } from '@/components/ErrorMessage';

export default function MatchPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<PatientMatchResponse | null>(null);

  const handleSubmit = async (description: string, location?: string) => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await api.matchPatient({
        description,
        location,
      });
      setResults(response);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to find matches. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResults(null);
    setError(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Treatment & Trial Matches</h1>
        <p className="text-gray-600">
          Describe a patient&apos;s condition in natural language and we&apos;ll find personalized
          FDA-approved treatment options and clinical trial matches with eligibility pre-screening.
        </p>
      </div>

      {/* Main Content */}
      {!results ? (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <PatientMatchForm onSubmit={handleSubmit} isLoading={loading} />

          {error && (
            <div className="mt-6">
              <ErrorMessage message={error} retry={() => setError(null)} />
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Back/Reset Button */}
          <button
            onClick={handleReset}
            className="inline-flex items-center text-sm text-emerald-600 hover:text-emerald-700 font-medium"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4 mr-1"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            New Search
          </button>

          {/* Parsed Profile */}
          <ParsedProfileCard profile={results.profile} />

          {/* Match Results */}
          <MatchResults
            treatments={results.treatments}
            trials={results.trials}
            processingTimeMs={results.processing_time_ms}
          />
        </div>
      )}

      {/* Disclaimer */}
      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          <strong>Important:</strong> This tool provides informational guidance only and is not a substitute
          for professional medical advice. Treatment decisions should always be made in consultation with
          qualified healthcare providers. Eligibility assessments are preliminary and require verification
          by clinical trial staff.
        </p>
      </div>
    </div>
  );
}
