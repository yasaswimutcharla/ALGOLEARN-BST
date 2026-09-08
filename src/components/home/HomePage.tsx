import React from 'react';
import {
  ArrowRight,
  Sparkles,
  Target,
  Zap,
  Star,
  Folder,
  Globe,
  Database,
  Search,
  PlusCircle,
  Trash2,
  GitBranch,
  Lightbulb,
  Binary,
  Layers,
  BookOpen,
  ArrowDownUp,
  CheckCircle2,
  Activity,
  Code2,
} from 'lucide-react';
import { NavTab } from '../common/Header';
import { useUserProgress } from '../../context/UserProgressContext';
import { soundManager } from '../../utils/audio';

// Custom Vector Rocket with Smoke Clouds Component
const RocketIllustration: React.FC<{ className?: string }> = ({ className = 'w-20 h-20' }) => (
  <div className={`relative flex items-center justify-center select-none ${className}`}>
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full drop-shadow-md overflow-visible"
    >
      {/* Smoke Clouds Base */}
      <g className="smoke-clouds" opacity="0.95">
        <circle cx="36" cy="94" r="14" fill="#E2E8F0" />
        <circle cx="36" cy="92" r="12" fill="#F8FAFC" />
        <circle cx="50" cy="98" r="16" fill="#CBD5E1" />
        <circle cx="50" cy="96" r="14" fill="#FFFFFF" />
        <circle cx="68" cy="96" r="13" fill="#E2E8F0" />
        <circle cx="68" cy="94" r="11" fill="#F8FAFC" />
        <circle cx="44" cy="84" r="10" fill="#E0E7FF" />
        <circle cx="58" cy="86" r="9" fill="#EEF2FF" />
      </g>

      {/* Flame Thrust */}
      <g className="flame-thrust" transform="rotate(45 52 74)">
        <path d="M48 68 C46 80, 52 92, 52 92 C52 92, 58 80, 56 68 Z" fill="#F59E0B" />
        <path d="M49 70 C48 78, 52 86, 52 86 C52 86, 56 78, 55 70 Z" fill="#EF4444" />
        <path d="M50 72 C50 76, 52 81, 52 81 C52 81, 54 76, 54 72 Z" fill="#FDE047" />
      </g>

      {/* Tilted Rocket Body */}
      <g transform="rotate(45 60 55)">
        {/* Left Fin */}
        <path d="M46 64 L34 76 C34 76 38 62 46 54 Z" fill="#6366F1" />
        <path d="M46 64 L36 74 C36 74 39 63 46 56 Z" fill="#4F46E5" />

        {/* Right Fin */}
        <path d="M74 64 L86 76 C86 76 82 62 74 54 Z" fill="#6366F1" />
        <path d="M74 64 L84 74 C84 74 81 63 74 56 Z" fill="#4338CA" />

        {/* Center / Bottom Booster Nozzle */}
        <path d="M54 70 L66 70 L64 76 L56 76 Z" fill="#334155" />

        {/* Rocket Fuselage */}
        <path d="M60 20 C50 34, 46 54, 48 70 L72 70 C74 54, 70 34, 60 20 Z" fill="#FFFFFF" />

        {/* Nose Cone Accent */}
        <path d="M60 20 C56 26, 53 32, 51 38 L69 38 C67 32, 64 26, 60 20 Z" fill="#4F46E5" />

        {/* Fuselage Side Shadow */}
        <path d="M60 20 C64 26, 67 32, 69 38 L69 38 C72 50, 72 62, 72 70 L60 70 Z" fill="#EEF2FF" opacity="0.6" />

        {/* Cockpit Window Porthole */}
        <circle cx="60" cy="48" r="7" fill="#6366F1" />
        <circle cx="60" cy="48" r="5.5" fill="#38BDF8" />
        <circle cx="58" cy="46" r="2" fill="#FFFFFF" opacity="0.85" />

        {/* Center Stripe */}
        <path d="M59 58 L61 58 L61 70 L59 70 Z" fill="#4F46E5" />
      </g>
    </svg>
  </div>
);

