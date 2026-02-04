'use client';

import { CompetitorMatch } from '@/lib/api';

interface CompetitorCardProps {
  competitor: CompetitorMatch;
  rank: number;
}

export function CompetitorCard({ competitor, rank }: CompetitorCardProps) {
  const similarityPercent = Math.round(competitor.similarity_score * 100);

  const getSimilarityColor = (score: number) => {
    if (score >= 0.7) return 'from-red-500 to-orange-500';
    if (score >= 0.5) return 'from-orange-500 to-amber-500';
    if (score >= 0.3) return 'from-amber-500 to-yellow-500';
    return 'from-yellow-500 to-green-500';
  };

  const getSimilarityBgColor = (score: number) => {
    if (score >= 0.7) return 'bg-red-50 border-red-200';
    if (score >= 0.5) return 'bg-orange-50 border-orange-200';
    if (score >= 0.3) return 'bg-amber-50 border-amber-200';
    return 'bg-yellow-50 border-yellow-200';
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-gray-400">#{rank}</span>
            <a
              href={competitor.study_url || `https://clinicaltrials.gov/study/${competitor.nct_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono text-violet-600 hover:text-violet-700 hover:underline"
            >
              {competitor.nct_id}
            </a>
            {competitor.phase && (
              <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded">
                {competitor.phase}
              </span>
            )}
          </div>
          <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2">
            {competitor.title || 'Untitled Trial'}
          </h3>
          {competitor.sponsor && (
            <p className="text-xs text-gray-500 mt-1">{competitor.sponsor}</p>
          )}
        </div>

        {/* Similarity Score */}
        <div className={`flex-shrink-0 px-3 py-2 rounded-xl border ${getSimilarityBgColor(competitor.similarity_score)}`}>
          <div className="text-center">
            <div className={`text-2xl font-bold bg-gradient-to-r ${getSimilarityColor(competitor.similarity_score)} bg-clip-text text-transparent`}>
              {similarityPercent}%
            </div>
            <div className="text-xs text-gray-500">overlap</div>
          </div>
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <div className="text-center p-2 bg-gray-50 rounded-lg">
          <div className="text-sm font-semibold text-gray-700">
            {Math.round(competitor.biomarker_overlap * 100)}%
          </div>
          <div className="text-xs text-gray-500">Biomarker</div>
        </div>
        <div className="text-center p-2 bg-gray-50 rounded-lg">
          <div className="text-sm font-semibold text-gray-700">
            {Math.round(competitor.stage_overlap * 100)}%
          </div>
          <div className="text-xs text-gray-500">Stage</div>
        </div>
        <div className="text-center p-2 bg-gray-50 rounded-lg">
          <div className="text-sm font-semibold text-gray-700">
            {Math.round(competitor.geographic_overlap * 100)}%
          </div>
          <div className="text-xs text-gray-500">Geographic</div>
        </div>
        <div className="text-center p-2 bg-gray-50 rounded-lg">
          <div className="text-sm font-semibold text-gray-700">
            {Math.round(competitor.phase_proximity * 100)}%
          </div>
          <div className="text-xs text-gray-500">Phase</div>
        </div>
      </div>

      {/* Overlap Details */}
      <div className="space-y-2">
        {competitor.overlapping_biomarkers.length > 0 && (
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-violet-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547" />
            </svg>
            <div className="flex flex-wrap gap-1">
              {competitor.overlapping_biomarkers.map((biomarker) => (
                <span
                  key={biomarker}
                  className="px-2 py-0.5 text-xs font-medium bg-violet-100 text-violet-700 rounded"
                >
                  {biomarker}
                </span>
              ))}
            </div>
          </div>
        )}

        {competitor.overlapping_stages.length > 0 && (
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <div className="flex flex-wrap gap-1">
              {competitor.overlapping_stages.map((stage) => (
                <span
                  key={stage}
                  className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded"
                >
                  Stage {stage}
                </span>
              ))}
            </div>
          </div>
        )}

        {competitor.overlapping_locations.length > 0 && (
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            <div className="flex flex-wrap gap-1">
              {competitor.overlapping_locations.slice(0, 5).map((loc) => (
                <span
                  key={loc}
                  className="px-2 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-700 rounded"
                >
                  {loc}
                </span>
              ))}
              {competitor.overlapping_locations.length > 5 && (
                <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded">
                  +{competitor.overlapping_locations.length - 5} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Brief Summary */}
      {competitor.brief_summary && (
        <p className="mt-3 text-xs text-gray-500 line-clamp-2">
          {competitor.brief_summary}
        </p>
      )}

      {/* Status Badge */}
      <div className="mt-3 flex items-center justify-between">
        <span className={`px-2 py-0.5 text-xs font-medium rounded ${
          competitor.status === 'RECRUITING' || competitor.status === 'Recruiting'
            ? 'bg-green-100 text-green-700'
            : 'bg-gray-100 text-gray-600'
        }`}>
          {competitor.status}
        </span>
        <a
          href={competitor.study_url || `https://clinicaltrials.gov/study/${competitor.nct_id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-medium text-violet-600 hover:text-violet-700 flex items-center gap-1"
        >
          View on ClinicalTrials.gov
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </div>
  );
}
