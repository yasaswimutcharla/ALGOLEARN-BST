import React from 'react';
import {
  Crown,
  UserCheck,
  Users,
  Leaf,
  Layers,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Info,
  Check,
} from 'lucide-react';
import { LESSONS } from '../../data/lessonsData';
import { LessonModule } from '../../types';
import { soundManager } from '../../utils/audio';
import { getKeyRulesForLesson } from '../../data/keyRulesData';

interface TerminologyRecapSectionProps {
  onGoToChapter: (chapterNumber: number) => void;
  onNextTopic: () => void;
  onPrevTopic: () => void;
  isCompleted: boolean;
  onToggleComplete: () => void;
}

interface TermItemConfig {
  id: string;
  number: number;
  heading: string;
  icon: React.ElementType;
}

const TERMINOLOGY_CONFIG: TermItemConfig[] = [
  { id: 'lesson-5', number: 1, heading: 'Root Node', icon: Crown },
  { id: 'lesson-6', number: 2, heading: 'Parent Node', icon: UserCheck },
  { id: 'lesson-7', number: 3, heading: 'Child Node', icon: Users },
  { id: 'lesson-8', number: 4, heading: 'Leaf Node', icon: Leaf },
  { id: 'lesson-9', number: 5, heading: 'Internal Node', icon: Layers },
  { id: 'lesson-10', number: 6, heading: 'Left Subtree', icon: ArrowLeft },
  { id: 'lesson-11', number: 7, heading: 'Right Subtree', icon: ArrowRight },
];

/**
 * Reusable clean SVG tree diagram for each terminology item
 */
