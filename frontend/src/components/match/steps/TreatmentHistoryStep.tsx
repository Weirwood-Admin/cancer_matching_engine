'use client';

interface TreatmentHistoryStepProps {
  lineOfTherapy: string | null;
  priorTreatments: string[];
  lastTreatmentDate: string | null;
  priorMalignancy: boolean | null;
  onUpdate: (field: string, value: string | string[] | boolean | null) => void;
}

const lineOptions = [
  { value: 'treatment_naive', label: 'Treatment-naive', description: 'No prior treatment', icon: '🆕' },
  { value: '1st', label: '1st Line', description: 'First treatment', icon: '1️⃣' },
  { value: '2nd', label: '2nd Line', description: 'Second treatment', icon: '2️⃣' },
  { value: '3rd+', label: '3rd Line+', description: 'Multiple prior', icon: '3️⃣' },
];

const treatmentOptions = [
  { id: 'platinum_chemo', label: 'Platinum Chemo', icon: '💊' },
  { id: 'immunotherapy', label: 'Immunotherapy', icon: '🛡️' },
  { id: 'tki', label: 'Targeted (TKI)', icon: '🎯' },
  { id: 'radiation', label: 'Radiation', icon: '☢️' },
  { id: 'surgery', label: 'Surgery', icon: '🔪' },
];

export function TreatmentHistoryStep({
  lineOfTherapy,
  priorTreatments,
  lastTreatmentDate,
  priorMalignancy,
  onUpdate,
}: TreatmentHistoryStepProps) {
  const toggleTreatment = (treatmentId: string) => {
    const newTreatments = priorTreatments.includes(treatmentId)
      ? priorTreatments.filter(t => t !== treatmentId)
      : [...priorTreatments, treatmentId];
    onUpdate('prior_treatments', newTreatments);
  };

  return (
    <div className="space-y-8">
      {/* Line of Therapy */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Current Line of Therapy <span className="text-rose-500">*</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {lineOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onUpdate('line_of_therapy', option.value)}
              className={`relative p-4 rounded-xl border-2 transition-all duration-200 text-center ${
                lineOfTherapy === option.value
                  ? 'border-emerald-500 bg-emerald-50 shadow-md'
                  : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
              }`}
            >
              <span className="text-2xl mb-1 block">{option.icon}</span>
              <div className={`font-semibold text-sm ${lineOfTherapy === option.value ? 'text-emerald-900' : 'text-gray-900'}`}>
                {option.label}
              </div>
              <div className={`text-xs mt-0.5 ${lineOfTherapy === option.value ? 'text-emerald-600' : 'text-gray-500'}`}>
                {option.description}
              </div>
              {lineOfTherapy === option.value && (
                <div className="absolute top-2 right-2">
                  <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Prior Treatments - Only show if not treatment naive */}
      {lineOfTherapy && lineOfTherapy !== 'treatment_naive' && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Prior Treatments Received
          </label>
          <div className="flex flex-wrap gap-2">
            {treatmentOptions.map((treatment) => {
              const isSelected = priorTreatments.includes(treatment.id);
              return (
                <button
                  key={treatment.id}
                  type="button"
                  onClick={() => toggleTreatment(treatment.id)}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all duration-200 ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-lg">{treatment.icon}</span>
                  <span className={`font-medium text-sm ${isSelected ? 'text-emerald-900' : 'text-gray-700'}`}>
                    {treatment.label}
                  </span>
                  {isSelected && (
                    <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Last Treatment Date */}
      {lineOfTherapy && lineOfTherapy !== 'treatment_naive' && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Last Treatment Date
            <span className="font-normal text-gray-500 ml-2">For washout period</span>
          </label>
          <input
            type="date"
            value={lastTreatmentDate ?? ''}
            onChange={(e) => onUpdate('last_treatment_date', e.target.value || null)}
            max={new Date().toISOString().split('T')[0]}
            className="w-full sm:w-64 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
          />
          <p className="mt-2 text-xs text-gray-500">
            Most trials require 21-28 days since last treatment
          </p>
        </div>
      )}

      {/* Prior Malignancy */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Other Cancer in Past 5 Years?
        </label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => onUpdate('prior_malignancy', false)}
            className={`flex-1 p-4 rounded-xl border-2 transition-all duration-200 ${
              priorMalignancy === false
                ? 'border-emerald-500 bg-emerald-50'
                : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <svg className={`w-5 h-5 ${priorMalignancy === false ? 'text-emerald-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className={`font-semibold ${priorMalignancy === false ? 'text-emerald-900' : 'text-gray-700'}`}>No</span>
            </div>
          </button>
          <button
            type="button"
            onClick={() => onUpdate('prior_malignancy', true)}
            className={`flex-1 p-4 rounded-xl border-2 transition-all duration-200 ${
              priorMalignancy === true
                ? 'border-amber-500 bg-amber-50'
                : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <svg className={`w-5 h-5 ${priorMalignancy === true ? 'text-amber-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className={`font-semibold ${priorMalignancy === true ? 'text-amber-900' : 'text-gray-700'}`}>Yes</span>
            </div>
          </button>
        </div>
        {priorMalignancy && (
          <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl animate-in fade-in duration-200">
            <p className="text-sm text-amber-800">
              Some trials exclude patients with prior malignancy. We&apos;ll prioritize trials that allow it.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