// Hero BST Tree Diagram Component
const HeroBSTDiagramIllustration: React.FC = () => (
  <div className="w-full max-w-md mx-auto p-5 sm:p-6 bg-gradient-to-br from-indigo-50/40 via-white to-indigo-50/20 dark:from-slate-800/40 dark:via-slate-900 dark:to-indigo-950/20 rounded-3xl border border-indigo-100/80 dark:border-slate-800 flex flex-col items-center justify-center gap-3 shadow-2xs select-none">
    {/* SVG BST Tree Visualization */}
    <div className="w-full h-44 sm:h-48 relative flex items-center justify-center">
      <svg viewBox="0 0 280 180" className="w-full h-full overflow-visible drop-shadow-xs">
        {/* Branches / Edges */}
        {/* Root to Left Child (50 -> 30) */}
        <line x1="140" y1="36" x2="80" y2="92" stroke="#818CF8" strokeWidth="2.5" strokeLinecap="round" />
        {/* Root to Right Child (50 -> 70) */}
        <line x1="140" y1="36" x2="200" y2="92" stroke="#818CF8" strokeWidth="2.5" strokeLinecap="round" />
        
        {/* 30 to 20 (Left-Left) */}
        <line x1="80" y1="92" x2="45" y2="148" stroke="#A5B4FC" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 3" />
        {/* 30 to 40 (Left-Right) */}
        <line x1="80" y1="92" x2="115" y2="148" stroke="#A5B4FC" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 3" />
        {/* 70 to 60 (Right-Left) */}
        <line x1="200" y1="92" x2="165" y2="148" stroke="#A5B4FC" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 3" />
        {/* 70 to 80 (Right-Right) */}
        <line x1="200" y1="92" x2="235" y2="148" stroke="#A5B4FC" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 3" />

        {/* Level 0: Root Node 50 */}
        <g transform="translate(140, 36)">
          <circle r="18" fill="#4F46E5" className="filter drop-shadow-sm" />
          <text textAnchor="middle" dy="5" fill="#FFFFFF" fontWeight="bold" fontSize="13" fontFamily="monospace">
            50
          </text>
        </g>

        {/* Level 1: Left Node 30 */}
        <g transform="translate(80, 92)">
          <circle r="15" fill="#6366F1" className="filter drop-shadow-sm" />
          <text textAnchor="middle" dy="4.5" fill="#FFFFFF" fontWeight="bold" fontSize="12" fontFamily="monospace">
            30
          </text>
        </g>

        {/* Level 1: Right Node 70 */}
        <g transform="translate(200, 92)">
          <circle r="15" fill="#6366F1" className="filter drop-shadow-sm" />
          <text textAnchor="middle" dy="4.5" fill="#FFFFFF" fontWeight="bold" fontSize="12" fontFamily="monospace">
            70
          </text>
        </g>

        {/* Level 2: Leaves (20, 40, 60, 80) */}
        <g transform="translate(45, 148)">
          <circle r="12" fill="#E0E7FF" stroke="#6366F1" strokeWidth="1.5" />
          <text textAnchor="middle" dy="4" fill="#3730A3" fontWeight="bold" fontSize="10" fontFamily="monospace">
            20
          </text>
        </g>
        <g transform="translate(115, 148)">
          <circle r="12" fill="#E0E7FF" stroke="#6366F1" strokeWidth="1.5" />
          <text textAnchor="middle" dy="4" fill="#3730A3" fontWeight="bold" fontSize="10" fontFamily="monospace">
            40
          </text>
        </g>
        <g transform="translate(165, 148)">
          <circle r="12" fill="#E0E7FF" stroke="#6366F1" strokeWidth="1.5" />
          <text textAnchor="middle" dy="4" fill="#3730A3" fontWeight="bold" fontSize="10" fontFamily="monospace">
            60
          </text>
        </g>
        <g transform="translate(235, 148)">
          <circle r="12" fill="#E0E7FF" stroke="#6366F1" strokeWidth="1.5" />
          <text textAnchor="middle" dy="4" fill="#3730A3" fontWeight="bold" fontSize="10" fontFamily="monospace">
            80
          </text>
        </g>
      </svg>
    </div>

    {/* Invariant Property Badge */}
    <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 rounded-full text-indigo-700 dark:text-indigo-300 text-xs font-mono font-bold">
      <span>Left &lt; Root (50) &lt; Right</span>
    </div>
  </div>
);

