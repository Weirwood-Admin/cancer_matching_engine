'use client';

import { useState } from 'react';

interface TrialInputStepProps {
  inputMethod: 'nct_id' | 'natural' | 'manual' | null;
  nctId: string;
  description: string;
  onUpdate: (field: string, value: string | null) => void;
}

export function TrialInputStep({
  inputMethod,
  nctId,
  description,
  onUpdate,
}: TrialInputStepProps) {
  const [activeMethod, setActiveMethod] = useState<'nct_id' | 'natural' | 'manual' | null>(inputMethod);

  const handleMethodSelect = (method: 'nct_id' | 'natural' | 'manual') => {
    setActiveMethod(method);
    onUpdate('inputMethod', method);
  };

  return (
    <div className="space-y-6">
      {/* Input Method Selection */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          How would you like to input your trial?
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => handleMethodSelect('nct_id')}
            className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
              activeMethod === 'nct_id'
                ? 'border-violet-500 bg-violet-50 shadow-sm'
                : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                activeMethod === 'nct_id' ? 'bg-violet-100' : 'bg-gray-100'
              }`}>
                <svg className={`w-5 h-5 ${activeMethod === 'nct_id' ? 'text-violet-600' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                </svg>
              </div>
              <div className={`font-semibold ${activeMethod === 'nct_id' ? 'text-violet-700' : 'text-gray-700'}`}>
                NCT ID
              </div>
            </div>
            <p className={`text-sm ${activeMethod === 'nct_id' ? 'text-violet-600' : 'text-gray-500'}`}>
              Import existing trial from ClinicalTrials.gov
            </p>
          </button>

          <button
            type="button"
            onClick={() => handleMethodSelect('natural')}
            className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
              activeMethod === 'natural'
                ? 'border-violet-500 bg-violet-50 shadow-sm'
                : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                activeMethod === 'natural' ? 'bg-violet-100' : 'bg-gray-100'
              }`}>
                <svg className={`w-5 h-5 ${activeMethod === 'natural' ? 'text-violet-600' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <div className={`font-semibold ${activeMethod === 'natural' ? 'text-violet-700' : 'text-gray-700'}`}>
                Describe It
              </div>
            </div>
            <p className={`text-sm ${activeMethod === 'natural' ? 'text-violet-600' : 'text-gray-500'}`}>
              Write a description and we&apos;ll extract details
            </p>
          </button>

          <button
            type="button"
            onClick={() => handleMethodSelect('manual')}
            className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
              activeMethod === 'manual'
                ? 'border-violet-500 bg-violet-50 shadow-sm'
                : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                activeMethod === 'manual' ? 'bg-violet-100' : 'bg-gray-100'
              }`}>
                <svg className={`w-5 h-5 ${activeMethod === 'manual' ? 'text-violet-600' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <div className={`font-semibold ${activeMethod === 'manual' ? 'text-violet-700' : 'text-gray-700'}`}>
                Build Manually
              </div>
            </div>
            <p className={`text-sm ${activeMethod === 'manual' ? 'text-violet-600' : 'text-gray-500'}`}>
              Select criteria step by step
            </p>
          </button>
        </div>
      </div>

      {/* NCT ID Input */}
      {activeMethod === 'nct_id' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            NCT ID
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="text-gray-400 text-sm font-mono">NCT</span>
            </div>
            <input
              type="text"
              value={nctId}
              onChange={(e) => onUpdate('nctId', e.target.value.toUpperCase())}
              placeholder="NCT00000000"
              className="w-full pl-14 pr-4 py-4 text-lg font-mono border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all"
            />
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Enter the ClinicalTrials.gov identifier (e.g., NCT04487080)
          </p>
        </div>
      )}

      {/* Natural Language Input */}
      {activeMethod === 'natural' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Describe your trial
          </label>
          <textarea
            value={description}
            onChange={(e) => onUpdate('description', e.target.value)}
            placeholder="Phase 2 study targeting EGFR L858R mutation in stage IV adenocarcinoma patients. Recruiting in California and Texas. Treatment-naive patients only, ECOG 0-1..."
            rows={5}
            className="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all resize-none"
          />
          <p className="mt-2 text-xs text-gray-500">
            Include biomarkers, phase, stages, locations, and eligibility criteria
          </p>
        </div>
      )}

      {/* Manual Selection Info */}
      {activeMethod === 'manual' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="p-5 bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl border border-violet-100">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-violet-900 mb-1">Build from Scratch</h4>
                <p className="text-sm text-violet-800">
                  You&apos;ll select your trial&apos;s target biomarkers, disease stages, geographic focus, and eligibility criteria in the following steps.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
