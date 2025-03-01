
import React from 'react';
import { Star, Bookmark } from 'lucide-react';
import { Coin } from '@/services/coinService';
import GlassMorphCard from './ui/GlassMorphCard';
import { cn } from '@/lib/utils';

interface CoinCardProps {
  coin: Coin;
  isFavorite: boolean;
  onToggleFavorite: (coinId: string) => void;
  onClick?: () => void;
  className?: string;
}

const CoinCard = ({
  coin,
  isFavorite,
  onToggleFavorite,
  onClick,
  className
}: CoinCardProps) => {
  const isPositive = coin.price_change_percentage_24h >= 0;
  
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(coin.id);
  };
  
  return (
    <GlassMorphCard 
      interactive 
      className={cn('p-4 w-full cursor-pointer animate-slideUp', className)}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative w-10 h-10 flex-shrink-0">
            <img src={coin.image} alt={coin.name} className="w-full h-full object-contain rounded-full" />
          </div>
          <div className="flex flex-col">
            <h3 className="font-medium text-sm">{coin.name}</h3>
            <p className="text-xs text-muted-foreground uppercase">{coin.symbol}</p>
          </div>
        </div>
        
        <button
          onClick={handleFavoriteClick}
          className="text-muted-foreground hover:text-crypto-yellow transition-colors duration-200"
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          {isFavorite ? (
            <Star className="h-5 w-5 fill-crypto-yellow text-crypto-yellow" />
          ) : (
            <Star className="h-5 w-5" />
          )}
        </button>
      </div>
      
      <div className="grid grid-cols-3 gap-2 mt-4">
        <div className="rounded-lg bg-secondary/40 p-2 text-center">
          <p className="text-xs text-muted-foreground">Price</p>
          <p className="font-medium">${coin.current_price.toLocaleString()}</p>
        </div>
        <div className="rounded-lg bg-secondary/40 p-2 text-center">
          <p className="text-xs text-muted-foreground">24h %</p>
          <p className={`font-medium ${isPositive ? 'text-crypto-green' : 'text-crypto-red'}`}>
            {isPositive ? '+' : ''}{coin.price_change_percentage_24h.toFixed(2)}%
          </p>
        </div>
        <div className="rounded-lg bg-secondary/40 p-2 text-center">
          <p className="text-xs text-muted-foreground">Volume</p>
          <p className="font-medium">${(coin.total_volume / 1000000).toFixed(1)}M</p>
        </div>
      </div>
    </GlassMorphCard>
  );
};

export default CoinCard;
