import logging
from typing import Optional
from collections import Counter
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models import ClinicalTrial
from app.schemas.competitor import (
    ResearcherTrialProfile,
    CompetitorMatch,
    MarketInsights,
    SponsorCount,
    GeographicHotspot,
    BiomarkerCount,
)

logger = logging.getLogger(__name__)

# Scoring weights for similarity calculation
WEIGHTS = {
    "biomarker": 0.35,
    "stage": 0.20,
    "geographic": 0.20,
    "phase": 0.10,
    "eligibility": 0.15,
}

# Maximum competitors to return
MAX_COMPETITORS = 50

# Phase ordering for proximity scoring
PHASE_ORDER = {
    "Phase 1": 1,
    "Phase 1/Phase 2": 1.5,
    "Phase 2": 2,
    "Phase 2/Phase 3": 2.5,
    "Phase 3": 3,
    "Phase 4": 4,
}


def find_competitors(
    profile: ResearcherTrialProfile,
    db: Session,
    max_results: int = MAX_COMPETITORS,
) -> tuple[list[CompetitorMatch], MarketInsights]:
    """
    Find competing trials based on researcher's trial profile.

    Returns a tuple of (competitor matches, market insights).
    """
    # Query recruiting trials
    query = db.query(ClinicalTrial).filter(
        func.upper(ClinicalTrial.status).in_(["RECRUITING", "ACTIVE_NOT_RECRUITING", "ENROLLING_BY_INVITATION"])
    )

    # Exclude the researcher's own trial if NCT ID provided
    if profile.nct_id:
        query = query.filter(ClinicalTrial.nct_id != profile.nct_id)

    candidates = query.limit(1000).all()

    # Score each candidate
    scored_competitors = []
    for trial in candidates:
        scores = _score_trial_similarity(profile, trial)

        # Calculate weighted overall score
        overall_score = (
            scores["biomarker"] * WEIGHTS["biomarker"] +
            scores["stage"] * WEIGHTS["stage"] +
            scores["geographic"] * WEIGHTS["geographic"] +
            scores["phase"] * WEIGHTS["phase"] +
            scores["eligibility"] * WEIGHTS["eligibility"]
        )

        # Only include trials with meaningful overlap
        if overall_score > 0.1:
            # Extract location states from trial
            trial_states = set()
            if trial.locations:
                for loc in trial.locations:
                    if loc.get("state"):
                        trial_states.add(loc["state"])

            overlapping_locations = list(
                set(profile.target_locations) & trial_states
            ) if profile.target_locations else []

            competitor = CompetitorMatch(
                nct_id=trial.nct_id,
                title=trial.title,
                phase=trial.phase,
                status=trial.status,
                sponsor=trial.sponsor,
                similarity_score=round(overall_score, 3),
                biomarker_overlap=round(scores["biomarker"], 3),
                stage_overlap=round(scores["stage"], 3),
                geographic_overlap=round(scores["geographic"], 3),
                phase_proximity=round(scores["phase"], 3),
                eligibility_similarity=round(scores["eligibility"], 3),
                overlapping_biomarkers=scores["overlapping_biomarkers"],
                overlapping_stages=scores["overlapping_stages"],
                overlapping_locations=overlapping_locations,
                locations=trial.locations[:5] if trial.locations else [],
                study_url=trial.study_url,
                brief_summary=trial.brief_summary,
            )
            scored_competitors.append(competitor)

    # Sort by similarity score
    scored_competitors.sort(key=lambda x: x.similarity_score, reverse=True)
    top_competitors = scored_competitors[:max_results]

    # Generate market insights
    insights = _generate_market_insights(scored_competitors, profile)

    return top_competitors, insights


