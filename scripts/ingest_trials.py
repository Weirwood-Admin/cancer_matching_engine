#!/usr/bin/env python3
"""
Ingest NSCLC clinical trials from ClinicalTrials.gov API v2
"""

import os
import sys
import httpx
import argparse
from datetime import datetime
from typing import Optional
from decimal import Decimal

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/weirwood"
)

engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)

# ClinicalTrials.gov API v2 base URL
API_BASE = "https://clinicaltrials.gov/api/v2/studies"

# NSCLC relevance classification terms
NSCLC_TERMS = [
    'nsclc', 'non-small cell', 'non small cell',
    'lung cancer', 'lung carcinoma', 'lung adenocarcinoma',
    'lung squamous', 'egfr lung', 'alk lung'
]

LUNG_RELATED_TERMS = [
    'lung', 'pulmonary', 'thoracic', 'bronchogenic', 'bronchial',
    'nsclc', 'non-small cell', 'non small cell'
]

OTHER_CANCER_TERMS = [
    'breast', 'colorectal', 'colon', 'melanoma', 'pancrea',
    'ovarian', 'prostate', 'kidney', 'renal', 'bladder',
    'gastric', 'hepatocellular', 'liver', 'head and neck',
    'glioblastoma', 'leukemia', 'lymphoma', 'myeloma',
    'esophageal', 'cervical', 'endometrial', 'uterine',
    'thyroid', 'sarcoma', 'mesothelioma'
]


def classify_trial_relevance(conditions: list[str], title: str = "") -> tuple[str, Decimal]:
    """
    Classify trial relevance to NSCLC.

    Returns: (category, confidence)
    - "nsclc_specific": Trial focuses on NSCLC only
    - "nsclc_primary": NSCLC is primary focus but may include subtypes
    - "multi_cancer": NSCLC is one of several cancers studied
    - "solid_tumor": Generic solid tumor basket trial
    - "not_relevant": Trial doesn't focus on NSCLC
    """
    if not conditions:
        conditions = []

    conditions_text = ' '.join(conditions).lower()
    title_text = (title or "").lower()
    combined_text = conditions_text + " " + title_text

    has_nsclc = any(term in combined_text for term in NSCLC_TERMS)
    has_other_cancer = any(term in combined_text for term in OTHER_CANCER_TERMS)
    has_solid_tumor = 'solid tumor' in combined_text or 'solid tumour' in combined_text or 'advanced solid' in combined_text

    if not has_nsclc:
        return ("not_relevant", Decimal("0.0"))

    if has_solid_tumor and has_other_cancer:
        return ("solid_tumor", Decimal("0.3"))

    if has_solid_tumor:
        return ("solid_tumor", Decimal("0.4"))

    if has_other_cancer:
        # Count how many other cancers are mentioned
        other_cancer_count = sum(1 for term in OTHER_CANCER_TERMS if term in combined_text)
        if other_cancer_count >= 3:
            return ("multi_cancer", Decimal("0.4"))
        elif other_cancer_count >= 1:
            return ("multi_cancer", Decimal("0.5"))

    # Check if conditions are ALL lung-related
    lung_only = all(
        any(term in c.lower() for term in LUNG_RELATED_TERMS)
        for c in conditions if c.strip()
    ) if conditions else False

    # Also check title for NSCLC-specific indicators
    nsclc_specific_title = any(term in title_text for term in ['nsclc', 'non-small cell', 'non small cell'])

    if lung_only or nsclc_specific_title:
        return ("nsclc_specific", Decimal("1.0"))

    return ("nsclc_primary", Decimal("0.8"))


