import React, { useState, useEffect, useMemo } from 'react';
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Binary,
} from 'lucide-react';
import { soundManager } from '../../utils/audio';
import { useUserProgress } from '../../context/UserProgressContext';

export type VisualizerTopic =
  | 'bst-rule'
  | 'insertion'
  | 'search'
  | 'deletion-case-1'
  | 'deletion-case-2'
  | 'deletion-case-3'
  | 'inorder'
  | 'preorder'
  | 'postorder';

export type PlaySpeed = '0.5x' | '1x' | '1.5x' | '2x';

interface TreeNodeData {
  value: number;
  x: number;
  y: number;
  label?: string;
  status?: 'default' | 'active' | 'visited' | 'success' | 'danger' | 'successor';
}

interface TreeEdgeData {
  from: number;
  to: number;
  isHighlighted?: boolean;
}

interface AnimationStep {
  stepNumber: number;
  totalSteps: number;
  explanation: string;
  comparisonText?: string;
  comparisonDirection?: 'left' | 'right' | 'equal' | 'found' | 'none';
  nodes: TreeNodeData[];
  edges: TreeEdgeData[];
  traversalOutput?: number[];
  emptySlot?: { x: number; y: number; label: string } | null;
}

// Standard coordinates for [50, 30, 20, 40, 70]
const POS_50: TreeNodeData = { value: 50, x: 300, y: 55 };
const POS_30: TreeNodeData = { value: 30, x: 180, y: 140 };
const POS_70: TreeNodeData = { value: 70, x: 420, y: 140 };
const POS_20: TreeNodeData = { value: 20, x: 110, y: 225 };
const POS_40: TreeNodeData = { value: 40, x: 250, y: 225 };
const POS_60: TreeNodeData = { value: 60, x: 360, y: 225 }; // Left child of 70
const POS_35: TreeNodeData = { value: 35, x: 215, y: 305 }; // Left child of 40 (Case 2)

const SPEED_MS: Record<PlaySpeed, number> = {
  '0.5x': 2000,
  '1x': 1000,
  '1.5x': 666,
  '2x': 500,
};

// Static Step Generators
function getBstRuleSteps(): AnimationStep[] {
  return [
    {
      stepNumber: 1,
      totalSteps: 5,
      explanation: 'Start with 50 as the root node of our Binary Search Tree.',
      comparisonText: 'Root Node: 50',
      comparisonDirection: 'none',
      nodes: [{ ...POS_50, status: 'active', label: 'Root' }],
      edges: [],
    },
    {
      stepNumber: 2,
      totalSteps: 5,
      explanation: '30 is smaller than 50, so it is placed on the left.',
      comparisonText: '30 < 50 → Go Left',
      comparisonDirection: 'left',
      nodes: [
        { ...POS_50, status: 'visited' },
        { ...POS_30, status: 'active', label: 'Left' },
      ],
      edges: [{ from: 50, to: 30, isHighlighted: true }],
    },
    {
      stepNumber: 3,
      totalSteps: 5,
      explanation: '20 is less than 50, and 20 is less than 30, so it goes to the left of 30.',
      comparisonText: '20 < 50 → Left, 20 < 30 → Go Left',
      comparisonDirection: 'left',
      nodes: [
        { ...POS_50, status: 'visited' },
        { ...POS_30, status: 'visited' },
        { ...POS_20, status: 'active', label: 'Left' },
      ],
      edges: [
        { from: 50, to: 30, isHighlighted: false },
        { from: 30, to: 20, isHighlighted: true },
      ],
    },
    {
      stepNumber: 4,
      totalSteps: 5,
      explanation: '40 is less than 50, but 40 is greater than 30, so it goes to the right of 30.',
      comparisonText: '40 < 50 → Left, 40 > 30 → Go Right',
      comparisonDirection: 'right',
      nodes: [
        { ...POS_50, status: 'visited' },
        { ...POS_30, status: 'visited' },
        { ...POS_20, status: 'default' },
        { ...POS_40, status: 'active', label: 'Right' },
      ],
      edges: [
        { from: 50, to: 30, isHighlighted: false },
        { from: 30, to: 20, isHighlighted: false },
        { from: 30, to: 40, isHighlighted: true },
      ],
    },
    {
      stepNumber: 5,
      totalSteps: 5,
      explanation: '70 is greater than 50, so it is placed to the right of the root.',
      comparisonText: '70 > 50 → Go Right',
      comparisonDirection: 'right',
      nodes: [
        { ...POS_50, status: 'visited' },
        { ...POS_30, status: 'default' },
        { ...POS_20, status: 'default' },
        { ...POS_40, status: 'default' },
        { ...POS_70, status: 'success', label: 'Right' },
      ],
      edges: [
        { from: 50, to: 30, isHighlighted: false },
        { from: 30, to: 20, isHighlighted: false },
        { from: 30, to: 40, isHighlighted: false },
        { from: 50, to: 70, isHighlighted: true },
      ],
    },
  ];
}

