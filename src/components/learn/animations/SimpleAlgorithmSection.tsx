import React from 'react';
import { SimpleAlgorithmData } from '../../../data/simpleAlgorithmsData';
import { soundManager } from '../../../utils/audio';

interface SimpleAlgorithmSectionProps {
  algorithm: SimpleAlgorithmData;
  currentStepIndex?: number;
  totalAnimationSteps?: number;
  onStepClick?: (stepIndex: number) => void;
  className?: string;
}

export const SimpleAlgorithmSection: React.FC<SimpleAlgorithmSectionProps> = ({
  algorithm,
  currentStepIndex = 0,
  totalAnimationSteps,
  onStepClick,
  className = '',
}) => {
  // Map the animation step index to the algorithm step index
  const numAlgoSteps = algorithm.steps.length;
  const numAnimSteps = totalAnimationSteps || numAlgoSteps;

  // Calculate which algorithm step is currently active
  let activeAlgoStepIndex = 0;
  if (numAnimSteps > 0 && numAlgoSteps > 0) {
    if (numAnimSteps === numAlgoSteps) {
      activeAlgoStepIndex = Math.min(currentStepIndex, numAlgoSteps - 1);
    } else {
      // Proportional or clamped mapping
      activeAlgoStepIndex = Math.min(
        Math.floor((currentStepIndex / Math.max(1, numAnimSteps)) * numAlgoSteps),
        numAlgoSteps - 1
      );
    }
  }

  const handleCardClick = (stepIdx: number) => {
    soundManager.playClick();
    if (onStepClick) {
      // Map algorithm step to animation step
      if (numAnimSteps === numAlgoSteps) {
        onStepClick(stepIdx);
      } else {
        const targetAnimStep = Math.min(
          Math.floor((stepIdx / numAlgoSteps) * numAnimSteps),
          numAnimSteps - 1
        );
        onStepClick(targetAnimStep);
      }
    }
  };

  return (
    <section
      id="simple-algorithm-section"
      className={`rounded-2xl border border-indigo-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-5 sm:p-6 shadow-sm shadow-indigo-500/5 ${className}`}
    >
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-indigo-50 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <span className="font-mono text-indigo-600 dark:text-indigo-400 font-extrabold text-base">
            &gt;_
          </span>
          <h2 className="text-base sm:text-lg font-bold font-mono tracking-tight text-slate-900 dark:text-slate-100 uppercase">
            Simple Algorithm
          </h2>
          <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            {algorithm.title}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400">
          <span className="text-xs bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
            Step <strong className="text-indigo-600 dark:text-indigo-400">{activeAlgoStepIndex + 1}</strong> of{' '}
            {algorithm.steps.length}
          </span>
        </div>
      </div>

      {/* Traversal / Property Rule Box (if present) */}
      {algorithm.rule && (
        <div className="mt-4 p-3.5 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-mono text-xs">
          <span className="text-indigo-700 dark:text-indigo-300 font-bold uppercase tracking-wider text-xs">
            Rule:
          </span>
          <span className="text-indigo-950 dark:text-indigo-100 font-bold bg-white dark:bg-slate-900 px-3.5 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-800 shadow-2xs tracking-wide text-xs">
            {algorithm.rule}
          </span>
        </div>
      )}

      {/* Algorithmic Step Cards */}
      <div className="mt-4 space-y-2.5">
        {algorithm.steps.map((step, idx) => {
          const isActive = idx === activeAlgoStepIndex;
          const isPassed = idx < activeAlgoStepIndex;

          return (
            <div
              key={step.stepNumber}
              id={`algo-step-${step.stepNumber}`}
              onClick={() => handleCardClick(idx)}
              className={`group relative rounded-xl transition-all cursor-pointer select-none ${
                isActive
                  ? 'bg-indigo-50/90 dark:bg-indigo-950/50 border-2 border-indigo-600 dark:border-indigo-400 shadow-sm ring-2 ring-indigo-500/10'
                  : isPassed
                  ? 'bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-700 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 text-slate-600 dark:text-slate-400'
                  : 'bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-700 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/20 text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="p-3.5">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-bold font-mono px-2.5 py-0.5 rounded text-[11px] transition-colors ${
                        isActive
                          ? 'bg-indigo-600 text-white font-extrabold shadow-2xs'
                          : isPassed
                          ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900 group-hover:text-indigo-700 dark:group-hover:text-indigo-300'
                      }`}
                    >
                      Step {step.stepNumber}
                    </span>

                    {isActive && (
                      <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider flex items-center gap-1 font-mono">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-ping" />
                        Active Execution
                      </span>
                    )}
                  </div>

                  <span className="text-[11px] text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 font-medium">
                    {isActive ? 'Current State' : 'Click to jump'}
                  </span>
                </div>

                <div
                  className={`text-xs sm:text-sm font-sans font-medium pl-0.5 ${
                    isActive
                      ? 'text-indigo-950 dark:text-indigo-100 font-bold'
                      : isPassed
                      ? 'text-slate-600 dark:text-slate-400'
                      : 'text-slate-800 dark:text-slate-200'
                  }`}
                >
                  {step.text}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
