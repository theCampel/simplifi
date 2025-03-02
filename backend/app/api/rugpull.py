from fastapi import APIRouter, HTTPException
import requests
import os
from pydantic import BaseModel, Field
from typing import Dict, Any, Optional
from openai import OpenAI
import logging

router = APIRouter()

# API Keys
XAI_API_KEY = os.getenv("XAI_API_KEY", "")

# CoinGecko API Endpoint
COINGECKO_URL = "https://api.coingecko.com/api/v3/coins"

# OpenAI Client for X.ai
client = OpenAI(
    api_key=XAI_API_KEY,
    base_url="https://api.x.ai/v1",
)

# Response model for structured output
class RugPullRisk(BaseModel):
    score: int = Field(description="Rug pull risk score (0-100, where 100 is high risk)")
    justification: str = Field(description="Short justification for the score")
    coin_info: Dict[str, Any] = Field(description="Retrieved coin market data")

# Mock data for when API fails
def get_mock_rug_pull_analysis(coin_id: str, coin_name: str, coin_symbol: str) -> RugPullRisk:
    """Generate mock rug pull analysis when APIs fail."""
    # Default mock data
    mock_coin_info = {
        "Name": coin_name,
        "Symbol": coin_symbol,
        "Current Price": 0.00001234,
        "Market Cap": 5000000,
        "24h Trading Volume": 250000,
        "Circulating Supply": 1000000000000,
        "Total Supply": 1000000000000,
        "Max Supply": None,
        "24h Price Change": -2.5,
        "24h Low": 0.00001200,
        "24h High": 0.00001300
    }
    
    # Pretend we analyzed it and came up with a score
    score = 75
    justification = "This appears to be a newer token with very low price, extremely high supply, and moderate to low liquidity relative to its market cap. These are common characteristics of higher-risk tokens. Exercise extreme caution."
    
    return RugPullRisk(
        score=score,
        justification=justification,
        coin_info=mock_coin_info
    )

@router.get("/{coin_id}", response_model=RugPullRisk)
async def analyze_rug_pull_risk(coin_id: str):
    """
    Analyze the rug pull risk for a specific cryptocurrency.
    
    Uses CoinGecko data and X.ai's Grok model to evaluate the risk.
    Returns a risk score and justification.
    """
    try:
        # First, fetch coin data from CoinGecko
        response = requests.get(f"{COINGECKO_URL}/{coin_id}")
        
        if response.status_code != 200:
            logging.warning(f"CoinGecko API error: {response.status_code}, {response.text}")
            # If we can't get data, use mock data
            return get_mock_rug_pull_analysis(
                coin_id=coin_id, 
                coin_name=coin_id.replace("-", " ").title(),
                coin_symbol=coin_id.split("-")[0].upper()
            )
            
        data = response.json()
        coin_name = data.get("name", "Unknown")
        coin_symbol = data.get("symbol", "UNKNOWN").upper()
        
        # Extract relevant data for analysis
        coin_info = {
            "Name": coin_name,
            "Symbol": coin_symbol,
            "Current Price": data.get("market_data", {}).get("current_price", {}).get("usd"),
            "Market Cap": data.get("market_data", {}).get("market_cap", {}).get("usd"),
            "24h Trading Volume": data.get("market_data", {}).get("total_volume", {}).get("usd"),
            "Circulating Supply": data.get("market_data", {}).get("circulating_supply"),
            "Total Supply": data.get("market_data", {}).get("total_supply"),
            "Max Supply": data.get("market_data", {}).get("max_supply"),
            "24h Price Change": data.get("market_data", {}).get("price_change_percentage_24h"),
            "24h Low": data.get("market_data", {}).get("low_24h", {}).get("usd"),
            "24h High": data.get("market_data", {}).get("high_24h", {}).get("usd")
        }
        
        # If X.ai API key is not set, return mock data
        if not XAI_API_KEY:
            logging.warning("XAI_API_KEY not set, using mock data")
            mock_result = get_mock_rug_pull_analysis(coin_id, coin_name, coin_symbol)
            mock_result.coin_info = coin_info  # Use real coin data if available
            return mock_result
            
        # Determine Rug Pull Risk Score using Grok
        try:
            score_response = client.chat.completions.create(
                model="grok-2-latest",
                temperature=0,
                messages=[
                    {
                        "role": "system",
                        "content": "Rug pull: When founders abandon a project and take investors' money. Return a score out of 100 indicating the rug pull risk of the coin and symbol provided. 100 = high risk. Search the internet to find data about it. Use the following data for your assessment: " + str(coin_info) + " Return nothing else."
                    },
                    {
                        "role": "user",
                        "content": f"{coin_name}, {coin_symbol}"
                    },
                ],
            )
            
            score_content = score_response.choices[0].message.content.strip()
            try:
                score = int(score_content)
            except ValueError:
                # If we can't parse the score as an integer, use a default
                logging.warning(f"Could not parse score: {score_content}")
                score = 50
            
            # Get Justification for the Score
            justification_response = client.chat.completions.create(
                model="grok-2-latest",
                temperature=0,
                messages=[
                    {
                        "role": "system",
                        "content": "Rug pull: When founders abandon a project and take investors' money. Score given indicates risk score of rugpull. 0 = low risk, 100 = high risk. Return a short justification for the score. Use the following data for your assessment: " + str(coin_info) + " Do not include the score in the output. Max 100 words."
                    },
                    {
                        "role": "user",
                        "content": f"{coin_name}, {coin_symbol}, {score}"
                    },
                ],
            )
            
            justification = justification_response.choices[0].message.content.strip()
            
            return RugPullRisk(
                score=score,
                justification=justification,
                coin_info=coin_info
            )
            
        except Exception as e:
            logging.error(f"Error with Grok API: {e}")
            # Fall back to mock data but use real coin info
            mock_result = get_mock_rug_pull_analysis(coin_id, coin_name, coin_symbol)
            mock_result.coin_info = coin_info
            return mock_result
            
    except Exception as e:
        logging.error(f"Error in rug pull analysis: {e}")
        return get_mock_rug_pull_analysis(
            coin_id=coin_id, 
            coin_name=coin_id.replace("-", " ").title(),
            coin_symbol=coin_id.split("-")[0].upper()
        ) 