function getInsertionSteps(): AnimationStep[] {
  return [
    {
      stepNumber: 1,
      totalSteps: 5,
      explanation: 'Step 1: Highlight 50. 60 > 50 → Go Right.',
      comparisonText: '60 > 50 → Go Right',
      comparisonDirection: 'right',
      nodes: [
        { ...POS_50, status: 'active', label: 'Compare' },
        { ...POS_30, status: 'default' },
        { ...POS_70, status: 'default' },
        { ...POS_20, status: 'default' },
        { ...POS_40, status: 'default' },
      ],
      edges: [
        { from: 50, to: 30, isHighlighted: false },
        { from: 50, to: 70, isHighlighted: true },
        { from: 30, to: 20, isHighlighted: false },
        { from: 30, to: 40, isHighlighted: false },
      ],
    },
    {
      stepNumber: 2,
      totalSteps: 5,
      explanation: 'Step 2: Highlight 70. 60 < 70 → Go Left.',
      comparisonText: '60 < 70 → Go Left',
      comparisonDirection: 'left',
      nodes: [
        { ...POS_50, status: 'visited' },
        { ...POS_30, status: 'default' },
        { ...POS_70, status: 'active', label: 'Compare' },
        { ...POS_20, status: 'default' },
        { ...POS_40, status: 'default' },
      ],
      edges: [
        { from: 50, to: 30, isHighlighted: false },
        { from: 50, to: 70, isHighlighted: true },
        { from: 30, to: 20, isHighlighted: false },
        { from: 30, to: 40, isHighlighted: false },
      ],
    },
    {
      stepNumber: 3,
      totalSteps: 5,
      explanation: 'Step 3: Show the empty left-child position under 70.',
      comparisonText: 'Empty left-child slot under 70',
      comparisonDirection: 'none',
      nodes: [
        { ...POS_50, status: 'visited' },
        { ...POS_30, status: 'default' },
        { ...POS_70, status: 'visited' },
        { ...POS_20, status: 'default' },
        { ...POS_40, status: 'default' },
      ],
      edges: [
        { from: 50, to: 30, isHighlighted: false },
        { from: 50, to: 70, isHighlighted: true },
        { from: 30, to: 20, isHighlighted: false },
        { from: 30, to: 40, isHighlighted: false },
      ],
      emptySlot: { x: POS_60.x, y: POS_60.y, label: 'Insert 60' },
    },
    {
      stepNumber: 4,
      totalSteps: 5,
      explanation: 'Step 4: Animate node 60 into that position.',
      comparisonText: 'Attach 60 to node 70',
      comparisonDirection: 'none',
      nodes: [
        { ...POS_50, status: 'visited' },
        { ...POS_30, status: 'default' },
        { ...POS_70, status: 'visited' },
        { ...POS_20, status: 'default' },
        { ...POS_40, status: 'default' },
        { ...POS_60, status: 'success' },
      ],
      edges: [
        { from: 50, to: 30, isHighlighted: false },
        { from: 50, to: 70, isHighlighted: false },
        { from: 30, to: 20, isHighlighted: false },
        { from: 30, to: 40, isHighlighted: false },
        { from: 70, to: 60, isHighlighted: true },
      ],
    },
    {
      stepNumber: 5,
      totalSteps: 5,
      explanation: 'Step 5: Highlight the completed tree and show "60 inserted successfully!"',
      comparisonText: '60 inserted successfully!',
      comparisonDirection: 'none',
      nodes: [
        { ...POS_50, status: 'default' },
        { ...POS_30, status: 'default' },
        { ...POS_70, status: 'default' },
        { ...POS_20, status: 'default' },
        { ...POS_40, status: 'default' },
        { ...POS_60, status: 'success' },
      ],
      edges: [
        { from: 50, to: 30, isHighlighted: false },
        { from: 50, to: 70, isHighlighted: false },
        { from: 30, to: 20, isHighlighted: false },
        { from: 30, to: 40, isHighlighted: false },
        { from: 70, to: 60, isHighlighted: false },
      ],
    },
  ];
}

