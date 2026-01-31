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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          FDA-Approved NSCLC Treatments
        </h1>
        <p className="text-gray-600">
          Browse approved drugs for Non-Small Cell Lung Cancer including targeted
          therapies, immunotherapies, and chemotherapy.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <form onSubmit={handleSearch} className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, mechanism..."
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
          <p className="text-sm text-gray-500 mb-4">
            Showing {data.items.length} of {data.total} treatments
          </p>

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
        <div className="text-center py-12 text-gray-500">
          No treatments found matching your criteria.
        </div>
      )}
    </div>
  );
}
