'use client';

interface TrialCriteriaStepProps {
  phase: string | null;
  stages: string[];
  histology: string[];
  ageMin: number | null;
  ageMax: number | null;
  ecogMax: number | null;
  treatmentNaiveOnly: boolean | null;
  onUpdate: (field: string, value: unknown) => void;
}

const phaseOptions = [
  { value: 'Phase 1', label: 'Phase 1' },
  { value: 'Phase 1/Phase 2', label: 'Phase 1/2' },
  { value: 'Phase 2', label: 'Phase 2' },
  { value: 'Phase 2/Phase 3', label: 'Phase 2/3' },
  { value: 'Phase 3', label: 'Phase 3' },
];

const stageOptions = [
  { value: 'I', label: 'Stage I' },
  { value: 'II', label: 'Stage II' },
  { value: 'III', label: 'Stage III' },
  { value: 'IIIA', label: 'Stage IIIA' },
  { value: 'IIIB', label: 'Stage IIIB' },
  { value: 'IV', label: 'Stage IV' },
];

const histologyOptions = [
  { value: 'adenocarcinoma', label: 'Adenocarcinoma' },
  { value: 'squamous', label: 'Squamous Cell' },
  { value: 'large cell', label: 'Large Cell' },
  { value: 'non-squamous', label: 'Non-Squamous' },
  { value: 'any', label: 'Any NSCLC' },
];

const ecogOptions = [
  { value: 0, label: 'ECOG 0' },
  { value: 1, label: 'ECOG 0-1' },
  { value: 2, label: 'ECOG 0-2' },
];

export function TrialCriteriaStep({
  phase,
  stages,
  histology,
  ageMin,
  ageMax,
  ecogMax,
  treatmentNaiveOnly,
  onUpdate,
}: TrialCriteriaStepProps) {
  const toggleStage = (value: string) => {
    const newStages = stages.includes(value)
      ? stages.filter(s => s !== value)
      : [...stages, value];
    onUpdate('target_stages', newStages);
  };

  const toggleHistology = (value: string) => {
    const newHistology = histology.includes(value)
      ? histology.filter(h => h !== value)
      : [...histology, value];
    onUpdate('target_histology', newHistology);
  };

  return (
    <div className="space-y-6">
      {/* Phase Selection */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Trial Phase
        </label>
        <div className="flex flex-wrap gap-2">
          {phaseOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onUpdate('phase', phase === option.value ? null : option.value)}
              className={`px-4 py-2 rounded-lg border-2 font-medium text-sm transition-all ${
                phase === option.value
                  ? 'border-violet-500 bg-violet-50 text-violet-700'
                  : 'border-gray-100 text-gray-600 hover:border-gray-200 hover:bg-gray-50'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Disease Stage */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Target Disease Stages
          <span className="font-normal text-gray-500 ml-2">Select all that apply</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {stageOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => toggleStage(option.value)}
              className={`px-4 py-2 rounded-lg border-2 font-medium text-sm transition-all ${
                stages.includes(option.value)
                  ? 'border-violet-500 bg-violet-50 text-violet-700'
                  : 'border-gray-100 text-gray-600 hover:border-gray-200 hover:bg-gray-50'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Histology */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Target Histology
          <span className="font-normal text-gray-500 ml-2">Select all that apply</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {histologyOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => toggleHistology(option.value)}
              className={`px-4 py-2 rounded-lg border-2 font-medium text-sm transition-all ${
                histology.includes(option.value)
                  ? 'border-violet-500 bg-violet-50 text-violet-700'
                  : 'border-gray-100 text-gray-600 hover:border-gray-200 hover:bg-gray-50'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Age Range */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Age Range
        </label>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">Minimum Age</label>
            <input
              type="number"
              value={ageMin ?? ''}
              onChange={(e) => onUpdate('ageMin', e.target.value ? parseInt(e.target.value) : null)}
              placeholder="18"
              min={0}
              max={120}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all"
            />
          </div>
          <span className="text-gray-400 mt-5">to</span>
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">Maximum Age</label>
            <input
              type="number"
              value={ageMax ?? ''}
              onChange={(e) => onUpdate('ageMax', e.target.value ? parseInt(e.target.value) : null)}
              placeholder="99"
              min={0}
              max={120}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all"
            />
          </div>
        </div>
      </div>

      {/* ECOG Maximum */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Maximum ECOG Status
        </label>
        <div className="flex gap-2">
          {ecogOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onUpdate('ecog_max', ecogMax === option.value ? null : option.value)}
              className={`flex-1 px-4 py-3 rounded-lg border-2 font-medium text-sm transition-all ${
                ecogMax === option.value
                  ? 'border-violet-500 bg-violet-50 text-violet-700'
                  : 'border-gray-100 text-gray-600 hover:border-gray-200 hover:bg-gray-50'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Treatment Naive */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Treatment History Requirement
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onUpdate('treatment_naive_only', true)}
            className={`flex-1 px-4 py-3 rounded-lg border-2 font-medium text-sm transition-all ${
              treatmentNaiveOnly === true
                ? 'border-violet-500 bg-violet-50 text-violet-700'
                : 'border-gray-100 text-gray-600 hover:border-gray-200 hover:bg-gray-50'
            }`}
          >
            Treatment-Naive Only
          </button>
          <button
            type="button"
            onClick={() => onUpdate('treatment_naive_only', false)}
            className={`flex-1 px-4 py-3 rounded-lg border-2 font-medium text-sm transition-all ${
              treatmentNaiveOnly === false
                ? 'border-violet-500 bg-violet-50 text-violet-700'
                : 'border-gray-100 text-gray-600 hover:border-gray-200 hover:bg-gray-50'
            }`}
          >
            Prior Treatment Allowed
          </button>
        </div>
      </div>
    </div>
  );
}