function getSearchSteps(): AnimationStep[] {
  return [
    {
      stepNumber: 1,
      totalSteps: 3,
      explanation: 'Step 1: Highlight 50. Show "40 < 50 → Go Left."',
      comparisonText: '40 < 50 → Go Left',
      comparisonDirection: 'left',
      nodes: [
        { ...POS_50, status: 'active', label: 'Compare' },
        { ...POS_30, status: 'default' },
        { ...POS_70, status: 'default' },
        { ...POS_20, status: 'default' },
        { ...POS_40, status: 'default' },
      ],
      edges: [
        { from: 50, to: 30, isHighlighted: true },
        { from: 50, to: 70, isHighlighted: false },
        { from: 30, to: 20, isHighlighted: false },
        { from: 30, to: 40, isHighlighted: false },
      ],
    },
    {
      stepNumber: 2,
      totalSteps: 3,
      explanation: 'Step 2: Highlight 30. Show "40 > 30 → Go Right."',
      comparisonText: '40 > 30 → Go Right',
      comparisonDirection: 'right',
      nodes: [
        { ...POS_50, status: 'visited' },
        { ...POS_30, status: 'active', label: 'Compare' },
        { ...POS_70, status: 'default' },
        { ...POS_20, status: 'default' },
        { ...POS_40, status: 'default' },
      ],
      edges: [
        { from: 50, to: 30, isHighlighted: true },
        { from: 50, to: 70, isHighlighted: false },
        { from: 30, to: 20, isHighlighted: false },
        { from: 30, to: 40, isHighlighted: true },
      ],
    },
    {
      stepNumber: 3,
      totalSteps: 3,
      explanation: 'Step 3: Highlight 40. Show "40 = 40 → Value found!" Search path is 50 → 30 → 40.',
      comparisonText: '40 = 40 → Value found!',
      comparisonDirection: 'found',
      nodes: [
        { ...POS_50, status: 'visited' },
        { ...POS_30, status: 'visited' },
        { ...POS_70, status: 'default' },
        { ...POS_20, status: 'default' },
        { ...POS_40, status: 'success', label: 'Found!' },
      ],
      edges: [
        { from: 50, to: 30, isHighlighted: true },
        { from: 50, to: 70, isHighlighted: false },
        { from: 30, to: 20, isHighlighted: false },
        { from: 30, to: 40, isHighlighted: true },
      ],
    },
  ];
}

function getDeletionCase1Steps(): AnimationStep[] {
  // Case 1: Delete Leaf Node (20)
  return [
    {
      stepNumber: 1,
      totalSteps: 4,
      explanation: 'Step 1: Highlight the path used to find 20 (50 → 30 → 20).',
      comparisonText: 'Search path: 50 → 30 → 20',
      comparisonDirection: 'left',
      nodes: [
        { ...POS_50, status: 'visited' },
        { ...POS_30, status: 'visited' },
        { ...POS_70, status: 'default' },
        { ...POS_20, status: 'active', label: 'Target' },
        { ...POS_40, status: 'default' },
      ],
      edges: [
        { from: 50, to: 30, isHighlighted: true },
        { from: 50, to: 70, isHighlighted: false },
        { from: 30, to: 20, isHighlighted: true },
        { from: 30, to: 40, isHighlighted: false },
      ],
    },
    {
      stepNumber: 2,
      totalSteps: 4,
      explanation: 'Step 2: Highlight node 20. Node 20 has no children (it is a leaf node).',
      comparisonText: 'Node 20 has 0 children (Leaf)',
      comparisonDirection: 'none',
      nodes: [
        { ...POS_50, status: 'default' },
        { ...POS_30, status: 'default' },
        { ...POS_70, status: 'default' },
        { ...POS_20, status: 'danger', label: 'Leaf' },
        { ...POS_40, status: 'default' },
      ],
      edges: [
        { from: 50, to: 30, isHighlighted: false },
        { from: 50, to: 70, isHighlighted: false },
        { from: 30, to: 20, isHighlighted: true },
        { from: 30, to: 40, isHighlighted: false },
      ],
    },
    {
      stepNumber: 3,
      totalSteps: 4,
      explanation: 'Step 3: Animate the leaf node disappearing. Set 30.left to null.',
      comparisonText: 'Removing leaf node 20...',
      comparisonDirection: 'none',
      nodes: [
        { ...POS_50, status: 'default' },
        { ...POS_30, status: 'active' },
        { ...POS_70, status: 'default' },
        { ...POS_40, status: 'default' },
      ],
      edges: [
        { from: 50, to: 30, isHighlighted: false },
        { from: 50, to: 70, isHighlighted: false },
        { from: 30, to: 40, isHighlighted: false },
      ],
    },
    {
      stepNumber: 4,
      totalSteps: 4,
      explanation: '20 has no children, so we can simply remove it. 30, 40, 50, and 70 stay in their correct positions.',
      comparisonText: 'Deletion complete: 20 removed',
      comparisonDirection: 'none',
      nodes: [
        { ...POS_50, status: 'default' },
        { ...POS_30, status: 'default' },
        { ...POS_70, status: 'default' },
        { ...POS_40, status: 'default' },
      ],
      edges: [
        { from: 50, to: 30, isHighlighted: false },
        { from: 50, to: 70, isHighlighted: false },
        { from: 30, to: 40, isHighlighted: false },
      ],
    },
  ];
}

