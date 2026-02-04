'use client';

interface LocationStepProps {
  location: string | null;
  travelDistance: number | null;
  onUpdate: (field: string, value: string | number | null) => void;
}

const distanceOptions = [
  { value: 25, label: '25 mi', description: 'Local' },
  { value: 50, label: '50 mi', description: 'Nearby' },
  { value: 100, label: '100 mi', description: 'Regional' },
  { value: 250, label: '250 mi', description: 'Extended' },
  { value: null, label: 'Any', description: 'Nationwide' },
];

export function LocationStep({ location, travelDistance, onUpdate }: LocationStepProps) {
  return (
    <div className="space-y-8">
      {/* Location Input */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Your Location
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={location ?? ''}
            onChange={(e) => onUpdate('location', e.target.value || null)}
            placeholder="ZIP code or City, State"
            className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
          />
        </div>
        <p className="mt-2 text-xs text-gray-500">
          e.g., 02115 or Boston, MA
        </p>
      </div>

      {/* Travel Distance */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Maximum Travel Distance
        </label>
        <div className="flex gap-2">
          {distanceOptions.map((option) => {
            const isSelected = travelDistance === option.value;

            return (
              <button
                key={option.value ?? 'any'}
                type="button"
                onClick={() => onUpdate('travel_distance_miles', option.value)}
                className={`flex-1 p-4 rounded-xl border-2 transition-all duration-200 text-center ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50 shadow-sm'
                    : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className={`text-lg font-bold ${isSelected ? 'text-emerald-700' : 'text-gray-700'}`}>
                  {option.label}
                </div>
                <div className={`text-xs ${isSelected ? 'text-emerald-600' : 'text-gray-500'}`}>
                  {option.description}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Info Card */}
      <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">About Trial Locations</h4>
            <p className="text-sm text-blue-800">
              Many trials have multiple sites across the country. Even if a trial&apos;s main center is far away,
              there may be a participating site near you.
            </p>
          </div>
        </div>
      </div>

      {/* Quick stats teaser */}
      <div className="text-center py-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-sm text-gray-600">
            <span className="font-semibold text-gray-900">1,400+</span> active NSCLC trials in our database
          </span>
        </div>
      </div>
    </div>
  );
}