def fetch_trials(page_token: Optional[str] = None, page_size: int = 100) -> dict:
    """Fetch a page of NSCLC trials from ClinicalTrials.gov"""
    params = {
        "query.cond": "NSCLC OR Non-Small Cell Lung Cancer",
        "filter.overallStatus": "RECRUITING,ACTIVE_NOT_RECRUITING",
        "pageSize": page_size,
        "fields": (
            "NCTId,BriefTitle,BriefSummary,Phase,OverallStatus,"
            "LeadSponsorName,InterventionName,InterventionType,"
            "Condition,EligibilityCriteria,PrimaryCompletionDate,"
            "LocationFacility,LocationCity,LocationState,LocationCountry,"
            "CentralContactName,CentralContactPhone,CentralContactEMail"
        ),
    }
    if page_token:
        params["pageToken"] = page_token

    response = httpx.get(API_BASE, params=params, timeout=60.0)
    response.raise_for_status()
    return response.json()


def parse_trial(study: dict) -> dict:
    """Parse a study from the API response into our schema"""
    protocol = study.get("protocolSection", {})
    id_module = protocol.get("identificationModule", {})
    status_module = protocol.get("statusModule", {})
    sponsor_module = protocol.get("sponsorCollaboratorsModule", {})
    desc_module = protocol.get("descriptionModule", {})
    design_module = protocol.get("designModule", {})
    eligibility_module = protocol.get("eligibilityModule", {})
    contacts_module = protocol.get("contactsLocationsModule", {})
    interventions_module = protocol.get("armsInterventionsModule", {})
    conditions_module = protocol.get("conditionsModule", {})

    # Parse interventions
    interventions = []
    for intv in interventions_module.get("interventions", []):
        interventions.append({
            "name": intv.get("name"),
            "type": intv.get("type"),
            "description": intv.get("description"),
        })

    # Parse locations
    locations = []
    for loc in contacts_module.get("locations", []):
        locations.append({
            "facility": loc.get("facility"),
            "city": loc.get("city"),
            "state": loc.get("state"),
            "country": loc.get("country"),
            "lat": loc.get("geoPoint", {}).get("lat") if loc.get("geoPoint") else None,
            "lng": loc.get("geoPoint", {}).get("lon") if loc.get("geoPoint") else None,
        })

    # Parse contact info
    central_contacts = contacts_module.get("centralContacts", [])
    contact_info = None
    if central_contacts:
        contact = central_contacts[0]
        contact_info = {
            "name": contact.get("name"),
            "phone": contact.get("phone"),
            "email": contact.get("email"),
        }

    # Parse phases
    phases = design_module.get("phases", [])
    phase = ", ".join(phases) if phases else None

    # Parse primary completion date
    completion_date = None
    completion_info = status_module.get("primaryCompletionDateStruct", {})
    if completion_info.get("date"):
        try:
            completion_date = datetime.strptime(
                completion_info["date"], "%Y-%m-%d"
            ).date()
        except ValueError:
            try:
                completion_date = datetime.strptime(
                    completion_info["date"], "%Y-%m"
                ).date()
            except ValueError:
                pass

    nct_id = id_module.get("nctId", "")
    title = id_module.get("briefTitle", "")
    conditions = conditions_module.get("conditions", [])

    # Classify trial relevance to NSCLC
    nsclc_relevance, relevance_score = classify_trial_relevance(conditions, title)

    return {
        "nct_id": nct_id,
        "title": title,
        "brief_summary": desc_module.get("briefSummary"),
        "phase": phase,
        "status": status_module.get("overallStatus"),
        "sponsor": sponsor_module.get("leadSponsor", {}).get("name"),
        "interventions": interventions,
        "conditions": conditions,
        "eligibility_criteria": eligibility_module.get("eligibilityCriteria"),
        "biomarker_requirements": None,  # Future enhancement: parse from eligibility
        "primary_completion_date": completion_date,
        "locations": locations,
        "contact_info": contact_info,
        "study_url": f"https://clinicaltrials.gov/study/{nct_id}",
        "nsclc_relevance": nsclc_relevance,
        "relevance_score": relevance_score,
    }


