from typing import List, Dict, Any
import random
from datetime import datetime, timedelta

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

async def get_latest_news_summary() -> Dict[str, Any]:
    """
    Generate a dummy news summary with random articles and a market overview
    
    In a real implementation, this would:
    1. Fetch data from news APIs (e.g., CryptoCompare, CoinGecko news)
    2. Process and summarize articles using NLP
    3. Generate market sentiment analysis
    """
    # Current timestamp for the summary
    current_time = datetime.now()
    
    # Generate dummy articles
    articles = []
    for _ in range(6):  # 6 dummy articles
        timestamp = current_time - timedelta(hours=random.randint(1, 24))
        source = random.choice(MOCK_NEWS_SOURCES)
        asset = random.choice(MOCK_CRYPTO_ASSETS)
        event = random.choice(MOCK_EVENTS)
        impact = random.choice(MOCK_IMPACTS)
        
        # Random sentiment from -1 (negative) to 1 (positive)
        sentiment = round(random.uniform(-1, 1), 2)
        sentiment_label = "positive" if sentiment > 0.3 else "negative" if sentiment < -0.3 else "neutral"
        
        articles.append({
            "title": f"{asset} {event}, {impact}",
            "source": source,
            "url": f"https://example.com/{asset.lower()}-news-{random.randint(1000, 9999)}",
            "timestamp": timestamp.isoformat(),
            "summary": f"{asset} has recently {event} as reported by {source}. This development is {impact.lower()}, according to market analysts.",
            "sentiment": sentiment,
            "sentiment_label": sentiment_label
        })
    
    # Generate dummy market overview
    market_sentiment = round(random.uniform(-0.5, 0.5), 2)
    
    return {
        "articles": articles,
        "market_overview": {
            "sentiment": market_sentiment,
            "sentiment_label": "bullish" if market_sentiment > 0.1 else "bearish" if market_sentiment < -0.1 else "neutral",
            "trending_topics": ["DeFi growth", "NFT markets", "Layer 2 scaling", "Regulatory news"],
            "timestamp": current_time.isoformat()
        }
    } 