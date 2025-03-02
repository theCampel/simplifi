from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any, Optional
from app.services.news_aggregator import get_latest_news_summary, get_crypto_news

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

@router.get("/articles", response_model=Dict[str, Any])
async def get_news_articles(coins: Optional[str] = None):
    """Get news articles for specific cryptocurrency coins.
    
    Args:
        coins: Comma-separated list of coin names (e.g., "Bitcoin,Ethereum,Solana")
    
    Returns:
        Dict containing news articles and metadata
    """
    try:
        # Convert comma-separated coins to a list if provided
        coin_list = None
        if coins:
            coin_list = [coin.strip() for coin in coins.split(",")]
        
        # Fetch news for the specified coins
        news_data = await get_crypto_news(coin_list)
        return {"data": news_data, "status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 