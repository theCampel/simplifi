from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any, Optional
from app.services.news_aggregator import get_crypto_news

router = APIRouter()


@router.get("/articles", response_model=Dict[str, Any])
async def get_news_articles(coins: Optional[str] = None, limit: Optional[int] = 5):
    """Get news articles for specific cryptocurrency coins.
    
    Args:
        coins: Comma-separated list of coin names (e.g., "Bitcoin,Ethereum,Solana")
        limit: Maximum number of articles to retrieve (default: 5)
    
    Returns:
        Dict containing news articles and metadata
    """
    try:
        # Convert comma-separated coins to a list if provided
        coin_list = None
        if coins:
            coin_list = [coin.strip() for coin in coins.split(",")]
        
        # Fetch news for the specified coins
        news_data = await get_crypto_news(coin_list, limit=limit)
        return {"data": news_data, "status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 