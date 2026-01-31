'use client';

import { useEffect, useState } from 'react';
import { api, CancerCenter, PaginatedResponse } from '@/lib/api';
import { Card } from '@/components/Card';
import { FilterSelect } from '@/components/FilterSelect';
import { Pagination } from '@/components/Pagination';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorMessage } from '@/components/ErrorMessage';

export default function CentersPage() {
  const [data, setData] = useState<PaginatedResponse<CancerCenter> | null>(null);
  const [states, setStates] = useState<string[]>([]);
  const [designations, setDesignations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [page, setPage] = useState(1);
  const [state, setState] = useState('');
  const [nciDesignation, setNciDesignation] = useState('');
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.getCenters({
        page,
        page_size: 20,
        state: state || undefined,
        nci_designation: nciDesignation || undefined,
        search: search || undefined,
      });
      setData(result);
    } catch (err) {
      setError('Failed to load cancer centers');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, state, nciDesignation]);

  useEffect(() => {
    Promise.all([api.getCenterStates(), api.getCenterDesignations()])
      .then(([s, d]) => {
        setStates(s);
        setDesignations(d);
      })
      .catch(console.error);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchData();
  };

  const getDesignationColor = (designation: string | null) => {
    if (!designation) return 'gray';
    if (designation === 'Comprehensive') return 'emerald';
    if (designation === 'Cancer Center') return 'blue';
    return 'gray';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          NCI-Designated Cancer Centers
        </h1>
        <p className="text-gray-600">
          Find top-ranked cancer centers specializing in lung cancer treatment
          and research.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <form onSubmit={handleSearch} className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, city, affiliation..."
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-700"
            >
              Search
            </button>
          </div>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FilterSelect
            label="State"
            value={state}
            options={states}
            onChange={(value) => {
              setState(value);
              setPage(1);
            }}
            placeholder="All states"
          />

          <FilterSelect
            label="NCI Designation"
            value={nciDesignation}
            options={designations}
            onChange={(value) => {
              setNciDesignation(value);
              setPage(1);
            }}
            placeholder="All designations"
          />
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <LoadingSpinner className="py-12" />
      ) : error ? (
        <ErrorMessage message={error} retry={fetchData} />
      ) : data && data.items.length > 0 ? (
        <>
          <p className="text-sm text-gray-500 mb-4">
            Showing {data.items.length} of {data.total} centers
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {data.items.map((center) => (
              <Card
                key={center.id}
                href={`/centers/${center.id}`}
                title={center.name}
                subtitle={center.academic_affiliation || undefined}
                badges={[
                  ...(center.us_news_rank
                    ? [{ label: `#${center.us_news_rank} US News`, color: 'yellow' }]
                    : []),
                  ...(center.nci_designation
                    ? [{ label: center.nci_designation, color: getDesignationColor(center.nci_designation) }]
                    : []),
                ]}
                meta={[
                  { label: 'Location', value: `${center.city}, ${center.state}` },
                  ...(center.active_nsclc_trials
                    ? [{ label: 'Active NSCLC Trials', value: String(center.active_nsclc_trials) }]
                    : []),
                ]}
              />
            ))}
          </div>

          <Pagination
            currentPage={data.page}
            totalPages={data.total_pages}
            onPageChange={setPage}
          />
        </>
      ) : (
        <div className="text-center py-12 text-gray-500">
          No cancer centers found matching your criteria.
        </div>
      )}
    </div>
  );
}
