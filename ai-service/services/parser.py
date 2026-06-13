import json


DEFAULT_RESPONSE = {
    "condition":  "Unable to determine",
    "severity":   "Unknown",
    "advice":     "Please consult a doctor for a proper diagnosis.",
    "department": "General Medicine",
}


def parse_llm_response(raw: str) -> dict:
    """
    Safely parse a JSON string from the LLM.
    Falls back to DEFAULT_RESPONSE if parsing fails.
    """
    try:
        text = raw.strip()
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        return json.loads(text)
    except (json.JSONDecodeError, IndexError, KeyError):
        return DEFAULT_RESPONSE.copy()