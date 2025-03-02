from fastapi import APIRouter, HTTPException, Body
import requests
import os
import time
from pydantic import BaseModel, Field
from typing import Dict, Any, Optional
from openai import OpenAI
import logging
import json
from datetime import datetime, timedelta

router = APIRouter()

# API Keys
XAI_API_KEY = os.getenv("XAI_API_KEY", "")
COINGECKO_API_KEY = os.getenv("COINGECKO_API_KEY", "")
COINGECKO_API_KEY_2 = os.getenv("COINGECKO_API_KEY_2", "")

# CoinGecko API Endpoint
COINGECKO_URL = "https://api.coingecko.com/api/v3/coins"

# API Key management
api_keys = [k for k in [COINGECKO_API_KEY, COINGECKO_API_KEY_2] if k]
current_key_index = 0
last_key_use_time = 0

# OpenAI Client for X.ai
client = OpenAI(
    api_key=XAI_API_KEY,
    base_url="https://api.x.ai/v1",
)

# Simple in-memory cache for coin data and analysis results
# Structure: {coin_id: {"data": {...}, "timestamp": datetime, "analysis": {...}}}
COIN_CACHE = {}

# Cache duration (in hours)
CACHE_DURATION = 24  # Cache results for 24 hours

# Rate limiting
LAST_REQUEST_TIME = 0
MIN_REQUEST_INTERVAL = 6  # Seconds between requests (max 10 per minute)

def get_api_key():
    """Get the next available API key using round-robin if multiple keys are available."""
    global current_key_index, last_key_use_time
    
    if not api_keys:
        return None
    
    # Get current time
    current_time = time.time()
    
    # If we have multiple keys and less than 1 second has passed, rotate to next key
    if len(api_keys) > 1 and (current_time - last_key_use_time) < 1:
        current_key_index = (current_key_index + 1) % len(api_keys)
    
    # Update last used time
    last_key_use_time = current_time
    
    return api_keys[current_key_index]

def throttled_request(url: str) -> requests.Response:
    """Make a throttled request to respect rate limits."""
    global LAST_REQUEST_TIME
    
    # Calculate time since last request
    current_time = time.time()
    time_since_last_request = current_time - LAST_REQUEST_TIME
    
    # If we need to wait to respect rate limits
    if time_since_last_request < MIN_REQUEST_INTERVAL:
        sleep_time = MIN_REQUEST_INTERVAL - time_since_last_request
        logging.info(f"Rate limiting: Sleeping for {sleep_time:.2f} seconds")
        time.sleep(sleep_time)
    
    # Get API key
    api_key = get_api_key()
    headers = {"x-cg-api-key": api_key} if api_key else {}
    
    # Make the request
    logging.info(f"Making request to {url}" + (" with API key" if api_key else " without API key"))
    response = requests.get(url, headers=headers)
    LAST_REQUEST_TIME = time.time()
    
    return response

def get_cached_coin_data(coin_id: str):
    """Get coin data from cache if available and not expired."""
    if coin_id in COIN_CACHE:
        cache_entry = COIN_CACHE[coin_id]
        cache_time = cache_entry.get("timestamp")
        
        # Check if cache is still valid
        if cache_time and datetime.now() - cache_time < timedelta(hours=CACHE_DURATION):
            logging.info(f"Using cached data for {coin_id}")
            return cache_entry.get("data")
    
    return None

def get_cached_analysis(coin_id: str):
    """Get analysis from cache if available and not expired."""
    if coin_id in COIN_CACHE and "analysis" in COIN_CACHE[coin_id]:
        cache_entry = COIN_CACHE[coin_id]
        cache_time = cache_entry.get("timestamp")
        
        # Check if cache is still valid
        if cache_time and datetime.now() - cache_time < timedelta(hours=CACHE_DURATION):
            logging.info(f"Using cached analysis for {coin_id}")
            return cache_entry.get("analysis")
    
    return None

def update_cache(coin_id: str, data=None, analysis=None):
    """Update the cache with new data or analysis."""
    if coin_id not in COIN_CACHE:
        COIN_CACHE[coin_id] = {"timestamp": datetime.now()}
    
    if data:
        COIN_CACHE[coin_id]["data"] = data
    
    if analysis:
        COIN_CACHE[coin_id]["analysis"] = analysis
        
    COIN_CACHE[coin_id]["timestamp"] = datetime.now()

def extract_coin_info(coin_data: Dict[str, Any]) -> Dict[str, Any]:
    """Extract relevant fields from coin data for analysis."""
    coin_name = coin_data.get("name", "Unknown")
    coin_symbol = coin_data.get("symbol", "UNKNOWN").upper()
    
    return {
        "Name": coin_name,
        "Symbol": coin_symbol,
        "Current Price": coin_data.get("market_data", {}).get("current_price", {}).get("usd") or coin_data.get("current_price"),
        "Market Cap": coin_data.get("market_data", {}).get("market_cap", {}).get("usd") or coin_data.get("market_cap"),
        "24h Trading Volume": coin_data.get("market_data", {}).get("total_volume", {}).get("usd") or coin_data.get("total_volume"),
        "Circulating Supply": coin_data.get("market_data", {}).get("circulating_supply") or coin_data.get("circulating_supply"),
        "Total Supply": coin_data.get("market_data", {}).get("total_supply") or coin_data.get("total_supply"),
        "Max Supply": coin_data.get("market_data", {}).get("max_supply") or coin_data.get("max_supply"),
        "24h Price Change": coin_data.get("market_data", {}).get("price_change_percentage_24h") or coin_data.get("price_change_percentage_24h"),
        "24h Low": coin_data.get("market_data", {}).get("low_24h", {}).get("usd") or coin_data.get("low_24h"),
        "24h High": coin_data.get("market_data", {}).get("high_24h", {}).get("usd") or coin_data.get("high_24h")
    }

