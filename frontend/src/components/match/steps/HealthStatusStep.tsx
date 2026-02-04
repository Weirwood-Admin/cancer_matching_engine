'use client';

interface HealthStatusStepProps {
  ecogStatus: number | null;
  brainMetsStatus: string | null;
  organFunctionIssues: boolean | null;
  onUpdate: (field: string, value: number | string | boolean | null) => void;
}

const ecogOptions = [
  { value: 0, label: 'ECOG 0', description: 'Fully active', color: 'emerald', badge: 'Best' },
  { value: 1, label: 'ECOG 1', description: 'Light activity OK', color: 'emerald', badge: 'Good' },
  { value: 2, label: 'ECOG 2', description: 'Self-care, up >50%', color: 'amber', badge: null },
  { value: 3, label: 'ECOG 3', description: 'Limited self-care', color: 'orange', badge: null },
  { value: 4, label: 'ECOG 4', description: 'Bedridden', color: 'rose', badge: null },
];

const brainMetsOptions = [
  { value: 'none', label: 'None', description: 'No brain metastases', icon: '✓', color: 'emerald' },
  { value: 'stable', label: 'Stable', description: 'Treated & stable', icon: '◐', color: 'amber' },
  { value: 'active', label: 'Active', description: 'Currently active', icon: '!', color: 'rose' },
  { value: 'unknown', label: 'Unknown', description: 'Not evaluated', icon: '?', color: 'gray' },
];

export function HealthStatusStep({
  ecogStatus,
  brainMetsStatus,
  organFunctionIssues,
  onUpdate,
}: HealthStatusStepProps) {
  return (
    <div className="space-y-8">
      {/* ECOG Performance Status */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          ECOG Performance Status <span className="text-rose-500">*</span>
        </label>
        <p className="text-xs text-gray-500 mb-3">How active is the patient day-to-day?</p>

        <div className="space-y-2">
          {ecogOptions.map((option) => {
            const isSelected = ecogStatus === option.value;
            const colorMap = {
              emerald: { border: 'border-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700' },
              amber: { border: 'border-amber-500', bg: 'bg-amber-50', text: 'text-amber-700' },
              orange: { border: 'border-orange-500', bg: 'bg-orange-50', text: 'text-orange-700' },
              rose: { border: 'border-rose-500', bg: 'bg-rose-50', text: 'text-rose-700' },
            };
            const colors = colorMap[option.color as keyof typeof colorMap];

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onUpdate('ecog_status', option.value)}
                className={`w-full p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-4 ${
                  isSelected
                    ? `${colors.border} ${colors.bg}`
                    : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold ${
                  isSelected ? `${colors.bg} ${colors.text}` : 'bg-gray-100 text-gray-500'
                }`}>
                  {option.value}
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
                      {option.label}
                    </span>
                    {option.badge && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        isSelected ? 'bg-emerald-200 text-emerald-800' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {option.badge}
                      </span>
                    )}
                  </div>
                  <div className={`text-sm ${isSelected ? 'text-gray-600' : 'text-gray-500'}`}>
                    {option.description}
                  </div>
                </div>
                {isSelected && (
                  <svg className={`w-6 h-6 ${colors.text}`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>

        {ecogStatus !== null && ecogStatus >= 2 && (
          <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl animate-in fade-in duration-200">
            <p className="text-sm text-amber-800">
              Many trials require ECOG 0-1. We&apos;ll prioritize trials accepting ECOG {ecogStatus}.
            </p>
          </div>
        )}
      </div>

      {/* Brain Metastases */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Brain Metastases
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {brainMetsOptions.map((option) => {
            const isSelected = brainMetsStatus === option.value;
            const colorMap = {
              emerald: { border: 'border-emerald-500', bg: 'bg-emerald-50', icon: 'text-emerald-600' },
              amber: { border: 'border-amber-500', bg: 'bg-amber-50', icon: 'text-amber-600' },
              rose: { border: 'border-rose-500', bg: 'bg-rose-50', icon: 'text-rose-600' },
              gray: { border: 'border-gray-400', bg: 'bg-gray-50', icon: 'text-gray-600' },
            };
            const colors = colorMap[option.color as keyof typeof colorMap];

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onUpdate('brain_mets_status', option.value);
                  if (option.value === 'none') {
                    onUpdate('brain_metastases', false);
                  } else if (option.value === 'stable' || option.value === 'active') {
                    onUpdate('brain_metastases', true);
                  } else {
                    onUpdate('brain_metastases', null);
                  }
                }}
                className={`p-4 rounded-xl border-2 transition-all duration-200 text-center ${
                  isSelected
                    ? `${colors.border} ${colors.bg}`
                    : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className={`text-2xl mb-1 ${isSelected ? colors.icon : 'text-gray-400'}`}>
                  {option.icon}
                </div>
                <div className={`font-semibold text-sm ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
                  {option.label}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">{option.description}</div>
              </button>
            );
          })}
        </div>

        {brainMetsStatus === 'active' && (
          <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl animate-in fade-in duration-200">
            <p className="text-sm text-rose-800">
              Active brain metastases exclude from most trials. Treatment to stabilize may open options.
            </p>
          </div>
        )}
      </div>

      {/* Organ Function */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Kidney or Liver Issues?
        </label>
        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => onUpdate('organ_function_issues', false)}
            className={`p-4 rounded-xl border-2 transition-all duration-200 text-center ${
              organFunctionIssues === false
                ? 'border-emerald-500 bg-emerald-50'
                : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
            }`}
          >
            <div className={`text-xl mb-1 ${organFunctionIssues === false ? 'text-emerald-600' : 'text-gray-400'}`}>✓</div>
            <div className={`font-semibold text-sm ${organFunctionIssues === false ? 'text-emerald-900' : 'text-gray-700'}`}>
              No Issues
            </div>
          </button>
          <button
            type="button"
            onClick={() => onUpdate('organ_function_issues', true)}
            className={`p-4 rounded-xl border-2 transition-all duration-200 text-center ${
              organFunctionIssues === true
                ? 'border-amber-500 bg-amber-50'
                : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
            }`}
          >
            <div className={`text-xl mb-1 ${organFunctionIssues === true ? 'text-amber-600' : 'text-gray-400'}`}>!</div>
            <div className={`font-semibold text-sm ${organFunctionIssues === true ? 'text-amber-900' : 'text-gray-700'}`}>
              Yes
            </div>
          </button>
          <button
            type="button"
            onClick={() => onUpdate('organ_function_issues', null)}
            className={`p-4 rounded-xl border-2 transition-all duration-200 text-center ${
              organFunctionIssues === null
                ? 'border-gray-400 bg-gray-50'
                : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
            }`}
          >
            <div className={`text-xl mb-1 ${organFunctionIssues === null ? 'text-gray-600' : 'text-gray-400'}`}>?</div>
            <div className={`font-semibold text-sm ${organFunctionIssues === null ? 'text-gray-900' : 'text-gray-700'}`}>
              Unknown
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
