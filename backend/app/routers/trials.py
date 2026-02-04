from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, func, case, nullslast, Text
from sqlalchemy.sql.expression import cast
from typing import Optional
from app.database import get_db
from app.models import ClinicalTrial
from app.schemas import ClinicalTrialResponse, ClinicalTrialCreate, PaginatedResponse

router = APIRouter(prefix="/trials", tags=["trials"])

# Valid relevance categories
VALID_RELEVANCE_CATEGORIES = ["nsclc_specific", "nsclc_primary", "multi_cancer", "solid_tumor"]
DEFAULT_RELEVANCE_FILTER = ["nsclc_specific", "nsclc_primary"]  # Strict mode default


@router.get("/phases/list", response_model=list[str])
def list_phases(db: Session = Depends(get_db)):
    phases = (
        db.query(ClinicalTrial.phase)
        .filter(ClinicalTrial.phase.isnot(None))
        .distinct()
        .all()
    )
    return sorted([p[0] for p in phases if p[0]])


@router.get("/statuses/list", response_model=list[str])
def list_statuses(db: Session = Depends(get_db)):
    statuses = (
        db.query(ClinicalTrial.status)
        .filter(ClinicalTrial.status.isnot(None))
        .distinct()
        .all()
    )
    return [s[0] for s in statuses if s[0]]


@router.get("/relevance/list", response_model=list[str])
def list_relevance_categories():
    """Return list of valid NSCLC relevance categories."""
    return VALID_RELEVANCE_CATEGORIES


@router.get("/stats/relevance", response_model=dict)
def get_relevance_stats(db: Session = Depends(get_db)):
    """
    Get breakdown of trials by NSCLC relevance category.

    Returns counts and percentages for each relevance category.
    """
    # Get counts for each relevance category
    results = (
        db.query(
            ClinicalTrial.nsclc_relevance,
            func.count(ClinicalTrial.id).label('count')
        )
        .group_by(ClinicalTrial.nsclc_relevance)
        .all()
    )

    total = sum(r.count for r in results)
    stats = {
        "total": total,
        "categories": {},
        "nsclc_relevant_count": 0,  # nsclc_specific + nsclc_primary
    }

    for result in results:
        category = result.nsclc_relevance or "unknown"
        count = result.count
        stats["categories"][category] = {
            "count": count,
            "percentage": round((count / total * 100) if total > 0 else 0, 1)
        }
        if category in ("nsclc_specific", "nsclc_primary"):
            stats["nsclc_relevant_count"] += count

    # Ensure all categories are represented
    for cat in VALID_RELEVANCE_CATEGORIES:
        if cat not in stats["categories"]:
            stats["categories"][cat] = {"count": 0, "percentage": 0.0}

    return stats


@router.get("/biomarkers/list", response_model=list[str])
def list_biomarkers(db: Session = Depends(get_db)):
    """
    Return common biomarkers found in trial eligibility criteria.

    Note: This is a static list of common NSCLC biomarkers.
    """
    return [
        "EGFR", "ALK", "ROS1", "BRAF", "KRAS", "MET",
        "RET", "NTRK", "HER2", "PD-L1"
    ]


@router.get("/locations", response_model=list[dict])
def get_trial_locations(
    limit: int = Query(500, ge=1, le=1000),
    db: Session = Depends(get_db),
):
    """Get all trial locations for map display"""
    trials = (
        db.query(ClinicalTrial.nct_id, ClinicalTrial.title, ClinicalTrial.locations)
        .filter(ClinicalTrial.locations.isnot(None))
        .limit(limit)
        .all()
    )

    locations = []
    for trial in trials:
        if trial.locations:
            for loc in trial.locations:
                if loc.get("lat") and loc.get("lng"):
                    locations.append({
                        "nct_id": trial.nct_id,
                        "title": trial.title,
                        "facility": loc.get("facility"),
                        "city": loc.get("city"),
                        "state": loc.get("state"),
                        "lat": loc.get("lat"),
                        "lng": loc.get("lng"),
                    })
    return locations


