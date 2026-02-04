'use client';

import { useState } from 'react';

interface TrialBiomarkersStepProps {
  biomarkers: Record<string, string[]>;
  onUpdate: (field: string, value: Record<string, string[]>) => void;
}

const driverMutations = [
  { id: 'EGFR', label: 'EGFR', subtypes: ['L858R', 'Exon 19 del', 'T790M', 'Exon 20 ins', 'Any'] },
  { id: 'ALK', label: 'ALK', subtypes: ['positive'] },
  { id: 'ROS1', label: 'ROS1', subtypes: ['positive'] },
  { id: 'KRAS', label: 'KRAS', subtypes: ['G12C', 'Any'] },
  { id: 'MET', label: 'MET', subtypes: ['Exon 14 skip', 'Amplification'] },
  { id: 'RET', label: 'RET', subtypes: ['positive'] },
  { id: 'BRAF', label: 'BRAF', subtypes: ['V600E', 'Any'] },
  { id: 'NTRK', label: 'NTRK', subtypes: ['positive'] },
  { id: 'HER2', label: 'HER2', subtypes: ['Mutation', 'Amplification'] },
];

export function TrialBiomarkersStep({ biomarkers, onUpdate }: TrialBiomarkersStepProps) {
  const [expandedMutation, setExpandedMutation] = useState<string | null>(null);

  const toggleBiomarker = (id: string, subtype?: string) => {
    const newBiomarkers = { ...biomarkers };

    if (subtype) {
      if (!newBiomarkers[id]) {
        newBiomarkers[id] = [subtype];
      } else if (newBiomarkers[id].includes(subtype)) {
        newBiomarkers[id] = newBiomarkers[id].filter(s => s !== subtype);
        if (newBiomarkers[id].length === 0) {
          delete newBiomarkers[id];
        }
      } else {
        newBiomarkers[id] = [...newBiomarkers[id], subtype];
      }
      setExpandedMutation(null);
    } else {
      if (newBiomarkers[id]) {
        delete newBiomarkers[id];
        setExpandedMutation(null);
      } else {
        setExpandedMutation(expandedMutation === id ? null : id);
        return;
      }
    }

    onUpdate('target_biomarkers', newBiomarkers);
  };

  return (
    <div className="space-y-8">
      {/* Info card */}
      <div className="p-4 bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl border border-violet-100">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-sm text-violet-800">
            Select the biomarkers your trial is targeting. We&apos;ll find competing trials recruiting similar patient populations.
          </p>
        </div>
      </div>

      {/* Driver Mutations */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Target Biomarkers
          <span className="font-normal text-gray-500 ml-2">Select all that apply</span>
        </label>
        <div className="grid grid-cols-3 gap-2">
          {driverMutations.map((mutation) => {
            const isSelected = !!biomarkers[mutation.id];
            const isExpanded = expandedMutation === mutation.id;

            return (
              <div key={mutation.id} className="relative">
                <button
                  type="button"
                  onClick={() => toggleBiomarker(mutation.id)}
                  className={`w-full p-3 rounded-xl border-2 transition-all duration-200 ${
                    isSelected
                      ? 'border-violet-500 bg-violet-50 shadow-sm'
                      : isExpanded
                      ? 'border-violet-300 bg-violet-50'
                      : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="font-semibold text-sm text-gray-900">{mutation.label}</div>
                  {isSelected && (
                    <div className="text-xs text-violet-600 mt-0.5 truncate">
                      {biomarkers[mutation.id].join(', ')}
                    </div>
                  )}
                </button>

                {/* Subtype dropdown */}
                {isExpanded && !isSelected && (
                  <div className="absolute z-20 mt-1 w-48 bg-white border border-gray-200 rounded-xl shadow-xl p-2 left-0">
                    <div className="text-xs font-medium text-gray-500 px-2 py-1 mb-1">Select target:</div>
                    {mutation.subtypes.map((subtype) => (
                      <button
                        key={subtype}
                        type="button"
                        onClick={() => toggleBiomarker(mutation.id, subtype)}
                        className="w-full px-3 py-2 text-left text-sm font-medium text-gray-700 hover:bg-violet-50 hover:text-violet-700 rounded-lg transition-colors"
                      >
                        {subtype}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected summary */}
      {Object.keys(biomarkers).length > 0 && (
        <div className="p-4 bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl border border-violet-100">
          <div className="text-sm font-medium text-violet-800 mb-2">Selected biomarkers:</div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(biomarkers).map(([key, values]) => (
              <span
                key={key}
                className="inline-flex items-center gap-1 px-3 py-1 bg-white rounded-full text-sm font-medium text-violet-700 border border-violet-200"
              >
                {key}: {values.join(', ')}
                <button
                  type="button"
                  onClick={() => {
                    const newBiomarkers = { ...biomarkers };
                    delete newBiomarkers[key];
                    onUpdate('target_biomarkers', newBiomarkers);
                  }}
                  className="ml-1 text-violet-400 hover:text-violet-600"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Skip option */}
      {Object.keys(biomarkers).length === 0 && (
        <p className="text-center text-sm text-gray-500">
          You can skip this step if your trial doesn&apos;t target specific biomarkers
        </p>
      )}
    </div>
  );
}