def ingest_trials(
    strict_mode: bool = True,
    max_pages: Optional[int] = None,
    extract_eligibility: bool = False
):
    """
    Main function to ingest all NSCLC trials.

    Args:
        strict_mode: If True, only ingest nsclc_specific and nsclc_primary trials.
                    If False, ingest all but mark relevance for filtering.
        max_pages: Optional limit on number of API pages to fetch (for testing).
        extract_eligibility: If True, extract structured eligibility after ingestion.
    """
    # Import model here to avoid circular imports
    from backend.app.models import ClinicalTrial
    from backend.app.database import Base

    Base.metadata.create_all(bind=engine)

    session = Session()
    total_ingested = 0
    total_updated = 0
    total_skipped = 0
    page_token = None
    page_count = 0

    # Track relevance stats
    relevance_stats = {
        "nsclc_specific": 0,
        "nsclc_primary": 0,
        "multi_cancer": 0,
        "solid_tumor": 0,
        "not_relevant": 0,
    }

    print("Starting NSCLC trials ingestion from ClinicalTrials.gov...")
    print(f"Mode: {'strict (NSCLC-specific only)' if strict_mode else 'inclusive (all trials)'}")

    try:
        while True:
            page_count += 1
            if max_pages and page_count > max_pages:
                print(f"Reached max pages limit ({max_pages})")
                break

            print(f"Fetching page {page_count} (token: {page_token})...")
            data = fetch_trials(page_token=page_token)

            studies = data.get("studies", [])
            if not studies:
                break

            for study in studies:
                trial_data = parse_trial(study)
                relevance = trial_data.get("nsclc_relevance", "not_relevant")
                relevance_stats[relevance] = relevance_stats.get(relevance, 0) + 1

                # In strict mode, skip non-NSCLC-specific trials
                if strict_mode and relevance not in ("nsclc_specific", "nsclc_primary"):
                    total_skipped += 1
                    continue

                # Check if trial already exists
                existing = (
                    session.query(ClinicalTrial)
                    .filter(ClinicalTrial.nct_id == trial_data["nct_id"])
                    .first()
                )

                if existing:
                    # Update existing trial
                    for key, value in trial_data.items():
                        setattr(existing, key, value)
                    total_updated += 1
                else:
                    # Create new trial
                    trial = ClinicalTrial(**trial_data)
                    session.add(trial)
                    total_ingested += 1

            session.commit()
            print(f"Processed {len(studies)} studies. New: {total_ingested}, Updated: {total_updated}, Skipped: {total_skipped}")

            # Check for next page
            page_token = data.get("nextPageToken")
            if not page_token:
                break

    except Exception as e:
        session.rollback()
        print(f"Error during ingestion: {e}")
        raise
    finally:
        session.close()

    print(f"\nIngestion complete!")
    print(f"New trials: {total_ingested}")
    print(f"Updated trials: {total_updated}")
    print(f"Skipped (not NSCLC-specific): {total_skipped}")
    print(f"\nRelevance breakdown (from API):")
    for category, count in relevance_stats.items():
        print(f"  {category}: {count}")

    if extract_eligibility:
        print("\nStarting eligibility extraction...")
        try:
            from scripts.extract_eligibility import extract_all_eligibility
            extract_all_eligibility()
        except ImportError:
            print("Warning: extract_eligibility.py not found. Run separately.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Ingest NSCLC clinical trials from ClinicalTrials.gov")
    parser.add_argument(
        "--inclusive",
        action="store_true",
        help="Include all trials (not just NSCLC-specific). Default is strict mode."
    )
    parser.add_argument(
        "--max-pages",
        type=int,
        default=None,
        help="Maximum number of API pages to fetch (for testing)"
    )
    parser.add_argument(
        "--extract-eligibility",
        action="store_true",
        help="Extract structured eligibility after ingestion"
    )

    args = parser.parse_args()

    ingest_trials(
        strict_mode=not args.inclusive,
        max_pages=args.max_pages,
        extract_eligibility=args.extract_eligibility
    )