const TermTreeDiagram: React.FC<{ termNumber: number; lesson: LessonModule }> = ({
  termNumber,
}) => {
  return (
    <div className="w-full flex flex-col items-center select-none py-1">
      <svg
        viewBox="0 0 340 185"
        className="w-full max-w-[340px] h-auto drop-shadow-2xs"
        aria-hidden="true"
      >
        {/* ================================================================= */}
        {/* TERM 1: ROOT NODE (50 at top, 30 left, 70 right)                   */}
        {/* ================================================================= */}
        {termNumber === 1 && (
          <g>
            {/* Edges */}
            <line x1="170" y1="45" x2="105" y2="120" stroke="currentColor" className="text-slate-300 dark:text-slate-700" strokeWidth="2.5" />
            <line x1="170" y1="45" x2="235" y2="120" stroke="currentColor" className="text-slate-300 dark:text-slate-700" strokeWidth="2.5" />

            {/* Root highlight aura */}
            <circle cx="170" cy="45" r="26" className="fill-indigo-500/15 animate-pulse" />

            {/* Root Node (50) */}
            <circle cx="170" cy="45" r="19" className="fill-indigo-600 stroke-indigo-400 dark:stroke-indigo-300" strokeWidth="2.5" />
            <text x="170" y="50" textAnchor="middle" className="fill-white font-mono font-bold text-xs">50</text>

            {/* Root Node Callout Tag */}
            <rect x="110" y="6" width="120" height="20" rx="10" className="fill-indigo-100 dark:fill-indigo-950 stroke-indigo-300 dark:stroke-indigo-700" strokeWidth="1" />
            <text x="170" y="19" textAnchor="middle" className="fill-indigo-700 dark:fill-indigo-300 font-mono font-bold text-[10px]">
              👑 ROOT (No Parent)
            </text>

            {/* Child Node 30 */}
            <circle cx="105" cy="120" r="18" className="fill-white dark:fill-slate-800 stroke-slate-300 dark:stroke-slate-600" strokeWidth="2" />
            <text x="105" y="125" textAnchor="middle" className="fill-slate-800 dark:fill-slate-200 font-mono font-bold text-xs">30</text>
            <text x="105" y="152" textAnchor="middle" className="fill-slate-500 dark:fill-slate-400 font-mono text-[10px]">Child (&lt; 50)</text>

            {/* Child Node 70 */}
            <circle cx="235" cy="120" r="18" className="fill-white dark:fill-slate-800 stroke-slate-300 dark:stroke-slate-600" strokeWidth="2" />
            <text x="235" y="125" textAnchor="middle" className="fill-slate-800 dark:fill-slate-200 font-mono font-bold text-xs">70</text>
            <text x="235" y="152" textAnchor="middle" className="fill-slate-500 dark:fill-slate-400 font-mono text-[10px]">Child (&gt; 50)</text>
          </g>
        )}

        {/* ================================================================= */}
        {/* TERM 2: PARENT NODE (50 parent of 30,70; 30 parent of 20,40)      */}
        {/* ================================================================= */}
        {termNumber === 2 && (
          <g>
            {/* Edges */}
            <line x1="170" y1="35" x2="105" y2="90" stroke="currentColor" className="text-slate-300 dark:text-slate-700" strokeWidth="2" />
            <line x1="170" y1="35" x2="235" y2="90" stroke="currentColor" className="text-slate-300 dark:text-slate-700" strokeWidth="2" />
            <line x1="105" y1="90" x2="70" y2="145" stroke="currentColor" className="text-indigo-400 dark:text-indigo-500" strokeWidth="2.5" />
            <line x1="105" y1="90" x2="140" y2="145" stroke="currentColor" className="text-indigo-400 dark:text-indigo-500" strokeWidth="2.5" />

            {/* Node 50 */}
            <circle cx="170" cy="35" r="17" className="fill-white dark:fill-slate-800 stroke-slate-300 dark:stroke-slate-600" strokeWidth="2" />
            <text x="170" y="39" textAnchor="middle" className="fill-slate-700 dark:fill-slate-300 font-mono font-bold text-xs">50</text>
            <text x="170" y="14" textAnchor="middle" className="fill-slate-500 dark:fill-slate-400 font-mono text-[9px]">Parent of 30 &amp; 70</text>

            {/* Parent Node 30 Highlight */}
            <circle cx="105" cy="90" r="23" className="fill-indigo-500/15" />
            <circle cx="105" cy="90" r="18" className="fill-indigo-600 stroke-indigo-400" strokeWidth="2.5" />
            <text x="105" y="94" textAnchor="middle" className="fill-white font-mono font-bold text-xs">30</text>

            <rect x="18" y="80" width="60" height="18" rx="6" className="fill-indigo-100 dark:fill-indigo-950 stroke-indigo-300 dark:stroke-indigo-700" strokeWidth="1" />
            <text x="48" y="92" textAnchor="middle" className="fill-indigo-700 dark:fill-indigo-300 font-mono font-bold text-[9px]">PARENT</text>

            {/* Node 70 */}
            <circle cx="235" cy="90" r="17" className="fill-white dark:fill-slate-800 stroke-slate-300 dark:stroke-slate-600" strokeWidth="2" />
            <text x="235" y="94" textAnchor="middle" className="fill-slate-700 dark:fill-slate-300 font-mono font-bold text-xs">70</text>

            {/* Children 20 and 40 */}
            <circle cx="70" cy="145" r="16" className="fill-indigo-50 dark:fill-indigo-950/70 stroke-indigo-400" strokeWidth="2" />
            <text x="70" y="149" textAnchor="middle" className="fill-indigo-700 dark:fill-indigo-300 font-mono font-bold text-xs">20</text>
            <text x="70" y="172" textAnchor="middle" className="fill-indigo-600 dark:fill-indigo-400 font-mono text-[9px]">Child</text>

            <circle cx="140" cy="145" r="16" className="fill-indigo-50 dark:fill-indigo-950/70 stroke-indigo-400" strokeWidth="2" />
            <text x="140" y="149" textAnchor="middle" className="fill-indigo-700 dark:fill-indigo-300 font-mono font-bold text-xs">40</text>
            <text x="140" y="172" textAnchor="middle" className="fill-indigo-600 dark:fill-indigo-400 font-mono text-[9px]">Child</text>
          </g>
        )}

        {/* ================================================================= */}
        {/* TERM 3: CHILD NODE (50 parent; 30 left child, 70 right child)      */}
        {/* ================================================================= */}
        {termNumber === 3 && (
          <g>
            {/* Edges */}
            <line x1="170" y1="40" x2="105" y2="115" stroke="currentColor" className="text-indigo-400 dark:text-indigo-500" strokeWidth="2.5" />
            <line x1="170" y1="40" x2="235" y2="115" stroke="currentColor" className="text-indigo-400 dark:text-indigo-500" strokeWidth="2.5" />

            {/* Parent 50 */}
            <circle cx="170" cy="40" r="18" className="fill-white dark:fill-slate-800 stroke-slate-300 dark:stroke-slate-600" strokeWidth="2" />
            <text x="170" y="44" textAnchor="middle" className="fill-slate-800 dark:fill-slate-200 font-mono font-bold text-xs">50</text>
            <text x="170" y="16" textAnchor="middle" className="fill-slate-500 dark:fill-slate-400 font-mono font-bold text-[10px]">PARENT</text>

            {/* Left Child 30 */}
            <circle cx="105" cy="115" r="23" className="fill-indigo-500/15" />
            <circle cx="105" cy="115" r="18" className="fill-indigo-600 stroke-indigo-400" strokeWidth="2.5" />
            <text x="105" y="119" textAnchor="middle" className="fill-white font-mono font-bold text-xs">30</text>

            <rect x="50" y="145" width="110" height="20" rx="10" className="fill-indigo-100 dark:fill-indigo-950 stroke-indigo-300 dark:stroke-indigo-700" strokeWidth="1" />
            <text x="105" y="158" textAnchor="middle" className="fill-indigo-700 dark:fill-indigo-300 font-mono font-bold text-[9px]">LEFT CHILD (&lt; 50)</text>

            {/* Right Child 70 */}
            <circle cx="235" cy="115" r="23" className="fill-indigo-500/15" />
            <circle cx="235" cy="115" r="18" className="fill-indigo-600 stroke-indigo-400" strokeWidth="2.5" />
            <text x="235" y="119" textAnchor="middle" className="fill-white font-mono font-bold text-xs">70</text>

            <rect x="180" y="145" width="110" height="20" rx="10" className="fill-indigo-100 dark:fill-indigo-950 stroke-indigo-300 dark:stroke-indigo-700" strokeWidth="1" />
            <text x="235" y="158" textAnchor="middle" className="fill-indigo-700 dark:fill-indigo-300 font-mono font-bold text-[9px]">RIGHT CHILD (&gt; 50)</text>
          </g>
        )}

        {/* ================================================================= */}
        {/* TERM 4: LEAF NODE (40 parent; 20 and 60 leaf nodes with 0 child)   */}
        {/* ================================================================= */}
        {termNumber === 4 && (
          <g>
            {/* Edges */}
            <line x1="170" y1="40" x2="105" y2="115" stroke="currentColor" className="text-emerald-400 dark:text-emerald-600" strokeWidth="2" />
            <line x1="170" y1="40" x2="235" y2="115" stroke="currentColor" className="text-emerald-400 dark:text-emerald-600" strokeWidth="2" />

            {/* Node 40 */}
            <circle cx="170" cy="40" r="18" className="fill-white dark:fill-slate-800 stroke-slate-300 dark:stroke-slate-600" strokeWidth="2" />
            <text x="170" y="44" textAnchor="middle" className="fill-slate-800 dark:fill-slate-200 font-mono font-bold text-xs">40</text>
            <text x="170" y="16" textAnchor="middle" className="fill-slate-500 dark:fill-slate-400 font-mono text-[9px]">Internal Node</text>

            {/* Leaf Node 20 */}
            <circle cx="105" cy="115" r="23" className="fill-emerald-500/15" />
            <circle cx="105" cy="115" r="18" className="fill-emerald-600 stroke-emerald-400" strokeWidth="2.5" />
            <text x="105" y="119" textAnchor="middle" className="fill-white font-mono font-bold text-xs">20</text>

            <rect x="55" y="145" width="100" height="20" rx="10" className="fill-emerald-100 dark:fill-emerald-950 stroke-emerald-300 dark:stroke-emerald-700" strokeWidth="1" />
            <text x="105" y="158" textAnchor="middle" className="fill-emerald-700 dark:fill-emerald-300 font-mono font-bold text-[9px]">🍃 LEAF (0 Children)</text>

            {/* Leaf Node 60 */}
            <circle cx="235" cy="115" r="23" className="fill-emerald-500/15" />
            <circle cx="235" cy="115" r="18" className="fill-emerald-600 stroke-emerald-400" strokeWidth="2.5" />
            <text x="235" y="119" textAnchor="middle" className="fill-white font-mono font-bold text-xs">60</text>

            <rect x="185" y="145" width="100" height="20" rx="10" className="fill-emerald-100 dark:fill-emerald-950 stroke-emerald-300 dark:stroke-emerald-700" strokeWidth="1" />
            <text x="235" y="158" textAnchor="middle" className="fill-emerald-700 dark:fill-emerald-300 font-mono font-bold text-[9px]">🍃 LEAF (0 Children)</text>
          </g>
        )}

        {/* ================================================================= */}
        {/* TERM 5: INTERNAL NODE (>= 1 child: 50 & 30 internal, 20 & 70 leaf) */}
        {/* ================================================================= */}
        {termNumber === 5 && (
          <g>
            {/* Edges */}
            <line x1="170" y1="35" x2="105" y2="90" stroke="currentColor" className="text-blue-400 dark:text-blue-600" strokeWidth="2.5" />
            <line x1="170" y1="35" x2="235" y2="90" stroke="currentColor" className="text-blue-400 dark:text-blue-600" strokeWidth="2.5" />
            <line x1="105" y1="90" x2="70" y2="145" stroke="currentColor" className="text-slate-300 dark:text-slate-700" strokeWidth="2" />

            {/* Internal Node 50 */}
            <circle cx="170" cy="35" r="23" className="fill-blue-500/15" />
            <circle cx="170" cy="35" r="18" className="fill-blue-600 stroke-blue-400" strokeWidth="2.5" />
            <text x="170" y="39" textAnchor="middle" className="fill-white font-mono font-bold text-xs">50</text>

            <rect x="110" y="6" width="120" height="18" rx="9" className="fill-blue-100 dark:fill-blue-950 stroke-blue-300 dark:stroke-blue-700" strokeWidth="1" />
            <text x="170" y="18" textAnchor="middle" className="fill-blue-700 dark:fill-blue-300 font-mono font-bold text-[9px]">INTERNAL (has 2)</text>

            {/* Internal Node 30 */}
            <circle cx="105" cy="90" r="22" className="fill-blue-500/15" />
            <circle cx="105" cy="90" r="17" className="fill-blue-600 stroke-blue-400" strokeWidth="2.5" />
            <text x="105" y="94" textAnchor="middle" className="fill-white font-mono font-bold text-xs">30</text>

            <rect x="25" y="81" width="58" height="18" rx="6" className="fill-blue-100 dark:fill-blue-950 stroke-blue-300 dark:stroke-blue-700" strokeWidth="1" />
            <text x="54" y="93" textAnchor="middle" className="fill-blue-700 dark:fill-blue-300 font-mono font-bold text-[8px]">INTERNAL</text>

            {/* Leaf Node 70 */}
            <circle cx="235" cy="90" r="17" className="fill-white dark:fill-slate-800 stroke-slate-300 dark:stroke-slate-600" strokeWidth="2" />
            <text x="235" y="94" textAnchor="middle" className="fill-slate-700 dark:fill-slate-300 font-mono font-bold text-xs">70</text>
            <text x="235" y="120" textAnchor="middle" className="fill-slate-500 dark:fill-slate-400 font-mono text-[9px]">Leaf (0 children)</text>

            {/* Leaf Node 20 */}
            <circle cx="70" cy="145" r="16" className="fill-white dark:fill-slate-800 stroke-slate-300 dark:stroke-slate-600" strokeWidth="2" />
            <text x="70" y="149" textAnchor="middle" className="fill-slate-700 dark:fill-slate-300 font-mono font-bold text-xs">20</text>
            <text x="70" y="172" textAnchor="middle" className="fill-slate-500 dark:fill-slate-400 font-mono text-[9px]">Leaf (0 children)</text>
          </g>
        )}

        {/* ================================================================= */}
        {/* TERM 6: LEFT SUBTREE ({30, 20, 40} bounded and highlighted < 50)   */}
        {/* ================================================================= */}
        {termNumber === 6 && (
          <g>
            {/* Shaded Box grouping entire Left Subtree */}
            <rect
              x="45"
              y="65"
              width="125"
              height="105"
              rx="16"
              className="fill-indigo-500/10 stroke-indigo-500/40"
              strokeWidth="1.5"
              strokeDasharray="4 3"
            />

            {/* Edges */}
            <line x1="170" y1="35" x2="105" y2="90" stroke="currentColor" className="text-indigo-400 dark:text-indigo-500" strokeWidth="2.5" />
            <line x1="170" y1="35" x2="235" y2="90" stroke="currentColor" className="text-slate-300 dark:text-slate-700" strokeWidth="2" />
            <line x1="105" y1="90" x2="70" y2="140" stroke="currentColor" className="text-indigo-400 dark:text-indigo-500" strokeWidth="2.5" />
            <line x1="105" y1="90" x2="140" y2="140" stroke="currentColor" className="text-indigo-400 dark:text-indigo-500" strokeWidth="2.5" />

            {/* Root 50 */}
            <circle cx="170" cy="35" r="17" className="fill-white dark:fill-slate-800 stroke-slate-300 dark:stroke-slate-600" strokeWidth="2" />
            <text x="170" y="39" textAnchor="middle" className="fill-slate-800 dark:fill-slate-200 font-mono font-bold text-xs">50</text>
            <text x="170" y="14" textAnchor="middle" className="fill-slate-500 dark:fill-slate-400 font-mono text-[9px]">Root (50)</text>

            {/* Left Subtree Nodes */}
            <circle cx="105" cy="90" r="17" className="fill-indigo-600 stroke-indigo-300" strokeWidth="2" />
            <text x="105" y="94" textAnchor="middle" className="fill-white font-mono font-bold text-xs">30</text>

            <circle cx="70" cy="140" r="15" className="fill-indigo-500 stroke-indigo-300" strokeWidth="2" />
            <text x="70" y="144" textAnchor="middle" className="fill-white font-mono font-bold text-xs">20</text>

            <circle cx="140" cy="140" r="15" className="fill-indigo-500 stroke-indigo-300" strokeWidth="2" />
            <text x="140" y="144" textAnchor="middle" className="fill-white font-mono font-bold text-xs">40</text>

            {/* Right Node 70 */}
            <circle cx="235" cy="90" r="17" className="fill-white dark:fill-slate-800 stroke-slate-300 dark:stroke-slate-600" strokeWidth="2" />
            <text x="235" y="94" textAnchor="middle" className="fill-slate-700 dark:fill-slate-300 font-mono font-bold text-xs">70</text>

            {/* Group Label */}
            <rect x="48" y="165" width="118" height="18" rx="6" className="fill-indigo-100 dark:fill-indigo-950 stroke-indigo-300 dark:stroke-indigo-700" strokeWidth="1" />
            <text x="107" y="177" textAnchor="middle" className="fill-indigo-700 dark:fill-indigo-300 font-mono font-bold text-[8.5px]">
              LEFT SUBTREE (&lt; 50)
            </text>
          </g>
        )}

        {/* ================================================================= */}
        {/* TERM 7: RIGHT SUBTREE ({70, 60, 80} bounded and highlighted > 50)  */}
        {/* ================================================================= */}
        {termNumber === 7 && (
          <g>
            {/* Shaded Box grouping entire Right Subtree */}
            <rect
              x="170"
              y="65"
              width="125"
              height="105"
              rx="16"
              className="fill-indigo-500/10 stroke-indigo-500/40"
              strokeWidth="1.5"
              strokeDasharray="4 3"
            />

            {/* Edges */}
            <line x1="170" y1="35" x2="105" y2="90" stroke="currentColor" className="text-slate-300 dark:text-slate-700" strokeWidth="2" />
            <line x1="170" y1="35" x2="235" y2="90" stroke="currentColor" className="text-indigo-400 dark:text-indigo-500" strokeWidth="2.5" />
            <line x1="235" y1="90" x2="200" y2="140" stroke="currentColor" className="text-indigo-400 dark:text-indigo-500" strokeWidth="2.5" />
            <line x1="235" y1="90" x2="270" y2="140" stroke="currentColor" className="text-indigo-400 dark:text-indigo-500" strokeWidth="2.5" />

            {/* Root 50 */}
            <circle cx="170" cy="35" r="17" className="fill-white dark:fill-slate-800 stroke-slate-300 dark:stroke-slate-600" strokeWidth="2" />
            <text x="170" y="39" textAnchor="middle" className="fill-slate-800 dark:fill-slate-200 font-mono font-bold text-xs">50</text>
            <text x="170" y="14" textAnchor="middle" className="fill-slate-500 dark:fill-slate-400 font-mono text-[9px]">Root (50)</text>

            {/* Left Node 30 */}
            <circle cx="105" cy="90" r="17" className="fill-white dark:fill-slate-800 stroke-slate-300 dark:stroke-slate-600" strokeWidth="2" />
            <text x="105" y="94" textAnchor="middle" className="fill-slate-700 dark:fill-slate-300 font-mono font-bold text-xs">30</text>

            {/* Right Subtree Nodes */}
            <circle cx="235" cy="90" r="17" className="fill-indigo-600 stroke-indigo-300" strokeWidth="2" />
            <text x="235" y="94" textAnchor="middle" className="fill-white font-mono font-bold text-xs">70</text>

            <circle cx="200" cy="140" r="15" className="fill-indigo-500 stroke-indigo-300" strokeWidth="2" />
            <text x="200" y="144" textAnchor="middle" className="fill-white font-mono font-bold text-xs">60</text>

            <circle cx="270" cy="140" r="15" className="fill-indigo-500 stroke-indigo-300" strokeWidth="2" />
            <text x="270" y="144" textAnchor="middle" className="fill-white font-mono font-bold text-xs">80</text>

            {/* Group Label */}
            <rect x="173" y="165" width="118" height="18" rx="6" className="fill-indigo-100 dark:fill-indigo-950 stroke-indigo-300 dark:stroke-indigo-700" strokeWidth="1" />
            <text x="232" y="177" textAnchor="middle" className="fill-indigo-700 dark:fill-indigo-300 font-mono font-bold text-[8.5px]">
              RIGHT SUBTREE (&gt; 50)
            </text>
          </g>
        )}
      </svg>
    </div>
  );
};

