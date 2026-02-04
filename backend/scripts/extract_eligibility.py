#!/usr/bin/env python3
"""
Eligibility Extraction Script (Parallel Version)

Extracts structured eligibility criteria from clinical trials using Claude AI
with concurrent processing for much faster throughput.

Usage:
    python scripts/extract_eligibility.py --force-all
    python scripts/extract_eligibility.py --force-all --workers 20
"""

import argparse
import asyncio
import sys
import time
import json
import os
from datetime import datetime
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed

# Add the backend directory to the path
sys.path.insert(0, str(Path(__file__).parent.parent))

from anthropic import Anthropic
from sqlalchemy import func, case
from app.database import SessionLocal, engine
from app.models import ClinicalTrial

# Initialize Anthropic client
client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
MODEL = "claude-sonnet-4-20250514"
EXTRACTION_VERSION = "2.0.0"

SYSTEM_PROMPT = """You are a clinical trial eligibility extraction system specializing in NSCLC (non-small cell lung cancer) trials.

Extract structured eligibility criteria from the provided text. Return a JSON object with these fields:

{
  "age": {"min": number or null, "max": number or null},
  "ecog": {"min": number (0-4) or null, "max": number (0-4) or null},
  "disease_stage": {
    "allowed": ["stage values that ARE allowed"],
    "excluded": ["stage values that are NOT allowed"]
  },
  "histology": {
    "allowed": ["histology types that ARE allowed"],
    "excluded": ["histology types that are NOT allowed"]
  },
  "biomarkers": {
    "required_positive": {"BIOMARKER_NAME": ["specific_mutations"] or ["positive"]},
    "required_negative": ["biomarkers that must be negative/wild-type"],
    "pdl1_expression": {"min_tps": number, "max_tps": number, "level": "high/low/any"} or null
  },
  "prior_treatments": {
    "required": ["treatments patient MUST have had"],
    "excluded": ["treatments patient must NOT have had"],
    "max_lines": number or null,
    "min_lines": number or null,
    "treatment_naive_required": boolean
  },
  "brain_metastases": {
    "allowed": boolean,
    "controlled_only": boolean,
    "untreated_allowed": boolean
  },
  "organ_function": {
    "renal_exclusion": boolean,
    "hepatic_exclusion": boolean,
    "creatinine_max": number or null,
    "bilirubin_max": number or null,
    "notes": string or null
  },
  "prior_malignancy": {
    "excluded": boolean,
    "years_lookback": number or null,
    "exceptions": ["list of exceptions"]
  },
  "washout": {
    "min_days_since_chemo": number or null,
    "min_days_since_radiation": number or null,
    "min_days_since_surgery": number or null,
    "min_days_since_immunotherapy": number or null,
    "general_min_days": number or null
  },
  "common_exclusions": ["pregnancy", "active infection", etc.],
  "extraction_confidence": float 0-1,
  "extraction_notes": ["notes about uncertain extractions"]
}

Guidelines:
- ONLY extract what is EXPLICITLY stated
- Use null for fields not mentioned
- Convert weeks to days for washout (4 weeks = 28 days)
- Set extraction_confidence 0.9+ for clear criteria, 0.5-0.8 for ambiguous

Return ONLY valid JSON, no other text."""


def parse_args():
    parser = argparse.ArgumentParser(description="Extract eligibility (parallel)")
    parser.add_argument("--force-all", action="store_true", help="Re-extract all trials")
    parser.add_argument("--limit", type=int, default=None, help="Max trials to process")
    parser.add_argument("--workers", type=int, default=15, help="Parallel workers (default: 15)")
    parser.add_argument("--dry-run", action="store_true", help="Preview without changes")
    return parser.parse_args()


def get_trials_to_process(force_all: bool, limit: int | None):
    """Get trials that need eligibility extraction."""
    db = SessionLocal()
    try:
        query = db.query(
            ClinicalTrial.id,
            ClinicalTrial.nct_id,
            ClinicalTrial.title,
            ClinicalTrial.eligibility_criteria
        ).filter(
            ClinicalTrial.eligibility_criteria.isnot(None),
            func.length(ClinicalTrial.eligibility_criteria) > 50,
        )

        if not force_all:
            query = query.filter(
                (ClinicalTrial.structured_eligibility.is_(None)) |
                (ClinicalTrial.eligibility_extraction_version != EXTRACTION_VERSION)
            )

        if limit:
            query = query.limit(limit)

        return query.all()
    finally:
        db.close()


