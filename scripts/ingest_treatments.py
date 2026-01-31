#!/usr/bin/env python3
"""
Ingest NSCLC treatments from OpenFDA API
"""

import os
import sys
import httpx
from datetime import datetime

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

# OpenFDA API
OPENFDA_BASE = "https://api.fda.gov/drug/label.json"

# Known NSCLC drugs to search for (generic names)
NSCLC_DRUGS = [
    # EGFR inhibitors
    "erlotinib",
    "gefitinib",
    "afatinib",
    "osimertinib",
    "dacomitinib",
    "mobocertinib",
    # ALK inhibitors
    "crizotinib",
    "ceritinib",
    "alectinib",
    "brigatinib",
    "lorlatinib",
    # PD-1/PD-L1 inhibitors
    "pembrolizumab",
    "nivolumab",
    "atezolizumab",
    "durvalumab",
    "cemiplimab",
    # KRAS inhibitors
    "sotorasib",
    "adagrasib",
    # ROS1 inhibitors
    "entrectinib",
    # BRAF/MEK inhibitors
    "dabrafenib",
    "trametinib",
    # MET inhibitors
    "capmatinib",
    "tepotinib",
    # RET inhibitors
    "selpercatinib",
    "pralsetinib",
    # NTRK inhibitors
    "larotrectinib",
    # HER2 inhibitors
    "trastuzumab deruxtecan",
    # Chemotherapy
    "docetaxel",
    "pemetrexed",
    "paclitaxel",
    "gemcitabine",
    "vinorelbine",
    "carboplatin",
    "cisplatin",
]

# Drug class mapping
DRUG_CLASSES = {
    "erlotinib": "EGFR inhibitor",
    "gefitinib": "EGFR inhibitor",
    "afatinib": "EGFR inhibitor",
    "osimertinib": "EGFR inhibitor",
    "dacomitinib": "EGFR inhibitor",
    "mobocertinib": "EGFR inhibitor",
    "crizotinib": "ALK inhibitor",
    "ceritinib": "ALK inhibitor",
    "alectinib": "ALK inhibitor",
    "brigatinib": "ALK inhibitor",
    "lorlatinib": "ALK inhibitor",
    "pembrolizumab": "PD-1 inhibitor",
    "nivolumab": "PD-1 inhibitor",
    "atezolizumab": "PD-L1 inhibitor",
    "durvalumab": "PD-L1 inhibitor",
    "cemiplimab": "PD-1 inhibitor",
    "sotorasib": "KRAS G12C inhibitor",
    "adagrasib": "KRAS G12C inhibitor",
    "entrectinib": "ROS1/NTRK inhibitor",
    "dabrafenib": "BRAF inhibitor",
    "trametinib": "MEK inhibitor",
    "capmatinib": "MET inhibitor",
    "tepotinib": "MET inhibitor",
    "selpercatinib": "RET inhibitor",
    "pralsetinib": "RET inhibitor",
    "larotrectinib": "NTRK inhibitor",
    "trastuzumab deruxtecan": "HER2-targeted ADC",
    "docetaxel": "Chemotherapy (Taxane)",
    "pemetrexed": "Chemotherapy (Antifolate)",
    "paclitaxel": "Chemotherapy (Taxane)",
    "gemcitabine": "Chemotherapy (Antimetabolite)",
    "vinorelbine": "Chemotherapy (Vinca alkaloid)",
    "carboplatin": "Chemotherapy (Platinum)",
    "cisplatin": "Chemotherapy (Platinum)",
}

# Biomarker requirements
BIOMARKER_REQUIREMENTS = {
    "erlotinib": {"EGFR": ["exon 19 deletion", "L858R"]},
    "gefitinib": {"EGFR": ["exon 19 deletion", "L858R"]},
    "afatinib": {"EGFR": ["exon 19 deletion", "L858R"]},
    "osimertinib": {"EGFR": ["exon 19 deletion", "L858R", "T790M"]},
    "dacomitinib": {"EGFR": ["exon 19 deletion", "L858R"]},
    "mobocertinib": {"EGFR": ["exon 20 insertion"]},
    "crizotinib": {"ALK": ["rearrangement"], "ROS1": ["rearrangement"]},
    "ceritinib": {"ALK": ["rearrangement"]},
    "alectinib": {"ALK": ["rearrangement"]},
    "brigatinib": {"ALK": ["rearrangement"]},
    "lorlatinib": {"ALK": ["rearrangement"]},
    "pembrolizumab": {"PD-L1": ["TPS >= 1%"], "TMB": ["High (>=10 mut/Mb)"]},
    "sotorasib": {"KRAS": ["G12C"]},
    "adagrasib": {"KRAS": ["G12C"]},
    "entrectinib": {"ROS1": ["rearrangement"], "NTRK": ["fusion"]},
    "dabrafenib": {"BRAF": ["V600E"]},
    "trametinib": {"BRAF": ["V600E"]},
    "capmatinib": {"MET": ["exon 14 skipping"]},
    "tepotinib": {"MET": ["exon 14 skipping"]},
    "selpercatinib": {"RET": ["fusion"]},
    "pralsetinib": {"RET": ["fusion"]},
    "larotrectinib": {"NTRK": ["fusion"]},
    "trastuzumab deruxtecan": {"HER2": ["mutation", "amplification"]},
}


