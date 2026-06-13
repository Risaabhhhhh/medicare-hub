import base64
import json
import requests
from config import GROQ_API_KEY, GROQ_API_URL


# Groq's vision model (supports image input)
VISION_MODEL = "llama-3.2-11b-vision-preview"

SYSTEM_PROMPT = (
    "You are a medical imaging assistant. "
    "Analyze the provided medical image and respond ONLY with valid JSON — "
    "no markdown fences, no extra text:\n"
    '{"condition": "...", "severity": "Low|Medium|High|Emergency", '
    '"advice": "...", "department": "..."}'
)


def analyze_image(image_bytes: bytes, media_type: str = "image/jpeg") -> dict:
    encoded = base64.standard_b64encode(image_bytes).decode("utf-8")
    data_url = f"data:{media_type};base64,{encoded}"

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type":  "application/json",
    }

    payload = {
        "model": VISION_MODEL,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {
                "role": "user",
                "content": [
                    {"type": "image_url", "image_url": {"url": data_url}},
                    {"type": "text",      "text": "Analyze this medical image and return the JSON."},
                ],
            },
        ],
        "max_tokens":  512,
        "temperature": 0.2,
    }

    res = requests.post(GROQ_API_URL, headers=headers, json=payload, timeout=60)

    if not res.ok:
        print(f"[image_ai] ERROR {res.status_code}: {res.text}")
        res.raise_for_status()

    raw_text = res.json()["choices"][0]["message"]["content"].strip()

    if raw_text.startswith("```"):
        raw_text = raw_text.split("```")[1]
        if raw_text.startswith("json"):
            raw_text = raw_text[4:]

    return json.loads(raw_text) 