from sqlalchemy import Column, Integer, String, Text, Date, DateTime, DECIMAL, ARRAY
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func
from app.database import Base


class Treatment(Base):
    __tablename__ = "treatments"

    id = Column(Integer, primary_key=True, index=True)
    generic_name = Column(String(255), nullable=False, index=True)
    brand_names = Column(ARRAY(Text))
    drug_class = Column(String(100), index=True)
    mechanism_of_action = Column(Text)
    fda_approval_status = Column(String(50))
    fda_approval_date = Column(Date)
    approved_indications = Column(ARRAY(Text))
    biomarker_requirements = Column(JSONB)
    common_side_effects = Column(ARRAY(Text))
    manufacturer = Column(String(255))
    source_urls = Column(JSONB)
    last_updated = Column(DateTime, server_default=func.now(), onupdate=func.now())


class ClinicalTrial(Base):
    __tablename__ = "clinical_trials"

    id = Column(Integer, primary_key=True, index=True)
    nct_id = Column(String(20), unique=True, nullable=False, index=True)
    title = Column(Text)
    brief_summary = Column(Text)
    phase = Column(String(20), index=True)
    status = Column(String(50), index=True)
    sponsor = Column(String(255))
    interventions = Column(JSONB)
    conditions = Column(ARRAY(Text))
    eligibility_criteria = Column(Text)
    biomarker_requirements = Column(JSONB)
    primary_completion_date = Column(Date)
    locations = Column(JSONB)
    contact_info = Column(JSONB)
    study_url = Column(String(500))
    last_updated = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # NEW: Relevance classification for NSCLC specificity
    nsclc_relevance = Column(String(20), index=True)  # nsclc_specific, nsclc_primary, multi_cancer, solid_tumor
    relevance_score = Column(DECIMAL(3, 2))  # 0.00 to 1.00

    # NEW: Structured eligibility extracted from free text
    structured_eligibility = Column(JSONB)
    eligibility_extraction_version = Column(String(20))
    eligibility_extracted_at = Column(DateTime)


class CancerCenter(Base):
    __tablename__ = "cancer_centers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    address = Column(Text)
    city = Column(String(100), index=True)
    state = Column(String(50), index=True)
    country = Column(String(100), default="USA")
    lat = Column(DECIMAL(10, 8))
    lng = Column(DECIMAL(11, 8))
    nci_designation = Column(String(50), index=True)
    us_news_rank = Column(Integer)
    academic_affiliation = Column(String(255))
    website = Column(String(500))
    phone = Column(String(50))
    specialties = Column(ARRAY(Text))
    active_nsclc_trials = Column(Integer)
    source_urls = Column(JSONB)
    last_updated = Column(DateTime, server_default=func.now(), onupdate=func.now())
