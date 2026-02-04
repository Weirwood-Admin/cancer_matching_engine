'use client';

import Link from 'next/link';
import { TreatmentMatch, TrialMatch, EligibilityResult, StructuredEligibility } from '@/lib/api';

interface MatchResultsProps {
  treatments: TreatmentMatch[];
  trials: TrialMatch[];
  processingTimeMs: number;
}

const eligibilityColors: Record<EligibilityResult['status'], { bg: string; text: string; label: string }> = {
  eligible: { bg: 'bg-green-100', text: 'text-green-800', label: 'Likely Eligible' },
  uncertain: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Uncertain' },
  ineligible: { bg: 'bg-red-100', text: 'text-red-800', label: 'Likely Ineligible' },
};

export function MatchResults({ treatments, trials, processingTimeMs }: MatchResultsProps) {
  return (
    <div className="space-y-8">
      <p className="text-sm text-gray-500">
        Found {treatments.length} treatments and {trials.length} trials in {(processingTimeMs / 1000).toFixed(1)}s
      </p>

      {/* Treatments Section */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          FDA-Approved Treatments ({treatments.length})
        </h2>
        {treatments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {treatments.map((treatment) => (
              <TreatmentCard key={treatment.id} treatment={treatment} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm py-4">
            No specific biomarker-targeted treatments found. Consult with an oncologist for treatment options.
          </p>
        )}
      </section>

      {/* Trials Section */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Clinical Trials ({trials.length})
        </h2>
        {trials.length > 0 ? (
          <div className="space-y-4">
            {trials.map((trial) => (
              <TrialCard key={trial.id} trial={trial} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm py-4">
            No matching clinical trials found based on the provided criteria.
          </p>
        )}
      </section>
    </div>
  );
}

function TreatmentCard({ treatment }: { treatment: TreatmentMatch }) {
  const scorePercent = Math.round(treatment.match_score * 100);

  return (
    <Link
      href={`/treatments/${treatment.id}`}
      className="block bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-emerald-300 transition-all"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex flex-wrap gap-2">
          {treatment.drug_class && (
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
              {treatment.drug_class}
            </span>
          )}
          {treatment.fda_approval_status && (
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800">
              {treatment.fda_approval_status}
            </span>
          )}
        </div>
        <span className="text-sm font-medium text-emerald-600">{scorePercent}% match</span>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-1">{treatment.generic_name}</h3>

      {treatment.brand_names && treatment.brand_names.length > 0 && (
        <p className="text-sm text-gray-500 mb-2">
          Brand: {treatment.brand_names.join(', ')}
        </p>
      )}

      <p className="text-sm text-gray-600">{treatment.match_reason}</p>

      {treatment.biomarker_requirements && Object.keys(treatment.biomarker_requirements).length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {Object.entries(treatment.biomarker_requirements).map(([biomarker, values]) => (
            <span
              key={biomarker}
              className="px-2 py-0.5 text-xs font-medium rounded bg-purple-50 text-purple-700"
            >
              {biomarker}: {Array.isArray(values) ? values.join(', ') : values}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}

const relevanceColors: Record<string, { bg: string; text: string }> = {
  nsclc_specific: { bg: 'bg-green-50', text: 'text-green-700' },
  nsclc_primary: { bg: 'bg-blue-50', text: 'text-blue-700' },
  multi_cancer: { bg: 'bg-yellow-50', text: 'text-yellow-700' },
  solid_tumor: { bg: 'bg-orange-50', text: 'text-orange-700' },
};

function TrialCard({ trial }: { trial: TrialMatch }) {
  const eligibility = trial.eligibility;
  const colors = eligibilityColors[eligibility.status];
  const confidencePercent = Math.round(eligibility.confidence * 100);
  const structured = trial.structured_eligibility;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex flex-wrap gap-2">
          {trial.phase && (
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
              {trial.phase}
            </span>
          )}
          {trial.status && (
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
              {trial.status}
            </span>
          )}
          {trial.nsclc_relevance && relevanceColors[trial.nsclc_relevance] && (
            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${relevanceColors[trial.nsclc_relevance].bg} ${relevanceColors[trial.nsclc_relevance].text}`}>
              {trial.nsclc_relevance.replace('_', ' ')}
            </span>
          )}
        </div>
        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${colors.bg} ${colors.text}`}>
          {colors.label} ({confidencePercent}%)
        </span>
      </div>

      <Link href={`/trials/${trial.nct_id}`} className="block group">
        <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors line-clamp-2">
          {trial.title || trial.nct_id}
        </h3>
      </Link>

      <p className="text-xs text-gray-500 mb-2">{trial.nct_id}</p>

      {trial.brief_summary && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{trial.brief_summary}</p>
      )}

      {/* Quick biomarker badges */}
      {structured?.biomarkers?.required_positive && Object.keys(structured.biomarkers.required_positive).length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {Object.entries(structured.biomarkers.required_positive).slice(0, 4).map(([biomarker, mutations]) => (
            <span
              key={biomarker}
              className="px-2 py-0.5 text-xs font-medium rounded bg-emerald-50 text-emerald-700 border border-emerald-200"
              title={`Required: ${mutations.join(', ')}`}
            >
              {biomarker}+
            </span>
          ))}
          {structured.biomarkers.required_negative.slice(0, 2).map((biomarker) => (
            <span
              key={biomarker}
              className="px-2 py-0.5 text-xs font-medium rounded bg-gray-50 text-gray-600 border border-gray-200"
              title="Must be negative"
            >
              {biomarker}-
            </span>
          ))}
        </div>
      )}

      {/* Eligibility Explanation */}
      <div className="bg-gray-50 rounded-md p-3 mb-3">
        <p className="text-sm text-gray-700">{eligibility.explanation}</p>

        {eligibility.matching_criteria.length > 0 && (
          <div className="mt-2">
            <p className="text-xs font-medium text-green-700 mb-1">Matching criteria:</p>
            <ul className="text-xs text-green-600 list-disc list-inside">
              {eligibility.matching_criteria.slice(0, 3).map((criteria, index) => (
                <li key={index}>{criteria}</li>
              ))}
              {eligibility.matching_criteria.length > 3 && (
                <li>+{eligibility.matching_criteria.length - 3} more</li>
              )}
            </ul>
          </div>
        )}

        {eligibility.excluding_criteria.length > 0 && (
          <div className="mt-2">
            <p className="text-xs font-medium text-red-700 mb-1">Potential exclusions:</p>
            <ul className="text-xs text-red-600 list-disc list-inside">
              {eligibility.excluding_criteria.slice(0, 3).map((criteria, index) => (
                <li key={index}>{criteria}</li>
              ))}
              {eligibility.excluding_criteria.length > 3 && (
                <li>+{eligibility.excluding_criteria.length - 3} more</li>
              )}
            </ul>
          </div>
        )}
      </div>

      {/* Trial Metadata */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
        {trial.sponsor && (
          <span>
            <span className="font-medium">Sponsor:</span> {trial.sponsor}
          </span>
        )}
        {trial.locations && trial.locations.length > 0 && (
          <span>
            <span className="font-medium">Locations:</span>{' '}
            {trial.locations.slice(0, 2).map(loc => `${loc.city}, ${loc.state}`).join('; ')}
            {trial.locations.length > 2 && ` +${trial.locations.length - 2} more`}
          </span>
        )}
      </div>

      {/* Links */}
      <div className="mt-3 flex gap-3">
        <Link
          href={`/trials/${trial.nct_id}`}
          className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
        >
          View Details
        </Link>
        {trial.study_url && (
          <a
            href={trial.study_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            ClinicalTrials.gov
          </a>
        )}
      </div>
    </div>
  );
}
