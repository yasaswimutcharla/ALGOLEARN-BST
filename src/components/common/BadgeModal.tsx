import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Award, Sparkles, X } from 'lucide-react';
import { useUserProgress } from '../../context/UserProgressContext';

export const BadgeModal: React.FC = () => {
  const { newBadgeUnlocked, clearNewBadge } = useUserProgress();

  if (!newBadgeUnlocked) return null;

  return (
    <AnimatePresence>
      <div
        id="badge-unlocked-overlay"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 15 }}
          className="relative max-w-sm w-full bg-white dark:bg-slate-900 p-6 rounded-2xl border border-indigo-200 dark:border-slate-800 shadow-xl text-center"
        >
          <button
            onClick={clearNewBadge}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Badge Icon Graphic */}
          <div className="mx-auto w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center mb-4">
            <Award className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-pulse" />
          </div>

          <div className="inline-flex items-center gap-1 px-3 py-0.5 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 rounded-full text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> Badge Unlocked!
          </div>

          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1 tracking-tight">
            {newBadgeUnlocked.title}
          </h3>

          <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
            {newBadgeUnlocked.description}
          </p>

          <div className="inline-block px-4 py-1.5 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 rounded-xl text-indigo-900 dark:text-indigo-200 font-mono font-bold text-sm mb-5">
            +{newBadgeUnlocked.xpBonus} XP Bonus Claimed
          </div>

          <button
            id="badge-claim-btn"
            onClick={clearNewBadge}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            Keep Exploring!
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
