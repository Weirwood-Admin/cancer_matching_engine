'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api, SearchResult } from '@/lib/api';
import { SearchBar } from '@/components/SearchBar';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorMessage } from '@/components/ErrorMessage';

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query || query.length < 2) {
        setResults(null);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const data = await api.search(query, 20);
        setResults(data);
      } catch (err) {
        setError('Failed to search');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  const totalResults =
    (results?.treatments.length || 0) +
    (results?.trials.length || 0) +
    (results?.centers.length || 0);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Search</h1>
        <SearchBar size="lg" className="max-w-xl" />
      </div>

      {loading ? (
        <LoadingSpinner className="py-12" />
      ) : error ? (
        <ErrorMessage message={error} />
      ) : query && results ? (
        <>
          <p className="text-sm text-gray-500 mb-6">
            Found {totalResults} results for &quot;{query}&quot;
          </p>

          {/* Treatments */}
          {results.treatments.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Treatments ({results.treatments.length})
              </h2>
              <div className="space-y-3">
                {results.treatments.map((treatment) => (
                  <Link
                    key={treatment.id}
                    href={`/treatments/${treatment.id}`}
                    className="block bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-blue-300 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {treatment.generic_name}
                        </h3>
                        {treatment.brand_names && (
                          <p className="text-sm text-gray-600">
                            {treatment.brand_names.join(', ')}
                          </p>
                        )}
                      </div>
                      {treatment.drug_class && (
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          {treatment.drug_class}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Trials */}
          {results.trials.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                Clinical Trials ({results.trials.length})
              </h2>
              <div className="space-y-3">
                {results.trials.map((trial) => (
                  <Link
                    key={trial.nct_id}
                    href={`/trials/${trial.nct_id}`}
                    className="block bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-purple-300 transition-all"
                  >
                    <div className="flex flex-wrap gap-2 mb-2">
                      <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                        {trial.nct_id}
                      </span>
                      {trial.phase && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                          {trial.phase}
                        </span>
                      )}
                      {trial.status && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-800 rounded-full">
                          {trial.status}
                        </span>
                      )}
                    </div>
                    <h3 className="font-medium text-gray-900 line-clamp-2">
                      {trial.title}
                    </h3>
                    {trial.sponsor && (
                      <p className="text-sm text-gray-600 mt-1">
                        Sponsor: {trial.sponsor}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Centers */}
          {results.centers.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Cancer Centers ({results.centers.length})
              </h2>
              <div className="space-y-3">
                {results.centers.map((center) => (
                  <Link
                    key={center.id}
                    href={`/centers/${center.id}`}
                    className="block bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-green-300 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{center.name}</h3>
                        <p className="text-sm text-gray-600">
                          {center.city}, {center.state}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {center.us_news_rank && (
                          <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                            #{center.us_news_rank}
                          </span>
                        )}
                        {center.nci_designation && (
                          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                            {center.nci_designation}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {totalResults === 0 && (
            <div className="text-center py-12 text-gray-500">
              No results found for &quot;{query}&quot;
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 text-gray-500">
          Enter a search term to find treatments, trials, or cancer centers.
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<LoadingSpinner className="py-12" />}>
      <SearchContent />
    </Suspense>
  );
}
