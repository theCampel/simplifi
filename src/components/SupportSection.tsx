
import React, { useState } from 'react';
import { Phone, Copy, Check } from 'lucide-react';
import GlassMorphCard from './ui/GlassMorphCard';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const SupportSection = () => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const phoneNumber = "+1 (406) 226-8261";
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(phoneNumber);
    setCopied(true);
    
    toast({
      title: "Phone number copied",
      description: "The support phone number has been copied to your clipboard",
    });
    
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <GlassMorphCard className="p-6">
      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="bg-primary/10 p-4 rounded-full flex-shrink-0">
          <Phone className="h-8 w-8 text-primary" />
        </div>
        
        <div className="flex-1 text-center md:text-left">
          <h3 className="text-xl font-semibold mb-1">Ring Gary</h3>
          <p className="text-muted-foreground mb-2">
            Gary is always on the line. He never EVER sleeps.
          </p>
          
          <div className="mt-4 flex flex-col sm:flex-row items-center gap-3">
            <div className="text-2xl font-medium tracking-wide">{phoneNumber}</div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={copyToClipboard}
              className="transition-all duration-300"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-1 text-crypto-green" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </GlassMorphCard>
  );
};

export default SupportSection;
