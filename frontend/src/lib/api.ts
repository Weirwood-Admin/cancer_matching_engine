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
  }) => fetchApi<PaginatedResponse<ClinicalTrial>>('/trials', params),

  getTrial: (nctId: string) => fetchApi<ClinicalTrial>(`/trials/${nctId}`),

  getTrialPhases: () => fetchApi<string[]>('/trials/phases/list'),

  getTrialStatuses: () => fetchApi<string[]>('/trials/statuses/list'),

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

  parsePatient: (request: PatientMatchRequest) =>
    postApi<ParsedProfileResponse, PatientMatchRequest>('/match/parse', request),
};
