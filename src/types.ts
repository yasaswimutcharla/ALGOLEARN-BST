export interface BSTNode {
  id: string;
  value: number;
  left?: BSTNode | null;
  right?: BSTNode | null;
  x?: number;
  y?: number;
  highlight?: 'default' | 'active' | 'found' | 'target' | 'visited' | 'invalid' | 'comparing' | 'success' | 'selected' | 'successor' | 'child-replace';
  isEmptySlot?: boolean;
  label?: string;
  expectedReplacement?: number;
}

export type TraversalType = 'inorder' | 'preorder' | 'postorder' | 'levelorder';

export interface DropSlot {
  id: string;
  parentId: string | null;
  direction: 'root' | 'left' | 'right';
  x: number;
  y: number;
  parentValue?: number;
  expectedValue?: number;
}

export interface SlotValidationResult {
  isValid: boolean;
  explanation: string;
  expectedDirection?: 'left' | 'right' | 'root';
  expectedParentValue?: number;
  comparisonRule?: string;
  correctSlot?: {
    parentId: string | null;
    direction: 'left' | 'right' | 'root';
    parentValue?: number;
  };
}

export interface TraversalStep {
  nodeId: string;
  value: number;
  type: 'visit' | 'compare' | 'found' | 'backtrack';
  description: string;
  visitedNodesSoFar: number[];
}

export interface AnimationStep {
  stepNumber: number;
  totalSteps: number;
  treeValues: number[];
  comparingValue?: number | null;
  activeNodeId?: string | null;
  highlightedNodeIds?: string[];
  correctNodeIds?: string[];
  invalidNodeIds?: string[];
  dropSlots?: DropSlot[];
  nodeLabels?: Record<string, string>;
  comparisonBanner?: {
    text: string;
    subtext?: string;
    direction?: 'LEFT' | 'RIGHT' | 'EQUAL' | 'FOUND' | 'REPLACE' | 'DELETE' | 'INSERT' | 'INFO';
  };
  title: string;
  explanation: string;
  codeSnippet?: string;
}

export interface LessonModule {
  id: string;
  number: number;
  title: string;
  shortTitle: string;
  tagline: string;
  icon: string;
  xpReward: number;
  category?: 'basics' | 'operations' | 'deletion' | 'traversal' | 'advanced';
  definition: string;
  keyConcept: string;
  whyItMatters: string;
  bulletPoints: string[];
  visualExample: {
    treeValues: number[];
    highlightValue?: number;
    caption: string;
    nodeLabels?: Record<string, string>;
  };
  howItWorksSteps: string[];
  animationSteps?: AnimationStep[];
  tryIt: {
    instruction: string;
    question: string;
    type: 'drag-drop-slot' | 'click-node' | 'select-option' | 'delete-node' | 'choose-path';
    draggableValue?: number;
    targetSlotDirection?: 'root' | 'left' | 'right';
    targetParentValue?: number;
    treeValues: number[];
    options?: string[];
    correctAnswer: string | number;
    hint: string;
    guidedSolve: string[];
    successMessage: string;
    explanationOnWrong?: string;
  };
}

export interface TreeComparisonResult {
  isMatch?: boolean;
  isCorrect: boolean;
  isValidBST: boolean;
  matchedCount: number;
  totalExpected: number;
  errorMessage?: string;
  errors: {
    nodeValue: number;
    type: 'wrong_parent' | 'wrong_subtree' | 'invalid_bst' | 'missing' | 'extra';
    message: string;
    suggestedAction: string;
  }[];
  incorrectNodeIds: string[];
  correctNodeIds: string[];
}

export type GameChallengeCategory =
  | 'build_tree'
  | 'insert_sequence'
  | 'search_value'
  | 'delete_leaf'
  | 'delete_one_child'
  | 'delete_two_children'
  | 'find_successor'
  | 'find_predecessor'
  | 'traversal_sequence'
  | 'traversal'
  | 'fix_bst'
  | 'multi_operation';

export interface DeletionStage {
  caseType: 'Case 1 (Leaf Node)' | 'Case 2 (One Child)' | 'Case 3 (Two Children)';
  targetNode: number;
  explanation: string;
  ruleSummary: string;
}

export interface GameChallenge {
  id: string;
  level: number;
  category: GameChallengeCategory;
  title: string;
  subtitle: string;
  description: string;
  numbersToInsert?: number[];
  initialTreeValues?: number[];
  targetValue?: number;
  targetNodeToDelete?: number;
  deletionStages?: DeletionStage[];
  expectedTreeValues?: number[];
  traversalType?: TraversalType;
  hints: {
    tier1: string; // Conceptual hint
    tier2: string; // Comparison hint
    tier3: string; // Exact branch / answer hint
  };
  guidedSolveSteps: {
    stepNumber: number;
    title: string;
    actionDescription: string;
    currentTreeValues: number[];
    activeValue?: number;
    highlightPath?: number[];
  }[];
  xp: number;
}

export interface PracticeChallenge {
  id: string;
  title: string;
  category: 'build' | 'validate' | 'traversal' | 'search' | 'delete' | 'successor';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  description: string;
  taskGoal: string;
  initialTreeValues: number[];
  targetValue?: number;
  traversalRequired?: TraversalType;
  options?: { id: string; label: string; isCorrect: boolean; feedback: string }[];
  hint: string;
  guidedSteps?: string[];
  xp: number;
}

export interface QuizQuestion {
  id: string;
  code?: string;
  question: string;
  visualTreeValues?: number[];
  highlightNode?: number;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topicTag?: string;
  relatedLessonIndex?: number;
  relatedLessonTitle?: string;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  xpBonus: number;
}

export interface UserStats {
  xp: number;
  level: number;
  streak: number;
  lastActiveDate: string;
  completedLessons: string[];
  completedPractice: string[];
  completedGameChallenges: string[];
  quizScores: { [quizId: string]: number };
  unlockedBadges: string[];
  userName: string;
  skillMastery: {
    basics: number;
    insertion: number;
    searching: number;
    leafDeletion: number;
    oneChildDeletion: number;
    twoChildDeletion: number;
    successor: number;
    predecessor: number;
    traversals: number;
    heightDepth: number;
    complexity: number;
  };
  teamGameRecords?: Record<string, TeamGameRecord[]>;
}

export interface TeamGameRecord {
  teamName: string;
  challengeId: string;
  level: number;
  score: number;
  maxScore: number;
  correctNodes: number;
  totalNodes: number;
  mistakes: number;
  totalAttempts: number;
  accuracy: number;
  hintsUsed: number;
  completedAt: string;
}

