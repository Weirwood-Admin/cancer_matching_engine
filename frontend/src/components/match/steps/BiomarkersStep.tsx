'use client';

import { useState } from 'react';

interface BiomarkersStepProps {
  biomarkers: Record<string, string[]>;
  onUpdate: (field: string, value: Record<string, string[]>) => void;
}

const driverMutations = [
  { id: 'EGFR', label: 'EGFR', color: 'blue', subtypes: ['L858R', 'Exon 19 del', 'T790M', 'Exon 20 ins', 'Other'] },
  { id: 'ALK', label: 'ALK', color: 'purple', subtypes: ['positive'] },
  { id: 'ROS1', label: 'ROS1', color: 'pink', subtypes: ['positive'] },
  { id: 'KRAS', label: 'KRAS G12C', color: 'orange', subtypes: ['G12C', 'Other'] },
  { id: 'MET', label: 'MET', color: 'cyan', subtypes: ['Exon 14 skip', 'Amplification'] },
  { id: 'RET', label: 'RET', color: 'indigo', subtypes: ['positive'] },
  { id: 'BRAF', label: 'BRAF V600E', color: 'amber', subtypes: ['V600E', 'Other'] },
  { id: 'NTRK', label: 'NTRK', color: 'rose', subtypes: ['positive'] },
  { id: 'HER2', label: 'HER2', color: 'emerald', subtypes: ['Mutation', 'Amplification'] },
];

const pdl1Options = [
  { value: '<1%', label: '<1%', sublabel: 'Negative' },
  { value: '1-49%', label: '1-49%', sublabel: 'Low-Mid' },
  { value: '>=50%', label: '≥50%', sublabel: 'High' },
  { value: 'unknown', label: '?', sublabel: 'Unknown' },
];

export function BiomarkersStep({ biomarkers, onUpdate }: BiomarkersStepProps) {
  const [expandedMutation, setExpandedMutation] = useState<string | null>(null);
  const [unknownBiomarkers, setUnknownBiomarkers] = useState(false);

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

    onUpdate('biomarkers', newBiomarkers);
  };

  const setPdl1 = (value: string) => {
    const newBiomarkers = { ...biomarkers };
    if (value === 'unknown') {
      delete newBiomarkers['PD-L1'];
    } else {
      newBiomarkers['PD-L1'] = [value];
    }
    onUpdate('biomarkers', newBiomarkers);
  };

  const handleUnknown = () => {
    setUnknownBiomarkers(true);
    onUpdate('biomarkers', {});
  };

  const currentPdl1 = biomarkers['PD-L1']?.[0];

  if (unknownBiomarkers) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Biomarker status unknown</h3>
        <p className="text-gray-500 text-center max-w-sm mb-6">
          No problem! We&apos;ll show trials that don&apos;t require specific biomarkers, plus some that may be relevant if you get tested.
        </p>
        <button
          type="button"
          onClick={() => setUnknownBiomarkers(false)}
          className="text-emerald-600 font-medium hover:text-emerald-700 transition-colors"
        >
          ← I know some of my biomarkers
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Skip option */}
      <button
        type="button"
        onClick={handleUnknown}
        className="w-full p-4 text-left rounded-xl border-2 border-dashed border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gray-100 group-hover:bg-gray-200 flex items-center justify-center transition-colors">
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <div className="font-medium text-gray-700">I don&apos;t know my biomarker status</div>
            <div className="text-sm text-gray-500">Skip if you haven&apos;t been tested yet</div>
          </div>
        </div>
      </button>

      {/* Driver Mutations */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Driver Mutations
          <span className="font-normal text-gray-500 ml-2">Select all that tested positive</span>
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
                      ? 'border-emerald-500 bg-emerald-50 shadow-sm'
                      : isExpanded
                      ? 'border-blue-300 bg-blue-50'
                      : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="font-semibold text-sm text-gray-900">{mutation.label}</div>
                  {isSelected && (
                    <div className="text-xs text-emerald-600 mt-0.5 truncate">
                      {biomarkers[mutation.id].join(', ')}
                    </div>
                  )}
                </button>

                {/* Subtype dropdown */}
                {isExpanded && !isSelected && (
                  <div className="absolute z-20 mt-1 w-48 bg-white border border-gray-200 rounded-xl shadow-xl p-2 left-0">
                    <div className="text-xs font-medium text-gray-500 px-2 py-1 mb-1">Select type:</div>
                    {mutation.subtypes.map((subtype) => (
                      <button
                        key={subtype}
                        type="button"
                        onClick={() => toggleBiomarker(mutation.id, subtype)}
                        className="w-full px-3 py-2 text-left text-sm font-medium text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg transition-colors"
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

      {/* PD-L1 Expression */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          PD-L1 Expression (TPS)
        </label>
        <div className="flex gap-2">
          {pdl1Options.map((option) => {
            const isSelected = currentPdl1 === option.value || (!currentPdl1 && option.value === 'unknown');

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setPdl1(option.value)}
                className={`flex-1 p-4 rounded-xl border-2 transition-all duration-200 ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50 shadow-sm'
                    : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className={`text-lg font-bold ${isSelected ? 'text-emerald-700' : 'text-gray-700'}`}>
                  {option.label}
                </div>
                <div className={`text-xs ${isSelected ? 'text-emerald-600' : 'text-gray-500'}`}>
                  {option.sublabel}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected summary */}
      {Object.keys(biomarkers).length > 0 && (
        <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
          <div className="text-sm font-medium text-emerald-800 mb-2">Selected biomarkers:</div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(biomarkers).map(([key, values]) => (
              <span
                key={key}
                className="inline-flex items-center gap-1 px-3 py-1 bg-white rounded-full text-sm font-medium text-emerald-700 border border-emerald-200"
              >
                {key}: {values.join(', ')}
                <button
                  type="button"
                  onClick={() => {
                    const newBiomarkers = { ...biomarkers };
                    delete newBiomarkers[key];
                    onUpdate('biomarkers', newBiomarkers);
                  }}
                  className="ml-1 text-emerald-400 hover:text-emerald-600"
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
    </div>
  );
}
