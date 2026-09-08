import React, { useState, useMemo } from 'react';
import {
  Trophy,
  RotateCcw,
  Video,
  CheckCircle2,
  Circle,
  Clock,
  ArrowRight,
  Gamepad2,
} from 'lucide-react';
import { useUserProgress } from '../../context/UserProgressContext';
import { soundManager } from '../../utils/audio';

interface ResultsPageProps {
  onGoToHome?: () => void;
  onGoToLearn?: (topicIndex?: number) => void;
  onGoToGame?: (level?: number) => void;
  onGoToQuiz?: () => void;
  onGoToPractice?: () => void;
}

type ModuleCategory = 'all' | 'fundamentals' | 'operations' | 'traversals' | 'challenges';

interface BSTModuleItem {
  id: string;
  code: string;
  category: 'FUNDAMENTALS' | 'OPERATIONS' | 'TRAVERSALS' | 'CHALLENGES';
  categoryKey: 'fundamentals' | 'operations' | 'traversals' | 'challenges';
  title: string;
  description: string;
  criteria: string;
  lessonIndex?: number;
  lessonId?: string;
  isGame?: boolean;
}

export const ResultsPage: React.FC<ResultsPageProps> = ({
  onGoToHome,
  onGoToLearn,
  onGoToGame,
  onGoToQuiz,
  onGoToPractice,
}) => {
  const {
    stats,
    profileMode,
    openStartFromZeroModal,
    continueMyProgress,
    getLevelTitle,
  } = useUserProgress();

  const [activeCategory, setActiveCategory] = useState<ModuleCategory>('all');

  const currentDateFormatted = useMemo(() => {
    return new Date().toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
    });
  }, []);

  // 20 Defined BST Modules
  const BST_MODULES: BSTModuleItem[] = useMemo(
    () => [
      // FUNDAMENTALS (1-10)
      {
        id: 'mod-1',
        code: 'BST-01',
        category: 'FUNDAMENTALS',
        categoryKey: 'fundamentals',
        title: 'WHAT IS A TREE?',
        description: 'Introduction to hierarchical tree data structures, roots, edges, and leaf nodes.',
        criteria: 'Read theory guide and pass interactive node identification.',
        lessonIndex: 0,
        lessonId: 'lesson-1',
      },
      {
        id: 'mod-2',
        code: 'BST-02',
        category: 'FUNDAMENTALS',
        categoryKey: 'fundamentals',
        title: 'BINARY TREE',
        description: 'Explore trees where every node has at most two children (left and right).',
        criteria: 'Understand branching limit and 0, 1, or 2 children rules.',
        lessonIndex: 1,
        lessonId: 'lesson-2',
      },
      {
        id: 'mod-3',
        code: 'BST-03',
        category: 'FUNDAMENTALS',
        categoryKey: 'fundamentals',
        title: 'WHAT IS A BST?',
        description: 'Ordered binary tree structure designed for fast logarithmic O(log n) lookups.',
        criteria: 'Master the fundamental ordering invariant across all nodes.',
        lessonIndex: 2,
        lessonId: 'lesson-3',
      },
      {
        id: 'mod-4',
        code: 'BST-04',
        category: 'FUNDAMENTALS',
        categoryKey: 'fundamentals',
        title: 'BST PROPERTY',
        description: 'The Golden Rule: Left < Root < Right must hold recursively for all subtrees.',
        criteria: 'Verify BST integrity across subtrees and identify invalid nodes.',
        lessonIndex: 3,
        lessonId: 'lesson-4',
      },
      {
        id: 'mod-5',
        code: 'BST-05',
        category: 'FUNDAMENTALS',
        categoryKey: 'fundamentals',
        title: 'ROOT NODE',
        description: 'The topmost entry node with zero incoming parent pointers.',
        criteria: 'Identify the root node and understand tree entry mechanics.',
        lessonIndex: 4,
        lessonId: 'lesson-5',
      },
      {
        id: 'mod-6',
        code: 'BST-06',
        category: 'FUNDAMENTALS',
        categoryKey: 'fundamentals',
        title: 'PARENT NODE',
        description: 'Nodes directly connecting downwards to one or more descendant children.',
        criteria: 'Trace upward parent links required for node insertion and deletion.',
        lessonIndex: 5,
        lessonId: 'lesson-6',
      },
      {
        id: 'mod-7',
        code: 'BST-07',
        category: 'FUNDAMENTALS',
        categoryKey: 'fundamentals',
        title: 'CHILD NODE',
        description: 'Left and right branch descendants directly connected to parent nodes.',
        criteria: 'Distinguish between smaller left children and larger right children.',
        lessonIndex: 6,
        lessonId: 'lesson-7',
      },
      {
        id: 'mod-8',
        code: 'BST-08',
        category: 'FUNDAMENTALS',
        categoryKey: 'fundamentals',
        title: 'LEAF NODE',
        description: 'Endpoint nodes at the bottom of the tree with zero child pointers.',
        criteria: 'Identify leaf nodes and execute direct leaf severing.',
        lessonIndex: 7,
        lessonId: 'lesson-8',
      },
      {
        id: 'mod-9',
        code: 'BST-09',
        category: 'FUNDAMENTALS',
        categoryKey: 'fundamentals',
        title: 'INTERNAL NODE',
        description: 'Non-leaf routing nodes that possess at least one active child branch.',
        criteria: 'Identify internal hub nodes that direct recursive binary searches.',
        lessonIndex: 8,
        lessonId: 'lesson-9',
      },
      {
        id: 'mod-10',
        code: 'BST-10',
        category: 'FUNDAMENTALS',
        categoryKey: 'fundamentals',
        title: 'LEFT & RIGHT SUBTREE',
        description: 'Subtrees containing all strictly smaller left and strictly larger right descendants.',
        criteria: 'Analyze entire subtrees and verify global BST invariants.',
        lessonIndex: 9,
        lessonId: 'lesson-10',
      },

      // OPERATIONS (11-16)
      {
        id: 'mod-11',
        code: 'BST-11',
        category: 'OPERATIONS',
        categoryKey: 'operations',
        title: 'BST INSERTION',
        description: 'Compare values starting from root and attach new node at an empty leaf slot.',
        criteria: 'Place nodes in correct slots preserving the Left < Root < Right rule.',
        lessonIndex: 12,
        lessonId: 'lesson-13',
      },
      {
        id: 'mod-12',
        code: 'BST-12',
        category: 'OPERATIONS',
        categoryKey: 'operations',
        title: 'BST DELETION',
        description: 'Overview of node deletion across 3 structural cases without breaking order.',
        criteria: 'Differentiate between 0, 1, and 2 children deletion strategies.',
        lessonIndex: 13,
        lessonId: 'lesson-14',
      },
      {
        id: 'mod-13',
        code: 'BST-13',
        category: 'OPERATIONS',
        categoryKey: 'operations',
        title: 'DELETE A LEAF NODE',
        description: 'Case 1 Deletion: Safely sever and remove nodes with 0 children directly.',
        criteria: 'Nullify parent pointer without affecting any subtrees.',
        lessonIndex: 14,
        lessonId: 'lesson-15',
      },
      {
        id: 'mod-14',
        code: 'BST-14',
        category: 'OPERATIONS',
        categoryKey: 'operations',
        title: 'DELETE A NODE WITH ONE CHILD',
        description: 'Case 2 Deletion: Promote single child up to take the place of the deleted parent.',
        criteria: 'Bypass deleted node and link parent directly to grandchild.',
        lessonIndex: 15,
        lessonId: 'lesson-16',
      },
      {
        id: 'mod-15',
        code: 'BST-15',
        category: 'OPERATIONS',
        categoryKey: 'operations',
        title: 'DELETE A NODE WITH TWO CHILDREN',
        description: 'Case 3 Deletion: Replace value with In-Order Successor and delete original successor.',
        criteria: 'Execute 2-child replacement with smallest node in right subtree.',
        lessonIndex: 16,
        lessonId: 'lesson-17',
      },
      {
        id: 'mod-16',
        code: 'BST-16',
        category: 'OPERATIONS',
        categoryKey: 'operations',
        title: 'IN-ORDER SUCCESSOR',
        description: 'Find the next immediately larger value: smallest node in the right subtree.',
        criteria: 'Locate leftmost node in the right branch of target node.',
        lessonIndex: 17,
        lessonId: 'lesson-18',
      },

      // TRAVERSALS (17-19)
      {
        id: 'mod-17',
        code: 'BST-17',
        category: 'TRAVERSALS',
        categoryKey: 'traversals',
        title: 'INORDER TRAVERSAL',
        description: 'Left → Root → Right: Yields strictly ascending sorted order for any BST.',
        criteria: 'Traverse nodes in sorted sequence and verify ascending output.',
        lessonIndex: 19,
        lessonId: 'lesson-20',
      },
      {
        id: 'mod-18',
        code: 'BST-18',
        category: 'TRAVERSALS',
        categoryKey: 'traversals',
        title: 'PREORDER TRAVERSAL',
        description: 'Root → Left → Right: Ideal for cloning, serializing, and reconstructing trees.',
        criteria: 'Record root first before exploring left and right subtrees.',
        lessonIndex: 20,
        lessonId: 'lesson-21',
      },
      {
        id: 'mod-19',
        code: 'BST-19',
        category: 'TRAVERSALS',
        categoryKey: 'traversals',
        title: 'POSTORDER TRAVERSAL',
        description: 'Left → Right → Root: Ideal for bottom-up cleanup and deleting tree nodes.',
        criteria: 'Process child branches completely before visiting parent nodes.',
        lessonIndex: 21,
        lessonId: 'lesson-22',
      },

      // CHALLENGES (20)
      {
        id: 'mod-20',
        code: 'BST-20',
        category: 'CHALLENGES',
        categoryKey: 'challenges',
        title: 'BST INTERACTIVE GAME',
        description: '5 interactive levels: BST Formation, Insertion, 3-Case Deletion, and Traversals.',
        criteria: 'Complete all 5 game levels to achieve full interactive BST mastery.',
        isGame: true,
      },
    ],
    []
  );

  // Helper to compute module status and progress
  const getModuleStatus = (module: BSTModuleItem) => {
    if (module.isGame) {
      const completedCount = (stats?.completedGameChallenges || []).length;
      const percent = Math.round((completedCount / 5) * 100);
      const isCompleted = completedCount >= 5;
      const isInProgress = completedCount > 0 && completedCount < 5;
      return {
        percent,
        isCompleted,
        isInProgress,
        statusLabel: isCompleted ? 'Completed' : isInProgress ? 'In Progress' : 'Not Started',
      };
    }

    const isCompleted = module.lessonId
      ? (stats?.completedLessons || []).includes(module.lessonId)
      : false;

    return {
      percent: isCompleted ? 100 : 0,
      isCompleted,
      isInProgress: false,
      statusLabel: isCompleted ? 'Completed' : 'Not Started',
    };
  };

  // Game levels breakdown
  const gameLevels = useMemo(
    () => [
      { id: 'game-lvl-1', level: 1, title: 'Level 1 — Basic BST Formation' },
      { id: 'game-lvl-2', level: 2, title: 'Level 2 — BST Insertion' },
      { id: 'game-lvl-3', level: 3, title: 'Level 3 — BST Deletion' },
      { id: 'game-lvl-4', level: 4, title: 'Level 4 — Tree Traversals' },
      { id: 'game-lvl-5', level: 5, title: 'Level 5 — BST Challenge' },
    ],
    []
  );

  const completedGameLevelsCount = useMemo(() => {
    const ids = stats?.completedGameChallenges || [];
    return ids.length;
  }, [stats?.completedGameChallenges]);

  // Overall Completion Calculation (Dynamic out of 20 activities)
  const completedActivitiesCount = useMemo(() => {
    return BST_MODULES.reduce((count, mod) => {
      const status = getModuleStatus(mod);
      return status.isCompleted ? count + 1 : count;
    }, 0);
  }, [BST_MODULES, stats]);

  const overallPercentage = useMemo(() => {
    return Math.round((completedActivitiesCount / 20) * 100);
  }, [completedActivitiesCount]);

  // Performance Stats Calculation
  const masteredCount = useMemo(() => {
    // Count of fully completed activities + badges earned
    return completedActivitiesCount;
  }, [completedActivitiesCount]);

  const masterChallengesCount = useMemo(() => {
    // 4 challenge categories / practice challenges
    const practiceCount = (stats?.completedPractice || []).length;
    return Math.min(4, practiceCount);
  }, [stats?.completedPractice]);

  // Visual Lessons Section (2 Visual Lessons)
  const visualLesson1Completed = (stats?.completedLessons || []).includes('lesson-1');
  const visualLesson2Completed = (stats?.completedLessons || []).includes('lesson-4');
  const visualLessonsCompletedCount = (visualLesson1Completed ? 1 : 0) + (visualLesson2Completed ? 1 : 0);

  // Recommended Next Step (Find first incomplete BST module)
  const nextIncompleteModule = useMemo(() => {
    const firstIncomplete = BST_MODULES.find((m) => !getModuleStatus(m).isCompleted);
    return firstIncomplete || null;
  }, [BST_MODULES, stats]);

  const handleContinueNext = () => {
    soundManager.playClick();
    if (!nextIncompleteModule) {
      if (onGoToLearn) onGoToLearn(0);
      return;
    }

    if (nextIncompleteModule.isGame) {
      if (onGoToGame) onGoToGame();
    } else if (typeof nextIncompleteModule.lessonIndex === 'number') {
      if (onGoToLearn) onGoToLearn(nextIncompleteModule.lessonIndex);
    } else {
      if (onGoToLearn) onGoToLearn(0);
    }
  };

  const handleModuleAction = (module: BSTModuleItem) => {
    soundManager.playClick();
    if (module.isGame) {
      if (onGoToGame) onGoToGame();
    } else if (typeof module.lessonIndex === 'number') {
      if (onGoToLearn) onGoToLearn(module.lessonIndex);
    }
  };

  // Filter modules based on category tab
  const filteredModules = useMemo(() => {
    if (activeCategory === 'all') return BST_MODULES;
    return BST_MODULES.filter((m) => m.categoryKey === activeCategory);
  }, [BST_MODULES, activeCategory]);

  return (
    <div id="bst-progress-dashboard" className="space-y-6 pb-20 text-slate-900 dark:text-slate-100 selection:bg-purple-600 selection:text-white">
      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-mono font-bold tracking-wider uppercase bg-purple-50 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 shadow-2xs">
              CURRICULUM PROGRESS TRACKER
            </span>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
              Last synced: {currentDateFormatted}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Learning Progress & Mastery
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-3xl leading-relaxed">
            Track your journey through Binary Search Trees, tree operations, traversals, and interactive challenges.
          </p>
        </div>

        {/* Right side Reset button */}
        <div className="flex items-center gap-3">
          <button
            id="progress-reset-btn"
            onClick={() => {
              soundManager.playClick();
              openStartFromZeroModal();
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900/90 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-purple-700 dark:hover:text-purple-300 border border-slate-200 dark:border-purple-900/40 hover:border-purple-300 dark:hover:border-purple-700/60 text-xs font-medium transition-all shadow-xs cursor-pointer group"
          >
            <RotateCcw className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 group-hover:rotate-[-45deg] transition-transform" />
            <span>Reset Progress</span>
          </button>
        </div>
      </div>

      {/* TOP SUMMARY SECTION: 3 large cards in one row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* CARD 1 — OVERALL COMPLETION */}
        <div
          id="card-overall-completion"
          className="bg-white dark:bg-[#0b0f19] p-6 rounded-2xl border border-slate-200 dark:border-purple-900/30 shadow-xs dark:shadow-lg dark:shadow-purple-950/20 flex flex-col justify-between space-y-4"
        >
          <div className="space-y-1">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              OVERALL COMPLETION
            </span>
            <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-mono flex items-baseline gap-2">
              <span>{overallPercentage}%</span>
              <span className="text-xs sm:text-sm font-normal text-slate-500 dark:text-slate-400">
                ({completedActivitiesCount} of 20 Activities)
              </span>
            </div>
          </div>

          <div className="space-y-2">
            {/* Horizontal progress bar */}
            <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800/90 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-purple-900/30">
              <div
                className="h-full bg-gradient-to-r from-purple-600 via-indigo-500 to-cyan-500 dark:to-cyan-400 rounded-full transition-all duration-500 shadow-xs"
                style={{ width: `${overallPercentage}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
              <span>0% Beginner</span>
              <span>100% Master</span>
            </div>
          </div>
        </div>

        {/* CARD 2 — PERFORMANCE STATS */}
        <div
          id="card-performance-stats"
          className="bg-white dark:bg-[#0b0f19] p-6 rounded-2xl border border-slate-200 dark:border-purple-900/30 shadow-xs dark:shadow-lg dark:shadow-purple-950/20 flex flex-col justify-between space-y-4"
        >
          <div className="space-y-3">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              PERFORMANCE STATS
            </span>

            {/* 3 Stats in a row */}
            <div className="grid grid-cols-3 gap-2 text-center pt-1">
              <div className="space-y-0.5">
                <div className="text-2xl sm:text-3xl font-extrabold text-amber-500 dark:text-amber-400 font-mono flex items-center justify-center gap-1">
                  <span>{masteredCount}</span>
                </div>
                <div className="text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight">
                  MASTERED ★
                </div>
              </div>

              <div className="space-y-0.5 border-x border-slate-200 dark:border-purple-900/30 px-1">
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
                  {completedActivitiesCount} <span className="text-base text-slate-400 dark:text-slate-500">/ 20</span>
                </div>
                <div className="text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight">
                  ACTIVITIES
                </div>
              </div>

              <div className="space-y-0.5">
                <div className="text-2xl sm:text-3xl font-extrabold text-cyan-600 dark:text-cyan-400 font-mono">
                  {completedGameLevelsCount} <span className="text-base text-slate-400 dark:text-slate-500">/ 5</span>
                </div>
                <div className="text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight">
                  LEVELS WON
                </div>
              </div>
            </div>
          </div>

          {/* Master Challenges row below */}
          <div className="pt-3 border-t border-slate-200 dark:border-purple-900/30 flex items-center gap-2 text-xs text-purple-700 dark:text-purple-300 font-mono">
            <Trophy className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
            <span>Master Challenges: {masterChallengesCount} / 4 Challenges</span>
          </div>
        </div>

        {/* CARD 3 — RECOMMENDED NEXT STEP */}
        <div
          id="card-recommended-next-step"
          className="bg-white dark:bg-[#0b0f19] p-6 rounded-2xl border border-slate-200 dark:border-purple-900/30 shadow-xs dark:shadow-lg dark:shadow-purple-950/20 flex flex-col justify-between space-y-4"
        >
          <div className="space-y-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
              RECOMMENDED NEXT STEP
            </span>

            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight line-clamp-1">
              {nextIncompleteModule
                ? nextIncompleteModule.title
                : 'CONGRATULATIONS! ALL 20 BST MODULES MASTERED'}
            </h3>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
              {nextIncompleteModule
                ? nextIncompleteModule.description
                : 'You have completed all 20 Binary Search Tree lessons, operations, traversals, and interactive challenges.'}
            </p>
          </div>

          <button
            id="continue-learning-btn"
            onClick={handleContinueNext}
            className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-purple-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <span>{nextIncompleteModule ? 'CONTINUE LEARNING →' : 'REVIEW ALL TOPICS →'}</span>
          </button>
        </div>
      </div>

      {/* SECTION 1 — BST VISUAL LESSONS */}
      <div
        id="section-visual-lessons"
        className="bg-white dark:bg-[#0b0f19] p-6 rounded-2xl border border-slate-200 dark:border-purple-900/30 shadow-xs dark:shadow-lg dark:shadow-purple-950/20 space-y-5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/80 border border-purple-200 dark:border-purple-800/60 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 block">
                VISUAL LESSONS
              </span>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                2 VISUAL LESSONS ({visualLessonsCompletedCount} / 2 Completed)
              </h2>
            </div>
          </div>

          <button
            onClick={() => {
              soundManager.playClick();
              if (onGoToLearn) onGoToLearn(0);
            }}
            className="inline-flex items-center gap-1 text-xs font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors cursor-pointer self-start sm:self-auto"
          >
            <span>Open Lessons Section</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 2 Visual Lesson Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* Visual Lesson 1 */}
          <div
            onClick={() => {
              soundManager.playClick();
              if (onGoToLearn) onGoToLearn(0);
            }}
            className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/90 hover:bg-slate-100 dark:hover:bg-slate-850 border border-slate-200 dark:border-purple-900/30 hover:border-purple-300 dark:hover:border-purple-700/50 transition-all flex items-center justify-between gap-4 cursor-pointer group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-2 h-2 rounded-full bg-purple-500" />
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors truncate">
                Introduction to Binary Search Trees
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-mono flex-shrink-0">
              {visualLesson1Completed ? (
                <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 px-2 py-0.5 rounded-md">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Completed</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-transparent px-2 py-0.5 rounded-md">
                  <Circle className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                  <span>Not completed</span>
                </span>
              )}
            </div>
          </div>

          {/* Visual Lesson 2 */}
          <div
            onClick={() => {
              soundManager.playClick();
              if (onGoToLearn) onGoToLearn(3);
            }}
            className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/90 hover:bg-slate-100 dark:hover:bg-slate-850 border border-slate-200 dark:border-purple-900/30 hover:border-purple-700/50 transition-all flex items-center justify-between gap-4 cursor-pointer group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-2 h-2 rounded-full bg-indigo-500" />
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors truncate">
                BST Properties & Structure
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-mono flex-shrink-0">
              {visualLesson2Completed ? (
                <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 px-2 py-0.5 rounded-md">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Completed</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-transparent px-2 py-0.5 rounded-md">
                  <Circle className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                  <span>Not completed</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2 — LEARNING MODULES */}
      <div id="section-learning-modules" className="space-y-4">
        {/* Category Filters Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          {/* Pill Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                { id: 'all', label: 'All Modules' },
                { id: 'fundamentals', label: 'Fundamentals' },
                { id: 'operations', label: 'Operations' },
                { id: 'traversals', label: 'Traversals' },
                { id: 'challenges', label: 'Challenges' },
              ] as const
            ).map((cat) => {
              const isSelected = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    soundManager.playClick();
                    setActiveCategory(cat.id);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30 border border-purple-500/50'
                      : 'bg-white dark:bg-slate-900/90 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200 dark:border-purple-900/30 hover:border-purple-300 dark:hover:border-purple-700/40 shadow-2xs'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
            Showing {filteredModules.length} of 20 modules
          </div>
        </div>

        {/* BST Module Cards Grid / List */}
        <div className="space-y-4 pt-1">
          {filteredModules.map((module) => {
            const status = getModuleStatus(module);

            return (
              <div
                key={module.id}
                id={`module-card-${module.code}`}
                className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-purple-900/30 shadow-xs dark:shadow-md dark:shadow-purple-950/20 hover:border-purple-300 dark:hover:border-purple-700/50 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6"
              >
                {/* Left Side: Badges, Title, Description, Criteria */}
                <div className="space-y-2.5 max-w-3xl">
                  {/* Pill Badges Row */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60">
                      {module.code}
                    </span>

                    <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800/60 uppercase">
                      {module.category}
                    </span>

                    {status.isCompleted ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        <span>Completed</span>
                      </span>
                    ) : status.isInProgress ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
                        <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                        <span>In Progress ({status.percent}%)</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700/60">
                        <Circle className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                        <span>Not Started</span>
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-wide uppercase">
                    {module.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {module.description}
                  </p>

                  {/* Criteria */}
                  <div className="pt-1">
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      <strong className="font-semibold text-slate-700 dark:text-slate-200">Criteria: </strong>
                      {module.criteria}
                    </span>
                  </div>

                  {/* Special display for Game Levels in Module 20 */}
                  {module.isGame && (
                    <div className="pt-3 border-t border-slate-200 dark:border-purple-900/30 mt-3 space-y-2">
                      <div className="text-xs font-mono font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                        <Gamepad2 className="w-3.5 h-3.5" />
                        <span>GAME LEVEL PROGRESS:</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {gameLevels.map((lvl) => {
                          const isLvlDone = (stats?.completedGameChallenges || []).includes(lvl.id);
                          return (
                            <div
                              key={lvl.id}
                              className={`px-3 py-1.5 rounded-lg border text-xs font-mono flex items-center justify-between gap-2 ${
                                isLvlDone
                                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300'
                                  : 'bg-slate-50 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400'
                              }`}
                            >
                              <span className="truncate">{lvl.title}</span>
                              {isLvlDone ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                              ) : (
                                <Circle className="w-3 h-3 text-slate-400 dark:text-slate-600 flex-shrink-0" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Side: Progress Bar + Action Button */}
                <div className="flex lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-4 flex-shrink-0 border-t lg:border-t-0 border-slate-200 dark:border-purple-900/20 pt-4 lg:pt-0">
                  <div className="space-y-1 text-left lg:text-right w-36 sm:w-44">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-500 dark:text-slate-400">Progress</span>
                      <span className="font-bold text-slate-900 dark:text-white">{status.percent}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-300"
                        style={{ width: `${status.percent}%` }}
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => handleModuleAction(module)}
                    className="py-2.5 px-5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-md shadow-purple-600/20 transition-all flex items-center gap-1.5 cursor-pointer flex-shrink-0 active:scale-95"
                  >
                    <span>
                      {status.isCompleted
                        ? 'Review Module →'
                        : status.isInProgress
                        ? 'Continue →'
                        : 'Start Module →'}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
