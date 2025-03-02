from typing import List, Dict, Any
import random
from datetime import datetime, timedelta
import requests
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# NewsAPI Key
NEWSAPI_KEY = os.getenv("NEWSAPI_KEY", "f6ffd53a24f04f11ac0befe694d63471")

# Mock news data
MOCK_NEWS_SOURCES = ["CoinDesk", "CryptoSlate", "Cointelegraph", "The Block", "Decrypt"]
MOCK_CRYPTO_ASSETS = ["Bitcoin", "Ethereum", "Solana", "Cardano", "Ripple", "Polygon", "Avalanche"]
MOCK_EVENTS = [
    "surged to new highs",
    "faced a major correction",
    "gained institutional adoption",
    "announced a major upgrade",
    "encountered regulatory challenges",
    "partnered with major companies",
    "expanded its ecosystem"
]
MOCK_IMPACTS = [
    "causing market-wide optimism",
    "leading to increased volatility",
    "resulting in renewed investor interest",
    "prompting analysts to revise price targets",
    "triggering debates about its long-term potential"
]

async def get_crypto_news(coins=None, limit=5) -> Dict[str, Any]:
    """
    Fetch cryptocurrency news for specific coins.
    
    :param coins: List of cryptocurrency names to search for (e.g., ['Bitcoin', 'Ethereum'])
    :param limit: Maximum number of articles to retrieve (default: 5)
    :return: Formatted news data
    """
    # Default to major cryptocurrencies if no specific coins are provided
    if coins is None:
        coins = ['Bitcoin', 'Ethereum', 'Binance Coin', 'Cardano', 'Dogecoin']
    
    # Construct search query
    query = " OR ".join(coins)
    
    url = f"https://newsapi.org/v2/everything?q={query}&language=en&sortBy=publishedAt&apiKey={NEWSAPI_KEY}"
    
    try:
        response = requests.get(url)
        response.raise_for_status()  # Raise an exception for HTTP errors
        
        data = response.json()
        articles = data.get("articles", [])[:limit]  # Get top articles based on limit
        
        if not articles:
            return {"articles": [], "error": "No recent news found for the specified cryptocurrencies."}
        
        formatted_articles = []
        
        for article in articles:
            title = article.get("title", "No Title")
            description = article.get("description", "No Summary")
            link = article.get("url", "#")
            source = article.get("source", {}).get("name", "Unknown Source")
            published_at = article.get("publishedAt", datetime.now().isoformat())
            
            # Determine which coins are mentioned in the title or description
            mentioned_coins = [
                coin for coin in coins 
                if coin.lower() in title.lower() or coin.lower() in description.lower()
            ]
            
            formatted_articles.append({
                "title": title,
                "source": source,
                "url": link,
                "timestamp": published_at,
                "summary": description,
                "mentioned_coins": mentioned_coins
            })
        
        return {
            "articles": formatted_articles,
            "query": query,
            "timestamp": datetime.now().isoformat()
        }
    
    except requests.RequestException as e:
        return {"articles": [], "error": f"Error fetching news: {e}"}