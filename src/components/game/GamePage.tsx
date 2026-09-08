import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  RotateCcw,
  Lightbulb,
  Compass,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Trash2,
  Trophy,
  Sparkles,
  Zap,
  ListOrdered,
  Send,
  Undo2,
  Redo2,
  Square,
} from 'lucide-react';
import { GAME_CHALLENGES } from '../../data/gameChallengesData';
import { BSTNode, DropSlot, GameChallenge, TraversalType } from '../../types';
import {
  buildTreeFromValues,
  getAvailableDropSlots,
  attachNodeAtSlot,
  validateDropSlot,
  deleteNodeWithCase,
  inorderTraversal,
  preorderTraversal,
  postorderTraversal,
  getInorder,
  getPreorder,
  getPostorder,
  flattenTree,
} from '../../utils/bst';
import { TreeCanvas } from '../common/TreeCanvas';
import { useUserProgress } from '../../context/UserProgressContext';
import { soundManager } from '../../utils/audio';
import confetti from 'canvas-confetti';
import { LevelProgressTrack } from './LevelProgressTrack';
import { ErrorBoundary } from '../common/ErrorBoundary';

export const GamePage: React.FC = () => {
  return (
    <ErrorBoundary
      fallbackTitle="Game Level Error"
      fallbackMessage="Unable to load this level. Please restart the level."
    >
      <GamePageContent />
    </ErrorBoundary>
  );
};

interface DynamicGuidedStep {
  title: string;
  actionDescription: string;
  comparingNodeId: string | null;
  guidedSlotId: string | null;
  banner?: { text: string; subtext?: string; direction?: string };
  isInsertAction: boolean;
  valueToInsert?: number;
  slotToInsert?: DropSlot;
}

function generateDynamicGuidedSteps(
  root: BSTNode | null,
  value: number,
  availableSlots: DropSlot[]
): DynamicGuidedStep[] {
  if (!root) {
    const rootSlot = availableSlots.find((s) => s.direction === 'root') || {
      id: 'slot-root',
      parentId: null,
      direction: 'root' as const,
      x: 340,
      y: 55,
    };
    return [
      {
        title: `1. Tree is Empty`,
        actionDescription: `We are inserting ${value}. Because the tree is currently empty, ${value} becomes the Root of the Binary Search Tree.`,
        comparingNodeId: null,
        guidedSlotId: 'slot-root',
        banner: { text: `Empty Tree → Root`, subtext: `${value} will be root` },
        isInsertAction: false,
      },
      {
        title: `2. Place ${value} as Root`,
        actionDescription: `The central root position is open. Click "Insert Node ${value}" to place it into the Root position.`,
        comparingNodeId: null,
        guidedSlotId: 'slot-root',
        banner: { text: `Insert Root: ${value}`, subtext: `Establishing root of BST` },
        isInsertAction: true,
        valueToInsert: value,
        slotToInsert: rootSlot,
      },
    ];
  }

  const steps: DynamicGuidedStep[] = [];
  let curr: BSTNode | null = root;
  let stepIndex = 1;

  while (curr) {
    if (value < curr.value) {
      steps.push({
        title: `Step ${stepIndex++}: Compare with Node ${curr.value}`,
        actionDescription: `We are inserting ${value}. Comparing with node ${curr.value}: ${value} is smaller than ${curr.value} (${value} < ${curr.value}), so by BST rules we move to the LEFT subtree.`,
        comparingNodeId: curr.id,
        guidedSlotId: null,
        banner: { text: `${value} < ${curr.value}`, subtext: `Smaller → Move LEFT`, direction: 'left' },
        isInsertAction: false,
      });

      if (curr.left) {
        curr = curr.left;
      } else {
        const slotId = `slot-${curr.id}-left`;
        const matchedSlot = availableSlots.find((s) => s.id === slotId) || {
          id: slotId,
          parentId: curr.id,
          direction: 'left' as const,
          x: (curr.x || 340) - 50,
          y: (curr.y || 55) + 68,
        };

        steps.push({
          title: `Step ${stepIndex++}: Empty Position Found`,
          actionDescription: `The LEFT child of ${curr.value} is empty. Because ${value} < ${curr.value}, this empty node is the correct insertion position for ${value}.`,
          comparingNodeId: curr.id,
          guidedSlotId: slotId,
          banner: { text: `Left of ${curr.value}`, subtext: `Target position for ${value}` },
          isInsertAction: false,
        });

        steps.push({
          title: `Step ${stepIndex++}: Insert Node ${value}`,
          actionDescription: `Click "Insert Node ${value}" to place ${value} as the left child of ${curr.value}.`,
          comparingNodeId: curr.id,
          guidedSlotId: slotId,
          banner: { text: `Insert ${value}`, subtext: `Attaching node ${value}` },
          isInsertAction: true,
          valueToInsert: value,
          slotToInsert: matchedSlot,
        });
        break;
      }
    } else if (value > curr.value) {
      steps.push({
        title: `Step ${stepIndex++}: Compare with Node ${curr.value}`,
        actionDescription: `We are inserting ${value}. Comparing with node ${curr.value}: ${value} is greater than ${curr.value} (${value} > ${curr.value}), so by BST rules we move to the RIGHT subtree.`,
        comparingNodeId: curr.id,
        guidedSlotId: null,
        banner: { text: `${value} > ${curr.value}`, subtext: `Greater → Move RIGHT`, direction: 'right' },
        isInsertAction: false,
      });

      if (curr.right) {
        curr = curr.right;
      } else {
        const slotId = `slot-${curr.id}-right`;
        const matchedSlot = availableSlots.find((s) => s.id === slotId) || {
          id: slotId,
          parentId: curr.id,
          direction: 'right' as const,
          x: (curr.x || 340) + 50,
          y: (curr.y || 55) + 68,
        };

        steps.push({
          title: `Step ${stepIndex++}: Empty Position Found`,
          actionDescription: `The RIGHT child of ${curr.value} is empty. Because ${value} > ${curr.value}, this empty node is the correct insertion position for ${value}.`,
          comparingNodeId: curr.id,
          guidedSlotId: slotId,
          banner: { text: `Right of ${curr.value}`, subtext: `Target position for ${value}` },
          isInsertAction: false,
        });

        steps.push({
          title: `Step ${stepIndex++}: Insert Node ${value}`,
          actionDescription: `Click "Insert Node ${value}" to place ${value} as the right child of ${curr.value}.`,
          comparingNodeId: curr.id,
          guidedSlotId: slotId,
          banner: { text: `Insert ${value}`, subtext: `Attaching node ${value}` },
          isInsertAction: true,
          valueToInsert: value,
          slotToInsert: matchedSlot,
        });
        break;
      }
    } else {
      break;
    }
  }

  return steps;
}

