import React from 'react';
import CoinTracker from '@/components/CoinTracker';
import PodcastGenerator from '@/components/PodcastGenerator';
import SupportSection from '@/components/SupportSection';
import CoinNews from '@/components/CoinNews';
import GlassMorphCard from '@/components/ui/GlassMorphCard';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30">
      <div className="container py-8 px-4 md:px-6 mx-auto max-w-7xl">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight mb-2 bg-clip-text text-transparent bg-gradient-to-r from-crypto-blue to-crypto-indigo">
            SimpliFi
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Take the stress out of crypto. SimpliFi it.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <CoinTracker />
          </div>
          
          <div className="space-y-8">
            <PodcastGenerator />
            
            <SupportSection />
            
            <GlassMorphCard className="p-5">
              <CoinNews coinName={null} />
            </GlassMorphCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
