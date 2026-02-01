'use client';

import { useState } from 'react';

interface PatientMatchFormProps {
  onSubmit: (description: string, location?: string) => void;
  isLoading: boolean;
}

const exampleDescriptions = [
  "62-year-old male with stage IV adenocarcinoma, EGFR L858R mutation positive, no prior treatment, ECOG 1",
  "55-year-old female with metastatic NSCLC, ALK rearrangement positive, previously treated with crizotinib, brain metastases present",
  "70-year-old patient with squamous cell carcinoma, PD-L1 TPS 80%, EGFR/ALK negative, stage IIIB, ECOG 0",
  "58-year-old with KRAS G12C positive adenocarcinoma, stage IV, prior platinum chemotherapy, no brain mets",
];

export function PatientMatchForm({ onSubmit, isLoading }: PatientMatchFormProps) {
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (description.trim().length < 20) {
      setError('Please provide at least 20 characters describing the patient.');
      return;
    }

    onSubmit(description.trim(), location.trim() || undefined);
  };

  const handleExample = (example: string) => {
    setDescription(example);
    setError(null);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Patient Description
        </label>
        <textarea
          id="description"
          rows={5}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the patient's cancer type, stage, biomarkers, age, performance status, and any prior treatments..."
          className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
          disabled={isLoading}
        />
        <p className="mt-1 text-sm text-gray-500">
          Include details like cancer type, histology, stage, biomarkers (EGFR, ALK, PD-L1, etc.), age, ECOG status, and prior treatments.
        </p>
        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}
      </div>

      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
          Location (optional)
        </label>
        <input
          type="text"
          id="location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="e.g., Boston, MA or California"
          className="w-full px-4 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          disabled={isLoading}
        />
        <p className="mt-1 text-sm text-gray-500">
          Enter a city, state, or region to find nearby clinical trials.
        </p>
      </div>

      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Try an example:</p>
        <div className="flex flex-wrap gap-2">
          {exampleDescriptions.map((example, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleExample(example)}
              className="px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-full hover:bg-emerald-100 transition-colors"
              disabled={isLoading}
            >
              Example {index + 1}
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading || description.trim().length < 20}
        className="w-full px-6 py-3 text-base font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Finding matches...
          </span>
        ) : (
          'Find Treatment & Trial Matches'
        )}
      </button>
    </form>
  );
}
