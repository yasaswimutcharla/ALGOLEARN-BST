import React, { useState, useEffect, useRef } from 'react';
import {
  FlaskConical,
  Plus,
  Search,
  Trash2,
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Shuffle,
  Scale,
  Code2,
  Layers,
  ArrowDownToLine,
  ArrowUpToLine,
} from 'lucide-react';
import { TreeCanvas } from '../common/TreeCanvas';
import { BSTNode, TraversalType } from '../../types';
import {
  buildTreeFromValues,
  insertNode,
  deleteNodeWithCase,
  findMinNode,
  findMaxNode,
  getInorder,
  getPreorder,
  getPostorder,
  getLevelOrder,
  getTreeHeight,
  countNodes,
  isTreeBalanced,
  validateBST,
} from '../../utils/bst';
import { useUserProgress } from '../../context/UserProgressContext';
import { soundManager } from '../../utils/audio';

export const LabPage: React.FC = () => {
  const { addXP, unlockBadge } = useUserProgress();

  // Primary Tree state
  const [tree, setTree] = useState<BSTNode | null>(() =>
    buildTreeFromValues([50, 30, 70, 20, 40, 60, 80])
  );

  // Input states
  const [inputValue, setInputValue] = useState<string>('45');
  const [batchInput, setBatchInput] = useState<string>('50, 25, 75, 15, 35, 65, 85');

  // Animation and visual tracking states
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [comparingNodeId, setComparingNodeId] = useState<string | null>(null);
  const [visitedNodeIds, setVisitedNodeIds] = useState<string[]>([]);
  const [statusLog, setStatusLog] = useState<string>('Lab ready. Perform operations or play traversals!');

  // Traversal playback
  const [traversalType, setTraversalType] = useState<TraversalType>('inorder');
  const [traversalResult, setTraversalResult] = useState<number[]>([]);
  const [traversalIndex, setTraversalIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(600);

  // Code snippet tab
  const [codeLanguage, setCodeLanguage] = useState<'javascript' | 'python' | 'cpp' | 'java'>('javascript');
  const [activeCodeOp, setActiveCodeOp] = useState<'search' | 'insert' | 'delete' | 'inorder'>('search');

  const playbackTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
    };
  }, []);

  const triggerLabActivityXP = () => {
    addXP(10, 'Lab experimentation');
    unlockBadge('lab-scientist');
  };

  // Operation: Insert Single
  const handleInsert = (valNum?: number) => {
    const val = valNum !== undefined ? valNum : parseInt(inputValue, 10);
    if (isNaN(val)) return;

    soundManager.playStep(2);
    setTree((prev) => insertNode(prev, val));
    setStatusLog(`Inserted ${val} into BST. Traversed down to a leaf position.`);
    setInputValue('');
    setActiveNodeId(null);
    setComparingNodeId(null);
    triggerLabActivityXP();
  };

  // Operation: Batch Insert
  const handleBatchInsert = () => {
    const nums = batchInput
      .split(',')
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n));

    if (nums.length === 0) return;
    soundManager.playSuccess();
    setTree(buildTreeFromValues(nums));
    setStatusLog(`Built fresh BST with ${nums.length} values: [${nums.join(', ')}]`);
    setActiveNodeId(null);
    setComparingNodeId(null);
    setVisitedNodeIds([]);
    triggerLabActivityXP();
  };

  // Operation: Search with animation
  const handleSearch = () => {
    const val = parseInt(inputValue, 10);
    if (isNaN(val) || !tree) return;

    soundManager.playClick();
    setStatusLog(`Starting binary search for target: ${val}...`);
    setIsPlaying(false);
    if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);

    let current: BSTNode | null = tree;
    const visitedIds: string[] = [];
    let stepCount = 0;

    const stepInterval = setInterval(() => {
      if (!current) {
        soundManager.playError();
        setStatusLog(`Search finished: Target ${val} not found in this BST (hit NULL branch).`);
        setComparingNodeId(null);
        setActiveNodeId(null);
        clearInterval(stepInterval);
        return;
      }

      setComparingNodeId(current.id);
      visitedIds.push(current.id);
      setVisitedNodeIds([...visitedIds]);
      soundManager.playStep(stepCount++);

      if (current.value === val) {
        soundManager.playSuccess();
        setActiveNodeId(current.id);
        setComparingNodeId(null);
        setStatusLog(`Found target ${val} at node!`);
        clearInterval(stepInterval);
      } else if (val < current.value) {
        setStatusLog(`Comparing with ${current.value}: ${val} < ${current.value}, moving LEFT...`);
        current = current.left || null;
      } else {
        setStatusLog(`Comparing with ${current.value}: ${val} > ${current.value}, moving RIGHT...`);
        current = current.right || null;
      }
    }, playbackSpeed);
  };

  // Operation: Delete
  const handleDelete = () => {
    const val = parseInt(inputValue, 10);
    if (isNaN(val) || !tree) return;

    soundManager.playClick();
    const { newRoot, caseType } = deleteNodeWithCase(tree, val);
    setTree(newRoot);
    setStatusLog(`Deleted ${val} (${caseType}). Tree structure preserved.`);
    setInputValue('');
    setActiveNodeId(null);
    setComparingNodeId(null);
    triggerLabActivityXP();
  };

  // Operation: Find Min
  const handleFindMin = () => {
    if (!tree) return;
    const minNode = findMinNode(tree);
    if (minNode) {
      soundManager.playSuccess();
      setActiveNodeId(minNode.id);
      setStatusLog(`Minimum value in this BST is ${minNode.value} (leftmost node).`);
    }
  };

  // Operation: Find Max
  const handleFindMax = () => {
    if (!tree) return;
    const maxNode = findMaxNode(tree);
    if (maxNode) {
      soundManager.playSuccess();
      setActiveNodeId(maxNode.id);
      setStatusLog(`Maximum value in this BST is ${maxNode.value} (rightmost node).`);
    }
  };

  // Random Value Insert
  const handleRandomInsert = () => {
    const randomVal = Math.floor(Math.random() * 90) + 10;
    handleInsert(randomVal);
  };

  // Traversal Playback Handler
  const startTraversal = (type: TraversalType) => {
    if (!tree) return;
    soundManager.playClick();
    setTraversalType(type);

    let sequence: number[] = [];
    if (type === 'inorder') sequence = getInorder(tree);
    else if (type === 'preorder') sequence = getPreorder(tree);
    else if (type === 'postorder') sequence = getPostorder(tree);
    else if (type === 'levelorder') sequence = getLevelOrder(tree);

    setTraversalResult(sequence);
    setTraversalIndex(0);
    setIsPlaying(true);
    setStatusLog(`Playing ${type.toUpperCase()} traversal: [${sequence.join(', ')}]`);

    if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);

    let idx = 0;
    playbackTimerRef.current = setInterval(() => {
      if (idx >= sequence.length) {
        setIsPlaying(false);
        if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
        setStatusLog(`Completed ${type.toUpperCase()} traversal!`);
        return;
      }
      setTraversalIndex(idx);
      soundManager.playStep(idx);
      idx++;
    }, playbackSpeed);
  };

  const pauseTraversal = () => {
    soundManager.playClick();
    setIsPlaying(false);
    if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
  };

  const stepNextTraversal = () => {
    if (traversalResult.length === 0 && tree) {
      startTraversal(traversalType);
      return;
    }
    const nextIdx = traversalIndex + 1;
    if (nextIdx < traversalResult.length) {
      setTraversalIndex(nextIdx);
      soundManager.playStep(nextIdx);
    }
  };

  // Metrics calculations
  const totalNodesCount = countNodes(tree);
  const treeHeight = getTreeHeight(tree);
  const isBalanced = isTreeBalanced(tree);
  const validation = validateBST(tree);

  const currentActiveTraversalVal =
    traversalIndex >= 0 && traversalIndex < traversalResult.length
      ? traversalResult[traversalIndex]
      : null;

  return (
    <div id="lab-page-root" className="space-y-6 pb-16">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-indigo-100 dark:border-slate-800 shadow-sm shadow-indigo-500/5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
              Visual Sandbox
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">• Experiment & Traversal Simulator</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Interactive BST Lab
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl">
            Insert, search, delete, and inspect arbitrary tree topologies with live animated traversals and real-time metrics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundManager.playClick();
              setTree(buildTreeFromValues([50, 30, 70, 20, 40, 60, 80]));
              setStatusLog('Reset tree to default balanced state.');
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors shadow-2xs cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Reset Tree</span>
          </button>
        </div>
      </div>

      {/* Main Lab Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left / Center: Interactive Tree Canvas & Traversal Player */}
        <div className="lg:col-span-8 space-y-4">
          {/* Tree Canvas Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-indigo-100 dark:border-slate-800 p-5 shadow-sm shadow-indigo-500/5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                <span className="font-bold text-slate-800 dark:text-slate-200">Interactive Canvas</span>
                {validation.isValid ? (
                  <span className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-[10px] font-bold">
                    VALID BST
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 text-[10px] font-bold">
                    INVALID BST
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setTree(null)}
                  className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 font-medium transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              </div>
            </div>

            {/* Canvas */}
            <div className="min-h-[340px] flex items-center justify-center bg-slate-50/50 dark:bg-slate-950/50 rounded-xl border border-slate-100 dark:border-slate-800">
              <TreeCanvas
                root={tree}
                activeNodeId={activeNodeId}
                comparingNodeId={comparingNodeId}
                targetValue={currentActiveTraversalVal}
                visitedNodeIds={visitedNodeIds}
                showSubtreeTags={true}
                onNodeClick={(node) => {
                  soundManager.playStep(1);
                  setActiveNodeId(node.id);
                  setStatusLog(`Inspecting node ${node.value}: Left is ${node.left?.value || 'null'}, Right is ${node.right?.value || 'null'}.`);
                }}
              />
            </div>

            {/* Live Algorithm Explanation Box */}
            <div className="bg-indigo-50/80 dark:bg-indigo-950/60 p-3.5 rounded-xl border border-indigo-100 dark:border-indigo-900 text-xs text-indigo-950 dark:text-indigo-200 font-mono flex items-center gap-2 min-h-[44px]">
              <span className="text-base">💬</span>
              <span className="leading-tight font-sans font-medium">{statusLog}</span>
            </div>
          </div>

          {/* Traversal Player Bar */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-indigo-100 dark:border-slate-800 p-4 space-y-3 shadow-sm shadow-indigo-500/5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Traversal Engine
                </span>
              </div>

              {/* Traversal Type Tabs */}
              <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                {(['inorder', 'preorder', 'postorder', 'levelorder'] as TraversalType[]).map((type) => (
                  <button
                    key={type}
                    id={`traversal-tab-${type}`}
                    onClick={() => startTraversal(type)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                      traversalType === type
                        ? 'bg-indigo-600 text-white font-bold shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-indigo-700 dark:hover:text-indigo-300'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Player Controls & Result Sequence */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2">
                {isPlaying ? (
                  <button
                    onClick={pauseTraversal}
                    className="flex items-center gap-1 px-3 py-1.5 bg-indigo-800 hover:bg-indigo-900 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs cursor-pointer"
                  >
                    <Pause className="w-3.5 h-3.5" />
                    <span>Pause</span>
                  </button>
                ) : (
                  <button
                    onClick={() => startTraversal(traversalType)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Play</span>
                  </button>
                )}

                <button
                  onClick={stepNextTraversal}
                  className="p-1.5 bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors border border-slate-200 dark:border-slate-700 shadow-2xs cursor-pointer"
                  title="Step Next"
                >
                  <SkipForward className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 ml-2 font-mono">
                  <span>Speed:</span>
                  <select
                    value={playbackSpeed}
                    onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-1 text-slate-700 dark:text-slate-300 text-xs shadow-2xs cursor-pointer"
                  >
                    <option value={1000}>0.5x</option>
                    <option value={600}>1.0x</option>
                    <option value={300}>2.0x</option>
                  </select>
                </div>
              </div>

              {/* Traversal Output Sequence */}
              {traversalResult.length > 0 && (
                <div className="flex items-center gap-1.5 overflow-x-auto max-w-full py-1">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">Sequence:</span>
                  {traversalResult.map((val, idx) => {
                    const isVisitedSoFar = idx <= traversalIndex;
                    const isCurrent = idx === traversalIndex;
                    return (
                      <span
                        key={idx}
                        className={`px-2 py-0.5 rounded text-xs font-mono font-bold transition-all ${
                          isCurrent
                            ? 'bg-indigo-600 text-white scale-110 shadow-xs'
                            : isVisitedSoFar
                            ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {val}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar: Operations & Live Metrics */}
        <div className="lg:col-span-4 space-y-4">
          {/* Operations Panel */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-indigo-100 dark:border-slate-800 p-5 space-y-4 shadow-sm shadow-indigo-500/5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <Code2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Tree Operations</span>
            </h3>

            {/* Single Value Input & Action Buttons */}
            <div className="space-y-2">
              <label className="text-xs text-slate-500 dark:text-slate-400 font-medium block">Target Value</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="e.g. 45"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-800 transition-colors"
                />
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1">
                <button
                  id="lab-insert-btn"
                  onClick={() => handleInsert()}
                  className="flex items-center justify-center gap-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Insert</span>
                </button>

                <button
                  id="lab-search-btn"
                  onClick={handleSearch}
                  className="flex items-center justify-center gap-1 py-2 px-3 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-xl text-xs font-bold transition-colors shadow-2xs cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Search</span>
                </button>

                <button
                  id="lab-delete-btn"
                  onClick={handleDelete}
                  className="flex items-center justify-center gap-1 py-2 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors shadow-2xs cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1">
                <button
                  onClick={handleFindMin}
                  className="flex items-center justify-center gap-1 py-1.5 px-2 bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer"
                >
                  <ArrowDownToLine className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Find Min</span>
                </button>

                <button
                  onClick={handleFindMax}
                  className="flex items-center justify-center gap-1 py-1.5 px-2 bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer"
                >
                  <ArrowUpToLine className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Find Max</span>
                </button>

                <button
                  onClick={handleRandomInsert}
                  className="flex items-center justify-center gap-1 py-1.5 px-2 bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer"
                >
                  <Shuffle className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>+ Random</span>
                </button>
              </div>
            </div>

            {/* Batch Insert Input */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
              <label className="text-xs text-slate-500 dark:text-slate-400 font-medium block">Batch Insert (CSV)</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={batchInput}
                  onChange={(e) => setBatchInput(e.target.value)}
                  placeholder="50, 30, 70, 20..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-800 transition-colors"
                />
                <button
                  onClick={handleBatchInsert}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-colors whitespace-nowrap shadow-2xs cursor-pointer"
                >
                  Build
                </button>
              </div>
            </div>
          </div>

          {/* Tree Metrics Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-indigo-100 dark:border-slate-800 p-5 space-y-3 shadow-sm shadow-indigo-500/5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <Scale className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Live Tree Metrics</span>
            </h3>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Total Nodes</span>
                <span className="text-base font-black text-slate-900 dark:text-slate-100 font-mono">{totalNodesCount}</span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Height (Edges)</span>
                <span className="text-base font-black text-slate-900 dark:text-slate-100 font-mono">{treeHeight}</span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Balanced Status</span>
                <span className={`text-xs font-bold ${isBalanced ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400'}`}>
                  {isBalanced ? 'Balanced' : 'Skewed'}
                </span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400 block text-[11px]">BST Validity</span>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  {validation.isValid ? 'Valid' : 'Violation'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
