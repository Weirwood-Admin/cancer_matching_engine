'use client';

import { useState } from 'react';
import { PatientProfile } from '@/lib/api';
import { QuizProgress } from './QuizProgress';
import { DiagnosisStep } from './steps/DiagnosisStep';
import { BiomarkersStep } from './steps/BiomarkersStep';
import { TreatmentHistoryStep } from './steps/TreatmentHistoryStep';
import { HealthStatusStep } from './steps/HealthStatusStep';
import { LocationStep } from './steps/LocationStep';

interface MatchQuizProps {
  onSubmit: (profile: PatientProfile) => void;
  isLoading: boolean;
}

const STEP_LABELS = ['Diagnosis', 'Biomarkers', 'Treatment', 'Health', 'Location'];
const TOTAL_STEPS = 5;

const STEP_ICONS = [
  <svg key="diagnosis" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  <svg key="biomarkers" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>,
  <svg key="treatment" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>,
  <svg key="health" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>,
  <svg key="location" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>,
];

const STEP_DESCRIPTIONS = [
  'Tell us about the cancer diagnosis',
  'Select known biomarker mutations',
  'Share treatment history',
  'Current health status',
  'Find trials near you',
];

const initialProfile: PatientProfile = {
  cancer_type: 'NSCLC',
  histology: null,
  stage: null,
  biomarkers: {},
  age: null,
  ecog_status: null,
  prior_treatments: [],
  brain_metastases: null,
  location: null,
  line_of_therapy: null,
  brain_mets_status: null,
  last_treatment_date: null,
  prior_malignancy: null,
  organ_function_issues: null,
  travel_distance_miles: null,
};

export function MatchQuiz({ onSubmit, isLoading }: MatchQuizProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [profile, setProfile] = useState<PatientProfile>(initialProfile);

  const updateProfile = (field: string, value: unknown) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return profile.stage !== null;
      case 1:
        return true;
      case 2:
        return profile.line_of_therapy !== null;
      case 3:
        return profile.ecog_status !== null;
      case 4:
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS - 1) {
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
    onSubmit(profile);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <DiagnosisStep
            age={profile.age}
            histology={profile.histology}
            stage={profile.stage}
            onUpdate={updateProfile}
          />
        );
      case 1:
        return (
          <BiomarkersStep
            biomarkers={profile.biomarkers}
            onUpdate={updateProfile}
          />
        );
      case 2:
        return (
          <TreatmentHistoryStep
            lineOfTherapy={profile.line_of_therapy}
            priorTreatments={profile.prior_treatments}
            lastTreatmentDate={profile.last_treatment_date}
            priorMalignancy={profile.prior_malignancy}
            onUpdate={updateProfile}
          />
        );
      case 3:
        return (
          <HealthStatusStep
            ecogStatus={profile.ecog_status}
            brainMetsStatus={profile.brain_mets_status}
            organFunctionIssues={profile.organ_function_issues}
            onUpdate={updateProfile}
          />
        );
      case 4:
        return (
          <LocationStep
            location={profile.location}
            travelDistance={profile.travel_distance_miles}
            onUpdate={updateProfile}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress Bar */}
      <QuizProgress
        currentStep={currentStep}
        totalSteps={TOTAL_STEPS}
        stepLabels={STEP_LABELS}
      />

      {/* Step Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
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

        {currentStep < TOTAL_STEPS - 1 ? (
          <button
            type="button"
            onClick={handleNext}
            disabled={!canProceed()}
            className={`group flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
              canProceed()
                ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 hover:-translate-y-0.5'
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
            onClick={handleSubmit}
            disabled={isLoading}
            className="group flex items-center gap-2 px-8 py-3 rounded-xl font-semibold bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 transition-all"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Finding Trials...
              </>
            ) : (
              <>
                Find My Trials
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
        Step {currentStep + 1} of {TOTAL_STEPS}
      </p>
    </div>
  );
}
