'use client';

interface TrialLocationStepProps {
  locations: string[];
  onUpdate: (field: string, value: string[]) => void;
}

const usStates = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
  'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
  'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
  'Wisconsin', 'Wyoming'
];

const regionGroups = [
  {
    name: 'Northeast',
    states: ['Connecticut', 'Maine', 'Massachusetts', 'New Hampshire', 'New Jersey', 'New York', 'Pennsylvania', 'Rhode Island', 'Vermont']
  },
  {
    name: 'Southeast',
    states: ['Alabama', 'Florida', 'Georgia', 'Kentucky', 'Maryland', 'North Carolina', 'South Carolina', 'Tennessee', 'Virginia', 'West Virginia']
  },
  {
    name: 'Midwest',
    states: ['Illinois', 'Indiana', 'Iowa', 'Kansas', 'Michigan', 'Minnesota', 'Missouri', 'Nebraska', 'North Dakota', 'Ohio', 'South Dakota', 'Wisconsin']
  },
  {
    name: 'Southwest',
    states: ['Arizona', 'New Mexico', 'Oklahoma', 'Texas']
  },
  {
    name: 'West',
    states: ['California', 'Colorado', 'Hawaii', 'Nevada', 'Oregon', 'Utah', 'Washington']
  }
];

export function TrialLocationStep({ locations, onUpdate }: TrialLocationStepProps) {
  const toggleState = (state: string) => {
    const newLocations = locations.includes(state)
      ? locations.filter(s => s !== state)
      : [...locations, state];
    onUpdate('target_locations', newLocations);
  };

  const toggleRegion = (regionStates: string[]) => {
    const allSelected = regionStates.every(s => locations.includes(s));
    if (allSelected) {
      const newLocations = locations.filter(s => !regionStates.includes(s));
      onUpdate('target_locations', newLocations);
    } else {
      const newLocations = [...new Set([...locations, ...regionStates])];
      onUpdate('target_locations', newLocations);
    }
  };

  const selectAll = () => {
    onUpdate('target_locations', [...usStates]);
  };

  const clearAll = () => {
    onUpdate('target_locations', []);
  };

  return (
    <div className="space-y-6">
      {/* Info card */}
      <div className="p-4 bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl border border-violet-100">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p className="text-sm text-violet-800">
            Select states where your trial is recruiting. We&apos;ll find competitors with overlapping geographic coverage.
          </p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={selectAll}
          className="px-3 py-1.5 text-sm font-medium text-violet-600 hover:text-violet-700 hover:bg-violet-50 rounded-lg transition-colors"
        >
          Select All
        </button>
        <button
          type="button"
          onClick={clearAll}
          className="px-3 py-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
        >
          Clear All
        </button>
      </div>

      {/* Region-based selection */}
      <div className="space-y-4">
        {regionGroups.map((region) => {
          const selectedInRegion = region.states.filter(s => locations.includes(s)).length;
          const allSelected = selectedInRegion === region.states.length;

          return (
            <div key={region.name} className="border border-gray-100 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <button
                  type="button"
                  onClick={() => toggleRegion(region.states)}
                  className="flex items-center gap-2 font-semibold text-gray-700 hover:text-violet-700 transition-colors"
                >
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                    allSelected
                      ? 'bg-violet-500 border-violet-500'
                      : selectedInRegion > 0
                      ? 'border-violet-300 bg-violet-50'
                      : 'border-gray-300'
                  }`}>
                    {allSelected && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    {selectedInRegion > 0 && !allSelected && (
                      <div className="w-2 h-2 bg-violet-400 rounded-sm" />
                    )}
                  </div>
                  {region.name}
                </button>
                <span className="text-xs text-gray-500">
                  {selectedInRegion}/{region.states.length} selected
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {region.states.map((state) => (
                  <button
                    key={state}
                    type="button"
                    onClick={() => toggleState(state)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
                      locations.includes(state)
                        ? 'bg-violet-100 text-violet-700 border border-violet-200'
                        : 'bg-gray-50 text-gray-600 border border-gray-100 hover:bg-gray-100'
                    }`}
                  >
                    {state}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected summary */}
      {locations.length > 0 && (
        <div className="p-4 bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl border border-violet-100">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-violet-800">
              {locations.length} state{locations.length !== 1 ? 's' : ''} selected
            </span>
            <button
              type="button"
              onClick={clearAll}
              className="text-sm text-violet-600 hover:text-violet-700"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
