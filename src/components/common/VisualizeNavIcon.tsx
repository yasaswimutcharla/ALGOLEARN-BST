import React from 'react';
import { Sparkles } from 'lucide-react';

/**
 * Visualize Navigation Icon matching the exact icon shown in the reference image (Lucide Sparkles):
 * - 4-pointed central sparkle
 * - Top-right small star cross
 * - Bottom-left small circle
 */
export const VisualizeNavIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => {
  return <Sparkles className={className} />;
};

export default VisualizeNavIcon;
