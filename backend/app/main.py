import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import treatments, trials, centers, search, match, competitor

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Weirwood API",
    description="NSCLC Treatment & Trial Discovery Platform",
    version="1.0.0",
)

# CORS middleware for frontend
# Allow origins from environment variable (comma-separated) or defaults
cors_origins_env = os.getenv("CORS_ORIGINS", "")
cors_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
if cors_origins_env:
    cors_origins.extend([origin.strip() for origin in cors_origins_env.split(",")])

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(treatments.router)
app.include_router(trials.router)
app.include_router(centers.router)
app.include_router(search.router)
app.include_router(match.router)
app.include_router(competitor.router)


@app.get("/")
def root():
    return {
        "name": "Weirwood API",
        "version": "1.0.0",
        "description": "NSCLC Treatment & Trial Discovery Platform",
        "endpoints": {
            "treatments": "/treatments",
            "trials": "/trials",
            "centers": "/centers",
            "search": "/search",
            "match": "/match",
            "competitor": "/competitor",
            "docs": "/docs",
        },
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}
