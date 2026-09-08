export type BannerDirection = 'LEFT' | 'RIGHT' | 'FOUND' | 'NOT_FOUND' | 'INFO' | 'SUCCESS' | 'DELETE' | 'REWIRE' | 'EQUAL' | 'WARNING';

export interface StepPrediction {
  question: string;
  options: string[];
  correctIndex: number;
  hint: string;
  explanation: string;
}

export interface AnimationNodeInfo {
  id: string;
  value: number;
  x: number;
  y: number;
  leftId?: string;
  rightId?: string;
  parentId?: string;
  state?: 'default' | 'active' | 'dimmed' | 'found' | 'target' | 'successor' | 'child-replace' | 'deleted' | 'inserted' | 'highlight' | 'warning';
  badge?: string;
  label?: string;
  showNullLeft?: boolean;
  showNullRight?: boolean;
}

export interface AnimationEdgeInfo {
  fromId: string;
  toId: string;
  state?: 'default' | 'active' | 'severed' | 'rewired' | 'dimmed' | 'successor';
  label?: string;
}

export interface VisualStepData {
  stepIndex: number;
  title: string;
  shortSentence?: string; // ONE short simple sentence for the algorithm step
  currentStep: string;
  whatNext: string;
  why: string;
  // Algorithmic Analysis 5-Step Model
  given?: string; // Step 1: What are we given?
  check?: string; // Step 2: What do we check?
  decision?: string; // Step 3: What decision do we make?
  action?: string; // Step 4: What happens to the tree?
  result?: string; // Step 5: What is the final result?
  algorithmStage?: 'INPUT' | 'COMPARE' | 'DECISION' | 'ACTION' | 'TREE_UPDATE' | 'RESULT';
  comparisonFormula?: string;
  guidedHints?: string[]; // Progressive hint levels for Guided Solve
  banner?: {
    text: string;
    subtext?: string;
    type: BannerDirection;
  };
  prediction?: StepPrediction;
  nodes: AnimationNodeInfo[];
  edges: AnimationEdgeInfo[];
  traversalOutput?: number[];
  extraVisual?: 'bracket-height' | 'balanced-comparison' | 'complexity-halving' | 'inorder-box' | 'preorder-box' | 'postorder-box';
}

export interface TopicAnimationData {
  topicNumber: number;
  topicTitle: string;
  shortTitle: string;
  rule?: string; // e.g. "Left < Root < Right" or "Left → Root → Right"
  totalSteps: number;
  steps: VisualStepData[];
}
