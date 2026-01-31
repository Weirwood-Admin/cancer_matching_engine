'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api, Treatment } from '@/lib/api';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorMessage } from '@/components/ErrorMessage';
import { LastUpdated } from '@/components/LastUpdated';

export default function TreatmentDetailPage() {
  const params = useParams();
  const [treatment, setTreatment] = useState<Treatment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTreatment = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await api.getTreatment(Number(params.id));
        setTreatment(result);
      } catch (err) {
        setError('Failed to load treatment details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchTreatment();
    }
  }, [params.id]);

  if (loading) {
    return <LoadingSpinner className="py-12" />;
  }

  if (error || !treatment) {
    return <ErrorMessage message={error || 'Treatment not found'} />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href="/treatments"
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
        Back to treatments
      </Link>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-wrap gap-2 mb-4">
          {treatment.drug_class && (
            <span className="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
              {treatment.drug_class}
            </span>
          )}
          {treatment.fda_approval_status && (
            <span className="px-3 py-1 text-sm font-medium bg-green-100 text-green-800 rounded-full">
              {treatment.fda_approval_status}
            </span>
          )}
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {treatment.generic_name}
        </h1>

        {treatment.brand_names && treatment.brand_names.length > 0 && (
          <p className="text-lg text-gray-600 mb-4">
            Brand names: {treatment.brand_names.join(', ')}
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {treatment.manufacturer && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
                Manufacturer
              </h3>
              <p className="text-gray-900">{treatment.manufacturer}</p>
            </div>
          )}

          {treatment.fda_approval_date && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
                FDA Approval Date
              </h3>
              <p className="text-gray-900">{treatment.fda_approval_date}</p>
            </div>
          )}
        </div>

        {treatment.mechanism_of_action && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
              Mechanism of Action
            </h3>
            <p className="text-gray-700">{treatment.mechanism_of_action}</p>
          </div>
        )}

        {treatment.approved_indications && treatment.approved_indications.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
              Approved Indications
            </h3>
            <ul className="list-disc list-inside text-gray-700">
              {treatment.approved_indications.map((indication, index) => (
                <li key={index}>{indication}</li>
              ))}
            </ul>
          </div>
        )}

        {treatment.biomarker_requirements && Object.keys(treatment.biomarker_requirements).length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
              Biomarker Requirements
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              {Object.entries(treatment.biomarker_requirements).map(([biomarker, mutations]) => (
                <div key={biomarker} className="mb-2 last:mb-0">
                  <span className="font-medium text-gray-900">{biomarker}:</span>{' '}
                  <span className="text-gray-700">
                    {Array.isArray(mutations) ? mutations.join(', ') : mutations}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {treatment.common_side_effects && treatment.common_side_effects.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
              Common Side Effects
            </h3>
            <div className="flex flex-wrap gap-2">
              {treatment.common_side_effects.map((effect, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-sm bg-gray-100 text-gray-700 rounded"
                >
                  {effect}
                </span>
              ))}
            </div>
          </div>
        )}

        {treatment.source_urls && Object.keys(treatment.source_urls).length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
              Sources
            </h3>
            <div className="flex flex-wrap gap-3">
              {Object.entries(treatment.source_urls).map(([name, url]) => (
                <a
                  key={name}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-emerald-600 hover:text-emerald-700"
                >
                  {name.toUpperCase()} →
                </a>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 pt-4 border-t border-gray-200">
          <LastUpdated date={treatment.last_updated} />
        </div>
      </div>
    </div>
  );
}
