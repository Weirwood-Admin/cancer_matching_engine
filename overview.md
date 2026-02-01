# Weirwood Overview

## The Problem

Patients diagnosed with Non-Small Cell Lung Cancer (NSCLC) face a fragmented information landscape. Treatment options, clinical trials, and specialist cancer centers are scattered across dozens of websites with inconsistent formats and outdated information. Patients and caregivers spend hours searching ClinicalTrials.gov, FDA databases, and hospital websites trying to understand their options.

**Key pain points:**
- No single source aggregates FDA-approved treatments, active trials, and top cancer centers
- Clinical trial eligibility criteria are buried in dense medical text
- Finding trials by location or biomarker requirement requires manual filtering across multiple sites
- Cancer center quality data is spread across US News rankings, NCI designations, and hospital websites

## The Solution

Weirwood is a unified search and discovery platform that aggregates:

1. **32 FDA-approved NSCLC treatments** - Targeted therapies (EGFR, ALK, KRAS inhibitors), immunotherapies (PD-1/PD-L1), and chemotherapy options with biomarker requirements and side effect profiles

2. **1,000+ active clinical trials** - Pulled daily from ClinicalTrials.gov with filters for phase, recruiting status, and location

3. **43 NCI-designated cancer centers** - Top-ranked facilities with specialties, contact info, and geographic data

Users can search across all categories, filter by relevant criteria, and access detailed information in a clean, readable format.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Database | PostgreSQL (Supabase) |
| Backend | Python 3.11 + FastAPI |
| Frontend | Next.js 14 + Tailwind CSS |
| Data Sources | ClinicalTrials.gov API, OpenFDA API, NCI |

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Next.js App   │────▶│   FastAPI API   │────▶│    Supabase     │
│   (Port 3000)   │     │   (Port 8000)   │     │   PostgreSQL    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        ▲
                                                        │
                              ┌──────────────────────────┤
                              │                          │
                    ┌─────────┴───────┐      ┌──────────┴────────┐
                    │ ClinicalTrials  │      │     OpenFDA       │
                    │   .gov API      │      │       API         │
                    └─────────────────┘      └───────────────────┘
```

## Data Models

**Treatments**: Generic/brand names, drug class, mechanism of action, FDA status, biomarker requirements, side effects, manufacturer

**Clinical Trials**: NCT ID, title, phase, status, sponsor, interventions, eligibility criteria, locations (with geocoding), contact info

**Cancer Centers**: Name, location, NCI designation, US News rank, academic affiliation, specialties

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /treatments` | List treatments with filters |
| `GET /trials` | List trials with filters |
| `GET /centers` | List cancer centers with filters |
| `GET /search?q=` | Unified search across all entities |

All list endpoints support pagination and return consistent response format:
```json
{
  "items": [...],
  "total": 100,
  "page": 1,
  "page_size": 20,
  "total_pages": 5
}
```

## Data Refresh

| Data | Frequency | Method |
|------|-----------|--------|
| Clinical Trials | Daily | ClinicalTrials.gov API |
| Treatments | Weekly | OpenFDA API + manual review |
| Cancer Centers | Monthly | Manual updates |

## Current Limitations (MVP Scope)

- No user accounts or saved searches
- No biomarker-based personalized matching
- US trials only
- No PDF parsing or health record integration
- Center quality based on designations only (no patient reviews)

## Future Roadmap

1. Biomarker-based trial matching
2. User accounts with saved searches and alerts
3. International trial coverage
4. Integration with patient health records
5. AI-powered eligibility screening