@router.get("", response_model=PaginatedResponse)
def list_trials(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    phase: Optional[str] = None,
    status: Optional[str] = None,
    state: Optional[str] = None,
    sponsor: Optional[str] = None,
    biomarker: Optional[str] = None,
    search: Optional[str] = None,
    relevance: Optional[str] = Query(
        None,
        description="Comma-separated relevance categories to include. "
                    "Options: nsclc_specific, nsclc_primary, multi_cancer, solid_tumor. "
                    "Default filters to nsclc_specific,nsclc_primary if relevance data exists."
    ),
    include_all_relevance: bool = Query(
        False,
        description="If true, include all relevance categories (disable default filter)"
    ),
    has_structured_eligibility: Optional[bool] = Query(
        None,
        description="Filter to trials with/without structured eligibility data"
    ),
    db: Session = Depends(get_db),
):
    """
    List clinical trials with filtering options.

    By default, only NSCLC-specific and NSCLC-primary trials are returned
    (unless include_all_relevance=true or relevance parameter is specified).
    """
    query = db.query(ClinicalTrial)

    # Apply relevance filter
    if not include_all_relevance:
        if relevance:
            # Parse comma-separated relevance categories
            relevance_list = [r.strip() for r in relevance.split(",")]
            valid_relevance = [r for r in relevance_list if r in VALID_RELEVANCE_CATEGORIES]
            if valid_relevance:
                query = query.filter(ClinicalTrial.nsclc_relevance.in_(valid_relevance))
        else:
            # Check if any trials have relevance data
            has_relevance = db.query(ClinicalTrial).filter(
                ClinicalTrial.nsclc_relevance.isnot(None)
            ).first() is not None

            if has_relevance:
                # Default to NSCLC-specific trials only
                query = query.filter(
                    ClinicalTrial.nsclc_relevance.in_(DEFAULT_RELEVANCE_FILTER)
                )

    if phase:
        query = query.filter(ClinicalTrial.phase.ilike(f"%{phase}%"))

    if status:
        query = query.filter(ClinicalTrial.status.ilike(f"%{status}%"))

    if state:
        query = query.filter(
            cast(ClinicalTrial.locations, Text).ilike(f"%{state}%")
        )

    if sponsor:
        query = query.filter(ClinicalTrial.sponsor.ilike(f"%{sponsor}%"))

    if biomarker:
        # Search in structured eligibility JSONB, biomarker_requirements, and raw text
        query = query.filter(
            or_(
                cast(ClinicalTrial.biomarker_requirements, Text).ilike(f"%{biomarker}%"),
                ClinicalTrial.eligibility_criteria.ilike(f"%{biomarker}%"),
                cast(ClinicalTrial.structured_eligibility, Text).ilike(f"%{biomarker}%"),
            )
        )

    if search:
        query = query.filter(
            or_(
                ClinicalTrial.title.ilike(f"%{search}%"),
                ClinicalTrial.brief_summary.ilike(f"%{search}%"),
                ClinicalTrial.nct_id.ilike(f"%{search}%"),
            )
        )

    if has_structured_eligibility is not None:
        if has_structured_eligibility:
            query = query.filter(ClinicalTrial.structured_eligibility.isnot(None))
        else:
            query = query.filter(ClinicalTrial.structured_eligibility.is_(None))

    total = query.count()
    total_pages = (total + page_size - 1) // page_size

    # Order by relevance score (if available) then by NCT ID
    items = (
        query.order_by(
            nullslast(ClinicalTrial.relevance_score.desc()),
            ClinicalTrial.nct_id.desc()
        )
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    return PaginatedResponse(
        items=[ClinicalTrialResponse.model_validate(item) for item in items],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get("/{nct_id}", response_model=ClinicalTrialResponse)
def get_trial(nct_id: str, db: Session = Depends(get_db)):
    trial = db.query(ClinicalTrial).filter(ClinicalTrial.nct_id == nct_id).first()
    if not trial:
        raise HTTPException(status_code=404, detail="Trial not found")
    return trial


@router.post("", response_model=ClinicalTrialResponse, status_code=201)
def create_trial(trial: ClinicalTrialCreate, db: Session = Depends(get_db)):
    db_trial = ClinicalTrial(**trial.model_dump())
    db.add(db_trial)
    db.commit()
    db.refresh(db_trial)
    return db_trial
