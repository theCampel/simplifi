import React, { useState, useEffect } from 'react';
import { AlertTriangle, Info, AlertCircle, CheckCircle, Loader2, Hourglass } from 'lucide-react';
import { getRugPullAnalysis, RugPullRisk } from '@/services/rugPullService';

interface RugPullAnalysisProps {
  coinId: string;
  coinData?: any; // Optional existing coin data to prevent duplicate API calls
}

const RugPullAnalysis: React.FC<RugPullAnalysisProps> = ({ coinId, coinData }) => {
  const [analysis, setAnalysis] = useState<RugPullRisk | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRateLimited, setIsRateLimited] = useState(false);

  useEffect(() => {
    const fetchAnalysis = async () => {
      if (!coinId) return;
      
      setIsLoading(true);
      setError(null);
      setIsRateLimited(false);
      
      try {
        // Pass the existing coin data to avoid duplicate CoinGecko API calls
        const data = await getRugPullAnalysis(coinId, coinData);
        if (data) {
          setAnalysis(data);
        } else {
          // Check if the error might be due to rate limiting
          setIsRateLimited(true);
          setError('API rate limits reached. Using cached data if available.');
        }
      } catch (err) {
        setError('An error occurred while analyzing rug pull risk');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAnalysis();
  }, [coinId, coinData]);
  
  // Function to determine risk level and styling
  const getRiskInfo = (score: number) => {
    if (score < 25) {
      return { 
        level: 'Low Risk', 
        icon: <CheckCircle className="h-6 w-6 text-crypto-green" />,
        color: 'text-crypto-green',
        bgColor: 'bg-crypto-green/10'
      };
    } else if (score < 50) {
      return { 
        level: 'Moderate Risk', 
        icon: <Info className="h-6 w-6 text-crypto-blue" />,
        color: 'text-crypto-blue',
        bgColor: 'bg-crypto-blue/10'
      };
    } else if (score < 75) {
      return { 
        level: 'High Risk', 
        icon: <AlertTriangle className="h-6 w-6 text-crypto-yellow" />,
        color: 'text-crypto-yellow',
        bgColor: 'bg-crypto-yellow/10'
      };
    } else {
      return { 
        level: 'Extreme Risk', 
        icon: <AlertCircle className="h-6 w-6 text-crypto-red" />,
        color: 'text-crypto-red',
        bgColor: 'bg-crypto-red/10'
      };
    }
  };

  if (isLoading) {
    return (
      <div className="mt-4 border-t border-border/40 pt-4">
        <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-crypto-yellow" />
          Rug Pull Analysis
        </h3>
        <div className="flex justify-center items-center h-24">
          <Loader2 className="h-8 w-8 animate-spin text-crypto-indigo/60" />
        </div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="mt-4 border-t border-border/40 pt-4">
        <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-crypto-yellow" />
          Rug Pull Analysis
        </h3>
        <div className="bg-secondary/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            {isRateLimited ? (
              <Hourglass className="h-5 w-5 text-crypto-yellow" />
            ) : (
              <AlertCircle className="h-5 w-5 text-crypto-red" />
            )}
            <span className="text-sm font-medium">
              {isRateLimited ? 'CoinGecko API Rate Limit Reached' : 'Unable to load analysis'}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {isRateLimited
              ? 'Analysis will be available once API rate limits reset. The free CoinGecko API has strict rate limits.'
              : 'Unable to perform rug pull analysis at this time. Please try again later.'}
          </p>
        </div>
      </div>
    );
  }

  const riskInfo = getRiskInfo(analysis.score);

  return (
    <div className="mt-4 border-t border-border/40 pt-4">
      <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-crypto-yellow" />
        Rug Pull Analysis
      </h3>
      
      <div className="bg-secondary/30 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {riskInfo.icon}
            <span className={`font-medium ${riskInfo.color}`}>{riskInfo.level}</span>
          </div>
          <div className="flex items-center">
            <div className={`text-sm font-bold px-2 py-0.5 rounded ${riskInfo.bgColor} ${riskInfo.color}`}>
              {analysis.score}/100
            </div>
          </div>
        </div>
        
        <div className="bg-secondary/30 rounded-md p-3 text-sm">
          {analysis.justification}
        </div>
        
        {/* Risk meter */}
        <div className="mt-3">
          <div className="h-1.5 bg-secondary/50 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-crypto-green via-crypto-yellow to-crypto-red rounded-full"
              style={{ width: '100%' }}
            ></div>
          </div>
          <div className="relative h-1 mt-0.5">
            <div 
              className="absolute top-0 w-2 h-2 bg-white rounded-full -mt-1 transform -translate-x-1/2"
              style={{ left: `${analysis.score}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RugPullAnalysis; 