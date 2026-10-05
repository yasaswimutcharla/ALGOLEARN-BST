import React from 'react';

/**
 * Custom Visualize Navigation Icon matching the exact reference design:
 * - Sweeping magic arc curving from bottom-left to top-right
 * - Primary 4-pointed celestial sparkle near top-right
 * - Two smaller secondary 4-pointed sparkles (top-left & bottom-right)
 */
export const VisualizeNavIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Sweeping magic arc line */}
      <path
        d="M4.5 19.5C7.5 16 11 12.5 15.5 8.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      {/* Primary 4-pointed celestial sparkle near top right */}
      <path
        d="M18.5 2.5C18.5 4.6 19.7 5.8 21.8 5.8C19.7 5.8 18.5 7 18.5 9.1C18.5 7 17.3 5.8 15.2 5.8C17.3 5.8 18.5 4.6 18.5 2.5Z"
      />
      {/* Upper-left small 4-pointed sparkle */}
      <path
        d="M7 4C7 5.2 7.7 5.9 8.9 5.9C7.7 5.9 7 6.6 7 7.8C7 6.6 6.3 5.9 5.1 5.9C6.3 5.9 7 5.2 7 4Z"
      />
      {/* Lower-right small 4-pointed sparkle */}
      <path
        d="M19 13.5C19 14.7 19.7 15.4 20.9 15.4C19.7 15.4 19 16.1 19 17.3C19 16.1 18.3 15.4 17.1 15.4C18.3 15.4 19 14.7 19 13.5Z"
      />
    </svg>
  );
};

export default VisualizeNavIcon;
