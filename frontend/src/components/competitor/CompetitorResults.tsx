'use client';

import { useState } from 'react';
import { CompetitorAnalysisResponse } from '@/lib/api';
import { CompetitorCard } from './CompetitorCard';

interface CompetitorResultsProps {
  results: CompetitorAnalysisResponse;
  onReset: () => void;
}

type SortOption = 'similarity' | 'biomarker' | 'geographic' | 'phase';

export function CompetitorResults({ results, onReset }: CompetitorResultsProps) {
  const [sortBy, setSortBy] = useState<SortOption>('similarity');
  const { profile, competitors, insights } = results;

  const sortedCompetitors = [...competitors].sort((a, b) => {
    switch (sortBy) {
      case 'biomarker':
        return b.biomarker_overlap - a.biomarker_overlap;
      case 'geographic':
        return b.geographic_overlap - a.geographic_overlap;
      case 'phase':
        return b.phase_proximity - a.phase_proximity;
      default:
        return b.similarity_score - a.similarity_score;
    }
  });

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Competitive Analysis</h1>
          <p className="text-gray-500 mt-1">
            Found {insights.total_competing_trials} competing trials
            {profile.title && <span className="text-gray-400"> for &ldquo;{profile.title}&rdquo;</span>}
          </p>
        </div>
        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-violet-600 hover:text-violet-700 hover:bg-violet-50 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          New Analysis
        </button>
      </div>

      {/* Market Insights Summary */}
      <div className="bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50 rounded-2xl border border-violet-100 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Market Insights</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="text-3xl font-bold text-violet-600">{insights.total_competing_trials}</div>
            <div className="text-sm text-gray-500">Competing Trials</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="text-3xl font-bold text-purple-600">
              {Math.round(insights.avg_similarity_score * 100)}%
            </div>
            <div className="text-sm text-gray-500">Avg. Similarity</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="text-3xl font-bold text-indigo-600">{insights.top_sponsors.length}</div>
            <div className="text-sm text-gray-500">Unique Sponsors</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="text-3xl font-bold text-blue-600">{insights.geographic_hotspots.length}</div>
            <div className="text-sm text-gray-500">Active States</div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Top Sponsors */}
          {insights.top_sponsors.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Top Sponsors</h3>
              <div className="space-y-1">
                {insights.top_sponsors.slice(0, 5).map((sponsor, idx) => (
                  <div key={sponsor.name} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 truncate">{idx + 1}. {sponsor.name}</span>
                    <span className="text-gray-400 ml-2">{sponsor.count} trials</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Geographic Hotspots */}
          {insights.geographic_hotspots.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Geographic Hotspots</h3>
              <div className="flex flex-wrap gap-1">
                {insights.geographic_hotspots.slice(0, 8).map((hotspot) => (
                  <span
                    key={hotspot.state}
                    className="px-2 py-1 text-xs font-medium bg-white text-gray-600 rounded shadow-sm"
                  >
                    {hotspot.state} ({hotspot.count})
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Phase Distribution */}
          {Object.keys(insights.phase_distribution).length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Phase Distribution</h3>
              <div className="space-y-1">
                {Object.entries(insights.phase_distribution)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 5)
                  .map(([phase, count]) => (
                    <div key={phase} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{phase}</span>
                      <span className="text-gray-400">{count}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Common Biomarkers */}
        {insights.common_biomarkers.length > 0 && (
          <div className="mt-4 pt-4 border-t border-violet-100">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Commonly Targeted Biomarkers</h3>
            <div className="flex flex-wrap gap-2">
              {insights.common_biomarkers.map((biomarker) => (
                <span
                  key={biomarker.biomarker}
                  className="px-3 py-1.5 text-sm font-medium bg-violet-100 text-violet-700 rounded-lg"
                >
                  {biomarker.biomarker} ({biomarker.count})
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Your Profile Summary */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Your Trial Profile</h3>
        <div className="flex flex-wrap gap-2">
          {profile.phase && (
            <span className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg">
              {profile.phase}
            </span>
          )}
          {Object.keys(profile.target_biomarkers).map((biomarker) => (
            <span
              key={biomarker}
              className="px-3 py-1 text-sm bg-violet-100 text-violet-700 rounded-lg"
            >
              {biomarker}: {profile.target_biomarkers[biomarker].join(', ')}
            </span>
          ))}
          {profile.target_stages.map((stage) => (
            <span
              key={stage}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg"
            >
              Stage {stage}
            </span>
          ))}
          {profile.target_locations.length > 0 && (
            <span className="px-3 py-1 text-sm bg-emerald-100 text-emerald-700 rounded-lg">
              {profile.target_locations.length} state{profile.target_locations.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Sort Controls */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Competing Trials ({sortedCompetitors.length})
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
          >
            <option value="similarity">Overall Similarity</option>
            <option value="biomarker">Biomarker Overlap</option>
            <option value="geographic">Geographic Overlap</option>
            <option value="phase">Phase Proximity</option>
          </select>
        </div>
      </div>

      {/* Competitor Cards */}
      {sortedCompetitors.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-4">
          {sortedCompetitors.map((competitor, index) => (
            <CompetitorCard
              key={competitor.nct_id}
              competitor={competitor}
              rank={index + 1}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No competing trials found</h3>
          <p className="text-gray-500">
            Try broadening your criteria to find more competitors.
          </p>
        </div>
      )}

      {/* Processing Time */}
      <p className="text-center text-xs text-gray-400 mt-8">
        Analysis completed in {results.processing_time_ms}ms
      </p>
    </div>
  );
}
