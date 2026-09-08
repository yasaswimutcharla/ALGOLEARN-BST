import React, { useState, useEffect } from 'react';
import {
  Eye,
  Play,
  RotateCcw,
  Sparkles,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Search,
  PlusCircle,
  Trash2,
  GitBranch,
  ArrowUpDown,
  MoveDown,
  Layers,
  Check,
} from 'lucide-react';
import { DedicatedTopicVisualizer } from '../learn/DedicatedTopicVisualizer';
import { soundManager } from '../../utils/audio';

export interface VisualConceptItem {
  id: string;
  topicNumber: number;
  title: string;
  category: 'Basics' | 'Operations' | 'Traversals' | 'Special';
  shortDesc: string;
  rule: string;
  icon: React.ComponentType<{ className?: string }>;
  stepsCount: number;
}

export const VISUAL_CONCEPTS: VisualConceptItem[] = [
  {
    id: 'basics',
    topicNumber: 4,
    title: 'BST Basics & Property',
    category: 'Basics',
    shortDesc: 'Fundamental BST ordering rule: Left Subtree < Root < Right Subtree for every single node.',
    rule: 'Left < Root < Right',
    icon: Layers,
    stepsCount: 5,
  },
  {
    id: 'build-bst',
    topicNumber: 3,
    title: 'Build BST from Numbers',
    category: 'Basics',
    shortDesc: 'Insert numbers sequentially, comparing each value starting at root to build a valid tree.',
    rule: 'First number = Root, then branch Left / Right',
    icon: PlusCircle,
    stepsCount: 6,
  },
  {
    id: 'search',
    topicNumber: 12,
    title: 'Search in a BST',
    category: 'Operations',
    shortDesc: 'Find target value in O(log n) average time by halving search space at each comparison.',
    rule: 'Target < Current → Go Left | Target > Current → Go Right',
    icon: Search,
    stepsCount: 6,
  },
  {
    id: 'insertion',
    topicNumber: 13,
    title: 'BST Insertion',
    category: 'Operations',
    shortDesc: 'Traverse down the tree following BST rules until finding an empty slot, then attach new leaf.',
    rule: 'Compare down to empty spot → Place new node',
    icon: PlusCircle,
    stepsCount: 6,
  },
  {
    id: 'leaf-deletion',
    topicNumber: 15,
    title: 'Leaf Node Deletion',
    category: 'Operations',
    shortDesc: 'Deleting a node with 0 children: simply sever the link from its parent.',
    rule: 'Case 1: Node has 0 children → Remove directly',
    icon: Trash2,
    stepsCount: 5,
  },
  {
    id: 'one-child-deletion',
    topicNumber: 16,
    title: 'One-Child Node Deletion',
    category: 'Operations',
    shortDesc: 'Bypass the node to be deleted by connecting its parent directly to its single child.',
    rule: 'Case 2: Node has 1 child → Promote child to parent',
    icon: Trash2,
    stepsCount: 5,
  },
  {
    id: 'two-child-deletion',
    topicNumber: 17,
    title: 'Two-Child Node Deletion',
    category: 'Operations',
    shortDesc: 'Replace node value with its in-order successor (smallest in right subtree), then delete successor.',
    rule: 'Case 3: Node has 2 children → Replace with In-order Successor',
    icon: Trash2,
    stepsCount: 6,
  },
  {
    id: 'inorder-successor',
    topicNumber: 18,
    title: 'In-Order Successor',
    category: 'Operations',
    shortDesc: 'Find the next smallest value larger than current: go 1 step Right, then go Left all the way.',
    rule: 'Right Subtree → Leftmost Node',
    icon: GitBranch,
    stepsCount: 5,
  },
  {
    id: 'inorder-traversal',
    topicNumber: 20,
    title: 'In-Order Traversal',
    category: 'Traversals',
    shortDesc: 'Visit Left Subtree → Root → Right Subtree. Produces nodes strictly in sorted ascending order.',
    rule: 'LEFT → ROOT → RIGHT (Ascending)',
    icon: ArrowUpDown,
    stepsCount: 7,
  },
  {
    id: 'preorder-traversal',
    topicNumber: 21,
    title: 'Pre-Order Traversal',
    category: 'Traversals',
    shortDesc: 'Visit Root → Left Subtree → Right Subtree. Ideal for copying/serializing a tree structure.',
    rule: 'ROOT → LEFT → RIGHT (Top-Down)',
    icon: MoveDown,
    stepsCount: 7,
  },
  {
    id: 'postorder-traversal',
    topicNumber: 22,
    title: 'Post-Order Traversal',
    category: 'Traversals',
    shortDesc: 'Visit Left Subtree → Right Subtree → Root. Ideal for deleting or freeing memory in bottom-up order.',
    rule: 'LEFT → RIGHT → ROOT (Bottom-Up)',
    icon: Layers,
    stepsCount: 7,
  },
  {
    id: 'minimum',
    topicNumber: 101,
    title: 'Find Minimum Value',
    category: 'Special',
    shortDesc: 'Follow left pointers from the root all the way down until no left child exists.',
    rule: 'Leftmost node in BST = Minimum value',
    icon: ArrowRight,
    stepsCount: 4,
  },
  {
    id: 'maximum',
    topicNumber: 102,
    title: 'Find Maximum Value',
    category: 'Special',
    shortDesc: 'Follow right pointers from the root all the way down until no right child exists.',
    rule: 'Rightmost node in BST = Maximum value',
    icon: ArrowRight,
    stepsCount: 4,
  },
];

