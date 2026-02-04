'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api, ClinicalTrial } from '@/lib/api';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorMessage } from '@/components/ErrorMessage';
import { LastUpdated } from '@/components/LastUpdated';
import { StructuredEligibilityDisplay } from '@/components/trials/StructuredEligibility';

const relevanceColors: Record<string, { bg: string; text: string; label: string }> = {
  nsclc_specific: { bg: 'bg-green-100', text: 'text-green-800', label: 'NSCLC Specific' },
  nsclc_primary: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'NSCLC Primary' },
  multi_cancer: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Multi-Cancer' },
  solid_tumor: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Solid Tumor' },
};

export default function TrialDetailPage() {
  const params = useParams();
  const [trial, setTrial] = useState<ClinicalTrial | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrial = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await api.getTrial(params.nctId as string);
        setTrial(result);
      } catch (err) {
        setError('Failed to load trial details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (params.nctId) {
      fetchTrial();
    }
  }, [params.nctId]);

  if (loading) {
    return <LoadingSpinner className="py-12" />;
  }

  if (error || !trial) {
    return <ErrorMessage message={error || 'Trial not found'} />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href="/trials"
        className="inline-flex items-center text-sm text-emerald-600 hover:text-emerald-700 mb-6"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-4 h-4 mr-1"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
          />
        </svg>
        Back to trials
      </Link>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-3 py-1 text-sm font-medium bg-gray-100 text-gray-800 rounded-full">
            {trial.nct_id}
          </span>
          {trial.phase && (
            <span className="px-3 py-1 text-sm font-medium bg-purple-100 text-purple-800 rounded-full">
              {trial.phase}
            </span>
          )}
          {trial.status && (
            <span className="px-3 py-1 text-sm font-medium bg-emerald-100 text-emerald-800 rounded-full">
              {trial.status}
            </span>
          )}
          {trial.nsclc_relevance && relevanceColors[trial.nsclc_relevance] && (
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${relevanceColors[trial.nsclc_relevance].bg} ${relevanceColors[trial.nsclc_relevance].text}`}>
              {relevanceColors[trial.nsclc_relevance].label}
            </span>
          )}
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">{trial.title}</h1>

        {trial.sponsor && (
          <p className="text-gray-600 mb-4">
            <span className="font-medium">Sponsor:</span> {trial.sponsor}
          </p>
        )}

        {trial.brief_summary && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
              Summary
            </h3>
            <p className="text-gray-700 whitespace-pre-line">{trial.brief_summary}</p>
          </div>
        )}

        {trial.interventions && trial.interventions.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
              Interventions
            </h3>
            <div className="space-y-2">
              {trial.interventions.map((intervention, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-3">
                  <p className="font-medium text-gray-900">{intervention.name}</p>
                  {intervention.type && (
                    <p className="text-sm text-gray-600">Type: {intervention.type}</p>
                  )}
                  {intervention.description && (
                    <p className="text-sm text-gray-700 mt-1">{intervention.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Structured Eligibility Display */}
        {trial.structured_eligibility && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
              Eligibility Requirements
            </h3>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <StructuredEligibilityDisplay
                eligibility={trial.structured_eligibility}
                showConfidence={true}
              />
            </div>
          </div>
        )}

        {/* Original Eligibility Criteria (collapsible) */}
        {trial.eligibility_criteria && (
          <div className="mt-6">
            <details className="group">
              <summary className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2 cursor-pointer hover:text-gray-700 list-none flex items-center gap-2">
                <svg
                  className="w-4 h-4 transition-transform group-open:rotate-90"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                {trial.structured_eligibility ? 'View Original Eligibility Text' : 'Eligibility Criteria'}
              </summary>
              <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto mt-2">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
                  {trial.eligibility_criteria}
                </pre>
              </div>
            </details>
          </div>
        )}

        {trial.locations && trial.locations.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
              Locations ({trial.locations.length} sites)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
              {trial.locations.map((location, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-3">
                  <p className="font-medium text-gray-900">{location.facility}</p>
                  <p className="text-sm text-gray-600">
                    {location.city}, {location.state}, {location.country}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {trial.contact_info && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
              Contact Information
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              {trial.contact_info.name && (
                <p className="text-gray-900">{trial.contact_info.name}</p>
              )}
              {trial.contact_info.phone && (
                <p className="text-gray-700">
                  Phone:{' '}
                  <a href={`tel:${trial.contact_info.phone}`} className="text-emerald-600">
                    {trial.contact_info.phone}
                  </a>
                </p>
              )}
              {trial.contact_info.email && (
                <p className="text-gray-700">
                  Email:{' '}
                  <a href={`mailto:${trial.contact_info.email}`} className="text-emerald-600">
                    {trial.contact_info.email}
                  </a>
                </p>
              )}
            </div>
          </div>
        )}

        {trial.primary_completion_date && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
              Primary Completion Date
            </h3>
            <p className="text-gray-900">{trial.primary_completion_date}</p>
          </div>
        )}

        {trial.study_url && (
          <div className="mt-6">
            <a
              href={trial.study_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-700"
            >
              View on ClinicalTrials.gov
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4 ml-2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                />
              </svg>
            </a>
          </div>
        )}

        <div className="mt-8 pt-4 border-t border-gray-200">
          <LastUpdated date={trial.last_updated} />
        </div>
      </div>
    </div>
  );
}
