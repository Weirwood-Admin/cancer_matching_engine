'use client';

import { useEffect, useState } from 'react';
import { api, ClinicalTrial, PaginatedResponse } from '@/lib/api';
import { Card } from '@/components/Card';
import { FilterSelect } from '@/components/FilterSelect';
import { Pagination } from '@/components/Pagination';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorMessage } from '@/components/ErrorMessage';

const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
  'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
  'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
  'Wisconsin', 'Wyoming',
];

export default function TrialsPage() {
  const [data, setData] = useState<PaginatedResponse<ClinicalTrial> | null>(null);
  const [phases, setPhases] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [page, setPage] = useState(1);
  const [phase, setPhase] = useState('');
  const [status, setStatus] = useState('');
  const [state, setState] = useState('');
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.getTrials({
        page,
        page_size: 20,
        phase: phase || undefined,
        status: status || undefined,
        state: state || undefined,
        search: search || undefined,
      });
      setData(result);
    } catch (err) {
      setError('Failed to load clinical trials');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, phase, status, state]);

  useEffect(() => {
    Promise.all([api.getTrialPhases(), api.getTrialStatuses()])
      .then(([p, s]) => {
        setPhases(p);
        setStatuses(s);
      })
      .catch(console.error);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchData();
  };

  const getPhaseColor = (phase: string | null) => {
    if (!phase) return 'gray';
    if (phase.includes('1')) return 'yellow';
    if (phase.includes('2')) return 'blue';
    if (phase.includes('3')) return 'purple';
    if (phase.includes('4')) return 'green';
    return 'gray';
  };

  const getStatusColor = (status: string | null) => {
    if (!status) return 'gray';
    if (status.toLowerCase().includes('recruiting')) return 'emerald';
    if (status.toLowerCase().includes('active')) return 'blue';
    return 'gray';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          NSCLC Clinical Trials
        </h1>
        <p className="text-gray-600">
          Find actively recruiting clinical trials for Non-Small Cell Lung Cancer
          near you.
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
              placeholder="Search by title, NCT ID, sponsor..."
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FilterSelect
            label="Phase"
            value={phase}
            options={phases}
            onChange={(value) => {
              setPhase(value);
              setPage(1);
            }}
            placeholder="All phases"
          />

          <FilterSelect
            label="Status"
            value={status}
            options={statuses}
            onChange={(value) => {
              setStatus(value);
              setPage(1);
            }}
            placeholder="All statuses"
          />

          <FilterSelect
            label="State"
            value={state}
            options={US_STATES}
            onChange={(value) => {
              setState(value);
              setPage(1);
            }}
            placeholder="All states"
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
            Showing {data.items.length} of {data.total} trials
          </p>

          <div className="space-y-4 mb-8">
            {data.items.map((trial) => (
              <Card
                key={trial.nct_id}
                href={`/trials/${trial.nct_id}`}
                title={trial.title || trial.nct_id}
                subtitle={trial.brief_summary?.substring(0, 200) + '...'}
                badges={[
                  { label: trial.nct_id, color: 'gray' },
                  ...(trial.phase
                    ? [{ label: trial.phase, color: getPhaseColor(trial.phase) }]
                    : []),
                  ...(trial.status
                    ? [{ label: trial.status, color: getStatusColor(trial.status) }]
                    : []),
                ]}
                meta={[
                  ...(trial.sponsor
                    ? [{ label: 'Sponsor', value: trial.sponsor }]
                    : []),
                  ...(trial.locations && trial.locations.length > 0
                    ? [{ label: 'Locations', value: `${trial.locations.length} sites` }]
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
          No trials found matching your criteria.
        </div>
      )}
    </div>
  );
}
