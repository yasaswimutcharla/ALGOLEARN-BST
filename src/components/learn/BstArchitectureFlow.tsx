import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, ArrowDown } from 'lucide-react';
import { soundManager } from '../../utils/audio';

interface BstArchitectureFlowProps {
  topicNumber?: number;
}

interface FlowStep {
  step: string;
  title: string;
  lines: string[];
}

const FLOW_STEPS: FlowStep[] = [
  {
    step: '01',
    title: 'VALUE',
    lines: ['The number/value we want to place'],
  },
  {
    step: '02',
    title: 'COMPARE',
    lines: ['Compare the value with the current node'],
  },
  {
    step: '03',
    title: 'LEFT OR RIGHT',
    lines: ['Smaller → LEFT', 'Larger → RIGHT'],
  },
  {
    step: '04',
    title: 'CORRECT POSITION',
    lines: ['Place the value in the empty position'],
  },
];

export const BstArchitectureFlow: React.FC<BstArchitectureFlowProps> = () => {
  const [activeBoxIndex, setActiveBoxIndex] = useState<number | null>(null);

  const handleBoxClick = (index: number) => {
    soundManager.playClick();
    setActiveBoxIndex(activeBoxIndex === index ? null : index);
  };

  return (
    <div
      id="bst-architecture-diagram-section"
      className="space-y-3 pt-1 text-slate-900 dark:text-slate-100"
    >
      {/* Container with clean dark background, thin border, and subtle purple styling */}
      <div className="bg-white dark:bg-[#0b0f19] rounded-2xl sm:rounded-3xl border border-slate-200/90 dark:border-purple-900/30 p-5 sm:p-6 shadow-xs transition-all">
        {/* Exact Required Heading */}
        <div className="space-y-1 mb-5 border-b border-slate-100 dark:border-purple-950/60 pb-3.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-600 dark:bg-purple-400 animate-pulse" />
            <h2 className="text-xs sm:text-sm font-mono font-bold tracking-wider text-slate-900 dark:text-purple-300 uppercase">
              ARCHITECTURE DIAGRAM // BST CONCEPT
            </h2>
          </div>
          <p className="text-[11px] font-mono font-semibold tracking-wider text-purple-600 dark:text-purple-400 uppercase pl-4">
            HOW INFORMATION FLOWS
          </p>
        </div>

        {/* 4 Connected Flow Boxes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 relative items-stretch">
          {FLOW_STEPS.map((item, idx) => {
            const isSelected = activeBoxIndex === idx;
            const isLast = idx === FLOW_STEPS.length - 1;

            return (
              <div key={item.step} className="relative flex flex-col flex-1">
                {/* Flow Box Card */}
                <motion.div
                  whileHover={{ y: -2, transition: { duration: 0.15 } }}
                  onClick={() => handleBoxClick(idx)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer h-full min-h-[135px] flex flex-col justify-between select-none ${
                    isSelected
                      ? 'bg-purple-50/90 dark:bg-purple-950/60 border-purple-500/80 dark:border-purple-500/70 shadow-sm shadow-purple-500/10 ring-1 ring-purple-500/40'
                      : 'bg-slate-50/70 dark:bg-[#111625] border-slate-200/90 dark:border-slate-800/90 hover:border-purple-300 dark:hover:border-purple-700/60 hover:bg-purple-50/30 dark:hover:bg-[#151b2e]'
                  }`}
                >
                  {/* Step Number Badge */}
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[11px] font-mono font-extrabold px-2 py-0.5 rounded-md transition-colors ${
                        isSelected
                          ? 'bg-purple-600 text-white shadow-2xs'
                          : 'bg-slate-200/80 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-slate-300/50 dark:border-purple-800/50'
                      }`}
                    >
                      {item.step}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400/60 dark:bg-purple-500/40" />
                  </div>

                  {/* Title */}
                  <div className="space-y-1.5 my-auto">
                    <h3 className="text-xs sm:text-[13px] font-mono font-bold tracking-tight text-slate-900 dark:text-white uppercase">
                      {item.title}
                    </h3>

                    {/* Short Beginner-friendly Explanation Lines */}
                    <div className="space-y-0.5">
                      {item.lines.map((line, lIdx) => (
                        <p
                          key={lIdx}
                          className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 font-medium leading-snug"
                        >
                          {line}
                        </p>
                      ))}
                    </div>
                  </div>
                </motion.div>

                {/* Connected Arrow Between Boxes (Desktop: Right, Mobile: Down) */}
                {!isLast && (
                  <>
                    {/* Horizontal Desktop Arrow */}
                    <div className="hidden lg:flex absolute -right-2.5 top-1/2 -translate-y-1/2 z-10 text-purple-500 dark:text-purple-400 bg-white dark:bg-[#0b0f19] rounded-full p-0.5 border border-slate-200 dark:border-purple-900/60 shadow-2xs pointer-events-none">
                      <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                    {/* Vertical Mobile Arrow */}
                    <div className="flex lg:hidden justify-center py-1 text-purple-500 dark:text-purple-400">
                      <ArrowDown className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
