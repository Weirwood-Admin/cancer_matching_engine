const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface Treatment {
  id: number;
  generic_name: string;
  brand_names: string[] | null;
  drug_class: string | null;
  mechanism_of_action: string | null;
  fda_approval_status: string | null;
  fda_approval_date: string | null;
  approved_indications: string[] | null;
  biomarker_requirements: Record<string, string[]> | null;
  common_side_effects: string[] | null;
  manufacturer: string | null;
  source_urls: Record<string, string> | null;
  last_updated: string | null;
}

// Structured eligibility types
export interface AgeRequirement {
  min: number | null;
  max: number | null;
}

export interface ECOGRequirement {
  min: number | null;
  max: number | null;
}

export interface ListRequirement {
  allowed: string[];
  excluded: string[];
}

export interface BiomarkerRequirements {
  required_positive: Record<string, string[]>;
  required_negative: string[];
  pdl1_expression: {
    min_tps?: number;
    max_tps?: number;
    level?: string;
  } | null;
}

export interface PriorTreatmentRequirements {
  required: string[];
  excluded: string[];
  max_lines: number | null;
  min_lines: number | null;
  treatment_naive_required: boolean;
}

export interface BrainMetastasesRequirement {
  allowed: boolean;
  controlled_only: boolean;
  untreated_allowed: boolean;
}

export interface OrganFunctionRequirements {
  renal_exclusion: boolean;
  hepatic_exclusion: boolean;
  creatinine_max: number | null;
  bilirubin_max: number | null;
  notes: string | null;
}

export interface PriorMalignancyRequirement {
  excluded: boolean;
  years_lookback: number | null;
  exceptions: string[];
}

export interface WashoutRequirement {
  min_days_since_chemo: number | null;
  min_days_since_radiation: number | null;
  min_days_since_surgery: number | null;
  min_days_since_immunotherapy: number | null;
  general_min_days: number | null;
}

export interface StructuredEligibility {
  age: AgeRequirement;
  ecog: ECOGRequirement;
  disease_stage: ListRequirement;
  histology: ListRequirement;
  biomarkers: BiomarkerRequirements;
  prior_treatments: PriorTreatmentRequirements;
  brain_metastases: BrainMetastasesRequirement;
  organ_function: OrganFunctionRequirements;
  prior_malignancy: PriorMalignancyRequirement;
  washout: WashoutRequirement;
  common_exclusions: string[];
  extraction_confidence: number;
  extraction_notes: string[];
}

export interface ClinicalTrial {
  id: number;
  nct_id: string;
  title: string | null;
  brief_summary: string | null;
  phase: string | null;
  status: string | null;
  sponsor: string | null;
  interventions: Array<{ name: string; type: string; description: string }> | null;
  conditions: string[] | null;
  eligibility_criteria: string | null;
  biomarker_requirements: Record<string, string[]> | null;
  primary_completion_date: string | null;
  locations: Array<{
    facility: string;
    city: string;
    state: string;
    country: string;
    lat: number | null;
    lng: number | null;
  }> | null;
  contact_info: { name: string; phone: string; email: string } | null;
  study_url: string | null;
  last_updated: string | null;
  // New fields
  nsclc_relevance: string | null;
  relevance_score: number | null;
  structured_eligibility: StructuredEligibility | null;
  eligibility_extraction_version: string | null;
  eligibility_extracted_at: string | null;
}

export interface RelevanceStats {
  total: number;
  nsclc_relevant_count: number;
  categories: Record<string, { count: number; percentage: number }>;
}

