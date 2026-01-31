#!/usr/bin/env python3
"""
Seed NCI-designated cancer centers data
"""

import os
import sys

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

# NCI-Designated Cancer Centers (as of 2024)
# Source: https://www.cancer.gov/research/infrastructure/cancer-centers
NCI_CENTERS = [
    {
        "name": "MD Anderson Cancer Center",
        "city": "Houston",
        "state": "TX",
        "nci_designation": "Comprehensive",
        "academic_affiliation": "University of Texas",
        "website": "https://www.mdanderson.org",
        "lat": 29.7078,
        "lng": -95.3979,
        "us_news_rank": 1,
        "specialties": ["Lung Cancer", "Immunotherapy", "Clinical Trials"],
    },
    {
        "name": "Memorial Sloan Kettering Cancer Center",
        "city": "New York",
        "state": "NY",
        "nci_designation": "Comprehensive",
        "academic_affiliation": None,
        "website": "https://www.mskcc.org",
        "lat": 40.7644,
        "lng": -73.9566,
        "us_news_rank": 2,
        "specialties": ["Lung Cancer", "Precision Medicine", "Clinical Trials"],
    },
    {
        "name": "Mayo Clinic Cancer Center",
        "city": "Rochester",
        "state": "MN",
        "nci_designation": "Comprehensive",
        "academic_affiliation": "Mayo Clinic",
        "website": "https://www.mayoclinic.org/departments-centers/mayo-clinic-cancer-center",
        "lat": 44.0225,
        "lng": -92.4669,
        "us_news_rank": 3,
        "specialties": ["Lung Cancer", "Thoracic Oncology", "Clinical Trials"],
    },
    {
        "name": "Dana-Farber Cancer Institute",
        "city": "Boston",
        "state": "MA",
        "nci_designation": "Comprehensive",
        "academic_affiliation": "Harvard Medical School",
        "website": "https://www.dana-farber.org",
        "lat": 42.3376,
        "lng": -71.1059,
        "us_news_rank": 4,
        "specialties": ["Lung Cancer", "Immunotherapy", "Targeted Therapy"],
    },
    {
        "name": "Cleveland Clinic Taussig Cancer Institute",
        "city": "Cleveland",
        "state": "OH",
        "nci_designation": "Comprehensive",
        "academic_affiliation": "Cleveland Clinic",
        "website": "https://my.clevelandclinic.org/departments/cancer",
        "lat": 41.5029,
        "lng": -81.6211,
        "us_news_rank": 5,
        "specialties": ["Lung Cancer", "Thoracic Surgery", "Clinical Trials"],
    },
    {
        "name": "Johns Hopkins Sidney Kimmel Comprehensive Cancer Center",
        "city": "Baltimore",
        "state": "MD",
        "nci_designation": "Comprehensive",
        "academic_affiliation": "Johns Hopkins University",
        "website": "https://www.hopkinsmedicine.org/kimmel_cancer_center",
        "lat": 39.2967,
        "lng": -76.5928,
        "us_news_rank": 6,
        "specialties": ["Lung Cancer", "Immunotherapy", "Precision Medicine"],
    },
    {
        "name": "UCSF Helen Diller Family Comprehensive Cancer Center",
        "city": "San Francisco",
        "state": "CA",
        "nci_designation": "Comprehensive",
        "academic_affiliation": "University of California, San Francisco",
        "website": "https://cancer.ucsf.edu",
        "lat": 37.7631,
        "lng": -122.4576,
        "us_news_rank": 7,
        "specialties": ["Lung Cancer", "Clinical Trials", "Targeted Therapy"],
    },
    {
        "name": "UCLA Jonsson Comprehensive Cancer Center",
        "city": "Los Angeles",
        "state": "CA",
        "nci_designation": "Comprehensive",
        "academic_affiliation": "University of California, Los Angeles",
        "website": "https://cancer.ucla.edu",
        "lat": 34.0661,
        "lng": -118.4456,
        "us_news_rank": 8,
        "specialties": ["Lung Cancer", "Immunotherapy", "Clinical Trials"],
    },
    {
        "name": "Northwestern Medicine Robert H. Lurie Comprehensive Cancer Center",
        "city": "Chicago",
        "state": "IL",
        "nci_designation": "Comprehensive",
        "academic_affiliation": "Northwestern University",
        "website": "https://cancer.northwestern.edu",
        "lat": 41.8969,
        "lng": -87.6193,
        "us_news_rank": 9,
        "specialties": ["Lung Cancer", "Thoracic Oncology", "Clinical Trials"],
    },
    {
        "name": "University of Pennsylvania Abramson Cancer Center",
        "city": "Philadelphia",
        "state": "PA",
        "nci_designation": "Comprehensive",
        "academic_affiliation": "University of Pennsylvania",
        "website": "https://www.pennmedicine.org/cancer",
        "lat": 39.9493,
        "lng": -75.1936,
        "us_news_rank": 10,
        "specialties": ["Lung Cancer", "CAR-T Therapy", "Immunotherapy"],
    },
    {
        "name": "Stanford Cancer Institute",
        "city": "Palo Alto",
        "state": "CA",
        "nci_designation": "Comprehensive",
        "academic_affiliation": "Stanford University",
        "website": "https://cancer.stanford.edu",
        "lat": 37.4332,
        "lng": -122.1747,
        "us_news_rank": 11,
        "specialties": ["Lung Cancer", "Precision Medicine", "Clinical Trials"],
    },
    {
        "name": "Fred Hutchinson Cancer Center",
        "city": "Seattle",
        "state": "WA",
        "nci_designation": "Comprehensive",
        "academic_affiliation": "University of Washington",
        "website": "https://www.fredhutch.org",
        "lat": 47.6275,
        "lng": -122.3390,
        "us_news_rank": 12,
        "specialties": ["Lung Cancer", "Immunotherapy", "Clinical Trials"],
    },
    {
        "name": "Duke Cancer Institute",
        "city": "Durham",
        "state": "NC",
        "nci_designation": "Comprehensive",
        "academic_affiliation": "Duke University",
        "website": "https://www.dukecancerinstitute.org",
        "lat": 36.0079,
        "lng": -78.9420,
        "us_news_rank": 13,
        "specialties": ["Lung Cancer", "Clinical Trials", "Thoracic Surgery"],
    },
    {
        "name": "Moffitt Cancer Center",
        "city": "Tampa",
        "state": "FL",
        "nci_designation": "Comprehensive",
        "academic_affiliation": "University of South Florida",
        "website": "https://moffitt.org",
        "lat": 28.0653,
        "lng": -82.4299,
        "us_news_rank": 14,
        "specialties": ["Lung Cancer", "Immunotherapy", "Clinical Trials"],
    },
    {
        "name": "University of Michigan Rogel Cancer Center",
        "city": "Ann Arbor",
        "state": "MI",
        "nci_designation": "Comprehensive",
        "academic_affiliation": "University of Michigan",
        "website": "https://www.rogelcancercenter.org",
        "lat": 42.2841,
        "lng": -83.7262,
        "us_news_rank": 15,
        "specialties": ["Lung Cancer", "Clinical Trials", "Precision Medicine"],
    },
    {
        "name": "City of Hope Comprehensive Cancer Center",
        "city": "Duarte",
        "state": "CA",
        "nci_designation": "Comprehensive",
        "academic_affiliation": None,
        "website": "https://www.cityofhope.org",
        "lat": 34.1328,
        "lng": -117.9728,
        "us_news_rank": 16,
        "specialties": ["Lung Cancer", "CAR-T Therapy", "Clinical Trials"],
    },
    {
        "name": "Vanderbilt-Ingram Cancer Center",
        "city": "Nashville",
        "state": "TN",
        "nci_designation": "Comprehensive",
        "academic_affiliation": "Vanderbilt University",
        "website": "https://www.vicc.org",
        "lat": 36.1418,
        "lng": -86.8024,
        "us_news_rank": 17,
        "specialties": ["Lung Cancer", "Immunotherapy", "Clinical Trials"],
    },
    {
        "name": "Ohio State University Comprehensive Cancer Center",
        "city": "Columbus",
        "state": "OH",
        "nci_designation": "Comprehensive",
        "academic_affiliation": "Ohio State University",
        "website": "https://cancer.osu.edu",
        "lat": 39.9945,
        "lng": -83.0194,
        "us_news_rank": 18,
        "specialties": ["Lung Cancer", "Clinical Trials", "Immunotherapy"],
    },
    {
        "name": "University of Colorado Cancer Center",
        "city": "Aurora",
        "state": "CO",
        "nci_designation": "Comprehensive",
        "academic_affiliation": "University of Colorado",
        "website": "https://www.coloradocancercenter.org",
        "lat": 39.7470,
        "lng": -104.8386,
        "us_news_rank": 19,
        "specialties": ["Lung Cancer", "Clinical Trials", "Thoracic Oncology"],
    },
    {
        "name": "Yale Cancer Center",
        "city": "New Haven",
        "state": "CT",
        "nci_designation": "Comprehensive",
        "academic_affiliation": "Yale University",
        "website": "https://www.yalecancercenter.org",
        "lat": 41.3039,
        "lng": -72.9345,
        "us_news_rank": 20,
        "specialties": ["Lung Cancer", "Immunotherapy", "Clinical Trials"],
    },
    {
        "name": "Siteman Cancer Center",
        "city": "St. Louis",
        "state": "MO",
        "nci_designation": "Comprehensive",
        "academic_affiliation": "Washington University",
        "website": "https://siteman.wustl.edu",
        "lat": 38.6350,
        "lng": -90.2623,
        "us_news_rank": 21,
        "specialties": ["Lung Cancer", "Clinical Trials", "Precision Medicine"],
    },
    {
        "name": "Huntsman Cancer Institute",
        "city": "Salt Lake City",
        "state": "UT",
        "nci_designation": "Comprehensive",
        "academic_affiliation": "University of Utah",
        "website": "https://healthcare.utah.edu/huntsmancancerinstitute",
        "lat": 40.7707,
        "lng": -111.8373,
        "us_news_rank": 22,
        "specialties": ["Lung Cancer", "Genetics", "Clinical Trials"],
    },
    {
        "name": "Roswell Park Comprehensive Cancer Center",
        "city": "Buffalo",
        "state": "NY",
        "nci_designation": "Comprehensive",
        "academic_affiliation": "University at Buffalo",
        "website": "https://www.roswellpark.org",
        "lat": 42.9012,
        "lng": -78.8582,
        "us_news_rank": 23,
        "specialties": ["Lung Cancer", "Immunotherapy", "Clinical Trials"],
    },
    {
        "name": "University of Wisconsin Carbone Cancer Center",
        "city": "Madison",
        "state": "WI",
        "nci_designation": "Comprehensive",
        "academic_affiliation": "University of Wisconsin",
        "website": "https://www.uwhealth.org/cancer",
        "lat": 43.0758,
        "lng": -89.4293,
        "us_news_rank": 24,
        "specialties": ["Lung Cancer", "Clinical Trials", "Radiation Oncology"],
    },
    {
        "name": "UC San Diego Moores Cancer Center",
        "city": "La Jolla",
        "state": "CA",
        "nci_designation": "Comprehensive",
        "academic_affiliation": "University of California, San Diego",
        "website": "https://cancer.ucsd.edu",
        "lat": 32.8756,
        "lng": -117.2369,
        "us_news_rank": 25,
        "specialties": ["Lung Cancer", "Precision Medicine", "Clinical Trials"],
    },
    {
        "name": "Winship Cancer Institute of Emory University",
        "city": "Atlanta",
        "state": "GA",
        "nci_designation": "Comprehensive",
        "academic_affiliation": "Emory University",
        "website": "https://www.winshipcancer.emory.edu",
        "lat": 33.7932,
        "lng": -84.3228,
        "us_news_rank": 26,
        "specialties": ["Lung Cancer", "Immunotherapy", "Clinical Trials"],
    },
    {
        "name": "University of Virginia Cancer Center",
        "city": "Charlottesville",
        "state": "VA",
        "nci_designation": "Comprehensive",
        "academic_affiliation": "University of Virginia",
        "website": "https://uvahealth.com/services/cancer",
        "lat": 38.0324,
        "lng": -78.5014,
        "us_news_rank": 27,
        "specialties": ["Lung Cancer", "Clinical Trials", "Thoracic Surgery"],
    },
    {
        "name": "UNC Lineberger Comprehensive Cancer Center",
        "city": "Chapel Hill",
        "state": "NC",
        "nci_designation": "Comprehensive",
        "academic_affiliation": "University of North Carolina",
        "website": "https://unclineberger.org",
        "lat": 35.9069,
        "lng": -79.0558,
        "us_news_rank": 28,
        "specialties": ["Lung Cancer", "Clinical Trials", "Precision Medicine"],
    },
    {
        "name": "Case Comprehensive Cancer Center",
        "city": "Cleveland",
        "state": "OH",
        "nci_designation": "Comprehensive",
        "academic_affiliation": "Case Western Reserve University",
        "website": "https://case.edu/cancer",
        "lat": 41.5044,
        "lng": -81.6085,
        "us_news_rank": 29,
        "specialties": ["Lung Cancer", "Clinical Trials", "Immunotherapy"],
    },
    {
        "name": "O'Neal Comprehensive Cancer Center at UAB",
        "city": "Birmingham",
        "state": "AL",
        "nci_designation": "Comprehensive",
        "academic_affiliation": "University of Alabama at Birmingham",
        "website": "https://www.uab.edu/onealcancercenter",
        "lat": 33.5025,
        "lng": -86.8035,
        "us_news_rank": 30,
        "specialties": ["Lung Cancer", "Clinical Trials", "Community Outreach"],
    },
    {
        "name": "Indiana University Melvin and Bren Simon Comprehensive Cancer Center",
        "city": "Indianapolis",
        "state": "IN",
        "nci_designation": "Comprehensive",
        "academic_affiliation": "Indiana University",
        "website": "https://cancer.iu.edu",
        "lat": 39.7796,
        "lng": -86.1784,
        "specialties": ["Lung Cancer", "Clinical Trials", "Precision Medicine"],
    },
    {
        "name": "Massey Cancer Center",
        "city": "Richmond",
        "state": "VA",
        "nci_designation": "Comprehensive",
        "academic_affiliation": "Virginia Commonwealth University",
        "website": "https://www.masseycancercenter.org",
        "lat": 37.5407,
        "lng": -77.4360,
        "specialties": ["Lung Cancer", "Clinical Trials", "Health Disparities"],
    },
    {
        "name": "Hollings Cancer Center",
        "city": "Charleston",
        "state": "SC",
        "nci_designation": "Comprehensive",
        "academic_affiliation": "Medical University of South Carolina",
        "website": "https://hollingscancercenter.org",
        "lat": 32.7858,
        "lng": -79.9523,
        "specialties": ["Lung Cancer", "Clinical Trials", "Immunotherapy"],
    },
    {
        "name": "UT Southwestern Harold C. Simmons Comprehensive Cancer Center",
        "city": "Dallas",
        "state": "TX",
        "nci_designation": "Comprehensive",
        "academic_affiliation": "UT Southwestern Medical Center",
        "website": "https://www.utsouthwestern.edu/departments/simmons",
        "lat": 32.8128,
        "lng": -96.8424,
        "specialties": ["Lung Cancer", "Clinical Trials", "Thoracic Oncology"],
    },
    {
        "name": "University of Arizona Cancer Center",
        "city": "Tucson",
        "state": "AZ",
        "nci_designation": "Comprehensive",
        "academic_affiliation": "University of Arizona",
        "website": "https://cancercenter.arizona.edu",
        "lat": 32.2398,
        "lng": -110.9463,
        "specialties": ["Lung Cancer", "Clinical Trials", "Prevention Research"],
    },
    {
        "name": "Robert H. Lurie Comprehensive Cancer Center",
        "city": "Chicago",
        "state": "IL",
        "nci_designation": "Comprehensive",
        "academic_affiliation": "Northwestern University",
        "website": "https://cancer.northwestern.edu",
        "lat": 41.8969,
        "lng": -87.6193,
        "specialties": ["Lung Cancer", "Clinical Trials", "Precision Medicine"],
    },
    {
        "name": "Herbert Irving Comprehensive Cancer Center",
        "city": "New York",
        "state": "NY",
        "nci_designation": "Comprehensive",
        "academic_affiliation": "Columbia University",
        "website": "https://www.cancer.columbia.edu",
        "lat": 40.8408,
        "lng": -73.9410,
        "specialties": ["Lung Cancer", "Clinical Trials", "Precision Medicine"],
    },
    {
        "name": "Perlmutter Cancer Center",
        "city": "New York",
        "state": "NY",
        "nci_designation": "Comprehensive",
        "academic_affiliation": "NYU Langone Health",
        "website": "https://nyulangone.org/locations/perlmutter-cancer-center",
        "lat": 40.7425,
        "lng": -73.9742,
        "specialties": ["Lung Cancer", "Clinical Trials", "Immunotherapy"],
    },
    {
        "name": "Sylvester Comprehensive Cancer Center",
        "city": "Miami",
        "state": "FL",
        "nci_designation": "Comprehensive",
        "academic_affiliation": "University of Miami",
        "website": "https://umiamihealth.org/sylvester-comprehensive-cancer-center",
        "lat": 25.7892,
        "lng": -80.2104,
        "specialties": ["Lung Cancer", "Clinical Trials", "Precision Medicine"],
    },
    {
        "name": "Stephenson Cancer Center",
        "city": "Oklahoma City",
        "state": "OK",
        "nci_designation": "Comprehensive",
        "academic_affiliation": "University of Oklahoma",
        "website": "https://stephensoncancercenter.org",
        "lat": 35.4842,
        "lng": -97.4951,
        "specialties": ["Lung Cancer", "Clinical Trials", "Community Outreach"],
    },
    {
        "name": "Sidney Kimmel Cancer Center at Jefferson",
        "city": "Philadelphia",
        "state": "PA",
        "nci_designation": "Cancer Center",
        "academic_affiliation": "Thomas Jefferson University",
        "website": "https://www.jeffersonhealth.org/cancer",
        "lat": 39.9489,
        "lng": -75.1570,
        "specialties": ["Lung Cancer", "Clinical Trials", "Radiation Oncology"],
    },
    {
        "name": "University of Kansas Cancer Center",
        "city": "Kansas City",
        "state": "KS",
        "nci_designation": "Comprehensive",
        "academic_affiliation": "University of Kansas",
        "website": "https://www.kucancercenter.org",
        "lat": 39.0563,
        "lng": -94.6087,
        "specialties": ["Lung Cancer", "Clinical Trials", "Prevention"],
    },
    {
        "name": "Wake Forest Baptist Comprehensive Cancer Center",
        "city": "Winston-Salem",
        "state": "NC",
        "nci_designation": "Comprehensive",
        "academic_affiliation": "Wake Forest University",
        "website": "https://www.wakehealth.edu/cancer",
        "lat": 36.0999,
        "lng": -80.2442,
        "specialties": ["Lung Cancer", "Clinical Trials", "Community Research"],
    },
    {
        "name": "Simmons Comprehensive Cancer Center",
        "city": "Dallas",
        "state": "TX",
        "nci_designation": "Comprehensive",
        "academic_affiliation": "UT Southwestern",
        "website": "https://www.utsouthwestern.edu/departments/simmons",
        "lat": 32.8128,
        "lng": -96.8424,
        "specialties": ["Lung Cancer", "Clinical Trials", "Translational Research"],
    },
    {
        "name": "Chao Family Comprehensive Cancer Center",
        "city": "Orange",
        "state": "CA",
        "nci_designation": "Comprehensive",
        "academic_affiliation": "UC Irvine",
        "website": "https://www.cancer.uci.edu",
        "lat": 33.7883,
        "lng": -117.8531,
        "specialties": ["Lung Cancer", "Clinical Trials", "Precision Medicine"],
    },
]


