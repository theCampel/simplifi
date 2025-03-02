// API client for connecting to the SimpliFi backend services

// The base URL for the backend API - use relative URL with Vite proxy
const API_BASE_URL = '/api';

// Types for the API responses
export interface NewsArticle {
  title: string;
  source: string;
  url: string;
  timestamp: string;
  summary: string;
  sentiment?: number;
  sentiment_label?: string;
  mentioned_coins?: string[];
}

export interface NewsOverview {
  sentiment: number;
  sentiment_label: string;
  trending_topics: string[];
  timestamp: string;
}

export interface NewsSummary {
  articles: NewsArticle[];
  market_overview: NewsOverview;
}

export interface PodcastData {
  podcast_id: string;
  title: string;
  audio_url: string;
  coins_covered: string[];
  duration_seconds: number;
  transcript_excerpt: string;
  voice_type: string;
  created_at: string;
  expires_at: string | null;
}

export interface VoiceOption {
  id: string;
  name: string;
  description: string;
}

// New interface for the news articles response
export interface NewsArticlesResponse {
  articles: NewsArticle[];
  query: string;
  timestamp: string;
}

// News API functions
export const getNewsSummary = async (): Promise<NewsSummary> => {
  try {
    const response = await fetch(`${API_BASE_URL}/news/summary`);
    if (!response.ok) {
      throw new Error(`Failed to fetch news summary: ${response.status}`);
    }
    const data = await response.json();
    return data.data as NewsSummary;
  } catch (error) {
    console.error('Error fetching news summary:', error);
    throw error;
  }
};

export const getTrendingTopics = async (): Promise<any[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/news/trending`);
    if (!response.ok) {
      throw new Error(`Failed to fetch trending topics: ${response.status}`);
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching trending topics:', error);
    throw error;
  }
};

export const getNewsArticles = async (coins?: string[]): Promise<NewsArticlesResponse> => {
  try {
    let url = `${API_BASE_URL}/news/articles`;
    
    // Add coins as query parameter if provided
    if (coins && coins.length > 0) {
      url += `?coins=${coins.join(',')}`;
    }
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch news articles: ${response.status}`);
    }
    const data = await response.json();
    return data.data as NewsArticlesResponse;
  } catch (error) {
    console.error('Error fetching news articles:', error);
    throw error;
  }
};

// Podcast API functions
export interface PodcastGenerationOptions {
  coin_ids: string[];
  duration_minutes?: number;
  voice_type?: string;
  include_price_analysis?: boolean;
}

export const generatePodcast = async (options: PodcastGenerationOptions): Promise<PodcastData> => {
  try {
    const response = await fetch(`${API_BASE_URL}/podcasts/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        coin_ids: options.coin_ids,
        duration_minutes: options.duration_minutes || 5,
        voice_type: options.voice_type || 'neutral',
        include_price_analysis: options.include_price_analysis !== false,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to generate podcast: ${response.status}`);
    }
    
    const data = await response.json();
    return data.data as PodcastData;
  } catch (error) {
    console.error('Error generating podcast:', error);
    throw error;
  }
};

export const getAvailableVoices = async (): Promise<VoiceOption[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/podcasts/voices`);
    if (!response.ok) {
      throw new Error(`Failed to fetch available voices: ${response.status}`);
    }
    const data = await response.json();
    return data.data as VoiceOption[];
  } catch (error) {
    console.error('Error fetching available voices:', error);
    throw error;
  }
}; 