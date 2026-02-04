import time
import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.matching import (
    PatientProfile,
    PatientMatchRequest,
    PatientMatchResponse,
    ParsedProfileResponse,
    TreatmentMatch,
    TrialMatch,
    EligibilityResult,
)
from app.services.claude_service import parse_patient_description
from app.services.matching_service import match_treatments, match_trials, match_trials_v2

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/match", tags=["matching"])


@router.post("/parse", response_model=ParsedProfileResponse)
def parse_patient(request: PatientMatchRequest):
    """
    Parse a natural language patient description into a structured profile.

    This endpoint is useful for previewing the parsed profile before
    running the full matching process.
    """
    try:
        raw_extraction = parse_patient_description(request.description)

        # Check for parsing errors
        if "parse_error" in raw_extraction:
            raise HTTPException(
                status_code=422,
                detail=f"Failed to parse patient description: {raw_extraction['parse_error']}"
            )

        # Build PatientProfile from extraction
        profile = PatientProfile(
            cancer_type=raw_extraction.get("cancer_type", "NSCLC"),
            histology=raw_extraction.get("histology"),
            stage=raw_extraction.get("stage"),
            biomarkers=raw_extraction.get("biomarkers", {}),
            age=raw_extraction.get("age"),
            ecog_status=raw_extraction.get("ecog_status"),
            prior_treatments=raw_extraction.get("prior_treatments", []),
            brain_metastases=raw_extraction.get("brain_metastases"),
            location=request.location or raw_extraction.get("location"),
        )

        return ParsedProfileResponse(
            profile=profile,
            raw_extraction=raw_extraction
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error parsing patient description: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to parse patient description. Please try again."
        )


@router.post("", response_model=PatientMatchResponse)
def match_patient(request: PatientMatchRequest, db: Session = Depends(get_db)):
    """
    Match a patient to treatments and clinical trials.

    1. Parses the natural language description into a structured profile
    2. Matches FDA-approved treatments based on biomarkers
    3. Evaluates clinical trial eligibility using AI
    4. Returns ranked results with explanations
    """
    start_time = time.time()

    try:
        # Parse patient description
        raw_extraction = parse_patient_description(request.description)

        if "parse_error" in raw_extraction:
            raise HTTPException(
                status_code=422,
                detail=f"Failed to parse patient description: {raw_extraction['parse_error']}"
            )

        # Build profile dict for matching services
        profile_dict = {
            "cancer_type": raw_extraction.get("cancer_type", "NSCLC"),
            "histology": raw_extraction.get("histology"),
            "stage": raw_extraction.get("stage"),
            "biomarkers": raw_extraction.get("biomarkers", {}),
            "age": raw_extraction.get("age"),
            "ecog_status": raw_extraction.get("ecog_status"),
            "prior_treatments": raw_extraction.get("prior_treatments", []),
            "brain_metastases": raw_extraction.get("brain_metastases"),
            "location": request.location or raw_extraction.get("location"),
        }

        # Build PatientProfile for response
        profile = PatientProfile(**profile_dict)

        # Match treatments (rule-based)
        treatment_matches = match_treatments(profile_dict, db)

        # Match trials (AI-evaluated)
        trial_matches = match_trials(profile_dict, db)

        # Convert to response models
        treatment_results = [
            TreatmentMatch(**t) for t in treatment_matches
        ]

        trial_results = [
            TrialMatch(
                id=t["id"],
                nct_id=t["nct_id"],
                title=t["title"],
                phase=t["phase"],
                status=t["status"],
                sponsor=t["sponsor"],
                brief_summary=t["brief_summary"],
                biomarker_requirements=t["biomarker_requirements"],
                eligibility=EligibilityResult(**t["eligibility"]),
                study_url=t["study_url"],
                locations=t["locations"],
            )
            for t in trial_matches
        ]

        processing_time_ms = int((time.time() - start_time) * 1000)

        return PatientMatchResponse(
            profile=profile,
            treatments=treatment_results,
            trials=trial_results,
            total_treatments=len(treatment_results),
            total_trials=len(trial_results),
            processing_time_ms=processing_time_ms,
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in patient matching: {e}")
        raise HTTPException(
            status_code=500,
            detail="An error occurred during matching. Please try again."
        )


@router.post("/v2", response_model=PatientMatchResponse)
def match_patient_v2(request: PatientMatchRequest, db: Session = Depends(get_db)):
    """
    Fast patient matching using pre-extracted structured eligibility.

    This endpoint is 10-30x faster than the original /match endpoint because
    it uses pre-computed structured eligibility data instead of making Claude
    API calls for each trial evaluation.

    Use this endpoint when:
    - Speed is important (1-3 seconds vs 15-30 seconds)
    - Cost is a concern ($0.01 vs $0.10-0.50 per match)
    - Trials have been processed with extract_eligibility.py

    Note: Falls back to original matching if no structured eligibility data exists.
    """
    start_time = time.time()

    try:
        # Parse patient description (still requires one Claude call)
        raw_extraction = parse_patient_description(request.description)

        if "parse_error" in raw_extraction:
            raise HTTPException(
                status_code=422,
                detail=f"Failed to parse patient description: {raw_extraction['parse_error']}"
            )

        # Build profile dict for matching services
        profile_dict = {
            "cancer_type": raw_extraction.get("cancer_type", "NSCLC"),
            "histology": raw_extraction.get("histology"),
            "stage": raw_extraction.get("stage"),
            "biomarkers": raw_extraction.get("biomarkers", {}),
            "age": raw_extraction.get("age"),
            "ecog_status": raw_extraction.get("ecog_status"),
            "prior_treatments": raw_extraction.get("prior_treatments", []),
            "brain_metastases": raw_extraction.get("brain_metastases"),
            "location": request.location or raw_extraction.get("location"),
        }

        # Build PatientProfile for response
        profile = PatientProfile(**profile_dict)

        # Match treatments (rule-based, same as v1)
        treatment_matches = match_treatments(profile_dict, db)

        # Match trials using fast v2 method
        trial_matches = match_trials_v2(profile_dict, db)

        # If no trials found with v2, check if we have structured eligibility data
        if not trial_matches:
            # Check if any trials have structured eligibility
            from app.models import ClinicalTrial
            has_structured = db.query(ClinicalTrial).filter(
                ClinicalTrial.structured_eligibility.isnot(None)
            ).first() is not None

            if not has_structured:
                # Fall back to original matching
                logger.info("No structured eligibility data, falling back to v1 matching")
                trial_matches = match_trials(profile_dict, db)

        # Convert to response models
        treatment_results = [
            TreatmentMatch(**t) for t in treatment_matches
        ]

        trial_results = [
            TrialMatch(
                id=t["id"],
                nct_id=t["nct_id"],
                title=t["title"],
                phase=t["phase"],
                status=t["status"],
                sponsor=t["sponsor"],
                brief_summary=t["brief_summary"],
                biomarker_requirements=t["biomarker_requirements"],
                eligibility=EligibilityResult(**t["eligibility"]),
                study_url=t["study_url"],
                locations=t["locations"],
            )
            for t in trial_matches
        ]

        processing_time_ms = int((time.time() - start_time) * 1000)

        return PatientMatchResponse(
            profile=profile,
            treatments=treatment_results,
            trials=trial_results,
            total_treatments=len(treatment_results),
            total_trials=len(trial_results),
            processing_time_ms=processing_time_ms,
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in patient matching v2: {e}")
        raise HTTPException(
            status_code=500,
            detail="An error occurred during matching. Please try again."
        )
