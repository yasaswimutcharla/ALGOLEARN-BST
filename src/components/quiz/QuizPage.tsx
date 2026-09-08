import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Trophy,
  Award,
  Check,
  Eye,
} from 'lucide-react';
import { QUIZ_QUESTIONS } from '../../data/quizData';
import { TreeCanvas } from '../common/TreeCanvas';
import { buildTreeFromValues } from '../../utils/bst';
import { useUserProgress } from '../../context/UserProgressContext';
import { soundManager } from '../../utils/audio';

interface QuizPageProps {
  onGoToGame?: () => void;
  onSelectTopic?: (topicIndex: number) => void;
}

const QUIZ_SESSION_STORAGE_KEY = 'bst_quiz_session_state';

interface QuizSavedSession {
  currentIndex: number;
  selectedAnswers: (number | null)[];
  confirmedAnswers: (number | null)[];
  isQuizCompleted: boolean;
}

const getInitialQuizState = (): QuizSavedSession => {
  try {
    const raw = sessionStorage.getItem(QUIZ_SESSION_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as QuizSavedSession;
      if (
        typeof parsed.currentIndex === 'number' &&
        parsed.currentIndex >= 0 &&
        parsed.currentIndex < QUIZ_QUESTIONS.length &&
        Array.isArray(parsed.selectedAnswers) &&
        parsed.selectedAnswers.length === QUIZ_QUESTIONS.length &&
        Array.isArray(parsed.confirmedAnswers) &&
        parsed.confirmedAnswers.length === QUIZ_QUESTIONS.length &&
        typeof parsed.isQuizCompleted === 'boolean'
      ) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load quiz session state', e);
  }

  return {
    currentIndex: 0,
    selectedAnswers: new Array(QUIZ_QUESTIONS.length).fill(null),
    confirmedAnswers: new Array(QUIZ_QUESTIONS.length).fill(null),
    isQuizCompleted: false,
  };
};

export const QuizPage: React.FC<QuizPageProps> = ({ onGoToGame, onSelectTopic }) => {
  const { recordQuizScore, addXP, unlockBadge, updateQuizProgress } = useUserProgress();

  const [savedInitial] = useState<QuizSavedSession>(() => getInitialQuizState());

  const [currentIndex, setCurrentIndex] = useState<number>(savedInitial.currentIndex);
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>(
    savedInitial.selectedAnswers
  );
  const [confirmedAnswers, setConfirmedAnswers] = useState<(number | null)[]>(
    savedInitial.confirmedAnswers
  );
  const [isQuizCompleted, setIsQuizCompleted] = useState<boolean>(
    savedInitial.isQuizCompleted
  );

  // Synchronize state with sessionStorage and global context whenever it changes
  useEffect(() => {
    try {
      const stateToSave: QuizSavedSession = {
        currentIndex,
        selectedAnswers,
        confirmedAnswers,
        isQuizCompleted,
      };
      sessionStorage.setItem(QUIZ_SESSION_STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (e) {
      console.error('Failed to save quiz state to sessionStorage', e);
    }
    updateQuizProgress(confirmedAnswers);
  }, [currentIndex, selectedAnswers, confirmedAnswers, isQuizCompleted, updateQuizProgress]);

  // Handle global reset to start from zero
  useEffect(() => {
    const handleGlobalReset = () => {
      setCurrentIndex(0);
      setSelectedAnswers(new Array(QUIZ_QUESTIONS.length).fill(null));
      setConfirmedAnswers(new Array(QUIZ_QUESTIONS.length).fill(null));
      setIsQuizCompleted(false);
      try {
        sessionStorage.removeItem(QUIZ_SESSION_STORAGE_KEY);
      } catch {}
      updateQuizProgress(new Array(QUIZ_QUESTIONS.length).fill(null));
    };

    window.addEventListener('bst-reset-progress', handleGlobalReset);
    window.addEventListener('bst-reset-current-activity', handleGlobalReset);
    return () => {
      window.removeEventListener('bst-reset-progress', handleGlobalReset);
      window.removeEventListener('bst-reset-current-activity', handleGlobalReset);
    };
  }, [updateQuizProgress]);

  const currentQ = QUIZ_QUESTIONS[currentIndex];
  const currentSelected = selectedAnswers[currentIndex];
  const isCurrentConfirmed = confirmedAnswers[currentIndex] !== null;
  const isCurrentCorrect = isCurrentConfirmed && confirmedAnswers[currentIndex] === currentQ.correctIndex;

  // Number of confirmed/answered questions
  const answeredCount = confirmedAnswers.filter((ans) => ans !== null).length;
  const isAllAnswered = answeredCount === QUIZ_QUESTIONS.length;

  const handleSelectOption = (optionIdx: number) => {
    if (isCurrentConfirmed) return;
    soundManager.playClick();
    const updated = [...selectedAnswers];
    updated[currentIndex] = optionIdx;
    setSelectedAnswers(updated);
  };

  const handleConfirmAnswer = () => {
    if (currentSelected === null || isCurrentConfirmed) return;

    const isCorrect = currentSelected === currentQ.correctIndex;
    if (isCorrect) {
      soundManager.playSuccess();
    } else {
      soundManager.playError();
    }

    const updatedConfirmed = [...confirmedAnswers];
    updatedConfirmed[currentIndex] = currentSelected;
    setConfirmedAnswers(updatedConfirmed);

    // If this was the last question being answered
    const newlyAnsweredCount = updatedConfirmed.filter((ans) => ans !== null).length;
    if (newlyAnsweredCount === QUIZ_QUESTIONS.length) {
      finalizeQuiz(updatedConfirmed);
    }
  };

  const finalizeQuiz = (finalConfirmed: (number | null)[]) => {
    let correctCount = 0;
    QUIZ_QUESTIONS.forEach((q, i) => {
      if (finalConfirmed[i] === q.correctIndex) {
        correctCount++;
      }
    });

    const percentage = Math.round((correctCount / QUIZ_QUESTIONS.length) * 100);
    recordQuizScore(percentage);

    const xpEarned = correctCount * 25;
    addXP(xpEarned, `BST Quiz: ${percentage}%`);

    if (percentage >= 80) {
      unlockBadge('quiz-ace');
    }
  };

  const handleNext = () => {
    soundManager.playClick();
    if (currentIndex < QUIZ_QUESTIONS.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else if (answeredCount === QUIZ_QUESTIONS.length) {
      setIsQuizCompleted(true);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      soundManager.playClick();
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleJumpToQuestion = (idx: number) => {
    soundManager.playClick();
    setCurrentIndex(idx);
    if (isQuizCompleted) {
      setIsQuizCompleted(false);
    }
  };

  const handleRestartQuiz = () => {
    soundManager.playClick();
    setCurrentIndex(0);
    setSelectedAnswers(new Array(QUIZ_QUESTIONS.length).fill(null));
    setConfirmedAnswers(new Array(QUIZ_QUESTIONS.length).fill(null));
    setIsQuizCompleted(false);
  };

  // Compute final statistics
  const totalCorrect = QUIZ_QUESTIONS.reduce((acc, q, i) => {
    return confirmedAnswers[i] === q.correctIndex ? acc + 1 : acc;
  }, 0);
  const totalIncorrect = answeredCount - totalCorrect;
  const scorePercentage = Math.round((totalCorrect / QUIZ_QUESTIONS.length) * 100);

  return (
    <div id="quiz-page-root" className="w-full max-w-4xl mx-auto space-y-6 pb-20 px-2 sm:px-4">
      {/* =======================================================
          1. QUIZ INTRODUCTION & QUESTION PROGRESS NAVIGATION
          ======================================================= */}
      <div className="bg-white dark:bg-[#0D1428] rounded-2xl border border-slate-200 dark:border-[#282054] p-5 sm:p-7 shadow-xs">
        {/* Top meta row */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-violet-50 dark:bg-purple-950/70 text-violet-700 dark:text-purple-300 border border-violet-200 dark:border-purple-800">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>KNOWLEDGE ASSESSMENT</span>
          </div>

          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 font-mono">
            BST Quiz (10 Questions)
          </div>
        </div>

        {/* Heading & Description */}
        <div className="mt-3.5">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Binary Search Tree Knowledge Check
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
            Test your understanding of Binary Search Trees, their properties, insertion, deletion, and traversal techniques.
          </p>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-200 dark:border-[#1E2640] my-5" />

        {/* Question Progress Navigation Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
            <span>
              Progress: <strong className="text-violet-600 dark:text-purple-400 font-mono text-sm">{answeredCount}</strong> / 10 Answered
            </span>
            {isAllAnswered && !isQuizCompleted && (
              <button
                onClick={() => setIsQuizCompleted(true)}
                className="text-xs font-bold text-violet-600 dark:text-purple-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View Final Summary</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Q1 to Q10 Progress Boxes */}
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {QUIZ_QUESTIONS.map((q, idx) => {
              const isActive = currentIndex === idx && !isQuizCompleted;
              const isAnswered = confirmedAnswers[idx] !== null;
              const isCorrect = isAnswered && confirmedAnswers[idx] === q.correctIndex;
              const isWrong = isAnswered && confirmedAnswers[idx] !== q.correctIndex;

              let btnClasses =
                'bg-slate-100 dark:bg-[#111A31] border border-slate-200 dark:border-[#282054] text-slate-700 dark:text-slate-300 hover:border-purple-300 dark:hover:border-purple-700';

              if (isAnswered) {
                if (isCorrect) {
                  // Confirmed Correct: GREEN box with check mark
                  btnClasses = isActive
                    ? 'bg-emerald-600 dark:bg-emerald-600 text-white font-bold border-emerald-500 dark:border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.45)] ring-2 ring-emerald-400/80'
                    : 'bg-emerald-600 dark:bg-emerald-600 text-white font-bold border-emerald-500 dark:border-emerald-500 shadow-2xs';
                } else if (isWrong) {
                  // Confirmed Wrong: RED box with X mark
                  btnClasses = isActive
                    ? 'bg-rose-600 dark:bg-rose-600 text-white font-bold border-rose-500 dark:border-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.45)] ring-2 ring-rose-400/80'
                    : 'bg-rose-600 dark:bg-rose-600 text-white font-bold border-rose-500 dark:border-rose-500 shadow-2xs';
                }
              } else if (isActive) {
                // Active/Current Unanswered: Purple highlight
                btnClasses =
                  'bg-violet-600 dark:bg-purple-600 text-white font-bold border-violet-500 dark:border-purple-500 shadow-[0_0_12px_rgba(124,60,255,0.45)] ring-2 ring-purple-500/30';
              }

              return (
                <button
                  key={idx}
                  id={`nav-q-${idx + 1}`}
                  onClick={() => handleJumpToQuestion(idx)}
                  className={`py-2 px-1 rounded-xl text-xs font-mono font-medium transition-all text-center relative flex items-center justify-center gap-1 cursor-pointer active:scale-95 ${btnClasses}`}
                >
                  <span>Q{idx + 1}</span>
                  {isAnswered && (
                    <span className="font-bold text-xs">
                      {isCorrect ? '✓' : '✕'}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* =======================================================
          2. QUESTION CARD OR RESULTS CARD
          ======================================================= */}
      {!isQuizCompleted ? (
        <div className="bg-white dark:bg-[#0D1428] rounded-2xl border border-slate-200 dark:border-[#282054] p-5 sm:p-7 shadow-xs space-y-6">
          {/* Card Header: Question Number, Topic Code, & Evaluation Badge */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#1E2640] pb-4">
            <div className="inline-flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-md text-xs font-bold bg-violet-50 dark:bg-purple-950/80 text-violet-700 dark:text-purple-300 border border-violet-200 dark:border-purple-800">
                Question {String(currentIndex + 1).padStart(2, '0')} of 10
              </span>
              <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                {currentQ.code || `CORE-${String(currentIndex + 1).padStart(2, '0')}`}
              </span>
            </div>

            {/* Evaluation Status Badge (Only shown after confirmation) */}
            <div>
              {isCurrentConfirmed ? (
                isCurrentCorrect ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-bold bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 shadow-2xs">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>✓ Correct</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-bold bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-700 text-rose-700 dark:text-rose-300 shadow-2xs">
                    <XCircle className="w-3.5 h-3.5" />
                    <span>✕ Incorrect</span>
                  </span>
                )
              ) : currentQ.topicTag ? (
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 hidden sm:inline-block">
                  {currentQ.topicTag}
                </span>
              ) : null}
            </div>
          </div>

          {/* Question Text */}
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
              {currentIndex + 1}. {currentQ.question}
            </h2>
          </div>

          {/* Visual Tree (if provided for this question) */}
          {currentQ.visualTreeValues && currentQ.visualTreeValues.length > 0 && (
            <div className="p-4 bg-slate-50 dark:bg-[#060817] rounded-xl border border-slate-200 dark:border-[#1E2640] text-center">
              <TreeCanvas
                root={buildTreeFromValues(currentQ.visualTreeValues)}
                width={420}
                className="max-w-xs sm:max-w-md mx-auto pointer-events-none"
              />
            </div>
          )}

          {/* Answer Options Grid */}
          <div className="space-y-3">
            {currentQ.options.map((opt, idx) => {
              const isSelected = currentSelected === idx;
              const isCorrectAnswer = idx === currentQ.correctIndex;

              let cardClasses =
                'bg-slate-50/50 dark:bg-[#111A31] border-slate-200 dark:border-[#1E2640] text-slate-800 dark:text-slate-200 hover:border-purple-400 dark:hover:border-purple-700 hover:bg-violet-50/30 dark:hover:bg-purple-950/20';
              let badgeClasses =
                'bg-slate-200/80 dark:bg-[#1A2649] text-slate-700 dark:text-slate-300 border-slate-300 dark:border-[#283768]';

              if (isCurrentConfirmed) {
                if (isCorrectAnswer) {
                  cardClasses =
                    'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 dark:border-emerald-600 text-emerald-950 dark:text-emerald-100 font-semibold shadow-xs';
                  badgeClasses =
                    'bg-emerald-600 text-white border-emerald-500';
                } else if (isSelected && !isCorrectAnswer) {
                  cardClasses =
                    'bg-rose-50 dark:bg-rose-950/40 border-rose-500 dark:border-rose-600 text-rose-950 dark:text-rose-100 font-semibold line-through opacity-80';
                  badgeClasses = 'bg-rose-600 text-white border-rose-500';
                } else {
                  cardClasses =
                    'bg-slate-50/30 dark:bg-[#0D1428] border-slate-200/60 dark:border-[#1E2640]/60 text-slate-400 dark:text-slate-500 opacity-50';
                  badgeClasses =
                    'bg-slate-100 dark:bg-[#111A31] text-slate-400 dark:text-slate-600 border-slate-200 dark:border-[#1E2640]';
                }
              } else if (isSelected) {
                cardClasses =
                  'bg-violet-50 dark:bg-purple-950/60 border-violet-600 dark:border-purple-500 text-violet-950 dark:text-white font-semibold ring-2 ring-purple-500/20 shadow-xs';
                badgeClasses =
                  'bg-violet-600 dark:bg-purple-600 text-white border-violet-500 dark:border-purple-500';
              }

              return (
                <button
                  key={idx}
                  id={`quiz-opt-${idx}`}
                  disabled={isCurrentConfirmed}
                  onClick={() => handleSelectOption(idx)}
                  className={`w-full p-4 rounded-xl border text-left text-xs sm:text-sm transition-all flex items-center justify-between gap-3 cursor-pointer ${cardClasses}`}
                >
                  <div className="flex items-center gap-3.5">
                    <span
                      className={`w-7 h-7 rounded-lg border flex items-center justify-center font-bold text-xs font-mono shrink-0 transition-colors ${badgeClasses}`}
                    >
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="leading-relaxed">{opt}</span>
                  </div>

                  {isCurrentConfirmed && isCorrectAnswer && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  )}
                  {isCurrentConfirmed && isSelected && !isCorrectAnswer && (
                    <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* =======================================================
              BOTTOM NAVIGATION: PREVIOUS & CONFIRM / NEXT
              ======================================================= */}
          <div className="border-t border-slate-200 dark:border-[#1E2640] pt-5 flex items-center justify-between gap-3">
            {/* Left: Previous Button */}
            <button
              id="quiz-prev-btn"
              disabled={currentIndex === 0}
              onClick={handlePrevious}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-[#282054] bg-white dark:bg-[#111A31] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#18223E] disabled:opacity-30 disabled:pointer-events-none font-medium text-xs sm:text-sm flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            {/* Right: Submit Answer / Next Button */}
            {!isCurrentConfirmed ? (
              <button
                id="quiz-submit-btn"
                disabled={currentSelected === null}
                onClick={handleConfirmAnswer}
                className={`px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer ${
                  currentSelected !== null
                    ? 'bg-violet-600 hover:bg-violet-500 dark:bg-purple-600 dark:hover:bg-purple-500 text-white shadow-[0_0_14px_rgba(124,60,255,0.45)] active:scale-95'
                    : 'bg-slate-200 dark:bg-[#1A2649] text-slate-400 dark:text-slate-500 cursor-not-allowed shadow-none'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>SUBMIT ANSWER</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                {currentIndex < QUIZ_QUESTIONS.length - 1 ? (
                  <button
                    id="quiz-next-btn"
                    onClick={handleNext}
                    className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 dark:bg-purple-600 dark:hover:bg-purple-500 text-white font-bold text-xs sm:text-sm shadow-[0_0_12px_rgba(124,60,255,0.35)] transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>NEXT QUESTION</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    id="quiz-finish-btn"
                    onClick={() => setIsQuizCompleted(true)}
                    className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 dark:bg-purple-600 dark:hover:bg-purple-500 text-white font-bold text-xs sm:text-sm shadow-[0_0_12px_rgba(124,60,255,0.35)] transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>VIEW RESULTS</span>
                    <Award className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* =======================================================
            3. FINAL RESULTS SCREEN CARD
            ======================================================= */
        <div className="bg-white dark:bg-[#0D1428] rounded-2xl border border-slate-200 dark:border-[#282054] p-6 sm:p-9 shadow-xs text-center space-y-7">
          {/* Trophy Header */}
          <div className="w-16 h-16 rounded-2xl bg-violet-50 dark:bg-purple-950/80 border border-violet-200 dark:border-purple-800 text-violet-600 dark:text-purple-400 flex items-center justify-center mx-auto shadow-xs">
            <Trophy className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Assessment Completed!
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              {scorePercentage >= 80
                ? 'Outstanding mastery of Binary Search Tree principles, operations, and algorithmic invariants!'
                : scorePercentage >= 60
                ? 'Good effort! Review the detailed question explanations to master all 10 BST topics.'
                : 'Keep practicing! Explore the step-by-step visualizations and try the quiz again.'}
            </p>
          </div>

          {/* Results Metric Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl mx-auto">
            <div className="p-4 bg-slate-50 dark:bg-[#111A31] rounded-xl border border-slate-200 dark:border-[#1E2640]">
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Final Score</div>
              <div className="text-2xl font-bold text-violet-600 dark:text-purple-400 font-mono mt-1">
                {scorePercentage}%
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-[#111A31] rounded-xl border border-slate-200 dark:border-[#1E2640]">
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Questions</div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono mt-1">
                {answeredCount} / 10
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-[#111A31] rounded-xl border border-slate-200 dark:border-[#1E2640]">
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Correct</div>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-1 flex items-center justify-center gap-1">
                <CheckCircle2 className="w-5 h-5" />
                <span>{totalCorrect}</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-[#111A31] rounded-xl border border-slate-200 dark:border-[#1E2640]">
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Incorrect</div>
              <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 font-mono mt-1 flex items-center justify-center gap-1">
                <XCircle className="w-5 h-5" />
                <span>{totalIncorrect}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-3 border-t border-slate-200 dark:border-[#1E2640]">
            <button
              onClick={handleRestartQuiz}
              className="px-5 py-2.5 bg-white dark:bg-[#111A31] hover:bg-slate-100 dark:hover:bg-[#18223E] text-slate-700 dark:text-slate-300 rounded-xl text-xs sm:text-sm font-semibold border border-slate-200 dark:border-[#282054] transition-colors flex items-center gap-2 cursor-pointer shadow-2xs"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retake Quiz</span>
            </button>

            <button
              onClick={() => {
                setIsQuizCompleted(false);
                setCurrentIndex(0);
              }}
              className="px-5 py-2.5 bg-slate-100 dark:bg-[#1A2649] hover:bg-slate-200 dark:hover:bg-[#22325E] text-slate-800 dark:text-slate-200 rounded-xl text-xs sm:text-sm font-semibold border border-slate-200 dark:border-[#283768] transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              <span>Review Answers</span>
            </button>

            {onGoToGame && (
              <button
                onClick={onGoToGame}
                className="px-6 py-2.5 bg-violet-600 hover:bg-violet-500 dark:bg-purple-600 dark:hover:bg-purple-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-[0_0_12px_rgba(124,60,255,0.35)] transition-all cursor-pointer flex items-center gap-2"
              >
                <Award className="w-4 h-4" />
                <span>Play Game Challenges</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
