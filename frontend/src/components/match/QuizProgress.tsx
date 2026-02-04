'use client';

interface QuizProgressProps {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
}

export function QuizProgress({ currentStep, totalSteps, stepLabels }: QuizProgressProps) {
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="w-full mb-10">
      {/* Main progress bar */}
      <div className="relative">
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-500 ease-out rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Step dots positioned on the bar */}
        <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between px-0">
          {stepLabels.map((_, index) => {
            const isComplete = index < currentStep;
            const isCurrent = index === currentStep;
            const isPending = index > currentStep;

            return (
              <div
                key={index}
                className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-300 ${
                  isComplete
                    ? 'bg-emerald-500 border-emerald-500'
                    : isCurrent
                    ? 'bg-white border-emerald-500 ring-4 ring-emerald-100'
                    : 'bg-white border-gray-200'
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* Step labels */}
      <div className="flex justify-between mt-4">
        {stepLabels.map((label, index) => {
          const isComplete = index < currentStep;
          const isCurrent = index === currentStep;

          return (
            <div key={index} className="flex flex-col items-center" style={{ width: `${100 / totalSteps}%` }}>
              <span
                className={`text-xs font-medium transition-colors ${
                  isComplete
                    ? 'text-emerald-600'
                    : isCurrent
                    ? 'text-gray-900'
                    : 'text-gray-400'
                }`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
