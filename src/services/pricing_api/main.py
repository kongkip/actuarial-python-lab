import os
import pandas as pd
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict

# Import the core engine
from core.pricing.poisson_engine import PoissonFrequencyEngine

app = FastAPI(title="Actuarial Pricing API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# 1. Model Loading (Singleton Pattern)
# ==========================================
MODEL_PATH = "services/models/poisson_v1.joblib"

try:
    # Load the engine with fitted parameters and credibility metadata
    pricing_engine = PoissonFrequencyEngine.load(MODEL_PATH)
    print(f"[*] Pricing Engine loaded with metadata: {pricing_engine.metadata}")
except Exception as e:
    print(f"[!] Error loading model: {e}")
    pricing_engine = None

# ==========================================
# 2. Schemas
# ==========================================

class QuoteRequest(BaseModel):
    driver_age: int = Field(..., ge=18, le=95)
    exposure: float = Field(..., gt=0, le=1.0)
    sum_insured: float = Field(..., gt=0)

class QuoteResponse(BaseModel):
    lambda_val: float = Field(..., alias="lambda")
    pure_premium: float
    multiplier: float
    is_smoothed: bool
    credibility_z: float

# ==========================================
# 3. API Endpoints
# ==========================================

@app.get("/api/v1/model-metadata")
async def get_metadata():
    if not pricing_engine:
        raise HTTPException(status_code=503, detail="Model not initialized")
    
    # Transform fitted params into a format for the Recharts Frontend
    # This dynamically calculates multipliers from the Intercept
    intercept = pricing_engine.params['Intercept']
    relativities = [
        {"category": "Young", "multiplier": 1.0, "color": "#ef5350"}, # Baseline
        {"category": "Middle", "multiplier": round(np.exp(pricing_engine.params.get('age_bin[T.Middle]', 0)), 4), "color": "#66bb6a"},
        {"category": "Senior", "multiplier": round(np.exp(pricing_engine.params.get('age_bin[T.Senior]', 0)), 4), "color": "#ffa726"}
    ]
    
    return {
        "relativities": relativities,
        "base_frequency": round(np.exp(intercept), 4),
        "last_trained": pricing_engine.metadata.get("fitted_at")
    }

@app.post("/api/v1/calculate-quote", response_model=QuoteResponse)
async def calculate_quote(req: QuoteRequest):
    if not pricing_engine:
        raise HTTPException(status_code=503, detail="Model offline")

    try:
        # 1. Prepare data for the Engine
        input_data = req.model_dump() if hasattr(req, 'model_dump') else req.dict()
        input_df = pd.DataFrame([input_data])
        
        # 2. Inference: Get RAW GLM Frequency
        # CRITICAL FIX: Use .iloc[0] and cast to float to prevent Pandas 
        # FutureWarnings and JSON serialization type errors
        raw_lambda = float(pricing_engine.predict(input_df)[0])
        
        # 3. Apply Credibility Smoothing
        mu = pricing_engine.metadata['portfolio_mean']
        k = pricing_engine.metadata['k_constant']
        v = req.exposure
        
        z = v / (v + k)
        prudent_lambda = (z * raw_lambda) + ((1 - z) * mu)
        
        # 4. Calculate Premium
        severity = req.sum_insured * 0.07
        final_premium = prudent_lambda * severity * v
        
        # Get Intercept for multiplier calculation
        intercept_val = np.exp(pricing_engine.params['Intercept'])
        current_multiplier = raw_lambda / intercept_val

        # CRITICAL: Cast all np.float64/np.bool_ to standard Python types
        return {
            "lambda": float(round(prudent_lambda, 4)),
            "pure_premium": float(round(final_premium, 2)),
            "multiplier": float(round(current_multiplier, 2)),
            "is_smoothed": bool(z < 0.95),
            "credibility_z": float(round(z, 4))
        }
        
    except Exception as e:
        # Check your terminal! The traceback here will confirm the 'TypeError'
        import traceback
        print(traceback.format_exc()) 
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)