'use client';

import { useEffect, useState } from 'react';
import { api, Treatment, PaginatedResponse } from '@/lib/api';
import { Card } from '@/components/Card';
import { FilterSelect } from '@/components/FilterSelect';
import { Pagination } from '@/components/Pagination';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorMessage } from '@/components/ErrorMessage';

export default function TreatmentsPage() {
  const [data, setData] = useState<PaginatedResponse<Treatment> | null>(null);
  const [drugClasses, setDrugClasses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [page, setPage] = useState(1);
  const [drugClass, setDrugClass] = useState('');
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.getTreatments({
        page,
        page_size: 20,
        drug_class: drugClass || undefined,
        search: search || undefined,
      });
      setData(result);
    } catch (err) {
      setError('Failed to load treatments');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, drugClass]);

  useEffect(() => {
    api.getDrugClasses().then(setDrugClasses).catch(console.error);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchData();
  };

  const getBadgeColor = (drugClass: string | null) => {
    if (!drugClass) return 'gray';
    if (drugClass.includes('EGFR')) return 'blue';
    if (drugClass.includes('ALK')) return 'purple';
    if (drugClass.includes('PD-1') || drugClass.includes('PD-L1')) return 'emerald';
    if (drugClass.includes('KRAS')) return 'yellow';
    if (drugClass.includes('Chemotherapy')) return 'red';
    return 'gray';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold">FDA-Approved Treatments</h1>
          </div>
          <p className="text-blue-100 text-lg max-w-2xl">
            Browse approved drugs for Non-Small Cell Lung Cancer including targeted
            therapies, immunotherapies, and chemotherapy options.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-8 -mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <form onSubmit={handleSearch} className="md:col-span-2">
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
                    placeholder="Search by name, mechanism..."
                    className="w-full pl-10 pr-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all shadow-sm"
                >
                  Search
                </button>
              </div>
            </form>

            <FilterSelect
              label="Drug Class"
              value={drugClass}
              options={drugClasses}
              onChange={(value) => {
                setDrugClass(value);
                setPage(1);
              }}
              placeholder="All classes"
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
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-gray-500">
                Showing <span className="font-semibold text-gray-900">{data.items.length}</span> of{' '}
                <span className="font-semibold text-gray-900">{data.total}</span> treatments
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {data.items.map((treatment) => (
                <Card
                  key={treatment.id}
                  href={`/treatments/${treatment.id}`}
                  title={treatment.generic_name}
                  subtitle={treatment.brand_names?.join(', ')}
                  badges={[
                    ...(treatment.drug_class
                      ? [{ label: treatment.drug_class, color: getBadgeColor(treatment.drug_class) }]
                      : []),
                    ...(treatment.fda_approval_status
                      ? [{ label: treatment.fda_approval_status, color: 'green' }]
                      : []),
                  ]}
                  meta={[
                    ...(treatment.manufacturer
                      ? [{ label: 'Manufacturer', value: treatment.manufacturer }]
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
            <p className="text-gray-500">No treatments found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
