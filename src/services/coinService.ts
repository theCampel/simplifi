
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
    ath: { usd: number };
    atl: { usd: number };
    circulating_supply: number;
    max_supply: number;
    total_supply: number;
  };
}

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
      `${API_BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${perPage}&page=${page}&sparkline=false&price_change_percentage=24h`
    );
    
    if (!response.ok) {
      console.info('CoinGecko API rate limit reached, using mock data');
      return MOCK_COINS;
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching top coins:', error);
    // Return mock data instead of empty array to ensure UI still works
    return MOCK_COINS;
  }
};

// Search for coins
export const searchCoins = async (query: string): Promise<Coin[]> => {
  if (!query || query.length < 2) return [];
  
  try {
    // First search for coins that match the query
    const searchResponse = await fetch(`${API_BASE_URL}/search?query=${encodeURIComponent(query)}`);
    
    if (!searchResponse.ok) {
      // Return filtered mock data if API fails
      return MOCK_COINS.filter(coin => 
        coin.name.toLowerCase().includes(query.toLowerCase()) || 
        coin.symbol.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    const searchData = await searchResponse.json();
    const coinIds = searchData.coins.slice(0, 10).map((coin: any) => coin.id).join(',');
    
    if (!coinIds) return [];
    
    // Then fetch detailed data for those coins
    const coinsResponse = await fetch(
      `${API_BASE_URL}/coins/markets?vs_currency=usd&ids=${coinIds}&order=market_cap_desc&sparkline=false&price_change_percentage=24h`
    );
    
    if (!coinsResponse.ok) {
      return MOCK_COINS.filter(coin => 
        coin.name.toLowerCase().includes(query.toLowerCase()) || 
        coin.symbol.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    return await coinsResponse.json();
  } catch (error) {
    console.error('Error searching coins:', error);
    // Return filtered mock coins if there's an error
    return MOCK_COINS.filter(coin => 
      coin.name.toLowerCase().includes(query.toLowerCase()) || 
      coin.symbol.toLowerCase().includes(query.toLowerCase())
    );
  }
};

// Get coin details
export const getCoinDetails = async (coinId: string): Promise<CoinDetail | null> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false`
    );
    
    if (!response.ok) {
      console.info('CoinGecko API rate limit reached, using mock data for coin details');
      // Create a mock detail from the mock coins
      const mockCoin = MOCK_COINS.find(c => c.id === coinId);
      if (!mockCoin) return null;
      
      return {
        ...mockCoin,
        description: { 
          en: "This is a mock description since the CoinGecko API rate limit has been reached. In a production environment, you would implement proper API key authentication and rate limit handling." 
        },
        market_data: {
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
        en: "This is a mock description since there was an error fetching data from the CoinGecko API. In a production environment, you would implement proper error handling and fallbacks." 
      },
      market_data: {
        ath: { usd: mockCoin.current_price * 1.5 },
        atl: { usd: mockCoin.current_price * 0.5 },
        circulating_supply: 19000000,
        max_supply: 21000000,
        total_supply: 21000000
      }
    };
  }
};
