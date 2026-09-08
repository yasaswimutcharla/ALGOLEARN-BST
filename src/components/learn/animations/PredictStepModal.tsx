import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { StepPrediction } from './types';
import { HelpCircle, CheckCircle2, XCircle, X, Lightbulb, ArrowRight } from 'lucide-react';
import { soundManager } from '../../../utils/audio';

interface PredictStepModalProps {
  prediction?: StepPrediction;
  predictionData?: StepPrediction;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onCorrectAnswer?: () => void;
}

export const PredictStepModal: React.FC<PredictStepModalProps> = ({
  prediction: rawPrediction,
  predictionData,
  isOpen,
  onClose,
  onSuccess,
  onCorrectAnswer,
}) => {
  const prediction = rawPrediction || predictionData;
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [showHint, setShowHint] = useState(false);

  if (!isOpen || !prediction) return null;

  const isCorrect = selectedIdx === prediction.correctIndex;

  const handleSelect = (idx: number) => {
    if (hasSubmitted) return;
    soundManager.playClick();
    setSelectedIdx(idx);
  };

  const handleSubmit = () => {
    if (selectedIdx === null) return;
    setHasSubmitted(true);
    if (selectedIdx === prediction.correctIndex) {
      soundManager.playSuccess();
    } else {
      soundManager.playError();
    }
  };

  const handleContinue = () => {
    onClose();
    if (isCorrect) {
      onSuccess();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 10 }}
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-5 relative overflow-hidden text-slate-900 dark:text-slate-100"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-violet-100 dark:bg-indigo-950/70 text-violet-700 dark:text-indigo-300 flex items-center justify-center border border-violet-200/50 dark:border-indigo-800">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                Predict the Next Step
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Apply your BST knowledge before the animation reveals it!
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Question Text */}
        <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-800 dark:text-slate-200 text-sm font-semibold leading-relaxed">
          {prediction.question}
        </div>

        {/* Options */}
        <div className="space-y-2 mb-4">
          {prediction.options.map((opt, idx) => {
            const isSelected = selectedIdx === idx;
            const isAnswer = idx === prediction.correctIndex;

            let btnStyle =
              'border-slate-200 dark:border-slate-750 hover:border-violet-300 dark:hover:border-indigo-600 hover:bg-violet-50/50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800/40';

            if (hasSubmitted) {
              if (isAnswer) {
                btnStyle =
                  'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 font-bold border-2';
              } else if (isSelected && !isAnswer) {
                btnStyle =
                  'border-rose-500 bg-rose-50 dark:bg-rose-950/60 text-rose-900 dark:text-rose-200 line-through opacity-80 border-2';
              } else {
                btnStyle = 'border-slate-200 dark:border-slate-800 opacity-40 text-slate-400 dark:text-slate-600 bg-transparent';
              }
            } else if (isSelected) {
              btnStyle =
                'border-violet-600 dark:border-indigo-500 bg-violet-50 dark:bg-indigo-950/60 text-violet-900 dark:text-white font-semibold ring-2 ring-violet-500/20 dark:ring-indigo-500/30';
            }

            return (
              <button
                key={idx}
                id={`predict-opt-${idx}`}
                disabled={hasSubmitted}
                onClick={() => handleSelect(idx)}
                className={`w-full p-3 rounded-xl border text-left text-xs sm:text-sm transition-all flex items-center justify-between ${btnStyle}`}
              >
                <span>{opt}</span>
                {hasSubmitted && isAnswer && <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />}
                {hasSubmitted && isSelected && !isAnswer && <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Hint or Feedback */}
        {hasSubmitted ? (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-3 rounded-xl border mb-4 text-xs ${
              isCorrect
                ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                : 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
            }`}
          >
            <div className="font-bold mb-1 flex items-center gap-1.5">
              {isCorrect ? <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />}
              <span>{isCorrect ? 'Correct Prediction! 🎉' : 'Not Quite!'}</span>
            </div>
            <p>{prediction.explanation}</p>
          </motion.div>
        ) : (
          <div className="mb-4">
            {!showHint ? (
              <button
                onClick={() => setShowHint(true)}
                className="text-xs text-violet-600 dark:text-indigo-400 hover:text-violet-800 dark:hover:text-indigo-300 flex items-center gap-1 font-medium"
              >
                <Lightbulb className="w-3.5 h-3.5" />
                Need a hint?
              </button>
            ) : (
              <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <span>{prediction.hint}</span>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-2">
          {!hasSubmitted ? (
            <button
              id="submit-prediction-btn"
              disabled={selectedIdx === null}
              onClick={handleSubmit}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors"
            >
              Check Answer
            </button>
          ) : (
            <button
              id="continue-prediction-btn"
              onClick={handleContinue}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <span>Continue Animation</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
