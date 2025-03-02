import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, DownloadCloud, Volume2 } from 'lucide-react';
import GlassMorphCard from './ui/GlassMorphCard';
import { useToast } from '@/hooks/use-toast';
import { generatePodcast, PodcastData } from '@/services/backendService';

const PodcastGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [progress, setProgress] = useState(0);
  const [podcastData, setPodcastData] = useState<PodcastData | null>(null);
  const { toast } = useToast();

  const handleGeneratePodcast = async () => {
    setIsGenerating(true);
    setProgress(0);
    setIsComplete(false);
    setPodcastData(null);
    
    try {
      // Start progress animation (simulated)
      // Slower, more predictable progress
      let progressStep = 1;
      const interval = setInterval(() => {
        setProgress(prev => {
          // More gradual progression with smaller, increasingly slower steps
          // This creates a more realistic "work in progress" feel
          if (prev < 30) {
            // Start relatively quick (initial setup phase)
            return prev + progressStep;
          } else if (prev < 60) {
            // Slow down a bit (main processing phase)
            return prev + progressStep * 0.7;
          } else if (prev < 80) {
            // Slow down more (complex processing phase)
            return prev + progressStep * 0.5;
          } else {
            // Very slow for the final phase where it often "feels stuck" anyway
            return Math.min(prev + progressStep * 0.3, 90);
          }
        });
      }, 1000); // Increased from 800ms to 1500ms for slower updates
      
      // Make the actual API call
      const result = await generatePodcast({
        coin_ids: ['bitcoin', 'ethereum'], // Default coins to analyze
        duration_minutes: 5,
        voice_type: 'neutral',
        include_price_analysis: true
      });
      
      // Stop the interval and set to 100%
      clearInterval(interval);
      setProgress(100);
      setPodcastData(result);
      
      setTimeout(() => {
        setIsGenerating(false);
        setIsComplete(true);
        toast({
          title: "Podcast Ready",
          description: "Your crypto market summary podcast is ready to download",
          duration: 5000,
        });
      }, 500);
    } catch (error) {
      console.error('Error generating podcast:', error);
      toast({
        title: "Generation Failed",
        description: "There was an error generating your podcast",
        variant: "destructive",
        duration: 5000,
      });
      setIsGenerating(false);
    }
  };

  const downloadPodcast = () => {
    if (!podcastData || !podcastData.audio_url) {
      toast({
        title: "Download Failed",
        description: "Podcast data is not available",
        variant: "destructive"
      });
      return;
    }
    
    // Get base URL from current window location
    const baseUrl = window.location.origin;
    const apiUrl = `${baseUrl}/api`;
    
    // Create direct download link
    const downloadUrl = `${apiUrl}${podcastData.audio_url}`;
    console.log('Downloading from URL:', downloadUrl);
    
    // Create an anchor and trigger the download
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `crypto_podcast_${podcastData.podcast_id}.wav`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Download Started",
      description: "Your podcast summary is being downloaded",
    });
  };

  return (
    <GlassMorphCard className="p-6 space-y-4">
      <div className="flex flex-col items-center text-center">
        <div className="bg-primary/10 p-3 rounded-full mb-4">
          <Volume2 className="h-6 w-6 text-primary" />
        </div>
        <h3 className="text-xl font-semibold mb-1">Crypto, SimpliFied</h3>
        <p className="text-muted-foreground mb-4 max-w-md">
          Listen now. You'll be glad you did when you're rich.
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
              onClick={handleGeneratePodcast}
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
