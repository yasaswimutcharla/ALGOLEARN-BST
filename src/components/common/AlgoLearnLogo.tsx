import React from 'react';

interface AlgoLearnLogoProps {
  className?: string;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * AlgoLearnLogo
 * Faithful reproduction of the AlgoLearn brand logo:
 * - 3D isometric Graduation Cap with glowing blue top, purple base, and electric blue tassel
 * - "Algo" in bold high-contrast text + "Learn" in blue-to-purple gradient
 * - "YOUR DSA JOURNEY" tracked uppercase subtitle
 */
export const AlgoLearnLogo: React.FC<AlgoLearnLogoProps> = ({
  className = '',
  onClick,
  size = 'md',
}) => {
  return (
    <div
      id="algolearn-brand-logo"
      onClick={onClick}
      className={`flex items-center gap-2.5 sm:gap-3 select-none ${
        onClick ? 'cursor-pointer group' : ''
      } ${className}`}
      title="AlgoLearn - Your DSA Journey"
      role={onClick ? 'button' : 'banner'}
      aria-label="AlgoLearn - Your DSA Journey"
    >
      {/* 3D Graduation Cap Icon matching user image */}
      <div className="relative flex-shrink-0">
        <svg
          viewBox="0 0 140 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={
            size === 'sm'
              ? 'w-7 h-7 sm:w-8 sm:h-8'
              : size === 'lg'
              ? 'w-10 h-10 sm:w-12 sm:h-12'
              : 'w-8 h-8 sm:w-9 sm:h-9'
          }
        >
          <defs>
            {/* Top Mortarboard Diamond gradient */}
            <linearGradient id="capTopGrad" x1="15%" y1="10%" x2="90%" y2="90%">
              <stop offset="0%" stopColor="#0055ff" />
              <stop offset="45%" stopColor="#0044cc" />
              <stop offset="85%" stopColor="#0033aa" />
              <stop offset="100%" stopColor="#002b80" />
            </linearGradient>

            {/* Glowing Top Cyan/Blue Edge */}
            <linearGradient id="capEdgeGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="40%" stopColor="#0099ff" />
              <stop offset="80%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>

            {/* Lower cap skullcap / headband gradient (radiant purple/violet) */}
            <linearGradient id="capBaseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6d28d9" />
              <stop offset="35%" stopColor="#7c3aed" />
              <stop offset="70%" stopColor="#9333ea" />
              <stop offset="100%" stopColor="#c026d3" />
            </linearGradient>

            {/* Tassel gradient */}
            <linearGradient id="tasselGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="50%" stopColor="#0077ff" />
              <stop offset="100%" stopColor="#0055ff" />
            </linearGradient>

            {/* Ambient soft glow filter */}
            <filter id="capAmbientGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Ambient Glow */}
          <ellipse
            cx="68"
            cy="55"
            rx="52"
            ry="38"
            fill="#3b82f6"
            fillOpacity="0.12"
            className="dark:fill-opacity-25"
          />

          {/* Lower Cap Skullcap (Purple Headband under the flat diamond) */}
          <path
            d="M 40 64 L 68 79 L 96 64 L 96 74 Q 68 96 40 74 Z"
            fill="url(#capBaseGrad)"
            stroke="#a855f7"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />

          {/* Beveled 3D Thickness of the Mortarboard */}
          <path
            d="M 16 46 L 68 76 L 68 83 L 16 53 Z"
            fill="#002b80"
            opacity="0.95"
          />
          <path
            d="M 68 76 L 120 46 L 120 53 L 68 83 Z"
            fill="#001a4d"
            opacity="0.95"
          />

          {/* Main Top Rhombus (Mortarboard Top Surface) */}
          <path
            d="M 68 16 L 120 46 L 68 76 L 16 46 Z"
            fill="url(#capTopGrad)"
            stroke="url(#capEdgeGlow)"
            strokeWidth="2.4"
            strokeLinejoin="round"
          />

          {/* Center Button Pin */}
          <ellipse cx="68" cy="46" rx="4" ry="2.5" fill="#38bdf8" />

          {/* Tassel String draped over right edge */}
          <path
            d="M 68 46 C 84 47, 102 52, 110 60 C 114 64, 115 67, 114 71"
            fill="none"
            stroke="url(#tasselGrad)"
            strokeWidth="2.6"
            strokeLinecap="round"
          />

          {/* Tassel Knot Ring */}
          <circle cx="114" cy="72" r="2.6" fill="#38bdf8" />

          {/* Tassel Teardrop End */}
          <path
            d="M 114 74 C 111 79, 111 86, 114 91 C 117 86, 117 79, 114 74 Z"
            fill="url(#tasselGrad)"
          />
        </svg>
      </div>

      {/* AlgoLearn Brand Text & Subtitle */}
      <div className="flex flex-col justify-center leading-none">
        <div className="flex items-baseline font-black tracking-tight text-lg sm:text-xl font-sans">
          <span className="text-slate-900 dark:text-white font-extrabold tracking-tight">
            Algo
          </span>
          <span className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent font-extrabold ml-0.5 tracking-tight">
            Learn
          </span>
        </div>
        <span className="text-[8px] sm:text-[9px] font-bold tracking-[0.24em] text-slate-500 dark:text-slate-400 uppercase font-sans mt-0.5">
          YOUR DSA JOURNEY
        </span>
      </div>
    </div>
  );
};

export default AlgoLearnLogo;
