from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime


class PatientProfile(BaseModel):
    """Patient profile parsed from natural language description."""
    cancer_type: str = "NSCLC"
    histology: Optional[str] = None  # adenocarcinoma, squamous, large cell, etc.
    stage: Optional[str] = None  # I, II, IIIA, IIIB, IV, metastatic
    biomarkers: dict[str, list[str]] = Field(default_factory=dict)  # {"EGFR": ["L858R"], "PD-L1": ["TPS 50%"]}
    age: Optional[int] = None
    ecog_status: Optional[int] = Field(None, ge=0, le=4)  # 0-4 performance status
    prior_treatments: list[str] = Field(default_factory=list)
    brain_metastases: Optional[bool] = None
    location: Optional[str] = None  # city, state or region for trial matching


class PatientMatchRequest(BaseModel):
    """Request for patient matching."""
    description: str = Field(..., min_length=20, description="Natural language patient description")
    location: Optional[str] = None  # Optional location override for trial proximity


class EligibilityResult(BaseModel):
    """Eligibility evaluation result for a single trial."""
    status: Literal["eligible", "ineligible", "uncertain"]
    confidence: float = Field(..., ge=0.0, le=1.0)
    matching_criteria: list[str] = Field(default_factory=list)
    excluding_criteria: list[str] = Field(default_factory=list)
    explanation: str


class TreatmentMatch(BaseModel):
    """A matched treatment with relevance information."""
    id: int
    generic_name: str
    brand_names: Optional[list[str]] = None
    drug_class: Optional[str] = None
    mechanism_of_action: Optional[str] = None
    biomarker_requirements: Optional[dict[str, list[str]]] = None
    fda_approval_status: Optional[str] = None
    match_reason: str  # Why this treatment matched
    match_score: float = Field(..., ge=0.0, le=1.0)  # 0-1 relevance score


class TrialMatch(BaseModel):
    """A matched clinical trial with eligibility evaluation."""
    id: int
    nct_id: str
    title: Optional[str] = None
    phase: Optional[str] = None
    status: Optional[str] = None
    sponsor: Optional[str] = None
    brief_summary: Optional[str] = None
    biomarker_requirements: Optional[dict[str, list[str]]] = None
    eligibility: EligibilityResult
    study_url: Optional[str] = None
    locations: Optional[list[dict]] = None  # Nearby locations


class ParsedProfileResponse(BaseModel):
    """Response from the parse-only endpoint."""
    profile: PatientProfile
    raw_extraction: dict  # The raw JSON from Claude for debugging


class PatientMatchResponse(BaseModel):
    """Complete response from patient matching."""
    profile: PatientProfile
    treatments: list[TreatmentMatch]
    trials: list[TrialMatch]
    total_treatments: int
    total_trials: int
    processing_time_ms: int
