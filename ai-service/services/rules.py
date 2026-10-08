def rule_check(text: str) -> dict | None:
    t = text.lower()

    if any(kw in t for kw in ["chest pain", "heart attack", "can't breathe", "cannot breathe", "breathing difficulty", "no pulse"]):
        return {
            "condition": "Acute Cardiac / Severe Respiratory Distress",
            "severity": "Emergency",
            "urgency": "Immediate Emergency",
            "causes": ["Myocardial ischemia/infarction", "Pulmonary embolism", "Severe bronchospasm"],
            "guidance": "1. Sit upright in a comfortable resting position.\n2. Loosen tight clothing.\n3. Do not exert any physical effort.\n4. Have someone stay with you.",
            "learnMore": "Chest discomfort radiating to jaw, left arm, or back with cold sweats is a medical red flag requiring emergency room triage.",
            "seekDoctorUrgent": True,
            "department": "Emergency Medicine"
        }

    if any(kw in t for kw in ["stroke", "face drooping", "arm weakness", "slurred speech", "sudden numbness"]):
        return {
            "condition": "Suspected Cerebrovascular Event (Stroke)",
            "severity": "Emergency",
            "urgency": "Immediate Emergency",
            "causes": ["Acute cerebral ischemia or intracranial hemorrhage"],
            "guidance": "1. Note the exact time symptoms began.\n2. Do NOT administer aspirin or oral food/liquids.\n3. Keep the patient lying flat with head slightly elevated.",
            "learnMore": "Remember F.A.S.T. (Face drooping, Arm weakness, Speech difficulty, Time to call emergency). Every minute saved preserves brain tissue.",
            "seekDoctorUrgent": True,
            "department": "Emergency / Neurology"
        }

    if any(kw in t for kw in ["burn", "scalding", "hot oil", "fire"]):
        return {
            "condition": "Thermal Burn / Scald Injury",
            "severity": "Medium",
            "urgency": "Within 24-48 Hours",
            "causes": ["Thermal contact with heat source, hot liquid, or steam"],
            "guidance": "1. Cool under gentle running room-temperature tap water for 10-20 minutes.\n2. Do NOT apply ice, toothpaste, butter, or oil.\n3. Cover loosely with clean, non-adherent sterile dressing.\n4. Do NOT pop intact blisters.",
            "learnMore": "Burns larger than 3 inches, or on the face, hands, joints, or groin, require prompt in-person clinical assessment.",
            "seekDoctorUrgent": False,
            "department": "Dermatology / General Surgery"
        }

    if any(kw in t for kw in ["wound", "cut", "laceration", "bleeding", "knife cut", "glass cut"]):
        return {
            "condition": "Open Cut / Laceration Injury",
            "severity": "Medium",
            "urgency": "Today",
            "causes": ["Mechanical trauma from sharp edge or impact"],
            "guidance": "1. Apply firm direct pressure with clean cloth to arrest bleeding for 5-10 minutes.\n2. Rinse wound under clean water.\n3. Apply antiseptic and sterile bandage.",
            "learnMore": "If the cut is deep (>0.5 cm), gaping, caused by rusted metal (needs Tetanus shot), or bleeding does not stop after 10 mins of pressure, visit urgent care immediately.",
            "seekDoctorUrgent": True,
            "department": "Emergency / General Surgery"
        }

    if any(kw in t for kw in ["fever", "temperature", "chills", "sweating"]):
        return {
            "condition": "Fever & Pyrexia / Systemic Infection",
            "severity": "Medium",
            "urgency": "Within 24-48 Hours",
            "causes": ["Viral upper respiratory infection", "Bacterial infection", "Systemic inflammatory response"],
            "guidance": "1. Hydrate generously with oral fluids and electrolytes.\n2. Rest in a well-ventilated room.\n3. Take standard antipyretics (e.g. Paracetamol) as per OTC guidelines if needed.",
            "learnMore": "Consult a doctor urgently if fever stays above 103°F (39.4°C), lasts more than 3 continuous days, or is accompanied by stiff neck, confusion, or rash.",
            "seekDoctorUrgent": False,
            "department": "General Medicine"
        }

    if any(kw in t for kw in ["rash", "itching", "hives", "skin allergy"]):
        return {
            "condition": "Acute Dermatitis / Urticaria",
            "severity": "Low",
            "urgency": "Routine",
            "causes": ["Allergic contact, environmental irritant, or food/drug sensitivity"],
            "guidance": "1. Avoid scratching or hot showers.\n2. Apply a cooling calamine lotion or mild moisturizer.\n3. Wear loose cotton garments.",
            "learnMore": "If rash spreads rapidly or involves lip/eyelid swelling or breathing difficulty, seek emergency care for anaphylaxis immediately.",
            "seekDoctorUrgent": False,
            "department": "Dermatology"
        }

    return None