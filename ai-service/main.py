from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from models.schema import SymptomInput, AIResponse
from services.rules    import rule_check
from services.llm      import call_llm
from services.image_ai import analyze_image

app = FastAPI(title="MedicareHub AI Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Health ────────────────────────────────────────────────────
@app.get("/health")
def health():
    return {"status": "ok"}


# ── Symptom analysis ─────────────────────────────────────────
@app.post("/symptoms", response_model=AIResponse)
async def analyze_symptoms(body: SymptomInput):
    if not body.text.strip():
        raise HTTPException(status_code=400, detail="text field is required")

    # 1. Fast rule-based check (no API call needed)
    rule_result = rule_check(body.text)
    if rule_result:
        return rule_result

    # 2. Claude LLM analysis
    try:
        return call_llm(body.text)
    except Exception as e:
        print(f"[/symptoms] LLM error: {e}")
        # Soft fallback so the endpoint never 500s
        return {
            "condition":  "Analysis unavailable",
            "severity":   "Unknown",
            "advice":     "AI service is temporarily unavailable. Please consult a doctor.",
            "department": "General Medicine",
        }


# ── Image analysis ───────────────────────────────────────────
@app.post("/image", response_model=AIResponse)
async def image_analysis(file: UploadFile = File(...)):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are supported")

    image_bytes = await file.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="Empty image file received")

    try:
        return analyze_image(image_bytes, media_type=file.content_type)
    except Exception as e:
        print(f"[/image] error: {e}")
        raise HTTPException(status_code=502, detail=f"Image analysis failed: {str(e)}")