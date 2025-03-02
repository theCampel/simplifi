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

/**
 * Get rug pull risk analysis for a specific coin
 */
export const getRugPullAnalysis = async (coinId: string): Promise<RugPullRisk | null> => {
  try {
    console.log(`Fetching rug pull analysis for ${coinId}...`);
    const response = await fetch(`${API_BASE_URL}/rugpull/${coinId}`);
    
    if (!response.ok) {
      console.error(`Failed to fetch rug pull analysis: ${response.status} ${response.statusText}`);
      return null;
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching rug pull analysis:', error);
    return null;
  }
}; 