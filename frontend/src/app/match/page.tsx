'use client';

import { useState } from 'react';
import { api, PatientMatchResponse, PatientProfile } from '@/lib/api';
import { MatchQuiz } from '@/components/match/MatchQuiz';
import { ParsedProfileCard } from '@/components/match/ParsedProfileCard';
import { MatchResults } from '@/components/match/MatchResults';
import { ErrorMessage } from '@/components/ErrorMessage';

export default function MatchPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<PatientMatchResponse | null>(null);

  const handleSubmit = async (profile: PatientProfile) => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await api.matchPatientStructured(profile);
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-sm font-medium mb-4">
            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
            NSCLC Clinical Trial Matcher
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">
            Find Trials You May Qualify For
          </h1>
          <p className="text-emerald-100 text-lg max-w-2xl mx-auto">
            Answer a few questions to get a personalized list of clinical trials matched to your specific diagnosis
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {!results ? (
          <div className="-mt-6">
            <MatchQuiz onSubmit={handleSubmit} isLoading={loading} />

            {error && (
              <div className="mt-6 max-w-3xl mx-auto">
                <ErrorMessage message={error} retry={() => setError(null)} />
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Back Button */}
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Start New Search
            </button>

            {/* Results Summary Card */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-6 text-white shadow-xl shadow-emerald-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-1">
                    {results.total_trials} Trial{results.total_trials !== 1 ? 's' : ''} Found
                  </h2>
                  <p className="text-emerald-100">
                    Plus {results.total_treatments} FDA-approved treatment option{results.total_treatments !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="hidden sm:block">
                  <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-white/20 text-sm text-emerald-100">
                Matched in {(results.processing_time_ms / 1000).toFixed(1)} seconds
              </div>
            </div>

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
      </div>

      {/* Disclaimer */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="p-5 bg-amber-50 border border-amber-200 rounded-xl">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-amber-900 mb-1">Important Notice</h4>
              <p className="text-sm text-amber-800">
                This tool provides informational guidance only and is not medical advice. Treatment decisions
                should be made with qualified healthcare providers. Eligibility assessments are preliminary
                and require verification by clinical trial staff.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
