from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional
from app.database import get_db
from app.models import CancerCenter
from app.schemas import CancerCenterResponse, CancerCenterCreate, PaginatedResponse

router = APIRouter(prefix="/centers", tags=["centers"])


@router.get("/states/list", response_model=list[str])
def list_states(db: Session = Depends(get_db)):
    states = (
        db.query(CancerCenter.state)
        .filter(CancerCenter.state.isnot(None))
        .distinct()
        .all()
    )
    return sorted([s[0] for s in states if s[0]])


@router.get("/designations/list", response_model=list[str])
def list_designations(db: Session = Depends(get_db)):
    designations = (
        db.query(CancerCenter.nci_designation)
        .filter(CancerCenter.nci_designation.isnot(None))
        .distinct()
        .all()
    )
    return [d[0] for d in designations if d[0]]


@router.get("/locations", response_model=list[dict])
def get_center_locations(db: Session = Depends(get_db)):
    """Get all center locations for map display"""
    centers = (
        db.query(
            CancerCenter.id,
            CancerCenter.name,
            CancerCenter.city,
            CancerCenter.state,
            CancerCenter.lat,
            CancerCenter.lng,
            CancerCenter.nci_designation,
        )
        .filter(CancerCenter.lat.isnot(None), CancerCenter.lng.isnot(None))
        .all()
    )

    return [
        {
            "id": c.id,
            "name": c.name,
            "city": c.city,
            "state": c.state,
            "lat": float(c.lat),
            "lng": float(c.lng),
            "nci_designation": c.nci_designation,
        }
        for c in centers
    ]


@router.get("", response_model=PaginatedResponse)
def list_centers(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    state: Optional[str] = None,
    nci_designation: Optional[str] = None,
    specialty: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(CancerCenter)

    if state:
        query = query.filter(CancerCenter.state.ilike(f"%{state}%"))

    if nci_designation:
        query = query.filter(CancerCenter.nci_designation == nci_designation)

    if specialty:
        query = query.filter(
            CancerCenter.specialties.cast(str).ilike(f"%{specialty}%")
        )

    if search:
        query = query.filter(
            or_(
                CancerCenter.name.ilike(f"%{search}%"),
                CancerCenter.city.ilike(f"%{search}%"),
                CancerCenter.academic_affiliation.ilike(f"%{search}%"),
            )
        )

    total = query.count()
    total_pages = (total + page_size - 1) // page_size

    items = (
        query.order_by(CancerCenter.us_news_rank.nulls_last(), CancerCenter.name)
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    return PaginatedResponse(
        items=[CancerCenterResponse.model_validate(item) for item in items],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get("/{center_id}", response_model=CancerCenterResponse)
def get_center(center_id: int, db: Session = Depends(get_db)):
    center = db.query(CancerCenter).filter(CancerCenter.id == center_id).first()
    if not center:
        raise HTTPException(status_code=404, detail="Cancer center not found")
    return center


@router.post("", response_model=CancerCenterResponse, status_code=201)
def create_center(center: CancerCenterCreate, db: Session = Depends(get_db)):
    db_center = CancerCenter(**center.model_dump())
    db.add(db_center)
    db.commit()
    db.refresh(db_center)
    return db_center