function getDeletionCase2Steps(): AnimationStep[] {
  // Case 2: Delete Node with One Child (40, which has child 35)
  return [
    {
      stepNumber: 1,
      totalSteps: 4,
      explanation: 'Step 1: Highlight the path to 40 (50 → 30 → 40). Notice 35 was added as 40’s child to demonstrate this case.',
      comparisonText: 'Search path: 50 → 30 → 40',
      comparisonDirection: 'right',
      nodes: [
        { ...POS_50, status: 'visited' },
        { ...POS_30, status: 'visited' },
        { ...POS_70, status: 'default' },
        { ...POS_20, status: 'default' },
        { ...POS_40, status: 'active', label: 'Target' },
        { ...POS_35, status: 'default', label: 'Child (35)' },
      ],
      edges: [
        { from: 50, to: 30, isHighlighted: true },
        { from: 50, to: 70, isHighlighted: false },
        { from: 30, to: 20, isHighlighted: false },
        { from: 30, to: 40, isHighlighted: true },
        { from: 40, to: 35, isHighlighted: false },
      ],
    },
    {
      stepNumber: 2,
      totalSteps: 4,
      explanation: 'Step 2: Highlight node 40 and its only child, 35.',
      comparisonText: '40 has exactly 1 child: 35',
      comparisonDirection: 'none',
      nodes: [
        { ...POS_50, status: 'default' },
        { ...POS_30, status: 'default' },
        { ...POS_70, status: 'default' },
        { ...POS_20, status: 'default' },
        { ...POS_40, status: 'danger', label: 'Delete 40' },
        { ...POS_35, status: 'successor', label: 'Only Child' },
      ],
      edges: [
        { from: 50, to: 30, isHighlighted: false },
        { from: 50, to: 70, isHighlighted: false },
        { from: 30, to: 20, isHighlighted: false },
        { from: 30, to: 40, isHighlighted: true },
        { from: 40, to: 35, isHighlighted: true },
      ],
    },
    {
      stepNumber: 3,
      totalSteps: 4,
      explanation: 'Step 3: Animate 35 moving into 40’s position, taking its place.',
      comparisonText: 'Promoting child 35 to 40’s position',
      comparisonDirection: 'none',
      nodes: [
        { ...POS_50, status: 'default' },
        { ...POS_30, status: 'visited' },
        { ...POS_70, status: 'default' },
        { ...POS_20, status: 'default' },
        { value: 35, x: POS_40.x, y: POS_40.y, status: 'default' },
      ],
      edges: [
        { from: 50, to: 30, isHighlighted: false },
        { from: 50, to: 70, isHighlighted: false },
        { from: 30, to: 20, isHighlighted: false },
        { from: 30, to: 35, isHighlighted: true },
      ],
    },
    {
      stepNumber: 4,
      totalSteps: 4,
      explanation: '40 has one child, so its child takes its place. Remove the old 40 node. The resulting BST is valid.',
      comparisonText: 'Valid BST preserved: 35 replaces 40',
      comparisonDirection: 'none',
      nodes: [
        { ...POS_50, status: 'default' },
        { ...POS_30, status: 'default' },
        { ...POS_70, status: 'default' },
        { ...POS_20, status: 'default' },
        { value: 35, x: POS_40.x, y: POS_40.y, status: 'default' },
      ],
      edges: [
        { from: 50, to: 30, isHighlighted: false },
        { from: 50, to: 70, isHighlighted: false },
        { from: 30, to: 20, isHighlighted: false },
        { from: 30, to: 35, isHighlighted: false },
      ],
    },
  ];
}

function getDeletionCase3Steps(): AnimationStep[] {
  // Case 3: Delete Node with Two Children (30)
  return [
    {
      stepNumber: 1,
      totalSteps: 5,
      explanation: 'Step 1: Highlight node 30. Highlight its left child (20) and right child (40).',
      comparisonText: 'Node 30 has two children: 20 and 40',
      comparisonDirection: 'none',
      nodes: [
        { ...POS_50, status: 'default' },
        { ...POS_30, status: 'danger', label: 'Delete 30' },
        { ...POS_70, status: 'default' },
        { ...POS_20, status: 'active', label: 'Left' },
        { ...POS_40, status: 'active', label: 'Right' },
      ],
      edges: [
        { from: 50, to: 30, isHighlighted: true },
        { from: 50, to: 70, isHighlighted: false },
        { from: 30, to: 20, isHighlighted: true },
        { from: 30, to: 40, isHighlighted: true },
      ],
    },
    {
      stepNumber: 2,
      totalSteps: 5,
      explanation: 'Step 2: Find the inorder successor (the smallest value in the right subtree).',
      comparisonText: 'Finding inorder successor in right subtree...',
      comparisonDirection: 'right',
      nodes: [
        { ...POS_50, status: 'default' },
        { ...POS_30, status: 'danger', label: 'Target' },
        { ...POS_70, status: 'default' },
        { ...POS_20, status: 'default' },
        { ...POS_40, status: 'successor', label: 'Right Subtree' },
      ],
      edges: [
        { from: 50, to: 30, isHighlighted: false },
        { from: 50, to: 70, isHighlighted: false },
        { from: 30, to: 20, isHighlighted: false },
        { from: 30, to: 40, isHighlighted: true },
      ],
    },
    {
      stepNumber: 3,
      totalSteps: 5,
      explanation: 'Step 3: Clearly highlight 40 and show "Smallest value in the right subtree: 40."',
      comparisonText: 'Smallest value in the right subtree: 40',
      comparisonDirection: 'none',
      nodes: [
        { ...POS_50, status: 'default' },
        { ...POS_30, status: 'danger', label: 'Replace me' },
        { ...POS_70, status: 'default' },
        { ...POS_20, status: 'default' },
        { ...POS_40, status: 'successor', label: 'Successor: 40' },
      ],
      edges: [
        { from: 50, to: 30, isHighlighted: false },
        { from: 50, to: 70, isHighlighted: false },
        { from: 30, to: 20, isHighlighted: false },
        { from: 30, to: 40, isHighlighted: true },
      ],
    },
    {
      stepNumber: 4,
      totalSteps: 5,
      explanation: 'Step 4: Animate replacing 30 with 40 and remove the old successor node from its original position.',
      comparisonText: 'Copy 40 into node 30, remove original 40',
      comparisonDirection: 'none',
      nodes: [
        { ...POS_50, status: 'default' },
        { value: 40, x: POS_30.x, y: POS_30.y, status: 'default' },
        { ...POS_70, status: 'default' },
        { ...POS_20, status: 'default' },
      ],
      edges: [
        { from: 50, to: 40, isHighlighted: false },
        { from: 50, to: 70, isHighlighted: false },
        { from: 40, to: 20, isHighlighted: false },
      ],
    },
    {
      stepNumber: 5,
      totalSteps: 5,
      explanation: '30 has two children. We replace it with the next larger value, 40. The resulting BST is valid.',
      comparisonText: 'Valid BST preserved: 20 < 40 < 50 < 70',
      comparisonDirection: 'none',
      nodes: [
        { ...POS_50, status: 'default' },
        { value: 40, x: POS_30.x, y: POS_30.y, status: 'default' },
        { ...POS_70, status: 'default' },
        { ...POS_20, status: 'default' },
      ],
      edges: [
        { from: 50, to: 40, isHighlighted: false },
        { from: 50, to: 70, isHighlighted: false },
        { from: 40, to: 20, isHighlighted: false },
      ],
    },
  ];
}

