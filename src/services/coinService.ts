
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

// Get top coins by market cap
export const getTopCoins = async (perPage = 20, page = 1): Promise<Coin[]> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${perPage}&page=${page}&sparkline=false&price_change_percentage=24h`
    );
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching top coins:', error);
    return [];
  }
};

// Search for coins
export const searchCoins = async (query: string): Promise<Coin[]> => {
  if (!query || query.length < 2) return [];
  
  try {
    // First search for coins that match the query
    const searchResponse = await fetch(`${API_BASE_URL}/search?query=${encodeURIComponent(query)}`);
    
    if (!searchResponse.ok) {
      throw new Error('Network response was not ok');
    }
    
    const searchData = await searchResponse.json();
    const coinIds = searchData.coins.slice(0, 10).map((coin: any) => coin.id).join(',');
    
    if (!coinIds) return [];
    
    // Then fetch detailed data for those coins
    const coinsResponse = await fetch(
      `${API_BASE_URL}/coins/markets?vs_currency=usd&ids=${coinIds}&order=market_cap_desc&sparkline=false&price_change_percentage=24h`
    );
    
    if (!coinsResponse.ok) {
      throw new Error('Network response was not ok');
    }
    
    return await coinsResponse.json();
  } catch (error) {
    console.error('Error searching coins:', error);
    return [];
  }
};

// Get coin details
export const getCoinDetails = async (coinId: string): Promise<CoinDetail | null> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false`
    );
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching details for coin ${coinId}:`, error);
    return null;
  }
};
