'use client';

import { StructuredEligibility, PatientProfile } from '@/lib/api';

interface StructuredEligibilityDisplayProps {
  eligibility: StructuredEligibility;
  patientProfile?: PatientProfile | null;
  showConfidence?: boolean;
}

type MatchStatus = 'match' | 'mismatch' | 'unknown' | 'warning';

interface CriteriaItemProps {
  label: string;
  value: string | null;
  status: MatchStatus;
  detail?: string;
}

const statusColors: Record<MatchStatus, { bg: string; text: string; border: string }> = {
  match: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  mismatch: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  warning: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
  unknown: { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200' },
};

function CriteriaItem({ label, value, status, detail }: CriteriaItemProps) {
  const colors = statusColors[status];

  if (value === null) return null;

  return (
    <div className={`p-2 rounded-md ${colors.bg} ${colors.border} border`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className={`text-sm font-medium ${colors.text}`}>{value}</span>
      </div>
      {detail && <p className={`text-xs mt-1 ${colors.text}`}>{detail}</p>}
    </div>
  );
}

function StatusIcon({ status }: { status: MatchStatus }) {
  if (status === 'match') {
    return (
      <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    );
  }
  if (status === 'mismatch') {
    return (
      <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
    );
  }
  return (
    <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
    </svg>
  );
}

export function StructuredEligibilityDisplay({
  eligibility,
  patientProfile,
  showConfidence = true,
}: StructuredEligibilityDisplayProps) {
  // Helper to determine match status for age
  const getAgeStatus = (): MatchStatus => {
    if (!patientProfile?.age) return 'unknown';
    const { min, max } = eligibility.age;
    if (min !== null && patientProfile.age < min) return 'mismatch';
    if (max !== null && patientProfile.age > max) return 'mismatch';
    return 'match';
  };

  // Helper to determine match status for ECOG
  const getEcogStatus = (): MatchStatus => {
    if (patientProfile?.ecog_status === null || patientProfile?.ecog_status === undefined) return 'unknown';
    const { min, max } = eligibility.ecog;
    if (max !== null && patientProfile.ecog_status > max) return 'mismatch';
    if (min !== null && patientProfile.ecog_status < min) return 'mismatch';
    return 'match';
  };

  // Format age requirement
  const formatAge = () => {
    const { min, max } = eligibility.age;
    if (min !== null && max !== null) return `${min}-${max} years`;
    if (min !== null) return `${min}+ years`;
    if (max !== null) return `Up to ${max} years`;
    return null;
  };

  // Format ECOG requirement
  const formatEcog = () => {
    const { min, max } = eligibility.ecog;
    if (min !== null && max !== null) return `${min}-${max}`;
    if (max !== null) return `0-${max}`;
    if (min !== null) return `${min}+`;
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Confidence indicator */}
      {showConfidence && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500">Extraction confidence:</span>
          <div className="flex items-center gap-1">
            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  eligibility.extraction_confidence >= 0.8
                    ? 'bg-green-500'
                    : eligibility.extraction_confidence >= 0.5
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                }`}
                style={{ width: `${eligibility.extraction_confidence * 100}%` }}
              />
            </div>
            <span className="text-gray-600">{Math.round(eligibility.extraction_confidence * 100)}%</span>
          </div>
        </div>
      )}

      {/* Demographics Section */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
          Demographics
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <CriteriaItem
            label="Age"
            value={formatAge()}
            status={getAgeStatus()}
            detail={patientProfile?.age ? `Patient: ${patientProfile.age} years` : undefined}
          />
          <CriteriaItem
            label="ECOG Status"
            value={formatEcog()}
            status={getEcogStatus()}
            detail={patientProfile?.ecog_status !== null && patientProfile?.ecog_status !== undefined
              ? `Patient: ECOG ${patientProfile.ecog_status}`
              : undefined}
          />
        </div>
      </div>

      {/* Disease Section */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
          Disease Characteristics
        </h4>
        <div className="space-y-2">
          {eligibility.disease_stage.allowed.length > 0 && (
            <CriteriaItem
              label="Allowed Stages"
              value={eligibility.disease_stage.allowed.join(', ')}
              status={
                patientProfile?.stage
                  ? eligibility.disease_stage.allowed.some(s =>
                      s.toUpperCase() === patientProfile.stage?.toUpperCase()
                    )
                    ? 'match'
                    : 'warning'
                  : 'unknown'
              }
              detail={patientProfile?.stage ? `Patient: Stage ${patientProfile.stage}` : undefined}
            />
          )}
          {eligibility.histology.allowed.length > 0 && (
            <CriteriaItem
              label="Allowed Histology"
              value={eligibility.histology.allowed.join(', ')}
              status={
                patientProfile?.histology
                  ? eligibility.histology.allowed.some(h =>
                      h.toLowerCase().includes(patientProfile.histology?.toLowerCase() || '') ||
                      (patientProfile.histology?.toLowerCase() || '').includes(h.toLowerCase())
                    )
                    ? 'match'
                    : 'warning'
                  : 'unknown'
              }
              detail={patientProfile?.histology ? `Patient: ${patientProfile.histology}` : undefined}
            />
          )}
        </div>
      </div>

      {/* Biomarkers Section */}
      {(Object.keys(eligibility.biomarkers.required_positive).length > 0 ||
        eligibility.biomarkers.required_negative.length > 0 ||
        eligibility.biomarkers.pdl1_expression) && (
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
            Biomarker Requirements
          </h4>
          <div className="space-y-2">
            {Object.entries(eligibility.biomarkers.required_positive).map(([biomarker, mutations]) => {
              const patientBiomarker = patientProfile?.biomarkers?.[biomarker];
              let status: MatchStatus = 'unknown';

              if (patientBiomarker) {
                const patientValues = patientBiomarker.map(v => v.toLowerCase());
                const requiredValues = mutations.map(m => m.toLowerCase());
                const positiveIndicators = ['positive', 'present', 'detected', '+'];

                if (positiveIndicators.some(p => requiredValues.includes(p))) {
                  status = positiveIndicators.some(p => patientValues.includes(p)) ? 'match' : 'mismatch';
                } else if (requiredValues.some(r => patientValues.includes(r))) {
                  status = 'match';
                } else if (positiveIndicators.some(p => patientValues.includes(p))) {
                  status = 'warning'; // Patient positive but specific mutation required
                } else {
                  status = 'mismatch';
                }
              }

              return (
                <CriteriaItem
                  key={biomarker}
                  label={`${biomarker} Required`}
                  value={mutations.join(', ')}
                  status={status}
                  detail={
                    patientBiomarker
                      ? `Patient: ${biomarker} ${patientBiomarker.join(', ')}`
                      : undefined
                  }
                />
              );
            })}

            {eligibility.biomarkers.required_negative.map((biomarker) => {
              const patientBiomarker = patientProfile?.biomarkers?.[biomarker];
              let status: MatchStatus = 'unknown';

              if (patientBiomarker) {
                const patientValues = patientBiomarker.map(v => v.toLowerCase());
                const negativeIndicators = ['negative', 'wild-type', 'not detected', '-'];
                const positiveIndicators = ['positive', 'present', 'detected', '+'];

                if (negativeIndicators.some(n => patientValues.includes(n))) {
                  status = 'match';
                } else if (positiveIndicators.some(p => patientValues.includes(p))) {
                  status = 'mismatch';
                }
              }

              return (
                <CriteriaItem
                  key={biomarker}
                  label={`${biomarker} Must Be Negative`}
                  value="Negative/Wild-type"
                  status={status}
                  detail={
                    patientBiomarker
                      ? `Patient: ${biomarker} ${patientBiomarker.join(', ')}`
                      : undefined
                  }
                />
              );
            })}

            {eligibility.biomarkers.pdl1_expression && (
              <CriteriaItem
                label="PD-L1 Expression"
                value={
                  eligibility.biomarkers.pdl1_expression.min_tps !== undefined
                    ? `TPS >= ${eligibility.biomarkers.pdl1_expression.min_tps}%`
                    : eligibility.biomarkers.pdl1_expression.level || 'Required'
                }
                status="unknown"
              />
            )}
          </div>
        </div>
      )}

      {/* Prior Treatment Section */}
      {(eligibility.prior_treatments.required.length > 0 ||
        eligibility.prior_treatments.excluded.length > 0 ||
        eligibility.prior_treatments.treatment_naive_required ||
        eligibility.prior_treatments.max_lines !== null) && (
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
            Prior Treatment
          </h4>
          <div className="space-y-2">
            {eligibility.prior_treatments.treatment_naive_required && (
              <CriteriaItem
                label="Treatment Naive"
                value="Required"
                status={
                  patientProfile?.prior_treatments
                    ? patientProfile.prior_treatments.length === 0
                      ? 'match'
                      : 'mismatch'
                    : 'unknown'
                }
                detail={
                  patientProfile?.prior_treatments && patientProfile.prior_treatments.length > 0
                    ? `Patient has ${patientProfile.prior_treatments.length} prior treatment(s)`
                    : undefined
                }
              />
            )}
            {eligibility.prior_treatments.max_lines !== null && (
              <CriteriaItem
                label="Max Prior Lines"
                value={String(eligibility.prior_treatments.max_lines)}
                status="unknown"
              />
            )}
            {eligibility.prior_treatments.required.length > 0 && (
              <CriteriaItem
                label="Required Prior"
                value={eligibility.prior_treatments.required.join(', ')}
                status="unknown"
              />
            )}
            {eligibility.prior_treatments.excluded.length > 0 && (
              <CriteriaItem
                label="Excluded Prior"
                value={eligibility.prior_treatments.excluded.join(', ')}
                status="unknown"
              />
            )}
          </div>
        </div>
      )}

      {/* Health Status Section */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <span className="w-2 h-2 bg-red-500 rounded-full"></span>
          Health Status
        </h4>
        <div className="space-y-2">
          <CriteriaItem
            label="Brain Metastases"
            value={
              eligibility.brain_metastases.allowed
                ? eligibility.brain_metastases.controlled_only
                  ? 'Allowed (controlled only)'
                  : 'Allowed'
                : 'Not Allowed'
            }
            status={
              patientProfile?.brain_metastases === null || patientProfile?.brain_metastases === undefined
                ? 'unknown'
                : patientProfile.brain_metastases && !eligibility.brain_metastases.allowed
                ? 'mismatch'
                : 'match'
            }
            detail={
              patientProfile?.brain_metastases !== null && patientProfile?.brain_metastases !== undefined
                ? patientProfile.brain_metastases
                  ? 'Patient has brain metastases'
                  : 'Patient does not have brain metastases'
                : undefined
            }
          />
        </div>
      </div>

      {/* Common Exclusions */}
      {eligibility.common_exclusions.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
            Common Exclusions
          </h4>
          <div className="flex flex-wrap gap-1">
            {eligibility.common_exclusions.map((exclusion, index) => (
              <span
                key={index}
                className="px-2 py-0.5 text-xs font-medium rounded bg-gray-100 text-gray-700"
              >
                {exclusion}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Extraction Notes */}
      {eligibility.extraction_notes.length > 0 && (
        <div className="mt-3 p-2 bg-yellow-50 rounded-md border border-yellow-200">
          <p className="text-xs text-yellow-700 font-medium mb-1">Extraction Notes:</p>
          <ul className="text-xs text-yellow-600 list-disc list-inside">
            {eligibility.extraction_notes.map((note, index) => (
              <li key={index}>{note}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// Simple display version without patient matching
export function StructuredEligibilitySimple({ eligibility }: { eligibility: StructuredEligibility }) {
  return <StructuredEligibilityDisplay eligibility={eligibility} showConfidence={false} />;
}