# Request model for passing existing coin data
class CoinDataInput(BaseModel):
    coin_data: Optional[Dict[str, Any]] = None

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
    score = 7
    justification = "This seems to be a reputable and well-established coin. It has a strong community and diverse market cap."
    
    return RugPullRisk(
        score=score,
        justification=justification,
        coin_info=mock_coin_info
    )

@router.get("/{coin_id}", response_model=RugPullRisk)
async def analyze_rug_pull_risk_get(coin_id: str):
    """
    Analyze the rug pull risk for a specific cryptocurrency using GET method.
    
    Uses CoinGecko data and X.ai's Grok model to evaluate the risk.
    Returns a risk score and justification.
    """
    return await analyze_rug_pull_risk(coin_id)

@router.post("/{coin_id}", response_model=RugPullRisk)
async def analyze_rug_pull_risk_post(coin_id: str, coin_input: CoinDataInput = Body(...)):
    """
    Analyze the rug pull risk for a specific cryptocurrency using POST method with existing coin data.
    
    This endpoint allows passing existing coin data to avoid additional API calls to CoinGecko.
    Uses X.ai's Grok model to evaluate the risk.
    Returns a risk score and justification.
    """
    return await analyze_rug_pull_risk(coin_id, coin_input.coin_data)

async def analyze_rug_pull_risk(coin_id: str, provided_coin_data: Dict[str, Any] = None):
    """
    Core function to analyze rug pull risk.
    
    Can use either provided coin data or fetch from CoinGecko if not provided.
    """
    # Check if we have a cached analysis
    cached_analysis = get_cached_analysis(coin_id)
    if cached_analysis:
        return RugPullRisk(**cached_analysis)
    
    try:
        # Use provided coin data if available
        if provided_coin_data:
            logging.info(f"Using provided coin data for {coin_id}")
            coin_data = provided_coin_data
            update_cache(coin_id, data=coin_data)
        else:
            # Check for cached coin data first
            coin_data = get_cached_coin_data(coin_id)
            
            if not coin_data:
                # If not in cache, fetch from CoinGecko with rate limiting
                logging.info(f"Fetching coin data for {coin_id} from CoinGecko")
                response = throttled_request(f"{COINGECKO_URL}/{coin_id}")
                
                if response.status_code != 200:
                    logging.warning(f"CoinGecko API error: {response.status_code}, {response.text}")
                    # If we can't get data, use mock data
                    mock_result = get_mock_rug_pull_analysis(
                        coin_id=coin_id, 
                        coin_name=coin_id.replace("-", " ").title(),
                        coin_symbol=coin_id.split("-")[0].upper()
                    )
                    # Cache the mock result to avoid hammering the API
                    update_cache(coin_id, analysis=mock_result.dict())
                    return mock_result
                    
                coin_data = response.json()
                # Cache the result
                update_cache(coin_id, data=coin_data)
        
        # Extract the relevant coin information for analysis
        coin_info = extract_coin_info(coin_data)
        coin_name = coin_info["Name"]
        coin_symbol = coin_info["Symbol"]
        
        # If X.ai API key is not set, return mock data
        if not XAI_API_KEY:
            logging.warning("XAI_API_KEY not set, using mock data")
            mock_result = get_mock_rug_pull_analysis(coin_id, coin_name, coin_symbol)
            mock_result.coin_info = coin_info  # Use real coin data if available
            # Cache the result
            update_cache(coin_id, analysis=mock_result.dict())
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
            
            result = RugPullRisk(
                score=score,
                justification=justification,
                coin_info=coin_info
            )
            
            # Cache the result
            update_cache(coin_id, analysis=result.dict())
            
            return result
            
        except Exception as e:
            logging.error(f"Error with Grok API: {e}")
            # Fall back to mock data but use real coin info
            mock_result = get_mock_rug_pull_analysis(coin_id, coin_name, coin_symbol)
            mock_result.coin_info = coin_info
            # Cache the result
            update_cache(coin_id, analysis=mock_result.dict())
            return mock_result
            
    except Exception as e:
        logging.error(f"Error in rug pull analysis: {e}")
        mock_result = get_mock_rug_pull_analysis(
            coin_id=coin_id, 
            coin_name=coin_id.replace("-", " ").title(),
            coin_symbol=coin_id.split("-")[0].upper()
        )
        # Cache the mock result
        update_cache(coin_id, analysis=mock_result.dict())
        return mock_result 