def extract_single(trial_data) -> dict:
    """Extract eligibility for a single trial (runs in thread)."""
    trial_id, nct_id, title, eligibility_text = trial_data

    result = {
        "id": trial_id,
        "nct_id": nct_id,
        "success": False,
        "extracted": None,
    }

    try:
        user_message = f"""Extract structured eligibility from this clinical trial:

{f'Trial: {title}' if title else ''}

Eligibility Criteria:
{eligibility_text}

Return only the JSON object."""

        response = client.messages.create(
            model=MODEL,
            max_tokens=2048,
            system=SYSTEM_PROMPT,
            messages=[{"role": "user", "content": user_message}]
        )

        content = response.content[0].text.strip()

        # Parse JSON - handle potential markdown code blocks
        if content.startswith("```"):
            lines = content.split("\n")
            content = "\n".join(lines[1:-1] if lines[-1] == "```" else lines[1:])

        extracted = json.loads(content)
        result["success"] = True
        result["extracted"] = extracted
        result["confidence"] = extracted.get("extraction_confidence", 0.5)

    except Exception as e:
        result["error"] = str(e)

    return result


def update_trials_batch(results: list[dict]):
    """Update database with extraction results."""
    db = SessionLocal()
    try:
        for result in results:
            if result["success"]:
                db.query(ClinicalTrial).filter(
                    ClinicalTrial.id == result["id"]
                ).update({
                    "structured_eligibility": result["extracted"],
                    "eligibility_extraction_version": EXTRACTION_VERSION,
                    "eligibility_extracted_at": datetime.utcnow(),
                })
        db.commit()
    finally:
        db.close()


def main():
    args = parse_args()

    print(f"Eligibility Extraction Script v{EXTRACTION_VERSION} (Parallel)")
    print("=" * 60)

    # Get trials to process
    print("\nFinding trials to process...")
    trials = get_trials_to_process(force_all=args.force_all, limit=args.limit)
    total = len(trials)

    if total == 0:
        print("No trials need processing.")
        return

    print(f"Found {total} trials to process")
    print(f"Workers: {args.workers}")

    if args.dry_run:
        print("DRY RUN - No changes will be made\n")

    # Estimate
    estimated_time = (total / args.workers) * 2  # ~2 sec per request with parallel
    print(f"Estimated time: {estimated_time/60:.1f} minutes")
    print(f"Estimated cost: ${total * 0.003 * 2:.2f}")

    if not args.dry_run:
        confirm = input("\nProceed? (y/N): ")
        if confirm.lower() != 'y':
            print("Aborted.")
            return

    # Process with thread pool
    start_time = time.time()
    successes = 0
    failures = 0
    batch_results = []
    batch_size = 50  # Commit every 50 trials

    print(f"\nProcessing...")

    with ThreadPoolExecutor(max_workers=args.workers) as executor:
        futures = {executor.submit(extract_single, t): t for t in trials}

        for i, future in enumerate(as_completed(futures), 1):
            result = future.result()

            if result["success"]:
                successes += 1
                status = f"OK ({result.get('confidence', 0):.2f})"
            else:
                failures += 1
                status = f"FAIL: {result.get('error', 'Unknown')[:50]}"

            print(f"[{i}/{total}] {result['nct_id']}: {status}")

            if not args.dry_run:
                batch_results.append(result)

                # Commit batch
                if len(batch_results) >= batch_size:
                    update_trials_batch(batch_results)
                    print(f"         [Committed {len(batch_results)} trials]")
                    batch_results = []

    # Final batch
    if not args.dry_run and batch_results:
        update_trials_batch(batch_results)
        print(f"         [Committed final {len(batch_results)} trials]")

    # Summary
    elapsed = time.time() - start_time
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"Total: {total} | Success: {successes} | Failed: {failures}")
    print(f"Time: {elapsed:.1f}s ({elapsed/60:.1f} min)")
    print(f"Speed: {total/elapsed:.1f} trials/sec")

    if args.dry_run:
        print("\n(Dry run - no changes were made)")


if __name__ == "__main__":
    main()
