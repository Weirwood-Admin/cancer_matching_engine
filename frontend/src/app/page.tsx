import Link from 'next/link';
import { SearchBar } from '@/components/SearchBar';

const stats = [
  { value: '1,400+', label: 'Active Clinical Trials', sublabel: 'Recruiting now' },
  { value: '30+', label: 'FDA-Approved Therapies', sublabel: 'Including targeted & immunotherapy' },
  { value: '71', label: 'NCI Cancer Centers', sublabel: 'Nationwide network' },
];

const features = [
  {
    href: '/match',
    title: 'Find My Trials',
    description: 'Answer a quick questionnaire to get personalized trial matches based on your specific diagnosis and biomarkers.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    gradient: 'from-teal-500 to-emerald-500',
    primary: true,
  },
  {
    href: '/treatments',
    title: 'Browse Treatments',
    description: 'Explore FDA-approved therapies including targeted drugs, immunotherapies, and chemotherapy options for NSCLC.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
    gradient: 'from-blue-500 to-indigo-500',
  },
  {
    href: '/trials',
    title: 'Clinical Trials',
    description: 'Search actively recruiting trials by phase, location, and eligibility. Filter by biomarker requirements.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
    gradient: 'from-violet-500 to-purple-500',
  },
  {
    href: '/centers',
    title: 'Cancer Centers',
    description: 'Find NCI-designated cancer centers and top hospitals specializing in lung cancer treatment near you.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    gradient: 'from-amber-500 to-orange-500',
  },
];

const howItWorks = [
  {
    step: '01',
    title: 'Share Your Diagnosis',
    description: 'Answer questions about your cancer type, stage, biomarkers, and treatment history.',
  },
  {
    step: '02',
    title: 'Get Matched',
    description: 'Our system compares your profile against eligibility criteria from 1,400+ trials.',
  },
  {
    step: '03',
    title: 'Review Options',
    description: 'See trials ranked by fit, plus FDA-approved treatments matched to your biomarkers.',
  },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-teal-50/30 to-emerald-50/50"></div>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-teal-100/20 to-transparent"></div>

        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-teal-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-teal-200 rounded-full shadow-sm mb-8">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-sm font-medium text-gray-700">NSCLC Clinical Trial Matching</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight mb-6">
              Find clinical trials
              <span className="block bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
                matched to your diagnosis
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Answer a few questions about your NSCLC diagnosis and get a personalized list of clinical trials
              and FDA-approved treatments you may qualify for.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <Link
                href="/match"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-teal-600 to-emerald-600 rounded-xl hover:from-teal-700 hover:to-emerald-700 transition-all shadow-lg shadow-teal-500/25 hover:shadow-xl hover:shadow-teal-500/30"
              >
                Find My Trials
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="/trials"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold text-gray-700 bg-white border-2 border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all"
              >
                Browse All Trials
              </Link>
            </div>

            {/* Trust indicator */}
            <p className="text-sm text-gray-500">
              Takes about 3 minutes &middot; No account required &middot; Free to use
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="relative -mt-8 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-2">
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">
              {stats.map((stat, index) => (
                <div key={index} className="px-6 py-6 text-center">
                  <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm font-semibold text-gray-900 mb-0.5">{stat.label}</div>
                  <div className="text-xs text-gray-500">{stat.sublabel}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              How it works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Get matched to clinical trials in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorks.map((item, index) => (
              <div key={index} className="relative">
                {/* Connector line */}
                {index < howItWorks.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-gradient-to-r from-teal-200 to-emerald-200"></div>
                )}
                <div className="relative bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 border border-gray-100">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center text-white text-xl font-bold mb-6 shadow-lg shadow-teal-500/20">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA after how it works */}
          <div className="mt-12 text-center">
            <Link
              href="/match"
              className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-semibold transition-colors"
            >
              Start matching now
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything you need
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Comprehensive tools for exploring NSCLC treatment options
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <Link
                key={index}
                href={feature.href}
                className={`group relative rounded-2xl p-8 transition-all duration-300 ${
                  feature.primary
                    ? 'bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-xl shadow-teal-500/20 hover:shadow-2xl hover:shadow-teal-500/30 hover:-translate-y-1'
                    : 'bg-white border border-gray-200 hover:border-gray-300 hover:shadow-lg hover:-translate-y-1'
                }`}
              >
                <div
                  className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 ${
                    feature.primary
                      ? 'bg-white/20'
                      : `bg-gradient-to-br ${feature.gradient} text-white shadow-lg`
                  }`}
                >
                  {feature.icon}
                </div>
                <h3
                  className={`text-xl font-semibold mb-3 ${
                    feature.primary ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {feature.title}
                </h3>
                <p
                  className={`leading-relaxed ${
                    feature.primary ? 'text-teal-100' : 'text-gray-600'
                  }`}
                >
                  {feature.description}
                </p>
                <div
                  className={`mt-6 inline-flex items-center gap-2 font-medium text-sm ${
                    feature.primary
                      ? 'text-white'
                      : 'text-gray-900 group-hover:text-teal-600'
                  }`}
                >
                  {feature.primary ? 'Get started' : 'Learn more'}
                  <svg
                    className={`w-4 h-4 transition-transform group-hover:translate-x-1`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="py-16 bg-white border-y border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Looking for something specific?
          </h2>
          <p className="text-gray-600 mb-8">
            Search our database of treatments, trials, and cancer centers
          </p>
          <SearchBar
            size="lg"
            placeholder="Search treatments, trials, or cancer centers..."
            className="max-w-2xl mx-auto"
          />
        </div>
      </div>

      {/* Trust Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Powered by trusted data sources
            </h3>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-6">
            <div className="flex items-center gap-2 text-gray-400 hover:text-gray-600 transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
              <span className="font-medium">ClinicalTrials.gov</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400 hover:text-gray-600 transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
              </svg>
              <span className="font-medium">National Cancer Institute</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400 hover:text-gray-600 transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
              </svg>
              <span className="font-medium">OpenFDA</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400 hover:text-gray-600 transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
              </svg>
              <span className="font-medium">OncoKB</span>
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="py-12 bg-amber-50 border-t border-amber-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-amber-900 mb-1">Medical Disclaimer</h4>
              <p className="text-sm text-amber-800 leading-relaxed">
                This tool provides informational guidance only and is not medical advice. Treatment decisions
                should be made in consultation with qualified healthcare providers. Clinical trial eligibility
                is preliminary and must be verified by trial staff. Always discuss options with your oncologist.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