export const TerminologyRecapSection: React.FC<TerminologyRecapSectionProps> = ({
  onGoToChapter,
  onNextTopic,
  onPrevTopic,
  isCompleted,
  onToggleComplete,
}) => {
  // Directly retrieve and reuse the 7 lesson objects from LESSONS to avoid duplicating content
  const terminologyItems = TERMINOLOGY_CONFIG.map((cfg) => {
    const lesson = LESSONS.find((l) => l.id === cfg.id);
    if (!lesson) {
      throw new Error(`Lesson module ${cfg.id} not found in LESSONS`);
    }
    return {
      ...cfg,
      lesson,
    };
  });

  const scrollToTerm = (termId: string) => {
    soundManager.playClick();
    const el = document.getElementById(`term-section-${termId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div
      id="learn-terminology-recap-container"
      className="space-y-6"
    >
      {/* Main Container Card matching LearnPage styling */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 lg:p-9 shadow-xs space-y-8 transition-colors">
        {/* Section Header */}
        <div className="space-y-3 pb-6 border-b border-slate-100 dark:border-slate-800">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            Terminology Recap
          </h1>

          <p className="text-xs sm:text-sm text-indigo-600 dark:text-indigo-400 font-medium">
            A comprehensive, beginner-friendly review of the 7 foundational Binary Search Tree terms and components.
          </p>

          {/* Quick-Jump Term Navigation Pills */}
          <div className="pt-2 flex flex-wrap items-center gap-2">
            {terminologyItems.map((item) => (
              <button
                key={item.id}
                id={`pill-jump-${item.id}`}
                onClick={() => scrollToTerm(item.id)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-950/60 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-300 text-xs font-mono font-semibold border border-slate-200/80 dark:border-slate-700/80 transition-colors cursor-pointer"
              >
                {item.number}. {item.heading}
              </button>
            ))}
          </div>
        </div>

        {/* 7 Dedicated Standalone Sections (Kept strictly separate, never merged) */}
        <div className="space-y-8">
          {terminologyItems.map((item) => {
            const { lesson, heading, number, icon: IconComponent } = item;

            return (
              <section
                key={item.id}
                id={`term-section-${item.id}`}
                className="p-5 sm:p-7 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-6 scroll-mt-24 transition-colors"
              >
                {/* 1. The Term as the Heading */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-900/50 flex-shrink-0">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                        TOPIC {String(number).padStart(2, '0')} // TERMINOLOGY
                      </div>
                      <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                        {number}. {heading}
                      </h2>
                    </div>
                  </div>

                  {/* Direct link to deep-dive chapter */}
                  <button
                    onClick={() => onGoToChapter(lesson.number)}
                    className="self-start sm:self-auto text-xs font-mono text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <span>View Chapter {String(lesson.number).padStart(2, '0')}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* 2. Beginner-Friendly Explanation */}
                <div className="space-y-3">
                  {/* Definition / Explanation Card */}
                  <div className="p-4 sm:p-5 bg-slate-50/70 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/80 space-y-1.5">
                    <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span>BEGINNER-FRIENDLY EXPLANATION</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                      {lesson.definition}
                    </p>
                  </div>

                  {/* Key Mental Model / Takeaway */}
                  <div className="p-4 rounded-xl bg-slate-50/50 dark:bg-slate-800/40 border-l-4 border-indigo-600 dark:border-indigo-500 border-t border-r border-b border-slate-200/80 dark:border-slate-700/80 space-y-1">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      KEY MENTAL MODEL
                    </span>
                    <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white leading-relaxed">
                      {lesson.keyConcept}
                    </p>
                  </div>

                  {/* Key Rules */}
                  <div className="space-y-2 pt-1">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      KEY RULES
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {getKeyRulesForLesson(lesson.id).map((rule, ptIdx) => (
                        <div
                          key={ptIdx}
                          className="p-3 bg-slate-50/60 dark:bg-slate-800/30 rounded-lg border border-slate-200/70 dark:border-slate-700/70 flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                          <span>{rule}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 3. Simple Tree-Related Example */}
                <div className="p-5 sm:p-6 bg-slate-50/70 dark:bg-slate-850/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800 pb-2.5">
                    <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-mono font-bold text-xs uppercase tracking-wider">
                      <Sparkles className="w-4 h-4" />
                      <span>TREE-RELATED EXAMPLE</span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                      Structure &amp; Values
                    </span>
                  </div>

                  {/* Clean Visual SVG Diagram of the tree example */}
                  <TermTreeDiagram termNumber={number} lesson={lesson} />

                  {/* Caption & Explanation */}
                  <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-start gap-2.5 shadow-2xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                      {lesson.visualExample.caption}
                    </p>
                  </div>

                  {/* Step-by-Step Walkthrough from existing howItWorksSteps */}
                  {lesson.howItWorksSteps && lesson.howItWorksSteps.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        HOW IT WORKS:
                      </span>
                      <div className="space-y-1">
                        {lesson.howItWorksSteps.map((step, sIdx) => (
                          <div
                            key={sIdx}
                            className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2 font-mono"
                          >
                            <span className="text-indigo-600 dark:text-indigo-400 font-bold">›</span>
                            <span>{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </section>
            );
          })}
        </div>

        {/* Bottom Navigation Controls */}
        <div
          id="learn-terminology-bottom-navigation"
          className="grid grid-cols-1 sm:grid-cols-3 items-center gap-4 pt-6 border-t border-slate-100 dark:border-slate-800"
        >
          {/* Left: Previous Topic (Chapter 11 Right Subtree) */}
          <div className="flex items-center justify-start">
            <button
              id="recap-nav-prev-btn"
              onClick={onPrevTopic}
              className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Chapter 04</span>
            </button>
          </div>

          {/* Center: Mark as Completed */}
          <div className="flex items-center justify-center">
            <button
              id="recap-nav-mark-completed-btn"
              onClick={onToggleComplete}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>{isCompleted ? 'Recap Completed' : 'Mark Recap Completed'}</span>
            </button>
          </div>

          {/* Right: Next Topic (Chapter 12 Searching in a BST) */}
          <div className="flex items-center justify-between sm:justify-end gap-4">
            <button
              id="recap-nav-next-btn"
              onClick={onNextTopic}
              className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors cursor-pointer"
            >
              <span>Next: Chapter 12</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
