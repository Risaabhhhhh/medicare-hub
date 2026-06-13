def rule_check(text: str) -> dict | None:
    t = text.lower()

    if any(kw in t for kw in ["chest pain", "heart attack", "can't breathe", "cannot breathe", "breathing difficulty", "no pulse"]):
        return {"condition": "Possible Cardiac / Respiratory Emergency", "severity": "Emergency",
                "advice": "Call emergency services (112) immediately.", "department": "Emergency"}

    if any(kw in t for kw in ["stroke", "face drooping", "arm weakness", "slurred speech", "sudden numbness"]):
        return {"condition": "Possible Stroke", "severity": "Emergency",
                "advice": "Call 112 immediately. Note the time symptoms started.", "department": "Emergency"}

    if any(kw in t for kw in ["unconscious", "unresponsive", "not breathing", "seizure", "overdose"]):
        return {"condition": "Medical Emergency", "severity": "Emergency",
                "advice": "Call 112 immediately.", "department": "Emergency"}

    if any(kw in t for kw in ["fever", "temperature", "chills", "sweating"]):
        return {"condition": "Fever / Possible Infection", "severity": "Medium",
                "advice": "Rest and stay hydrated. Take paracetamol for fever. See a doctor if it persists over 3 days or exceeds 103°F / 39.5°C.",
                "department": "General Medicine"}

    if any(kw in t for kw in ["cough", "cold", "runny nose", "sore throat", "sneezing"]):
        return {"condition": "Upper Respiratory Infection / Common Cold", "severity": "Low",
                "advice": "Rest, stay hydrated, and take over-the-counter cold medicine. See a doctor if symptoms worsen after 7 days.",
                "department": "General Medicine"}

    if any(kw in t for kw in ["headache", "migraine", "head pain"]):
        return {"condition": "Headache / Migraine", "severity": "Low",
                "advice": "Rest in a quiet dark room. Take paracetamol or ibuprofen. See a doctor if headache is sudden and severe.",
                "department": "General Medicine"}

    if any(kw in t for kw in ["stomach", "nausea", "vomiting", "diarrhea", "abdominal pain", "stomach ache"]):
        return {"condition": "Gastrointestinal Distress", "severity": "Low",
                "advice": "Stay hydrated with clear fluids. Avoid solid food for a few hours. See a doctor if symptoms persist over 48 hours.",
                "department": "Gastroenterology"}

    if any(kw in t for kw in ["rash", "itching", "hives", "skin"]):
        return {"condition": "Skin Reaction / Possible Allergy", "severity": "Low",
                "advice": "Avoid scratching. Apply calamine lotion if available. See a doctor if rash spreads or you have difficulty breathing.",
                "department": "Dermatology"}

    if any(kw in t for kw in ["back pain", "back ache", "lower back"]):
        return {"condition": "Back Pain", "severity": "Low",
                "advice": "Rest, apply a warm compress, and take ibuprofen if needed. See a doctor if pain radiates down your leg.",
                "department": "Orthopedics"}

    if any(kw in t for kw in ["anxiety", "panic", "stress", "depression", "mental"]):
        return {"condition": "Mental Health Concern", "severity": "Medium",
                "advice": "Practice deep breathing. Reach out to someone you trust. Please consult a mental health professional.",
                "department": "Psychiatry"}

    return None