'use client';

import { useEffect, useState } from 'react';
import { api, ClinicalTrial, PaginatedResponse, RelevanceStats } from '@/lib/api';
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

const RELEVANCE_OPTIONS = [
  { value: 'nsclc_specific,nsclc_primary', label: 'NSCLC Focused (Default)' },
  { value: 'nsclc_specific', label: 'NSCLC Specific Only' },
  { value: 'nsclc_specific,nsclc_primary,multi_cancer', label: 'Include Multi-Cancer' },
  { value: 'all', label: 'All Trials' },
];

const relevanceColors: Record<string, { bg: string; text: string }> = {
  nsclc_specific: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
  nsclc_primary: { bg: 'bg-blue-50', text: 'text-blue-700' },
  multi_cancer: { bg: 'bg-amber-50', text: 'text-amber-700' },
  solid_tumor: { bg: 'bg-orange-50', text: 'text-orange-700' },
};

export default function TrialsPage() {
  const [data, setData] = useState<PaginatedResponse<ClinicalTrial> | null>(null);
  const [phases, setPhases] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [biomarkers, setBiomarkers] = useState<string[]>([]);
  const [relevanceStats, setRelevanceStats] = useState<RelevanceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [page, setPage] = useState(1);
  const [phase, setPhase] = useState('');
  const [status, setStatus] = useState('');
  const [state, setState] = useState('');
  const [search, setSearch] = useState('');
  const [biomarker, setBiomarker] = useState('');
  const [relevance, setRelevance] = useState('nsclc_specific,nsclc_primary');

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
        biomarker: biomarker || undefined,
        relevance: relevance === 'all' ? undefined : relevance || undefined,
        include_all_relevance: relevance === 'all',
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
  }, [page, phase, status, state, biomarker, relevance]);

  useEffect(() => {
    Promise.all([
      api.getTrialPhases(),
      api.getTrialStatuses(),
      api.getTrialBiomarkers(),
      api.getTrialRelevanceStats().catch(() => null),
    ])
      .then(([p, s, b, r]) => {
        setPhases(p);
        setStatuses(s);
        setBiomarkers(b);
        if (r) setRelevanceStats(r);
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-violet-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold">Clinical Trials</h1>
          </div>
          <p className="text-purple-100 text-lg max-w-2xl">
            Find actively recruiting clinical trials for Non-Small Cell Lung Cancer
            near you. Filter by phase, biomarker requirements, and location.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-8 -mt-6">
          <form onSubmit={handleSearch} className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Search
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by title, NCT ID, sponsor..."
                  className="w-full pl-10 pr-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-violet-500 to-purple-500 rounded-xl hover:from-violet-600 hover:to-purple-600 transition-all shadow-sm"
              >
                Search
              </button>
            </div>
          </form>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
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

            <FilterSelect
              label="Biomarker"
              value={biomarker}
              options={biomarkers}
              onChange={(value) => {
                setBiomarker(value);
                setPage(1);
              }}
              placeholder="Any biomarker"
            />

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Relevance
              </label>
              <select
                value={relevance}
                onChange={(e) => {
                  setRelevance(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-3 text-sm border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all bg-white"
              >
                {RELEVANCE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Relevance Stats */}
          {relevanceStats && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Trial breakdown by relevance</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(relevanceStats.categories).map(([category, stats]) => (
                  <span
                    key={category}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg ${
                      relevanceColors[category]?.bg || 'bg-gray-100'
                    } ${relevanceColors[category]?.text || 'text-gray-600'}`}
                  >
                    {category.replace('_', ' ')}: {stats.count} ({stats.percentage}%)
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        {loading ? (
          <LoadingSpinner className="py-12" />
        ) : error ? (
          <ErrorMessage message={error} retry={fetchData} />
        ) : data && data.items.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-gray-500">
                Showing <span className="font-semibold text-gray-900">{data.items.length}</span> of{' '}
                <span className="font-semibold text-gray-900">{data.total}</span> trials
              </p>
            </div>

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
                    ...(trial.nsclc_relevance && relevanceColors[trial.nsclc_relevance]
                      ? [{
                          label: trial.nsclc_relevance.replace('_', ' '),
                          color: trial.nsclc_relevance === 'nsclc_specific' ? 'green'
                            : trial.nsclc_relevance === 'nsclc_primary' ? 'blue'
                            : trial.nsclc_relevance === 'multi_cancer' ? 'yellow'
                            : 'orange'
                        }]
                      : []),
                    ...(trial.structured_eligibility
                      ? [{ label: 'Structured', color: 'emerald' }]
                      : []),
                  ]}
                  meta={[
                    ...(trial.sponsor
                      ? [{ label: 'Sponsor', value: trial.sponsor }]
                      : []),
                    ...(trial.locations && trial.locations.length > 0
                      ? [{ label: 'Locations', value: `${trial.locations.length} sites` }]
                      : []),
                    ...(trial.structured_eligibility?.biomarkers?.required_positive
                      ? [{
                          label: 'Biomarkers',
                          value: Object.keys(trial.structured_eligibility.biomarkers.required_positive).join(', ') || 'None specified'
                        }]
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
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-500">No trials found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
