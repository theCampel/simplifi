// Types for our coin data
export interface Coin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  price_change_percentage_24h: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  last_updated: string;
}

export interface CoinDetail extends Coin {
  description: { en: string };
  market_data: {
    current_price: { usd: number };
    market_cap: { usd: number };
    total_volume: { usd: number };
    high_24h: { usd: number };
    low_24h: { usd: number };
    price_change_percentage_24h: number;
    ath: { usd: number };
    atl: { usd: number };
    circulating_supply: number;
    max_supply: number;
    total_supply: number;
  };
}

export interface HistoricalPriceData {
  prices: [number, number][]; // [timestamp, price]
  market_caps: [number, number][];
  total_volumes: [number, number][];
}

export interface ChartDataPoint {
  date: string;
  price: number;
}

/**
 * CoinGecko API Key Manager
 * Manages multiple API keys and rotates between them to avoid rate limiting
 */
class ApiKeyManager {
  private keys: string[] = [];
  private currentKeyIndex: number = 0;
  private lastUsedTime: number = 0;
  private cooldownPeriod: number = 1000; // 1 second cooldown between requests

  constructor() {
    this.initializeKeys();
  }

  private initializeKeys() {
    // Get API keys from environment variables
    const primaryKey = import.meta.env.VITE_COINGECKO_API_KEY;
    const secondaryKey = import.meta.env.VITE_COINGECKO_API_KEY_2;
    
    if (primaryKey) this.keys.push(primaryKey);
    if (secondaryKey) this.keys.push(secondaryKey);
    
    console.log(`Initialized API key manager with ${this.keys.length} keys`);
  }

  /**
   * Get the next available API key
   * @returns API key or empty string if no keys are available
   */
  public getKey(): string {
    if (this.keys.length === 0) return '';
    
    // Get current time
    const now = Date.now();
    
    // If we have multiple keys and we're within cooldown period, rotate to next key
    if (this.keys.length > 1 && (now - this.lastUsedTime) < this.cooldownPeriod) {
      this.currentKeyIndex = (this.currentKeyIndex + 1) % this.keys.length;
    }
    
    // Update last used time
    this.lastUsedTime = now;
    
    return this.keys[this.currentKeyIndex];
  }

  /**
   * Get headers with API key if available
   */
  public getHeaders(): HeadersInit {
    const key = this.getKey();
    return key ? { 'x-cg-api-key': key } : {};
  }
}

// Initialize the API key manager
const apiKeyManager = new ApiKeyManager();

const API_BASE_URL = 'https://api.coingecko.com/api/v3';

// Mock data for when API fails (CoinGecko has rate limits)
const MOCK_COINS: Coin[] = [
  {
    id: "bitcoin",
    symbol: "btc",
    name: "Bitcoin",
    image: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
    current_price: 65234.12,
    market_cap: 1278961235432,
    market_cap_rank: 1,
    price_change_percentage_24h: 2.34,
    total_volume: 32456789012,
    high_24h: 65834.21,
    low_24h: 64532.45,
    last_updated: new Date().toISOString()
  },
  {
    id: "ethereum",
    symbol: "eth",
    name: "Ethereum",
    image: "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
    current_price: 3456.78,
    market_cap: 415678901234,
    market_cap_rank: 2,
    price_change_percentage_24h: -1.23,
    total_volume: 15678901234,
    high_24h: 3512.34,
    low_24h: 3402.56,
    last_updated: new Date().toISOString()
  },
  {
    id: "binancecoin",
    symbol: "bnb",
    name: "BNB",
    image: "https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png",
    current_price: 567.89,
    market_cap: 87654321098,
    market_cap_rank: 3,
    price_change_percentage_24h: 0.56,
    total_volume: 2345678901,
    high_24h: 573.21,
    low_24h: 563.45,
    last_updated: new Date().toISOString()
  },
  {
    id: "solana",
    symbol: "sol",
    name: "Solana",
    image: "https://assets.coingecko.com/coins/images/4128/large/solana.png",
    current_price: 123.45,
    market_cap: 45678901234,
    market_cap_rank: 4,
    price_change_percentage_24h: 4.56,
    total_volume: 3456789012,
    high_24h: 126.78,
    low_24h: 119.23,
    last_updated: new Date().toISOString()
  },
  {
    id: "ripple",
    symbol: "xrp",
    name: "XRP",
    image: "https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png",
    current_price: 0.5678,
    market_cap: 23456789012,
    market_cap_rank: 5,
    price_change_percentage_24h: -0.23,
    total_volume: 1234567890,
    high_24h: 0.5712,
    low_24h: 0.5643,
    last_updated: new Date().toISOString()
  },
  {
    id: "cardano",
    symbol: "ada",
    name: "Cardano",
    image: "https://assets.coingecko.com/coins/images/975/large/cardano.png",
    current_price: 0.4567,
    market_cap: 16789012345,
    market_cap_rank: 6,
    price_change_percentage_24h: 1.23,
    total_volume: 789012345,
    high_24h: 0.4612,
    low_24h: 0.4503,
    last_updated: new Date().toISOString()
  }
];

