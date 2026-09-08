import React from 'react';
import { motion } from 'motion/react';
import { Trophy } from 'lucide-react';
import { GameChallenge } from '../../types';
import { soundManager } from '../../utils/audio';

interface LevelProgressTrackProps {
  challenges: GameChallenge[];
  activeChallengeIndex: number;
  completedChallengeIds?: string[];
  onSelectLevel?: (index: number) => void;
  onSelectChallenge?: (index: number) => void;
}

export const LevelProgressTrack: React.FC<LevelProgressTrackProps> = ({
  challenges,
  activeChallengeIndex,
  completedChallengeIds = [],
  onSelectLevel,
  onSelectChallenge,
}) => {
  const displayChallenges = challenges || [];
  const totalNodes = displayChallenges.length || 5;

  // Percentage for progress line behind nodes
  const activePercent = totalNodes > 1 ? (activeChallengeIndex / (totalNodes - 1)) * 100 : 0;

  const handleSelect = (index: number) => {
    soundManager.playClick();
    if (onSelectLevel) onSelectLevel(index);
    if (onSelectChallenge) onSelectChallenge(index);
  };

  return (
    <div
      id="game-level-progress-track"
      className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm dark:shadow-xl dark:shadow-indigo-950/40 relative overflow-hidden transition-colors"
    >
      {/* Subtle top purple ambient glow in dark mode */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-12 bg-purple-500/5 dark:bg-purple-600/10 blur-2xl pointer-events-none rounded-full" />

      <div className="relative w-full max-w-2xl mx-auto py-2">
        {/* Continuous Connecting Line Behind Nodes */}
        <div className="absolute top-[18px] sm:top-[22px] left-[6%] right-[6%] sm:left-[8%] sm:right-[8%] h-[2px] bg-slate-200 dark:bg-slate-800/90 -z-0">
          {/* Active Highlight Line */}
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 dark:to-indigo-400 shadow-[0_0_10px_rgba(168,85,247,0.5)] rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${activePercent}%` }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          />
        </div>

        {/* Level Nodes in a single horizontal row */}
        <div className="relative z-10 flex items-center justify-between w-full">
          {displayChallenges.map((lvl, index) => {
            const levelNum = index + 1;
            const formattedNum = String(levelNum).padStart(2, '0');
            const isActive = index === activeChallengeIndex;
            const isCompleted = completedChallengeIds.includes(lvl.id);
            const isFinalLevel = index === totalNodes - 1;

            const handleClick = () => {
              handleSelect(index);
            };

            return (
              <div
                key={lvl.id || `lvl-${index}`}
                className="flex flex-col items-center gap-1.5 select-none group"
              >
                {/* Circular Node Button */}
                <button
                  type="button"
                  id={`game-level-select-${levelNum}`}
                  onClick={handleClick}
                  className={`relative flex items-center justify-center transition-all duration-300 rounded-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                    isActive
                      ? 'w-9 h-9 sm:w-11 sm:h-11 bg-gradient-to-tr from-indigo-600 via-purple-600 to-indigo-500 ring-4 ring-purple-400/40 ring-offset-2 ring-offset-white dark:ring-offset-slate-950 shadow-[0_0_18px_rgba(168,85,247,0.7)] scale-105 sm:scale-110'
                      : isCompleted
                      ? 'w-8 h-8 sm:w-10 sm:h-10 bg-purple-50 dark:bg-slate-900 border-2 border-purple-400 dark:border-purple-500/70 hover:border-purple-500 shadow-2xs hover:scale-105'
                      : 'w-8 h-8 sm:w-10 sm:h-10 bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 hover:border-indigo-500 hover:scale-105 shadow-2xs'
                  }`}
                  aria-label={`Open Level ${levelNum}`}
                  title={`Open Level ${levelNum}: ${lvl.title || ''}`}
                >
                  {/* Node Inner Symbol */}
                  {isFinalLevel ? (
                    /* Final Trophy Icon */
                    <Trophy
                      className={`w-3.5 h-3.5 sm:w-5 sm:h-5 transition-all ${
                        isActive
                          ? 'text-yellow-300 drop-shadow-[0_0_8px_rgba(253,224,71,0.9)] animate-pulse'
                          : isCompleted
                          ? 'text-amber-500 dark:text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]'
                          : 'text-slate-400 dark:text-slate-500'
                      }`}
                    />
                  ) : isActive ? (
                    /* Active Node: Small white circle/dot in center with glowing halo */
                    <motion.div
                      layoutId="active-node-dot"
                      className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-white rounded-full shadow-[0_0_8px_#ffffff]"
                      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    />
                  ) : isCompleted ? (
                    /* Completed Node: Small filled purple dot */
                    <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-purple-500 dark:bg-purple-400 rounded-full shadow-[0_0_6px_rgba(192,132,252,0.6)]" />
                  ) : (
                    /* Ready/Selectable Node: Small center accent dot */
                    <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-slate-400 dark:bg-slate-600 group-hover:bg-indigo-500 transition-colors" />
                  )}
                </button>

                {/* Level Label Underneath */}
                <button
                  type="button"
                  onClick={handleClick}
                  className={`text-[11px] sm:text-xs font-mono font-bold tracking-wider transition-colors duration-200 cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'text-indigo-700 dark:text-purple-300 font-extrabold underline underline-offset-2 drop-shadow-xs dark:drop-shadow-[0_0_8px_rgba(196,181,253,0.6)]'
                      : isCompleted
                      ? 'text-purple-600 dark:text-purple-400 font-semibold hover:text-indigo-600'
                      : 'text-slate-600 dark:text-slate-400 font-medium hover:text-indigo-600 dark:hover:text-slate-200'
                  }`}
                >
                  <span className="hidden sm:inline">Level </span>{levelNum}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
