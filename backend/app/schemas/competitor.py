from pydantic import BaseModel, Field
from typing import Optional


class ResearcherTrialProfile(BaseModel):
    """Profile of a researcher's trial for competitive analysis."""
    nct_id: Optional[str] = None  # If importing existing trial
    title: Optional[str] = None
    phase: Optional[str] = None  # "Phase 1", "Phase 2", etc.
    target_biomarkers: dict[str, list[str]] = Field(default_factory=dict)  # {"EGFR": ["L858R"]}
    target_stages: list[str] = Field(default_factory=list)  # ["III", "IV"]
    target_histology: list[str] = Field(default_factory=list)  # ["adenocarcinoma"]
    target_locations: list[str] = Field(default_factory=list)  # States: ["California", "Texas"]
    age_range: Optional[tuple[int, int]] = None  # (min, max)
    ecog_max: Optional[int] = Field(None, ge=0, le=4)
    treatment_naive_only: Optional[bool] = None
    prior_treatments_excluded: list[str] = Field(default_factory=list)


class CompetitorMatch(BaseModel):
    """A competing trial with similarity metrics."""
    nct_id: str
    title: Optional[str] = None
    phase: Optional[str] = None
    status: Optional[str] = None
    sponsor: Optional[str] = None
    similarity_score: float = Field(..., ge=0.0, le=1.0)
    biomarker_overlap: float = Field(..., ge=0.0, le=1.0)
    stage_overlap: float = Field(..., ge=0.0, le=1.0)
    geographic_overlap: float = Field(..., ge=0.0, le=1.0)
    phase_proximity: float = Field(..., ge=0.0, le=1.0)
    eligibility_similarity: float = Field(..., ge=0.0, le=1.0)
    overlapping_biomarkers: list[str] = Field(default_factory=list)
    overlapping_stages: list[str] = Field(default_factory=list)
    overlapping_locations: list[str] = Field(default_factory=list)
    locations: list[dict] = Field(default_factory=list)
    study_url: Optional[str] = None
    brief_summary: Optional[str] = None


class SponsorCount(BaseModel):
    """Sponsor with trial count."""
    name: str
    count: int


class GeographicHotspot(BaseModel):
    """State with trial count."""
    state: str
    count: int


class BiomarkerCount(BaseModel):
    """Biomarker with trial count."""
    biomarker: str
    count: int


class MarketInsights(BaseModel):
    """Aggregated market intelligence from competitor analysis."""
    total_competing_trials: int
    top_sponsors: list[SponsorCount] = Field(default_factory=list)
    geographic_hotspots: list[GeographicHotspot] = Field(default_factory=list)
    phase_distribution: dict[str, int] = Field(default_factory=dict)
    common_biomarkers: list[BiomarkerCount] = Field(default_factory=list)
    avg_similarity_score: float = 0.0


class CompetitorAnalysisResponse(BaseModel):
    """Complete response from competitor analysis."""
    profile: ResearcherTrialProfile
    competitors: list[CompetitorMatch]
    insights: MarketInsights
    total_competitors: int
    processing_time_ms: int


class NaturalLanguageRequest(BaseModel):
    """Request for natural language trial description parsing."""
    description: str = Field(..., min_length=10, description="Natural language trial description")


class ParsedTrialResponse(BaseModel):
    """Response from parsing trial description."""
    profile: ResearcherTrialProfile
    raw_extraction: dict = Field(default_factory=dict)
