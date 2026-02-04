#!/usr/bin/env python3
"""
Batch extraction script for structured eligibility data.

Extracts structured eligibility from all trials that don't have it yet.
Rate-limited to avoid API rate limits.
"""

import os
import sys
import time
import argparse
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

# Rate limiting: requests per minute
REQUESTS_PER_MINUTE = 50
REQUEST_DELAY = 60.0 / REQUESTS_PER_MINUTE  # seconds between requests


def extract_all_eligibility(
    force: bool = False,
    limit: Optional[int] = None,
    batch_size: int = 50,
    relevance_filter: Optional[list[str]] = None
):
    """
    Extract structured eligibility for all trials.

    Args:
        force: If True, re-extract even if already extracted
        limit: Maximum number of trials to process
        batch_size: Number of trials to commit in each batch
        relevance_filter: Only process trials with these relevance categories
    """
    from backend.app.models import ClinicalTrial
    from backend.app.services.eligibility_extraction_service import (
        extract_eligibility,
        get_extraction_version
    )

    session = Session()
    current_version = get_extraction_version()

    print(f"Eligibility Extraction Script v{current_version}")
    print(f"Rate limit: {REQUESTS_PER_MINUTE} requests/minute")
    print("-" * 50)

    try:
        # Build query for trials needing extraction
        query = session.query(ClinicalTrial).filter(
            ClinicalTrial.eligibility_criteria.isnot(None),
            ClinicalTrial.eligibility_criteria != ""
        )

        if not force:
            # Only get trials without extraction or with older version
            query = query.filter(
                (ClinicalTrial.structured_eligibility.is_(None)) |
                (ClinicalTrial.eligibility_extraction_version != current_version)
            )

        if relevance_filter:
            query = query.filter(ClinicalTrial.nsclc_relevance.in_(relevance_filter))

        # Count total
        total_to_process = query.count()
        if limit:
            total_to_process = min(total_to_process, limit)

        print(f"Trials to process: {total_to_process}")

        if total_to_process == 0:
            print("No trials need eligibility extraction.")
            return

        # Get trials to process
        trials = query.limit(limit).all() if limit else query.all()

        processed = 0
        successful = 0
        failed = 0
        batch_count = 0

        start_time = time.time()

        for trial in trials:
            processed += 1
            batch_count += 1

            print(f"\n[{processed}/{total_to_process}] Processing {trial.nct_id}...")

            try:
                # Extract eligibility
                result = extract_eligibility(
                    eligibility_text=trial.eligibility_criteria,
                    trial_title=trial.title
                )

                # Update trial
                trial.structured_eligibility = result
                trial.eligibility_extraction_version = current_version
                trial.eligibility_extracted_at = datetime.utcnow()

                confidence = result.get("extraction_confidence", 0)
                print(f"  -> Extracted (confidence: {confidence:.2f})")
                successful += 1

            except Exception as e:
                print(f"  -> FAILED: {e}")
                failed += 1

            # Commit in batches
            if batch_count >= batch_size:
                session.commit()
                print(f"\n  Committed batch of {batch_count} trials")
                batch_count = 0

            # Rate limiting
            if processed < total_to_process:
                time.sleep(REQUEST_DELAY)

            # Progress update every 10 trials
            if processed % 10 == 0:
                elapsed = time.time() - start_time
                rate = processed / elapsed if elapsed > 0 else 0
                remaining = (total_to_process - processed) / rate if rate > 0 else 0
                print(f"\n  Progress: {processed}/{total_to_process} | "
                      f"Rate: {rate:.1f}/sec | "
                      f"ETA: {remaining/60:.1f} min")

        # Final commit
        if batch_count > 0:
            session.commit()
            print(f"\nCommitted final batch of {batch_count} trials")

        elapsed = time.time() - start_time
        print("\n" + "=" * 50)
        print(f"Extraction complete!")
        print(f"Total processed: {processed}")
        print(f"Successful: {successful}")
        print(f"Failed: {failed}")
        print(f"Time: {elapsed/60:.1f} minutes")

    except KeyboardInterrupt:
        print("\n\nInterrupted by user. Committing current progress...")
        session.commit()
        print("Progress saved.")
    except Exception as e:
        session.rollback()
        print(f"\nError during extraction: {e}")
        raise
    finally:
        session.close()


def show_stats():
    """Show current extraction statistics."""
    from backend.app.models import ClinicalTrial
    from backend.app.services.eligibility_extraction_service import get_extraction_version

    session = Session()
    current_version = get_extraction_version()

    try:
        total = session.query(ClinicalTrial).count()
        with_eligibility = session.query(ClinicalTrial).filter(
            ClinicalTrial.eligibility_criteria.isnot(None)
        ).count()
        extracted = session.query(ClinicalTrial).filter(
            ClinicalTrial.structured_eligibility.isnot(None)
        ).count()
        current_version_count = session.query(ClinicalTrial).filter(
            ClinicalTrial.eligibility_extraction_version == current_version
        ).count()

        print(f"Eligibility Extraction Statistics")
        print(f"Current version: {current_version}")
        print("-" * 40)
        print(f"Total trials: {total}")
        print(f"With eligibility text: {with_eligibility}")
        print(f"With structured eligibility: {extracted} ({extracted/total*100:.1f}%)")
        print(f"Current version: {current_version_count} ({current_version_count/total*100:.1f}%)")
        print(f"Needs extraction: {with_eligibility - current_version_count}")

    finally:
        session.close()


# Import Optional for type hints
from typing import Optional

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Extract structured eligibility from clinical trials"
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Re-extract even if already extracted"
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=None,
        help="Maximum number of trials to process"
    )
    parser.add_argument(
        "--batch-size",
        type=int,
        default=50,
        help="Number of trials to commit in each batch"
    )
    parser.add_argument(
        "--relevance",
        type=str,
        default=None,
        help="Comma-separated relevance categories to process (e.g., nsclc_specific,nsclc_primary)"
    )
    parser.add_argument(
        "--stats",
        action="store_true",
        help="Show extraction statistics and exit"
    )
    parser.add_argument(
        "--rate-limit",
        type=int,
        default=REQUESTS_PER_MINUTE,
        help=f"Requests per minute (default: {REQUESTS_PER_MINUTE})"
    )

    args = parser.parse_args()

    if args.stats:
        show_stats()
    else:
        # Update rate limit if specified
        if args.rate_limit != REQUESTS_PER_MINUTE:
            REQUESTS_PER_MINUTE = args.rate_limit
            REQUEST_DELAY = 60.0 / REQUESTS_PER_MINUTE

        relevance_filter = None
        if args.relevance:
            relevance_filter = [r.strip() for r in args.relevance.split(",")]

        extract_all_eligibility(
            force=args.force,
            limit=args.limit,
            batch_size=args.batch_size,
            relevance_filter=relevance_filter
        )
