
import React from 'react';
import { cn } from '@/lib/utils';

interface GlassMorphCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
  blur?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  intensity?: 'low' | 'medium' | 'high';
}

const GlassMorphCard = ({
  children,
  className,
  interactive = false,
  blur = 'md',
  intensity = 'medium',
  ...props
}: GlassMorphCardProps) => {
  const bgOpacity = {
    low: 'bg-opacity-5',
    medium: 'bg-opacity-10',
    high: 'bg-opacity-20',
  };

  const borderOpacity = {
    low: 'border-opacity-10',
    medium: 'border-opacity-20',
    high: 'border-opacity-30',
  };

  return (
    <div
      className={cn(
        'bg-white border border-white rounded-xl shadow-sm',
        bgOpacity[intensity],
        borderOpacity[intensity],
        `backdrop-blur-${blur}`,
        interactive && 'transition-all duration-300 hover:shadow-lg hover:scale-[1.01]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default GlassMorphCard;
