import os
import json
import logging
from typing import Any
from anthropic import Anthropic

logger = logging.getLogger(__name__)

# Initialize Anthropic client
client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

MODEL = "claude-sonnet-4-20250514"


def parse_patient_description(description: str) -> dict[str, Any]:
    """
    Parse a natural language patient description into a structured profile.

    Returns a dict matching the PatientProfile schema.
    """
    system_prompt = """You are a medical information extraction system specializing in NSCLC (non-small cell lung cancer) patient profiles.

Extract structured information from patient descriptions. Only extract what is explicitly stated - do not infer or assume values.

Return a JSON object with these fields:
- cancer_type: string (default "NSCLC")
- histology: string or null (e.g., "adenocarcinoma", "squamous cell carcinoma", "large cell carcinoma")
- stage: string or null (e.g., "I", "II", "IIIA", "IIIB", "IV", "metastatic")
- biomarkers: object mapping biomarker names to arrays of detected values/mutations
  Examples: {"EGFR": ["L858R"], "ALK": ["positive", "rearrangement"], "PD-L1": ["TPS 50%"], "KRAS": ["G12C"]}
  Common biomarkers: EGFR, ALK, ROS1, BRAF, KRAS, MET, RET, NTRK, HER2, PD-L1
- age: integer or null
- ecog_status: integer 0-4 or null (performance status)
- prior_treatments: array of treatment names/types the patient has received
- brain_metastases: boolean or null
- location: string or null (city, state, or region if mentioned)

Important guidelines:
- For biomarkers, capture the specific mutation/alteration if mentioned (e.g., "EGFR L858R" → {"EGFR": ["L858R"]})
- For PD-L1, capture the expression level if given (e.g., "PD-L1 high" → {"PD-L1": ["high"]}, "PD-L1 TPS 80%" → {"PD-L1": ["TPS 80%"]})
- "EGFR positive" without specific mutation → {"EGFR": ["positive"]}
- If a biomarker is mentioned as negative/wild-type, capture it (e.g., "EGFR negative" → {"EGFR": ["negative"]})
- ECOG 0 = fully active, ECOG 4 = completely disabled
- Return null for any field not explicitly mentioned"""

    user_message = f"""Extract the patient profile from this description:

{description}

Return only the JSON object, no other text."""

    try:
        response = client.messages.create(
            model=MODEL,
            max_tokens=1024,
            system=system_prompt,
            messages=[{"role": "user", "content": user_message}]
        )

        # Extract the text content
        content = response.content[0].text.strip()

        # Parse JSON - handle potential markdown code blocks
        if content.startswith("```"):
            # Remove markdown code block
            lines = content.split("\n")
            content = "\n".join(lines[1:-1] if lines[-1] == "```" else lines[1:])

        result = json.loads(content)

        # Ensure required fields have defaults
        result.setdefault("cancer_type", "NSCLC")
        result.setdefault("biomarkers", {})
        result.setdefault("prior_treatments", [])

        return result

    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse Claude response as JSON: {e}")
        logger.error(f"Raw response: {content}")
        # Return minimal valid profile
        return {
            "cancer_type": "NSCLC",
            "biomarkers": {},
            "prior_treatments": [],
            "parse_error": str(e)
        }
    except Exception as e:
        logger.error(f"Claude API error: {e}")
        raise


def evaluate_trial_eligibility(
    profile: dict[str, Any],
    eligibility_text: str,
    trial_title: str
) -> dict[str, Any]:
    """
    Evaluate patient eligibility for a clinical trial.

    Returns a dict matching the EligibilityResult schema.
    """
    system_prompt = """You are a clinical trial eligibility evaluator for NSCLC patients.

Given a patient profile and trial eligibility criteria, determine if the patient is likely eligible.

Return a JSON object with:
- status: "eligible", "ineligible", or "uncertain"
- confidence: float 0-1 (how confident you are in the assessment)
- matching_criteria: array of criteria the patient clearly meets
- excluding_criteria: array of criteria that may exclude the patient
- explanation: brief explanation of your assessment

Guidelines:
- Be CONSERVATIVE - when information is missing or unclear, lean toward "uncertain"
- Only mark "ineligible" if there's a clear exclusion (e.g., wrong cancer type, wrong biomarker, age outside range)
- Mark "eligible" only if key criteria are clearly met
- Missing ECOG status should not automatically exclude unless criteria require a specific value
- If patient biomarkers match required biomarkers, that's a strong positive signal
- Prior treatments may be inclusionary or exclusionary depending on the trial"""

    user_message = f"""Patient Profile:
{json.dumps(profile, indent=2)}

Trial: {trial_title}

Eligibility Criteria:
{eligibility_text}

Evaluate eligibility and return only the JSON object."""

    try:
        response = client.messages.create(
            model=MODEL,
            max_tokens=1024,
            system=system_prompt,
            messages=[{"role": "user", "content": user_message}]
        )

        content = response.content[0].text.strip()

        # Parse JSON - handle potential markdown code blocks
        if content.startswith("```"):
            lines = content.split("\n")
            content = "\n".join(lines[1:-1] if lines[-1] == "```" else lines[1:])

        result = json.loads(content)

        # Ensure required fields
        result.setdefault("status", "uncertain")
        result.setdefault("confidence", 0.5)
        result.setdefault("matching_criteria", [])
        result.setdefault("excluding_criteria", [])
        result.setdefault("explanation", "Unable to determine eligibility")

        # Validate status value
        if result["status"] not in ("eligible", "ineligible", "uncertain"):
            result["status"] = "uncertain"

        # Clamp confidence to valid range
        result["confidence"] = max(0.0, min(1.0, float(result["confidence"])))

        return result

    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse eligibility response as JSON: {e}")
        return {
            "status": "uncertain",
            "confidence": 0.0,
            "matching_criteria": [],
            "excluding_criteria": [],
            "explanation": f"Error evaluating eligibility: {e}"
        }
    except Exception as e:
        logger.error(f"Claude API error during eligibility evaluation: {e}")
        return {
            "status": "uncertain",
            "confidence": 0.0,
            "matching_criteria": [],
            "excluding_criteria": [],
            "explanation": f"Error evaluating eligibility: {e}"
        }
