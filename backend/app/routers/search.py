from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database import get_db
from app.models import Treatment, ClinicalTrial, CancerCenter
from app.schemas import SearchResult

router = APIRouter(prefix="/search", tags=["search"])


@router.get("", response_model=SearchResult)
def unified_search(
    q: str = Query(..., min_length=2),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
):
    """
    Unified search across treatments, trials, and centers.
    Returns top results from each category.
    """
    # Search treatments
    treatments = (
        db.query(Treatment)
        .filter(
            or_(
                Treatment.generic_name.ilike(f"%{q}%"),
                Treatment.drug_class.ilike(f"%{q}%"),
                Treatment.mechanism_of_action.ilike(f"%{q}%"),
                Treatment.manufacturer.ilike(f"%{q}%"),
            )
        )
        .limit(limit)
        .all()
    )

    # Search trials
    trials = (
        db.query(ClinicalTrial)
        .filter(
            or_(
                ClinicalTrial.title.ilike(f"%{q}%"),
                ClinicalTrial.brief_summary.ilike(f"%{q}%"),
                ClinicalTrial.nct_id.ilike(f"%{q}%"),
                ClinicalTrial.sponsor.ilike(f"%{q}%"),
            )
        )
        .limit(limit)
        .all()
    )

    # Search centers
    centers = (
        db.query(CancerCenter)
        .filter(
            or_(
                CancerCenter.name.ilike(f"%{q}%"),
                CancerCenter.city.ilike(f"%{q}%"),
                CancerCenter.state.ilike(f"%{q}%"),
                CancerCenter.academic_affiliation.ilike(f"%{q}%"),
            )
        )
        .limit(limit)
        .all()
    )

    return SearchResult(
        treatments=treatments,
        trials=trials,
        centers=centers,
    )


@router.get("/suggest")
def search_suggestions(
    q: str = Query(..., min_length=2),
    limit: int = Query(5, ge=1, le=10),
    db: Session = Depends(get_db),
):
    """
    Typeahead suggestions for search.
    Returns a flat list of suggestions with their types.
    """
    suggestions = []

    # Treatment suggestions
    treatments = (
        db.query(Treatment.id, Treatment.generic_name)
        .filter(Treatment.generic_name.ilike(f"%{q}%"))
        .limit(limit)
        .all()
    )
    for t in treatments:
        suggestions.append({
            "id": t.id,
            "text": t.generic_name,
            "type": "treatment",
        })

    # Trial suggestions
    trials = (
        db.query(ClinicalTrial.nct_id, ClinicalTrial.title)
        .filter(
            or_(
                ClinicalTrial.nct_id.ilike(f"%{q}%"),
                ClinicalTrial.title.ilike(f"%{q}%"),
            )
        )
        .limit(limit)
        .all()
    )
    for t in trials:
        suggestions.append({
            "id": t.nct_id,
            "text": t.title[:80] + "..." if len(t.title or "") > 80 else t.title,
            "type": "trial",
        })

    # Center suggestions
    centers = (
        db.query(CancerCenter.id, CancerCenter.name)
        .filter(CancerCenter.name.ilike(f"%{q}%"))
        .limit(limit)
        .all()
    )
    for c in centers:
        suggestions.append({
            "id": c.id,
            "text": c.name,
            "type": "center",
        })

    return suggestions[:limit * 3]
