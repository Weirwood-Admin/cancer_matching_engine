import logging
from typing import Any
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models import Treatment, ClinicalTrial
from app.services.claude_service import evaluate_trial_eligibility

logger = logging.getLogger(__name__)

# Maximum number of trials to evaluate with Claude per request
MAX_TRIAL_EVALUATIONS = 100


def match_treatments(
    profile: dict[str, Any],
    db: Session
) -> list[dict[str, Any]]:
    """
    Match FDA-approved treatments to a patient profile based on biomarkers.

    Uses rule-based matching against Treatment.biomarker_requirements.
    Returns a list of treatment matches with scores and reasons.
    """
    patient_biomarkers = profile.get("biomarkers", {})
    matches = []

    # Query all treatments
    treatments = db.query(Treatment).all()

    for treatment in treatments:
        match_score = 0.0
        match_reasons = []

        treatment_requirements = treatment.biomarker_requirements or {}

        # If treatment has no biomarker requirements, it may be broadly applicable
        if not treatment_requirements:
            # Check if it's a general NSCLC treatment (e.g., chemo, immunotherapy)
            drug_class = (treatment.drug_class or "").lower()
            if any(term in drug_class for term in ["chemotherapy", "immunotherapy", "pd-1", "pd-l1"]):
                match_score = 0.3
                match_reasons.append("General NSCLC treatment")

        # Match biomarkers
        for biomarker, required_values in treatment_requirements.items():
            biomarker_upper = biomarker.upper()

            # Check if patient has this biomarker
            patient_values = None
            for patient_biomarker, values in patient_biomarkers.items():
                if patient_biomarker.upper() == biomarker_upper:
                    patient_values = values
                    break

            if patient_values:
                # Patient has this biomarker
                required_set = set(v.lower() for v in (required_values if isinstance(required_values, list) else [required_values]))
                patient_set = set(v.lower() for v in patient_values)

                # Check for positive/presence match
                positive_indicators = {"positive", "present", "detected", "rearrangement", "fusion"}
                if positive_indicators & required_set and positive_indicators & patient_set:
                    match_score += 0.8
                    match_reasons.append(f"{biomarker} positive match")
                # Check for specific mutation match
                elif required_set & patient_set:
                    match_score += 1.0
                    match_reasons.append(f"{biomarker} mutation match ({', '.join(required_set & patient_set)})")
                # Check if patient is positive but we need specific mutation
                elif positive_indicators & patient_set and not (positive_indicators & required_set):
                    match_score += 0.5
                    match_reasons.append(f"{biomarker} positive (specific mutation check needed)")
                # Check for negative (wild-type) requirements
                elif "negative" in required_set or "wild-type" in required_set:
                    if "negative" in patient_set or "wild-type" in patient_set:
                        match_score += 0.6
                        match_reasons.append(f"{biomarker} wild-type match")

        # Normalize score to 0-1 range
        if match_score > 1.0:
            match_score = min(1.0, match_score / max(1, len(treatment_requirements)))

        # Only include treatments with some match
        if match_score > 0 or match_reasons:
            matches.append({
                "id": treatment.id,
                "generic_name": treatment.generic_name,
                "brand_names": treatment.brand_names,
                "drug_class": treatment.drug_class,
                "mechanism_of_action": treatment.mechanism_of_action,
                "biomarker_requirements": treatment.biomarker_requirements,
                "fda_approval_status": treatment.fda_approval_status,
                "match_reason": "; ".join(match_reasons) if match_reasons else "General NSCLC treatment",
                "match_score": round(match_score, 2)
            })

    # Sort by match score descending
    matches.sort(key=lambda x: x["match_score"], reverse=True)

    return matches


def match_trials(
    profile: dict[str, Any],
    db: Session,
    max_evaluations: int = MAX_TRIAL_EVALUATIONS
) -> list[dict[str, Any]]:
    """
    Match clinical trials to a patient profile.

    1. Pre-filter trials by biomarker keywords
    2. Evaluate top candidates with Claude for eligibility
    3. Return matches with eligibility results
    """
    patient_biomarkers = profile.get("biomarkers", {})
    patient_location = profile.get("location", "")

    # Query recruiting/active trials
    # Use case-insensitive matching to handle different status formats
    query = db.query(ClinicalTrial).filter(
        func.upper(ClinicalTrial.status).in_(["RECRUITING", "ACTIVE_NOT_RECRUITING", "ENROLLING_BY_INVITATION"])
    )

    trials = query.all()

    # Pre-filter and score trials based on biomarker relevance
    candidates = []
    for trial in trials:
        relevance_score = 0.0
        trial_biomarkers = trial.biomarker_requirements or {}

        # Check biomarker overlap
        for patient_biomarker in patient_biomarkers.keys():
            biomarker_upper = patient_biomarker.upper()

            # Check in biomarker_requirements
            for trial_biomarker in trial_biomarkers.keys():
                if trial_biomarker.upper() == biomarker_upper:
                    relevance_score += 1.0

            # Check in eligibility criteria text
            if trial.eligibility_criteria:
                if patient_biomarker.upper() in trial.eligibility_criteria.upper():
                    relevance_score += 0.5

            # Check in title
            if trial.title and patient_biomarker.upper() in trial.title.upper():
                relevance_score += 0.3

        # Give some score to trials without specific biomarker requirements
        if not trial_biomarkers and patient_biomarkers:
            # Could be a general NSCLC trial
            relevance_score = 0.1

        candidates.append((trial, relevance_score))

    # Sort by relevance and take top candidates for evaluation
    candidates.sort(key=lambda x: x[1], reverse=True)
    top_candidates = candidates[:max_evaluations]

    # Evaluate eligibility with Claude
    matches = []
    for trial, relevance_score in top_candidates:
        # Only evaluate if there's eligibility criteria
        if trial.eligibility_criteria:
            eligibility = evaluate_trial_eligibility(
                profile=profile,
                eligibility_text=trial.eligibility_criteria,
                trial_title=trial.title or trial.nct_id
            )
        else:
            # No criteria to evaluate
            eligibility = {
                "status": "uncertain",
                "confidence": 0.3,
                "matching_criteria": [],
                "excluding_criteria": [],
                "explanation": "No eligibility criteria available for evaluation"
            }

        # Filter locations by patient location if provided
        locations = trial.locations
        if patient_location and locations:
            patient_loc_lower = patient_location.lower()
            locations = [
                loc for loc in locations
                if any(
                    patient_loc_lower in str(loc.get(field, "")).lower()
                    for field in ["city", "state", "country"]
                )
            ]

        matches.append({
            "id": trial.id,
            "nct_id": trial.nct_id,
            "title": trial.title,
            "phase": trial.phase,
            "status": trial.status,
            "sponsor": trial.sponsor,
            "brief_summary": trial.brief_summary,
            "biomarker_requirements": trial.biomarker_requirements,
            "eligibility": eligibility,
            "study_url": trial.study_url,
            "locations": locations[:5] if locations else None  # Limit to 5 nearby locations
        })

    # Sort by eligibility: eligible first, then uncertain, then ineligible
    # Within each group, sort by confidence
    status_order = {"eligible": 0, "uncertain": 1, "ineligible": 2}
    matches.sort(
        key=lambda x: (
            status_order.get(x["eligibility"]["status"], 1),
            -x["eligibility"]["confidence"]
        )
    )

    return matches
