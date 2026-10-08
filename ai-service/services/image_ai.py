import base64
import json
import requests
from config import GROQ_API_KEY, GROQ_API_URL

# Groq Vision Model
VISION_MODEL = "llama-3.2-11b-vision-preview"

SYSTEM_PROMPT = """You are an advanced clinical triage and medical imaging AI assistant for MedicareHub.
Your purpose is to provide structured first-aid guidance, educational analysis, severity evaluation, and triage advice based on images of wounds, rashes, burns, cuts, swelling, or general clinical evidence.

CRITICAL MEDICAL SAFETY RULES:
1. You do NOT provide a final prescription or diagnostic consultation.
2. Clearly assess the severity: Low, Medium, High, or Emergency.
3. Identify potential causes / contributing factors.
4. Detail safe first-aid guidance (cleansing, dressing, rest, cooling, what NOT to do).
5. State educational facts (what symptoms to monitor, infection signs).
6. Explicitly state whether seeing a doctor is urgent (seekDoctorUrgent: true/false) and the recommended timeframe (urgency: Routine | Within 24-48 Hours | Today | Immediate Emergency).

Respond ONLY with valid JSON matching this exact structure:
{
  "condition": "Descriptive assessment name (e.g. Superficial Second-Degree Burn, Laceration, Contact Dermatitis)",
  "severity": "Low|Medium|High|Emergency",
  "urgency": "Routine|Within 24-48 Hours|Today|Immediate Emergency",
  "causes": ["Possible cause 1", "Possible cause 2"],
  "guidance": "Step-by-step home care / first-aid recommendations",
  "learnMore": "Educational insights on what to watch for (e.g. signs of infection: spreading redness, pus, fever)",
  "seekDoctorUrgent": false,
  "department": "Emergency|Dermatology|General Surgery|General Medicine|Orthopedics"
}"""


def analyze_image(image_bytes: bytes, media_type: str = "image/jpeg") -> dict:
    # If no Groq API Key is supplied or API fails, we return a structured clinical fallback
    if not GROQ_API_KEY:
        return fallback_image_analysis()

    encoded = base64.standard_b64encode(image_bytes).decode("utf-8")
    data_url = f"data:{media_type};base64,{encoded}"

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": VISION_MODEL,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {
                "role": "user",
                "content": [
                    {"type": "image_url", "image_url": {"url": data_url}},
                    {
                        "type": "text",
                        "text": "Analyze this wound/skin/medical evidence image. Evaluate severity, causes, first-aid guidance, educational facts, and urgency to see a doctor in JSON.",
                    },
                ],
            },
        ],
        "max_tokens": 700,
        "temperature": 0.2,
    }

    try:
        res = requests.post(GROQ_API_URL, headers=headers, json=payload, timeout=60)
        if res.ok:
            raw_text = res.json()["choices"][0]["message"]["content"].strip()
            if raw_text.startswith("```"):
                raw_text = raw_text.split("```")[1]
                if raw_text.startswith("json"):
                    raw_text = raw_text[4:]
            parsed = json.loads(raw_text.strip())
            # Ensure required fields
            if "urgency" not in parsed:
                parsed["urgency"] = "Within 24-48 Hours" if parsed.get("severity") in ["Medium", "High"] else "Routine"
            if "causes" not in parsed:
                parsed["causes"] = ["Trauma or physical irritation"]
            if "seekDoctorUrgent" not in parsed:
                parsed["seekDoctorUrgent"] = parsed.get("severity") in ["High", "Emergency"]
            return parsed
    except Exception as e:
        print(f"[image_ai] Vision LLM request error: {e}")

    return fallback_image_analysis()


def fallback_image_analysis() -> dict:
    return {
        "condition": "Wound & Skin Lesion Assessment",
        "severity": "Medium",
        "urgency": "Within 24-48 Hours",
        "causes": [
            "Mechanical trauma, abrasion or laceration",
            "Superficial dermal inflammation or allergic contact",
            "Thermal or friction exposure"
        ],
        "guidance": "1. Gently cleanse the area with mild saline or clean lukewarm water.\n2. Do NOT pick scabs or pop blisters.\n3. Apply sterile non-stick gauze and keep the wound clean and dry.\n4. Apply an antiseptic or barrier cream if available.",
        "learnMore": "Monitor for key warning signs of infection: spreading erythema (redness > 2cm), localized warmth, foul-smelling purulent discharge, throbbing pain, or body fever.",
        "seekDoctorUrgent": False,
        "department": "Dermatology / General Medicine"
    }