function getInorderSteps(): AnimationStep[] {
  const order = [20, 30, 40, 50, 70];
  const baseNodes = [POS_50, POS_30, POS_70, POS_20, POS_40];
  const baseEdges = [
    { from: 50, to: 30, isHighlighted: false },
    { from: 50, to: 70, isHighlighted: false },
    { from: 30, to: 20, isHighlighted: false },
    { from: 30, to: 40, isHighlighted: false },
  ];

  const explanations = [
    'Visit the left side first: leftmost node 20.',
    'Visit the node next: parent node 30.',
    'Visit the right side: node 40.',
    'Visit the root node: 50.',
    'Visit the right side of the tree: 70. Notice the output is in sorted ascending order!',
  ];

  return order.map((val, idx) => {
    const outputSoFar = order.slice(0, idx + 1);
    return {
      stepNumber: idx + 1,
      totalSteps: 5,
      explanation: explanations[idx],
      comparisonText: `Visiting node: ${val} (Left → Node → Right)`,
      comparisonDirection: 'none',
      nodes: baseNodes.map((n) => ({
        ...n,
        status: n.value === val ? 'success' : outputSoFar.includes(n.value) ? 'visited' : 'default',
      })),
      edges: baseEdges,
      traversalOutput: outputSoFar,
    };
  });
}

function getPreorderSteps(): AnimationStep[] {
  const order = [50, 30, 20, 40, 70];
  const baseNodes = [POS_50, POS_30, POS_70, POS_20, POS_40];
  const baseEdges = [
    { from: 50, to: 30, isHighlighted: false },
    { from: 50, to: 70, isHighlighted: false },
    { from: 30, to: 20, isHighlighted: false },
    { from: 30, to: 40, isHighlighted: false },
  ];

  const explanations = [
    'Visit the node first: root node 50.',
    'Visit its left side: node 30.',
    'Visit the left side of 30: node 20.',
    'Visit the right side of 30: node 40.',
    'Visit the right side of root 50: node 70.',
  ];

  return order.map((val, idx) => {
    const outputSoFar = order.slice(0, idx + 1);
    return {
      stepNumber: idx + 1,
      totalSteps: 5,
      explanation: explanations[idx],
      comparisonText: `Visiting node: ${val} (Node → Left → Right)`,
      comparisonDirection: 'none',
      nodes: baseNodes.map((n) => ({
        ...n,
        status: n.value === val ? 'success' : outputSoFar.includes(n.value) ? 'visited' : 'default',
      })),
      edges: baseEdges,
      traversalOutput: outputSoFar,
    };
  });
}

function getPostorderSteps(): AnimationStep[] {
  const order = [20, 40, 30, 70, 50];
  const baseNodes = [POS_50, POS_30, POS_70, POS_20, POS_40];
  const baseEdges = [
    { from: 50, to: 30, isHighlighted: false },
    { from: 50, to: 70, isHighlighted: false },
    { from: 30, to: 20, isHighlighted: false },
    { from: 30, to: 40, isHighlighted: false },
  ];

  const explanations = [
    'Visit the left side first: bottom-left leaf 20.',
    'Visit the right side of 30: node 40.',
    'Visit the node: parent 30 (visited after both children).',
    'Visit the right side of root: node 70.',
    'Visit the root node last: 50.',
  ];

  return order.map((val, idx) => {
    const outputSoFar = order.slice(0, idx + 1);
    return {
      stepNumber: idx + 1,
      totalSteps: 5,
      explanation: explanations[idx],
      comparisonText: `Visiting node: ${val} (Left → Right → Node)`,
      comparisonDirection: 'none',
      nodes: baseNodes.map((n) => ({
        ...n,
        status: n.value === val ? 'success' : outputSoFar.includes(n.value) ? 'visited' : 'default',
      })),
      edges: baseEdges,
      traversalOutput: outputSoFar,
    };
  });
}

