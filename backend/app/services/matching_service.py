import logging
from typing import Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from decimal import Decimal

from app.models import Treatment, ClinicalTrial
from app.services.claude_service import evaluate_trial_eligibility

logger = logging.getLogger(__name__)

# Maximum number of trials to evaluate with Claude per request
# Note: Each trial evaluation requires a Claude API call, so keep this low for faster responses
MAX_TRIAL_EVALUATIONS = 10

# Maximum number of trials to return from v2 matching
MAX_V2_RESULTS = 20

# Default relevance categories for matching
DEFAULT_RELEVANCE_CATEGORIES = ["nsclc_specific", "nsclc_primary"]


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


def match_trials_v2(
    profile: dict[str, Any],
    db: Session,
    max_results: int = MAX_V2_RESULTS,
    relevance_categories: Optional[list[str]] = None
) -> list[dict[str, Any]]:
    """
    Fast matching using structured eligibility data.

    This version uses PostgreSQL JSONB pre-filtering instead of Claude API calls,
    making it 10-30x faster and much cheaper than the original match_trials.

    Args:
        profile: Patient profile with biomarkers, age, stage, etc.
        db: Database session
        max_results: Maximum number of results to return
        relevance_categories: NSCLC relevance categories to include

    Returns:
        List of trial matches with computed eligibility scores
    """
    if relevance_categories is None:
        relevance_categories = DEFAULT_RELEVANCE_CATEGORIES

    # Extract patient data
    patient_biomarkers = profile.get("biomarkers", {})
    patient_age = profile.get("age")
    patient_ecog = profile.get("ecog_status")
    patient_stage = profile.get("stage", "").upper() if profile.get("stage") else None
    patient_histology = profile.get("histology", "").lower() if profile.get("histology") else None
    patient_location = profile.get("location", "")
    patient_prior_treatments = [t.lower() for t in profile.get("prior_treatments", [])]
    patient_brain_mets = profile.get("brain_metastases")

    # Step 1: PostgreSQL pre-filter for recruiting trials with structured eligibility
    query = db.query(ClinicalTrial).filter(
        func.upper(ClinicalTrial.status).in_(["RECRUITING", "ACTIVE_NOT_RECRUITING", "ENROLLING_BY_INVITATION"]),
        ClinicalTrial.structured_eligibility.isnot(None)
    )

    # Filter by relevance
    if relevance_categories:
        query = query.filter(ClinicalTrial.nsclc_relevance.in_(relevance_categories))

    # Get candidates (limit to reasonable number for scoring)
    candidates = query.limit(500).all()

    # Step 2: Score each trial against patient profile
    scored_matches = []
    for trial in candidates:
        score, reasons, excluding = _score_trial_match(
            trial=trial,
            patient_biomarkers=patient_biomarkers,
            patient_age=patient_age,
            patient_ecog=patient_ecog,
            patient_stage=patient_stage,
            patient_histology=patient_histology,
            patient_prior_treatments=patient_prior_treatments,
            patient_brain_mets=patient_brain_mets
        )

        # Only include trials with positive score or unknown eligibility
        if score >= 0:
            # Determine eligibility status based on score
            if score >= 0.7:
                status = "eligible"
            elif score >= 0.3 or (score == 0 and not excluding):
                status = "uncertain"
            else:
                status = "ineligible"

            # Filter locations if patient location provided
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

            scored_matches.append({
                "id": trial.id,
                "nct_id": trial.nct_id,
                "title": trial.title,
                "phase": trial.phase,
                "status": trial.status,
                "sponsor": trial.sponsor,
                "brief_summary": trial.brief_summary,
                "biomarker_requirements": trial.biomarker_requirements,
                "structured_eligibility": trial.structured_eligibility,
                "nsclc_relevance": trial.nsclc_relevance,
                "relevance_score": float(trial.relevance_score) if trial.relevance_score else None,
                "eligibility": {
                    "status": status,
                    "confidence": min(1.0, score + 0.3) if score > 0 else 0.5,
                    "matching_criteria": reasons,
                    "excluding_criteria": excluding,
                    "explanation": _generate_explanation(status, reasons, excluding)
                },
                "study_url": trial.study_url,
                "locations": locations[:5] if locations else None,
                "match_score": score
            })

    # Step 3: Sort by eligibility status and score
    status_order = {"eligible": 0, "uncertain": 1, "ineligible": 2}
    scored_matches.sort(
        key=lambda x: (
            status_order.get(x["eligibility"]["status"], 1),
            -x["match_score"]
        )
    )

    return scored_matches[:max_results]


