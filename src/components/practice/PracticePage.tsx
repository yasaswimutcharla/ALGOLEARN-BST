import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  HelpCircle,
  RotateCcw,
  Lightbulb,
  ArrowRight,
} from 'lucide-react';
import { PRACTICE_CHALLENGES } from '../../data/practiceData';
import { TreeCanvas } from '../common/TreeCanvas';
import { BSTNode, PracticeChallenge } from '../../types';
import { buildTreeFromValues, getInorder } from '../../utils/bst';
import { useUserProgress } from '../../context/UserProgressContext';
import { soundManager } from '../../utils/audio';

interface PracticePageProps {
  onGoToQuiz?: () => void;
}

export const PracticePage: React.FC<PracticePageProps> = ({ onGoToQuiz }) => {
  const { stats, completePractice, addXP } = useUserProgress();

  const [activeChallengeIndex, setActiveChallengeIndex] = useState<number>(0);
  const currentChallenge: PracticeChallenge = PRACTICE_CHALLENGES[activeChallengeIndex] || PRACTICE_CHALLENGES[0];

  // Interactive states for traversal & click challenges
  const [userTraversalSequence, setUserTraversalSequence] = useState<number[]>([]);
  const [userSearchPath, setUserSearchPath] = useState<number[]>([]);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ isSuccess: boolean; text: string } | null>(null);
  const [showHint, setShowHint] = useState<boolean>(false);

  const [tree, setTree] = useState<BSTNode | null>(() =>
    buildTreeFromValues(currentChallenge.initialTreeValues)
  );

  const resetCurrentChallenge = (idx = activeChallengeIndex) => {
    soundManager.playClick();
    setActiveChallengeIndex(idx);
    setUserTraversalSequence([]);
    setUserSearchPath([]);
    setSelectedOptionId(null);
    setFeedback(null);
    setShowHint(false);
    setTree(buildTreeFromValues(PRACTICE_CHALLENGES[idx].initialTreeValues));
  };

  useEffect(() => {
    const handleGlobalReset = () => {
      resetCurrentChallenge(0);
    };
    window.addEventListener('bst-reset-progress', handleGlobalReset);
    window.addEventListener('bst-reset-current-activity', handleGlobalReset);
    return () => {
      window.removeEventListener('bst-reset-progress', handleGlobalReset);
      window.removeEventListener('bst-reset-current-activity', handleGlobalReset);
    };
  }, []);

  const handleNodeClick = (node: BSTNode) => {
    // Traversal Challenge
    if (currentChallenge.category === 'traversal') {
      const correctInorder = getInorder(tree);
      const nextExpected = correctInorder[userTraversalSequence.length];

      if (node.value === nextExpected) {
        soundManager.playStep(userTraversalSequence.length);
        const updated = [...userTraversalSequence, node.value];
        setUserTraversalSequence(updated);

        if (updated.length === correctInorder.length) {
          soundManager.playSuccess();
          setFeedback({
            isSuccess: true,
            text: `🎉 Great job! You completed the Inorder traversal perfectly: [${updated.join(', ')}].`,
          });
          if (!(stats?.completedPractice || []).includes(currentChallenge.id)) {
            completePractice(currentChallenge.id);
            addXP(currentChallenge.xp, `Solved: ${currentChallenge.title}`);
          }
        }
      } else {
        soundManager.playError();
        setFeedback({
          isSuccess: false,
          text: `Inorder goes Left → Root → Right. Next expected was ${nextExpected}, but you clicked ${node.value}.`,
        });
      }
    }
    // Search Path Challenge
    else if (currentChallenge.category === 'search') {
      const target = currentChallenge.targetValue || 65;
      const updatedPath = [...userSearchPath, node.value];
      setUserSearchPath(updatedPath);
      soundManager.playStep(updatedPath.length);

      const expectedPath = [50, 75, 65];
      const stepIdx = updatedPath.length - 1;

      if (stepIdx < expectedPath.length && node.value === expectedPath[stepIdx]) {
        if (node.value === target) {
          soundManager.playSuccess();
          setFeedback({
            isSuccess: true,
            text: `🎯 Target ${target} reached in ${updatedPath.length} comparisons! Binary search path: [${updatedPath.join(' → ')}].`,
          });
          if (!(stats?.completedPractice || []).includes(currentChallenge.id)) {
            completePractice(currentChallenge.id);
            addXP(currentChallenge.xp, `Solved: ${currentChallenge.title}`);
          }
        }
      } else {
        soundManager.playError();
        setFeedback({
          isSuccess: false,
          text: `Off-track! Target is ${target}. Compare target with current node to decide Left or Right.`,
        });
      }
    }
    // Build Challenge
    else if (currentChallenge.category === 'build') {
      if (node.value === 40) {
        soundManager.playSuccess();
        setFeedback({
          isSuccess: true,
          text: `🎉 Correct! 35 is < 50, > 25, and < 40, so it attaches as the left child of 40.`,
        });
        if (!(stats?.completedPractice || []).includes(currentChallenge.id)) {
          completePractice(currentChallenge.id);
          addXP(currentChallenge.xp, `Solved: ${currentChallenge.title}`);
        }
      } else {
        soundManager.playError();
        setFeedback({
          isSuccess: false,
          text: `Node ${node.value} is not where 35 attaches. Follow the BST comparison from root 50.`,
        });
      }
    }
  };

  const handleOptionClick = (option: { id: string; label: string; isCorrect: boolean; feedback: string }) => {
    setSelectedOptionId(option.id);
    if (option.isCorrect) {
      soundManager.playSuccess();
      setFeedback({ isSuccess: true, text: option.feedback });
      if (!(stats?.completedPractice || []).includes(currentChallenge.id)) {
        completePractice(currentChallenge.id);
        addXP(currentChallenge.xp, `Solved: ${currentChallenge.title}`);
      }
    } else {
      soundManager.playError();
      setFeedback({ isSuccess: false, text: option.feedback });
    }
  };

  return (
    <div id="practice-page-root" className="space-y-6 pb-16">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-indigo-100 dark:border-slate-800 shadow-sm shadow-indigo-500/5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
              Interactive Practice Challenges
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">• Hands-on Problem Solving</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Guided Practice & Traversal Puzzles
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl">
            Test your intuition by solving interactive BST scenarios: node insertions, valid searches, and traversal sequences.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block">Challenges Completed</span>
            <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 font-mono">
              {(stats?.completedPractice || []).length} / {PRACTICE_CHALLENGES.length} Solved
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold font-mono text-base shadow-2xs">
            {Math.round(((stats?.completedPractice || []).length / PRACTICE_CHALLENGES.length) * 100)}%
          </div>
        </div>
      </div>

      {/* Challenge Navigation Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        {PRACTICE_CHALLENGES.map((challenge, idx) => {
          const isDone = (stats?.completedPractice || []).includes(challenge.id);
          const isActive = idx === activeChallengeIndex;

          return (
            <button
              key={challenge.id}
              id={`practice-tab-${challenge.id}`}
              onClick={() => resetCurrentChallenge(idx)}
              className={`p-3 rounded-xl border text-left transition-all ${
                isActive
                  ? 'bg-indigo-50 dark:bg-indigo-950/80 border-indigo-500 dark:border-indigo-400 text-indigo-950 dark:text-indigo-100 font-bold shadow-2xs'
                  : isDone
                  ? 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-indigo-50/40'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-indigo-50/20'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] mb-1 font-mono">
                <span>Task {idx + 1}</span>
                {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
              </div>
              <div className="text-xs truncate font-medium">{challenge.title.split(':')[0]}</div>
            </button>
          );
        })}
      </div>

      {/* Main Challenge Sandbox Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-indigo-100 dark:border-slate-800 p-5 sm:p-7 shadow-sm shadow-indigo-500/5 space-y-6">
        {/* Challenge Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-100 dark:border-indigo-900">
                Challenge {activeChallengeIndex + 1} • {currentChallenge.difficulty}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">{currentChallenge.title}</h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">{currentChallenge.description}</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-800 dark:text-indigo-200 text-xs font-bold font-mono">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>+{currentChallenge.xp} XP</span>
            </div>

            <button
              onClick={() => resetCurrentChallenge(activeChallengeIndex)}
              className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-slate-700 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors shadow-2xs"
              title="Reset Challenge"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Goal Banner */}
        <div className="bg-indigo-50/50 dark:bg-indigo-950/40 p-3.5 rounded-xl border border-indigo-100 dark:border-indigo-900/60 flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
          <div>
            <span className="font-bold text-indigo-700 dark:text-indigo-300 mr-2">🎯 GOAL:</span>
            <span>{currentChallenge.taskGoal}</span>
          </div>

          {currentChallenge.category === 'traversal' && (
            <div className="font-mono text-xs text-indigo-800 dark:text-indigo-200 bg-white dark:bg-slate-800 px-2.5 py-1 rounded border border-indigo-200 dark:border-indigo-800">
              Traversed: [{userTraversalSequence.join(', ')}]
            </div>
          )}

          {currentChallenge.category === 'search' && (
            <div className="font-mono text-xs text-indigo-800 dark:text-indigo-200 bg-white dark:bg-slate-800 px-2.5 py-1 rounded border border-indigo-200 dark:border-indigo-800">
              Path: [{userSearchPath.join(' → ')}]
            </div>
          )}
        </div>

        {/* Interactive Tree View */}
        <div className="bg-slate-50/50 dark:bg-slate-950/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
          <TreeCanvas
            root={tree}
            onNodeClick={handleNodeClick}
            targetValue={currentChallenge.targetValue}
            visitedNodeIds={[]}
            showSubtreeTags={true}
          />
        </div>

        {/* Option Selection (For Validation or Deletion options) */}
        {currentChallenge.options && (
          <div className="space-y-3 pt-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Choose the correct answer:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentChallenge.options.map((opt) => {
                const isSelected = selectedOptionId === opt.id;
                return (
                  <button
                    key={opt.id}
                    id={`practice-opt-${opt.id}`}
                    onClick={() => handleOptionClick(opt)}
                    className={`p-3.5 rounded-xl text-left text-xs sm:text-sm font-semibold transition-all border ${
                      isSelected
                        ? opt.isCorrect
                          ? 'bg-indigo-50 dark:bg-indigo-950 border-indigo-500 text-indigo-900 dark:text-indigo-100 shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 border-slate-400 text-slate-900 dark:text-slate-100 shadow-xs'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50/30'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Live Feedback */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`p-4 rounded-xl border text-sm font-medium flex items-start gap-3 ${
                feedback.isSuccess
                  ? 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-300 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200'
                  : 'bg-red-50 dark:bg-red-950/60 border-red-200 dark:border-red-900 text-red-900 dark:text-red-200 shadow-xs'
              }`}
            >
              {feedback.isSuccess ? (
                <CheckCircle2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-bold mb-0.5">{feedback.isSuccess ? 'Success!' : 'Try Again'}</p>
                <p className="text-xs sm:text-sm leading-relaxed">{feedback.text}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hint & Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            id="practice-hint-btn"
            onClick={() => setShowHint(!showHint)}
            className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-900 hover:bg-indigo-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-800 rounded-xl text-xs font-semibold text-indigo-700 dark:text-indigo-300 transition-colors shadow-2xs"
          >
            <Lightbulb className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>{showHint ? 'Hide Hint' : '💡 Show Hint'}</span>
          </button>

          <div className="flex items-center gap-2">
            {activeChallengeIndex < PRACTICE_CHALLENGES.length - 1 ? (
              <button
                id="practice-next-btn"
                onClick={() => resetCurrentChallenge(activeChallengeIndex + 1)}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                <span>Next Challenge</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : onGoToQuiz ? (
              <button
                id="practice-goto-quiz-btn"
                onClick={onGoToQuiz}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                <span>Take the Main Quiz</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : null}
          </div>
        </div>

        {/* Hint Panel */}
        {showHint && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-xs sm:text-sm text-indigo-900 dark:text-indigo-200"
          >
            <span className="font-bold block mb-1">💡 Hint:</span>
            <p>{currentChallenge.hint}</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};
