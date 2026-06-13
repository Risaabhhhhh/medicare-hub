from pydantic import BaseModel


class SymptomInput(BaseModel):
    text: str


class AIResponse(BaseModel):
    condition:  str
    severity:   str   # Low | Medium | High | Emergency
    advice:     str
    department: str