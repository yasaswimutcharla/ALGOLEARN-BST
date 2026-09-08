import React from 'react';
import { RotateCcw, X, Sparkles } from 'lucide-react';
import { useUserProgress } from '../../context/UserProgressContext';
import { soundManager } from '../../utils/audio';

interface StartFromZeroModalProps {
  onConfirmRedirect?: () => void;
}

export const StartFromZeroModal: React.FC<StartFromZeroModalProps> = ({ onConfirmRedirect }) => {
  const { isStartFromZeroModalOpen, closeStartFromZeroModal, startFromZero } = useUserProgress();

  if (!isStartFromZeroModalOpen) return null;

  const handleConfirm = () => {
    startFromZero();
    if (onConfirmRedirect) {
      onConfirmRedirect();
    }
  };

  const handleCancel = () => {
    soundManager.playClick();
    closeStartFromZeroModal();
  };

  return (
    <div
      id="start-from-zero-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        id="start-from-zero-modal-card"
        className="bg-white dark:bg-slate-900 rounded-2xl border border-indigo-100 dark:border-slate-800 max-w-md w-full shadow-xl p-6 relative overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Decorative top bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-600 dark:bg-indigo-500" />

        {/* Close Button */}
        <button
          id="close-start-from-zero-modal-btn"
          onClick={handleCancel}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon Header */}
        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-2xs flex-shrink-0">
            <RotateCcw className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                Fresh Demonstration
              </span>
            </div>
            <h2 id="start-from-zero-modal-title" className="text-xl font-bold text-slate-900 dark:text-white tracking-tight mt-0.5">
              Start a new learning journey?
            </h2>
          </div>
        </div>

        {/* Dialog Body Message */}
        <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
          <p className="font-medium text-slate-800 dark:text-slate-200">
            All your completed topics, interactive practices, game challenge levels, quiz answers, and XP will be reset to 0 so you can start from zero.
          </p>
          <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 space-y-1">
            <div className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300 font-medium">
              <Sparkles className="w-3.5 h-3.5 flex-shrink-0 text-indigo-600 dark:text-indigo-400" />
              <span>You can start the curriculum from scratch with 0% completion.</span>
            </div>
          </div>
        </div>

        {/* Modal Buttons */}
        <div className="flex items-center justify-end gap-2.5">
          <button
            id="cancel-start-from-zero-btn"
            onClick={handleCancel}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold transition-colors shadow-2xs cursor-pointer"
          >
            Cancel
          </button>
          <button
            id="confirm-start-from-zero-btn"
            onClick={handleConfirm}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-xs transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Start From Zero</span>
          </button>
        </div>
      </div>
    </div>
  );
};
