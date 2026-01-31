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
| Database | PostgreSQL |
| Backend | FastAPI (Python) |
| Frontend | Next.js 14 |
| Styling | Tailwind CSS |
| Hosting | Docker / Vercel + Railway |

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
│   ├── seed_centers.py          # NCI centers seed data
│   └── requirements.txt
├── docker-compose.yml
└── README.md
```

## Quick Start

### Using Docker (Recommended)

1. **Start all services**:
   ```bash
   docker-compose up -d
   ```

2. **Run data ingestion scripts** (first time only):
   ```bash
   # Install script dependencies
   pip install -r scripts/requirements.txt

   # Seed cancer centers
   python scripts/seed_centers.py

   # Ingest treatments from OpenFDA
   python scripts/ingest_treatments.py

   # Ingest trials from ClinicalTrials.gov (takes a few minutes)
   python scripts/ingest_trials.py
   ```

3. **Access the application**:
   - Frontend: http://localhost:3000
   - API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

### Manual Setup

#### Prerequisites
- Python 3.11+
- Node.js 20+
- PostgreSQL 15+

#### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/weirwood"

# Run the server
uvicorn app.main:app --reload
```

#### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Set environment variables
export NEXT_PUBLIC_API_URL="http://localhost:8000"

# Run the development server
npm run dev
```

#### Database Setup

```bash
# Create the database
createdb weirwood

# Tables are created automatically when the backend starts
```

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
- `DATABASE_URL` - PostgreSQL connection string (default: `postgresql://postgres:postgres@localhost:5432/weirwood`)

### Frontend
- `NEXT_PUBLIC_API_URL` - Backend API URL (default: `http://localhost:8000`)

## Development

### Running Tests
```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

### Code Formatting
```bash
# Backend
cd backend
black .
ruff check .

# Frontend
cd frontend
npm run lint
```

## Data Refresh

To refresh data from external sources:

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