def _score_trial_similarity(
    profile: ResearcherTrialProfile,
    trial: ClinicalTrial,
) -> dict:
    """
    Score how similar a trial is to the researcher's profile.

    Returns dict with individual component scores and overlap details.
    """
    scores = {
        "biomarker": 0.0,
        "stage": 0.0,
        "geographic": 0.0,
        "phase": 0.0,
        "eligibility": 0.0,
        "overlapping_biomarkers": [],
        "overlapping_stages": [],
    }

    # 1. Biomarker overlap (Jaccard similarity)
    profile_biomarkers = set(profile.target_biomarkers.keys())
    trial_biomarkers = set()

    # Extract biomarkers from trial
    if trial.biomarker_requirements:
        trial_biomarkers.update(trial.biomarker_requirements.keys())

    if trial.structured_eligibility:
        bio_req = trial.structured_eligibility.get("biomarkers", {}) or {}
        required_positive = bio_req.get("required_positive")
        if required_positive:
            trial_biomarkers.update(required_positive.keys())

    if profile_biomarkers or trial_biomarkers:
        overlap = profile_biomarkers & trial_biomarkers
        union = profile_biomarkers | trial_biomarkers
        if union:
            scores["biomarker"] = len(overlap) / len(union)
            scores["overlapping_biomarkers"] = list(overlap)

    # 2. Stage overlap
    profile_stages = set(s.upper() for s in profile.target_stages)
    trial_stages = set()

    if trial.structured_eligibility:
        stage_req = trial.structured_eligibility.get("disease_stage", {}) or {}
        allowed_stages = stage_req.get("allowed")
        if allowed_stages:
            trial_stages.update(s.upper() for s in allowed_stages)

    if profile_stages or trial_stages:
        overlap = profile_stages & trial_stages
        union = profile_stages | trial_stages
        if union:
            scores["stage"] = len(overlap) / len(union)
            scores["overlapping_stages"] = list(overlap)

    # 3. Geographic overlap
    profile_locations = set(profile.target_locations)
    trial_locations = set()

    if trial.locations:
        for loc in trial.locations:
            if loc.get("state"):
                trial_locations.add(loc["state"])

    if profile_locations or trial_locations:
        overlap = profile_locations & trial_locations
        union = profile_locations | trial_locations
        if union:
            scores["geographic"] = len(overlap) / len(union)

    # 4. Phase proximity (same or adjacent phase scores higher)
    if profile.phase and trial.phase:
        profile_order = PHASE_ORDER.get(profile.phase, 0)
        trial_order = PHASE_ORDER.get(trial.phase, 0)

        if profile_order and trial_order:
            # Same phase = 1.0, adjacent = 0.7, 2 apart = 0.4, etc.
            distance = abs(profile_order - trial_order)
            scores["phase"] = max(0, 1.0 - (distance * 0.3))

    # 5. Eligibility similarity (age, ECOG, treatment requirements)
    eligibility_scores = []

    if trial.structured_eligibility:
        elig = trial.structured_eligibility

        # Age range similarity
        if profile.age_range:
            trial_age = elig.get("age", {}) or {}
            trial_min = trial_age.get("min")
            trial_max = trial_age.get("max")

            # Use defaults if None
            trial_min = trial_min if trial_min is not None else 18
            trial_max = trial_max if trial_max is not None else 100

            # Calculate overlap of age ranges
            profile_min, profile_max = profile.age_range
            if profile_min is not None and profile_max is not None:
                overlap_min = max(profile_min, trial_min)
                overlap_max = min(profile_max, trial_max)

                if overlap_max >= overlap_min:
                    overlap_range = overlap_max - overlap_min
                    union_range = max(profile_max, trial_max) - min(profile_min, trial_min)
                    if union_range > 0:
                        eligibility_scores.append(overlap_range / union_range)

        # ECOG similarity
        if profile.ecog_max is not None:
            trial_ecog = elig.get("ecog", {}) or {}
            trial_ecog_max = trial_ecog.get("max")
            if trial_ecog_max is not None:
                # Same ECOG max = 1.0, differ by 1 = 0.5, etc.
                diff = abs(profile.ecog_max - trial_ecog_max)
                eligibility_scores.append(max(0, 1.0 - (diff * 0.5)))

        # Treatment naive requirement similarity
        if profile.treatment_naive_only is not None:
            trial_treatment = elig.get("prior_treatments", {}) or {}
            trial_naive = trial_treatment.get("treatment_naive_required", False)
            if trial_naive is None:
                trial_naive = False
            if profile.treatment_naive_only == trial_naive:
                eligibility_scores.append(1.0)
            else:
                eligibility_scores.append(0.3)

    if eligibility_scores:
        scores["eligibility"] = sum(eligibility_scores) / len(eligibility_scores)

    return scores


