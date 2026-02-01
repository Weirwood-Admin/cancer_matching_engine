from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional
from app.database import get_db
from app.models import Treatment
from app.schemas import TreatmentResponse, TreatmentCreate, PaginatedResponse

router = APIRouter(prefix="/treatments", tags=["treatments"])


@router.get("/classes/list", response_model=list[str])
def list_drug_classes(db: Session = Depends(get_db)):
    classes = (
        db.query(Treatment.drug_class)
        .filter(Treatment.drug_class.isnot(None))
        .distinct()
        .all()
    )
    return [c[0] for c in classes if c[0]]


@router.get("", response_model=PaginatedResponse)
def list_treatments(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    drug_class: Optional[str] = None,
    biomarker: Optional[str] = None,
    fda_status: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Treatment)

    if drug_class:
        query = query.filter(Treatment.drug_class.ilike(f"%{drug_class}%"))

    if biomarker:
        query = query.filter(
            Treatment.biomarker_requirements.cast(str).ilike(f"%{biomarker}%")
        )

    if fda_status:
        query = query.filter(Treatment.fda_approval_status == fda_status)

    if search:
        query = query.filter(
            or_(
                Treatment.generic_name.ilike(f"%{search}%"),
                Treatment.drug_class.ilike(f"%{search}%"),
                Treatment.mechanism_of_action.ilike(f"%{search}%"),
            )
        )

    total = query.count()
    total_pages = (total + page_size - 1) // page_size

    items = (
        query.order_by(Treatment.generic_name)
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    return PaginatedResponse(
        items=[TreatmentResponse.model_validate(item) for item in items],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get("/{treatment_id}", response_model=TreatmentResponse)
def get_treatment(treatment_id: int, db: Session = Depends(get_db)):
    treatment = db.query(Treatment).filter(Treatment.id == treatment_id).first()
    if not treatment:
        raise HTTPException(status_code=404, detail="Treatment not found")
    return treatment


@router.post("", response_model=TreatmentResponse, status_code=201)
def create_treatment(treatment: TreatmentCreate, db: Session = Depends(get_db)):
    db_treatment = Treatment(**treatment.model_dump())
    db.add(db_treatment)
    db.commit()
    db.refresh(db_treatment)
    return db_treatment
