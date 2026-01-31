# Weirwood - NSCLC Treatment & Trial Discovery Platform

A searchable dashboard that aggregates all NSCLC (Non-Small Cell Lung Cancer) treatments, active clinical trials, and cancer center quality data in one place.

## Overview

Weirwood aims to build a comprehensive, trustworthy database of NSCLC treatment options. This MVP focuses on data aggregation, search, and dashboard functionality.

### Features

- **Treatments Dashboard**: Browse 30+ FDA-approved NSCLC treatments including targeted therapies, immunotherapies, and chemotherapy
- **Clinical Trials**: Search 1000+ actively recruiting NSCLC trials with filters for phase, location, and biomarker requirements
- **Cancer Centers**: Explore 70+ NCI-designated cancer centers and top-ranked hospitals
- **Unified Search**: Search across all categories with typeahead suggestions

## Tech Stack

| Component | Technology |
|-----------|------------|
| Database | PostgreSQL (Supabase) |
| Backend | FastAPI (Python) |
| Frontend | Next.js 14 |
| Styling | Tailwind CSS |

## Project Structure

```
cancer_matching_engine/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app
│   │   ├── models.py            # SQLAlchemy models
│   │   ├── schemas.py           # Pydantic schemas
│   │   ├── database.py          # DB connection
│   │   └── routers/
│   │       ├── treatments.py
│   │       ├── trials.py
│   │       ├── centers.py
│   │       └── search.py
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── app/                 # Next.js app router
│   │   ├── components/          # React components
│   │   └── lib/                 # API client
│   ├── package.json
│   └── Dockerfile
├── scripts/
│   ├── ingest_trials.py         # ClinicalTrials.gov ingestion
│   ├── ingest_treatments.py     # OpenFDA ingestion
│   └── seed_centers.py          # NCI centers seed data
└── README.md
```

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 20+
- Supabase project (database is already populated)

### Backend Setup

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Create .env file with your Supabase connection string
echo 'DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres' > .env

# Run the server
uvicorn app.main:app --reload
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run the development server
npm run dev
```

### Access the Application
- Frontend: http://localhost:3000
- API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## API Endpoints

### Treatments
- `GET /treatments` - List treatments with filters (drug_class, biomarker, fda_status, search)
- `GET /treatments/{id}` - Get treatment details
- `GET /treatments/classes/list` - List all drug classes

### Clinical Trials
- `GET /trials` - List trials with filters (phase, status, state, sponsor, biomarker, search)
- `GET /trials/{nct_id}` - Get trial details
- `GET /trials/phases/list` - List all trial phases
- `GET /trials/statuses/list` - List all trial statuses
- `GET /trials/locations` - Get trial locations for map display

### Cancer Centers
- `GET /centers` - List centers with filters (state, nci_designation, specialty, search)
- `GET /centers/{id}` - Get center details
- `GET /centers/states/list` - List all states
- `GET /centers/designations/list` - List all NCI designations
- `GET /centers/locations` - Get center locations for map display

### Search
- `GET /search?q={query}` - Unified search across all categories
- `GET /search/suggest?q={query}` - Typeahead suggestions

## Data Sources

| Data Type | Source | Refresh Frequency |
|-----------|--------|-------------------|
| Clinical Trials | ClinicalTrials.gov API | Daily |
| Treatments | OpenFDA API | Weekly |
| Cancer Centers | NCI (static list) | Monthly |

## Environment Variables

### Backend
- `DATABASE_URL` - Supabase PostgreSQL connection string

### Frontend
- `NEXT_PUBLIC_API_URL` - Backend API URL (default: `http://localhost:8000`)

## Data Refresh

To refresh data from external sources, set `DATABASE_URL` and run:

```bash
# Refresh trials (daily)
python scripts/ingest_trials.py

# Refresh treatments (weekly)
python scripts/ingest_treatments.py

# Refresh centers (manually as needed)
python scripts/seed_centers.py
```

## License

MIT
