import React, { useState } from 'react';
import {
  LayoutGrid,
  BookOpen,
  Eye,
  Gamepad2,
  GraduationCap,
  Trophy,
  X,
} from 'lucide-react';
import { NavTab } from './Header';
import { useUserProgress } from '../../context/UserProgressContext';
import { soundManager } from '../../utils/audio';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  isOpen: boolean;
  onClose: () => void;
  selectedLearnTopicIndex?: number;
  onSelectLearnTopic?: (index: number) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpen,
  onClose,
}) => {
  const {
    stats,
    quizAnsweredCount,
    calculateOverallProgress,
  } = useUserProgress();

  const [isMenuHovered, setIsMenuHovered] = useState<boolean>(false);

  // Exact counts matching curriculum breakdown
  const learnCompleted = Math.min(stats?.completedLessons?.length || 0, 6);
  const visualizeCompleted = Math.min(stats?.completedPractice?.length || 0, 3);
  const gameCompleted = Math.min(stats?.completedGameChallenges?.length || 0, 5);
  const quizCompleted = Math.min(quizAnsweredCount || 0, 10);
  const totalCompleted = learnCompleted + visualizeCompleted + gameCompleted + quizCompleted;

  const overallProgress = Math.round((totalCompleted / 24) * 100);

  const handleNavClick = (tab: NavTab) => {
    soundManager.playClick();
    setActiveTab(tab);
    // On small screens, close sidebar upon selection
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  // The 6 clean navigation items matching requirement
  const navItems: { id: NavTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'home', label: 'Overview', icon: LayoutGrid },
    { id: 'learn', label: 'Learn', icon: BookOpen },
    { id: 'visual', label: 'Visualize', icon: Eye },
    { id: 'game', label: 'Game', icon: Gamepad2 },
    { id: 'quiz', label: 'Quiz', icon: GraduationCap },
    { id: 'results', label: 'Progress', icon: Trophy },
  ];

  // Progress text revealed strictly when cursor is on menu bar
  const getProgressBadge = (tabId: NavTab): string => {
    switch (tabId) {
      case 'home':
        return `${totalCompleted}/24`;
      case 'learn':
        return `${learnCompleted}/6`;
      case 'visual':
        return `${visualizeCompleted}/3`;
      case 'game':
        return `${gameCompleted}/5`;
      case 'quiz':
        return `${quizCompleted}/10`;
      case 'results':
        return `${overallProgress}%`;
      default:
        return '';
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          id="sidebar-backdrop"
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Clean Left Sidebar */}
      <aside
        id="main-left-sidebar"
        onMouseEnter={() => setIsMenuHovered(true)}
        onMouseLeave={() => setIsMenuHovered(false)}
        className={`group/sidebar fixed top-0 bottom-0 left-0 z-50 w-72 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 flex flex-col border-r border-slate-200/80 dark:border-slate-800 shadow-sm transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Header & Close Button */}
        <div className="px-4 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">
            Navigation Menu
          </span>

          {/* Close button for mobile or compact view */}
          <button
            id="sidebar-close-btn"
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl border border-slate-200/80 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shadow-2xs"
            title="Close Menu"
            aria-label="Close Menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Links Scrollable Area */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1 custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              activeTab === item.id ||
              (item.id === 'learn' && (activeTab === 'practice' || activeTab === 'lab'));

            return (
              <button
                key={item.id}
                id={`sidebar-link-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-50/80 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/60 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-slate-100 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-xs shadow-indigo-600/20'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="font-semibold">{item.label}</span>
                </div>

                {/* Progress Badge: visible ONLY when cursor is on the menu bar */}
                <span
                  id={`sidebar-progress-${item.id}`}
                  className={`transition-all duration-300 text-xs font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap ${
                    isActive
                      ? 'bg-indigo-100 dark:bg-indigo-900/80 text-indigo-700 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-700'
                      : 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/60'
                  } ${
                    isMenuHovered
                      ? 'opacity-100 translate-x-0'
                      : 'opacity-0 translate-x-1 pointer-events-none group-hover/sidebar:opacity-100 group-hover/sidebar:translate-x-0 group-hover/sidebar:pointer-events-auto'
                  }`}
                >
                  {getProgressBadge(item.id)}
                </span>
              </button>
            );
          })}
        </div>
      </aside>
    </>
  );
};
