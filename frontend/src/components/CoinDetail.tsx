import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { 
  CoinDetail as CoinDetailType, 
  getCoinHistoricalData,
  ChartDataPoint
} from '@/services/coinService';
import { Button } from '@/components/ui/button';
import GlassMorphCard from './ui/GlassMorphCard';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';
import CoinNews from './CoinNews';
import RugPullAnalysis from './RugPullAnalysis';

interface CoinDetailProps {
  coinDetail: CoinDetailType | null;
  isLoading: boolean;
  onClose: () => void;
}

const CoinDetail = ({ 
  coinDetail, 
  isLoading, 
  onClose 
}: CoinDetailProps) => {
  const [historicalData, setHistoricalData] = useState<ChartDataPoint[]>([]);
  const [timeFrame, setTimeFrame] = useState<number>(30); // Default 30 days
  const [isChartLoading, setIsChartLoading] = useState<boolean>(false);
  
  // Fetch historical data when coinDetail or timeFrame changes
  useEffect(() => {
    const fetchHistoricalData = async () => {
      if (coinDetail?.id) {
        setIsChartLoading(true);
        try {
          const data = await getCoinHistoricalData(coinDetail.id, timeFrame);
          setHistoricalData(data);
        } catch (error) {
          console.error('Failed to fetch historical data:', error);
        } finally {
          setIsChartLoading(false);
        }
      }
    };
    
    fetchHistoricalData();
  }, [coinDetail?.id, timeFrame]);
  
  // Create safe mock price data even if coinDetail is null (fallback)
  const basePrice = coinDetail?.current_price || 1000;
  const mockPriceHistory = [
    { date: 'Jan', price: basePrice * 0.7 },
    { date: 'Feb', price: basePrice * 0.9 },
    { date: 'Mar', price: basePrice * 0.8 },
    { date: 'Apr', price: basePrice * 1.1 },
    { date: 'May', price: basePrice * 1.3 },
    { date: 'Jun', price: basePrice * 0.95 },
    { date: 'Jul', price: basePrice },
  ];
  
  // Use real data if available, otherwise fall back to mock data
  const chartData = historicalData.length > 0 ? historicalData : mockPriceHistory;
  
  if (isLoading) {
    return (
      <GlassMorphCard className="p-5 animate-fade-in h-[450px] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 border-4 border-crypto-blue border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-muted-foreground">Loading coin details...</p>
        </div>
      </GlassMorphCard>
    );
  }
  
  if (!coinDetail) {
    return (
      <GlassMorphCard className="p-5 animate-fade-in h-[450px] flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Failed to load coin details.</p>
          <Button onClick={onClose} variant="outline" className="mt-4">
            Go Back
          </Button>
        </div>
      </GlassMorphCard>
    );
  }

  // Safely extract values with fallbacks to prevent undefined errors
  const currentPrice = coinDetail.market_data?.current_price?.usd || coinDetail.current_price || 0;
  const priceChange = coinDetail.market_data?.price_change_percentage_24h || coinDetail.price_change_percentage_24h || 0;
  const isPositive = priceChange >= 0;
  const marketCap = coinDetail.market_data?.market_cap?.usd || coinDetail.market_cap || 0;
  const volume = coinDetail.market_data?.total_volume?.usd || coinDetail.total_volume || 0;
  const high24h = coinDetail.market_data?.high_24h?.usd || coinDetail.high_24h || 0;
  const low24h = coinDetail.market_data?.low_24h?.usd || coinDetail.low_24h || 0;
  const description = coinDetail.description?.en || '';
  
  return (
    <GlassMorphCard className="p-5 animate-fade-in overflow-hidden">
      <div className="flex justify-between items-center mb-5">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="rounded-full hover:bg-secondary/40"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center">
            {coinDetail.image && (
              <img 
                src={coinDetail.image} 
                alt={coinDetail.name} 
                className="w-8 h-8 mr-2 rounded-full" 
              />
            )}
            <h2 className="text-xl font-semibold">{coinDetail.name}</h2>
            <span className="ml-2 text-sm text-muted-foreground uppercase">
              {coinDetail.symbol}
            </span>
          </div>
        </div>
        
        <div className="text-right">
          <p className="text-xl font-bold">
            ${currentPrice.toLocaleString()}
          </p>
          <p className={`text-sm font-medium ${isPositive ? 'text-crypto-green' : 'text-crypto-red'}`}>
            {isPositive ? '+' : ''}{priceChange.toFixed(2)}%
          </p>
        </div>
      </div>
      
      {/* Time frame selector */}
      <div className="flex gap-2 mb-2">
        <Button 
          variant={timeFrame === 1 ? "default" : "outline"} 
          size="sm" 
          onClick={() => setTimeFrame(1)}
          className="text-xs"
        >
          24h
        </Button>
        <Button 
          variant={timeFrame === 7 ? "default" : "outline"} 
          size="sm" 
          onClick={() => setTimeFrame(7)}
          className="text-xs"
        >
          7d
        </Button>
        <Button 
          variant={timeFrame === 30 ? "default" : "outline"} 
          size="sm" 
          onClick={() => setTimeFrame(30)}
          className="text-xs"
        >
          30d
        </Button>
        <Button 
          variant={timeFrame === 90 ? "default" : "outline"} 
          size="sm" 
          onClick={() => setTimeFrame(90)}
          className="text-xs"
        >
          90d
        </Button>
        <Button 
          variant={timeFrame === 365 ? "default" : "outline"} 
          size="sm" 
          onClick={() => setTimeFrame(365)}
          className="text-xs"
        >
          1y
        </Button>
      </div>
      
      {/* Price Chart */}
      <div className="h-[220px] mt-3 mb-6 relative">
        {isChartLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-10">
            <div className="h-8 w-8 border-2 border-crypto-blue border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{
              top: 15,
              right: 30,
              left: 30,
              bottom: 15,
            }}
          >
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => {
                // For time frames of 30 days or more, simplify the date display
                if (timeFrame >= 30) {
                  // Try to extract just the month/day or month
                  const parts = value.split('/');
                  if (parts.length >= 2) {
                    return parts.slice(0, 2).join('/'); // Just month/day
                  }
                }
                return value;
              }}
              tickMargin={5}
              axisLine={{ stroke: '#8884d8', strokeOpacity: 0.2 }}
            />
            <YAxis 
              domain={['auto', 'auto']}
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => {
                // Format large numbers and use $ prefix
                if (value >= 1000) {
                  return `$${(value / 1000).toFixed(1)}k`;
                } else if (value >= 1000000) {
                  return `$${(value / 1000000).toFixed(1)}M`;
                }
                return `$${value.toFixed(value < 1 ? 4 : 0)}`;
              }}
              tickMargin={5}
              axisLine={{ stroke: '#8884d8', strokeOpacity: 0.2 }}
              width={60}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(8px)',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                padding: '8px',
              }}
              formatter={(value) => [`$${value.toLocaleString()}`, 'Price']}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Area 
              type="monotone" 
              dataKey="price" 
              stroke="#8884d8" 
              fillOpacity={1} 
              fill="url(#colorPrice)" 
              activeDot={{ r: 6, strokeWidth: 1 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      {/* Coin Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="bg-secondary/30 rounded-lg p-3">
          <p className="text-xs text-muted-foreground">Market Cap</p>
          <p className="font-semibold">${formatLargeNumber(marketCap)}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Rank #{coinDetail.market_cap_rank || 'N/A'}
          </p>
        </div>
        <div className="bg-secondary/30 rounded-lg p-3">
          <p className="text-xs text-muted-foreground">24h Volume</p>
          <p className="font-semibold">${formatLargeNumber(volume)}</p>
          <p className="text-xs mt-1">
            <span className={`${volume > marketCap * 0.1 ? 'text-crypto-green' : 'text-muted-foreground'}`}>
              {((volume / marketCap) * 100).toFixed(1)}% of cap
            </span>
          </p>
        </div>
        <div className="bg-secondary/30 rounded-lg p-3">
          <p className="text-xs text-muted-foreground">24h Range</p>
          <div className="flex items-center justify-between">
            <span className="text-crypto-red text-xs font-medium">${low24h.toLocaleString()}</span>
            <span className="text-crypto-green text-xs font-medium">${high24h.toLocaleString()}</span>
          </div>
          <div className="h-1.5 bg-secondary/50 rounded-full mt-1.5 mb-1 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-crypto-red via-crypto-indigo to-crypto-green rounded-full"
              style={{ 
                width: '100%'
              }}
            ></div>
          </div>
          <div className="relative h-1">
            <div 
              className="absolute top-0 w-1.5 h-1.5 bg-white rounded-full -mt-1 transform -translate-x-1/2"
              style={{ 
                left: `${Math.max(0, Math.min(100, ((currentPrice - low24h) / (high24h - low24h)) * 100))}%` 
              }}
            ></div>
          </div>
        </div>
        <div className="bg-secondary/30 rounded-lg p-3">
          <div className="flex justify-between items-start">
            <p className="text-xs text-muted-foreground">Price Change</p>
            <div className="flex items-center">
              <div className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${isPositive ? 'bg-crypto-green/20 text-crypto-green' : 'bg-crypto-red/20 text-crypto-red'}`}>
                24h
              </div>
            </div>
          </div>
          <p className={`font-semibold ${isPositive ? 'text-crypto-green' : 'text-crypto-red'}`}>
            {isPositive ? '+' : ''}{priceChange.toFixed(2)}%
          </p>
          <p className={`text-xs mt-1 ${isPositive ? 'text-crypto-green' : 'text-crypto-red'}`}>
            {isPositive ? '↑' : '↓'} ${Math.abs((currentPrice * priceChange / 100) || 0).toLocaleString()}
          </p>
        </div>
      </div>
      
      {/* Description */}
      {description && (
        <div className="mt-4">
          <h3 className="text-sm font-medium mb-2">About {coinDetail.name}</h3>
          <div 
            className="text-sm text-muted-foreground overflow-y-auto max-h-[150px] pr-2"
            dangerouslySetInnerHTML={{ 
              __html: description.substring(0, 300) + 
                (description.length > 300 ? '...' : '') 
            }}
          />
        </div>
      )}
      
      {/* News Section */}
      <div className="mt-4 border-t border-border/40 pt-4">
        <CoinNews coinName={coinDetail.name} />
      </div>
      
      {/* Rug Pull Analysis Section */}
      <RugPullAnalysis coinId={coinDetail.id} coinData={coinDetail} />
    </GlassMorphCard>
  );
};

const formatLargeNumber = (num: number): string => {
  if (num >= 1000000000) {
    return `${(num / 1000000000).toFixed(2)}B`;
  } else if (num >= 1000000) {
    return `${(num / 1000000).toFixed(2)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(2)}K`;
  }
  return num.toLocaleString();
};

export default CoinDetail;
