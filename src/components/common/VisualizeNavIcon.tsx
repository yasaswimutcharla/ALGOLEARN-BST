import React from 'react';

/**
 * Visualize Navigation Icon:
 * Completely removed previous star / sparkle / magic wand shapes per user requirements.
 * Prepared to receive the exact vector/SVG symbol from the user's uploaded reference image.
 */
export const VisualizeNavIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Node / Tree visualization graph icon (neutral, zero stars/sparkles) */}
      <circle cx="12" cy="5" r="2.5" />
      <circle cx="6" cy="18" r="2.5" />
      <circle cx="18" cy="18" r="2.5" />
      <path d="M7.8 15.8L10.5 7.5" />
      <path d="M16.2 15.8L13.5 7.5" />
    </svg>
  );
};

export default VisualizeNavIcon;
