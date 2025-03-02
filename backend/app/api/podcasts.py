from fastapi import APIRouter, HTTPException, Response
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import os
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
        
        # Remove internal path before returning to client
        response_data = {k: v for k, v in podcast_data.items() if k != 'audio_path'}
        return {"data": response_data, "status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/download/{podcast_id}")
async def download_podcast(podcast_id: str):
    """Download a generated podcast MP3 file"""
    try:
        # Get the static directory path
        static_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static", "podcasts")
        # Create the full path to the MP3 file
        mp3_file_path = os.path.join(static_dir, f"{podcast_id}.mp3")
        
        # Check if the file exists
        if not os.path.exists(mp3_file_path):
            # If MP3 doesn't exist, try WAV as a fallback for compatibility with old files
            wav_file_path = os.path.join(static_dir, f"{podcast_id}.wav")
            if not os.path.exists(wav_file_path):
                raise HTTPException(status_code=404, detail="Podcast file not found")
            return FileResponse(
                path=wav_file_path,
                filename=f"crypto_podcast_{podcast_id}.wav",
                media_type="audio/wav"
            )
        
        # Return the MP3 file as a downloadable response
        return FileResponse(
            path=mp3_file_path,
            filename=f"crypto_podcast_{podcast_id}.mp3",
            media_type="audio/mpeg"
        )
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