interface VideoPageProps {
  initialTopic?: VisualizerTopic;
}

export const VideoPage: React.FC<VideoPageProps> = ({ initialTopic }) => {
  const { completedVisualizeLessons, completeVisualizeLesson } = useUserProgress();
  const [activeTopic, setActiveTopic] = useState<VisualizerTopic>(initialTopic || 'bst-rule');
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<PlaySpeed>('1x');

  // Synchronize when initialTopic prop changes
  useEffect(() => {
    if (initialTopic) {
      setActiveTopic(initialTopic);
      setCurrentStepIndex(0);
      setIsPlaying(false);
    }
  }, [initialTopic]);

  // Compute steps deterministically
  const steps: AnimationStep[] = useMemo(() => {
    switch (activeTopic) {
      case 'bst-rule':
        return getBstRuleSteps();
      case 'insertion':
        return getInsertionSteps();
      case 'search':
        return getSearchSteps();
      case 'deletion-case-1':
        return getDeletionCase1Steps();
      case 'deletion-case-2':
        return getDeletionCase2Steps();
      case 'deletion-case-3':
        return getDeletionCase3Steps();
      case 'inorder':
        return getInorderSteps();
      case 'preorder':
        return getPreorderSteps();
      case 'postorder':
        return getPostorderSteps();
      default:
        return getBstRuleSteps();
    }
  }, [activeTopic]);

  // Topic Switch Handler
  const handleSelectTopic = (newTopic: VisualizerTopic) => {
    soundManager.playClick();
    setActiveTopic(newTopic);
    setCurrentStepIndex(0);
    setIsPlaying(false);
  };

  // Next Step Handler
  const handleNext = () => {
    soundManager.playClick();
    setIsPlaying(false);
    setCurrentStepIndex((prev) => Math.min(steps.length - 1, prev + 1));
  };

  // Previous Step Handler
  const handlePrevious = () => {
    soundManager.playClick();
    setIsPlaying(false);
    setCurrentStepIndex((prev) => Math.max(0, prev - 1));
  };

  // Play / Pause Toggle Handler
  const handlePlayPause = () => {
    soundManager.playClick();
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      if (currentStepIndex >= steps.length - 1) {
        setCurrentStepIndex(0);
      }
      setIsPlaying(true);
    }
  };

  // Auto-play timer loop
  useEffect(() => {
    if (!isPlaying) return;

    const intervalTime = SPEED_MS[speed];
    const timer = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < steps.length - 1) {
          soundManager.playStep();
          return prev + 1;
        } else {
          setIsPlaying(false);
          soundManager.playSuccess();
          return prev;
        }
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isPlaying, speed, steps.length]);

  // Mark the current visualizer topic as completed when the student reaches the final step
  useEffect(() => {
    if (currentStepIndex === steps.length - 1 && steps.length > 0) {
      completeVisualizeLesson(activeTopic);
    }
  }, [currentStepIndex, steps.length, activeTopic, completeVisualizeLesson]);

  const currentStep = steps[currentStepIndex] || steps[0];

  const getNodeColor = (status?: TreeNodeData['status']) => {
    switch (status) {
      case 'active':
        return {
          fill: '#6366f1', // bluish violet indigo-500
          stroke: '#c7d2fe', // indigo-200
          text: '#ffffff',
          halo: true,
        };
      case 'visited':
        return {
          fill: '#4338ca', // indigo-700
          stroke: '#a5b4fc', // indigo-300
          text: '#ffffff',
          halo: false,
        };
      case 'success':
        return {
          fill: '#059669', // emerald-600
          stroke: '#6ee7b7',
          text: '#ffffff',
          halo: false,
        };
      case 'danger':
        return {
          fill: '#e11d48', // rose-600
          stroke: '#fda4af',
          text: '#ffffff',
          halo: true,
        };
      case 'successor':
        return {
          fill: '#0891b2', // cyan-600
          stroke: '#67e8f9',
          text: '#ffffff',
          halo: true,
        };
      default:
        return {
          fill: 'var(--node-fill, #1e293b)',
          stroke: 'var(--node-stroke, #475569)',
          text: 'var(--node-text, #f8fafc)',
          halo: false,
        };
    }
  };

  const topicTabs: { id: VisualizerTopic; label: string }[] = [
    { id: 'bst-rule', label: 'BST Rule' },
    { id: 'insertion', label: 'BST Insertion' },
    { id: 'search', label: 'BST Search' },
    { id: 'deletion-case-1', label: 'BST Deletion – Case 1' },
    { id: 'deletion-case-2', label: 'BST Deletion – Case 2' },
    { id: 'deletion-case-3', label: 'BST Deletion – Case 3' },
    { id: 'inorder', label: 'Inorder Traversal' },
    { id: 'preorder', label: 'Preorder Traversal' },
    { id: 'postorder', label: 'Postorder Traversal' },
  ];

  return (
    <div
      id="bst-visualizer-page"
      className="space-y-4 pb-8 [--node-fill:#ffffff] [--node-stroke:#cbd5e1] [--node-text:#1e293b] dark:[--node-fill:#0f172a] dark:[--node-stroke:#475569] dark:[--node-text:#f8fafc]"
    >
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-2xs">
            <Binary className="w-4 h-4" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-mono">
            BST Visualizer
          </h1>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Watch how a Binary Search Tree works, one step at a time.
        </p>
      </div>

      {/* Selectable Topic Tabs (NO visible scrollbar in any browser/theme) */}
      <div className="bg-white dark:bg-[#0b0f19] p-1.5 rounded-2xl border border-slate-200 dark:border-indigo-900/30 shadow-xs overflow-hidden">
        <div
          className="flex items-center gap-1.5 overflow-x-auto py-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:h-0"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {topicTabs.map((tab) => {
            const isActive = activeTopic === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleSelectTopic(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold tracking-wide whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Animation Area (Directly after tabs - No extra cards or empty spaces) */}
      <div className="bg-white dark:bg-[#0b0f19] rounded-2xl border border-slate-200 dark:border-indigo-900/30 p-4 sm:p-6 shadow-xs flex flex-col items-center justify-between min-h-[350px] space-y-4">
        {/* Step Indicator & Direction Banner */}
        <div className="w-full flex items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-3">
          <div className="flex items-center gap-2.5 font-mono text-xs flex-wrap">
            <span className="px-3 py-1.5 rounded-xl bg-black text-white dark:bg-black dark:text-white font-mono font-black text-xs border-2 border-black dark:border-slate-700 shadow-sm">
              Step {currentStep?.stepNumber || 1} of {currentStep?.totalSteps || 1}
            </span>
            {currentStep?.comparisonText && (
              <span className="px-3 py-1.5 rounded-xl bg-black text-white dark:bg-black dark:text-white border-2 border-black dark:border-slate-700 font-mono font-black text-xs tracking-wide shadow-sm flex items-center gap-2">
                {currentStep.comparisonDirection === 'left' && (
                  <ArrowLeft className="w-3.5 h-3.5 text-white" />
                )}
                {currentStep.comparisonDirection === 'right' && (
                  <ArrowRight className="w-3.5 h-3.5 text-white" />
                )}
                {currentStep.comparisonDirection === 'found' && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                )}
                <span>{currentStep.comparisonText}</span>
              </span>
            )}
          </div>
        </div>

        {/* Dynamic Responsive SVG Tree Area */}
        <div className="w-full flex items-center justify-center overflow-x-auto py-2">
          <svg
            viewBox="0 0 600 350"
            className="w-full max-w-[600px] h-[270px] sm:h-[310px] select-none"
          >
            {/* Edges */}
            {currentStep?.edges?.map((edge, idx) => {
              const fromNode = currentStep.nodes.find((n) => n.value === edge.from);
              const toNode = currentStep.nodes.find((n) => n.value === edge.to);
              if (!fromNode || !toNode) return null;

              return (
                <line
                  key={`edge-${idx}-${edge.from}-${edge.to}`}
                  x1={fromNode.x}
                  y1={fromNode.y}
                  x2={toNode.x}
                  y2={toNode.y}
                  stroke={edge.isHighlighted ? '#6366f1' : '#cbd5e1'}
                  strokeWidth={edge.isHighlighted ? 3.5 : 2}
                  className="transition-all duration-300 dark:stroke-slate-700"
                  strokeDasharray={edge.isHighlighted ? '4 2' : 'none'}
                />
              );
            })}

            {/* Empty Slot Indicator */}
            {currentStep?.emptySlot && (
              <g
                transform={`translate(${currentStep.emptySlot.x}, ${currentStep.emptySlot.y})`}
                className="animate-pulse"
              >
                <circle
                  r={22}
                  fill="none"
                  stroke="#000000"
                  strokeWidth={2.5}
                  strokeDasharray="4 3"
                  className="dark:stroke-slate-300"
                />
                <text
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="text-xs font-mono fill-black dark:fill-white font-black"
                >
                  {currentStep.emptySlot.label || 'Null'}
                </text>
              </g>
            )}

            {/* Nodes */}
            {currentStep?.nodes?.map((node) => {
              const style = getNodeColor(node.status);
              return (
                <g
                  key={`node-${node.value}`}
                  transform={`translate(${node.x}, ${node.y})`}
                  className="transition-transform duration-300"
                >
                  {/* Halo */}
                  {style.halo && (
                    <circle
                      r={29}
                      fill="none"
                      stroke={style.stroke}
                      strokeWidth={2}
                      strokeDasharray="3 3"
                      className="opacity-80"
                    />
                  )}

                  {/* Main Node Circle */}
                  <circle
                    r={22}
                    fill={style.fill}
                    stroke={style.stroke}
                    strokeWidth={2.5}
                    className="shadow-sm transition-colors duration-300"
                  />

                  {/* Node Value */}
                  <text
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={style.text}
                    className="text-sm font-mono font-extrabold select-none pointer-events-none"
                  >
                    {node.value}
                  </text>

                  {/* Highlight Note Label below node (Root, Compare, Left, Right, etc.) in Thick Black Theme */}
                  {node.label && node.label.trim() !== String(node.value) && (() => {
                    const badgeWidth = Math.max(node.label.length * 8.5 + 22, 54);
                    return (
                      <g transform="translate(0, 36)" className="select-none pointer-events-none">
                        {/* Callout notch pointing to bottom of node circle */}
                        <polygon
                          points="-5,-11 0,-15 5,-11"
                          fill="#000000"
                          stroke="#000000"
                          strokeWidth={1}
                        />
                        {/* Solid thick black badge */}
                        <rect
                          x={-badgeWidth / 2}
                          y={-11}
                          width={badgeWidth}
                          height={22}
                          rx={6}
                          fill="#000000"
                          stroke="#000000"
                          strokeWidth={2}
                          className="dark:stroke-slate-600"
                        />
                        {/* Thick, high-contrast, crystal-clear font */}
                        <text
                          x={0}
                          y={1}
                          textAnchor="middle"
                          dominantBaseline="central"
                          fill="#ffffff"
                          className="text-[11.5px] font-mono font-black select-none pointer-events-none tracking-wider uppercase"
                        >
                          {node.label}
                        </text>
                      </g>
                    );
                  })()}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Traversal Output Sequence */}
        {currentStep?.traversalOutput && (
          <div className="w-full flex flex-col items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">
              Traversal Output Sequence
            </span>
            <div className="flex items-center gap-2 flex-wrap justify-center">
              {currentStep.traversalOutput.map((val, i) => (
                <div
                  key={i}
                  className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-300 dark:border-indigo-700 flex items-center justify-center font-mono font-bold text-sm text-indigo-700 dark:text-indigo-300 shadow-2xs"
                >
                  {val}
                </div>
              ))}
            </div>
            {currentStep.traversalOutput.length === 5 && (
              <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {activeTopic === 'inorder' && 'Inorder: 20, 30, 40, 50, 70'}
                {activeTopic === 'preorder' && 'Preorder: 50, 30, 20, 40, 70'}
                {activeTopic === 'postorder' && 'Postorder: 20, 40, 30, 70, 50'}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Short Explanation Card ("What is happening?") */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-indigo-900/30 space-y-1 shadow-xs">
        <span className="text-xs font-mono font-black uppercase tracking-wider text-black dark:text-white">
          What is happening?
        </span>
        <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
          {currentStep?.explanation || 'Loading step explanation...'}
        </p>
      </div>

      {/* Animation Controls: Previous, Play/Pause, Next, Animation Speed */}
      <div className="bg-white dark:bg-[#0b0f19] p-4 rounded-2xl border border-slate-200 dark:border-indigo-900/30 flex flex-wrap items-center justify-between gap-4 shadow-xs">
        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          {/* Previous Button */}
          <button
            onClick={handlePrevious}
            disabled={currentStepIndex === 0}
            className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
              currentStepIndex === 0
                ? 'opacity-40 border-slate-200 dark:border-slate-800 text-slate-400 cursor-not-allowed'
                : 'border-slate-200 dark:border-indigo-900/40 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95'
            }`}
            title="Previous step"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          {/* Play / Pause Toggle Button */}
          <button
            onClick={handlePlayPause}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/25 cursor-pointer active:scale-95"
            title={isPlaying ? 'Pause animation' : 'Play animation'}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Play</span>
              </>
            )}
          </button>

          {/* Next Button */}
          <button
            onClick={handleNext}
            disabled={currentStepIndex >= steps.length - 1}
            className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
              currentStepIndex >= steps.length - 1
                ? 'opacity-40 border-slate-200 dark:border-slate-800 text-slate-400 cursor-not-allowed'
                : 'border-slate-200 dark:border-indigo-900/40 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95'
            }`}
            title="Next step"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Speed Controls: 0.5x, 1x, 1.5x, 2x */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-500 dark:text-slate-400 font-bold">Animation Speed</span>
          <div className="flex items-center gap-1">
            {(['0.5x', '1x', '1.5x', '2x'] as const).map((spd) => {
              const isSpdActive = speed === spd;
              return (
                <button
                  key={spd}
                  onClick={() => {
                    soundManager.playClick();
                    setSpeed(spd);
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isSpdActive
                      ? 'bg-indigo-600 text-white shadow-xs font-extrabold'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {spd}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export const VisualizePage = VideoPage;
