import Link from 'next/link';
import { SearchBar } from '@/components/SearchBar';

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          NSCLC Treatment & Trial Discovery
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Comprehensive database of FDA-approved treatments, active clinical trials,
          and NCI-designated cancer centers for Non-Small Cell Lung Cancer.
        </p>

        <SearchBar
          size="lg"
          placeholder="Search treatments, trials, or cancer centers..."
          className="max-w-2xl mx-auto"
        />
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
          <div className="text-4xl font-bold text-emerald-600 mb-2">30+</div>
          <div className="text-gray-600">FDA-Approved Treatments</div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
          <div className="text-4xl font-bold text-emerald-600 mb-2">1000+</div>
          <div className="text-gray-600">Active Clinical Trials</div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
          <div className="text-4xl font-bold text-emerald-600 mb-2">70+</div>
          <div className="text-gray-600">NCI Cancer Centers</div>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Link
          href="/treatments"
          className="group bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg hover:border-emerald-300 transition-all"
        >
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6 text-blue-600"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 00.659 1.591L19 14.5M14.25 3.104c.251.023.501.05.75.082M19 14.5l-2.47-2.47a.75.75 0 00-1.06 0L12 15.5l-3.47-3.47a.75.75 0 00-1.06 0L5 14.5m14 0v3.75a2.25 2.25 0 01-2.25 2.25H7.25A2.25 2.25 0 015 18.25V14.5"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Treatments</h2>
          <p className="text-gray-600">
            Browse FDA-approved drugs for NSCLC including targeted therapies,
            immunotherapies, and chemotherapy options.
          </p>
        </Link>

        <Link
          href="/trials"
          className="group bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg hover:border-emerald-300 transition-all"
        >
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6 text-purple-600"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 00.659 1.591L19 14.5M14.25 3.104c.251.023.501.05.75.082M19 14.5l-2.47-2.47a.75.75 0 00-1.06 0L12 15.5l-3.47-3.47a.75.75 0 00-1.06 0L5 14.5m14 0v3.75a2.25 2.25 0 01-2.25 2.25H7.25A2.25 2.25 0 015 18.25V14.5"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Clinical Trials</h2>
          <p className="text-gray-600">
            Find actively recruiting NSCLC trials near you. Filter by phase,
            location, and biomarker requirements.
          </p>
        </Link>

        <Link
          href="/centers"
          className="group bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg hover:border-emerald-300 transition-all"
        >
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6 text-green-600"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Cancer Centers</h2>
          <p className="text-gray-600">
            Explore NCI-designated cancer centers and top-ranked hospitals
            specializing in lung cancer treatment.
          </p>
        </Link>
      </div>

      {/* Data Sources */}
      <div className="mt-16 text-center">
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">
          Data Sources
        </h3>
        <div className="flex flex-wrap justify-center gap-8 text-gray-400">
          <span>ClinicalTrials.gov</span>
          <span>OpenFDA</span>
          <span>NCI</span>
          <span>OncoKB</span>
        </div>
      </div>
    </div>
  );
}
