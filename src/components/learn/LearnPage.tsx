import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  BookOpen,
  Lightbulb,
} from 'lucide-react';
import { LESSONS } from '../../data/lessonsData';
import { LessonModule } from '../../types';
import { BstArchitectureFlow } from './BstArchitectureFlow';
import { TerminologyRecapSection } from './TerminologyRecapSection';
import { useUserProgress } from '../../context/UserProgressContext';
import { soundManager } from '../../utils/audio';
import { getKeyRulesForLesson } from '../../data/keyRulesData';

interface LearnPageProps {
  initialTopicIndex?: number;
  onGoToPractice?: () => void;
  onGoToGame?: () => void;
}

const TERMINOLOGY_SUBTOPICS = [
  { id: 'lesson-5', title: 'Root Node' },
  { id: 'lesson-6', title: 'Parent Node' },
  { id: 'lesson-7', title: 'Child Node' },
  { id: 'lesson-8', title: 'Leaf Node' },
  { id: 'lesson-9', title: 'Internal Node' },
  { id: 'lesson-10', title: 'Left Subtree' },
  { id: 'lesson-11', title: 'Right Subtree' },
];

export const LearnPage: React.FC<LearnPageProps> = ({
  initialTopicIndex = 0,
  onGoToPractice,
  onGoToGame,
}) => {
  const { stats, completeLesson, addXP } = useUserProgress();

  const [activeLessonIndex, setActiveLessonIndex] = useState<number>(() => {
    if (initialTopicIndex !== undefined && initialTopicIndex >= 0 && initialTopicIndex < LESSONS.length) {
      return initialTopicIndex;
    }
    const firstUnfinished = LESSONS.findIndex((l) => !(stats?.completedLessons || []).includes(l.id));
    return firstUnfinished !== -1 ? firstUnfinished : 0;
  });

  const [isTerminologyRecap, setIsTerminologyRecap] = useState<boolean>(false);
  const [isTerminologyExpanded, setIsTerminologyExpanded] = useState<boolean>(false);
  const currentLesson: LessonModule = LESSONS[activeLessonIndex] || LESSONS[0];
  const [mobileTocOpen, setMobileTocOpen] = useState<boolean>(false);

  // Sync with initialTopicIndex prop when changed externally
  useEffect(() => {
    if (initialTopicIndex !== undefined && initialTopicIndex >= 0 && initialTopicIndex < LESSONS.length) {
      switchLesson(initialTopicIndex, false);
    }
  }, [initialTopicIndex]);

  // Handle switching topic
  const switchLesson = (index: number, shouldPlaySound = true) => {
    if (shouldPlaySound) soundManager.playClick();
    setIsTerminologyRecap(false);
    setIsTerminologyExpanded(false);
    setActiveLessonIndex(index);
    setMobileTocOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle clicking Terminology Recap heading to toggle expand/collapse and display content
  const handleToggleTerminologyRecap = (shouldPlaySound = true) => {
    if (shouldPlaySound) soundManager.playClick();
    setIsTerminologyExpanded((prev) => !prev);
    setIsTerminologyRecap(true);
    setMobileTocOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle clicking an individual subtopic underneath Terminology Recap
  const handleSelectSubtopic = (lessonId: string) => {
    soundManager.playClick();
    if (!isTerminologyRecap) {
      setIsTerminologyRecap(true);
    }
    setMobileTocOpen(false);
    setTimeout(() => {
      const el = document.getElementById(`term-section-${lessonId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
  };

  // Handle global reset to restart curriculum from zero
  useEffect(() => {
    const handleGlobalReset = () => {
      setIsTerminologyRecap(false);
      setIsTerminologyExpanded(false);
      setActiveLessonIndex(0);
    };

    window.addEventListener('bst-reset-progress', handleGlobalReset);
    window.addEventListener('bst-reset-current-activity', handleGlobalReset);
    return () => {
      window.removeEventListener('bst-reset-progress', handleGlobalReset);
      window.removeEventListener('bst-reset-current-activity', handleGlobalReset);
    };
  }, []);

  const isCurrentCompleted = (stats?.completedLessons || []).includes(currentLesson.id);
  const isTerminologyCompleted = (stats?.completedLessons || []).includes('terminology-recap');
  const completedLessonsCount = stats?.completedLessons?.length || 0;
  const learnProgressPercent = Math.round((completedLessonsCount / LESSONS.length) * 100);

  // Handle Mark as Completed button click for regular lessons
  const handleToggleMarkCompleted = () => {
    if (!isCurrentCompleted) {
      soundManager.playSuccess();
      completeLesson(currentLesson.id);
      addXP(currentLesson.xpReward, `Completed: ${currentLesson.shortTitle}`);
    } else {
      soundManager.playClick();
    }
  };

  // Handle Mark as Completed for Terminology Recap
  const handleToggleTerminologyCompleted = () => {
    if (!isTerminologyCompleted) {
      soundManager.playSuccess();
      completeLesson('terminology-recap');
      addXP(50, 'Completed: Terminology Recap');
    } else {
      soundManager.playClick();
    }
  };

  const formattedChapNumber = String(currentLesson.number).padStart(2, '0');

  return (
    <div id="learn-page-root" className="space-y-6 pb-20 max-w-7xl mx-auto">
      {/* 1. Header Theory Curriculum Hero Banner (Matches Image 1) */}
      <div
        id="learn-curriculum-banner"
        className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 text-xs">
          <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider text-[11px]">
            THEORY CURRICULUM // VOL. 01 &nbsp; Binary Search Tree Foundations
          </span>
          <span className="font-mono text-slate-500 dark:text-slate-400 font-semibold text-[11px]">
            Progress: {completedLessonsCount} / {LESSONS.length} Chapters ({learnProgressPercent}%)
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Binary Search Tree
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-4xl leading-relaxed">
          A comprehensive 6-chapter technical curriculum covering Binary Search Tree fundamentals, node hierarchy, search invariants, real-time node lookups, dynamic insertions, deletions, and structural traversals.
        </p>

        {/* Quick action button for Terminology Recap */}
        <div className="mt-4 flex items-center gap-2">
          <button
            id="learn-banner-terminology-recap-btn"
            onClick={() => handleToggleTerminologyRecap()}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold font-mono flex items-center gap-1.5 border transition-all cursor-pointer ${
              isTerminologyRecap
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                : 'bg-indigo-50/80 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border-indigo-200/80 dark:border-slate-700 hover:bg-indigo-100 dark:hover:bg-slate-750'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Terminology Recap</span>
          </button>
        </div>
      </div>

      {/* Mobile Table of Contents Toggle Bar */}
      <div className="lg:hidden bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span className="text-xs font-bold font-mono text-slate-800 dark:text-slate-200">
            {isTerminologyRecap
              ? 'Terminology Recap'
              : `Topic ${activeLessonIndex + 1}/${LESSONS.length}: ${currentLesson.shortTitle}`}
          </span>
        </div>
        <button
          onClick={() => {
            soundManager.playClick();
            setMobileTocOpen(!mobileTocOpen);
          }}
          className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center gap-1.5 border border-indigo-200/80 dark:border-slate-700 cursor-pointer"
        >
          <span>{mobileTocOpen ? 'Close Table of Contents' : 'Table of Contents'}</span>
        </button>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ========================================================================= */}
        {/* LEFT COLUMN: TABLE OF CONTENTS PANEL (Matches Image 1 & 2)                */}
        {/* ========================================================================= */}
        <aside
          id="learn-table-of-contents"
          className={`${
            mobileTocOpen ? 'block' : 'hidden lg:block'
          } lg:col-span-4 xl:col-span-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col overflow-hidden sticky top-6`}
        >
          {/* Table of Contents Header (Horizontal line removed per user request) */}
          <div className="px-5 py-4 flex items-center justify-between bg-slate-50/40 dark:bg-slate-850/40">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 font-mono">
              TABLE OF CONTENTS
            </h2>
            <span className="font-mono text-xs text-slate-400 dark:text-slate-500 font-semibold">
              {LESSONS.length} Chapters
            </span>
          </div>

          {/* Table of Contents List of Cards with Left Border & Small Circle on Right (No horizontal scrollbar/white bar) */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden py-2 space-y-0.5 custom-scrollbar max-h-[calc(100vh-14rem)] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:h-0">
            {LESSONS.map((lesson, idx) => {
              // Hide the 7 terminology subtopics from top-level display: they are collapsible under Terminology Recap
              if (lesson.number >= 5 && lesson.number <= 11) {
                return null;
              }

              const isDone = (stats?.completedLessons || []).includes(lesson.id);
              const isActive = !isTerminologyRecap && idx === activeLessonIndex;
              const formattedNumber = String(lesson.number).padStart(2, '0');

              return (
                <React.Fragment key={lesson.id}>
                  <button
                    id={`toc-topic-item-${lesson.number}`}
                    onClick={() => switchLesson(idx)}
                    className={`w-full text-left py-3 px-4 text-xs transition-all flex items-center justify-between gap-3 cursor-pointer group select-none border-l-[3px] ${
                      isActive
                        ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-slate-900 dark:text-white font-bold'
                        : 'border-transparent hover:bg-slate-50/80 dark:hover:bg-slate-850/60 text-slate-600 dark:text-slate-400 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Chapter Number in mono */}
                      <span
                        className={`font-mono text-xs font-bold transition-colors flex-shrink-0 ${
                          isActive
                            ? 'text-indigo-600 dark:text-indigo-400'
                            : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'
                        }`}
                      >
                        {formattedNumber}
                      </span>

                      {/* Lesson Title */}
                      <span
                        className={`truncate text-xs ${
                          isActive
                            ? 'text-slate-900 dark:text-white font-bold'
                            : 'text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200'
                        }`}
                      >
                        {lesson.shortTitle || lesson.title}
                      </span>
                    </div>

                    {/* Small Circle Indicator at Right Edge (Matches Image 1 & 2) */}
                    <div className="flex items-center justify-center flex-shrink-0 ml-2">
                      {isActive ? (
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 ring-2 ring-indigo-600/25" />
                      ) : isDone ? (
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                      ) : (
                        <span className="w-2 h-2 rounded-full border border-slate-300 dark:border-slate-600 group-hover:border-slate-400" />
                      )}
                    </div>
                  </button>

                  {/* Normal Terminology Recap Topic right after Chapter 4 */}
                  {lesson.number === 4 && (
                    <div key="terminology-recap-toc-group">
                      <button
                        id="toc-topic-item-terminology-recap"
                        onClick={() => handleToggleTerminologyRecap()}
                        className={`w-full text-left py-3 px-4 text-xs transition-all flex items-center justify-between gap-3 cursor-pointer group select-none border-l-[3px] ${
                          isTerminologyRecap
                            ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-slate-900 dark:text-white font-bold'
                            : 'border-transparent hover:bg-slate-50/80 dark:hover:bg-slate-850/60 text-slate-600 dark:text-slate-400 font-medium'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Normal Chapter Number formatted as 05 */}
                          <span
                            className={`font-mono text-xs font-bold transition-colors flex-shrink-0 ${
                              isTerminologyRecap
                                ? 'text-indigo-600 dark:text-indigo-400'
                                : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'
                            }`}
                          >
                            05
                          </span>

                          {/* Normal Lesson Title without special RECAP label */}
                          <span
                            className={`truncate text-xs ${
                              isTerminologyRecap
                                ? 'text-slate-900 dark:text-white font-bold'
                                : 'text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200'
                            }`}
                          >
                            Terminology Recap
                          </span>
                        </div>

                        {/* Small Circle Indicator at Right Edge (identical to other normal topics) */}
                        <div className="flex items-center justify-center flex-shrink-0 ml-2">
                          {isTerminologyRecap ? (
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 ring-2 ring-indigo-600/25" />
                          ) : isTerminologyCompleted ? (
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                          ) : (
                            <span className="w-2 h-2 rounded-full border border-slate-300 dark:border-slate-600 group-hover:border-slate-400" />
                          )}
                        </div>
                      </button>

                      {/* Expandable 7 Terminology Subtopics (hidden by default) */}
                      {isTerminologyExpanded && (
                        <div
                          id="toc-terminology-subtopics-list"
                          className="py-1 space-y-0.5 bg-slate-50/70 dark:bg-slate-850/50 border-l-[3px] border-indigo-200/80 dark:border-indigo-900/60 mx-2 pl-2 pr-2 my-0.5 rounded-r-xl transition-all"
                        >
                          {TERMINOLOGY_SUBTOPICS.map((subtopic) => {
                            const isSubDone = (stats?.completedLessons || []).includes(subtopic.id);

                            return (
                              <button
                                key={subtopic.id}
                                id={`toc-subtopic-${subtopic.id}`}
                                onClick={() => handleSelectSubtopic(subtopic.id)}
                                className="w-full text-left py-2 px-3 text-xs rounded-lg transition-colors flex items-center justify-between gap-2 cursor-pointer group text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white/80 dark:hover:bg-slate-850/80 font-medium"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 group-hover:bg-indigo-600 dark:group-hover:bg-indigo-400 flex-shrink-0" />
                                  <span className="truncate text-xs group-hover:text-slate-900 dark:group-hover:text-slate-200">
                                    {subtopic.title}
                                  </span>
                                </div>

                                <div className="flex items-center justify-center flex-shrink-0 ml-1">
                                  {isSubDone ? (
                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                                  ) : (
                                    <span className="w-1.5 h-1.5 rounded-full border border-slate-300 dark:border-slate-600 group-hover:border-slate-400" />
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </aside>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: LESSON CONTENT MAIN / DEDICATED TERMINOLOGY RECAP           */}
        {/* ========================================================================= */}
        <main
          id="learn-content-main"
          className="lg:col-span-8 xl:col-span-8 space-y-6"
        >
          {isTerminologyRecap ? (
            /* Dedicated Terminology Recap Section */
            <TerminologyRecapSection
              onGoToChapter={(chapterNumber) => {
                const foundIndex = LESSONS.findIndex((l) => l.number === chapterNumber);
                if (foundIndex !== -1) {
                  switchLesson(foundIndex);
                }
              }}
              onPrevTopic={() => switchLesson(3)} // Back to Chapter 4 BST Property
              onNextTopic={() => switchLesson(11)} // Forward to Chapter 12 Searching in a BST
              isCompleted={isTerminologyCompleted}
              onToggleComplete={handleToggleTerminologyCompleted}
            />
          ) : (
            /* Standard Lesson Card Container */
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 lg:p-9 shadow-xs space-y-7 transition-colors">
              {/* Topic Header */}
              <div className="space-y-3 pb-6 border-b border-slate-100 dark:border-slate-800">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                  {currentLesson.number}. {currentLesson.shortTitle}
                </h1>

                <p className="text-xs sm:text-sm text-indigo-600 dark:text-indigo-400 font-medium">
                  {currentLesson.tagline}
                </p>
              </div>

              {/* 1. Executive Summary Card (Matches Image 2) */}
              <div className="space-y-2">
                <div className="p-5 sm:p-6 bg-slate-50/70 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white font-mono uppercase tracking-wider">
                    Executive Summary:
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    {currentLesson.definition}
                  </p>
                </div>
              </div>

              {/* 2. Everyday Analogy Card with Blue Left Line (Matches Image 2) */}
              <div className="p-5 sm:p-6 bg-slate-50/50 dark:bg-slate-800/40 rounded-2xl border-l-4 border-indigo-600 dark:border-indigo-500 border-t border-r border-b border-slate-200/80 dark:border-slate-700/80 space-y-2">
                <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" />
                  <span>EVERYDAY ANALOGY: MENTAL MODEL</span>
                </div>
                <p className="text-xs sm:text-sm italic text-slate-700 dark:text-slate-300 leading-relaxed">
                  "{currentLesson.whyItMatters}"
                </p>
              </div>

              {/* 3. Key Points */}
              <div className="space-y-3">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  KEY POINTS
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {currentLesson.bulletPoints.map((point, i) => (
                    <div
                      key={i}
                      className="p-4 bg-slate-50/60 dark:bg-slate-800/40 rounded-xl border border-slate-200/70 dark:border-slate-700/70 flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3.5 Key Rules */}
              <div className="space-y-3">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  KEY RULES
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(currentLesson.keyRules || getKeyRulesForLesson(currentLesson.id)).map((rule, i) => (
                    <div
                      key={i}
                      className="p-4 bg-slate-50/60 dark:bg-slate-800/40 rounded-xl border border-slate-200/70 dark:border-slate-700/70 flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                      <span>{rule}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Architecture Diagram / BST Concept Flow */}
              <BstArchitectureFlow topicNumber={currentLesson.number} />

              {/* 5. Key Takeaway Card (Matches Image 3) */}
              <div
                id="learn-key-takeaway-card"
                className="p-5 sm:p-6 rounded-2xl bg-slate-50/90 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2"
              >
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider font-mono">
                  <Sparkles className="w-4 h-4" />
                  <span>KEY TAKEAWAY</span>
                </div>
                <p className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white leading-relaxed">
                  {currentLesson.keyConcept}
                </p>
              </div>

              {/* 6. Bottom Navigation Controls */}
              <div
                id="learn-bottom-navigation"
                className="grid grid-cols-1 sm:grid-cols-3 items-center gap-4 pt-4 border-t border-slate-100 dark:border-slate-800"
              >
                {/* Left: Previous Topic */}
                <div className="flex items-center justify-start">
                  {activeLessonIndex === 11 ? (
                    <button
                      id="learn-nav-prev-btn"
                      onClick={() => handleToggleTerminologyRecap()}
                      className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Terminology Recap</span>
                    </button>
                  ) : activeLessonIndex > 0 ? (
                    <button
                      id="learn-nav-prev-btn"
                      onClick={() => switchLesson(activeLessonIndex - 1)}
                      className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Previous Topic</span>
                    </button>
                  ) : (
                    <div className="text-xs font-semibold text-slate-300 dark:text-slate-600 flex items-center gap-2 select-none">
                      <ArrowLeft className="w-4 h-4" />
                      <span>Previous Topic</span>
                    </div>
                  )}
                </div>

                {/* Center: Mark as Completed */}
                <div className="flex items-center justify-center">
                  <button
                    id="learn-nav-mark-completed-btn"
                    onClick={handleToggleMarkCompleted}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95 ${
                      isCurrentCompleted
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20'
                    }`}
                  >
                    <Check className="w-4 h-4 stroke-[2.5]" />
                    <span>{isCurrentCompleted ? 'Completed' : 'Mark as Completed'}</span>
                  </button>
                </div>

                {/* Right: Next Topic & Topic Counter */}
                <div className="flex items-center justify-between sm:justify-end gap-4">
                  {activeLessonIndex === 3 ? (
                    <button
                      id="learn-nav-next-btn"
                      onClick={() => handleToggleTerminologyRecap()}
                      className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors cursor-pointer"
                    >
                      <span>Terminology Recap</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : activeLessonIndex < LESSONS.length - 1 ? (
                    <button
                      id="learn-nav-next-btn"
                      onClick={() => switchLesson(activeLessonIndex + 1)}
                      className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors cursor-pointer"
                    >
                      <span>Next Topic</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      id="learn-nav-finish-btn"
                      onClick={onGoToGame}
                      className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors cursor-pointer"
                    >
                      <span>Finish Syllabus</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}

                  <div className="text-xs font-mono text-slate-400 dark:text-slate-500 text-right">
                    Topic {formattedChapNumber} of {String(LESSONS.length).padStart(2, '0')}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
