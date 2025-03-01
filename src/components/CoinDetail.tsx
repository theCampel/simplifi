
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { CoinDetail as CoinDetailType } from '@/services/coinService';
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
  // Create safe mock price data even if coinDetail is null
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
  const currentPrice = coinDetail.current_price || 0;
  const priceChange = coinDetail.price_change_percentage_24h || 0;
  const isPositive = priceChange >= 0;
  const marketCap = coinDetail.market_cap || 0;
  const volume = coinDetail.total_volume || 0;
  const high24h = coinDetail.high_24h || 0;
  const low24h = coinDetail.low_24h || 0;
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
      
      {/* Price Chart */}
      <div className="h-[200px] mt-6 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={mockPriceHistory}
            margin={{
              top: 10,
              right: 20,
              left: 20,
              bottom: 10,
            }}
          >
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis dataKey="date" />
            <YAxis domain={['dataMin', 'dataMax']} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(8px)',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
              formatter={(value) => [`$${value.toLocaleString()}`, 'Price']}
            />
            <Area 
              type="monotone" 
              dataKey="price" 
              stroke="#8884d8" 
              fillOpacity={1} 
              fill="url(#colorPrice)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      {/* Coin Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="bg-secondary/30 rounded-lg p-3">
          <p className="text-xs text-muted-foreground">Market Cap</p>
          <p className="font-semibold">${marketCap.toLocaleString()}</p>
        </div>
        <div className="bg-secondary/30 rounded-lg p-3">
          <p className="text-xs text-muted-foreground">24h Volume</p>
          <p className="font-semibold">${volume.toLocaleString()}</p>
        </div>
        <div className="bg-secondary/30 rounded-lg p-3">
          <p className="text-xs text-muted-foreground">24h High</p>
          <p className="font-semibold">${high24h.toLocaleString()}</p>
        </div>
        <div className="bg-secondary/30 rounded-lg p-3">
          <p className="text-xs text-muted-foreground">24h Low</p>
          <p className="font-semibold">${low24h.toLocaleString()}</p>
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
    </GlassMorphCard>
  );
};

export default CoinDetail;
