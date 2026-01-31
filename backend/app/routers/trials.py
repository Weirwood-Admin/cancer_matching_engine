from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from typing import Optional
from app.database import get_db
from app.models import ClinicalTrial
from app.schemas import ClinicalTrialResponse, ClinicalTrialCreate, PaginatedResponse

router = APIRouter(prefix="/trials", tags=["trials"])


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
    db: Session = Depends(get_db),
):
    query = db.query(ClinicalTrial)

    if phase:
        query = query.filter(ClinicalTrial.phase.ilike(f"%{phase}%"))

    if status:
        query = query.filter(ClinicalTrial.status.ilike(f"%{status}%"))

    if state:
        query = query.filter(
            ClinicalTrial.locations.cast(str).ilike(f"%{state}%")
        )

    if sponsor:
        query = query.filter(ClinicalTrial.sponsor.ilike(f"%{sponsor}%"))

    if biomarker:
        query = query.filter(
            or_(
                ClinicalTrial.biomarker_requirements.cast(str).ilike(f"%{biomarker}%"),
                ClinicalTrial.eligibility_criteria.ilike(f"%{biomarker}%"),
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

    total = query.count()
    total_pages = (total + page_size - 1) // page_size

    items = (
        query.order_by(ClinicalTrial.nct_id.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    return PaginatedResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


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
