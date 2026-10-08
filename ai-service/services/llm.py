import json
import requests
from config import GROQ_API_KEY, GROQ_MODEL, GROQ_API_URL

SYSTEM_PROMPT = """You are an advanced medical triage and health guidance AI for MedicareHub.
Analyze the patient's reported symptoms or questions. Provide clear educational triage, home-care recommendations, and tell them whether it is urgent to consult a physician.

CRITICAL SAFETY RULES:
1. You do not provide definitive prescriptions.
2. Structure output cleanly into severity, likely causes, first-aid guidance, educational facts to monitor, and doctor urgency.

Respond ONLY with valid JSON matching this exact structure:
{
  "condition": "Probable condition or symptom category name",
  "severity": "Low|Medium|High|Emergency",
  "urgency": "Routine|Within 24-48 Hours|Today|Immediate Emergency",
  "causes": ["Possible cause 1", "Possible cause 2"],
  "guidance": "Clear, actionable home-care / first-aid advice",
  "learnMore": "What signs to monitor or clinical information to be aware of",
  "seekDoctorUrgent": false,
  "department": "Department name (e.g. General Medicine, Cardiology, Neurology, ENT)"
}"""


def call_llm(text: str) -> dict:
    if not GROQ_API_KEY:
        return fallback_text_analysis(text)

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": GROQ_MODEL,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"Patient symptoms / query: {text}"},
        ],
        "max_tokens": 600,
        "temperature": 0.2,
    }

    try:
        res = requests.post(GROQ_API_URL, headers=headers, json=payload, timeout=30)
        if res.ok:
            raw_text = res.json()["choices"][0]["message"]["content"].strip()
            if raw_text.startswith("```"):
                raw_text = raw_text.split("```")[1]
                if raw_text.startswith("json"):
                    raw_text = raw_text[4:]
            parsed = json.loads(raw_text.strip())
            if "urgency" not in parsed:
                parsed["urgency"] = "Within 24-48 Hours" if parsed.get("severity") in ["Medium", "High"] else "Routine"
            if "causes" not in parsed:
                parsed["causes"] = ["General physiological or viral factors"]
            if "seekDoctorUrgent" not in parsed:
                parsed["seekDoctorUrgent"] = parsed.get("severity") in ["High", "Emergency"]
            return parsed
    except Exception as e:
        print(f"[llm] Request error: {e}")

    return fallback_text_analysis(text)


def fallback_text_analysis(text: str) -> dict:
    t = text.lower()
    is_severe = any(w in t for w in ["severe", "blood", "chest", "dizzy", "faint", "fracture", "bleed"])
    return {
        "condition": "Clinical Symptom Assessment",
        "severity": "High" if is_severe else "Medium",
        "urgency": "Today" if is_severe else "Within 24-48 Hours",
        "causes": [
            "Infectious etiology (viral/bacterial)",
            "Environmental or lifestyle stressors",
            "Acute inflammatory response"
        ],
        "guidance": "1. Prioritize rest, balanced hydration with electrolytes.\n2. Avoid self-medicating with unprescribed strong antibiotics or painkillers.\n3. Track body temperature and vitals regularly.",
        "learnMore": "Seek prompt medical care if symptoms are accompanied by high persistent fever, difficulty breathing, or sudden acute pain.",
        "seekDoctorUrgent": is_severe,
        "department": "General Medicine"
    }