def fetch_drug_info(drug_name: str) -> dict | None:
    """Fetch drug information from OpenFDA"""
    params = {
        "search": f'openfda.generic_name:"{drug_name}"',
        "limit": 1,
    }

    try:
        response = httpx.get(OPENFDA_BASE, params=params, timeout=30.0)
        if response.status_code == 404:
            return None
        response.raise_for_status()
        data = response.json()
        if data.get("results"):
            return data["results"][0]
    except Exception as e:
        print(f"Error fetching {drug_name}: {e}")

    return None


def parse_drug(drug_name: str, fda_data: dict | None) -> dict:
    """Parse drug data from OpenFDA response"""
    openfda = fda_data.get("openfda", {}) if fda_data else {}

    # Extract brand names
    brand_names = openfda.get("brand_name", [])

    # Extract manufacturer
    manufacturer = None
    manufacturers = openfda.get("manufacturer_name", [])
    if manufacturers:
        manufacturer = manufacturers[0]

    # Extract mechanism of action
    mechanism = None
    if fda_data and fda_data.get("mechanism_of_action"):
        mechanism = fda_data["mechanism_of_action"][0] if isinstance(
            fda_data["mechanism_of_action"], list
        ) else fda_data["mechanism_of_action"]

    # Extract indications
    indications = []
    if fda_data and fda_data.get("indications_and_usage"):
        ind_text = fda_data["indications_and_usage"]
        if isinstance(ind_text, list):
            ind_text = ind_text[0]
        # Look for NSCLC-specific indications
        if "non-small cell lung cancer" in ind_text.lower() or "nsclc" in ind_text.lower():
            indications.append("NSCLC")

    # Extract side effects
    side_effects = []
    if fda_data and fda_data.get("adverse_reactions"):
        adv_text = fda_data["adverse_reactions"]
        if isinstance(adv_text, list):
            adv_text = adv_text[0]
        # Extract common side effects (simplified parsing)
        common_effects = [
            "nausea", "fatigue", "diarrhea", "rash", "vomiting",
            "decreased appetite", "cough", "dyspnea", "constipation",
            "pneumonitis", "hepatotoxicity", "pyrexia", "anemia"
        ]
        for effect in common_effects:
            if effect in adv_text.lower():
                side_effects.append(effect.title())

    return {
        "generic_name": drug_name.title(),
        "brand_names": brand_names[:5] if brand_names else None,  # Limit to 5
        "drug_class": DRUG_CLASSES.get(drug_name.lower()),
        "mechanism_of_action": mechanism,
        "fda_approval_status": "approved",
        "fda_approval_date": None,  # Would need additional API call
        "approved_indications": indications if indications else ["NSCLC"],
        "biomarker_requirements": BIOMARKER_REQUIREMENTS.get(drug_name.lower()),
        "common_side_effects": side_effects[:10] if side_effects else None,
        "manufacturer": manufacturer,
        "source_urls": {
            "openfda": f"https://api.fda.gov/drug/label.json?search=openfda.generic_name:{drug_name}",
        },
    }


def ingest_treatments():
    """Main function to ingest NSCLC treatments"""
    from backend.app.models import Treatment
    from backend.app.database import Base

    Base.metadata.create_all(bind=engine)

    session = Session()
    total_ingested = 0
    total_updated = 0

    print("Starting NSCLC treatments ingestion from OpenFDA...")

    try:
        for drug_name in NSCLC_DRUGS:
            print(f"Processing {drug_name}...")

            fda_data = fetch_drug_info(drug_name)
            treatment_data = parse_drug(drug_name, fda_data)

            # Check if treatment already exists
            existing = (
                session.query(Treatment)
                .filter(Treatment.generic_name.ilike(drug_name))
                .first()
            )

            if existing:
                # Update existing treatment
                for key, value in treatment_data.items():
                    if value is not None:  # Only update non-None values
                        setattr(existing, key, value)
                total_updated += 1
            else:
                # Create new treatment
                treatment = Treatment(**treatment_data)
                session.add(treatment)
                total_ingested += 1

        session.commit()

    except Exception as e:
        session.rollback()
        print(f"Error during ingestion: {e}")
        raise
    finally:
        session.close()

    print(f"\nIngestion complete!")
    print(f"New treatments: {total_ingested}")
    print(f"Updated treatments: {total_updated}")


if __name__ == "__main__":
    ingest_treatments()
