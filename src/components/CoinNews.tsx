import React, { useState, useEffect } from 'react';
import { NewsArticle, getNewsArticles } from '@/services/backendService';
import { Calendar, ExternalLink, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CoinNewsProps {
  coinName: string | null;
}

const CoinNews: React.FC<CoinNewsProps> = ({ coinName }) => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(0);
  // Dynamic articles per page: 1 for coin-specific news, 2 for general news
  const articlesPerPage = coinName ? 1 : 2;

  useEffect(() => {
    const fetchNews = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // If coinName is provided, fetch news for that specific coin
        const coins = coinName ? [coinName] : undefined;
        const response = await getNewsArticles(coins);
        setArticles(response.articles);
      } catch (err) {
        setError('Failed to load news articles');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchNews();
  }, [coinName]);
  
  // Calculate pagination
  const totalPages = Math.ceil(articles.length / articlesPerPage);
  const displayedArticles = articles.slice(
    currentPage * articlesPerPage, 
    (currentPage + 1) * articlesPerPage
  );
  
  // Handle page navigation
  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages - 1));
  };
  
  const goToPrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 0));
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };
  
  if (isLoading) {
    return (
      <div className="py-4">
        <h3 className="text-sm font-medium mb-4">Latest News</h3>
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 border-2 border-crypto-blue border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }
  
  if (error || articles.length === 0) {
    return (
      <div className="py-4">
        <h3 className="text-sm font-medium mb-4">Latest News</h3>
        <div className="bg-secondary/30 rounded-lg p-4 text-center">
          <p className="text-muted-foreground text-sm">
            {error || "No news articles found"}
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="py-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium">
          {coinName ? `${coinName} News` : 'Latest Crypto News'}
        </h3>
        
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <Button 
              variant="outline" 
              size="icon" 
              className="h-6 w-6"
              onClick={goToPrevPage} 
              disabled={currentPage === 0}
            >
              <ChevronLeft className="h-3 w-3" />
            </Button>
            <span className="text-xs mx-1">
              {currentPage + 1}/{totalPages}
            </span>
            <Button 
              variant="outline" 
              size="icon" 
              className="h-6 w-6"
              onClick={goToNextPage} 
              disabled={currentPage === totalPages - 1}
            >
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
      
      <div className="space-y-3">
        {displayedArticles.map((article, index) => (
          <div key={index} className="bg-secondary/30 rounded-lg p-3 hover:bg-secondary/40 transition-colors">
            <h4 className="font-medium text-sm mb-1">{article.title}</h4>
            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
              {article.summary}
            </p>
            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(article.timestamp)}</span>
                <span className="mx-1">•</span>
                <span>{article.source}</span>
              </div>
              <a 
                href={article.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-crypto-blue hover:underline"
              >
                Read more
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CoinNews; 