from pydantic import BaseModel
from typing import Optional, List


class SymptomInput(BaseModel):
    text: str


class AIResponse(BaseModel):
    condition: str
    severity: str        # Low | Medium | High | Emergency
    urgency: str         # Routine | Within 24-48 Hours | Today | Immediate Emergency
    causes: List[str]    # Likely causes / contributing factors
    guidance: str        # Clear clinical first-aid / safe home guidance
    learnMore: str       # Key facts / what to watch out for
    seekDoctorUrgent: bool # True if immediate medical consultation is advised
    department: str      # Suggested medical department (e.g. Dermatology, Emergency, etc.)