interface VisualRepresentationPageProps {
  initialTopicNumber?: number;
  onGoToLearn?: (topicIndex: number) => void;
}

export const VisualRepresentationPage: React.FC<VisualRepresentationPageProps> = ({
  initialTopicNumber,
  onGoToLearn,
}) => {
  const [selectedConcept, setSelectedConcept] = useState<VisualConceptItem | null>(() => {
    if (initialTopicNumber) {
      const found = VISUAL_CONCEPTS.find((c) => c.topicNumber === initialTopicNumber);
      if (found) return found;
    }
    return VISUAL_CONCEPTS[0];
  });

  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);

  const categories = ['All', 'Basics', 'Operations', 'Traversals', 'Special'];

  const filteredConcepts =
    activeCategory === 'All'
      ? VISUAL_CONCEPTS
      : VISUAL_CONCEPTS.filter((c) => c.category === activeCategory);

  const currentConceptIndex = VISUAL_CONCEPTS.findIndex(
    (c) => c.topicNumber === selectedConcept?.topicNumber
  );
  const hasNextConcept =
    currentConceptIndex !== -1 && currentConceptIndex < VISUAL_CONCEPTS.length - 1;
  const hasPrevConcept = currentConceptIndex > 0;
  const nextConcept = hasNextConcept ? VISUAL_CONCEPTS[currentConceptIndex + 1] : undefined;
  const prevConcept = hasPrevConcept ? VISUAL_CONCEPTS[currentConceptIndex - 1] : undefined;

  const handleSelectConcept = (concept: VisualConceptItem) => {
    soundManager.playClick();
    setSelectedConcept(concept);
    // Smooth scroll to visual stage
    const elem = document.getElementById('visual-player-stage');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleNextConcept = () => {
    if (nextConcept) {
      handleSelectConcept(nextConcept);
    }
  };

  const handlePrevConcept = () => {
    if (prevConcept) {
      handleSelectConcept(prevConcept);
    }
  };

  return (
    <div id="visual-representation-page-root" className="space-y-6 pb-16">
      {/* Top Banner Header */}
      <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-indigo-100 dark:border-slate-800 shadow-sm shadow-indigo-500/5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              Visual Learning Center
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">• 13 Core BST Visuals</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            BST Visual Representation
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
            Watch step-by-step tree animations synchronized with simple algorithm rules. Control playback, explore comparisons, and inspect node state changes.
          </p>
        </div>

        {/* Quick Speed Selector */}
        <div className="flex items-center gap-2 self-start md:self-auto bg-slate-50 dark:bg-slate-800 p-2 rounded-2xl border border-slate-200 dark:border-slate-700">
          <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase px-1">
            Global Speed:
          </span>
          {([0.5, 1, 1.5, 2] as const).map((spd) => (
            <button
              key={spd}
              id={`visual-page-speed-${spd}x`}
              onClick={() => {
                soundManager.playClick();
                setSpeedMultiplier(spd);
              }}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
                speedMultiplier === spd
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600'
              }`}
            >
              {spd}x
            </button>
          ))}
        </div>
      </div>

      {/* Active Animation Viewer Stage */}
      {selectedConcept && (
        <div
          id="visual-player-stage"
          className="bg-white dark:bg-slate-900 rounded-2xl border border-indigo-200 dark:border-slate-800 p-5 sm:p-7 shadow-sm shadow-indigo-500/5 space-y-5 transition-colors"
        >
          {/* Active Title Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 text-[11px] font-bold uppercase font-mono">
                  {selectedConcept.category}
                </span>
                <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                  Topic #{selectedConcept.topicNumber}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
                <span>{selectedConcept.title}</span>
              </h2>
              <p className="text-xs text-indigo-700 dark:text-indigo-400 font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Rule: {selectedConcept.rule}</span>
              </p>
            </div>

            {/* Jump to Learn topic button */}
            {onGoToLearn && selectedConcept.topicNumber <= 26 && (
              <button
                id="visual-open-in-learn-btn"
                onClick={() => onGoToLearn(selectedConcept.topicNumber - 1)}
                className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-xl text-xs font-bold flex items-center gap-1.5 self-start sm:self-center transition-colors cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Read Full Lesson</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Dedicated Topic Visualizer Player Component */}
          <DedicatedTopicVisualizer
            topicNumber={selectedConcept.topicNumber}
            speedMultiplier={speedMultiplier}
            onNextTopic={hasNextConcept ? handleNextConcept : undefined}
            onPrevTopic={hasPrevConcept ? handlePrevConcept : undefined}
            hasNextTopic={hasNextConcept}
            hasPrevTopic={hasPrevConcept}
            nextTopicTitle={nextConcept?.title}
            prevTopicTitle={prevConcept?.title}
          />
        </div>
      )}

      {/* Concept Selector Grid Section */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
              <Eye className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Explore All 13 Visual Representations</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select any core concept below to load its dedicated animated walkthrough.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {categories.map((cat) => (
              <button
                key={cat}
                id={`filter-category-${cat.toLowerCase()}`}
                onClick={() => {
                  soundManager.playClick();
                  setActiveCategory(cat);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* 13 Concept Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredConcepts.map((item) => {
            const Icon = item.icon;
            const isSelected = selectedConcept?.id === item.id;

            return (
              <div
                key={item.id}
                id={`concept-card-${item.id}`}
                className={`bg-white dark:bg-slate-900 p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md ${
                  isSelected
                    ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-indigo-500/10'
                    : 'border-indigo-100 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700'
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold uppercase font-mono border border-indigo-200 dark:border-indigo-800">
                      {item.category}
                    </span>
                    <span className="text-[11px] font-mono text-slate-600 dark:text-slate-400 font-bold">
                      {item.stepsCount} Steps
                    </span>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">
                        {item.title}
                      </h3>
                      <p className="text-[11px] text-indigo-700 dark:text-indigo-400 font-medium font-mono mt-0.5">
                        {item.rule}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {item.shortDesc}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <button
                    id={`view-anim-btn-${item.id}`}
                    onClick={() => handleSelectConcept(item)}
                    className={`w-full py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{isSelected ? 'Currently Viewing' : 'View Animation'}</span>
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
