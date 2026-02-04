"""
Pydantic schemas for structured eligibility data.

These schemas define the structure of extracted eligibility criteria
from free-text clinical trial eligibility requirements.
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class AgeRequirement(BaseModel):
    """Age eligibility requirements."""
    min: Optional[int] = Field(None, ge=0, le=120, description="Minimum age in years")
    max: Optional[int] = Field(None, ge=0, le=120, description="Maximum age in years")


class ECOGRequirement(BaseModel):
    """ECOG Performance Status requirements (0-4 scale)."""
    min: Optional[int] = Field(None, ge=0, le=4, description="Minimum ECOG score allowed")
    max: Optional[int] = Field(None, ge=0, le=4, description="Maximum ECOG score allowed")


class ListRequirement(BaseModel):
    """Generic list-based requirement with allowed/excluded values."""
    allowed: list[str] = Field(default_factory=list, description="Allowed values")
    excluded: list[str] = Field(default_factory=list, description="Excluded values")


class BiomarkerRequirements(BaseModel):
    """Biomarker-specific eligibility requirements."""
    # Required positive biomarkers with specific mutations/alterations
    required_positive: dict[str, list[str]] = Field(
        default_factory=dict,
        description="Biomarkers that must be positive, mapped to specific mutations if applicable"
    )
    # Required negative biomarkers (wild-type)
    required_negative: list[str] = Field(
        default_factory=list,
        description="Biomarkers that must be negative/wild-type"
    )
    # PD-L1 expression requirements
    pdl1_expression: Optional[dict[str, int | float | str]] = Field(
        None,
        description="PD-L1 requirements (min_tps, max_tps, level)"
    )


class PriorTreatmentRequirements(BaseModel):
    """Prior treatment history requirements."""
    required: list[str] = Field(
        default_factory=list,
        description="Treatments patient must have received"
    )
    excluded: list[str] = Field(
        default_factory=list,
        description="Treatments patient must NOT have received"
    )
    max_lines: Optional[int] = Field(
        None,
        ge=0,
        description="Maximum number of prior therapy lines"
    )
    min_lines: Optional[int] = Field(
        None,
        ge=0,
        description="Minimum number of prior therapy lines"
    )
    treatment_naive_required: bool = Field(
        False,
        description="Whether patient must be treatment-naive"
    )


class BrainMetastasesRequirement(BaseModel):
    """Brain metastases eligibility requirements."""
    allowed: bool = Field(True, description="Whether brain mets are allowed")
    controlled_only: bool = Field(
        False,
        description="Only controlled/treated brain mets allowed"
    )
    untreated_allowed: bool = Field(
        False,
        description="Whether untreated brain mets are allowed"
    )


class OrganFunctionRequirements(BaseModel):
    """Organ function/lab value requirements."""
    renal_exclusion: bool = Field(False, description="Excludes patients with renal impairment")
    hepatic_exclusion: bool = Field(False, description="Excludes patients with hepatic impairment")
    creatinine_max: Optional[float] = Field(None, description="Max creatinine level if specified")
    bilirubin_max: Optional[float] = Field(None, description="Max bilirubin level if specified")
    notes: Optional[str] = None


class PriorMalignancyRequirement(BaseModel):
    """Prior malignancy exclusion requirements."""
    excluded: bool = Field(False, description="Whether prior malignancy excludes patient")
    years_lookback: Optional[int] = Field(None, description="Years to look back (e.g., 5 years)")
    exceptions: list[str] = Field(default_factory=list, description="Exceptions (e.g., 'skin cancer')")


class WashoutRequirement(BaseModel):
    """Washout period requirements."""
    min_days_since_chemo: Optional[int] = Field(None, description="Min days since chemotherapy")
    min_days_since_radiation: Optional[int] = Field(None, description="Min days since radiation")
    min_days_since_surgery: Optional[int] = Field(None, description="Min days since surgery")
    min_days_since_immunotherapy: Optional[int] = Field(None, description="Min days since immunotherapy")
    general_min_days: Optional[int] = Field(None, description="General washout if specific not mentioned")


class StructuredEligibility(BaseModel):
    """
    Complete structured eligibility criteria extracted from free text.

    This schema represents the parsed, machine-readable version of
    clinical trial eligibility criteria.
    """
    # Demographics
    age: AgeRequirement = Field(default_factory=AgeRequirement)
    ecog: ECOGRequirement = Field(default_factory=ECOGRequirement)

    # Disease characteristics
    disease_stage: ListRequirement = Field(default_factory=ListRequirement)
    histology: ListRequirement = Field(default_factory=ListRequirement)

    # Biomarkers
    biomarkers: BiomarkerRequirements = Field(default_factory=BiomarkerRequirements)

    # Treatment history
    prior_treatments: PriorTreatmentRequirements = Field(
        default_factory=PriorTreatmentRequirements
    )

    # Health status
    brain_metastases: BrainMetastasesRequirement = Field(
        default_factory=BrainMetastasesRequirement
    )

    # Organ function requirements
    organ_function: OrganFunctionRequirements = Field(
        default_factory=OrganFunctionRequirements
    )

    # Prior malignancy exclusion
    prior_malignancy: PriorMalignancyRequirement = Field(
        default_factory=PriorMalignancyRequirement
    )

    # Washout period requirements
    washout: WashoutRequirement = Field(
        default_factory=WashoutRequirement
    )

    # Common exclusions
    common_exclusions: list[str] = Field(
        default_factory=list,
        description="Common exclusion criteria (pregnancy, infection, autoimmune, etc.)"
    )

    # Extraction metadata
    extraction_confidence: float = Field(
        0.5,
        ge=0.0,
        le=1.0,
        description="Confidence score for the extraction (0-1)"
    )
    extraction_notes: list[str] = Field(
        default_factory=list,
        description="Notes about extraction challenges or uncertainties"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "age": {"min": 18, "max": None},
                "ecog": {"min": 0, "max": 2},
                "disease_stage": {"allowed": ["IIIB", "IV"], "excluded": []},
                "histology": {"allowed": ["adenocarcinoma", "squamous"], "excluded": []},
                "biomarkers": {
                    "required_positive": {"EGFR": ["L858R", "exon 19 deletion"]},
                    "required_negative": ["ALK", "ROS1"],
                    "pdl1_expression": None
                },
                "prior_treatments": {
                    "required": [],
                    "excluded": ["EGFR TKI"],
                    "max_lines": 2,
                    "min_lines": None,
                    "treatment_naive_required": False
                },
                "brain_metastases": {
                    "allowed": True,
                    "controlled_only": True,
                    "untreated_allowed": False
                },
                "common_exclusions": ["pregnancy", "active infection", "autoimmune disease"],
                "extraction_confidence": 0.85,
                "extraction_notes": []
            }
        }


class StructuredEligibilityResponse(BaseModel):
    """Response wrapper for structured eligibility with metadata."""
    eligibility: StructuredEligibility
    version: str = Field(..., description="Extraction algorithm version")
    extracted_at: Optional[datetime] = Field(None, description="When extraction was performed")
    original_text_length: int = Field(0, description="Length of original eligibility text")


class EligibilityExtractionRequest(BaseModel):
    """Request to extract eligibility from raw text."""
    eligibility_text: str = Field(..., min_length=10, description="Raw eligibility criteria text")
    trial_title: Optional[str] = Field(None, description="Trial title for context")
    force_reextract: bool = Field(False, description="Force re-extraction even if already extracted")