def seed_centers():
    """Main function to seed cancer centers"""
    from backend.app.models import CancerCenter
    from backend.app.database import Base

    Base.metadata.create_all(bind=engine)

    session = Session()
    total_added = 0
    total_updated = 0

    print("Seeding NCI-designated cancer centers...")

    try:
        for center_data in NCI_CENTERS:
            # Check if center already exists
            existing = (
                session.query(CancerCenter)
                .filter(CancerCenter.name == center_data["name"])
                .first()
            )

            if existing:
                # Update existing center
                for key, value in center_data.items():
                    setattr(existing, key, value)
                existing.source_urls = {
                    "nci": "https://www.cancer.gov/research/infrastructure/cancer-centers"
                }
                total_updated += 1
            else:
                # Create new center
                center = CancerCenter(
                    **center_data,
                    country="USA",
                    source_urls={
                        "nci": "https://www.cancer.gov/research/infrastructure/cancer-centers"
                    },
                )
                session.add(center)
                total_added += 1

        session.commit()

    except Exception as e:
        session.rollback()
        print(f"Error during seeding: {e}")
        raise
    finally:
        session.close()

    print(f"\nSeeding complete!")
    print(f"New centers: {total_added}")
    print(f"Updated centers: {total_updated}")


if __name__ == "__main__":
    seed_centers()