def _generate_market_insights(
    competitors: list[CompetitorMatch],
    profile: ResearcherTrialProfile,
) -> MarketInsights:
    """
    Generate aggregated market intelligence from competitor data.
    """
    if not competitors:
        return MarketInsights(
            total_competing_trials=0,
            top_sponsors=[],
            geographic_hotspots=[],
            phase_distribution={},
            common_biomarkers=[],
            avg_similarity_score=0.0,
        )

    # Count sponsors
    sponsor_counts = Counter(c.sponsor for c in competitors if c.sponsor)
    top_sponsors = [
        SponsorCount(name=name, count=count)
        for name, count in sponsor_counts.most_common(10)
    ]

    # Geographic distribution
    state_counts = Counter()
    for c in competitors:
        for loc in c.locations:
            if loc.get("state"):
                state_counts[loc["state"]] += 1

    geographic_hotspots = [
        GeographicHotspot(state=state, count=count)
        for state, count in state_counts.most_common(10)
    ]

    # Phase distribution
    phase_counts = Counter(c.phase for c in competitors if c.phase)
    phase_distribution = dict(phase_counts)

    # Common biomarkers among competitors
    biomarker_counts = Counter()
    for c in competitors:
        for biomarker in c.overlapping_biomarkers:
            biomarker_counts[biomarker] += 1

    common_biomarkers = [
        BiomarkerCount(biomarker=biomarker, count=count)
        for biomarker, count in biomarker_counts.most_common(10)
    ]

    # Average similarity score
    avg_score = sum(c.similarity_score for c in competitors) / len(competitors)

    return MarketInsights(
        total_competing_trials=len(competitors),
        top_sponsors=top_sponsors,
        geographic_hotspots=geographic_hotspots,
        phase_distribution=phase_distribution,
        common_biomarkers=common_biomarkers,
        avg_similarity_score=round(avg_score, 3),
    )


def get_trial_as_profile(
    nct_id: str,
    db: Session,
) -> Optional[ResearcherTrialProfile]:
    """
    Load an existing trial and convert it to a ResearcherTrialProfile.
    """
    trial = db.query(ClinicalTrial).filter(ClinicalTrial.nct_id == nct_id).first()

    if not trial:
        return None

    # Extract biomarkers
    biomarkers = {}
    if trial.biomarker_requirements:
        for biomarker, values in trial.biomarker_requirements.items():
            biomarkers[biomarker] = values if isinstance(values, list) else [values]

    # Extract stages
    stages = []
    if trial.structured_eligibility:
        stage_req = trial.structured_eligibility.get("disease_stage", {}) or {}
        stages = stage_req.get("allowed", []) or []

    # Extract histology
    histology = []
    if trial.structured_eligibility:
        hist_req = trial.structured_eligibility.get("histology", {}) or {}
        histology = hist_req.get("allowed", []) or []

    # Extract locations (states)
    locations = []
    if trial.locations:
        seen_states = set()
        for loc in trial.locations:
            state = loc.get("state")
            if state and state not in seen_states:
                locations.append(state)
                seen_states.add(state)

    # Extract eligibility criteria
    age_range = None
    ecog_max = None
    treatment_naive_only = None
    prior_treatments_excluded = []

    if trial.structured_eligibility:
        elig = trial.structured_eligibility

        age = elig.get("age", {}) or {}
        age_min = age.get("min")
        age_max = age.get("max")
        if age_min is not None or age_max is not None:
            age_range = (
                age_min if age_min is not None else 18,
                age_max if age_max is not None else 99
            )

        ecog = elig.get("ecog", {}) or {}
        ecog_max = ecog.get("max")

        treatment = elig.get("prior_treatments", {}) or {}
        treatment_naive_only = treatment.get("treatment_naive_required", False)
        if treatment_naive_only is None:
            treatment_naive_only = False
        prior_treatments_excluded = treatment.get("excluded", []) or []

    return ResearcherTrialProfile(
        nct_id=trial.nct_id,
        title=trial.title,
        phase=trial.phase,
        target_biomarkers=biomarkers,
        target_stages=stages,
        target_histology=histology,
        target_locations=locations,
        age_range=age_range,
        ecog_max=ecog_max,
        treatment_naive_only=treatment_naive_only,
        prior_treatments_excluded=prior_treatments_excluded,
    )