const GamePageContent: React.FC = () => {
  const {
    stats,
    completeGameChallenge,
    addXP,
    activeTeam,
    recordTeamGameResult,
  } = useUserProgress();

  const [activeChallengeIndex, setActiveChallengeIndex] = useState<number>(0);
  const challenge: GameChallenge = GAME_CHALLENGES[activeChallengeIndex] || GAME_CHALLENGES[0];

  // Core BST Game State
  const [currentTree, setCurrentTree] = useState<BSTNode | null>(null);
  const [remainingTrayNumbers, setRemainingTrayNumbers] = useState<number[]>([]);
  const [selectedDragNumber, setSelectedDragNumber] = useState<number | null>(null);
  const [selectedNodeForAction, setSelectedNodeForAction] = useState<BSTNode | null>(null);
  const [isDustbinHovered, setIsDustbinHovered] = useState<boolean>(false);

  // Level 4: Multi-stage deletion state (Case 1 -> Case 2 -> Case 3)
  const [deletionStageIndex, setDeletionStageIndex] = useState<number>(0);
  const [deletionPhase, setDeletionPhase] = useState<'select_node' | 'replace_slot'>('select_node');
  const [emptySlotInfo, setEmptySlotInfo] = useState<{
    id: string;
    deletedValue: number;
    expectedReplacement: number;
    leftId?: string | null;
    rightId?: string | null;
    parentId?: string | null;
    direction?: 'root' | 'left' | 'right';
  } | null>(null);

  // Level 5: BST Traversals State (Inorder, Preorder, Postorder)
  const [activeTraversalType, setActiveTraversalType] = useState<TraversalType>('inorder');
  const [selectedTraversalNodes, setSelectedTraversalNodes] = useState<number[]>([]);
  const [traversalSubmitted, setTraversalSubmitted] = useState<boolean>(false);
  const [completedTraversals, setCompletedTraversals] = useState<Record<TraversalType, boolean>>({
    inorder: false,
    preorder: false,
    postorder: false,
    levelorder: false,
  });

  // Per-Node Mistakes & Scoring Tracking
  const [nodeAttempts, setNodeAttempts] = useState<Record<number, number>>({});
  const [nodeScores, setNodeScores] = useState<Record<number, number>>({});
  const [totalCorrect, setTotalCorrect] = useState<number>(0);
  const [totalMistakes, setTotalMistakes] = useState<number>(0);
  const [totalAttempts, setTotalAttempts] = useState<number>(0);
  const [hintsUsedCount, setHintsUsedCount] = useState<number>(0);

  // Placement & Deletion Feedback States
  const [placementFeedback, setPlacementFeedback] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
    pointsAwarded?: number;
  } | null>(null);
  const [invalidSlotId, setInvalidSlotId] = useState<string | null>(null);
  const [isChallengeComplete, setIsChallengeComplete] = useState<boolean>(false);

  // Hint & Guided Solve States
  const [hintLevel, setHintLevel] = useState<0 | 1 | 2 | 3>(0);
  const [showGuidedSolve, setShowGuidedSolve] = useState<boolean>(false);
  const [guidedStepIndex, setGuidedStepIndex] = useState<number>(0);

  // Undo & Redo History
  const [undoStack, setUndoStack] = useState<{
    tree: BSTNode | null;
    remainingTrayNumbers: number[];
    nodeScores: Record<number, number>;
    totalCorrect: number;
  }[]>([]);
  const [redoStack, setRedoStack] = useState<{
    tree: BSTNode | null;
    remainingTrayNumbers: number[];
    nodeScores: Record<number, number>;
    totalCorrect: number;
  }[]>([]);

  // Traversal expected sequences for Level 5 (tree: [50, 30, 70, 20, 40, 60, 80])
  const traversalExpectedMap: Record<TraversalType, number[]> = {
    inorder: [20, 30, 40, 50, 60, 70, 80],
    preorder: [50, 30, 20, 40, 70, 60, 80],
    postorder: [20, 40, 30, 60, 80, 70, 50],
    levelorder: [50, 30, 70, 20, 40, 60, 80],
  };

  // Total items calculation for score and progress
  const totalStepsInChallenge =
    challenge.level === 4
      ? challenge.deletionStages?.length || 3
      : challenge.level === 5
      ? 7 // 7 nodes in traversal
      : (challenge.numbersToInsert || []).length || 1;

  const maxPossibleScore = totalStepsInChallenge * 10;
  const currentTotalScore = Object.values(nodeScores).reduce((sum: number, val: number) => sum + val, 0);
  const progressPercent = Math.min(100, Math.round((totalCorrect / totalStepsInChallenge) * 100));
  const accuracyPercent = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 100;

  // Pointer drag state for universal dragging of numbers onto slots
  const [pointerDrag, setPointerDrag] = useState<{
    isDragging: boolean;
    value: number;
    x: number;
    y: number;
  } | null>(null);
  const [hoveredDropSlotId, setHoveredDropSlotId] = useState<string | null>(null);

  // Initialize or Reset Challenge
  const resetChallenge = (chal: GameChallenge = challenge) => {
    soundManager.playClick();
    setSelectedDragNumber(null);
    setSelectedNodeForAction(null);
    setIsDustbinHovered(false);
    setDeletionStageIndex(0);
    setDeletionPhase('select_node');
    setEmptySlotInfo(null);
    setSelectedTraversalNodes([]);
    setTraversalSubmitted(false);
    setHintLevel(0);
    setShowGuidedSolve(false);
    setGuidedStepIndex(0);
    setPlacementFeedback(null);
    setInvalidSlotId(null);
    setIsChallengeComplete(false);
    setUndoStack([]);
    setRedoStack([]);

    // Reset scoring stats
    setNodeAttempts({});
    setNodeScores({});
    setTotalCorrect(0);
    setTotalMistakes(0);
    setTotalAttempts(0);
    setHintsUsedCount(0);

    if (chal.category === 'build_tree') {
      setCurrentTree(null);
      setRemainingTrayNumbers(chal.numbersToInsert ? [...chal.numbersToInsert] : []);
    } else if (chal.initialTreeValues) {
      setCurrentTree(buildTreeFromValues(chal.initialTreeValues));
      setRemainingTrayNumbers(chal.numbersToInsert ? [...chal.numbersToInsert] : []);
    } else {
      setCurrentTree(null);
      setRemainingTrayNumbers([]);
    }
  };

  useEffect(() => {
    resetChallenge(challenge);
  }, [activeChallengeIndex]);

  useEffect(() => {
    const handleResetActivity = () => {
      resetChallenge(challenge);
    };
    window.addEventListener('bst-reset-current-activity', handleResetActivity);
    window.addEventListener('bst-reset-progress', handleResetActivity);
    return () => {
      window.removeEventListener('bst-reset-current-activity', handleResetActivity);
      window.removeEventListener('bst-reset-progress', handleResetActivity);
    };
  }, [challenge]);

  // Available drop slots calculated dynamically from the current student tree (hidden upon level completion)
  const availableDropSlots: DropSlot[] =
    isChallengeComplete || remainingTrayNumbers.length === 0
      ? []
      : getAvailableDropSlots(currentTree);

  // Active target for Level 2 (sequential incoming value)
  const currentLevel2Target = challenge.level === 2 && remainingTrayNumbers.length > 0 ? remainingTrayNumbers[0] : null;

  // Active target for Level 4 (current deletion stage)
  const currentLevel4Stage =
    challenge.level === 4 && challenge.deletionStages ? challenge.deletionStages[deletionStageIndex] : null;

  // Dynamic Step-by-Step Guided Solve (generates BST comparisons from CURRENT tree & next uninserted element)
  const nextNumberToInsert = remainingTrayNumbers.length > 0 ? remainingTrayNumbers[0] : null;

  const dynamicGuidedSteps: DynamicGuidedStep[] = useMemo(() => {
    if (challenge.level > 3 || nextNumberToInsert === null) {
      return [];
    }
    return generateDynamicGuidedSteps(currentTree, nextNumberToInsert, availableDropSlots);
  }, [challenge.level, currentTree, nextNumberToInsert, availableDropSlots]);

  const level4GuidedSteps = useMemo(() => [
    {
      stepNumber: 1,
      title: '1. Stage 1: Leaf Deletion (Node 20)',
      actionDescription: 'Node 20 has no children (Leaf). It can be directly severed from the tree by setting parent 30\'s left child pointer to null.',
      buttonLabel: 'Delete Leaf 20 →',
    },
    {
      stepNumber: 2,
      title: '2. Stage 2: Target Node 30 with 1 Child',
      actionDescription: 'Node 30 has exactly one child (40). Click Next to delete node 30 and observe the resulting [EMPTY] vacancy slot.',
      buttonLabel: 'Delete Node 30 →',
    },
    {
      stepNumber: 3,
      title: '3. Stage 2: [EMPTY] Slot Created at Node 30',
      actionDescription: 'Node 30 is removed! An [EMPTY] vacancy remains in its place, with child 40 intact below it. Click Next to promote child 40 up into the [EMPTY] slot.',
      buttonLabel: 'Promote Child 40 into [EMPTY] Slot →',
    },
    {
      stepNumber: 4,
      title: '4. Stage 3: Target Root 50 with 2 Children',
      actionDescription: 'Root 50 has two subtrees (left child 40, right subtree with 70, 60, 80). Click Next to delete Root 50 and observe the empty root vacancy.',
      buttonLabel: 'Delete Root 50 →',
    },
    {
      stepNumber: 5,
      title: '5. Stage 3: Identify In-order Successor (60)',
      actionDescription: 'Root 50 is removed! An [EMPTY] root vacancy remains. To maintain BST ordering (Left < Root < Right), identify the In-order Successor (minimum node in right subtree: 60). Click Next to promote 60 into the Root.',
      buttonLabel: 'Promote Successor 60 into Root →',
    },
    {
      stepNumber: 6,
      title: '6. All 3 Deletion Cases Mastered!',
      actionDescription: 'Case 1 (Leaf), Case 2 (Single Child), and Case 3 (Two Children) are all complete. The BST invariant is preserved!',
      buttonLabel: 'Complete Challenge ✓',
    },
  ], []);

  const activeGuidedSteps =
    challenge.level <= 3 && nextNumberToInsert !== null
      ? dynamicGuidedSteps
      : challenge.level === 4
      ? level4GuidedSteps
      : challenge.guidedSolveSteps;

  const currentGuidedStep = activeGuidedSteps[guidedStepIndex] || null;

  // Handle dropping or clicking a slot to place a number in the tree
  const handleSlotDropOrClick = (
    slot: DropSlot,
    valueToPlace?: number,
    dropPos?: { x: number; y: number }
  ) => {
    const val = valueToPlace !== undefined ? valueToPlace : selectedDragNumber;
    if (val === null || val === undefined) return;
    if (isChallengeComplete) return;

    // In Level 2, enforce sequential insertion
    if (challenge.level === 2 && currentLevel2Target !== null && val !== currentLevel2Target) {
      soundManager.playError();
      setPlacementFeedback({
        type: 'error',
        message: `Please insert incoming value ${currentLevel2Target} first before other values.`,
      });
      return;
    }

    // In Level 4 or Level 5, direct insertion slots are disabled
    if (challenge.level === 4 || challenge.level === 5) {
      return;
    }

    // Validate placement against BST invariants
    const validation = validateDropSlot(currentTree, slot, val);

    if (!validation.isValid) {
      // WRONG PLACEMENT
      soundManager.playError();
      const currentWrongAttempts = (nodeAttempts[val] || 0) + 1;
      setNodeAttempts((prev) => ({ ...prev, [val]: currentWrongAttempts }));
      setTotalMistakes((prev) => prev + 1);
      setTotalAttempts((prev) => prev + 1);

      // Turn the selected empty node RED temporarily
      setInvalidSlotId(slot.id);
      setPlacementFeedback({
        type: 'error',
        message: `Incorrect position! ${validation.explanation || `Rule: ${val} must follow Left < Root < Right.`}`,
      });

      // Clear selected drag number so element returns to top tray
      setSelectedDragNumber(null);
      setTimeout(() => setInvalidSlotId(null), 1200);
      return;
    }

    // CORRECT PLACEMENT
    soundManager.playInsert();
    const wrongCount = nodeAttempts[val] || 0;
    let earnedPoints = 10;
    if (wrongCount === 1) earnedPoints = 7;
    else if (wrongCount === 2) earnedPoints = 4;
    else if (wrongCount >= 3) earnedPoints = 1;

    const updatedScores = { ...nodeScores, [val]: earnedPoints };
    setNodeScores(updatedScores);

    const newCorrect = totalCorrect + 1;
    const newAttempts = totalAttempts + 1;
    setTotalCorrect(newCorrect);
    setTotalAttempts(newAttempts);

    // Push snapshot to undoStack
    setUndoStack((prev) => [
      ...prev,
      {
        tree: currentTree,
        remainingTrayNumbers: [...remainingTrayNumbers],
        nodeScores: { ...nodeScores },
        totalCorrect,
      },
    ]);
    setRedoStack([]);

    // Attach node to tree
    const newTree = attachNodeAtSlot(currentTree, slot, val);
    setCurrentTree(newTree);

    // Remove placed number from the tray
    const remainingAfterPlacement = remainingTrayNumbers.filter((n, idx) => {
      return idx !== remainingTrayNumbers.indexOf(val);
    });
    setRemainingTrayNumbers(remainingAfterPlacement);
    setSelectedDragNumber(null);
    setInvalidSlotId(null);

    setPlacementFeedback({
      type: 'success',
      message: `Placed ${val} correctly! ${validation.explanation || 'Follows BST property.'}`,
      pointsAwarded: earnedPoints,
    });

    // Check completion for Level 1, 2, 3
    if (remainingAfterPlacement.length === 0) {
      triggerChallengeSuccess(newCorrect, newAttempts, updatedScores);
    }
  };

  // Undo and Redo handlers for BST insertion flow
  const handleUndo = () => {
    if (undoStack.length === 0) return;
    soundManager.playClick();
    const prevSnapshot = undoStack[undoStack.length - 1];
    const newUndoStack = undoStack.slice(0, -1);

    setRedoStack((prev) => [
      ...prev,
      {
        tree: currentTree,
        remainingTrayNumbers: [...remainingTrayNumbers],
        nodeScores: { ...nodeScores },
        totalCorrect,
      },
    ]);

    setUndoStack(newUndoStack);
    setCurrentTree(prevSnapshot.tree);
    setRemainingTrayNumbers(prevSnapshot.remainingTrayNumbers);
    setNodeScores(prevSnapshot.nodeScores);
    setTotalCorrect(prevSnapshot.totalCorrect);
    setSelectedDragNumber(null);
    setInvalidSlotId(null);
    setPlacementFeedback({
      type: 'info',
      message: 'Undid last insertion. Node returned to the queue.',
    });
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    soundManager.playClick();
    const nextSnapshot = redoStack[redoStack.length - 1];
    const newRedoStack = redoStack.slice(0, -1);

    setUndoStack((prev) => [
      ...prev,
      {
        tree: currentTree,
        remainingTrayNumbers: [...remainingTrayNumbers],
        nodeScores: { ...nodeScores },
        totalCorrect,
      },
    ]);

    setRedoStack(newRedoStack);
    setCurrentTree(nextSnapshot.tree);
    setRemainingTrayNumbers(nextSnapshot.remainingTrayNumbers);
    setNodeScores(nextSnapshot.nodeScores);
    setTotalCorrect(nextSnapshot.totalCorrect);
    setSelectedDragNumber(null);
    setInvalidSlotId(null);
    setPlacementFeedback({
      type: 'info',
      message: 'Redid insertion.',
    });
  };

  // Trigger Completion
  const triggerChallengeSuccess = (
    finalCorrect: number,
    finalAttempts: number,
    scoresRecord: Record<number, number>
  ) => {
    const finalScore = Object.values(scoresRecord).reduce((sum: number, v: number) => sum + v, 0);
    const accuracy = Math.round((finalCorrect / Math.max(1, finalAttempts)) * 100);

    setIsChallengeComplete(true);
    soundManager.playSuccess();
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });

    completeGameChallenge(challenge.id);
    addXP(challenge.xp, `Completed Level ${challenge.level}`);

    recordTeamGameResult({
      teamName: activeTeam,
      challengeId: challenge.id,
      level: challenge.level,
      score: finalScore,
      maxScore: maxPossibleScore,
      correctNodes: totalStepsInChallenge,
      totalNodes: totalStepsInChallenge,
      mistakes: totalMistakes,
      totalAttempts: finalAttempts,
      accuracy,
      hintsUsed: hintsUsedCount,
      completedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
  };

  // Node Click Handlers (Level 4 selection or Level 5 Traversal node click)
  const handleNodeClick = (node: BSTNode) => {
    if (challenge.level !== 5 && isChallengeComplete) return;
    soundManager.playClick();

    // LEVEL 5: TRAVERSAL CLICK HANDLING (Inorder, Preorder, Postorder)
    if (challenge.level === 5) {
      if (traversalSubmitted) {
        setPlacementFeedback({
          type: 'info',
          message: 'Traversal already submitted. Click "Reset Selection" to try again or choose another traversal mode above.',
        });
        return;
      }

      // Check if node is already clicked
      if (selectedTraversalNodes.includes(node.value)) {
        setPlacementFeedback({
          type: 'info',
          message: `Node ${node.value} is already in your selected traversal sequence.`,
        });
        return;
      }

      const updatedSelected = [...selectedTraversalNodes, node.value];
      setSelectedTraversalNodes(updatedSelected);
      setPlacementFeedback({
        type: 'info',
        message: `Recorded node ${node.value} into sequence (${updatedSelected.length}/7). Keep clicking nodes until sequence is complete, then click "Submit Answer".`,
      });
      return;
    }

    // LEVEL 4: If in replace_slot phase, clicking a child/successor node selects it for replacement
    if (challenge.level === 4) {
      if (deletionPhase === 'replace_slot') {
        setSelectedDragNumber(node.value);
        setSelectedNodeForAction(node);
        setPlacementFeedback({
          type: 'info',
          message: `Node ${node.value} selected. Drag and drop it directly onto the [EMPTY] vacancy slot in the tree!`,
        });
        return;
      }
      setSelectedNodeForAction(node);
      setSelectedDragNumber(node.value);
      setPlacementFeedback({
        type: 'info',
        message: `Node ${node.value} selected. Drag it directly to the 🗑️ Dustbin below the canvas to delete it!`,
      });
      return;
    }

    // LEVEL 1, 2, 3 / General Node Selection
    setSelectedNodeForAction(node);
  };

  // Submit Level 5 Traversal Answer
  const handleSubmitTraversal = () => {
    if (!currentTree || selectedTraversalNodes.length === 0) {
      setPlacementFeedback({
        type: 'error',
        message: 'Please click nodes on the tree to select a sequence before submitting.',
      });
      return;
    }

    // Dynamically calculate the traversal internally from current tree
    let expectedSeq: number[] = [];
    if (activeTraversalType === 'inorder') {
      expectedSeq = getInorder(currentTree);
    } else if (activeTraversalType === 'preorder') {
      expectedSeq = getPreorder(currentTree);
    } else if (activeTraversalType === 'postorder') {
      expectedSeq = getPostorder(currentTree);
    } else {
      expectedSeq = getInorder(currentTree);
    }

    const updatedAttempts = totalAttempts + 1;
    setTotalAttempts(updatedAttempts);
    setTraversalSubmitted(true);

    const isMatch =
      selectedTraversalNodes.length === expectedSeq.length &&
      selectedTraversalNodes.every((val, idx) => val === expectedSeq[idx]);

    if (isMatch) {
      soundManager.playSuccess();
      const earnedPoints = 10;
      const updatedScores = { ...nodeScores, [activeTraversalType === 'inorder' ? 1 : activeTraversalType === 'preorder' ? 2 : 3]: earnedPoints };
      setNodeScores(updatedScores);
      const newCorrect = totalCorrect + 1;
      setTotalCorrect(newCorrect);

      const newCompleted = { ...completedTraversals, [activeTraversalType]: true };
      setCompletedTraversals(newCompleted);

      let ruleText = '';
      if (activeTraversalType === 'inorder') ruleText = 'Inorder rule: Left Subtree → Root → Right Subtree (Ascending order)';
      else if (activeTraversalType === 'preorder') ruleText = 'Preorder rule: Root → Left Subtree → Right Subtree';
      else ruleText = 'Postorder rule: Left Subtree → Right Subtree → Root';

      setPlacementFeedback({
        type: 'success',
        message: `Outstanding! Your ${activeTraversalType.toUpperCase()} sequence [${selectedTraversalNodes.join(' → ')}] is 100% correct! ${ruleText}`,
        pointsAwarded: earnedPoints,
      });

      // If all 3 modes completed, trigger completion
      const completedCount = Object.values(newCompleted).filter(Boolean).length;
      if (completedCount >= 3) {
        triggerChallengeSuccess(newCorrect, updatedAttempts, updatedScores);
      }
    } else {
      soundManager.playError();
      setTotalMistakes((prev) => prev + 1);

      let ruleHint = '';
      if (activeTraversalType === 'inorder') ruleHint = 'Inorder rule: Left → Root → Right.';
      else if (activeTraversalType === 'preorder') ruleHint = 'Preorder rule: Root → Left → Right.';
      else ruleHint = 'Postorder rule: Left → Right → Root.';

      setPlacementFeedback({
        type: 'error',
        message: `Sequence mismatch! Your sequence: [${selectedTraversalNodes.join(' → ')}]. ${ruleHint} Click "Reset Selection" to try again.`,
      });
    }
  };

  // Reset Level 5 Traversal Selection
  const handleResetTraversalSelection = () => {
    soundManager.playClick();
    setSelectedTraversalNodes([]);
    setTraversalSubmitted(false);
    setIsChallengeComplete(false);
    setPlacementFeedback({
      type: 'info',
      message: `Selection cleared. Click nodes in ${activeTraversalType.toUpperCase()} order, then click "Submit Answer".`,
    });
  };

  // Switch Traversal Tab in Level 5
  const handleSwitchTraversal = (type: TraversalType) => {
    soundManager.playClick();
    setActiveTraversalType(type);
    setSelectedTraversalNodes([]);
    setTraversalSubmitted(false);
    setIsChallengeComplete(false);
    setPlacementFeedback({
      type: 'info',
      message: `Switched to ${type.toUpperCase()} traversal. Click the tree nodes in order (${
        type === 'inorder'
          ? 'Left → Root → Right'
          : type === 'preorder'
          ? 'Root → Left → Right'
          : 'Left → Right → Root'
      }), then click "Submit Answer".`,
    });
  };

  // Handle Drag Start from Number Chip Tray (HTML5 native drag for desktop/mouse)
  const handleChipDragStart = (e: React.DragEvent, num: number) => {
    e.dataTransfer.setData('text/plain', num.toString());
    e.dataTransfer.setData('application/node-value', num.toString());
    e.dataTransfer.effectAllowed = 'copy';
    setSelectedDragNumber(num);
    soundManager.playClick();
  };

  const handleChipDragEnd = () => {
    setSelectedDragNumber(null);
    setHoveredDropSlotId(null);
    setPointerDrag(null);
    setIsDustbinHovered(false);
  };

  // Touch pointer drag for mobile touch devices
  const handleChipPointerDown = (e: React.PointerEvent, num: number) => {
    // For mouse users, native HTML5 drag handles the drag via onDragStart/onDragEnd without interference
    if (e.pointerType === 'mouse') {
      setSelectedDragNumber(num);
      return;
    }

    setSelectedDragNumber(num);

    const startX = e.clientX;
    const startY = e.clientY;
    let hasMoved = false;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const dist = Math.hypot(moveEvent.clientX - startX, moveEvent.clientY - startY);
      if (dist > 8) {
        hasMoved = true;
      }
      if (hasMoved) {
        setPointerDrag({
          isDragging: true,
          value: num,
          x: moveEvent.clientX,
          y: moveEvent.clientY,
        });

        // Detect hovered drop slot under touch position
        const el = document.elementFromPoint(moveEvent.clientX, moveEvent.clientY);
        const slotEl = el?.closest('[data-drop-slot="true"]');
        let matchedId = slotEl?.getAttribute('data-slot-id') || null;

        if (!matchedId) {
          const slotElements = document.querySelectorAll('[data-drop-slot="true"]');
          slotElements.forEach((sEl) => {
            const rect = sEl.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            if (Math.hypot(moveEvent.clientX - centerX, moveEvent.clientY - centerY) <= 45) {
              matchedId = sEl.getAttribute('data-slot-id');
            }
          });
        }
        setHoveredDropSlotId(matchedId);

        // Check if hovered over dustbin in Level 4
        if (challenge.level === 4) {
          const dustbinEl = el?.closest('#game-dustbin-dropzone');
          if (dustbinEl) {
            setIsDustbinHovered(true);
          } else {
            const dbEl = document.getElementById('game-dustbin-dropzone');
            if (dbEl) {
              const rect = dbEl.getBoundingClientRect();
              if (
                moveEvent.clientX >= rect.left &&
                moveEvent.clientX <= rect.right &&
                moveEvent.clientY >= rect.top &&
                moveEvent.clientY <= rect.bottom
              ) {
                setIsDustbinHovered(true);
              } else {
                setIsDustbinHovered(false);
              }
            } else {
              setIsDustbinHovered(false);
            }
          }
        }
      }
    };

    const handlePointerCancel = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerCancel);
      setPointerDrag(null);
      setHoveredDropSlotId(null);
      setIsDustbinHovered(false);
      setSelectedDragNumber(null);
    };

    const handlePointerUp = (upEvent: PointerEvent) => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerCancel);

      if (hasMoved) {
        // Dropped!
        const el = document.elementFromPoint(upEvent.clientX, upEvent.clientY);

        // 1. Check if dropped over dustbin in Level 4 (to delete node)
        let isOverDustbin = !!el?.closest('#game-dustbin-dropzone');
        if (!isOverDustbin) {
          const dbEl = document.getElementById('game-dustbin-dropzone');
          if (dbEl) {
            const rect = dbEl.getBoundingClientRect();
            if (
              upEvent.clientX >= rect.left &&
              upEvent.clientX <= rect.right &&
              upEvent.clientY >= rect.top &&
              upEvent.clientY <= rect.bottom
            ) {
              isOverDustbin = true;
            }
          }
        }

        if (challenge.level === 4 && isOverDustbin) {
          setIsDustbinHovered(false);
          setPointerDrag(null);
          handleExecuteDeletion(num);
          return;
        }

        // 2. Check if dropped on a Drop Slot or Empty Slot
        const slotEl = el?.closest('[data-drop-slot="true"]');
        let targetSlotId = slotEl?.getAttribute('data-slot-id');

        if (!targetSlotId) {
          const slotElements = document.querySelectorAll('[data-drop-slot="true"]');
          slotElements.forEach((sEl) => {
            const rect = sEl.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            if (Math.hypot(upEvent.clientX - centerX, upEvent.clientY - centerY) <= 50) {
              targetSlotId = sEl.getAttribute('data-slot-id');
            }
          });
        }

        if (targetSlotId) {
          if (challenge.level === 4 && deletionPhase === 'replace_slot') {
            handleReplacementDrop(num, {
              id: targetSlotId,
              parentId: null,
              direction: 'root',
              x: 0,
              y: 0,
            }, { x: upEvent.clientX, y: upEvent.clientY });
          } else {
            const matchedSlot = availableDropSlots.find((s) => s.id === targetSlotId);
            if (matchedSlot) {
              handleSlotDropOrClick(matchedSlot, num, { x: upEvent.clientX, y: upEvent.clientY });
            }
          }
        } else {
          // Released in open space: cancel drag smoothly with no error
          setSelectedDragNumber(null);
        }
      } else {
        soundManager.playClick();
        setSelectedDragNumber(num);
        setPlacementFeedback({
          type: 'info',
          message: challenge.level === 4 && deletionPhase === 'replace_slot'
            ? `Node ${num} selected. Drag and drop it directly onto the [EMPTY] vacancy slot in the tree!`
            : challenge.level === 4
            ? `Node ${num} selected. Drag it directly to the 🗑️ Dustbin below to delete it!`
            : `Node ${num} selected. Drag and drop it onto the correct slot in the tree!`,
        });
      }

      setPointerDrag(null);
      setHoveredDropSlotId(null);
      setIsDustbinHovered(false);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerCancel);
  };

  // Execute Deletion via Dustbin Drop or Direct Click
  const handleExecuteDeletion = (targetVal: number) => {
    if (!currentTree || isChallengeComplete) return;

    // LEVEL 4 DELETION FLOW (All 3 Cases)
    if (challenge.level === 4 && currentLevel4Stage) {
      const expectedTarget = currentLevel4Stage.targetNode;
      const updatedAttempts = totalAttempts + 1;
      setTotalAttempts(updatedAttempts);

      if (targetVal !== expectedTarget) {
        soundManager.playError();
        setTotalMistakes((prev) => prev + 1);
        setPlacementFeedback({
          type: 'error',
          message: `Incorrect node deleted! Current stage goal is ${currentLevel4Stage.caseType}. Please delete target node ${expectedTarget}.`,
        });
        setSelectedNodeForAction(null);
        return;
      }

      // STAGE 1: Case 1 (Leaf Node 20) -> Direct removal, no replacement needed
      if (deletionStageIndex === 0) {
        soundManager.playInsert();
        const { newRoot } = deleteNodeWithCase(currentTree, targetVal);
        setCurrentTree(newRoot);
        setSelectedNodeForAction(null);

        const earnedPoints = 10;
        const updatedScores = { ...nodeScores, [targetVal]: earnedPoints };
        setNodeScores(updatedScores);
        const newCorrect = totalCorrect + 1;
        setTotalCorrect(newCorrect);

        const nextStageIdx = 1;
        setDeletionStageIndex(nextStageIdx);
        const nextStage = challenge.deletionStages![nextStageIdx];
        setPlacementFeedback({
          type: 'success',
          message: `Stage 1 Complete: Deleted Leaf node 20! Parent 30's left pointer is now null. Next: ${nextStage.caseType} — Delete node ${nextStage.targetNode}.`,
          pointsAwarded: earnedPoints,
        });
        return;
      }

      // STAGE 2: Case 2 (Node 30 with 1 Child: 40)
      if (deletionStageIndex === 1) {
        soundManager.playInsert();
        // Remove node 30 leaving empty slot where 30 was, while child 40 remains connected
        const clone = JSON.parse(JSON.stringify(currentTree)) as BSTNode;
        if (clone.left && (clone.left.value === 30 || clone.left.id)) {
          const child40 = clone.left.right || { id: 'node-40', value: 40, left: null, right: null };
          clone.left = {
            id: 'empty-slot-30',
            value: -1,
            isEmptySlot: true,
            label: 'EMPTY',
            expectedReplacement: 40,
            left: null,
            right: child40,
          };
        }
        setCurrentTree(clone);
        setSelectedNodeForAction(null);
        setDeletionPhase('replace_slot');
        setEmptySlotInfo({
          id: 'empty-slot-30',
          deletedValue: 30,
          expectedReplacement: 40,
          parentId: 'node-50',
          direction: 'left',
          leftId: null,
          rightId: 'node-40',
        });

        setPlacementFeedback({
          type: 'info',
          message: `Node 30 deleted! An [EMPTY] slot remains in its place with child 40 intact. Drag child 40 into the [EMPTY] slot to complete replacement.`,
        });
        return;
      }

      // STAGE 3: Case 3 (Root 50 with 2 Children)
      if (deletionStageIndex === 2) {
        soundManager.playInsert();
        // Remove root 50 leaving empty slot at root with both left (40) and right (70 with 60, 80) subtrees intact
        const clone = JSON.parse(JSON.stringify(currentTree)) as BSTNode;
        const emptyRoot: BSTNode = {
          id: 'empty-slot-50',
          value: -1,
          isEmptySlot: true,
          label: 'EMPTY',
          expectedReplacement: 60,
          left: clone.left,
          right: clone.right,
        };
        setCurrentTree(emptyRoot);
        setSelectedNodeForAction(null);
        setDeletionPhase('replace_slot');
        setEmptySlotInfo({
          id: 'empty-slot-50',
          deletedValue: 50,
          expectedReplacement: 60,
          parentId: null,
          direction: 'root',
          leftId: 'node-40',
          rightId: 'node-70',
        });

        setPlacementFeedback({
          type: 'info',
          message: `Root 50 deleted! An [EMPTY] slot remains at the Root with both subtrees intact. Identify the In-order Successor (min node in right subtree: 60) and drag it into the [EMPTY] root slot.`,
        });
        return;
      }
    }

    // Generic Deletion fallback
    const { newRoot } = deleteNodeWithCase(currentTree, targetVal);
    setCurrentTree(newRoot);
    setSelectedNodeForAction(null);
  };

  // Handle Replacement Drop in Level 4
  const handleReplacementDrop = (
    droppedValue: number,
    slot?: DropSlot,
    dropPos?: { x: number; y: number }
  ) => {
    if (challenge.level !== 4 || deletionPhase !== 'replace_slot' || !emptySlotInfo) return;

    const updatedAttempts = totalAttempts + 1;
    setTotalAttempts(updatedAttempts);

    if (droppedValue !== emptySlotInfo.expectedReplacement) {
      soundManager.playError();
      setTotalMistakes((prev) => prev + 1);
      setInvalidSlotId(emptySlotInfo.id);
      setTimeout(() => {
        setInvalidSlotId(null);
      }, 1200);

      setPlacementFeedback({
        type: 'error',
        message: `Incorrect replacement! Dropped ${droppedValue}. For ${currentLevel4Stage?.caseType}, you must replace with ${emptySlotInfo.expectedReplacement} (${
          deletionStageIndex === 1
            ? 'promote child 40'
            : 'in-order successor: minimum node in right subtree'
        }).`,
      });
      return;
    }

    // Correct replacement dropped!
    soundManager.playSuccess();
    const earnedPoints = 10;
    const updatedScores = { ...nodeScores, [emptySlotInfo.deletedValue]: earnedPoints };
    setNodeScores(updatedScores);
    const newCorrect = totalCorrect + 1;
    setTotalCorrect(newCorrect);

    if (deletionStageIndex === 1) {
      // Stage 2 completed: tree becomes [50, 40, 70, 60, 80]
      const newT = buildTreeFromValues([50, 40, 70, 60, 80]);
      setCurrentTree(newT);
      setDeletionPhase('select_node');
      setEmptySlotInfo(null);
      const nextStageIdx = 2;
      setDeletionStageIndex(nextStageIdx);
      const nextStage = challenge.deletionStages![nextStageIdx];

      setPlacementFeedback({
        type: 'success',
        message: `Stage 2 Complete: Child 40 promoted to replace deleted node 30! Next: ${nextStage.caseType} — Delete Root ${nextStage.targetNode}.`,
        pointsAwarded: earnedPoints,
      });
    } else if (deletionStageIndex === 2) {
      // Stage 3 completed: tree becomes [60, 40, 70, 80]
      const newT = buildTreeFromValues([60, 40, 70, 80]);
      setCurrentTree(newT);
      setDeletionPhase('select_node');
      setEmptySlotInfo(null);

      setPlacementFeedback({
        type: 'success',
        message: `Stage 3 Complete: Inorder Successor 60 placed in Root position! All 3 BST Deletion Cases Mastered!`,
        pointsAwarded: earnedPoints,
      });
      triggerChallengeSuccess(newCorrect, updatedAttempts, updatedScores);
    }
  };

  // Dustbin Drag & Drop Handlers
  const handleDustbinDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!isDustbinHovered) setIsDustbinHovered(true);
  };

  const handleDustbinDragLeave = () => {
    setIsDustbinHovered(false);
  };

  const handleDustbinDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDustbinHovered(false);
    const textData = e.dataTransfer.getData('text/plain');
    const val = parseInt(textData, 10);
    if (!isNaN(val)) {
      handleExecuteDeletion(val);
    } else if (selectedNodeForAction) {
      handleExecuteDeletion(selectedNodeForAction.value);
    }
  };

  // Hint Handler
  const handleUseHint = () => {
    soundManager.playClick();
    setHintsUsedCount((prev) => prev + 1);
    setHintLevel((prev) => (prev < 3 ? ((prev + 1) as any) : 1));
  };

  // Guided Solve Next Step Handler (Performs insertion, deletion, or traversal automatically)
  const handleGuidedSolveNextStep = () => {
    soundManager.playClick();
    const currentStepObj = activeGuidedSteps[guidedStepIndex];
    if (!currentStepObj) return;

    // LEVEL 4: DELETION CHALLENGE (6-step educational walkthrough showing empty slots and separate replacements)
    if (challenge.level === 4) {
      if (guidedStepIndex === 0) {
        // Step 0 -> Step 1: Leaf Deletion (Node 20)
        soundManager.playInsert();
        const targetVal = 20;
        const newTree = buildTreeFromValues([50, 30, 70, 40, 60, 80]);
        setCurrentTree(newTree);
        setSelectedNodeForAction(null);
        setDeletionPhase('select_node');
        setEmptySlotInfo(null);
        setDeletionStageIndex(1);

        const earnedPoints = 10;
        const updatedScores = { ...nodeScores, [targetVal]: earnedPoints };
        setNodeScores(updatedScores);
        const newCorrect = 1;
        const updatedAttempts = totalAttempts + 1;
        setTotalCorrect(newCorrect);
        setTotalAttempts(updatedAttempts);

        setPlacementFeedback({
          type: 'success',
          message: 'Guided Step 1: Deleted Leaf node 20! Parent 30 left pointer is now null. Next: Case 2 — Target Node 30.',
          pointsAwarded: earnedPoints,
        });

        setGuidedStepIndex(1);
        return;
      }

      if (guidedStepIndex === 1) {
        // Step 1 -> Step 2: Delete Node 30, reveal [EMPTY] vacancy with child 40 intact!
        soundManager.playInsert();
        const clone = JSON.parse(JSON.stringify(currentTree || buildTreeFromValues([50, 30, 70, 40, 60, 80]))) as BSTNode;
        if (clone.left && (clone.left.value === 30 || clone.left.id)) {
          const child40 = clone.left.right || { id: 'node-40', value: 40, left: null, right: null };
          clone.left = {
            id: 'empty-slot-30',
            value: -1,
            isEmptySlot: true,
            label: 'EMPTY',
            expectedReplacement: 40,
            left: null,
            right: child40,
          };
        }
        setCurrentTree(clone);
        setSelectedNodeForAction(null);
        setDeletionPhase('replace_slot');
        setEmptySlotInfo({
          id: 'empty-slot-30',
          deletedValue: 30,
          expectedReplacement: 40,
          parentId: 'node-50',
          direction: 'left',
          leftId: null,
          rightId: 'node-40',
        });
        setDeletionStageIndex(1);

        setPlacementFeedback({
          type: 'info',
          message: 'Node 30 deleted! Notice the [EMPTY] slot created where 30 was. Child 40 is ready for promotion. Click "Promote Child 40" to replace the empty slot.',
        });

        setGuidedStepIndex(2);
        return;
      }

      if (guidedStepIndex === 2) {
        // Step 2 -> Step 3: Promote child 40 into the empty slot!
        soundManager.playSuccess();
        const targetVal = 30;
        const newTree = buildTreeFromValues([50, 40, 70, 60, 80]);
        setCurrentTree(newTree);
        setSelectedNodeForAction(null);
        setDeletionPhase('select_node');
        setEmptySlotInfo(null);
        setDeletionStageIndex(2);

        const earnedPoints = 10;
        const updatedScores = { ...nodeScores, [targetVal]: earnedPoints };
        setNodeScores(updatedScores);
        const newCorrect = 2;
        const updatedAttempts = totalAttempts + 1;
        setTotalCorrect(newCorrect);
        setTotalAttempts(updatedAttempts);

        setPlacementFeedback({
          type: 'success',
          message: 'Stage 2 Complete: Child 40 promoted to replace deleted node 30! Next: Case 3 — Target Root 50.',
          pointsAwarded: earnedPoints,
        });

        setGuidedStepIndex(3);
        return;
      }

      if (guidedStepIndex === 3) {
        // Step 3 -> Step 4: Delete Root 50, reveal [EMPTY] vacancy at Root with subtrees intact!
        soundManager.playInsert();
        const clone = JSON.parse(JSON.stringify(currentTree || buildTreeFromValues([50, 40, 70, 60, 80]))) as BSTNode;
        const emptyRoot: BSTNode = {
          id: 'empty-slot-50',
          value: -1,
          isEmptySlot: true,
          label: 'EMPTY',
          expectedReplacement: 60,
          left: clone.left,
          right: clone.right,
        };
        setCurrentTree(emptyRoot);
        setSelectedNodeForAction(null);
        setDeletionPhase('replace_slot');
        setEmptySlotInfo({
          id: 'empty-slot-50',
          deletedValue: 50,
          expectedReplacement: 60,
          parentId: null,
          direction: 'root',
          leftId: 'node-40',
          rightId: 'node-70',
        });
        setDeletionStageIndex(2);

        setPlacementFeedback({
          type: 'info',
          message: 'Root 50 deleted! Notice the [EMPTY] root vacancy. Inorder Successor (minimum node in right subtree: 60) will replace the root.',
        });

        setGuidedStepIndex(4);
        return;
      }

      if (guidedStepIndex === 4) {
        // Step 4 -> Step 5: Replace Root with In-order Successor 60!
        soundManager.playSuccess();
        const targetVal = 50;
        const newTree = buildTreeFromValues([60, 40, 70, 80]);
        setCurrentTree(newTree);
        setSelectedNodeForAction(null);
        setDeletionPhase('select_node');
        setEmptySlotInfo(null);
        setDeletionStageIndex(2);

        const earnedPoints = 10;
        const updatedScores = { ...nodeScores, [targetVal]: earnedPoints };
        setNodeScores(updatedScores);
        const newCorrect = 3;
        const updatedAttempts = totalAttempts + 1;
        setTotalCorrect(newCorrect);
        setTotalAttempts(updatedAttempts);

        setPlacementFeedback({
          type: 'success',
          message: 'Stage 3 Complete: Inorder Successor 60 placed in Root position! All 3 BST Deletion Cases Mastered!',
          pointsAwarded: earnedPoints,
        });

        setGuidedStepIndex(5);
        return;
      }

      if (guidedStepIndex === 5) {
        // Step 5 -> Finish
        triggerChallengeSuccess(3, totalAttempts + 1, { ...nodeScores, [50]: 10 });
        return;
      }
    }

    // LEVEL 1, 2, 3: INSERTION CHALLENGES (Step-by-step teaching tool)
    if (challenge.level <= 3) {
      if (!currentGuidedStep) return;

      const dynamicStep = currentGuidedStep as DynamicGuidedStep;
      if (dynamicStep.isInsertAction && dynamicStep.valueToInsert !== undefined) {
        soundManager.playInsert();
        const targetSlot =
          availableDropSlots.find((s) => s.id === dynamicStep.slotToInsert?.id) || dynamicStep.slotToInsert;
        if (targetSlot) {
          handleSlotDropOrClick(targetSlot, dynamicStep.valueToInsert);
        }
        setGuidedStepIndex(0);
        return;
      }

      if (guidedStepIndex < activeGuidedSteps.length - 1) {
        setGuidedStepIndex((prev) => prev + 1);
      }
      return;
    }

    // LEVEL 5: TRAVERSAL CHALLENGE (Sequences selected & submitted automatically)
    if (challenge.level === 5) {
      soundManager.playSuccess();
      const currentMode = activeTraversalType;
      const expectedSeq = traversalExpectedMap[currentMode] || (currentTree ? getInorder(currentTree) : []);

      setSelectedTraversalNodes(expectedSeq);
      setTraversalSubmitted(true);

      const modeKey = currentMode === 'inorder' ? 1 : currentMode === 'preorder' ? 2 : 3;
      const updatedScores = { ...nodeScores, [modeKey]: 10 };
      setNodeScores(updatedScores);

      const newCompleted = { ...completedTraversals, [currentMode]: true };
      setCompletedTraversals(newCompleted);

      const newCorrect = Object.values(newCompleted).filter(Boolean).length;
      const updatedAttempts = totalAttempts + 1;
      setTotalCorrect(newCorrect);
      setTotalAttempts(updatedAttempts);

      setPlacementFeedback({
        type: 'success',
        message: `Guided Step ${guidedStepIndex + 1}: ${currentMode.toUpperCase()} sequence [${expectedSeq.join(' → ')}] submitted automatically!`,
        pointsAwarded: 10,
      });

      const allDone = newCompleted.inorder && newCompleted.preorder && newCompleted.postorder;
      if (allDone) {
        triggerChallengeSuccess(newCorrect, updatedAttempts, updatedScores);
      } else {
        // Switch to next uncompleted traversal mode
        if (!newCompleted.preorder) {
          setActiveTraversalType('preorder');
          setSelectedTraversalNodes([]);
          setTraversalSubmitted(false);
        } else if (!newCompleted.postorder) {
          setActiveTraversalType('postorder');
          setSelectedTraversalNodes([]);
          setTraversalSubmitted(false);
        }

        if (guidedStepIndex < challenge.guidedSolveSteps.length - 1) {
          setGuidedStepIndex((prev) => prev + 1);
        }
      }
    }
  };

  // Guided Solve Previous Step Handler (Safely restores prior step state)
  const handleGuidedSolvePrevStep = () => {
    soundManager.playClick();
    if (guidedStepIndex <= 0) return;
    const prevIdx = guidedStepIndex - 1;
    setGuidedStepIndex(prevIdx);

    if (challenge.level === 4) {
      if (prevIdx === 0) {
        setCurrentTree(buildTreeFromValues([50, 30, 70, 20, 40, 60, 80]));
        setDeletionStageIndex(0);
        setDeletionPhase('select_node');
        setEmptySlotInfo(null);
      } else if (prevIdx === 1) {
        setCurrentTree(buildTreeFromValues([50, 30, 70, 40, 60, 80]));
        setDeletionStageIndex(1);
        setDeletionPhase('select_node');
        setEmptySlotInfo(null);
      } else if (prevIdx === 2) {
        const clone = buildTreeFromValues([50, 30, 70, 40, 60, 80]);
        if (clone.left) {
          const child40 = clone.left.right || { id: 'node-40', value: 40, left: null, right: null };
          clone.left = {
            id: 'empty-slot-30',
            value: -1,
            isEmptySlot: true,
            label: 'EMPTY',
            expectedReplacement: 40,
            left: null,
            right: child40,
          };
        }
        setCurrentTree(clone);
        setDeletionStageIndex(1);
        setDeletionPhase('replace_slot');
        setEmptySlotInfo({
          id: 'empty-slot-30',
          deletedValue: 30,
          expectedReplacement: 40,
          parentId: 'node-50',
          direction: 'left',
          leftId: null,
          rightId: 'node-40',
        });
      } else if (prevIdx === 3) {
        setCurrentTree(buildTreeFromValues([50, 40, 70, 60, 80]));
        setDeletionStageIndex(2);
        setDeletionPhase('select_node');
        setEmptySlotInfo(null);
      } else if (prevIdx === 4) {
        const clone = buildTreeFromValues([50, 40, 70, 60, 80]);
        const emptyRoot: BSTNode = {
          id: 'empty-slot-50',
          value: -1,
          isEmptySlot: true,
          label: 'EMPTY',
          expectedReplacement: 60,
          left: clone.left,
          right: clone.right,
        };
        setCurrentTree(emptyRoot);
        setDeletionStageIndex(2);
        setDeletionPhase('replace_slot');
        setEmptySlotInfo({
          id: 'empty-slot-50',
          deletedValue: 50,
          expectedReplacement: 60,
          parentId: null,
          direction: 'root',
          leftId: 'node-40',
          rightId: 'node-70',
        });
      }
      return;
    }

    if (challenge.level <= 3) {
      return;
    }
  };

  return (
    <div id="game-page-root" className="w-full max-w-5xl mx-auto space-y-6 pb-12">
      {/* 1. TOP: Level Progression Track */}
      <LevelProgressTrack
        challenges={GAME_CHALLENGES}
        activeChallengeIndex={activeChallengeIndex}
        completedChallengeIds={stats.completedGameChallenges || []}
        onSelectLevel={(idx) => {
          soundManager.playClick();
          setActiveChallengeIndex(idx);
        }}
        onSelectChallenge={(idx) => {
          soundManager.playClick();
          setActiveChallengeIndex(idx);
        }}
      />

      {/* 2. Main BST Level Heading & Score / XP Metrics Bar (NO Team Selector) */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-indigo-100 dark:border-slate-800 shadow-sm shadow-indigo-500/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-full w-fit border border-indigo-200 dark:border-indigo-800">
            <Trophy className="w-3.5 h-3.5" />
            <span>LEVEL {challenge.level}</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            {challenge.title}
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            {challenge.subtitle}
          </p>
        </div>

        {/* Clean Score & XP Metrics (Re-aligned without Team selector) */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-mono shadow-2xs">
            <span className="text-slate-500 dark:text-slate-400">Score:</span>
            <span className="font-bold text-indigo-600 dark:text-indigo-400">
              {currentTotalScore}/{maxPossibleScore} pts
            </span>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-mono shadow-2xs">
            <span className="text-slate-500 dark:text-slate-400">XP:</span>
            <span className="font-bold text-amber-600 dark:text-amber-400">+{challenge.xp}</span>
          </div>
        </div>
      </div>

      {/* 3. Centered Main Game Arena: Challenge Instructions, Interactive Tree Workspace & Dustbin Zone */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Tree Canvas (8 cols on desktop) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-indigo-100 dark:border-slate-800 shadow-sm shadow-indigo-500/5 p-5 relative">
            {/* Canvas Sub-Header: Mission Prompt & Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  {challenge.level === 1 && 'Level 1 Mission: Basic BST Formation'}
                  {challenge.level === 2 && 'Level 2 Mission: BST Insertion Challenge'}
                  {challenge.level === 3 && 'Level 3 Mission: Advanced BST Formation (11 Nodes)'}
                  {challenge.level === 4 && `Level 4 Mission: BST Deletion (${currentLevel4Stage?.caseType || 'Mastery'})`}
                  {challenge.level === 5 && `Level 5 Mission: BST Traversals (${activeTraversalType.toUpperCase()})`}
                </span>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium mt-0.5">
                  {challenge.level === 1 && 'Drag numbers from the tray below and place each node using Left < Root < Right.'}
                  {challenge.level === 2 && (
                    <span>
                      👉 Current Target: Insert <strong className="text-indigo-600 dark:text-indigo-400 text-sm font-mono">{currentLevel2Target}</strong> into the BST. Follow comparison rules from Root 50.
                    </span>
                  )}
                  {challenge.level === 3 && 'Place each node from the sequence to build the multi-tier zigzag BST.'}
                  {challenge.level === 4 && (
                    <span>
                      👉 Target: Delete node <strong className="text-rose-600 dark:text-rose-400 font-mono text-sm">{currentLevel4Stage?.targetNode}</strong>. Drag it to the 🗑️ Dustbin zone!
                    </span>
                  )}
                  {challenge.level === 5 && (
                    <span>
                      👉 Click the nodes on the tree in exact <strong>{activeTraversalType.toUpperCase()}</strong> order (
                      {activeTraversalType === 'inorder' && 'Left → Root → Right'}
                      {activeTraversalType === 'preorder' && 'Root → Left → Right'}
                      {activeTraversalType === 'postorder' && 'Left → Right → Root'}
                      ).
                    </span>
                  )}
                </p>
              </div>

              {/* Action Buttons: Undo, Redo, Hint, Guided Solve, Reset */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  id="game-undo-btn"
                  onClick={handleUndo}
                  disabled={undoStack.length === 0}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-colors shadow-2xs ${
                    undoStack.length > 0
                      ? 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 cursor-pointer'
                      : 'opacity-40 cursor-not-allowed bg-slate-50 dark:bg-slate-800/40 text-slate-400 border-slate-200 dark:border-slate-800'
                  }`}
                  title="Undo last insertion"
                >
                  <Undo2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Undo</span>
                </button>

                <button
                  id="game-redo-btn"
                  onClick={handleRedo}
                  disabled={redoStack.length === 0}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-colors shadow-2xs ${
                    redoStack.length > 0
                      ? 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 cursor-pointer'
                      : 'opacity-40 cursor-not-allowed bg-slate-50 dark:bg-slate-800/40 text-slate-400 border-slate-200 dark:border-slate-800'
                  }`}
                  title="Redo insertion"
                >
                  <Redo2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Redo</span>
                </button>

                <button
                  id="game-hint-btn"
                  onClick={handleUseHint}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 transition-colors cursor-pointer shadow-2xs"
                  title="Need a hint?"
                >
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                  <span>Hint {hintLevel > 0 ? `(${hintLevel}/3)` : ''}</span>
                </button>

                <button
                  id="game-guided-solve-btn"
                  onClick={() => setShowGuidedSolve(!showGuidedSolve)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer shadow-2xs ${
                    showGuidedSolve
                      ? 'bg-indigo-600 text-white border-indigo-700'
                      : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                  title="Toggle Guided Solve (Automatic step-by-step solver)"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>{showGuidedSolve ? 'Stop Guided' : 'Guided Solve'}</span>
                </button>

                <button
                  id="game-reset-btn"
                  onClick={() => resetChallenge(challenge)}
                  className="p-1.5 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Reset challenge"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Level 5 Traversal Mode Selector Tabs */}
            {challenge.level === 5 && (
              <div className="mt-3 flex flex-wrap items-center gap-2 pb-2">
                {(['inorder', 'preorder', 'postorder'] as TraversalType[]).map((tType) => {
                  const isActive = activeTraversalType === tType;
                  const isDone = completedTraversals[tType];

                  return (
                    <button
                      key={tType}
                      id={`game-traversal-tab-${tType}`}
                      onClick={() => handleSwitchTraversal(tType)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                        isActive
                          ? 'bg-indigo-600 text-white ring-2 ring-indigo-400 shadow-md'
                          : isDone
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 text-emerald-800 dark:text-emerald-200'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      <span>{tType.charAt(0).toUpperCase() + tType.slice(1)}</span>
                      {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Hint Display Banner */}
            <AnimatePresence>
              {hintLevel > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2"
                >
                  <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-semibold">
                      {hintLevel === 1 && `Hint Tier 1: ${challenge.hints.tier1}`}
                      {hintLevel === 2 && `Hint Tier 2: ${challenge.hints.tier2}`}
                      {hintLevel === 3 && `Hint Tier 3: ${challenge.hints.tier3}`}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Top Queue Tray: Element Queue for Levels 1, 2, 3 */}
            {(challenge.numbersToInsert || []).length > 0 && (
              <div id="elements-top-tray" className="mt-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Queue ({challenge.numbersToInsert?.length || 0} total)</span>
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-800">
                      Step {challenge.numbersToInsert ? challenge.numbersToInsert.length - remainingTrayNumbers.length + 1 : 1} of {totalStepsInChallenge}
                    </span>
                  </div>
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    {nextNumberToInsert !== null ? (
                      <span>Next: <strong className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">{nextNumberToInsert}</strong></span>
                    ) : (
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 inline" /> All Placed!
                      </span>
                    )}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 min-h-12">
                  {challenge.numbersToInsert?.map((num, idx) => {
                    const isPlaced = !remainingTrayNumbers.includes(num);
                    const isNextTarget = remainingTrayNumbers[0] === num;
                    const isSelected = selectedDragNumber === num;

                    if (isPlaced) {
                      return (
                        <div
                          key={`queue-chip-${num}-${idx}`}
                          id={`tray-element-${num}`}
                          className="px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 flex items-center gap-1.5 opacity-85 select-none"
                          title={`Node ${num} has been placed`}
                        >
                          <span>{num}</span>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        </div>
                      );
                    }

                    if (isNextTarget) {
                      return (
                        <motion.button
                          key={`queue-chip-${num}-${idx}`}
                          id={`tray-element-${num}`}
                          layout
                          draggable
                          onDragStart={(e: any) => handleChipDragStart(e, num)}
                          onDragEnd={handleChipDragEnd}
                          onPointerDown={(e: any) => handleChipPointerDown(e, num)}
                          className={`relative px-4 py-2 rounded-xl font-mono text-sm font-black transition-all flex items-center gap-2 cursor-grab active:cursor-grabbing select-none shadow-md ${
                            isSelected
                              ? 'bg-indigo-600 text-white ring-2 ring-indigo-400 scale-105'
                              : 'bg-indigo-600 text-white ring-2 ring-indigo-300 dark:ring-indigo-700 hover:scale-105'
                          }`}
                          title={`Drag node ${num} into the tree`}
                        >
                          <span>{num}</span>
                          <span className="text-[9px] uppercase tracking-wider bg-white/20 text-white px-1.5 py-0.5 rounded font-sans font-bold">
                            Drag
                          </span>
                        </motion.button>
                      );
                    }

                    return (
                      <div
                        key={`queue-chip-${num}-${idx}`}
                        id={`tray-element-${num}`}
                        className="px-3.5 py-1.5 rounded-xl font-mono text-xs font-semibold bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-800 flex items-center gap-1.5 opacity-70 select-none cursor-not-allowed"
                        title={`Node ${num} is queued after node ${remainingTrayNumbers[0]}`}
                      >
                        <span>{num}</span>
                        <span className="text-[9px] uppercase tracking-wider text-slate-400">Wait</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Dedicated Pedagogical Guide / Teacher Panel (AVL Guardian Style) */}
            <div className="mt-3">
              {showGuidedSolve && currentGuidedStep ? (
                <div className="p-3.5 rounded-2xl border bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800/60 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-600 text-white font-sans">
                        Guided Step {guidedStepIndex + 1} of {activeGuidedSteps.length || 1}
                      </span>
                      <h4 className="text-xs font-bold text-indigo-950 dark:text-indigo-100">
                        {currentGuidedStep.title}
                      </h4>
                    </div>

                    <button
                      onClick={() => {
                        soundManager.playClick();
                        setShowGuidedSolve(false);
                        setGuidedStepIndex(0);
                        setPlacementFeedback({
                          type: 'info',
                          message: 'Exited Guided Solve. Tree preserved — continue inserting nodes manually!',
                        });
                      }}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 cursor-pointer font-bold"
                      title="Turn off Guided Solve"
                    >
                      Turn Off Guided Solve
                    </button>
                  </div>

                  <p className="text-xs leading-relaxed text-indigo-900 dark:text-indigo-200">
                    {currentGuidedStep.actionDescription}
                  </p>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={handleGuidedSolvePrevStep}
                      disabled={guidedStepIndex === 0}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        guidedStepIndex === 0
                          ? 'opacity-40 cursor-not-allowed bg-white/40 text-slate-400 border-slate-200'
                          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 hover:bg-slate-50 cursor-pointer'
                      }`}
                    >
                      ← Prev Step
                    </button>

                    <button
                      onClick={handleGuidedSolveNextStep}
                      className="px-4 py-1.5 rounded-xl text-xs font-extrabold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>
                        {'isInsertAction' in currentGuidedStep && (currentGuidedStep as DynamicGuidedStep).isInsertAction
                          ? `Insert Node ${(currentGuidedStep as DynamicGuidedStep).valueToInsert} →`
                          : 'Next Step →'}
                      </span>
                    </button>
                  </div>
                </div>
              ) : placementFeedback ? (
                <div
                  className={`p-3.5 rounded-2xl border shadow-2xs space-y-1 transition-all ${
                    placementFeedback.type === 'error'
                      ? 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60'
                      : placementFeedback.type === 'success'
                      ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60'
                      : 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider font-sans text-white ${
                          placementFeedback.type === 'error'
                            ? 'bg-rose-600'
                            : placementFeedback.type === 'success'
                            ? 'bg-emerald-600'
                            : 'bg-indigo-600'
                        }`}
                      >
                        {placementFeedback.type === 'error'
                          ? 'Try Again'
                          : placementFeedback.type === 'success'
                          ? 'Placed ✓'
                          : 'Guide'}
                      </span>
                      <h4
                        className={`text-xs font-bold ${
                          placementFeedback.type === 'error'
                            ? 'text-rose-950 dark:text-rose-100'
                            : placementFeedback.type === 'success'
                            ? 'text-emerald-950 dark:text-emerald-100'
                            : 'text-indigo-950 dark:text-indigo-100'
                        }`}
                      >
                        {placementFeedback.type === 'error'
                          ? 'Incorrect Position'
                          : placementFeedback.type === 'success'
                          ? 'Correct Placement!'
                          : 'BST Comparison Guide'}
                      </h4>
                    </div>

                    {placementFeedback.pointsAwarded && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-mono font-bold text-[10px]">
                        +{placementFeedback.pointsAwarded} pts
                      </span>
                    )}
                  </div>

                  <p
                    className={`text-xs leading-relaxed ${
                      placementFeedback.type === 'error'
                        ? 'text-rose-900 dark:text-rose-200'
                        : placementFeedback.type === 'success'
                        ? 'text-emerald-900 dark:text-emerald-200'
                        : 'text-indigo-900 dark:text-indigo-200'
                    }`}
                  >
                    {placementFeedback.message}
                  </p>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl border bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60 shadow-2xs space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-slate-700 text-white font-sans">
                      Guide
                    </span>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {nextNumberToInsert !== null
                        ? `Ready to insert node ${nextNumberToInsert}`
                        : 'Level Completed!'}
                    </h4>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                    {challenge.level <= 3
                      ? `Drag active node chip ${nextNumberToInsert} from the queue above onto the correct empty slot in the tree. Follow BST comparison: smaller values go LEFT, larger values go RIGHT.`
                      : challenge.level === 4
                      ? `Drag target node ${currentLevel4Stage?.targetNode} into the 🗑️ Dustbin below to execute deletion.`
                      : `Click nodes on the tree in exact ${activeTraversalType.toUpperCase()} order, then click Submit Answer.`}
                  </p>
                </div>
              )}
            </div>

            {/* Interactive Tree SVG Canvas */}
            <div className="relative mt-4">
              <TreeCanvas
                root={currentTree}
                slots={challenge.level === 4 || challenge.level === 5 ? [] : availableDropSlots}
                emptySlot={
                  challenge.level === 4 && deletionPhase === 'replace_slot' && emptySlotInfo
                    ? {
                        id: emptySlotInfo.id,
                        label: 'EMPTY',
                        parentId: emptySlotInfo.parentId,
                        direction: emptySlotInfo.direction,
                        leftId: emptySlotInfo.leftId,
                        rightId: emptySlotInfo.rightId,
                      }
                    : null
                }
                selectedDragValue={selectedDragNumber}
                selectedNodeId={
                  challenge.level === 5
                    ? null
                    : selectedNodeForAction?.id
                }
                highlightedNodeIds={
                  challenge.level === 5
                    ? selectedTraversalNodes.map((v) => `node-${v}`)
                    : []
                }
                highlightedValues={
                  challenge.level === 5
                    ? selectedTraversalNodes
                    : []
                }
                invalidSlotId={invalidSlotId}
                activeHoveredSlotId={hoveredDropSlotId}
                comparingNodeId={
                  showGuidedSolve && currentGuidedStep && 'comparingNodeId' in currentGuidedStep
                    ? (currentGuidedStep as DynamicGuidedStep).comparingNodeId
                    : null
                }
                guidedCorrectSlotId={
                  showGuidedSolve && currentGuidedStep && 'guidedSlotId' in currentGuidedStep
                    ? (currentGuidedStep as DynamicGuidedStep).guidedSlotId
                    : null
                }
                comparisonBanner={
                  showGuidedSolve && currentGuidedStep && 'banner' in currentGuidedStep
                    ? (currentGuidedStep as DynamicGuidedStep).banner
                    : undefined
                }
                onSlotClick={(slot) => {
                  soundManager.playClick();
                  if (challenge.level === 4 && deletionPhase === 'replace_slot') {
                    setPlacementFeedback({
                      type: 'info',
                      message: 'Drag the replacement node from the tree into the [EMPTY] slot to place it (nodes must be dragged).',
                    });
                  } else {
                    setPlacementFeedback({
                      type: 'info',
                      message: selectedDragNumber !== null
                        ? `Drag node ${selectedDragNumber} and drop it directly onto this target slot to place it!`
                        : 'Drag the active node chip from the queue and drop it directly onto this target slot to place it!',
                    });
                  }
                }}
                onSlotDrop={(slot, val, dropCoordinates) => {
                  if (challenge.level === 4 && deletionPhase === 'replace_slot') {
                    handleReplacementDrop(val, slot, dropCoordinates);
                  } else {
                    handleSlotDropOrClick(slot, val, dropCoordinates);
                  }
                }}
                onNodeClick={handleNodeClick}
                onNodePointerDown={(e, node) => {
                  if (challenge.level === 4) {
                    setSelectedNodeForAction(node);
                    handleChipPointerDown(e, node.value);
                  }
                }}
                onNodeDragStart={(node) => {
                  setSelectedNodeForAction(node);
                }}
                height={380}
                emptyMessage={
                  challenge.category === 'build_tree'
                    ? 'Tree is currently empty. Drag the first number (Root) from the queue above into the central root slot.'
                    : 'Interactive BST Canvas'
                }
              />

              {/* Feedback Toast Overlay */}
              <AnimatePresence>
                {placementFeedback && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className={`absolute bottom-3 left-3 right-3 p-3 rounded-xl border shadow-lg text-xs flex items-center justify-between gap-2 z-20 ${
                      placementFeedback.type === 'success'
                        ? 'bg-emerald-50 dark:bg-emerald-950/90 border-emerald-300 dark:border-emerald-700 text-emerald-950 dark:text-emerald-200'
                        : placementFeedback.type === 'error'
                        ? 'bg-rose-50 dark:bg-rose-950/90 border-rose-300 dark:border-rose-700 text-rose-950 dark:text-rose-200'
                        : 'bg-indigo-50 dark:bg-indigo-950/90 border-indigo-300 dark:border-indigo-700 text-indigo-950 dark:text-indigo-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {placementFeedback.type === 'success' && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      )}
                      {placementFeedback.type === 'error' && (
                        <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                      )}
                      {placementFeedback.type === 'info' && (
                        <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                      )}
                      <span className="font-medium">{placementFeedback.message}</span>
                    </div>

                    {placementFeedback.pointsAwarded && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-mono font-bold text-[10px] shrink-0">
                        +{placementFeedback.pointsAwarded} pts
                      </span>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Level 4: Replacement Candidates Tray (Draggable when replacement is required) */}
            {challenge.level === 4 && deletionPhase === 'replace_slot' && emptySlotInfo && (
              <div id="replacement-candidates-tray" className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span>Replacement Candidates (Drag & Drop into [EMPTY] vacancy)</span>
                  </span>
                  <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400">
                    {deletionStageIndex === 1
                      ? 'Drag child node 40 into the [EMPTY] slot'
                      : 'Drag in-order successor 60 into the [EMPTY] slot'}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 min-h-14">
                  {(deletionStageIndex === 1 ? [40] : [40, 60, 70, 80]).map((num) => {
                    const isSelected = selectedDragNumber === num;
                    return (
                      <motion.button
                        key={`repl-${num}`}
                        id={`tray-element-${num}`}
                        layout
                        draggable
                        onDragStart={(e: any) => handleChipDragStart(e, num)}
                        onDragEnd={handleChipDragEnd}
                        onPointerDown={(e: any) => handleChipPointerDown(e, num)}
                        className={`relative px-4 py-2 rounded-xl font-mono text-sm font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-grab active:cursor-grabbing ${
                          isSelected
                            ? 'bg-amber-600 text-white ring-2 ring-amber-400 scale-105 shadow-md'
                            : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-amber-300 dark:border-amber-700 hover:border-amber-500 hover:scale-105'
                        }`}
                      >
                        <span>{num}</span>
                        {num === emptySlotInfo.expectedReplacement && (
                          <span className="text-[9px] uppercase tracking-wider bg-amber-600 text-white px-1.5 py-0.2 rounded font-sans">
                            Candidate
                          </span>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            )}
            {challenge.level === 5 && (
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <ListOrdered className="w-3.5 h-3.5 text-indigo-500" />
                    <span>
                      {activeTraversalType.toUpperCase()} Selection ({selectedTraversalNodes.length}/7 Selected)
                    </span>
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Click nodes in order, then click Submit
                  </span>
                </div>

                <div className="flex flex-col gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 min-h-14">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Your Order:</span>
                    {selectedTraversalNodes.length === 0 && (
                      <span className="text-xs text-slate-400 italic">
                        Click the tree nodes above in {activeTraversalType.toUpperCase()} order to record your sequence.
                      </span>
                    )}
                  </div>
                  {selectedTraversalNodes.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {selectedTraversalNodes.map((val, idx) => (
                        <div key={idx} className="flex items-center gap-1.5">
                          <span
                            className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-mono text-xs font-bold shadow-xs animate-in fade-in zoom-in-90 flex items-center gap-1"
                          >
                            <span className="text-[10px] text-indigo-200">#{idx + 1}</span>
                            <span>{val}</span>
                          </span>
                          {idx < selectedTraversalNodes.length - 1 && (
                            <span className="text-xs font-bold text-indigo-500 dark:text-indigo-400">→</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Traversal Action Buttons (Submit Answer & Reset Selection) */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    id="submit-traversal-answer-btn"
                    onClick={handleSubmitTraversal}
                    disabled={selectedTraversalNodes.length === 0}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Answer</span>
                  </button>

                  <button
                    id="reset-traversal-selection-btn"
                    onClick={handleResetTraversalSelection}
                    className="py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-98 shadow-xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                    <span>Reset Selection</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Mission Objectives, Deletion Dustbin Zone & Step Guides (4 cols on desktop) */}
        <div className="lg:col-span-4 space-y-4">
          {/* 🗑️ DUSTBIN / DELETE DROP ZONE (Active for Level 4) */}
          {challenge.level === 4 && (
            <div
              id="game-dustbin-dropzone"
              onDragOver={handleDustbinDragOver}
              onDragLeave={handleDustbinDragLeave}
              onDrop={handleDustbinDrop}
              onClick={() => {
                if (selectedNodeForAction) {
                  handleExecuteDeletion(selectedNodeForAction.value);
                }
              }}
              className={`p-5 rounded-2xl border-2 border-dashed transition-colors cursor-pointer text-center relative overflow-hidden group ${
                isDustbinHovered
                  ? 'bg-rose-100 dark:bg-rose-950/80 border-rose-500 shadow-lg ring-2 ring-rose-400'
                  : selectedNodeForAction
                  ? 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-400'
                  : 'bg-slate-50 dark:bg-slate-900 border-indigo-300 dark:border-slate-700 hover:border-rose-400'
              }`}
            >
              <div className="flex flex-col items-center justify-center space-y-2">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                    isDustbinHovered || selectedNodeForAction
                      ? 'bg-rose-600 text-white'
                      : 'bg-indigo-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400'
                  }`}
                >
                  <Trash2 className="w-6 h-6" />
                </div>

                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                    🗑️ BST Dustbin / Delete Zone
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                    {selectedNodeForAction
                      ? `Selected: Node ${selectedNodeForAction.value} — Click or drop here to Delete!`
                      : 'Drag any node from the tree and drop it here to delete.'}
                  </p>
                </div>

                {/* Target node indicator badge */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold font-mono bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-200 border border-rose-300 dark:border-rose-800">
                  <span>Target Node:</span>
                  <span className="font-extrabold">{currentLevel4Stage?.targetNode}</span>
                </div>
              </div>
            </div>
          )}

          {/* Level 4: 3-Stage Progress Indicator */}
          {challenge.level === 4 && challenge.deletionStages && (
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-indigo-100 dark:border-slate-800 shadow-sm shadow-indigo-500/5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Deletion Mastery Stages (3 Cases)
                </span>
                <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                  {deletionStageIndex + 1}/3
                </span>
              </div>

              <div className="space-y-2">
                {challenge.deletionStages.map((stage, idx) => {
                  const isDone = idx < deletionStageIndex;
                  const isCurrent = idx === deletionStageIndex;

                  return (
                    <div
                      key={stage.caseType}
                      className={`p-3 rounded-xl border text-xs transition-all ${
                        isDone
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-200'
                          : isCurrent
                          ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-300 dark:border-indigo-700 text-indigo-950 dark:text-indigo-200 shadow-2xs font-semibold'
                          : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold">{stage.caseType}</span>
                        {isDone && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                        {isCurrent && (
                          <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-indigo-600 text-white font-mono">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">
                        {stage.explanation}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Level 5: 3 Traversal Modes Overview */}
          {challenge.level === 5 && (
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-indigo-100 dark:border-slate-800 shadow-sm shadow-indigo-500/5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  BST Traversal Rules
                </span>
                <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                  {Object.values(completedTraversals).filter(Boolean).length}/3 Done
                </span>
              </div>

              <div className="space-y-2">
                {[
                  {
                    type: 'inorder',
                    title: 'Inorder (L → Root → R)',
                    desc: 'Traverse Left Subtree → Visit Root → Traverse Right Subtree (yields ascending numerical order).',
                  },
                  {
                    type: 'preorder',
                    title: 'Preorder (Root → L → R)',
                    desc: 'Visit Root first → Traverse Left Subtree → Traverse Right Subtree (ideal for cloning trees).',
                  },
                  {
                    type: 'postorder',
                    title: 'Postorder (L → R → Root)',
                    desc: 'Traverse Left Subtree → Traverse Right Subtree → Visit Root last (ideal for bottom-up cleanup).',
                  },
                ].map((item) => {
                  const isDone = completedTraversals[item.type as TraversalType];
                  const isCurrent = activeTraversalType === item.type;

                  return (
                    <div
                      key={item.type}
                      onClick={() => handleSwitchTraversal(item.type as TraversalType)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                        isDone
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-200'
                          : isCurrent
                          ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-300 dark:border-indigo-700 text-indigo-950 dark:text-indigo-200 shadow-2xs font-semibold'
                          : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-400 hover:border-slate-400'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold">{item.title}</span>
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : isCurrent ? (
                          <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-indigo-600 text-white font-mono">
                            Active
                          </span>
                        ) : null}
                      </div>
                      <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">{item.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Guided Solve Step Walkthrough (Toggleable) */}
          <AnimatePresence>
            {showGuidedSolve && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-indigo-200 dark:border-slate-800 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900 dark:text-indigo-200">
                    <Compass className="w-4 h-4 text-indigo-600" />
                    <span>Guided Solve Mode</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-500">
                      Step {guidedStepIndex + 1} of {activeGuidedSteps.length || 1}
                    </span>
                    <button
                      onClick={() => {
                        soundManager.playClick();
                        setShowGuidedSolve(false);
                        setGuidedStepIndex(0);
                      }}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 cursor-pointer font-medium"
                      title="Exit Guided Solve"
                    >
                      Exit
                    </button>
                  </div>
                </div>

                {currentGuidedStep && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5 text-xs">
                    <h5 className="font-bold text-slate-900 dark:text-slate-100 flex items-center justify-between">
                      <span>{currentGuidedStep.title}</span>
                      {('guidedSlotId' in currentGuidedStep && (currentGuidedStep as DynamicGuidedStep).guidedSlotId) && (
                        <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded font-sans font-semibold">
                          Target Found ✓
                        </span>
                      )}
                    </h5>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      {currentGuidedStep.actionDescription}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1">
                  <button
                    id="guided-solve-prev-btn"
                    disabled={guidedStepIndex === 0}
                    onClick={handleGuidedSolvePrevStep}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 cursor-pointer transition-colors hover:bg-slate-200 dark:hover:bg-slate-700"
                  >
                    ← Prev
                  </button>
                  <button
                    id="guided-solve-next-btn"
                    onClick={handleGuidedSolveNextStep}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer shadow-xs active:scale-95 transition-all flex items-center gap-1.5"
                  >
                    <span>
                      {challenge.level <= 3
                        ? (currentGuidedStep as DynamicGuidedStep)?.isInsertAction
                          ? `Insert Node ${(currentGuidedStep as DynamicGuidedStep)?.valueToInsert} →`
                          : 'Next Step →'
                        : challenge.level === 4 && (currentGuidedStep as any)?.buttonLabel
                        ? (currentGuidedStep as any).buttonLabel
                        : guidedStepIndex >= activeGuidedSteps.length - 1
                        ? 'Complete Solve (Auto) ✓'
                        : 'Next Step (Auto) →'}
                    </span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Level Complete Trophy Modal Card */}
          <AnimatePresence>
            {isChallengeComplete && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 p-5 rounded-2xl shadow-md space-y-4 text-center"
              >
                <div className="w-12 h-12 mx-auto rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg">
                  <Trophy className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-base font-black text-emerald-950 dark:text-emerald-100">
                    Level {challenge.level} Mastered!
                  </h4>
                  <p className="text-xs text-emerald-800 dark:text-emerald-300 mt-1">
                    Score: {currentTotalScore}/{maxPossibleScore} pts • Accuracy: {accuracyPercent}% • +{challenge.xp} XP earned!
                  </p>
                </div>

                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => resetChallenge(challenge)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    Replay
                  </button>
                  {activeChallengeIndex < GAME_CHALLENGES.length - 1 && (
                    <button
                      onClick={() => {
                        soundManager.playClick();
                        setActiveChallengeIndex((prev) => prev + 1);
                      }}
                      className="px-4 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <span>Next Level</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Floating Drag Avatar for Universal Pointer Drag */}
      {pointerDrag?.isDragging && (
        <div
          className="fixed pointer-events-none z-50 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-12 h-12 rounded-full bg-indigo-600 text-white font-mono font-bold text-base shadow-2xl border-2 border-white ring-4 ring-indigo-400/70 select-none"
          style={{ left: pointerDrag.x, top: pointerDrag.y }}
        >
          {pointerDrag.value}
        </div>
      )}
    </div>
  );
};
