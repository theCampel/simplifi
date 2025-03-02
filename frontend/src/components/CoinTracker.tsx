import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getTopCoins, searchCoins, getCoinDetails, Coin } from '@/services/coinService';
import SearchInput from './ui/SearchInput';
import CoinCard from './CoinCard';
import CoinDetail from './CoinDetail';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, Star } from 'lucide-react';
import GlassMorphCard from './ui/GlassMorphCard';

const CoinTracker = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('favoriteCoinIds');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedCoinId, setSelectedCoinId] = useState<string | null>(null);
  
  // Query for top coins
  const { 
    data: topCoins = [], 
    isLoading: isLoadingTop 
  } = useQuery({
    queryKey: ['topCoins'],
    queryFn: () => getTopCoins(9),
    staleTime: 60000, // 1 minute
  });
  
  // Query for search results
  const { 
    data: searchResults = [],
    isLoading: isLoadingSearch,
    refetch: refetchSearch,
  } = useQuery({
    queryKey: ['searchCoins', searchQuery],
    queryFn: () => searchCoins(searchQuery),
    enabled: searchQuery.length >= 2,
    staleTime: 30000, // 30 seconds
  });
  
  // Query for selected coin details
  const {
    data: selectedCoinDetails,
    isLoading: isLoadingCoinDetails,
  } = useQuery({
    queryKey: ['coinDetails', selectedCoinId],
    queryFn: () => getCoinDetails(selectedCoinId || ''),
    enabled: !!selectedCoinId,
    staleTime: 30000, // 30 seconds
  });
  
  // Filter coins for display
  const displayCoins = searchQuery.length >= 2 ? searchResults : topCoins;
  const favoriteCoins = displayCoins.filter(coin => favorites.includes(coin.id));
  
  // Toggle favorite status
  const toggleFavorite = (coinId: string) => {
    setFavorites(prev => {
      const newFavorites = prev.includes(coinId)
        ? prev.filter(id => id !== coinId)
        : [...prev, coinId];
      
      localStorage.setItem('favoriteCoinIds', JSON.stringify(newFavorites));
      return newFavorites;
    });
  };
  
  // Handle coin selection
  const handleCoinSelect = (coinId: string) => {
    setSelectedCoinId(coinId);
  };
  
  // Clear selected coin
  const clearSelectedCoin = () => {
    setSelectedCoinId(null);
  };
  
  // Handle search input changes
  const handleSearch = (value: string) => {
    setSearchQuery(value);
    // Clear selected coin when searching
    if (value.length >= 2) {
      setSelectedCoinId(null);
    }
  };
  
  // Show most positive and negative coins
  const topMovers = [...topCoins]
    .sort((a, b) => Math.abs(b.price_change_percentage_24h) - Math.abs(a.price_change_percentage_24h))
    .slice(0, 4);
  
  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight">Coin Tracker</h2>
        <SearchInput 
          onSearch={handleSearch} 
          placeholder="Search coins..."
          className="w-[300px]"
        />
      </div>
      
      {/* Selected Coin Detail View */}
      {selectedCoinId ? (
        <CoinDetail 
          coinDetail={selectedCoinDetails || null}
          isLoading={isLoadingCoinDetails}
          onClose={clearSelectedCoin}
        />
      ) : (
        <React.Fragment>
          {/* Top Movers Section */}
          <GlassMorphCard className="p-5 mt-4">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-crypto-blue" />
              <h3 className="text-base font-medium">Top Movers</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {isLoadingTop
                ? Array(4).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-24 rounded-xl" />
                  ))
                : topMovers.map(coin => {
                    const isPositive = coin.price_change_percentage_24h >= 0;
                    return (
                      <div 
                        key={coin.id} 
                        className="bg-secondary/30 rounded-xl p-3 transition-transform hover:scale-[1.02] duration-200 cursor-pointer"
                        onClick={() => handleCoinSelect(coin.id)}
                      >
                        <div className="flex items-center space-x-2">
                          <img src={coin.image} alt={coin.name} className="h-6 w-6 rounded-full" />
                          <span className="font-medium text-sm">{coin.symbol.toUpperCase()}</span>
                        </div>
                        <div className={`mt-2 text-lg font-semibold ${isPositive ? 'text-crypto-green' : 'text-crypto-red'}`}>
                          {isPositive ? '+' : ''}{coin.price_change_percentage_24h.toFixed(2)}%
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          ${coin.current_price.toLocaleString()}
                        </div>
                      </div>
                    );
                  })
              }
            </div>
          </GlassMorphCard>
          
          {/* Main Coin List */}
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="all" className="rounded-full">All Coins</TabsTrigger>
              <TabsTrigger value="favorites" className="rounded-full">
                <Star className="h-4 w-4 mr-1" /> Favorites
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {isLoadingTop && !searchQuery ? (
                  Array(9).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-36 rounded-xl" />
                  ))
                ) : isLoadingSearch && searchQuery.length >= 2 ? (
                  Array(3).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-36 rounded-xl" />
                  ))
                ) : displayCoins.length === 0 && searchQuery.length >= 2 ? (
                  <div className="col-span-full text-center py-10">
                    <p className="text-muted-foreground">No coins found matching "{searchQuery}"</p>
                  </div>
                ) : (
                  displayCoins.map((coin: Coin, index: number) => (
                    <CoinCard
                      key={coin.id}
                      coin={coin}
                      isFavorite={favorites.includes(coin.id)}
                      onToggleFavorite={toggleFavorite}
                      onClick={() => handleCoinSelect(coin.id)}
                      className={`transition-all duration-300 animate-fade-in`}
                    />
                  ))
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="favorites" className="mt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {favoriteCoins.length === 0 ? (
                  <div className="col-span-full text-center py-10">
                    <p className="text-muted-foreground">You haven't favorited any coins yet.</p>
                    <p className="text-sm text-muted-foreground mt-1">Use the star icon to add coins to your favorites.</p>
                  </div>
                ) : (
                  favoriteCoins.map((coin: Coin, index: number) => (
                    <CoinCard
                      key={coin.id}
                      coin={coin}
                      isFavorite={true}
                      onToggleFavorite={toggleFavorite}
                      onClick={() => handleCoinSelect(coin.id)}
                      className={`transition-all duration-300 animate-fade-in`}
                    />
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </React.Fragment>
      )}
    </div>
  );
};

export default CoinTracker;
