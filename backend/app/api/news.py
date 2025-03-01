from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from app.services.news_aggregator import get_latest_news_summary

router = APIRouter()

@router.get("/summary", response_model=Dict[str, Any])
async def get_news_summary():
    """Get the latest crypto news summary"""
    try:
        summary = await get_latest_news_summary()
        return {"data": summary, "status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/trending", response_model=Dict[str, Any])
async def get_trending_topics():
    """Get trending topics in crypto news"""
    try:
        # Dummy implementation for trending topics
        trending = [
            {"topic": "Ethereum Upgrade", "mentions": 234, "sentiment": "positive"},
            {"topic": "Bitcoin ETF", "mentions": 198, "sentiment": "neutral"},
            {"topic": "Regulatory Changes", "mentions": 156, "sentiment": "negative"},
            {"topic": "DeFi Innovations", "mentions": 124, "sentiment": "positive"},
        ]
        return {"data": trending, "status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 