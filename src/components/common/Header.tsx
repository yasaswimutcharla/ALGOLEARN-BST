import React, { useState } from 'react';
import {
  Menu,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  Flame,
  Binary,
  Layers,
  AlertCircle,
} from 'lucide-react';
import { AlgoLearnLogo } from './AlgoLearnLogo';
import { useUserProgress } from '../../context/UserProgressContext';
import { useTheme } from '../../context/ThemeContext';
import { triggerActivityReset } from '../../utils/activityReset';
import { soundManager } from '../../utils/audio';

export type NavTab = 'home' | 'learn' | 'visual' | 'practice' | 'lab' | 'quiz' | 'game' | 'results';

interface HeaderProps {
  activeTab: NavTab;
  setActiveTab?: (tab: NavTab) => void;
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onToggleSidebar,
  isSidebarOpen,
}) => {
  const { stats, isMuted, toggleMute, recentXPNotice, resetProgress } = useUserProgress();
  const { theme, toggleTheme, isDark } = useTheme();

  const [showResetConfirmModal, setShowResetConfirmModal] = useState<boolean>(false);

  // Dynamic Page Subtitle per user's specifications
  const getPageSubtitle = () => {
    switch (activeTab) {
      case 'home':
        return 'Overview';
      case 'learn':
        return 'Learn';
      case 'visual':
        return 'Visualize';
      case 'game':
        return 'Game';
      case 'quiz':
        return 'Quiz';
      case 'results':
        return 'Progress';
      case 'practice':
        return 'Practice';
      case 'lab':
        return 'Lab';
      default:
        return 'Overview';
    }
  };

  const handleConfirmReset = () => {
    soundManager.playSuccess();
    resetProgress();
    triggerActivityReset();
    setShowResetConfirmModal(false);
  };

  const subtitle = getPageSubtitle();

  return (
    <>
      <header
        id="main-top-header"
        className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 shadow-2xs transition-colors duration-200"
      >
        <div className="px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4">
          {/* Left side: Hamburger Toggle + Platform # icon + AlgoLearn & Subtitle */}
          <div className="flex items-center gap-3 min-w-0">
            {!isSidebarOpen && (
              <button
                id="sidebar-hamburger-toggle-btn"
                onClick={() => {
                  soundManager.playClick();
                  if (onToggleSidebar) onToggleSidebar();
                }}
                className="p-2 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors flex-shrink-0 cursor-pointer shadow-2xs"
                aria-label="Open Navigation Menu"
                title="Open Navigation Menu"
              >
                <Menu className="w-4 h-4" />
              </button>
            )}

            {/* AlgoLearn Brand Logo with Graduation Cap & "YOUR DSA JOURNEY" */}
            <AlgoLearnLogo
              onClick={
                setActiveTab
                  ? () => {
                      soundManager.playClick();
                      setActiveTab('home');
                    }
                  : undefined
              }
            />
          </div>

          {/* Right side: Top Header Controls (Theme, Sound, Reset in Circular Buttons) */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* 1. ☀️ Theme Toggle Button (Circular) */}
            <button
              id="header-theme-toggle-btn"
              onClick={toggleTheme}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-amber-400 transition-colors shadow-2xs flex items-center justify-center cursor-pointer"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle Theme"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>

            {/* 2. 🔊 Sound/Audio Toggle Button (Circular) */}
            <button
              id="header-sound-toggle-btn"
              onClick={toggleMute}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-indigo-600 dark:text-indigo-400 transition-colors shadow-2xs flex items-center justify-center cursor-pointer"
              title={isMuted ? 'Turn Sound ON' : 'Turn Sound OFF'}
              aria-label="Toggle Sound"
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-slate-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              )}
            </button>

            {/* 3. ↩️ Reset / Restart Control Button (Circular) */}
            <button
              id="header-reset-activity-btn"
              onClick={() => setShowResetConfirmModal(true)}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shadow-2xs flex items-center justify-center cursor-pointer"
              title="Reset Progress to Zero"
              aria-label="Reset Progress to Zero"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Floating XP Toast Alert */}
        {recentXPNotice && (
          <div className="bg-indigo-600 text-white text-xs font-bold py-1.5 px-4 text-center animate-pulse flex items-center justify-center gap-2 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{recentXPNotice.reason}: +{recentXPNotice.amount} XP</span>
          </div>
        )}
      </header>

      {/* Reset Progress Confirmation Dialog */}
      {showResetConfirmModal && (
        <div
          id="header-reset-modal-backdrop"
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setShowResetConfirmModal(false)}
        >
          <div
            id="header-reset-modal-card"
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-xl space-y-4 animate-fadeIn text-slate-900 dark:text-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Reset Progress to Zero?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Start fresh from 0%
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              This will reset all your completed topics, interactive practice tasks, game levels, quiz scores, and XP back to 0 so your journey starts from zero.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setShowResetConfirmModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="header-confirm-reset-btn"
                onClick={handleConfirmReset}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Zero</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};


