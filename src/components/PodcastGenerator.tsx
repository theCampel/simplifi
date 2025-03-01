
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, DownloadCloud, Volume2 } from 'lucide-react';
import GlassMorphCard from './ui/GlassMorphCard';
import { useToast } from '@/hooks/use-toast';

const PodcastGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const generatePodcast = () => {
    setIsGenerating(true);
    setProgress(0);
    setIsComplete(false);
    
    // Simulate podcast generation with progress updates
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + Math.random() * 10;
        
        if (newProgress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsGenerating(false);
            setIsComplete(true);
            toast({
              title: "Podcast Ready",
              description: "Your crypto market summary podcast is ready to download",
              duration: 5000,
            });
          }, 500);
          return 100;
        }
        
        return newProgress;
      });
    }, 800);
  };

  const downloadPodcast = () => {
    // In a real app, this would download the actual .mp3 file
    toast({
      title: "Download Started",
      description: "Your podcast summary is being downloaded",
    });
    
    // Reset state after download
    setTimeout(() => {
      setIsComplete(false);
      setProgress(0);
    }, 2000);
  };

  return (
    <GlassMorphCard className="p-6 space-y-4">
      <div className="flex flex-col items-center text-center">
        <div className="bg-primary/10 p-3 rounded-full mb-4">
          <Volume2 className="h-6 w-6 text-primary" />
        </div>
        <h3 className="text-xl font-semibold mb-1">Podcast Summary Generator</h3>
        <p className="text-muted-foreground mb-4 max-w-md">
          Generate an AI-narrated podcast summarizing the latest crypto market movements and trends.
        </p>
        
        <div className="w-full max-w-md mt-4">
          {isGenerating && (
            <div className="mb-6 space-y-2">
              <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-center text-muted-foreground">
                Generating your podcast summary... {Math.round(progress)}%
              </p>
            </div>
          )}
          
          <div className="flex justify-center gap-4">
            <Button
              onClick={generatePodcast}
              disabled={isGenerating}
              className="relative overflow-hidden group"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  Generate Podcast
                </>
              )}
              <span 
                className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"
              />
            </Button>
            
            <Button
              onClick={downloadPodcast}
              variant="outline"
              disabled={!isComplete}
              className={`transition-all duration-500 ${
                isComplete ? 'opacity-100 scale-100' : 'opacity-50 scale-95 pointer-events-none'
              }`}
            >
              <DownloadCloud className="h-4 w-4 mr-2" />
              Download MP3
            </Button>
          </div>
        </div>
      </div>
    </GlassMorphCard>
  );
};

export default PodcastGenerator;
