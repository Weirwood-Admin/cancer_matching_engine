'use client';

interface DiagnosisStepProps {
  age: number | null;
  histology: string | null;
  stage: string | null;
  onUpdate: (field: string, value: string | number | null) => void;
}

const histologyOptions = [
  { value: 'adenocarcinoma', label: 'Adenocarcinoma', description: 'Most common (~40%)', icon: '🔬' },
  { value: 'squamous', label: 'Squamous Cell', description: 'Central airways (~30%)', icon: '🧫' },
  { value: 'large_cell', label: 'Large Cell', description: 'Less common', icon: '🔎' },
  { value: 'other', label: 'Other/Unknown', description: 'Not yet determined', icon: '❓' },
];

const stageOptions = [
  { value: 'I', label: 'Stage I', description: 'Localized', color: 'emerald' },
  { value: 'II', label: 'Stage II', description: 'Nearby nodes', color: 'emerald' },
  { value: 'IIIA', label: 'Stage IIIA', description: 'Regional, resectable', color: 'amber' },
  { value: 'IIIB', label: 'Stage IIIB', description: 'Regional, unresectable', color: 'amber' },
  { value: 'IV', label: 'Stage IV', description: 'Metastatic', color: 'rose' },
  { value: 'recurrent', label: 'Recurrent', description: 'Returned after treatment', color: 'rose' },
];

export function DiagnosisStep({ age, histology, stage, onUpdate }: DiagnosisStepProps) {
  return (
    <div className="space-y-8">
      {/* Age Input */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Patient Age
        </label>
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="number"
              min={18}
              max={120}
              value={age ?? ''}
              onChange={(e) => onUpdate('age', e.target.value ? parseInt(e.target.value) : null)}
              placeholder="65"
              className="w-24 px-4 py-3 text-xl font-medium text-center border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
            />
          </div>
          <span className="text-gray-500 font-medium">years old</span>
        </div>
      </div>

      {/* Cancer Type - Fixed for NSCLC */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Cancer Type
        </label>
        <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-teal-50 to-emerald-50 border border-emerald-200 rounded-xl">
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          <span className="font-medium text-emerald-800">Non-Small Cell Lung Cancer (NSCLC)</span>
        </div>
      </div>

      {/* Histology */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Histology Type
        </label>
        <div className="grid grid-cols-2 gap-3">
          {histologyOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onUpdate('histology', option.value)}
              className={`group relative p-4 text-left rounded-xl border-2 transition-all duration-200 ${
                histology === option.value
                  ? 'border-emerald-500 bg-emerald-50 shadow-md shadow-emerald-100'
                  : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{option.icon}</span>
                <div>
                  <div className={`font-semibold ${histology === option.value ? 'text-emerald-900' : 'text-gray-900'}`}>
                    {option.label}
                  </div>
                  <div className={`text-sm ${histology === option.value ? 'text-emerald-600' : 'text-gray-500'}`}>
                    {option.description}
                  </div>
                </div>
              </div>
              {histology === option.value && (
                <div className="absolute top-3 right-3">
                  <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Disease Stage */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Disease Stage <span className="text-rose-500">*</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {stageOptions.map((option) => {
            const isSelected = stage === option.value;
            const colorClasses = {
              emerald: isSelected ? 'border-emerald-500 bg-emerald-50' : 'hover:border-emerald-200',
              amber: isSelected ? 'border-amber-500 bg-amber-50' : 'hover:border-amber-200',
              rose: isSelected ? 'border-rose-500 bg-rose-50' : 'hover:border-rose-200',
            };

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onUpdate('stage', option.value)}
                className={`relative p-4 text-left rounded-xl border-2 transition-all duration-200 ${
                  isSelected
                    ? `${colorClasses[option.color as keyof typeof colorClasses]} shadow-md`
                    : `border-gray-100 ${colorClasses[option.color as keyof typeof colorClasses]} hover:bg-gray-50`
                }`}
              >
                <div className={`font-semibold ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
                  {option.label}
                </div>
                <div className={`text-sm ${isSelected ? 'text-gray-600' : 'text-gray-500'}`}>
                  {option.description}
                </div>
                {isSelected && (
                  <div className="absolute top-3 right-3">
                    <svg className={`w-5 h-5 ${
                      option.color === 'emerald' ? 'text-emerald-500' :
                      option.color === 'amber' ? 'text-amber-500' : 'text-rose-500'
                    }`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-gray-500">
          Select the current disease stage to help match relevant trials
        </p>
      </div>
    </div>
  );
}
