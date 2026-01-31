#!/usr/bin/env python3
"""
Ingest NSCLC clinical trials from ClinicalTrials.gov API v2
"""

import os
import sys
import httpx
from datetime import datetime
from typing import Optional

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

    return {
        "nct_id": nct_id,
        "title": id_module.get("briefTitle"),
        "brief_summary": desc_module.get("briefSummary"),
        "phase": phase,
        "status": status_module.get("overallStatus"),
        "sponsor": sponsor_module.get("leadSponsor", {}).get("name"),
        "interventions": interventions,
        "conditions": conditions_module.get("conditions", []),
        "eligibility_criteria": eligibility_module.get("eligibilityCriteria"),
        "biomarker_requirements": None,  # Future enhancement: parse from eligibility
        "primary_completion_date": completion_date,
        "locations": locations,
        "contact_info": contact_info,
        "study_url": f"https://clinicaltrials.gov/study/{nct_id}",
    }


def ingest_trials():
    """Main function to ingest all NSCLC trials"""
    # Import model here to avoid circular imports
    from backend.app.models import ClinicalTrial
    from backend.app.database import Base

    Base.metadata.create_all(bind=engine)

    session = Session()
    total_ingested = 0
    total_updated = 0
    page_token = None

    print("Starting NSCLC trials ingestion from ClinicalTrials.gov...")

    try:
        while True:
            print(f"Fetching page (token: {page_token})...")
            data = fetch_trials(page_token=page_token)

            studies = data.get("studies", [])
            if not studies:
                break

            for study in studies:
                trial_data = parse_trial(study)

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
            print(f"Processed {len(studies)} studies. Total new: {total_ingested}, updated: {total_updated}")

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


if __name__ == "__main__":
    ingest_trials()