interface HomePageProps {
  setActiveTab: (tab: NavTab) => void;
  onSelectTopic?: (topicIndex: number) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ setActiveTab, onSelectTopic }) => {
  return (
    <div id="home-page-root" className="space-y-6 sm:space-y-8 pb-16">
      {/* Top Hero Container: BST Main Heading, Description, & Tree Visual */}
      <section
        id="hero-header-card"
        className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 lg:p-10 shadow-xs space-y-8 transition-colors"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Eyebrow + Big Headline + Description */}
          <div className="lg:col-span-7 space-y-3.5 text-center lg:text-left">
            <div className="text-[11px] sm:text-xs font-mono font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
              THEORY CURRICULUM • BINARY SEARCH TREES • MODULE 01
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.15]">
              Binary Search Trees (BST)
            </h1>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Master hierarchical data organization, the fundamental BST invariant (Left &lt; Root &lt; Right),
              logarithmic O(log n) search efficiency, step-by-step node insertions, and 3-case deletion algorithms.
            </p>
          </div>

          {/* Right Column: Hero BST Tree Diagram */}
          <div className="lg:col-span-5 flex justify-center">
            <HeroBSTDiagramIllustration />
          </div>
        </div>

        {/* 3 Summary Cards at the bottom of the Hero container */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-slate-100 dark:border-slate-800">
          {/* Card 1: Core Idea */}
          <div className="bg-slate-50/70 dark:bg-slate-850/60 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
              <div className="w-6 h-6 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
                <Target className="w-3.5 h-3.5" />
              </div>
              <span>Core Idea</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Hierarchical node structure where every node has at most 2 children, organized for fast retrieval.
            </p>
          </div>

          {/* Card 2: Key Invariant */}
          <div className="bg-slate-50/70 dark:bg-slate-850/60 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
              <div className="w-6 h-6 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs flex-shrink-0">
                Σ
              </div>
              <span>BST Invariant</span>
            </div>
            <div className="space-y-0.5">
              <div className="text-xs font-mono font-bold text-slate-900 dark:text-slate-100">
                Left.val &lt; Node.val &lt; Right.val
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                (guarantees O(log n) balanced search)
              </p>
            </div>
          </div>

          {/* Card 3: Main Advantage */}
          <div className="bg-slate-50/70 dark:bg-slate-850/60 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
              <div className="w-6 h-6 rounded-full bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <span>Main Advantage</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Combines fast O(log n) binary search with flexible, dynamic node insertion and deletion.
            </p>
          </div>
        </div>
      </section>

      {/* 1. The Main Idea (BST Invariant & Visual Flow) */}
      <section
        id="the-main-idea-section"
        className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full border border-indigo-300 dark:border-indigo-700 flex items-center justify-center text-indigo-600 dark:text-indigo-400 bg-indigo-50/60 dark:bg-indigo-950/50 shadow-2xs">
            <Lightbulb className="w-4 h-4" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            1. The Main Idea
          </h2>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-4xl">
          Arrays allow O(1) random lookup by index, but require expensive O(n) element shifting when inserting or deleting. Linked lists allow fast O(1) pointers, but require slow O(n) linear search. A Binary Search Tree balances both: it keeps data sorted and allows O(log n) search, insertion, and deletion.
        </p>

        {/* Visual Flow */}
        <div className="bg-indigo-50/50 dark:bg-slate-800/60 p-4 sm:p-5 rounded-2xl border border-indigo-100 dark:border-slate-700/80 flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3 text-xs font-mono font-semibold">
          <span className="bg-white dark:bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs text-slate-800 dark:text-slate-200">
            Target: 42
          </span>
          <span className="text-indigo-500 dark:text-indigo-400 font-bold">→</span>
          <span className="bg-white dark:bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs text-indigo-700 dark:text-indigo-300 font-bold">
            Compare with Root (50)
          </span>
          <span className="text-indigo-500 dark:text-indigo-400 font-bold">→</span>
          <span className="bg-white dark:bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs text-slate-800 dark:text-slate-200">
            42 &lt; 50 → Branch Left (30)
          </span>
          <span className="text-indigo-500 dark:text-indigo-400 font-bold">→</span>
          <span className="bg-indigo-600 text-white px-3.5 py-2 rounded-xl shadow-2xs font-bold">
            42 &gt; 30 → Placed at Right [42]
          </span>
        </div>
      </section>

      {/* 2. Concepts / Concept Roadmap (8 BST Topics in Circular Style) */}
      <section
        id="concept-roadmap-section"
        className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full border border-indigo-300 dark:border-indigo-700 flex items-center justify-center text-indigo-600 dark:text-indigo-400 bg-indigo-50/60 dark:bg-indigo-950/50 shadow-2xs">
              <Star className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                2. Concept Roadmap
              </h2>
            </div>
          </div>
          <button
            id="view-all-syllabus-btn"
            onClick={() => {
              soundManager.playClick();
              setActiveTab('learn');
            }}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <span>View all lessons</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 8 BST Topics Row in Circular Style */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 sm:gap-5 text-center">
          {[
            {
              id: 'bst-topic-1',
              title: 'Tree Basics',
              subtitle: 'Root, Edges & Leaves',
              topicIndex: 0,
              icon: <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
              bgClass: 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/80',
            },
            {
              id: 'bst-topic-2',
              title: 'BST Invariant',
              subtitle: 'Left < Root < Right',
              topicIndex: 2,
              icon: <Binary className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
              bgClass: 'bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/80',
            },
            {
              id: 'bst-topic-3',
              title: 'O(log n) Search',
              subtitle: 'Binary Tree Search',
              topicIndex: 11,
              icon: <Search className="w-5 h-5 text-sky-600 dark:text-sky-400" />,
              bgClass: 'bg-sky-50 dark:bg-sky-950/60 border-sky-200 dark:border-sky-800 text-sky-600 dark:text-sky-400 group-hover:bg-sky-100 dark:group-hover:bg-sky-900/80',
            },
            {
              id: 'bst-topic-4',
              title: 'Node Insertion',
              subtitle: 'Finding Leaf Slot',
              topicIndex: 12,
              icon: <PlusCircle className="w-5 h-5 text-fuchsia-600 dark:text-fuchsia-400" />,
              bgClass: 'bg-fuchsia-50 dark:bg-fuchsia-950/60 border-fuchsia-200 dark:border-fuchsia-800 text-fuchsia-600 dark:text-fuchsia-400 group-hover:bg-fuchsia-100 dark:group-hover:bg-fuchsia-900/80',
            },
            {
              id: 'bst-topic-5',
              title: 'Leaf Deletion',
              subtitle: 'Case 1: 0 Children',
              topicIndex: 14,
              icon: <Trash2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
              bgClass: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/80',
            },
            {
              id: 'bst-topic-6',
              title: '1-Child Delete',
              subtitle: 'Case 2: Bypass Node',
              topicIndex: 15,
              icon: <GitBranch className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
              bgClass: 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/80',
            },
            {
              id: 'bst-topic-7',
              title: '2-Child Delete',
              subtitle: 'Case 3: Successor',
              topicIndex: 16,
              icon: <ArrowDownUp className="w-5 h-5 text-rose-600 dark:text-rose-400" />,
              bgClass: 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 group-hover:bg-rose-100 dark:group-hover:bg-rose-900/80',
            },
            {
              id: 'bst-topic-8',
              title: 'Traversals',
              subtitle: 'In, Pre & Post-Order',
              topicIndex: 19,
              icon: <Activity className="w-5 h-5 text-violet-600 dark:text-violet-400" />,
              bgClass: 'bg-violet-50 dark:bg-violet-950/60 border-violet-200 dark:border-violet-800 text-violet-600 dark:text-violet-400 group-hover:bg-violet-100 dark:group-hover:bg-violet-900/80',
            },
          ].map((topic) => (
            <div
              key={topic.id}
              onClick={() => {
                soundManager.playClick();
                if (onSelectTopic) onSelectTopic(topic.topicIndex);
                setActiveTab('learn');
              }}
              className="flex flex-col items-center gap-2 group cursor-pointer p-2 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all"
            >
              <div
                className={`w-13 h-13 sm:w-14 sm:h-14 rounded-full border flex items-center justify-center transition-all transform group-hover:scale-105 shadow-2xs ${topic.bgClass}`}
              >
                {topic.icon}
              </div>
              <div className="space-y-0.5">
                <span className="text-xs sm:text-[13px] font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-tight line-clamp-2 block">
                  {topic.title}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block leading-tight">
                  {topic.subtitle}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Why Binary Search Trees Matter (3 Distinct Cards) */}
      <section
        id="why-matters-section"
        className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full border border-indigo-300 dark:border-indigo-700 flex items-center justify-center text-indigo-600 dark:text-indigo-400 bg-indigo-50/60 dark:bg-indigo-950/50 shadow-2xs">
            <Star className="w-4 h-4" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            3. Why Binary Search Trees Matter
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Fast O(log n) Search (Purple) */}
          <div className="bg-[#f9f8ff] dark:bg-indigo-950/20 rounded-2xl border border-indigo-100/90 dark:border-indigo-900/40 p-6 shadow-2xs flex flex-col justify-between transition-all hover:shadow-sm">
            <div>
              <div className="w-12 h-12 rounded-full bg-[#7c3aed] flex items-center justify-center text-white mb-5 shadow-xs">
                <Zap className="w-5 h-5 fill-white text-white" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">
                Fast O(log n) Search
              </h3>
              <p className="text-xs sm:text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed">
                Eliminate half of the remaining search space with every single node comparison, guaranteeing high speed even across millions of items.
              </p>
            </div>
          </div>

          {/* Card 2: Dynamic Node Insertion (Light Green/Mint) */}
          <div className="bg-[#f0fdf4] dark:bg-emerald-950/20 rounded-2xl border border-emerald-100/90 dark:border-emerald-900/40 p-6 shadow-2xs flex flex-col justify-between transition-all hover:shadow-sm">
            <div>
              <div className="w-12 h-12 rounded-full bg-[#10b981] flex items-center justify-center text-white mb-5 shadow-xs">
                <Folder className="w-5 h-5 fill-white text-white" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">
                Dynamic Organization
              </h3>
              <p className="text-xs sm:text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed">
                Insert and delete nodes dynamically without needing continuous memory block reallocations or costly linear shifts.
              </p>
            </div>
          </div>

          {/* Card 3: Real-World Applications (Soft Blue) */}
          <div className="bg-[#f0f5ff] dark:bg-blue-950/20 rounded-2xl border border-blue-100/90 dark:border-blue-900/40 p-6 shadow-2xs flex flex-col justify-between transition-all hover:shadow-sm">
            <div>
              <div className="w-12 h-12 rounded-full bg-[#3b82f6] flex items-center justify-center text-white mb-5 shadow-xs">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">
                Real-World Applications
              </h3>
              <p className="text-xs sm:text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed">
                Underpins database indexing (B-Trees, AVL, Red-Black), syntax parsers, file system hierarchies, and auto-complete search engines.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Curriculum Structure & About Topics */}
      <section
        id="about-topics-section"
        className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full border border-indigo-300 dark:border-indigo-700 flex items-center justify-center text-indigo-600 dark:text-indigo-400 bg-indigo-50/60 dark:bg-indigo-950/50 shadow-2xs">
            <BookOpen className="w-4 h-4" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            4. About Topics &amp; Curriculum
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/80 space-y-2">
            <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
              MODULE A
            </span>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
              Foundations &amp; Rules
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Tree terminology, root, edges, leaves, subtree definitions, and the binary search invariant.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/80 space-y-2">
            <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
              MODULE B
            </span>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
              Search &amp; Insertion
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Navigating step-by-step from root to leaf, comparing keys, and attaching new nodes accurately.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/80 space-y-2">
            <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
              MODULE C
            </span>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
              3-Case Deletion
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Leaf pruning, single-child bypass, and 2-child replacement using in-order successor and predecessor.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/80 space-y-2">
            <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
              MODULE D
            </span>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
              Traversals &amp; Analysis
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              In-Order sorted printing, Pre-Order serialization, Post-Order memory cleanup, and tree height.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Ready to Start? (Rocket CTA Card with Start Learning button) */}
      <section
        id="ready-to-start-card"
        className="bg-[#f6f5ff] dark:bg-slate-900/90 border border-[#e4e1ff] dark:border-indigo-950/80 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6"
      >
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          <div className="flex-shrink-0">
            <RocketIllustration className="w-24 h-24" />
          </div>

          <div className="space-y-1.5 max-w-xl">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Ready to Master Binary Search Trees?
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Begin with the fundamental tree properties and learn through interactive visualizations, step-by-step guided walkthroughs, and hands-on tree construction games.
            </p>
          </div>
        </div>

        <button
          id="ready-start-btn"
          onClick={() => {
            soundManager.playClick();
            setActiveTab('learn');
          }}
          className="px-6 py-3.5 bg-[#5452f6] hover:bg-[#433ee8] active:scale-95 text-white font-semibold text-sm rounded-2xl flex items-center gap-2 shadow-md shadow-indigo-500/20 transition-all cursor-pointer whitespace-nowrap"
        >
          <span>Start Learning</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </section>
    </div>
  );
};