// Get top coins by market cap
export const getTopCoins = async (perPage = 20, page = 1): Promise<Coin[]> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${perPage}&page=${page}&sparkline=false&price_change_percentage=24h`,
      { headers: apiKeyManager.getHeaders() }
    );
    
    if (!response.ok) {
      console.info('CoinGecko API rate limit reached, using mock data');
      return MOCK_COINS.slice(0, perPage);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching top coins:', error);
    // Return mock data instead of empty array to ensure UI still works
    return MOCK_COINS.slice(0, perPage);
  }
};

// Search for coins
export const searchCoins = async (query: string): Promise<Coin[]> => {
  if (!query || query.length < 2) return [];
  
  // Immediately filter mock data for fast fallback
  const filteredMockCoins = MOCK_COINS.filter(coin => 
    coin.name.toLowerCase().includes(query.toLowerCase()) || 
    coin.symbol.toLowerCase().includes(query.toLowerCase())
  );
  
  try {
    // Start a timeout to provide mock data if API takes too long
    const timeoutPromise = new Promise<Coin[]>((resolve) => {
      setTimeout(() => {
        console.info('Search API call taking too long, returning mock data');
        resolve(filteredMockCoins);
      }, 400); // Return mock data after 400ms
    });
    
    // Actual API search promise
    const apiSearchPromise = (async () => {
      try {
        console.log(`Searching for coins matching "${query}"...`);
        
        // First search for coins that match the query
        const searchResponse = await fetch(
          `${API_BASE_URL}/search?query=${encodeURIComponent(query)}`,
          { headers: apiKeyManager.getHeaders() }
        );
        
        if (!searchResponse.ok) {
          if (searchResponse.status === 429) {
            console.warn('CoinGecko API rate limit reached (429) on search endpoint');
          } else {
            console.warn(`API search failed with status: ${searchResponse.status}`);
          }
          return filteredMockCoins;
        }
        
        const searchData = await searchResponse.json();
        
        // Check if we have coins in the result
        if (!searchData.coins || searchData.coins.length === 0) {
          console.info('No coins found in search results');
          return [];
        }
        
        console.log(`Found ${searchData.coins.length} matching coins, fetching details...`);
        
        // Then get detailed market data for those coins
        const coinIds = searchData.coins.slice(0, 10).map(c => c.id).join(',');
        const coinsResponse = await fetch(
          `${API_BASE_URL}/coins/markets?vs_currency=usd&ids=${coinIds}&order=market_cap_desc&sparkline=false&price_change_percentage=24h`,
          { headers: apiKeyManager.getHeaders() }
        );
        
        if (!coinsResponse.ok) {
          if (coinsResponse.status === 429) {
            console.warn('CoinGecko API rate limit reached (429) on markets endpoint');
          } else {
            console.warn(`API market data failed with status: ${coinsResponse.status}`);
          }
          return filteredMockCoins;
        }
        
        const coins = await coinsResponse.json();
        console.log(`Successfully loaded ${coins.length} coins with details`);
        return coins;
      } catch (error) {
        console.error('Error in API search:', error);
        return filteredMockCoins;
      }
    })();
    
    // Race between the API call and the timeout
    return Promise.race([apiSearchPromise, timeoutPromise]);
  } catch (error) {
    console.error('Error searching coins:', error);
    return filteredMockCoins;
  }
};

// Get coin details
export const getCoinDetails = async (coinId: string): Promise<CoinDetail | null> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false`,
      { headers: apiKeyManager.getHeaders() }
    );
    
    if (!response.ok) {
      console.info('CoinGecko API rate limit reached, using mock data for coin details');
      // Create a mock detail from the mock coins
      const mockCoin = MOCK_COINS.find(c => c.id === coinId);
      if (!mockCoin) return null;
      
      return {
        ...mockCoin,
        description: { 
          en: "This is a mock description since the CoinGecko API rate limit has been reached." 
        },
        market_data: {
          current_price: { usd: mockCoin.current_price },
          market_cap: { usd: mockCoin.market_cap },
          total_volume: { usd: mockCoin.total_volume },
          high_24h: { usd: mockCoin.high_24h },
          low_24h: { usd: mockCoin.low_24h },
          price_change_percentage_24h: mockCoin.price_change_percentage_24h,
          ath: { usd: mockCoin.current_price * 1.5 },
          atl: { usd: mockCoin.current_price * 0.5 },
          circulating_supply: 19000000,
          max_supply: 21000000,
          total_supply: 21000000
        }
      };
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching details for coin ${coinId}:`, error);
    
    // Return mock data for the requested coin
    const mockCoin = MOCK_COINS.find(c => c.id === coinId);
    if (!mockCoin) return null;
    
    return {
      ...mockCoin,
      description: { 
        en: "This is a mock description since there was an error fetching data from the CoinGecko API. " 
      },
      market_data: {
        current_price: { usd: mockCoin.current_price },
        market_cap: { usd: mockCoin.market_cap },
        total_volume: { usd: mockCoin.total_volume },
        high_24h: { usd: mockCoin.high_24h },
        low_24h: { usd: mockCoin.low_24h },
        price_change_percentage_24h: mockCoin.price_change_percentage_24h,
        ath: { usd: mockCoin.current_price * 1.5 },
        atl: { usd: mockCoin.current_price * 0.5 },
        circulating_supply: 19000000,
        max_supply: 21000000,
        total_supply: 21000000
      }
    };
  }
};

// Get historical price data for a coin
export const getCoinHistoricalData = async (
  coinId: string, 
  days: number = 30
): Promise<ChartDataPoint[]> => {
  try {
    const url = `${API_BASE_URL}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`;
    const headers: HeadersInit = apiKeyManager.getHeaders();
    
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      console.info('CoinGecko API rate limit reached, using mock data for historical prices');
      return generateMockHistoricalData(coinId, days);
    }
    
    const data: HistoricalPriceData = await response.json();
    
    // Transform the data for the chart
    return data.prices.map(([timestamp, price]) => ({
      date: new Date(timestamp).toLocaleDateString(),
      price
    }));
  } catch (error) {
    console.error(`Error fetching historical data for coin ${coinId}:`, error);
    return generateMockHistoricalData(coinId, days);
  }
};

// Generate mock historical data when API fails
const generateMockHistoricalData = (coinId: string, days: number): ChartDataPoint[] => {
  // Find the coin in our mock data to use its price as a base
  const mockCoin = MOCK_COINS.find(c => c.id === coinId);
  const basePrice = mockCoin?.current_price || 1000;
  
  const result: ChartDataPoint[] = [];
  const now = new Date();
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Generate a somewhat realistic price variation
    const randomFactor = 0.9 + (Math.random() * 0.2); // Between 0.9 and 1.1
    const dayFactor = 1 + ((days - i) / days) * 0.3; // Trending upward over time
    
    result.push({
      date: date.toLocaleDateString(),
      price: basePrice * randomFactor * dayFactor
    });
  }
  
  return result;
};