def _score_trial_match(
    trial: ClinicalTrial,
    patient_biomarkers: dict[str, list[str]],
    patient_age: Optional[int],
    patient_ecog: Optional[int],
    patient_stage: Optional[str],
    patient_histology: Optional[str],
    patient_prior_treatments: list[str],
    patient_brain_mets: Optional[bool]
) -> tuple[float, list[str], list[str]]:
    """
    Score a trial match against patient profile using structured eligibility.

    Returns: (score, matching_reasons, excluding_reasons)
    - score: 0.0 to 1.0 (higher = better match)
    - matching_reasons: list of criteria the patient meets
    - excluding_reasons: list of criteria that may exclude the patient
    """
    eligibility = trial.structured_eligibility or {}
    score = 0.0
    matching = []
    excluding = []

    # Check age
    age_req = eligibility.get("age", {})
    if patient_age is not None:
        min_age = age_req.get("min")
        max_age = age_req.get("max")
        if min_age is not None and patient_age < min_age:
            excluding.append(f"Age {patient_age} below minimum {min_age}")
            score -= 0.5
        elif max_age is not None and patient_age > max_age:
            excluding.append(f"Age {patient_age} above maximum {max_age}")
            score -= 0.5
        elif min_age is not None or max_age is not None:
            matching.append(f"Age {patient_age} meets requirement")
            score += 0.1

    # Check ECOG
    ecog_req = eligibility.get("ecog", {})
    if patient_ecog is not None:
        min_ecog = ecog_req.get("min")
        max_ecog = ecog_req.get("max")
        if max_ecog is not None and patient_ecog > max_ecog:
            excluding.append(f"ECOG {patient_ecog} above maximum {max_ecog}")
            score -= 0.3
        elif min_ecog is not None and patient_ecog < min_ecog:
            excluding.append(f"ECOG {patient_ecog} below minimum {min_ecog}")
            score -= 0.3
        elif max_ecog is not None:
            matching.append(f"ECOG {patient_ecog} meets requirement (max {max_ecog})")
            score += 0.15

    # Check disease stage
    stage_req = eligibility.get("disease_stage", {})
    if patient_stage:
        allowed_stages = [s.upper() for s in stage_req.get("allowed", [])]
        excluded_stages = [s.upper() for s in stage_req.get("excluded", [])]

        if patient_stage in excluded_stages:
            excluding.append(f"Stage {patient_stage} is excluded")
            score -= 0.4
        elif allowed_stages and patient_stage in allowed_stages:
            matching.append(f"Stage {patient_stage} is allowed")
            score += 0.2
        elif allowed_stages:
            # Stage specified but not in allowed list
            excluding.append(f"Stage {patient_stage} not in allowed stages")
            score -= 0.2

    # Check histology
    hist_req = eligibility.get("histology", {})
    if patient_histology:
        allowed_hist = [h.lower() for h in hist_req.get("allowed", [])]
        excluded_hist = [h.lower() for h in hist_req.get("excluded", [])]

        if any(patient_histology in h or h in patient_histology for h in excluded_hist):
            excluding.append(f"Histology {patient_histology} is excluded")
            score -= 0.3
        elif allowed_hist and any(patient_histology in h or h in patient_histology for h in allowed_hist):
            matching.append(f"Histology {patient_histology} is allowed")
            score += 0.15

    # Check biomarkers - this is the most important matching criterion
    biomarker_req = eligibility.get("biomarkers", {})
    required_positive = biomarker_req.get("required_positive", {})
    required_negative = biomarker_req.get("required_negative", [])

    for biomarker, required_mutations in required_positive.items():
        biomarker_upper = biomarker.upper()
        patient_values = None

        # Find matching patient biomarker
        for pb, pv in patient_biomarkers.items():
            if pb.upper() == biomarker_upper:
                patient_values = [v.lower() for v in pv]
                break

        if patient_values:
            # Patient has this biomarker
            required_lower = [r.lower() for r in required_mutations]

            # Check for positive/presence match
            positive_indicators = {"positive", "present", "detected", "rearrangement", "fusion", "+"}
            patient_is_positive = bool(positive_indicators & set(patient_values))
            requires_positive = bool(positive_indicators & set(required_lower))

            if requires_positive and patient_is_positive:
                matching.append(f"{biomarker} positive match")
                score += 0.4
            elif set(required_lower) & set(patient_values):
                # Specific mutation match
                matched_mutations = set(required_lower) & set(patient_values)
                matching.append(f"{biomarker} mutation match ({', '.join(matched_mutations)})")
                score += 0.5
            elif patient_is_positive and not requires_positive:
                # Patient positive but specific mutation required
                matching.append(f"{biomarker} positive (confirm specific mutation)")
                score += 0.25
            elif "negative" in patient_values or "wild-type" in patient_values:
                # Patient negative for required positive biomarker
                excluding.append(f"{biomarker} required positive but patient is negative")
                score -= 0.5
        else:
            # Patient doesn't have this biomarker data - uncertain
            pass

    # Check required negative biomarkers
    for neg_biomarker in required_negative:
        neg_upper = neg_biomarker.upper()
        patient_values = None

        for pb, pv in patient_biomarkers.items():
            if pb.upper() == neg_upper:
                patient_values = [v.lower() for v in pv]
                break

        if patient_values:
            positive_indicators = {"positive", "present", "detected", "rearrangement", "fusion", "+"}
            if positive_indicators & set(patient_values):
                excluding.append(f"{neg_biomarker} must be negative but patient is positive")
                score -= 0.4
            elif "negative" in patient_values or "wild-type" in patient_values:
                matching.append(f"{neg_biomarker} is negative as required")
                score += 0.2

    # Check PD-L1 if specified
    pdl1_req = biomarker_req.get("pdl1_expression")
    if pdl1_req:
        pdl1_values = None
        for pb, pv in patient_biomarkers.items():
            if pb.upper() == "PD-L1":
                pdl1_values = pv
                break

        if pdl1_values:
            # Try to extract TPS percentage from patient values
            for val in pdl1_values:
                if "%" in str(val):
                    try:
                        tps = int(str(val).replace("%", "").replace("TPS", "").replace("tps", "").strip())
                        min_tps = pdl1_req.get("min_tps")
                        if min_tps is not None and tps >= min_tps:
                            matching.append(f"PD-L1 TPS {tps}% meets requirement (min {min_tps}%)")
                            score += 0.3
                        elif min_tps is not None and tps < min_tps:
                            excluding.append(f"PD-L1 TPS {tps}% below required {min_tps}%")
                            score -= 0.3
                    except ValueError:
                        pass

    # Check brain metastases
    brain_req = eligibility.get("brain_metastases", {})
    if patient_brain_mets is not None:
        if patient_brain_mets and not brain_req.get("allowed", True):
            excluding.append("Brain metastases not allowed")
            score -= 0.3
        elif patient_brain_mets and brain_req.get("allowed", True):
            if brain_req.get("controlled_only", False):
                matching.append("Brain metastases allowed (must be controlled)")
            else:
                matching.append("Brain metastases allowed")
            score += 0.1

    # Check prior treatments
    treatment_req = eligibility.get("prior_treatments", {})
    excluded_treatments = [t.lower() for t in treatment_req.get("excluded", [])]
    required_treatments = [t.lower() for t in treatment_req.get("required", [])]

    for pt in patient_prior_treatments:
        if any(et in pt or pt in et for et in excluded_treatments):
            excluding.append(f"Prior treatment '{pt}' is excluded")
            score -= 0.3

    for rt in required_treatments:
        if any(rt in pt or pt in rt for pt in patient_prior_treatments):
            matching.append(f"Has required prior treatment: {rt}")
            score += 0.2
        else:
            excluding.append(f"Missing required prior treatment: {rt}")
            score -= 0.2

    if treatment_req.get("treatment_naive_required") and patient_prior_treatments:
        excluding.append("Treatment-naive required but patient has prior treatments")
        score -= 0.4

    # Normalize score to 0-1 range
    score = max(0.0, min(1.0, (score + 0.5)))  # Shift and clamp

    return score, matching, excluding


def _generate_explanation(status: str, matching: list[str], excluding: list[str]) -> str:
    """Generate a human-readable explanation of eligibility assessment."""
    if status == "eligible":
        if matching:
            return f"Likely eligible based on: {'; '.join(matching[:3])}"
        return "No clear exclusions found"
    elif status == "ineligible":
        if excluding:
            return f"Likely ineligible due to: {'; '.join(excluding[:3])}"
        return "Does not meet key eligibility criteria"
    else:
        parts = []
        if matching:
            parts.append(f"Matches: {', '.join(matching[:2])}")
        if excluding:
            parts.append(f"Concerns: {', '.join(excluding[:2])}")
        if parts:
            return "; ".join(parts)
        return "Insufficient information for definitive assessment"
