'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api, CancerCenter } from '@/lib/api';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorMessage } from '@/components/ErrorMessage';
import { LastUpdated } from '@/components/LastUpdated';

export default function CenterDetailPage() {
  const params = useParams();
  const [center, setCenter] = useState<CancerCenter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCenter = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await api.getCenter(Number(params.id));
        setCenter(result);
      } catch (err) {
        setError('Failed to load center details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchCenter();
    }
  }, [params.id]);

  if (loading) {
    return <LoadingSpinner className="py-12" />;
  }

  if (error || !center) {
    return <ErrorMessage message={error || 'Center not found'} />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href="/centers"
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
        Back to centers
      </Link>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-wrap gap-2 mb-4">
          {center.us_news_rank && (
            <span className="px-3 py-1 text-sm font-medium bg-yellow-100 text-yellow-800 rounded-full">
              #{center.us_news_rank} US News Ranking
            </span>
          )}
          {center.nci_designation && (
            <span className="px-3 py-1 text-sm font-medium bg-emerald-100 text-emerald-800 rounded-full">
              NCI {center.nci_designation}
            </span>
          )}
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">{center.name}</h1>

        {center.academic_affiliation && (
          <p className="text-lg text-gray-600 mb-4">{center.academic_affiliation}</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
              Location
            </h3>
            <p className="text-gray-900">
              {center.city}, {center.state}
              {center.country && center.country !== 'USA' && `, ${center.country}`}
            </p>
            {center.address && <p className="text-gray-700 text-sm">{center.address}</p>}
          </div>

          {center.phone && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
                Phone
              </h3>
              <a href={`tel:${center.phone}`} className="text-emerald-600 hover:text-emerald-700">
                {center.phone}
              </a>
            </div>
          )}
        </div>

        {center.specialties && center.specialties.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
              Specialties
            </h3>
            <div className="flex flex-wrap gap-2">
              {center.specialties.map((specialty, index) => (
                <span
                  key={index}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full"
                >
                  {specialty}
                </span>
              ))}
            </div>
          </div>
        )}

        {center.active_nsclc_trials !== null && center.active_nsclc_trials !== undefined && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
              Active NSCLC Clinical Trials
            </h3>
            <p className="text-2xl font-bold text-emerald-600">{center.active_nsclc_trials}</p>
          </div>
        )}

        {center.lat && center.lng && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
              Map
            </h3>
            <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${center.lat},${center.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-600 hover:text-emerald-700"
              >
                View on Google Maps →
              </a>
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          {center.website && (
            <a
              href={center.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-700"
            >
              Visit Website
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
          )}
        </div>

        {center.source_urls && Object.keys(center.source_urls).length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
              Sources
            </h3>
            <div className="flex flex-wrap gap-3">
              {Object.entries(center.source_urls).map(([name, url]) => (
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
          <LastUpdated date={center.last_updated} />
        </div>
      </div>
    </div>
  );
}