export interface CancerCenter {
  id: number;
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  lat: number | null;
  lng: number | null;
  nci_designation: string | null;
  us_news_rank: number | null;
  academic_affiliation: string | null;
  website: string | null;
  phone: string | null;
  specialties: string[] | null;
  active_nsclc_trials: number | null;
  source_urls: Record<string, string> | null;
  last_updated: string | null;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface SearchResult {
  treatments: Treatment[];
  trials: ClinicalTrial[];
  centers: CancerCenter[];
}

export interface SearchSuggestion {
  id: number | string;
  text: string;
  type: 'treatment' | 'trial' | 'center';
}

// Patient Matching Types
export interface PatientProfile {
  cancer_type: string;
  histology: string | null;
  stage: string | null;
  biomarkers: Record<string, string[]>;
  age: number | null;
  ecog_status: number | null;
  prior_treatments: string[];
  brain_metastases: boolean | null;
  location: string | null;
  // NEW fields for structured quiz
  line_of_therapy: string | null;  // "1st", "2nd", "3rd+", "treatment_naive"
  brain_mets_status: string | null;  // "none", "stable", "active", "unknown"
  last_treatment_date: string | null;  // ISO date for washout calculation
  prior_malignancy: boolean | null;  // Other cancer in last 5 years
  organ_function_issues: boolean | null;  // Known kidney/liver problems
  travel_distance_miles: number | null;  // 25, 50, 100, 250, or null for any
}

export interface EligibilityResult {
  status: 'eligible' | 'ineligible' | 'uncertain';
  confidence: number;
  matching_criteria: string[];
  excluding_criteria: string[];
  explanation: string;
}

export interface TreatmentMatch {
  id: number;
  generic_name: string;
  brand_names: string[] | null;
  drug_class: string | null;
  mechanism_of_action: string | null;
  biomarker_requirements: Record<string, string[]> | null;
  fda_approval_status: string | null;
  match_reason: string;
  match_score: number;
}

export interface TrialMatch {
  id: number;
  nct_id: string;
  title: string | null;
  phase: string | null;
  status: string | null;
  sponsor: string | null;
  brief_summary: string | null;
  biomarker_requirements: Record<string, string[]> | null;
  eligibility: EligibilityResult;
  study_url: string | null;
  locations: Array<{
    facility: string;
    city: string;
    state: string;
    country: string;
  }> | null;
  // New fields from v2 matching
  structured_eligibility?: StructuredEligibility | null;
  nsclc_relevance?: string | null;
  relevance_score?: number | null;
  match_score?: number;
}

export interface PatientMatchRequest {
  description: string;
  location?: string;
}

export interface PatientMatchResponse {
  profile: PatientProfile;
  treatments: TreatmentMatch[];
  trials: TrialMatch[];
  total_treatments: number;
  total_trials: number;
  processing_time_ms: number;
}

export interface ParsedProfileResponse {
  profile: PatientProfile;
  raw_extraction: Record<string, unknown>;
}

// Competitor Analysis Types
export interface ResearcherTrialProfile {
  nct_id: string | null;
  title: string | null;
  phase: string | null;
  target_biomarkers: Record<string, string[]>;
  target_stages: string[];
  target_histology: string[];
  target_locations: string[];
  age_range: [number, number] | null;
  ecog_max: number | null;
  treatment_naive_only: boolean | null;
  prior_treatments_excluded: string[];
}

export interface CompetitorMatch {
  nct_id: string;
  title: string | null;
  phase: string | null;
  status: string | null;
  sponsor: string | null;
  similarity_score: number;
  biomarker_overlap: number;
  stage_overlap: number;
  geographic_overlap: number;
  phase_proximity: number;
  eligibility_similarity: number;
  overlapping_biomarkers: string[];
  overlapping_stages: string[];
  overlapping_locations: string[];
  locations: Array<{
    facility: string;
    city: string;
    state: string;
    country: string;
  }>;
  study_url: string | null;
  brief_summary: string | null;
}

export interface SponsorCount {
  name: string;
  count: number;
}

export interface GeographicHotspot {
  state: string;
  count: number;
}

export interface BiomarkerCount {
  biomarker: string;
  count: number;
}

export interface MarketInsights {
  total_competing_trials: number;
  top_sponsors: SponsorCount[];
  geographic_hotspots: GeographicHotspot[];
  phase_distribution: Record<string, number>;
  common_biomarkers: BiomarkerCount[];
  avg_similarity_score: number;
}

export interface CompetitorAnalysisResponse {
  profile: ResearcherTrialProfile;
  competitors: CompetitorMatch[];
  insights: MarketInsights;
  total_competitors: number;
  processing_time_ms: number;
}

export interface NaturalLanguageRequest {
  description: string;
}

export interface ParsedTrialResponse {
  profile: ResearcherTrialProfile;
  raw_extraction: Record<string, unknown>;
}

async function fetchApi<T>(endpoint: string, params?: Record<string, string | number>): Promise<T> {
  const baseUrl = typeof window !== 'undefined' ? API_BASE : 'http://localhost:8000';
  const url = new URL(`${baseUrl}${endpoint}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.append(key, String(value));
      }
    });
  }

  try {
    const response = await fetch(url.toString(), {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error(`Failed to fetch ${endpoint}:`, error);
    throw error;
  }
}

async function postApi<T, B>(endpoint: string, body: B): Promise<T> {
  const baseUrl = typeof window !== 'undefined' ? API_BASE : 'http://localhost:8000';
  const url = `${baseUrl}${endpoint}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `API error: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error(`Failed to POST ${endpoint}:`, error);
    throw error;
  }
}

export const api = {
  // Treatments
  getTreatments: (params?: {
    page?: number;
    page_size?: number;
    drug_class?: string;
    biomarker?: string;
    fda_status?: string;
    search?: string;
  }) => fetchApi<PaginatedResponse<Treatment>>('/treatments', params),

  getTreatment: (id: number) => fetchApi<Treatment>(`/treatments/${id}`),

  getDrugClasses: () => fetchApi<string[]>('/treatments/classes/list'),

  // Trials
  getTrials: (params?: {
    page?: number;
    page_size?: number;
    phase?: string;
    status?: string;
    state?: string;
    sponsor?: string;
    biomarker?: string;
    search?: string;
    relevance?: string;
    include_all_relevance?: boolean;
    has_structured_eligibility?: boolean;
  }) => fetchApi<PaginatedResponse<ClinicalTrial>>('/trials', params as Record<string, string | number>),

  getTrial: (nctId: string) => fetchApi<ClinicalTrial>(`/trials/${nctId}`),

  getTrialPhases: () => fetchApi<string[]>('/trials/phases/list'),

  getTrialStatuses: () => fetchApi<string[]>('/trials/statuses/list'),

  getTrialRelevanceCategories: () => fetchApi<string[]>('/trials/relevance/list'),

  getTrialRelevanceStats: () => fetchApi<RelevanceStats>('/trials/stats/relevance'),

  getTrialBiomarkers: () => fetchApi<string[]>('/trials/biomarkers/list'),

  getTrialLocations: (limit?: number) =>
    fetchApi<Array<{
      nct_id: string;
      title: string;
      facility: string;
      city: string;
      state: string;
      lat: number;
      lng: number;
    }>>('/trials/locations', { limit: limit || 500 }),

  // Centers
  getCenters: (params?: {
    page?: number;
    page_size?: number;
    state?: string;
    nci_designation?: string;
    specialty?: string;
    search?: string;
  }) => fetchApi<PaginatedResponse<CancerCenter>>('/centers', params),

  getCenter: (id: number) => fetchApi<CancerCenter>(`/centers/${id}`),

  getCenterStates: () => fetchApi<string[]>('/centers/states/list'),

  getCenterDesignations: () => fetchApi<string[]>('/centers/designations/list'),

  getCenterLocations: () =>
    fetchApi<Array<{
      id: number;
      name: string;
      city: string;
      state: string;
      lat: number;
      lng: number;
      nci_designation: string;
    }>>('/centers/locations'),

  // Search
  search: (q: string, limit?: number) =>
    fetchApi<SearchResult>('/search', { q, limit: limit || 10 }),

  searchSuggestions: (q: string, limit?: number) =>
    fetchApi<SearchSuggestion[]>('/search/suggest', { q, limit: limit || 5 }),

  // Patient Matching
  matchPatient: (request: PatientMatchRequest) =>
    postApi<PatientMatchResponse, PatientMatchRequest>('/match', request),

  matchPatientV2: (request: PatientMatchRequest) =>
    postApi<PatientMatchResponse, PatientMatchRequest>('/match/v2', request),

  matchPatientStructured: (profile: PatientProfile) =>
    postApi<PatientMatchResponse, PatientProfile>('/match/structured', profile),

  parsePatient: (request: PatientMatchRequest) =>
    postApi<ParsedProfileResponse, PatientMatchRequest>('/match/parse', request),

  // Competitor Analysis
  analyzeCompetitors: (profile: ResearcherTrialProfile) =>
    postApi<CompetitorAnalysisResponse, ResearcherTrialProfile>('/competitor/analyze', profile),

  analyzeCompetitorsNatural: (request: NaturalLanguageRequest) =>
    postApi<CompetitorAnalysisResponse, NaturalLanguageRequest>('/competitor/analyze/natural', request),

  analyzeCompetitorsByNctId: (nctId: string) =>
    fetchApi<CompetitorAnalysisResponse>(`/competitor/analyze/${nctId}`),

  parseTrialDescription: (request: NaturalLanguageRequest) =>
    postApi<ParsedTrialResponse, NaturalLanguageRequest>('/competitor/parse', request),
};
