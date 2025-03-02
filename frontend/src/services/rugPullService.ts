// API client for connecting to the backend rug pull analysis service

// The base URL for the backend API - use relative URL with Vite proxy 
const API_BASE_URL = '/api';

// Interface for the Rug Pull Risk data
export interface RugPullRisk {
  score: number;
  justification: string;
  coin_info: {
    Name: string;
    Symbol: string;
    'Current Price': number;
    'Market Cap': number;
    '24h Trading Volume': number;
    'Circulating Supply': number;
    'Total Supply': number | null;
    'Max Supply': number | null;
    '24h Price Change': number;
    '24h Low': number;
    '24h High': number;
  };
}

// Client-side cache for rug pull analysis
interface CacheEntry {
  data: RugPullRisk;
  timestamp: number;
}

// Cache duration in milliseconds (4 hours)
const CACHE_DURATION = 4 * 60 * 60 * 1000;

// In-memory cache
const analysisCache: Record<string, CacheEntry> = {};

/**
 * Get cached analysis if available and not expired
 */
const getCachedAnalysis = (coinId: string): RugPullRisk | null => {
  const cached = analysisCache[coinId];
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`Using cached rug pull analysis for ${coinId}`);
    return cached.data;
  }
  return null;
};

/**
 * Save analysis to cache
 */
const cacheAnalysis = (coinId: string, data: RugPullRisk): void => {
  analysisCache[coinId] = {
    data,
    timestamp: Date.now()
  };
  
  // Optional: Also save to localStorage for persistence across sessions
  try {
    const cacheKey = `rugpull_${coinId}`;
    localStorage.setItem(cacheKey, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  } catch (error) {
    // Silent fail if localStorage is not available
  }
};

/**
 * Check localStorage for cached analysis
 */
const getLocalStorageCache = (coinId: string): RugPullRisk | null => {
  try {
    const cacheKey = `rugpull_${coinId}`;
    const cached = localStorage.getItem(cacheKey);
    
    if (cached) {
      const parsedCache = JSON.parse(cached) as CacheEntry;
      if (Date.now() - parsedCache.timestamp < CACHE_DURATION) {
        console.log(`Using localStorage cached rug pull analysis for ${coinId}`);
        // Update memory cache as well
        analysisCache[coinId] = parsedCache;
        return parsedCache.data;
      }
    }
  } catch (error) {
    // Silent fail if localStorage is not available or parsing fails
  }
  
  return null;
};

/**
 * Get rug pull risk analysis for a specific coin
 * @param coinId The CoinGecko ID of the coin
 * @param coinData Optional existing coin data to avoid extra API calls
 */
export const getRugPullAnalysis = async (coinId: string, coinData?: any): Promise<RugPullRisk | null> => {
  // First check memory cache
  const memoryCache = getCachedAnalysis(coinId);
  if (memoryCache) return memoryCache;
  
  // Then check localStorage cache
  const localStorageCache = getLocalStorageCache(coinId);
  if (localStorageCache) return localStorageCache;
  
  // If no cache, fetch from API
  try {
    console.log(`Fetching rug pull analysis for ${coinId} from API...`);
    
    let response;
    
    // If coin data is provided, use POST endpoint to avoid duplicate CoinGecko calls
    if (coinData) {
      console.log('Using existing coin data to avoid extra CoinGecko API calls');
      response = await fetch(`${API_BASE_URL}/rugpull/${coinId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ coin_data: coinData }),
      });
    } else {
      // Otherwise use the GET endpoint
      response = await fetch(`${API_BASE_URL}/rugpull/${coinId}`);
    }
    
    if (!response.ok) {
      console.error(`Failed to fetch rug pull analysis: ${response.status} ${response.statusText}`);
      return null;
    }
    
    const data = await response.json();
    
    // Cache the result
    cacheAnalysis(coinId, data);
    
    return data;
  } catch (error) {
    console.error('Error fetching rug pull analysis:', error);
    return null;
  }
}; 