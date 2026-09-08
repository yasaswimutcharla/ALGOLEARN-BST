import React from 'react';

/**
 * FloatingChatBadge
 * Visual floating badge positioned at the bottom-right of the screen across all pages.
 * Intentionally inert with no interactive features, popups, or external access.
 */
export const FloatingChatBadge: React.FC = () => {
  return (
    <div
      id="floating-chat-badge"
      className="fixed bottom-6 right-6 z-40 w-14 h-14 sm:w-16 sm:h-16 select-none pointer-events-none drop-shadow-[0_10px_25px_rgba(79,70,229,0.35)] transition-transform duration-200"
      aria-hidden="true"
      role="presentation"
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          <linearGradient
            id="chatBubbleGradient"
            x1="12%"
            y1="10%"
            x2="88%"
            y2="92%"
          >
            <stop offset="0%" stopColor="#1e64ff" />
            <stop offset="40%" stopColor="#4348f5" />
            <stop offset="75%" stopColor="#6e2bf7" />
            <stop offset="100%" stopColor="#871ef8" />
          </linearGradient>
        </defs>

        {/* Outer Circular Gradient Background */}
        <circle cx="50" cy="50" r="48" fill="url(#chatBubbleGradient)" />

        {/* White Chat Speech Bubble Outline */}
        <path
          d="M 33.2 50
             A 18.5 18.5 0 1 1 46.8 65.2
             C 42.5 65.2 38.8 64.6 36.4 63.8
             C 34.5 63.2 33.2 64.2 33.5 62.0
             C 33.8 59.8 35.2 56.5 35.2 54.8
             C 35.2 53.2 34.0 51.5 33.2 50
             Z"
          fill="none"
          stroke="#ffffff"
          strokeWidth="5.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

export default FloatingChatBadge;
