'use client';

import { useState } from 'react';
import { ResearcherTrialProfile } from '@/lib/api';
import { QuizProgress } from '@/components/match/QuizProgress';
import { TrialInputStep } from './steps/TrialInputStep';
import { TrialBiomarkersStep } from './steps/TrialBiomarkersStep';
import { TrialCriteriaStep } from './steps/TrialCriteriaStep';
import { TrialLocationStep } from './steps/TrialLocationStep';

interface CompetitorQuizProps {
  onSubmitStructured: (profile: ResearcherTrialProfile) => void;
  onSubmitNatural: (description: string) => void;
  onSubmitNctId: (nctId: string) => void;
  isLoading: boolean;
}

const STEP_LABELS = ['Input Method', 'Biomarkers', 'Criteria', 'Location'];
const TOTAL_STEPS = 4;

const STEP_ICONS = [
  <svg key="input" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  <svg key="biomarkers" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>,
  <svg key="criteria" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>,
  <svg key="location" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
];

const STEP_DESCRIPTIONS = [
  'Choose how to input your trial details',
  'Select target biomarker populations',
  'Define phase, stages, and eligibility',
  'Specify geographic recruitment areas',
];

interface QuizState {
  inputMethod: 'nct_id' | 'natural' | 'manual' | null;
  nctId: string;
  description: string;
  target_biomarkers: Record<string, string[]>;
  target_stages: string[];
  target_histology: string[];
  target_locations: string[];
  phase: string | null;
  ageMin: number | null;
  ageMax: number | null;
  ecog_max: number | null;
  treatment_naive_only: boolean | null;
}

const initialState: QuizState = {
  inputMethod: null,
  nctId: '',
  description: '',
  target_biomarkers: {},
  target_stages: [],
  target_histology: [],
  target_locations: [],
  phase: null,
  ageMin: null,
  ageMax: null,
  ecog_max: null,
  treatment_naive_only: null,
};

export function CompetitorQuiz({
  onSubmitStructured,
  onSubmitNatural,
  onSubmitNctId,
  isLoading,
}: CompetitorQuizProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [state, setState] = useState<QuizState>(initialState);

  const updateState = (field: string, value: unknown) => {
    setState((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        if (state.inputMethod === 'nct_id') {
          return state.nctId.length >= 8;
        }
        if (state.inputMethod === 'natural') {
          return state.description.length >= 20;
        }
        return state.inputMethod === 'manual';
      case 1:
        return true; // Biomarkers are optional
      case 2:
        return true; // Criteria are optional
      case 3:
        return true; // Location is optional
      default:
        return true;
    }
  };

  const shouldSkipToSubmit = () => {
    return state.inputMethod === 'nct_id' || state.inputMethod === 'natural';
  };

  const handleNext = () => {
    if (currentStep === 0 && shouldSkipToSubmit()) {
      // For NCT ID or natural language, submit directly
      handleSubmit();
    } else if (currentStep < TOTAL_STEPS - 1) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = () => {
    if (state.inputMethod === 'nct_id') {
      onSubmitNctId(state.nctId);
    } else if (state.inputMethod === 'natural') {
      onSubmitNatural(state.description);
    } else {
      // Build structured profile
      const profile: ResearcherTrialProfile = {
        nct_id: null,
        title: null,
        phase: state.phase,
        target_biomarkers: state.target_biomarkers,
        target_stages: state.target_stages,
        target_histology: state.target_histology,
        target_locations: state.target_locations,
        age_range: state.ageMin && state.ageMax ? [state.ageMin, state.ageMax] : null,
        ecog_max: state.ecog_max,
        treatment_naive_only: state.treatment_naive_only,
        prior_treatments_excluded: [],
      };
      onSubmitStructured(profile);
    }
  };

  const getEffectiveTotalSteps = () => {
    if (state.inputMethod === 'nct_id' || state.inputMethod === 'natural') {
      return 1;
    }
    return TOTAL_STEPS;
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <TrialInputStep
            inputMethod={state.inputMethod}
            nctId={state.nctId}
            description={state.description}
            onUpdate={updateState}
          />
        );
      case 1:
        return (
          <TrialBiomarkersStep
            biomarkers={state.target_biomarkers}
            onUpdate={updateState}
          />
        );
      case 2:
        return (
          <TrialCriteriaStep
            phase={state.phase}
            stages={state.target_stages}
            histology={state.target_histology}
            ageMin={state.ageMin}
            ageMax={state.ageMax}
            ecogMax={state.ecog_max}
            treatmentNaiveOnly={state.treatment_naive_only}
            onUpdate={updateState}
          />
        );
      case 3:
        return (
          <TrialLocationStep
            locations={state.target_locations}
            onUpdate={updateState}
          />
        );
      default:
        return null;
    }
  };

  const effectiveTotalSteps = getEffectiveTotalSteps();
  const effectiveLabels = state.inputMethod === 'manual' ? STEP_LABELS : [STEP_LABELS[0]];

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress Bar */}
      <QuizProgress
        currentStep={currentStep}
        totalSteps={effectiveTotalSteps}
        stepLabels={effectiveLabels}
      />

      {/* Step Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
          {STEP_ICONS[currentStep]}
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{STEP_LABELS[currentStep]}</h2>
          <p className="text-sm text-gray-500">{STEP_DESCRIPTIONS[currentStep]}</p>
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xl shadow-gray-100/50 p-6 sm:p-8 min-h-[420px]">
        {renderStep()}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8 gap-4">
        <button
          type="button"
          onClick={handleBack}
          disabled={currentStep === 0}
          className={`group flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all ${
            currentStep === 0
              ? 'text-gray-300 cursor-not-allowed'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        {(currentStep < effectiveTotalSteps - 1 && !shouldSkipToSubmit()) ? (
          <button
            type="button"
            onClick={handleNext}
            disabled={!canProceed()}
            className={`group flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
              canProceed()
                ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 hover:-translate-y-0.5'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            Continue
            <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ) : (
          <button
            type="button"
            onClick={currentStep === 0 ? handleNext : handleSubmit}
            disabled={isLoading || !canProceed()}
            className="group flex items-center gap-2 px-8 py-3 rounded-xl font-semibold bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 transition-all"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Analyzing...
              </>
            ) : (
              <>
                Find Competitors
                <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </>
            )}
          </button>
        )}
      </div>

      {/* Step indicator */}
      <p className="text-center mt-6 text-sm text-gray-400">
        Step {currentStep + 1} of {effectiveTotalSteps}
      </p>
    </div>
  );
}
