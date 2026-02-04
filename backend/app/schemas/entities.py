from pydantic import BaseModel
from typing import Optional, Any
from datetime import date, datetime


class TreatmentBase(BaseModel):
    generic_name: str
    brand_names: Optional[list[str]] = None
    drug_class: Optional[str] = None
    mechanism_of_action: Optional[str] = None
    fda_approval_status: Optional[str] = None
    fda_approval_date: Optional[date] = None
    approved_indications: Optional[list[str]] = None
    biomarker_requirements: Optional[dict[str, Any]] = None
    common_side_effects: Optional[list[str]] = None
    manufacturer: Optional[str] = None
    source_urls: Optional[dict[str, str]] = None


class TreatmentCreate(TreatmentBase):
    pass


class TreatmentResponse(TreatmentBase):
    id: int
    last_updated: Optional[datetime] = None

    class Config:
        from_attributes = True


class ClinicalTrialBase(BaseModel):
    nct_id: str
    title: Optional[str] = None
    brief_summary: Optional[str] = None
    phase: Optional[str] = None
    status: Optional[str] = None
    sponsor: Optional[str] = None
    interventions: Optional[list[dict[str, Any]]] = None
    conditions: Optional[list[str]] = None
    eligibility_criteria: Optional[str] = None
    biomarker_requirements: Optional[dict[str, Any]] = None
    primary_completion_date: Optional[date] = None
    locations: Optional[list[dict[str, Any]]] = None
    contact_info: Optional[dict[str, Any]] = None
    study_url: Optional[str] = None


class ClinicalTrialCreate(ClinicalTrialBase):
    nsclc_relevance: Optional[str] = None
    relevance_score: Optional[float] = None


class ClinicalTrialResponse(ClinicalTrialBase):
    id: int
    last_updated: Optional[datetime] = None
    # Relevance classification
    nsclc_relevance: Optional[str] = None
    relevance_score: Optional[float] = None
    # Structured eligibility
    structured_eligibility: Optional[dict[str, Any]] = None
    eligibility_extraction_version: Optional[str] = None
    eligibility_extracted_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class CancerCenterBase(BaseModel):
    name: str
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = "USA"
    lat: Optional[float] = None
    lng: Optional[float] = None
    nci_designation: Optional[str] = None
    us_news_rank: Optional[int] = None
    academic_affiliation: Optional[str] = None
    website: Optional[str] = None
    phone: Optional[str] = None
    specialties: Optional[list[str]] = None
    active_nsclc_trials: Optional[int] = None
    source_urls: Optional[dict[str, str]] = None


class CancerCenterCreate(CancerCenterBase):
    pass


class CancerCenterResponse(CancerCenterBase):
    id: int
    last_updated: Optional[datetime] = None

    class Config:
        from_attributes = True


class SearchResult(BaseModel):
    treatments: list[TreatmentResponse]
    trials: list[ClinicalTrialResponse]
    centers: list[CancerCenterResponse]


class PaginatedResponse(BaseModel):
    items: list[Any]
    total: int
    page: int
    page_size: int
    total_pages: int

    class Config:
        from_attributes = True
