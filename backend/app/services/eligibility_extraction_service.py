"""
Eligibility Extraction Service

Extracts structured eligibility criteria from free-text clinical trial
eligibility requirements using Claude AI.
"""

import os
import json
import logging
from typing import Any, Optional
from anthropic import Anthropic

logger = logging.getLogger(__name__)

# Initialize Anthropic client
client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

# Use Claude Sonnet for cost-effective batch processing
MODEL = "claude-sonnet-4-20250514"

# Current extraction version - increment when changing the extraction logic
EXTRACTION_VERSION = "1.0.0"


def extract_eligibility(
    eligibility_text: str,
    trial_title: Optional[str] = None
) -> dict[str, Any]:
    """
    Extract structured eligibility criteria from free text.

    Uses Claude to parse eligibility criteria into a structured format
    matching the StructuredEligibility schema.

    Args:
        eligibility_text: Raw eligibility criteria text from clinical trial
        trial_title: Optional trial title for context

    Returns:
        Dictionary matching StructuredEligibility schema
    """
    if not eligibility_text or len(eligibility_text.strip()) < 20:
        logger.warning("Eligibility text too short for extraction")
        return _empty_eligibility(notes=["Eligibility text too short for extraction"])

    system_prompt = """You are a clinical trial eligibility extraction system specializing in NSCLC (non-small cell lung cancer) trials.

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
  "common_exclusions": ["pregnancy", "active infection", etc.],
  "extraction_confidence": float 0-1,
  "extraction_notes": ["any important notes about uncertain extractions"]
}

Guidelines:
- ONLY extract what is EXPLICITLY stated in the criteria
- Use null for fields not mentioned
- For biomarkers: common ones are EGFR, ALK, ROS1, BRAF, KRAS, MET, RET, NTRK, HER2, PD-L1
- For EGFR, capture specific mutations if mentioned (L858R, T790M, exon 19 deletion, exon 20 insertion, etc.)
- Disease stages: I, IA, IB, II, IIA, IIB, III, IIIA, IIIB, IIIC, IV, metastatic
- Histology: adenocarcinoma, squamous cell carcinoma, large cell carcinoma, NOS (not otherwise specified)
- Common exclusions: pregnancy, active infection, autoimmune disease, uncontrolled hypertension, cardiac disease
- Set extraction_confidence based on how clear the criteria are (0.9+ for clear, 0.5-0.8 for ambiguous)
- Add notes for anything ambiguous or unclear

Return ONLY valid JSON, no other text."""

    user_message = f"""Extract structured eligibility from this clinical trial:

{f'Trial: {trial_title}' if trial_title else ''}

Eligibility Criteria:
{eligibility_text}

Return only the JSON object."""

    try:
        response = client.messages.create(
            model=MODEL,
            max_tokens=2048,
            system=system_prompt,
            messages=[{"role": "user", "content": user_message}]
        )

        content = response.content[0].text.strip()

        # Parse JSON - handle potential markdown code blocks
        if content.startswith("```"):
            lines = content.split("\n")
            content = "\n".join(lines[1:-1] if lines[-1] == "```" else lines[1:])

        result = json.loads(content)

        # Validate and fill in defaults
        result = _validate_and_fill_defaults(result)

        return result

    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse Claude response as JSON: {e}")
        logger.error(f"Raw response: {content[:500]}")
        return _empty_eligibility(
            confidence=0.0,
            notes=[f"JSON parse error: {str(e)}"]
        )
    except Exception as e:
        logger.error(f"Claude API error during eligibility extraction: {e}")
        return _empty_eligibility(
            confidence=0.0,
            notes=[f"Extraction error: {str(e)}"]
        )


def _empty_eligibility(
    confidence: float = 0.0,
    notes: Optional[list[str]] = None
) -> dict[str, Any]:
    """Return an empty eligibility structure with defaults."""
    return {
        "age": {"min": None, "max": None},
        "ecog": {"min": None, "max": None},
        "disease_stage": {"allowed": [], "excluded": []},
        "histology": {"allowed": [], "excluded": []},
        "biomarkers": {
            "required_positive": {},
            "required_negative": [],
            "pdl1_expression": None
        },
        "prior_treatments": {
            "required": [],
            "excluded": [],
            "max_lines": None,
            "min_lines": None,
            "treatment_naive_required": False
        },
        "brain_metastases": {
            "allowed": True,
            "controlled_only": False,
            "untreated_allowed": False
        },
        "common_exclusions": [],
        "extraction_confidence": confidence,
        "extraction_notes": notes or []
    }


def _validate_and_fill_defaults(result: dict) -> dict:
    """Validate extracted result and fill in missing defaults."""
    defaults = _empty_eligibility(confidence=0.5)

    # Ensure all top-level keys exist
    for key in defaults:
        if key not in result:
            result[key] = defaults[key]

    # Validate nested structures
    if not isinstance(result.get("age"), dict):
        result["age"] = defaults["age"]
    else:
        result["age"].setdefault("min", None)
        result["age"].setdefault("max", None)

    if not isinstance(result.get("ecog"), dict):
        result["ecog"] = defaults["ecog"]
    else:
        result["ecog"].setdefault("min", None)
        result["ecog"].setdefault("max", None)
        # Clamp ECOG values to valid range
        if result["ecog"]["min"] is not None:
            result["ecog"]["min"] = max(0, min(4, result["ecog"]["min"]))
        if result["ecog"]["max"] is not None:
            result["ecog"]["max"] = max(0, min(4, result["ecog"]["max"]))

    if not isinstance(result.get("disease_stage"), dict):
        result["disease_stage"] = defaults["disease_stage"]
    else:
        result["disease_stage"].setdefault("allowed", [])
        result["disease_stage"].setdefault("excluded", [])

    if not isinstance(result.get("histology"), dict):
        result["histology"] = defaults["histology"]
    else:
        result["histology"].setdefault("allowed", [])
        result["histology"].setdefault("excluded", [])

    if not isinstance(result.get("biomarkers"), dict):
        result["biomarkers"] = defaults["biomarkers"]
    else:
        result["biomarkers"].setdefault("required_positive", {})
        result["biomarkers"].setdefault("required_negative", [])
        result["biomarkers"].setdefault("pdl1_expression", None)

    if not isinstance(result.get("prior_treatments"), dict):
        result["prior_treatments"] = defaults["prior_treatments"]
    else:
        result["prior_treatments"].setdefault("required", [])
        result["prior_treatments"].setdefault("excluded", [])
        result["prior_treatments"].setdefault("max_lines", None)
        result["prior_treatments"].setdefault("min_lines", None)
        result["prior_treatments"].setdefault("treatment_naive_required", False)

    if not isinstance(result.get("brain_metastases"), dict):
        result["brain_metastases"] = defaults["brain_metastases"]
    else:
        result["brain_metastases"].setdefault("allowed", True)
        result["brain_metastases"].setdefault("controlled_only", False)
        result["brain_metastases"].setdefault("untreated_allowed", False)

    if not isinstance(result.get("common_exclusions"), list):
        result["common_exclusions"] = []

    if not isinstance(result.get("extraction_notes"), list):
        result["extraction_notes"] = []

    # Ensure confidence is a valid float
    try:
        result["extraction_confidence"] = max(0.0, min(1.0, float(result.get("extraction_confidence", 0.5))))
    except (ValueError, TypeError):
        result["extraction_confidence"] = 0.5

    return result


def get_extraction_version() -> str:
    """Return the current extraction algorithm version."""
    return EXTRACTION_VERSION
