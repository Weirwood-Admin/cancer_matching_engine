'use client';

import { PatientProfile } from '@/lib/api';

interface ParsedProfileCardProps {
  profile: PatientProfile;
}

export function ParsedProfileCard({ profile }: ParsedProfileCardProps) {
  const hasBiomarkers = Object.keys(profile.biomarkers).length > 0;
  const hasPriorTreatments = profile.prior_treatments.length > 0;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Parsed Patient Profile</h3>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <ProfileField label="Cancer Type" value={profile.cancer_type} />
        <ProfileField label="Histology" value={profile.histology} />
        <ProfileField label="Stage" value={profile.stage} />
        <ProfileField label="Age" value={profile.age?.toString()} />
        <ProfileField label="ECOG Status" value={profile.ecog_status?.toString()} />
        <ProfileField label="Line of Therapy" value={profile.line_of_therapy} />
        <ProfileField
          label="Brain Metastases"
          value={profile.brain_mets_status || (profile.brain_metastases === null ? null : profile.brain_metastases ? 'Yes' : 'No')}
        />
        <ProfileField
          label="Prior Malignancy"
          value={profile.prior_malignancy === null ? null : profile.prior_malignancy ? 'Yes' : 'No'}
        />
        <ProfileField
          label="Organ Function Issues"
          value={profile.organ_function_issues === null ? 'Unknown' : profile.organ_function_issues ? 'Yes' : 'No'}
        />
        <ProfileField label="Location" value={profile.location} />
        <ProfileField
          label="Travel Distance"
          value={profile.travel_distance_miles ? `${profile.travel_distance_miles} miles` : 'Any distance'}
        />
      </div>

      {hasBiomarkers && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
            Biomarkers
          </p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(profile.biomarkers).map(([biomarker, values]) => (
              <span
                key={biomarker}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
              >
                {biomarker}: {values.join(', ')}
              </span>
            ))}
          </div>
        </div>
      )}

      {hasPriorTreatments && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
            Prior Treatments
          </p>
          <div className="flex flex-wrap gap-2">
            {profile.prior_treatments.map((treatment, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800"
              >
                {treatment}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ProfileField({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-sm text-gray-900 mt-0.5">
        {value ?? <span className="text-gray-400 italic">Not specified</span>}
      </p>
    </div>
  );
}
