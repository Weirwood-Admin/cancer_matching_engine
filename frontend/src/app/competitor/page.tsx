'use client';

import { useState } from 'react';
import { api, CompetitorAnalysisResponse, ResearcherTrialProfile } from '@/lib/api';
import { CompetitorQuiz, CompetitorResults } from '@/components/competitor';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorMessage } from '@/components/ErrorMessage';

type ViewState = 'quiz' | 'loading' | 'results' | 'error';

export default function CompetitorPage() {
  const [viewState, setViewState] = useState<ViewState>('quiz');
  const [results, setResults] = useState<CompetitorAnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmitStructured = async (profile: ResearcherTrialProfile) => {
    setViewState('loading');
    setError(null);

    try {
      const response = await api.analyzeCompetitors(profile);
      setResults(response);
      setViewState('results');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setViewState('error');
    }
  };

  const handleSubmitNatural = async (description: string) => {
    setViewState('loading');
    setError(null);

    try {
      const response = await api.analyzeCompetitorsNatural({ description });
      setResults(response);
      setViewState('results');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setViewState('error');
    }
  };

  const handleSubmitNctId = async (nctId: string) => {
    setViewState('loading');
    setError(null);

    try {
      const response = await api.analyzeCompetitorsByNctId(nctId);
      setResults(response);
      setViewState('results');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setViewState('error');
    }
  };

  const handleReset = () => {
    setViewState('quiz');
    setResults(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-violet-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {viewState === 'quiz' && (
          <>
            {/* Hero Section */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-violet-100 text-violet-700 rounded-full text-sm font-medium mb-4">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                For Researchers
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Competitive Analysis
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Understand your trial&apos;s competitive landscape. Find similar trials recruiting the same patient population and get market insights.
              </p>
            </div>

            <CompetitorQuiz
              onSubmitStructured={handleSubmitStructured}
              onSubmitNatural={handleSubmitNatural}
              onSubmitNctId={handleSubmitNctId}
              isLoading={false}
            />
          </>
        )}

        {viewState === 'loading' && (
          <div className="flex flex-col items-center justify-center py-20">
            <LoadingSpinner />
            <p className="mt-4 text-gray-600">Analyzing competitive landscape...</p>
            <p className="text-sm text-gray-400 mt-2">This may take a moment</p>
          </div>
        )}

        {viewState === 'error' && (
          <div className="max-w-2xl mx-auto">
            <ErrorMessage message={error || 'An error occurred'} />
            <div className="text-center mt-6">
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-violet-600 hover:text-violet-700 hover:bg-violet-50 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Try Again
              </button>
            </div>
          </div>
        )}

        {viewState === 'results' && results && (
          <CompetitorResults results={results} onReset={handleReset} />
        )}
      </div>
    </div>
  );
}
