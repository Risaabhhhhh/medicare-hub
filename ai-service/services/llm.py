import json
import requests
from config import GROQ_API_KEY, GROQ_MODEL, GROQ_API_URL


SYSTEM_PROMPT = (
    "You are a medical triage assistant. "
    "Analyze the patient's symptoms and respond ONLY with valid JSON — "
    "no markdown fences, no explanation, no extra keys:\n"
    '{"condition": "...", "severity": "Low|Medium|High|Emergency", '
    '"advice": "...", "department": "..."}'
)


def call_llm(text: str) -> dict:
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type":  "application/json",
    }

    payload = {
        "model": GROQ_MODEL,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user",   "content": f"Symptoms: {text}"},
        ],
        "max_tokens":  512,
        "temperature": 0.2,
    }

    print(f"[llm] Groq model: {GROQ_MODEL}")
    print(f"[llm] API key starts with: {GROQ_API_KEY[:8] if GROQ_API_KEY else 'MISSING'}")

    res = requests.post(GROQ_API_URL, headers=headers, json=payload, timeout=30)

    if not res.ok:
        print(f"[llm] ERROR {res.status_code}: {res.text}")
        res.raise_for_status()

    raw_text = res.json()["choices"][0]["message"]["content"].strip()
    print(f"[llm] Raw response: {raw_text[:200]}")

    # Strip accidental markdown fences
    if raw_text.startswith("```"):
        raw_text = raw_text.split("```")[1]
        if raw_text.startswith("json"):
            raw_text = raw_text[4:]

    return json.loads(raw_text)