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
  Sparkles,
} from 'lucide-react';
import { useUserProgress } from '../../context/UserProgressContext';
import { soundManager } from '../../utils/audio';
import { LESSONS } from '../../data/lessonsData';

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
  isTerminologyRecap?: boolean;
  terminologySubtopics?: { id: string; title: string; lessonIndex?: number }[];
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

  // Dynamically generate curriculum modules directly from the current Learn Table of Contents data
  const BST_MODULES: BSTModuleItem[] = useMemo(() => {
    const modules: BSTModuleItem[] = [];
    let displayCounter = 1;

    // Derive terminology subtopics dynamically from current LESSONS (lessons 5 through 11)
    const terminologyLessons = LESSONS.filter((l) => l.number >= 5 && l.number <= 11);
    const terminologySubtopics = terminologyLessons.map((l) => ({
      id: l.id,
      title: l.shortTitle.replace(/^The\s+/, ''),
      lessonIndex: LESSONS.findIndex((item) => item.id === l.id),
    }));

    LESSONS.forEach((lesson, index) => {
      // Hide the 7 terminology subtopics from top-level display: they are grouped under Terminology Recap
      if (lesson.number >= 5 && lesson.number <= 11) {
        return;
      }

      // Determine category based on curriculum topic number
      let category: 'FUNDAMENTALS' | 'OPERATIONS' | 'TRAVERSALS' = 'FUNDAMENTALS';
      let categoryKey: 'fundamentals' | 'operations' | 'traversals' = 'fundamentals';

      if (lesson.number >= 20 && lesson.number <= 22) {
        category = 'TRAVERSALS';
        categoryKey = 'traversals';
      } else if (lesson.number >= 12 && lesson.number <= 19) {
        category = 'OPERATIONS';
        categoryKey = 'operations';
      }

      const code = `BST-${String(displayCounter).padStart(2, '0')}`;
      displayCounter++;

      modules.push({
        id: `mod-${lesson.id}`,
        code,
        category,
        categoryKey,
        title: lesson.shortTitle || lesson.title,
        description: lesson.definition || lesson.tagline || '',
        criteria:
          lesson.tryIt?.instruction ||
          lesson.keyConcept ||
          `Master ${lesson.shortTitle || lesson.title} concepts and tree properties.`,
        lessonIndex: index,
        lessonId: lesson.id,
      });

      // Right after Chapter 4 (BST Property), insert Terminology Recap matching Learn TOC structure
      if (lesson.number === 4) {
        const recapCode = `BST-${String(displayCounter).padStart(2, '0')}`;
        displayCounter++;

        modules.push({
          id: 'mod-terminology-recap',
          code: recapCode,
          category: 'FUNDAMENTALS',
          categoryKey: 'fundamentals',
          title: 'Terminology Recap',
          description:
            'Core anatomical terms: Root, Parent, Child, Leaf, Internal nodes, and Left/Right subtrees.',
          criteria:
            'Review core tree anatomy terms and understand the role of each node type.',
          lessonId: 'terminology-recap',
          lessonIndex: 4, // Leads directly to terminology section in Learn
          isTerminologyRecap: true,
          terminologySubtopics,
        });
      }
    });

    // Add interactive challenge game module
    const gameCode = `BST-${String(displayCounter).padStart(2, '0')}`;
    modules.push({
      id: 'mod-game-challenges',
      code: gameCode,
      category: 'CHALLENGES',
      categoryKey: 'challenges',
      title: 'BST Interactive Game',
      description: '5 interactive levels: BST Formation, Insertion, 3-Case Deletion, and Traversals.',
      criteria: 'Complete all 5 game levels to achieve full interactive BST mastery.',
      isGame: true,
    });

    return modules;
  }, []);

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

    if (module.isTerminologyRecap) {
      const isDirectDone = (stats?.completedLessons || []).includes('terminology-recap');
      const subtopics = module.terminologySubtopics || [];
      const completedSubs = subtopics.filter((sub) =>
        (stats?.completedLessons || []).includes(sub.id)
      ).length;

      if (isDirectDone || (subtopics.length > 0 && completedSubs === subtopics.length)) {
        return {
          percent: 100,
          isCompleted: true,
          isInProgress: false,
          statusLabel: 'Completed',
        };
      }

      if (completedSubs > 0) {
        const percent = Math.round((completedSubs / subtopics.length) * 100);
        return {
          percent,
          isCompleted: false,
          isInProgress: true,
          statusLabel: `In Progress (${percent}%)`,
        };
      }

      return {
        percent: 0,
        isCompleted: false,
        isInProgress: false,
        statusLabel: 'Not Started',
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

  // Overall Completion Calculation (Dynamic across all curriculum modules)
  const completedActivitiesCount = useMemo(() => {
    return BST_MODULES.reduce((count, mod) => {
      const status = getModuleStatus(mod);
      return status.isCompleted ? count + 1 : count;
    }, 0);
  }, [BST_MODULES, stats]);

  const overallPercentage = useMemo(() => {
    if (BST_MODULES.length === 0) return 0;
    return Math.round((completedActivitiesCount / BST_MODULES.length) * 100);
  }, [completedActivitiesCount, BST_MODULES.length]);

  // Performance Stats Calculation
  const masteredCount = useMemo(() => {
    return completedActivitiesCount;
  }, [completedActivitiesCount]);

  const masterChallengesCount = useMemo(() => {
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
    } else {
      if (onGoToLearn) onGoToLearn(0);
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
                ({completedActivitiesCount} of {BST_MODULES.length} Activities)
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
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              PERFORMANCE STATS
            </span>

            {/* 3 Stats in a row */}
            <div className="grid grid-cols-3 gap-2 text-center pt-1">
              <div className="space-y-0.5">
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono flex items-center justify-center gap-1">
                  <span className="text-slate-900 dark:text-white">{masteredCount}</span>
                </div>
                <div className="text-[10px] sm:text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-tight">
                  MASTERED
                </div>
              </div>

              <div className="space-y-0.5 border-x border-slate-200 dark:border-purple-900/30 px-1">
                <div className="text-2xl sm:text-3xl font-extrabold font-mono">
                  <span className="text-slate-900 dark:text-white">{completedActivitiesCount}</span>{' '}
                  <span className="text-base text-indigo-500/80 dark:text-indigo-300/80">/ {BST_MODULES.length}</span>
                </div>
                <div className="text-[10px] sm:text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-tight">
                  ACTIVITIES
                </div>
              </div>

              <div className="space-y-0.5">
                <div className="text-2xl sm:text-3xl font-extrabold font-mono">
                  <span className="text-slate-900 dark:text-white">{completedGameLevelsCount}</span>{' '}
                  <span className="text-base text-indigo-500/80 dark:text-indigo-300/80">/ 5</span>
                </div>
                <div className="text-[10px] sm:text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-tight">
                  LEVELS WON
                </div>
              </div>
            </div>
          </div>

          {/* Master Challenges row below */}
          <div className="pt-3 border-t border-slate-200 dark:border-purple-900/30 flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400 font-mono">
            <Trophy className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
            <span>
              <span className="font-bold uppercase tracking-tight text-indigo-600 dark:text-indigo-400">MASTER CHALLENGES:</span>{' '}
              <span className="font-bold text-slate-900 dark:text-white">{masterChallengesCount}</span>
              <span className="text-indigo-500/80 dark:text-indigo-300/80"> / 4 Challenges</span>
            </span>
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
                : `CONGRATULATIONS! ALL ${BST_MODULES.length} BST MODULES MASTERED`}
            </h3>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
              {nextIncompleteModule
                ? nextIncompleteModule.description
                : `You have completed all ${BST_MODULES.length} Binary Search Tree lessons, operations, traversals, and interactive challenges.`}
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
            Showing {filteredModules.length} of {BST_MODULES.length} modules
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

                    <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-cyan-50 dark:cyan-950/60 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800/60 uppercase">
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

                  {/* Special display for Terminology Topics */}
                  {module.isTerminologyRecap && (
                    <div className="pt-3 border-t border-slate-200 dark:border-purple-900/30 mt-3 space-y-2">
                      <div className="text-xs font-mono font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>TERMINOLOGY TOPICS:</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {module.terminologySubtopics?.map((sub) => {
                          const isSubDone = (stats?.completedLessons || []).includes(sub.id);
                          return (
                            <div
                              key={sub.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                soundManager.playClick();
                                if (onGoToLearn && typeof sub.lessonIndex === 'number') {
                                  onGoToLearn(sub.lessonIndex);
                                }
                              }}
                              className={`px-3 py-1.5 rounded-lg border text-xs font-mono flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                                isSubDone
                                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300'
                                  : 'bg-slate-50 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-purple-400'
                              }`}
                            >
                              <span className="truncate">{sub.title}</span>
                              {isSubDone ? (
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

                  {/* Special display for Game Levels in Game Module */}
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
