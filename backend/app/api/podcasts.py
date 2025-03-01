from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from app.services.podcast_generator import generate_podcast

class PodcastRequest(BaseModel):
    coin_ids: List[str]
    duration_minutes: int = 5
    voice_type: str = "neutral"  # Options: neutral, excited, analytical
    include_price_analysis: bool = True

router = APIRouter()

@router.post("/generate", response_model=Dict[str, Any])
async def generate_podcast_endpoint(request: PodcastRequest):
    """Generate a podcast about selected cryptocurrencies"""
    try:
        podcast_data = await generate_podcast(
            coin_ids=request.coin_ids, 
            duration_minutes=request.duration_minutes,
            voice_type=request.voice_type,
            include_price_analysis=request.include_price_analysis
        )
        return {"data": podcast_data, "status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/voices", response_model=Dict[str, Any])
async def get_available_voices():
    """Get available voice options for podcast generation"""
    try:
        # Dummy implementation for available voices
        voices = [
            {"id": "neutral", "name": "Neutral Voice", "description": "A balanced, professional tone"},
            {"id": "excited", "name": "Excited Voice", "description": "An enthusiastic, energetic tone"},
            {"id": "analytical", "name": "Analytical Voice", "description": "A technical, detailed tone"}
        ]
        return {"data": voices, "status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 