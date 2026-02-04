import time
import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.competitor import (
    ResearcherTrialProfile,
    CompetitorAnalysisResponse,
    NaturalLanguageRequest,
    ParsedTrialResponse,
)
from app.services.competitor_service import (
    find_competitors,
    get_trial_as_profile,
)
from app.services.claude_service import parse_trial_description

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/competitor", tags=["competitor"])


@router.post("/analyze", response_model=CompetitorAnalysisResponse)
def analyze_competitors(
    profile: ResearcherTrialProfile,
    db: Session = Depends(get_db),
):
    """
    Analyze competitive landscape for a researcher's trial.

    Takes a structured trial profile and returns similar/competing trials
    with market insights.
    """
    start_time = time.time()

    try:
        competitors, insights = find_competitors(profile, db)

        processing_time_ms = int((time.time() - start_time) * 1000)

        return CompetitorAnalysisResponse(
            profile=profile,
            competitors=competitors,
            insights=insights,
            total_competitors=len(competitors),
            processing_time_ms=processing_time_ms,
        )

    except Exception as e:
        logger.error(f"Error analyzing competitors: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/analyze/natural", response_model=CompetitorAnalysisResponse)
def analyze_competitors_natural(
    request: NaturalLanguageRequest,
    db: Session = Depends(get_db),
):
    """
    Analyze competitive landscape from a natural language trial description.

    Uses Claude to parse the description into a structured profile,
    then performs competitor analysis.
    """
    start_time = time.time()

    try:
        # Parse description using Claude
        parsed = parse_trial_description(request.description)

        # Convert to profile
        profile = ResearcherTrialProfile(
            title=parsed.get("title"),
            phase=parsed.get("phase"),
            target_biomarkers=parsed.get("target_biomarkers", {}),
            target_stages=parsed.get("target_stages", []),
            target_histology=parsed.get("target_histology", []),
            target_locations=parsed.get("target_locations", []),
            age_range=tuple(parsed["age_range"]) if parsed.get("age_range") else None,
            ecog_max=parsed.get("ecog_max"),
            treatment_naive_only=parsed.get("treatment_naive_only"),
            prior_treatments_excluded=parsed.get("prior_treatments_excluded", []),
        )

        competitors, insights = find_competitors(profile, db)

        processing_time_ms = int((time.time() - start_time) * 1000)

        return CompetitorAnalysisResponse(
            profile=profile,
            competitors=competitors,
            insights=insights,
            total_competitors=len(competitors),
            processing_time_ms=processing_time_ms,
        )

    except Exception as e:
        logger.error(f"Error analyzing competitors from natural language: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/analyze/{nct_id}", response_model=CompetitorAnalysisResponse)
def analyze_competitors_by_nct_id(
    nct_id: str,
    db: Session = Depends(get_db),
):
    """
    Analyze competitive landscape for an existing trial by NCT ID.

    Loads the trial from the database and performs competitor analysis.
    """
    start_time = time.time()

    try:
        # Load trial and convert to profile
        profile = get_trial_as_profile(nct_id, db)

        if not profile:
            raise HTTPException(
                status_code=404,
                detail=f"Trial {nct_id} not found in database"
            )

        competitors, insights = find_competitors(profile, db)

        processing_time_ms = int((time.time() - start_time) * 1000)

        return CompetitorAnalysisResponse(
            profile=profile,
            competitors=competitors,
            insights=insights,
            total_competitors=len(competitors),
            processing_time_ms=processing_time_ms,
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error analyzing competitors for {nct_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/parse", response_model=ParsedTrialResponse)
def parse_trial(
    request: NaturalLanguageRequest,
):
    """
    Parse a natural language trial description into a structured profile.

    Returns the parsed profile for preview before analysis.
    """
    try:
        parsed = parse_trial_description(request.description)

        profile = ResearcherTrialProfile(
            title=parsed.get("title"),
            phase=parsed.get("phase"),
            target_biomarkers=parsed.get("target_biomarkers", {}),
            target_stages=parsed.get("target_stages", []),
            target_histology=parsed.get("target_histology", []),
            target_locations=parsed.get("target_locations", []),
            age_range=tuple(parsed["age_range"]) if parsed.get("age_range") else None,
            ecog_max=parsed.get("ecog_max"),
            treatment_naive_only=parsed.get("treatment_naive_only"),
            prior_treatments_excluded=parsed.get("prior_treatments_excluded", []),
        )

        return ParsedTrialResponse(
            profile=profile,
            raw_extraction=parsed,
        )

    except Exception as e:
        logger.error(f"Error parsing trial description: {e}")
        raise HTTPException(status_code=500, detail=str(e))
